<script lang="ts">
	import { onMount } from 'svelte';
	import { gameStore, advanceCampaignDay, saveGameToLocal } from '../stores/gameStore.js';
	import { DUTCH_DEMOGRAPHICS } from '../types/population.js';
	import { DUTCH_REGIONS } from '../types/regions.js';
	import { newsSystemStore, generateRandomNewsEvent, handleNewsResponse } from '../stores/partyStore.js';
	import type { ActiveNewsEvent } from '../types/news.js';
	import CampaignVideo from './CampaignVideo.svelte';
	import RegionalCampaign from './RegionalCampaign.svelte';
	import NewsEvents from './NewsEvents.svelte';

	let showVideoCreator = false;
	let showRegionalCampaign = false;
	let showNewsEvents = false;
	let currentNewsEvent: ActiveNewsEvent | null = null;
	let currentTime = new Date();
	let campaignMode: 'strategic' | 'crisis' | 'war-room' = 'strategic';
	let activeAdvisorNotifications: AdvisorNotification[] = [];

	interface AdvisorNotification {
		id: string;
		advisor: string;
		avatar: string;
		priority: 'low' | 'medium' | 'high' | 'urgent';
		title: string;
		message: string;
		action?: string;
		timestamp: Date;
		dismissed?: boolean;
	}

	$: gameState = $gameStore;
	$: player = gameState?.player;
	$: party = gameState?.playerParty;
	$: population = gameState?.population;
	$: campaignVideos = gameState?.campaignVideos || [];
	$: currentDay = gameState?.currentDay || 1;
	$: daysUntilElection = gameState?.daysUntilElection || 60;
	$: campaignBudget = gameState?.campaignBudget || 0;
	$: overallPolling = gameState?.overallPolling || 0;
	$: regionalData = gameState?.regionalData || {};
	$: oppositionParties = gameState?.oppositionParties || [];
	$: oppositionPolling = gameState?.oppositionPolling || {};
	$: newsSystem = $newsSystemStore;
	$: approvalRating = gameState?.approvalRating ?? 45;
	$: mediaRelations = gameState?.mediaRelations ?? 40;
	$: coalitionTrust = gameState?.coalitionTrust ?? 50;
	$: selectedScenario = gameState?.selectedScenario;
	$: specialActions = gameState?.specialActions || { scenario: [], background: [] };
	$: demographicRelationships = gameState?.demographicRelationships || {};

	// Calculate campaign mode based on days remaining and polling
	$: {
		const daysLeft = daysUntilElection - currentDay + 1;
		if (daysLeft <= 7) {
			campaignMode = 'war-room';
		} else if (overallPolling < 10 || hasUrgentSituation()) {
			campaignMode = 'crisis';
		} else {
			campaignMode = 'strategic';
		}
	}

	// Generate advisor notifications based on game state
	$: {
		generateAdvisorNotifications();
	}

	// Check for news events when day changes
	$: {
		if (currentDay && newsSystem) {
			checkForNewsEvents();
		}
	}

	function hasUrgentSituation(): boolean {
		// Check for low budget, recent polling drops, etc.
		return campaignBudget < 5000 || (overallPolling < 15 && currentDay > 10);
	}

	function generateAdvisorNotifications() {
		const notifications: AdvisorNotification[] = [];

		// Communications Director (Maria)
		if (campaignVideos.length === 0) {
			notifications.push({
				id: 'maria-first-video',
				advisor: 'Maria',
				avatar: '👩‍💼',
				priority: 'medium',
				title: 'Media Strategy Needed',
				message: 'We need to establish our media presence. Our first campaign video will set the tone for the entire campaign.',
				action: 'Create Video',
				timestamp: new Date()
			});
		} else if (campaignVideos.length > 0) {
			const lastVideo = campaignVideos[campaignVideos.length - 1];
			if (currentDay - lastVideo.createdOn > 5) {
				notifications.push({
					id: 'maria-video-followup',
					advisor: 'Maria',
					avatar: '👩‍💼',
					priority: 'low',
					title: 'Media Refresh Recommended',
					message: `It's been ${currentDay - lastVideo.createdOn} days since our last video. We should maintain media momentum.`,
					action: 'Create Video',
					timestamp: new Date()
				});
			}
		}

		// Strategy Director (Hans)
		if (overallPolling < 20) {
			notifications.push({
				id: 'hans-polling-concern',
				advisor: 'Hans',
				avatar: '👨‍💻',
				priority: 'high',
				title: 'Polling Below Threshold',
				message: `Current polling at ${overallPolling.toFixed(1)}% puts us below the electoral threshold. We need targeted regional campaigns in key areas.`,
				action: 'Regional Campaign',
				timestamp: new Date()
			});
		}

		// Polling Director (Elena)
		const strongestRegion = Object.entries(regionalData)
			.map(([id, data]) => ({ id, polling: data.polling || 0 }))
			.sort((a, b) => b.polling - a.polling)[0];

		if (strongestRegion && strongestRegion.polling > 25) {
			notifications.push({
				id: 'elena-strength',
				advisor: 'Elena',
				avatar: '📊',
				priority: 'low',
				title: 'Regional Strength Identified',
				message: `Excellent performance in ${DUTCH_REGIONS.find(r => r.id === strongestRegion.id)?.name}. Consider leveraging this success for broader appeal.`,
				timestamp: new Date()
			});
		}

		// Budget concerns (appears in crisis mode)
		if (campaignBudget < 10000) {
			notifications.push({
				id: 'budget-warning',
				advisor: 'Hans',
				avatar: '👨‍💻',
				priority: 'urgent',
				title: 'Budget Critical',
				message: `Campaign budget at ${formatBudget(campaignBudget)}. We need to prioritize high-impact activities carefully.`,
				timestamp: new Date()
			});
		}

		activeAdvisorNotifications = notifications.filter(n => !n.dismissed);
	}

	// Advisor personality data
	const advisors = {
		maria: {
			name: 'Maria van der Berg',
			role: 'Communications Director',
			avatar: '👩‍💼',
			expertise: 'Media Strategy & Messaging',
			personality: 'Direct and media-savvy'
		},
		hans: {
			name: 'Hans Dijkstra',
			role: 'Strategy Director',
			avatar: '👨‍💻',
			expertise: 'Data Analysis & Historical Context',
			personality: 'Analytical and methodical'
		},
		elena: {
			name: 'Elena Petrova',
			role: 'Polling Director',
			avatar: '📊',
			expertise: 'Demographics & Regional Analysis',
			personality: 'Numbers-focused and precise'
		},
		joris: {
			name: 'Joris de Vries',
			role: 'Press Secretary',
			avatar: '📺',
			expertise: 'Opposition Research & Crisis Response',
			personality: 'Political veteran and defensive strategist'
		}
	};

	// Calculate demographic insights for briefings
	$: demographicInsights = population ? DUTCH_DEMOGRAPHICS.map(group => {
		const segment = population[group.id];
		const support = segment?.currentSupport || 0;
		const awareness = segment?.awareness || 0;

		let status = 'stable';
		let insight = '';
		const relationship = demographicRelationships[group.id] || 'neutral';

		if (support > 40) {
			status = 'strong';
			insight = `Solid support base. Maintain messaging that resonates with ${group.name.toLowerCase()}.`;
		} else if (support < 15) {
			status = 'weak';
			insight = `Needs attention. Consider targeted outreach to ${group.name.toLowerCase()}.`;
		} else if (awareness < 30) {
			status = 'unknown';
			insight = `Low awareness. Increase visibility among ${group.name.toLowerCase()}.`;
		} else {
			insight = `Moderate support. Room for growth with targeted messaging.`;
		}

		return {
			...group,
			support: support,
			awareness: awareness,
			status,
			insight,
			relationship
		};
	}).sort((a, b) => b.support - a.support) : [];

	// Calculate regional priorities
	$: regionalPriorities = DUTCH_REGIONS.map(region => {
		const data = regionalData[region.id];
		const support = data?.polling || 0;
		const spending = data?.campaignSpending || 0;
		const lastActivity = data?.lastActivity;

		let priority = 'low';
		let reasoning = '';

		if (support < 5 && region.electoralWeight > 8) {
			priority = 'high';
			reasoning = `High electoral value (${region.electoralWeight}%) but low support. Critical target.`;
		} else if (support > 20 && support < 35) {
			priority = 'medium';
			reasoning = `Competitive region. Small gains could yield significant results.`;
		} else if (!lastActivity && currentDay > 5) {
			priority = 'medium';
			reasoning = `No campaign activity yet. Establishing presence recommended.`;
		} else {
			reasoning = support > 35 ? `Strong position. Maintain current level.` : `Monitor for opportunities.`;
		}

		return {
			...region,
			support,
			spending,
			lastActivity,
			priority,
			reasoning
		};
	}).sort((a, b) => {
		const priorityOrder = { high: 3, medium: 2, low: 1 };
		return priorityOrder[b.priority] - priorityOrder[a.priority];
	});

	function formatBudget(amount: number): string {
		return `€${amount.toLocaleString()}`;
	}

	function getPollingColor(polling: number): string {
		if (polling < 10) return '#dc2626';
		if (polling < 20) return '#ea580c';
		if (polling < 30) return '#d97706';
		if (polling < 40) return '#65a30d';
		return '#16a34a';
	}

	function getApprovalColor(value: number): string {
		if (value >= 65) return '#16a34a';
		if (value >= 55) return '#65a30d';
		if (value >= 45) return '#fbbf24';
		if (value >= 35) return '#f97316';
		return '#ef4444';
	}

	function getApprovalLabel(value: number): string {
		if (value >= 65) return 'Mandate';
		if (value >= 55) return 'Strong';
		if (value >= 45) return 'Shaky';
		if (value >= 35) return 'Vulnerable';
		return 'Crisis';
	}

	function getRelationColor(value: number): string {
		if (value >= 75) return '#38bdf8';
		if (value >= 60) return '#0ea5e9';
		if (value >= 45) return '#facc15';
		if (value >= 30) return '#fb923c';
		return '#ef4444';
	}

	function getRelationLabel(value: number): string {
		if (value >= 75) return 'Allied';
		if (value >= 60) return 'Favorable';
		if (value >= 45) return 'Cautious';
		if (value >= 30) return 'Strained';
		return 'Hostile';
	}

	function getTrustColor(value: number): string {
		if (value >= 70) return '#a855f7';
		if (value >= 55) return '#8b5cf6';
		if (value >= 40) return '#facc15';
		if (value >= 25) return '#fb923c';
		return '#ef4444';
	}

	function getTrustLabel(value: number): string {
		if (value >= 70) return 'Secure';
		if (value >= 55) return 'Workable';
		if (value >= 40) return 'Fragile';
		if (value >= 25) return 'Tenuous';
		return 'Collapse Risk';
	}

	function formatRelationship(status: string): string {
		if (!status) return 'Neutral';
		return status.charAt(0).toUpperCase() + status.slice(1);
	}

	function getThreatLevel(): { level: string; color: string; description: string } {
		const daysLeft = daysUntilElection - currentDay + 1;

		if (campaignMode === 'crisis' || overallPolling < 10) {
			return { level: 'HIGH', color: '#dc2626', description: 'Immediate action required' };
		} else if (campaignMode === 'war-room' || daysLeft <= 14) {
			return { level: 'ELEVATED', color: '#ea580c', description: 'Heightened urgency' };
		} else if (overallPolling < 25) {
			return { level: 'MODERATE', color: '#d97706', description: 'Monitor closely' };
		} else {
			return { level: 'LOW', color: '#16a34a', description: 'Proceed with strategy' };
		}
	}

	// Reactive threat level calculation
	$: threat = getThreatLevel();

	function dismissNotification(notificationId: string) {
		activeAdvisorNotifications = activeAdvisorNotifications.filter(n => n.id !== notificationId);
	}

	function handleNotificationAction(notification: AdvisorNotification) {
		if (notification.action === 'Create Video') {
			createVideo();
		} else if (notification.action === 'Regional Campaign') {
			openRegionalCampaign();
		}
		dismissNotification(notification.id);
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

	function openRegionalCampaign() {
		showRegionalCampaign = true;
	}

	function handleRegionalCampaignClosed() {
		showRegionalCampaign = false;
	}

	function handleRegionalCampaignConducted() {
		showRegionalCampaign = false;
	}


	function checkForNewsEvents() {
		// Check if there are any active events that haven't been shown yet
		const activeEvents = newsSystem.activeEvents.filter(event => !event.isExpired);
		if (activeEvents.length > 0 && !showNewsEvents) {
			currentNewsEvent = activeEvents[0];
			showNewsEvents = true;
		} else {
			// Try to generate a new event
			const newEvent = generateRandomNewsEvent(currentDay);
			if (newEvent) {
				currentNewsEvent = newEvent;
				showNewsEvents = true;
			}
		}
	}

	function handleNewsEventResponse(event: CustomEvent) {
		const { eventId, responseId, response } = event.detail;
		handleNewsResponse(eventId, responseId, response);
		showNewsEvents = false;
		currentNewsEvent = null;
	}

	function handleNewsEventClose() {
		showNewsEvents = false;
		currentNewsEvent = null;
	}

	function nextDay() {
		advanceCampaignDay();
	}

	function getTimeUntilElection(): string {
		const daysLeft = daysUntilElection - currentDay + 1;
		const hours = Math.floor(daysLeft * 24);
		return `${daysLeft}d ${hours % 24}h`;
	}

	// Update current time every minute for live clock feel
	onMount(() => {
		const timeInterval = setInterval(() => {
			currentTime = new Date();
		}, 60000);

		const saveInterval = setInterval(() => {
			if (gameState) {
				saveGameToLocal();
			}
		}, 30000);

		return () => {
			clearInterval(timeInterval);
			clearInterval(saveInterval);
		};
	});
</script>

<div class="campaign-headquarters" class:strategic={campaignMode === 'strategic'} class:crisis={campaignMode === 'crisis'} class:war-room={campaignMode === 'war-room'}>
	<!-- Situation Board Header -->
	<div class="situation-board">
		<div class="hq-identity">
			<div class="party-emblem" style="border-color: {party?.color}">
				<span class="party-initial">{party?.shortName?.[0] || 'P'}</span>
			</div>
			<div class="hq-info">
				<h1 class="party-name">{party?.name} Headquarters</h1>
				<div class="leader-designation">
					<span class="leader-name">{player?.name}</span>
					<span class="leader-title">Party Leader</span>
				</div>
			</div>
		</div>

		<div class="mission-control">
			<div class="live-clock">
				<div class="clock-display">
					{currentTime.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })}
				</div>
				<div class="campaign-countdown">
					{getTimeUntilElection()} to Election
				</div>
			</div>

			<div class="threat-assessment">
				<div class="threat-indicator" style="background-color: {threat.color}">
					{threat.level}
				</div>
				<div class="threat-description">{threat.description}</div>
			</div>

			<div class="campaign-mode-indicator">
				<div class="mode-badge" class:strategic={campaignMode === 'strategic'} class:crisis={campaignMode === 'crisis'} class:war-room={campaignMode === 'war-room'}>
					{campaignMode === 'strategic' ? '📋 Strategic Phase' : campaignMode === 'crisis' ? '🚨 Crisis Mode' : '⚔️ War Room'}
				</div>
			</div>
		</div>

		<div class="vital-metrics">
			<div class="metric polling-metric">
				<div class="metric-value" style="color: {getPollingColor(overallPolling)}">
					{overallPolling.toFixed(1)}%
				</div>
				<div class="metric-label">National Polling</div>
			</div>
			<div class="metric approval-metric">
				<div class="metric-value" style="color: {getApprovalColor(approvalRating)}">
					{approvalRating.toFixed(0)}%
				</div>
				<div class="metric-label">National Approval</div>
				<div class="metric-subtitle">{getApprovalLabel(approvalRating)}</div>
			</div>
			<div class="metric relations-metric">
				<div class="metric-value" style="color: {getRelationColor(mediaRelations)}">
					{mediaRelations.toFixed(0)}
				</div>
				<div class="metric-label">Media Relations</div>
				<div class="metric-subtitle">{getRelationLabel(mediaRelations)}</div>
			</div>
			<div class="metric trust-metric">
				<div class="metric-value" style="color: {getTrustColor(coalitionTrust)}">
					{coalitionTrust.toFixed(0)}
				</div>
				<div class="metric-label">Coalition Trust</div>
				<div class="metric-subtitle">{getTrustLabel(coalitionTrust)}</div>
			</div>
			<div class="metric budget-metric">
				<div class="metric-value" class:critical={campaignBudget < 10000}>
					{formatBudget(campaignBudget)}
				</div>
				<div class="metric-label">Campaign War Chest</div>
			</div>
			<div class="metric day-metric">
				<div class="metric-value">Day {currentDay}</div>
				<div class="metric-label">Campaign Day</div>
			</div>
		</div>
	</div>

	<!-- Main Command Interface -->
	<div class="command-interface">
		<!-- Advisor Briefings (Left Panel) -->
		<div class="advisor-briefings">
			<div class="briefings-header">
				<h2>📋 Staff Briefings</h2>
				<div class="notification-count" class:urgent={activeAdvisorNotifications.some(n => n.priority === 'urgent')}>
					{activeAdvisorNotifications.length}
				</div>
			</div>

			{#if activeAdvisorNotifications.length > 0}
				<div class="advisor-notifications">
					{#each activeAdvisorNotifications as notification}
						<div class="advisor-card" class:urgent={notification.priority === 'urgent'} class:high={notification.priority === 'high'}>
							<div class="advisor-header">
								<div class="advisor-avatar">{notification.avatar}</div>
								<div class="advisor-identity">
									<div class="advisor-name">{notification.advisor}</div>
									<div class="notification-title">{notification.title}</div>
								</div>
								<button class="dismiss-btn" on:click={() => dismissNotification(notification.id)}>✕</button>
							</div>
							<div class="advisor-message">
								{notification.message}
							</div>
							{#if notification.action}
								<div class="advisor-actions">
									<button class="advisor-action-btn" on:click={() => handleNotificationAction(notification)}>
										{notification.action}
									</button>
								</div>
							{/if}
						</div>
					{/each}
				</div>
			{:else}
				<div class="no-briefings">
					<p>🟢 All advisors report normal operations</p>
				</div>
			{/if}

			<!-- Demographic Intelligence -->
			<div class="intelligence-section">
				<h3>🎯 Voter Demographics</h3>
				<div class="demographic-intel">
					{#each demographicInsights.slice(0, 4) as group}
						<div class="demo-card" class:strong={group.status === 'strong'} class:weak={group.status === 'weak'}>
							<div class="demo-header">
								<span class="demo-name">{group.name}</span>
								<span class="demo-support" style="color: {getPollingColor(group.support)}">
									{group.support.toFixed(1)}%
								</span>
							</div>
							<div class="demo-insight">{group.insight}</div>
							<div
								class="demo-relationship"
								class:positive={group.relationship === 'supportive'}
								class:enthusiastic={group.relationship === 'enthusiastic'}
								class:negative={group.relationship === 'skeptical' || group.relationship === 'hostile'}
							>
								{formatRelationship(group.relationship)}
							</div>
						</div>
					{/each}
				</div>
			</div>
		</div>

		<!-- Intelligence Feed (Right Panel) -->
		<div class="intelligence-feed">
			<div class="feed-header">
				<h2>🎯 Strategic Intelligence</h2>
			</div>

			<!-- Regional Priorities -->
			<div class="regional-intelligence">
				<h3>📍 Regional Assessment</h3>
				<div class="region-priorities">
					{#each regionalPriorities.slice(0, 3) as region}
						<div class="region-card" class:high-priority={region.priority === 'high'} class:medium-priority={region.priority === 'medium'}>
							<div class="region-header">
								<span class="region-name">{region.name}</span>
								<div class="region-metrics">
									<span class="region-support" style="color: {getPollingColor(region.support)}">
										{region.support.toFixed(1)}%
									</span>
									<span class="region-weight">{region.electoralWeight}% votes</span>
								</div>
							</div>
							<div class="region-analysis">{region.reasoning}</div>
							{#if region.priority === 'high'}
								<div class="region-action">
									<button class="region-action-btn" on:click={openRegionalCampaign}>
										Launch Campaign
									</button>
								</div>
							{/if}
						</div>
					{/each}
				</div>
			</div>

			<!-- Campaign History -->
			<div class="campaign-history">
				<h3>📹 Media Operations</h3>
				{#if campaignVideos.length === 0}
					<div class="no-videos">
						<p>No media operations yet.</p>
						<button class="create-first-video" on:click={createVideo}>
							Launch First Campaign Video
						</button>
					</div>
				{:else}
					<div class="recent-videos">
						{#each campaignVideos.slice(-2).reverse() as video}
							<div class="video-brief">
								<div class="video-header">
									<span class="video-title">{video.title}</span>
									<span class="video-day">Day {video.createdOn}</span>
								</div>
								<div class="video-performance">
									<span class="effectiveness" style="color: {getPollingColor(video.effectiveness)}">
										{video.effectiveness.toFixed(0)}% effective
									</span>
									<span class="video-tone">{video.tone} tone</span>
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</div>

			<!-- Opposition Polling -->
			<div class="opposition-polling">
				<h3>🗳️ Political Landscape</h3>
				<div class="polling-overview">
					<div class="player-party-poll">
						<div class="party-badge" style="background-color: {party?.color || '#6b7280'}">
							{party?.shortName || 'YOU'}
						</div>
						<div class="poll-details">
							<span class="party-name">{party?.shortName || 'Your Party'}</span>
							<span class="poll-percentage" style="color: {getPollingColor(overallPolling)}">
								{overallPolling.toFixed(1)}%
							</span>
						</div>
					</div>

					{#each oppositionParties.slice(0, 6) as opParty}
						{@const polling = oppositionPolling[opParty.id] || 0}
						<div class="opposition-party-poll">
							<div class="party-badge" style="background-color: {opParty.color}">
								{opParty.shortName}
							</div>
							<div class="poll-details">
								<span class="party-name">{opParty.shortName}</span>
								<span class="poll-percentage" style="color: {getPollingColor(polling)}">
									{polling.toFixed(1)}%
								</span>
							</div>
						</div>
					{/each}
				</div>
			</div>
		</div>
	</div>

	<!-- Command Center (Bottom Action Bar) -->
	<div class="command-center">
		<div class="primary-actions">
			{#if campaignMode === 'crisis'}
				<button class="crisis-action" on:click={createVideo}>
					🚨 Emergency Response Video
				</button>
			{:else if campaignMode === 'war-room'}
				<button class="war-room-action" on:click={openRegionalCampaign}>
					⚔️ Final Push Campaign
				</button>
			{:else}
				<button class="strategic-action" on:click={createVideo}>
					📹 Create Campaign Video
				</button>
			{/if}

			<button class="secondary-action" on:click={openRegionalCampaign}>
				🗺️ Regional Operations
			</button>

		</div>

		{#if (specialActions.scenario.length + specialActions.background.length) > 0}
			<div class="special-actions-panel">
				<div class="actions-column">
					<h4>Scenario Levers{#if selectedScenario} · {selectedScenario.name}{/if}</h4>
					{#if specialActions.scenario.length > 0}
						<ul class="action-list">
							{#each specialActions.scenario as action}
								<li class="action-chip">🎯 {action}</li>
							{/each}
						</ul>
					{:else}
						<p class="action-empty">No scenario levers unlocked yet.</p>
					{/if}
				</div>
				<div class="actions-column">
					<h4>Background Plays</h4>
					{#if specialActions.background.length > 0}
						<ul class="action-list">
							{#each specialActions.background as action}
								<li class="action-chip">🧭 {action}</li>
							{/each}
						</ul>
					{:else}
						<p class="action-empty">No background actions unlocked.</p>
					{/if}
				</div>
			</div>
		{/if}

		<div class="day-controls">
			<div class="day-status">
				<span class="current-status">Campaign Day {currentDay}</span>
				<span class="election-countdown">{daysUntilElection - currentDay + 1} days to Election</span>
			</div>
			<button class="advance-day" on:click={nextDay}>
				Advance to Day {currentDay + 1} →
			</button>
		</div>
	</div>
</div>

{#if showVideoCreator}
	<CampaignVideo
		on:videoCreated={handleVideoCreated}
		on:cancel={handleVideoCancel}
	/>
{/if}

{#if showRegionalCampaign}
	<RegionalCampaign
		on:campaignConducted={handleRegionalCampaignConducted}
		on:close={handleRegionalCampaignClosed}
	/>
{/if}


{#if showNewsEvents && currentNewsEvent}
	<NewsEvents
		activeEvent={currentNewsEvent}
		on:respond={handleNewsEventResponse}
		on:close={handleNewsEventClose}
	/>
{/if}

<style>
	.campaign-headquarters {
		height: 100%;
		overflow-y: auto;
		background: linear-gradient(135deg, #1e293b 0%, #334155 50%, #475569 100%);
		color: white;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
		transition: all 0.3s ease;
		display: flex;
		flex-direction: column;
	}

	.campaign-headquarters.crisis {
		background: linear-gradient(135deg, #7f1d1d 0%, #991b1b 50%, #b91c1c 100%);
	}

	.campaign-headquarters.war-room {
		background: linear-gradient(135deg, #1f2937 0%, #111827 50%, #000000 100%);
	}

	/* Situation Board Header */
	.situation-board {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 20px 30px;
		background: rgba(0, 0, 0, 0.3);
		backdrop-filter: blur(10px);
		border-bottom: 2px solid rgba(255, 255, 255, 0.1);
	}

	.hq-identity {
		display: flex;
		align-items: center;
		gap: 20px;
	}

	.party-emblem {
		width: 60px;
		height: 60px;
		border: 3px solid;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(255, 255, 255, 0.1);
	}

	.party-initial {
		font-size: 24px;
		font-weight: bold;
	}

	.hq-info {
		display: flex;
		flex-direction: column;
		gap: 5px;
	}

	.party-name {
		margin: 0;
		font-size: 24px;
		font-weight: 700;
	}

	.leader-designation {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.leader-name {
		font-size: 16px;
		font-weight: 600;
		color: #e2e8f0;
	}

	.leader-title {
		font-size: 12px;
		color: #94a3b8;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.mission-control {
		display: flex;
		align-items: center;
		gap: 30px;
	}

	.live-clock {
		text-align: center;
	}

	.clock-display {
		font-size: 20px;
		font-weight: 600;
		font-family: 'Courier New', monospace;
	}

	.campaign-countdown {
		font-size: 12px;
		color: #94a3b8;
		text-transform: uppercase;
	}

	.threat-assessment {
		text-align: center;
	}

	.threat-indicator {
		padding: 4px 12px;
		border-radius: 4px;
		font-size: 12px;
		font-weight: bold;
		color: white;
		margin-bottom: 4px;
	}

	.threat-description {
		font-size: 10px;
		color: #94a3b8;
	}

	.campaign-mode-indicator .mode-badge {
		padding: 8px 16px;
		border-radius: 20px;
		font-size: 14px;
		font-weight: 600;
		border: 2px solid rgba(255, 255, 255, 0.2);
	}

	.mode-badge.strategic {
		background: rgba(59, 130, 246, 0.2);
		border-color: #3b82f6;
	}

	.mode-badge.crisis {
		background: rgba(239, 68, 68, 0.2);
		border-color: #ef4444;
	}

	.mode-badge.war-room {
		background: rgba(245, 158, 11, 0.2);
		border-color: #f59e0b;
	}

	.vital-metrics {
		display: flex;
		flex-wrap: wrap;
		gap: 20px;
	}

	.metric {
		text-align: center;
		min-width: 150px;
	}

	.metric-value {
		font-size: 24px;
		font-weight: 700;
		margin-bottom: 4px;
	}

	.metric-value.critical {
		color: #ef4444;
		animation: pulse 2s infinite;
	}

	.metric-label {
		font-size: 11px;
		color: #94a3b8;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.metric-subtitle {
		font-size: 10px;
		color: #cbd5f5;
		text-transform: uppercase;
		letter-spacing: 0.4px;
		margin-top: 2px;
	}

	/* Command Interface */
	.command-interface {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 30px;
		padding: 30px;
		flex: 1;
		overflow-y: auto;
	}

	/* Advisor Briefings */
	.advisor-briefings {
		background: rgba(0, 0, 0, 0.2);
		border-radius: 12px;
		padding: 20px;
		backdrop-filter: blur(5px);
		display: flex;
		flex-direction: column;
		min-height: 0; /* Allow shrinking in grid */
	}

	.briefings-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 20px;
		padding-bottom: 10px;
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
	}

	.briefings-header h2 {
		margin: 0;
		font-size: 18px;
		font-weight: 600;
	}

	.notification-count {
		background: rgba(59, 130, 246, 0.3);
		color: white;
		padding: 4px 12px;
		border-radius: 12px;
		font-size: 12px;
		font-weight: 600;
	}

	.notification-count.urgent {
		background: rgba(239, 68, 68, 0.3);
		animation: pulse 2s infinite;
	}

	.advisor-notifications {
		display: flex;
		flex-direction: column;
		gap: 15px;
		margin-bottom: 30px;
		overflow-y: auto;
		flex: 1;
		min-height: 0;
	}

	.advisor-card {
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 8px;
		padding: 15px;
		transition: all 0.2s ease;
	}

	.advisor-card.urgent {
		border-color: #ef4444;
		background: rgba(239, 68, 68, 0.1);
	}

	.advisor-card.high {
		border-color: #f59e0b;
		background: rgba(245, 158, 11, 0.1);
	}

	.advisor-card:hover {
		background: rgba(255, 255, 255, 0.1);
	}

	.advisor-header {
		display: flex;
		align-items: center;
		gap: 10px;
		margin-bottom: 10px;
	}

	.advisor-avatar {
		font-size: 20px;
	}

	.advisor-identity {
		flex: 1;
	}

	.advisor-name {
		font-size: 12px;
		color: #94a3b8;
		text-transform: uppercase;
	}

	.notification-title {
		font-size: 14px;
		font-weight: 600;
	}

	.dismiss-btn {
		background: none;
		border: none;
		color: #94a3b8;
		cursor: pointer;
		padding: 4px;
		border-radius: 4px;
	}

	.dismiss-btn:hover {
		background: rgba(255, 255, 255, 0.1);
		color: white;
	}

	.advisor-message {
		font-size: 13px;
		line-height: 1.5;
		color: #e2e8f0;
		margin-bottom: 10px;
	}

	.advisor-actions {
		display: flex;
		justify-content: flex-end;
	}

	.advisor-action-btn {
		background: rgba(59, 130, 246, 0.2);
		border: 1px solid #3b82f6;
		color: #3b82f6;
		padding: 6px 12px;
		border-radius: 4px;
		font-size: 12px;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.advisor-action-btn:hover {
		background: rgba(59, 130, 246, 0.3);
		color: white;
	}

	.no-briefings {
		text-align: center;
		padding: 40px 20px;
		color: #94a3b8;
	}

	/* Intelligence Section */
	.intelligence-section {
		margin-top: 20px;
	}

	.intelligence-section h3 {
		margin: 0 0 15px 0;
		font-size: 16px;
		font-weight: 600;
		padding-bottom: 8px;
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
	}

	.demographic-intel {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.demo-card {
		background: rgba(255, 255, 255, 0.03);
		border-radius: 6px;
		padding: 12px;
		border-left: 3px solid transparent;
	}

	.demo-card.strong {
		border-left-color: #16a34a;
	}

	.demo-card.weak {
		border-left-color: #dc2626;
	}

	.demo-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 5px;
	}

	.demo-name {
		font-size: 12px;
		font-weight: 600;
	}

	.demo-support {
		font-size: 14px;
		font-weight: bold;
	}

	.demo-insight {
		font-size: 11px;
		color: #94a3b8;
		line-height: 1.4;
	}

	.demo-relationship {
		margin-top: 10px;
		display: inline-flex;
		align-items: center;
		gap: 6px;
		font-size: 10px;
		text-transform: uppercase;
		letter-spacing: 0.6px;
		padding: 4px 10px;
		border-radius: 9999px;
		background: rgba(148, 163, 184, 0.2);
		color: #e2e8f0;
	}

	.demo-relationship.positive {
		background: rgba(34, 197, 94, 0.2);
		color: #bbf7d0;
	}

	.demo-relationship.enthusiastic {
		background: rgba(59, 130, 246, 0.25);
		color: #bfdbfe;
	}

	.demo-relationship.negative {
		background: rgba(239, 68, 68, 0.2);
		color: #fecaca;
	}

	/* Intelligence Feed */
	.intelligence-feed {
		background: rgba(0, 0, 0, 0.2);
		border-radius: 12px;
		padding: 20px;
		backdrop-filter: blur(5px);
	}

	.feed-header h2 {
		margin: 0 0 20px 0;
		font-size: 18px;
		font-weight: 600;
		padding-bottom: 10px;
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
	}

	.regional-intelligence h3 {
		margin: 0 0 15px 0;
		font-size: 16px;
		font-weight: 600;
		padding-bottom: 8px;
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
	}

	.region-priorities {
		display: flex;
		flex-direction: column;
		gap: 15px;
		margin-bottom: 30px;
	}

	.region-card {
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 8px;
		padding: 15px;
		transition: all 0.2s ease;
	}

	.region-card.high-priority {
		border-color: #ef4444;
		background: rgba(239, 68, 68, 0.1);
	}

	.region-card.medium-priority {
		border-color: #f59e0b;
		background: rgba(245, 158, 11, 0.1);
	}

	.region-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 10px;
	}

	.region-name {
		font-size: 14px;
		font-weight: 600;
	}

	.region-metrics {
		display: flex;
		gap: 10px;
		align-items: center;
	}

	.region-support {
		font-size: 14px;
		font-weight: bold;
	}

	.region-weight {
		font-size: 11px;
		color: #94a3b8;
	}

	.region-analysis {
		font-size: 12px;
		color: #e2e8f0;
		line-height: 1.4;
		margin-bottom: 10px;
	}

	.region-action {
		display: flex;
		justify-content: flex-end;
	}

	.region-action-btn {
		background: rgba(239, 68, 68, 0.2);
		border: 1px solid #ef4444;
		color: #ef4444;
		padding: 6px 12px;
		border-radius: 4px;
		font-size: 12px;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.region-action-btn:hover {
		background: rgba(239, 68, 68, 0.3);
		color: white;
	}

	/* Campaign History */
	.campaign-history h3 {
		margin: 0 0 15px 0;
		font-size: 16px;
		font-weight: 600;
		padding-bottom: 8px;
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
	}

	.no-videos {
		text-align: center;
		padding: 30px 20px;
	}

	.create-first-video {
		background: rgba(59, 130, 246, 0.2);
		border: 2px solid #3b82f6;
		color: #3b82f6;
		padding: 12px 24px;
		border-radius: 8px;
		font-size: 14px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
		margin-top: 15px;
	}

	.create-first-video:hover {
		background: rgba(59, 130, 246, 0.3);
		color: white;
	}

	.recent-videos {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.video-brief {
		background: rgba(255, 255, 255, 0.03);
		border-radius: 6px;
		padding: 12px;
	}

	.video-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 5px;
	}

	.video-title {
		font-size: 12px;
		font-weight: 600;
	}

	.video-day {
		font-size: 10px;
		color: #94a3b8;
	}

	.video-performance {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.effectiveness {
		font-size: 11px;
		font-weight: bold;
	}

	.video-tone {
		font-size: 10px;
		color: #94a3b8;
		text-transform: capitalize;
	}

	/* Command Center */
	.command-center {
		display: flex;
		flex-direction: column;
		align-items: stretch;
		gap: 16px;
		padding: 20px 30px;
		background: rgba(0, 0, 0, 0.4);
		backdrop-filter: blur(10px);
		border-top: 2px solid rgba(255, 255, 255, 0.1);
	}

	.primary-actions {
		display: flex;
		gap: 15px;
		flex-wrap: wrap;
		justify-content: flex-start;
	}

	.special-actions-panel {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
		gap: 16px;
		padding: 16px;
		background: rgba(15, 23, 42, 0.35);
		border: 1px solid rgba(148, 163, 184, 0.2);
		border-radius: 12px;
	}

	.actions-column h4 {
		margin: 0 0 8px 0;
		font-size: 13px;
		text-transform: uppercase;
		letter-spacing: 0.6px;
		color: #cbd5f5;
	}

	.action-list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.action-chip {
		padding: 8px 12px;
		border-radius: 9999px;
		background: rgba(59, 130, 246, 0.2);
		border: 1px solid rgba(59, 130, 246, 0.4);
		font-size: 12px;
		color: #bfdbfe;
		width: fit-content;
	}

	.action-chip + .action-chip {
		margin-top: 2px;
	}

	.action-chip.muted,
	.action-empty {
		background: rgba(100, 116, 139, 0.2);
		border-color: rgba(100, 116, 139, 0.3);
		color: #cbd5f5;
		font-style: italic;
	}

	.action-empty {
		margin: 0;
		font-size: 12px;
	}

	.crisis-action, .war-room-action, .strategic-action {
		padding: 12px 24px;
		border-radius: 8px;
		font-size: 14px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
		border: 2px solid;
	}

	.crisis-action {
		background: rgba(239, 68, 68, 0.2);
		border-color: #ef4444;
		color: #ef4444;
	}

	.war-room-action {
		background: rgba(245, 158, 11, 0.2);
		border-color: #f59e0b;
		color: #f59e0b;
	}

	.strategic-action {
		background: rgba(59, 130, 246, 0.2);
		border-color: #3b82f6;
		color: #3b82f6;
	}

	.crisis-action:hover, .war-room-action:hover, .strategic-action:hover {
		background: rgba(255, 255, 255, 0.1);
		color: white;
	}

	.secondary-action {
		background: rgba(100, 116, 139, 0.2);
		border: 1px solid #64748b;
		color: #64748b;
		padding: 12px 20px;
		border-radius: 8px;
		font-size: 14px;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.secondary-action:hover {
		background: rgba(100, 116, 139, 0.3);
		color: white;
	}

	.day-controls {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 20px;
		flex-wrap: wrap;
	}

	.day-status {
		display: flex;
		flex-direction: column;
		text-align: right;
	}

	.current-status {
		font-size: 14px;
		font-weight: 600;
	}

	.election-countdown {
		font-size: 11px;
		color: #94a3b8;
	}

	.advance-day {
		background: rgba(34, 197, 94, 0.2);
		border: 2px solid #22c55e;
		color: #22c55e;
		padding: 12px 20px;
		border-radius: 8px;
		font-size: 14px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.advance-day:hover {
		background: rgba(34, 197, 94, 0.3);
		color: white;
	}

	@keyframes pulse {
		0%, 100% { opacity: 1; }
		50% { opacity: 0.5; }
	}

	/* Responsive */
	@media (max-width: 1200px) {
		.command-interface {
			grid-template-columns: 1fr;
			gap: 20px;
		}

		.situation-board {
			flex-direction: column;
			gap: 20px;
			padding: 15px 20px;
		}

		.mission-control {
			flex-direction: column;
			gap: 15px;
		}

		.vital-metrics {
			gap: 20px;
		}

		.special-actions-panel {
			grid-template-columns: 1fr;
		}

		.command-center {
			flex-direction: column;
			gap: 15px;
			padding: 15px 20px;
		}

		.primary-actions {
			width: 100%;
			justify-content: center;
		}
	}

	/* Opposition Polling */
	.opposition-polling {
		background: rgba(0, 0, 0, 0.2);
		border-radius: 12px;
		padding: 20px;
		border: 1px solid rgba(255, 255, 255, 0.1);
		display: flex;
		flex-direction: column;
		min-height: 0; /* Allow shrinking in grid */
	}

	.opposition-polling h3 {
		color: white;
		margin-bottom: 16px;
		font-size: 16px;
		font-weight: 600;
	}

	.polling-overview {
		display: flex;
		flex-direction: column;
		gap: 12px;
		overflow-y: auto;
		flex: 1;
		min-height: 0;
	}

	.player-party-poll,
	.opposition-party-poll {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 10px;
		background: rgba(255, 255, 255, 0.05);
		border-radius: 8px;
		transition: all 0.2s ease;
	}

	.player-party-poll {
		background: rgba(59, 130, 246, 0.15);
		border: 1px solid rgba(59, 130, 246, 0.3);
	}

	.opposition-party-poll:hover {
		background: rgba(255, 255, 255, 0.08);
	}

	.party-badge {
		width: 36px;
		height: 36px;
		border-radius: 6px;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 10px;
		font-weight: bold;
		color: white;
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
	}

	.poll-details {
		flex: 1;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.party-name {
		color: rgba(255, 255, 255, 0.9);
		font-size: 13px;
		font-weight: 500;
	}

	.poll-percentage {
		font-size: 14px;
		font-weight: 600;
	}
</style>
