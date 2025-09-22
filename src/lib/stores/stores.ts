import { writable } from 'svelte/store';
import type { WindowData } from '../types/window.js';
import type { Toast } from '../types/toast.js';

// Windows store
export const windowsStore = writable<WindowData[]>([]);

// Toast notifications store
export const toastsStore = writable<Toast[]>([]);

// Desktop state
export const desktopStore = writable({
	focusedWindowId: null as string | null,
	nextZIndex: 100,
	isDragging: false,
	isResizing: false
});

// Window management functions
export function addWindow(windowData: Omit<WindowData, 'id' | 'zIndex' | 'focused'>) {
	windowsStore.update(windows => {
		const id = `window-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

		// Get next z-index and focus this window
		desktopStore.update(state => ({
			...state,
			focusedWindowId: id,
			nextZIndex: state.nextZIndex + 1
		}));

		// Unfocus all other windows
		const updatedWindows = windows.map(w => ({ ...w, focused: false }));

		const newWindow: WindowData = {
			id,
			zIndex: 0, // Will be set below
			focused: true,
			...windowData
		};

		// Set z-index from store
		desktopStore.subscribe(state => {
			newWindow.zIndex = state.nextZIndex;
		})();

		return [...updatedWindows, newWindow];
	});
}

export function removeWindow(windowId: string) {
	windowsStore.update(windows => windows.filter(w => w.id !== windowId));

	// Update focus if this was the focused window
	desktopStore.update(state => {
		if (state.focusedWindowId === windowId) {
			return { ...state, focusedWindowId: null };
		}
		return state;
	});
}

export function focusWindow(windowId: string) {
	windowsStore.update(windows => {
		return windows.map(w => ({
			...w,
			focused: w.id === windowId
		}));
	});

	desktopStore.update(state => ({
		...state,
		focusedWindowId: windowId,
		nextZIndex: state.nextZIndex + 1
	}));

	// Update the focused window's z-index
	windowsStore.update(windows => {
		return windows.map(w => {
			if (w.id === windowId) {
				desktopStore.subscribe(state => {
					w.zIndex = state.nextZIndex;
				})();
			}
			return w;
		});
	});
}

export function updateWindowPosition(windowId: string, x: number, y: number) {
	windowsStore.update(windows => {
		return windows.map(w =>
			w.id === windowId ? { ...w, x, y } : w
		);
	});
}

export function updateWindowSize(windowId: string, width: number, height: number) {
	windowsStore.update(windows => {
		return windows.map(w =>
			w.id === windowId ? { ...w, width, height } : w
		);
	});
}

export function minimizeWindow(windowId: string) {
	windowsStore.update(windows => {
		return windows.map(w =>
			w.id === windowId ? { ...w, minimized: true, focused: false } : w
		);
	});
}

export function restoreWindow(windowId: string) {
	windowsStore.update(windows => {
		return windows.map(w =>
			w.id === windowId ? { ...w, minimized: false, maximized: false } : w
		);
	});
	focusWindow(windowId);
}

// Toast management functions
export function addToast(toast: Omit<Toast, 'id'>) {
	const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

	toastsStore.update(toasts => [...toasts, { id, ...toast }]);

	// Auto-dismiss after duration (default 5 seconds)
	const duration = toast.duration ?? 5000;
	if (duration > 0) {
		setTimeout(() => {
			removeToast(id);
		}, duration);
	}

	return id;
}

export function removeToast(toastId: string) {
	toastsStore.update(toasts => toasts.filter(t => t.id !== toastId));
}

export function clearAllToasts() {
	toastsStore.set([]);
}