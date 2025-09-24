import type {
	InterviewEngine,
	InterviewConfig,
	InterviewerPersonality,
	ConditionalQuestion,
	InterviewResponse,
	QuestionArc,
	DifficultyLevel,
	InterviewType,
	CampaignStage,
	PoliticalRole
} from '$lib/types/interview';
import { BaseInterviewEngine } from './BaseInterviewEngine';

export interface LateCampaignPressureConfig extends InterviewConfig {
	campaignStage: 'final-week' | 'final-three-days' | 'election-eve';
	pressureLevel: 'high' | 'extreme' | 'desperate';
	timeRemaining: number; // hours until election
	pollingPosition: 'leading' | 'close' | 'behind' | 'distant';
	vulnerabilities: LateCampaignVulnerability[];
	opposition: OppositionPressure[];
	mediaIntensity: 'normal' | 'heightened' | 'feeding-frenzy';
	lastChance: boolean; // Is this the last major interview opportunity?
}

export interface LateCampaignVulnerability {
	id: string;
	type: 'policy-flip-flop' | 'scandal-resurface' | 'coalition-breakdown' | 'competence-question' | 'trust-deficit' | 'gaffe-amplification';
	severity: 'minor' | 'moderate' | 'major' | 'campaign-ending';
	timeframe: 'fresh' | 'recent' | 'ongoing' | 'historical';
	mediaAttention: 'low' | 'medium' | 'high' | 'viral';
	description: string;
	potentialDamage: number; // 1-100 scale
}

export interface OppositionPressure {
	source: 'main-opponent' | 'coalition-partner' | 'former-ally' | 'whistleblower' | 'international';
	timing: 'coordinated' | 'opportunistic' | 'desperate' | 'strategic';
	credibility: 'high' | 'medium' | 'low' | 'questionable';
	message: string;
	impact: number; // 1-100 scale
}

export interface LateCampaignPerformance {
	stressResistance: number; // 1-100, how well they handle pressure
	messageConsistency: number; // 1-100, staying on message
	vulnerabilityExposure: number; // 1-100, how much damage was done
	recoveryEffectiveness: number; // 1-100, ability to recover from mistakes
	finalImpressionScore: number; // 1-100, lasting impression
	electoralImpact: 'positive' | 'neutral' | 'negative' | 'campaign-damaging';
}

export interface LateCampaignAnalytics {
	vulnerabilitiesExposed: string[];
	effectiveRecoveries: number;
	messageBreakdowns: number;
	stressInducedErrors: number;
	oppositionAttacksHandled: number;
	finalMomentumShift: number; // -50 to +50 percentage points
}

export class LateCampaignPressureEngine extends BaseInterviewEngine {
	private config: LateCampaignPressureConfig;
	private performance: LateCampaignPerformance;
	private analytics: LateCampaignAnalytics;
	private pressureMultiplier: number = 1.0;
	private stressLevel: number = 0;
	private vulnerabilitiesHit: Set<string> = new Set();
	private messageBreakdowns: number = 0;

	constructor(config: LateCampaignPressureConfig) {
		super(config);
		this.config = config;
		this.performance = this.initializePerformance();
		this.analytics = this.initializeAnalytics();
		this.pressureMultiplier = this.calculatePressureMultiplier();
	}

	private initializePerformance(): LateCampaignPerformance {
		return {
			stressResistance: 70,
			messageConsistency: 70,
			vulnerabilityExposure: 0,
			recoveryEffectiveness: 70,
			finalImpressionScore: 70,
			electoralImpact: 'neutral'
		};
	}

	private initializeAnalytics(): LateCampaignAnalytics {
		return {
			vulnerabilitiesExposed: [],
			effectiveRecoveries: 0,
			messageBreakdowns: 0,
			stressInducedErrors: 0,
			oppositionAttacksHandled: 0,
			finalMomentumShift: 0
		};
	}

	private calculatePressureMultiplier(): number {
		let multiplier = 1.0;

		// Time pressure
		if (this.config.timeRemaining <= 24) multiplier += 0.8; // Election day pressure
		else if (this.config.timeRemaining <= 72) multiplier += 0.6; // Final 3 days
		else if (this.config.timeRemaining <= 168) multiplier += 0.4; // Final week

		// Polling position pressure
		switch (this.config.pollingPosition) {
			case 'distant': multiplier += 0.8; break; // Desperate
			case 'behind': multiplier += 0.6; break; // Catching up pressure
			case 'close': multiplier += 0.4; break; // Neck and neck tension
			case 'leading': multiplier += 0.2; break; // Maintaining lead pressure
		}

		// Media intensity
		switch (this.config.mediaIntensity) {
			case 'feeding-frenzy': multiplier += 0.6; break;
			case 'heightened': multiplier += 0.4; break;
			case 'normal': multiplier += 0.2; break;
		}

		// Last chance factor
		if (this.config.lastChance) multiplier += 0.5;

		return Math.min(multiplier, 3.0); // Cap at 3x pressure
	}

	generateQuestionArc(): QuestionArc {
		const openingPressure = this.generateOpeningPressureQuestions();
		const vulnerabilityExploitation = this.generateVulnerabilityQuestions();
		const oppositionAttacks = this.generateOppositionAttackQuestions();
		const finalJudgment = this.generateFinalJudgmentQuestions();

		return {
			id: `late-campaign-pressure-${Date.now()}`,
			title: this.generateInterviewTitle(),
			description: this.generateInterviewDescription(),
			difficulty: this.calculateEffectiveDifficulty(),
			estimatedDuration: this.calculateDuration(),
			questions: [
				...openingPressure,
				...vulnerabilityExploitation,
				...oppositionAttacks,
				...finalJudgment
			],
			triggers: this.generatePressureTriggers(),
			unlockConditions: [],
			completionCriteria: this.generateCompletionCriteria()
		};
	}

	private generateInterviewTitle(): string {
		const timeDescriptors = {
			'final-week': 'Final Week',
			'final-three-days': 'Final Days',
			'election-eve': 'Election Eve'
		};

		const pressureDescriptors = {
			'high': 'High-Pressure',
			'extreme': 'Extreme Pressure',
			'desperate': 'Do-or-Die'
		};

		return `${timeDescriptors[this.config.campaignStage]} ${pressureDescriptors[this.config.pressureLevel]} Interview`;
	}

	private generateInterviewDescription(): string {
		const descriptions = {
			'final-week': 'Face intense scrutiny in the crucial final week before election day. Every word matters.',
			'final-three-days': 'Navigate the highest pressure interview with just days before voters decide. No room for error.',
			'election-eve': 'The final major interview before election day. Your last chance to reach undecided voters.'
		};
		return descriptions[this.config.campaignStage];
	}

	private calculateEffectiveDifficulty(): DifficultyLevel {
		if (this.pressureMultiplier >= 2.5) return 'extreme';
		if (this.pressureMultiplier >= 2.0) return 'high';
		if (this.pressureMultiplier >= 1.5) return 'medium';
		return 'low';
	}

	private calculateDuration(): number {
		// Late campaign interviews tend to be longer and more intense
		const baseDuration = 20;
		const pressureExtension = this.pressureMultiplier * 5;
		return Math.min(baseDuration + pressureExtension, 35);
	}

	private generateOpeningPressureQuestions(): ConditionalQuestion[] {
		const questions: ConditionalQuestion[] = [];

		// Time pressure opener
		if (this.config.timeRemaining <= 24) {
			questions.push({
				id: 'election-day-pressure',
				type: 'aggressive-challenge',
				text: 'We\'re just hours away from election day. Polls show this race could go either way. This might be your last chance to convince voters. What\'s your closing argument for why people should trust you with their future?',
				options: [
					{ id: 'confident-vision', text: 'Present a confident vision for the future', impact: { leadership: 15, trustworthiness: 10, competence: 10 } },
					{ id: 'attack-opponents', text: 'Highlight opponents\' weaknesses', impact: { leadership: 5, trustworthiness: -5, competence: 0 } },
					{ id: 'personal-appeal', text: 'Make a personal, heartfelt appeal', impact: { trustworthiness: 15, leadership: 5, integrity: 10 } },
					{ id: 'defensive', text: 'Defend against recent criticisms', impact: { leadership: -10, trustworthiness: -5, competence: -5 } }
				],
				triggers: ['final-appeal-assessment', 'leadership-under-pressure'],
				difficultyModifiers: { high: 1.2, extreme: 1.5 }
			});
		}

		// Polling position pressure
		switch (this.config.pollingPosition) {
			case 'distant':
				questions.push({
					id: 'desperate-position',
					type: 'confrontational',
					text: 'You\'re trailing significantly in the polls with virtually no time left. Many in your own party are already conceding defeat. Are you prepared to accept responsibility for this electoral disaster?',
					options: [
						{ id: 'never-give-up', text: 'We\'re fighting until the last vote is counted', impact: { leadership: 10, determination: 15 } },
						{ id: 'internal-polls', text: 'Our internal polls show a much closer race', impact: { trustworthiness: -10, competence: -5 } },
						{ id: 'blame-external', text: 'External factors beyond our control affected the campaign', impact: { leadership: -15, accountability: -10 } },
						{ id: 'dignified-acceptance', text: 'The voters will decide, and I respect that process', impact: { integrity: 15, leadership: 5, trustworthiness: 10 } }
					],
					triggers: ['desperation-assessment', 'leadership-collapse'],
					difficultyModifiers: { extreme: 1.8 }
				});
				break;

			case 'close':
				questions.push({
					id: 'nail-biter-pressure',
					type: 'rapid-fire',
					text: 'This race is too close to call. Every single vote matters. The pressure must be enormous. How are you handling the stress, and are you worried about making a crucial mistake in these final moments?',
					options: [
						{ id: 'experienced-calm', text: 'I\'ve been through close elections before', impact: { competence: 10, leadership: 10, stress_resistance: 15 } },
						{ id: 'energized', text: 'The close race energizes me and my team', impact: { leadership: 15, determination: 10 } },
						{ id: 'admit-pressure', text: 'The pressure is intense, but I\'m focused on the issues', impact: { trustworthiness: 10, vulnerability: 5 } },
						{ id: 'deflect-stress', text: 'I don\'t focus on polls, just on serving the people', impact: { leadership: 5, trustworthiness: 0 } }
					],
					triggers: ['stress-assessment', 'final-stretch-pressure'],
					difficultyModifiers: { high: 1.3, extreme: 1.5 }
				});
				break;
		}

		return questions;
	}

	private generateVulnerabilityQuestions(): ConditionalQuestion[] {
		return this.config.vulnerabilities
			.filter(vuln => vuln.severity !== 'minor' || this.config.pressureLevel === 'desperate')
			.map(vulnerability => this.createVulnerabilityQuestion(vulnerability));
	}

	private createVulnerabilityQuestion(vulnerability: LateCampaignVulnerability): ConditionalQuestion {
		const questionTexts: Record<typeof vulnerability.type, (vuln: LateCampaignVulnerability) => string> = {
			'policy-flip-flop': (v) => `You've completely reversed your position on ${v.description}. With just ${this.getTimeRemainingText()}, how can voters trust anything you say?`,
			'scandal-resurface': (v) => `The ${v.description} scandal has resurfaced in the final days of the campaign. This timing seems devastating. How do you respond to accusations that you've been hiding the truth?`,
			'coalition-breakdown': (v) => `Your coalition partner just ${v.description}. Your government is falling apart before the election. How can you claim to be fit to lead?`,
			'competence-question': (v) => `Recent revelations about ${v.description} raise serious questions about your competence. Are you really qualified for this office?`,
			'trust-deficit': (v) => `Polls show ${v.description}. Even your own supporters don't trust you. How do you govern without trust?`,
			'gaffe-amplification': (v) => `Your comment about ${v.description} has gone viral and is being called the defining moment of this campaign. Do you realize how much damage you've done?`
		};

		const severityMultipliers = {
			'minor': 1.0,
			'moderate': 1.2,
			'major': 1.5,
			'campaign-ending': 2.0
		};

		return {
			id: `vulnerability-${vulnerability.id}`,
			type: vulnerability.severity === 'campaign-ending' ? 'devastating-revelation' : 'confrontational',
			text: questionTexts[vulnerability.type](vulnerability),
			options: this.generateVulnerabilityOptions(vulnerability),
			triggers: [`vulnerability-${vulnerability.type}`, 'damage-control'],
			difficultyModifiers: {
				low: severityMultipliers[vulnerability.severity],
				medium: severityMultipliers[vulnerability.severity] * 1.1,
				high: severityMultipliers[vulnerability.severity] * 1.3,
				extreme: severityMultipliers[vulnerability.severity] * 1.6
			}
		};
	}

	private generateVulnerabilityOptions(vulnerability: LateCampaignVulnerability): Array<{ id: string; text: string; impact: Record<string, number> }> {
		const baseOptions = [
			{ id: 'deny', text: 'Deny the allegations completely', impact: { trustworthiness: -20, integrity: -15 } },
			{ id: 'minimize', text: 'Minimize the significance', impact: { trustworthiness: -10, competence: -5 } },
			{ id: 'apologize', text: 'Apologize and take responsibility', impact: { trustworthiness: 15, integrity: 15, competence: -10 } },
			{ id: 'blame-others', text: 'Blame others or circumstances', impact: { leadership: -15, accountability: -20 } },
			{ id: 'pivot', text: 'Pivot to attacking opponents', impact: { leadership: -5, trustworthiness: -10 } }
		];

		// Add severity-specific options
		if (vulnerability.severity === 'campaign-ending') {
			baseOptions.push(
				{ id: 'full-responsibility', text: 'Take full responsibility and commit to making amends', impact: { integrity: 25, leadership: 10, trustworthiness: 20, competence: -20 } },
				{ id: 'withdraw', text: 'Consider withdrawing from the race', impact: { integrity: 30, leadership: -30, political_career: -50 } }
			);
		}

		return baseOptions;
	}

	private generateOppositionAttackQuestions(): ConditionalQuestion[] {
		return this.config.opposition.map((attack, index) => ({
			id: `opposition-attack-${index}`,
			type: 'aggressive-challenge',
			text: this.generateOppositionAttackText(attack),
			options: [
				{ id: 'counter-attack', text: 'Launch a counter-attack on the source', impact: { leadership: 5, trustworthiness: -10 } },
				{ id: 'discredit', text: 'Question the credibility of the source', impact: { competence: 5, trustworthiness: -5 } },
				{ id: 'dignified-response', text: 'Respond with dignity and facts', impact: { leadership: 15, trustworthiness: 15, integrity: 10 } },
				{ id: 'deflect', text: 'Deflect to campaign issues', impact: { leadership: 0, trustworthiness: -5 } },
				{ id: 'legal-action', text: 'Threaten legal action', impact: { leadership: -10, trustworthiness: -15 } }
			],
			triggers: ['opposition-attack-response', 'credibility-test'],
			difficultyModifiers: this.getOppositionDifficultyModifiers(attack)
		}));
	}

	private generateOppositionAttackText(attack: OppositionPressure): string {
		const sourceDescriptors = {
			'main-opponent': 'Your main opponent',
			'coalition-partner': 'Your own coalition partner',
			'former-ally': 'Your former political ally',
			'whistleblower': 'A government whistleblower',
			'international': 'International sources'
		};

		const timingDescriptors = {
			'coordinated': 'in what appears to be a coordinated attack',
			'opportunistic': 'taking advantage of your recent difficulties',
			'desperate': 'in what seems like a desperate last-minute attempt',
			'strategic': 'in a carefully timed strategic move'
		};

		return `${sourceDescriptors[attack.source]} has just released a statement ${timingDescriptors[attack.timing]} claiming that "${attack.message}". This couldn't come at a worse time for your campaign. How do you respond?`;
	}

	private getOppositionDifficultyModifiers(attack: OppositionPressure): Record<DifficultyLevel, number> {
		const credibilityMultiplier = {
			'high': 1.6,
			'medium': 1.3,
			'low': 1.1,
			'questionable': 0.9
		}[attack.credibility];

		const impactMultiplier = attack.impact / 50; // Normalize to ~1.0-2.0 range

		const baseMultiplier = credibilityMultiplier * impactMultiplier;

		return {
			low: baseMultiplier,
			medium: baseMultiplier * 1.1,
			high: baseMultiplier * 1.3,
			extreme: baseMultiplier * 1.6
		};
	}

	private generateFinalJudgmentQuestions(): ConditionalQuestion[] {
		const questions: ConditionalQuestion[] = [
			{
				id: 'final-judgment',
				type: 'judgment-call',
				text: this.generateFinalJudgmentText(),
				options: [
					{ id: 'confident-close', text: 'End with confidence and strength', impact: { leadership: 20, final_impression: 15 } },
					{ id: 'humble-appeal', text: 'Make a humble appeal for trust', impact: { trustworthiness: 15, integrity: 15, final_impression: 10 } },
					{ id: 'passionate-plea', text: 'Make a passionate plea for the future', impact: { determination: 20, final_impression: 15, leadership: 10 } },
					{ id: 'defensive-close', text: 'End defensively addressing criticisms', impact: { leadership: -15, final_impression: -10 } }
				],
				triggers: ['final-impression-formation', 'electoral-impact-assessment'],
				difficultyModifiers: { high: 1.2, extreme: 1.4 }
			}
		];

		// Add desperation question if behind in polls
		if (this.config.pollingPosition === 'distant' || this.config.pollingPosition === 'behind') {
			questions.push({
				id: 'last-ditch-appeal',
				type: 'emotional-pressure',
				text: 'This might be your last chance to reach voters before they make their decision. What\'s your final message to someone who\'s still undecided and might be your last hope?',
				options: [
					{ id: 'personal-story', text: 'Share a personal story about why you\'re running', impact: { trustworthiness: 15, final_impression: 20, authenticity: 15 } },
					{ id: 'fear-appeal', text: 'Warn about the consequences of the opposition winning', impact: { leadership: 5, final_impression: -5, negativity: 10 } },
					{ id: 'vision-cast', text: 'Paint a compelling vision of the future', impact: { leadership: 20, final_impression: 15, inspiration: 15 } },
					{ id: 'desperate-plea', text: 'Make a desperate emotional plea', impact: { final_impression: -15, desperation: 20 } }
				],
				triggers: ['desperation-assessment', 'final-emotional-impact'],
				difficultyModifiers: { extreme: 1.5 }
			});
		}

		return questions;
	}

	private generateFinalJudgmentText(): string {
		if (this.config.timeRemaining <= 12) {
			return 'We\'re just hours away from when polls open. In a few sentences, why should voters choose you over your opponents? This is it - your final word.';
		} else if (this.config.timeRemaining <= 72) {
			return 'We\'re in the final stretch of this campaign. Voters are making up their minds right now. What\'s your closing argument for why you deserve their trust?';
		} else {
			return 'We\'re entering the final week of this campaign. The pressure is immense, the stakes are high. Sum up for voters why you\'re the right choice for this moment.';
		}
	}

	processResponse(response: InterviewResponse): void {
		super.processResponse(response);

		this.updateStressLevel(response);
		this.assessMessageConsistency(response);
		this.trackVulnerabilityExposure(response);
		this.updatePressureMetrics(response);
	}

	private updateStressLevel(response: InterviewResponse): void {
		// Increase stress based on question difficulty and response quality
		const questionDifficulty = this.getCurrentQuestionDifficulty();
		const responseQuality = this.assessResponseQuality(response);

		const stressIncrease = (questionDifficulty * this.pressureMultiplier) - (responseQuality * 0.5);
		this.stressLevel = Math.min(this.stressLevel + stressIncrease, 100);

		// Stress affects performance
		if (this.stressLevel > 70) {
			this.performance.stressResistance = Math.max(this.performance.stressResistance - 5, 0);
			this.analytics.stressInducedErrors++;
		}
	}

	private assessMessageConsistency(response: InterviewResponse): void {
		// Check if response aligns with previous messaging
		const consistency = this.checkMessageConsistency(response);

		if (consistency < 0.7) {
			this.messageBreakdowns++;
			this.performance.messageConsistency = Math.max(this.performance.messageConsistency - 10, 0);
			this.analytics.messageBreakdowns++;
		}
	}

	private trackVulnerabilityExposure(response: InterviewResponse): void {
		// Check if response exposed or addressed vulnerabilities
		const question = this.getCurrentQuestion();
		if (question?.id.startsWith('vulnerability-')) {
			const vulnerabilityId = question.id.replace('vulnerability-', '');
			this.vulnerabilitiesHit.add(vulnerabilityId);

			const responseEffectiveness = this.assessResponseQuality(response);
			if (responseEffectiveness < 0.6) {
				this.performance.vulnerabilityExposure += 20;
				this.analytics.vulnerabilitiesExposed.push(vulnerabilityId);
			} else {
				this.analytics.effectiveRecoveries++;
				this.performance.recoveryEffectiveness += 5;
			}
		}
	}

	private updatePressureMetrics(response: InterviewResponse): void {
		const question = this.getCurrentQuestion();

		if (question?.id.startsWith('opposition-attack-')) {
			this.analytics.oppositionAttacksHandled++;
		}

		// Update final impression score based on response quality and timing
		const responseImpact = this.calculateResponseImpact(response);
		this.performance.finalImpressionScore += responseImpact;

		// Calculate momentum shift
		if (responseImpact > 10) {
			this.analytics.finalMomentumShift += 2;
		} else if (responseImpact < -10) {
			this.analytics.finalMomentumShift -= 3;
		}
	}

	private getTimeRemainingText(): string {
		if (this.config.timeRemaining <= 24) return 'hours until election day';
		if (this.config.timeRemaining <= 72) return 'just days left in the campaign';
		return 'so little time remaining';
	}

	private generatePressureTriggers(): string[] {
		return [
			'final-appeal-assessment',
			'leadership-under-pressure',
			'stress-assessment',
			'vulnerability-exposure',
			'opposition-attack-response',
			'final-impression-formation',
			'electoral-impact-assessment',
			'desperation-assessment',
			'message-consistency-check',
			'damage-control',
			'credibility-test'
		];
	}

	private generateCompletionCriteria(): string[] {
		return [
			'all_pressure_points_tested',
			'vulnerabilities_addressed',
			'opposition_attacks_responded',
			'final_impression_established',
			'electoral_impact_assessed',
			'stress_resistance_measured',
			'message_consistency_evaluated'
		];
	}

	getPerformanceResults(): LateCampaignPerformance {
		// Calculate final electoral impact
		if (this.performance.finalImpressionScore >= 80) {
			this.performance.electoralImpact = 'positive';
		} else if (this.performance.finalImpressionScore <= 40) {
			this.performance.electoralImpact = 'campaign-damaging';
		} else if (this.performance.finalImpressionScore <= 60) {
			this.performance.electoralImpact = 'negative';
		} else {
			this.performance.electoralImpact = 'neutral';
		}

		return this.performance;
	}

	getAnalytics(): LateCampaignAnalytics {
		return this.analytics;
	}

	private getCurrentQuestionDifficulty(): number {
		// Placeholder - would get actual difficulty from current question
		return 50 * this.pressureMultiplier;
	}

	private assessResponseQuality(response: InterviewResponse): number {
		// Placeholder - would assess response quality based on multiple factors
		return Math.random() * 100; // Replace with actual assessment logic
	}

	private checkMessageConsistency(response: InterviewResponse): number {
		// Placeholder - would check consistency with previous responses
		return Math.random(); // Replace with actual consistency check
	}

	private getCurrentQuestion(): ConditionalQuestion | null {
		// Placeholder - would return current question being processed
		return null;
	}

	private calculateResponseImpact(response: InterviewResponse): number {
		// Placeholder - would calculate impact based on response effectiveness and timing
		return Math.random() * 20 - 10; // -10 to +10 range
	}
}