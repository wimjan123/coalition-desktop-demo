export interface WindowData {
	id: string;
	title: string;
	appType?: string;
	x: number;
	y: number;
	width: number;
	height: number;
	zIndex: number;
	focused: boolean;
	minimized: boolean;
	maximized: boolean;
	resizable: boolean;
	draggable: boolean;
	minWidth?: number;
	minHeight?: number;
	maxWidth?: number;
	maxHeight?: number;
}

export interface WindowPosition {
	x: number;
	y: number;
}

export interface WindowSize {
	width: number;
	height: number;
}

export interface WindowBounds {
	x: number;
	y: number;
	width: number;
	height: number;
}

export type ResizeDirection = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';

export interface DragState {
	isDragging: boolean;
	startX: number;
	startY: number;
	startWindowX: number;
	startWindowY: number;
	windowId: string;
}

export interface ResizeState {
	isResizing: boolean;
	direction: ResizeDirection;
	startX: number;
	startY: number;
	startWidth: number;
	startHeight: number;
	startWindowX: number;
	startWindowY: number;
	windowId: string;
}