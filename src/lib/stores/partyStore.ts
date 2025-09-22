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

// Party stats calculation functions
function generateInitialPartyStats(party: any): PartyStats {
	// Generate realistic starting stats based on party positions and traits
	const baseApproval = 35 + Math.floor(Math.random() * 20); // 35-55%

	return {
		overallApproval: baseApproval,
		trustworthiness: Math.max(20, baseApproval - 5 + Math.floor(Math.random() * 10)),
		competence: Math.max(25, baseApproval - 3 + Math.floor(Math.random() * 15)),
		relatability: Math.max(30, baseApproval + Math.floor(Math.random() * 20)),

		demographicApproval: {
			'young': Math.max(15, baseApproval - 10 + Math.floor(Math.random() * 20)),
			'middle-aged': Math.max(20, baseApproval - 5 + Math.floor(Math.random() * 15)),
			'elderly': Math.max(25, baseApproval + Math.floor(Math.random() * 10)),
			'urban': Math.max(20, baseApproval - 8 + Math.floor(Math.random() * 18)),
			'rural': Math.max(25, baseApproval - 3 + Math.floor(Math.random() * 12)),
			'educated': Math.max(18, baseApproval - 7 + Math.floor(Math.random() * 16)),
			'working-class': Math.max(22, baseApproval + Math.floor(Math.random() * 14))
		},

		issueCredibility: generateIssueCredibility(party),

		mediaPresence: 40 + Math.floor(Math.random() * 30),
		mediaFavorability: -20 + Math.floor(Math.random() * 40),
		socialMediaFollowers: 50000 + Math.floor(Math.random() * 200000),
		socialMediaEngagement: 25 + Math.floor(Math.random() * 25),

		coalitionAppeal: 20 + Math.floor(Math.random() * 40),
		oppositionStrength: 30 + Math.floor(Math.random() * 30),
		parliamentaryInfluence: 15 + Math.floor(Math.random() * 25)
	};
}

function generateIssueCredibility(party: any): { [issueId: string]: number } {
	const credibility: { [issueId: string]: number } = {};
	const baseCredibility = 35;

	// Higher credibility on party's priority issues
	const priorityIssues = party.positions?.slice(0, 3).map((p: any) => p.issueId) || [];

	['economy', 'climate', 'immigration', 'healthcare', 'housing', 'education', 'eu', 'security'].forEach(issue => {
		const isPriority = priorityIssues.includes(issue);
		const bonus = isPriority ? 15 : 0;
		credibility[issue] = Math.max(15, baseCredibility + bonus + Math.floor(Math.random() * 20) - 10);
	});

	return credibility;
}

function generatePerformanceHistory(currentDay: number, stats: PartyStats): PartyPerformanceHistory[] {
	const history: PartyPerformanceHistory[] = [];
	const startDay = Math.max(1, currentDay - 14); // Last 2 weeks

	for (let day = startDay; day <= currentDay; day++) {
		history.push({
			date: new Date(Date.now() - (currentDay - day) * 24 * 60 * 60 * 1000),
			polling: stats.overallApproval + (Math.random() * 10 - 5), // ±5% variation
			approval: stats.overallApproval + (Math.random() * 8 - 4), // ±4% variation
			mediaAttention: stats.mediaPresence + (Math.random() * 20 - 10),
			keyEvent: Math.random() < 0.2 ? generateKeyEvent() : undefined
		});
	}

	return history;
}

function generateKeyEvent(): string {
	const events = [
		'Campaign video released',
		'Policy announcement',
		'TV debate appearance',
		'Scandal response',
		'Coalition talks',
		'Media interview',
		'Social media controversy'
	];
	return events[Math.floor(Math.random() * events.length)];
}

function generatePartyRelationships(oppositionParties: any[]): any[] {
	return oppositionParties.map(party => ({
		partyId: party.id,
		relationship: -20 + Math.floor(Math.random() * 80), // -20 to 60
		coalitionCompatibility: Math.floor(Math.random() * 70),
		publicPerception: Math.random() < 0.7 ? 'rivals' : Math.random() < 0.5 ? 'neutral' : 'allies'
	}));
}

function generatePartyStrategy(party: any): any {
	const strategies = ['populist', 'centrist', 'ideological', 'pragmatic'];
	const mediaStrategies = ['aggressive', 'defensive', 'proactive', 'reactive'];
	const coalitionStances = ['open', 'selective', 'independent', 'opposition-only'];

	return {
		focus: strategies[Math.floor(Math.random() * strategies.length)],
		targetDemographics: ['working-class', 'middle-aged'], // Based on party positions
		keyIssues: party.positions?.slice(0, 3).map((p: any) => p.issueId) || [],
		mediaStrategy: mediaStrategies[Math.floor(Math.random() * mediaStrategies.length)],
		coalitionStance: coalitionStances[Math.floor(Math.random() * coalitionStances.length)]
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