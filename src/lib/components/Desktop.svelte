<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import Dock from './Dock.svelte';
	import Toasts from './Toasts.svelte';
	import Window from './Window.svelte';
	import CharacterCreation from './CharacterCreation.svelte';
	import { windowsStore } from '../stores/stores.js';
	import { isGameInitialized, initializeNewGame, loadGameFromLocal } from '../stores/gameStore.js';
	import { setupKeyboardShortcuts } from '../utils/useKeyboard.js';
	import { restoreLayout, setupAutoSave, saveLayout } from '../utils/usePersistence.js';
	import type { PlayerCharacter, Party } from '../types/game.js';

	let desktopEl: HTMLElement;
	let keyboardCleanup: (() => void) | null = null;
	let autoSaveCleanup: (() => void) | null = null;

	onMount(async () => {
		console.log('Coalition Desktop initialized');

		// Try to load existing game first
		const gameLoaded = loadGameFromLocal();
		if (gameLoaded) {
			console.log('Existing game loaded');
		} else {
			console.log('No existing game found - showing character creation');
		}

		// Setup global keyboard shortcuts
		keyboardCleanup = setupKeyboardShortcuts();
		console.log('Keyboard shortcuts enabled');

		// Only restore desktop layout if game is initialized
		if ($isGameInitialized) {
			try {
				const restored = await restoreLayout();
				if (restored) {
					console.log('Desktop layout restored from saved state');
				} else {
					console.log('No saved layout found, starting fresh');
				}
			} catch (error) {
				console.error('Failed to restore layout:', error);
			}

			// Setup auto-save every 30 seconds
			autoSaveCleanup = setupAutoSave(30000);
			console.log('Auto-save enabled (30s interval)');
		}

		// Save layout when the page is about to unload
		const handleBeforeUnload = async () => {
			if ($isGameInitialized) {
				try {
					await saveLayout();
					console.log('Layout saved before page unload');
				} catch (error) {
					console.error('Failed to save layout on exit:', error);
				}
			}
		};

		window.addEventListener('beforeunload', handleBeforeUnload);

		// Add cleanup for beforeunload
		if (!keyboardCleanup) keyboardCleanup = () => {};
		const originalCleanup = keyboardCleanup;
		keyboardCleanup = () => {
			window.removeEventListener('beforeunload', handleBeforeUnload);
			originalCleanup();
		};
	});

	function handleCharacterCreationComplete(event: CustomEvent<{ player: PlayerCharacter; party: Party }>) {
		const { player, party } = event.detail;
		initializeNewGame(player, party, 'normal');
		console.log('Game initialized with new character and party');
	}

	onDestroy(async () => {
		// Save layout before component destruction
		try {
			await saveLayout();
			console.log('Layout saved on component destroy');
		} catch (error) {
			console.error('Failed to save layout on destroy:', error);
		}

		// Clean up keyboard event listeners
		if (keyboardCleanup) {
			keyboardCleanup();
		}

		// Clean up auto-save
		if (autoSaveCleanup) {
			autoSaveCleanup();
		}
	});
</script>

<div class="desktop" bind:this={desktopEl}>
	{#if $isGameInitialized}
		<!-- Game is running - show desktop environment -->
		<!-- Windows will be rendered here -->
		{#each $windowsStore as windowData (windowData.id)}
			<Window bind:windowData />
		{/each}

		<!-- Dock at the bottom -->
		<Dock />

		<!-- Toast notifications -->
		<Toasts />
	{:else}
		<!-- No game initialized - show character creation -->
		<div class="character-creation-overlay">
			<CharacterCreation on:complete={handleCharacterCreationComplete} />
		</div>
	{/if}
</div>

<style>
	.desktop {
		width: 100%;
		height: 100%;
		position: relative;
		background:
			radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
			radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.05) 0%, transparent 50%),
			linear-gradient(135deg, #2d3748 0%, #4a5568 100%);
		overflow: hidden;
		cursor: default;
		user-select: none;
	}

	/* Subtle desktop texture */
	.desktop::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-image:
			radial-gradient(circle at 1px 1px, rgba(255,255,255,0.02) 1px, transparent 0);
		background-size: 20px 20px;
		pointer-events: none;
	}

	.character-creation-overlay {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(255, 255, 255, 0.95);
		backdrop-filter: blur(10px);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 2000;
		overflow: auto;
	}
</style>