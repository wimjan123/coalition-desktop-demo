/**
 * Dynamic Interviewer Personality System
 * Manages interviewer mood, reactions, and memory with frustration escalation
 */

import type {
  InterviewerType,
  InterviewerMood,
  PlayerResponse,
  MoodChange,
  InterviewerReaction,
  ReactionPattern,
  InterviewerMemory,
  BackgroundApproach,
  MoodProgression,
  MoodState,
  MoodTrigger,
  MoodTransition,
  FrustrationEscalationSystem,
  FrustrationLevel,
  FrustrationTrigger,
  FrustrationTriggerType,
  FrustrationThreshold,
  FrustrationBehaviorChange,
  FrustrationEvent,
  FrustrationPattern,
  EnhancedInterviewerMemory,
  SurpriseApprovalSystem,
  SurpriseDetector,
  ApprovalDetector,
  SurpriseType,
  ApprovalType,
  SurpriseApprovalEvent
} from '../types/interview.js';

export class InterviewerPersonality {
  private type: InterviewerType;
  private mood: InterviewerMood;
  private backgroundId: string;
  private memory: InterviewerMemory;
  private reactionPatterns: ReactionPattern[];
  private lastReaction: InterviewerReaction | null = null;
  private moodHistory: Array<{ mood: InterviewerMood; timestamp: number; trigger: string }>;

  // Frustration Escalation System
  private frustrationSystem: FrustrationEscalationSystem;
  private enhancedMemory: EnhancedInterviewerMemory;

  // Surprise/Approval System - Task 3.8
  private surpriseApprovalSystem: SurpriseApprovalSystem;

  constructor(type: InterviewerType, backgroundId: string) {
    this.type = type;
    this.backgroundId = backgroundId;
    this.mood = 'neutral';
    this.moodHistory = [];
    this.initializeMemory();
    this.initializeReactionPatterns();
    this.initializeMoodProgression();
    this.initializeFrustrationSystem();
    this.surpriseApprovalSystem = this.initializeSurpriseApprovalSystem();
  }

  private initializeMemory(): void {
    this.memory = {
      references: new Map(),
      frustrationLevel: 0,
      surpriseLevel: 0,
      approvalLevel: 50
    };

    // Enhanced memory tracking for sophisticated references
    this.memory.references.set('statements', new Map<string, string>());
    this.memory.references.set('contradictions', []);
    this.memory.references.set('evasions', []);
    this.memory.references.set('strong-moments', []);
    this.memory.references.set('weak-moments', []);
    this.memory.references.set('quotes', []);
  }

  private initializeReactionPatterns(): void {
    // Combine type-specific patterns with background-specific adaptations
    this.reactionPatterns = [
      ...this.getTypeSpecificPatterns(),
      ...this.getBackgroundAdaptations()
    ];
  }

  private getTypeSpecificPatterns(): ReactionPattern[] {
    const patterns: Record<InterviewerType, ReactionPattern[]> = {
      professional: [
        {
          trigger: 'evasion',
          conditions: [],
          reaction: {
            type: 'follow-up',
            intensity: 'medium',
            message: "Could you be more specific?"
          }
        },
        {
          trigger: 'contradiction',
          conditions: [],
          reaction: {
            type: 'mood-change',
            intensity: 'medium',
            newMood: 'skeptical',
            message: "That seems to contradict what you said earlier..."
          }
        }
      ],
      confrontational: [
        {
          trigger: 'evasion',
          conditions: [],
          reaction: {
            type: 'interruption',
            intensity: 'high',
            message: "That's not an answer."
          }
        },
        {
          trigger: 'defensive',
          conditions: [],
          reaction: {
            type: 'mood-change',
            intensity: 'high',
            newMood: 'frustrated',
            message: "Getting defensive won't help your case."
          }
        }
      ],
      investigative: [
        {
          trigger: 'confident',
          conditions: [],
          reaction: {
            type: 'follow-up',
            intensity: 'high',
            message: "Interesting. Let me dig deeper into that..."
          }
        },
        {
          trigger: 'evasion',
          conditions: [],
          reaction: {
            type: 'mood-change',
            intensity: 'medium',
            newMood: 'skeptical',
            message: "I sense there's more to this story..."
          }
        }
      ]
    };

    return patterns[this.type] || [];
  }

  private getBackgroundAdaptations(): ReactionPattern[] {
    // Comprehensive background-specific interviewer behavior adaptations
    const adaptations: Record<string, ReactionPattern[]> = {
      'toeslagenaffaire-whistleblower': [
        {
          trigger: 'defensive',
          conditions: [],
          reaction: {
            type: 'follow-up',
            intensity: 'high',
            message: "You exposed the system, but now you want to lead it. How do we know you won't just be another politician?"
          }
        },
        {
          trigger: 'evasion',
          conditions: [],
          reaction: {
            type: 'interruption',
            intensity: 'high',
            message: "You blew the whistle on evasion—don't be evasive yourself."
          }
        },
        {
          trigger: 'confident',
          conditions: ['topic:accountability'],
          reaction: {
            type: 'emotional-display',
            intensity: 'medium',
            message: "That confidence is what victims needed from you years ago."
          }
        }
      ],
      'shell-executive': [
        {
          trigger: 'diplomatic',
          conditions: ['mood:skeptical'],
          reaction: {
            type: 'interruption',
            intensity: 'high',
            message: "Corporate diplomacy won't work here. Voters want accountability."
          }
        },
        {
          trigger: 'evasion',
          conditions: ['topic:climate'],
          reaction: {
            type: 'follow-up',
            intensity: 'high',
            message: "Shell spent decades evading climate science. Are you still doing that as a politician?"
          }
        },
        {
          trigger: 'aggressive',
          conditions: [],
          reaction: {
            type: 'mood-change',
            intensity: 'high',
            newMood: 'hostile',
            message: "The executive aggression that destroyed the planet won't work in politics."
          }
        }
      ],
      'small-business-owner': [
        {
          trigger: 'confident',
          conditions: [],
          reaction: {
            type: 'mood-change',
            intensity: 'medium',
            newMood: 'sympathetic',
            message: "I appreciate your practical perspective..."
          }
        },
        {
          trigger: 'diplomatic',
          conditions: ['topic:economy'],
          reaction: {
            type: 'follow-up',
            intensity: 'low',
            message: "That entrepreneurial pragmatism could be refreshing in politics."
          }
        },
        {
          trigger: 'defensive',
          conditions: ['topic:regulation'],
          reaction: {
            type: 'emotional-display',
            intensity: 'low',
            message: "I understand the regulatory burden, but governance requires broader thinking."
          }
        }
      ],
      'financial-analyst': [
        {
          trigger: 'confident',
          conditions: ['topic:economy'],
          reaction: {
            type: 'follow-up',
            intensity: 'medium',
            message: "Financial expertise is valuable, but can you connect with ordinary voters?"
          }
        },
        {
          trigger: 'evasion',
          conditions: ['topic:inequality'],
          reaction: {
            type: 'interruption',
            intensity: 'medium',
            message: "Don't hide behind financial jargon. People want straight answers about fairness."
          }
        },
        {
          trigger: 'diplomatic',
          conditions: [],
          reaction: {
            type: 'mood-change',
            intensity: 'low',
            newMood: 'professional',
            message: "Your analytical approach shows promise..."
          }
        }
      ],
      'academic-researcher': [
        {
          trigger: 'confident',
          conditions: [],
          reaction: {
            type: 'follow-up',
            intensity: 'medium',
            message: "Academic confidence is good, but politics requires different skills. How do you relate to non-academics?"
          }
        },
        {
          trigger: 'evasion',
          conditions: [],
          reaction: {
            type: 'interruption',
            intensity: 'medium',
            message: "You're being too theoretical. Voters need concrete answers."
          }
        },
        {
          trigger: 'diplomatic',
          conditions: ['topic:education'],
          reaction: {
            type: 'mood-change',
            intensity: 'low',
            newMood: 'sympathetic',
            message: "Your educational perspective could bring needed expertise..."
          }
        }
      ],
      'tech-entrepreneur': [
        {
          trigger: 'confident',
          conditions: ['topic:innovation'],
          reaction: {
            type: 'follow-up',
            intensity: 'medium',
            message: "Tech innovation is great, but can you innovate in the messy world of politics?"
          }
        },
        {
          trigger: 'evasion',
          conditions: ['topic:inequality'],
          reaction: {
            type: 'interruption',
            intensity: 'high',
            message: "Don't disrupt your way out of answering about wealth inequality."
          }
        },
        {
          trigger: 'aggressive',
          conditions: ['topic:regulation'],
          reaction: {
            type: 'emotional-display',
            intensity: 'medium',
            message: "That Silicon Valley arrogance toward regulation could be problematic."
          }
        }
      ],
      'environmental-activist': [
        {
          trigger: 'aggressive',
          conditions: ['topic:climate'],
          reaction: {
            type: 'mood-change',
            intensity: 'medium',
            newMood: 'sympathetic',
            message: "Your passion for the environment is admirable..."
          }
        },
        {
          trigger: 'defensive',
          conditions: ['topic:economy'],
          reaction: {
            type: 'follow-up',
            intensity: 'high',
            message: "Activism is pure, but governing requires compromise. Can you balance environmental ideals with economic reality?"
          }
        },
        {
          trigger: 'diplomatic',
          conditions: [],
          reaction: {
            type: 'emotional-display',
            intensity: 'low',
            message: "It's refreshing to hear measured environmentalism instead of extremism."
          }
        }
      ],
      'former-politician': [
        {
          trigger: 'diplomatic',
          conditions: [],
          reaction: {
            type: 'interruption',
            intensity: 'medium',
            message: "More political speak. What makes this time different from your previous stint?"
          }
        },
        {
          trigger: 'confident',
          conditions: ['topic:experience'],
          reaction: {
            type: 'follow-up',
            intensity: 'high',
            message: "You had experience before and failed. Why should voters trust you again?"
          }
        },
        {
          trigger: 'evasion',
          conditions: [],
          reaction: {
            type: 'mood-change',
            intensity: 'high',
            newMood: 'frustrated',
            message: "Classic politician evasion. This is exactly why you lost credibility before."
          }
        }
      ],
      'former-journalist': [
        {
          trigger: 'evasion',
          conditions: [],
          reaction: {
            type: 'interruption',
            intensity: 'high',
            message: "You used to grill politicians for evasion. Don't become what you once criticized."
          }
        },
        {
          trigger: 'confident',
          conditions: ['topic:media'],
          reaction: {
            type: 'follow-up',
            intensity: 'medium',
            message: "Your media experience could be valuable, but will you be too cozy with former colleagues?"
          }
        },
        {
          trigger: 'aggressive',
          conditions: [],
          reaction: {
            type: 'emotional-display',
            intensity: 'medium',
            message: "That journalistic aggression might work better in politics than in media."
          }
        }
      ]
    };

    return adaptations[this.backgroundId] || [];
  }

  /**
   * Get background-specific interviewer approach modifications
   */
  private getBackgroundApproachAdaptations(): BackgroundApproach {
    const approaches: Record<string, BackgroundApproach> = {
      'toeslagenaffaire-whistleblower': {
        baseAggressiveness: 0.9,
        skepticismLevel: 0.95,
        empathyLevel: 0.3,
        professionalDistance: 0.2,
        followUpTendency: 0.9,
        interruptionThreshold: 0.7,
        contextualFocus: ['accountability', 'trust', 'competence', 'victims'],
        questioningStyle: 'confrontational-accountability',
        description: 'Highly aggressive due to institutional betrayal, focused on accountability and victim impact'
      },
      'shell-executive': {
        baseAggressiveness: 0.85,
        skepticismLevel: 0.9,
        empathyLevel: 0.2,
        professionalDistance: 0.3,
        followUpTendency: 0.8,
        interruptionThreshold: 0.6,
        contextualFocus: ['climate', 'corporate-accountability', 'greenwashing', 'profits-vs-planet'],
        questioningStyle: 'environmental-justice',
        description: 'Aggressive environmental focus, skeptical of corporate greenwashing'
      },
      'small-business-owner': {
        baseAggressiveness: 0.3,
        skepticismLevel: 0.4,
        empathyLevel: 0.8,
        professionalDistance: 0.7,
        followUpTendency: 0.5,
        interruptionThreshold: 0.8,
        contextualFocus: ['economy', 'regulation', 'practical-experience', 'relatability'],
        questioningStyle: 'practical-exploration',
        description: 'Sympathetic to entrepreneurial experience, focuses on practical governance ability'
      },
      'financial-analyst': {
        baseAggressiveness: 0.5,
        skepticismLevel: 0.6,
        empathyLevel: 0.5,
        professionalDistance: 0.6,
        followUpTendency: 0.7,
        interruptionThreshold: 0.7,
        contextualFocus: ['economy', 'inequality', 'financial-expertise', 'voter-connection'],
        questioningStyle: 'technical-challenge',
        description: 'Professional approach with focus on translating financial expertise to voter concerns'
      },
      'academic-researcher': {
        baseAggressiveness: 0.4,
        skepticismLevel: 0.5,
        empathyLevel: 0.6,
        professionalDistance: 0.8,
        followUpTendency: 0.6,
        interruptionThreshold: 0.8,
        contextualFocus: ['education', 'research', 'theory-vs-practice', 'accessibility'],
        questioningStyle: 'intellectual-accessibility',
        description: 'Respectful but probing about connecting academic thinking to real-world politics'
      },
      'tech-entrepreneur': {
        baseAggressiveness: 0.6,
        skepticismLevel: 0.7,
        empathyLevel: 0.4,
        professionalDistance: 0.4,
        followUpTendency: 0.7,
        interruptionThreshold: 0.6,
        contextualFocus: ['inequality', 'tech-regulation', 'disruption', 'wealth-responsibility'],
        questioningStyle: 'disruption-accountability',
        description: 'Challenging tech privilege and wealth, focused on social responsibility'
      },
      'environmental-activist': {
        baseAggressiveness: 0.4,
        skepticismLevel: 0.5,
        empathyLevel: 0.7,
        professionalDistance: 0.5,
        followUpTendency: 0.6,
        interruptionThreshold: 0.7,
        contextualFocus: ['climate', 'compromise', 'pragmatism', 'governing-vs-activism'],
        questioningStyle: 'activist-to-leader',
        description: 'Sympathetic to environmental passion but probing about governing pragmatism'
      },
      'former-politician': {
        baseAggressiveness: 0.7,
        skepticismLevel: 0.9,
        empathyLevel: 0.3,
        professionalDistance: 0.2,
        followUpTendency: 0.9,
        interruptionThreshold: 0.5,
        contextualFocus: ['failure', 'second-chances', 'lessons-learned', 'credibility'],
        questioningStyle: 'redemption-skepticism',
        description: 'Highly skeptical of political comeback, focused on past failures and lessons learned'
      },
      'former-journalist': {
        baseAggressiveness: 0.6,
        skepticismLevel: 0.7,
        empathyLevel: 0.5,
        professionalDistance: 0.4,
        followUpTendency: 0.8,
        interruptionThreshold: 0.6,
        contextualFocus: ['media-relations', 'independence', 'journalism-ethics', 'role-transition'],
        questioningStyle: 'professional-transition',
        description: 'Professional respect with concern about media relationships and role transition'
      }
    };

    return approaches[this.backgroundId] || this.getDefaultApproach();
  }

  /**
   * Default interviewer approach for unknown backgrounds
   */
  private getDefaultApproach(): BackgroundApproach {
    return {
      baseAggressiveness: 0.5,
      skepticismLevel: 0.6,
      empathyLevel: 0.5,
      professionalDistance: 0.6,
      followUpTendency: 0.6,
      interruptionThreshold: 0.7,
      contextualFocus: ['general-competence', 'vision', 'experience'],
      questioningStyle: 'standard-political',
      description: 'Standard professional political interview approach'
    };
  }

  /**
   * Apply background adaptations to interviewer behavior
   */
  applyBackgroundPersonality(): void {
    const approach = this.getBackgroundApproachAdaptations();
    
    // Modify base reaction patterns based on background approach
    this.reactionPatterns.forEach(pattern => {
      // Adjust reaction intensity based on background aggressiveness
      if (pattern.reaction.intensity === 'medium') {
        pattern.reaction.intensity = approach.baseAggressiveness > 0.7 ? 'high' : 
                                     approach.baseAggressiveness < 0.4 ? 'low' : 'medium';
      }
    });

    // Store approach for use in dynamic reactions
    (this as any).backgroundApproach = approach;
  }

  /**
   * Enhanced Mood Progression System - Task 3.1
   */
  private moodProgression: MoodProgression;
  private moodState: MoodState;
  private consecutiveEvents: Map<string, number> = new Map();

  /**
   * Initialize the enhanced mood progression system
   */
  private initializeMoodProgression(): void {
    const approach = this.getBackgroundApproachAdaptations();
    
    this.moodState = {
      mood: 'neutral',
      intensity: 50,
      duration: 0,
      triggers: ['interview-start'],
      stability: approach.baseAggressiveness < 0.5 ? 70 : 50
    };

    this.moodProgression = {
      currentMood: 'neutral',
      moodIntensity: 50,
      moodStability: this.moodState.stability,
      progressionTriggers: this.buildMoodTriggers(approach),
      allowedTransitions: this.buildMoodTransitions()
    };
  }

  /**
   * Build mood triggers based on background approach
   */
  private buildMoodTriggers(approach: BackgroundApproach): MoodTrigger[] {
    const baseTriggers: MoodTrigger[] = [
      {
        id: 'consecutive-evasions',
        condition: 'consecutive_evasions>=2',
        targetMood: 'frustrated',
        intensityChange: 30,
        probability: 0.8,
        description: 'Multiple evasive answers frustrate interviewer'
      },
      {
        id: 'strong-confident-answer',
        condition: 'confident_answer_with_substance',
        targetMood: 'professional',
        intensityChange: 20,
        probability: 0.6,
        description: 'Confident, substantive answer improves mood'
      },
      {
        id: 'contradiction-detected',
        condition: 'contradiction_severity>=major',
        targetMood: 'skeptical',
        intensityChange: 40,
        probability: 0.9,
        description: 'Major contradiction triggers skepticism'
      },
      {
        id: 'defensive-spiral',
        condition: 'consecutive_defensive>=3',
        targetMood: 'hostile',
        intensityChange: 50,
        probability: 0.7,
        description: 'Persistent defensiveness leads to hostility'
      },
      {
        id: 'surprising-authenticity',
        condition: 'authentic_admission',
        targetMood: 'sympathetic',
        intensityChange: 25,
        probability: 0.5,
        description: 'Genuine personal admission creates sympathy'
      },
      {
        id: 'time-pressure-evasion',
        condition: 'urgent_question_evasion',
        targetMood: 'frustrated',
        intensityChange: 35,
        probability: 0.85,
        description: 'Evading urgent questions increases frustration'
      }
    ];

    // Add background-specific triggers
    const backgroundTriggers = this.getBackgroundSpecificTriggers(approach);
    return [...baseTriggers, ...backgroundTriggers];
  }

  /**
   * Get background-specific mood triggers
   */
  private getBackgroundSpecificTriggers(approach: BackgroundApproach): MoodTrigger[] {
    const triggers: Record<string, MoodTrigger[]> = {
      'toeslagenaffaire-whistleblower': [
        {
          id: 'victim-deflection',
          condition: 'deflects_victim_impact',
          targetMood: 'hostile',
          intensityChange: 60,
          probability: 0.95,
          description: 'Deflecting victim impact triggers maximum hostility'
        },
        {
          id: 'accountability-acceptance',
          condition: 'accepts_personal_accountability',
          targetMood: 'sympathetic',
          intensityChange: 40,
          probability: 0.8,
          description: 'Taking personal accountability creates unexpected sympathy'
        }
      ],
      'shell-executive': [
        {
          id: 'greenwashing-language',
          condition: 'uses_corporate_climate_speak',
          targetMood: 'skeptical',
          intensityChange: 35,
          probability: 0.9,
          description: 'Corporate climate language triggers skepticism'
        },
        {
          id: 'climate-admission',
          condition: 'admits_climate_responsibility',
          targetMood: 'professional',
          intensityChange: 30,
          probability: 0.7,
          description: 'Admitting climate responsibility improves credibility'
        }
      ],
      'small-business-owner': [
        {
          id: 'practical-solution',
          condition: 'offers_practical_implementation',
          targetMood: 'excited',
          intensityChange: 25,
          probability: 0.6,
          description: 'Practical solutions generate interviewer excitement'
        }
      ]
    };

    return triggers[this.backgroundId] || [];
  }

  /**
   * Build allowed mood transitions with natural progression paths
   */
  private buildMoodTransitions(): MoodTransition[] {
    return [
      // From neutral
      { from: 'neutral', to: 'professional', minIntensity: 20, transitionSpeed: 'gradual', visualCue: 'nod-approval' },
      { from: 'neutral', to: 'skeptical', minIntensity: 30, transitionSpeed: 'gradual', visualCue: 'eyebrow-raise' },
      { from: 'neutral', to: 'excited', minIntensity: 40, transitionSpeed: 'instant', visualCue: 'lean-forward' },
      { from: 'neutral', to: 'surprised', minIntensity: 25, transitionSpeed: 'instant', visualCue: 'eyebrows-up' },
      { from: 'neutral', to: 'approving', minIntensity: 35, transitionSpeed: 'gradual', visualCue: 'slight-smile' },
      
      // From professional
      { from: 'professional', to: 'skeptical', minIntensity: 35, transitionSpeed: 'gradual', visualCue: 'frown-slight' },
      { from: 'professional', to: 'excited', minIntensity: 45, transitionSpeed: 'gradual', visualCue: 'smile-interest' },
      { from: 'professional', to: 'frustrated', minIntensity: 50, transitionSpeed: 'gradual', visualCue: 'sigh-disappointment' },
      { from: 'professional', to: 'surprised', minIntensity: 30, transitionSpeed: 'instant', visualCue: 'eyebrows-raise' },
      { from: 'professional', to: 'approving', minIntensity: 40, transitionSpeed: 'gradual', visualCue: 'nod-impressed' },
      
      // From skeptical
      { from: 'skeptical', to: 'frustrated', minIntensity: 40, transitionSpeed: 'gradual', visualCue: 'eyes-narrow' },
      { from: 'skeptical', to: 'hostile', minIntensity: 70, transitionSpeed: 'instant', visualCue: 'scowl-deep' },
      { from: 'skeptical', to: 'professional', minIntensity: 25, transitionSpeed: 'slow', visualCue: 'expression-soften' },
      { from: 'skeptical', to: 'surprised', minIntensity: 35, transitionSpeed: 'instant', visualCue: 'surprise-break' },
      { from: 'skeptical', to: 'approving', minIntensity: 50, transitionSpeed: 'slow', visualCue: 'grudging-respect' },
      
      // From excited
      { from: 'excited', to: 'professional', minIntensity: 20, transitionSpeed: 'gradual', visualCue: 'settle-back' },
      { from: 'excited', to: 'frustrated', minIntensity: 60, transitionSpeed: 'instant', visualCue: 'disappointment-sharp' },
      { from: 'excited', to: 'surprised', minIntensity: 25, transitionSpeed: 'instant', visualCue: 'double-take' },
      { from: 'excited', to: 'approving', minIntensity: 35, transitionSpeed: 'gradual', visualCue: 'excited-approval' },
      
      // From frustrated
      { from: 'frustrated', to: 'hostile', minIntensity: 60, transitionSpeed: 'gradual', visualCue: 'anger-build' },
      { from: 'frustrated', to: 'skeptical', minIntensity: 30, transitionSpeed: 'slow', visualCue: 'calm-down' },
      { from: 'frustrated', to: 'sympathetic', minIntensity: 50, transitionSpeed: 'instant', visualCue: 'surprise-soften' },
      { from: 'frustrated', to: 'surprised', minIntensity: 40, transitionSpeed: 'instant', visualCue: 'frustration-break' },
      { from: 'frustrated', to: 'approving', minIntensity: 55, transitionSpeed: 'slow', visualCue: 'reluctant-respect' },
      
      // From hostile
      { from: 'hostile', to: 'frustrated', minIntensity: 40, transitionSpeed: 'slow', visualCue: 'rage-subside' },
      { from: 'hostile', to: 'sympathetic', minIntensity: 70, transitionSpeed: 'instant', visualCue: 'shock-pivot' },
      { from: 'hostile', to: 'surprised', minIntensity: 60, transitionSpeed: 'instant', visualCue: 'hostility-shock' },
      { from: 'hostile', to: 'approving', minIntensity: 75, transitionSpeed: 'instant', visualCue: 'surprise-respect' },
      
      // From sympathetic
      { from: 'sympathetic', to: 'professional', minIntensity: 30, transitionSpeed: 'gradual', visualCue: 'warmth-maintain' },
      { from: 'sympathetic', to: 'frustrated', minIntensity: 50, transitionSpeed: 'gradual', visualCue: 'sympathy-fade' },
      { from: 'sympathetic', to: 'surprised', minIntensity: 35, transitionSpeed: 'instant', visualCue: 'sympathetic-surprise' },
      { from: 'sympathetic', to: 'approving', minIntensity: 25, transitionSpeed: 'gradual', visualCue: 'warm-approval' },

      // From surprised (Task 3.8)
      { from: 'surprised', to: 'professional', minIntensity: 20, transitionSpeed: 'gradual', visualCue: 'compose-self' },
      { from: 'surprised', to: 'approving', minIntensity: 30, transitionSpeed: 'gradual', visualCue: 'surprise-to-approval' },
      { from: 'surprised', to: 'excited', minIntensity: 40, transitionSpeed: 'gradual', visualCue: 'surprise-excitement' },
      { from: 'surprised', to: 'skeptical', minIntensity: 35, transitionSpeed: 'gradual', visualCue: 'surprise-doubt' },

      // From approving (Task 3.8)
      { from: 'approving', to: 'professional', minIntensity: 25, transitionSpeed: 'gradual', visualCue: 'approval-settle' },
      { from: 'approving', to: 'excited', minIntensity: 35, transitionSpeed: 'gradual', visualCue: 'approval-excitement' },
      { from: 'approving', to: 'surprised', minIntensity: 30, transitionSpeed: 'instant', visualCue: 'approval-surprise' },
      { from: 'approving', to: 'frustrated', minIntensity: 45, transitionSpeed: 'gradual', visualCue: 'approval-fade' }
    ];
  }

  /**
   * Process response with enhanced mood progression
   */
  processMoodProgression(response: PlayerResponse): MoodChange | null {
    this.updateConsecutiveEvents(response);
    
    // Check for mood triggers
    for (const trigger of this.moodProgression.progressionTriggers) {
      if (this.evaluateMoodTrigger(trigger, response)) {
        return this.executeMoodTransition(trigger);
      }
    }
    
    // Natural mood decay over time
    this.applyMoodDecay();
    
    return null;
  }

  /**
   * Update consecutive event tracking
   */
  private updateConsecutiveEvents(response: PlayerResponse): void {
    // Reset counters for different tones
    for (const [event, count] of this.consecutiveEvents) {
      if (!event.includes(response.tone)) {
        this.consecutiveEvents.set(event, 0);
      }
    }

    // Increment current tone counter
    const currentCount = this.consecutiveEvents.get(`consecutive_${response.tone}`) || 0;
    this.consecutiveEvents.set(`consecutive_${response.tone}`, currentCount + 1);

    // Track evasions specifically
    if (response.tone === 'evasive') {
      const evasionCount = this.consecutiveEvents.get('consecutive_evasions') || 0;
      this.consecutiveEvents.set('consecutive_evasions', evasionCount + 1);
    } else {
      this.consecutiveEvents.set('consecutive_evasions', 0);
    }
  }

  /**
   * Evaluate if a mood trigger should fire
   */
  private evaluateMoodTrigger(trigger: MoodTrigger, response: PlayerResponse): boolean {
    // Check probability first
    if (Math.random() > trigger.probability) return false;

    // Evaluate condition
    switch (trigger.condition) {
      case 'consecutive_evasions>=2':
        return (this.consecutiveEvents.get('consecutive_evasions') || 0) >= 2;
      
      case 'consecutive_evasions>=3':
        return (this.consecutiveEvents.get('consecutive_evasions') || 0) >= 3;
      
      case 'consecutive_defensive>=3':
        return (this.consecutiveEvents.get('consecutive_defensive') || 0) >= 3;
      
      case 'confident_answer_with_substance':
        return response.tone === 'confident' && response.wordCount > 40;
      
      case 'contradiction_severity>=major':
        return response.contradictsPrevious === true;
      
      case 'authentic_admission':
        return response.tone === 'diplomatic' && 
               (response.responseText.toLowerCase().includes('mistake') ||
                response.responseText.toLowerCase().includes('wrong') ||
                response.responseText.toLowerCase().includes('sorry'));
      
      case 'urgent_question_evasion':
        return response.tone === 'evasive'; // Should be checked against urgency in actual implementation
      
      case 'deflects_victim_impact':
        return this.backgroundId === 'toeslagenaffaire-whistleblower' && 
               (response.tone === 'defensive' || response.tone === 'evasive') &&
               response.topic === 'victims';
      
      case 'accepts_personal_accountability':
        return this.backgroundId === 'toeslagenaffaire-whistleblower' &&
               response.responseText.toLowerCase().includes('responsible') &&
               response.tone !== 'defensive';
      
      case 'uses_corporate_climate_speak':
        return this.backgroundId === 'shell-executive' &&
               (response.responseText.toLowerCase().includes('sustainability') ||
                response.responseText.toLowerCase().includes('carbon neutral') ||
                response.responseText.toLowerCase().includes('green transition'));
      
      case 'admits_climate_responsibility':
        return this.backgroundId === 'shell-executive' &&
               response.responseText.toLowerCase().includes('responsibility') &&
               response.topic === 'climate';
      
      case 'offers_practical_implementation':
        return this.backgroundId === 'small-business-owner' &&
               response.tone === 'confident' &&
               (response.responseText.toLowerCase().includes('implement') ||
                response.responseText.toLowerCase().includes('practical') ||
                response.responseText.toLowerCase().includes('experience'));
      
      default:
        return false;
    }
  }

  /**
   * Execute mood transition based on trigger
   */
  private executeMoodTransition(trigger: MoodTrigger): MoodChange | null {
    const oldMood = this.moodState.mood;
    const newIntensity = Math.min(100, this.moodState.intensity + trigger.intensityChange);
    
    // Find appropriate transition
    const transition = this.moodProgression.allowedTransitions.find(t => 
      t.from === oldMood && 
      t.to === trigger.targetMood && 
      newIntensity >= t.minIntensity
    );

    if (!transition) return null;

    // Execute transition
    const oldIntensity = this.moodState.intensity;
    this.moodState = {
      mood: trigger.targetMood,
      intensity: newIntensity,
      duration: 0,
      triggers: [...this.moodState.triggers, trigger.id],
      stability: this.calculateNewStability(trigger)
    };

    this.moodProgression.currentMood = trigger.targetMood;
    this.moodProgression.moodIntensity = newIntensity;
    this.mood = trigger.targetMood;

    // Add to mood history
    this.moodHistory.push({
      mood: trigger.targetMood,
      timestamp: Date.now(),
      trigger: trigger.id
    });

    return {
      from: oldMood,
      to: trigger.targetMood,
      trigger: trigger.description,
      intensity: transition.transitionSpeed,
      visibleReaction: transition.visualCue
    };
  }

  /**
   * Calculate new stability after mood change
   */
  private calculateNewStability(trigger: MoodTrigger): number {
    const baseStability = this.moodState.stability;
    
    // Extreme mood changes reduce stability
    if (trigger.intensityChange > 40) {
      return Math.max(20, baseStability - 10);
    }
    
    // Gradual changes maintain stability
    return Math.min(80, baseStability + 2);
  }

  /**
   * Apply natural mood decay over time
   */
  private applyMoodDecay(): void {
    this.moodState.duration += 1; // Assume called once per response

    // Intense moods naturally decay
    if (this.moodState.intensity > 70 && this.moodState.duration > 3) {
      this.moodState.intensity = Math.max(50, this.moodState.intensity - 5);
      this.moodProgression.moodIntensity = this.moodState.intensity;
    }

    // Return to neutral from extreme positions
    if (['hostile', 'excited'].includes(this.moodState.mood) &&
        this.moodState.intensity < 40) {
      this.moodState.mood = 'professional';
      this.moodProgression.currentMood = 'professional';
      this.mood = 'professional';
    }
  }

  /**
   * Initialize Frustration Escalation System - Task 3.7
   */
  private initializeFrustrationSystem(): void {
    const approach = this.getBackgroundApproachAdaptations();

    this.frustrationSystem = {
      enabled: true,
      currentLevel: 'calm',
      triggers: this.buildFrustrationTriggers(approach),
      escalationThresholds: this.buildFrustrationThresholds(),
      behaviorChanges: this.buildFrustrationBehaviorChanges(),
      visualEffects: this.buildFrustrationVisualConfig(),
      cooldownPeriod: 10, // 10 seconds between escalations
      decayRate: 5, // 5 points per minute
      maxFrustration: 100
    };

    // Initialize enhanced memory with frustration tracking
    this.enhancedMemory = {
      ...this.memory,
      frustrationHistory: [],
      triggerCooldowns: new Map(),
      escalationPattern: {
        dominantTriggers: [],
        escalationSpeed: 'gradual',
        recoveryDifficulty: approach.baseAggressiveness,
        peakFrustration: 0,
        averageDuration: 0
      },
      recoveryAttempts: 0
    };
  }

  /**
   * Build frustration triggers based on background approach
   */
  private buildFrustrationTriggers(approach: BackgroundApproach): FrustrationTrigger[] {
    const baseTriggers: FrustrationTrigger[] = [
      {
        id: 'consecutive-evasions',
        type: 'evasion',
        condition: 'consecutive_evasions>=2',
        frustractionIncrease: 15,
        probability: 0.8,
        description: 'Multiple evasive answers build frustration',
        cooldown: 30
      },
      {
        id: 'major-contradiction',
        type: 'contradiction',
        condition: 'contradiction_severity>=major',
        frustractionIncrease: 20,
        probability: 0.9,
        description: 'Major contradictions cause significant frustration',
        cooldown: 60
      },
      {
        id: 'time-wasting',
        type: 'time-wasting',
        condition: 'response_time>90_seconds',
        frustractionIncrease: 12,
        probability: 0.7,
        description: 'Excessive response time wastes interview time',
        cooldown: 45
      },
      {
        id: 'deflection-pattern',
        type: 'deflection',
        condition: 'deflection_count>=3',
        frustractionIncrease: 18,
        probability: 0.85,
        description: 'Pattern of deflecting to other topics',
        cooldown: 90
      },
      {
        id: 'non-responsive',
        type: 'non-answer',
        condition: 'non_answer_pattern>=2',
        frustractionIncrease: 16,
        probability: 0.8,
        description: 'Non-responsive answers to direct questions',
        cooldown: 60
      },
      {
        id: 'interruption-resistance',
        type: 'interruption-resistance',
        condition: 'talks_over_interviewer>=2',
        frustractionIncrease: 25,
        probability: 0.9,
        description: 'Talking over interviewer interruptions',
        cooldown: 30
      },
      {
        id: 'fact-avoidance',
        type: 'fact-avoidance',
        condition: 'avoids_factual_questions>=2',
        frustractionIncrease: 14,
        probability: 0.75,
        description: 'Avoiding factual verification questions',
        cooldown: 75
      },
      {
        id: 'policy-vagueness',
        type: 'policy-vagueness',
        condition: 'vague_policy_answers>=3',
        frustractionIncrease: 13,
        probability: 0.7,
        description: 'Consistently vague policy positions',
        cooldown: 120
      }
    ];

    // Add background-specific triggers with higher impact
    const backgroundTriggers = this.buildBackgroundFrustrationTriggers(approach);

    return [...baseTriggers, ...backgroundTriggers];
  }

  /**
   * Build background-specific frustration triggers
   */
  private buildBackgroundFrustrationTriggers(approach: BackgroundApproach): FrustrationTrigger[] {
    const triggers: Record<string, FrustrationTrigger[]> = {
      'toeslagenaffaire-whistleblower': [
        {
          id: 'victim-dismissal',
          type: 'personal-attack',
          condition: 'dismisses_victim_concerns',
          frustractionIncrease: 35,
          probability: 0.95,
          description: 'Dismissing victim concerns triggers maximum frustration',
          cooldown: 60
        },
        {
          id: 'accountability-deflection',
          type: 'deflection',
          condition: 'deflects_personal_accountability',
          frustractionIncrease: 30,
          probability: 0.9,
          description: 'Deflecting personal accountability in whistleblowing context',
          cooldown: 90
        }
      ],
      'shell-executive': [
        {
          id: 'climate-denial',
          type: 'fact-avoidance',
          condition: 'avoids_climate_responsibility',
          frustractionIncrease: 28,
          probability: 0.9,
          description: 'Avoiding climate responsibility triggers environmental justice frustration',
          cooldown: 75
        },
        {
          id: 'greenwashing-speak',
          type: 'deflection',
          condition: 'uses_corporate_greenwashing',
          frustractionIncrease: 22,
          probability: 0.85,
          description: 'Corporate greenwashing language frustrates environmental focus',
          cooldown: 60
        }
      ],
      'former-politician': [
        {
          id: 'political-speak',
          type: 'evasion',
          condition: 'uses_political_speak>=2',
          frustractionIncrease: 25,
          probability: 0.9,
          description: 'Political speak from failed politician especially frustrating',
          cooldown: 45
        },
        {
          id: 'failure-denial',
          type: 'deflection',
          condition: 'deflects_past_failures',
          frustractionIncrease: 30,
          probability: 0.95,
          description: 'Deflecting past political failures triggers skepticism',
          cooldown: 120
        }
      ]
    };

    return triggers[this.backgroundId] || [];
  }

  /**
   * Build frustration level thresholds
   */
  private buildFrustrationThresholds(): FrustrationThreshold[] {
    return [
      {
        level: 'calm',
        minValue: 0,
        maxValue: 20,
        transitionEffects: [],
        behaviorChanges: [],
        moodOverride: 'professional'
      },
      {
        level: 'mildly-annoyed',
        minValue: 21,
        maxValue: 40,
        transitionEffects: [
          { type: 'visual', effect: 'slight-frown', intensity: 30, duration: 2000 },
          { type: 'audio', effect: 'subtle-sigh', intensity: 25, duration: 1500 }
        ],
        behaviorChanges: ['reduce-patience', 'increase-directness'],
        moodOverride: 'skeptical'
      },
      {
        level: 'frustrated',
        minValue: 41,
        maxValue: 60,
        transitionEffects: [
          { type: 'visual', effect: 'furrowed-brow', intensity: 50, duration: 3000 },
          { type: 'text', effect: 'sharper-tone', intensity: 40, duration: 0 },
          { type: 'timing', effect: 'faster-interruptions', intensity: 45, duration: 0 }
        ],
        behaviorChanges: ['aggressive-questioning', 'frequent-interruptions', 'memory-references'],
        moodOverride: 'frustrated'
      },
      {
        level: 'very-frustrated',
        minValue: 61,
        maxValue: 80,
        transitionEffects: [
          { type: 'visual', effect: 'intense-stare', intensity: 70, duration: 4000 },
          { type: 'audio', effect: 'frustrated-exhale', intensity: 60, duration: 2000 },
          { type: 'text', effect: 'hostile-tone', intensity: 65, duration: 0 }
        ],
        behaviorChanges: ['rapid-fire-questions', 'aggressive-fact-checking', 'hostile-reactions'],
        moodOverride: 'hostile'
      },
      {
        level: 'losing-patience',
        minValue: 81,
        maxValue: 95,
        transitionEffects: [
          { type: 'visual', effect: 'dramatic-reaction', intensity: 85, duration: 5000 },
          { type: 'audio', effect: 'anger-warning', intensity: 80, duration: 3000 },
          { type: 'text', effect: 'threatening-language', intensity: 85, duration: 0 }
        ],
        behaviorChanges: ['interview-threats', 'maximum-aggression', 'credibility-attacks'],
        moodOverride: 'hostile'
      },
      {
        level: 'explosive',
        minValue: 96,
        maxValue: 100,
        transitionEffects: [
          { type: 'visual', effect: 'explosive-reaction', intensity: 100, duration: 8000 },
          { type: 'audio', effect: 'interview-termination-warning', intensity: 100, duration: 4000 },
          { type: 'text', effect: 'interview-ending-language', intensity: 100, duration: 0 }
        ],
        behaviorChanges: ['interview-termination', 'public-confrontation', 'career-damage'],
        moodOverride: 'hostile'
      }
    ];
  }

  /**
   * Build frustration behavior changes
   */
  private buildFrustrationBehaviorChanges(): FrustrationBehaviorChange[] {
    return [
      {
        id: 'reduce-patience',
        frustractionLevel: 'mildly-annoyed',
        type: 'patience-threshold',
        modifications: [
          { property: 'responseTimeLimit', modifier: 'multiply', value: 0.9, description: 'Reduce time patience by 10%' },
          { property: 'interruptionThreshold', modifier: 'multiply', value: 0.95, description: 'Slightly more likely to interrupt' }
        ],
        description: 'Reduce patience for long responses and increase interruption likelihood',
        active: false
      },
      {
        id: 'aggressive-questioning',
        frustractionLevel: 'frustrated',
        type: 'questioning-style',
        modifications: [
          { property: 'questionIntensity', modifier: 'multiply', value: 1.3, description: 'More aggressive question phrasing' },
          { property: 'followUpProbability', modifier: 'multiply', value: 1.4, description: '40% more follow-up questions' }
        ],
        description: 'Adopt more aggressive questioning style with frequent follow-ups',
        active: false
      },
      {
        id: 'rapid-fire-questions',
        frustractionLevel: 'very-frustrated',
        type: 'rapid-fire-trigger',
        modifications: [
          { property: 'rapidFireThreshold', modifier: 'multiply', value: 0.5, description: 'Lower threshold for rapid-fire mode' },
          { property: 'rapidFireIntensity', modifier: 'add', value: 1, description: 'Increase rapid-fire intensity level' }
        ],
        description: 'More likely to trigger rapid-fire questioning sessions',
        active: false
      },
      {
        id: 'interview-threats',
        frustractionLevel: 'losing-patience',
        type: 'voice-tone',
        modifications: [
          { property: 'threatLevel', modifier: 'set', value: 0.8, description: 'Include interview termination threats' },
          { property: 'aggressionLevel', modifier: 'set', value: 0.9, description: 'Maximum aggression short of termination' }
        ],
        description: 'Begin threatening interview termination and maximum aggression',
        active: false
      },
      {
        id: 'interview-termination',
        frustractionLevel: 'explosive',
        type: 'patience-threshold',
        modifications: [
          { property: 'terminationTrigger', modifier: 'set', value: 1.0, description: 'Interview termination becomes likely' },
          { property: 'publicConfrontation', modifier: 'set', value: 1.0, description: 'Public confrontation mode' }
        ],
        description: 'Interview termination becomes highly likely with explosive reactions',
        active: false
      }
    ];
  }

  /**
   * Build frustration visual configuration
   */
  private buildFrustrationVisualConfig(): any {
    return {
      levelIndicators: {
        'calm': {
          backgroundColor: '#f8fafc',
          lighting: 'soft-natural',
          cameraAngle: 'neutral-professional',
          interviewerExpression: 'professional-neutral',
          textColor: '#374151',
          uiElements: {
            questionBox: 'border-gray-200',
            timerColor: '#10b981',
            borderStyle: 'solid'
          }
        },
        'mildly-annoyed': {
          backgroundColor: '#fef3c7',
          lighting: 'slightly-harsh',
          cameraAngle: 'subtle-lean-forward',
          interviewerExpression: 'slight-frown',
          textColor: '#d97706',
          uiElements: {
            questionBox: 'border-yellow-300',
            timerColor: '#f59e0b',
            borderStyle: 'solid'
          }
        },
        'frustrated': {
          backgroundColor: '#fed7aa',
          lighting: 'harsher-contrast',
          cameraAngle: 'lean-forward-intent',
          interviewerExpression: 'furrowed-brow',
          textColor: '#ea580c',
          uiElements: {
            questionBox: 'border-orange-400',
            timerColor: '#ea580c',
            borderStyle: 'double'
          }
        },
        'very-frustrated': {
          backgroundColor: '#fecaca',
          lighting: 'dramatic-harsh',
          cameraAngle: 'aggressive-forward',
          interviewerExpression: 'intense-stare',
          textColor: '#dc2626',
          uiElements: {
            questionBox: 'border-red-500',
            timerColor: '#dc2626',
            borderStyle: 'solid-thick'
          }
        },
        'losing-patience': {
          backgroundColor: '#fca5a5',
          lighting: 'dramatic-shadows',
          cameraAngle: 'confrontational',
          interviewerExpression: 'angry-warning',
          textColor: '#b91c1c',
          uiElements: {
            questionBox: 'border-red-600 animate-pulse',
            timerColor: '#b91c1c',
            borderStyle: 'dashed-thick'
          }
        },
        'explosive': {
          backgroundColor: '#ef4444',
          lighting: 'harsh-dramatic',
          cameraAngle: 'explosive-close',
          interviewerExpression: 'explosive-anger',
          textColor: '#991b1b',
          uiElements: {
            questionBox: 'border-red-700 animate-bounce',
            timerColor: '#991b1b',
            borderStyle: 'solid-very-thick'
          }
        }
      },
      transitionAnimations: [
        {
          fromLevel: 'calm' as FrustrationLevel,
          toLevel: 'mildly-annoyed' as FrustrationLevel,
          animationType: 'smooth',
          duration: 1500,
          effects: ['subtle-color-shift', 'gentle-expression-change']
        },
        {
          fromLevel: 'frustrated' as FrustrationLevel,
          toLevel: 'very-frustrated' as FrustrationLevel,
          animationType: 'dramatic',
          duration: 2000,
          effects: ['color-flash', 'dramatic-expression-shift', 'camera-shake']
        },
        {
          fromLevel: 'losing-patience' as FrustrationLevel,
          toLevel: 'explosive' as FrustrationLevel,
          animationType: 'instant',
          duration: 500,
          effects: ['screen-flash', 'explosive-animation', 'dramatic-zoom']
        }
      ]
    };
  }

  /**
   * Process frustration escalation on response - Task 3.7
   */
  processFrustrationEscalation(response: PlayerResponse): FrustrationEvent | null {
    if (!this.frustrationSystem.enabled) return null;

    const currentTime = Date.now();

    // Check for applicable triggers
    for (const trigger of this.frustrationSystem.triggers) {
      if (this.shouldTriggerFrustration(trigger, response, currentTime)) {
        const event = this.executeFrustrationTrigger(trigger, response, currentTime);
        if (event) {
          this.updateFrustrationBehaviors();
          return event;
        }
      }
    }

    // Apply natural frustration decay
    this.applyFrustrationDecay();

    return null;
  }

  /**
   * Check if frustration trigger should activate
   */
  private shouldTriggerFrustration(trigger: FrustrationTrigger, response: PlayerResponse, currentTime: number): boolean {
    // Check cooldown
    const lastTrigger = this.enhancedMemory.triggerCooldowns.get(trigger.id);
    if (lastTrigger && (currentTime - lastTrigger) < (trigger.cooldown || 0) * 1000) {
      return false;
    }

    // Check probability
    if (Math.random() > trigger.probability) return false;

    // Evaluate trigger condition
    return this.evaluateFrustrationCondition(trigger.condition, response);
  }

  /**
   * Evaluate frustration trigger conditions
   */
  private evaluateFrustrationCondition(condition: string, response: PlayerResponse): boolean {
    switch (condition) {
      case 'consecutive_evasions>=2':
        return (this.consecutiveEvents.get('consecutive_evasions') || 0) >= 2;

      case 'contradiction_severity>=major':
        return response.contradictsPrevious === true;

      case 'response_time>90_seconds':
        // Would need actual response timing - placeholder for now
        return false;

      case 'deflection_count>=3':
        return (this.consecutiveEvents.get('consecutive_deflection') || 0) >= 3;

      case 'non_answer_pattern>=2':
        return (this.consecutiveEvents.get('consecutive_evasive') || 0) >= 2;

      case 'talks_over_interviewer>=2':
        // Would need interruption tracking - placeholder for now
        return false;

      case 'avoids_factual_questions>=2':
        return response.tone === 'evasive' && response.wordCount < 20;

      case 'vague_policy_answers>=3':
        return response.tone === 'evasive' && response.topic?.includes('policy');

      // Background-specific conditions
      case 'dismisses_victim_concerns':
        return this.backgroundId === 'toeslagenaffaire-whistleblower' &&
               (response.tone === 'defensive' || response.tone === 'evasive') &&
               response.topic === 'victims';

      case 'deflects_personal_accountability':
        return this.backgroundId === 'toeslagenaffaire-whistleblower' &&
               response.tone === 'deflective' &&
               response.responseText.toLowerCase().includes('system');

      case 'avoids_climate_responsibility':
        return this.backgroundId === 'shell-executive' &&
               response.tone === 'evasive' &&
               response.topic === 'climate';

      case 'uses_corporate_greenwashing':
        return this.backgroundId === 'shell-executive' &&
               (response.responseText.toLowerCase().includes('sustainability') ||
                response.responseText.toLowerCase().includes('carbon neutral'));

      case 'uses_political_speak>=2':
        return this.backgroundId === 'former-politician' &&
               (this.consecutiveEvents.get('consecutive_diplomatic') || 0) >= 2;

      case 'deflects_past_failures':
        return this.backgroundId === 'former-politician' &&
               response.tone === 'deflective' &&
               response.topic === 'experience';

      default:
        return false;
    }
  }

  /**
   * Execute frustration trigger and create event
   */
  private executeFrustrationTrigger(trigger: FrustrationTrigger, response: PlayerResponse, currentTime: number): FrustrationEvent | null {
    const previousLevel = this.frustrationSystem.currentLevel;
    const previousFrustration = this.memory.frustrationLevel;

    // Increase frustration
    const newFrustration = Math.min(this.frustrationSystem.maxFrustration,
                                   previousFrustration + trigger.frustractionIncrease);
    this.memory.frustrationLevel = newFrustration;

    // Determine new frustration level
    const newLevel = this.calculateFrustrationLevel(newFrustration);
    const previousLevelValue = this.calculateFrustrationLevel(previousFrustration);

    // Only create event if level actually changed
    if (newLevel !== previousLevelValue) {
      this.frustrationSystem.currentLevel = newLevel;

      // Record trigger cooldown
      this.enhancedMemory.triggerCooldowns.set(trigger.id, currentTime);

      // Create frustration event
      const event: FrustrationEvent = {
        timestamp: currentTime,
        trigger: trigger.type,
        frustractionIncrease: trigger.frustractionIncrease,
        previousLevel: previousLevelValue,
        newLevel: newLevel,
        playerResponse: response.responseText,
        interviewerReaction: this.generateFrustrationReaction(newLevel, trigger.type)
      };

      // Add to history
      this.enhancedMemory.frustrationHistory.push(event);
      if (this.enhancedMemory.frustrationHistory.length > 20) {
        this.enhancedMemory.frustrationHistory.shift(); // Keep recent history
      }

      // Update escalation pattern
      this.updateEscalationPattern(trigger.type, newFrustration);

      return event;
    }

    return null;
  }

  /**
   * Calculate frustration level from numeric value
   */
  private calculateFrustrationLevel(frustration: number): FrustrationLevel {
    if (frustration <= 20) return 'calm';
    if (frustration <= 40) return 'mildly-annoyed';
    if (frustration <= 60) return 'frustrated';
    if (frustration <= 80) return 'very-frustrated';
    if (frustration <= 95) return 'losing-patience';
    return 'explosive';
  }

  /**
   * Generate frustration-specific reaction message
   */
  private generateFrustrationReaction(level: FrustrationLevel, triggerType: FrustrationTriggerType): string {
    const reactions: Record<FrustrationLevel, Record<FrustrationTriggerType, string[]>> = {
      'mildly-annoyed': {
        'evasion': ["That's not really an answer.", "Could you be more direct?", "I asked a specific question."],
        'contradiction': ["Wait, that contradicts what you said before.", "Which version is correct?"],
        'deflection': ["Let's stay on topic.", "You're deflecting from the question."],
        'time-wasting': ["We don't have all day.", "Time is limited here."],
        'non-answer': ["That's not answering the question.", "Could you actually address what I asked?"],
        'interruption-resistance': ["Let me finish.", "You need to let me speak."],
        'fact-avoidance': ["The facts matter here.", "Don't avoid the specifics."],
        'policy-vagueness': ["Voters need specifics.", "That's too vague."],
        'personal-attack': ["That's inappropriate.", "Keep this professional."],
        'question-challenging': ["I'm asking the questions here.", "Answer the question."]
      },
      'frustrated': {
        'evasion': ["Stop evading! Answer the question!", "This is the third time you've dodged this.", "Voters deserve straight answers!"],
        'contradiction': ["You're contradicting yourself again!", "Which lie should we believe?", "Your story keeps changing!"],
        'deflection': ["Stop deflecting and answer!", "You're running from every question!", "Classic politician deflection!"],
        'time-wasting': ["You're wasting everyone's time!", "Answer the damn question!", "This isn't a filibuster!"],
        'non-answer': ["That's complete nonsense!", "Give me a real answer!", "Word salad won't cut it!"],
        'interruption-resistance': ["Don't talk over me!", "Show some respect!", "This is my interview!"],
        'fact-avoidance': ["The facts don't lie, you do!", "Stop running from reality!", "Face the facts!"],
        'policy-vagueness': ["Enough platitudes! Give specifics!", "Vague promises won't fool voters!", "What's your actual plan?"],
        'personal-attack': ["How dare you!", "That's completely out of line!", "You've crossed the line!"],
        'question-challenging': ["Don't question my questions!", "Answer or leave!", "This is journalism, not PR!"]
      },
      'very-frustrated': {
        'evasion': ["I'VE HAD ENOUGH OF YOUR EVASION!", "ANSWER THE BLOODY QUESTION!", "YOU'RE A COWARD!"],
        'contradiction': ["YOUR LIES ARE PATHETIC!", "STOP LYING TO MY FACE!", "WHICH VERSION IS THE LIE?"],
        'deflection': ["STOP RUNNING AWAY!", "FACE THE QUESTION!", "YOU CAN'T HIDE FOREVER!"],
        'time-wasting': ["YOU'RE INSULTING EVERYONE'S INTELLIGENCE!", "ENOUGH STALLING!", "TIME TO FACE REALITY!"],
        'non-answer': ["THAT'S COMPLETE GARBAGE!", "INSULTING NONSENSE!", "DO YOU TAKE US FOR FOOLS?"],
        'interruption-resistance': ["SHUT UP AND LISTEN!", "RESPECT THE PROCESS!", "THIS IS MY SHOW!"],
        'fact-avoidance': ["THE TRUTH WILL COME OUT!", "STOP HIDING FROM FACTS!", "REALITY DOESN'T CARE ABOUT YOUR FEELINGS!"],
        'policy-vagueness': ["MEANINGLESS GARBAGE!", "EMPTY POLITICAL NONSENSE!", "SAY SOMETHING REAL!"],
        'personal-attack': ["UNACCEPTABLE!", "YOU'RE DISGRACEFUL!", "COMPLETELY INAPPROPRIATE!"],
        'question-challenging': ["WHO DO YOU THINK YOU ARE?", "THIS IS MY INTERVIEW!", "ANSWER OR GET OUT!"]
      },
      'losing-patience': {
        'evasion': ["ONE MORE EVASION AND THIS INTERVIEW IS OVER!", "LAST CHANCE TO ANSWER!", "YOU'RE TESTING MY PATIENCE!"],
        'contradiction': ["YOUR CREDIBILITY IS SHOT!", "NOBODY BELIEVES YOU ANYMORE!", "STOP LYING OR LEAVE!"],
        'deflection': ["FINAL WARNING: ANSWER THE QUESTION!", "I'M DONE WITH YOUR GAMES!", "ANSWER OR THIS ENDS NOW!"],
        'time-wasting': ["THIS INTERVIEW IS ALMOST OVER!", "YOU'VE WASTED ENOUGH TIME!", "FINAL CHANCE!"],
        'non-answer': ["THIS IS YOUR LAST CHANCE!", "SAY SOMETHING REAL OR LEAVE!", "I'M DONE WITH NONSENSE!"],
        'interruption-resistance': ["INTERRUPT ME AGAIN AND WE'RE DONE!", "RESPECT OR LEAVE!", "FINAL WARNING!"],
        'fact-avoidance': ["FACE REALITY OR GET OUT!", "THE TRUTH ENDS THIS!", "LAST CHANCE FOR HONESTY!"],
        'policy-vagueness': ["SPECIFICS OR THIS ENDS!", "REAL ANSWERS OR LEAVE!", "ENOUGH EMPTY WORDS!"],
        'personal-attack': ["THAT'S IT! ALMOST DONE HERE!", "UNFORGIVABLE!", "LAST STRAW!"],
        'question-challenging': ["THAT'S ENOUGH! ANSWER OR LEAVE!", "I'M ENDING THIS!", "GET OUT!"]
      },
      'explosive': {
        'evasion': ["THIS INTERVIEW IS OVER!", "GET OUT OF MY STUDIO!", "YOU'RE A DISGRACE!"],
        'contradiction': ["LIAR! THIS INTERVIEW IS FINISHED!", "PATHETIC! GET OUT!", "CREDIBILITY ZERO!"],
        'deflection': ["ENOUGH! YOU'RE DONE HERE!", "INTERVIEW TERMINATED!", "GET OUT NOW!"],
        'time-wasting': ["TIME'S UP! YOU'RE FINISHED!", "WASTED EVERYONE'S TIME!", "INTERVIEW OVER!"],
        'non-answer': ["INSULTING! GET OUT!", "ENOUGH GARBAGE! LEAVE!", "YOU'RE DONE!"],
        'interruption-resistance': ["DISRESPECTFUL! LEAVE NOW!", "GET OUT OF HERE!", "INTERVIEW TERMINATED!"],
        'fact-avoidance': ["TRUTH DENIER! GET OUT!", "REALITY ENDS THIS!", "YOU'RE FINISHED!"],
        'policy-vagueness': ["EMPTY SUIT! LEAVE!", "MEANINGLESS! GET OUT!", "INTERVIEW OVER!"],
        'personal-attack': ["COMPLETELY UNACCEPTABLE! LEAVE!", "DISGRACEFUL! GET OUT!", "INTERVIEW TERMINATED!"],
        'question-challenging': ["HOW DARE YOU! GET OUT!", "INTERVIEW OVER!", "SECURITY!"]
      },
      'calm': {} as Record<FrustrationTriggerType, string[]>
    };

    const levelReactions = reactions[level] || {};
    const triggerReactions = levelReactions[triggerType] || ["I'm getting frustrated with this."];
    return triggerReactions[Math.floor(Math.random() * triggerReactions.length)];
  }

  /**
   * Update escalation pattern tracking
   */
  private updateEscalationPattern(triggerType: FrustrationTriggerType, currentFrustration: number): void {
    const pattern = this.enhancedMemory.escalationPattern;

    // Track dominant triggers
    const triggerIndex = pattern.dominantTriggers.indexOf(triggerType);
    if (triggerIndex === -1) {
      pattern.dominantTriggers.push(triggerType);
    }

    // Update peak frustration
    pattern.peakFrustration = Math.max(pattern.peakFrustration, currentFrustration);

    // Determine escalation speed based on history
    const recentEvents = this.enhancedMemory.frustrationHistory.slice(-5);
    if (recentEvents.length >= 3) {
      const timeSpan = recentEvents[recentEvents.length - 1].timestamp - recentEvents[0].timestamp;
      const avgIncrease = recentEvents.reduce((sum, event) => sum + event.frustractionIncrease, 0) / recentEvents.length;

      if (timeSpan < 60000 && avgIncrease > 20) { // Less than 1 minute, high increases
        pattern.escalationSpeed = 'explosive';
      } else if (timeSpan < 180000 && avgIncrease > 15) { // Less than 3 minutes, medium increases
        pattern.escalationSpeed = 'rapid';
      } else if (avgIncrease > 10) {
        pattern.escalationSpeed = 'moderate';
      } else {
        pattern.escalationSpeed = 'gradual';
      }
    }
  }

  /**
   * Update behavior changes based on current frustration level
   */
  private updateFrustrationBehaviors(): void {
    const currentLevel = this.frustrationSystem.currentLevel;

    // Deactivate all behaviors first
    this.frustrationSystem.behaviorChanges.forEach(behavior => {
      behavior.active = false;
    });

    // Activate behaviors for current level and below
    this.frustrationSystem.behaviorChanges.forEach(behavior => {
      if (this.shouldActivateBehavior(behavior.frustractionLevel, currentLevel)) {
        behavior.active = true;
      }
    });
  }

  /**
   * Check if behavior should be activated for current frustration level
   */
  private shouldActivateBehavior(behaviorLevel: FrustrationLevel, currentLevel: FrustrationLevel): boolean {
    const levelOrder: FrustrationLevel[] = ['calm', 'mildly-annoyed', 'frustrated', 'very-frustrated', 'losing-patience', 'explosive'];
    const behaviorIndex = levelOrder.indexOf(behaviorLevel);
    const currentIndex = levelOrder.indexOf(currentLevel);
    return currentIndex >= behaviorIndex;
  }

  /**
   * Apply natural frustration decay over time
   */
  private applyFrustrationDecay(): void {
    if (this.memory.frustrationLevel > 0) {
      // Decay rate: 5 points per minute (approximately per response)
      const decay = this.frustrationSystem.decayRate;
      this.memory.frustrationLevel = Math.max(0, this.memory.frustrationLevel - decay);

      // Update level if changed
      const newLevel = this.calculateFrustrationLevel(this.memory.frustrationLevel);
      if (newLevel !== this.frustrationSystem.currentLevel) {
        this.frustrationSystem.currentLevel = newLevel;
        this.updateFrustrationBehaviors();
      }
    }
  }

  /**
   * Get current frustration system state
   */
  getFrustrationState(): {
    level: FrustrationLevel;
    value: number;
    activeBehaviors: string[];
    recentTriggers: FrustrationTriggerType[];
    escalationPattern: FrustrationPattern;
  } {
    return {
      level: this.frustrationSystem.currentLevel,
      value: this.memory.frustrationLevel,
      activeBehaviors: this.frustrationSystem.behaviorChanges
        .filter(b => b.active)
        .map(b => b.id),
      recentTriggers: this.enhancedMemory.frustrationHistory
        .slice(-5)
        .map(event => event.trigger),
      escalationPattern: { ...this.enhancedMemory.escalationPattern }
    };
  }

  /**
   * Get current mood state for UI
   */
  getMoodState(): MoodState {
    return { ...this.moodState };
  }

  /**
   * Get mood progression data for debugging
   */
  getMoodProgression(): MoodProgression {
    return { ...this.moodProgression };
  }

  /**
   * Get context-specific reaction based on background and topic
   */
  getContextualReaction(topic: string, tone: string): string | null {
    const approach = (this as any).backgroundApproach as BackgroundApproach;
    if (!approach) return null;

    // Generate contextual reactions based on background focus areas
    if (approach.contextualFocus.includes(topic)) {
      const reactionMap: Record<string, Record<string, string[]>> = {
        'toeslagenaffaire-whistleblower': {
          'accountability': [
            "You talk about accountability, but where was yours when families were suffering?",
            "Accountability means taking responsibility, not just exposing others.",
            "The victims are still waiting for real accountability from people like you."
          ],
          'trust': [
            "Trust? You were part of the system that destroyed trust.",
            "How do you rebuild trust when you helped break it?",
            "Trust has to be earned, especially after institutional betrayal."
          ]
        },
        'shell-executive': {
          'climate': [
            "Shell knew about climate change for decades. Did you?",
            "How do you reconcile profit maximization with climate action?",
            "Corporate climate promises are often greenwashing. How is this different?"
          ],
          'corporate-accountability': [
            "Executives always claim they were just following the board. Were you?",
            "Corporate accountability means more than shareholder returns.",
            "How do we know this isn't just another corporate rebranding?"
          ]
        }
      };

      const bgReactions = reactionMap[this.backgroundId];
      if (bgReactions && bgReactions[topic]) {
        const reactions = bgReactions[topic];
        return reactions[Math.floor(Math.random() * reactions.length)];
      }
    }

    return null;
  }

  // Public interface methods
  processResponse(response: PlayerResponse): InterviewerReaction | null {
    // Record response in memory FIRST for future reference
    this.recordResponse(response);

    // Process enhanced mood progression
    const moodChange = this.processMoodProgression(response);

    // Process frustration escalation - Task 3.7
    const frustrationEvent = this.processFrustrationEscalation(response);

    // Process surprise/approval reactions - Task 3.8
    const surpriseEvent = this.detectSurpriseReaction(response);
    const approvalEvent = this.detectApprovalReaction(response);

    // Prioritize reactions: High surprise/approval > High frustration > Normal patterns
    
    // High-intensity surprise or approval reactions take priority
    if (surpriseEvent && surpriseEvent.intensity === 'high') {
      const surpriseReaction: InterviewerReaction = {
        type: 'surprise',
        intensity: surpriseEvent.intensity,
        message: surpriseEvent.message,
        newMood: this.getMoodForPositiveReaction('surprise')
      };
      this.recordSurpriseApprovalEvent(surpriseEvent);
      this.lastReaction = surpriseReaction;
      return surpriseReaction;
    }

    if (approvalEvent && approvalEvent.intensity === 'high') {
      const approvalReaction: InterviewerReaction = {
        type: 'approval',
        intensity: approvalEvent.intensity,
        message: approvalEvent.message,
        newMood: this.getMoodForPositiveReaction('approval')
      };
      this.recordSurpriseApprovalEvent(approvalEvent);
      this.lastReaction = approvalReaction;
      return approvalReaction;
    }

    // If frustration escalated significantly, prioritize frustration reaction
    if (frustrationEvent &&
        ['very-frustrated', 'losing-patience', 'explosive'].includes(frustrationEvent.newLevel)) {
      const frustrationReaction: InterviewerReaction = {
        type: 'interruption',
        intensity: 'high',
        message: frustrationEvent.interviewerReaction,
        newMood: this.getMoodForFrustrationLevel(frustrationEvent.newLevel)
      };
      this.lastReaction = frustrationReaction;
      return frustrationReaction;
    }

    // Medium-intensity surprise or approval reactions
    if (surpriseEvent && surpriseEvent.intensity === 'medium') {
      const surpriseReaction: InterviewerReaction = {
        type: 'surprise',
        intensity: surpriseEvent.intensity,
        message: surpriseEvent.message,
        newMood: this.getMoodForPositiveReaction('surprise')
      };
      this.recordSurpriseApprovalEvent(surpriseEvent);
      this.lastReaction = surpriseReaction;
      return surpriseReaction;
    }

    if (approvalEvent && approvalEvent.intensity === 'medium') {
      const approvalReaction: InterviewerReaction = {
        type: 'approval',
        intensity: approvalEvent.intensity,
        message: approvalEvent.message,
        newMood: this.getMoodForPositiveReaction('approval')
      };
      this.recordSurpriseApprovalEvent(approvalEvent);
      this.lastReaction = approvalReaction;
      return approvalReaction;
    }

    // Check if any reaction patterns match
    for (const pattern of this.reactionPatterns) {
      if (this.matchesPattern(pattern, response)) {
        const reaction = this.executeReaction(pattern.reaction);
        this.lastReaction = reaction;
        return reaction;
      }
    }

    // Low-intensity surprise or approval reactions (if no patterns matched)
    if (surpriseEvent && surpriseEvent.intensity === 'low') {
      const surpriseReaction: InterviewerReaction = {
        type: 'surprise',
        intensity: surpriseEvent.intensity,
        message: surpriseEvent.message,
        newMood: this.getMoodForPositiveReaction('surprise')
      };
      this.recordSurpriseApprovalEvent(surpriseEvent);
      this.lastReaction = surpriseReaction;
      return surpriseReaction;
    }

    if (approvalEvent && approvalEvent.intensity === 'low') {
      const approvalReaction: InterviewerReaction = {
        type: 'approval',
        intensity: approvalEvent.intensity,
        message: approvalEvent.message,
        newMood: this.getMoodForPositiveReaction('approval')
      };
      this.recordSurpriseApprovalEvent(approvalEvent);
      this.lastReaction = approvalReaction;
      return approvalReaction;
    }

    // If mild frustration escalation occurred, incorporate it into response
    if (frustrationEvent &&
        ['mildly-annoyed', 'frustrated'].includes(frustrationEvent.newLevel)) {
      const frustrationReaction: InterviewerReaction = {
        type: 'follow-up',
        intensity: 'medium',
        message: frustrationEvent.interviewerReaction,
        newMood: this.getMoodForFrustrationLevel(frustrationEvent.newLevel)
      };
      this.lastReaction = frustrationReaction;
      return frustrationReaction;
    }

    return null;
  }

  /**
   * Map frustration level to appropriate interviewer mood
   */
  private getMoodForFrustrationLevel(level: FrustrationLevel): InterviewerMood {
    const moodMap: Record<FrustrationLevel, InterviewerMood> = {
      'calm': 'professional',
      'mildly-annoyed': 'skeptical',
      'frustrated': 'frustrated',
      'very-frustrated': 'hostile',
      'losing-patience': 'hostile',
      'explosive': 'hostile'
    };
    return moodMap[level] || 'frustrated';
  }

  private matchesPattern(pattern: ReactionPattern, response: PlayerResponse): boolean {
    // Check if the trigger matches
    if (pattern.trigger !== response.tone && pattern.trigger !== 'contradiction' && pattern.trigger !== 'evasion') {
      return false;
    }

    // Check additional conditions
    for (const condition of pattern.conditions) {
      if (!this.evaluateCondition(condition, response)) {
        return false;
      }
    }

    return true;
  }

  private evaluateCondition(condition: string, response: PlayerResponse): boolean {
    if (condition.startsWith('mood:')) {
      const requiredMood = condition.slice(5) as InterviewerMood;
      return this.mood === requiredMood;
    }

    if (condition.startsWith('topic:')) {
      const requiredTopic = condition.slice(6);
      return response.topic === requiredTopic;
    }

    // Add more condition types as needed
    return true;
  }

  private executeReaction(reaction: InterviewerReaction): InterviewerReaction {
    // Update mood if specified
    if (reaction.newMood && reaction.newMood !== this.mood) {
      const oldMood = this.mood;
      this.mood = reaction.newMood;
      
      this.moodHistory.push({
        mood: this.mood,
        timestamp: Date.now(),
        trigger: `reaction-${reaction.type}`
      });
    }

    // Update memory based on reaction type
    if (reaction.type === 'mood-change') {
      if (reaction.newMood === 'frustrated') {
        this.memory.frustrationLevel = Math.min(100, this.memory.frustrationLevel + 20);
      } else if (reaction.newMood === 'sympathetic') {
        this.memory.approvalLevel = Math.min(100, this.memory.approvalLevel + 10);
      }
    }

    return reaction;
  }

  private getReactionIntensityScore(): number {
    return this.memory.frustrationLevel * 0.4 + (100 - this.memory.approvalLevel) * 0.3;
  }

  /**
   * Record a player response in memory for future reference
   */
  recordResponse(response: PlayerResponse): void {
    const { topic, responseText, tone, questionId } = response;

    // Store key statements by topic
    if (topic && responseText.length > 15) {
      const statements = this.memory.references.get('statements') as Map<string, string>;
      statements.set(topic, responseText);
    }

    // Record memorable quotes (confident or controversial statements)
    if ((tone === 'confident' || tone === 'confrontational') && responseText.length > 20) {
      const quotes = this.memory.references.get('quotes') as string[];
      quotes.push(`"${responseText.slice(0, 80)}${responseText.length > 80 ? '...' : ''}"`);
      if (quotes.length > 10) quotes.shift(); // Keep only recent quotes
    }

    // Track evasions for pattern references
    if (tone === 'evasive') {
      const evasions = this.memory.references.get('evasions') as Array<{questionId: string, topic?: string}>;
      evasions.push({ questionId, topic });
      if (evasions.length > 5) evasions.shift();
    }

    // Track strong/weak moments
    if (response.wordCount > 50 && (tone === 'confident' || tone === 'diplomatic')) {
      const strongMoments = this.memory.references.get('strong-moments') as string[];
      strongMoments.push(questionId);
    } else if (response.wordCount < 10 || tone === 'evasive') {
      const weakMoments = this.memory.references.get('weak-moments') as string[];
      weakMoments.push(questionId);
    }

    // Record contradictions
    if (response.contradictsPrevious) {
      const contradictions = this.memory.references.get('contradictions') as Array<{
        questionId: string,
        topic?: string,
        previousStatement?: string
      }>;

      const statements = this.memory.references.get('statements') as Map<string, string>;
      const previousStatement = topic ? statements.get(topic) : undefined;

      contradictions.push({
        questionId,
        topic,
        previousStatement
      });
    }

    this.updateMemory(`response-${questionId}`, responseText);
  }

  private updateMemory(key: string, value: string): void {
    this.memory.references.set(key, value);

    // Update emotional levels based on conversation content
    if (key.includes('contradiction')) {
      this.memory.frustrationLevel = Math.min(100, this.memory.frustrationLevel + 15);
    }

    if (key.includes('strong-moment')) {
      this.memory.approvalLevel = Math.min(100, this.memory.approvalLevel + 5);
    }
  }

  generateReference(topic: string): string {
    const statements = this.memory.references.get('statements') as Map<string, string>;
    const contradictions = this.memory.references.get('contradictions') as Array<any>;
    const quotes = this.memory.references.get('quotes') as string[];
    const evasions = this.memory.references.get('evasions') as Array<any>;

    // Check for previous statement on this topic
    const previousStatement = statements.get(topic);
    if (previousStatement) {
      return `Earlier you said "${previousStatement.slice(0, 60)}${previousStatement.length > 60 ? '...' : ''}" How does that square with this?`;
    }

    // Generate contradiction references
    const topicContradiction = contradictions.find(c => c.topic === topic);
    if (topicContradiction && topicContradiction.previousStatement) {
      return `Wait, you just contradicted yourself. You previously said "${topicContradiction.previousStatement.slice(0, 60)}..." Which position is correct?`;
    }

    // Reference pattern of evasions
    const topicEvasions = evasions.filter(e => e.topic === topic);
    if (topicEvasions.length >= 2) {
      return `This is the ${topicEvasions.length === 2 ? 'second' : 'third'} time you've avoided answering about ${topic}. Why won't you give a straight answer?`;
    }

    // Use memorable quotes for pressure
    if (quotes.length > 0 && Math.random() < 0.3) {
      const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
      return `You seemed so confident when you said ${randomQuote}. What's different now?`;
    }

    return '';
  }

  /**
   * Generate contextual follow-up based on memory
   */
  generateContextualFollowUp(response: PlayerResponse): string | null {
    const { topic, tone, questionId } = response;
    const statements = this.memory.references.get('statements') as Map<string, string>;
    const weakMoments = this.memory.references.get('weak-moments') as string[];
    const strongMoments = this.memory.references.get('strong-moments') as string[];

    // If they gave a strong answer, challenge with previous weak moment
    if (tone === 'confident' && weakMoments.length > 0) {
      return `You sound confident now, but you seemed uncertain when I asked about other issues. What's changed?`;
    }

    // If they're being evasive, contrast with a previous confident statement
    if (tone === 'evasive' && strongMoments.length > 0) {
      return `You were articulate earlier, why the vague answer now? What are you not telling us?`;
    }

    // Reference their expertise against current evasion
    if (topic && tone === 'evasive') {
      const expertiseMap: Record<string, string[]> = {
        'financial-analyst': ['economy', 'housing', 'taxation'],
        'environmental-activist': ['climate', 'energy', 'sustainability'],
        'toeslagenaffaire-whistleblower': ['welfare', 'government', 'accountability'],
        'tech-entrepreneur': ['innovation', 'digital', 'economy'],
        'academic-researcher': ['education', 'research', 'policy']
      };

      const expertise = expertiseMap[this.backgroundId] || [];
      if (expertise.includes(topic)) {
        return `This should be your area of expertise. Why are you being so vague?`;
      }
    }

    return null;
  }

  /**
   * Generate accountability pressure based on memory patterns
   */
  generateAccountabilityChallenge(): string | null {
    const contradictions = this.memory.references.get('contradictions') as Array<any>;
    const evasions = this.memory.references.get('evasions') as Array<any>;
    const weakMoments = this.memory.references.get('weak-moments') as string[];

    const totalProblems = contradictions.length + evasions.length + weakMoments.length;

    if (totalProblems >= 3) {
      const challenges = [
        `You've contradicted yourself, evaded questions, and given weak answers. How can voters trust you?`,
        `I count multiple contradictions and evasions tonight. Is this how you'll govern?`,
        `Your track record in this interview raises serious questions about your reliability.`,
        `Politicians promise accountability, but you can't even be accountable in this interview.`
      ];

      return challenges[Math.floor(Math.random() * challenges.length)];
    }

    return null;
  }

  /**
   * Get memory statistics for analysis
   */
  getMemoryStats(): {
    totalStatements: number;
    contradictions: number;
    evasions: number;
    strongMoments: number;
    weakMoments: number;
    quotes: number;
  } {
    const statements = this.memory.references.get('statements') as Map<string, string>;
    const contradictions = this.memory.references.get('contradictions') as Array<any>;
    const evasions = this.memory.references.get('evasions') as Array<any>;
    const strongMoments = this.memory.references.get('strong-moments') as string[];
    const weakMoments = this.memory.references.get('weak-moments') as string[];
    const quotes = this.memory.references.get('quotes') as string[];

    return {
      totalStatements: statements.size,
      contradictions: contradictions.length,
      evasions: evasions.length,
      strongMoments: strongMoments.length,
      weakMoments: weakMoments.length,
      quotes: quotes.length
    };
  }

  // Interruption system
  shouldInterrupt(response: PlayerResponse): boolean {
    const approach = (this as any).backgroundApproach as BackgroundApproach;
    if (!approach) return false;

    // Background-specific interruption logic
    if (response.tone === 'evasive' && Math.random() < (1 - approach.interruptionThreshold)) {
      return true;
    }

    if (response.wordCount > 100 && approach.followUpTendency > 0.7) {
      return Math.random() < 0.3;
    }

    return false;
  }

  generateInterruption(response: PlayerResponse): string {
    const approach = (this as any).backgroundApproach as BackgroundApproach;
    
    // Try to get contextual reaction first
    if (response.topic) {
      const contextual = this.getContextualReaction(response.topic, response.tone);
      if (contextual) return contextual;
    }

    // Default interruptions based on questioning style
    const interruptions: Record<string, string[]> = {
      'confrontational-accountability': [
        "Stop right there. That's not taking responsibility.",
        "You're evading again. Answer the question.",
        "The victims deserve better than these excuses."
      ],
      'environmental-justice': [
        "Corporate speak won't save the planet.",
        "That sounds like the same greenwashing Shell always used.",
        "Climate action requires more than words."
      ],
      'practical-exploration': [
        "Let's keep this practical. How would this actually work?",
        "That's good in theory, but what about implementation?",
        "Business experience should translate to concrete solutions."
      ]
    };

    const styleInterruptions = interruptions[approach.questioningStyle] || [
      "Could you be more specific?",
      "That doesn't really answer the question.",
      "Let's focus on the substance."
    ];

    return styleInterruptions[Math.floor(Math.random() * styleInterruptions.length)];
  }

  // Getters for UI
  getMood(): InterviewerMood {
    return this.mood;
  }

  getLastReaction(): InterviewerReaction | null {
    return this.lastReaction;
  }

  getFrustrationLevel(): number {
    return this.memory.frustrationLevel;
  }

  getApprovalLevel(): number {
    return this.memory.approvalLevel;
  }

  getSurpriseLevel(): number {
    return this.memory.surpriseLevel;
  }

  getMoodHistory(): Array<{ mood: InterviewerMood; timestamp: number; trigger: string }> {
    return [...this.moodHistory];
  }

  // Overall assessment for aftermath generation
  /**
   * Initialize Surprise/Approval System - Task 3.8
   */
  private initializeSurpriseApprovalSystem(): SurpriseApprovalSystem {
    return {
      surpriseDetectors: [
        {
          type: 'unexpected-expertise',
          patterns: [
            /technical|technical details|implementation|architecture|specific numbers|data/i,
            /\b\d+%|\b\d+\.\d+|\bexactly\b|\bprecisely\b/i
          ],
          minWordCount: 25,
          conditions: ['detailed_knowledge', 'specific_data']
        },
        {
          type: 'authentic-vulnerability',
          patterns: [
            /honest|honestly|admit|mistake|wrong|failed|struggle|difficult/i,
            /personal|family|affected me|learned from|changed my mind/i
          ],
          minWordCount: 15,
          conditions: ['personal_admission', 'emotional_honesty']
        },
        {
          type: 'unexpected-wit',
          patterns: [
            /\bhaha\b|\bhehe\b|clever|witty|ironic|paradox/i,
            /metaphor|analogy|like saying|imagine if/i
          ],
          minWordCount: 10,
          conditions: ['humor_present', 'creative_expression']
        },
        {
          type: 'sophisticated-nuance',
          patterns: [
            /however|but also|on the other hand|both.*and|complex|nuanced/i,
            /depends on|context|situation|balance|trade.?off/i
          ],
          minWordCount: 20,
          conditions: ['acknowledges_complexity', 'multiple_perspectives']
        },
        {
          type: 'unexpected-passion',
          patterns: [
            /deeply|passionate|care about|matters to me|fight for|believe/i,
            /!\s*[A-Z]|!!|absolutely|fundamentally|essential/i
          ],
          minWordCount: 15,
          conditions: ['emotional_intensity', 'strong_conviction']
        },
        {
          type: 'disarming-honesty',
          patterns: [
            /don't know|not sure|haven't figured out|still learning/i,
            /good question|you're right|fair point|I see what you mean/i
          ],
          minWordCount: 8,
          conditions: ['intellectual_humility', 'openness_to_challenge']
        },
        {
          type: 'strategic-insight',
          patterns: [
            /long.?term|strategy|systematic|root cause|underlying/i,
            /if we.*then|this leads to|ripple effect|unintended consequence/i
          ],
          minWordCount: 20,
          conditions: ['strategic_thinking', 'systems_perspective']
        },
        {
          type: 'moral-clarity',
          patterns: [
            /right thing|principle|values|ethics|moral|justice/i,
            /regardless of.*cost|even if.*unpopular|stand for/i
          ],
          minWordCount: 15,
          conditions: ['clear_values', 'principled_stance']
        }
      ],
      approvalDetectors: [
        {
          type: 'principled-stance',
          patterns: [
            /principle|values|believe|stand for|conviction|moral/i,
            /regardless of.*pressure|even if.*difficult|right thing/i
          ],
          minWordCount: 20,
          conditions: ['clear_principles', 'unwavering_stance']
        },
        {
          type: 'thoughtful-nuance',
          patterns: [
            /complex|nuanced|both.*and|depends|context|balance/i,
            /trade.?off|consider|multiple.*factor|various.*perspective/i
          ],
          minWordCount: 25,
          conditions: ['sophisticated_analysis', 'multiple_considerations']
        },
        {
          type: 'practical-wisdom',
          patterns: [
            /realistic|practical|feasible|workable|experience shows/i,
            /in practice|real world|what actually works|evidence suggests/i
          ],
          minWordCount: 20,
          conditions: ['pragmatic_approach', 'evidence_based']
        },
        {
          type: 'authentic-emotion',
          patterns: [
            /personal|family|affected|touched|moved|inspired/i,
            /care deeply|matters to me|seen firsthand|experienced/i
          ],
          minWordCount: 15,
          conditions: ['personal_connection', 'emotional_authenticity']
        },
        {
          type: 'intellectual-courage',
          patterns: [
            /unpopular|difficult|challenge|question|reconsider/i,
            /even though|despite.*pressure|willing to.*examine/i
          ],
          minWordCount: 18,
          conditions: ['challenges_orthodoxy', 'independent_thinking']
        },
        {
          type: 'empathetic-insight',
          patterns: [
            /understand|perspective|feel|struggle|difficult for/i,
            /put myself|imagine|empathize|relate to|see how/i
          ],
          minWordCount: 15,
          conditions: ['shows_empathy', 'multiple_perspectives']
        },
        {
          type: 'collaborative-spirit',
          patterns: [
            /work together|collaborate|find.*solution|bridge|common ground/i,
            /we can|let's.*find|together we|build consensus/i
          ],
          minWordCount: 12,
          conditions: ['seeks_cooperation', 'solution_oriented']
        },
        {
          type: 'informed-expertise',
          patterns: [
            /research shows|studies indicate|data suggests|evidence/i,
            /expert|specialist|analysis|thorough.*examination/i
          ],
          minWordCount: 20,
          conditions: ['cites_evidence', 'demonstrates_knowledge']
        }
      ],
      reactionMessages: {
        'unexpected-expertise': [
          "Well, that's... surprisingly detailed. You've clearly done your homework.",
          "I wasn't expecting that level of technical knowledge. Interesting.",
          "That's a much more sophisticated answer than I anticipated."
        ],
        'authentic-vulnerability': [
          "That's... refreshingly honest. Most politicians wouldn't admit that.",
          "I appreciate that candor. That's not what I usually hear in these interviews.",
          "Well, that's unexpected. Thank you for being so direct about it."
        ],
        'unexpected-wit': [
          "Ha! That's... actually quite clever. I wasn't expecting that.",
          "Well played. That's a refreshing way to put it.",
          "I have to admit, that's a pretty good analogy."
        ],
        'sophisticated-nuance': [
          "That's a more nuanced position than I expected. Interesting.",
          "You're acknowledging the complexity here. That's... refreshing.",
          "Most people give me black and white answers. This is more thoughtful."
        ],
        'unexpected-passion': [
          "I can see this really matters to you. That's... compelling.",
          "There's real conviction behind that answer. I wasn't expecting that intensity.",
          "Your passion on this issue is quite evident. And convincing."
        ],
        'disarming-honesty': [
          "That's... surprisingly candid. I respect that honesty.",
          "Well, at least you're being straight with me. That's rare.",
          "I appreciate you not trying to bluff your way through that."
        ],
        'strategic-insight': [
          "That's... actually quite insightful. You're thinking systematically about this.",
          "I'm impressed by that strategic perspective. Most miss those connections.",
          "That shows real understanding of the broader implications."
        ],
        'moral-clarity': [
          "That's a clear moral position. I respect that kind of clarity.",
          "You're willing to take a stand on principle. That's... admirable.",
          "I can see where you draw your ethical lines. That's refreshing."
        ],
        'principled-stance': [
          "I respect that principled position, even if I might disagree.",
          "That's a clear stance based on your values. I can appreciate that.",
          "You're willing to stand by your convictions. That's admirable."
        ],
        'thoughtful-nuance': [
          "That's exactly the kind of thoughtful analysis this issue deserves.",
          "I'm impressed by how thoroughly you've considered the trade-offs.",
          "That nuanced understanding is exactly what we need more of."
        ],
        'practical-wisdom': [
          "That's pragmatic thinking. I appreciate the realistic approach.",
          "You understand how things actually work. That's valuable perspective.",
          "That's the kind of practical wisdom that makes good policy."
        ],
        'authentic-emotion': [
          "I can see this issue touches you personally. That authenticity is powerful.",
          "Thank you for sharing that personal connection. It adds real weight.",
          "That personal experience brings important perspective to this debate."
        ],
        'intellectual-courage': [
          "That takes intellectual courage to challenge conventional thinking.",
          "I respect your willingness to question popular assumptions.",
          "That's brave thinking. Not everyone is willing to examine difficult questions."
        ],
        'empathetic-insight': [
          "You clearly understand multiple perspectives on this. That's valuable.",
          "I appreciate how you're considering different viewpoints here.",
          "That empathetic understanding is exactly what this debate needs."
        ],
        'collaborative-spirit': [
          "That collaborative approach is refreshing in today's political climate.",
          "I appreciate your focus on finding common ground.",
          "That solution-oriented thinking is what we need more of."
        ],
        'informed-expertise': [
          "You clearly know your subject matter. That expertise shows.",
          "I'm impressed by the depth of your knowledge on this issue.",
          "That evidence-based approach is exactly what good policy requires."
        ]
      }
    };
  }

  /**
   * Detect surprise reactions in player responses
   */
  private detectSurpriseReaction(response: PlayerResponse): SurpriseApprovalEvent | null {
    for (const detector of this.surpriseApprovalSystem.surpriseDetectors) {
      // Check word count threshold
      if (response.wordCount < detector.minWordCount) continue;

      // Check if any patterns match
      const patternMatches = detector.patterns.some(pattern => 
        pattern.test(response.responseText)
      );

      if (!patternMatches) continue;

      // Check additional conditions
      const conditionsMet = this.evaluateSurpriseConditions(detector.conditions, response);
      if (!conditionsMet) continue;

      // Generate surprise event
      const messages = this.surpriseApprovalSystem.reactionMessages[detector.type];
      const randomMessage = messages[Math.floor(Math.random() * messages.length)];

      return {
        type: 'surprise',
        subtype: detector.type,
        intensity: this.calculateSurpriseIntensity(detector.type, response),
        message: randomMessage,
        timestamp: Date.now(),
        triggeredBy: response.questionId
      };
    }

    return null;
  }

  /**
   * Detect approval reactions in player responses
   */
  private detectApprovalReaction(response: PlayerResponse): SurpriseApprovalEvent | null {
    for (const detector of this.surpriseApprovalSystem.approvalDetectors) {
      // Check word count threshold
      if (response.wordCount < detector.minWordCount) continue;

      // Check if any patterns match
      const patternMatches = detector.patterns.some(pattern => 
        pattern.test(response.responseText)
      );

      if (!patternMatches) continue;

      // Check additional conditions
      const conditionsMet = this.evaluateApprovalConditions(detector.conditions, response);
      if (!conditionsMet) continue;

      // Generate approval event
      const messages = this.surpriseApprovalSystem.reactionMessages[detector.type];
      const randomMessage = messages[Math.floor(Math.random() * messages.length)];

      return {
        type: 'approval',
        subtype: detector.type,
        intensity: this.calculateApprovalIntensity(detector.type, response),
        message: randomMessage,
        timestamp: Date.now(),
        triggeredBy: response.questionId
      };
    }

    return null;
  }

  /**
   * Evaluate surprise-specific conditions
   */
  private evaluateSurpriseConditions(conditions: string[], response: PlayerResponse): boolean {
    return conditions.every(condition => {
      switch (condition) {
        case 'detailed_knowledge':
          return /specific|exact|precisely|technical|data|research|study|analysis/i.test(response.responseText);
        case 'specific_data':
          return /\d+|\bpercent\b|\brate\b|\bstatistic\b|\bevidence\b/i.test(response.responseText);
        case 'personal_admission':
          return /I|my|me|personal|family|own/i.test(response.responseText);
        case 'emotional_honesty':
          return /feel|felt|emotion|struggle|difficult|challenge/i.test(response.responseText);
        case 'humor_present':
          return /\bhaha\b|\bhehe\b|funny|ironic|amusing|clever/i.test(response.responseText);
        case 'creative_expression':
          return /like|metaphor|analogy|imagine|picture|example/i.test(response.responseText);
        case 'acknowledges_complexity':
          return /complex|complicated|nuanced|both|however|but/i.test(response.responseText);
        case 'multiple_perspectives':
          return /perspective|viewpoint|side|angle|different|various/i.test(response.responseText);
        case 'emotional_intensity':
          return /!|passionate|deeply|strongly|absolutely|essential/i.test(response.responseText);
        case 'strong_conviction':
          return /believe|conviction|principle|stand|fight|defend/i.test(response.responseText);
        case 'intellectual_humility':
          return /don't know|not sure|uncertain|learning|figuring/i.test(response.responseText);
        case 'openness_to_challenge':
          return /good point|you're right|fair|understand|see|consider/i.test(response.responseText);
        case 'strategic_thinking':
          return /strategy|long.?term|plan|system|structure|consequence/i.test(response.responseText);
        case 'systems_perspective':
          return /connect|relationship|impact|effect|influence|ripple/i.test(response.responseText);
        case 'clear_values':
          return /value|principle|ethic|moral|right|wrong|justice/i.test(response.responseText);
        case 'principled_stance':
          return /stand|principle|conviction|believe|value|moral/i.test(response.responseText);
        default:
          return true;
      }
    });
  }

  /**
   * Evaluate approval-specific conditions
   */
  private evaluateApprovalConditions(conditions: string[], response: PlayerResponse): boolean {
    return conditions.every(condition => {
      switch (condition) {
        case 'clear_principles':
          return /principle|value|conviction|believe|stand|moral/i.test(response.responseText);
        case 'unwavering_stance':
          return /regardless|even if|despite|stand firm|won't change/i.test(response.responseText);
        case 'sophisticated_analysis':
          return /analysis|consider|factor|aspect|element|component/i.test(response.responseText);
        case 'multiple_considerations':
          return /multiple|various|different|several|many|range/i.test(response.responseText);
        case 'pragmatic_approach':
          return /practical|realistic|feasible|workable|viable|doable/i.test(response.responseText);
        case 'evidence_based':
          return /evidence|data|research|study|fact|proof|show/i.test(response.responseText);
        case 'personal_connection':
          return /personal|family|my|I|me|own|experience|lived/i.test(response.responseText);
        case 'emotional_authenticity':
          return /feel|emotion|touch|move|affect|impact|matter/i.test(response.responseText);
        case 'challenges_orthodoxy':
          return /challenge|question|rethink|reconsider|different|alternative/i.test(response.responseText);
        case 'independent_thinking':
          return /think|believe|consider|opinion|view|perspective/i.test(response.responseText);
        case 'shows_empathy':
          return /understand|feel|empathize|relate|connect|compassion/i.test(response.responseText);
        case 'seeks_cooperation':
          return /together|collaborate|work with|partner|unite|join/i.test(response.responseText);
        case 'solution_oriented':
          return /solution|solve|fix|address|resolve|answer/i.test(response.responseText);
        case 'cites_evidence':
          return /research|study|data|evidence|fact|statistic|analysis/i.test(response.responseText);
        case 'demonstrates_knowledge':
          return /know|understand|expertise|experience|familiar|aware/i.test(response.responseText);
        default:
          return true;
      }
    });
  }

  /**
   * Calculate surprise intensity based on type and response characteristics
   */
  private calculateSurpriseIntensity(type: SurpriseType, response: PlayerResponse): 'low' | 'medium' | 'high' {
    let baseIntensity = 'medium' as 'low' | 'medium' | 'high';

    // High surprise types
    if (['unexpected-expertise', 'strategic-insight', 'moral-clarity'].includes(type)) {
      baseIntensity = 'high';
    }
    
    // Low surprise types
    if (['disarming-honesty', 'unexpected-wit'].includes(type)) {
      baseIntensity = 'low';
    }

    // Adjust based on response characteristics
    if (response.wordCount > 50) {
      baseIntensity = baseIntensity === 'low' ? 'medium' : 'high';
    }

    if (response.tone === 'confident' || response.tone === 'passionate') {
      baseIntensity = baseIntensity === 'low' ? 'medium' : 'high';
    }

    return baseIntensity;
  }

  /**
   * Calculate approval intensity based on type and response characteristics
   */
  private calculateApprovalIntensity(type: ApprovalType, response: PlayerResponse): 'low' | 'medium' | 'high' {
    let baseIntensity = 'medium' as 'low' | 'medium' | 'high';

    // High approval types
    if (['principled-stance', 'intellectual-courage', 'informed-expertise'].includes(type)) {
      baseIntensity = 'high';
    }
    
    // Low approval types  
    if (['collaborative-spirit', 'empathetic-insight'].includes(type)) {
      baseIntensity = 'low';
    }

    // Adjust based on response characteristics
    if (response.wordCount > 40) {
      baseIntensity = baseIntensity === 'low' ? 'medium' : 'high';
    }

    if (response.tone === 'principled' || response.tone === 'passionate') {
      baseIntensity = baseIntensity === 'low' ? 'medium' : 'high';
    }

    return baseIntensity;
  }

  /**
   * Record surprise/approval events in enhanced memory
   */
  private recordSurpriseApprovalEvent(event: SurpriseApprovalEvent): void {
    if (!this.enhancedMemory.surpriseApprovalHistory) {
      this.enhancedMemory.surpriseApprovalHistory = [];
    }
    
    this.enhancedMemory.surpriseApprovalHistory.push(event);

    // Update approval/surprise levels in memory
    if (event.type === 'surprise') {
      this.memory.surpriseLevel = Math.min(100, this.memory.surpriseLevel + 10);
    } else if (event.type === 'approval') {
      this.memory.approvalLevel = Math.min(100, this.memory.approvalLevel + 15);
    }

    // Limit history to last 20 events for performance
    if (this.enhancedMemory.surpriseApprovalHistory.length > 20) {
      this.enhancedMemory.surpriseApprovalHistory = this.enhancedMemory.surpriseApprovalHistory.slice(-20);
    }
  }

  /**
   * Get appropriate mood for positive reactions
   */
  private getMoodForPositiveReaction(reactionType: 'surprise' | 'approval'): InterviewerMood {
    if (reactionType === 'surprise') {
      return 'surprised';
    } else if (reactionType === 'approval') {
      return 'approving';
    }
    return this.mood; // fallback to current mood
  }

  /**
   * Get current surprise/approval state for UI
   */
  getSurpriseApprovalState(): {
    surpriseLevel: number;
    approvalLevel: number;
    recentEvents: SurpriseApprovalEvent[];
    dominantType: 'surprise' | 'approval' | 'neutral';
  } {
    const recentEvents = this.enhancedMemory.surpriseApprovalHistory?.slice(-5) || [];
    
    // Determine dominant reaction type from recent events
    const surpriseCount = recentEvents.filter(e => e.type === 'surprise').length;
    const approvalCount = recentEvents.filter(e => e.type === 'approval').length;
    
    let dominantType: 'surprise' | 'approval' | 'neutral' = 'neutral';
    if (surpriseCount > approvalCount) {
      dominantType = 'surprise';
    } else if (approvalCount > surpriseCount) {
      dominantType = 'approval';
    }

    return {
      surpriseLevel: this.memory.surpriseLevel,
      approvalLevel: this.memory.approvalLevel,
      recentEvents,
      dominantType
    };
  }

  getOverallAssessment(): {
    mood: InterviewerMood;
    frustration: number;
    approval: number;
    dominant_reaction: string;
  } {
    return {
      mood: this.mood,
      frustration: this.memory.frustrationLevel,
      approval: this.memory.approvalLevel,
      dominant_reaction: this.lastReaction?.type || 'neutral'
    };
  }
}