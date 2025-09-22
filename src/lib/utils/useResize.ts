import { get } from 'svelte/store';
import { desktopStore, focusWindow, updateWindowPosition, updateWindowSize, windowsStore } from '../stores/stores.js';
import type { ResizeState, ResizeDirection, WindowData } from '../types/window.js';
import { rafThrottle, perfMonitor, optimizeForDragging, restoreAfterDragging } from './usePerformance.js';

let currentResizeState: ResizeState | null = null;

// Throttled resize move handler for better performance
const throttledResizeMove = rafThrottle(handleResizeMove);

export function startResize(
	event: PointerEvent,
	windowId: string,
	direction: ResizeDirection,
	windowData: WindowData
) {
	// Only start resize on left mouse button
	if (event.button !== 0) return;

	event.preventDefault();
	event.stopPropagation();

	// Focus the window being resized
	focusWindow(windowId);

	// Set up resize state
	currentResizeState = {
		isResizing: true,
		direction,
		startX: event.clientX,
		startY: event.clientY,
		startWidth: windowData.width,
		startHeight: windowData.height,
		startWindowX: windowData.x,
		startWindowY: windowData.y,
		windowId
	};

	// Update desktop store
	desktopStore.update(state => ({
		...state,
		isResizing: true
	}));

	// Set up pointer capture
	const target = event.target as HTMLElement;
	target.setPointerCapture(event.pointerId);

	// Optimize window element for resizing
	const windowEl = target.closest('.window') as HTMLElement;
	if (windowEl) {
		optimizeForDragging(windowEl); // Same optimization works for resize
	}

	// Add event listeners with throttled handler
	document.addEventListener('pointermove', throttledResizeMove);
	document.addEventListener('pointerup', handleResizeEnd);
	document.addEventListener('pointercancel', handleResizeEnd);

	// Set cursor based on direction
	document.body.style.cursor = getCursorForDirection(direction);
	document.body.style.userSelect = 'none';
}

function handleResizeMove(event: PointerEvent) {
	if (!currentResizeState) return;

	// Start performance timing
	const endTiming = perfMonitor.start('resize');

	const deltaX = event.clientX - currentResizeState.startX;
	const deltaY = event.clientY - currentResizeState.startY;

	// Get window constraints
	const windows = get(windowsStore);
	const windowData = windows.find(w => w.id === currentResizeState!.windowId);
	if (!windowData) return;

	const minWidth = windowData.minWidth ?? 300;
	const minHeight = windowData.minHeight ?? 200;
	const maxWidth = windowData.maxWidth ?? window.innerWidth;
	const maxHeight = windowData.maxHeight ?? window.innerHeight - 80; // Leave space for dock

	let newWidth = currentResizeState.startWidth;
	let newHeight = currentResizeState.startHeight;
	let newX = currentResizeState.startWindowX;
	let newY = currentResizeState.startWindowY;

	// Apply resize based on direction
	switch (currentResizeState.direction) {
		case 'n':
			newHeight = currentResizeState.startHeight - deltaY;
			newY = currentResizeState.startWindowY + deltaY;
			break;
		case 's':
			newHeight = currentResizeState.startHeight + deltaY;
			break;
		case 'e':
			newWidth = currentResizeState.startWidth + deltaX;
			break;
		case 'w':
			newWidth = currentResizeState.startWidth - deltaX;
			newX = currentResizeState.startWindowX + deltaX;
			break;
		case 'ne':
			newWidth = currentResizeState.startWidth + deltaX;
			newHeight = currentResizeState.startHeight - deltaY;
			newY = currentResizeState.startWindowY + deltaY;
			break;
		case 'nw':
			newWidth = currentResizeState.startWidth - deltaX;
			newHeight = currentResizeState.startHeight - deltaY;
			newX = currentResizeState.startWindowX + deltaX;
			newY = currentResizeState.startWindowY + deltaY;
			break;
		case 'se':
			newWidth = currentResizeState.startWidth + deltaX;
			newHeight = currentResizeState.startHeight + deltaY;
			break;
		case 'sw':
			newWidth = currentResizeState.startWidth - deltaX;
			newHeight = currentResizeState.startHeight + deltaY;
			newX = currentResizeState.startWindowX + deltaX;
			break;
	}

	// Apply constraints
	newWidth = Math.max(minWidth, Math.min(maxWidth, newWidth));
	newHeight = Math.max(minHeight, Math.min(maxHeight, newHeight));

	// Adjust position if we hit size constraints and were resizing from top/left
	if (currentResizeState.direction.includes('n') && newHeight === minHeight) {
		newY = currentResizeState.startWindowY + (currentResizeState.startHeight - minHeight);
	}
	if (currentResizeState.direction.includes('w') && newWidth === minWidth) {
		newX = currentResizeState.startWindowX + (currentResizeState.startWidth - minWidth);
	}

	// Constrain position to viewport
	newX = Math.max(0, Math.min(window.innerWidth - newWidth, newX));
	newY = Math.max(0, Math.min(window.innerHeight - newHeight - 80, newY));

	// Update window
	updateWindowSize(currentResizeState.windowId, newWidth, newHeight);
	if (newX !== currentResizeState.startWindowX || newY !== currentResizeState.startWindowY) {
		updateWindowPosition(currentResizeState.windowId, newX, newY);
	}

	// End performance timing
	endTiming();
}

function handleResizeEnd(event: PointerEvent) {
	if (!currentResizeState) return;

	// Clean up
	document.removeEventListener('pointermove', throttledResizeMove);
	document.removeEventListener('pointerup', handleResizeEnd);
	document.removeEventListener('pointercancel', handleResizeEnd);

	// Release pointer capture
	const target = event.target as HTMLElement;
	if (target && target.releasePointerCapture) {
		target.releasePointerCapture(event.pointerId);
	}

	// Restore window element after resizing
	const windowEl = target.closest('.window') as HTMLElement;
	if (windowEl) {
		restoreAfterDragging(windowEl);
	}

	// Reset cursor and selection
	document.body.style.cursor = '';
	document.body.style.userSelect = '';

	// Update desktop store
	desktopStore.update(state => ({
		...state,
		isResizing: false
	}));

	currentResizeState = null;
}

function getCursorForDirection(direction: ResizeDirection): string {
	switch (direction) {
		case 'n':
		case 's':
			return 'ns-resize';
		case 'e':
		case 'w':
			return 'ew-resize';
		case 'ne':
		case 'sw':
			return 'nesw-resize';
		case 'nw':
		case 'se':
			return 'nwse-resize';
		default:
			return 'default';
	}
}

export function isResizing(): boolean {
	return currentResizeState?.isResizing ?? false;
}

export function cancelResize() {
	if (currentResizeState) {
		// Reset to original size and position
		updateWindowSize(
			currentResizeState.windowId,
			currentResizeState.startWidth,
			currentResizeState.startHeight
		);
		updateWindowPosition(
			currentResizeState.windowId,
			currentResizeState.startWindowX,
			currentResizeState.startWindowY
		);

		// Clean up as if resize ended
		const fakeEvent = new PointerEvent('pointerup');
		handleResizeEnd(fakeEvent);
	}
}