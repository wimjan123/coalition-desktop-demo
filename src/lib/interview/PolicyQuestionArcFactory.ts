/**
 * Policy Question Arc Factory
 * Generates sophisticated policy announcement questions across different categories and difficulty levels
 */

import type {
  QuestionArc,
  DynamicQuestion,
  DifficultyLevel,
  InterviewerType,
  FollowUpRule,
  InterruptionTrigger,
  PolicyAnnouncementConfig,
  PolicyQuestionType,
  PolicyDetails,
  PolicyCategory,
  AnnouncementContext,
  PolicyMediaScrutiny,
  AnticipatedCriticism,
  PolicyWeakPoint,
  OppositionResponse
} from '../types/interview.js';

export class PolicyQuestionArcFactory {
  private static readonly POLICY_QUESTION_TEMPLATES = {
    'cost-justification': [
      'This policy costs {amount} million euros. How do you justify that to taxpayers?',
      'With tight budgets, why is this {amount} million euro policy a priority?',
      'How can you guarantee this {amount} million euros will deliver value for money?',
      'Other countries spend less on similar policies. Why does yours cost {amount} million?',
      'The opposition says this {amount} million could be better spent elsewhere. Your response?'
    ],
    'evidence-basis': [
      'What specific evidence supports this policy approach?',
      'Critics say there\'s insufficient research behind this policy. How do you respond?',
      'Where has this type of policy been successfully implemented before?',
      'What makes you confident this will work when similar policies have failed elsewhere?',
      'Independent experts question the evidence base. How do you address their concerns?'
    ],
    'implementation-detail': [
      'How exactly will this policy be implemented?',
      'What\'s your timeline for rolling this out across the country?',
      'Which government departments will be responsible for delivering this?',
      'What happens if implementation runs behind schedule or over budget?',
      'How will you measure whether this policy is actually working?'
    ],
    'political-timing': [
      'Why announce this policy now, just before elections?',
      'Isn\'t this just an attempt to buy votes with taxpayer money?',
      'Why didn\'t you implement this earlier in your term?',
      'Are you announcing this now to distract from other political problems?',
      'How do voters know this isn\'t just an empty election promise?'
    ],
    'stakeholder-impact': [
      'Who exactly benefits from this policy and who pays the cost?',
      'Business groups say this will hurt competitiveness. How do you respond?',
      'What about the people who won\'t benefit but still have to pay for it?',
      'How do you address concerns that this policy favors certain groups over others?',
      'What\'s your response to criticism that this is unfair to middle-class taxpayers?'
    ],
    'unintended-consequences': [
      'What could go wrong with this policy?',
      'Have you considered the potential negative side effects?',
      'Similar policies elsewhere have had unintended consequences. How is yours different?',
      'What\'s your contingency plan if this policy backfires?',
      'How do you prevent this from creating perverse incentives?'
    ],
    'alternative-comparison': [
      'Why not adopt the opposition\'s approach instead?',
      'Other European countries handle this differently. Why not follow their model?',
      'Wouldn\'t a tax cut achieve the same economic goals more efficiently?',
      'Why choose this expensive approach over cheaper alternatives?',
      'Experts suggest a different approach would be more effective. Why reject their advice?'
    ],
    'coalition-dynamics': [
      'How did you convince your coalition partners to support this expensive policy?',
      'Which coalition partner pushed hardest for this policy?',
      'What compromises did you make to get coalition agreement?',
      'Is this really your policy or were you forced into it by coalition partners?',
      'How do you respond to reports of tension within the coalition over this policy?'
    ],
    'opposition-response': [
      'The opposition calls this policy "fiscal irresponsibility." Your response?',
      'How do you address criticism that this is just political posturing?',
      'Opposition parties say they\'ll reverse this policy if elected. So what\'s the point?',
      'Critics argue this policy will hurt the economy. How do you respond?',
      'What\'s your response to accusations that this is ideological rather than evidence-based?'
    ],
    'personal-commitment': [
      'Are you personally committed to this policy or is it just party line?',
      'Would you stake your political career on this policy\'s success?',
      'How personally involved were you in developing this policy?',
      'If this policy fails, will you take personal responsibility?',
      'Is this the policy you\'d pursue if you weren\'t constrained by coalition politics?'
    ],
    'success-measurement': [
      'How will we know if this policy has succeeded?',
      'What specific metrics will you use to measure success?',
      'When can voters expect to see concrete results?',
      'What would convince you this policy isn\'t working?',
      'How will you report back to voters on whether this policy delivers?'
    ],
    'failure-contingency': [
      'What if this policy doesn\'t achieve its stated goals?',
      'Do you have a Plan B if this approach fails?',
      'At what point would you admit this policy isn\'t working?',
      'How much taxpayer money are you willing to lose on this experiment?',
      'What\'s your exit strategy if this policy proves unsuccessful?'
    ]
  };

  private static readonly CATEGORY_SPECIFIC_CONCERNS = {
    'economic': {
      concerns: ['inflation', 'competitiveness', 'job market', 'business costs', 'economic growth'],
      stakeholders: ['business community', 'unions', 'consumers', 'international investors']
    },
    'social': {
      concerns: ['accessibility', 'quality', 'equality', 'sustainability', 'social cohesion'],
      stakeholders: ['service users', 'healthcare workers', 'teachers', 'social workers']
    },
    'environmental': {
      concerns: ['cost to industry', 'job losses', 'technical feasibility', 'international cooperation'],
      stakeholders: ['environmental groups', 'industry', 'farmers', 'consumers']
    },
    'security': {
      concerns: ['civil liberties', 'effectiveness', 'international relations', 'cost'],
      stakeholders: ['civil rights groups', 'security services', 'international partners']
    },
    'immigration': {
      concerns: ['integration', 'social tension', 'economic impact', 'humanitarian obligations'],
      stakeholders: ['migrant communities', 'local residents', 'employers', 'NGOs']
    },
    'governance': {
      concerns: ['democratic legitimacy', 'implementation complexity', 'public trust'],
      stakeholders: ['citizens', 'civil society', 'media', 'opposition parties']
    },
    'infrastructure': {
      concerns: ['cost overruns', 'disruption', 'technical challenges', 'maintenance'],
      stakeholders: ['users', 'local communities', 'contractors', 'transport companies']
    },
    'international': {
      concerns: ['sovereignty', 'national interest', 'international relations', 'economic impact'],
      stakeholders: ['EU partners', 'international organizations', 'business', 'citizens']
    }
  };

  public static createPolicyArc(
    policyConfig: PolicyAnnouncementConfig,
    difficulty: DifficultyLevel,
    interviewerType: InterviewerType,
    backgroundId: string
  ): QuestionArc {
    const questionCount = this.calculateQuestionCount(difficulty, policyConfig);
    const questions = this.generatePolicyQuestions(
      policyConfig,
      difficulty,
      interviewerType,
      questionCount
    );

    return {
      backgroundId,
      difficulty,
      interviewerApproach: interviewerType,
      questionCount,
      questions
    };
  }

  private static calculateQuestionCount(
    difficulty: DifficultyLevel,
    config: PolicyAnnouncementConfig
  ): number {
    const baseCount = {
      'low': 5,
      'medium': 7,
      'high': 9,
      'extreme': 12
    }[difficulty];

    // More questions for complex policies
    const complexity = this.assessPolicyComplexity(config);
    const complexityModifier = Math.floor(complexity / 25); // 0-3 additional questions

    // More questions for high-stakes announcements
    const stakesModifier = config.announcementContext.timing.electoralCycle === 'campaign-period' ? 2 : 0;

    return baseCount + complexityModifier + stakesModifier;
  }

  private static assessPolicyComplexity(config: PolicyAnnouncementConfig): number {
    let complexity = 0;

    // Factor in cost and uncertainty
    const cost = config.policyDetails.estimatedCost.estimatedAmount;
    if (cost > 1000) complexity += 25; // Over 1 billion euros
    else if (cost > 500) complexity += 15; // Over 500 million
    else if (cost > 100) complexity += 10; // Over 100 million

    // Factor in implementation complexity
    const implementationRisks = config.implementation.riskAssessment.length;
    complexity += Math.min(25, implementationRisks * 3);

    // Factor in stakeholder opposition
    const oppositionStakeholders = config.stakeholderReactions.filter(
      s => s.predictedReaction.supportLevel < 0
    ).length;
    complexity += Math.min(25, oppositionStakeholders * 5);

    // Factor in media scrutiny level
    const scrutinyLevel = config.mediaScrutiny.expectedCoverage.coverageIntensity;
    const scrutinyScores = {
      'minimal': 0,
      'standard': 5,
      'high': 15,
      'intense': 20,
      'overwhelming': 25
    };
    complexity += scrutinyScores[scrutinyLevel];

    return Math.min(100, complexity);
  }

  private static generatePolicyQuestions(
    config: PolicyAnnouncementConfig,
    difficulty: DifficultyLevel,
    interviewerType: InterviewerType,
    count: number
  ): DynamicQuestion[] {
    const questions: DynamicQuestion[] = [];
    const usedTemplates = new Set<string>();

    // Always start with policy introduction
    questions.push(this.createOpenerQuestion(config, difficulty, interviewerType));

    // Generate core questions based on policy characteristics
    const questionTypes = this.selectQuestionTypes(config, difficulty);

    for (let i = 1; i < count - 1; i++) {
      const questionType = questionTypes[i % questionTypes.length];

      const question = this.createQuestionByType(
        questionType,
        config,
        difficulty,
        interviewerType,
        usedTemplates
      );

      if (question) {
        questions.push(question);
      }
    }

    // Always end with commitment/accountability question
    questions.push(this.createCloserQuestion(config, difficulty, interviewerType));

    return questions;
  }

  private static selectQuestionTypes(
    config: PolicyAnnouncementConfig,
    difficulty: DifficultyLevel
  ): PolicyQuestionType[] {
    const questionTypes: PolicyQuestionType[] = [];

    // Essential question types for all interviews
    questionTypes.push('cost-justification', 'implementation-detail', 'evidence-basis');

    // Add based on policy characteristics
    if (config.policyDetails.estimatedCost.estimatedAmount > 500) {
      questionTypes.push('alternative-comparison', 'stakeholder-impact');
    }

    if (config.announcementContext.timing.electoralCycle === 'campaign-period') {
      questionTypes.push('political-timing', 'personal-commitment');
    }

    if (config.announcementContext.coalitionStatus) {
      questionTypes.push('coalition-dynamics');
    }

    // Add based on difficulty
    if (difficulty === 'medium' || difficulty === 'high' || difficulty === 'extreme') {
      questionTypes.push('unintended-consequences', 'opposition-response');
    }

    if (difficulty === 'high' || difficulty === 'extreme') {
      questionTypes.push('failure-contingency', 'success-measurement');
    }

    // Add based on anticipated criticism
    const criticisms = config.announcementContext.mediaStrategy.anticipatedCriticism;
    if (criticisms.some(c => c.criticismType === 'too-expensive')) {
      questionTypes.push('cost-justification');
    }
    if (criticisms.some(c => c.criticismType === 'implementation-doubt')) {
      questionTypes.push('implementation-detail');
    }
    if (criticisms.some(c => c.criticismType === 'lack-evidence')) {
      questionTypes.push('evidence-basis');
    }

    return questionTypes;
  }

  private static createOpenerQuestion(
    config: PolicyAnnouncementConfig,
    difficulty: DifficultyLevel,
    interviewerType: InterviewerType
  ): DynamicQuestion {
    const policyName = config.policyDetails.policyName;
    const category = config.policyDetails.category;
    const cost = config.policyDetails.estimatedCost.estimatedAmount;

    const openingTemplates = [
      `You've just announced your ${policyName}. In simple terms, what exactly are you promising voters?`,
      `This ${category} policy represents a major shift. Why is this the right approach?`,
      `You're asking taxpayers to fund this ${policyName}. What do they get in return?`,
      `Why should voters trust you to deliver on this ambitious ${category} policy?`,
      `This announcement comes at a crucial time. Why is this policy a priority right now?`
    ];

    let questionText = openingTemplates[Math.floor(Math.random() * openingTemplates.length)];

    // Customize based on cost if significant
    if (cost > 1000) {
      questionText = `This ${policyName} is a massive ${cost} million euro commitment. What exactly are you promising voters?`;
    } else if (cost > 500) {
      questionText = `You're announcing a ${cost} million euro ${policyName}. How do you justify this major investment?`;
    }

    return {
      id: `policy-opener-${category}`,
      type: 'opener',
      question: questionText,
      interruptionTriggers: this.createInterruptionTriggers(difficulty, interviewerType, 'opener'),
      followUpRules: this.createFollowUpRules('opener', config, difficulty)
    };
  }

  private static createCloserQuestion(
    config: PolicyAnnouncementConfig,
    difficulty: DifficultyLevel,
    interviewerType: InterviewerType
  ): DynamicQuestion {
    const policyName = config.policyDetails.policyName;
    const category = config.policyDetails.category;

    const closingTemplates = [
      `If this ${policyName} fails to deliver, will you take personal responsibility?`,
      `How confident are you that voters will see real benefits from this ${category} policy?`,
      `What's your message to taxpayers who are skeptical about this major investment?`,
      `Looking ahead, how will history judge this ${policyName}?`,
      `Final question: is this policy worth risking your political career on?`
    ];

    // Make more challenging based on difficulty
    if (difficulty === 'extreme') {
      const extremeTemplates = [
        `This policy could define your legacy. Are you prepared to stake everything on its success?`,
        `If this ${policyName} becomes a costly failure, shouldn't you resign?`,
        `You're gambling with billions of taxpayer euros. How do you sleep at night?`,
        `When this policy inevitably goes over budget, what will you tell voters then?`
      ];
      const questionText = extremeTemplates[Math.floor(Math.random() * extremeTemplates.length)];

      return {
        id: `policy-closer-extreme`,
        type: 'gotcha',
        question: questionText,
        urgency: {
          timeLimit: 20,
          warningThreshold: 10,
          timeoutAction: 'auto-select'
        },
        interruptionTriggers: this.createInterruptionTriggers(difficulty, interviewerType, 'gotcha'),
        followUpRules: this.createFollowUpRules('closer', config, difficulty)
      };
    }

    const questionText = closingTemplates[Math.floor(Math.random() * closingTemplates.length)];

    return {
      id: `policy-closer-${category}`,
      type: 'closer',
      question: questionText,
      interruptionTriggers: this.createInterruptionTriggers(difficulty, interviewerType, 'closer'),
      followUpRules: this.createFollowUpRules('closer', config, difficulty)
    };
  }

  private static createQuestionByType(
    questionType: PolicyQuestionType,
    config: PolicyAnnouncementConfig,
    difficulty: DifficultyLevel,
    interviewerType: InterviewerType,
    usedTemplates: Set<string>
  ): DynamicQuestion | null {
    const templates = this.POLICY_QUESTION_TEMPLATES[questionType];
    if (!templates) return null;

    // Find unused template
    const availableTemplates = templates.filter(template => !usedTemplates.has(template));
    if (availableTemplates.length === 0) return null;

    let template = availableTemplates[Math.floor(Math.random() * availableTemplates.length)];
    usedTemplates.add(template);

    // Customize template with policy-specific information
    template = this.customizeTemplate(template, config, questionType);

    return {
      id: `${questionType}-${Math.random().toString(36).substr(2, 9)}`,
      type: this.getQuestionType(questionType, difficulty),
      question: template,
      urgency: this.shouldAddUrgency(questionType, difficulty) ? {
        timeLimit: 35,
        warningThreshold: 20,
        timeoutAction: 'penalty'
      } : undefined,
      interruptionTriggers: this.createInterruptionTriggers(difficulty, interviewerType, 'challenge'),
      followUpRules: this.createFollowUpRules(questionType, config, difficulty)
    };
  }

  private static customizeTemplate(
    template: string,
    config: PolicyAnnouncementConfig,
    questionType: PolicyQuestionType
  ): string {
    let customized = template;

    // Replace cost placeholders
    const cost = config.policyDetails.estimatedCost.estimatedAmount;
    customized = customized.replace(/{amount}/g, cost.toString());

    // Add policy-specific details based on question type
    if (questionType === 'stakeholder-impact') {
      const negativeStakeholders = config.stakeholderReactions
        .filter(s => s.predictedReaction.supportLevel < 0)
        .map(s => s.stakeholder);

      if (negativeStakeholders.length > 0) {
        const stakeholder = negativeStakeholders[0];
        customized = customized.replace('Business groups', `${stakeholder}`);
      }
    }

    if (questionType === 'alternative-comparison') {
      const category = config.policyDetails.category;
      const categorySpecific = this.CATEGORY_SPECIFIC_CONCERNS[category];

      if (categorySpecific) {
        const concern = categorySpecific.concerns[Math.floor(Math.random() * categorySpecific.concerns.length)];
        customized = customized.replace('economic goals', `${category} goals like ${concern}`);
      }
    }

    if (questionType === 'unintended-consequences') {
      const risks = config.implementation.riskAssessment;
      if (risks.length > 0) {
        const risk = risks[Math.floor(Math.random() * risks.length)];
        customized += ` Specifically, what about the risk of ${risk.description.toLowerCase()}?`;
      }
    }

    return customized;
  }

  private static getQuestionType(questionType: PolicyQuestionType, difficulty: DifficultyLevel): 'opener' | 'challenge' | 'follow-up' | 'gotcha' | 'closer' {
    const gotchaTypes = ['failure-contingency', 'unintended-consequences', 'political-timing'];
    const challengeTypes = ['cost-justification', 'evidence-basis', 'opposition-response', 'alternative-comparison'];

    if (gotchaTypes.includes(questionType) && (difficulty === 'high' || difficulty === 'extreme')) {
      return 'gotcha';
    }

    if (challengeTypes.includes(questionType)) {
      return 'challenge';
    }

    return 'challenge'; // Default to challenge for policy questions
  }

  private static shouldAddUrgency(questionType: PolicyQuestionType, difficulty: DifficultyLevel): boolean {
    const urgentTypes = ['political-timing', 'failure-contingency', 'personal-commitment'];
    return urgentTypes.includes(questionType) && difficulty === 'extreme';
  }

  private static createInterruptionTriggers(
    difficulty: DifficultyLevel,
    interviewerType: InterviewerType,
    questionType: string
  ): InterruptionTrigger[] {
    const evasionTriggers = [
      'That doesn\'t answer the specific question I asked',
      'You\'re giving me talking points, not answers',
      'Can you be more specific about the actual policy?',
      'That sounds like political rhetoric rather than substance'
    ];

    const contradictionTriggers = [
      'That contradicts what you said during the campaign',
      'But that\'s not what your policy document says',
      'Your coalition partners are saying something different',
      'That doesn\'t match the numbers you just announced'
    ];

    const pressureTriggers = [
      'Just give me a straight yes or no',
      'How much will this actually cost taxpayers?',
      'When exactly will voters see results?',
      'Stop avoiding the question - will this work or not?'
    ];

    const triggers: InterruptionTrigger[] = [];

    // Evasion triggers (all difficulty levels)
    triggers.push({
      id: 'policy-evasion-interrupt',
      condition: 'evasive-language',
      response: evasionTriggers[Math.floor(Math.random() * evasionTriggers.length)],
      probability: difficulty === 'extreme' ? 0.85 : difficulty === 'high' ? 0.65 : 0.45,
      cooldown: 4
    });

    // Contradiction triggers (medium and up)
    if (difficulty !== 'low') {
      triggers.push({
        id: 'policy-contradiction-interrupt',
        condition: 'contradicts-policy',
        response: contradictionTriggers[Math.floor(Math.random() * contradictionTriggers.length)],
        probability: difficulty === 'extreme' ? 0.75 : 0.55,
        cooldown: 6
      });
    }

    // Pressure triggers (high and extreme, confrontational interviewer)
    if ((difficulty === 'high' || difficulty === 'extreme') && interviewerType === 'confrontational') {
      triggers.push({
        id: 'policy-pressure-interrupt',
        condition: 'too-vague',
        response: pressureTriggers[Math.floor(Math.random() * pressureTriggers.length)],
        probability: 0.7,
        cooldown: 8
      });
    }

    return triggers;
  }

  private static createFollowUpRules(
    questionType: string,
    config: PolicyAnnouncementConfig,
    difficulty: DifficultyLevel
  ): FollowUpRule[] {
    const rules: FollowUpRule[] = [];

    // Add follow-up rules based on question type
    switch (questionType) {
      case 'cost-justification':
        rules.push({
          id: 'cost-details',
          condition: 'mentions-value',
          action: 'follow-up',
          template: 'What specific value? Give me concrete numbers.',
          probability: 0.8
        });
        break;

      case 'evidence-basis':
        rules.push({
          id: 'evidence-specifics',
          condition: 'claims-research',
          action: 'follow-up',
          template: 'Which research specifically? Who conducted it?',
          probability: 0.7
        });
        break;

      case 'implementation-detail':
        rules.push({
          id: 'implementation-specifics',
          condition: 'vague-timeline',
          action: 'follow-up',
          template: 'That\'s not specific enough. Give me exact dates.',
          probability: 0.85
        });
        break;

      case 'political-timing':
        rules.push({
          id: 'timing-pressure',
          condition: 'denies-politics',
          action: 'follow-up',
          template: 'Come on, this timing is obviously political.',
          probability: 0.9
        });
        break;

      case 'failure-contingency':
        rules.push({
          id: 'failure-acceptance',
          condition: 'denies-failure-risk',
          action: 'follow-up',
          template: 'But what if you\'re wrong? Every policy has risks.',
          probability: 0.8
        });
        break;
    }

    // Add difficulty-based rules
    if (difficulty === 'extreme') {
      rules.push({
        id: 'extreme-challenge',
        condition: 'any-response',
        action: 'follow-up',
        template: 'That answer lacks credibility. Try again.',
        probability: 0.4
      });
    }

    return rules;
  }
}