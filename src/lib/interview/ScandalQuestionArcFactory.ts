/**
 * Scandal Question Arc Factory
 * Generates crisis interview question arcs based on scandal scenarios
 */

import type {
  QuestionArc,
  ScandalQuestion,
  ScandalScenario,
  ScandalInterviewConfig,
  DifficultyLevel,
  InterruptionTrigger,
  FollowUpRule,
  ContextualResponseOption
} from '../types/interview.js';

export class ScandalQuestionArcFactory {
  /**
   * Create a scandal-specific question arc
   */
  static createScandalArc(
    config: ScandalInterviewConfig,
    scenario: ScandalScenario
  ): QuestionArc {
    const questions = this.generateScandalQuestions(config, scenario);

    return {
      backgroundId: config.backgroundId,
      difficulty: this.mapPressureToArcDifficulty(config.pressureLevel),
      interviewerApproach: 'confrontational', // Scandal interviews are inherently confrontational
      questionCount: questions.length,
      questions
    };
  }

  private static generateScandalQuestions(
    config: ScandalInterviewConfig,
    scenario: ScandalScenario
  ): ScandalQuestion[] {
    const questions: ScandalQuestion[] = [];

    // 1. Opening accountability question
    questions.push(this.createOpeningQuestion(scenario));

    // 2. Evidence-based questions
    const evidenceQuestions = this.createEvidenceQuestions(scenario, 2);
    questions.push(...evidenceQuestions);

    // 3. Stakeholder impact questions
    const stakeholderQuestions = this.createStakeholderQuestions(scenario, 2);
    questions.push(...stakeholderQuestions);

    // 4. Defense challenge questions
    const defenseQuestions = this.createDefenseChallengeQuestions(scenario, 2);
    questions.push(...defenseQuestions);

    // 5. Future/resignation question
    questions.push(this.createFutureQuestion(scenario));

    // 6. Final accountability question
    questions.push(this.createClosingQuestion(scenario));

    return questions;
  }

  private static createOpeningQuestion(scenario: ScandalScenario): ScandalQuestion {
    const openingQuestions = {
      'financial-impropriety': "Financial irregularities have been revealed in your affairs. How can the Dutch people trust you with their tax money?",
      'personal-conduct': "Serious questions have been raised about your personal conduct. What do you say to voters who feel betrayed?",
      'policy-contradiction': "You've completely reversed your position on a key issue. How is this not a betrayal of your voters?",
      'competence-failure': "Your decisions led to significant public harm. Why shouldn't you resign immediately?",
      'association-scandal': "Your association with controversial figures raises serious questions about your judgment. How do you explain this?",
      'corruption-allegation': "Evidence suggests you traded political influence for personal gain. How do you respond to these corruption allegations?",
      'cover-up-accusation': "You're accused of deliberately hiding information from the public. How is this not a cover-up?",
      'abuse-of-power': "You stand accused of abusing your official position. How do you justify this to the Dutch people?",
      'ethical-violation': "You've violated multiple ethics standards. How can you continue in office?",
      'criminal-allegation': "Criminal charges have been filed against you. Should you step down while this is resolved?"
    };

    return {
      id: 'scandal-opening',
      type: 'opener',
      setup: `This scandal has dominated headlines for ${scenario.timeUntilInterview} hours. Public trust is at stake.`,
      question: openingQuestions[scenario.type],
      urgency: {
        timeLimit: 45,
        warningThreshold: 35,
        timeoutAction: 'penalty'
      },
      evidenceReferenced: [],
      stakeholderMentioned: [],
      damageIfUnanswered: 30,
      escapeDifficulty: 85,
      followUpIntensity: 'relentless',
      interruptionTriggers: [
        {
          condition: 'evasion',
          probability: 0.9,
          message: "That's not an answer. The Dutch people deserve the truth.",
          followUpAction: 'accountability-pressure'
        },
        {
          condition: 'deflection',
          probability: 0.95,
          message: "Don't change the subject. This is about YOUR actions.",
          followUpAction: 'direct-confrontation'
        },
        {
          condition: 'blame-others',
          probability: 0.85,
          message: "You were in charge. Take responsibility for YOUR decisions.",
          followUpAction: 'responsibility-challenge'
        }
      ],
      followUpRules: [
        { if: 'tone:defensive', then: 'defensive-follow-up', probability: 0.8 },
        { if: 'tone:aggressive', then: 'calm-down-redirect', probability: 0.7 },
        { if: 'word_count<15', then: 'insufficient-answer', probability: 0.9 }
      ],
      responseOptions: this.generateOpeningResponseOptions(scenario)
    };
  }

  private static createEvidenceQuestions(scenario: ScandalScenario, count: number): ScandalQuestion[] {
    const questions: ScandalQuestion[] = [];
    const strongEvidence = scenario.evidenceAgainst
      .filter(e => e.credibility > 70 && e.damageLevel > 50)
      .slice(0, count);

    strongEvidence.forEach((evidence, index) => {
      questions.push({
        id: `evidence-question-${index}`,
        type: 'challenge',
        question: this.generateEvidenceQuestion(evidence, scenario.type),
        urgency: {
          timeLimit: 40,
          warningThreshold: 30,
          timeoutAction: 'penalty'
        },
        evidenceReferenced: [evidence.id],
        stakeholderMentioned: [],
        damageIfUnanswered: evidence.damageLevel * 0.4,
        escapeDifficulty: evidence.credibility,
        followUpIntensity: evidence.canBeDisputed ? 'persistent' : 'relentless',
        interruptionTriggers: [
          {
            condition: 'denial',
            probability: 0.8,
            message: `But we have ${evidence.type} that clearly shows ${evidence.description.toLowerCase()}`,
            followUpAction: 'evidence-confrontation'
          }
        ],
        followUpRules: [
          { if: 'contradicts:evidence', then: 'evidence-contradiction', probability: 0.9 }
        ],
        responseOptions: this.generateEvidenceResponseOptions(evidence, scenario)
      });
    });

    return questions;
  }

  private static createStakeholderQuestions(scenario: ScandalScenario, count: number): ScandalQuestion[] {
    const questions: ScandalQuestion[] = [];
    const keyStakeholders = scenario.stakeholders
      .filter(s => s.credibility > 70 && s.relationship !== 'ally')
      .slice(0, count);

    keyStakeholders.forEach((stakeholder, index) => {
      questions.push({
        id: `stakeholder-question-${index}`,
        type: 'challenge',
        question: this.generateStakeholderQuestion(stakeholder, scenario),
        urgency: {
          timeLimit: 35,
          warningThreshold: 25,
          timeoutAction: 'penalty'
        },
        evidenceReferenced: [],
        stakeholderMentioned: [stakeholder.id],
        damageIfUnanswered: 25,
        escapeDifficulty: 70,
        followUpIntensity: stakeholder.relationship === 'victim' ? 'relentless' : 'persistent',
        interruptionTriggers: [
          {
            condition: 'attack-stakeholder',
            probability: 0.9,
            message: `You're attacking the credibility of ${stakeholder.name}? That's a serious accusation.`,
            followUpAction: 'stakeholder-defense'
          }
        ],
        followUpRules: [
          { if: 'tone:aggressive', then: 'stakeholder-sympathy', probability: 0.7 }
        ],
        responseOptions: this.generateStakeholderResponseOptions(stakeholder, scenario)
      });
    });

    return questions;
  }

  private static createDefenseChallengeQuestions(scenario: ScandalScenario, count: number): ScandalQuestion[] {
    const questions: ScandalQuestion[] = [];

    // Challenge common defense strategies
    const defenseTypes = ['deny-completely', 'blame-others', 'deflect-to-policy', 'claim-misunderstanding'];

    defenseTypes.slice(0, count).forEach((defenseType, index) => {
      questions.push({
        id: `defense-challenge-${index}`,
        type: 'gotcha',
        question: this.generateDefenseChallengeQuestion(defenseType, scenario),
        urgency: {
          timeLimit: 30,
          warningThreshold: 20,
          timeoutAction: 'penalty'
        },
        evidenceReferenced: [],
        stakeholderMentioned: [],
        damageIfUnanswered: 35,
        escapeDifficulty: 90,
        followUpIntensity: 'relentless',
        interruptionTriggers: [
          {
            condition: 'repeat-defense',
            probability: 0.85,
            message: "You keep saying the same thing. Do you have any new explanation?",
            followUpAction: 'broken-record'
          }
        ],
        followUpRules: [
          { if: 'tone:evasive', then: 'pin-down-answer', probability: 0.9 }
        ],
        responseOptions: this.generateDefenseChallengeResponseOptions(defenseType, scenario)
      });
    });

    return questions;
  }

  private static createFutureQuestion(scenario: ScandalScenario): ScandalQuestion {
    const futureQuestions = {
      'minor': "How will you rebuild public trust after this incident?",
      'moderate': "Given this scandal, how can you continue to be effective in your role?",
      'major': "Many are calling for your resignation. Why shouldn't you step down?",
      'catastrophic': "This is a career-ending scandal. When will you announce your resignation?"
    };

    return {
      id: 'future-position',
      type: 'closer',
      question: futureQuestions[scenario.severity],
      urgency: {
        timeLimit: 50,
        warningThreshold: 40,
        timeoutAction: 'penalty'
      },
      evidenceReferenced: [],
      stakeholderMentioned: [],
      damageIfUnanswered: 40,
      escapeDifficulty: 75,
      followUpIntensity: 'persistent',
      interruptionTriggers: [
        {
          condition: 'refuses-resignation',
          probability: 0.7,
          message: "So you're clinging to power despite this scandal?",
          followUpAction: 'resignation-pressure'
        }
      ],
      followUpRules: [
        { if: 'mentions:resignation', then: 'resignation-timing', probability: 0.8 }
      ],
      responseOptions: this.generateFutureResponseOptions(scenario)
    };
  }

  private static createClosingQuestion(scenario: ScandalScenario): ScandalQuestion {
    return {
      id: 'final-accountability',
      type: 'closer',
      question: "Final question: Do you accept full responsibility for your actions, and what do you say to the Dutch people who feel betrayed?",
      urgency: {
        timeLimit: 60,
        warningThreshold: 45,
        timeoutAction: 'penalty'
      },
      evidenceReferenced: [],
      stakeholderMentioned: [],
      damageIfUnanswered: 50,
      escapeDifficulty: 60,
      followUpIntensity: 'gentle', // Give them a chance to end on their terms
      interruptionTriggers: [
        {
          condition: 'no-responsibility',
          probability: 0.6,
          message: "So you take no responsibility at all?",
          followUpAction: 'final-accountability'
        }
      ],
      followUpRules: [],
      responseOptions: this.generateClosingResponseOptions(scenario)
    };
  }

  // Helper methods for generating question content

  private static generateEvidenceQuestion(evidence: any, scandalType: string): string {
    const evidenceQuestions = {
      'document': `We have documents that show ${evidence.description.toLowerCase()}. How do you explain this?`,
      'financial-record': `Financial records clearly show ${evidence.description.toLowerCase()}. This is your signature, isn't it?`,
      'email': `These emails from your account show ${evidence.description.toLowerCase()}. Are you saying they're fake?`,
      'testimony': `Multiple witnesses testify that ${evidence.description.toLowerCase()}. Are they all lying?`,
      'recording': `We have recordings that prove ${evidence.description.toLowerCase()}. How do you respond?`,
      'photo': `This photograph clearly shows ${evidence.description.toLowerCase()}. What's your explanation?`
    };

    return evidenceQuestions[evidence.type as keyof typeof evidenceQuestions] ||
           `Evidence shows ${evidence.description.toLowerCase()}. How do you respond?`;
  }

  private static generateStakeholderQuestion(stakeholder: any, scenario: ScandalScenario): string {
    if (stakeholder.relationship === 'victim') {
      return `${stakeholder.name} says "${stakeholder.publicStatement}". What do you say to ${stakeholder.name} directly?`;
    } else if (stakeholder.relationship === 'hostile') {
      return `${stakeholder.name} from ${stakeholder.role} states: "${stakeholder.publicStatement}". How do you respond to these serious allegations?`;
    } else {
      return `${stakeholder.name} has expressed concerns about your actions. How do you address their worries?`;
    }
  }

  private static generateDefenseChallengeQuestion(defenseType: string, scenario: ScandalScenario): string {
    const challengeQuestions = {
      'deny-completely': "You keep denying everything, but the evidence is overwhelming. When will you stop lying to the Dutch people?",
      'blame-others': "You blame everyone but yourself. When will you take personal responsibility for YOUR decisions?",
      'deflect-to-policy': "Every time I ask about this scandal, you talk about policy. Are you incapable of addressing the actual issue?",
      'claim-misunderstanding': "You claim this is all a misunderstanding. How can such serious evidence be just a misunderstanding?"
    };

    return challengeQuestions[defenseType as keyof typeof challengeQuestions] ||
           "How do you justify your actions to the Dutch people?";
  }

  // Response option generators

  private static generateOpeningResponseOptions(scenario: ScandalScenario): ContextualResponseOption[] {
    return [
      {
        text: "I take full responsibility and deeply regret my actions.",
        tone: 'diplomatic',
        consequences: [
          { type: 'performance-impact', value: { authenticity: +15, credibility: +10 } },
          { type: 'mood-change', value: 'sympathetic' }
        ],
        triggers: ['accountability-shown']
      },
      {
        text: "These allegations are completely false and I will fight them vigorously.",
        tone: 'aggressive',
        consequences: [
          { type: 'performance-impact', value: { authenticity: -10, confidence: +5 } },
          { type: 'mood-change', value: 'skeptical' }
        ],
        triggers: ['denial-defense']
      },
      {
        text: "I believe we should focus on the real issues facing Dutch families.",
        tone: 'evasive',
        consequences: [
          { type: 'performance-impact', value: { authenticity: -15 } },
          { type: 'mood-change', value: 'frustrated' },
          { type: 'trigger-follow-up', value: 'deflection-challenge' }
        ],
        triggers: ['deflection-attempt']
      }
    ];
  }

  private static generateEvidenceResponseOptions(evidence: any, scenario: ScandalScenario): ContextualResponseOption[] {
    const options: ContextualResponseOption[] = [
      {
        text: "This evidence is taken out of context and doesn't tell the full story.",
        tone: 'defensive',
        consequences: [
          { type: 'performance-impact', value: { credibility: -5 } }
        ],
        triggers: ['context-defense']
      }
    ];

    if (evidence.canBeDisputed) {
      options.push({
        text: `The source of this ${evidence.type} is unreliable and the information is questionable.`,
        tone: 'confrontational',
        consequences: [
          { type: 'performance-impact', value: { confidence: +5, authenticity: -8 } }
        ],
        triggers: ['evidence-dispute']
      });
    }

    return options;
  }

  private static generateStakeholderResponseOptions(stakeholder: any, scenario: ScandalScenario): ContextualResponseOption[] {
    return [
      {
        text: `I understand ${stakeholder.name}'s concerns and I'm committed to addressing them.`,
        tone: 'diplomatic',
        consequences: [
          { type: 'performance-impact', value: { empathy: +8 } }
        ],
        triggers: ['stakeholder-sympathy']
      },
      {
        text: `${stakeholder.name} has their own agenda and is not presenting the full picture.`,
        tone: 'aggressive',
        consequences: [
          { type: 'performance-impact', value: { authenticity: -12 } },
          { type: 'mood-change', value: 'hostile' }
        ],
        triggers: ['stakeholder-attack']
      }
    ];
  }

  private static generateDefenseChallengeResponseOptions(defenseType: string, scenario: ScandalScenario): ContextualResponseOption[] {
    return [
      {
        text: "I understand your frustration, but I'm telling the truth as I know it.",
        tone: 'confident',
        consequences: [
          { type: 'performance-impact', value: { authenticity: +5 } }
        ],
        triggers: ['truth-claim']
      },
      {
        text: "You're being unfair and not giving me a chance to explain properly.",
        tone: 'defensive',
        consequences: [
          { type: 'performance-impact', value: { authenticity: -8 } },
          { type: 'mood-change', value: 'frustrated' }
        ],
        triggers: ['interviewer-attack']
      }
    ];
  }

  private static generateFutureResponseOptions(scenario: ScandalScenario): ContextualResponseOption[] {
    return [
      {
        text: "I will continue to serve the Dutch people and work to rebuild their trust.",
        tone: 'confident',
        consequences: [
          { type: 'performance-impact', value: { confidence: +8 } }
        ],
        triggers: ['staying-in-office']
      },
      {
        text: "I'm considering all options, including whether it's best for me to step aside.",
        tone: 'diplomatic',
        consequences: [
          { type: 'performance-impact', value: { authenticity: +10, credibility: +12 } }
        ],
        triggers: ['resignation-consideration']
      }
    ];
  }

  private static generateClosingResponseOptions(scenario: ScandalScenario): ContextualResponseOption[] {
    return [
      {
        text: "I accept full responsibility and apologize to everyone I've let down. I will work every day to earn back your trust.",
        tone: 'diplomatic',
        consequences: [
          { type: 'performance-impact', value: { authenticity: +20, credibility: +15 } }
        ],
        triggers: ['full-accountability']
      },
      {
        text: "I maintain my innocence, but I understand people are disappointed. I will continue fighting for the truth.",
        tone: 'confident',
        consequences: [
          { type: 'performance-impact', value: { confidence: +10, credibility: -5 } }
        ],
        triggers: ['innocence-maintained']
      }
    ];
  }

  private static mapPressureToArcDifficulty(pressureLevel: 'low' | 'medium' | 'high' | 'extreme'): DifficultyLevel {
    const mapping = {
      'low': 'medium' as DifficultyLevel,
      'medium': 'high' as DifficultyLevel,
      'high': 'extreme' as DifficultyLevel,
      'extreme': 'extreme' as DifficultyLevel
    };

    return mapping[pressureLevel];
  }
}