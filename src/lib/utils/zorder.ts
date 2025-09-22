import { get } from 'svelte/store';
import { desktopStore, windowsStore } from '../stores/stores.js';
import type { WindowData } from '../types/window.js';

/**
 * Get the next available z-index for a window
 */
export function getNextZIndex(): number {
	const desktop = get(desktopStore);
	return desktop.nextZIndex;
}

/**
 * Get the highest z-index currently in use
 */
export function getHighestZIndex(): number {
	const windows = get(windowsStore);
	return windows.reduce((max, window) => Math.max(max, window.zIndex), 0);
}

/**
 * Get the focused window (highest z-index, non-minimized)
 */
export function getFocusedWindow(): WindowData | null {
	const windows = get(windowsStore);
	const visibleWindows = windows.filter(w => !w.minimized);

	if (visibleWindows.length === 0) return null;

	return visibleWindows.reduce((focused, window) => {
		if (!focused || window.zIndex > focused.zIndex) {
			return window;
		}
		return focused;
	}, null as WindowData | null);
}

/**
 * Get windows sorted by z-index (lowest to highest)
 */
export function getWindowsByZOrder(): WindowData[] {
	const windows = get(windowsStore);
	return [...windows].sort((a, b) => a.zIndex - b.zIndex);
}

/**
 * Get the next window in z-order for cycling focus
 */
export function getNextWindowInZOrder(currentWindowId: string): WindowData | null {
	const windows = getWindowsByZOrder().filter(w => !w.minimized);

	if (windows.length <= 1) return null;

	const currentIndex = windows.findIndex(w => w.id === currentWindowId);
	if (currentIndex === -1) return windows[0];

	// Cycle to next window (wrap around to start if at end)
	const nextIndex = (currentIndex + 1) % windows.length;
	return windows[nextIndex];
}

/**
 * Get the previous window in z-order for cycling focus
 */
export function getPreviousWindowInZOrder(currentWindowId: string): WindowData | null {
	const windows = getWindowsByZOrder().filter(w => !w.minimized);

	if (windows.length <= 1) return null;

	const currentIndex = windows.findIndex(w => w.id === currentWindowId);
	if (currentIndex === -1) return windows[windows.length - 1];

	// Cycle to previous window (wrap around to end if at start)
	const prevIndex = currentIndex === 0 ? windows.length - 1 : currentIndex - 1;
	return windows[prevIndex];
}

/**
 * Check if a window is currently the topmost (focused)
 */
export function isWindowTopmost(windowId: string): boolean {
	const focusedWindow = getFocusedWindow();
	return focusedWindow?.id === windowId;
}

/**
 * Bring a window to front by giving it the highest z-index
 */
export function bringToFront(windowId: string): number {
	const newZIndex = getHighestZIndex() + 1;

	// Update the desktop store with the new highest z-index
	desktopStore.update(state => ({
		...state,
		nextZIndex: newZIndex + 1
	}));

	return newZIndex;
}

/**
 * Send a window to back by giving it the lowest z-index
 */
export function sendToBack(windowId: string): number {
	const windows = get(windowsStore);
	const lowestZIndex = windows.reduce((min, window) =>
		window.id === windowId ? min : Math.min(min, window.zIndex), 999999);

	const newZIndex = Math.max(1, lowestZIndex - 1);
	return newZIndex;
}