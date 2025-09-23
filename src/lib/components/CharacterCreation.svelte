<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { PlayerCharacter, Party, PoliticalPosition, StartingScenario, InterviewPerformanceSummary } from '../types/game.js';
	import { CHARACTER_BACKGROUNDS, DUTCH_ISSUES, PERSONALITY_TRAITS } from '../types/game.js';
	import MediaInterview from './MediaInterview.svelte';
	import ScenarioSelection from './ScenarioSelection.svelte';

	const dispatch = createEventDispatcher<{
		complete: {
			player: PlayerCharacter;
			party: Party;
			scenario: StartingScenario;
			background: typeof CHARACTER_BACKGROUNDS[number];
			interview: InterviewPerformanceSummary;
		};
	}>();

	// Character creation state
	let currentStep = 0; // Start with scenario selection
	const totalSteps = 5; // Steps 0-4, 5 steps total

	// Scenario data
	let selectedScenario: StartingScenario | null = null;

	// Character data
	let characterName = '';
	let characterAge = 45;
	let selectedBackground = CHARACTER_BACKGROUNDS[0];
	let showConfirmationDialog = false;
	let pendingBackground: typeof CHARACTER_BACKGROUNDS[0] | null = null;
	let selectedTraits: string[] = [];

	// Party data
	let partyName = '';
	let partyShortName = '';
	let partyColor = '#3b82f6';
	let partyDescription = '';

	// Political positions
	let positions: PoliticalPosition[] = DUTCH_ISSUES.map(issue => ({
		issueId: issue.id,
		position: 0, // Neutral starting position
		priority: 3  // Medium priority
	}));
	let interviewSummary: InterviewPerformanceSummary | null = null;

	// Computed stats based on background and traits
	$: stats = {
		charisma: 5 + (selectedBackground.bonuses?.charisma || 0) +
			(selectedTraits.includes('charismatic') ? 2 : 0) +
			(selectedTraits.includes('empathetic') ? 1 : 0) +
			(selectedTraits.includes('populist') ? 1 : 0) +
			(selectedTraits.includes('bold') ? 1 : 0),
		integrity: 5 + (selectedBackground.bonuses?.integrity || 0) +
			(selectedTraits.includes('principled') ? 2 : 0) +
			(selectedTraits.includes('honest') ? 2 : 0) +
			(selectedTraits.includes('idealistic') ? 1 : 0) +
			(selectedTraits.includes('patient') ? 1 : 0),
		negotiation: 5 + (selectedBackground.bonuses?.negotiation || 0) +
			(selectedTraits.includes('diplomatic') ? 2 : 0) +
			(selectedTraits.includes('strategic') ? 1 : 0) +
			(selectedTraits.includes('calculating') ? 1 : 0) +
			(selectedTraits.includes('pragmatic') ? 1 : 0) +
			(selectedTraits.includes('cautious') ? 1 : 0),
		experience: (selectedBackground.bonuses?.experience || 0) +
			(selectedTraits.includes('analytical') ? 3 : 0) +
			(selectedTraits.includes('ambitious') ? 2 : 0) +
			(selectedTraits.includes('aggressive') ? 2 : 0) +
			(selectedTraits.includes('elitist') ? 2 : 0) +
			(selectedTraits.includes('impulsive') ? -2 : 0)
	};

	// Reactive validation - triggers whenever form values change
	$: canProceedToNextStep = (() => {
		switch (currentStep) {
			case 0: return selectedScenario !== null;
			case 1: return characterName.trim().length > 0 && characterAge >= 25;
			case 2: return selectedTraits.length >= 2;
			case 3: return partyName.trim().length > 0 && partyShortName.trim().length > 0;
			case 4: return true;
			default: return false;
		}
	})();

	function selectBackground(background: typeof CHARACTER_BACKGROUNDS[0]) {
		if (background.riskLevel === 'high' || background.riskLevel === 'extreme') {
			pendingBackground = background;
			showConfirmationDialog = true;
		} else {
			selectedBackground = background;
		}
	}

	function confirmBackgroundSelection() {
		if (pendingBackground) {
			selectedBackground = pendingBackground;
			pendingBackground = null;
		}
		showConfirmationDialog = false;
	}

	function cancelBackgroundSelection() {
		pendingBackground = null;
		showConfirmationDialog = false;
	}

	function getRiskColor(riskLevel?: string): string {
		switch (riskLevel) {
			case 'low': return 'text-green-600 bg-green-50 border-green-200';
			case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
			case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
			case 'extreme': return 'text-red-600 bg-red-50 border-red-200';
			default: return 'text-gray-600 bg-gray-50 border-gray-200';
		}
	}

	function getRiskLabel(riskLevel?: string): string {
		return (riskLevel ?? 'low').toUpperCase();
	}

	function getModifierDisplay(value: number): string {
		if (value === 0) return '±0';
		return value > 0 ? `+${value}` : `${value}`;
	}

	function toggleTrait(trait: string) {
		if (selectedTraits.includes(trait)) {
			selectedTraits = selectedTraits.filter(t => t !== trait);
		} else if (selectedTraits.length < 3) {
			selectedTraits = [...selectedTraits, trait];
		}
	}

	function updatePosition(issueId: string, position: number) {
		positions = positions.map(p =>
			p.issueId === issueId ? { ...p, position } : p
		);
	}

	function updatePriority(issueId: string, priority: number) {
		positions = positions.map(p =>
			p.issueId === issueId ? { ...p, priority } : p
		);
	}

	function handleInterviewComplete(event: CustomEvent<InterviewPerformanceSummary>) {
		interviewSummary = event.detail;
		positions = event.detail.positions;
		completeCreation();
	}

	function nextStep() {
		if (currentStep < totalSteps) {
			currentStep++;
		}
	}

	function prevStep() {
		if (currentStep > 0) {
			currentStep--;
		}
	}

	function handleScenarioSelect(event: CustomEvent<{ scenario: StartingScenario }>) {
		selectedScenario = event.detail.scenario;
		nextStep();
	}


	function completeCreation() {
		const defaultMood = selectedScenario ? [selectedScenario.interviewerTone] : ['neutral'];
		const interview: InterviewPerformanceSummary = interviewSummary ?? {
			positions,
			scores: {
				consistency: 60,
				confidence: 60,
				authenticity: 60
			},
			rating: {
				score: 60,
				grade: 'C',
				description: 'Baseline interview performance.'
			},
			tonePattern: [],
			interviewerMoodProgression: defaultMood,
			contradictions: []
		};

		const player: PlayerCharacter = {
			id: 'player',
			name: characterName.trim(),
			age: characterAge,
			background: selectedBackground.id,
			traits: selectedTraits,
			experience: stats.experience,
			charisma: Math.min(10, stats.charisma),
			integrity: Math.min(10, stats.integrity),
			negotiation: Math.min(10, stats.negotiation)
		};

		const party: Party = {
			id: 'player-party',
			name: partyName.trim(),
			shortName: partyShortName.trim().toUpperCase(),
			color: partyColor,
			description: partyDescription.trim(),
			positions,
			isPlayerParty: true
		};

		dispatch('complete', { player, party, scenario: selectedScenario!, background: selectedBackground, interview });
	}

	function getPositionLabel(position: number): string {
		if (position < -60) return 'Far Left';
		if (position < -20) return 'Left';
		if (position <= 20) return 'Center';
		if (position <= 60) return 'Right';
		return 'Far Right';
	}

	function getPositionColor(position: number): string {
		if (position < -60) return '#dc2626'; // Red
		if (position < -20) return '#ea580c'; // Orange-red
		if (position <= 20) return '#6b7280'; // Gray (center)
		if (position <= 60) return '#2563eb'; // Blue
		return '#1e40af'; // Dark blue
	}
</script>

<div class="character-creation-window">
	<!-- Window-style title bar -->
	<div class="window-title-bar">
		<div class="window-controls">
			<div class="control-btn red"></div>
			<div class="control-btn yellow"></div>
			<div class="control-btn green"></div>
		</div>
		<div class="window-title">COALITION - Character Creation</div>
		<div class="step-indicator">
			Step {currentStep + 1} of {totalSteps}
		</div>
	</div>

	<!-- Progress bar integrated into window -->
	<div class="progress-section">
		<div class="progress-bar">
			<div class="progress-fill" style="width: {((currentStep + 1) / totalSteps) * 100}%"></div>
		</div>
	</div>

	<div class="content">
		{#if currentStep === 0}
			<!-- Step 0: Scenario Selection -->
			<div class="step">
				<ScenarioSelection on:select={handleScenarioSelect} />
			</div>

		{:else if currentStep === 1}
			<!-- Step 1: Basic Character Info -->
			<div class="step">
				<h2>Personal Details</h2>
				<div class="form-group">
					<label for="name">Full Name</label>
					<input
						id="name"
						type="text"
						bind:value={characterName}
						placeholder="Enter your character's name"
						maxlength="50"
					/>
				</div>

				<div class="form-group">
					<label for="age">Age</label>
					<input
						id="age"
						type="range"
						min="25"
						max="75"
						bind:value={characterAge}
					/>
					<span class="age-display">{characterAge} years old</span>
				</div>

				<div class="form-group">
					<label>Professional Background</label>
					<div class="background-grid">
						{#each CHARACTER_BACKGROUNDS as background}
							<button
								class="background-card"
								class:selected={selectedBackground.id === background.id}
								on:click={() => selectBackground(background)}
							>
								<!-- Risk Level Badge -->
								<div class="background-header">
									<span class="risk-badge border {getRiskColor(background.riskLevel)}">
										{getRiskLabel(background.riskLevel)} RISK
									</span>
									{#if selectedBackground.id === background.id}
										<div class="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
											<svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
												<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
											</svg>
										</div>
									{/if}
								</div>

								<h3>{background.name}</h3>
								<p>{background.description}</p>

								<!-- Traits -->
								<div class="traits">
									{#each background.traits as trait}
										<span class="trait-tag">{trait}</span>
									{/each}
								</div>

								<!-- Stat Bonuses -->
								{#if background.bonuses}
									<div class="bonuses">
										<div class="bonus-title">Starting Bonuses:</div>
										<div class="bonus-grid">
											{#if background.bonuses.charisma}
												<span class="bonus-item">Charisma {getModifierDisplay(background.bonuses.charisma)}</span>
											{/if}
											{#if background.bonuses.integrity}
												<span class="bonus-item">Integrity {getModifierDisplay(background.bonuses.integrity)}</span>
											{/if}
											{#if background.bonuses.negotiation}
												<span class="bonus-item">Negotiation {getModifierDisplay(background.bonuses.negotiation)}</span>
											{/if}
											{#if background.bonuses.experience}
												<span class="bonus-item">Experience {getModifierDisplay(background.bonuses.experience)} yrs</span>
											{/if}
										</div>
									</div>
								{/if}

								<!-- Starting Penalties (for controversial backgrounds) -->
								{#if background.startingPenalties}
									<div class="penalties">
										<div class="penalty-title">Starting Challenges:</div>
										<div class="penalty-grid">
											{#each Object.entries(background.startingPenalties) as [key, value]}
												<span class="penalty-item">{key.replace(/([A-Z])/g, ' $1').trim()}: {getModifierDisplay(value)}</span>
											{/each}
										</div>
									</div>
								{/if}

								<!-- Unique Opportunities -->
								{#if background.uniqueOpportunities && background.uniqueOpportunities.length > 0}
									<div class="opportunities">
										<div class="opportunity-title">Special Actions:</div>
										<div class="opportunity-grid">
											{#each background.uniqueOpportunities as opportunity}
												<span class="opportunity-tag">{opportunity}</span>
											{/each}
										</div>
									</div>
								{/if}
							</button>
						{/each}
					</div>
				</div>
			</div>

		{:else if currentStep === 2}
			<!-- Step 2: Personality Traits -->
			<div class="step">
				<h2>Personality & Leadership Style</h2>
				<p class="instruction">Select 2-3 traits that define your leadership approach</p>

				<div class="traits-grid">
					{#each PERSONALITY_TRAITS as trait}
						<button
							class="trait-button"
							class:selected={selectedTraits.includes(trait)}
							class:disabled={!selectedTraits.includes(trait) && selectedTraits.length >= 3}
							on:click={() => toggleTrait(trait)}
						>
							{trait}
						</button>
					{/each}
				</div>

				<div class="stats-preview">
					<h3>Projected Stats</h3>
					<div class="stats">
						<div class="stat">
							<span>Charisma</span>
							<div class="stat-bar">
								<div class="stat-fill" style="width: {stats.charisma * 10}%"></div>
								<span class="stat-value">{stats.charisma}/10</span>
							</div>
						</div>
						<div class="stat">
							<span>Integrity</span>
							<div class="stat-bar">
								<div class="stat-fill" style="width: {stats.integrity * 10}%"></div>
								<span class="stat-value">{stats.integrity}/10</span>
							</div>
						</div>
						<div class="stat">
							<span>Negotiation</span>
							<div class="stat-bar">
								<div class="stat-fill" style="width: {stats.negotiation * 10}%"></div>
								<span class="stat-value">{stats.negotiation}/10</span>
							</div>
						</div>
						<div class="stat">
							<span>Experience</span>
							<div class="stat-bar">
								<div class="stat-fill" style="width: {Math.min(stats.experience, 20) * 5}%"></div>
								<span class="stat-value">{stats.experience} years</span>
							</div>
						</div>
					</div>
				</div>
			</div>

		{:else if currentStep === 3}
			<!-- Step 3: Create Party -->
			<div class="step">
				<h2>Establish Your Political Party</h2>

				<div class="form-row">
					<div class="form-group">
						<label for="party-name">Party Name</label>
						<input
							id="party-name"
							type="text"
							bind:value={partyName}
							placeholder="e.g., Progressive Democratic Alliance"
							maxlength="80"
						/>
					</div>

					<div class="form-group">
						<label for="party-short">Abbreviation</label>
						<input
							id="party-short"
							type="text"
							bind:value={partyShortName}
							placeholder="e.g., PDA"
							maxlength="6"
							style="text-transform: uppercase;"
						/>
					</div>
				</div>

				<div class="form-row">
					<div class="form-group">
						<label for="party-color">Party Color</label>
						<input
							id="party-color"
							type="color"
							bind:value={partyColor}
						/>
					</div>
				</div>

				<div class="form-group">
					<label for="party-description">Party Description</label>
					<textarea
						id="party-description"
						bind:value={partyDescription}
						placeholder="Brief description of your party's mission and values..."
						maxlength="200"
						rows="3"
					></textarea>
				</div>

				<div class="party-preview">
					<div class="party-card">
						<div class="party-header" style="background-color: {partyColor}">
							<h3>{partyName || 'Your Party Name'}</h3>
							<span class="party-abbreviation">{partyShortName || 'ABC'}</span>
						</div>
						<p>{partyDescription || 'Your party description will appear here.'}</p>
					</div>
				</div>
			</div>

		{:else if currentStep === 4}
			<!-- Step 4: Media Interview for Political Positions -->
			<div class="step">
				<h2>Live Political Interview</h2>
				<p class="instruction">Your responses will establish your party's political platform</p>

				<MediaInterview
					selectedScenario={selectedScenario!}
					selectedBackground={selectedBackground}
					on:complete={handleInterviewComplete}
				/>
			</div>
		{/if}
	</div>

	<!-- Desktop-style navigation footer (hidden during interview) -->
	{#if currentStep !== 4}
	<div class="navigation-footer">
		<div class="nav-left">
			{#if currentStep > 0}
				<button class="nav-btn secondary" on:click={prevStep}>
					← Previous
				</button>
			{/if}
		</div>

		<div class="nav-center">
			<div class="step-dots">
				{#each Array(totalSteps) as _, i}
					<div class="step-dot" class:active={i === currentStep} class:completed={i < currentStep}></div>
				{/each}
			</div>
		</div>

		<div class="nav-right">
			{#if currentStep === totalSteps}
				<button class="nav-btn primary" on:click={completeCreation} disabled={!canProceedToNextStep}>
					Launch Campaign →
				</button>
			{:else}
				<button class="nav-btn primary" on:click={nextStep} disabled={!canProceedToNextStep}>
					Next →
				</button>
			{/if}
		</div>
	</div>
	{/if}

	<!-- High-Risk Background Confirmation Dialog -->
	{#if showConfirmationDialog && pendingBackground}
		<div class="confirmation-overlay">
			<div class="confirmation-dialog">
				<div class="dialog-header">
					<h3>High-Risk Background Warning</h3>
					<svg class="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
						<path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
					</svg>
				</div>

				<div class="dialog-content">
					<h4>{pendingBackground.name}</h4>
					<p>{pendingBackground.description}</p>

					<div class="risk-warning">
						<span class="risk-badge-large {getRiskColor(pendingBackground.riskLevel)}">
							{getRiskLabel(pendingBackground.riskLevel)} RISK BACKGROUND
						</span>
					</div>

					<div class="warning-text">
						<p>This background comes with significant challenges that will affect your campaign:</p>
					</div>

					<!-- Starting Penalties -->
					{#if pendingBackground.startingPenalties}
						<div class="dialog-penalties">
							<h5>Starting Challenges:</h5>
							<ul>
								{#each Object.entries(pendingBackground.startingPenalties) as [key, value]}
									<li class="penalty-detail">
										<strong>{key.replace(/([A-Z])/g, ' $1').trim()}:</strong> {getModifierDisplay(value)}
									</li>
								{/each}
							</ul>
						</div>
					{/if}

					<!-- Unique Opportunities -->
					{#if pendingBackground.uniqueOpportunities && pendingBackground.uniqueOpportunities.length > 0}
						<div class="dialog-opportunities">
							<h5>Special Campaign Actions:</h5>
							<ul>
								{#each pendingBackground.uniqueOpportunities as opportunity}
									<li class="opportunity-detail">{opportunity}</li>
								{/each}
							</ul>
						</div>
					{/if}

					<div class="confirmation-question">
						<p><strong>Are you ready for this challenging but potentially rewarding path?</strong></p>
					</div>
				</div>

				<div class="dialog-actions">
					<button class="dialog-btn secondary" on:click={cancelBackgroundSelection}>
						Choose Different Background
					</button>
					<button class="dialog-btn primary" on:click={confirmBackgroundSelection}>
						Accept Challenge
					</button>
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	.character-creation-window {
		width: 90%;
		max-width: 1000px;
		height: 80vh;
		background: #ffffff;
		border-radius: 12px;
		box-shadow:
			0 25px 50px rgba(0, 0, 0, 0.25),
			0 0 0 1px rgba(0, 0, 0, 0.05);
		display: flex;
		flex-direction: column;
		overflow: hidden;
		border: 1px solid #d1d5db;
	}

	/* Window-style title bar */
	.window-title-bar {
		height: 44px;
		background: linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%);
		border-bottom: 1px solid #cbd5e1;
		display: flex;
		align-items: center;
		padding: 0 20px;
		user-select: none;
	}

	.window-controls {
		display: flex;
		gap: 8px;
		margin-right: 20px;
	}

	.control-btn {
		width: 12px;
		height: 12px;
		border-radius: 50%;
		border: 1px solid rgba(0, 0, 0, 0.1);
	}

	.control-btn.red { background: #ff5f57; }
	.control-btn.yellow { background: #ffbd2e; }
	.control-btn.green { background: #28ca42; }

	.window-title {
		flex: 1;
		font-size: 14px;
		font-weight: 600;
		color: #374151;
		text-align: center;
	}

	.step-indicator {
		font-size: 12px;
		color: #6b7280;
		font-weight: 500;
	}

	/* Progress section */
	.progress-section {
		height: 6px;
		background: #f1f5f9;
		border-bottom: 1px solid #e2e8f0;
	}

	.progress-bar {
		height: 100%;
		background: #f1f5f9;
		position: relative;
	}

	.progress-fill {
		height: 100%;
		background: linear-gradient(90deg, #3b82f6, #1e40af);
		transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
	}

	/* Content area */
	.content {
		flex: 1;
		overflow-y: auto;
		padding: 30px 40px;
		background: #ffffff;
	}

	.step h2 {
		margin: 0 0 8px 0;
		color: #1f2937;
		font-size: 24px;
		font-weight: 700;
	}

	.instruction {
		color: #6b7280;
		margin-bottom: 32px;
		font-size: 15px;
		line-height: 1.5;
	}

	/* Form styling */
	.form-group {
		margin-bottom: 24px;
	}

	.form-row {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 24px;
	}

	label {
		display: block;
		margin-bottom: 8px;
		font-weight: 600;
		color: #374151;
		font-size: 14px;
	}

	input[type="text"], input[type="color"], textarea {
		width: 100%;
		padding: 12px 16px;
		border: 2px solid #e5e7eb;
		border-radius: 8px;
		font-size: 15px;
		transition: all 0.2s ease;
		background: #ffffff;
		box-sizing: border-box;
	}

	input[type="text"]:focus, textarea:focus {
		outline: none;
		border-color: #3b82f6;
		box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
	}

	input[type="range"] {
		width: 100%;
		margin: 12px 0;
		height: 6px;
		border-radius: 3px;
		background: #e5e7eb;
		outline: none;
		-webkit-appearance: none;
	}

	input[type="range"]::-webkit-slider-thumb {
		appearance: none;
		width: 20px;
		height: 20px;
		border-radius: 50%;
		background: #3b82f6;
		cursor: pointer;
		border: 2px solid white;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
	}

	.age-display {
		color: #6b7280;
		font-weight: 500;
		margin-top: 8px;
		font-size: 14px;
	}

	.background-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
		gap: 20px;
		margin-bottom: 20px;
	}

	.background-card {
		padding: 20px;
		border: 2px solid #e5e7eb;
		border-radius: 12px;
		background: #ffffff;
		cursor: pointer;
		transition: all 0.2s ease;
		text-align: left;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
	}

	.background-card:hover {
		border-color: #3b82f6;
		transform: translateY(-2px);
		box-shadow: 0 8px 25px rgba(59, 130, 246, 0.15);
	}

	.background-card.selected {
		border-color: #3b82f6;
		background: #eff6ff;
		box-shadow: 0 4px 20px rgba(59, 130, 246, 0.2);
	}

	.background-card h3 {
		margin: 0 0 8px 0;
		color: #1f2937;
		font-size: 1.1rem;
	}

	.background-card p {
		margin: 0 0 12px 0;
		color: #6b7280;
		font-size: 0.9rem;
	}

	.traits {
		display: flex;
		gap: 6px;
		flex-wrap: wrap;
	}

	.trait-tag {
		background: #3b82f6;
		color: white;
		padding: 2px 8px;
		border-radius: 12px;
		font-size: 0.75rem;
	}

	.traits-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
		gap: 10px;
		margin-bottom: 30px;
	}

	.trait-button {
		padding: 12px;
		border: 2px solid #e5e7eb;
		border-radius: 8px;
		background: white;
		cursor: pointer;
		transition: all 0.2s;
		font-size: 14px;
		text-transform: capitalize;
	}

	.trait-button:hover:not(.disabled) {
		border-color: #3b82f6;
	}

	.trait-button.selected {
		border-color: #3b82f6;
		background: #3b82f6;
		color: white;
	}

	.trait-button.disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.stats-preview {
		background: #f9fafb;
		padding: 20px;
		border-radius: 12px;
	}

	.stats-preview h3 {
		margin: 0 0 15px 0;
		color: #1f2937;
	}

	.stat {
		display: flex;
		align-items: center;
		margin-bottom: 12px;
		gap: 15px;
	}

	.stat span:first-child {
		width: 100px;
		font-weight: 500;
		color: #374151;
	}

	.stat-bar {
		flex: 1;
		height: 20px;
		background: #e5e7eb;
		border-radius: 10px;
		position: relative;
		overflow: hidden;
	}

	.stat-fill {
		height: 100%;
		background: linear-gradient(90deg, #10b981, #059669);
		transition: width 0.3s ease;
	}

	.stat-value {
		position: absolute;
		right: 8px;
		top: 50%;
		transform: translateY(-50%);
		font-size: 12px;
		font-weight: 600;
		color: #1f2937;
	}

	.party-preview {
		margin-top: 20px;
	}

	.party-card {
		border: 2px solid #e5e7eb;
		border-radius: 12px;
		overflow: hidden;
		background: white;
	}

	.party-header {
		padding: 16px;
		color: white;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.party-header h3 {
		margin: 0;
		font-size: 1.2rem;
	}

	.party-abbreviation {
		background: rgba(255, 255, 255, 0.2);
		padding: 4px 12px;
		border-radius: 20px;
		font-weight: bold;
		font-size: 0.9rem;
	}

	.party-card p {
		padding: 16px;
		margin: 0;
		color: #6b7280;
	}


	/* Navigation footer */
	.navigation-footer {
		height: 80px;
		background: linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%);
		border-top: 1px solid #cbd5e1;
		display: grid;
		grid-template-columns: 1fr auto 1fr;
		align-items: center;
		padding: 0 40px;
		gap: 20px;
	}

	.nav-left {
		justify-self: start;
	}

	.nav-center {
		justify-self: center;
	}

	.nav-right {
		justify-self: end;
	}

	.nav-btn {
		padding: 12px 24px;
		border-radius: 8px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
		border: none;
		font-size: 14px;
		min-width: 120px;
	}

	.nav-btn.primary {
		background: #3b82f6;
		color: white;
		box-shadow: 0 2px 4px rgba(59, 130, 246, 0.2);
	}

	.nav-btn.primary:hover:not(:disabled) {
		background: #2563eb;
		transform: translateY(-1px);
		box-shadow: 0 4px 8px rgba(59, 130, 246, 0.3);
	}

	.nav-btn.secondary {
		background: #6b7280;
		color: white;
		box-shadow: 0 2px 4px rgba(107, 114, 128, 0.2);
	}

	.nav-btn.secondary:hover:not(:disabled) {
		background: #4b5563;
		transform: translateY(-1px);
	}

	.nav-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
		transform: none !important;
		box-shadow: none !important;
	}

	/* Step dots */
	.step-dots {
		display: flex;
		gap: 8px;
		align-items: center;
	}

	.step-dot {
		width: 10px;
		height: 10px;
		border-radius: 50%;
		background: #cbd5e1;
		transition: all 0.3s ease;
	}

	.step-dot.active {
		background: #3b82f6;
		transform: scale(1.2);
	}

	.step-dot.completed {
		background: #10b981;
	}

	/* Enhanced Background Cards */
	.background-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 8px;
	}

	.risk-badge {
		font-size: 0.7rem;
		font-weight: 600;
		padding: 2px 6px;
		border-radius: 4px;
		border-width: 1px;
	}

	.bonuses, .penalties, .opportunities {
		margin-top: 8px;
		font-size: 0.75rem;
	}

	.bonus-title, .penalty-title, .opportunity-title {
		font-weight: 600;
		margin-bottom: 4px;
		color: #374151;
	}

	.bonus-grid, .penalty-grid {
		display: flex;
		flex-wrap: wrap;
		gap: 3px;
	}

	.bonus-item {
		background: #dcfce7;
		color: #166534;
		padding: 1px 4px;
		border-radius: 3px;
		font-size: 0.65rem;
		font-weight: 500;
	}

	.penalty-item {
		background: #fef2f2;
		color: #dc2626;
		padding: 1px 4px;
		border-radius: 3px;
		font-size: 0.65rem;
		font-weight: 500;
	}

	.opportunity-grid {
		display: flex;
		flex-wrap: wrap;
		gap: 3px;
	}

	.opportunity-tag {
		background: #dbeafe;
		color: #1d4ed8;
		padding: 1px 4px;
		border-radius: 3px;
		font-size: 0.65rem;
		font-weight: 500;
	}

	/* Confirmation Dialog */
	.confirmation-overlay {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
	}

	.confirmation-dialog {
		background: white;
		border-radius: 12px;
		max-width: 500px;
		width: 90%;
		max-height: 80vh;
		overflow-y: auto;
		box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
	}

	.dialog-header {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 20px 20px 0 20px;
		border-bottom: 1px solid #e5e7eb;
		margin-bottom: 16px;
	}

	.dialog-header h3 {
		font-size: 1.25rem;
		font-weight: 600;
		color: #374151;
		margin: 0;
	}

	.dialog-content {
		padding: 0 20px;
	}

	.dialog-content h4 {
		font-size: 1.1rem;
		font-weight: 600;
		color: #111827;
		margin: 0 0 8px 0;
	}

	.dialog-content > p {
		color: #6b7280;
		margin-bottom: 16px;
		line-height: 1.5;
	}

	.risk-warning {
		text-align: center;
		margin: 16px 0;
	}

	.risk-badge-large {
		font-size: 0.875rem;
		font-weight: 700;
		padding: 8px 16px;
		border-radius: 8px;
		border-width: 2px;
	}

	.warning-text {
		background: #fef3c7;
		border: 1px solid #f59e0b;
		border-radius: 6px;
		padding: 12px;
		margin: 16px 0;
	}

	.warning-text p {
		margin: 0;
		color: #92400e;
		font-weight: 500;
	}

	.dialog-penalties, .dialog-opportunities {
		margin: 16px 0;
	}

	.dialog-penalties h5, .dialog-opportunities h5 {
		font-size: 0.875rem;
		font-weight: 600;
		color: #374151;
		margin: 0 0 8px 0;
	}

	.dialog-penalties ul, .dialog-opportunities ul {
		margin: 0;
		padding-left: 20px;
		list-style-type: disc;
	}

	.penalty-detail {
		color: #dc2626;
		margin-bottom: 4px;
	}

	.opportunity-detail {
		color: #059669;
		margin-bottom: 4px;
	}

	.confirmation-question {
		background: #f3f4f6;
		border-radius: 6px;
		padding: 12px;
		margin: 16px 0;
		text-align: center;
	}

	.confirmation-question p {
		margin: 0;
		color: #374151;
	}

	.dialog-actions {
		display: flex;
		gap: 12px;
		padding: 20px;
		border-top: 1px solid #e5e7eb;
	}

	.dialog-btn {
		flex: 1;
		padding: 10px 16px;
		border: none;
		border-radius: 6px;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.dialog-btn.primary {
		background: #dc2626;
		color: white;
	}

	.dialog-btn.primary:hover {
		background: #b91c1c;
	}

	.dialog-btn.secondary {
		background: #e5e7eb;
		color: #374151;
	}

	.dialog-btn.secondary:hover {
		background: #d1d5db;
	}
</style>
