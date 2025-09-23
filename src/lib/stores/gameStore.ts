import { writable } from 'svelte/store';
import type {
	GameState,
	PlayerCharacter,
	Party,
	CampaignVideo,
	RegionalCampaignData,
	StartingScenario,
	CharacterBackground,
	InterviewPerformanceSummary
} from '../types/game.js';
import { initializePopulation, calculateCampaignImpact, DUTCH_DEMOGRAPHICS } from '../types/population.js';
import type { PopulationSegment } from '../types/population.js';
import { DUTCH_REGIONS } from '../types/regions.js';
import { CHARACTER_BACKGROUNDS, DUTCH_OPPOSITION_PARTIES, STARTING_SCENARIOS } from '../types/game.js';

const BASE_CORE_METRICS = {
	approvalRating: 48,
	mediaRelations: 45,
	coalitionTrust: 55
};

const BACKGROUND_METRIC_MAP: Record<string, keyof typeof BASE_CORE_METRICS> = {
	mainstreamMediaRelations: 'mediaRelations',
	establishmentTrust: 'coalitionTrust',
	antiEstablishmentCredibility: 'approvalRating'
};

function clampMetric(value: number): number {
	return Math.max(0, Math.min(100, value));
}

function resolveBackground(player: PlayerCharacter, background?: CharacterBackground): CharacterBackground {
	if (background) return background;
	const existing = CHARACTER_BACKGROUNDS.find(item => item.id === player.background);
	return existing || CHARACTER_BACKGROUNDS[0];
}

function buildPersonalityProfile(tones: string[]): { [tone: string]: number } {
	if (!tones || tones.length === 0) {
		return {};
	}

	const counts: Record<string, number> = {};
	tones.forEach(tone => {
		counts[tone] = (counts[tone] || 0) + 1;
	});

	const total = tones.length;
	const profile: Record<string, number> = {};
	Object.entries(counts).forEach(([tone, count]) => {
		profile[tone] = Math.round((count / total) * 100);
	});

	return profile;
}

function calculateInitialCoreMetrics(
	scenario: StartingScenario | undefined,
	background: CharacterBackground,
	interview?: InterviewPerformanceSummary
) {
	const metrics = { ...BASE_CORE_METRICS };

	if (scenario) {
		metrics.approvalRating += scenario.gameplayModifiers.approvalRating;
		metrics.mediaRelations += scenario.gameplayModifiers.mediaRelations;
		metrics.coalitionTrust += scenario.gameplayModifiers.coalitionTrust;
	}

	if (interview) {
		const interviewScore = interview.rating?.score ?? 60;
		metrics.approvalRating += Math.round((interviewScore - 60) / 4);

		if (interview.scores) {
			metrics.mediaRelations += Math.round((interview.scores.confidence - 60) / 3);
			metrics.coalitionTrust += Math.round((interview.scores.consistency - 60) / 3);
		}
	}

	Object.entries(background.startingPenalties || {}).forEach(([key, value]) => {
		const metricKey = BACKGROUND_METRIC_MAP[key];
		if (metricKey) {
			metrics[metricKey] += value;
		}
	});

	return {
		approvalRating: clampMetric(metrics.approvalRating),
		mediaRelations: clampMetric(metrics.mediaRelations),
		coalitionTrust: clampMetric(metrics.coalitionTrust)
	};
}

const BACKGROUND_POPULATION_EFFECTS: Record<string, {
	groups: string[];
	supportWeight: number;
	awarenessWeight?: number;
	enthusiasmWeight?: number;
	relationshipWeight?: number;
}> = {
	farmerSupport: {
		groups: ['rural-traditional'],
		supportWeight: 0.12,
		enthusiasmWeight: 0.08,
		relationshipWeight: 0.35
	},
	urbanAppeal: {
		groups: ['urban-progressive', 'young-professionals'],
		supportWeight: 0.1,
		relationshipWeight: 0.3
	},
	environmentalCredibility: {
		groups: ['urban-progressive', 'young-professionals'],
		supportWeight: 0.09,
		awarenessWeight: 0.25,
		relationshipWeight: 0.28
	},
	antiEstablishmentCredibility: {
		groups: ['working-class', 'urban-progressive'],
		supportWeight: 0.1,
		relationshipWeight: 0.32
	},
	establishmentTrust: {
		groups: ['suburban-families', 'seniors'],
		supportWeight: 0.09,
		relationshipWeight: 0.3
	},
	mainstreamMediaRelations: {
		groups: ['urban-progressive', 'suburban-families', 'young-professionals'],
		supportWeight: 0.07,
		awarenessWeight: 0.3,
		relationshipWeight: 0.25
	}
};

const TONE_EFFECTS: Record<string, {
	positive: string[];
	negative: string[];
	supportWeight: number;
	awarenessWeight?: number;
	enthusiasmWeight?: number;
	positiveRelationshipWeight: number;
	negativeRelationshipWeight: number;
}> = {
	diplomatic: {
		positive: ['urban-progressive', 'suburban-families', 'seniors'],
		negative: ['working-class'],
		supportWeight: 2.4,
		awarenessWeight: 2.0,
		enthusiasmWeight: 3.0,
		positiveRelationshipWeight: 32,
		negativeRelationshipWeight: 20
	},
	aggressive: {
		positive: ['working-class', 'rural-traditional'],
		negative: ['urban-progressive', 'seniors'],
		supportWeight: 2.6,
		awarenessWeight: 1.2,
		enthusiasmWeight: 3.5,
		positiveRelationshipWeight: 30,
		negativeRelationshipWeight: 28
	},
	defensive: {
		positive: ['suburban-families', 'seniors'],
		negative: ['working-class'],
		supportWeight: 1.8,
		awarenessWeight: 1.6,
		enthusiasmWeight: 2.2,
		positiveRelationshipWeight: 24,
		negativeRelationshipWeight: 18
	},
	confrontational: {
		positive: ['working-class'],
		negative: ['suburban-families', 'seniors'],
		supportWeight: 2.1,
		awarenessWeight: 1.5,
		enthusiasmWeight: 3.2,
		positiveRelationshipWeight: 26,
		negativeRelationshipWeight: 24
	},
	evasive: {
		positive: [],
		negative: ['urban-progressive', 'young-professionals', 'suburban-families'],
		supportWeight: 2.0,
		awarenessWeight: 2.4,
		enthusiasmWeight: 2.5,
		positiveRelationshipWeight: 0,
		negativeRelationshipWeight: 34
	}
};

function clampSupport(value: number): number {
	return Math.max(0.05, Math.min(100, Number(value.toFixed(2))));
}

function clampAwareness(value: number): number {
	return Math.max(0, Math.min(100, Number(value.toFixed(2))));
}

function clampEnthusiasm(value: number): number {
	return Math.max(0, Math.min(100, Number(value.toFixed(2))));
}

function applyBackgroundPopulationModifiers(
	population: { [groupId: string]: PopulationSegment },
	penalties: { [key: string]: number } | undefined,
	relationshipScores: Record<string, number>
) {
	if (!penalties) return;

	Object.entries(penalties).forEach(([key, value]) => {
		if (!value) return;
		const effect = BACKGROUND_POPULATION_EFFECTS[key];
		if (!effect) return;

		effect.groups.forEach(groupId => {
			const segment = population[groupId];
			if (!segment) return;

			if (effect.supportWeight) {
				segment.currentSupport = clampSupport(
					segment.currentSupport + (value * effect.supportWeight) / 10
				);
			}

			if (effect.awarenessWeight) {
				segment.awareness = clampAwareness(
					segment.awareness + (value * effect.awarenessWeight) / 10
				);
			}

			if (effect.enthusiasmWeight) {
				segment.enthusiasm = clampEnthusiasm(
					segment.enthusiasm + (value * effect.enthusiasmWeight) / 10
				);
			}

			if (effect.relationshipWeight) {
				relationshipScores[groupId] = (relationshipScores[groupId] || 0) + value * effect.relationshipWeight;
			}
		});
	});
}

function applyInterviewToneEffects(
	population: { [groupId: string]: PopulationSegment },
	toneProfile: { [tone: string]: number } | undefined,
	relationshipScores: Record<string, number>
) {
	if (!toneProfile) return;

	Object.entries(toneProfile).forEach(([tone, share]) => {
		if (!share) return;
		const effect = TONE_EFFECTS[tone];
		if (!effect) return;

		const shareRatio = share / 100;

		effect.positive.forEach(groupId => {
			const segment = population[groupId];
			if (!segment) return;
			segment.currentSupport = clampSupport(segment.currentSupport + shareRatio * effect.supportWeight);
			if (effect.awarenessWeight) {
				segment.awareness = clampAwareness(segment.awareness + shareRatio * effect.awarenessWeight);
			}
			if (effect.enthusiasmWeight) {
				segment.enthusiasm = clampEnthusiasm(segment.enthusiasm + shareRatio * effect.enthusiasmWeight);
			}
			relationshipScores[groupId] = (relationshipScores[groupId] || 0) + shareRatio * effect.positiveRelationshipWeight;
		});

		effect.negative.forEach(groupId => {
			const segment = population[groupId];
			if (!segment) return;
			segment.currentSupport = clampSupport(segment.currentSupport - shareRatio * effect.supportWeight);
			if (effect.awarenessWeight) {
				segment.awareness = clampAwareness(segment.awareness - shareRatio * effect.awarenessWeight);
			}
			if (effect.enthusiasmWeight) {
				segment.enthusiasm = clampEnthusiasm(segment.enthusiasm - shareRatio * effect.enthusiasmWeight);
			}
			relationshipScores[groupId] = (relationshipScores[groupId] || 0) - shareRatio * effect.negativeRelationshipWeight;
		});
	});
}

function deriveDemographicRelationships(
	relationshipScores: Record<string, number>,
	population: { [groupId: string]: PopulationSegment }
) {
	const relationships: { [groupId: string]: 'hostile' | 'skeptical' | 'neutral' | 'supportive' | 'enthusiastic' } = {};

	Object.keys(population).forEach(groupId => {
		const score = relationshipScores[groupId] || 0;
		if (score >= 25) {
			relationships[groupId] = 'enthusiastic';
		} else if (score >= 10) {
			relationships[groupId] = 'supportive';
		} else if (score <= -25) {
			relationships[groupId] = 'hostile';
		} else if (score <= -10) {
			relationships[groupId] = 'skeptical';
		} else {
			relationships[groupId] = 'neutral';
		}
	});

	return relationships;
}

// Game state store
export const gameStore = writable<GameState | null>(null);

// Helper to check if game is initialized
export const isGameInitialized = writable<boolean>(false);

// Initialize a new game
export function initializeNewGame(
	player: PlayerCharacter,
	party: Party,
	scenarioOrDifficulty?: StartingScenario | 'easy' | 'normal' | 'hard',
	backgroundOrDifficulty?: CharacterBackground | 'easy' | 'normal' | 'hard',
	interviewOrDifficulty?: InterviewPerformanceSummary | 'easy' | 'normal' | 'hard',
	explicitDifficulty: 'easy' | 'normal' | 'hard' = 'normal'
) {
	let scenario: StartingScenario | undefined;
	let background: CharacterBackground | undefined;
	let interview: InterviewPerformanceSummary | undefined;
	let difficulty: 'easy' | 'normal' | 'hard' = 'normal';

	if (scenarioOrDifficulty) {
		if (typeof scenarioOrDifficulty === 'string') {
			difficulty = scenarioOrDifficulty;
		} else {
			scenario = scenarioOrDifficulty;
		}
	}

	if (backgroundOrDifficulty) {
		if (typeof backgroundOrDifficulty === 'string') {
			difficulty = backgroundOrDifficulty;
		} else {
			background = backgroundOrDifficulty;
		}
	}

	if (interviewOrDifficulty) {
		if (typeof interviewOrDifficulty === 'string') {
			difficulty = interviewOrDifficulty;
		} else {
			interview = interviewOrDifficulty;
		}
	}

	if (explicitDifficulty) {
		difficulty = explicitDifficulty;
	}

	const resolvedScenario = scenario || STARTING_SCENARIOS.find(item => item.id === 'new-party') || STARTING_SCENARIOS[0];
	const resolvedBackground = resolveBackground(player, background);
	const initializedPlayer: PlayerCharacter = { ...player, background: resolvedBackground.id };
	const coreMetrics = calculateInitialCoreMetrics(resolvedScenario, resolvedBackground, interview);
	const tonePattern = interview?.tonePattern ?? [];

	const crisisScenarios = [
		{
			headline: "COALITION COLLAPSES: Rutte Cabinet Falls Over Immigration Policy",
			description: "After months of tensions, the four-party coalition government has collapsed following irreconcilable differences over asylum seeker quotas. Prime Minister Rutte announced his resignation this morning.",
			trigger: "immigration disagreements"
		},
		{
			headline: "GOVERNMENT CRISIS: Cabinet Resigns Over Climate Policy Deadlock",
			description: "The coalition government has fallen after failing to reach agreement on ambitious climate targets. Environmental protests and farmer demonstrations have paralyzed The Hague for weeks.",
			trigger: "climate policy disputes"
		},
		{
			headline: "BREAKING: Coalition Government Falls Over Housing Crisis Response",
			description: "Unable to agree on solutions to the severe housing shortage, the four-party government has collapsed. Housing prices have reached record highs while construction remains stalled.",
			trigger: "housing policy failures"
		}
	];

	const newGameState: GameState = {
		player: initializedPlayer,
		playerParty: party,
		currentPhase: 'campaign-intro',
		gameDate: new Date('2023-01-01'), // Start in election year
		difficulty,
		isFirstTime: true,
		daysUntilElection: 60,
		currentCrisis: crisisScenarios[0],
		selectedScenario: resolvedScenario,
		approvalRating: coreMetrics.approvalRating,
		mediaRelations: coreMetrics.mediaRelations,
		coalitionTrust: coreMetrics.coalitionTrust,
		specialActions: {
			scenario: [...(resolvedScenario.gameplayModifiers.specialActions || [])],
			background: [...(resolvedBackground.uniqueOpportunities || [])]
		},
		reputation: { ...(resolvedBackground.startingPenalties || {}) },
		interviewState: {
			responseTones: tonePattern,
			contradictions: interview?.contradictions ? interview.contradictions.length : 0,
			personalityProfile: buildPersonalityProfile(tonePattern),
			scores: interview?.scores,
			rating: interview?.rating,
			interviewerMoodProgression: interview?.interviewerMoodProgression
		}
	};

	gameStore.set(newGameState);
	isGameInitialized.set(true);

	console.log('New game initialized:', newGameState);
}

// Update player character
export function updatePlayer(updates: Partial<PlayerCharacter>) {
	gameStore.update(state => {
		if (!state) return state;
		return {
			...state,
			player: { ...state.player, ...updates }
		};
	});
}

// Update player party
export function updatePlayerParty(updates: Partial<Party>) {
	gameStore.update(state => {
		if (!state) return state;
		return {
			...state,
			playerParty: { ...state.playerParty, ...updates }
		};
	});
}

// Advance game phase
export function setGamePhase(phase: GameState['currentPhase']) {
	gameStore.update(state => {
		if (!state) return state;
		return { ...state, currentPhase: phase };
	});
}

// Start the campaign phase
export function startCampaign() {
	gameStore.update(state => {
		if (!state) return state;

		// Initialize campaign-specific data
		const population = initializePopulation();
		const relationshipScores: Record<string, number> = {};
		applyBackgroundPopulationModifiers(population, state.reputation, relationshipScores);
		applyInterviewToneEffects(population, state.interviewState?.personalityProfile, relationshipScores);
		const demographicRelationships = deriveDemographicRelationships(relationshipScores, population);
		const initialPolling = calculateInitialPolling(population);
		const regionalData = initializeRegionalData(state.playerParty);

		// Calculate starting budget based on difficulty and party characteristics
		const baseBudget = 75000; // Realistic starting budget for new Dutch political party
		const difficultyMultiplier = state.difficulty === 'easy' ? 1.5 : state.difficulty === 'hard' ? 0.7 : 1.0;
		const experienceBonus = (state.player.experience / 10) * 0.2; // 0-20% bonus based on experience
		const startingBudget = Math.round(baseBudget * difficultyMultiplier * (1 + experienceBonus));

		// Initialize opposition parties with realistic polling
		const oppositionPolling = initializeOppositionPolling(state.difficulty);

		return {
			...state,
			currentPhase: 'campaign',
			isFirstTime: false,
			population,
			campaignVideos: [],
			currentDay: 1,
			campaignBudget: startingBudget,
			overallPolling: initialPolling,
			regionalData,
			nationalCampaignFocus: 'national', // Start with national focus
			oppositionParties: DUTCH_OPPOSITION_PARTIES,
			oppositionPolling,
			demographicRelationships
		};
	});
}

// Calculate initial polling from population
function calculateInitialPolling(population: { [groupId: string]: any }): number {
	let totalSupport = 0;
	let totalWeight = 0;

	DUTCH_DEMOGRAPHICS.forEach(group => {
		const segment = population[group.id];
		if (segment) {
			totalSupport += segment.currentSupport * group.percentage;
			totalWeight += group.percentage;
		}
	});

	return totalWeight > 0 ? totalSupport / totalWeight : 0.5;
}

// Initialize regional campaign data
function initializeRegionalData(playerParty: Party): { [regionId: string]: RegionalCampaignData } {
	const regionalData: { [regionId: string]: RegionalCampaignData } = {};

	DUTCH_REGIONS.forEach(region => {
		// Calculate initial regional support based on party positions and regional profile
		let baseSupport = 0.5; // Base 0.5% support everywhere for new party

		// Adjust based on historical leaning and party positions
		const partyLeaning = calculatePartyLeaning(playerParty);
		if (region.politicalProfile.historicalLeaning === partyLeaning) {
			baseSupport += 1.5; // Small boost in aligned regions
		} else if (region.politicalProfile.historicalLeaning === 'center') {
			baseSupport += 0.5; // Tiny boost in swing regions
		}

		// Add slight variation based on volatility (deterministic)
		const volatilityFactor = (region.politicalProfile.volatility - 50) / 1000; // Small deterministic variation
		baseSupport += volatilityFactor;

		regionalData[region.id] = {
			regionId: region.id,
			polling: Math.max(0.1, Math.min(5, baseSupport)), // Cap initial support 0.1-5%
			awareness: 2.0, // Start with consistent very low awareness
			campaignSpending: 0,
			mediaPresence: 1.0, // Minimal consistent initial media presence
			localIssueStances: {}
		};
	});

	return regionalData;
}

// Calculate party political leaning from positions
function calculatePartyLeaning(party: Party): 'left' | 'center' | 'right' {
	if (!party.positions || party.positions.length === 0) return 'center';

	const averagePosition = party.positions.reduce((sum, pos) => sum + pos.position, 0) / party.positions.length;

	if (averagePosition < -30) return 'left';
	if (averagePosition > 30) return 'right';
	return 'center';
}

// Initialize opposition party polling based on realistic Dutch political landscape
function initializeOppositionPolling(difficulty: 'easy' | 'normal' | 'hard'): { [partyId: string]: number } {
	// Real polling data based on recent Dutch election results and polling trends
	// Based on Tweede Kamerverkiezingen 2021 and subsequent polling
	const recentPolling = {
		'vvd': 20.8,    // VVD - Liberal party (slight decline from peak)
		'pvda': 9.2,    // PvdA - Social democrats (recovery from low point)
		'd66': 12.4,    // D66 - Progressive liberals (declined from peak)
		'cda': 8.9,     // CDA - Christian democrats (continued decline)
		'pvv': 15.1,    // PVV - Right-wing populist (stable/growing)
		'gl': 10.8,     // GroenLinks - Green left (forming coalition)
		'sp': 5.7,      // SP - Socialist party (stable base)
		'fvd': 7.9      // FvD - Conservative populist (volatile)
	};

	// Seasonal/campaign-specific adjustments (realistic polling movement patterns)
	const campaignAdjustments = {
		'vvd': -1.2,    // Governing party penalty during campaign
		'pvda': +0.8,   // Opposition benefit
		'd66': -0.5,    // Coalition partner penalty
		'cda': -0.3,    // Coalition partner penalty
		'pvv': +1.1,    // Opposition benefit + populist surge
		'gl': +0.6,     // Environmental concerns rising
		'sp': +0.2,     // Steady base
		'fvd': -0.4     // Volatility working against them
	};

	const polling: { [partyId: string]: number } = {};

	// Apply difficulty modifier (harder = stronger opposition)
	const difficultyModifier = difficulty === 'easy' ? 0.92 : difficulty === 'hard' ? 1.08 : 1.0;

	// Calculate total base polling to normalize
	const totalBase = Object.values(recentPolling).reduce((sum, val) => sum + val, 0);
	const remainingPercentage = 93; // Leave 7% for player and smaller parties

	for (const [partyId, baseValue] of Object.entries(recentPolling)) {
		// Normalize to fit within remaining percentage and apply difficulty
		const normalizedValue = (baseValue / totalBase) * remainingPercentage * difficultyModifier;

		// Apply realistic campaign adjustments instead of random variation
		const campaignAdjustment = campaignAdjustments[partyId] || 0;

		// Apply small margin of error typical in Dutch polling (±1.5%)
		const marginOfError = (Math.random() - 0.5) * 3; // ±1.5%

		polling[partyId] = Math.max(2.5, Math.min(35, normalizedValue + campaignAdjustment + marginOfError));
	}

	return polling;
}

// Create a campaign video
export function createCampaignVideo(video: Omit<CampaignVideo, 'id' | 'createdOn' | 'effectiveness'>, cost: number) {
	gameStore.update(state => {
		if (!state || !state.population) return state;

		const currentDay = state.currentDay || 1;
		const videoId = `video-${Date.now()}`;

		// Calculate effectiveness based on selected issues and positions
		let totalEffectiveness = 0;
		let effectCount = 0;

		video.selectedIssues.forEach(issueId => {
			const position = video.positions[issueId] || 0;
			const effects = calculateCampaignImpact(
				{ issueId, position, tone: video.tone },
				DUTCH_DEMOGRAPHICS,
				state.player
			);

			// Apply effects to population
			effects.forEach(effect => {
				if (state.population && state.population[effect.groupId]) {
					const segment = state.population[effect.groupId];
					segment.currentSupport = Math.max(0, Math.min(100,
						segment.currentSupport + effect.supportChange
					));
					segment.awareness = Math.max(0, Math.min(100,
						segment.awareness + effect.awarenessGain
					));

					if (segment.issuePositions[effect.issueId] !== undefined) {
						segment.issuePositions[effect.issueId] += effect.positionShift;
					}
				}
			});

			// Calculate average effectiveness
			const avgEffect = effects.reduce((sum, e) => sum + Math.abs(e.supportChange), 0) / effects.length;
			totalEffectiveness += avgEffect;
			effectCount++;
		});

		const effectiveness = effectCount > 0 ? (totalEffectiveness / effectCount) * 20 : 0; // Scale to 0-100

		const newVideo: CampaignVideo = {
			...video,
			id: videoId,
			createdOn: currentDay,
			effectiveness: Math.min(100, Math.max(0, effectiveness))
		};

		// Update overall polling
		const newPolling = calculateInitialPolling(state.population);

		return {
			...state,
			campaignVideos: [...(state.campaignVideos || []), newVideo],
			overallPolling: newPolling,
			campaignBudget: (state.campaignBudget || 0) - cost // Dynamic video cost
		};
	});
}

// Conduct regional campaign activity
export function conductRegionalCampaign(regionId: string, activityType: 'rally' | 'media' | 'ground', budget: number) {
	gameStore.update(state => {
		if (!state || !state.regionalData || !state.regionalData[regionId]) return state;

		const region = DUTCH_REGIONS.find(r => r.id === regionId);
		if (!region) return state;

		const currentRegionalData = state.regionalData[regionId];
		const effectiveness = calculateRegionalCampaignEffectiveness(activityType, budget, region, currentRegionalData);

		// Update regional data
		const updatedRegionalData = {
			...currentRegionalData,
			campaignSpending: currentRegionalData.campaignSpending + budget,
			lastActivity: state.currentDay || 1,
			polling: Math.min(100, currentRegionalData.polling + effectiveness.pollingBoost),
			awareness: Math.min(100, currentRegionalData.awareness + effectiveness.awarenessBoost),
			mediaPresence: Math.min(100, currentRegionalData.mediaPresence + effectiveness.mediaBoost)
		};

		// Calculate new overall polling
		const newOverallPolling = calculateOverallPollingFromRegions({
			...state.regionalData,
			[regionId]: updatedRegionalData
		});

		return {
			...state,
			regionalData: {
				...state.regionalData,
				[regionId]: updatedRegionalData
			},
			overallPolling: newOverallPolling,
			campaignBudget: (state.campaignBudget || 0) - budget
		};
	});
}

// Calculate regional campaign effectiveness
function calculateRegionalCampaignEffectiveness(
	activityType: 'rally' | 'media' | 'ground',
	budget: number,
	region: any,
	currentData: RegionalCampaignData
) {
	let baseEffectiveness = Math.sqrt(budget / 1000); // Diminishing returns on budget

	// Activity type modifiers
	const modifiers = {
		rally: { polling: 1.2, awareness: 1.5, media: 0.8 },
		media: { polling: 0.8, awareness: 1.0, media: 1.8 },
		ground: { polling: 1.5, awareness: 1.2, media: 0.5 }
	};

	const modifier = modifiers[activityType];

	// Regional factors
	const populationFactor = Math.log(region.population / 100000) / 5; // Larger regions are harder
	const volatilityFactor = region.politicalProfile.volatility / 100; // More volatile = more responsive

	return {
		pollingBoost: baseEffectiveness * modifier.polling * (1 + volatilityFactor - populationFactor),
		awarenessBoost: baseEffectiveness * modifier.awareness * (1 + volatilityFactor),
		mediaBoost: baseEffectiveness * modifier.media
	};
}

// Calculate overall polling from regional data
function calculateOverallPollingFromRegions(regionalData: { [regionId: string]: RegionalCampaignData }): number {
	let totalSupport = 0;
	let totalWeight = 0;

	DUTCH_REGIONS.forEach(region => {
		const data = regionalData[region.id];
		if (data) {
			totalSupport += data.polling * region.electoralWeight;
			totalWeight += region.electoralWeight;
		}
	});

	return totalWeight > 0 ? totalSupport / totalWeight : 0.5;
}

// Advance campaign day
export function advanceCampaignDay() {
	gameStore.update(state => {
		if (!state) return state;

		const newDay = (state.currentDay || 1) + 1;
		const daysRemaining = (state.daysUntilElection || 60) - newDay + 1;

		// Apply daily polling dynamics
		const updatedPopulation = state.population ? { ...state.population } : {};
		const updatedRegionalData = state.regionalData ? { ...state.regionalData } : {};

		// Natural polling drift and decay mechanics
		DUTCH_DEMOGRAPHICS.forEach(group => {
			const segment = updatedPopulation[group.id];
			if (segment) {
				// Small natural drift based on volatility and day cycle
				const cycleFactor = Math.sin((newDay * Math.PI) / 30) * 0.1; // 30-day cycle
				const naturalDrift = cycleFactor * group.volatility * 0.05;
				segment.currentSupport = Math.max(0.05, segment.currentSupport + naturalDrift);

				// Awareness decay if no campaign activity
				segment.awareness = Math.max(0.1, segment.awareness * 0.985);
			}
		});

		// Regional polling dynamics
		Object.keys(updatedRegionalData).forEach(regionId => {
			const data = updatedRegionalData[regionId];
			const daysSinceActivity = newDay - (data.lastActivity || 0);

			// Natural regional polling drift based on region characteristics
			const region = DUTCH_REGIONS.find(r => r.id === regionId);
			if (region) {
				// Use region-specific factors for deterministic drift
				const regionSeed = regionId.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
				const cycleFactor = Math.sin((newDay * Math.PI + regionSeed) / 21) * 0.08; // 21-day cycle with region offset
				const naturalDrift = cycleFactor * (region.politicalProfile.volatility / 100) * 0.03;
				data.polling = Math.max(0.05, data.polling + naturalDrift);
			}

			if (daysSinceActivity > 3) {
				// Gradual awareness and support decay after 3 days of no activity
				data.awareness = Math.max(0.5, data.awareness * 0.97);
				data.mediaPresence = Math.max(0.1, data.mediaPresence * 0.92);
				data.polling = Math.max(0.05, data.polling * 0.995); // Slow support decay
			}
		});

		// Recalculate overall polling from updated data
		const newOverallPolling = calculateOverallPollingFromRegions(updatedRegionalData);

		return {
			...state,
			currentDay: newDay,
			daysUntilElection: daysRemaining > 0 ? state.daysUntilElection : 0,
			population: updatedPopulation,
			regionalData: updatedRegionalData,
			overallPolling: newOverallPolling
		};
	});
}

// Save game state to localStorage
export function saveGameToLocal() {
	gameStore.subscribe(state => {
		if (state) {
			try {
				// Convert Date object to string for JSON serialization
				const saveState = {
					...state,
					gameDate: state.gameDate.toISOString()
				};
				localStorage.setItem('coalition-game-state', JSON.stringify(saveState));
				console.log('Game saved successfully');
			} catch (error) {
				console.error('Failed to save game:', error);
			}
		}
	})();
}

// Load game state from localStorage
export function loadGameFromLocal(): boolean {
	const saved = localStorage.getItem('coalition-game-state');
	if (saved) {
		try {
			const loadedState = JSON.parse(saved);
			// Convert string back to Date object
			const gameState: GameState = {
				...loadedState,
				gameDate: new Date(loadedState.gameDate)
			};
			gameStore.set(gameState);
			isGameInitialized.set(true);
			console.log('Game loaded successfully');
			return true;
		} catch (error) {
			console.error('Failed to load saved game:', error);
			return false;
		}
	}
	return false;
}

// Clear game state (new game)
export function clearGameState() {
	gameStore.set(null);
	isGameInitialized.set(false);
	localStorage.removeItem('coalition-game-state');
}
