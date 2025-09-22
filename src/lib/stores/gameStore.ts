import { writable } from 'svelte/store';
import type { GameState, PlayerCharacter, Party, CampaignVideo, RegionalCampaignData } from '../types/game.js';
import { initializePopulation, calculateCampaignImpact, DUTCH_DEMOGRAPHICS } from '../types/population.js';
import { DUTCH_REGIONS } from '../types/regions.js';

// Game state store
export const gameStore = writable<GameState | null>(null);

// Helper to check if game is initialized
export const isGameInitialized = writable<boolean>(false);

// Initialize a new game
export function initializeNewGame(player: PlayerCharacter, party: Party, difficulty: 'easy' | 'normal' | 'hard' = 'normal') {
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
		player,
		playerParty: party,
		currentPhase: 'campaign-intro',
		gameDate: new Date('2023-01-01'), // Start in election year
		difficulty,
		isFirstTime: true,
		daysUntilElection: 60,
		currentCrisis: crisisScenarios[0] // Start with immigration crisis for consistency
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
		const initialPolling = calculateInitialPolling(population);
		const regionalData = initializeRegionalData(state.playerParty);

		// Calculate starting budget based on difficulty and party characteristics
		const baseBudget = 75000; // Realistic starting budget for new Dutch political party
		const difficultyMultiplier = state.difficulty === 'easy' ? 1.5 : state.difficulty === 'hard' ? 0.7 : 1.0;
		const experienceBonus = (state.player.experience / 10) * 0.2; // 0-20% bonus based on experience
		const startingBudget = Math.round(baseBudget * difficultyMultiplier * (1 + experienceBonus));

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
			nationalCampaignFocus: 'national' // Start with national focus
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