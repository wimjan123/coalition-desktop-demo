<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { gameStore } from '../stores/gameStore.js';
	import { DUTCH_DEMOGRAPHICS } from '../types/population.js';
	import { DUTCH_REGIONS } from '../types/regions.js';
	import { DUTCH_ISSUES } from '../types/game.js';

	const dispatch = createEventDispatcher();

	let selectedView: 'overview' | 'demographics' | 'issues' | 'regions' | 'trends' = 'overview';
	let selectedDemographic: string = '';
	let selectedIssue: string = '';
	let selectedRegion: string = '';

	$: gameState = $gameStore;
	$: population = gameState?.population || {};
	$: regionalData = gameState?.regionalData || {};
	$: campaignVideos = gameState?.campaignVideos || [];
	$: currentDay = gameState?.currentDay || 1;
	$: overallPolling = gameState?.overallPolling || 0;

	// Calculate demographic polling breakdown
	$: demographicPolling = DUTCH_DEMOGRAPHICS.map(group => {
		const segment = population[group.id];
		return {
			...group,
			support: segment?.currentSupport || 0,
			awareness: segment?.awareness || 0,
			enthusiasm: segment?.enthusiasm || 0,
			trend: calculateTrend(group.id),
			issueAlignment: calculateIssueAlignment(group.id)
		};
	}).sort((a, b) => b.support - a.support);

	// Calculate issue-based polling
	$: issuePolling = DUTCH_ISSUES.map(issue => {
		const partyPosition = getPartyPositionOnIssue(issue.id);
		const voterSupport = calculateIssueSupport(issue.id);
		const alignment = calculateIssueAlignment(issue.id, partyPosition);

		return {
			...issue,
			partyPosition,
			voterSupport,
			alignment,
			importance: calculateIssueImportance(issue.id),
			trend: calculateIssueTrend(issue.id)
		};
	}).sort((a, b) => b.importance - a.importance);

	// Calculate regional polling breakdown
	$: regionalPolling = DUTCH_REGIONS.map(region => {
		const data = regionalData[region.id];
		return {
			...region,
			support: data?.polling || 0,
			awareness: data?.awareness || 0,
			spending: data?.campaignSpending || 0,
			trend: calculateRegionalTrend(region.id),
			competitiveness: calculateCompetitiveness(region.id),
			lastActivity: data?.lastActivity
		};
	}).sort((a, b) => b.support - a.support);

	// Calculate polling trends over time
	$: trendData = calculatePollingTrends();

	function calculateTrend(groupId: string): number {
		// Simulate trend calculation based on recent campaign activities
		const recentVideos = campaignVideos.filter(v => (currentDay - v.createdOn) <= 7);
		let trend = 0;

		recentVideos.forEach(video => {
			// Simplified trend calculation
			trend += video.effectiveness / 100;
		});

		return Math.max(-5, Math.min(5, trend));
	}

	function calculateIssueAlignment(groupId: string, partyPosition?: number): number {
		const group = DUTCH_DEMOGRAPHICS.find(g => g.id === groupId);
		if (!group) return 0;

		if (partyPosition !== undefined) {
			// Calculate alignment between party position and voter base position
			const voterPosition = group.basePositions?.climate || 0;
			return Math.max(0, 100 - Math.abs(partyPosition - voterPosition));
		}

		// Calculate general alignment based on party positions vs group preferences
		const party = gameState?.playerParty;
		if (!party?.positions || party.positions.length === 0) return 25; // Low alignment with no positions

		let totalAlignment = 0;
		let weightedCount = 0;

		party.positions.forEach(position => {
			const voterPosition = group.basePositions?.[position.issueId] || 0;
			const importance = group.issueImportance?.[position.issueId] || 1;
			const alignment = Math.max(0, 100 - Math.abs(position.position - voterPosition));

			totalAlignment += alignment * importance;
			weightedCount += importance;
		});

		return weightedCount > 0 ? totalAlignment / weightedCount : 25;
	}

	function getPartyPositionOnIssue(issueId: string): number {
		const party = gameState?.playerParty;
		if (!party?.positions) return 0;

		const position = party.positions.find(p => p.issueId === issueId);
		return position?.position || 0;
	}

	function calculateIssueSupport(issueId: string): number {
		// Calculate weighted voter support for this issue across demographics
		let totalSupport = 0;
		let totalWeight = 0;

		DUTCH_DEMOGRAPHICS.forEach(group => {
			const segment = population[group.id];
			const importance = group.issueImportance?.[issueId] || 0;
			if (segment && importance > 0) {
				totalSupport += segment.currentSupport * importance * group.percentage;
				totalWeight += importance * group.percentage;
			}
		});

		return totalWeight > 0 ? totalSupport / totalWeight : 0;
	}

	function calculateIssueImportance(issueId: string): number {
		// Average importance across all demographics
		let totalImportance = 0;
		let count = 0;

		DUTCH_DEMOGRAPHICS.forEach(group => {
			const importance = group.issueImportance?.[issueId];
			if (importance !== undefined) {
				totalImportance += importance * group.percentage;
				count += group.percentage;
			}
		});

		return count > 0 ? totalImportance / count : 0;
	}

	function calculateIssueTrend(issueId: string): number {
		// Calculate how this issue is trending based on recent campaign activity
		const recentVideos = campaignVideos.filter(v =>
			(currentDay - v.createdOn) <= 7 && v.selectedIssues.includes(issueId)
		);

		if (recentVideos.length === 0) return 0;

		const avgEffectiveness = recentVideos.reduce((sum, v) => sum + v.effectiveness, 0) / recentVideos.length;
		return (avgEffectiveness - 50) / 10; // Convert to -5 to +5 scale
	}

	function calculateRegionalTrend(regionId: string): number {
		const data = regionalData[regionId];
		if (!data?.lastActivity) return -1; // Negative trend if no recent activity

		const daysSinceActivity = currentDay - data.lastActivity;
		if (daysSinceActivity <= 3) return 2; // Positive trend if recent activity
		if (daysSinceActivity <= 7) return 0; // Neutral
		return -1; // Negative trend if no recent activity
	}

	function calculateCompetitiveness(regionId: string): 'safe' | 'lean' | 'toss-up' | 'competitive' {
		const data = regionalData[regionId];
		const support = data?.polling || 0;

		if (support > 15) return 'safe';
		if (support > 8) return 'lean';
		if (support > 3) return 'competitive';
		return 'toss-up';
	}

	function calculatePollingTrends() {
		// Calculate real polling trends based on campaign activities
		const trends = [];
		const startDay = Math.max(1, currentDay - 14);

		for (let day = startDay; day <= currentDay; day++) {
			// Base polling starts very low and grows based on campaign activities
			let dayPolling = 0.5; // Start very low
			let dayAwareness = 1; // Start very low

			// Add impact from campaign videos created up to this day
			const videosUpToDay = campaignVideos.filter(v => v.createdOn <= day);
			videosUpToDay.forEach(video => {
				const daysAgo = day - video.createdOn;
				const decay = Math.max(0.1, 1 - (daysAgo * 0.1)); // Effect decays over time
				dayPolling += (video.effectiveness / 100) * decay * 0.5;
				dayAwareness += (video.effectiveness / 100) * decay * 2;
			});

			// Add impact from regional campaign activities
			if (regionalData) {
				Object.values(regionalData).forEach(region => {
					if (region.lastActivity && region.lastActivity <= day) {
						const daysAgo = day - region.lastActivity;
						const decay = Math.max(0.1, 1 - (daysAgo * 0.15));
						const regionWeight = DUTCH_REGIONS.find(r => r.id === region.regionId)?.electoralWeight || 1;

						dayPolling += (region.polling * regionWeight / 100) * decay * 0.1;
						dayAwareness += (region.awareness * regionWeight / 100) * decay * 0.3;
					}
				});
			}

			trends.push({
				day,
				polling: Math.min(100, dayPolling),
				awareness: Math.min(100, dayAwareness)
			});
		}
		return trends;
	}

	function formatTrend(trend: number): string {
		if (trend > 1) return `+${trend.toFixed(1)}`;
		if (trend < -1) return trend.toFixed(1);
		return trend >= 0 ? '+0.0' : '-0.0';
	}

	function getTrendColor(trend: number): string {
		if (trend > 0.5) return '#16a34a'; // Green
		if (trend < -0.5) return '#dc2626'; // Red
		return '#6b7280'; // Gray
	}

	function getCompetitivenessColor(comp: string): string {
		switch (comp) {
			case 'safe': return '#16a34a';
			case 'lean': return '#65a30d';
			case 'competitive': return '#d97706';
			case 'toss-up': return '#dc2626';
			default: return '#6b7280';
		}
	}

	function closeModal() {
		dispatch('close');
	}

	function formatPercentage(value: number): string {
		return `${value.toFixed(1)}%`;
	}

	function formatAlignment(value: number): string {
		if (value > 80) return 'Excellent';
		if (value > 60) return 'Good';
		if (value > 40) return 'Fair';
		if (value > 20) return 'Poor';
		return 'Very Poor';
	}
</script>

<div class="modal-overlay" on:click={closeModal}>
	<div class="modal-content" on:click|stopPropagation>
		<div class="modal-header">
			<div class="header-content">
				<div class="analyst-info">
					<span class="analyst-avatar">📊</span>
					<div class="analyst-details">
						<h2>Polling Analysis</h2>
						<p class="analyst-title">Campaign Intelligence Dashboard</p>
					</div>
				</div>
				<button class="close-btn" on:click={closeModal}>×</button>
			</div>
			<div class="polling-summary">
				<div class="main-metric">
					<span class="metric-label">Current Polling</span>
					<span class="metric-value">{formatPercentage(overallPolling)}</span>
					<span class="metric-trend" style="color: {getTrendColor(0.2)}">+0.2</span>
				</div>
				<div class="summary-stats">
					<div class="stat">
						<span class="stat-label">Awareness</span>
						<span class="stat-value">{formatPercentage(demographicPolling.reduce((sum, d) => sum + d.awareness * d.percentage, 0) / 100)}</span>
					</div>
					<div class="stat">
						<span class="stat-label">Day</span>
						<span class="stat-value">{currentDay}</span>
					</div>
				</div>
			</div>
		</div>

		<div class="modal-body">
			<div class="navigation-tabs">
				<button
					class="tab"
					class:active={selectedView === 'overview'}
					on:click={() => selectedView = 'overview'}
				>
					📊 Overview
				</button>
				<button
					class="tab"
					class:active={selectedView === 'demographics'}
					on:click={() => selectedView = 'demographics'}
				>
					👥 Demographics
				</button>
				<button
					class="tab"
					class:active={selectedView === 'issues'}
					on:click={() => selectedView = 'issues'}
				>
					🗳️ Issues
				</button>
				<button
					class="tab"
					class:active={selectedView === 'regions'}
					on:click={() => selectedView = 'regions'}
				>
					🗺️ Regions
				</button>
				<button
					class="tab"
					class:active={selectedView === 'trends'}
					on:click={() => selectedView = 'trends'}
				>
					📈 Trends
				</button>
			</div>

			<div class="content-area">
				{#if selectedView === 'overview'}
					<div class="overview-grid">
						<div class="overview-section">
							<h3>🏆 Top Performing Demographics</h3>
							<div class="top-list">
								{#each demographicPolling.slice(0, 3) as demo}
									<div class="top-item">
										<div class="item-info">
											<span class="item-name">{demo.name}</span>
											<span class="item-percentage">{demo.percentage}% of voters</span>
										</div>
										<div class="item-metrics">
											<span class="support">{formatPercentage(demo.support)}</span>
											<span class="trend" style="color: {getTrendColor(demo.trend)}">
												{formatTrend(demo.trend)}
											</span>
										</div>
									</div>
								{/each}
							</div>
						</div>

						<div class="overview-section">
							<h3>🗳️ Key Issues Performance</h3>
							<div class="top-list">
								{#each issuePolling.slice(0, 3) as issue}
									<div class="top-item">
										<div class="item-info">
											<span class="item-name">{issue.name}</span>
											<span class="item-percentage">Importance: {issue.importance.toFixed(1)}/10</span>
										</div>
										<div class="item-metrics">
											<span class="support">{formatAlignment(issue.alignment)}</span>
											<span class="trend" style="color: {getTrendColor(issue.trend)}">
												{formatTrend(issue.trend)}
											</span>
										</div>
									</div>
								{/each}
							</div>
						</div>

						<div class="overview-section">
							<h3>🗺️ Regional Strongholds</h3>
							<div class="top-list">
								{#each regionalPolling.slice(0, 3) as region}
									<div class="top-item">
										<div class="item-info">
											<span class="item-name">{region.name}</span>
											<span class="item-percentage">{region.electoralWeight}% of seats</span>
										</div>
										<div class="item-metrics">
											<span class="support">{formatPercentage(region.support)}</span>
											<span
												class="competitiveness"
												style="color: {getCompetitivenessColor(region.competitiveness)}"
											>
												{region.competitiveness}
											</span>
										</div>
									</div>
								{/each}
							</div>
						</div>

						<div class="overview-section analyst-insight">
							<h3>💭 Maurit's Analysis</h3>
							<div class="insight-content">
								<p>
									"Based on current polling data, your party is performing {overallPolling > 5 ? 'above' : 'below'}
									expectations for a new political movement.
									{#if overallPolling < 2}
										Focus on building awareness through targeted regional campaigns.
									{:else if overallPolling < 5}
										You're gaining traction - now concentrate on key demographics and issue positioning.
									{:else}
										Strong momentum! Maintain visibility while preparing for potential opposition attacks.
									{/if}
								</p>
								<p>
									<strong>Strategic Focus:</strong> The {demographicPolling[0]?.name || 'Unknown'} demographic shows the most promise,
									while {issuePolling[0]?.name || 'key issues'} could be your strongest platform.
									Regional focus should be on {regionalPolling[0]?.name || 'competitive areas'}.
								</p>
							</div>
						</div>
					</div>

				{:else if selectedView === 'demographics'}
					<div class="demographics-analysis">
						<h3>👥 Demographic Breakdown</h3>
						<div class="demographic-grid">
							{#each demographicPolling as demo}
								<div class="demographic-card">
									<div class="demo-header">
										<h4>{demo.name}</h4>
										<span class="demo-size">{demo.percentage}% of electorate</span>
									</div>
									<div class="demo-metrics">
										<div class="metric">
											<span class="metric-label">Support</span>
											<span class="metric-value">{formatPercentage(demo.support)}</span>
											<div class="progress-bar">
												<div class="progress" style="width: {demo.support * 2}%; background-color: #3b82f6"></div>
											</div>
										</div>
										<div class="metric">
											<span class="metric-label">Awareness</span>
											<span class="metric-value">{formatPercentage(demo.awareness)}</span>
											<div class="progress-bar">
												<div class="progress" style="width: {demo.awareness}%; background-color: #6b7280"></div>
											</div>
										</div>
										<div class="metric">
											<span class="metric-label">Enthusiasm</span>
											<span class="metric-value">{demo.enthusiasm.toFixed(0)}%</span>
											<div class="progress-bar">
												<div class="progress" style="width: {demo.enthusiasm}%; background-color: #f59e0b"></div>
											</div>
										</div>
									</div>
									<div class="demo-trend">
										<span class="trend-label">7-day trend:</span>
										<span class="trend-value" style="color: {getTrendColor(demo.trend)}">
											{formatTrend(demo.trend)}%
										</span>
									</div>
								</div>
							{/each}
						</div>
					</div>

				{:else if selectedView === 'issues'}
					<div class="issues-analysis">
						<h3>🗳️ Issue-by-Issue Analysis</h3>
						<div class="issues-grid">
							{#each issuePolling as issue}
								<div class="issue-card">
									<div class="issue-header">
										<h4>{issue.name}</h4>
										<span class="issue-importance">Importance: {issue.importance.toFixed(1)}/10</span>
									</div>
									<div class="issue-content">
										<div class="position-display">
											<div class="spectrum">
												<span class="spectrum-left">Left</span>
												<div class="position-slider">
													<div class="slider-track"></div>
													<div
														class="position-marker"
														style="left: {((issue.partyPosition + 100) / 200) * 100}%"
													></div>
												</div>
												<span class="spectrum-right">Right</span>
											</div>
											<div class="position-value">
												Your position: {issue.partyPosition > 0 ? '+' : ''}{issue.partyPosition}
											</div>
										</div>
										<div class="issue-metrics">
											<div class="metric">
												<span class="metric-label">Voter Alignment</span>
												<span class="metric-value">{formatAlignment(issue.alignment)}</span>
											</div>
											<div class="metric">
												<span class="metric-label">Trend</span>
												<span class="metric-value" style="color: {getTrendColor(issue.trend)}">
													{formatTrend(issue.trend)}
												</span>
											</div>
										</div>
									</div>
								</div>
							{/each}
						</div>
					</div>

				{:else if selectedView === 'regions'}
					<div class="regions-analysis">
						<h3>🗺️ Regional Performance</h3>
						<div class="regions-grid">
							{#each regionalPolling as region}
								<div class="region-card">
									<div class="region-header">
										<h4>{region.name}</h4>
										<span class="region-weight">{region.electoralWeight}% of seats</span>
									</div>
									<div class="region-metrics">
										<div class="metric">
											<span class="metric-label">Support</span>
											<span class="metric-value">{formatPercentage(region.support)}</span>
										</div>
										<div class="metric">
											<span class="metric-label">Awareness</span>
											<span class="metric-value">{formatPercentage(region.awareness)}</span>
										</div>
										<div class="metric">
											<span class="metric-label">Spending</span>
											<span class="metric-value">€{(region.spending / 1000).toFixed(0)}k</span>
										</div>
									</div>
									<div class="region-status">
										<span
											class="competitiveness-badge"
											style="background-color: {getCompetitivenessColor(region.competitiveness)}"
										>
											{region.competitiveness}
										</span>
										{#if region.lastActivity}
											<span class="last-activity">Last activity: Day {region.lastActivity}</span>
										{:else}
											<span class="last-activity">No recent activity</span>
										{/if}
									</div>
								</div>
							{/each}
						</div>
					</div>

				{:else if selectedView === 'trends'}
					<div class="trends-analysis">
						<h3>📈 Polling Trends</h3>
						<div class="trend-chart">
							<svg viewBox="0 0 400 200" class="chart-svg">
								<!-- Chart grid lines -->
								{#each Array(5) as _, i}
									<line
										x1="40"
										y1={40 + i * 30}
										x2="380"
										y2={40 + i * 30}
										stroke="#e5e7eb"
										stroke-width="1"
									/>
								{/each}
								{#each Array(8) as _, i}
									<line
										x1={40 + i * 48}
										y1="40"
										x2={40 + i * 48}
										y2="160"
										stroke="#e5e7eb"
										stroke-width="1"
									/>
								{/each}

								<!-- Polling trend line -->
								{#if trendData.length > 1}
									<polyline
										points={trendData.map((d, i) => `${40 + (i / (trendData.length - 1)) * 340},${160 - (d.polling / 20) * 120}`).join(' ')}
										fill="none"
										stroke="#3b82f6"
										stroke-width="3"
									/>
								{/if}

								<!-- Data points -->
								{#each trendData as data, i}
									<circle
										cx={40 + (i / (trendData.length - 1)) * 340}
										cy={160 - (data.polling / 20) * 120}
										r="4"
										fill="#3b82f6"
									/>
								{/each}

								<!-- Y-axis labels -->
								{#each Array(5) as _, i}
									<text x="30" y={45 + i * 30} text-anchor="end" class="chart-label">
										{(4 - i) * 5}%
									</text>
								{/each}

								<!-- X-axis labels -->
								{#each Array(4) as _, i}
									<text x={40 + i * 113} y="180" text-anchor="middle" class="chart-label">
										Day {Math.max(1, currentDay - 14 + i * 5)}
									</text>
								{/each}
							</svg>
						</div>

						<div class="trend-insights">
							<div class="insight-box">
								<h4>📊 Key Observations</h4>
								<ul>
									<li>Current polling trajectory shows {overallPolling > (trendData[0]?.polling || 0) ? 'upward' : 'downward'} momentum</li>
									<li>Peak awareness reached: {Math.max(...trendData.map(d => d.awareness)).toFixed(1)}%</li>
									<li>Most effective campaign day: Day {trendData.reduce((max, d, i) => d.polling > (trendData[max]?.polling || 0) ? i : max, 0) + Math.max(1, currentDay - 14)}</li>
								</ul>
							</div>
						</div>
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
		background: rgba(0, 0, 0, 0.8);
		backdrop-filter: blur(5px);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 3000;
		padding: 20px;
	}

	.modal-content {
		background: white;
		border-radius: 16px;
		width: 100%;
		max-width: 1400px;
		max-height: 95vh;
		overflow: hidden;
		box-shadow: 0 25px 80px rgba(0, 0, 0, 0.4);
		border: 1px solid #e5e7eb;
		display: flex;
		flex-direction: column;
	}

	.modal-header {
		background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
		color: white;
		padding: 24px;
	}

	.header-content {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 20px;
	}

	.analyst-info {
		display: flex;
		align-items: center;
		gap: 16px;
	}

	.analyst-avatar {
		font-size: 48px;
		background: rgba(255, 255, 255, 0.2);
		border-radius: 50%;
		width: 80px;
		height: 80px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.analyst-details h2 {
		margin: 0;
		font-size: 28px;
		font-weight: 700;
	}

	.analyst-title {
		margin: 4px 0 0 0;
		opacity: 0.9;
		font-size: 14px;
	}

	.close-btn {
		background: rgba(255, 255, 255, 0.2);
		color: white;
		border: none;
		width: 40px;
		height: 40px;
		border-radius: 8px;
		cursor: pointer;
		font-size: 24px;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: background 0.2s;
	}

	.close-btn:hover {
		background: rgba(255, 255, 255, 0.3);
	}

	.polling-summary {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.main-metric {
		display: flex;
		align-items: baseline;
		gap: 12px;
	}

	.metric-label {
		font-size: 14px;
		opacity: 0.8;
	}

	.metric-value {
		font-size: 36px;
		font-weight: 800;
	}

	.metric-trend {
		font-size: 18px;
		font-weight: 600;
	}

	.summary-stats {
		display: flex;
		gap: 24px;
	}

	.stat {
		text-align: center;
	}

	.stat-label {
		display: block;
		font-size: 12px;
		opacity: 0.8;
		margin-bottom: 4px;
	}

	.stat-value {
		font-size: 18px;
		font-weight: 600;
	}

	.modal-body {
		flex: 1;
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}

	.navigation-tabs {
		display: flex;
		background: #f8fafc;
		border-bottom: 1px solid #e5e7eb;
	}

	.tab {
		flex: 1;
		background: none;
		border: none;
		padding: 16px 24px;
		cursor: pointer;
		font-weight: 500;
		color: #6b7280;
		transition: all 0.2s;
		border-bottom: 3px solid transparent;
	}

	.tab:hover {
		background: #f1f5f9;
		color: #374151;
	}

	.tab.active {
		color: #3b82f6;
		border-bottom-color: #3b82f6;
		background: white;
	}

	.content-area {
		flex: 1;
		padding: 24px;
		overflow-y: auto;
	}

	.overview-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 24px;
		margin-bottom: 24px;
	}

	.overview-section {
		background: #f8fafc;
		border-radius: 12px;
		padding: 20px;
		border: 1px solid #e5e7eb;
	}

	.overview-section.analyst-insight {
		grid-column: span 2;
		background: linear-gradient(135deg, #eff6ff 0%, #f0f9ff 100%);
		border: 1px solid #bae6fd;
	}

	.overview-section h3 {
		margin: 0 0 16px 0;
		color: #1f2937;
		font-size: 16px;
		font-weight: 600;
	}

	.top-list {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.top-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 12px;
		background: white;
		border-radius: 8px;
		border: 1px solid #e5e7eb;
	}

	.item-info {
		flex: 1;
	}

	.item-name {
		display: block;
		font-weight: 600;
		color: #1f2937;
		margin-bottom: 2px;
	}

	.item-percentage {
		font-size: 12px;
		color: #6b7280;
	}

	.item-metrics {
		display: flex;
		align-items: center;
		gap: 12px;
		font-weight: 600;
	}

	.support {
		color: #3b82f6;
	}

	.trend {
		font-size: 14px;
	}

	.competitiveness {
		font-size: 12px;
		text-transform: uppercase;
		font-weight: 700;
	}

	.insight-content {
		line-height: 1.6;
		color: #0c4a6e;
	}

	.insight-content p {
		margin: 0 0 12px 0;
	}

	.demographic-grid,
	.issues-grid,
	.regions-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
		gap: 20px;
	}

	.demographic-card,
	.issue-card,
	.region-card {
		background: white;
		border: 1px solid #e5e7eb;
		border-radius: 12px;
		padding: 20px;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
	}

	.demo-header,
	.issue-header,
	.region-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 16px;
		padding-bottom: 12px;
		border-bottom: 1px solid #e5e7eb;
	}

	.demo-header h4,
	.issue-header h4,
	.region-header h4 {
		margin: 0;
		color: #1f2937;
		font-size: 16px;
		font-weight: 600;
	}

	.demo-size,
	.issue-importance,
	.region-weight {
		font-size: 12px;
		color: #6b7280;
		background: #f3f4f6;
		padding: 4px 8px;
		border-radius: 6px;
	}

	.demo-metrics,
	.issue-metrics,
	.region-metrics {
		display: flex;
		flex-direction: column;
		gap: 12px;
		margin-bottom: 12px;
	}

	.metric {
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-size: 14px;
	}

	.metric-label {
		color: #6b7280;
		font-weight: 500;
	}

	.metric-value {
		font-weight: 600;
		color: #374151;
	}

	.progress-bar {
		width: 100%;
		height: 6px;
		background: #f3f4f6;
		border-radius: 3px;
		overflow: hidden;
		margin-top: 4px;
	}

	.progress {
		height: 100%;
		border-radius: 3px;
		transition: width 0.3s ease;
	}

	.demo-trend {
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-size: 12px;
		padding-top: 8px;
		border-top: 1px solid #f3f4f6;
	}

	.trend-label {
		color: #6b7280;
	}

	.trend-value {
		font-weight: 600;
	}

	.position-display {
		margin-bottom: 16px;
	}

	.spectrum {
		display: flex;
		align-items: center;
		gap: 12px;
		margin-bottom: 8px;
	}

	.spectrum-left,
	.spectrum-right {
		font-size: 12px;
		color: #6b7280;
		font-weight: 500;
	}

	.position-slider {
		flex: 1;
		position: relative;
		height: 8px;
	}

	.slider-track {
		width: 100%;
		height: 100%;
		background: linear-gradient(to right, #dc2626, #f3f4f6, #3b82f6);
		border-radius: 4px;
	}

	.position-marker {
		position: absolute;
		top: -4px;
		width: 16px;
		height: 16px;
		background: #1f2937;
		border: 2px solid white;
		border-radius: 50%;
		transform: translateX(-50%);
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
	}

	.position-value {
		font-size: 12px;
		color: #374151;
		font-weight: 500;
	}

	.region-status {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding-top: 8px;
		border-top: 1px solid #f3f4f6;
	}

	.competitiveness-badge {
		color: white;
		padding: 4px 8px;
		border-radius: 6px;
		font-size: 11px;
		font-weight: 600;
		text-transform: uppercase;
	}

	.last-activity {
		font-size: 11px;
		color: #6b7280;
		font-style: italic;
	}

	.trend-chart {
		background: white;
		border: 1px solid #e5e7eb;
		border-radius: 12px;
		padding: 20px;
		margin-bottom: 24px;
	}

	.chart-svg {
		width: 100%;
		height: 200px;
	}

	.chart-label {
		font-size: 12px;
		fill: #6b7280;
	}

	.trend-insights {
		background: #f8fafc;
		border-radius: 12px;
		padding: 20px;
		border: 1px solid #e5e7eb;
	}

	.insight-box h4 {
		margin: 0 0 12px 0;
		color: #1f2937;
		font-size: 16px;
		font-weight: 600;
	}

	.insight-box ul {
		margin: 0;
		padding-left: 20px;
		color: #374151;
		line-height: 1.6;
	}

	.insight-box li {
		margin-bottom: 8px;
	}

	@media (max-width: 768px) {
		.overview-grid {
			grid-template-columns: 1fr;
		}

		.overview-section.analyst-insight {
			grid-column: span 1;
		}

		.demographic-grid,
		.issues-grid,
		.regions-grid {
			grid-template-columns: 1fr;
		}

		.polling-summary {
			flex-direction: column;
			gap: 16px;
			align-items: flex-start;
		}

		.summary-stats {
			align-self: stretch;
			justify-content: space-around;
		}
	}
</style>