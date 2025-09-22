import { get } from 'svelte/store';
import { windowsStore, focusWindow, removeWindow, minimizeWindow, updateWindow, addToast } from '../stores/stores.js';
import { getFocusedWindow, getNextWindowInZOrder, getPreviousWindowInZOrder } from './zorder.js';
import { saveLayout, restoreLayout, clearLayout } from './usePersistence.js';

/**
 * Global keyboard shortcut handler for desktop environment
 */
export function setupKeyboardShortcuts() {
	function handleKeydown(event: KeyboardEvent) {
		// Check for Command key on macOS or Ctrl on other platforms
		const modifier = event.metaKey || event.ctrlKey;

		// ⌘W or Ctrl+W - Close focused window
		if (modifier && event.key === 'w') {
			event.preventDefault();
			const focusedWindow = getFocusedWindow();
			if (focusedWindow) {
				removeWindow(focusedWindow.id);
			}
			return;
		}

		// ⌘` or Ctrl+` - Cycle through windows
		if (modifier && event.key === '`') {
			event.preventDefault();
			const focusedWindow = getFocusedWindow();
			if (focusedWindow) {
				const nextWindow = getNextWindowInZOrder(focusedWindow.id);
				if (nextWindow) {
					focusWindow(nextWindow.id);
				}
			} else {
				// If no window focused, focus the topmost window
				const windows = get(windowsStore).filter(w => !w.minimized);
				if (windows.length > 0) {
					const topmost = windows.reduce((highest, window) =>
						window.zIndex > highest.zIndex ? window : highest
					);
					focusWindow(topmost.id);
				}
			}
			return;
		}

		// Escape - Cancel drag/resize operations or minimize focused window
		if (event.key === 'Escape') {
			event.preventDefault();

			// For now, just minimize the focused window
			// TODO: Add cancel drag/resize functionality
			const focusedWindow = getFocusedWindow();
			if (focusedWindow) {
				minimizeWindow(focusedWindow.id);
			}
			return;
		}

		// ⌘Shift+` or Ctrl+Shift+` - Cycle backwards through windows
		if (modifier && event.shiftKey && event.key === '`') {
			event.preventDefault();
			const focusedWindow = getFocusedWindow();
			if (focusedWindow) {
				const prevWindow = getPreviousWindowInZOrder(focusedWindow.id);
				if (prevWindow) {
					focusWindow(prevWindow.id);
				}
			}
			return;
		}

		// ⌘M or Ctrl+M - Minimize focused window
		if (modifier && event.key === 'm') {
			event.preventDefault();
			const focusedWindow = getFocusedWindow();
			if (focusedWindow) {
				minimizeWindow(focusedWindow.id);
			}
			return;
		}

		// ⌘Enter or Ctrl+Enter - Toggle maximize focused window
		if (modifier && event.key === 'Enter') {
			event.preventDefault();
			const focusedWindow = getFocusedWindow();
			if (focusedWindow) {
				updateWindow(focusedWindow.id, {
					...focusedWindow,
					maximized: !focusedWindow.maximized
				});
			}
			return;
		}

		// ⌘S or Ctrl+S - Save layout manually
		if (modifier && event.key === 's') {
			event.preventDefault();
			try {
				await saveLayout();
				addToast({
					type: 'success',
					message: 'Desktop layout saved successfully',
					duration: 3000
				});
			} catch (error) {
				addToast({
					type: 'error',
					message: 'Failed to save layout',
					duration: 5000
				});
			}
			return;
		}

		// ⌘R or Ctrl+R - Restore layout manually
		if (modifier && event.key === 'r') {
			event.preventDefault();
			try {
				const restored = await restoreLayout();
				if (restored) {
					addToast({
						type: 'success',
						message: 'Desktop layout restored successfully',
						duration: 3000
					});
				} else {
					addToast({
						type: 'warning',
						message: 'No saved layout found to restore',
						duration: 3000
					});
				}
			} catch (error) {
				addToast({
					type: 'error',
					message: 'Failed to restore layout',
					duration: 5000
				});
			}
			return;
		}

		// ⌘Shift+R or Ctrl+Shift+R - Clear saved layout
		if (modifier && event.shiftKey && event.key === 'R') {
			event.preventDefault();
			try {
				await clearLayout();
				addToast({
					type: 'info',
					message: 'Saved layout cleared',
					duration: 3000
				});
			} catch (error) {
				addToast({
					type: 'error',
					message: 'Failed to clear layout',
					duration: 5000
				});
			}
			return;
		}
	}

	// Add global event listener
	document.addEventListener('keydown', handleKeydown);

	// Return cleanup function
	return () => {
		document.removeEventListener('keydown', handleKeydown);
	};
}

/**
 * Check if an element should receive keyboard events
 * (e.g., input fields, textareas should not trigger shortcuts)
 */
export function shouldHandleKeyboard(target: EventTarget | null): boolean {
	if (!target || !(target instanceof HTMLElement)) return true;

	const tagName = target.tagName.toLowerCase();
	const isEditable = target.contentEditable === 'true';
	const isInput = ['input', 'textarea', 'select'].includes(tagName);

	return !isInput && !isEditable;
}

/**
 * Format keyboard shortcut for display
 */
export function formatShortcut(keys: string[]): string {
	const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
	const modifier = isMac ? '⌘' : 'Ctrl';

	return keys.map(key => {
		if (key === 'mod') return modifier;
		if (key === 'shift') return '⇧';
		if (key === 'alt') return isMac ? '⌥' : 'Alt';
		if (key === '`') return '`';
		return key.toUpperCase();
	}).join('');
}

/**
 * Get help text for all keyboard shortcuts
 */
export function getKeyboardShortcuts() {
	return [
		{ keys: ['mod', 'w'], description: 'Close focused window' },
		{ keys: ['mod', '`'], description: 'Cycle through windows' },
		{ keys: ['mod', 'shift', '`'], description: 'Cycle backwards through windows' },
		{ keys: ['mod', 'm'], description: 'Minimize focused window' },
		{ keys: ['mod', 'enter'], description: 'Toggle maximize focused window' },
		{ keys: ['escape'], description: 'Cancel operation or minimize window' },
		{ keys: ['mod', 's'], description: 'Save desktop layout' },
		{ keys: ['mod', 'r'], description: 'Restore desktop layout' },
		{ keys: ['mod', 'shift', 'r'], description: 'Clear saved layout' }
	].map(shortcut => ({
		...shortcut,
		formatted: formatShortcut(shortcut.keys)
	}));
}