<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import Dock from './Dock.svelte';
	import Toasts from './Toasts.svelte';
	import Window from './Window.svelte';
	import { windowsStore } from '../stores/stores.js';
	import { setupKeyboardShortcuts } from '../utils/useKeyboard.js';

	let desktopEl: HTMLElement;
	let keyboardCleanup: (() => void) | null = null;

	onMount(() => {
		console.log('Coalition Desktop initialized');

		// Setup global keyboard shortcuts
		keyboardCleanup = setupKeyboardShortcuts();
		console.log('Keyboard shortcuts enabled');
	});

	onDestroy(() => {
		// Clean up keyboard event listeners
		if (keyboardCleanup) {
			keyboardCleanup();
		}
	});
</script>

<div class="desktop" bind:this={desktopEl}>
	<!-- Windows will be rendered here -->
	{#each $windowsStore as windowData (windowData.id)}
		<Window bind:windowData />
	{/each}

	<!-- Dock at the bottom -->
	<Dock />

	<!-- Toast notifications -->
	<Toasts />
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
</style>