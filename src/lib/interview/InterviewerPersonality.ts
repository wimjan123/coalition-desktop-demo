/**
 * Dynamic Interviewer Personality System
 * Manages interviewer mood, reactions, and memory
 */

import type {
  InterviewerType,
  InterviewerMood,
  PlayerResponse,
  MoodChange,
  InterviewerReaction,
  ReactionPattern,
  InterviewerMemory
} from '../types/interview.js';

/**
 * Dynamic Interviewer Personality System
 * Manages interviewer mood, reactions, and memory
 */

import type {
  InterviewerType,
  InterviewerMood,
  PlayerResponse,
  MoodChange,
  InterviewerReaction,
  ReactionPattern,
  InterviewerMemory,
  BackgroundApproach
} from '../types/interview.js';

/**
 * Dynamic Interviewer Personality System
 * Manages interviewer mood, reactions, and memory
 */

import type {
  InterviewerType,
  InterviewerMood,
  PlayerResponse,
  MoodChange,
  InterviewerReaction,
  ReactionPattern,
  InterviewerMemory,
  BackgroundApproach
} from '../types/interview.js';

/**
 * Dynamic Interviewer Personality System
 * Manages interviewer mood, reactions, and memory
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
  MoodTransition
} from '../types/interview.js';

/**
 * Dynamic Interviewer Personality System
 * Manages interviewer mood, reactions, and memory
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
  MoodTransition
} from '../types/interview.js';

export class InterviewerPersonality {
  private type: InterviewerType;
  private mood: InterviewerMood;
  private backgroundId: string;
  private memory: InterviewerMemory;
  private reactionPatterns: ReactionPattern[];
  private lastReaction: InterviewerReaction | null = null;
  private moodHistory: Array<{ mood: InterviewerMood; timestamp: number; trigger: string }>;

  constructor(type: InterviewerType, backgroundId: string) {
    this.type = type;
    this.backgroundId = backgroundId;
    this.mood = 'neutral';
    this.initializeMemory();
    this.initializeReactionPatterns();
    this.applyBackgroundPersonality(); // Apply background-specific adaptations
    this.initializeMoodProgression(); // Initialize enhanced mood progression system
    this.moodHistory = [{
      mood: 'neutral',
      timestamp: Date.now(),
      trigger: 'interview-start'
    }];
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
      
      // From professional
      { from: 'professional', to: 'skeptical', minIntensity: 35, transitionSpeed: 'gradual', visualCue: 'frown-slight' },
      { from: 'professional', to: 'excited', minIntensity: 45, transitionSpeed: 'gradual', visualCue: 'smile-interest' },
      { from: 'professional', to: 'frustrated', minIntensity: 50, transitionSpeed: 'gradual', visualCue: 'sigh-disappointment' },
      
      // From skeptical
      { from: 'skeptical', to: 'frustrated', minIntensity: 40, transitionSpeed: 'gradual', visualCue: 'eyes-narrow' },
      { from: 'skeptical', to: 'hostile', minIntensity: 70, transitionSpeed: 'instant', visualCue: 'scowl-deep' },
      { from: 'skeptical', to: 'professional', minIntensity: 25, transitionSpeed: 'slow', visualCue: 'expression-soften' },
      
      // From excited
      { from: 'excited', to: 'professional', minIntensity: 20, transitionSpeed: 'gradual', visualCue: 'settle-back' },
      { from: 'excited', to: 'frustrated', minIntensity: 60, transitionSpeed: 'instant', visualCue: 'disappointment-sharp' },
      
      // From frustrated
      { from: 'frustrated', to: 'hostile', minIntensity: 60, transitionSpeed: 'gradual', visualCue: 'anger-build' },
      { from: 'frustrated', to: 'skeptical', minIntensity: 30, transitionSpeed: 'slow', visualCue: 'calm-down' },
      { from: 'frustrated', to: 'sympathetic', minIntensity: 50, transitionSpeed: 'instant', visualCue: 'surprise-soften' },
      
      // From hostile
      { from: 'hostile', to: 'frustrated', minIntensity: 40, transitionSpeed: 'slow', visualCue: 'rage-subside' },
      { from: 'hostile', to: 'sympathetic', minIntensity: 70, transitionSpeed: 'instant', visualCue: 'shock-pivot' },
      
      // From sympathetic
      { from: 'sympathetic', to: 'professional', minIntensity: 30, transitionSpeed: 'gradual', visualCue: 'warmth-maintain' },
      { from: 'sympathetic', to: 'frustrated', minIntensity: 50, transitionSpeed: 'gradual', visualCue: 'sympathy-fade' }
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

    // Check if any reaction patterns match
    for (const pattern of this.reactionPatterns) {
      if (this.matchesPattern(pattern, response)) {
        const reaction = this.executeReaction(pattern.reaction);
        this.lastReaction = reaction;
        return reaction;
      }
    }
    return null;
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