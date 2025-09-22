<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { gameStore } from '../stores/gameStore.js';
	import type { ExtendedParty, PartyStats } from '../types/party.js';
	import type { Issue } from '../types/game.js';
	import { DUTCH_ISSUES } from '../types/game.js';

	const dispatch = createEventDispatcher();

	// Reactive game state
	$: player = $gameStore?.player;
	$: party = $gameStore?.playerParty as ExtendedParty;
	$: currentDay = $gameStore?.currentDay || 1;

	// Mock party stats (would be calculated from game state)
	$: partyStats = party?.stats || {
		overallApproval: 42,
		trustworthiness: 38,
		competence: 45,
		relatability: 52,
		demographicApproval: {
			'young': 35,
			'middle-aged': 48,
			'elderly': 55,
			'urban': 38,
			'rural': 46,
			'educated': 41,
			'working-class': 49
		},
		issueCredibility: {
			'economy': 42,
			'climate': 35,
			'immigration': 38,
			'healthcare': 44,
			'housing': 41,
			'education': 39,
			'eu': 36,
			'security': 40
		},
		mediaPresence: 68,
		mediaFavorability: -12,
		socialMediaFollowers: 125000,
		socialMediaEngagement: 34,
		coalitionAppeal: 28,
		oppositionStrength: 45,
		parliamentaryInfluence: 22
	};

	function getStatColor(value: number): string {
		if (value >= 70) return '#22c55e'; // green
		if (value >= 50) return '#eab308'; // yellow
		if (value >= 30) return '#f97316'; // orange
		return '#ef4444'; // red
	}

	function getStatGrade(value: number): string {
		if (value >= 80) return 'A';
		if (value >= 70) return 'B';
		if (value >= 60) return 'C';
		if (value >= 50) return 'D';
		if (value >= 40) return 'E';
		return 'F';
	}

	function formatNumber(num: number): string {
		if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
		if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
		return num.toString();
	}

	function getIssuePosition(issueId: string): number {
		return party?.positions?.find(p => p.issueId === issueId)?.position || 0;
	}

	function getPositionLabel(position: number): string {
		if (position < -60) return 'Far Left';
		if (position < -20) return 'Left';
		if (position <= 20) return 'Center';
		if (position <= 60) return 'Right';
		return 'Far Right';
	}

	function close() {
		dispatch('close');
	}
</script>

<div class="party-overview-overlay">
	<div class="party-overview-window">
		<!-- Header -->
		<div class="overview-header">
			<div class="party-identity">
				<div class="party-emblem" style="background-color: {party?.color}">
					{party?.shortName || 'YOU'}
				</div>
				<div class="party-info">
					<h1>{party?.name || 'Your Party'}</h1>
					<p class="party-leader">{player?.name} - Party Leader</p>
					<p class="party-description">{party?.description}</p>
				</div>
			</div>
			<button class="close-btn" on:click={close}>×</button>
		</div>

		<div class="overview-content">
			<!-- Key Stats Dashboard -->
			<div class="stats-section">
				<h2>📊 Party Performance</h2>
				<div class="key-stats">
					<div class="stat-card">
						<div class="stat-header">
							<span class="stat-label">Overall Approval</span>
							<span class="stat-grade" style="color: {getStatColor(partyStats.overallApproval)}">
								{getStatGrade(partyStats.overallApproval)}
							</span>
						</div>
						<div class="stat-value" style="color: {getStatColor(partyStats.overallApproval)}">
							{partyStats.overallApproval}%
						</div>
						<div class="stat-bar">
							<div class="stat-fill" style="width: {partyStats.overallApproval}%; background-color: {getStatColor(partyStats.overallApproval)}"></div>
						</div>
					</div>

					<div class="stat-card">
						<div class="stat-header">
							<span class="stat-label">Trustworthiness</span>
							<span class="stat-grade" style="color: {getStatColor(partyStats.trustworthiness)}">
								{getStatGrade(partyStats.trustworthiness)}
							</span>
						</div>
						<div class="stat-value" style="color: {getStatColor(partyStats.trustworthiness)}">
							{partyStats.trustworthiness}%
						</div>
						<div class="stat-bar">
							<div class="stat-fill" style="width: {partyStats.trustworthiness}%; background-color: {getStatColor(partyStats.trustworthiness)}"></div>
						</div>
					</div>

					<div class="stat-card">
						<div class="stat-header">
							<span class="stat-label">Competence</span>
							<span class="stat-grade" style="color: {getStatColor(partyStats.competence)}">
								{getStatGrade(partyStats.competence)}
							</span>
						</div>
						<div class="stat-value" style="color: {getStatColor(partyStats.competence)}">
							{partyStats.competence}%
						</div>
						<div class="stat-bar">
							<div class="stat-fill" style="width: {partyStats.competence}%; background-color: {getStatColor(partyStats.competence)}"></div>
						</div>
					</div>

					<div class="stat-card">
						<div class="stat-header">
							<span class="stat-label">Relatability</span>
							<span class="stat-grade" style="color: {getStatColor(partyStats.relatability)}">
								{getStatGrade(partyStats.relatability)}
							</span>
						</div>
						<div class="stat-value" style="color: {getStatColor(partyStats.relatability)}">
							{partyStats.relatability}%
						</div>
						<div class="stat-bar">
							<div class="stat-fill" style="width: {partyStats.relatability}%; background-color: {getStatColor(partyStats.relatability)}"></div>
						</div>
					</div>
				</div>
			</div>

			<!-- Demographic Breakdown -->
			<div class="demographics-section">
				<h2>👥 Demographic Appeal</h2>
				<div class="demographic-grid">
					{#each Object.entries(partyStats.demographicApproval) as [group, approval]}
						<div class="demographic-item">
							<span class="demographic-label">{group.charAt(0).toUpperCase() + group.slice(1)}</span>
							<div class="demographic-bar">
								<div class="demographic-fill" style="width: {approval}%; background-color: {getStatColor(approval)}"></div>
							</div>
							<span class="demographic-value" style="color: {getStatColor(approval)}">{approval}%</span>
						</div>
					{/each}
				</div>
			</div>

			<!-- Issue Positions -->
			<div class="positions-section">
				<h2>🎯 Policy Positions</h2>
				<div class="positions-grid">
					{#each DUTCH_ISSUES as issue}
						{@const position = getIssuePosition(issue.id)}
						{@const credibility = partyStats.issueCredibility[issue.id] || 0}
						<div class="position-card">
							<div class="position-header">
								<h3>{issue.name}</h3>
								<div class="credibility-badge" style="color: {getStatColor(credibility)}">
									{credibility}% credible
								</div>
							</div>
							<div class="position-spectrum">
								<span class="spectrum-left">Left</span>
								<div class="spectrum-track">
									<div class="spectrum-marker" style="left: {((position + 100) / 200) * 100}%"></div>
								</div>
								<span class="spectrum-right">Right</span>
							</div>
							<div class="position-label">{getPositionLabel(position)}</div>
						</div>
					{/each}
				</div>
			</div>

			<!-- Media & Influence -->
			<div class="influence-section">
				<h2>📺 Media & Influence</h2>
				<div class="influence-stats">
					<div class="influence-card">
						<h3>Media Presence</h3>
						<div class="influence-value" style="color: {getStatColor(partyStats.mediaPresence)}">
							{partyStats.mediaPresence}%
						</div>
					</div>
					<div class="influence-card">
						<h3>Media Favorability</h3>
						<div class="influence-value" style="color: {partyStats.mediaFavorability >= 0 ? '#22c55e' : '#ef4444'}">
							{partyStats.mediaFavorability > 0 ? '+' : ''}{partyStats.mediaFavorability}%
						</div>
					</div>
					<div class="influence-card">
						<h3>Social Media</h3>
						<div class="social-stats">
							<div>{formatNumber(partyStats.socialMediaFollowers)} followers</div>
							<div style="color: {getStatColor(partyStats.socialMediaEngagement)}">{partyStats.socialMediaEngagement}% engagement</div>
						</div>
					</div>
					<div class="influence-card">
						<h3>Coalition Appeal</h3>
						<div class="influence-value" style="color: {getStatColor(partyStats.coalitionAppeal)}">
							{partyStats.coalitionAppeal}%
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	.party-overview-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.8);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 2000;
		padding: 20px;
	}

	.party-overview-window {
		background: white;
		border-radius: 16px;
		max-width: 1200px;
		width: 100%;
		max-height: 90vh;
		overflow: hidden;
		box-shadow: 0 25px 80px rgba(0, 0, 0, 0.3);
		display: flex;
		flex-direction: column;
	}

	.overview-header {
		background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
		color: white;
		padding: 24px 30px;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.party-identity {
		display: flex;
		align-items: center;
		gap: 20px;
	}

	.party-emblem {
		width: 60px;
		height: 60px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 20px;
		font-weight: bold;
		color: white;
		border: 3px solid rgba(255, 255, 255, 0.3);
	}

	.party-info h1 {
		margin: 0 0 4px 0;
		font-size: 24px;
		font-weight: 700;
	}

	.party-leader {
		margin: 0 0 8px 0;
		opacity: 0.9;
		font-size: 14px;
		font-weight: 500;
	}

	.party-description {
		margin: 0;
		opacity: 0.8;
		font-size: 13px;
		max-width: 400px;
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
		display: flex;
		align-items: center;
		justify-content: center;
		transition: background 0.2s;
	}

	.close-btn:hover {
		background: rgba(255, 255, 255, 0.3);
	}

	.overview-content {
		padding: 30px;
		overflow-y: auto;
		flex: 1;
	}

	.stats-section,
	.demographics-section,
	.positions-section,
	.influence-section {
		margin-bottom: 40px;
	}

	.stats-section h2,
	.demographics-section h2,
	.positions-section h2,
	.influence-section h2 {
		color: #1f2937;
		margin-bottom: 20px;
		font-size: 20px;
		font-weight: 600;
	}

	.key-stats {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 20px;
	}

	.stat-card {
		background: #f8fafc;
		border: 1px solid #e2e8f0;
		border-radius: 12px;
		padding: 20px;
	}

	.stat-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 8px;
	}

	.stat-label {
		font-size: 14px;
		color: #6b7280;
		font-weight: 500;
	}

	.stat-grade {
		font-size: 16px;
		font-weight: bold;
	}

	.stat-value {
		font-size: 28px;
		font-weight: bold;
		margin-bottom: 12px;
	}

	.stat-bar {
		height: 6px;
		background: #e5e7eb;
		border-radius: 3px;
		overflow: hidden;
	}

	.stat-fill {
		height: 100%;
		transition: width 0.3s ease;
	}

	.demographic-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 16px;
	}

	.demographic-item {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.demographic-label {
		font-size: 14px;
		font-weight: 500;
		color: #374151;
		min-width: 80px;
	}

	.demographic-bar {
		flex: 1;
		height: 8px;
		background: #e5e7eb;
		border-radius: 4px;
		overflow: hidden;
	}

	.demographic-fill {
		height: 100%;
		transition: width 0.3s ease;
	}

	.demographic-value {
		font-size: 14px;
		font-weight: 600;
		min-width: 40px;
		text-align: right;
	}

	.positions-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 20px;
	}

	.position-card {
		background: #f8fafc;
		border: 1px solid #e2e8f0;
		border-radius: 8px;
		padding: 16px;
	}

	.position-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 12px;
	}

	.position-header h3 {
		margin: 0;
		font-size: 16px;
		color: #1f2937;
	}

	.credibility-badge {
		font-size: 12px;
		font-weight: 600;
	}

	.position-spectrum {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-bottom: 8px;
	}

	.spectrum-left,
	.spectrum-right {
		font-size: 12px;
		color: #6b7280;
	}

	.spectrum-track {
		flex: 1;
		height: 4px;
		background: linear-gradient(to right, #dc2626, #6b7280, #2563eb);
		border-radius: 2px;
		position: relative;
	}

	.spectrum-marker {
		position: absolute;
		top: -4px;
		width: 12px;
		height: 12px;
		background: white;
		border: 2px solid #1f2937;
		border-radius: 50%;
		transform: translateX(-50%);
	}

	.position-label {
		text-align: center;
		font-size: 12px;
		font-weight: 600;
		color: #374151;
	}

	.influence-stats {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 20px;
	}

	.influence-card {
		background: #f8fafc;
		border: 1px solid #e2e8f0;
		border-radius: 8px;
		padding: 20px;
		text-align: center;
	}

	.influence-card h3 {
		margin: 0 0 12px 0;
		font-size: 14px;
		color: #6b7280;
		font-weight: 500;
	}

	.influence-value {
		font-size: 24px;
		font-weight: bold;
	}

	.social-stats {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.social-stats div {
		font-size: 14px;
		font-weight: 500;
	}

	@media (max-width: 768px) {
		.party-overview-overlay {
			padding: 10px;
		}

		.overview-header {
			padding: 20px;
		}

		.party-identity {
			flex-direction: column;
			align-items: flex-start;
			gap: 12px;
		}

		.overview-content {
			padding: 20px;
		}

		.key-stats {
			grid-template-columns: 1fr;
		}

		.demographic-grid {
			grid-template-columns: 1fr;
		}

		.positions-grid {
			grid-template-columns: 1fr;
		}

		.influence-stats {
			grid-template-columns: repeat(2, 1fr);
		}
	}
</style>