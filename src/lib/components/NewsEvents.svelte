<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { gameStore } from '../stores/gameStore.js';
	import type { ActiveNewsEvent, NewsResponse, ResponseType } from '../types/news.js';

	export let activeEvent: ActiveNewsEvent;

	const dispatch = createEventDispatcher();

	$: player = $gameStore?.player;
	$: currentDay = $gameStore?.currentDay || 1;
	$: campaignBudget = $gameStore?.campaignBudget || 0;

	// Calculate time remaining
	$: timeRemaining = Math.max(0, activeEvent.event.expiresAfterDays - (currentDay - activeEvent.triggeredOn));
	$: isUrgent = timeRemaining <= 1 || activeEvent.event.urgency === 'crisis';

	function getUrgencyColor(urgency: string): string {
		switch (urgency) {
			case 'crisis': return '#dc2626';
			case 'high': return '#ea580c';
			case 'medium': return '#d97706';
			default: return '#6b7280';
		}
	}

	function getResponseIcon(type: ResponseType): string {
		switch (type) {
			case 'talkshow': return '📺';
			case 'tweet': return '🐦';
			case 'interview': return '🎤';
			case 'press-conference': return '📰';
			case 'statement': return '📋';
			case 'ignore': return '🤐';
			case 'private-meeting': return '🤝';
			case 'policy-proposal': return '📜';
			default: return '💬';
		}
	}

	function getResponseTypeLabel(type: ResponseType): string {
		switch (type) {
			case 'talkshow': return 'Talk Show Appearance';
			case 'tweet': return 'Social Media Response';
			case 'interview': return 'Media Interview';
			case 'press-conference': return 'Press Conference';
			case 'statement': return 'Official Statement';
			case 'ignore': return 'No Response';
			case 'private-meeting': return 'Private Meeting';
			case 'policy-proposal': return 'Policy Proposal';
			default: return type.charAt(0).toUpperCase() + type.slice(1);
		}
	}

	function getToneColor(tone: string): string {
		switch (tone) {
			case 'aggressive': return '#dc2626';
			case 'defensive': return '#ea580c';
			case 'empathetic': return '#059669';
			case 'dismissive': return '#6b7280';
			case 'analytical': return '#2563eb';
			default: return '#374151';
		}
	}

	function canUseResponse(response: NewsResponse): boolean {
		// Check trait requirements
		if (response.requiredTraits) {
			const hasRequiredTraits = response.requiredTraits.every(trait =>
				player?.traits?.includes(trait) || false
			);
			if (!hasRequiredTraits) return false;
		}

		// Check stat requirements
		if (response.requiredStats) {
			for (const [stat, required] of Object.entries(response.requiredStats)) {
				const playerStat = (player as any)?.[stat] || 0;
				if (playerStat < required) return false;
			}
		}

		// Check budget
		if (response.cost && campaignBudget < response.cost) return false;

		return true;
	}

	function getPollingImpactColor(impact: number): string {
		if (impact > 5) return '#22c55e';
		if (impact > 0) return '#84cc16';
		if (impact === 0) return '#6b7280';
		if (impact > -5) return '#f59e0b';
		return '#ef4444';
	}

	function respondToEvent(response: NewsResponse) {
		dispatch('respond', {
			eventId: activeEvent.event.id,
			responseId: response.id,
			response
		});
	}

	function closeEvent() {
		dispatch('close');
	}
</script>

<div class="news-event-overlay">
	<div class="news-event-window">
		<!-- Header -->
		<div class="event-header" style="background: linear-gradient(135deg, {getUrgencyColor(activeEvent.event.urgency)} 0%, {getUrgencyColor(activeEvent.event.urgency)}CC 100%)">
			<div class="event-meta">
				<div class="urgency-badge" class:urgent={isUrgent}>
					{activeEvent.event.urgency.toUpperCase()}
				</div>
				<div class="time-remaining">
					{timeRemaining} day{timeRemaining !== 1 ? 's' : ''} to respond
				</div>
			</div>
			<button class="close-btn" on:click={closeEvent}>×</button>
		</div>

		<!-- Event Content -->
		<div class="event-content">
			<!-- News Story -->
			<div class="news-story">
				<div class="story-header">
					<h1 class="headline">{activeEvent.event.headline}</h1>
					<div class="story-meta">
						<span class="category">{activeEvent.event.category}</span>
						<span class="media-attention">📺 {activeEvent.event.mediaAttention}% coverage</span>
						{#if activeEvent.event.socialMediaViral}
							<span class="viral-badge">🔥 Viral</span>
						{/if}
					</div>
				</div>
				<div class="story-content">
					<p>{activeEvent.event.description}</p>
				</div>
			</div>

			<!-- Response Options -->
			<div class="response-options">
				<h2>🎯 Your Response Options</h2>
				<div class="responses-grid">
					{#each activeEvent.event.availableResponses as response}
						{@const isAvailable = canUseResponse(response)}
						<div class="response-card" class:disabled={!isAvailable}>
							<div class="response-header">
								<div class="response-type">
									<span class="response-icon">{getResponseIcon(response.type)}</span>
									<span class="response-label">{getResponseTypeLabel(response.type)}</span>
								</div>
								<div class="response-tone" style="color: {getToneColor(response.tone)}">
									{response.tone}
								</div>
							</div>

							<div class="response-content">
								<h3>{response.title}</h3>
								<p>{response.description}</p>
							</div>

							<!-- Requirements -->
							{#if response.requiredTraits || response.requiredStats || response.cost}
								<div class="response-requirements">
									{#if response.requiredTraits}
										<div class="requirement">
											<span class="req-label">Traits:</span>
											<span class="req-value">{response.requiredTraits.join(', ')}</span>
										</div>
									{/if}
									{#if response.requiredStats}
										<div class="requirement">
											<span class="req-label">Stats:</span>
											<span class="req-value">
												{Object.entries(response.requiredStats).map(([stat, val]) => `${stat} ${val}+`).join(', ')}
											</span>
										</div>
									{/if}
									{#if response.cost}
										<div class="requirement">
											<span class="req-label">Cost:</span>
											<span class="req-value">€{response.cost.toLocaleString()}</span>
										</div>
									{/if}
									<div class="requirement">
										<span class="req-label">Time:</span>
										<span class="req-value">{response.timeRequired}h</span>
									</div>
								</div>
							{/if}

							<!-- Impact Preview -->
							<div class="impact-preview">
								<div class="impact-header">Expected Impact:</div>
								<div class="impact-stats">
									{#if response.pollingImpact}
										{#each Object.entries(response.pollingImpact) as [group, impact]}
											<div class="impact-item">
												<span class="impact-group">{group}:</span>
												<span class="impact-value" style="color: {getPollingImpactColor(impact)}">
													{impact > 0 ? '+' : ''}{impact}%
												</span>
											</div>
										{/each}
									{/if}
									{#if response.trustImpact !== 0}
										<div class="impact-item">
											<span class="impact-group">Trust:</span>
											<span class="impact-value" style="color: {getPollingImpactColor(response.trustImpact)}">
												{response.trustImpact > 0 ? '+' : ''}{response.trustImpact}%
											</span>
										</div>
									{/if}
								</div>
								{#if response.backfireChance > 0}
									<div class="risk-warning">
										⚠️ {response.backfireChance}% chance of backfire
									</div>
								{/if}
							</div>

							<!-- Action Button -->
							<button
								class="response-action"
								class:primary={response.type !== 'ignore'}
								disabled={!isAvailable}
								on:click={() => respondToEvent(response)}
							>
								{isAvailable ? 'Choose This Response' : 'Requirements Not Met'}
							</button>
						</div>
					{/each}
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	.news-event-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.85);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 2500;
		padding: 20px;
		animation: fadeIn 0.3s ease;
	}

	@keyframes fadeIn {
		from { opacity: 0; }
		to { opacity: 1; }
	}

	.news-event-window {
		background: white;
		border-radius: 16px;
		max-width: 1000px;
		width: 100%;
		max-height: 90vh;
		overflow: hidden;
		box-shadow: 0 25px 80px rgba(0, 0, 0, 0.4);
		animation: slideUp 0.3s ease;
	}

	@keyframes slideUp {
		from { transform: translateY(20px); opacity: 0; }
		to { transform: translateY(0); opacity: 1; }
	}

	.event-header {
		color: white;
		padding: 20px 30px;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.event-meta {
		display: flex;
		gap: 20px;
		align-items: center;
	}

	.urgency-badge {
		background: rgba(255, 255, 255, 0.2);
		padding: 6px 12px;
		border-radius: 20px;
		font-size: 12px;
		font-weight: bold;
		letter-spacing: 0.5px;
	}

	.urgency-badge.urgent {
		background: rgba(255, 255, 255, 0.3);
		animation: pulse 2s infinite;
	}

	@keyframes pulse {
		0%, 100% { opacity: 1; }
		50% { opacity: 0.7; }
	}

	.time-remaining {
		font-size: 14px;
		opacity: 0.9;
	}

	.close-btn {
		background: rgba(255, 255, 255, 0.2);
		border: none;
		color: white;
		width: 32px;
		height: 32px;
		border-radius: 50%;
		font-size: 20px;
		cursor: pointer;
		transition: background 0.2s;
	}

	.close-btn:hover {
		background: rgba(255, 255, 255, 0.3);
	}

	.event-content {
		padding: 30px;
		overflow-y: auto;
		max-height: calc(90vh - 120px);
	}

	.news-story {
		background: #f8fafc;
		border-radius: 12px;
		padding: 24px;
		margin-bottom: 30px;
		border-left: 4px solid #3b82f6;
	}

	.story-header {
		margin-bottom: 16px;
	}

	.headline {
		margin: 0 0 12px 0;
		font-size: 24px;
		font-weight: bold;
		color: #1f2937;
		line-height: 1.3;
	}

	.story-meta {
		display: flex;
		gap: 16px;
		align-items: center;
	}

	.category {
		background: #3b82f6;
		color: white;
		padding: 4px 12px;
		border-radius: 16px;
		font-size: 12px;
		font-weight: 600;
		text-transform: uppercase;
	}

	.media-attention {
		font-size: 14px;
		color: #6b7280;
		font-weight: 500;
	}

	.viral-badge {
		background: #ef4444;
		color: white;
		padding: 4px 10px;
		border-radius: 12px;
		font-size: 12px;
		font-weight: 600;
	}

	.story-content p {
		margin: 0;
		color: #374151;
		line-height: 1.6;
		font-size: 16px;
	}

	.response-options h2 {
		color: #1f2937;
		margin-bottom: 20px;
		font-size: 20px;
	}

	.responses-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 20px;
	}

	.response-card {
		background: white;
		border: 2px solid #e5e7eb;
		border-radius: 12px;
		padding: 20px;
		transition: all 0.2s ease;
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.response-card:not(.disabled):hover {
		border-color: #3b82f6;
		box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1);
	}

	.response-card.disabled {
		opacity: 0.6;
		background: #f9fafb;
	}

	.response-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.response-type {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.response-icon {
		font-size: 18px;
	}

	.response-label {
		font-weight: 600;
		color: #1f2937;
	}

	.response-tone {
		font-size: 12px;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.response-content h3 {
		margin: 0 0 8px 0;
		color: #1f2937;
		font-size: 16px;
	}

	.response-content p {
		margin: 0;
		color: #6b7280;
		font-size: 14px;
		line-height: 1.5;
	}

	.response-requirements {
		background: #f9fafb;
		padding: 12px;
		border-radius: 6px;
		font-size: 12px;
	}

	.requirement {
		display: flex;
		justify-content: space-between;
		margin-bottom: 4px;
	}

	.requirement:last-child {
		margin-bottom: 0;
	}

	.req-label {
		color: #6b7280;
		font-weight: 500;
	}

	.req-value {
		color: #1f2937;
		font-weight: 600;
	}

	.impact-preview {
		background: #eff6ff;
		padding: 12px;
		border-radius: 6px;
		border: 1px solid #dbeafe;
	}

	.impact-header {
		font-size: 12px;
		font-weight: 600;
		color: #1e40af;
		margin-bottom: 8px;
	}

	.impact-stats {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
		gap: 8px;
	}

	.impact-item {
		display: flex;
		justify-content: space-between;
		font-size: 12px;
	}

	.impact-group {
		color: #6b7280;
		font-weight: 500;
	}

	.impact-value {
		font-weight: 600;
	}

	.risk-warning {
		margin-top: 8px;
		font-size: 11px;
		color: #dc2626;
		font-weight: 500;
		background: #fef2f2;
		padding: 4px 8px;
		border-radius: 4px;
		border: 1px solid #fecaca;
	}

	.response-action {
		background: #f3f4f6;
		color: #374151;
		border: 1px solid #d1d5db;
		padding: 12px 20px;
		border-radius: 8px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
		margin-top: auto;
	}

	.response-action.primary {
		background: #3b82f6;
		color: white;
		border-color: #3b82f6;
	}

	.response-action.primary:hover:not(:disabled) {
		background: #2563eb;
		border-color: #2563eb;
	}

	.response-action:disabled {
		cursor: not-allowed;
		opacity: 0.5;
	}

	@media (max-width: 768px) {
		.news-event-overlay {
			padding: 10px;
		}

		.event-content {
			padding: 20px;
		}

		.responses-grid {
			grid-template-columns: 1fr;
		}

		.story-meta {
			flex-wrap: wrap;
		}

		.headline {
			font-size: 20px;
		}
	}
</style>