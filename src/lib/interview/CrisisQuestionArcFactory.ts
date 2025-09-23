/**
 * Crisis Question Arc Factory
 * Generates crisis-specific interview questions based on crisis type and urgency
 */

import type {
  QuestionArc,
  DynamicQuestion,
  CrisisManagementConfig,
  CrisisType,
  StakeholderPressure,
  InterruptionTrigger,
  FollowUpRule,
  ContextualResponseOption
} from '../types/interview.js';

export class CrisisQuestionArcFactory {
  /**
   * Create a crisis management question arc
   */
  static createCrisisArc(config: CrisisManagementConfig): QuestionArc {
    const questions = this.generateCrisisQuestions(config);

    return {
      backgroundId: config.backgroundId,
      difficulty: this.mapCrisisToArcDifficulty(config.crisisType, config.crisisPhase),
      interviewerApproach: 'investigative', // Crisis interviews are investigative and urgent
      questionCount: questions.length,
      questions
    };
  }

  private static generateCrisisQuestions(config: CrisisManagementConfig): DynamicQuestion[] {
    const questions: DynamicQuestion[] = [];

    // 1. Immediate response/accountability question
    questions.push(this.createImmediateResponseQuestion(config));

    // 2. Crisis-specific probing questions
    const crisisQuestions = this.createCrisisSpecificQuestions(config, 2);
    questions.push(...crisisQuestions);

    // 3. Stakeholder impact questions
    const stakeholderQuestions = this.createStakeholderImpactQuestions(config, 2);
    questions.push(...stakeholderQuestions);

    // 4. Decision/action plan questions
    const actionQuestions = this.createActionPlanQuestions(config, 1);
    questions.push(...actionQuestions);

    // 5. Leadership under pressure question
    questions.push(this.createLeadershipTestQuestion(config));

    // 6. Future prevention/lessons question
    questions.push(this.createFuturePreventionQuestion(config));

    return questions;
  }

  private static createImmediateResponseQuestion(config: CrisisManagementConfig): DynamicQuestion {
    const crisisQuestions = {
      'policy-failure': "A major policy under your oversight has failed spectacularly. What's your immediate response?",
      'public-safety': "Public safety is at immediate risk. What actions are you taking right now to protect people?",
      'economic-crisis': "The economy is in freefall. What emergency measures will you implement immediately?",
      'coalition-collapse': "Your governing coalition is collapsing. How do you maintain stability and governance?",
      'external-threat': "We face an urgent external threat. What's your immediate response to protect the nation?",
      'institutional-failure': "A major government institution has failed. How do you restore public confidence immediately?",
      'social-unrest': "Violence has erupted in the streets. What immediate steps will you take to restore order?",
      'environmental-disaster': "An environmental catastrophe is unfolding. What emergency response are you coordinating?",
      'corruption-revelation': "Massive corruption has been exposed in your administration. What's your immediate response?",
      'leadership-crisis': "Your leadership is being questioned by all sides. How do you restore confidence immediately?"
    };

    return {
      id: 'crisis-immediate-response',
      type: 'opener',
      setup: `This crisis is developing rapidly. The public demands immediate leadership and action.`,
      question: crisisQuestions[config.crisisType],
      urgency: {
        timeLimit: 30, // Very tight time limit for crisis
        warningThreshold: 20,
        timeoutAction: 'penalty'
      },
      interruptionTriggers: [
        {
          condition: 'hesitation',
          probability: 0.9,
          message: "People are suffering while you hesitate. What ACTION are you taking?",
          followUpAction: 'action-demand'
        },
        {
          condition: 'deflection',
          probability: 0.95,
          message: "This is YOUR crisis to manage. Don't deflect - what are YOU doing?",
          followUpAction: 'responsibility-pressure'
        },
        {
          condition: 'committee-formation',
          probability: 0.85,
          message: "Forming committees takes time people don't have. What immediate action?",
          followUpAction: 'urgency-pressure'
        }
      ],
      followUpRules: [
        { if: 'tone:evasive', then: 'direct-action-demand', probability: 0.9 },
        { if: 'mentions:investigation', then: 'action-vs-investigation', probability: 0.8 },
        { if: 'word_count<20', then: 'insufficient-detail', probability: 0.9 }
      ],
      responseOptions: this.generateImmediateResponseOptions(config)
    };
  }

  private static createCrisisSpecificQuestions(config: CrisisManagementConfig, count: number): DynamicQuestion[] {
    const questions: DynamicQuestion[] = [];

    // Generate questions specific to the crisis type
    const crisisSpecificQuestions = this.getCrisisSpecificQuestionSets(config.crisisType);

    for (let i = 0; i < Math.min(count, crisisSpecificQuestions.length); i++) {
      const questionData = crisisSpecificQuestions[i];

      questions.push({
        id: `crisis-specific-${i}`,
        type: 'challenge',
        setup: questionData.setup,
        question: questionData.question,
        urgency: {
          timeLimit: 35,
          warningThreshold: 25,
          timeoutAction: 'penalty'
        },
        interruptionTriggers: [
          {
            condition: 'technical-jargon',
            probability: 0.7,
            message: "Speak plainly. People are scared and need to understand what you're doing.",
            followUpAction: 'plain-language'
          },
          {
            condition: 'blame-shifting',
            probability: 0.9,
            message: "Stop blaming others. You're in charge - what's YOUR solution?",
            followUpAction: 'ownership-demand'
          }
        ],
        followUpRules: [
          { if: 'provides-timeline', then: 'timeline-detail', probability: 0.7 },
          { if: 'mentions-resources', then: 'resource-adequacy', probability: 0.8 }
        ],
        responseOptions: this.generateCrisisSpecificResponseOptions(config, questionData),
        metadata: {
          crisisSpecific: true,
          urgencyLevel: 'high'
        }
      });
    }

    return questions;
  }

  private static createStakeholderImpactQuestions(config: CrisisManagementConfig, count: number): DynamicQuestion[] {
    const questions: DynamicQuestion[] = [];
    const keyStakeholders = config.stakeholderPressure
      .sort((a, b) => b.pressureLevel - a.pressureLevel)
      .slice(0, count);

    keyStakeholders.forEach((stakeholder, index) => {
      questions.push({
        id: `stakeholder-impact-${index}`,
        type: 'challenge',
        setup: `${stakeholder.stakeholder} are demanding immediate action. They have significant influence.`,
        question: this.generateStakeholderQuestion(stakeholder, config),
        urgency: {
          timeLimit: 40,
          warningThreshold: 30,
          timeoutAction: 'penalty'
        },
        interruptionTriggers: [
          {
            condition: 'dismisses-stakeholder',
            probability: 0.8,
            message: `You can't dismiss ${stakeholder.stakeholder}. They have real power and legitimate concerns.`,
            followUpAction: 'stakeholder-respect'
          },
          {
            condition: 'empty-promises',
            probability: 0.75,
            message: "They've heard promises before. What concrete action will you take?",
            followUpAction: 'concrete-action'
          }
        ],
        followUpRules: [
          { if: 'addresses-demands', then: 'implementation-detail', probability: 0.7 },
          { if: 'tone:dismissive', then: 'stakeholder-importance', probability: 0.9 }
        ],
        responseOptions: this.generateStakeholderResponseOptions(stakeholder, config),
        metadata: {
          stakeholder: stakeholder.stakeholder,
          pressureLevel: stakeholder.pressureLevel
        }
      });
    });

    return questions;
  }

  private static createActionPlanQuestions(config: CrisisManagementConfig, count: number): DynamicQuestion[] {
    const questions: DynamicQuestion[] = [];

    const actionPlanQuestion = {
      id: 'crisis-action-plan',
      type: 'challenge',
      setup: "Beyond immediate response, people need to know there's a comprehensive plan.",
      question: this.generateActionPlanQuestion(config),
      urgency: {
        timeLimit: 50,
        warningThreshold: 35,
        timeoutAction: 'penalty'
      },
      interruptionTriggers: [
        {
          condition: 'vague-plan',
          probability: 0.8,
          message: "That's too vague. Give us specific steps with specific timelines.",
          followUpAction: 'specificity-demand'
        },
        {
          condition: 'unrealistic-timeline',
          probability: 0.7,
          message: "That timeline seems unrealistic given the scope. Are you being honest about what's possible?",
          followUpAction: 'reality-check'
        }
      ],
      followUpRules: [
        { if: 'provides-steps', then: 'step-feasibility', probability: 0.8 },
        { if: 'mentions-budget', then: 'budget-source', probability: 0.9 }
      ],
      responseOptions: this.generateActionPlanResponseOptions(config),
      metadata: {
        requiresSpecificity: true,
        planningFocus: true
      }
    };

    questions.push(actionPlanQuestion);
    return questions;
  }

  private static createLeadershipTestQuestion(config: CrisisManagementConfig): DynamicQuestion {
    return {
      id: 'leadership-under-pressure',
      type: 'gotcha',
      setup: "Leadership is tested in crisis. This is your test.",
      question: this.generateLeadershipTestQuestion(config),
      urgency: {
        timeLimit: 45,
        warningThreshold: 30,
        timeoutAction: 'penalty'
      },
      interruptionTriggers: [
        {
          condition: 'shows-weakness',
          probability: 0.6,
          message: "The public needs strong leadership right now. Are you that leader?",
          followUpAction: 'strength-test'
        },
        {
          condition: 'avoids-responsibility',
          probability: 0.9,
          message: "Leaders take responsibility. Will you?",
          followUpAction: 'responsibility-final'
        }
      ],
      followUpRules: [
        { if: 'shows-emotion', then: 'emotion-appropriateness', probability: 0.6 },
        { if: 'demonstrates-resolve', then: 'resolve-backing', probability: 0.7 }
      ],
      responseOptions: this.generateLeadershipResponseOptions(config),
      metadata: {
        leadershipTest: true,
        definingMoment: true
      }
    };
  }

  private static createFuturePreventionQuestion(config: CrisisManagementConfig): DynamicQuestion {
    return {
      id: 'future-prevention',
      type: 'closer',
      setup: "Looking beyond this crisis, people want to know this won't happen again.",
      question: "How do you ensure a crisis like this never happens again under your leadership?",
      urgency: {
        timeLimit: 60,
        warningThreshold: 45,
        timeoutAction: 'auto-select'
      },
      interruptionTriggers: [
        {
          condition: 'no-changes',
          probability: 0.8,
          message: "If nothing changes, this will happen again. What WILL change?",
          followUpAction: 'change-demand'
        }
      ],
      followUpRules: [
        { if: 'mentions-reform', then: 'reform-specifics', probability: 0.8 },
        { if: 'accepts-responsibility', then: 'accountability-measures', probability: 0.7 }
      ],
      responseOptions: this.generatePreventionResponseOptions(config),
      metadata: {
        forwardLooking: true,
        systemicChanges: true
      }
    };
  }

  // Crisis-specific question sets

  private static getCrisisSpecificQuestionSets(crisisType: CrisisType): Array<{setup: string, question: string}> {
    const questionSets = {
      'policy-failure': [
        {
          setup: "The policy failure has affected thousands of families.",
          question: "How many people have been harmed, and what specific compensation will they receive?"
        },
        {
          setup: "Warning signs were apparently ignored.",
          question: "Who raised concerns about this policy, and why were they ignored?"
        }
      ],
      'public-safety': [
        {
          setup: "Every minute of delay potentially costs lives.",
          question: "How many emergency responders are deployed, and what equipment do they need?"
        },
        {
          setup: "People in the affected area are panicking.",
          question: "What specific instructions do you have for people in immediate danger?"
        }
      ],
      'economic-crisis': [
        {
          setup: "Businesses are closing and jobs are disappearing.",
          question: "How many jobs will be lost, and what immediate support are you providing?"
        },
        {
          setup: "International markets are losing confidence.",
          question: "What are you telling international investors to restore confidence?"
        }
      ],
      'coalition-collapse': [
        {
          setup: "Government stability is in question.",
          question: "Can you govern effectively without your coalition partners?"
        },
        {
          setup: "Early elections may be necessary.",
          question: "Are you prepared to call early elections if government becomes unworkable?"
        }
      ],
      'external-threat': [
        {
          setup: "National security is at stake.",
          question: "What specific threats have been identified, and how are you countering them?"
        },
        {
          setup: "International cooperation may be needed.",
          question: "Which allies are you coordinating with, and what support have you requested?"
        }
      ],
      'institutional-failure': [
        {
          setup: "Public trust in government institutions is collapsing.",
          question: "How do you restore trust when the system itself has failed?"
        },
        {
          setup: "The failure reveals systemic problems.",
          question: "What fundamental reforms will prevent institutional failure in the future?"
        }
      ],
      'social-unrest': [
        {
          setup: "Violence is escalating in multiple cities.",
          question: "What instructions have you given to police and security forces?"
        },
        {
          setup: "The underlying issues driving unrest remain.",
          question: "Beyond restoring order, how will you address the root causes?"
        }
      ],
      'environmental-disaster': [
        {
          setup: "Environmental damage may be irreversible.",
          question: "What is the full extent of environmental damage, and can it be reversed?"
        },
        {
          setup: "Health impacts are still being assessed.",
          question: "What health monitoring is in place for affected populations?"
        }
      ],
      'corruption-revelation': [
        {
          setup: "The corruption appears widespread and systematic.",
          question: "How deep does the corruption go, and who else is involved?"
        },
        {
          setup: "Public funds may have been stolen.",
          question: "How much money was stolen, and will it be recovered?"
        }
      ],
      'leadership-crisis': [
        {
          setup: "Confidence in your leadership has collapsed.",
          question: "Why should anyone trust your leadership after this crisis?"
        },
        {
          setup: "Calls for resignation are mounting.",
          question: "Would stepping down be better for the country than continuing?"
        }
      ]
    };

    return questionSets[crisisType] || [];
  }

  // Question generation helpers

  private static generateStakeholderQuestion(stakeholder: StakeholderPressure, config: CrisisManagementConfig): string {
    const demands = stakeholder.demands.slice(0, 2).join(' and ');
    return `${stakeholder.stakeholder} are demanding ${demands}. Will you meet these demands, and if so, when?`;
  }

  private static generateActionPlanQuestion(config: CrisisManagementConfig): string {
    const planQuestions = {
      'policy-failure': "What's your comprehensive plan to fix the failed policy and prevent similar failures?",
      'public-safety': "Beyond immediate response, what's your long-term plan to ensure public safety?",
      'economic-crisis': "What's your detailed economic recovery plan with specific timelines and measures?",
      'coalition-collapse': "How will you form a new government or restore coalition stability?",
      'external-threat': "What's your comprehensive national security strategy to address this threat?",
      'institutional-failure': "What's your plan to rebuild and reform the failed institutions?",
      'social-unrest': "What comprehensive plan will address both immediate security and underlying social issues?",
      'environmental-disaster': "What's your comprehensive environmental recovery and prevention plan?",
      'corruption-revelation': "What's your detailed plan to root out corruption and restore integrity?",
      'leadership-crisis': "What's your plan to restore confidence and effective governance?"
    };

    return planQuestions[config.crisisType] || "What's your comprehensive plan to resolve this crisis?";
  }

  private static generateLeadershipTestQuestion(config: CrisisManagementConfig): string {
    const leadershipQuestions = {
      'policy-failure': "This policy failure happened on your watch. Do you accept full responsibility?",
      'public-safety': "Lives are at stake. Are you the leader people need in this moment?",
      'economic-crisis': "The economy is collapsing under your leadership. Can you lead us out of this?",
      'coalition-collapse': "Your government is falling apart. Are you strong enough to hold it together?",
      'external-threat': "The nation faces a serious threat. Do you have what it takes to protect us?",
      'institutional-failure': "Government institutions failed under your watch. How is this not a leadership failure?",
      'social-unrest': "Society is tearing apart. Can you unite and heal the country?",
      'environmental-disaster': "An environmental catastrophe occurred under your leadership. What does this say about your judgment?",
      'corruption-revelation': "Massive corruption festered under your nose. How are you not responsible?",
      'leadership-crisis': "Nobody trusts your leadership anymore. Why shouldn't you resign?"
    };

    return leadershipQuestions[config.crisisType] || "This crisis tests your leadership. Are you up to the challenge?";
  }

  // Response option generators

  private static generateImmediateResponseOptions(config: CrisisManagementConfig): ContextualResponseOption[] {
    return [
      {
        text: "I'm taking immediate action: [specific action]. Emergency teams are deployed and I'm coordinating the response personally.",
        tone: 'confident',
        consequences: [
          { type: 'performance-impact', value: { leadership: +15, immediacy: +12 } }
        ],
        triggers: ['immediate-action']
      },
      {
        text: "This is a complex situation that requires careful analysis. We're forming an expert committee to assess the best response.",
        tone: 'professional',
        consequences: [
          { type: 'performance-impact', value: { cautiousness: +8, urgency: -10 } },
          { type: 'mood-change', value: 'frustrated' }
        ],
        triggers: ['committee-formation']
      },
      {
        text: "We're investigating how this happened while simultaneously taking emergency measures to address the immediate crisis.",
        tone: 'diplomatic',
        consequences: [
          { type: 'performance-impact', value: { balanced_approach: +8, decisiveness: -5 } }
        ],
        triggers: ['dual-approach']
      }
    ];
  }

  private static generateCrisisSpecificResponseOptions(config: CrisisManagementConfig, questionData: any): ContextualResponseOption[] {
    return [
      {
        text: "Let me be completely transparent about what we know and what we're doing to address each aspect of this crisis.",
        tone: 'professional',
        consequences: [
          { type: 'performance-impact', value: { transparency: +12, credibility: +8 } }
        ],
        triggers: ['transparency-approach']
      },
      {
        text: "The priority is immediate action to protect people. We can analyze what went wrong later.",
        tone: 'confident',
        consequences: [
          { type: 'performance-impact', value: { action_orientation: +10, accountability: -3 } }
        ],
        triggers: ['action-first']
      },
      {
        text: "This is unprecedented, but we're drawing on best practices and expert advice to develop our response.",
        tone: 'diplomatic',
        consequences: [
          { type: 'performance-impact', value: { thoughtfulness: +8, strength: -5 } }
        ],
        triggers: ['expert-reliance']
      }
    ];
  }

  private static generateStakeholderResponseOptions(stakeholder: StakeholderPressure, config: CrisisManagementConfig): ContextualResponseOption[] {
    return [
      {
        text: `I understand ${stakeholder.stakeholder}'s concerns and I'm committed to addressing them immediately with concrete action.`,
        tone: 'diplomatic',
        consequences: [
          { type: 'performance-impact', value: { stakeholder_relations: +12, empathy: +8 } }
        ],
        triggers: ['stakeholder-commitment']
      },
      {
        text: `While I respect ${stakeholder.stakeholder}'s position, I have to consider all stakeholders and make decisions for the broader good.`,
        tone: 'professional',
        consequences: [
          { type: 'performance-impact', value: { balance: +8, stakeholder_satisfaction: -5 } }
        ],
        triggers: ['broader-perspective']
      },
      {
        text: `${stakeholder.stakeholder} will get the support they need, but they also need to understand the constraints we're working within.`,
        tone: 'confident',
        consequences: [
          { type: 'performance-impact', value: { realism: +6, empathy: -3 } }
        ],
        triggers: ['constraint-explanation']
      }
    ];
  }

  private static generateActionPlanResponseOptions(config: CrisisManagementConfig): ContextualResponseOption[] {
    return [
      {
        text: "Here's my three-phase plan: Phase 1 is immediate stabilization within 24 hours, Phase 2 is recovery over 30 days, Phase 3 is long-term prevention.",
        tone: 'confident',
        consequences: [
          { type: 'performance-impact', value: { planning: +15, specificity: +12 } }
        ],
        triggers: ['detailed-plan']
      },
      {
        text: "We're developing a comprehensive response plan with input from experts and stakeholders to ensure we address all aspects.",
        tone: 'professional',
        consequences: [
          { type: 'performance-impact', value: { collaboration: +8, speed: -5 } }
        ],
        triggers: ['collaborative-planning']
      },
      {
        text: "The plan must be flexible because this crisis is still evolving, but here are the key principles guiding our response.",
        tone: 'diplomatic',
        consequences: [
          { type: 'performance-impact', value: { adaptability: +10, certainty: -5 } }
        ],
        triggers: ['flexible-approach']
      }
    ];
  }

  private static generateLeadershipResponseOptions(config: CrisisManagementConfig): ContextualResponseOption[] {
    return [
      {
        text: "I accept full responsibility for this crisis and I will not rest until it's resolved and people are safe.",
        tone: 'confident',
        consequences: [
          { type: 'performance-impact', value: { accountability: +20, leadership: +15 } }
        ],
        triggers: ['full-responsibility']
      },
      {
        text: "Leadership means making tough decisions in difficult circumstances. I'm prepared to make those decisions.",
        tone: 'professional',
        consequences: [
          { type: 'performance-impact', value: { resolve: +12, decisiveness: +10 } }
        ],
        triggers: ['tough-decisions']
      },
      {
        text: "This crisis will test all of us, but I'm confident that together we can overcome it and emerge stronger.",
        tone: 'diplomatic',
        consequences: [
          { type: 'performance-impact', value: { unity: +10, individual_leadership: -3 } }
        ],
        triggers: ['collective-leadership']
      }
    ];
  }

  private static generatePreventionResponseOptions(config: CrisisManagementConfig): ContextualResponseOption[] {
    return [
      {
        text: "I'm implementing fundamental reforms to the systems that failed, with independent oversight and regular audits.",
        tone: 'professional',
        consequences: [
          { type: 'performance-impact', value: { reform_commitment: +15, systemic_thinking: +12 } }
        ],
        triggers: ['fundamental-reform']
      },
      {
        text: "We're creating new safeguards and early warning systems, with clear accountability measures for future failures.",
        tone: 'confident',
        consequences: [
          { type: 'performance-impact', value: { prevention_focus: +12, accountability_systems: +10 } }
        ],
        triggers: ['prevention-systems']
      },
      {
        text: "The most important change is cultural - creating a government that prioritizes prevention over reaction.",
        tone: 'diplomatic',
        consequences: [
          { type: 'performance-impact', value: { cultural_change: +10, concreteness: -5 } }
        ],
        triggers: ['cultural-reform']
      }
    ];
  }

  private static mapCrisisToArcDifficulty(
    crisisType: CrisisType,
    crisisPhase: 'immediate' | 'developing' | 'peak' | 'recovery'
  ): 'low' | 'medium' | 'high' | 'extreme' {
    // High-impact crises are more difficult
    const crisisTypeDifficulty = {
      'policy-failure': 'medium',
      'public-safety': 'extreme',
      'economic-crisis': 'high',
      'coalition-collapse': 'high',
      'external-threat': 'extreme',
      'institutional-failure': 'high',
      'social-unrest': 'extreme',
      'environmental-disaster': 'high',
      'corruption-revelation': 'extreme',
      'leadership-crisis': 'extreme'
    };

    // Crisis phase affects difficulty
    const phaseMultiplier = {
      'immediate': 1.2,  // Highest pressure
      'developing': 1.1, // High pressure
      'peak': 1.0,       // Standard pressure
      'recovery': 0.8    // Lower pressure
    };

    const baseDifficulty = crisisTypeDifficulty[crisisType] as 'low' | 'medium' | 'high' | 'extreme';
    const difficultyLevels = ['low', 'medium', 'high', 'extreme'];
    const currentIndex = difficultyLevels.indexOf(baseDifficulty);

    // Apply phase multiplier
    const adjustedIndex = Math.min(3, Math.max(0,
      Math.round(currentIndex * phaseMultiplier[crisisPhase])
    ));

    return difficultyLevels[adjustedIndex] as 'low' | 'medium' | 'high' | 'extreme';
  }
}