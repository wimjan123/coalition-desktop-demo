import { writable } from 'svelte/store';
import type { GameState, PlayerCharacter, Party } from '../types/game.js';

// Game state store
export const gameStore = writable<GameState | null>(null);

// Helper to check if game is initialized
export const isGameInitialized = writable<boolean>(false);

// Initialize a new game
export function initializeNewGame(player: PlayerCharacter, party: Party, difficulty: 'easy' | 'normal' | 'hard' = 'normal') {
	const newGameState: GameState = {
		player,
		playerParty: party,
		currentPhase: 'campaign',
		gameDate: new Date('2023-01-01'), // Start in election year
		difficulty,
		isFirstTime: true
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

// Save game state to localStorage
export function saveGameToLocal() {
	gameStore.subscribe(state => {
		if (state) {
			localStorage.setItem('coalition-game-state', JSON.stringify(state));
		}
	})();
}

// Load game state from localStorage
export function loadGameFromLocal(): boolean {
	const saved = localStorage.getItem('coalition-game-state');
	if (saved) {
		try {
			const gameState = JSON.parse(saved) as GameState;
			gameStore.set(gameState);
			isGameInitialized.set(true);
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