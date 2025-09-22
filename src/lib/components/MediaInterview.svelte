<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { DUTCH_ISSUES } from '../types/game.js';
	import type { PoliticalPosition } from '../types/game.js';

	const dispatch = createEventDispatcher();

	// Interview state
	let currentQuestionIndex = 0;
	let isComplete = false;
	let positions: PoliticalPosition[] = [];
	let interviewStarted = false;

	// Interview questions that feel like real political scenarios
	const interviewQuestions = [
		{
			id: 'climate-intro',
			issueId: 'climate',
			scenario: "Good evening, and welcome to 'Political Spotlight.' The Netherlands faces mounting pressure to meet climate targets while maintaining economic growth. A major chemical company in your constituency is threatening to move operations abroad if stricter environmental regulations are imposed, potentially costing 2,000 jobs.",
			question: "How would you balance environmental protection with economic concerns?",
			options: [
				{
					text: "Environmental protection must come first. We need to accelerate the green transition and help workers retrain for clean energy jobs.",
					position: -75,
					priority: 5
				},
				{
					text: "We should work with industry to find sustainable solutions that protect both the environment and jobs through innovation incentives.",
					position: -25,
					priority: 4
				},
				{
					text: "Economic stability is crucial. We should pursue gradual environmental improvements that don't threaten existing employment.",
					position: 25,
					priority: 3
				},
				{
					text: "Market forces should determine the pace of change. Government interference in business decisions hurts our competitiveness.",
					position: 75,
					priority: 2
				}
			]
		},
		{
			id: 'immigration-crisis',
			issueId: 'immigration',
			scenario: "Recent events in Ter Apel have highlighted the asylum system crisis. The reception center is severely overcrowded, with asylum seekers sleeping outdoors. Local residents are concerned about safety and resources, while humanitarian organizations call for immediate action.",
			question: "What is your immediate response to this humanitarian and administrative crisis?",
			options: [
				{
					text: "Open emergency shelters immediately and expand asylum processing capacity. Europe must share responsibility for refugees.",
					position: -80,
					priority: 5
				},
				{
					text: "Increase processing speed and temporary housing while working on European-wide solutions to distribute asylum seekers fairly.",
					position: -30,
					priority: 4
				},
				{
					text: "Focus on faster deportation of rejected cases and stricter border controls to reduce numbers entering the system.",
					position: 40,
					priority: 4
				},
				{
					text: "Suspend asylum applications temporarily and establish offshore processing centers to deter irregular migration.",
					position: 85,
					priority: 5
				}
			]
		},
		{
			id: 'housing-emergency',
			issueId: 'housing',
			scenario: "Young professionals in Amsterdam and Rotterdam are leaving the Netherlands due to housing costs. Average rent now consumes 60% of median income, and home ownership has become unattainable for most under 35.",
			question: "How would you address the housing affordability crisis?",
			options: [
				{
					text: "Implement strict rent controls, expand social housing, and introduce speculation taxes on property investors.",
					position: -70,
					priority: 5
				},
				{
					text: "Build more affordable housing through public-private partnerships and moderate rent stabilization measures.",
					position: -20,
					priority: 4
				},
				{
					text: "Reduce building regulations and zoning restrictions to increase supply, allowing market forces to lower prices.",
					position: 30,
					priority: 3
				},
				{
					text: "Eliminate rent controls entirely and reduce taxes on construction to incentivize private development.",
					position: 80,
					priority: 2
				}
			]
		},
		{
			id: 'healthcare-pressure',
			issueId: 'healthcare',
			scenario: "Dutch hospitals are facing severe staff shortages, with nurses emigrating to Germany for better conditions. Waiting times have increased dramatically, and some rural areas may lose their hospitals entirely.",
			question: "How would you reform healthcare to address these systemic challenges?",
			options: [
				{
					text: "Increase public healthcare funding, improve working conditions, and reduce privatization in the system.",
					position: -65,
					priority: 5
				},
				{
					text: "Invest in healthcare education and retention programs while maintaining the current mixed public-private model.",
					position: -15,
					priority: 4
				},
				{
					text: "Encourage more private healthcare options to reduce pressure on public system and improve efficiency.",
					position: 35,
					priority: 3
				},
				{
					text: "Transition to a more market-based system with increased individual responsibility and insurance competition.",
					position: 75,
					priority: 2
				}
			]
		},
		{
			id: 'eu-sovereignty',
			issueId: 'eu',
			scenario: "The European Union is proposing new fiscal rules that would limit the Netherlands' ability to set its own tax rates. Some argue this protects European unity, while others see it as an attack on Dutch sovereignty.",
			question: "What should be the Netherlands' response to increased European fiscal integration?",
			options: [
				{
					text: "Support deeper European integration. Shared challenges require shared solutions and coordinated policies.",
					position: -75,
					priority: 4
				},
				{
					text: "Engage constructively while protecting key Dutch interests and maintaining some fiscal autonomy.",
					position: -20,
					priority: 3
				},
				{
					text: "Resist fiscal integration that undermines Dutch sovereignty while remaining committed to European cooperation.",
					position: 40,
					priority: 4
				},
				{
					text: "Defend Dutch sovereignty strongly and consider reducing EU integration if our interests are not protected.",
					position: 80,
					priority: 5
				}
			]
		},
		{
			id: 'economic-inequality',
			issueId: 'economy',
			scenario: "Income inequality has reached a 30-year high in the Netherlands. The top 1% now controls 25% of national wealth, while many middle-class families struggle with rising costs and stagnant wages.",
			question: "What measures would you take to address growing economic inequality?",
			options: [
				{
					text: "Implement wealth taxes, raise top income tax rates, and expand social programs to redistribute wealth more fairly.",
					position: -80,
					priority: 5
				},
				{
					text: "Focus on education, job training, and moderate tax adjustments to create more opportunities for advancement.",
					position: -25,
					priority: 4
				},
				{
					text: "Encourage entrepreneurship and economic growth that benefits everyone rather than redistributive policies.",
					position: 30,
					priority: 3
				},
				{
					text: "Reduce taxes and regulations to stimulate job creation and economic mobility through market mechanisms.",
					position: 75,
					priority: 2
				}
			]
		},
		{
			id: 'education-reform',
			issueId: 'education',
			scenario: "Dutch education rankings have declined internationally while educational inequality has increased. Children from disadvantaged backgrounds lag significantly behind their peers, and teacher shortages affect school quality.",
			question: "How would you reform education to improve outcomes and equality?",
			options: [
				{
					text: "Increase public education funding, reduce school segregation, and ensure equal resources for all schools.",
					position: -70,
					priority: 5
				},
				{
					text: "Improve teacher training and compensation while maintaining the current system with targeted interventions.",
					position: -20,
					priority: 4
				},
				{
					text: "Expand school choice and performance-based funding to improve quality through competition.",
					position: 35,
					priority: 3
				},
				{
					text: "Promote private education and merit-based selection to drive excellence and educational innovation.",
					position: 75,
					priority: 2
				}
			]
		}
	];

	// Calculate final positions based on answers
	function calculatePositions(answers: Array<{issueId: string, position: number, priority: number}>) {
		const issuePositions = new Map<string, {totalWeight: number, weightedSum: number, maxPriority: number}>();

		answers.forEach(answer => {
			const current = issuePositions.get(answer.issueId) || {totalWeight: 0, weightedSum: 0, maxPriority: 0};
			current.totalWeight += answer.priority;
			current.weightedSum += answer.position * answer.priority;
			current.maxPriority = Math.max(current.maxPriority, answer.priority);
			issuePositions.set(answer.issueId, current);
		});

		const finalPositions: PoliticalPosition[] = [];
		issuePositions.forEach((data, issueId) => {
			finalPositions.push({
				issueId,
				position: Math.round(data.weightedSum / data.totalWeight),
				priority: data.maxPriority
			});
		});

		return finalPositions;
	}

	let selectedAnswers: Array<{issueId: string, position: number, priority: number}> = [];

	function selectAnswer(option: {position: number, priority: number}) {
		const question = interviewQuestions[currentQuestionIndex];
		selectedAnswers.push({
			issueId: question.issueId,
			position: option.position,
			priority: option.priority
		});

		if (currentQuestionIndex < interviewQuestions.length - 1) {
			currentQuestionIndex++;
		} else {
			completeInterview();
		}
	}

	function completeInterview() {
		positions = calculatePositions(selectedAnswers);
		isComplete = true;
	}

	function startInterview() {
		interviewStarted = true;
	}

	function finishInterview() {
		dispatch('complete', { positions });
	}

	$: currentQuestion = interviewQuestions[currentQuestionIndex];
	$: progress = ((currentQuestionIndex + (isComplete ? 1 : 0)) / interviewQuestions.length) * 100;
</script>

<div class="media-interview">
	{#if !interviewStarted}
		<!-- Introduction Screen -->
		<div class="interview-intro">
			<div class="studio-setup">
				<div class="tv-screen">
					<div class="channel-header">
						<span class="channel-logo">NOS</span>
						<span class="program-title">Political Spotlight</span>
					</div>
					<div class="host-intro">
						<div class="host-avatar">📺</div>
						<div class="intro-text">
							<h2>Welcome to Political Spotlight</h2>
							<p>Good evening. I'm here with the leader of the new political party that's making waves in Dutch politics.</p>
							<p>Tonight, we'll discuss your positions on the key issues facing the Netherlands. Your responses will help voters understand where your party stands.</p>
							<p><strong>This is live television</strong> — your answers will define your political platform.</p>
						</div>
					</div>
				</div>
				<button class="start-interview-btn" on:click={startInterview}>
					🔴 Go Live
				</button>
			</div>
		</div>
	{:else if !isComplete}
		<!-- Active Interview -->
		<div class="live-interview">
			<div class="interview-header">
				<div class="live-indicator">
					<span class="live-dot"></span>
					LIVE
				</div>
				<div class="progress-bar">
					<div class="progress-fill" style="width: {progress}%"></div>
				</div>
				<div class="question-counter">
					{currentQuestionIndex + 1} / {interviewQuestions.length}
				</div>
			</div>

			<div class="interview-content">
				<div class="scenario-setup">
					<h3>Current Affairs</h3>
					<p class="scenario-text">{currentQuestion.scenario}</p>
				</div>

				<div class="host-question">
					<div class="host-avatar">🎤</div>
					<div class="question-bubble">
						<p><strong>Journalist:</strong> "{currentQuestion.question}"</p>
					</div>
				</div>

				<div class="response-options">
					<h4>Your Response:</h4>
					{#each currentQuestion.options as option, index}
						<button
							class="response-option"
							on:click={() => selectAnswer(option)}
						>
							<span class="option-letter">{String.fromCharCode(65 + index)}</span>
							<span class="option-text">"{option.text}"</span>
						</button>
					{/each}
				</div>
			</div>
		</div>
	{:else}
		<!-- Interview Complete -->
		<div class="interview-complete">
			<div class="completion-header">
				<h2>🎬 Interview Complete</h2>
				<p>Your political positions have been established based on your responses.</p>
			</div>

			<div class="position-summary">
				<h3>Your Political Platform</h3>
				{#each positions as position}
					{@const issue = DUTCH_ISSUES.find(i => i.id === position.issueId)}
					{#if issue}
						<div class="position-card">
							<div class="position-header">
								<h4>{issue.name}</h4>
								<span class="position-value" class:left={position.position < -30} class:center={position.position >= -30 && position.position <= 30} class:right={position.position > 30}>
									{position.position > 0 ? '+' : ''}{position.position}
								</span>
							</div>
							<div class="position-description">
								{position.position < -30 ? issue.spectrum.left : position.position > 30 ? issue.spectrum.right : 'Moderate position between competing approaches'}
							</div>
							<div class="priority-level">
								Priority: {'★'.repeat(position.priority)}{'☆'.repeat(5 - position.priority)}
							</div>
						</div>
					{/if}
				{/each}
			</div>

			<button class="finish-btn" on:click={finishInterview}>
				Continue to Campaign →
			</button>
		</div>
	{/if}
</div>

<style>
	.media-interview {
		padding: 20px;
		max-width: 900px;
		margin: 0 auto;
		min-height: 600px;
	}

	/* Introduction Screen */
	.interview-intro {
		text-align: center;
	}

	.studio-setup {
		background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
		border-radius: 20px;
		padding: 40px;
		box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
	}

	.tv-screen {
		background: #000;
		border-radius: 15px;
		padding: 20px;
		margin-bottom: 30px;
		border: 3px solid #333;
		box-shadow: inset 0 0 20px rgba(0, 100, 255, 0.2);
	}

	.channel-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		color: white;
		margin-bottom: 20px;
		font-size: 14px;
		font-weight: bold;
	}

	.channel-logo {
		background: #ff0000;
		padding: 4px 12px;
		border-radius: 4px;
		color: white;
	}

	.program-title {
		color: #00aaff;
	}

	.host-intro {
		display: flex;
		gap: 20px;
		align-items: center;
	}

	.host-avatar {
		font-size: 48px;
		filter: grayscale(100%) brightness(0.8);
	}

	.intro-text {
		text-align: left;
		color: white;
	}

	.intro-text h2 {
		color: #00aaff;
		margin-bottom: 15px;
	}

	.intro-text p {
		margin-bottom: 10px;
		line-height: 1.6;
	}

	.start-interview-btn {
		background: linear-gradient(135deg, #ff0000 0%, #cc0000 100%);
		color: white;
		border: none;
		padding: 15px 30px;
		border-radius: 8px;
		font-size: 18px;
		font-weight: bold;
		cursor: pointer;
		transition: all 0.3s ease;
		box-shadow: 0 4px 15px rgba(255, 0, 0, 0.3);
	}

	.start-interview-btn:hover {
		transform: translateY(-2px);
		box-shadow: 0 6px 20px rgba(255, 0, 0, 0.4);
	}

	/* Live Interview */
	.live-interview {
		background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 100%);
		border-radius: 15px;
		overflow: hidden;
		box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
	}

	.interview-header {
		background: linear-gradient(90deg, #ff0000 0%, #cc0000 100%);
		padding: 15px 20px;
		display: flex;
		justify-content: space-between;
		align-items: center;
		color: white;
	}

	.live-indicator {
		display: flex;
		align-items: center;
		gap: 8px;
		font-weight: bold;
		font-size: 16px;
	}

	.live-dot {
		width: 12px;
		height: 12px;
		background: white;
		border-radius: 50%;
		animation: pulse 1.5s infinite;
	}

	@keyframes pulse {
		0%, 100% { opacity: 1; }
		50% { opacity: 0.3; }
	}

	.progress-bar {
		flex: 1;
		height: 6px;
		background: rgba(255, 255, 255, 0.3);
		border-radius: 3px;
		margin: 0 20px;
		overflow: hidden;
	}

	.progress-fill {
		height: 100%;
		background: white;
		transition: width 0.3s ease;
		border-radius: 3px;
	}

	.question-counter {
		font-weight: bold;
	}

	.interview-content {
		padding: 30px;
		color: white;
	}

	.scenario-setup {
		background: rgba(255, 255, 255, 0.05);
		padding: 20px;
		border-radius: 10px;
		margin-bottom: 25px;
		border-left: 4px solid #00aaff;
	}

	.scenario-setup h3 {
		color: #00aaff;
		margin-bottom: 10px;
	}

	.scenario-text {
		line-height: 1.6;
		font-style: italic;
	}

	.host-question {
		display: flex;
		gap: 15px;
		margin-bottom: 30px;
		align-items: flex-start;
	}

	.question-bubble {
		background: linear-gradient(135deg, #333 0%, #444 100%);
		padding: 20px;
		border-radius: 20px 20px 20px 5px;
		border: 2px solid #555;
		flex: 1;
	}

	.response-options h4 {
		color: #00aaff;
		margin-bottom: 20px;
	}

	.response-option {
		display: flex;
		gap: 15px;
		align-items: flex-start;
		background: linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.1) 100%);
		border: 2px solid rgba(255, 255, 255, 0.2);
		border-radius: 12px;
		padding: 20px;
		margin-bottom: 15px;
		cursor: pointer;
		transition: all 0.3s ease;
		text-align: left;
		color: white;
		width: 100%;
	}

	.response-option:hover {
		background: linear-gradient(135deg, rgba(0, 170, 255, 0.1) 0%, rgba(0, 170, 255, 0.2) 100%);
		border-color: #00aaff;
		transform: translateY(-2px);
		box-shadow: 0 5px 15px rgba(0, 170, 255, 0.2);
	}

	.option-letter {
		background: #00aaff;
		color: white;
		width: 32px;
		height: 32px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: bold;
		flex-shrink: 0;
	}

	.option-text {
		line-height: 1.5;
		font-style: italic;
	}

	/* Interview Complete */
	.interview-complete {
		text-align: center;
	}

	.completion-header h2 {
		color: #00aa00;
		margin-bottom: 10px;
	}

	.position-summary {
		margin: 30px 0;
		text-align: left;
	}

	.position-summary h3 {
		text-align: center;
		color: #333;
		margin-bottom: 25px;
	}

	.position-card {
		background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
		border-radius: 10px;
		padding: 20px;
		margin-bottom: 15px;
		border: 1px solid #dee2e6;
	}

	.position-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 10px;
	}

	.position-header h4 {
		margin: 0;
		color: #333;
	}

	.position-value {
		font-weight: bold;
		font-size: 18px;
		padding: 4px 12px;
		border-radius: 20px;
	}

	.position-value.left {
		background: #dc3545;
		color: white;
	}

	.position-value.center {
		background: #6c757d;
		color: white;
	}

	.position-value.right {
		background: #007bff;
		color: white;
	}

	.position-description {
		color: #666;
		font-style: italic;
		margin-bottom: 8px;
		line-height: 1.4;
	}

	.priority-level {
		color: #ffc107;
		font-size: 14px;
	}

	.finish-btn {
		background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
		color: white;
		border: none;
		padding: 15px 30px;
		border-radius: 8px;
		font-size: 18px;
		font-weight: bold;
		cursor: pointer;
		transition: all 0.3s ease;
		box-shadow: 0 4px 15px rgba(40, 167, 69, 0.3);
	}

	.finish-btn:hover {
		transform: translateY(-2px);
		box-shadow: 0 6px 20px rgba(40, 167, 69, 0.4);
	}

	/* Responsive */
	@media (max-width: 768px) {
		.media-interview {
			padding: 10px;
		}

		.host-intro {
			flex-direction: column;
			text-align: center;
		}

		.response-option {
			padding: 15px;
		}

		.interview-header {
			flex-direction: column;
			gap: 10px;
		}

		.progress-bar {
			margin: 0;
		}
	}
</style>