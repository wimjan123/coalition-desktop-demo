import { get } from 'svelte/store';
import { desktopStore, focusWindow, updateWindowPosition } from '../stores/stores.js';
import type { DragState } from '../types/window.js';

let currentDragState: DragState | null = null;

export function startDrag(
	event: PointerEvent,
	windowId: string,
	windowX: number,
	windowY: number
) {
	// Only start drag on left mouse button
	if (event.button !== 0) return;

	event.preventDefault();
	event.stopPropagation();

	// Focus the window being dragged
	focusWindow(windowId);

	// Set up drag state
	currentDragState = {
		isDragging: true,
		startX: event.clientX,
		startY: event.clientY,
		startWindowX: windowX,
		startWindowY: windowY,
		windowId
	};

	// Update desktop store
	desktopStore.update(state => ({
		...state,
		isDragging: true
	}));

	// Set up pointer capture
	const target = event.target as HTMLElement;
	target.setPointerCapture(event.pointerId);

	// Add event listeners
	document.addEventListener('pointermove', handleDragMove);
	document.addEventListener('pointerup', handleDragEnd);
	document.addEventListener('pointercancel', handleDragEnd);

	// Add CSS class for dragging cursor
	document.body.style.cursor = 'grabbing';
	document.body.style.userSelect = 'none';
}

function handleDragMove(event: PointerEvent) {
	if (!currentDragState) return;

	const deltaX = event.clientX - currentDragState.startX;
	const deltaY = event.clientY - currentDragState.startY;

	const newX = currentDragState.startWindowX + deltaX;
	const newY = currentDragState.startWindowY + deltaY;

	// Constrain to viewport (with some padding)
	const constrainedX = Math.max(-50, Math.min(window.innerWidth - 100, newX));
	const constrainedY = Math.max(0, Math.min(window.innerHeight - 100, newY));

	updateWindowPosition(currentDragState.windowId, constrainedX, constrainedY);
}

function handleDragEnd(event: PointerEvent) {
	if (!currentDragState) return;

	// Clean up
	document.removeEventListener('pointermove', handleDragMove);
	document.removeEventListener('pointerup', handleDragEnd);
	document.removeEventListener('pointercancel', handleDragEnd);

	// Release pointer capture
	const target = event.target as HTMLElement;
	if (target && target.releasePointerCapture) {
		target.releasePointerCapture(event.pointerId);
	}

	// Reset cursor and selection
	document.body.style.cursor = '';
	document.body.style.userSelect = '';

	// Update desktop store
	desktopStore.update(state => ({
		...state,
		isDragging: false
	}));

	currentDragState = null;
}

export function isDragging(): boolean {
	return currentDragState?.isDragging ?? false;
}

export function cancelDrag() {
	if (currentDragState) {
		// Reset to original position
		updateWindowPosition(
			currentDragState.windowId,
			currentDragState.startWindowX,
			currentDragState.startWindowY
		);

		// Clean up as if drag ended
		const fakeEvent = new PointerEvent('pointerup');
		handleDragEnd(fakeEvent);
	}
}