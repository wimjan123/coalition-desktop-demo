/**
 * Dynamic Interview Engine
 * Core orchestrator for the modular interview system
 */

import type {
  InterviewConfig,
  InterviewResult,
  ConversationState,
  DynamicQuestion,
  PlayerResponse,
  ConversationAction,
  InterviewPerformance,
  QuestionArc,
  InterviewAftermath
} from '../types/interview.js';

import { InterviewerPersonality } from './InterviewerPersonality.js';
import { ConversationFlow } from './ConversationFlow.js';
import { QuestionArcFactory } from './QuestionArcFactory.js';
import { AftermathGenerator } from './AftermathGenerator.js';
import { PerformanceAnalyzer } from './PerformanceAnalyzer.js';

export class InterviewEngine {
  private config: InterviewConfig;
  private personality: InterviewerPersonality;
  private questionArc: QuestionArc;
  private conversationFlow: ConversationFlow;
  private aftermathGenerator: AftermathGenerator;
  private performanceAnalyzer: PerformanceAnalyzer;
  private state: ConversationState;

  constructor(config: InterviewConfig) {
    this.config = config;
    this.initializeComponents();
    this.initializeState();
  }

  private initializeComponents(): void {
    // Create interviewer personality based on config
    this.personality = new InterviewerPersonality(
      this.config.interviewerType,
      this.config.backgroundId
    );

    // Load appropriate question arc for this background and difficulty
    this.questionArc = QuestionArcFactory.create(
      this.config.backgroundId,
      this.config.difficulty === 'auto'
        ? this.determineAutoDifficulty()
        : this.config.difficulty
    );

    // Initialize conversation flow controller
    this.conversationFlow = new ConversationFlow(
      this.personality,
      this.questionArc
    );

    // Set up aftermath generation system
    this.aftermathGenerator = new AftermathGenerator(this.config.type);

    // Initialize performance analyzer
    this.performanceAnalyzer = new PerformanceAnalyzer();
  }

  private initializeState(): void {
    this.state = {
      answeredQuestions: [],
      playerResponses: [],
      interviewerMood: this.personality.getMood(),
      conversationMemory: {
        keyStatements: new Map(),
        positionHistory: [],
        contradictions: [],
        strongMoments: [],
        weakMoments: []
      },
      performanceMetrics: {
        consistency: 100,
        confidence: 50,
        authenticity: 50,
        engagement: 50,
        overallScore: 50,
        dominantTone: 'diplomatic',
        majorMistakes: [],
        strongMoments: []
      },
      contradictions: []
    };
  }

  private determineAutoDifficulty(): 'low' | 'medium' | 'high' | 'extreme' {
    // Use sophisticated controversy-based difficulty scaling
    return QuestionArcFactory.calculateDifficultyFromControversy(this.config.backgroundId);
  }

  /**
   * Main interview orchestration method
   */
  async conductInterview(): Promise<InterviewResult> {
    // Get the opening question
    const firstQuestion = this.questionArc.questions[0];
    this.state.currentQuestionId = firstQuestion.id;

    return {
      performance: this.state.performanceMetrics as InterviewPerformance,
      positions: this.state.conversationMemory.positionHistory,
      aftermath: await this.generateAftermath(),
      gameplayEffects: this.calculateGameplayEffects()
    };
  }

  /**
   * Get the current question for the interview
   */
  getCurrentQuestion(): DynamicQuestion | null {
    if (!this.state.currentQuestionId) {
      return this.questionArc.questions[0] || null;
    }

    return this.questionArc.questions.find(q => q.id === this.state.currentQuestionId) || null;
  }

  /**
   * Process a player response and determine next action
   */
  async processResponse(responseText: string, tone: string): Promise<ConversationAction> {
    const currentQuestion = this.getCurrentQuestion();
    if (!currentQuestion) {
      throw new Error('No current question to respond to');
    }

    // Create player response object
    const response: PlayerResponse = {
      questionId: currentQuestion.id,
      responseText,
      tone: tone as any,
      wordCount: responseText.split(' ').length,
      timestamp: Date.now(),
      topic: this.extractTopic(responseText, currentQuestion)
    };

    // Check for contradictions with previous responses
    response.contradictsPrevious = this.checkForContradictions(response);

    // Update conversation memory
    this.updateConversationMemory(response);

    // Update interviewer personality based on response
    const moodChange = this.personality.processResponse(response);
    if (moodChange) {
      this.state.interviewerMood = moodChange.to;
    }

    // Update performance metrics
    this.performanceAnalyzer.analyzeResponse(response, this.state);

    // Add to response history
    this.state.playerResponses.push(response);
    this.state.answeredQuestions.push(currentQuestion.id);

    // Determine next conversation action
    const nextAction = this.conversationFlow.determineNextAction(response, this.state);

    // Update current question based on next action
    if (nextAction.type === 'question' && nextAction.metadata?.questionId) {
      this.state.currentQuestionId = nextAction.metadata.questionId;
    }

    return nextAction;
  }

  /**
   * Check if the interview is complete
   */
  isComplete(): boolean {
    const totalQuestions = this.questionArc.questions.length;
    const questionsAnswered = this.state.answeredQuestions.length;

    // Interview is complete if we've answered all planned questions
    // or if the conversation flow indicates completion
    return questionsAnswered >= totalQuestions ||
           this.conversationFlow.shouldConclude(this.state);
  }

  /**
   * Get current conversation state (for UI updates)
   */
  getState(): ConversationState {
    return { ...this.state };
  }

  /**
   * Get interviewer's current mood and recent changes including frustration state
   */
  getInterviewerStatus(): {
    mood: string;
    recentReaction?: string;
    frustrationLevel: number;
    frustrationState?: any;
  } {
    return {
      mood: this.state.interviewerMood,
      recentReaction: this.personality.getLastReaction()?.message || '',
      frustrationLevel: this.personality.getFrustrationLevel(),
      frustrationState: this.personality.getFrustrationState()
    };
  }

  private extractTopic(responseText: string, question: DynamicQuestion): string {
    // Simple topic extraction based on question context
    // In a real implementation, this could use NLP or keyword matching
    const questionText = question.question.toLowerCase();

    if (questionText.includes('climate') || questionText.includes('environment')) return 'climate';
    if (questionText.includes('economic') || questionText.includes('jobs')) return 'economy';
    if (questionText.includes('immigration') || questionText.includes('asylum')) return 'immigration';
    if (questionText.includes('housing') || questionText.includes('rent')) return 'housing';
    if (questionText.includes('healthcare') || questionText.includes('medical')) return 'healthcare';
    if (questionText.includes('education') || questionText.includes('school')) return 'education';
    if (questionText.includes('security') || questionText.includes('crime')) return 'security';

    return 'general';
  }

  private checkForContradictions(response: PlayerResponse): boolean {
    // Check if this response contradicts previous positions on the same topic
    const previousResponses = this.state.playerResponses.filter(r => r.topic === response.topic);

    for (const prev of previousResponses) {
      if (this.areResponsesContradictory(prev, response)) {
        this.state.contradictions.push({
          questionId1: prev.questionId,
          questionId2: response.questionId,
          description: `Contradictory positions on ${response.topic}`,
          severity: 'major'
        });
        return true;
      }
    }

    return false;
  }

  private areResponsesContradictory(response1: PlayerResponse, response2: PlayerResponse): boolean {
    // Simple contradiction detection based on tone and position
    const toneConflicts: Record<string, string[]> = {
      'aggressive': ['defensive', 'evasive'],
      'defensive': ['aggressive', 'confrontational'],
      'confrontational': ['diplomatic', 'defensive'],
      'diplomatic': ['aggressive', 'confrontational']
    };

    return toneConflicts[response1.tone]?.includes(response2.tone) || false;
  }

  private updateConversationMemory(response: PlayerResponse): void {
    // Update key statements for this topic
    if (response.topic) {
      this.state.conversationMemory.keyStatements.set(response.topic, response.responseText);
    }

    // Track position if provided
    if (response.position) {
      this.state.conversationMemory.positionHistory.push(response.position);
    }

    // Identify strong or weak moments based on tone and content length
    if (response.tone === 'confident' && response.wordCount > 20) {
      this.state.conversationMemory.strongMoments.push(response.questionId);
    } else if (response.tone === 'evasive' || response.wordCount < 10) {
      this.state.conversationMemory.weakMoments.push(response.questionId);
    }
  }

  private async generateAftermath(): Promise<InterviewAftermath> {
    const performance: InterviewPerformance = {
      ...this.state.performanceMetrics,
      backgroundId: this.config.backgroundId,
      duration: this.calculateDuration(),
      questionsAnswered: this.state.answeredQuestions.length,
      interruptionCount: this.countInterruptions(),
      contradictionCount: this.state.contradictions.length
    };

    return this.aftermathGenerator.generate(performance, this.state);
  }

  private calculateGameplayEffects(): any[] {
    // Calculate how interview performance affects game state
    const effects = [];
    const performance = this.state.performanceMetrics;

    // Approval rating changes based on overall performance
    if (performance.overallScore > 75) {
      effects.push({
        type: 'approval-rating',
        target: 'general',
        change: 5,
        duration: 'permanent',
        description: 'Strong interview performance'
      });
    } else if (performance.overallScore < 40) {
      effects.push({
        type: 'approval-rating',
        target: 'general',
        change: -8,
        duration: 'permanent',
        description: 'Poor interview performance'
      });
    }

    // Demographic-specific effects based on positions taken
    for (const position of this.state.conversationMemory.positionHistory) {
      if (Math.abs(position.position) > 50) { // Strong positions
        effects.push({
          type: 'demographic-relationship',
          target: this.getDemographicForIssue(position.issueId),
          change: position.position > 0 ? 3 : -3,
          description: `Strong position on ${position.issueId}`
        });
      }
    }

    return effects;
  }

  private calculateDuration(): number {
    if (this.state.playerResponses.length === 0) return 0;

    const start = this.state.playerResponses[0].timestamp;
    const end = this.state.playerResponses[this.state.playerResponses.length - 1].timestamp;

    return Math.round((end - start) / 1000 / 60); // Duration in minutes
  }

  private countInterruptions(): number {
    // Count interruptions by looking for rapid follow-ups in response history
    let interruptions = 0;
    for (let i = 1; i < this.state.playerResponses.length; i++) {
      const timeDiff = this.state.playerResponses[i].timestamp - this.state.playerResponses[i-1].timestamp;
      if (timeDiff < 10000) { // Less than 10 seconds = likely interruption
        interruptions++;
      }
    }
    return interruptions;
  }

  private getDemographicForIssue(issueId: string): string {
    const issueToDemographic: Record<string, string> = {
      'climate': 'young-professionals',
      'immigration': 'working-class',
      'housing': 'urban-renters',
      'healthcare': 'elderly',
      'education': 'families',
      'economy': 'business-owners'
    };

    return issueToDemographic[issueId] || 'general';
  }
}