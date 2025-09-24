/**
 * Coalition Question Arc Factory
 * Generates sophisticated coalition negotiation questions across different phases
 */

import type {
  QuestionArc,
  DynamicQuestion,
  DifficultyLevel,
  InterviewerType,
  FollowUpRule,
  InterruptionTrigger,
  CoalitionNegotiationConfig,
  NegotiationPhase,
  CoalitionQuestionType,
  PartyPosition,
  RedLine,
  NegotiationPressure
} from '../types/interview.js';

export class CoalitionQuestionArcFactory {
  private static readonly DUTCH_PARTIES = [
    'VVD', 'D66', 'PVV', 'CDA', 'SP', 'PvdA', 'GL', 'FvD', 'PvdD', 'CU', 'JA21', 'SGP', 'Volt', 'DENK', 'BIJ1'
  ];

  private static readonly COALITION_SCENARIOS = {
    'initial-soundings': {
      focus: 'compatibility assessment',
      pressure: 'low',
      questions: [
        'position-clarification',
        'red-line-testing',
        'coalition-chemistry',
        'party-mandate-challenge'
      ]
    },
    'formal-talks': {
      focus: 'detailed negotiation',
      pressure: 'medium',
      questions: [
        'compromise-exploration',
        'policy-implementation',
        'leadership-claims',
        'stability-assurance'
      ]
    },
    'final-negotiations': {
      focus: 'final decisions',
      pressure: 'high',
      questions: [
        'red-line-testing',
        'timeline-pressure',
        'public-accountability',
        'compromise-exploration'
      ]
    },
    'agreement-announcement': {
      focus: 'public explanation',
      pressure: 'medium',
      questions: [
        'public-accountability',
        'party-mandate-challenge',
        'stability-assurance',
        'policy-implementation'
      ]
    },
    'ratification-pressure': {
      focus: 'party approval',
      pressure: 'high',
      questions: [
        'party-mandate-challenge',
        'compromise-exploration',
        'coalition-chemistry',
        'public-accountability'
      ]
    },
    'breakdown-recovery': {
      focus: 'crisis management',
      pressure: 'extreme',
      questions: [
        'timeline-pressure',
        'public-accountability',
        'stability-assurance',
        'red-line-testing'
      ]
    }
  };

  public static createCoalitionArc(
    coalitionConfig: CoalitionNegotiationConfig,
    difficulty: DifficultyLevel,
    interviewerType: InterviewerType,
    backgroundId: string
  ): QuestionArc {
    const phase = coalitionConfig.negotiationPhase;
    const scenario = this.COALITION_SCENARIOS[phase];

    const questionCount = this.calculateQuestionCount(difficulty, phase);
    const questions = this.generatePhaseQuestions(
      coalitionConfig,
      scenario,
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

  private static calculateQuestionCount(difficulty: DifficultyLevel, phase: NegotiationPhase): number {
    const baseCount = {
      'low': 4,
      'medium': 6,
      'high': 8,
      'extreme': 10
    }[difficulty];

    // More questions in critical phases
    const phaseModifier = {
      'initial-soundings': 0,
      'formal-talks': 1,
      'final-negotiations': 2,
      'agreement-announcement': 0,
      'ratification-pressure': 2,
      'breakdown-recovery': 3
    }[phase];

    return baseCount + phaseModifier;
  }

  private static generatePhaseQuestions(
    config: CoalitionNegotiationConfig,
    scenario: any,
    difficulty: DifficultyLevel,
    interviewerType: InterviewerType,
    count: number
  ): DynamicQuestion[] {
    const questions: DynamicQuestion[] = [];
    const usedQuestions = new Set<string>();

    // Always start with phase-appropriate opener
    questions.push(this.createOpenerQuestion(config, scenario, difficulty, interviewerType));

    // Generate core questions based on scenario focus
    for (let i = 1; i < count - 1; i++) {
      const questionTypes = scenario.questions as CoalitionQuestionType[];
      const questionType = questionTypes[i % questionTypes.length];

      const question = this.createQuestionByType(
        questionType,
        config,
        difficulty,
        interviewerType,
        usedQuestions
      );

      if (question) {
        questions.push(question);
        usedQuestions.add(question.question);
      }
    }

    // Always end with phase-appropriate closer
    questions.push(this.createCloserQuestion(config, scenario, difficulty, interviewerType));

    return questions;
  }

  private static createOpenerQuestion(
    config: CoalitionNegotiationConfig,
    scenario: any,
    difficulty: DifficultyLevel,
    interviewerType: InterviewerType
  ): DynamicQuestion {
    const phase = config.negotiationPhase;
    const parties = config.partyPositions.map(p => p.party).join(', ');

    const openingTemplates = {
      'initial-soundings': [
        `You're beginning coalition talks with ${parties}. What makes you believe this combination can actually govern together?`,
        `The voters gave you a mandate, but not a majority. How do you approach these coalition negotiations?`,
        `Looking at the election results, what's your strategy for building a stable government?`
      ],
      'formal-talks': [
        `We're now in formal coalition negotiations. What are your non-negotiable demands?`,
        `The talks have been ongoing for weeks. What progress has actually been made?`,
        `Each party has different priorities. How do you reconcile these competing demands?`
      ],
      'final-negotiations': [
        `This is crunch time for the coalition talks. What's still preventing an agreement?`,
        `You're in the final stretch of negotiations. What compromises are you willing to make?`,
        `Time is running out. Are you prepared to make the hard choices needed for a deal?`
      ],
      'agreement-announcement': [
        `You've reached a coalition agreement. How do you justify these compromises to your voters?`,
        `The coalition deal is done. What did you have to give up to get this agreement?`,
        `Now that there's an agreement, can this coalition actually deliver on its promises?`
      ],
      'ratification-pressure': [
        `Your party members are skeptical about this coalition deal. How do you convince them?`,
        `There's pushback within your party about the agreement. Is it worth splitting the party over?`,
        `Some in your party call this a betrayal of your election promises. How do you respond?`
      ],
      'breakdown-recovery': [
        `The coalition talks have collapsed. How do you explain this failure to voters?`,
        `Negotiations have broken down completely. Is there any way to salvage a government?`,
        `The country is heading for new elections. Who's responsible for this political crisis?`
      ]
    };

    const templates = openingTemplates[phase] || openingTemplates['formal-talks'];
    const questionText = templates[Math.floor(Math.random() * templates.length)];

    return {
      id: `coalition-opener-${phase}`,
      type: 'opener',
      question: questionText,
      interruptionTriggers: this.createInterruptionTriggers(difficulty, interviewerType, 'opener'),
      followUpRules: this.createFollowUpRules('opener', config, difficulty)
    };
  }

  private static createCloserQuestion(
    config: CoalitionNegotiationConfig,
    scenario: any,
    difficulty: DifficultyLevel,
    interviewerType: InterviewerType
  ): DynamicQuestion {
    const phase = config.negotiationPhase;
    const timeToElection = config.negotiationPressure.timeToElection;

    const closingTemplates = {
      'initial-soundings': [
        "Looking ahead, are you optimistic about forming a stable coalition government?",
        "What's your timeline for completing these coalition negotiations?",
        "How long are you willing to spend on these talks before considering other options?"
      ],
      'formal-talks': [
        "Are you confident these negotiations will produce a workable government?",
        "What happens if you can't reach an agreement in the coming weeks?",
        "How much longer can the country wait for a new government?"
      ],
      'final-negotiations': [
        "This could be the last chance for a coalition. Are you prepared to compromise everything?",
        "If these talks fail, are you ready to take responsibility for new elections?",
        "What will you tell voters if there's no government by the end of this week?"
      ],
      'agreement-announcement': [
        "How confident are you that this coalition will last a full term?",
        "What's your message to voters who feel disappointed by these compromises?",
        "Can this government actually implement the policies in your agreement?"
      ],
      'ratification-pressure': [
        "If your party rejects this deal, what's your fallback plan?",
        "Are you willing to sacrifice party unity for this coalition agreement?",
        "What happens if the membership votes down the coalition deal?"
      ],
      'breakdown-recovery': [
        "The country needs leadership. How do you provide that now?",
        "Who should voters blame for this political deadlock?",
        "Can Dutch democracy survive this coalition crisis?"
      ]
    };

    // Add time pressure if election is soon
    let timeoutAction: 'auto-select' | 'penalty' = 'penalty';
    let timeLimit = 45;

    if (timeToElection < 30) {
      timeLimit = 30;
      timeoutAction = 'auto-select';
    } else if (timeToElection < 60) {
      timeLimit = 35;
    }

    const templates = closingTemplates[phase] || closingTemplates['formal-talks'];
    const questionText = templates[Math.floor(Math.random() * templates.length)];

    return {
      id: `coalition-closer-${phase}`,
      type: 'closer',
      question: questionText,
      urgency: difficulty === 'extreme' || timeToElection < 30 ? {
        timeLimit,
        warningThreshold: timeLimit - 10,
        timeoutAction
      } : undefined,
      interruptionTriggers: this.createInterruptionTriggers(difficulty, interviewerType, 'closer'),
      followUpRules: this.createFollowUpRules('closer', config, difficulty)
    };
  }

  private static createQuestionByType(
    questionType: CoalitionQuestionType,
    config: CoalitionNegotiationConfig,
    difficulty: DifficultyLevel,
    interviewerType: InterviewerType,
    usedQuestions: Set<string>
  ): DynamicQuestion | null {
    const generators = {
      'position-clarification': () => this.createPositionQuestion(config, difficulty, interviewerType),
      'red-line-testing': () => this.createRedLineQuestion(config, difficulty, interviewerType),
      'compromise-exploration': () => this.createCompromiseQuestion(config, difficulty, interviewerType),
      'party-mandate-challenge': () => this.createMandateQuestion(config, difficulty, interviewerType),
      'coalition-chemistry': () => this.createChemistryQuestion(config, difficulty, interviewerType),
      'leadership-claims': () => this.createLeadershipQuestion(config, difficulty, interviewerType),
      'policy-implementation': () => this.createImplementationQuestion(config, difficulty, interviewerType),
      'timeline-pressure': () => this.createTimelineQuestion(config, difficulty, interviewerType),
      'public-accountability': () => this.createAccountabilityQuestion(config, difficulty, interviewerType),
      'stability-assurance': () => this.createStabilityQuestion(config, difficulty, interviewerType)
    };

    const generator = generators[questionType];
    if (!generator) return null;

    const question = generator();

    // Avoid duplicate questions
    if (usedQuestions.has(question.question)) {
      return null;
    }

    return question;
  }

  private static createPositionQuestion(
    config: CoalitionNegotiationConfig,
    difficulty: DifficultyLevel,
    interviewerType: InterviewerType
  ): DynamicQuestion {
    const parties = config.partyPositions;
    const randomParty = parties[Math.floor(Math.random() * parties.length)];
    const interests = randomParty.coreInterests;
    const interest = interests[Math.floor(Math.random() * interests.length)];

    const templates = [
      `${randomParty.party} insists on ${interest}. Is this something you can accept?`,
      `Your position on ${interest} seems to conflict with ${randomParty.party}'s demands. How do you resolve this?`,
      `The voters didn't give any party a clear mandate on ${interest}. What's your actual position?`,
      `You campaigned on one thing, but now you're negotiating something different on ${interest}. Explain that.`,
      `Where exactly do you draw the line on ${interest} in these negotiations?`
    ];

    const questionText = templates[Math.floor(Math.random() * templates.length)];

    return {
      id: `position-${interest.replace(/\s+/g, '-').toLowerCase()}`,
      type: 'challenge',
      question: questionText,
      interruptionTriggers: this.createInterruptionTriggers(difficulty, interviewerType, 'challenge'),
      followUpRules: this.createFollowUpRules('position-clarification', config, difficulty)
    };
  }

  private static createRedLineQuestion(
    config: CoalitionNegotiationConfig,
    difficulty: DifficultyLevel,
    interviewerType: InterviewerType
  ): DynamicQuestion {
    const redLines = config.redLines;
    const redLine = redLines[Math.floor(Math.random() * redLines.length)];

    const templates = [
      `You call ${redLine.issue} a "red line." But how red is it really when push comes to shove?`,
      `${redLine.description} - is this truly non-negotiable, or is there wiggle room?`,
      `Your red line on ${redLine.issue} could collapse these negotiations. Is it worth that risk?`,
      `Other parties are saying your red line on ${redLine.issue} is just a negotiating position. True?`,
      `If ${redLine.issue} breaks the coalition talks, how do you explain that to voters who want a government?`
    ];

    const questionText = templates[Math.floor(Math.random() * templates.length)];

    return {
      id: `redline-${redLine.issue.replace(/\s+/g, '-').toLowerCase()}`,
      type: 'gotcha',
      question: questionText,
      interruptionTriggers: this.createInterruptionTriggers(difficulty, interviewerType, 'gotcha'),
      followUpRules: this.createFollowUpRules('red-line-testing', config, difficulty)
    };
  }

  private static createCompromiseQuestion(
    config: CoalitionNegotiationConfig,
    difficulty: DifficultyLevel,
    interviewerType: InterviewerType
  ): DynamicQuestion {
    const parties = config.partyPositions;
    const conflictParties = parties.slice(0, 2);

    const templates = [
      `What specific compromises are you prepared to make to get this coalition agreement?`,
      `${conflictParties[0].party} wants one thing, ${conflictParties[1].party} wants another. What gives?`,
      `You can't have everything you promised voters. What are you willing to sacrifice?`,
      `Compromise means someone loses something. What are you prepared to lose?`,
      `Where's the middle ground between these completely different party positions?`,
      `You're asking voters to trust you, but you're already backing down from campaign promises. Why?`
    ];

    const questionText = templates[Math.floor(Math.random() * templates.length)];

    return {
      id: `compromise-${Math.random().toString(36).substr(2, 9)}`,
      type: 'challenge',
      question: questionText,
      interruptionTriggers: this.createInterruptionTriggers(difficulty, interviewerType, 'challenge'),
      followUpRules: this.createFollowUpRules('compromise-exploration', config, difficulty)
    };
  }

  private static createMandateQuestion(
    config: CoalitionNegotiationConfig,
    difficulty: DifficultyLevel,
    interviewerType: InterviewerType
  ): DynamicQuestion {
    const templates = [
      `Your voters didn't vote for a coalition with these parties. Where's your mandate for this?`,
      `You're negotiating away things you promised during the campaign. How is that democratic?`,
      `Do your party members actually support the compromises you're making here?`,
      `You lost seats in the election but you're acting like you won. Where's the humility?`,
      `Your party's voters are already expressing disappointment. Are you listening to them?`,
      `Is this coalition what your voters actually wanted, or just what's politically convenient?`
    ];

    const questionText = templates[Math.floor(Math.random() * templates.length)];

    return {
      id: `mandate-${Math.random().toString(36).substr(2, 9)}`,
      type: 'challenge',
      question: questionText,
      interruptionTriggers: this.createInterruptionTriggers(difficulty, interviewerType, 'challenge'),
      followUpRules: this.createFollowUpRules('party-mandate-challenge', config, difficulty)
    };
  }

  private static createChemistryQuestion(
    config: CoalitionNegotiationConfig,
    difficulty: DifficultyLevel,
    interviewerType: InterviewerType
  ): DynamicQuestion {
    const parties = config.partyPositions;
    const otherParty = parties[Math.floor(Math.random() * parties.length)];

    const templates = [
      `Can you honestly say you trust ${otherParty.party} enough to govern with them for four years?`,
      `There's clearly personal tension between the party leaders. How does that affect governance?`,
      `${otherParty.party} has completely different values from yours. How do you bridge that gap?`,
      `You've been attacking each other for months. Now you want to govern together?`,
      `What happens when you and ${otherParty.party} fundamentally disagree on a major crisis?`,
      `This looks like a marriage of convenience, not conviction. Can that really work?`
    ];

    const questionText = templates[Math.floor(Math.random() * templates.length)];

    return {
      id: `chemistry-${otherParty.party.toLowerCase()}`,
      type: 'challenge',
      question: questionText,
      interruptionTriggers: this.createInterruptionTriggers(difficulty, interviewerType, 'challenge'),
      followUpRules: this.createFollowUpRules('coalition-chemistry', config, difficulty)
    };
  }

  private static createLeadershipQuestion(
    config: CoalitionNegotiationConfig,
    difficulty: DifficultyLevel,
    interviewerType: InterviewerType
  ): DynamicQuestion {
    const templates = [
      `Who actually leads in this coalition? You or the other party leaders?`,
      `You want to be Prime Minister, but do you have the authority to deliver on coalition promises?`,
      `How do you handle it when coalition partners publicly disagree with your decisions?`,
      `What happens when you and your coalition partners want to go in different directions?`,
      `Are you prepared to be a junior partner if that's what it takes to govern?`,
      `Leadership isn't just about titles. Can you actually lead this diverse coalition?`
    ];

    const questionText = templates[Math.floor(Math.random() * templates.length)];

    return {
      id: `leadership-${Math.random().toString(36).substr(2, 9)}`,
      type: 'challenge',
      question: questionText,
      interruptionTriggers: this.createInterruptionTriggers(difficulty, interviewerType, 'challenge'),
      followUpRules: this.createFollowUpRules('leadership-claims', config, difficulty)
    };
  }

  private static createImplementationQuestion(
    config: CoalitionNegotiationConfig,
    difficulty: DifficultyLevel,
    interviewerType: InterviewerType
  ): DynamicQuestion {
    const templates = [
      `These coalition agreements look good on paper, but how do you actually implement them?`,
      `You're promising contradictory things to different voters. How does that work in practice?`,
      `Coalition governments are notorious for inaction. How is yours different?`,
      `When tough decisions come up, who has the final say in this coalition?`,
      `Your agreement is full of vague language. What does it actually commit you to?`,
      `How do you prevent this coalition from becoming paralyzed by disagreement?`
    ];

    const questionText = templates[Math.floor(Math.random() * templates.length)];

    return {
      id: `implementation-${Math.random().toString(36).substr(2, 9)}`,
      type: 'challenge',
      question: questionText,
      interruptionTriggers: this.createInterruptionTriggers(difficulty, interviewerType, 'challenge'),
      followUpRules: this.createFollowUpRules('policy-implementation', config, difficulty)
    };
  }

  private static createTimelineQuestion(
    config: CoalitionNegotiationConfig,
    difficulty: DifficultyLevel,
    interviewerType: InterviewerType
  ): DynamicQuestion {
    const timeToElection = config.negotiationPressure.timeToElection;
    const urgency = timeToElection < 60 ? 'extreme' : timeToElection < 120 ? 'high' : 'moderate';

    const templates = urgency === 'extreme' ? [
      `We're running out of time. Is it new elections or a deal by the end of the week?`,
      `The country can't wait much longer. What's your final offer?`,
      `Time's up. Either make the hard choices now or take responsibility for new elections.`,
      `Every day without a government costs the country. When do you make the final decision?`
    ] : urgency === 'high' ? [
      `These negotiations have been going on for months. When do you pull the plug?`,
      `How much longer can you keep the country waiting for a government?`,
      `At what point do you admit these talks aren't working?`,
      `The public is losing patience. What's your deadline for a deal?`
    ] : [
      `What's your timeline for completing these coalition negotiations?`,
      `How long is too long for coalition talks?`,
      `When do you expect to have a final agreement?`,
      `Are you working to a specific deadline for these negotiations?`
    ];

    const questionText = templates[Math.floor(Math.random() * templates.length)];

    return {
      id: `timeline-${urgency}`,
      type: urgency === 'extreme' ? 'gotcha' : 'challenge',
      urgency: urgency === 'extreme' ? {
        timeLimit: 25,
        warningThreshold: 15,
        timeoutAction: 'auto-select'
      } : undefined,
      question: questionText,
      interruptionTriggers: this.createInterruptionTriggers(difficulty, interviewerType, 'challenge'),
      followUpRules: this.createFollowUpRules('timeline-pressure', config, difficulty)
    };
  }

  private static createAccountabilityQuestion(
    config: CoalitionNegotiationConfig,
    difficulty: DifficultyLevel,
    interviewerType: InterviewerType
  ): DynamicQuestion {
    const templates = [
      `How do you explain these coalition compromises to the voters who trusted you?`,
      `You're changing your positions to get power. Isn't that just politics as usual?`,
      `What accountability is there when coalition partners can blame each other for everything?`,
      `Voters deserve clarity. What exactly are you promising to deliver?`,
      `How do we hold you accountable when you're already making excuses about coalition constraints?`,
      `You want voters to trust you, but you're already breaking campaign promises. Why should they?`
    ];

    const questionText = templates[Math.floor(Math.random() * templates.length)];

    return {
      id: `accountability-${Math.random().toString(36).substr(2, 9)}`,
      type: 'challenge',
      question: questionText,
      interruptionTriggers: this.createInterruptionTriggers(difficulty, interviewerType, 'challenge'),
      followUpRules: this.createFollowUpRules('public-accountability', config, difficulty)
    };
  }

  private static createStabilityQuestion(
    config: CoalitionNegotiationConfig,
    difficulty: DifficultyLevel,
    interviewerType: InterviewerType
  ): DynamicQuestion {
    const templates = [
      `Coalition governments in the Netherlands often collapse. What makes this one different?`,
      `How do you prevent this coalition from falling apart at the first major crisis?`,
      `When this coalition faces its first real test, will it hold together?`,
      `You're already compromising everything. What happens when you need to compromise more?`,
      `Can this coalition actually last four years, or is it built on shaky foundations?`,
      `What's your plan for when coalition partners start pulling in different directions?`
    ];

    const questionText = templates[Math.floor(Math.random() * templates.length)];

    return {
      id: `stability-${Math.random().toString(36).substr(2, 9)}`,
      type: 'challenge',
      question: questionText,
      interruptionTriggers: this.createInterruptionTriggers(difficulty, interviewerType, 'challenge'),
      followUpRules: this.createFollowUpRules('stability-assurance', config, difficulty)
    };
  }

  private static createInterruptionTriggers(
    difficulty: DifficultyLevel,
    interviewerType: InterviewerType,
    questionType: string
  ): InterruptionTrigger[] {
    const evasionTriggers = [
      'That\\'s not really an answer',
      'You\\'re avoiding the specific question',
      'I need a clearer response than that',
      'That\\'s political spin, not an answer'
    ];

    const contradictionTriggers = [
      'That contradicts what you said during the campaign',
      'But your party voted differently just last month',
      'That\\'s not what your coalition partners are saying',
      'You\\'re changing your position mid-interview'
    ];

    const pressureTriggers = [
      'Yes or no - can you deliver that?',
      'Be specific - what exactly will you do?',
      'Stop talking around the issue',
      'Give me a straight answer'
    ];

    const triggers: InterruptionTrigger[] = [];

    // Evasion triggers (all difficulty levels)
    triggers.push({
      id: 'evasion-interrupt',
      condition: 'evasive-language',
      response: evasionTriggers[Math.floor(Math.random() * evasionTriggers.length)],
      probability: difficulty === 'extreme' ? 0.8 : difficulty === 'high' ? 0.6 : 0.4,
      cooldown: 5
    });

    // Contradiction triggers (medium and up)
    if (difficulty !== 'low') {
      triggers.push({
        id: 'contradiction-interrupt',
        condition: 'contradicts-previous',
        response: contradictionTriggers[Math.floor(Math.random() * contradictionTriggers.length)],
        probability: difficulty === 'extreme' ? 0.7 : 0.5,
        cooldown: 8
      });
    }

    // Pressure triggers (high and extreme, confrontational interviewer)
    if ((difficulty === 'high' || difficulty === 'extreme') && interviewerType === 'confrontational') {
      triggers.push({
        id: 'pressure-interrupt',
        condition: 'too-vague',
        response: pressureTriggers[Math.floor(Math.random() * pressureTriggers.length)],
        probability: 0.6,
        cooldown: 10
      });
    }

    return triggers;
  }

  private static createFollowUpRules(
    questionType: string,
    config: CoalitionNegotiationConfig,
    difficulty: DifficultyLevel
  ): FollowUpRule[] {
    const rules: FollowUpRule[] = [];

    // Add follow-up rules based on question type
    switch (questionType) {
      case 'position-clarification':
        rules.push({
          id: 'clarify-position',
          condition: 'vague-response',
          action: 'follow-up',
          template: 'Can you be more specific about your actual position?',
          probability: 0.7
        });
        break;

      case 'red-line-testing':
        rules.push({
          id: 'test-flexibility',
          condition: 'claims-inflexible',
          action: 'follow-up',
          template: 'Even if it means no government at all?',
          probability: 0.8
        });
        break;

      case 'compromise-exploration':
        rules.push({
          id: 'specific-compromise',
          condition: 'mentions-compromise',
          action: 'follow-up',
          template: 'What specifically are you willing to give up?',
          probability: 0.8
        });
        break;

      case 'timeline-pressure':
        rules.push({
          id: 'deadline-pressure',
          condition: 'no-clear-timeline',
          action: 'follow-up',
          template: 'The country needs a government. When is enough enough?',
          probability: 0.9
        });
        break;
    }

    // Add difficulty-based rules
    if (difficulty === 'extreme') {
      rules.push({
        id: 'extreme-pressure',
        condition: 'any-response',
        action: 'follow-up',
        template: 'But is that really good enough in this crisis?',
        probability: 0.5
      });
    }

    return rules;
  }
}