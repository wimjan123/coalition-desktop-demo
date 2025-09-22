<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { gameStore, conductRegionalCampaign } from '../stores/gameStore.js';
	import { DUTCH_REGIONS } from '../types/regions.js';

	const dispatch = createEventDispatcher();

	let selectedRegion: string = '';
	let selectedActivity: 'rally' | 'media' | 'ground' = 'rally';
	let budget: number = 5000;

	$: gameState = $gameStore;
	$: regionalData = gameState?.regionalData || {};
	$: campaignBudget = gameState?.campaignBudget || 0;

	// Activity options with descriptions and costs
	const activities = [
		{
			id: 'rally' as const,
			name: '🎪 Political Rally',
			description: 'Organize a public rally to boost support and awareness',
			minCost: 3000,
			maxCost: 15000,
			effects: 'High awareness boost, good support boost, low media impact'
		},
		{
			id: 'media' as const,
			name: '📺 Media Campaign',
			description: 'Targeted TV ads and media appearances in the region',
			minCost: 5000,
			maxCost: 25000,
			effects: 'Excellent media coverage, moderate awareness, good support'
		},
		{
			id: 'ground' as const,
			name: '🚪 Ground Campaign',
			description: 'Door-to-door canvassing and local grassroots organizing',
			minCost: 2000,
			maxCost: 10000,
			effects: 'Excellent support boost, good awareness, minimal media'
		}
	];

	$: selectedActivityData = activities.find(a => a.id === selectedActivity);
	$: canAfford = budget <= campaignBudget;
	$: validBudget = selectedActivityData && budget >= selectedActivityData.minCost && budget <= selectedActivityData.maxCost;

	function conductCampaign() {
		if (!selectedRegion || !canAfford || !validBudget) return;

		conductRegionalCampaign(selectedRegion, selectedActivity, budget);

		// Reset form
		selectedRegion = '';
		budget = 5000;

		dispatch('campaignConducted');
	}

	function closeModal() {
		dispatch('close');
	}

	function getRegionPollingColor(polling: number): string {
		if (polling < 10) return '#dc2626'; // Red
		if (polling < 20) return '#ea580c'; // Orange
		if (polling < 30) return '#d97706'; // Amber
		if (polling < 40) return '#65a30d'; // Lime
		return '#16a34a'; // Green
	}

	function getAwarenessLevel(awareness: number): string {
		if (awareness < 20) return 'Unknown';
		if (awareness < 40) return 'Low';
		if (awareness < 60) return 'Moderate';
		if (awareness < 80) return 'Good';
		return 'Excellent';
	}

	function formatBudget(amount: number): string {
		return `€${amount.toLocaleString()}`;
	}
</script>

<div class="modal-overlay" on:click={closeModal}>
	<div class="modal-content" on:click|stopPropagation>
		<div class="modal-header">
			<h2>🗺️ Regional Campaign Manager</h2>
			<button class="close-btn" on:click={closeModal}>×</button>
		</div>

		<div class="campaign-budget">
			<span class="budget-label">Available Budget:</span>
			<span class="budget-amount">{formatBudget(campaignBudget)}</span>
		</div>

		<div class="modal-body">
			<div class="left-panel">
				<div class="section">
					<h3>Select Region</h3>
					<div class="region-grid">
						{#each DUTCH_REGIONS as region (region.id)}
							{@const regionData = regionalData[region.id]}
							<button
								class="region-card"
								class:selected={selectedRegion === region.id}
								on:click={() => selectedRegion = region.id}
							>
								<div class="region-header">
									<span class="region-name">{region.name}</span>
									<span class="region-type">{region.type}</span>
								</div>
								<div class="region-stats">
									<div class="stat">
										<span class="stat-label">Support:</span>
										<span
											class="stat-value"
											style="color: {getRegionPollingColor(regionData?.polling || 0)}"
										>
											{regionData?.polling?.toFixed(1) || '0.0'}%
										</span>
									</div>
									<div class="stat">
										<span class="stat-label">Awareness:</span>
										<span class="stat-value">
											{getAwarenessLevel(regionData?.awareness || 0)}
										</span>
									</div>
									<div class="stat">
										<span class="stat-label">Population:</span>
										<span class="stat-value">
											{(region.population / 1000000).toFixed(1)}M
										</span>
									</div>
								</div>
								{#if regionData?.lastActivity}
									<div class="last-activity">
										Last activity: Day {regionData.lastActivity}
									</div>
								{/if}
							</button>
						{/each}
					</div>
				</div>

				{#if selectedRegion}
					{@const region = DUTCH_REGIONS.find(r => r.id === selectedRegion)}
					{@const regionData = regionalData[selectedRegion]}
					<div class="section region-details">
						<h3>{region?.name} Details</h3>
						<div class="details-grid">
							<div class="detail-item">
								<span class="detail-label">Electoral Weight:</span>
								<span class="detail-value">{region?.electoralWeight}%</span>
							</div>
							<div class="detail-item">
								<span class="detail-label">Political Leaning:</span>
								<span class="detail-value">{region?.politicalProfile.historicalLeaning}</span>
							</div>
							<div class="detail-item">
								<span class="detail-label">Volatility:</span>
								<span class="detail-value">{region?.politicalProfile.volatility}%</span>
							</div>
							<div class="detail-item">
								<span class="detail-label">Campaign Spent:</span>
								<span class="detail-value">{formatBudget(regionData?.campaignSpending || 0)}</span>
							</div>
						</div>

						{#if region?.localIssues && region.localIssues.length > 0}
							<div class="local-issues">
								<h4>Key Local Issues:</h4>
								<ul>
									{#each region.localIssues.slice(0, 3) as issue}
										<li>{issue.name} (Priority: {issue.priority}/5)</li>
									{/each}
								</ul>
							</div>
						{/if}
					</div>
				{/if}
			</div>

			<div class="right-panel">
				<div class="section">
					<h3>Campaign Activity</h3>
					<div class="activity-selection">
						{#each activities as activity}
							<button
								class="activity-btn"
								class:selected={selectedActivity === activity.id}
								on:click={() => selectedActivity = activity.id}
							>
								<div class="activity-header">
									<span class="activity-name">{activity.name}</span>
								</div>
								<div class="activity-description">
									{activity.description}
								</div>
								<div class="activity-cost">
									Cost: {formatBudget(activity.minCost)} - {formatBudget(activity.maxCost)}
								</div>
								<div class="activity-effects">
									{activity.effects}
								</div>
							</button>
						{/each}
					</div>
				</div>

				{#if selectedActivityData}
					<div class="section">
						<h3>Budget Allocation</h3>
						<div class="budget-controls">
							<label for="budget-slider">Campaign Budget: {formatBudget(budget)}</label>
							<input
								id="budget-slider"
								type="range"
								bind:value={budget}
								min={selectedActivityData.minCost}
								max={Math.min(selectedActivityData.maxCost, campaignBudget)}
								step="500"
								class="budget-slider"
							/>
							<div class="budget-info">
								<span>Min: {formatBudget(selectedActivityData.minCost)}</span>
								<span>Max: {formatBudget(Math.min(selectedActivityData.maxCost, campaignBudget))}</span>
							</div>
						</div>

						{#if !canAfford}
							<div class="warning">
								⚠️ Insufficient funds! You have {formatBudget(campaignBudget)} available.
							</div>
						{:else if !validBudget}
							<div class="warning">
								⚠️ Budget must be between {formatBudget(selectedActivityData.minCost)} and {formatBudget(selectedActivityData.maxCost)}.
							</div>
						{:else if !selectedRegion}
							<div class="warning">
								📍 Please select a region first.
							</div>
						{/if}

						<button
							class="launch-btn"
							disabled={!selectedRegion || !canAfford || !validBudget}
							on:click={conductCampaign}
						>
							🚀 Launch Campaign
						</button>
					</div>
				{/if}
			</div>
		</div>
	</div>
</div>

<style>
	.modal-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.7);
		backdrop-filter: blur(5px);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 2000;
		padding: 20px;
	}

	.modal-content {
		background: white;
		border-radius: 16px;
		width: 100%;
		max-width: 1200px;
		max-height: 90vh;
		overflow: hidden;
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
		border: 1px solid #e5e7eb;
	}

	.modal-header {
		background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
		color: white;
		padding: 20px 24px;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.modal-header h2 {
		margin: 0;
		font-size: 20px;
		font-weight: 600;
	}

	.close-btn {
		background: rgba(255, 255, 255, 0.2);
		color: white;
		border: none;
		width: 32px;
		height: 32px;
		border-radius: 6px;
		cursor: pointer;
		font-size: 20px;
		line-height: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: background 0.2s;
	}

	.close-btn:hover {
		background: rgba(255, 255, 255, 0.3);
	}

	.campaign-budget {
		background: #f0f9ff;
		border-bottom: 1px solid #bae6fd;
		padding: 16px 24px;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.budget-label {
		font-weight: 500;
		color: #0c4a6e;
	}

	.budget-amount {
		font-size: 18px;
		font-weight: 700;
		color: #0c4a6e;
	}

	.modal-body {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 24px;
		padding: 24px;
		max-height: calc(90vh - 160px);
		overflow-y: auto;
	}

	.section {
		background: #f8fafc;
		border-radius: 12px;
		padding: 20px;
		border: 1px solid #e5e7eb;
		margin-bottom: 16px;
	}

	.section h3 {
		margin: 0 0 16px 0;
		color: #1f2937;
		font-size: 16px;
		font-weight: 600;
	}

	.region-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 12px;
		max-height: 300px;
		overflow-y: auto;
	}

	.region-card {
		background: white;
		border: 2px solid #e5e7eb;
		border-radius: 8px;
		padding: 16px;
		cursor: pointer;
		text-align: left;
		transition: all 0.2s;
	}

	.region-card:hover {
		border-color: #3b82f6;
		transform: translateY(-1px);
	}

	.region-card.selected {
		border-color: #3b82f6;
		background: #eff6ff;
	}

	.region-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 8px;
	}

	.region-name {
		font-weight: 600;
		color: #1f2937;
	}

	.region-type {
		font-size: 12px;
		color: #6b7280;
		background: #e5e7eb;
		padding: 2px 6px;
		border-radius: 4px;
		text-transform: capitalize;
	}

	.region-stats {
		display: flex;
		flex-direction: column;
		gap: 4px;
		font-size: 12px;
	}

	.stat {
		display: flex;
		justify-content: space-between;
	}

	.stat-label {
		color: #6b7280;
	}

	.stat-value {
		font-weight: 500;
		color: #374151;
	}

	.last-activity {
		margin-top: 8px;
		font-size: 11px;
		color: #6b7280;
		font-style: italic;
	}

	.region-details .details-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 8px;
		margin-bottom: 16px;
	}

	.detail-item {
		display: flex;
		justify-content: space-between;
		font-size: 12px;
	}

	.detail-label {
		color: #6b7280;
	}

	.detail-value {
		font-weight: 500;
		color: #374151;
		text-transform: capitalize;
	}

	.local-issues h4 {
		margin: 0 0 8px 0;
		font-size: 14px;
		color: #374151;
	}

	.local-issues ul {
		margin: 0;
		padding-left: 16px;
		font-size: 12px;
		color: #6b7280;
	}

	.local-issues li {
		margin-bottom: 4px;
	}

	.activity-selection {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.activity-btn {
		background: white;
		border: 2px solid #e5e7eb;
		border-radius: 8px;
		padding: 16px;
		cursor: pointer;
		text-align: left;
		transition: all 0.2s;
	}

	.activity-btn:hover {
		border-color: #3b82f6;
	}

	.activity-btn.selected {
		border-color: #3b82f6;
		background: #eff6ff;
	}

	.activity-header {
		margin-bottom: 8px;
	}

	.activity-name {
		font-weight: 600;
		color: #1f2937;
		font-size: 14px;
	}

	.activity-description {
		color: #4b5563;
		font-size: 13px;
		margin-bottom: 8px;
		line-height: 1.4;
	}

	.activity-cost {
		color: #059669;
		font-size: 12px;
		font-weight: 500;
		margin-bottom: 4px;
	}

	.activity-effects {
		color: #6b7280;
		font-size: 11px;
		font-style: italic;
	}

	.budget-controls {
		margin-bottom: 16px;
	}

	.budget-controls label {
		display: block;
		margin-bottom: 8px;
		font-weight: 500;
		color: #374151;
	}

	.budget-slider {
		width: 100%;
		margin-bottom: 8px;
	}

	.budget-info {
		display: flex;
		justify-content: space-between;
		font-size: 12px;
		color: #6b7280;
	}

	.warning {
		background: #fef2f2;
		border: 1px solid #fecaca;
		color: #dc2626;
		padding: 12px;
		border-radius: 6px;
		font-size: 13px;
		margin-bottom: 16px;
	}

	.launch-btn {
		width: 100%;
		background: #059669;
		color: white;
		border: none;
		padding: 16px;
		border-radius: 8px;
		font-weight: 600;
		font-size: 14px;
		cursor: pointer;
		transition: background 0.2s;
	}

	.launch-btn:hover:not(:disabled) {
		background: #047857;
	}

	.launch-btn:disabled {
		background: #9ca3af;
		cursor: not-allowed;
	}

	@media (max-width: 768px) {
		.modal-body {
			grid-template-columns: 1fr;
			gap: 16px;
		}

		.modal-content {
			margin: 10px;
			max-width: calc(100vw - 20px);
		}

		.region-details .details-grid {
			grid-template-columns: 1fr;
		}
	}
</style>