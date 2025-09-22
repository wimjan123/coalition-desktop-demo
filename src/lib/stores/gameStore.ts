import { writable } from 'svelte/store';
import type { GameState, PlayerCharacter, Party, CampaignVideo } from '../types/game.js';
import { initializePopulation, calculateCampaignImpact, DUTCH_DEMOGRAPHICS } from '../types/population.js';

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
		currentCrisis: crisisScenarios[Math.floor(Math.random() * crisisScenarios.length)]
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

		return {
			...state,
			currentPhase: 'campaign',
			isFirstTime: false,
			population,
			campaignVideos: [],
			currentDay: 1,
			campaignBudget: 100000, // Starting budget
			overallPolling: initialPolling
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

	return totalWeight > 0 ? totalSupport / totalWeight : 5;
}

// Create a campaign video
export function createCampaignVideo(video: Omit<CampaignVideo, 'id' | 'createdOn' | 'effectiveness'>) {
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
			campaignBudget: (state.campaignBudget || 0) - 10000 // Cost per video
		};
	});
}

// Advance campaign day
export function advanceCampaignDay() {
	gameStore.update(state => {
		if (!state) return state;

		const newDay = (state.currentDay || 1) + 1;
		const daysRemaining = (state.daysUntilElection || 60) - newDay + 1;

		return {
			...state,
			currentDay: newDay,
			daysUntilElection: daysRemaining > 0 ? state.daysUntilElection : 0
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