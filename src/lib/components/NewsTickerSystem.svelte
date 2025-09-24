<script lang="ts">
	import { onMount, onDestroy, createEventDispatcher } from 'svelte';
	import { tweened } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';

	// Props
	export let newsItems: NewsItem[] = [];
	export let breakingNews: BreakingNewsItem[] = [];
	export let tickerSpeed: number = 50; // pixels per second
	export let enabled: boolean = true;
	export let priority: 'low' | 'medium' | 'high' | 'breaking' = 'medium';
	export let style: 'classic' | 'modern' | 'minimal' | 'dramatic' = 'modern';
	export let position: 'top' | 'bottom' = 'bottom';
	export let height: number = 40;

	interface NewsItem {
		id: string;
		content: string;
		category: 'politics' | 'economy' | 'international' | 'breaking' | 'update';
		urgency: number; // 1-10
		timestamp: number;
		source?: string;
		relatedInterview?: boolean;
	}

	interface BreakingNewsItem extends NewsItem {
		alertType: 'flash' | 'urgent' | 'developing' | 'exclusive';
		displayDuration: number; // milliseconds
		flashColor: string;
		soundAlert: boolean;
	}

	interface TickerState {
		currentPosition: number;
		isScrolling: boolean;
		currentItem: number;
		breakingActive: boolean;
		flashActive: boolean;
	}

	const dispatch = createEventDispatcher();

	// State
	let tickerContainer: HTMLElement;
	let tickerContent: HTMLElement;
	let tickerState: TickerState = {
		currentPosition: 0,
		isScrolling: false,
		currentItem: 0,
		breakingActive: false,
		flashActive: false
	};

	// Animation stores
	const scrollPosition = tweened(0, { duration: 0, easing: cubicOut });
	const flashOpacity = tweened(0, { duration: 300, easing: cubicOut });
	const breakingScale = tweened(1, { duration: 200, easing: cubicOut });

	// Reactive variables
	$: displayItems = [...newsItems, ...breakingNews].sort((a, b) => {
		if (a.category === 'breaking' && b.category !== 'breaking') return -1;
		if (b.category === 'breaking' && a.category !== 'breaking') return 1;
		return b.urgency - a.urgency;
	});

	$: hasBreakingNews = breakingNews.length > 0;
	$: tickerHeight = height;
	$: containerClass = getContainerClass();
	$: contentClass = getContentClass();
	$: breakingNewsClass = getBreakingNewsClass();

	// Animation intervals
	let scrollInterval: number | null = null;
	let breakingInterval: number | null = null;
	let flashInterval: number | null = null;

	onMount(() => {
		if (enabled && displayItems.length > 0) {
			startTicker();
		}

		// Handle breaking news
		if (hasBreakingNews) {
			handleBreakingNews();
		}
	});

	onDestroy(() => {
		cleanup();
	});

	function startTicker(): void {
		if (!tickerContainer || !tickerContent || tickerState.isScrolling) return;

		tickerState.isScrolling = true;
		const containerWidth = tickerContainer.offsetWidth;
		const contentWidth = tickerContent.offsetWidth;

		if (contentWidth <= containerWidth) {
			// Content fits, no need to scroll
			tickerState.isScrolling = false;
			return;
		}

		// Calculate scroll duration based on content width and speed
		const scrollDistance = contentWidth + containerWidth;
		const duration = (scrollDistance / tickerSpeed) * 1000;

		// Start scrolling animation
		scrollPosition.set(-contentWidth, { duration });

		// Reset position when animation completes
		setTimeout(() => {
			scrollPosition.set(containerWidth, { duration: 0 });
			setTimeout(() => startTicker(), 50);
		}, duration);
	}

	function handleBreakingNews(): void {
		if (breakingNews.length === 0) return;

		const currentBreaking = breakingNews[0];
		tickerState.breakingActive = true;

		// Flash effect for breaking news
		startFlashEffect(currentBreaking);

		// Scale animation for emphasis
		breakingScale.set(1.05);
		setTimeout(() => breakingScale.set(1), 200);

		// Dispatch event
		dispatch('breaking-news-started', currentBreaking);

		// Auto-hide after display duration
		setTimeout(() => {
			tickerState.breakingActive = false;
			stopFlashEffect();
			dispatch('breaking-news-ended', currentBreaking);
		}, currentBreaking.displayDuration);
	}

	function startFlashEffect(breakingItem: BreakingNewsItem): void {
		if (!breakingItem.soundAlert) return;

		tickerState.flashActive = true;
		let flashCount = 0;
		const maxFlashes = breakingItem.alertType === 'flash' ? 6 : 3;

		flashInterval = setInterval(() => {
			flashOpacity.set(flashOpacity.get() > 0 ? 0 : 0.8);
			flashCount++;

			if (flashCount >= maxFlashes * 2) {
				stopFlashEffect();
			}
		}, 200);
	}

	function stopFlashEffect(): void {
		if (flashInterval) {
			clearInterval(flashInterval);
			flashInterval = null;
		}
		tickerState.flashActive = false;
		flashOpacity.set(0);
	}

	function cleanup(): void {
		if (scrollInterval) clearInterval(scrollInterval);
		if (breakingInterval) clearInterval(breakingInterval);
		if (flashInterval) clearInterval(flashInterval);
		tickerState.isScrolling = false;
	}

	function getContainerClass(): string {
		const baseClass = 'news-ticker-container';
		const classes = [baseClass, `${baseClass}--${style}`, `${baseClass}--${position}`];

		if (tickerState.breakingActive) classes.push(`${baseClass}--breaking`);
		if (priority === 'breaking') classes.push(`${baseClass}--priority-breaking`);

		return classes.join(' ');
	}

	function getContentClass(): string {
		return `news-ticker-content news-ticker-content--${style}`;
	}

	function getBreakingNewsClass(): string {
		const baseClass = 'breaking-news';
		const classes = [baseClass];

		if (tickerState.flashActive) classes.push(`${baseClass}--flashing`);
		if (hasBreakingNews) classes.push(`${baseClass}--active`);

		return classes.join(' ');
	}

	function getCategoryIcon(category: NewsItem['category']): string {
		const icons = {
			'politics': '🏛️',
			'economy': '📈',
			'international': '🌍',
			'breaking': '🚨',
			'update': '📢'
		};
		return icons[category] || '📰';
	}

	function getCategoryColor(category: NewsItem['category']): string {
		const colors = {
			'politics': '#3b82f6',
			'economy': '#10b981',
			'international': '#8b5cf6',
			'breaking': '#ef4444',
			'update': '#f59e0b'
		};
		return colors[category] || '#6b7280';
	}

	function getUrgencyIntensity(urgency: number): string {
		if (urgency >= 9) return 'critical';
		if (urgency >= 7) return 'high';
		if (urgency >= 5) return 'medium';
		return 'low';
	}

	function formatTimestamp(timestamp: number): string {
		const now = Date.now();
		const diff = now - timestamp;
		const minutes = Math.floor(diff / 60000);

		if (minutes < 1) return 'JUST NOW';
		if (minutes < 60) return `${minutes}m ago`;
		const hours = Math.floor(minutes / 60);
		if (hours < 24) return `${hours}h ago`;
		return new Date(timestamp).toLocaleDateString();
	}

	// Public methods
	export function addNewsItem(item: NewsItem): void {
		newsItems = [...newsItems, item];
		if (enabled && !tickerState.isScrolling) {
			startTicker();
		}
	}

	export function addBreakingNews(item: BreakingNewsItem): void {
		breakingNews = [...breakingNews, item];
		handleBreakingNews();
	}

	export function clearNews(): void {
		newsItems = [];
		breakingNews = [];
		cleanup();
	}

	export function pauseTicker(): void {
		cleanup();
	}

	export function resumeTicker(): void {
		if (enabled && displayItems.length > 0) {
			startTicker();
		}
	}

	// React to prop changes
	$: if (enabled && displayItems.length > 0 && !tickerState.isScrolling) {
		startTicker();
	}

	$: if (!enabled) {
		cleanup();
	}
</script>

{#if enabled && displayItems.length > 0}
	<div
		class={containerClass}
		style="height: {tickerHeight}px; {position}: 0;"
		bind:this={tickerContainer}
	>
		<!-- Flash overlay for breaking news -->
		{#if tickerState.flashActive}
			<div
				class="flash-overlay"
				style="opacity: {$flashOpacity}; background-color: {breakingNews[0]?.flashColor || '#ef4444'}"
			></div>
		{/if}

		<!-- Breaking news alert banner -->
		{#if hasBreakingNews && tickerState.breakingActive}
			<div class={breakingNewsClass} style="transform: scale({$breakingScale})">
				<div class="breaking-news-label">
					{#if breakingNews[0].alertType === 'flash'}
						<span class="flash-text">⚡ FLASH</span>
					{:else if breakingNews[0].alertType === 'urgent'}
						<span class="urgent-text">🚨 URGENT</span>
					{:else if breakingNews[0].alertType === 'developing'}
						<span class="developing-text">📈 DEVELOPING</span>
					{:else if breakingNews[0].alertType === 'exclusive'}
						<span class="exclusive-text">🎯 EXCLUSIVE</span>
					{/if}
				</div>
				<div class="breaking-news-content">
					{breakingNews[0].content}
				</div>
			</div>
		{/if}

		<!-- Main ticker content -->
		<div class="ticker-wrapper">
			<div
				class={contentClass}
				style="transform: translateX({$scrollPosition}px)"
				bind:this={tickerContent}
			>
				{#each displayItems as item, index (item.id)}
					<div
						class="ticker-item ticker-item--{item.category}"
						style="border-left-color: {getCategoryColor(item.category)}"
						data-urgency={getUrgencyIntensity(item.urgency)}
					>
						<span class="ticker-icon">
							{getCategoryIcon(item.category)}
						</span>
						<span class="ticker-text">
							{item.content}
						</span>
						{#if item.source}
							<span class="ticker-source">
								- {item.source}
							</span>
						{/if}
						<span class="ticker-time">
							{formatTimestamp(item.timestamp)}
						</span>
						{#if item.relatedInterview}
							<span class="ticker-indicator ticker-indicator--live">
								🔴 LIVE
							</span>
						{/if}
					</div>
					{#if index < displayItems.length - 1}
						<span class="ticker-separator">•</span>
					{/if}
				{/each}
			</div>
		</div>

		<!-- Ticker controls (optional) -->
		<div class="ticker-controls">
			<button
				class="ticker-control"
				on:click={pauseTicker}
				title="Pause Ticker"
			>
				⏸️
			</button>
			<button
				class="ticker-control"
				on:click={resumeTicker}
				title="Resume Ticker"
			>
				▶️
			</button>
		</div>
	</div>
{/if}

<style>
	.news-ticker-container {
		position: fixed;
		left: 0;
		right: 0;
		z-index: 1000;
		overflow: hidden;
		background: linear-gradient(90deg, #1f2937 0%, #374151 50%, #1f2937 100%);
		border-top: 2px solid #3b82f6;
		border-bottom: 1px solid #4b5563;
		box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.3);
		font-family: 'Helvetica Neue', Arial, sans-serif;
		user-select: none;
	}

	.news-ticker-container--top {
		top: 0;
		border-top: none;
		border-bottom: 2px solid #3b82f6;
		box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
	}

	.news-ticker-container--modern {
		background: linear-gradient(90deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
		border-color: #0ea5e9;
	}

	.news-ticker-container--dramatic {
		background: linear-gradient(90deg, #450a0a 0%, #7f1d1d 50%, #450a0a 100%);
		border-color: #ef4444;
		animation: dramatic-glow 3s ease-in-out infinite alternate;
	}

	.news-ticker-container--minimal {
		background: rgba(0, 0, 0, 0.8);
		border: 1px solid rgba(255, 255, 255, 0.2);
	}

	.news-ticker-container--breaking {
		animation: breaking-alert 1s ease-in-out infinite alternate;
	}

	.news-ticker-container--priority-breaking {
		z-index: 1100;
		border-color: #dc2626;
		box-shadow: 0 0 20px rgba(220, 38, 38, 0.5);
	}

	.flash-overlay {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		pointer-events: none;
		z-index: 1;
	}

	.breaking-news {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		display: flex;
		align-items: center;
		z-index: 5;
		background: linear-gradient(90deg, #dc2626 0%, #ef4444 50%, #dc2626 100%);
		color: white;
		font-weight: bold;
		padding: 0 1rem;
	}

	.breaking-news--flashing {
		animation: breaking-flash 0.5s ease-in-out infinite alternate;
	}

	.breaking-news-label {
		flex-shrink: 0;
		background: rgba(0, 0, 0, 0.3);
		padding: 0.25rem 0.5rem;
		border-radius: 0.25rem;
		margin-right: 1rem;
		font-size: 0.75rem;
		letter-spacing: 0.1em;
		text-transform: uppercase;
	}

	.flash-text {
		color: #fef08a;
		animation: flash-pulse 0.3s ease-in-out infinite alternate;
	}

	.urgent-text {
		color: #fecaca;
	}

	.developing-text {
		color: #a7f3d0;
	}

	.exclusive-text {
		color: #ddd6fe;
	}

	.breaking-news-content {
		flex: 1;
		font-size: 0.875rem;
		line-height: 1.2;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.ticker-wrapper {
		position: relative;
		height: 100%;
		overflow: hidden;
	}

	.news-ticker-content {
		display: flex;
		align-items: center;
		height: 100%;
		white-space: nowrap;
		padding: 0 2rem;
	}

	.news-ticker-content--modern {
		font-size: 0.875rem;
		letter-spacing: 0.025em;
	}

	.news-ticker-content--dramatic {
		font-size: 0.9rem;
		font-weight: 600;
		text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
	}

	.news-ticker-content--minimal {
		font-size: 0.8rem;
		font-weight: 400;
	}

	.ticker-item {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		color: #f3f4f6;
		border-left: 3px solid transparent;
		padding-left: 0.75rem;
		margin-right: 1.5rem;
	}

	.ticker-item--breaking {
		color: #fecaca;
		font-weight: 700;
		animation: breaking-item-pulse 2s ease-in-out infinite;
	}

	.ticker-item--politics {
		border-left-color: #3b82f6;
	}

	.ticker-item--economy {
		border-left-color: #10b981;
	}

	.ticker-item--international {
		border-left-color: #8b5cf6;
	}

	.ticker-item--update {
		border-left-color: #f59e0b;
	}

	.ticker-item[data-urgency="critical"] {
		animation: critical-urgency 1s ease-in-out infinite alternate;
	}

	.ticker-item[data-urgency="high"] {
		font-weight: 600;
		color: #fbbf24;
	}

	.ticker-icon {
		flex-shrink: 0;
		font-size: 0.875rem;
	}

	.ticker-text {
		flex: 1;
		font-size: 0.875rem;
		line-height: 1.2;
	}

	.ticker-source {
		font-size: 0.75rem;
		color: #9ca3af;
		font-style: italic;
		margin-left: 0.25rem;
	}

	.ticker-time {
		font-size: 0.7rem;
		color: #6b7280;
		font-family: monospace;
		margin-left: 0.5rem;
		flex-shrink: 0;
	}

	.ticker-indicator {
		font-size: 0.7rem;
		padding: 0.125rem 0.375rem;
		border-radius: 0.375rem;
		font-weight: 600;
		margin-left: 0.5rem;
	}

	.ticker-indicator--live {
		background: #dc2626;
		color: white;
		animation: live-pulse 1.5s ease-in-out infinite;
	}

	.ticker-separator {
		color: #6b7280;
		margin: 0 1rem;
		font-size: 1rem;
	}

	.ticker-controls {
		position: absolute;
		right: 0.5rem;
		top: 50%;
		transform: translateY(-50%);
		display: flex;
		gap: 0.25rem;
		z-index: 10;
	}

	.ticker-control {
		background: rgba(0, 0, 0, 0.5);
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 0.25rem;
		padding: 0.25rem;
		color: white;
		cursor: pointer;
		font-size: 0.7rem;
		transition: all 0.2s ease;
	}

	.ticker-control:hover {
		background: rgba(0, 0, 0, 0.7);
		border-color: rgba(255, 255, 255, 0.4);
	}

	/* Animations */
	@keyframes dramatic-glow {
		0% {
			box-shadow: 0 0 10px rgba(239, 68, 68, 0.3);
		}
		100% {
			box-shadow: 0 0 20px rgba(239, 68, 68, 0.6), 0 0 30px rgba(220, 38, 38, 0.2);
		}
	}

	@keyframes breaking-alert {
		0% {
			border-color: #dc2626;
		}
		100% {
			border-color: #fca5a5;
		}
	}

	@keyframes breaking-flash {
		0% {
			background: linear-gradient(90deg, #dc2626 0%, #ef4444 50%, #dc2626 100%);
		}
		100% {
			background: linear-gradient(90deg, #ef4444 0%, #fca5a5 50%, #ef4444 100%);
		}
	}

	@keyframes flash-pulse {
		0% {
			color: #fef08a;
			text-shadow: 0 0 5px #fbbf24;
		}
		100% {
			color: #ffffff;
			text-shadow: 0 0 10px #fbbf24, 0 0 20px #f59e0b;
		}
	}

	@keyframes breaking-item-pulse {
		0% {
			color: #fecaca;
		}
		50% {
			color: #ffffff;
			text-shadow: 0 0 5px #dc2626;
		}
		100% {
			color: #fecaca;
		}
	}

	@keyframes critical-urgency {
		0% {
			color: #f3f4f6;
		}
		100% {
			color: #fbbf24;
			text-shadow: 0 0 3px #f59e0b;
		}
	}

	@keyframes live-pulse {
		0%, 100% {
			opacity: 1;
			transform: scale(1);
		}
		50% {
			opacity: 0.8;
			transform: scale(1.05);
		}
	}

	/* Responsive design */
	@media (max-width: 768px) {
		.news-ticker-container {
			height: 35px;
		}

		.ticker-item {
			gap: 0.25rem;
			margin-right: 1rem;
		}

		.ticker-text {
			font-size: 0.8rem;
		}

		.ticker-source {
			display: none;
		}

		.ticker-controls {
			display: none;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.news-ticker-container,
		.breaking-news,
		.ticker-item,
		.ticker-indicator {
			animation: none !important;
		}
	}
</style>