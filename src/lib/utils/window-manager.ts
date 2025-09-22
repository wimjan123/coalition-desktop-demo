import { addWindow, addToast } from '../stores/stores.js';
import type { WindowData } from '../types/window.js';

export function createWindow(options: Partial<WindowData> & { title: string }) {
	const defaultWindow: Omit<WindowData, 'id' | 'zIndex' | 'focused'> = {
		title: options.title,
		appType: options.appType,
		x: options.x ?? 100,
		y: options.y ?? 100,
		width: options.width ?? 600,
		height: options.height ?? 400,
		minimized: false,
		maximized: false,
		resizable: options.resizable ?? true,
		draggable: options.draggable ?? true,
		minWidth: options.minWidth ?? 300,
		minHeight: options.minHeight ?? 200,
		maxWidth: options.maxWidth,
		maxHeight: options.maxHeight
	};

	addWindow(defaultWindow);

	// Show a toast notification
	addToast({
		type: 'info',
		message: `${options.title} launched`,
		duration: 2000
	});
}