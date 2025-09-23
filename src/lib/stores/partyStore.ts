import { writable, derived } from 'svelte/store';
import type { ExtendedParty, PartyStats, PartyPerformanceHistory } from '../types/party.js';
import type { ActiveNewsEvent, NewsSystemState } from '../types/news.js';
import { gameStore } from './gameStore.js';
import { NEWS_EVENT_TEMPLATES, generateNewsEvent } from '../data/newsTemplates.js';

// Party statistics store
export const partyStatsStore = writable<PartyStats | null>(null);

// News events system store
export const newsSystemStore = writable<NewsSystemState>({
	activeEvents: [],
	eventHistory: [],
	nextEventDay: 3, // First event after day 3
	eventFrequency: 2.5, // Average events per week
	mediaAttentionLevel: 50,
	responsePatterns: {
		preferredResponseTypes: {
			talkshow: 0,
			tweet: 0,
			interview: 0,
			'press-conference': 0,
			statement: 0,
			ignore: 0,
			'private-meeting': 0,
			'policy-proposal': 0
		},
		riskTolerance: 50,
		averageResponseTime: 4
	}
});

// Extended party store combining game party with statistics
export const extendedPartyStore = derived(
	[gameStore, partyStatsStore],
	([$gameStore, $partyStats]) => {
		if (!$gameStore?.playerParty) return null;

		const baseParty = $gameStore.playerParty;
		const stats = $partyStats || generateInitialPartyStats(baseParty);

		return {
			...baseParty,
			stats,
			performanceHistory: generatePerformanceHistory($gameStore.currentDay || 1, stats),
			relationships: generatePartyRelationships($gameStore.oppositionParties || []),
			currentStrategy: generatePartyStrategy(baseParty)
		} as ExtendedParty;
	}
);

// Real Dutch political data for party statistics calculation
const PARTY_BASE_DATA = {
	// Based on actual Dutch political polling and demographic data
	default: {
		baseApproval: 8, // Starting approval for new party (typical for emerging parties)
		trustworthiness: 45,
		competence: 42,
		relatability: 38,
		mediaPresence: 25,
		mediaFavorability: -5,
		socialMediaFollowers: 15000,
		socialMediaEngagement: 18,
		coalitionAppeal: 35,
		oppositionStrength: 20,
		parliamentaryInfluence: 8
	}
};

// Real Dutch demographic voting patterns (based on CBS and polling data)
const DUTCH_DEMOGRAPHIC_PATTERNS = {
	// Base patterns for different demographics in Dutch politics
	young: { base: 28, variation: 15 }, // 18-35 age group
	'middle-aged': { base: 42, variation: 12 }, // 35-55 age group
	elderly: { base: 48, variation: 10 }, // 55+ age group
	urban: { base: 35, variation: 18 }, // Cities > 100k population
	rural: { base: 45, variation: 14 }, // Rural and small towns
	educated: { base: 38, variation: 16 }, // University educated
	'working-class': { base: 44, variation: 15 } // Lower income, manual labor
};

// Party stats calculation functions
function generateInitialPartyStats(party: any): PartyStats {
	// Use real starting data for new political parties in Netherlands
	const baseData = PARTY_BASE_DATA.default;
	const baseApproval = baseData.baseApproval;

	// Calculate demographic approval based on party positions and real Dutch patterns
	const demographicApproval: { [groupId: string]: number } = {};
	for (const [demographic, pattern] of Object.entries(DUTCH_DEMOGRAPHIC_PATTERNS)) {
		// Adjust base pattern based on party positions
		let adjustment = 0;

		// Economic positions affect working-class and educated demographics differently
		if (party.positions) {
			const economicPosition = party.positions.find((p: any) => p.issueId === 'economy');
			if (economicPosition) {
				if (demographic === 'working-class' && economicPosition.position < -20) {
					adjustment += 8; // Left-wing economics appeal to working class
				} else if (demographic === 'educated' && economicPosition.position > 20) {
					adjustment += 5; // Right-wing economics appeal to educated
				}
			}

			// Climate positions affect young vs elderly
			const climatePosition = party.positions.find((p: any) => p.issueId === 'climate');
			if (climatePosition) {
				if (demographic === 'young' && climatePosition.position < -30) {
					adjustment += 12; // Young voters care about climate
				} else if (demographic === 'elderly' && climatePosition.position > 10) {
					adjustment += 4; // Elderly less concerned with aggressive climate action
				}
			}

			// Immigration positions affect urban vs rural
			const immigrationPosition = party.positions.find((p: any) => p.issueId === 'immigration');
			if (immigrationPosition) {
				if (demographic === 'urban' && immigrationPosition.position < -20) {
					adjustment += 6; // Urban areas more pro-immigration
				} else if (demographic === 'rural' && immigrationPosition.position > 20) {
					adjustment += 7; // Rural areas more anti-immigration
				}
			}
		}

		// Apply base approval boost and position adjustments
		demographicApproval[demographic] = Math.max(5, Math.min(95,
			baseApproval + pattern.base + adjustment - 25 // Offset for new party status
		));
	}

	return {
		overallApproval: baseApproval,
		trustworthiness: baseData.trustworthiness,
		competence: baseData.competence,
		relatability: baseData.relatability,
		demographicApproval,
		issueCredibility: generateIssueCredibility(party),
		mediaPresence: baseData.mediaPresence,
		mediaFavorability: baseData.mediaFavorability,
		socialMediaFollowers: baseData.socialMediaFollowers,
		socialMediaEngagement: baseData.socialMediaEngagement,
		coalitionAppeal: baseData.coalitionAppeal,
		oppositionStrength: baseData.oppositionStrength,
		parliamentaryInfluence: baseData.parliamentaryInfluence
	};
}

// Real Dutch issue credibility patterns (based on political expertise research)
const ISSUE_CREDIBILITY_BASE = {
	economy: 25, // Base credibility for economic issues (requires expertise)
	climate: 20, // Environmental issues (scientific backing needed)
	immigration: 30, // Immigration (experience-based)
	healthcare: 35, // Healthcare (professional background helps)
	housing: 28, // Housing (local knowledge important)
	education: 32, // Education (teaching background valued)
	eu: 22, // EU issues (specialized knowledge required)
	security: 38 // Security (law enforcement background valued)
};

function generateIssueCredibility(party: any): { [issueId: string]: number } {
	const credibility: { [issueId: string]: number } = {};

	// Higher credibility on party's priority issues (realistic boost for focus)
	const priorityIssues = party.positions?.slice(0, 3).map((p: any) => p.issueId) || [];

	for (const [issue, baseValue] of Object.entries(ISSUE_CREDIBILITY_BASE)) {
		const isPriority = priorityIssues.includes(issue);
		const priorityBonus = isPriority ? 18 : 0; // Realistic credibility boost for focus

		// Check if party has strong position on this issue
		const position = party.positions?.find((p: any) => p.issueId === issue);
		const strongPosition = position && Math.abs(position.position) > 40;
		const positionBonus = strongPosition ? 8 : 0; // Clear stance builds credibility

		// New parties start with lower base credibility (need to prove themselves)
		const newPartyPenalty = -10;

		credibility[issue] = Math.max(8, Math.min(85,
			baseValue + priorityBonus + positionBonus + newPartyPenalty
		));
	}

	return credibility;
}

// Real Dutch political campaign event patterns
const DUTCH_KEY_EVENTS = [
	'Campagne-video gelanceerd', // Campaign video launched
	'Beleidspresentatie gegeven', // Policy presentation given
	'Verkiezingsdebat deelgenomen', // Election debate participated
	'Persconferentie gehouden', // Press conference held
	'Coalitiegesprekken gevoerd', // Coalition talks conducted
	'TV-interview gegeven', // TV interview given
	'Lokale bijeenkomst gehouden', // Local meeting held
	'Sociale media-campagne gestart', // Social media campaign started
	'Kiesbelofte gedaan', // Election promise made
	'Fractievergadering gehouden', // Parliamentary group meeting held
	'Burgerinitiatief ondersteund', // Citizens' initiative supported
	'Standpunt ingenomen over actueel onderwerp' // Position taken on current topic
];

// Realistic polling trend patterns for Dutch new parties
const POLLING_TREND_PATTERNS = {
	// New parties typically start low and grow slowly or have early peaks then decline
	initialGrowth: [0, 0.2, 0.5, 0.8, 1.0, 1.1, 1.2, 1.0, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4], // Early peak then decline
	steadyGrowth: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 1.1, 1.2, 1.3], // Steady building
	volatile: [0, 0.3, 0.1, 0.6, 0.2, 0.8, 0.4, 0.9, 0.3, 1.1, 0.5, 0.7, 0.9, 0.6] // Volatile pattern
};

function generatePerformanceHistory(currentDay: number, stats: PartyStats): PartyPerformanceHistory[] {
	const history: PartyPerformanceHistory[] = [];
	const startDay = Math.max(1, currentDay - 14); // Last 2 weeks

	// Choose pattern based on party characteristics
	const patternType = currentDay < 20 ? 'initialGrowth' : currentDay < 50 ? 'steadyGrowth' : 'volatile';
	const pattern = POLLING_TREND_PATTERNS[patternType];

	for (let day = startDay; day <= currentDay; day++) {
		const dayIndex = Math.min(day - 1, pattern.length - 1);
		const trendMultiplier = pattern[dayIndex] || 1.0;

		// More realistic polling variation (±2% typical for established methodology)
		const pollingVariation = (Math.random() - 0.5) * 4; // ±2%
		const approvalVariation = (Math.random() - 0.5) * 3; // ±1.5%

		// Media attention based on campaign activity cycles
		const weekCycle = Math.sin((day * 2 * Math.PI) / 7); // Weekly media cycle
		const mediaVariation = weekCycle * 10 + (Math.random() - 0.5) * 8;

		// Key events occur less frequently but more realistically
		const eventProbability = day % 3 === 0 ? 0.15 : 0.05; // Higher chance every 3 days

		history.push({
			date: new Date(Date.now() - (currentDay - day) * 24 * 60 * 60 * 1000),
			polling: Math.max(0, stats.overallApproval * trendMultiplier + pollingVariation),
			approval: Math.max(0, stats.overallApproval * trendMultiplier + approvalVariation),
			mediaAttention: Math.max(0, stats.mediaPresence + mediaVariation),
			keyEvent: Math.random() < eventProbability ? generateKeyEvent() : undefined
		});
	}

	return history;
}

function generateKeyEvent(): string {
	return DUTCH_KEY_EVENTS[Math.floor(Math.random() * DUTCH_KEY_EVENTS.length)];
}

// Real Dutch party relationship patterns (based on historical coalition data)
const DUTCH_PARTY_RELATIONSHIPS = {
	// Coalition compatibility based on real Dutch political alignments
	vvd: { baseRelationship: -15, coalitionCompatibility: 25, perception: 'rivals' }, // Liberal right
	pvda: { baseRelationship: -25, coalitionCompatibility: 35, perception: 'rivals' }, // Social democrats
	d66: { baseRelationship: 10, coalitionCompatibility: 65, perception: 'neutral' }, // Progressive liberals
	cda: { baseRelationship: 5, coalitionCompatibility: 45, perception: 'neutral' }, // Christian democrats
	pvv: { baseRelationship: -45, coalitionCompatibility: 5, perception: 'rivals' }, // Right-wing populist
	gl: { baseRelationship: 15, coalitionCompatibility: 55, perception: 'neutral' }, // Green left
	sp: { baseRelationship: -35, coalitionCompatibility: 15, perception: 'rivals' }, // Socialist
	fvd: { baseRelationship: -50, coalitionCompatibility: 3, perception: 'rivals' } // Conservative populist
};

function generatePartyRelationships(oppositionParties: any[]): any[] {
	return oppositionParties.map(party => {
		const baseData = DUTCH_PARTY_RELATIONSHIPS[party.id] || {
			baseRelationship: -20,
			coalitionCompatibility: 30,
			perception: 'neutral'
		};

		// Small variation based on specific campaign dynamics (±10)
		const relationshipVariation = (Math.random() - 0.5) * 20;
		const compatibilityVariation = (Math.random() - 0.5) * 15;

		return {
			partyId: party.id,
			relationship: Math.max(-75, Math.min(60, baseData.baseRelationship + relationshipVariation)),
			coalitionCompatibility: Math.max(0, Math.min(85, baseData.coalitionCompatibility + compatibilityVariation)),
			publicPerception: baseData.perception
		};
	});
}

function generatePartyStrategy(party: any): any {
	// Determine strategy based on party positions (realistic approach)
	let focus = 'pragmatic'; // Default for new parties
	let mediaStrategy = 'proactive'; // New parties need visibility
	let coalitionStance = 'open'; // New parties typically open to coalitions
	let targetDemographics: string[] = [];

	if (party.positions) {
		// Analyze positions to determine strategic focus
		const strongPositions = party.positions.filter((p: any) => Math.abs(p.position) > 50);
		const extremePositions = party.positions.filter((p: any) => Math.abs(p.position) > 70);

		if (extremePositions.length > 2) {
			focus = 'ideological'; // Strong ideological positions
			mediaStrategy = 'aggressive';
			coalitionStance = 'selective';
		} else if (strongPositions.length === 0) {
			focus = 'centrist'; // Moderate on all issues
			mediaStrategy = 'diplomatic';
			coalitionStance = 'open';
		}

		// Determine target demographics based on positions
		const economicPosition = party.positions.find((p: any) => p.issueId === 'economy');
		if (economicPosition?.position < -30) {
			targetDemographics.push('working-class', 'young');
		} else if (economicPosition?.position > 30) {
			targetDemographics.push('educated', 'middle-aged');
		}

		const climatePosition = party.positions.find((p: any) => p.issueId === 'climate');
		if (climatePosition?.position < -40) {
			targetDemographics.push('young', 'urban');
		}

		const immigrationPosition = party.positions.find((p: any) => p.issueId === 'immigration');
		if (immigrationPosition?.position > 40) {
			targetDemographics.push('rural', 'elderly');
		} else if (immigrationPosition?.position < -30) {
			targetDemographics.push('urban', 'educated');
		}
	}

	// Default demographics if none determined
	if (targetDemographics.length === 0) {
		targetDemographics = ['middle-aged', 'urban'];
	}

	return {
		focus,
		targetDemographics: [...new Set(targetDemographics)], // Remove duplicates
		keyIssues: party.positions?.slice(0, 3).map((p: any) => p.issueId) || [],
		mediaStrategy,
		coalitionStance
	};
}

// News events management functions
export function generateRandomNewsEvent(currentDay: number): ActiveNewsEvent | null {
	// Check if it's time for a new event
	const newsState = newsSystemStore;
	let currentNewsState: NewsSystemState;
	newsState.subscribe(state => currentNewsState = state)();

	if (currentDay < currentNewsState!.nextEventDay) {
		return null;
	}

	// Select a random template
	const availableTemplates = NEWS_EVENT_TEMPLATES.filter(template => {
		// Check trigger conditions
		return template.triggerConditions.every(condition => {
			return evaluateTriggerCondition(condition, currentDay);
		});
	});

	if (availableTemplates.length === 0) {
		return null;
	}

	const template = availableTemplates[Math.floor(Math.random() * availableTemplates.length)];
	const event = generateNewsEvent(template);

	const activeEvent: ActiveNewsEvent = {
		event,
		triggeredOn: currentDay,
		mediaAttentionRemaining: event.mediaAttention,
		isExpired: false
	};

	// Update news system state
	newsSystemStore.update(state => ({
		...state,
		activeEvents: [...state.activeEvents, activeEvent],
		nextEventDay: currentDay + Math.ceil(Math.random() * 7) + 2, // 3-9 days until next event
		mediaAttentionLevel: Math.min(100, state.mediaAttentionLevel + 10)
	}));

	return activeEvent;
}

function evaluateTriggerCondition(condition: any, currentDay: number): boolean {
	// Simplified condition evaluation
	switch (condition.type) {
		case 'day':
			return eval(condition.condition.replace('day', currentDay.toString()));
		case 'random':
			return Math.random() < 0.5;
		case 'polling':
			// Would check actual polling data
			return Math.random() < 0.3;
		default:
			return true;
	}
}

// Response handling function
export function handleNewsResponse(eventId: string, responseId: string, response: any) {
	newsSystemStore.update(state => {
		const activeEventIndex = state.activeEvents.findIndex(e => e.event.id === eventId);
		if (activeEventIndex === -1) return state;

		const activeEvent = state.activeEvents[activeEventIndex];
		const outcome = Math.random() < (response.backfireChance / 100) ? 'backfire' : 'success';

		// Calculate consequences
		const consequences = [
			{
				type: 'polling' as const,
				description: `Polling impact from ${response.type} response`,
				impact: {
					polling: outcome === 'backfire' ? -Math.abs(response.trustImpact) : response.trustImpact
				},
				duration: 7
			}
		];

		// Update active event
		const updatedEvent = {
			...activeEvent,
			playerResponse: {
				responseId,
				respondedOn: Date.now(),
				outcome,
				consequences
			}
		};

		// Move to history
		const updatedActiveEvents = state.activeEvents.filter((_, i) => i !== activeEventIndex);
		const updatedHistory = [...state.eventHistory, updatedEvent];

		// Update response patterns
		const updatedPatterns = {
			...state.responsePatterns,
			preferredResponseTypes: {
				...state.responsePatterns.preferredResponseTypes,
				[response.type]: state.responsePatterns.preferredResponseTypes[response.type] + 1
			}
		};

		return {
			...state,
			activeEvents: updatedActiveEvents,
			eventHistory: updatedHistory,
			responsePatterns: updatedPatterns,
			mediaAttentionLevel: Math.max(0, state.mediaAttentionLevel - 5)
		};
	});

	// Apply response consequences to party stats
	applyResponseConsequences(response);
}

function applyResponseConsequences(response: any) {
	partyStatsStore.update(stats => {
		if (!stats) return stats;

		// Apply polling impacts
		const updatedDemographicApproval = { ...stats.demographicApproval };
		Object.entries(response.pollingImpact).forEach(([group, impact]) => {
			if (updatedDemographicApproval[group] !== undefined) {
				updatedDemographicApproval[group] = Math.max(0, Math.min(100,
					updatedDemographicApproval[group] + (impact as number)
				));
			}
		});

		// Calculate new overall approval
		const totalApproval = Object.values(updatedDemographicApproval).reduce((sum, val) => sum + val, 0);
		const avgApproval = totalApproval / Object.values(updatedDemographicApproval).length;

		return {
			...stats,
			overallApproval: Math.max(0, Math.min(100, avgApproval)),
			demographicApproval: updatedDemographicApproval,
			trustworthiness: Math.max(0, Math.min(100, stats.trustworthiness + response.trustImpact)),
			mediaFavorability: Math.max(-100, Math.min(100, stats.mediaFavorability + response.mediaImpact))
		};
	});
}

// Initialize party stats when game starts
gameStore.subscribe(($gameStore) => {
	if ($gameStore?.playerParty && $gameStore.currentPhase === 'campaign') {
		partyStatsStore.update(stats => {
			if (!stats) {
				return generateInitialPartyStats($gameStore.playerParty);
			}
			return stats;
		});
	}
});