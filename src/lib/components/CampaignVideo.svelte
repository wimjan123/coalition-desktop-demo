<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { gameStore, createCampaignVideo } from '../stores/gameStore.js';
	import { DUTCH_ISSUES } from '../types/game.js';

	const dispatch = createEventDispatcher();

	// Form state
	let videoTitle = '';
	let selectedIssues: string[] = [];
	let positions: { [issueId: string]: number } = {};
	let tone: 'aggressive' | 'moderate' | 'empathetic' = 'moderate';

	$: player = $gameStore?.player;
	$: party = $gameStore?.playerParty;
	$: campaignBudget = $gameStore?.campaignBudget || 0;
	$: currentDay = $gameStore?.currentDay || 1;

	// Initialize positions for party's existing positions
	$: if (party && party.positions) {
		party.positions.forEach(pos => {
			if (positions[pos.issueId] === undefined) {
				positions[pos.issueId] = pos.position;
			}
		});
	}

	function toggleIssue(issueId: string) {
		if (selectedIssues.includes(issueId)) {
			selectedIssues = selectedIssues.filter(id => id !== issueId);
		} else if (selectedIssues.length < 3) {
			selectedIssues = [...selectedIssues, issueId];
		}
	}

	function updatePosition(issueId: string, position: number) {
		positions[issueId] = position;
	}

	function createVideo() {
		if (!canCreateVideo) return;

		const video = {
			title: videoTitle,
			selectedIssues,
			positions: Object.fromEntries(
				selectedIssues.map(issueId => [issueId, positions[issueId] || 0])
			),
			tone
		};

		createCampaignVideo(video, videoCost);
		dispatch('videoCreated');
	}

	function cancel() {
		dispatch('cancel');
	}

	function getPositionLabel(position: number): string {
		if (position < -60) return 'Far Left';
		if (position < -20) return 'Left';
		if (position <= 20) return 'Center';
		if (position <= 60) return 'Right';
		return 'Far Right';
	}

	function getPositionColor(position: number): string {
		if (position < -60) return '#dc2626';
		if (position < -20) return '#ea580c';
		if (position <= 20) return '#6b7280';
		if (position <= 60) return '#2563eb';
		return '#1e40af';
	}

	// Calculate video cost based on tone and number of issues
	$: videoCost = (() => {
		const baseCost = 8000; // Base cost for campaign video production
		const issueMultiplier = selectedIssues.length * 500; // Additional cost per issue covered
		const toneMultiplier = tone === 'aggressive' ? 1.2 : tone === 'empathetic' ? 1.1 : 1.0; // Professional tone is standard
		return Math.round((baseCost + issueMultiplier) * toneMultiplier);
	})();

	$: canCreateVideo = videoTitle.trim().length > 0 &&
					   selectedIssues.length > 0 &&
					   campaignBudget >= videoCost;
</script>

<div class="video-creator-overlay">
	<div class="video-creator-window">
		<div class="window-header">
			<div class="window-controls">
				<div class="control-btn red" on:click={cancel}></div>
				<div class="control-btn yellow"></div>
				<div class="control-btn green"></div>
			</div>
			<div class="window-title">Create Campaign Video</div>
		</div>

		<div class="creator-content">
			<div class="campaign-info">
				<div class="info-item">
					<span class="label">Day:</span>
					<span class="value">{currentDay}</span>
				</div>
				<div class="info-item">
					<span class="label">Budget:</span>
					<span class="value">€{campaignBudget.toLocaleString()}</span>
				</div>
				<div class="info-item">
					<span class="label">Video Cost:</span>
					<span class="value cost">€{videoCost.toLocaleString()}</span>
				</div>
			</div>

			<div class="form-section">
				<h3>Video Details</h3>
				<div class="form-group">
					<label for="video-title">Campaign Video Title</label>
					<input
						id="video-title"
						type="text"
						bind:value={videoTitle}
						placeholder="e.g., 'Building a Stronger Netherlands'"
						maxlength="60"
					/>
				</div>

				<div class="form-group">
					<label for="tone">Tone & Style</label>
					<select id="tone" bind:value={tone}>
						<option value="moderate">Moderate & Professional</option>
						<option value="empathetic">Empathetic & Personal</option>
						<option value="aggressive">Bold & Assertive</option>
					</select>
					<div class="tone-description">
						{#if tone === 'moderate'}
							<small>Professional tone appeals to mainstream voters and shows competence</small>
						{:else if tone === 'empathetic'}
							<small>Emotional connection works well with younger, educated demographics</small>
						{:else if tone === 'aggressive'}
							<small>Strong stance resonates with seniors and working-class voters</small>
						{/if}
					</div>
				</div>
			</div>

			<div class="form-section">
				<h3>Select Issues (Choose 1-3)</h3>
				<div class="issues-grid">
					{#each DUTCH_ISSUES as issue}
						<button
							class="issue-card"
							class:selected={selectedIssues.includes(issue.id)}
							class:disabled={!selectedIssues.includes(issue.id) && selectedIssues.length >= 3}
							on:click={() => toggleIssue(issue.id)}
						>
							<div class="issue-name">{issue.name}</div>
							<div class="issue-description">{issue.description}</div>
						</button>
					{/each}
				</div>
			</div>

			{#if selectedIssues.length > 0}
				<div class="form-section">
					<h3>Your Position on Selected Issues</h3>
					{#each selectedIssues as issueId}
						{@const issue = DUTCH_ISSUES.find(i => i.id === issueId)}
						{@const currentPosition = positions[issueId] || 0}
						{#if issue}
							<div class="position-setting">
								<div class="position-header">
									<h4>{issue.name}</h4>
									<div class="position-indicator" style="color: {getPositionColor(currentPosition)}">
										{getPositionLabel(currentPosition)}
									</div>
								</div>

								<div class="spectrum-labels">
									<span class="left-label">{issue.spectrum.left}</span>
									<span class="right-label">{issue.spectrum.right}</span>
								</div>

								<input
									type="range"
									min="-100"
									max="100"
									step="5"
									value={currentPosition}
									on:input={(e) => updatePosition(issueId, parseInt(e.target.value))}
									class="position-slider"
								/>

								<div class="position-value">
									Position: {currentPosition > 0 ? '+' : ''}{currentPosition}
								</div>
							</div>
						{/if}
					{/each}
				</div>
			{/if}

			<div class="action-section">
				{#if !canCreateVideo}
					<div class="validation-messages">
						{#if videoTitle.trim().length === 0}
							<p class="error">⚠️ Please enter a video title</p>
						{/if}
						{#if selectedIssues.length === 0}
							<p class="error">⚠️ Please select at least one issue</p>
						{/if}
						{#if campaignBudget < videoCost}
							<p class="error">⚠️ Insufficient budget (need €{videoCost.toLocaleString()})</p>
						{/if}
					</div>
				{/if}

				<div class="button-group">
					<button class="btn-secondary" on:click={cancel}>
						Cancel
					</button>
					<button
						class="btn-primary"
						on:click={createVideo}
						disabled={!canCreateVideo}
					>
						Create Video (€{videoCost.toLocaleString()})
					</button>
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	.video-creator-overlay {
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

	.video-creator-window {
		background: white;
		border-radius: 12px;
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
		max-width: 800px;
		width: 100%;
		max-height: 90vh;
		overflow-y: auto;
		border: 1px solid #e5e7eb;
	}

	.window-header {
		background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
		color: white;
		padding: 12px 20px;
		border-radius: 12px 12px 0 0;
		display: flex;
		align-items: center;
		justify-content: space-between;
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
		cursor: pointer;
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
	}

	.creator-content {
		padding: 24px;
	}

	.campaign-info {
		display: flex;
		gap: 20px;
		margin-bottom: 24px;
		padding: 16px;
		background: #f8fafc;
		border-radius: 8px;
		border: 1px solid #e2e8f0;
	}

	.info-item {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.label {
		font-size: 12px;
		color: #6b7280;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.value {
		font-weight: 600;
		color: #1f2937;
	}

	.value.cost {
		color: #dc2626;
	}

	.form-section {
		margin-bottom: 24px;
	}

	.form-section h3 {
		color: #1f2937;
		margin-bottom: 16px;
		font-size: 18px;
	}

	.form-group {
		margin-bottom: 16px;
	}

	.form-group label {
		display: block;
		margin-bottom: 6px;
		font-weight: 500;
		color: #374151;
	}

	.form-group input,
	.form-group select {
		width: 100%;
		padding: 12px;
		border: 1px solid #d1d5db;
		border-radius: 6px;
		font-size: 14px;
	}

	.form-group input:focus,
	.form-group select:focus {
		outline: none;
		border-color: #3b82f6;
		box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
	}

	.tone-description {
		margin-top: 6px;
	}

	.tone-description small {
		color: #6b7280;
		font-style: italic;
	}

	.issues-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 12px;
	}

	.issue-card {
		background: white;
		border: 2px solid #e5e7eb;
		border-radius: 8px;
		padding: 16px;
		cursor: pointer;
		transition: all 0.2s;
		text-align: left;
	}

	.issue-card:hover:not(.disabled) {
		border-color: #3b82f6;
		box-shadow: 0 2px 8px rgba(59, 130, 246, 0.1);
	}

	.issue-card.selected {
		border-color: #3b82f6;
		background: #eff6ff;
	}

	.issue-card.disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.issue-name {
		font-weight: 600;
		color: #1f2937;
		margin-bottom: 6px;
	}

	.issue-description {
		font-size: 13px;
		color: #6b7280;
		line-height: 1.4;
	}

	.position-setting {
		background: #f8fafc;
		border: 1px solid #e2e8f0;
		border-radius: 8px;
		padding: 20px;
		margin-bottom: 16px;
	}

	.position-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 16px;
	}

	.position-header h4 {
		margin: 0;
		color: #1f2937;
	}

	.position-indicator {
		font-weight: 600;
		font-size: 14px;
	}

	.spectrum-labels {
		display: flex;
		justify-content: space-between;
		margin-bottom: 8px;
		font-size: 12px;
		color: #6b7280;
	}

	.position-slider {
		width: 100%;
		margin-bottom: 12px;
	}

	.position-value {
		text-align: center;
		font-weight: 500;
		color: #374151;
	}

	.action-section {
		border-top: 1px solid #e5e7eb;
		padding-top: 20px;
		margin-top: 24px;
	}

	.validation-messages {
		margin-bottom: 16px;
	}

	.error {
		color: #dc2626;
		font-size: 14px;
		margin: 4px 0;
	}

	.button-group {
		display: flex;
		gap: 12px;
		justify-content: flex-end;
	}

	.btn-primary,
	.btn-secondary {
		padding: 12px 24px;
		border-radius: 6px;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s;
		border: none;
	}

	.btn-primary {
		background: #3b82f6;
		color: white;
	}

	.btn-primary:hover:not(:disabled) {
		background: #2563eb;
	}

	.btn-primary:disabled {
		background: #9ca3af;
		cursor: not-allowed;
	}

	.btn-secondary {
		background: #f3f4f6;
		color: #374151;
		border: 1px solid #d1d5db;
	}

	.btn-secondary:hover {
		background: #e5e7eb;
	}

	@media (max-width: 768px) {
		.video-creator-overlay {
			padding: 10px;
		}

		.issues-grid {
			grid-template-columns: 1fr;
		}

		.campaign-info {
			flex-direction: column;
			gap: 12px;
		}

		.button-group {
			flex-direction: column;
		}
	}
</style>