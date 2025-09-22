<script lang="ts">
	import { onMount } from 'svelte';
	import { gameStore, advanceCampaignDay, saveGameToLocal } from '../stores/gameStore.js';
	import { DUTCH_DEMOGRAPHICS } from '../types/population.js';
	import CampaignVideo from './CampaignVideo.svelte';

	let showVideoCreator = false;

	$: gameState = $gameStore;
	$: player = gameState?.player;
	$: party = gameState?.playerParty;
	$: population = gameState?.population;
	$: campaignVideos = gameState?.campaignVideos || [];
	$: currentDay = gameState?.currentDay || 1;
	$: daysUntilElection = gameState?.daysUntilElection || 60;
	$: campaignBudget = gameState?.campaignBudget || 0;
	$: overallPolling = gameState?.overallPolling || 0;

	// Calculate demographic support breakdown
	$: demographicSupport = population ? DUTCH_DEMOGRAPHICS.map(group => {
		const segment = population[group.id];
		return {
			...group,
			support: segment?.currentSupport || 0,
			awareness: segment?.awareness || 0
		};
	}).sort((a, b) => b.support - a.support) : [];

	// Auto-save every time game state changes
	$: if (gameState) {
		saveGameToLocal();
	}

	function createVideo() {
		showVideoCreator = true;
	}

	function handleVideoCreated() {
		showVideoCreator = false;
	}

	function handleVideoCancel() {
		showVideoCreator = false;
	}

	function nextDay() {
		advanceCampaignDay();
	}

	function formatBudget(amount: number): string {
		return `€${amount.toLocaleString()}`;
	}

	function getPollingColor(polling: number): string {
		if (polling < 10) return '#dc2626'; // Red
		if (polling < 20) return '#ea580c'; // Orange
		if (polling < 30) return '#d97706'; // Amber
		if (polling < 40) return '#65a30d'; // Lime
		return '#16a34a'; // Green
	}

	function getSupportLevel(support: number): string {
		if (support < 10) return 'Very Low';
		if (support < 25) return 'Low';
		if (support < 50) return 'Moderate';
		if (support < 75) return 'High';
		return 'Very High';
	}

	function getAwarenessLevel(awareness: number): string {
		if (awareness < 20) return 'Unknown';
		if (awareness < 40) return 'Low';
		if (awareness < 60) return 'Moderate';
		if (awareness < 80) return 'Good';
		return 'Excellent';
	}

	onMount(() => {
		// Auto-save every 30 seconds
		const interval = setInterval(() => {
			if (gameState) {
				saveGameToLocal();
			}
		}, 30000);

		return () => clearInterval(interval);
	});
</script>

<div class="campaign-dashboard">
	<div class="dashboard-header">
		<div class="campaign-info">
			<h1>{party?.name} Campaign</h1>
			<div class="leader-info">
				<span class="leader-name">{player?.name}</span>
				<span class="leader-title">Party Leader</span>
			</div>
		</div>

		<div class="key-metrics">
			<div class="metric polling">
				<span class="metric-label">Overall Polling</span>
				<span class="metric-value" style="color: {getPollingColor(overallPolling)}">
					{overallPolling.toFixed(1)}%
				</span>
			</div>
			<div class="metric days">
				<span class="metric-label">Days Remaining</span>
				<span class="metric-value">{daysUntilElection - currentDay + 1}</span>
			</div>
			<div class="metric budget">
				<span class="metric-label">Campaign Budget</span>
				<span class="metric-value">{formatBudget(campaignBudget)}</span>
			</div>
		</div>
	</div>

	<div class="dashboard-content">
		<div class="left-panel">
			<div class="actions-section">
				<h2>Campaign Actions</h2>
				<div class="action-buttons">
					<button class="action-btn primary" on:click={createVideo}>
						📹 Create Campaign Video
					</button>
					<button class="action-btn" disabled>
						📺 Media Interview
					</button>
					<button class="action-btn" disabled>
						🎪 Rally Event
					</button>
					<button class="action-btn" disabled>
						🤝 Coalition Meeting
					</button>
				</div>
			</div>

			<div class="demographics-section">
				<h2>Demographic Support</h2>
				<div class="demographics-list">
					{#each demographicSupport as group}
						<div class="demographic-item">
							<div class="demographic-header">
								<span class="group-name">{group.name}</span>
								<span class="group-percentage">{group.percentage}% of voters</span>
							</div>
							<div class="demographic-metrics">
								<div class="support-metric">
									<span class="metric-label">Support:</span>
									<div class="progress-bar">
										<div class="progress-fill" style="width: {group.support}%; background-color: {getPollingColor(group.support)}"></div>
									</div>
									<span class="metric-text">{group.support.toFixed(1)}% ({getSupportLevel(group.support)})</span>
								</div>
								<div class="awareness-metric">
									<span class="metric-label">Awareness:</span>
									<div class="progress-bar">
										<div class="progress-fill" style="width: {group.awareness}%; background-color: #6b7280"></div>
									</div>
									<span class="metric-text">{group.awareness.toFixed(1)}% ({getAwarenessLevel(group.awareness)})</span>
								</div>
							</div>
						</div>
					{/each}
				</div>
			</div>
		</div>

		<div class="right-panel">
			<div class="timeline-section">
				<h2>Campaign Timeline</h2>
				<div class="day-info">
					<span class="current-day">Day {currentDay}</span>
					<button class="next-day-btn" on:click={nextDay}>
						Next Day →
					</button>
				</div>
			</div>

			<div class="videos-section">
				<h2>Campaign Videos ({campaignVideos.length})</h2>
				{#if campaignVideos.length === 0}
					<div class="empty-state">
						<p>No campaign videos yet. Create your first video to start influencing voters!</p>
					</div>
				{:else}
					<div class="videos-list">
						{#each campaignVideos.slice().reverse() as video}
							<div class="video-item">
								<div class="video-header">
									<h4>{video.title}</h4>
									<span class="video-day">Day {video.createdOn}</span>
								</div>
								<div class="video-details">
									<div class="video-issues">
										<strong>Issues:</strong> {video.selectedIssues.join(', ')}
									</div>
									<div class="video-tone">
										<strong>Tone:</strong> {video.tone}
									</div>
									<div class="video-effectiveness">
										<strong>Effectiveness:</strong>
										<span style="color: {getPollingColor(video.effectiveness)}">
											{video.effectiveness.toFixed(1)}/100
										</span>
									</div>
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</div>
		</div>
	</div>
</div>

{#if showVideoCreator}
	<CampaignVideo
		on:videoCreated={handleVideoCreated}
		on:cancel={handleVideoCancel}
	/>
{/if}

<style>
	.campaign-dashboard {
		width: 100%;
		height: 100%;
		background: #f8fafc;
		overflow-y: auto;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
	}

	.dashboard-header {
		background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
		color: white;
		padding: 24px;
		display: flex;
		justify-content: space-between;
		align-items: center;
		box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
	}

	.campaign-info h1 {
		margin: 0 0 8px 0;
		font-size: 28px;
		font-weight: 700;
	}

	.leader-info {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.leader-name {
		font-size: 16px;
		font-weight: 500;
	}

	.leader-title {
		font-size: 14px;
		opacity: 0.8;
	}

	.key-metrics {
		display: flex;
		gap: 32px;
	}

	.metric {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 4px;
	}

	.metric-label {
		font-size: 12px;
		opacity: 0.9;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.metric-value {
		font-size: 24px;
		font-weight: 700;
	}

	.dashboard-content {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 24px;
		padding: 24px;
		max-width: 1400px;
		margin: 0 auto;
	}

	.left-panel,
	.right-panel {
		display: flex;
		flex-direction: column;
		gap: 24px;
	}

	.actions-section,
	.demographics-section,
	.timeline-section,
	.videos-section {
		background: white;
		border-radius: 12px;
		padding: 20px;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
		border: 1px solid #e5e7eb;
	}

	.actions-section h2,
	.demographics-section h2,
	.timeline-section h2,
	.videos-section h2 {
		margin: 0 0 16px 0;
		color: #1f2937;
		font-size: 18px;
		font-weight: 600;
	}

	.action-buttons {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 12px;
	}

	.action-btn {
		padding: 16px 20px;
		border: 2px solid #e5e7eb;
		border-radius: 8px;
		background: white;
		color: #374151;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s;
		text-align: center;
	}

	.action-btn:hover:not(:disabled) {
		border-color: #3b82f6;
		color: #1e40af;
		transform: translateY(-1px);
	}

	.action-btn.primary {
		background: #3b82f6;
		color: white;
		border-color: #3b82f6;
	}

	.action-btn.primary:hover {
		background: #2563eb;
		border-color: #2563eb;
		color: white;
	}

	.action-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
		background: #f9fafb;
	}

	.demographics-list {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.demographic-item {
		border: 1px solid #e5e7eb;
		border-radius: 8px;
		padding: 16px;
		background: #f8fafc;
	}

	.demographic-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 12px;
	}

	.group-name {
		font-weight: 600;
		color: #1f2937;
	}

	.group-percentage {
		font-size: 12px;
		color: #6b7280;
		background: #e5e7eb;
		padding: 2px 8px;
		border-radius: 12px;
	}

	.demographic-metrics {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.support-metric,
	.awareness-metric {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 12px;
	}

	.metric-label {
		width: 70px;
		color: #6b7280;
		font-weight: 500;
	}

	.progress-bar {
		flex: 1;
		height: 8px;
		background: #e5e7eb;
		border-radius: 4px;
		overflow: hidden;
	}

	.progress-fill {
		height: 100%;
		transition: width 0.3s ease;
	}

	.metric-text {
		width: 120px;
		text-align: right;
		color: #374151;
		font-weight: 500;
	}

	.day-info {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 16px;
		background: #f0f9ff;
		border: 1px solid #bae6fd;
		border-radius: 8px;
	}

	.current-day {
		font-size: 18px;
		font-weight: 600;
		color: #0c4a6e;
	}

	.next-day-btn {
		background: #0ea5e9;
		color: white;
		border: none;
		padding: 8px 16px;
		border-radius: 6px;
		font-weight: 500;
		cursor: pointer;
		transition: background 0.2s;
	}

	.next-day-btn:hover {
		background: #0284c7;
	}

	.empty-state {
		padding: 32px;
		text-align: center;
		color: #6b7280;
		background: #f9fafb;
		border: 2px dashed #d1d5db;
		border-radius: 8px;
	}

	.videos-list {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.video-item {
		border: 1px solid #e5e7eb;
		border-radius: 8px;
		padding: 16px;
		background: #f8fafc;
	}

	.video-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 8px;
	}

	.video-header h4 {
		margin: 0;
		color: #1f2937;
		font-size: 16px;
	}

	.video-day {
		font-size: 12px;
		color: #6b7280;
		background: #e5e7eb;
		padding: 2px 8px;
		border-radius: 12px;
	}

	.video-details {
		display: flex;
		flex-direction: column;
		gap: 4px;
		font-size: 13px;
		color: #4b5563;
	}

	@media (max-width: 1024px) {
		.dashboard-content {
			grid-template-columns: 1fr;
		}

		.key-metrics {
			flex-direction: column;
			gap: 16px;
		}

		.action-buttons {
			grid-template-columns: 1fr;
		}
	}
</style>