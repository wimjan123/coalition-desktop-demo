import type { WindowBounds, WindowPosition, WindowSize } from '../types/window.js';

export interface SnapZone {
	type: 'edge' | 'quarter' | 'half';
	name: string;
	bounds: WindowBounds;
}

const SNAP_THRESHOLD = 20; // pixels
const DOCK_HEIGHT = 80; // Reserve space for dock

/**
 * Get available snap zones for the current viewport
 */
export function getSnapZones(): SnapZone[] {
	const width = window.innerWidth;
	const height = window.innerHeight - DOCK_HEIGHT;

	return [
		// Edges
		{
			type: 'edge',
			name: 'left',
			bounds: { x: 0, y: 0, width: width / 2, height }
		},
		{
			type: 'edge',
			name: 'right',
			bounds: { x: width / 2, y: 0, width: width / 2, height }
		},
		{
			type: 'edge',
			name: 'top',
			bounds: { x: 0, y: 0, width, height: height / 2 }
		},
		{
			type: 'edge',
			name: 'bottom',
			bounds: { x: 0, y: height / 2, width, height: height / 2 }
		},

		// Halves
		{
			type: 'half',
			name: 'left-half',
			bounds: { x: 0, y: 0, width: width / 2, height }
		},
		{
			type: 'half',
			name: 'right-half',
			bounds: { x: width / 2, y: 0, width: width / 2, height }
		},
		{
			type: 'half',
			name: 'top-half',
			bounds: { x: 0, y: 0, width, height: height / 2 }
		},
		{
			type: 'half',
			name: 'bottom-half',
			bounds: { x: 0, y: height / 2, width, height: height / 2 }
		},

		// Quarters
		{
			type: 'quarter',
			name: 'top-left',
			bounds: { x: 0, y: 0, width: width / 2, height: height / 2 }
		},
		{
			type: 'quarter',
			name: 'top-right',
			bounds: { x: width / 2, y: 0, width: width / 2, height: height / 2 }
		},
		{
			type: 'quarter',
			name: 'bottom-left',
			bounds: { x: 0, y: height / 2, width: width / 2, height: height / 2 }
		},
		{
			type: 'quarter',
			name: 'bottom-right',
			bounds: { x: width / 2, y: height / 2, width: width / 2, height: height / 2 }
		}
	];
}

/**
 * Check if a position is near a snap zone
 */
export function findSnapZone(position: WindowPosition, windowSize: WindowSize): SnapZone | null {
	const zones = getSnapZones();
	const windowCenter = {
		x: position.x + windowSize.width / 2,
		y: position.y + windowSize.height / 2
	};

	// Check screen edges first (highest priority)
	const edges = [
		{ name: 'left', x: 0 },
		{ name: 'right', x: window.innerWidth },
		{ name: 'top', y: 0 },
		{ name: 'bottom', y: window.innerHeight - DOCK_HEIGHT }
	];

	for (const edge of edges) {
		if ('x' in edge) {
			// Vertical edge
			if (Math.abs(position.x - edge.x) < SNAP_THRESHOLD ||
				Math.abs(position.x + windowSize.width - edge.x) < SNAP_THRESHOLD) {
				return zones.find(z => z.name.includes(edge.name)) || null;
			}
		} else {
			// Horizontal edge
			if (Math.abs(position.y - edge.y) < SNAP_THRESHOLD ||
				Math.abs(position.y + windowSize.height - edge.y) < SNAP_THRESHOLD) {
				return zones.find(z => z.name.includes(edge.name)) || null;
			}
		}
	}

	// Check corner zones (quarters)
	const corners = [
		{ name: 'top-left', x: 0, y: 0 },
		{ name: 'top-right', x: window.innerWidth, y: 0 },
		{ name: 'bottom-left', x: 0, y: window.innerHeight - DOCK_HEIGHT },
		{ name: 'bottom-right', x: window.innerWidth, y: window.innerHeight - DOCK_HEIGHT }
	];

	for (const corner of corners) {
		const distance = Math.sqrt(
			Math.pow(windowCenter.x - corner.x, 2) +
			Math.pow(windowCenter.y - corner.y, 2)
		);

		if (distance < SNAP_THRESHOLD * 2) {
			return zones.find(z => z.name === corner.name) || null;
		}
	}

	return null;
}

/**
 * Snap a window to a specific zone
 */
export function snapToZone(zone: SnapZone): WindowBounds {
	return {
		x: zone.bounds.x,
		y: zone.bounds.y,
		width: zone.bounds.width,
		height: zone.bounds.height
	};
}

/**
 * Get snap preview bounds for visual feedback
 */
export function getSnapPreview(position: WindowPosition, windowSize: WindowSize): WindowBounds | null {
	const zone = findSnapZone(position, windowSize);
	return zone ? snapToZone(zone) : null;
}

/**
 * Smart positioning that avoids overlap with existing windows
 */
export function findBestPosition(
	windowSize: WindowSize,
	existingWindows: WindowBounds[]
): WindowPosition {
	const margin = 20;
	const cascade = 30;

	// Try cascade positioning first
	for (let i = 0; i < 10; i++) {
		const position: WindowPosition = {
			x: margin + (i * cascade),
			y: margin + (i * cascade)
		};

		const bounds: WindowBounds = {
			...position,
			...windowSize
		};

		// Check if this position overlaps with existing windows
		const overlaps = existingWindows.some(existing =>
			boundsOverlap(bounds, existing)
		);

		if (!overlaps) {
			return position;
		}
	}

	// Fall back to center if cascade doesn't work
	return {
		x: (window.innerWidth - windowSize.width) / 2,
		y: (window.innerHeight - DOCK_HEIGHT - windowSize.height) / 2
	};
}

/**
 * Check if two window bounds overlap
 */
function boundsOverlap(bounds1: WindowBounds, bounds2: WindowBounds): boolean {
	return !(
		bounds1.x + bounds1.width < bounds2.x ||
		bounds2.x + bounds2.width < bounds1.x ||
		bounds1.y + bounds1.height < bounds2.y ||
		bounds2.y + bounds2.height < bounds1.y
	);
}

/**
 * Constrain window bounds to viewport
 */
export function constrainToViewport(bounds: WindowBounds, minSize?: WindowSize): WindowBounds {
	const viewportWidth = window.innerWidth;
	const viewportHeight = window.innerHeight - DOCK_HEIGHT;

	const minWidth = minSize?.width ?? 300;
	const minHeight = minSize?.height ?? 200;

	return {
		x: Math.max(0, Math.min(bounds.x, viewportWidth - minWidth)),
		y: Math.max(0, Math.min(bounds.y, viewportHeight - minHeight)),
		width: Math.max(minWidth, Math.min(bounds.width, viewportWidth)),
		height: Math.max(minHeight, Math.min(bounds.height, viewportHeight))
	};
}