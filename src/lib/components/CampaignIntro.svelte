<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { gameStore } from '../stores/gameStore.js';

	const dispatch = createEventDispatcher();

	function startCampaign() {
		dispatch('start');
	}

	$: player = $gameStore?.player;
	$: party = $gameStore?.playerParty;
	$: currentCrisis = $gameStore?.currentCrisis;
	$: daysUntilElection = $gameStore?.daysUntilElection || 60;
	const electionDate = new Date();
	electionDate.setDate(electionDate.getDate() + daysUntilElection);
</script>

<div class="intro-overlay">
	<div class="intro-window">
		<div class="window-header">
			<div class="window-controls">
				<div class="control-btn red"></div>
				<div class="control-btn yellow"></div>
				<div class="control-btn green"></div>
			</div>
			<div class="window-title">NOS BREAKING NEWS</div>
		</div>

		<div class="news-content">
			<div class="breaking-banner">
				<span class="breaking-text">🔴 BREAKING</span>
				<div class="breaking-ticker">{currentCrisis?.headline}</div>
			</div>

			<div class="news-body">
				<div class="lead-story">
					<h1 class="headline">{currentCrisis?.headline}</h1>
					<p class="story-text">{currentCrisis?.description}</p>

					<div class="urgent-notice">
						<h2>🗳️ SNAP ELECTIONS CALLED</h2>
						<p>King Willem-Alexander has dissolved Parliament and called for immediate elections.</p>
						<div class="election-countdown">
							<div class="countdown-item">
								<span class="countdown-number">{daysUntilElection}</span>
								<span class="countdown-label">Days Until Election</span>
							</div>
							<div class="countdown-item">
								<span class="countdown-number">{electionDate.toLocaleDateString('nl-NL')}</span>
								<span class="countdown-label">Election Date</span>
							</div>
						</div>
					</div>

					<div class="player-intro">
						<h3>Your Opportunity</h3>
						<p>
							As leader of <strong>{party?.name}</strong>, this crisis presents both opportunity and challenge.
							<strong>{player?.name}</strong>, your {player?.background.toLowerCase()} background has prepared you for this moment.
						</p>
						<p>
							The Dutch people are looking for new leadership. Can you capitalize on the chaos,
							build a winning coalition, and guide the Netherlands through these turbulent times?
						</p>
					</div>

					<div class="challenge-preview">
						<h4>🎯 Your Campaign Goals:</h4>
						<ul>
							<li>Build name recognition and party support</li>
							<li>Position yourself on key issues dividing the nation</li>
							<li>Form strategic alliances with other parties</li>
							<li>Navigate media coverage and public opinion</li>
							<li>Win enough seats to lead coalition negotiations</li>
						</ul>
					</div>
				</div>
			</div>

			<div class="action-section">
				<button class="start-campaign-btn" on:click={startCampaign}>
					<span class="btn-icon">🚀</span>
					BEGIN CAMPAIGN
				</button>
				<p class="campaign-subtitle">
					Time is running out. Every decision matters.
				</p>
			</div>
		</div>
	</div>
</div>

<style>
	.intro-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.95);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 3000;
		animation: fadeIn 0.5s ease-out;
	}

	.intro-window {
		background: #ffffff;
		border-radius: 12px;
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
		max-width: 800px;
		max-height: 90vh;
		overflow-y: auto;
		margin: 20px;
		border: 1px solid #e5e7eb;
	}

	.window-header {
		background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
		color: white;
		padding: 12px 20px;
		border-radius: 12px 12px 0 0;
		display: flex;
		align-items: center;
		justify-content: space-between;
		position: relative;
	}

	.window-controls {
		display: flex;
		gap: 8px;
	}

	.control-btn {
		width: 12px;
		height: 12px;
		border-radius: 50%;
		border: 1px solid rgba(255, 255, 255, 0.3);
	}

	.control-btn.red { background: #ff5f56; }
	.control-btn.yellow { background: #ffbd2e; }
	.control-btn.green { background: #27ca3f; }

	.window-title {
		position: absolute;
		left: 50%;
		transform: translateX(-50%);
		font-weight: 600;
		font-size: 14px;
		letter-spacing: 0.5px;
	}

	.news-content {
		padding: 0;
	}

	.breaking-banner {
		background: #dc2626;
		color: white;
		padding: 12px 20px;
		display: flex;
		align-items: center;
		gap: 15px;
		animation: pulse 2s infinite;
	}

	.breaking-text {
		background: #fbbf24;
		color: #dc2626;
		padding: 4px 8px;
		border-radius: 4px;
		font-weight: 700;
		font-size: 12px;
	}

	.breaking-ticker {
		font-weight: 600;
		flex: 1;
		overflow: hidden;
		white-space: nowrap;
	}

	.news-body {
		padding: 30px;
	}

	.headline {
		font-size: 28px;
		font-weight: 700;
		line-height: 1.2;
		margin-bottom: 20px;
		color: #111827;
	}

	.story-text {
		font-size: 16px;
		line-height: 1.6;
		color: #374151;
		margin-bottom: 30px;
	}

	.urgent-notice {
		background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
		border: 2px solid #f59e0b;
		border-radius: 12px;
		padding: 24px;
		margin-bottom: 30px;
		text-align: center;
	}

	.urgent-notice h2 {
		color: #92400e;
		font-size: 20px;
		font-weight: 700;
		margin-bottom: 12px;
	}

	.election-countdown {
		display: flex;
		justify-content: center;
		gap: 40px;
		margin-top: 20px;
	}

	.countdown-item {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.countdown-number {
		font-size: 32px;
		font-weight: 700;
		color: #dc2626;
		line-height: 1;
	}

	.countdown-label {
		font-size: 12px;
		color: #6b7280;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		margin-top: 4px;
	}

	.player-intro {
		background: #f8fafc;
		border-left: 4px solid #3b82f6;
		padding: 20px;
		margin-bottom: 24px;
		border-radius: 0 8px 8px 0;
	}

	.player-intro h3 {
		color: #1f2937;
		font-size: 18px;
		margin-bottom: 12px;
	}

	.player-intro p {
		color: #4b5563;
		line-height: 1.6;
		margin-bottom: 12px;
	}

	.challenge-preview {
		background: #ffffff;
		border: 1px solid #e5e7eb;
		border-radius: 8px;
		padding: 20px;
		margin-bottom: 30px;
	}

	.challenge-preview h4 {
		color: #1f2937;
		font-size: 16px;
		margin-bottom: 12px;
	}

	.challenge-preview ul {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.challenge-preview li {
		padding: 6px 0;
		color: #4b5563;
		position: relative;
		padding-left: 20px;
	}

	.challenge-preview li::before {
		content: "▶";
		position: absolute;
		left: 0;
		color: #3b82f6;
		font-size: 12px;
	}

	.action-section {
		text-align: center;
		padding: 30px;
		background: #f9fafb;
		border-radius: 0 0 12px 12px;
	}

	.start-campaign-btn {
		background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
		color: white;
		border: none;
		padding: 16px 32px;
		border-radius: 8px;
		font-size: 18px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
		display: inline-flex;
		align-items: center;
		gap: 10px;
		box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
	}

	.start-campaign-btn:hover {
		transform: translateY(-2px);
		box-shadow: 0 6px 20px rgba(220, 38, 38, 0.4);
	}

	.start-campaign-btn:active {
		transform: translateY(0);
	}

	.btn-icon {
		font-size: 20px;
	}

	.campaign-subtitle {
		margin-top: 16px;
		color: #6b7280;
		font-style: italic;
	}

	@keyframes fadeIn {
		from { opacity: 0; }
		to { opacity: 1; }
	}

	@keyframes pulse {
		0%, 100% { opacity: 1; }
		50% { opacity: 0.8; }
	}

	@media (max-width: 768px) {
		.intro-window {
			margin: 10px;
			max-height: 95vh;
		}

		.headline {
			font-size: 22px;
		}

		.election-countdown {
			flex-direction: column;
			gap: 20px;
		}

		.countdown-number {
			font-size: 24px;
		}
	}
</style>