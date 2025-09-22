<script lang="ts">
	import type { WindowData, ResizeDirection } from '../types/window.js';
	import { startDrag } from '../utils/useDrag.js';
	import { startResize } from '../utils/useResize.js';
	import { focusWindow, minimizeWindow, removeWindow } from '../stores/stores.js';

	export let windowData: WindowData;

	let windowEl: HTMLElement;

	function handleTitleBarPointerDown(event: PointerEvent) {
		if (!windowData.draggable || windowData.maximized) return;
		startDrag(event, windowData.id, windowData.x, windowData.y);
	}

	function handleResizePointerDown(event: PointerEvent) {
		if (!windowData.resizable || windowData.maximized) return;

		const target = event.target as HTMLElement;
		const direction = target.dataset.direction as ResizeDirection;
		if (direction) {
			startResize(event, windowData.id, direction, windowData);
		}
	}

	function handleWindowPointerDown(event: PointerEvent) {
		// Focus window when clicked (but not when dragging or resizing)
		if (event.target === windowEl || (event.target as HTMLElement).closest('.content')) {
			focusWindow(windowData.id);
		}
	}

	function handleMinimize() {
		minimizeWindow(windowData.id);
	}

	function handleMaximize() {
		// Toggle maximized state by updating the windowData
		windowData.maximized = !windowData.maximized;

		// Force reactivity by reassigning
		windowData = { ...windowData };
	}

	function handleClose() {
		removeWindow(windowData.id);
	}
</script>

{#if !windowData.minimized}
	<div
		class="window"
		class:maximized={windowData.maximized}
		class:focused={windowData.focused}
		bind:this={windowEl}
		on:pointerdown={handleWindowPointerDown}
		style="
			left: {windowData.x}px;
			top: {windowData.y}px;
			width: {windowData.width}px;
			height: {windowData.height}px;
			z-index: {windowData.zIndex};
		"
		role="dialog"
		aria-label={windowData.title}
		tabindex="-1"
	>
		<!-- Title Bar -->
		<div
			class="title-bar"
			on:pointerdown={handleTitleBarPointerDown}
			role="banner"
		>
			<div class="window-controls">
				<button
					class="control-btn close"
					on:click={handleClose}
					aria-label="Close {windowData.title}"
				>
					×
				</button>
				<button
					class="control-btn minimize"
					on:click={handleMinimize}
					aria-label="Minimize {windowData.title}"
				>
					−
				</button>
				<button
					class="control-btn maximize"
					on:click={handleMaximize}
					aria-label={windowData.maximized ? 'Restore' : 'Maximize'} {windowData.title}
				>
					{windowData.maximized ? '⧉' : '□'}
				</button>
			</div>
			<div class="title">{windowData.title}</div>
			<div class="title-spacer"></div>
		</div>

		<!-- Window Content -->
		<div class="content">
			{#if windowData.appType}
				<!-- App content will be rendered here based on appType -->
				<div class="app-content">
					<h2>{windowData.title}</h2>
					<p>Content for {windowData.appType} app coming soon...</p>
				</div>
			{:else}
				<slot />
			{/if}
		</div>

		<!-- Resize handles -->
		<div class="resize-handle resize-n" data-direction="n" on:pointerdown={handleResizePointerDown}></div>
		<div class="resize-handle resize-s" data-direction="s" on:pointerdown={handleResizePointerDown}></div>
		<div class="resize-handle resize-e" data-direction="e" on:pointerdown={handleResizePointerDown}></div>
		<div class="resize-handle resize-w" data-direction="w" on:pointerdown={handleResizePointerDown}></div>
		<div class="resize-handle resize-ne" data-direction="ne" on:pointerdown={handleResizePointerDown}></div>
		<div class="resize-handle resize-nw" data-direction="nw" on:pointerdown={handleResizePointerDown}></div>
		<div class="resize-handle resize-se" data-direction="se" on:pointerdown={handleResizePointerDown}></div>
		<div class="resize-handle resize-sw" data-direction="sw" on:pointerdown={handleResizePointerDown}></div>
	</div>
{/if}

<style>
	.window {
		position: absolute;
		background: #fff;
		border-radius: 8px;
		box-shadow:
			0 8px 32px rgba(0, 0, 0, 0.3),
			0 2px 8px rgba(0, 0, 0, 0.2);
		overflow: hidden;
		border: 1px solid rgba(255, 255, 255, 0.2);
		backdrop-filter: blur(10px);
		transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.window.maximized {
		left: 0 !important;
		top: 0 !important;
		width: 100% !important;
		height: calc(100% - 80px) !important; /* Leave space for dock */
		border-radius: 0;
	}

	.window.focused {
		box-shadow:
			0 12px 48px rgba(0, 0, 0, 0.4),
			0 4px 16px rgba(0, 0, 0, 0.3),
			0 0 0 1px rgba(59, 130, 246, 0.5);
	}

	.title-bar {
		height: 32px;
		background: linear-gradient(180deg, #f9fafb 0%, #e5e7eb 100%);
		border-bottom: 1px solid #d1d5db;
		display: flex;
		align-items: center;
		padding: 0 12px;
		cursor: move;
		user-select: none;
	}

	.window.focused .title-bar {
		background: linear-gradient(180deg, #3b82f6 0%, #2563eb 100%);
		color: white;
		border-bottom-color: #1d4ed8;
	}

	.window-controls {
		display: flex;
		gap: 8px;
		margin-right: 12px;
	}

	.control-btn {
		width: 12px;
		height: 12px;
		border-radius: 50%;
		border: none;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 8px;
		font-weight: bold;
		transition: all 0.15s ease;
	}

	.control-btn.close {
		background: #ff5f56;
		color: #fff;
	}

	.control-btn.minimize {
		background: #ffbd2e;
		color: #fff;
	}

	.control-btn.maximize {
		background: #27ca3f;
		color: #fff;
		font-size: 6px;
	}

	.control-btn:hover {
		transform: scale(1.1);
	}

	.title {
		font-size: 13px;
		font-weight: 500;
		flex: 1;
		text-align: center;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.title-spacer {
		width: 88px; /* Balance the controls on the left */
	}

	.content {
		height: calc(100% - 33px); /* Account for title bar */
		background: #fff;
		overflow: auto;
		padding: 16px;
	}

	.app-content h2 {
		margin: 0 0 16px 0;
		color: #374151;
		font-size: 18px;
		font-weight: 600;
	}

	.app-content p {
		color: #6b7280;
		line-height: 1.6;
		margin: 0;
	}

	/* Resize handles */
	.resize-handle {
		position: absolute;
		background: transparent;
	}

	.resize-n, .resize-s {
		left: 8px;
		right: 8px;
		height: 4px;
		cursor: ns-resize;
	}

	.resize-n { top: -2px; }
	.resize-s { bottom: -2px; }

	.resize-e, .resize-w {
		top: 8px;
		bottom: 8px;
		width: 4px;
		cursor: ew-resize;
	}

	.resize-e { right: -2px; }
	.resize-w { left: -2px; }

	.resize-ne, .resize-nw, .resize-se, .resize-sw {
		width: 8px;
		height: 8px;
	}

	.resize-ne {
		top: -2px;
		right: -2px;
		cursor: ne-resize;
	}

	.resize-nw {
		top: -2px;
		left: -2px;
		cursor: nw-resize;
	}

	.resize-se {
		bottom: -2px;
		right: -2px;
		cursor: se-resize;
	}

	.resize-sw {
		bottom: -2px;
		left: -2px;
		cursor: sw-resize;
	}

	/* Hide resize handles when maximized */
	.window.maximized .resize-handle {
		display: none;
	}
</style>