// Dynamic imports for Tauri APIs to handle web/native environments
async function getTauriAPIs() {
	// Check if we're in a browser environment first
	if (typeof window === 'undefined') {
		console.log('Tauri APIs not available, persistence features disabled (SSR)');
		return null;
	}

	// Check if Tauri is available
	if (!(window as any).__TAURI__) {
		console.log('Tauri APIs not available, persistence features disabled (web mode)');
		return null;
	}

	try {
		// Use dynamic import only when we know Tauri is available
		const [fs, path] = await Promise.all([
			(window as any).__TAURI__.fs || import('@tauri-apps/api/fs'),
			(window as any).__TAURI__.path || import('@tauri-apps/api/path')
		]);

		return {
			writeTextFile: fs.writeTextFile || fs.default?.writeTextFile,
			readTextFile: fs.readTextFile || fs.default?.readTextFile,
			exists: fs.exists || fs.default?.exists,
			createDir: fs.createDir || fs.default?.createDir,
			appDataDir: path.appDataDir || path.default?.appDataDir
		};
	} catch (error) {
		console.log('Tauri APIs not available, persistence features disabled');
		return null;
	}
}
import { get } from 'svelte/store';
import { windowsStore, desktopStore } from '../stores/stores.js';
import type { WindowData } from '../types/window.js';

/**
 * Desktop layout state for persistence
 */
export interface DesktopLayout {
	version: string;
	timestamp: number;
	windows: WindowData[];
	desktop: {
		focusedWindowId: string | null;
		nextZIndex: number;
	};
}

const LAYOUT_VERSION = '1.0.0';
const LAYOUT_FILENAME = 'desktop-layout.json';

/**
 * Get the full path to the layout file
 */
async function getLayoutPath(): Promise<string | null> {
	const apis = await getTauriAPIs();
	if (!apis) return null;

	const appData = await apis.appDataDir();
	return `${appData}coalition-desktop/${LAYOUT_FILENAME}`;
}

/**
 * Ensure the app data directory exists
 */
async function ensureAppDataDir(): Promise<boolean> {
	const apis = await getTauriAPIs();
	if (!apis) return false;

	const appData = await apis.appDataDir();
	const appDir = `${appData}coalition-desktop`;

	if (!(await apis.exists(appDir))) {
		await apis.createDir(appDir, { recursive: true });
	}
	return true;
}

/**
 * Save current desktop layout to disk
 */
export async function saveLayout(): Promise<void> {
	try {
		const apis = await getTauriAPIs();
		if (!apis) {
			console.log('Persistence not available in web mode');
			return;
		}

		const dirCreated = await ensureAppDataDir();
		if (!dirCreated) {
			throw new Error('Failed to create app data directory');
		}

		const windows = get(windowsStore);
		const desktop = get(desktopStore);

		const layout: DesktopLayout = {
			version: LAYOUT_VERSION,
			timestamp: Date.now(),
			windows: windows.map(window => ({
				...window,
				// Don't save focused state as it will be recalculated
				focused: false
			})),
			desktop: {
				focusedWindowId: desktop.focusedWindowId,
				nextZIndex: desktop.nextZIndex
			}
		};

		const layoutPath = await getLayoutPath();
		if (!layoutPath) {
			throw new Error('Failed to get layout path');
		}

		await apis.writeTextFile(layoutPath, JSON.stringify(layout, null, 2));

		console.log('Desktop layout saved successfully');
	} catch (error) {
		console.error('Failed to save desktop layout:', error);
		throw error;
	}
}

/**
 * Load desktop layout from disk
 */
export async function loadLayout(): Promise<DesktopLayout | null> {
	try {
		const apis = await getTauriAPIs();
		if (!apis) {
			console.log('Persistence not available in web mode');
			return null;
		}

		const layoutPath = await getLayoutPath();
		if (!layoutPath) return null;

		if (!(await apis.exists(layoutPath))) {
			console.log('No saved layout found');
			return null;
		}

		const content = await apis.readTextFile(layoutPath);
		const layout: DesktopLayout = JSON.parse(content);

		// Validate layout version
		if (layout.version !== LAYOUT_VERSION) {
			console.warn(`Layout version mismatch. Expected ${LAYOUT_VERSION}, got ${layout.version}`);
			return null;
		}

		console.log('Desktop layout loaded successfully');
		return layout;
	} catch (error) {
		console.error('Failed to load desktop layout:', error);
		return null;
	}
}

/**
 * Restore desktop layout to stores
 */
export async function restoreLayout(): Promise<boolean> {
	try {
		const layout = await loadLayout();
		if (!layout) {
			return false;
		}

		// Import store functions
		const { windowsStore: windowsStoreInstance, desktopStore: desktopStoreInstance } = await import('../stores/stores.js');

		// Restore windows
		windowsStoreInstance.set(layout.windows);

		// Restore desktop state
		desktopStoreInstance.update(state => ({
			...state,
			focusedWindowId: layout.desktop.focusedWindowId,
			nextZIndex: layout.desktop.nextZIndex
		}));

		// Re-focus the previously focused window
		if (layout.desktop.focusedWindowId) {
			const { focusWindow } = await import('../stores/stores.js');
			focusWindow(layout.desktop.focusedWindowId);
		}

		console.log(`Restored layout with ${layout.windows.length} windows`);
		return true;
	} catch (error) {
		console.error('Failed to restore desktop layout:', error);
		return false;
	}
}

/**
 * Auto-save layout at regular intervals
 */
export function setupAutoSave(intervalMs: number = 30000): () => void {
	const interval = setInterval(async () => {
		try {
			await saveLayout();
		} catch (error) {
			console.error('Auto-save failed:', error);
		}
	}, intervalMs);

	// Return cleanup function
	return () => clearInterval(interval);
}

/**
 * Clear saved layout
 */
export async function clearLayout(): Promise<void> {
	try {
		const apis = await getTauriAPIs();
		if (!apis) {
			console.log('Persistence not available in web mode');
			return;
		}

		const layoutPath = await getLayoutPath();
		if (!layoutPath) {
			throw new Error('Failed to get layout path');
		}

		if (await apis.exists(layoutPath)) {
			// For now, we'll just rename it with a timestamp
			// Tauri doesn't have a direct delete file API exposed in some versions
			const timestamp = Date.now();
			const backupPath = layoutPath.replace('.json', `.backup-${timestamp}.json`);

			// Read and write to backup location, then clear original
			const content = await apis.readTextFile(layoutPath);
			await apis.writeTextFile(backupPath, content);
			await apis.writeTextFile(layoutPath, '{}');

			console.log('Layout cleared and backed up');
		}
	} catch (error) {
		console.error('Failed to clear layout:', error);
		throw error;
	}
}

/**
 * Export layout as JSON string for sharing/backup
 */
export async function exportLayout(): Promise<string | null> {
	try {
		const layout = await loadLayout();
		return layout ? JSON.stringify(layout, null, 2) : null;
	} catch (error) {
		console.error('Failed to export layout:', error);
		return null;
	}
}

/**
 * Import layout from JSON string
 */
export async function importLayout(jsonData: string): Promise<boolean> {
	try {
		const layout: DesktopLayout = JSON.parse(jsonData);

		// Validate structure
		if (!layout.version || !layout.windows || !Array.isArray(layout.windows)) {
			throw new Error('Invalid layout format');
		}

		// Save the imported layout
		const apis = await getTauriAPIs();
		if (!apis) {
			throw new Error('Persistence not available in web mode');
		}

		await ensureAppDataDir();
		const layoutPath = await getLayoutPath();
		if (!layoutPath) {
			throw new Error('Failed to get layout path');
		}

		await apis.writeTextFile(layoutPath, JSON.stringify(layout, null, 2));

		// Restore the imported layout
		return await restoreLayout();
	} catch (error) {
		console.error('Failed to import layout:', error);
		return false;
	}
}