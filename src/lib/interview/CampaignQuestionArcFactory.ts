/**
 * Campaign Question Arc Factory
 * Generates election campaign interview questions based on campaign phase and context
 */

import type {
  QuestionArc,
  DynamicQuestion,
  InterruptionTrigger,
  FollowUpRule,
  ContextualResponseOption
} from '../types/interview.js';

import type { CampaignInterviewConfig } from './CampaignInterviewEngine.js';

export class CampaignQuestionArcFactory {
  /**
   * Create a campaign interview question arc
   */
  static createCampaignArc(config: CampaignInterviewConfig): QuestionArc {
    const questions = this.generateCampaignQuestions(config);

    return {
      backgroundId: config.backgroundId,
      difficulty: this.mapCampaignToArcDifficulty(config.campaignPhase, config.currentPolling),
      interviewerApproach: this.determineInterviewerApproach(config),
      questionCount: questions.length,
      questions
    };
  }

  private static generateCampaignQuestions(config: CampaignInterviewConfig): DynamicQuestion[] {
    const questions: DynamicQuestion[] = [];

    // 1. Campaign opening/positioning question
    questions.push(this.createCampaignOpeningQuestion(config));

    // 2. Policy platform questions
    const policyQuestions = this.createPolicyPlatformQuestions(config, 2);
    questions.push(...policyQuestions);

    // 3. Opponent contrast questions
    const contrastQuestions = this.createOpponentContrastQuestions(config, 1);
    questions.push(...contrastQuestions);

    // 4. Campaign momentum/polling questions
    const momentumQuestions = this.createMomentumQuestions(config, 1);
    questions.push(...momentumQuestions);

    // 5. Voter connection questions
    const voterQuestions = this.createVoterConnectionQuestions(config, 1);
    questions.push(...voterQuestions);

    // 6. Election prediction/closing question
    questions.push(this.createElectionClosingQuestion(config));

    return questions;
  }

  private static createCampaignOpeningQuestion(config: CampaignInterviewConfig): DynamicQuestion {
    const phaseQuestions = {
      'early': "Why are you running for this office, and what makes you different from the other candidates?",
      'mid': "We're halfway through the campaign. What's your message to voters who are still undecided?",
      'late': "With just weeks to go, why should voters choose you over your opponents?",
      'final-week': "Election day is almost here. What's your final pitch to voters?"
    };

    const pollingContext = this.getPollingContext(config.currentPolling);

    return {
      id: 'campaign-opening',
      type: 'opener',
      setup: `${pollingContext} The election is heating up and voters are paying attention.`,
      question: phaseQuestions[config.campaignPhase],
      urgency: {
        timeLimit: 60,
        warningThreshold: 45,
        timeoutAction: 'auto-select'
      },
      interruptionTriggers: [
        {
          condition: 'generic-politician-speak',
          probability: 0.7,
          message: "That sounds like every politician. What specifically makes you different?",
          followUpAction: 'specificity-demand'
        },
        {
          condition: 'attacks-opponents',
          probability: 0.6,
          message: "Let's focus on what you're FOR, not what you're against. What's your positive vision?",
          followUpAction: 'positive-focus'
        }
      ],
      followUpRules: [
        { if: 'word_count>120', then: 'brevity-reminder', probability: 0.6 },
        { if: 'tone:evasive', then: 'direct-answer-push', probability: 0.8 }
      ],
      responseOptions: this.generateCampaignOpeningOptions(config)
    };
  }

  private static createPolicyPlatformQuestions(config: CampaignInterviewConfig, count: number): DynamicQuestion[] {
    const questions: DynamicQuestion[] = [];

    // Key policy areas for Dutch politics
    const policyAreas = [
      'economy', 'healthcare', 'climate', 'housing', 'immigration',
      'education', 'security', 'european-union'
    ];

    // Select most relevant policy areas based on demographics and current events
    const relevantPolicies = this.selectRelevantPolicies(policyAreas, config, count);

    relevantPolicies.forEach((policy, index) => {
      questions.push({
        id: `policy-${policy}-${index}`,
        type: 'challenge',
        setup: this.getPolicySetup(policy, config),
        question: this.generatePolicyQuestion(policy, config),
        urgency: {
          timeLimit: 50,
          warningThreshold: 35,
          timeoutAction: 'penalty'
        },
        interruptionTriggers: [
          {
            condition: 'vague-policy',
            probability: 0.8,
            message: "That's quite vague. Voters want specifics. What exactly would you do?",
            followUpAction: 'policy-specifics'
          },
          {
            condition: 'unrealistic-promise',
            probability: 0.7,
            message: "How would you actually pay for that? The numbers don't seem to add up.",
            followUpAction: 'feasibility-challenge'
          }
        ],
        followUpRules: [
          { if: 'provides-timeline', then: 'timeline-feasibility', probability: 0.7 },
          { if: 'mentions-cost', then: 'funding-source', probability: 0.9 }
        ],
        responseOptions: this.generatePolicyResponseOptions(policy, config),
        metadata: {
          policyArea: policy,
          voterPriority: this.getPolicyVoterPriority(policy, config)
        }
      });
    });

    return questions;
  }

  private static createOpponentContrastQuestions(config: CampaignInterviewConfig, count: number): DynamicQuestion[] {
    const questions: DynamicQuestion[] = [];

    // Create contrast question based on polling position
    const contrastQuestion = {
      id: 'opponent-contrast',
      type: 'challenge',
      setup: this.getOpponentContrastSetup(config),
      question: this.generateOpponentContrastQuestion(config),
      urgency: {
        timeLimit: 45,
        warningThreshold: 30,
        timeoutAction: 'penalty'
      },
      interruptionTriggers: [
        {
          condition: 'personal-attack',
          probability: 0.9,
          message: "Focus on policy differences, not personal attacks. What's the substantive difference?",
          followUpAction: 'substance-redirect'
        },
        {
          condition: 'too-negative',
          probability: 0.7,
          message: "You're being quite negative. What's your positive alternative?",
          followUpAction: 'positive-alternative'
        }
      ],
      followUpRules: [
        { if: 'tone:aggressive', then: 'tone-moderation', probability: 0.8 },
        { if: 'mentions-record', then: 'record-specifics', probability: 0.7 }
      ],
      responseOptions: this.generateContrastResponseOptions(config),
      metadata: {
        contrastType: 'policy',
        negativeRisk: true
      }
    };

    questions.push(contrastQuestion);
    return questions;
  }

  private static createMomentumQuestions(config: CampaignInterviewConfig, count: number): DynamicQuestion[] {
    const questions: DynamicQuestion[] = [];

    const momentumQuestion = {
      id: 'campaign-momentum',
      type: 'challenge',
      setup: this.getMomentumSetup(config),
      question: this.generateMomentumQuestion(config),
      urgency: {
        timeLimit: 40,
        warningThreshold: 25,
        timeoutAction: 'penalty'
      },
      interruptionTriggers: [
        {
          condition: 'dismisses-polling',
          probability: 0.8,
          message: "You can't just dismiss the polling data. How do you respond to what voters are saying?",
          followUpAction: 'polling-reality'
        },
        {
          condition: 'overconfident',
          probability: 0.6,
          message: "That sounds overconfident. Are you taking voters for granted?",
          followUpAction: 'humility-check'
        }
      ],
      followUpRules: [
        { if: 'mentions-polls', then: 'poll-interpretation', probability: 0.8 },
        { if: 'tone:defensive', then: 'confidence-building', probability: 0.7 }
      ],
      responseOptions: this.generateMomentumResponseOptions(config),
      metadata: {
        currentPolling: config.currentPolling.overall,
        momentumDirection: config.campaignMomentum
      }
    };

    questions.push(momentumQuestion);
    return questions;
  }

  private static createVoterConnectionQuestions(config: CampaignInterviewConfig, count: number): DynamicQuestion[] {
    const questions: DynamicQuestion[] = [];

    const voterQuestion = {
      id: 'voter-connection',
      type: 'challenge',
      setup: "Voters often feel disconnected from politicians. They want someone who understands their daily struggles.",
      question: this.generateVoterConnectionQuestion(config),
      urgency: {
        timeLimit: 50,
        warningThreshold: 35,
        timeoutAction: 'penalty'
      },
      interruptionTriggers: [
        {
          condition: 'out-of-touch',
          probability: 0.8,
          message: "That sounds like someone who's never worried about paying bills. How do you really connect with ordinary people?",
          followUpAction: 'authenticity-challenge'
        },
        {
          condition: 'politician-speak',
          probability: 0.7,
          message: "Stop talking like a politician. Talk like a human being who understands real problems.",
          followUpAction: 'human-connection'
        }
      ],
      followUpRules: [
        { if: 'shares-personal-story', then: 'story-authenticity', probability: 0.6 },
        { if: 'tone:authentic', then: 'connection-deepening', probability: 0.7 }
      ],
      responseOptions: this.generateVoterConnectionOptions(config),
      metadata: {
        authenticity_test: true,
        demographic_focus: config.keyDemographics
      }
    };

    questions.push(voterQuestion);
    return questions;
  }

  private static createElectionClosingQuestion(config: CampaignInterviewConfig): DynamicQuestion {
    return {
      id: 'election-closing',
      type: 'closer',
      setup: this.getClosingSetup(config),
      question: this.generateClosingQuestion(config),
      urgency: {
        timeLimit: 70,
        warningThreshold: 50,
        timeoutAction: 'auto-select'
      },
      interruptionTriggers: [
        {
          condition: 'too-long',
          probability: 0.6,
          message: "You need to be more concise. Voters don't have time for long speeches.",
          followUpAction: 'conciseness-coaching'
        }
      ],
      followUpRules: [
        { if: 'inspirational-tone', then: 'inspiration-amplification', probability: 0.7 },
        { if: 'mentions-future', then: 'vision-elaboration', probability: 0.6 }
      ],
      responseOptions: this.generateClosingResponseOptions(config),
      metadata: {
        finalImpression: true,
        memorability: 'high'
      }
    };
  }

  // Helper methods for question generation

  private static getPollingContext(polling: any): string {
    if (polling.overall > 45) {
      return "You're leading in the polls.";
    } else if (polling.overall > 35) {
      return "The race is tight according to recent polling.";
    } else {
      return "You're trailing in the polls.";
    }
  }

  private static selectRelevantPolicies(policies: string[], config: CampaignInterviewConfig, count: number): string[] {
    // Prioritize based on demographics and current events
    const prioritized = policies.sort((a, b) => {
      const aPriority = this.getPolicyVoterPriority(a, config);
      const bPriority = this.getPolicyVoterPriority(b, config);
      return bPriority - aPriority;
    });

    return prioritized.slice(0, count);
  }

  private static getPolicyVoterPriority(policy: string, config: CampaignInterviewConfig): number {
    // Simplified priority system based on demographics
    const priorities: Record<string, number> = {
      'economy': 90,
      'healthcare': 85,
      'housing': 80,
      'climate': 70,
      'education': 65,
      'immigration': 60,
      'security': 55,
      'european-union': 50
    };

    return priorities[policy] || 40;
  }

  private static getPolicySetup(policy: string, config: CampaignInterviewConfig): string {
    const setups = {
      'economy': "The economy is a top concern for voters. Inflation and job security are major worries.",
      'healthcare': "Healthcare costs continue to rise, and waiting times are increasing. Voters want solutions.",
      'housing': "The housing crisis affects nearly everyone. Young people can't afford homes, families are struggling with rent.",
      'climate': "Climate change is an urgent issue, but economic concerns compete for attention.",
      'immigration': "Immigration remains a divisive issue with strong opinions on all sides.",
      'education': "The education system faces challenges with teacher shortages and student performance.",
      'security': "Security concerns include both traditional crime and new cyber threats.",
      'european-union': "The EU relationship affects trade, immigration, and national sovereignty."
    };

    return setups[policy] || "This is an important issue for many voters.";
  }

  private static generatePolicyQuestion(policy: string, config: CampaignInterviewConfig): string {
    const questions = {
      'economy': "What specific economic policies would you implement in your first 100 days to help struggling families?",
      'healthcare': "Healthcare costs are crushing families. What's your concrete plan to make healthcare affordable?",
      'housing': "Young people can't afford homes. What specific actions would you take to address the housing crisis?",
      'climate': "How do you balance urgent climate action with economic concerns of working families?",
      'immigration': "Immigration divides voters. What's your approach to immigration that brings people together?",
      'education': "Teachers are leaving the profession and student performance is declining. What's your education plan?",
      'security': "Crime rates are rising in some areas. How would you ensure public safety while respecting civil liberties?",
      'european-union': "What should the Netherlands' relationship with the EU look like under your leadership?"
    };

    return questions[policy] || `What's your position on ${policy} and how would you address voters' concerns?`;
  }

  private static getOpponentContrastSetup(config: CampaignInterviewConfig): string {
    if (config.currentPolling.overall > 40) {
      return "Your main opponents are criticizing your positions and offering alternatives.";
    } else {
      return "You're trailing your main opponents. What makes you the better choice?";
    }
  }

  private static generateOpponentContrastQuestion(config: CampaignInterviewConfig): string {
    if (config.opponentActivity.length > 0) {
      const opponent = config.opponentActivity[0];
      return `${opponent.opponentName} says ${opponent.recentActivity}. How do you respond?`;
    } else {
      return "What's the key difference between you and your main opponents that voters should consider?";
    }
  }

  private static getMomentumSetup(config: CampaignInterviewConfig): string {
    const momentum = config.campaignMomentum;
    const polling = config.currentPolling.overall;

    if (momentum === 'surging') {
      return "Your campaign momentum seems to be building rapidly.";
    } else if (momentum === 'falling') {
      return "Your campaign appears to be losing momentum.";
    } else if (polling < 30) {
      return "The polls show you trailing significantly.";
    } else {
      return "The race remains competitive with polls showing a tight contest.";
    }
  }

  private static generateMomentumQuestion(config: CampaignInterviewConfig): string {
    if (config.campaignMomentum === 'falling') {
      return "Your campaign seems to be struggling. What's your plan to turn things around?";
    } else if (config.campaignMomentum === 'surging') {
      return "You're gaining momentum. What's driving your success and how do you maintain it?";
    } else if (config.currentPolling.overall < 30) {
      return "You're significantly behind in the polls. How do you close the gap?";
    } else {
      return "The polls show a competitive race. What's your strategy for the final stretch?";
    }
  }

  private static generateVoterConnectionQuestion(config: CampaignInterviewConfig): string {
    const demographics = config.keyDemographics;

    if (demographics.includes('working-class')) {
      return "Working families are struggling with rising costs. How do you convince them you understand their daily challenges?";
    } else if (demographics.includes('young-professionals')) {
      return "Young people feel left behind by the political system. How do you earn their trust and their vote?";
    } else if (demographics.includes('elderly')) {
      return "Older voters worry about healthcare and pensions. How do you address their concerns about the future?";
    } else {
      return "Many voters feel politicians don't understand their lives. How do you bridge that gap?";
    }
  }

  private static getClosingSetup(config: CampaignInterviewConfig): string {
    const daysLeft = config.campaignPhase === 'final-week' ? 'days' : 'weeks';
    return `With ${daysLeft} left until the election, this may be your final chance to reach many voters.`;
  }

  private static generateClosingQuestion(config: CampaignInterviewConfig): string {
    if (config.campaignPhase === 'final-week') {
      return "Election day is almost here. In 30 seconds, tell voters why they should choose you.";
    } else if (config.currentPolling.overall > 40) {
      return "You're in a strong position. What's your message to undecided voters?";
    } else {
      return "You're behind in the polls. What's your closing argument to change voters' minds?";
    }
  }

  // Response option generators

  private static generateCampaignOpeningOptions(config: CampaignInterviewConfig): ContextualResponseOption[] {
    return [
      {
        text: "I'm running because our country needs leaders who deliver results, not just promises. Here's what I'll do differently.",
        tone: 'confident',
        consequences: [
          { type: 'performance-impact', value: { results_focus: +12, differentiation: +8 } }
        ],
        triggers: ['results-focused']
      },
      {
        text: "Unlike career politicians, I bring real-world experience solving problems that matter to families.",
        tone: 'professional',
        consequences: [
          { type: 'performance-impact', value: { outsider_appeal: +10, experience_contrast: +8 } }
        ],
        triggers: ['outsider-positioning']
      },
      {
        text: "This election is about more than politics—it's about building a future where everyone has opportunity to succeed.",
        tone: 'diplomatic',
        consequences: [
          { type: 'performance-impact', value: { vision: +10, inclusivity: +12 } }
        ],
        triggers: ['vision-focused']
      }
    ];
  }

  private static generatePolicyResponseOptions(policy: string, config: CampaignInterviewConfig): ContextualResponseOption[] {
    return [
      {
        text: `Here's my three-point plan for ${policy}: immediate action on [X], medium-term reform of [Y], and long-term investment in [Z].`,
        tone: 'professional',
        consequences: [
          { type: 'performance-impact', value: { policy_specificity: +15, planning: +10 } }
        ],
        triggers: ['detailed-plan']
      },
      {
        text: `The current approach to ${policy} isn't working. I'll take a different approach that puts results over politics.`,
        tone: 'confident',
        consequences: [
          { type: 'performance-impact', value: { change_agent: +10, results_focus: +8 } }
        ],
        triggers: ['change-positioning']
      },
      {
        text: `I've seen how ${policy} affects real families. That's why my approach focuses on practical solutions that work.`,
        tone: 'diplomatic',
        consequences: [
          { type: 'performance-impact', value: { empathy: +12, practicality: +8 } }
        ],
        triggers: ['empathy-focus']
      }
    ];
  }

  private static generateContrastResponseOptions(config: CampaignInterviewConfig): ContextualResponseOption[] {
    return [
      {
        text: "The difference is clear: they offer more of the same, I offer real change with a proven track record.",
        tone: 'confident',
        consequences: [
          { type: 'performance-impact', value: { differentiation: +12, change_positioning: +8 } }
        ],
        triggers: ['change-vs-status-quo']
      },
      {
        text: "I respect my opponents, but we have fundamental disagreements about the direction of the country.",
        tone: 'diplomatic',
        consequences: [
          { type: 'performance-impact', value: { respectfulness: +8, substance_focus: +10 } }
        ],
        triggers: ['respectful-contrast']
      },
      {
        text: "My opponents represent the old way of doing politics. I represent fresh ideas and new energy.",
        tone: 'professional',
        consequences: [
          { type: 'performance-impact', value: { fresh_perspective: +10, energy: +8 } }
        ],
        triggers: ['generational-change']
      }
    ];
  }

  private static generateMomentumResponseOptions(config: CampaignInterviewConfig): ContextualResponseOption[] {
    const isLeading = config.currentPolling.overall > 40;

    if (isLeading) {
      return [
        {
          text: "We're building momentum because our message resonates with voters who want real change.",
          tone: 'confident',
          consequences: [
            { type: 'performance-impact', value: { momentum_explanation: +10, voter_connection: +8 } }
          ],
          triggers: ['momentum-reasoning']
        }
      ];
    } else {
      return [
        {
          text: "Polls are just snapshots. I'm focused on earning every vote by addressing the issues that matter most.",
          tone: 'confident',
          consequences: [
            { type: 'performance-impact', value: { resilience: +10, voter_focus: +8 } }
          ],
          triggers: ['underdog-determination']
        }
      ];
    }
  }

  private static generateVoterConnectionOptions(config: CampaignInterviewConfig): ContextualResponseOption[] {
    return [
      {
        text: "I understand because I've lived it. I know what it's like to worry about bills, to struggle with decisions every family faces.",
        tone: 'authentic',
        consequences: [
          { type: 'performance-impact', value: { authenticity: +15, relatability: +12 } }
        ],
        triggers: ['personal-experience']
      },
      {
        text: "I spend time in communities listening to real people, not just donors and lobbyists. That's how I stay connected.",
        tone: 'confident',
        consequences: [
          { type: 'performance-impact', value: { grassroots_connection: +12, authenticity: +8 } }
        ],
        triggers: ['grassroots-focus']
      },
      {
        text: "My policies aren't from think tanks—they're from kitchen table conversations with families facing real challenges.",
        tone: 'diplomatic',
        consequences: [
          { type: 'performance-impact', value: { policy_grounding: +10, voter_input: +10 } }
        ],
        triggers: ['bottom-up-policy']
      }
    ];
  }

  private static generateClosingResponseOptions(config: CampaignInterviewConfig): ContextualResponseOption[] {
    return [
      {
        text: "I'm asking for your vote because I'll fight for you every single day, just like I've fought for change my entire career.",
        tone: 'confident',
        consequences: [
          { type: 'performance-impact', value: { personal_commitment: +15, consistency: +10 } }
        ],
        triggers: ['personal-commitment']
      },
      {
        text: "This election is about our future together. I'll work with anyone to solve problems and deliver results for all families.",
        tone: 'diplomatic',
        consequences: [
          { type: 'performance-impact', value: { unity: +12, collaboration: +10 } }
        ],
        triggers: ['unity-message']
      },
      {
        text: "We have a choice: more of the same politics that haven't worked, or new leadership that will deliver change.",
        tone: 'professional',
        consequences: [
          { type: 'performance-impact', value: { choice_framing: +12, change_positioning: +8 } }
        ],
        triggers: ['choice-clarity']
      }
    ];
  }

  // Utility methods

  private static mapCampaignToArcDifficulty(
    phase: string,
    polling: any
  ): 'low' | 'medium' | 'high' | 'extreme' {
    // Later phases are more difficult
    const phaseDifficulty = {
      'early': 'medium',
      'mid': 'medium',
      'late': 'high',
      'final-week': 'extreme'
    };

    // Poor polling increases difficulty
    if (polling.overall < 25) {
      return 'extreme'; // Very difficult when far behind
    } else if (polling.overall < 35) {
      return 'high'; // Difficult when behind
    }

    return phaseDifficulty[phase as keyof typeof phaseDifficulty] as 'low' | 'medium' | 'high' | 'extreme';
  }

  private static determineInterviewerApproach(config: CampaignInterviewConfig): 'professional' | 'confrontational' | 'investigative' {
    // More confrontational in later phases or when polling poorly
    if (config.campaignPhase === 'final-week' || config.currentPolling.overall < 30) {
      return 'confrontational';
    } else if (config.mediaEnvironment.coverage_tone === 'critical' ||
               config.mediaEnvironment.coverage_tone === 'hostile') {
      return 'investigative';
    } else {
      return 'professional';
    }
  }
}