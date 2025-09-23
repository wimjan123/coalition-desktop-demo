<script lang="ts">
	import { createEventDispatcher, onMount, onDestroy } from 'svelte';
	import { InterviewEngine } from '../interview/index.js';
	import type {
		InterviewConfig,
		InterviewResult,
		ConversationAction,
		DynamicQuestion,
		ConversationState
	} from '../types/interview.js';
	import type { StartingScenario, CharacterBackground } from '../types/game.js';

	// Props from CharacterCreation
	export let selectedScenario: StartingScenario;
	export let selectedBackground: CharacterBackground;

	const dispatch = createEventDispatcher();

	// Interview engine and state
	let interviewEngine: InterviewEngine | null = null;
	let conversationState: ConversationState | null = null;
	let currentQuestion: DynamicQuestion | null = null;
	let currentAction: ConversationAction | null = null;
	let isComplete = false;
	let isLoading = false;
	let error: string | null = null;

	// UI state
	let interviewStarted = false;
	let selectedResponse = '';
	let customResponse = '';
	let showCustomInput = false;
	let responseTimeLeft = 0;
	let isUrgentQuestion = false;
	let urgencyWarning = false;
	let interviewerStatus = { mood: 'neutral', recentReaction: '', frustrationLevel: 0, frustrationState: null };

	// Animation state for emotional reactions
	let reactionAnimation = '';
	let moodTransitionActive = false;
	let reactionMessage = '';
	let reactionType = '';
	let showReactionOverlay = false;
	let reactionIntensity = 'low';
	let emotionalState = 'neutral';
	let previousMood = 'neutral';

	// Rapid-fire session state
	let rapidFireActive = false;
	let rapidFireIntensity = 'medium';
	let rapidFireProgress = 0;
	let rapidFireTotal = 0;
	let rapidFireTimeLeft = 0;
	let rapidFireMessage = '';
	let rapidFireTimer: number | null = null;
	let showRapidFireIndicator = false;

	// Gotcha moment state
	let gotchaMomentActive = false;
	let gotchaType = '';
	let gotchaSeverity = 'major';
	let gotchaMessage = '';
	let gotchaDramaticImpact = 0;
	let gotchaConfrontationLevel = 'firm';
	let showGotchaOverlay = false;
	let gotchaAnimation = '';
	let gotchaEvidence = [];

	// Urgency timer
	let urgencyInterval: number | null = null;

	// Initialize interview engine
	onMount(() => {
		initializeInterview();
	});

	onDestroy(() => {
		cleanup();
	});

	function initializeInterview() {
		try {
			const config: InterviewConfig = {
				type: 'character-creation',
				backgroundId: selectedBackground.id,
				scenarioId: selectedScenario.id,
				difficulty: 'auto',
				interviewerType: selectedScenario.interviewerTone === 'confrontational' ? 'confrontational' : 'professional'
			};

			interviewEngine = new InterviewEngine(config);
			loadCurrentQuestion();
		} catch (err) {
			error = `Failed to initialize interview: ${err instanceof Error ? err.message : 'Unknown error'}`;
			console.error('Interview initialization error:', err);
		}
	}

	function loadCurrentQuestion() {
		if (!interviewEngine) return;

		try {
			currentQuestion = interviewEngine.getCurrentQuestion();
			conversationState = interviewEngine.getState();
			interviewerStatus = interviewEngine.getInterviewerStatus();

			if (currentQuestion) {
				// Handle urgent questions
				if (currentQuestion.urgency) {
					startUrgencyTimer(currentQuestion.urgency.timeLimit);
				}
			} else {
				// Interview is complete
				completeInterview();
			}
		} catch (err) {
			error = `Failed to load question: ${err instanceof Error ? err.message : 'Unknown error'}`;
			console.error('Question loading error:', err);
		}
	}

	function startUrgencyTimer(timeLimit: number) {
		if (urgencyInterval) clearInterval(urgencyInterval);

		responseTimeLeft = timeLimit;
		isUrgentQuestion = true;
		urgencyWarning = false;

		urgencyInterval = setInterval(() => {
			responseTimeLeft--;

			if (responseTimeLeft <= 3) {
				urgencyWarning = true;
			}

			if (responseTimeLeft <= 0) {
				handleTimerExpired();
			}
		}, 1000);
	}

	function stopUrgencyTimer() {
		if (urgencyInterval) {
			clearInterval(urgencyInterval);
			urgencyInterval = null;
		}
		isUrgentQuestion = false;
		urgencyWarning = false;
		responseTimeLeft = 0;
	}

	function handleTimerExpired() {
		stopUrgencyTimer();
		// Auto-select first defensive option when time runs out
		if (currentQuestion && currentQuestion.responseOptions.length > 0) {
			const defaultOption = currentQuestion.responseOptions.find(opt => opt.tone === 'defensive')
				|| currentQuestion.responseOptions[0];
			processResponse(defaultOption.text, defaultOption.tone);
		}
	}

	async function processResponse(responseText: string, tone: string) {
		if (!interviewEngine || isLoading) return;

		try {
			isLoading = true;
			stopUrgencyTimer();

			// Process the response through the engine
			currentAction = await interviewEngine.processResponse(responseText, tone);

			// Update state and detect mood changes
			conversationState = interviewEngine.getState();
			const newStatus = interviewEngine.getInterviewerStatus();

			// Detect mood transition
			if (newStatus.mood !== interviewerStatus.mood) {
				triggerMoodTransition(interviewerStatus.mood, newStatus.mood);
			}

			interviewerStatus = newStatus;

			// Handle different action types
			await handleConversationAction(currentAction);

			// Check if interview is complete
			if (interviewEngine.isComplete()) {
				await completeInterview();
			} else {
				// Load next question
				setTimeout(() => {
					loadCurrentQuestion();
					resetResponseUI();
				}, 2000); // Give time to read interviewer reaction
			}

		} catch (err) {
			error = `Failed to process response: ${err instanceof Error ? err.message : 'Unknown error'}`;
			console.error('Response processing error:', err);
		} finally {
			isLoading = false;
		}
	}

	async function handleConversationAction(action: ConversationAction) {
		// Check for rapid-fire session metadata
		if (action.metadata?.rapidFire) {
			handleRapidFireAction(action);
			return;
		}

		// Check for gotcha moment metadata
		if (action.metadata?.gotchaMoment) {
			handleGotchaMoment(action);
			return;
		}

		switch (action.type) {
			case 'interruption':
				// Show interruption message
				showInterviewerReaction(action.content, 'interruption');
				break;

			case 'follow-up':
				// Show follow-up question
				showInterviewerReaction(action.content, 'follow-up');
				break;

			case 'contradiction-challenge':
				// Show contradiction challenge
				showInterviewerReaction(action.content, 'challenge');
				break;

			case 'question':
				// This will be handled by loadCurrentQuestion
				break;

			case 'conclusion':
				// Interview is ending
				showInterviewerReaction(action.content, 'conclusion');
				break;
		}
	}

	function showInterviewerReaction(message: string, type: string) {
		reactionMessage = message;
		reactionType = type;
		showReactionOverlay = true;

		// Determine animation intensity based on type and frustration
		reactionIntensity = getReactionIntensity(type, interviewerStatus.frustrationLevel);

		// Trigger appropriate animation
		triggerReactionAnimation(type, reactionIntensity);

		// Auto-hide reaction after delay
		setTimeout(() => {
			showReactionOverlay = false;
			reactionAnimation = '';
		}, getReactionDuration(type, reactionIntensity));
	}

	function getReactionIntensity(type: string, frustration: number): 'low' | 'medium' | 'high' {
		if (type === 'interruption' && frustration > 70) return 'high';
		if (type === 'challenge' && frustration > 50) return 'high';
		if (type === 'interruption' || type === 'challenge') return 'medium';
		return 'low';
	}

	function triggerReactionAnimation(type: string, intensity: string) {
		// Clear any existing animation
		reactionAnimation = '';

		// Trigger new animation after a frame
		requestAnimationFrame(() => {
			reactionAnimation = `${type}-${intensity}`;
		});
	}

	function getReactionDuration(type: string, intensity: string): number {
		const baseDurations = {
			'interruption': 3000,
			'challenge': 4000,
			'follow-up': 2500,
			'conclusion': 5000
		};

		const intensityMultipliers = {
			'low': 1,
			'medium': 1.3,
			'high': 1.6
		};

		const base = baseDurations[type as keyof typeof baseDurations] || 2000;
		const multiplier = intensityMultipliers[intensity as keyof typeof intensityMultipliers] || 1;

		return base * multiplier;
	}

	function triggerMoodTransition(fromMood: string, toMood: string) {
		previousMood = fromMood;
		emotionalState = toMood;
		moodTransitionActive = true;

		// Visual cue for mood transition
		const transitionType = getMoodTransitionType(fromMood, toMood);
		triggerReactionAnimation(`mood-transition-${transitionType}`, 'medium');

		// Reset transition state after animation
		setTimeout(() => {
			moodTransitionActive = false;
			previousMood = toMood;
		}, 2000);
	}

	function getMoodTransitionType(from: string, to: string): string {
		// Define mood transition patterns
		const escalatingPatterns = [
			['neutral', 'skeptical'],
			['skeptical', 'frustrated'],
			['frustrated', 'hostile'],
			['professional', 'skeptical']
		];

		const softeningPatterns = [
			['skeptical', 'neutral'],
			['frustrated', 'skeptical'],
			['hostile', 'frustrated'],
			['skeptical', 'sympathetic']
		];

		const isEscalating = escalatingPatterns.some(([f, t]) => f === from && t === to);
		const isSoftening = softeningPatterns.some(([f, t]) => f === from && t === to);

		if (isEscalating) return 'escalating';
		if (isSoftening) return 'softening';
		return 'neutral';
	}

	async function completeInterview() {
		if (!interviewEngine) return;

		try {
			isComplete = true;
			const result: InterviewResult = await interviewEngine.conductInterview();

			// Dispatch completion event with results
			dispatch('complete', {
				result,
				positions: result.positions,
				performance: result.performance,
				aftermath: result.aftermath,
				gameplayEffects: result.gameplayEffects
			});

		} catch (err) {
			error = `Failed to complete interview: ${err instanceof Error ? err.message : 'Unknown error'}`;
			console.error('Interview completion error:', err);
		}
	}

	function resetResponseUI() {
		selectedResponse = '';
		customResponse = '';
		showCustomInput = false;
	}

	function selectResponse(option: any) {
		selectedResponse = option.text;
		processResponse(option.text, option.tone);
	}

	function submitCustomResponse() {
		if (customResponse.trim()) {
			// Analyze tone of custom response (simplified)
			const tone = analyzeResponseTone(customResponse);
			processResponse(customResponse.trim(), tone);
		}
	}

	function analyzeResponseTone(text: string): string {
		// Simple tone analysis - in real implementation could use NLP
		const lowerText = text.toLowerCase();

		if (lowerText.includes('absolutely') || lowerText.includes('definitely')) return 'confident';
		if (lowerText.includes('attack') || lowerText.includes('wrong')) return 'aggressive';
		if (lowerText.includes('well') || lowerText.includes('perhaps')) return 'diplomatic';
		if (lowerText.includes('that\'s not') || lowerText.includes('i don\'t')) return 'defensive';
		if (lowerText.includes('it\'s complicated') || text.length < 20) return 'evasive';

		return 'diplomatic'; // Default
	}

	function startInterview() {
		interviewStarted = true;
		loadCurrentQuestion();
	}

	/**
	 * Handle rapid-fire session actions
	 */
	function handleRapidFireAction(action: ConversationAction) {
		if (!action.metadata) return;

		const metadata = action.metadata;
		rapidFireActive = true;
		rapidFireIntensity = metadata.sessionIntensity || 'medium';
		rapidFireProgress = metadata.maxQuestions ? metadata.maxQuestions - metadata.questionsRemaining : 0;
		rapidFireTotal = metadata.maxQuestions || 3;
		rapidFireMessage = metadata.triggerReason || 'Rapid-fire questioning';
		showRapidFireIndicator = true;

		// Handle time constraint
		if (metadata.timeLimit) {
			startRapidFireTimer(metadata.timeLimit);
		}

		// Show intense reaction for rapid-fire questions
		showInterviewerReaction(action.content, 'rapid-fire');

		// Auto-hide rapid-fire indicator if it's the last question
		if (metadata.questionsRemaining <= 1) {
			setTimeout(() => {
				rapidFireActive = false;
				showRapidFireIndicator = false;
			}, 3000);
		}
	}

	/**
	 * Start rapid-fire timer
	 */
	function startRapidFireTimer(timeLimit: number) {
		if (rapidFireTimer) clearInterval(rapidFireTimer);

		rapidFireTimeLeft = timeLimit;
		urgencyWarning = false;

		rapidFireTimer = setInterval(() => {
			rapidFireTimeLeft--;

			if (rapidFireTimeLeft <= 3) {
				urgencyWarning = true;
			}

			if (rapidFireTimeLeft <= 0) {
				handleRapidFireTimeout();
			}
		}, 1000);
	}

	/**
	 * Stop rapid-fire timer
	 */
	function stopRapidFireTimer() {
		if (rapidFireTimer) {
			clearInterval(rapidFireTimer);
			rapidFireTimer = null;
		}
		rapidFireTimeLeft = 0;
	}

	/**
	 * Handle rapid-fire timeout
	 */
	function handleRapidFireTimeout() {
		stopRapidFireTimer();

		// In rapid-fire mode, timeout means a more defensive/evasive response
		if (currentQuestion && currentQuestion.responseOptions.length > 0) {
			const evasiveOption = currentQuestion.responseOptions.find(opt => opt.tone === 'evasive')
				|| currentQuestion.responseOptions.find(opt => opt.tone === 'defensive')
				|| currentQuestion.responseOptions[0];
			processResponse(evasiveOption.text, evasiveOption.tone);
		}
	}

	/**
	 * Get rapid-fire intensity color
	 */
	function getRapidFireIntensityColor(intensity: string): string {
		switch (intensity) {
			case 'low': return 'bg-yellow-500';
			case 'medium': return 'bg-orange-500';
			case 'high': return 'bg-red-500';
			case 'extreme': return 'bg-red-700';
			default: return 'bg-orange-500';
		}
	}

	/**
	 * Get rapid-fire progress percentage
	 */
	function getRapidFireProgressPercent(): number {
		if (rapidFireTotal === 0) return 0;
		return (rapidFireProgress / rapidFireTotal) * 100;
	}

	/**
	 * Handle gotcha moment actions
	 */
	function handleGotchaMoment(action: ConversationAction) {
		if (!action.metadata) return;

		const metadata = action.metadata;
		gotchaMomentActive = true;
		gotchaType = metadata.gotchaType || 'direct-contradiction';
		gotchaSeverity = metadata.gotchaSeverity || 'major';
		gotchaMessage = action.content;
		gotchaDramaticImpact = metadata.dramaticImpact || 75;
		gotchaConfrontationLevel = metadata.confrontationLevel || 'firm';
		gotchaEvidence = metadata.evidence || [];

		// Show dramatic gotcha overlay for high-impact moments
		if (gotchaDramaticImpact >= 70) {
			showGotchaOverlay = true;
			triggerGotchaAnimation(gotchaType, gotchaDramaticImpact);

			// Auto-hide overlay after dramatic effect
			setTimeout(() => {
				showGotchaOverlay = false;
				gotchaAnimation = '';
			}, getGotchaDuration(gotchaType, gotchaDramaticImpact));
		}

		// Show interviewer reaction
		showInterviewerReaction(action.content, 'gotcha-moment');

		// Reset gotcha state after showing
		setTimeout(() => {
			gotchaMomentActive = false;
		}, 5000);
	}

	/**
	 * Trigger gotcha moment animation
	 */
	function triggerGotchaAnimation(type: string, impact: number) {
		// Clear any existing animation
		gotchaAnimation = '';

		// Trigger new animation after a frame
		requestAnimationFrame(() => {
			const intensity = impact >= 90 ? 'devastating' : impact >= 75 ? 'high' : 'medium';
			gotchaAnimation = `gotcha-${type}-${intensity}`;
		});
	}

	/**
	 * Get gotcha moment duration based on type and impact
	 */
	function getGotchaDuration(type: string, impact: number): number {
		const baseDurations = {
			'direct-contradiction': 4000,
			'expertise-fail': 3500,
			'policy-flip': 3500,
			'moral-inconsistency': 4500,
			'fact-error': 3000,
			'evasion-pattern': 3000,
			'false-credential': 5000,
			'timeline-contradiction': 3200
		};

		const base = baseDurations[type as keyof typeof baseDurations] || 3500;
		const impactMultiplier = impact >= 90 ? 1.5 : impact >= 75 ? 1.3 : 1.1;

		return base * impactMultiplier;
	}

	/**
	 * Get gotcha moment severity color
	 */
	function getGotchaSeverityColor(severity: string): string {
		switch (severity) {
			case 'minor': return 'bg-yellow-600';
			case 'major': return 'bg-red-600';
			case 'critical': return 'bg-red-800';
			default: return 'bg-red-600';
		}
	}

	/**
	 * Get gotcha confrontation level indicator
	 */
	function getConfrontationLevelIcon(level: string): string {
		switch (level) {
			case 'gentle': return '🤔';
			case 'firm': return '🎯';
			case 'aggressive': return '⚡';
			case 'devastating': return '💥';
			default: return '🎯';
		}
	}

	/**
	 * Get gotcha type display name
	 */
	function getGotchaTypeDisplay(type: string): string {
		const displayNames = {
			'direct-contradiction': 'Contradiction Exposed',
			'expertise-fail': 'Expertise Questioned',
			'policy-flip': 'Policy Flip-Flop',
			'moral-inconsistency': 'Moral Inconsistency',
			'fact-error': 'Factual Error',
			'evasion-pattern': 'Evasion Pattern',
			'false-credential': 'False Credential',
			'timeline-contradiction': 'Timeline Error'
		};
		return displayNames[type as keyof typeof displayNames] || 'Gotcha Moment';
	}

	function cleanup() {
		stopUrgencyTimer();
		stopRapidFireTimer();
	}

	// Reactive statements for UI updates
	$: interviewerMoodClass = getMoodClass(interviewerStatus.mood);
	$: frustrationLevel = interviewerStatus.frustrationLevel;
	$: frustrationState = interviewerStatus.frustrationState;
	$: currentFrustrationLevel = frustrationState?.level || 'calm';
	$: frustrationBackgroundClass = getFrustrationBackgroundClass(currentFrustrationLevel);
	$: frustrationQuestionClass = getFrustrationQuestionBoxClass(currentFrustrationLevel);
	$: frustrationInterviewerClass = getFrustrationInterviewerClass(currentFrustrationLevel);
	$: canRespond = currentQuestion && !isLoading && !isComplete;

	function getMoodClass(mood: string): string {
		const moodClasses: Record<string, string> = {
			'neutral': 'text-gray-700',
			'professional': 'text-blue-700',
			'skeptical': 'text-yellow-600',
			'frustrated': 'text-orange-600',
			'hostile': 'text-red-600',
			'sympathetic': 'text-green-600',
			// Task 3.8: Surprise/Approval moods
			'surprised': 'text-cyan-600',
			'approving': 'text-emerald-600'
		};
		return moodClasses[mood] || 'text-gray-700';
	}

	function getToneColor(tone: string): string {
		const toneColors: Record<string, string> = {
			'confident': 'bg-green-600 text-white',
			'diplomatic': 'bg-blue-600 text-white',
			'aggressive': 'bg-red-600 text-white',
			'confrontational': 'bg-orange-600 text-white',
			'defensive': 'bg-yellow-600 text-black',
			'evasive': 'bg-gray-600 text-white'
		};
		return toneColors[tone] || 'bg-gray-500 text-white';
	}

	// Visual helper functions for emotional reactions
	function getMoodIndicatorClass(mood: string): string {
		const moodIndicators: Record<string, string> = {
			'neutral': 'bg-gray-400',
			'professional': 'bg-blue-500',
			'skeptical': 'bg-yellow-500',
			'frustrated': 'bg-orange-500',
			'hostile': 'bg-red-500',
			'sympathetic': 'bg-green-500',
			'excited': 'bg-purple-500',
			// Task 3.8: Surprise/Approval moods
			'surprised': 'bg-cyan-500',
			'approving': 'bg-emerald-500'
		};
		return moodIndicators[mood] || 'bg-gray-400';
	}

	function getMoodPulseClass(mood: string): string {
		const moodPulses: Record<string, string> = {
			'neutral': 'bg-gray-400 opacity-30',
			'professional': 'bg-blue-500 opacity-30',
			'skeptical': 'bg-yellow-500 opacity-40',
			'frustrated': 'bg-orange-500 opacity-50',
			'hostile': 'bg-red-500 opacity-60',
			'sympathetic': 'bg-green-500 opacity-40',
			'excited': 'bg-purple-500 opacity-50',
			// Task 3.8: Surprise/Approval moods
			'surprised': 'bg-cyan-500 opacity-45',
			'approving': 'bg-emerald-500 opacity-45'
		};
		return moodPulses[mood] || 'bg-gray-400 opacity-30';
	}

	function getFrustrationBarClass(frustration: number): string {
		if (frustration > 80) return 'bg-red-500';
		if (frustration > 60) return 'bg-orange-500';
		if (frustration > 40) return 'bg-yellow-500';
		return 'bg-green-500';
	}

	function getFrustrationTextClass(frustration: number): string {
		if (frustration > 80) return 'text-red-400';
		if (frustration > 60) return 'text-orange-400';
		if (frustration > 40) return 'text-yellow-400';
		return 'text-green-400';
	}

	/**
	 * Enhanced frustration level styling - Task 3.7
	 */
	function getFrustrationLevelClass(level: string): string {
		const levelClasses: Record<string, string> = {
			'calm': 'bg-gray-50 border-gray-200 text-gray-700',
			'mildly-annoyed': 'bg-yellow-50 border-yellow-300 text-yellow-800',
			'frustrated': 'bg-orange-50 border-orange-400 text-orange-800',
			'very-frustrated': 'bg-red-50 border-red-500 text-red-800',
			'losing-patience': 'bg-red-100 border-red-600 text-red-900 animate-pulse',
			'explosive': 'bg-red-200 border-red-700 text-red-900 animate-bounce'
		};
		return levelClasses[level] || 'bg-gray-50 border-gray-200 text-gray-700';
	}

	function getFrustrationBackgroundClass(level: string): string {
		const backgroundClasses: Record<string, string> = {
			'calm': 'bg-slate-50',
			'mildly-annoyed': 'bg-yellow-50',
			'frustrated': 'bg-orange-50',
			'very-frustrated': 'bg-red-50',
			'losing-patience': 'bg-red-100',
			'explosive': 'bg-red-200'
		};
		return backgroundClasses[level] || 'bg-slate-50';
	}

	function getFrustrationQuestionBoxClass(level: string): string {
		const boxClasses: Record<string, string> = {
			'calm': 'border-gray-200 bg-white shadow-sm',
			'mildly-annoyed': 'border-yellow-300 bg-yellow-50 shadow-md',
			'frustrated': 'border-orange-400 bg-orange-50 shadow-lg',
			'very-frustrated': 'border-red-500 bg-red-50 shadow-xl border-2',
			'losing-patience': 'border-red-600 bg-red-100 shadow-2xl border-2 animate-pulse',
			'explosive': 'border-red-700 bg-red-200 shadow-2xl border-4 animate-bounce'
		};
		return boxClasses[level] || 'border-gray-200 bg-white shadow-sm';
	}

	function getFrustrationInterviewerClass(level: string): string {
		const interviewerClasses: Record<string, string> = {
			'calm': 'filter-none',
			'mildly-annoyed': 'filter-brightness-95',
			'frustrated': 'filter-brightness-90 contrast-110',
			'very-frustrated': 'filter-brightness-85 contrast-125 hue-rotate-15',
			'losing-patience': 'filter-brightness-80 contrast-150 hue-rotate-30 animate-pulse',
			'explosive': 'filter-brightness-75 contrast-200 hue-rotate-45 animate-bounce'
		};
		return interviewerClasses[level] || 'filter-none';
	}

	function getReactionBorderClass(type: string): string {
		const borderClasses: Record<string, string> = {
			'interruption': 'border-red-500',
			'challenge': 'border-orange-500',
			'follow-up': 'border-blue-500',
			'conclusion': 'border-purple-500',
			'memory-based': 'border-pink-500',
			'accountability-pattern': 'border-red-600',
			'rapid-fire': 'border-red-700',
			'gotcha-moment': 'border-purple-700',
			// Task 3.8: Surprise/Approval reactions
			'surprise': 'border-cyan-500',
			'approval': 'border-green-400'
		};
		return borderClasses[type] || 'border-yellow-500';
	}

	function getReactionEmoji(type: string, intensity: string): string {
		const reactions: Record<string, Record<string, string>> = {
			'interruption': {
				'low': '✋',
				'medium': '🛑',
				'high': '💥'
			},
			'challenge': {
				'low': '🤔',
				'medium': '🎯',
				'high': '⚡'
			},
			'follow-up': {
				'low': '💬',
				'medium': '📝',
				'high': '🔍'
			},
			'conclusion': {
				'low': '✅',
				'medium': '🎬',
				'high': '🏁'
			},
			'memory-based': {
				'low': '🧠',
				'medium': '💭',
				'high': '🎯'
			},
			'accountability-pattern': {
				'low': '⚖️',
				'medium': '🔍',
				'high': '🚨'
			},
			'rapid-fire': {
				'low': '🔥',
				'medium': '⚡',
				'high': '💥'
			},
			'gotcha-moment': {
				'low': '💯',
				'medium': '🎯',
				'high': '💥'
			},
			// Task 3.8: Surprise/Approval reactions
			'surprise': {
				'low': '😮',
				'medium': '😲',
				'high': '🤯'
			},
			'approval': {
				'low': '👍',
				'medium': '👏',
				'high': '🎉'
			}
		};

		return reactions[type]?.[intensity] || '💭';
	}

	function getOverlayFlashClass(type: string): string {
		const flashClasses: Record<string, string> = {
			'interruption': 'bg-red-500 bg-opacity-10',
			'challenge': 'bg-orange-500 bg-opacity-10',
			'accountability-pattern': 'bg-red-600 bg-opacity-15',
			'gotcha-moment': 'bg-purple-600 bg-opacity-20',
			// Task 3.8: Surprise/Approval reactions
			'surprise': 'bg-cyan-500 bg-opacity-15',
			'approval': 'bg-green-500 bg-opacity-15'
		};
		return flashClasses[type] || 'bg-yellow-500 bg-opacity-10';
	}

	function getMoodTransitionBarClass(fromMood: string, toMood: string): string {
		// Create gradient based on mood transition
		const moodColors: Record<string, string> = {
			'neutral': 'gray-400',
			'professional': 'blue-500',
			'skeptical': 'yellow-500',
			'frustrated': 'orange-500',
			'hostile': 'red-500',
			'sympathetic': 'green-500',
			// Task 3.8: Surprise/Approval moods
			'surprised': 'cyan-400',
			'approving': 'emerald-400'
		};

		const fromColor = moodColors[fromMood] || 'gray-400';
		const toColor = moodColors[toMood] || 'gray-400';

		return `bg-gradient-to-r from-${fromColor} to-${toColor}`;
	}
</script>

<div class="min-h-screen text-white transition-all duration-1000 {frustrationBackgroundClass}">
	<!-- Interview Studio Background -->
	<div class="relative h-screen overflow-hidden">
		<!-- Background Studio with Frustration Tinting -->
		<div class="absolute inset-0 bg-gradient-to-b from-gray-800 to-gray-900 transition-all duration-1000">
			<div class="absolute inset-0 bg-black bg-opacity-40"></div>
			<!-- Frustration Level Overlay -->
			{#if currentFrustrationLevel !== 'calm'}
				<div class="absolute inset-0 transition-all duration-1000 {getFrustrationLevelClass(currentFrustrationLevel)} opacity-10"></div>
			{/if}
		</div>

		<!-- Error Display -->
		{#if error}
			<div class="absolute top-4 left-4 right-4 bg-red-600 text-white p-4 rounded-lg z-50">
				<h3 class="font-bold mb-2">Interview Error</h3>
				<p>{error}</p>
				<button
					class="mt-2 bg-red-700 hover:bg-red-800 px-4 py-2 rounded"
					on:click={() => error = null}
				>
					Dismiss
				</button>
			</div>
		{/if}

		<!-- Interview Content -->
		<div class="relative z-10 h-full flex flex-col">
			<!-- Header -->
			<div class="bg-black bg-opacity-60 p-6">
				<div class="flex justify-between items-center">
					<div>
						<h1 class="text-2xl font-bold text-white">Political Spotlight</h1>
						<p class="text-gray-300">Live Interview</p>
					</div>

					<!-- Enhanced Interviewer Status -->
					<div class="text-right">
						<div class="flex items-center space-x-3">
							<!-- Mood Indicator with Animation -->
							<div class="flex items-center space-x-2">
								<span class="text-sm text-gray-400">Interviewer:</span>
								<div class="relative">
									<!-- Mood pulse animation -->
									<div class="absolute inset-0 rounded-full {getMoodPulseClass(interviewerStatus.mood)} {moodTransitionActive ? 'animate-ping' : ''}"></div>
									<!-- Mood icon -->
									<div class="relative w-3 h-3 rounded-full {getMoodIndicatorClass(interviewerStatus.mood)} transition-all duration-500"></div>
								</div>
								<span class="{interviewerMoodClass} font-medium capitalize transition-all duration-500">
									{interviewerStatus.mood}
								</span>
								<!-- Frustration Level Indicator -->
								{#if currentFrustrationLevel !== 'calm'}
									<div class="flex items-center space-x-1">
										<span class="text-xs {getFrustrationLevelClass(currentFrustrationLevel)} px-2 py-1 rounded-full transition-all duration-500">
											{currentFrustrationLevel.replace('-', ' ').toUpperCase()}
										</span>
										{#if frustrationState?.activeBehaviors?.length > 0}
											<div class="text-xs text-red-400">
												⚠️ {frustrationState.activeBehaviors.length}
											</div>
										{/if}
									</div>
								{/if}
							</div>

							<!-- Emotional State Visual -->
							{#if moodTransitionActive}
								<div class="text-xs text-yellow-400 animate-pulse">
									{previousMood} → {emotionalState}
								</div>
							{/if}
						</div>

						<!-- Enhanced Frustration Meter -->
						{#if frustrationLevel > 20}
							<div class="flex items-center space-x-1 mt-2">
								<span class="text-xs text-gray-400">Tension:</span>
								<div class="w-20 h-2 bg-gray-700 rounded-full overflow-hidden border border-gray-600">
									<div
										class="h-full transition-all duration-500 {getFrustrationBarClass(frustrationLevel)}"
										style="width: {frustrationLevel}%"
									></div>
								</div>
								<span class="text-xs {getFrustrationTextClass(frustrationLevel)} font-mono">
									{Math.round(frustrationLevel)}%
								</span>
							</div>
						{/if}

						<!-- Recent Reaction Indicator -->
						{#if interviewerStatus.recentReaction && showReactionOverlay}
							<div class="mt-1 text-xs text-orange-400 animate-pulse">
								💭 {reactionType}
							</div>
						{/if}
					</div>
				</div>
			</div>

			<!-- Main Interview Area -->
			<div class="flex-1 flex items-center justify-center p-8">
				{#if !interviewStarted}
					<!-- Pre-Interview Screen -->
					<div class="text-center max-w-2xl">
						<h2 class="text-3xl font-bold mb-4">Ready for Your Interview?</h2>
						<p class="text-xl text-gray-300 mb-2">
							Background: <span class="text-blue-400">{selectedBackground.name}</span>
						</p>
						<p class="text-lg text-gray-400 mb-8">
							{selectedBackground.description}
						</p>
						<p class="text-gray-300 mb-8">
							This interview will determine your starting approval ratings and political positions.
							Answer honestly and authentically - the interviewer will react to your responses.
						</p>
						<button
							class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition-colors"
							on:click={startInterview}
						>
							Begin Interview
						</button>
					</div>

				{:else if currentQuestion}
					<!-- Active Interview -->
					<div class="w-full max-w-4xl">
						<!-- Question Area -->
						<div class="bg-black bg-opacity-70 rounded-lg p-8 mb-8">
							{#if currentQuestion.setup}
								<div class="text-gray-300 mb-4 italic">
									{currentQuestion.setup}
								</div>
							{/if}

							<h2 class="text-2xl font-semibold text-white mb-6">
								{currentQuestion.question}
							</h2>

							<!-- Urgency Timer -->
							{#if isUrgentQuestion}
								<div class="flex items-center space-x-2 mb-4">
									<span class="text-sm {urgencyWarning ? 'text-red-400' : 'text-yellow-400'}">
										Response time:
									</span>
									<div class="flex-1 h-2 bg-gray-600 rounded-full overflow-hidden">
										<div
											class="h-full {urgencyWarning ? 'bg-red-500' : 'bg-yellow-500'} transition-all duration-1000"
											style="width: {(responseTimeLeft / (currentQuestion.urgency?.timeLimit || 20)) * 100}%"
										></div>
									</div>
									<span class="text-sm {urgencyWarning ? 'text-red-400' : 'text-yellow-400'} font-mono">
										{responseTimeLeft}s
									</span>
								</div>
							{/if}

							<!-- Rapid-Fire Session Indicator -->
							{#if rapidFireActive && showRapidFireIndicator}
								<div class="bg-gradient-to-r from-red-600 to-orange-600 border border-red-500 rounded-lg p-4 mb-4 animate-pulse">
									<div class="flex items-center justify-between mb-2">
										<div class="flex items-center space-x-2">
											<span class="text-lg">🔥</span>
											<span class="text-white font-bold text-sm uppercase tracking-wider">Rapid-Fire</span>
											<span class="text-xs px-2 py-1 {getRapidFireIntensityColor(rapidFireIntensity)} text-white rounded-full font-bold uppercase">
												{rapidFireIntensity}
											</span>
										</div>
										{#if rapidFireTimeLeft > 0}
											<span class="text-white font-mono text-sm bg-black bg-opacity-30 px-2 py-1 rounded">
												{rapidFireTimeLeft}s
											</span>
										{/if}
									</div>
									<div class="flex items-center space-x-2 mb-2">
										<span class="text-white text-xs">Progress:</span>
										<div class="flex-1 h-2 bg-black bg-opacity-30 rounded-full overflow-hidden">
											<div
												class="h-full bg-white transition-all duration-500"
												style="width: {getRapidFireProgressPercent()}%"
											></div>
										</div>
										<span class="text-white text-xs font-mono">
											{rapidFireProgress}/{rapidFireTotal}
										</span>
									</div>
									<p class="text-red-100 text-xs italic">
										{rapidFireMessage}
									</p>
								</div>
							{/if}

							<!-- Gotcha Moment Indicator -->
							{#if gotchaMomentActive}
								<div class="bg-gradient-to-r from-purple-700 to-pink-700 border-2 border-purple-500 rounded-lg p-4 mb-4 {gotchaAnimation}">
									<div class="flex items-center justify-between mb-2">
										<div class="flex items-center space-x-2">
											<span class="text-2xl">{getConfrontationLevelIcon(gotchaConfrontationLevel)}</span>
											<span class="text-white font-bold text-sm uppercase tracking-wider">Gotcha!</span>
											<span class="text-xs px-2 py-1 {getGotchaSeverityColor(gotchaSeverity)} text-white rounded-full font-bold uppercase">
												{gotchaSeverity}
											</span>
										</div>
										<div class="text-white text-xs font-mono bg-black bg-opacity-30 px-2 py-1 rounded">
											{Math.round(gotchaDramaticImpact)}% Impact
										</div>
									</div>
									<div class="mb-2">
										<span class="text-purple-200 text-sm font-semibold">{getGotchaTypeDisplay(gotchaType)}</span>
									</div>
									{#if gotchaEvidence.length > 0}
										<div class="text-purple-100 text-xs">
											<span class="font-medium">Evidence:</span> {gotchaEvidence.length} contradiction{gotchaEvidence.length > 1 ? 's' : ''} detected
										</div>
									{/if}
								</div>
							{/if}

							<!-- Enhanced Interviewer Reaction with Animation -->
							{#if interviewerStatus.recentReaction}
								<div class="bg-gray-700 border-l-4 {getReactionBorderClass(reactionType)} p-3 mb-4 {reactionAnimation ? `animate-${reactionAnimation}` : ''} transition-all duration-300">
									<div class="flex items-start space-x-2">
										<span class="text-lg">{getReactionEmoji(reactionType, reactionIntensity)}</span>
										<p class="text-sm text-gray-300 italic flex-1">
											"{interviewerStatus.recentReaction}"
										</p>
										{#if reactionIntensity === 'high'}
											<div class="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
										{/if}
									</div>
								</div>
							{/if}
						</div>

						<!-- Response Options -->
						{#if canRespond && !showCustomInput}
							<div class="space-y-3">
								{#each currentQuestion.responseOptions as option, index}
									<button
										class="w-full text-left p-4 bg-gray-800 hover:bg-gray-700 rounded-lg transition-all duration-200 {frustrationQuestionClass} {selectedResponse === option.text ? 'border-blue-500 bg-gray-700' : ''}"
										on:click={() => selectResponse(option)}
										disabled={isLoading}
									>
										<div class="flex justify-between items-start">
											<p class="text-white pr-4">{option.text}</p>
											<div class="flex flex-col items-end space-y-1">
												<span class="text-xs px-2 py-1 rounded {getToneColor(option.tone)}">
													{option.tone}
												</span>
											</div>
										</div>
									</button>
								{/each}

								<!-- Custom Response Option -->
								<button
									class="w-full text-left p-4 bg-blue-800 hover:bg-blue-700 rounded-lg border border-blue-600 hover:border-blue-500 transition-all duration-200"
									on:click={() => showCustomInput = true}
									disabled={isLoading}
								>
									<p class="text-white">Write your own response...</p>
								</button>
							</div>

						{:else if showCustomInput}
							<!-- Custom Response Input -->
							<div class="bg-gray-800 rounded-lg p-6">
								<label for="custom-response" class="block text-sm font-medium text-gray-300 mb-2">
									Your Response:
								</label>
								<textarea
									id="custom-response"
									bind:value={customResponse}
									placeholder="Type your response here..."
									class="w-full h-32 p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
									disabled={isLoading}
								></textarea>
								<div class="flex justify-between items-center mt-4">
									<button
										class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
										on:click={() => showCustomInput = false}
										disabled={isLoading}
									>
										Back to Options
									</button>
									<button
										class="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
										on:click={submitCustomResponse}
										disabled={!customResponse.trim() || isLoading}
									>
										Submit Response
									</button>
								</div>
							</div>
						{/if}

						<!-- Loading State -->
						{#if isLoading}
							<div class="text-center py-8">
								<div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
								<p class="text-gray-300 mt-2">Processing response...</p>
							</div>
						{/if}
					</div>

				{:else if isComplete}
					<!-- Interview Complete -->
					<div class="text-center max-w-2xl">
						<h2 class="text-3xl font-bold mb-4">Interview Complete</h2>
						<p class="text-xl text-gray-300 mb-8">
							Thank you for the interview. Your responses are being analyzed...
						</p>
						<div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
					</div>
				{/if}
			</div>

			<!-- Progress Indicator -->
			{#if conversationState && currentQuestion}
				<div class="bg-black bg-opacity-60 p-4">
					<div class="flex justify-between items-center text-sm text-gray-400">
						<span>Question {conversationState.answeredQuestions.length + 1}</span>
						<div class="flex items-center space-x-2">
							<span>Performance:</span>
							<div class="w-20 h-2 bg-gray-600 rounded-full overflow-hidden">
								<div
									class="h-full bg-blue-500 transition-all duration-300"
									style="width: {conversationState.performanceMetrics.overallScore}%"
								></div>
							</div>
							<span>{conversationState.performanceMetrics.overallScore}%</span>
						</div>
					</div>
				</div>
			{/if}
		</div>

		<!-- Global Reaction Overlay for Dramatic Moments -->
		{#if showReactionOverlay && reactionIntensity === 'high'}
			<div class="absolute inset-0 pointer-events-none z-50">
				<!-- Background flash for intense reactions -->
				<div class="absolute inset-0 {getOverlayFlashClass(reactionType)} animate-pulse"></div>

				<!-- Centered dramatic reaction -->
				<div class="flex items-center justify-center h-full">
					<div class="bg-black bg-opacity-80 border-2 {getReactionBorderClass(reactionType)} rounded-lg p-6 max-w-md mx-4 {reactionAnimation ? `animate-${reactionAnimation}` : ''}">
						<div class="text-center">
							<div class="text-4xl mb-2">{getReactionEmoji(reactionType, reactionIntensity)}</div>
							<p class="text-white font-bold text-lg mb-2 uppercase tracking-wider">
								{reactionType.replace('-', ' ')}
							</p>
							<p class="text-gray-300 italic">
								"{reactionMessage}"
							</p>
						</div>
					</div>
				</div>
			</div>
		{/if}

		<!-- Gotcha Moment Dramatic Overlay -->
		{#if showGotchaOverlay}
			<div class="absolute inset-0 pointer-events-none z-60">
				<!-- Intense background flash -->
				<div class="absolute inset-0 bg-purple-600 bg-opacity-20 animate-pulse"></div>
				<div class="absolute inset-0 bg-red-600 bg-opacity-10 animate-ping"></div>

				<!-- Dramatic gotcha announcement -->
				<div class="flex items-center justify-center h-full">
					<div class="bg-gradient-to-br from-purple-900 to-red-900 border-4 border-purple-400 rounded-xl p-8 max-w-lg mx-4 {gotchaAnimation} shadow-2xl">
						<div class="text-center">
							<!-- Dramatic icon based on confrontation level -->
							<div class="text-6xl mb-4 animate-bounce">{getConfrontationLevelIcon(gotchaConfrontationLevel)}</div>

							<!-- Main gotcha announcement -->
							<h2 class="text-white font-black text-3xl mb-3 uppercase tracking-widest">
								GOTCHA!
							</h2>

							<!-- Gotcha type and severity -->
							<div class="mb-4">
								<p class="text-purple-200 font-bold text-xl mb-2">
									{getGotchaTypeDisplay(gotchaType)}
								</p>
								<div class="flex items-center justify-center space-x-2">
									<span class="text-xs px-3 py-1 {getGotchaSeverityColor(gotchaSeverity)} text-white rounded-full font-bold uppercase tracking-wider">
										{gotchaSeverity} IMPACT
									</span>
									<span class="text-purple-300 text-sm font-mono">
										{Math.round(gotchaDramaticImpact)}%
									</span>
								</div>
							</div>

							<!-- Gotcha message -->
							<p class="text-gray-200 italic text-lg leading-relaxed">
								"{gotchaMessage}"
							</p>

							<!-- Evidence indicator -->
							{#if gotchaEvidence.length > 0}
								<div class="mt-4 text-purple-300 text-sm">
									<span class="font-medium">⚙️ Evidence:</span> {gotchaEvidence.length} contradiction{gotchaEvidence.length > 1 ? 's' : ''}
								</div>
							{/if}
						</div>
					</div>
				</div>
			</div>
		{/if}

		<!-- Mood Transition Visual Effects -->
		{#if moodTransitionActive}
			<div class="absolute top-0 left-0 right-0 h-1 z-40">
				<div class="h-full {getMoodTransitionBarClass(previousMood, emotionalState)} transition-all duration-2000"></div>
			</div>
		{/if}
	</div>
</div>

<style>
	.interview-background {
		background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f172a 100%);
	}

	/* Emotional reaction animations */
	@keyframes interruption-low {
		0% { transform: translateX(0); }
		25% { transform: translateX(-2px); }
		75% { transform: translateX(2px); }
		100% { transform: translateX(0); }
	}

	@keyframes interruption-medium {
		0% { transform: translateX(0) scale(1); }
		25% { transform: translateX(-4px) scale(1.02); }
		75% { transform: translateX(4px) scale(1.02); }
		100% { transform: translateX(0) scale(1); }
	}

	@keyframes interruption-high {
		0% { transform: translateX(0) scale(1); }
		10% { transform: translateX(-8px) scale(1.05); }
		20% { transform: translateX(8px) scale(1.05); }
		30% { transform: translateX(-6px) scale(1.03); }
		40% { transform: translateX(6px) scale(1.03); }
		50% { transform: translateX(-4px) scale(1.02); }
		60% { transform: translateX(4px) scale(1.02); }
		70% { transform: translateX(-2px) scale(1.01); }
		80% { transform: translateX(2px) scale(1.01); }
		100% { transform: translateX(0) scale(1); }
	}

	@keyframes challenge-low {
		0% { transform: rotateY(0deg); }
		50% { transform: rotateY(5deg); }
		100% { transform: rotateY(0deg); }
	}

	@keyframes challenge-medium {
		0% { transform: rotateY(0deg) scale(1); }
		25% { transform: rotateY(8deg) scale(1.02); }
		75% { transform: rotateY(-8deg) scale(1.02); }
		100% { transform: rotateY(0deg) scale(1); }
	}

	@keyframes challenge-high {
		0% { transform: rotateY(0deg) scale(1) rotateZ(0deg); }
		20% { transform: rotateY(10deg) scale(1.05) rotateZ(1deg); }
		40% { transform: rotateY(-10deg) scale(1.05) rotateZ(-1deg); }
		60% { transform: rotateY(8deg) scale(1.03) rotateZ(0.5deg); }
		80% { transform: rotateY(-8deg) scale(1.03) rotateZ(-0.5deg); }
		100% { transform: rotateY(0deg) scale(1) rotateZ(0deg); }
	}

	@keyframes follow-up-low {
		0% { transform: translateY(0); }
		50% { transform: translateY(-2px); }
		100% { transform: translateY(0); }
	}

	@keyframes follow-up-medium {
		0% { transform: translateY(0) scale(1); }
		30% { transform: translateY(-4px) scale(1.01); }
		70% { transform: translateY(-2px) scale(1.005); }
		100% { transform: translateY(0) scale(1); }
	}

	@keyframes follow-up-high {
		0% { transform: translateY(0) scale(1); }
		25% { transform: translateY(-6px) scale(1.03); }
		50% { transform: translateY(-4px) scale(1.02); }
		75% { transform: translateY(-2px) scale(1.01); }
		100% { transform: translateY(0) scale(1); }
	}

	@keyframes mood-transition-escalating {
		0% {
			transform: scale(1);
			filter: brightness(1);
		}
		50% {
			transform: scale(1.02);
			filter: brightness(1.1);
		}
		100% {
			transform: scale(1);
			filter: brightness(1);
		}
	}

	@keyframes mood-transition-softening {
		0% {
			transform: scale(1);
			filter: brightness(1) saturate(1);
		}
		50% {
			transform: scale(0.98);
			filter: brightness(0.9) saturate(0.8);
		}
		100% {
			transform: scale(1);
			filter: brightness(1) saturate(1);
		}
	}

	@keyframes mood-transition-neutral {
		0% { transform: rotateX(0deg); }
		50% { transform: rotateX(2deg); }
		100% { transform: rotateX(0deg); }
	}

	/* Apply animations */
	.animate-interruption-low {
		animation: interruption-low 0.8s ease-in-out;
	}

	.animate-interruption-medium {
		animation: interruption-medium 1.2s ease-in-out;
	}

	.animate-interruption-high {
		animation: interruption-high 2s ease-in-out;
	}

	.animate-challenge-low {
		animation: challenge-low 1s ease-in-out;
	}

	.animate-challenge-medium {
		animation: challenge-medium 1.5s ease-in-out;
	}

	.animate-challenge-high {
		animation: challenge-high 2.2s ease-in-out;
	}

	.animate-follow-up-low {
		animation: follow-up-low 0.6s ease-in-out;
	}

	.animate-follow-up-medium {
		animation: follow-up-medium 1s ease-in-out;
	}

	.animate-follow-up-high {
		animation: follow-up-high 1.4s ease-in-out;
	}

	.animate-mood-transition-escalating {
		animation: mood-transition-escalating 2s ease-in-out;
	}

	.animate-mood-transition-softening {
		animation: mood-transition-softening 2s ease-in-out;
	}

	.animate-mood-transition-neutral {
		animation: mood-transition-neutral 2s ease-in-out;
	}

	/* Subtle background pulse for different moods */
	.mood-frustrated {
		background: linear-gradient(135deg, #1a1a2e 0%, #2d1b2d 50%, #0f172a 100%);
	}

	.mood-hostile {
		background: linear-gradient(135deg, #2e1a1a 0%, #3d1b1b 50%, #1a0f0f 100%);
	}

	.mood-sympathetic {
		background: linear-gradient(135deg, #1a2e1a 0%, #1b3d1b 50%, #0f1a0f 100%);
	}

	/* Enhanced reaction overlays */
	.reaction-overlay-enter {
		animation: fadeInScale 0.3s ease-out;
	}

	.reaction-overlay-exit {
		animation: fadeOutScale 0.3s ease-in;
	}

	@keyframes fadeInScale {
		0% {
			opacity: 0;
			transform: scale(0.8);
		}
		100% {
			opacity: 1;
			transform: scale(1);
		}
	}

	@keyframes fadeOutScale {
		0% {
			opacity: 1;
			transform: scale(1);
		}
		100% {
			opacity: 0;
			transform: scale(0.8);
		}
	}

	/* Rapid-fire session animations */
	@keyframes rapid-fire-low {
		0% { transform: translateY(0) scale(1); }
		25% { transform: translateY(-1px) scale(1.01); }
		75% { transform: translateY(1px) scale(1.01); }
		100% { transform: translateY(0) scale(1); }
	}

	@keyframes rapid-fire-medium {
		0% { transform: translateY(0) scale(1); }
		20% { transform: translateY(-3px) scale(1.02); }
		40% { transform: translateY(2px) scale(1.02); }
		60% { transform: translateY(-2px) scale(1.01); }
		80% { transform: translateY(1px) scale(1.01); }
		100% { transform: translateY(0) scale(1); }
	}

	@keyframes rapid-fire-high {
		0% { transform: translateY(0) scale(1) rotateX(0deg); }
		15% { transform: translateY(-4px) scale(1.03) rotateX(2deg); }
		30% { transform: translateY(3px) scale(1.03) rotateX(-1deg); }
		45% { transform: translateY(-3px) scale(1.02) rotateX(1deg); }
		60% { transform: translateY(2px) scale(1.02) rotateX(-0.5deg); }
		75% { transform: translateY(-1px) scale(1.01) rotateX(0.5deg); }
		90% { transform: translateY(1px) scale(1.01) rotateX(0deg); }
		100% { transform: translateY(0) scale(1) rotateX(0deg); }
	}

	.animate-rapid-fire-low {
		animation: rapid-fire-low 1s ease-in-out;
	}

	.animate-rapid-fire-medium {
		animation: rapid-fire-medium 1.3s ease-in-out;
	}

	.animate-rapid-fire-high {
		animation: rapid-fire-high 1.8s ease-in-out;
	}

	/* Rapid-fire intensity pulse */
	.rapid-fire-pulse {
		animation: rapid-fire-pulse 0.8s ease-in-out infinite alternate;
	}

	@keyframes rapid-fire-pulse {
		0% {
			box-shadow: 0 0 5px rgba(239, 68, 68, 0.5);
			border-color: rgb(239, 68, 68);
		}
		100% {
			box-shadow: 0 0 20px rgba(239, 68, 68, 0.8), 0 0 30px rgba(251, 146, 60, 0.4);
			border-color: rgb(251, 146, 60);
		}
	}

	/* Gotcha moment animations */
	@keyframes gotcha-direct-contradiction-medium {
		0% { transform: scale(1) rotateY(0deg); }
		25% { transform: scale(1.05) rotateY(10deg); }
		50% { transform: scale(1.1) rotateY(-10deg); }
		75% { transform: scale(1.05) rotateY(5deg); }
		100% { transform: scale(1) rotateY(0deg); }
	}

	@keyframes gotcha-direct-contradiction-high {
		0% { transform: scale(1) rotateY(0deg) rotateZ(0deg); }
		20% { transform: scale(1.1) rotateY(15deg) rotateZ(2deg); }
		40% { transform: scale(1.15) rotateY(-15deg) rotateZ(-2deg); }
		60% { transform: scale(1.1) rotateY(10deg) rotateZ(1deg); }
		80% { transform: scale(1.05) rotateY(-5deg) rotateZ(-1deg); }
		100% { transform: scale(1) rotateY(0deg) rotateZ(0deg); }
	}

	@keyframes gotcha-direct-contradiction-devastating {
		0% { transform: scale(1) rotateY(0deg) rotateZ(0deg); filter: brightness(1); }
		15% { transform: scale(1.2) rotateY(20deg) rotateZ(3deg); filter: brightness(1.3); }
		30% { transform: scale(1.25) rotateY(-20deg) rotateZ(-3deg); filter: brightness(1.5); }
		45% { transform: scale(1.15) rotateY(15deg) rotateZ(2deg); filter: brightness(1.2); }
		60% { transform: scale(1.1) rotateY(-10deg) rotateZ(-2deg); filter: brightness(1.1); }
		75% { transform: scale(1.05) rotateY(5deg) rotateZ(1deg); filter: brightness(1.05); }
		100% { transform: scale(1) rotateY(0deg) rotateZ(0deg); filter: brightness(1); }
	}

	@keyframes gotcha-expertise-fail-medium {
		0% { transform: translateY(0) scale(1); }
		25% { transform: translateY(-8px) scale(1.03); }
		50% { transform: translateY(4px) scale(1.02); }
		75% { transform: translateY(-4px) scale(1.01); }
		100% { transform: translateY(0) scale(1); }
	}

	@keyframes gotcha-expertise-fail-high {
		0% { transform: translateY(0) scale(1) rotateX(0deg); }
		20% { transform: translateY(-12px) scale(1.05) rotateX(5deg); }
		40% { transform: translateY(6px) scale(1.04) rotateX(-3deg); }
		60% { transform: translateY(-8px) scale(1.03) rotateX(2deg); }
		80% { transform: translateY(2px) scale(1.01) rotateX(-1deg); }
		100% { transform: translateY(0) scale(1) rotateX(0deg); }
	}

	@keyframes gotcha-expertise-fail-devastating {
		0% { transform: translateY(0) scale(1) rotateX(0deg); filter: brightness(1) hue-rotate(0deg); }
		25% { transform: translateY(-15px) scale(1.08) rotateX(8deg); filter: brightness(1.2) hue-rotate(30deg); }
		50% { transform: translateY(8px) scale(1.06) rotateX(-5deg); filter: brightness(1.4) hue-rotate(-30deg); }
		75% { transform: translateY(-6px) scale(1.03) rotateX(3deg); filter: brightness(1.1) hue-rotate(15deg); }
		100% { transform: translateY(0) scale(1) rotateX(0deg); filter: brightness(1) hue-rotate(0deg); }
	}

	@keyframes gotcha-moral-inconsistency-medium {
		0% { transform: scale(1) skewX(0deg); }
		25% { transform: scale(1.04) skewX(2deg); }
		50% { transform: scale(1.06) skewX(-2deg); }
		75% { transform: scale(1.02) skewX(1deg); }
		100% { transform: scale(1) skewX(0deg); }
	}

	@keyframes gotcha-moral-inconsistency-high {
		0% { transform: scale(1) skewX(0deg) skewY(0deg); }
		20% { transform: scale(1.06) skewX(3deg) skewY(1deg); }
		40% { transform: scale(1.08) skewX(-3deg) skewY(-1deg); }
		60% { transform: scale(1.04) skewX(2deg) skewY(0.5deg); }
		80% { transform: scale(1.02) skewX(-1deg) skewY(-0.5deg); }
		100% { transform: scale(1) skewX(0deg) skewY(0deg); }
	}

	@keyframes gotcha-moral-inconsistency-devastating {
		0% { transform: scale(1) skewX(0deg) skewY(0deg); filter: contrast(1) saturate(1); }
		20% { transform: scale(1.1) skewX(4deg) skewY(2deg); filter: contrast(1.3) saturate(1.5); }
		40% { transform: scale(1.12) skewX(-4deg) skewY(-2deg); filter: contrast(1.6) saturate(2); }
		60% { transform: scale(1.06) skewX(3deg) skewY(1deg); filter: contrast(1.2) saturate(1.3); }
		80% { transform: scale(1.03) skewX(-2deg) skewY(-1deg); filter: contrast(1.1) saturate(1.1); }
		100% { transform: scale(1) skewX(0deg) skewY(0deg); filter: contrast(1) saturate(1); }
	}

	@keyframes gotcha-evasion-pattern-medium {
		0% { transform: translateX(0) scale(1); }
		20% { transform: translateX(-5px) scale(1.02); }
		40% { transform: translateX(5px) scale(1.02); }
		60% { transform: translateX(-3px) scale(1.01); }
		80% { transform: translateX(3px) scale(1.01); }
		100% { transform: translateX(0) scale(1); }
	}

	@keyframes gotcha-evasion-pattern-high {
		0% { transform: translateX(0) scale(1) rotateZ(0deg); }
		15% { transform: translateX(-8px) scale(1.03) rotateZ(1deg); }
		30% { transform: translateX(8px) scale(1.03) rotateZ(-1deg); }
		45% { transform: translateX(-6px) scale(1.02) rotateZ(0.5deg); }
		60% { transform: translateX(6px) scale(1.02) rotateZ(-0.5deg); }
		75% { transform: translateX(-3px) scale(1.01) rotateZ(0.25deg); }
		90% { transform: translateX(3px) scale(1.01) rotateZ(-0.25deg); }
		100% { transform: translateX(0) scale(1) rotateZ(0deg); }
	}

	/* Apply gotcha animations */
	.animate-gotcha-direct-contradiction-medium {
		animation: gotcha-direct-contradiction-medium 1.5s ease-in-out;
	}

	.animate-gotcha-direct-contradiction-high {
		animation: gotcha-direct-contradiction-high 2s ease-in-out;
	}

	.animate-gotcha-direct-contradiction-devastating {
		animation: gotcha-direct-contradiction-devastating 2.5s ease-in-out;
	}

	.animate-gotcha-expertise-fail-medium {
		animation: gotcha-expertise-fail-medium 1.3s ease-in-out;
	}

	.animate-gotcha-expertise-fail-high {
		animation: gotcha-expertise-fail-high 1.8s ease-in-out;
	}

	.animate-gotcha-expertise-fail-devastating {
		animation: gotcha-expertise-fail-devastating 2.2s ease-in-out;
	}

	.animate-gotcha-moral-inconsistency-medium {
		animation: gotcha-moral-inconsistency-medium 1.6s ease-in-out;
	}

	.animate-gotcha-moral-inconsistency-high {
		animation: gotcha-moral-inconsistency-high 2.1s ease-in-out;
	}

	.animate-gotcha-moral-inconsistency-devastating {
		animation: gotcha-moral-inconsistency-devastating 2.8s ease-in-out;
	}

	.animate-gotcha-evasion-pattern-medium {
		animation: gotcha-evasion-pattern-medium 1.2s ease-in-out;
	}

	.animate-gotcha-evasion-pattern-high {
		animation: gotcha-evasion-pattern-high 1.7s ease-in-out;
	}

	/* Gotcha overlay entrance/exit */
	.gotcha-overlay-enter {
		animation: gotchaFadeInScale 0.5s ease-out;
	}

	.gotcha-overlay-exit {
		animation: gotchaFadeOutScale 0.4s ease-in;
	}

	@keyframes gotchaFadeInScale {
		0% {
			opacity: 0;
			transform: scale(0.6) rotateY(-20deg);
		}
		100% {
			opacity: 1;
			transform: scale(1) rotateY(0deg);
		}
	}

	@keyframes gotchaFadeOutScale {
		0% {
			opacity: 1;
			transform: scale(1) rotateY(0deg);
		}
		100% {
			opacity: 0;
			transform: scale(0.6) rotateY(20deg);
		}
	}
</style>