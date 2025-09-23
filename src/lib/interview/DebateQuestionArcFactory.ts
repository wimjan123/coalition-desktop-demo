/**
 * Debate Question Arc Factory
 * Generates practice debate questions to prepare players for upcoming debates
 */

import type {
  QuestionArc,
  DynamicQuestion,
  DebatePreparationConfig,
  DebateOpponent,
  DebateIssue,
  InterruptionTrigger,
  FollowUpRule,
  ContextualResponseOption
} from '../types/interview.js';

export class DebateQuestionArcFactory {
  /**
   * Create a debate preparation question arc
   */
  static createDebatePreparationArc(config: DebatePreparationConfig): QuestionArc {
    const questions = this.generateDebateQuestions(config);

    return {
      backgroundId: config.backgroundId,
      difficulty: this.mapTimeToArcDifficulty(config.timeUntilDebate),
      interviewerApproach: 'professional', // Debate prep is more educational than confrontational
      questionCount: questions.length,
      questions
    };
  }

  private static generateDebateQuestions(config: DebatePreparationConfig): DynamicQuestion[] {
    const questions: DynamicQuestion[] = [];

    // 1. Opening message discipline question
    questions.push(this.createOpeningMessageQuestion(config));

    // 2. Policy stress-testing questions based on key issues
    const policyQuestions = this.createPolicyStressTestQuestions(config, 3);
    questions.push(...policyQuestions);

    // 3. Opponent attack simulation questions
    const attackSimQuestions = this.createOpponentAttackSimulations(config, 2);
    questions.push(...attackSimQuestions);

    // 4. Vulnerability probing questions
    const vulnerabilityQuestions = this.createVulnerabilityProbes(config, 2);
    questions.push(...vulnerabilityQuestions);

    // 5. Closing/summary question
    questions.push(this.createClosingSummaryQuestion(config));

    return questions;
  }

  private static createOpeningMessageQuestion(config: DebatePreparationConfig): DynamicQuestion {
    const formatQuestions = {
      'town-hall': "In the upcoming town hall, you'll have 2 minutes for opening remarks. What's your core message to voters?",
      'panel': "The panel debate will start with brief introductions. How do you distinguish yourself from the other candidates?",
      'one-on-one': "In your one-on-one debate, you need to immediately establish credibility. What's your opening strategy?",
      'group': "With multiple candidates on stage, how do you ensure your voice stands out from the crowd?"
    };

    return {
      id: 'debate-opening-message',
      type: 'opener',
      setup: `This practice session will help you prepare for the ${config.debateFormat} debate format. Focus on your core message and staying disciplined.`,
      question: formatQuestions[config.debateFormat],
      urgency: {
        timeLimit: 60,
        warningThreshold: 45,
        timeoutAction: 'auto-select'
      },
      interruptionTriggers: [
        {
          condition: 'too-verbose',
          probability: 0.6,
          message: "Remember, you'll have strict time limits in the actual debate. Can you make that point more concisely?",
          followUpAction: 'conciseness-training'
        },
        {
          condition: 'off-message',
          probability: 0.7,
          message: "You're drifting from your core message. How does this connect to your main campaign theme?",
          followUpAction: 'message-discipline'
        }
      ],
      followUpRules: [
        { if: 'word_count>100', then: 'brevity-reminder', probability: 0.8 },
        { if: 'tone:evasive', then: 'clarity-push', probability: 0.9 }
      ],
      responseOptions: this.generateOpeningResponseOptions(config)
    };
  }

  private static createPolicyStressTestQuestions(config: DebatePreparationConfig, count: number): DynamicQuestion[] {
    const questions: DynamicQuestion[] = [];
    const topIssues = config.keyIssues
      .sort((a, b) => b.importance - a.importance)
      .slice(0, count);

    topIssues.forEach((issue, index) => {
      questions.push({
        id: `policy-stress-${index}`,
        type: 'challenge',
        setup: `This is likely to be a major topic in the debate. Your opponents will challenge you on this.`,
        question: this.generatePolicyStressQuestion(issue, config),
        urgency: {
          timeLimit: 45,
          warningThreshold: 30,
          timeoutAction: 'penalty'
        },
        interruptionTriggers: [
          {
            condition: 'vague-policy',
            probability: 0.8,
            message: "That's quite vague. Opponents will demand specifics. What exactly would you do?",
            followUpAction: 'policy-specifics'
          },
          {
            condition: 'contradicts-previous',
            probability: 0.9,
            message: "Wait, that seems to contradict what you said earlier. Which position will you take in the debate?",
            followUpAction: 'consistency-check'
          }
        ],
        followUpRules: [
          { if: 'lacks-specifics', then: 'detail-request', probability: 0.85 },
          { if: 'tone:defensive', then: 'confidence-building', probability: 0.7 }
        ],
        responseOptions: this.generatePolicyResponseOptions(issue, config),
        metadata: {
          issueId: issue.id,
          vulnerabilityLevel: issue.playerVulnerability,
          importanceLevel: issue.importance
        }
      });
    });

    return questions;
  }

  private static createOpponentAttackSimulations(config: DebatePreparationConfig, count: number): DynamicQuestion[] {
    const questions: DynamicQuestion[] = [];
    const primaryOpponents = config.opponentProfiles.slice(0, count);

    primaryOpponents.forEach((opponent, index) => {
      const likelyAttack = opponent.likelyAttackVectors[0] || 'experience';

      questions.push({
        id: `opponent-attack-sim-${index}`,
        type: 'gotcha',
        setup: `${opponent.name} is likely to attack you on this topic. Here's how they might frame it:`,
        question: this.generateOpponentAttackQuestion(opponent, likelyAttack, config),
        urgency: {
          timeLimit: 40,
          warningThreshold: 25,
          timeoutAction: 'penalty'
        },
        interruptionTriggers: [
          {
            condition: 'counter-attack',
            probability: 0.7,
            message: `Remember, ${opponent.name} expects you to attack back. Is that your best strategy here?`,
            followUpAction: 'strategy-check'
          },
          {
            condition: 'personal-attack',
            probability: 0.9,
            message: "Personal attacks usually backfire in debates. How can you address the substance instead?",
            followUpAction: 'substance-redirect'
          }
        ],
        followUpRules: [
          { if: 'tone:aggressive', then: 'tone-moderation', probability: 0.8 },
          { if: 'deflects', then: 'direct-response', probability: 0.9 }
        ],
        responseOptions: this.generateDefenseResponseOptions(opponent, likelyAttack, config),
        metadata: {
          simulatedOpponent: opponent.id,
          attackVector: likelyAttack,
          opponentStrength: opponent.strengths[0] || 'unknown'
        }
      });
    });

    return questions;
  }

  private static createVulnerabilityProbes(config: DebatePreparationConfig, count: number): DynamicQuestion[] {
    const questions: DynamicQuestion[] = [];
    const vulnerableIssues = config.keyIssues
      .filter(issue => issue.playerVulnerability > 50)
      .sort((a, b) => b.playerVulnerability - a.playerVulnerability)
      .slice(0, count);

    vulnerableIssues.forEach((issue, index) => {
      questions.push({
        id: `vulnerability-probe-${index}`,
        type: 'challenge',
        setup: `This is an area where you might be vulnerable. Practice your response:`,
        question: this.generateVulnerabilityProbeQuestion(issue, config),
        urgency: {
          timeLimit: 35,
          warningThreshold: 20,
          timeoutAction: 'penalty'
        },
        interruptionTriggers: [
          {
            condition: 'admits-weakness',
            probability: 0.6,
            message: "Admitting weakness can be honest, but make sure you pivot to strength. What's your positive message?",
            followUpAction: 'strength-pivot'
          },
          {
            condition: 'denies-obvious',
            probability: 0.8,
            message: "Denying something obvious can hurt credibility. How can you acknowledge and move forward?",
            followUpAction: 'credibility-preservation'
          }
        ],
        followUpRules: [
          { if: 'tone:evasive', then: 'honesty-coaching', probability: 0.85 },
          { if: 'provides-plan', then: 'plan-elaboration', probability: 0.7 }
        ],
        responseOptions: this.generateVulnerabilityResponseOptions(issue, config),
        metadata: {
          vulnerabilityLevel: issue.playerVulnerability,
          issueType: 'weakness'
        }
      });
    });

    return questions;
  }

  private static createClosingSummaryQuestion(config: DebatePreparationConfig): DynamicQuestion {
    return {
      id: 'debate-closing-summary',
      type: 'closer',
      setup: "Let's practice your closing statement. This is your final chance to make an impression.",
      question: "In 60 seconds, summarize why you're the best choice for voters. Make it memorable and persuasive.",
      urgency: {
        timeLimit: 70,
        warningThreshold: 60,
        timeoutAction: 'auto-select'
      },
      interruptionTriggers: [
        {
          condition: 'lists-too-much',
          probability: 0.7,
          message: "You're trying to cover too much. Pick your strongest 2-3 points for maximum impact.",
          followUpAction: 'focus-coaching'
        }
      ],
      followUpRules: [
        { if: 'mentions-opponents', then: 'positive-focus', probability: 0.6 },
        { if: 'too-long', then: 'time-management', probability: 0.9 }
      ],
      responseOptions: this.generateClosingResponseOptions(config)
    };
  }

  // Question generation helpers

  private static generatePolicyStressQuestion(issue: DebateIssue, config: DebatePreparationConfig): string {
    const stressQuestions = {
      'economy': "Your economic plan has been criticized as unrealistic. How do you respond to economists who say it won't work?",
      'healthcare': "Healthcare costs keep rising despite promises from politicians. What makes your plan different?",
      'education': "Education outcomes haven't improved significantly in decades. How is your approach actually going to change that?",
      'climate': "Climate action often conflicts with economic interests. How do you balance environmental and economic priorities?",
      'security': "Critics say your security policy is either too weak or too harsh. How do you find the right balance?",
      'housing': "Housing affordability is getting worse despite government intervention. What would you do differently?",
      'immigration': "Immigration policy is deeply divisive. How do you appeal to different constituencies with conflicting views?"
    };

    const topicKey = issue.topic.toLowerCase();
    return stressQuestions[topicKey as keyof typeof stressQuestions] ||
           `Your position on ${issue.topic} has been controversial. How do you defend it against critics?`;
  }

  private static generateOpponentAttackQuestion(opponent: DebateOpponent, attackVector: string, config: DebatePreparationConfig): string {
    const attackTemplates = {
      'experience': `"${opponent.name} has years of proven leadership experience. What qualifies you to take on this responsibility?"`,
      'economy': `"While the economy struggles, ${opponent.name} offers real solutions. What have you actually accomplished on economic issues?"`,
      'leadership': `"${opponent.name} has demonstrated leadership in crisis situations. When have you been tested as a leader?"`,
      'record': `"${opponent.name} has a track record of results. Can you point to specific achievements that qualify you for this position?"`,
      'vision': `"${opponent.name} has a clear vision for the future. Your proposals seem vague and unrealistic. How do you respond?"`
    };

    return attackTemplates[attackVector as keyof typeof attackTemplates] ||
           `"${opponent.name} is clearly more qualified than you for this position. Why should voters choose you instead?"`;
  }

  private static generateVulnerabilityProbeQuestion(issue: DebateIssue, config: DebatePreparationConfig): string {
    const probeQuestions = [
      `You've been criticized for your handling of ${issue.topic}. How do you respond to those criticisms?`,
      `Many experts disagree with your position on ${issue.topic}. Are they all wrong?`,
      `Your plan for ${issue.topic} has been called unrealistic. How do you defend it?`,
      `You seem to have flip-flopped on ${issue.topic}. Which position will you actually take?`,
      `Critics say you lack understanding of ${issue.topic}. How do you respond?`
    ];

    return probeQuestions[Math.floor(Math.random() * probeQuestions.length)];
  }

  // Response option generators

  private static generateOpeningResponseOptions(config: DebatePreparationConfig): ContextualResponseOption[] {
    return [
      {
        text: "My core message is simple: I'm here to deliver real results for working families who've been left behind.",
        tone: 'confident',
        consequences: [
          { type: 'performance-impact', value: { message_discipline: +10, authenticity: +5 } }
        ],
        triggers: ['strong-opening']
      },
      {
        text: "Unlike my opponents who make promises, I have a detailed plan with specific steps and measurable outcomes.",
        tone: 'professional',
        consequences: [
          { type: 'performance-impact', value: { credibility: +8, specificity: +12 } }
        ],
        triggers: ['detail-focused']
      },
      {
        text: "This election is about more than policies—it's about who you trust to fight for your values and your future.",
        tone: 'diplomatic',
        consequences: [
          { type: 'performance-impact', value: { emotional_connection: +10, authenticity: +8 } }
        ],
        triggers: ['values-focused']
      }
    ];
  }

  private static generatePolicyResponseOptions(issue: DebateIssue, config: DebatePreparationConfig): ContextualResponseOption[] {
    return [
      {
        text: `Let me be specific about my ${issue.topic} plan: I would implement three concrete steps with clear timelines and measurable outcomes.`,
        tone: 'confident',
        consequences: [
          { type: 'performance-impact', value: { policy_knowledge: +12, credibility: +8 } }
        ],
        triggers: ['policy-specificity']
      },
      {
        text: `The critics are right that this is challenging, but that's exactly why we need bold action rather than incremental half-measures.`,
        tone: 'confrontational',
        consequences: [
          { type: 'performance-impact', value: { boldness: +10, defensiveness: -5 } }
        ],
        triggers: ['bold-stance']
      },
      {
        text: `I've listened to those concerns, and that's why my plan includes safeguards and phased implementation to address those risks.`,
        tone: 'diplomatic',
        consequences: [
          { type: 'performance-impact', value: { thoughtfulness: +8, adaptability: +6 } }
        ],
        triggers: ['responsive-adaptation']
      }
    ];
  }

  private static generateDefenseResponseOptions(opponent: DebateOpponent, attackVector: string, config: DebatePreparationConfig): ContextualResponseOption[] {
    return [
      {
        text: `Experience matters, but so does having fresh ideas and the energy to implement real change for our communities.`,
        tone: 'confident',
        consequences: [
          { type: 'performance-impact', value: { counter_attack_defense: +10, positioning: +8 } }
        ],
        triggers: ['experience-counter']
      },
      {
        text: `${opponent.name} represents the old way of doing things. I represent the change that voters are demanding.`,
        tone: 'aggressive',
        consequences: [
          { type: 'performance-impact', value: { differentiation: +12, aggression_risk: +5 } }
        ],
        triggers: ['change-positioning']
      },
      {
        text: `I respect ${opponent.name}'s service, but respectfully disagree with their approach. Here's what I would do differently...`,
        tone: 'diplomatic',
        consequences: [
          { type: 'performance-impact', value: { respectfulness: +8, substance_focus: +10 } }
        ],
        triggers: ['respectful-disagreement']
      }
    ];
  }

  private static generateVulnerabilityResponseOptions(issue: DebateIssue, config: DebatePreparationConfig): ContextualResponseOption[] {
    return [
      {
        text: `You're right that I made mistakes on this issue in the past. Here's what I learned and how I would do better.`,
        tone: 'diplomatic',
        consequences: [
          { type: 'performance-impact', value: { honesty: +15, vulnerability_management: +10 } }
        ],
        triggers: ['honest-admission']
      },
      {
        text: `I disagree with that characterization. Let me clarify my actual position and the reasoning behind it.`,
        tone: 'defensive',
        consequences: [
          { type: 'performance-impact', value: { defensiveness: +8, clarity: +5 } }
        ],
        triggers: ['position-clarification']
      },
      {
        text: `That criticism misses the point. The real issue is how we move forward with solutions that work for everyone.`,
        tone: 'confident',
        consequences: [
          { type: 'performance-impact', value: { pivot_skill: +12, forward_focus: +8 } }
        ],
        triggers: ['forward-pivot']
      }
    ];
  }

  private static generateClosingResponseOptions(config: DebatePreparationConfig): ContextualResponseOption[] {
    return [
      {
        text: "I'm running because our community deserves leaders who fight for results, not politics. I'll be that leader.",
        tone: 'confident',
        consequences: [
          { type: 'performance-impact', value: { closing_strength: +15, memorability: +10 } }
        ],
        triggers: ['strong-closing']
      },
      {
        text: "This election comes down to a simple choice: more of the same, or real change that puts people first.",
        tone: 'professional',
        consequences: [
          { type: 'performance-impact', value: { message_clarity: +12, choice_framing: +8 } }
        ],
        triggers: ['choice-framework']
      },
      {
        text: "I ask for your vote not because I'm perfect, but because I'll never stop fighting for the values we share.",
        tone: 'diplomatic',
        consequences: [
          { type: 'performance-impact', value: { humility: +10, connection: +12 } }
        ],
        triggers: ['humble-appeal']
      }
    ];
  }

  private static mapTimeToArcDifficulty(timeUntilDebate: number): 'low' | 'medium' | 'high' | 'extreme' {
    // Less time = higher difficulty (more pressure)
    if (timeUntilDebate >= 48) return 'medium';      // 2+ days
    if (timeUntilDebate >= 24) return 'high';        // 1+ day
    if (timeUntilDebate >= 12) return 'high';        // 12+ hours
    return 'extreme';                                 // < 12 hours
  }
}