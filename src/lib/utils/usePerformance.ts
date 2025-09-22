/**
 * Performance optimization utilities for smooth window management
 */

/**
 * Throttle function to limit function calls frequency
 */
export function throttle<T extends (...args: any[]) => void>(
	func: T,
	limit: number
): (...args: Parameters<T>) => void {
	let inThrottle: boolean;
	return function(this: any, ...args: Parameters<T>) {
		if (!inThrottle) {
			func.apply(this, args);
			inThrottle = true;
			setTimeout(() => inThrottle = false, limit);
		}
	};
}

/**
 * Debounce function to delay function execution until after delay
 */
export function debounce<T extends (...args: any[]) => void>(
	func: T,
	delay: number
): (...args: Parameters<T>) => void {
	let timeoutId: number;
	return function(this: any, ...args: Parameters<T>) {
		clearTimeout(timeoutId);
		timeoutId = setTimeout(() => func.apply(this, args), delay);
	};
}

/**
 * Request animation frame throttle for smooth animations
 */
export function rafThrottle<T extends (...args: any[]) => void>(
	func: T
): (...args: Parameters<T>) => void {
	let ticking = false;
	return function(this: any, ...args: Parameters<T>) {
		if (!ticking) {
			requestAnimationFrame(() => {
				func.apply(this, args);
				ticking = false;
			});
			ticking = true;
		}
	};
}

/**
 * Batch DOM updates to avoid layout thrashing
 */
export class DOMBatcher {
	private readQueue: (() => void)[] = [];
	private writeQueue: (() => void)[] = [];
	private scheduled = false;

	/**
	 * Schedule a DOM read operation
	 */
	read(fn: () => void): void {
		this.readQueue.push(fn);
		this.schedule();
	}

	/**
	 * Schedule a DOM write operation
	 */
	write(fn: () => void): void {
		this.writeQueue.push(fn);
		this.schedule();
	}

	private schedule(): void {
		if (!this.scheduled) {
			this.scheduled = true;
			requestAnimationFrame(() => this.flush());
		}
	}

	private flush(): void {
		// Process all reads first
		while (this.readQueue.length > 0) {
			const read = this.readQueue.shift();
			if (read) read();
		}

		// Then process all writes
		while (this.writeQueue.length > 0) {
			const write = this.writeQueue.shift();
			if (write) write();
		}

		this.scheduled = false;
	}
}

/**
 * Global DOM batcher instance
 */
export const domBatcher = new DOMBatcher();

/**
 * Transform-based positioning for better performance
 */
export function setTransform(element: HTMLElement, x: number, y: number): void {
	element.style.transform = `translate3d(${x}px, ${y}px, 0)`;
}

/**
 * Transform-based scaling for better performance
 */
export function setScale(element: HTMLElement, scale: number): void {
	element.style.transform = `scale3d(${scale}, ${scale}, 1)`;
}

/**
 * Combined transform for position and scale
 */
export function setTransformAndScale(
	element: HTMLElement,
	x: number,
	y: number,
	scale: number = 1
): void {
	element.style.transform = `translate3d(${x}px, ${y}px, 0) scale3d(${scale}, ${scale}, 1)`;
}

/**
 * Enable GPU acceleration for an element
 */
export function enableGPUAcceleration(element: HTMLElement): void {
	element.style.willChange = 'transform';
	element.style.backfaceVisibility = 'hidden';
	element.style.perspective = '1000px';
}

/**
 * Disable GPU acceleration to save resources
 */
export function disableGPUAcceleration(element: HTMLElement): void {
	element.style.willChange = 'auto';
	element.style.backfaceVisibility = '';
	element.style.perspective = '';
}

/**
 * Optimize element for dragging
 */
export function optimizeForDragging(element: HTMLElement): void {
	enableGPUAcceleration(element);
	element.style.pointerEvents = 'none'; // Disable pointer events for better performance
}

/**
 * Restore element after dragging
 */
export function restoreAfterDragging(element: HTMLElement): void {
	element.style.pointerEvents = '';
	disableGPUAcceleration(element);
}

/**
 * Performance monitoring utility
 */
export class PerformanceMonitor {
	private metrics: { [key: string]: number[] } = {};

	/**
	 * Start timing an operation
	 */
	start(label: string): () => void {
		const startTime = performance.now();
		return () => {
			const endTime = performance.now();
			const duration = endTime - startTime;

			if (!this.metrics[label]) {
				this.metrics[label] = [];
			}

			this.metrics[label].push(duration);

			// Keep only last 100 measurements
			if (this.metrics[label].length > 100) {
				this.metrics[label].shift();
			}
		};
	}

	/**
	 * Get average time for an operation
	 */
	getAverage(label: string): number {
		const times = this.metrics[label];
		if (!times || times.length === 0) return 0;

		return times.reduce((sum, time) => sum + time, 0) / times.length;
	}

	/**
	 * Get performance report
	 */
	getReport(): { [key: string]: { avg: number, count: number, max: number } } {
		const report: { [key: string]: { avg: number, count: number, max: number } } = {};

		for (const [label, times] of Object.entries(this.metrics)) {
			if (times.length > 0) {
				report[label] = {
					avg: times.reduce((sum, time) => sum + time, 0) / times.length,
					count: times.length,
					max: Math.max(...times)
				};
			}
		}

		return report;
	}

	/**
	 * Log performance report to console
	 */
	logReport(): void {
		console.table(this.getReport());
	}

	/**
	 * Clear all metrics
	 */
	clear(): void {
		this.metrics = {};
	}
}

/**
 * Global performance monitor instance
 */
export const perfMonitor = new PerformanceMonitor();

/**
 * Check if device prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
	return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Get optimal frame rate based on device capabilities
 */
export function getOptimalFrameRate(): number {
	// Try to detect refresh rate, fallback to 60fps
	const screen = window.screen as any;
	return screen.refreshRate || 60;
}

/**
 * Adaptive throttling based on performance
 */
export function getAdaptiveThrottleDelay(operationType: 'drag' | 'resize' | 'scroll'): number {
	const baseDelays = {
		drag: 16, // ~60fps
		resize: 16, // ~60fps
		scroll: 8 // ~120fps for smooth scrolling
	};

	// Increase delay if performance is poor
	const dragAvg = perfMonitor.getAverage('drag');
	const resizeAvg = perfMonitor.getAverage('resize');

	if (dragAvg > 16 || resizeAvg > 16) {
		// Performance is struggling, increase throttle
		return baseDelays[operationType] * 2;
	}

	if (prefersReducedMotion()) {
		// User prefers reduced motion, use longer delays
		return baseDelays[operationType] * 1.5;
	}

	return baseDelays[operationType];
}