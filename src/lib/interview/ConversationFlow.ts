/**
 * Conversation Flow Engine
 * Manages dynamic conversation flow with interruptions, follow-ups, and adaptive questioning
 */

import type {
  ConversationAction,
  PlayerResponse,
  ConversationState,
  DynamicQuestion,
  QuestionArc,
  Interruption,
  FollowUpRule,
  InterruptionTrigger,
  RapidFireSession,
  RapidFireQuestion,
  RapidFireTrigger,
  RapidFireConfig
} from '../types/interview.js';

import type { InterviewerPersonality } from './InterviewerPersonality.js';

export class ConversationFlow {
  private personality: InterviewerPersonality;
  private questionArc: QuestionArc;
  private interruptionHistory: string[] = [];
  private followUpQueue: string[] = [];
  private evasionCounter: number = 0;
  private lastResponseWordCount: number = 0;
  private topicEvasionMap: Map<string, number> = new Map();
  private rapidFireSession: RapidFireSession | null = null;
  private lastRapidFireTime: number = 0;
  private rapidFireConfig: RapidFireConfig;

  constructor(personality: InterviewerPersonality, questionArc: QuestionArc) {
    this.personality = personality;
    this.questionArc = questionArc;
    this.rapidFireConfig = this.initializeRapidFireConfig();
  }

  /**
   * Determine the next conversation action based on player response
   */
  determineNextAction(playerResponse: PlayerResponse, state: ConversationState): ConversationAction {
    // 0. Handle rapid-fire session (highest priority when active)
    if (this.rapidFireSession?.isActive) {
      return this.handleRapidFireSession(playerResponse, state);
    }

    // 1. Check for immediate interruptions (highest priority)
    const interruption = this.checkForInterruption(playerResponse, state);
    if (interruption) {
      this.interruptionHistory.push(playerResponse.questionId);
      return interruption;
    }

    // 2. Check for rapid-fire triggers (before memory follow-ups)
    const rapidFireTrigger = this.checkForRapidFireTrigger(playerResponse, state);
    if (rapidFireTrigger) {
      this.startRapidFireSession(rapidFireTrigger, playerResponse, state);
      return this.handleRapidFireSession(playerResponse, state);
    }

    // 3. Check for memory-based follow-ups (high priority)
    const memoryFollowUp = this.checkForMemoryBasedFollowUp(playerResponse, state);
    if (memoryFollowUp) {
      return memoryFollowUp;
    }

    // 4. Check for rapid follow-ups based on response content
    const followUp = this.checkForFollowUp(playerResponse, state);
    if (followUp) {
      return followUp;
    }

    // 5. Check for contradiction challenges
    const contradictionChallenge = this.checkForContradictionChallenge(playerResponse, state);
    if (contradictionChallenge) {
      return contradictionChallenge;
    }

    // 6. Check if we should conclude the interview
    if (this.shouldConclude(state)) {
      return this.generateConclusion(state);
    }

    // 7. Progress to next planned question
    return this.getNextPlannedQuestion(state);
  }

  /**
   * Check for memory-based follow-ups using interviewer's sophisticated memory
   */
  private checkForMemoryBasedFollowUp(response: PlayerResponse, state: ConversationState): ConversationAction | null {
    // Use interviewer's contextual memory system
    const contextualFollowUp = this.personality.generateContextualFollowUp(response);
    if (contextualFollowUp) {
      return {
        type: 'follow-up',
        content: contextualFollowUp,
        metadata: {
          trigger: 'memory-based',
          responseLength: response.wordCount,
          responseTone: response.tone,
          memoryStats: this.personality.getMemoryStats()
        }
      };
    }

    // Check for accountability challenges
    const accountabilityChallenge = this.personality.generateAccountabilityChallenge();
    if (accountabilityChallenge && Math.random() < 0.7) { // 70% chance to use accountability challenge
      return {
        type: 'follow-up',
        content: accountabilityChallenge,
        metadata: {
          trigger: 'accountability-pattern',
          severity: 'high',
          memoryStats: this.personality.getMemoryStats()
        }
      };
    }

    // Use memory reference for topic-specific follow-ups
    if (response.topic) {
      const memoryReference = this.personality.generateReference(response.topic);
      if (memoryReference && Math.random() < 0.6) { // 60% chance to use memory reference
        return {
          type: 'follow-up',
          content: memoryReference,
          metadata: {
            trigger: 'memory-reference',
            topic: response.topic,
            referenceType: 'topic-specific'
          }
        };
      }
    }

    return null;
  }

  /**
   * Check if interviewer should interrupt based on response
   */
  private checkForInterruption(response: PlayerResponse, state: ConversationState): Interruption | null {
    const currentQuestion = this.getCurrentQuestion(response.questionId);
    if (!currentQuestion) return null;

    // Update evasion tracking
    this.updateEvasionTracking(response);

    // Check for advanced evasion patterns first (highest priority)
    const evasionInterruption = this.checkForEvasionPatterns(response, state);
    if (evasionInterruption) {
      this.interruptionHistory.push(response.questionId);
      return evasionInterruption;
    }

    // Check question-specific interruption triggers
    for (const trigger of currentQuestion.interruptionTriggers) {
      if (this.evaluateInterruptionTrigger(trigger, response, state)) {
        return {
          type: 'interruption',
          content: trigger.message,
          metadata: {
            trigger: trigger.condition,
            followUpAction: trigger.followUpAction
          }
        };
      }
    }

    // Check personality-based interruption (enhanced with mood awareness)
    if (this.personality.shouldInterrupt(response)) {
      const interrupterMood = this.personality.getMood();
      const intensifiedMessage = this.intensifyInterruptionByMood(
        this.personality.generateInterruption(response),
        interrupterMood
      );

      return {
        type: 'interruption',
        content: intensifiedMessage,
        metadata: {
          trigger: 'personality-based',
          tone: response.tone,
          interviewerMood: interrupterMood,
          evasionCount: this.evasionCounter
        }
      };
    }

    return null;
  }

  /**
   * Check for immediate follow-up questions
   */
  private checkForFollowUp(response: PlayerResponse, state: ConversationState): ConversationAction | null {
    const currentQuestion = this.getCurrentQuestion(response.questionId);
    if (!currentQuestion) return null;

    // Evaluate follow-up rules for current question
    for (const rule of currentQuestion.followUpRules) {
      if (this.evaluateFollowUpCondition(rule.if, response, state)) {
        const probability = rule.probability || 1;
        if (Math.random() < probability) {
          // Check if 'then' refers to a specific question
          const followUpQuestion = this.questionArc.questions.find(q => q.id === rule.then);
          if (followUpQuestion) {
            return {
              type: 'question',
              content: followUpQuestion.question,
              metadata: {
                questionId: followUpQuestion.id,
                setup: followUpQuestion.setup,
                isFollowUp: true,
                triggeredBy: rule.if
              }
            };
          }

          // Otherwise, generate a dynamic follow-up
          return this.generateDynamicFollowUp(rule.then, response, state);
        }
      }
    }

    return null;
  }

  /**
   * Check for contradiction challenges
   */
  private checkForContradictionChallenge(response: PlayerResponse, state: ConversationState): ConversationAction | null {
    if (!response.contradictsPrevious) return null;

    // Find the contradicting response
    const contradictingResponse = state.playerResponses.find(r =>
      r.topic === response.topic && r.questionId !== response.questionId
    );

    if (!contradictingResponse) return null;

    // Use interviewer's sophisticated memory for reference generation
    const memoryReference = this.personality.generateReference(response.topic || '');
    const contextualFollowUp = this.personality.generateContextualFollowUp(response);
    const accountabilityChallenge = this.personality.generateAccountabilityChallenge();

    // Prioritize memory-based challenges
    let challengeText = memoryReference;
    if (!challengeText && contextualFollowUp) {
      challengeText = contextualFollowUp;
    }
    if (!challengeText && accountabilityChallenge) {
      challengeText = accountabilityChallenge;
    }
    if (!challengeText) {
      challengeText = `That seems to contradict your earlier position. Can you clarify?`;
    }

    return {
      type: 'contradiction-challenge',
      content: challengeText,
      metadata: {
        originalResponse: contradictingResponse.questionId,
        conflictingResponse: response.questionId,
        topic: response.topic,
        memorySource: memoryReference ? 'memory-reference' : 'fallback',
        interviewerMood: this.personality.getMood()
      }
    };
  }

  /**
   * Get the next planned question in the arc
   */
  private getNextPlannedQuestion(state: ConversationState): ConversationAction {
    // Process any queued follow-ups first
    if (this.followUpQueue.length > 0) {
      const nextFollowUpId = this.followUpQueue.shift()!;
      const followUpQuestion = this.questionArc.questions.find(q => q.id === nextFollowUpId);
      if (followUpQuestion) {
        return {
          type: 'question',
          content: followUpQuestion.question,
          metadata: {
            questionId: followUpQuestion.id,
            setup: followUpQuestion.setup,
            isQueuedFollowUp: true
          }
        };
      }
    }

    // Find next unasked question in the arc
    const nextQuestion = this.questionArc.questions.find(q =>
      !state.answeredQuestions.includes(q.id)
    );

    if (!nextQuestion) {
      return this.generateConclusion(state);
    }

    return {
      type: 'question',
      content: nextQuestion.question,
      metadata: {
        questionId: nextQuestion.id,
        setup: nextQuestion.setup,
        type: nextQuestion.type
      }
    };
  }

  /**
   * Generate interview conclusion
   */
  private generateConclusion(state: ConversationState): ConversationAction {
    const assessment = this.personality.getOverallAssessment();

    const conclusionMessages: Record<string, string> = {
      'impressed': "Thank you for your time. You've given us a lot to think about.",
      'frustrated': "I think our viewers can draw their own conclusions. Thank you.",
      'cautiously optimistic': "Interesting perspectives. Thank you for joining us tonight.",
      'skeptical': "We'll leave it there. Thanks for coming on the show.",
      'neutral': "That's all the time we have. Thank you for the interview."
    };

    return {
      type: 'conclusion',
      content: conclusionMessages[assessment] || conclusionMessages['neutral'],
      metadata: {
        assessment,
        questionsAnswered: state.answeredQuestions.length,
        totalQuestions: this.questionArc.questions.length,
        interruptionCount: this.interruptionHistory.length
      }
    };
  }

  /**
   * Update evasion tracking for pattern detection
   */
  private updateEvasionTracking(response: PlayerResponse): void {
    // Update overall evasion counter
    if (this.isEvasiveResponse(response)) {
      this.evasionCounter++;
    } else {
      // Reset counter on direct answer
      this.evasionCounter = Math.max(0, this.evasionCounter - 1);
    }

    // Track topic-specific evasion
    if (response.topic && this.isEvasiveResponse(response)) {
      const current = this.topicEvasionMap.get(response.topic) || 0;
      this.topicEvasionMap.set(response.topic, current + 1);
    }

    this.lastResponseWordCount = response.wordCount;
  }

  /**
   * Check for sophisticated evasion patterns
   */
  private checkForEvasionPatterns(response: PlayerResponse, state: ConversationState): Interruption | null {
    // Pattern 1: Consecutive evasions (escalating severity)
    if (this.evasionCounter >= 3) {
      return {
        type: 'interruption',
        content: this.getEscalatedEvasionMessage(this.evasionCounter),
        metadata: {
          trigger: 'consecutive-evasions',
          evasionCount: this.evasionCounter,
          severity: this.evasionCounter >= 5 ? 'critical' : 'major'
        }
      };
    }

    // Pattern 2: Topic avoidance (same topic evaded multiple times)
    if (response.topic) {
      const topicEvasions = this.topicEvasionMap.get(response.topic) || 0;
      if (topicEvasions >= 2) {
        return {
          type: 'interruption',
          content: this.getTopicAvoidanceMessage(response.topic, topicEvasions),
          metadata: {
            trigger: 'topic-avoidance',
            topic: response.topic,
            avoidanceCount: topicEvasions
          }
        };
      }
    }

    // Pattern 3: Filibustering (excessive rambling to avoid the question)
    if (this.isFilibustering(response, state)) {
      return {
        type: 'interruption',
        content: this.getFilibusterMessage(),
        metadata: {
          trigger: 'filibustering',
          wordCount: response.wordCount,
          averageLength: this.calculateAverageResponseLength(state)
        }
      };
    }

    // Pattern 4: Deflection patterns (always shifting blame or changing subject)
    if (this.isDeflecting(response, state)) {
      return {
        type: 'interruption',
        content: this.getDeflectionMessage(),
        metadata: {
          trigger: 'deflection-pattern',
          consecutiveDeflections: this.countConsecutiveDeflections(state)
        }
      };
    }

    return null;
  }

  /**
   * Determine if a response is evasive
   */
  private isEvasiveResponse(response: PlayerResponse): boolean {
    return response.tone === 'evasive' ||
           (response.tone === 'defensive' && response.wordCount > 50) ||
           response.wordCount < 8; // Very short responses often evasive
  }

  /**
   * Check if response is filibustering
   */
  private isFilibustering(response: PlayerResponse, state: ConversationState): boolean {
    const avgLength = this.calculateAverageResponseLength(state);
    return response.wordCount > avgLength * 2.5 &&
           response.wordCount > 80 &&
           (response.tone === 'evasive' || response.tone === 'defensive');
  }

  /**
   * Check if response is deflecting
   */
  private isDeflecting(response: PlayerResponse, state: ConversationState): boolean {
    const deflectionKeywords = [
      'but what about', 'the real issue is', 'we should focus on',
      'that\'s not the point', 'the important thing is'
    ];

    const responseText = response.responseText.toLowerCase();
    const hasDeflectionLanguage = deflectionKeywords.some(keyword =>
      responseText.includes(keyword)
    );

    return hasDeflectionLanguage && this.countConsecutiveDeflections(state) >= 2;
  }

  /**
   * Calculate average response length for context
   */
  private calculateAverageResponseLength(state: ConversationState): number {
    if (state.playerResponses.length === 0) return 30;

    const totalWords = state.playerResponses.reduce((sum, r) => sum + r.wordCount, 0);
    return totalWords / state.playerResponses.length;
  }

  /**
   * Count consecutive deflections
   */
  private countConsecutiveDeflections(state: ConversationState): number {
    let count = 0;
    const recent = state.playerResponses.slice(-3); // Check last 3 responses

    for (let i = recent.length - 1; i >= 0; i--) {
      if (recent[i].tone === 'defensive' || this.isDeflecting(recent[i], state)) {
        count++;
      } else {
        break;
      }
    }

    return count;
  }

  /**
   * Generate escalated evasion messages
   */
  private getEscalatedEvasionMessage(evasionCount: number): string {
    const messages = [
      // First escalation (3 evasions)
      [
        "I need to stop you there. You're not answering the questions.",
        "Hold on. Can we get a straight answer please?",
        "You're dodging every question. Our viewers deserve better."
      ],
      // Second escalation (4 evasions)
      [
        "This is becoming a pattern. Answer the question directly.",
        "Stop. Every answer is an evasion. What are you hiding?",
        "I'm going to keep asking until you give a real answer."
      ],
      // Critical escalation (5+ evasions)
      [
        "This interview is pointless if you won't engage honestly.",
        "Your refusal to answer is telling our viewers everything they need to know.",
        "Either answer the questions or we'll end this interview."
      ]
    ];

    const level = Math.min(Math.floor(evasionCount / 2), messages.length - 1);
    const levelMessages = messages[level];
    return levelMessages[Math.floor(Math.random() * levelMessages.length)];
  }

  /**
   * Generate topic avoidance messages
   */
  private getTopicAvoidanceMessage(topic: string, avoidanceCount: number): string {
    const topicMessages: Record<string, string[]> = {
      'climate': [
        "You keep avoiding climate questions. This is a critical issue.",
        "Every time I ask about climate, you change the subject. Why?",
        "Climate action can't wait for more evasions."
      ],
      'immigration': [
        "Immigration is too important for non-answers.",
        "You've avoided this immigration question twice. What's your position?",
        "Voters want clarity on immigration, not evasion."
      ],
      'healthcare': [
        "Healthcare affects everyone. Stop dodging the question.",
        "People are suffering. They deserve straight answers about healthcare.",
        "You can't govern healthcare policy while avoiding healthcare questions."
      ],
      'economy': [
        "Economic policy needs clear answers, not deflection.",
        "The economy is central to governance. Why won't you engage?",
        "Financial expertise means nothing if you won't discuss economics."
      ]
    };

    const messages = topicMessages[topic] || [
      `You keep avoiding questions about ${topic}. Why?`,
      `This is the ${avoidanceCount === 2 ? 'second' : 'third'} time you've dodged this ${topic} question.`,
      `${topic.charAt(0).toUpperCase() + topic.slice(1)} policy requires honest discussion.`
    ];

    return messages[Math.floor(Math.random() * messages.length)];
  }

  /**
   * Generate filibuster messages
   */
  private getFilibusterMessage(): string {
    const messages = [
      "I'm going to stop you there. That's a lot of words without answering the question.",
      "You're filibustering. Can you give me a concise, direct answer?",
      "All those words, but where's the answer to my question?",
      "Let's cut through the political rhetoric. Simple question, simple answer."
    ];

    return messages[Math.floor(Math.random() * messages.length)];
  }

  /**
   * Generate deflection messages
   */
  private getDeflectionMessage(): string {
    const messages = [
      "Stop deflecting. I'm asking about your position, not others'.",
      "You keep changing the subject. Stay focused on the question.",
      "Deflection isn't leadership. What would you do?",
      "That's deflection again. Take responsibility and answer directly."
    ];

    return messages[Math.floor(Math.random() * messages.length)];
  }

  /**
   * Intensify interruption message based on interviewer mood
   */
  private intensifyInterruptionByMood(baseMessage: string, mood: string): string {
    const intensifiers: Record<string, (msg: string) => string> = {
      'frustrated': (msg) => `${msg} I'm losing patience here.`,
      'hostile': (msg) => `${msg} This is unacceptable.`,
      'skeptical': (msg) => `${msg} Do you think our viewers are fooled by this?`,
      'professional': (msg) => msg, // No intensification
      'excited': (msg) => `${msg} But let's dig deeper into this.`,
      'sympathetic': (msg) => `${msg} Help me understand your position.`,
      'neutral': (msg) => msg
    };

    const intensifier = intensifiers[mood] || intensifiers['neutral'];
    return intensifier(baseMessage);
  }

  /**
   * Evaluate interruption trigger conditions
   */
  private evaluateInterruptionTrigger(trigger: InterruptionTrigger, response: PlayerResponse, state: ConversationState): boolean {
    const condition = trigger.condition.toLowerCase();

    // Word count conditions
    if (condition.includes('word_count>')) {
      const threshold = parseInt(condition.split('>')[1]);
      return response.wordCount > threshold;
    }

    // Tone-based conditions
    if (condition === 'evasion' || condition === 'evasive') {
      return response.tone === 'evasive';
    }

    if (condition === 'deflection') {
      return response.tone === 'defensive' && response.wordCount > 30;
    }

    // Time-based conditions (check against interruption history)
    if (condition === 'repeated_evasion') {
      const recentEvasive = state.playerResponses.slice(-2).filter(r => r.tone === 'evasive').length;
      return recentEvasive >= 2;
    }

    // Frustration level conditions
    if (condition === 'high_frustration') {
      return this.personality.getFrustrationLevel() > 60;
    }

    // Default: evaluate against trigger probability
    return Math.random() < trigger.probability;
  }

  /**
   * Evaluate follow-up rule conditions
   */
  private evaluateFollowUpCondition(condition: string, response: PlayerResponse, state: ConversationState): boolean {
    // Tone-based conditions
    if (condition.startsWith('tone:')) {
      const requiredTone = condition.substring(5);
      return response.tone === requiredTone;
    }

    // Contradiction conditions
    if (condition === 'contradicts:previous') {
      return response.contradictsPrevious || false;
    }

    // Word count conditions
    if (condition.startsWith('word_count>')) {
      const threshold = parseInt(condition.substring(11));
      return response.wordCount > threshold;
    }

    if (condition.startsWith('word_count<')) {
      const threshold = parseInt(condition.substring(11));
      return response.wordCount < threshold;
    }

    // Topic-based conditions
    if (condition.startsWith('topic:')) {
      const requiredTopic = condition.substring(6);
      return response.topic === requiredTopic;
    }

    // Interviewer mood conditions
    if (condition.startsWith('interviewer_mood:')) {
      const requiredMood = condition.substring(17);
      return this.personality.getMood() === requiredMood;
    }

    // Performance-based conditions
    if (condition === 'low_confidence') {
      return state.performanceMetrics.confidence < 40;
    }

    if (condition === 'high_consistency') {
      return state.performanceMetrics.consistency > 80;
    }

    return false;
  }

  /**
   * Generate a dynamic follow-up based on action type
   */
  private generateDynamicFollowUp(action: string, response: PlayerResponse, state: ConversationState): ConversationAction {
    const followUpMessages: Record<string, string[]> = {
      'accountability-pressure': [
        "But who's accountable when things go wrong?",
        "How do you ensure accountability in practice?",
        "What happens if your approach fails?"
      ],
      'responsibility-challenge': [
        "Where does personal responsibility end and systemic issues begin?",
        "Are you taking responsibility for your role in this?",
        "How do you balance personal and collective responsibility?"
      ],
      'experience-challenge': [
        "Does experience matter if it's the wrong kind of experience?",
        "How do we know you've learned from those experiences?",
        "Isn't this just more of the same old politics?"
      ],
      'pragmatism-test': [
        "That sounds pragmatic, but is it realistic?",
        "How do you make pragmatism work in practice?",
        "Pragmatism often means compromise. What won't you compromise on?"
      ]
    };

    const messages = followUpMessages[action] || [
      "Can you elaborate on that?",
      "What do you mean by that exactly?",
      "How would that work in practice?"
    ];

    const selectedMessage = messages[Math.floor(Math.random() * messages.length)];

    return {
      type: 'follow-up',
      content: selectedMessage,
      metadata: {
        action,
        triggeredBy: response.tone,
        isDynamic: true
      }
    };
  }

  /**
   * Check if the interview should conclude
   */
  shouldConclude(state: ConversationState): boolean {
    const questionsAnswered = state.answeredQuestions.length;
    const totalQuestions = this.questionArc.questions.length;

    // Standard completion: all questions answered
    if (questionsAnswered >= totalQuestions) {
      return true;
    }

    // Early conclusion conditions
    const frustrationLevel = this.personality.getFrustrationLevel();
    const interruptionCount = this.interruptionHistory.length;

    // Interviewer gives up due to too many evasions/interruptions
    if (frustrationLevel > 90 && interruptionCount > 3) {
      return true;
    }

    // Exceptional performance allows for early wrap-up
    const performance = state.performanceMetrics;
    if (questionsAnswered >= Math.floor(totalQuestions * 0.7) &&
        performance.overallScore > 85 &&
        performance.consistency > 90) {
      return true;
    }

    return false;
  }

  /**
   * Add a follow-up question to the queue
   */
  queueFollowUp(questionId: string): void {
    if (!this.followUpQueue.includes(questionId)) {
      this.followUpQueue.push(questionId);
    }
  }

  /**
   * Get current question by ID
   */
  private getCurrentQuestion(questionId: string): DynamicQuestion | undefined {
    return this.questionArc.questions.find(q => q.id === questionId);
  }

  /**
   * Get interruption history for analysis
   */
  getInterruptionHistory(): string[] {
    return [...this.interruptionHistory];
  }

  /**
   * Get pending follow-ups
   */
  getPendingFollowUps(): string[] {
    return [...this.followUpQueue];
  }

  /**
   * Get evasion statistics for analysis
   */
  getEvasionStats(): { totalEvasions: number; topicEvasions: Map<string, number> } {
    return {
      totalEvasions: this.evasionCounter,
      topicEvasions: new Map(this.topicEvasionMap)
    };
  }

  /**
   * Get comprehensive memory and conversation statistics
   */
  getConversationAnalytics(): {
    evasionStats: { totalEvasions: number; topicEvasions: Map<string, number> };
    interviewerMemory: {
      totalStatements: number;
      contradictions: number;
      evasions: number;
      strongMoments: number;
      weakMoments: number;
      quotes: number;
    };
    interruptionHistory: string[];
    totalInterruptions: number;
  } {
    return {
      evasionStats: this.getEvasionStats(),
      interviewerMemory: this.personality.getMemoryStats(),
      interruptionHistory: this.getInterruptionHistory(),
      totalInterruptions: this.interruptionHistory.length
    };
  }

  /**
   * Initialize rapid-fire configuration
   */
  private initializeRapidFireConfig(): RapidFireConfig {
    return {
      enabled: true,
      maxConcurrentSessions: 1,
      cooldownPeriod: 30, // 30 seconds before another rapid-fire can start
      intensityScaling: {
        low: { questionCount: 2, timeLimit: 15, escalationRate: 1.1 },
        medium: { questionCount: 3, timeLimit: 12, escalationRate: 1.2 },
        high: { questionCount: 4, timeLimit: 10, escalationRate: 1.3 },
        extreme: { questionCount: 5, timeLimit: 8, escalationRate: 1.5 }
      },
      triggers: [
        {
          id: 'evasion-pressure',
          condition: 'evasion_count>=3',
          intensity: 'medium',
          questionCount: 3,
          timeConstraint: 12,
          questions: [
            "Yes or no - do you support this policy?",
            "What specifically would you do differently?",
            "When will you give voters a straight answer?"
          ],
          description: 'Triggered by consecutive evasions to force direct answers'
        },
        {
          id: 'topic-avoidance-pressure',
          condition: 'topic_avoidance>=2',
          intensity: 'high',
          questionCount: 4,
          timeConstraint: 10,
          questions: [
            "Why do you keep avoiding this topic?",
            "What are you afraid to tell voters?",
            "Is this how you'll govern - by dodging difficult questions?",
            "One more time - what's your position?"
          ],
          description: 'Triggered by avoiding specific topics multiple times'
        },
        {
          id: 'contradiction-challenge',
          condition: 'contradiction_detected',
          intensity: 'high',
          questionCount: 3,
          timeConstraint: 15,
          questions: [
            "Which statement is true?",
            "How do you explain this contradiction?",
            "Can voters trust what you say?"
          ],
          description: 'Triggered by detecting contradictions in statements'
        },
        {
          id: 'frustration-escalation',
          condition: 'interviewer_frustration>=70',
          intensity: 'extreme',
          questionCount: 5,
          timeConstraint: 8,
          questions: [
            "Do you think this is acceptable?",
            "What would your constituents think?",
            "Are you prepared to defend this?",
            "Is this the leadership we need?",
            "Final chance - what's your answer?"
          ],
          description: 'Triggered when interviewer becomes extremely frustrated'
        }
      ]
    };
  }

  /**
   * Check if conditions are met to trigger a rapid-fire session
   */
  private checkForRapidFireTrigger(response: PlayerResponse, state: ConversationState): RapidFireTrigger | null {
    if (!this.rapidFireConfig.enabled) return null;

    // Check cooldown period
    const now = Date.now();
    if (now - this.lastRapidFireTime < this.rapidFireConfig.cooldownPeriod * 1000) {
      return null;
    }

    // Check if already in a session
    if (this.rapidFireSession?.isActive) return null;

    const frustrationLevel = this.personality.getFrustrationLevel();

    for (const trigger of this.rapidFireConfig.triggers) {
      if (this.evaluateRapidFireCondition(trigger.condition, response, state, frustrationLevel)) {
        return trigger;
      }
    }

    return null;
  }

  /**
   * Evaluate rapid-fire trigger conditions
   */
  private evaluateRapidFireCondition(
    condition: string,
    response: PlayerResponse,
    state: ConversationState,
    frustrationLevel: number
  ): boolean {
    switch (condition) {
      case 'evasion_count>=3':
        return this.evasionCounter >= 3;

      case 'topic_avoidance>=2':
        if (!response.topic) return false;
        return (this.topicEvasionMap.get(response.topic) || 0) >= 2;

      case 'contradiction_detected':
        return response.contradictsPrevious === true;

      case 'interviewer_frustration>=70':
        return frustrationLevel >= 70;

      default:
        return false;
    }
  }

  /**
   * Start a new rapid-fire session
   */
  private startRapidFireSession(
    trigger: RapidFireTrigger,
    response: PlayerResponse,
    state: ConversationState
  ): void {
    const config = this.rapidFireConfig.intensityScaling[trigger.intensity];

    this.rapidFireSession = {
      isActive: true,
      targetTopic: response.topic || 'general',
      questionsRemaining: trigger.questionCount,
      maxQuestions: trigger.questionCount,
      intensity: trigger.intensity,
      currentQuestion: 0,
      timeConstraint: trigger.timeConstraint,
      triggerReason: trigger.description,
      questions: this.generateRapidFireQuestions(trigger, response, state)
    };

    this.lastRapidFireTime = Date.now();
  }

  /**
   * Generate rapid-fire questions based on trigger
   */
  private generateRapidFireQuestions(
    trigger: RapidFireTrigger,
    response: PlayerResponse,
    state: ConversationState
  ): RapidFireQuestion[] {
    const questions: RapidFireQuestion[] = [];
    const baseEscalation = 1;
    const escalationRate = this.rapidFireConfig.intensityScaling[trigger.intensity].escalationRate;

    for (let i = 0; i < trigger.questionCount; i++) {
      const questionTemplate = trigger.questions[i] || trigger.questions[trigger.questions.length - 1];
      const contextualQuestion = this.contextualizeRapidFireQuestion(
        questionTemplate,
        response,
        state,
        i + 1
      );

      questions.push({
        id: `rapid-fire-${trigger.id}-${i + 1}`,
        text: contextualQuestion,
        followUpType: this.determineFollowUpType(i, trigger.questionCount),
        timeLimit: trigger.timeConstraint,
        expectedResponseType: this.determineExpectedResponseType(i, trigger.intensity),
        escalationLevel: Math.round(baseEscalation * Math.pow(escalationRate, i))
      });
    }

    return questions;
  }

  /**
   * Contextualize rapid-fire questions based on the current situation
   */
  private contextualizeRapidFireQuestion(
    template: string,
    response: PlayerResponse,
    state: ConversationState,
    questionNumber: number
  ): string {
    let contextualQuestion = template;

    // Replace placeholders with context
    if (response.topic) {
      contextualQuestion = contextualQuestion.replace(/this topic/g, response.topic);
      contextualQuestion = contextualQuestion.replace(/this (policy|issue)/g, `this ${response.topic} $1`);
    }

    // Add urgency markers for later questions
    if (questionNumber > 2) {
      const urgencyPrefixes = [
        "Look,",
        "Listen,",
        "Come on,",
        "Seriously,"
      ];
      const prefix = urgencyPrefixes[Math.min(questionNumber - 3, urgencyPrefixes.length - 1)];
      contextualQuestion = `${prefix} ${contextualQuestion.toLowerCase()}`;
    }

    return contextualQuestion;
  }

  /**
   * Determine follow-up type based on question position
   */
  private determineFollowUpType(questionIndex: number, totalQuestions: number): 'clarification' | 'challenge' | 'pressure' | 'contradiction' {
    if (questionIndex === 0) return 'clarification';
    if (questionIndex < totalQuestions / 2) return 'challenge';
    if (questionIndex === totalQuestions - 1) return 'contradiction';
    return 'pressure';
  }

  /**
   * Determine expected response type based on question position and intensity
   */
  private determineExpectedResponseType(
    questionIndex: number,
    intensity: 'low' | 'medium' | 'high' | 'extreme'
  ): 'direct' | 'detailed' | 'yes-no' | 'specific-fact' {
    if (intensity === 'extreme' || questionIndex === 0) return 'yes-no';
    if (intensity === 'high' && questionIndex < 2) return 'direct';
    if (questionIndex === 1) return 'specific-fact';
    return 'detailed';
  }

  /**
   * Handle ongoing rapid-fire session
   */
  private handleRapidFireSession(response: PlayerResponse, state: ConversationState): ConversationAction {
    if (!this.rapidFireSession) {
      throw new Error('Rapid-fire session handler called without active session');
    }

    const session = this.rapidFireSession;

    // Check if we should end the session
    if (session.questionsRemaining <= 0 || this.shouldEndRapidFireSession(response, state)) {
      this.endRapidFireSession();
      return this.determineNextAction(response, state); // Continue with normal flow
    }

    // Get the next rapid-fire question
    const currentQuestionIndex = session.maxQuestions - session.questionsRemaining;
    const nextQuestion = session.questions[currentQuestionIndex];

    if (!nextQuestion) {
      this.endRapidFireSession();
      return this.determineNextAction(response, state);
    }

    // Update session state
    session.questionsRemaining--;
    session.currentQuestion++;

    return {
      type: 'follow-up',
      content: nextQuestion.text,
      metadata: {
        rapidFire: true,
        questionId: nextQuestion.id,
        followUpType: nextQuestion.followUpType,
        timeLimit: nextQuestion.timeLimit,
        expectedResponseType: nextQuestion.expectedResponseType,
        escalationLevel: nextQuestion.escalationLevel,
        questionsRemaining: session.questionsRemaining,
        sessionIntensity: session.intensity,
        triggerReason: session.triggerReason
      }
    };
  }

  /**
   * Check if rapid-fire session should end early
   */
  private shouldEndRapidFireSession(response: PlayerResponse, state: ConversationState): boolean {
    if (!this.rapidFireSession) return true;

    // End if player gives a very direct, satisfactory answer
    if (response.tone === 'confident' && response.wordCount >= 15 && response.wordCount <= 40) {
      return true;
    }

    // End if interviewer mood shifts to sympathetic or impressed
    const mood = this.personality.getMood();
    if (mood === 'sympathetic' || mood === 'excited') {
      return true;
    }

    // End if session has gone on too long (safety measure)
    if (this.rapidFireSession.currentQuestion > this.rapidFireSession.maxQuestions) {
      return true;
    }

    return false;
  }

  /**
   * End the current rapid-fire session
   */
  private endRapidFireSession(): void {
    this.rapidFireSession = null;
  }

  /**
   * Get rapid-fire session status
   */
  getRapidFireStatus(): {
    isActive: boolean;
    session: RapidFireSession | null;
    cooldownRemaining: number;
  } {
    const now = Date.now();
    const cooldownRemaining = Math.max(0,
      (this.lastRapidFireTime + this.rapidFireConfig.cooldownPeriod * 1000 - now) / 1000
    );

    return {
      isActive: this.rapidFireSession?.isActive || false,
      session: this.rapidFireSession,
      cooldownRemaining
    };
  }

  /**
   * Clear conversation state (for testing/reset)
   */
  reset(): void {
    this.interruptionHistory = [];
    this.followUpQueue = [];
    this.evasionCounter = 0;
    this.lastResponseWordCount = 0;
    this.topicEvasionMap.clear();
    this.rapidFireSession = null;
    this.lastRapidFireTime = 0;
  }
}