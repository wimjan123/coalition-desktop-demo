import type {
	QuestionArc,
	ConditionalQuestion,
	InterviewerPersonality,
	InvestigativeJournalismConfig,
	InvestigationCategory,
	DifficultyLevel,
	EvidenceType,
	InvestigationSubject,
	InvestigativeQuestionType,
	InvestigativeInterviewPerformance
} from '$lib/types/interview';
import { BaseQuestionArcFactory } from './BaseQuestionArcFactory';

export class InvestigativeQuestionArcFactory extends BaseQuestionArcFactory {
	private config: InvestigativeJournalismConfig;
	private subject: InvestigationSubject;

	constructor(config: InvestigativeJournalismConfig, subject: InvestigationSubject) {
		super();
		this.config = config;
		this.subject = subject;
	}

	generateQuestionArc(): QuestionArc {
		const category = this.config.investigation.category;
		const difficulty = this.config.investigation.difficulty;

		return {
			id: `investigative-${category}-${Date.now()}`,
			title: `Investigative Interview: ${this.getInvestigationTitle(category)}`,
			description: this.getInvestigationDescription(category),
			difficulty,
			estimatedDuration: this.getEstimatedDuration(difficulty),
			questions: this.generateInvestigativeQuestions(category, difficulty),
			triggers: this.generateTriggers(category),
			unlockConditions: [],
			completionCriteria: this.generateCompletionCriteria(category)
		};
	}

	private getInvestigationTitle(category: InvestigationCategory): string {
		const titles: Record<InvestigationCategory, string> = {
			'financial-irregularities': 'Financial Misconduct Investigation',
			'policy-implementation-failures': 'Policy Implementation Scandal',
			'conflict-of-interest': 'Conflict of Interest Allegations',
			'misuse-of-public-resources': 'Public Resource Misuse',
			'cover-up-allegations': 'Cover-up Investigation',
			'coalition-partner-disputes': 'Coalition Partner Scandal',
			'international-relations-mishaps': 'International Relations Crisis',
			'environmental-policy-contradictions': 'Environmental Policy Contradiction',
			'social-policy-implementation-gaps': 'Social Policy Implementation Failure',
			'transparency-violations': 'Transparency Violation Investigation'
		};
		return titles[category];
	}

	private getInvestigationDescription(category: InvestigationCategory): string {
		const descriptions: Record<InvestigationCategory, string> = {
			'financial-irregularities': 'Face tough questions about financial misconduct and budget mismanagement allegations.',
			'policy-implementation-failures': 'Address serious concerns about failed policy implementation and its consequences.',
			'conflict-of-interest': 'Respond to allegations of personal gain at the expense of public interest.',
			'misuse-of-public-resources': 'Defend against claims of inappropriate use of taxpayer money and resources.',
			'cover-up-allegations': 'Handle accusations of concealing information from the public and parliament.',
			'coalition-partner-disputes': 'Navigate questions about internal coalition conflicts and partner disagreements.',
			'international-relations-mishaps': 'Address diplomatic failures and international relationship damages.',
			'environmental-policy-contradictions': 'Respond to contradictions between environmental promises and actual policies.',
			'social-policy-implementation-gaps': 'Defend gaps between social policy rhetoric and implementation reality.',
			'transparency-violations': 'Address violations of transparency commitments and information disclosure.'
		};
		return descriptions[category];
	}

	private getEstimatedDuration(difficulty: DifficultyLevel): number {
		const durations: Record<DifficultyLevel, number> = {
			low: 8,
			medium: 12,
			high: 18,
			extreme: 25
		};
		return durations[difficulty];
	}

	private generateInvestigativeQuestions(category: InvestigationCategory, difficulty: DifficultyLevel): ConditionalQuestion[] {
		const baseQuestions = this.getBaseQuestions(category);
		const evidenceQuestions = this.generateEvidenceBasedQuestions();
		const followUpQuestions = this.generateFollowUpQuestions(difficulty);
		const accountabilityQuestions = this.generateAccountabilityQuestions(difficulty);

		return [
			...baseQuestions,
			...evidenceQuestions,
			...followUpQuestions,
			...accountabilityQuestions
		];
	}

	private getBaseQuestions(category: InvestigationCategory): ConditionalQuestion[] {
		const questionSets: Record<InvestigationCategory, ConditionalQuestion[]> = {
			'financial-irregularities': [
				{
					id: 'financial-main-1',
					type: 'evidence-confrontation',
					text: 'We have documents showing €2.3 million in unexplained budget transfers. Can you explain where this money went?',
					options: [
						{ id: 'deny', text: 'Those documents are misleading', impact: { trustworthiness: -15, competence: -5 } },
						{ id: 'explain', text: 'Let me explain the budget reallocation process', impact: { trustworthiness: 5, competence: 10 } },
						{ id: 'deflect', text: 'This is normal government accounting', impact: { trustworthiness: -10, competence: -5 } },
						{ id: 'acknowledge', text: 'There were some accounting irregularities we\'re addressing', impact: { trustworthiness: 10, competence: -5 } }
					],
					triggers: ['evasion-detected', 'contradiction-detected'],
					difficultyModifiers: { high: 1.3, extreme: 1.6 }
				},
				{
					id: 'financial-main-2',
					type: 'rapid-fire-clarification',
					text: 'Your ministry spent €500,000 on "consultation fees" to a company owned by your former campaign manager. Isn\'t this a clear conflict of interest?',
					options: [
						{ id: 'deny-knowledge', text: 'I wasn\'t aware of that connection', impact: { trustworthiness: -20, competence: -15 } },
						{ id: 'justify', text: 'They were the most qualified for the job', impact: { trustworthiness: -5, competence: 5 } },
						{ id: 'investigate', text: 'I will immediately investigate this matter', impact: { trustworthiness: 5, competence: 5 } },
						{ id: 'transparency', text: 'All procurement followed proper procedures', impact: { trustworthiness: 10, competence: 10 } }
					],
					triggers: ['accountability-assessment', 'contradiction-detected'],
					difficultyModifiers: { high: 1.2, extreme: 1.5 }
				}
			],
			'policy-implementation-failures': [
				{
					id: 'policy-main-1',
					type: 'evidence-confrontation',
					text: 'Your housing policy promised 100,000 new homes by 2024. We\'re now in 2025 and only 12,000 have been built. How do you explain this massive failure?',
					options: [
						{ id: 'blame-others', text: 'Local municipalities haven\'t cooperated', impact: { trustworthiness: -10, leadership: -15 } },
						{ id: 'covid-excuse', text: 'COVID-19 caused unprecedented delays', impact: { trustworthiness: -5, competence: -5 } },
						{ id: 'acknowledge', text: 'We underestimated the challenges', impact: { trustworthiness: 10, competence: -10 } },
						{ id: 'reframe', text: 'Quality is more important than quantity', impact: { trustworthiness: -5, competence: 5 } }
					],
					triggers: ['evasion-detected', 'accountability-assessment'],
					difficultyModifiers: { medium: 1.1, high: 1.3, extreme: 1.6 }
				},
				{
					id: 'policy-main-2',
					type: 'rapid-fire-clarification',
					text: 'Internal documents show your ministry knew these targets were unrealistic from day one. Why did you mislead the public?',
					options: [
						{ id: 'deny-documents', text: 'I question the authenticity of those documents', impact: { trustworthiness: -25, integrity: -20 } },
						{ id: 'context', text: 'Those were preliminary assessments', impact: { trustworthiness: -5, competence: 0 } },
						{ id: 'optimism', text: 'We were optimistic about overcoming challenges', impact: { trustworthiness: 5, leadership: 5 } },
						{ id: 'transparent', text: 'We should have communicated uncertainties better', impact: { trustworthiness: 15, competence: 5 } }
					],
					triggers: ['truthfulness-assessment', 'contradiction-detected'],
					difficultyModifiers: { high: 1.4, extreme: 1.7 }
				}
			],
			'conflict-of-interest': [
				{
					id: 'conflict-main-1',
					type: 'evidence-confrontation',
					text: 'You voted to approve a €50 million contract for your spouse\'s consulting firm. How is this not a blatant conflict of interest?',
					options: [
						{ id: 'recuse', text: 'I recused myself from that decision', impact: { trustworthiness: 10, integrity: 10 } },
						{ id: 'qualified', text: 'My spouse\'s firm was most qualified', impact: { trustworthiness: -15, integrity: -20 } },
						{ id: 'deny', text: 'I had no involvement in that contract', impact: { trustworthiness: -20, integrity: -15 } },
						{ id: 'transparent', text: 'I disclosed the relationship and followed ethics guidelines', impact: { trustworthiness: 15, integrity: 15 } }
					],
					triggers: ['accountability-assessment', 'ethical-challenge'],
					difficultyModifiers: { medium: 1.2, high: 1.4, extreme: 1.8 }
				}
			],
			'misuse-of-public-resources': [
				{
					id: 'misuse-main-1',
					type: 'evidence-confrontation',
					text: 'Credit card records show you charged €15,000 in personal vacation expenses to the ministry budget. How do you justify this theft of taxpayer money?',
					options: [
						{ id: 'error', text: 'This was an administrative error', impact: { trustworthiness: -5, competence: -10 } },
						{ id: 'working', text: 'I was working during that trip', impact: { trustworthiness: -10, integrity: -10 } },
						{ id: 'repay', text: 'I will immediately repay any personal expenses', impact: { trustworthiness: 10, integrity: 5 } },
						{ id: 'deny', text: 'Those charges were all legitimate government business', impact: { trustworthiness: -20, integrity: -25 } }
					],
					triggers: ['accountability-assessment', 'ethical-challenge'],
					difficultyModifiers: { high: 1.3, extreme: 1.6 }
				}
			],
			'cover-up-allegations': [
				{
					id: 'coverup-main-1',
					type: 'evidence-confrontation',
					text: 'We have emails showing you ordered staff to delete correspondence about the contaminated water scandal. Isn\'t this obstruction of justice?',
					options: [
						{ id: 'routine', text: 'This was routine document management', impact: { trustworthiness: -15, integrity: -20 } },
						{ id: 'legal', text: 'We followed legal advice', impact: { trustworthiness: 0, competence: 5 } },
						{ id: 'cooperate', text: 'We\'ve fully cooperated with all investigations', impact: { trustworthiness: 5, integrity: 10 } },
						{ id: 'deny', text: 'I never ordered any document deletion', impact: { trustworthiness: -25, integrity: -25 } }
					],
					triggers: ['truthfulness-assessment', 'contradiction-detected'],
					difficultyModifiers: { high: 1.4, extreme: 1.8 }
				}
			],
			'coalition-partner-disputes': [
				{
					id: 'coalition-main-1',
					type: 'rapid-fire-clarification',
					text: 'Your coalition partner publicly called you "incompetent and untrustworthy." How can voters have confidence in a government that can\'t even trust itself?',
					options: [
						{ id: 'democracy', text: 'Healthy debate is part of democracy', impact: { leadership: 5, trustworthiness: 0 } },
						{ id: 'dismiss', text: 'Those comments were taken out of context', impact: { leadership: -5, trustworthiness: -5 } },
						{ id: 'unity', text: 'We\'ve resolved our differences and stand united', impact: { leadership: 10, trustworthiness: 5 } },
						{ id: 'deflect', text: 'We should focus on delivering for the people', impact: { leadership: 0, trustworthiness: -5 } }
					],
					triggers: ['coalition-stability-assessment'],
					difficultyModifiers: { medium: 1.1, high: 1.3 }
				}
			],
			'international-relations-mishaps': [
				{
					id: 'international-main-1',
					type: 'evidence-confrontation',
					text: 'Your diplomatic gaffe at the EU summit has damaged Netherlands\' reputation and cost us €2 billion in trade deals. How do you explain this disaster?',
					options: [
						{ id: 'misunderstood', text: 'My remarks were misunderstood', impact: { competence: -5, trustworthiness: -5 } },
						{ id: 'principle', text: 'I stood up for Dutch principles', impact: { leadership: 10, competence: -5 } },
						{ id: 'apologize', text: 'I apologize for any misunderstanding', impact: { trustworthiness: 5, leadership: -5 } },
						{ id: 'blame-media', text: 'The media distorted what happened', impact: { trustworthiness: -10, competence: -10 } }
					],
					triggers: ['international-impact-assessment'],
					difficultyModifiers: { high: 1.3, extreme: 1.5 }
				}
			],
			'environmental-policy-contradictions': [
				{
					id: 'environment-main-1',
					type: 'evidence-confrontation',
					text: 'You campaigned on "net zero by 2030" but just approved three new gas drilling permits. How do you explain this blatant hypocrisy?',
					options: [
						{ id: 'transition', text: 'Gas is a transition fuel to renewables', impact: { trustworthiness: -5, competence: 5 } },
						{ id: 'economic', text: 'We must balance environment with economy', impact: { leadership: 5, trustworthiness: -5 } },
						{ id: 'review', text: 'We\'re reviewing all permits against new standards', impact: { trustworthiness: 5, competence: 5 } },
						{ id: 'deny-contradiction', text: 'This doesn\'t contradict our climate goals', impact: { trustworthiness: -15, competence: -10 } }
					],
					triggers: ['environmental-credibility-assessment'],
					difficultyModifiers: { medium: 1.2, high: 1.4, extreme: 1.7 }
				}
			],
			'social-policy-implementation-gaps': [
				{
					id: 'social-main-1',
					type: 'rapid-fire-clarification',
					text: 'Your poverty reduction program has been active for two years but poverty rates have actually increased. When will you admit this policy is a failure?',
					options: [
						{ id: 'complex', text: 'Poverty is a complex issue requiring time', impact: { competence: 5, trustworthiness: 0 } },
						{ id: 'external', text: 'External factors beyond our control affected outcomes', impact: { competence: -5, leadership: -5 } },
						{ id: 'adjust', text: 'We\'re adjusting the program based on evidence', impact: { competence: 10, trustworthiness: 5 } },
						{ id: 'success', text: 'The program is actually showing positive results', impact: { trustworthiness: -10, competence: -5 } }
					],
					triggers: ['social-impact-assessment'],
					difficultyModifiers: { medium: 1.1, high: 1.3, extreme: 1.6 }
				}
			],
			'transparency-violations': [
				{
					id: 'transparency-main-1',
					type: 'evidence-confrontation',
					text: 'You promised "the most transparent government in history" but have denied 89% of freedom of information requests. How is this transparency?',
					options: [
						{ id: 'security', text: 'We must balance transparency with security', impact: { trustworthiness: -5, competence: 5 } },
						{ id: 'complex', text: 'Many requests were too broad or complex', impact: { trustworthiness: -5, competence: 0 } },
						{ id: 'improve', text: 'We\'re working to improve our response rate', impact: { trustworthiness: 5, competence: 5 } },
						{ id: 'proactive', text: 'We proactively publish more than ever before', impact: { trustworthiness: 0, competence: 5 } }
					],
					triggers: ['transparency-assessment'],
					difficultyModifiers: { medium: 1.2, high: 1.4, extreme: 1.6 }
				}
			]
		};

		return questionSets[category] || [];
	}

	private generateEvidenceBasedQuestions(): ConditionalQuestion[] {
		return this.config.evidence.items.map((evidence, index) => ({
			id: `evidence-${index}`,
			type: 'evidence-confrontation' as InvestigativeQuestionType,
			text: this.generateEvidenceQuestionText(evidence),
			options: [
				{ id: 'deny', text: 'That evidence is inaccurate', impact: { trustworthiness: -20, integrity: -15 } },
				{ id: 'context', text: 'That needs proper context', impact: { trustworthiness: -5, competence: 5 } },
				{ id: 'acknowledge', text: 'I acknowledge the evidence', impact: { trustworthiness: 10, integrity: 10 } },
				{ id: 'challenge', text: 'I question the source of that information', impact: { trustworthiness: -10, integrity: -10 } }
			],
			triggers: ['evidence-verification', 'truthfulness-assessment'],
			conditions: [
				{
					type: 'evidence_presented',
					target: evidence.id,
					operator: 'equals',
					value: true
				}
			],
			difficultyModifiers: this.getEvidenceDifficultyModifiers(evidence.type)
		}));
	}

	private generateEvidenceQuestionText(evidence: any): string {
		const templates: Record<EvidenceType, string> = {
			'documents': `We have obtained internal documents that show ${evidence.description}. How do you respond to this evidence?`,
			'recordings': `We have audio recordings that contradict your previous statements about ${evidence.description}. What is your explanation?`,
			'testimony': `Multiple witnesses have testified that ${evidence.description}. Do you dispute their accounts?`,
			'financial-records': `Financial records clearly show ${evidence.description}. Can you explain these transactions?`,
			'communications': `Email communications reveal ${evidence.description}. How do you justify these actions?`,
			'photographs': `Photographic evidence shows ${evidence.description}. How do you explain what we see?`,
			'digital-evidence': `Digital forensics have uncovered ${evidence.description}. What is your response to this technical evidence?`
		};
		return templates[evidence.type] || `Evidence shows ${evidence.description}. How do you respond?`;
	}

	private getEvidenceDifficultyModifiers(evidenceType: EvidenceType): Record<DifficultyLevel, number> {
		const baseModifiers: Record<EvidenceType, Record<DifficultyLevel, number>> = {
			'documents': { low: 1.0, medium: 1.1, high: 1.3, extreme: 1.5 },
			'recordings': { low: 1.2, medium: 1.4, high: 1.6, extreme: 1.8 },
			'testimony': { low: 1.0, medium: 1.1, high: 1.2, extreme: 1.4 },
			'financial-records': { low: 1.1, medium: 1.3, high: 1.5, extreme: 1.7 },
			'communications': { low: 1.2, medium: 1.4, high: 1.6, extreme: 1.8 },
			'photographs': { low: 1.3, medium: 1.5, high: 1.7, extreme: 1.9 },
			'digital-evidence': { low: 1.4, medium: 1.6, high: 1.8, extreme: 2.0 }
		};
		return baseModifiers[evidenceType];
	}

	private generateFollowUpQuestions(difficulty: DifficultyLevel): ConditionalQuestion[] {
		const followUps: ConditionalQuestion[] = [
			{
				id: 'followup-evasion',
				type: 'rapid-fire-clarification',
				text: 'That didn\'t answer my question. Let me ask again more directly...',
				options: [
					{ id: 'direct-answer', text: 'Let me be completely clear about this', impact: { trustworthiness: 10, competence: 5 } },
					{ id: 'deflect-again', text: 'I think the broader context is important', impact: { trustworthiness: -15, competence: -10 } },
					{ id: 'challenge', text: 'I\'ve already answered that question', impact: { trustworthiness: -10, leadership: 5 } }
				],
				conditions: [
					{
						type: 'evasion_count',
						target: 'current_question',
						operator: 'greater_than',
						value: 1
					}
				],
				triggers: ['persistence-pressure', 'evasion-detected'],
				difficultyModifiers: { medium: 1.2, high: 1.4, extreme: 1.6 }
			},
			{
				id: 'followup-contradiction',
				type: 'gotcha-moment',
				text: 'But that contradicts what you said five minutes ago. Which statement is true?',
				options: [
					{ id: 'clarify', text: 'Let me clarify my earlier statement', impact: { trustworthiness: 5, competence: 0 } },
					{ id: 'both-true', text: 'Both statements can be true in context', impact: { trustworthiness: -10, competence: -5 } },
					{ id: 'misunderstood', text: 'You misunderstood my earlier point', impact: { trustworthiness: -5, competence: -5 } },
					{ id: 'acknowledge', text: 'I misspoke earlier, this is the correct position', impact: { trustworthiness: 10, integrity: 5 } }
				],
				conditions: [
					{
						type: 'contradiction_detected',
						target: 'current_session',
						operator: 'equals',
						value: true
					}
				],
				triggers: ['truthfulness-assessment', 'contradiction-detected'],
				difficultyModifiers: { high: 1.3, extreme: 1.6 }
			}
		];

		if (difficulty === 'extreme') {
			followUps.push({
				id: 'followup-devastating',
				type: 'gotcha-moment',
				text: 'We also have evidence that you knew about this months ago and chose to cover it up. This isn\'t incompetence - this is deliberate deception, isn\'t it?',
				options: [
					{ id: 'deny-knowledge', text: 'I was not aware of this information', impact: { trustworthiness: -25, integrity: -20 } },
					{ id: 'legal-advice', text: 'I was following legal counsel', impact: { trustworthiness: -5, competence: 0 } },
					{ id: 'protect-investigation', text: 'We couldn\'t comment during ongoing investigations', impact: { trustworthiness: 5, competence: 5 } },
					{ id: 'full-responsibility', text: 'I take full responsibility for this failure', impact: { trustworthiness: 15, leadership: 10, competence: -15 } }
				],
				conditions: [
					{
						type: 'accountability_score',
						target: 'current_session',
						operator: 'less_than',
						value: 40
					}
				],
				triggers: ['devastating-revelation', 'accountability-assessment'],
				difficultyModifiers: { extreme: 2.0 }
			});
		}

		return followUps;
	}

	private generateAccountabilityQuestions(difficulty: DifficultyLevel): ConditionalQuestion[] {
		const questions: ConditionalQuestion[] = [
			{
				id: 'accountability-resignation',
				type: 'accountability-challenge',
				text: 'Given the scale of this failure and loss of public trust, shouldn\'t you resign?',
				options: [
					{ id: 'continue-serving', text: 'I can better serve by staying and fixing the problems', impact: { leadership: 10, trustworthiness: 5 } },
					{ id: 'consider', text: 'I will consider what\'s best for the country', impact: { leadership: 5, integrity: 10 } },
					{ id: 'refuse', text: 'Resignation would be abandoning my responsibilities', impact: { leadership: 5, trustworthiness: -5 } },
					{ id: 'deflect', text: 'The opposition is calling for everyone to resign', impact: { leadership: -10, trustworthiness: -10 } }
				],
				conditions: [
					{
						type: 'trustworthiness_score',
						target: 'current_session',
						operator: 'less_than',
						value: 30
					}
				],
				triggers: ['resignation-pressure', 'accountability-assessment'],
				difficultyModifiers: { high: 1.2, extreme: 1.5 }
			},
			{
				id: 'accountability-victims',
				type: 'emotional-pressure',
				text: 'What do you say to the families who have suffered because of your decisions? Don\'t they deserve more than excuses?',
				options: [
					{ id: 'apologize', text: 'I sincerely apologize and we will provide compensation', impact: { trustworthiness: 15, integrity: 15, competence: 0 } },
					{ id: 'empathy', text: 'My heart goes out to everyone affected', impact: { trustworthiness: 5, integrity: 10, competence: 0 } },
					{ id: 'systemic', text: 'This was a systemic failure, not a personal one', impact: { trustworthiness: -10, leadership: -10 } },
					{ id: 'legal', text: 'We\'ll address compensation through proper legal channels', impact: { trustworthiness: -5, competence: 5 } }
				],
				triggers: ['emotional-impact-assessment'],
				difficultyModifiers: { medium: 1.1, high: 1.3, extreme: 1.5 }
			}
		];

		if (difficulty === 'extreme') {
			questions.push({
				id: 'accountability-criminal',
				type: 'legal-pressure',
				text: 'The prosecutor\'s office is considering criminal charges. How do you respond to the possibility of facing jail time for your actions?',
				options: [
					{ id: 'cooperate', text: 'I will fully cooperate with any investigation', impact: { integrity: 15, trustworthiness: 10 } },
					{ id: 'confident', text: 'I\'m confident no crimes were committed', impact: { trustworthiness: 5, competence: 5 } },
					{ id: 'legal-counsel', text: 'I\'ll let my legal team handle those matters', impact: { trustworthiness: -5, leadership: -5 } },
					{ id: 'political', text: 'This is political persecution, not justice', impact: { trustworthiness: -15, integrity: -20 } }
				],
				conditions: [
					{
						type: 'accountability_score',
						target: 'current_session',
						operator: 'less_than',
						value: 25
					}
				],
				triggers: ['legal-pressure', 'criminal-liability-assessment'],
				difficultyModifiers: { extreme: 1.8 }
			});
		}

		return questions;
	}

	private generateTriggers(category: InvestigationCategory): string[] {
		const baseTriggers = [
			'evidence-confrontation',
			'truthfulness-assessment',
			'accountability-assessment',
			'evasion-detected',
			'contradiction-detected'
		];

		const categorySpecificTriggers: Record<InvestigationCategory, string[]> = {
			'financial-irregularities': ['financial-audit-pressure', 'corruption-allegations'],
			'policy-implementation-failures': ['competence-challenge', 'delivery-failure-pressure'],
			'conflict-of-interest': ['ethical-challenge', 'integrity-assessment'],
			'misuse-of-public-resources': ['financial-accountability', 'theft-allegations'],
			'cover-up-allegations': ['obstruction-pressure', 'transparency-challenge'],
			'coalition-partner-disputes': ['coalition-stability-assessment', 'leadership-challenge'],
			'international-relations-mishaps': ['diplomatic-failure-pressure', 'international-impact-assessment'],
			'environmental-policy-contradictions': ['environmental-credibility-assessment', 'climate-hypocrisy-pressure'],
			'social-policy-implementation-gaps': ['social-impact-assessment', 'inequality-pressure'],
			'transparency-violations': ['transparency-assessment', 'democracy-threat-pressure']
		};

		return [...baseTriggers, ...(categorySpecificTriggers[category] || [])];
	}

	private generateCompletionCriteria(category: InvestigationCategory): string[] {
		const baseCriteria = [
			'all_evidence_presented',
			'truthfulness_assessed',
			'accountability_established',
			'public_impact_evaluated'
		];

		const categorySpecificCriteria: Record<InvestigationCategory, string[]> = {
			'financial-irregularities': ['financial_trail_explored', 'corruption_allegations_addressed'],
			'policy-implementation-failures': ['failure_causes_identified', 'competence_evaluated'],
			'conflict-of-interest': ['ethical_violations_examined', 'personal_gain_assessed'],
			'misuse-of-public-resources': ['resource_misuse_documented', 'restitution_discussed'],
			'cover-up-allegations': ['cover_up_extent_revealed', 'obstruction_consequences_addressed'],
			'coalition-partner-disputes': ['coalition_stability_assessed', 'governance_impact_evaluated'],
			'international-relations-mishaps': ['diplomatic_damage_assessed', 'international_consequences_explored'],
			'environmental-policy-contradictions': ['environmental_credibility_evaluated', 'policy_consistency_examined'],
			'social-policy-implementation-gaps': ['social_impact_documented', 'inequality_consequences_addressed'],
			'transparency-violations': ['transparency_failures_documented', 'democratic_impact_assessed']
		};

		return [...baseCriteria, ...(categorySpecificCriteria[category] || [])];
	}
}