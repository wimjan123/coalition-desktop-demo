/**
 * Debate Preparation Interview Engine
 * Handles pre-debate practice interviews to help players prepare for major campaign debates
 */

import type {
  DebatePreparationConfig,
  DebateOpponent,
  DebateIssue,
  InterviewResult,
  ConversationState,
  PlayerResponse,
  ConversationAction,
  QuestionArc,
  DynamicQuestion
} from '../types/interview.js';

import { InterviewEngine } from './InterviewEngine.js';
import { DebateQuestionArcFactory } from './DebateQuestionArcFactory.js';

export class DebatePreparationEngine extends InterviewEngine {
  private debateConfig: DebatePreparationConfig;
  private practiceRounds: number = 0;
  private maxPracticeRounds: number = 3;
  private opponentSimulation: OpponentSimulation;
  private messageTraining: MessageTraining;
  private vulnerabilityAssessment: VulnerabilityAssessment;

  constructor(config: DebatePreparationConfig) {
    super(config);
    this.debateConfig = config;
    this.initializeDebatePreparation();
  }

  private initializeDebatePreparation(): void {
    this.opponentSimulation = new OpponentSimulation(this.debateConfig.opponentProfiles);
    this.messageTraining = new MessageTraining(this.debateConfig.preparationFocus);
    this.vulnerabilityAssessment = new VulnerabilityAssessment(
      this.debateConfig.keyIssues,
      this.config.backgroundId
    );

    // Set max practice rounds based on time until debate
    this.maxPracticeRounds = Math.min(5, Math.floor(this.debateConfig.timeUntilDebate / 12)); // 1 round per 12 hours
  }

  async conductDebatePreparation(): Promise<InterviewResult> {
    const result = await super.conductInterview();

    // Add debate-specific performance metrics
    result.performance = {
      ...result.performance,
      ...this.calculateDebateReadinessMetrics()
    };

    // Generate debate-specific aftermath
    result.aftermath = {
      ...result.aftermath,
      debatePreparationReport: this.generatePreparationReport()
    };

    return result;
  }

  async processResponse(responseText: string, tone: string): Promise<ConversationAction> {
    // Analyze response for debate readiness indicators
    this.assessMessageDiscipline(responseText, tone);
    this.checkForVulnerabilities(responseText);
    this.evaluateOpponentAttackDefense(responseText, tone);

    // Process with base engine
    const action = await super.processResponse(responseText, tone);

    // Add debate-specific enhancements
    return this.enhanceWithDebateLogic(action, responseText, tone);
  }

  private assessMessageDiscipline(responseText: string, tone: string): void {
    const currentQuestion = this.getCurrentQuestion();
    if (!currentQuestion) return;

    // Check if player stayed on message
    const keyMessages = this.extractKeyMessages(responseText);
    const messageDisciplineScore = this.calculateMessageDisciplineScore(keyMessages, currentQuestion);

    this.messageTraining.recordMessageDiscipline(currentQuestion.id, messageDisciplineScore);

    // Update performance metrics
    if (messageDisciplineScore > 70) {
      this.state.performanceMetrics.consistency = Math.min(100,
        this.state.performanceMetrics.consistency + 3
      );
    } else if (messageDisciplineScore < 40) {
      this.state.performanceMetrics.consistency = Math.max(0,
        this.state.performanceMetrics.consistency - 5
      );
    }
  }

  private checkForVulnerabilities(responseText: string): void {
    const vulnerabilities = this.vulnerabilityAssessment.identifyNewVulnerabilities(responseText);

    vulnerabilities.forEach(vulnerability => {
      this.state.performanceMetrics.majorMistakes.push(
        `Debate vulnerability: ${vulnerability.description}`
      );
    });
  }

  private evaluateOpponentAttackDefense(responseText: string, tone: string): void {
    // Check if this response would defend well against known opponent attacks
    const currentQuestion = this.getCurrentQuestion();
    if (!currentQuestion?.metadata?.simulatedOpponent) return;

    const opponentId = currentQuestion.metadata.simulatedOpponent;
    const opponent = this.debateConfig.opponentProfiles.find(o => o.id === opponentId);

    if (opponent) {
      const defenseEffectiveness = this.opponentSimulation.evaluateDefense(
        opponent,
        responseText,
        tone
      );

      this.opponentSimulation.recordDefensePerformance(opponent.id, defenseEffectiveness);
    }
  }

  private enhanceWithDebateLogic(
    action: ConversationAction,
    responseText: string,
    tone: string
  ): ConversationAction {
    // Add opponent simulation if this was an attack response
    if (action.type === 'follow-up' && this.shouldSimulateOpponentResponse(responseText, tone)) {
      const opponentResponse = this.generateOpponentResponse(responseText, tone);
      action.metadata = {
        ...action.metadata,
        opponentSimulation: opponentResponse,
        debatePreparationTip: this.generateDebateTip(responseText, tone)
      };
    }

    // Add practice round progression
    if (this.shouldAdvancePracticeRound()) {
      this.practiceRounds++;
      action.metadata = {
        ...action.metadata,
        practiceRoundComplete: true,
        practiceRoundsRemaining: this.maxPracticeRounds - this.practiceRounds
      };
    }

    return action;
  }

  private shouldSimulateOpponentResponse(responseText: string, tone: string): boolean {
    // Simulate opponent response for aggressive or controversial responses
    return ['aggressive', 'confrontational'].includes(tone) ||
           responseText.toLowerCase().includes('opponent') ||
           responseText.toLowerCase().includes('wrong') ||
           Math.random() < 0.3; // 30% chance for any response
  }

  private generateOpponentResponse(responseText: string, tone: string): string {
    const opponents = this.debateConfig.opponentProfiles;
    const primaryOpponent = opponents[0]; // Use primary opponent for simulation

    if (!primaryOpponent) return '';

    // Generate opponent counter-attack based on their profile
    const counterAttacks = [
      `${primaryOpponent.name} would likely respond: "That's exactly the kind of out-of-touch thinking that got us into this mess."`,
      `${primaryOpponent.name} might counter: "While my opponent talks about ${this.extractMainTopic(responseText)}, families are struggling with real issues."`,
      `${primaryOpponent.name} could attack: "This shows how unprepared they are for the real challenges of leadership."`,
      `${primaryOpponent.name} might pivot: "Instead of defending failed policies, we should focus on solutions that actually work."`
    ];

    // Select based on opponent's strengths and player's vulnerability
    return this.selectBestCounterAttack(counterAttacks, primaryOpponent, responseText);
  }

  private generateDebateTip(responseText: string, tone: string): string {
    const tips = [
      "In the actual debate, prepare a more concise version of this response",
      "Consider how this answer might sound to undecided voters",
      "Practice transitioning from defense to offense more smoothly",
      "Strengthen this response with specific examples or statistics",
      "Be ready to handle interruptions during this type of answer",
      "Consider how to make this response more memorable and quotable"
    ];

    // Select tip based on response characteristics
    if (responseText.length > 200) {
      return "Practice making this point more concisely - you'll have limited time in the debate";
    } else if (responseText.length < 50) {
      return "Expand on this point with more substance - brief answers can seem evasive";
    } else if (tone === 'defensive') {
      return "Practice pivoting from defense to your positive message more quickly";
    }

    return tips[Math.floor(Math.random() * tips.length)];
  }

  private shouldAdvancePracticeRound(): boolean {
    const questionsInRound = 5; // Questions per practice round
    return this.state.answeredQuestions.length % questionsInRound === 0 &&
           this.practiceRounds < this.maxPracticeRounds;
  }

  private calculateDebateReadinessMetrics(): any {
    return {
      messageDisciplineScore: this.messageTraining.getOverallScore(),
      vulnerabilityLevel: this.vulnerabilityAssessment.getOverallVulnerabilityLevel(),
      opponentDefenseReadiness: this.opponentSimulation.getDefenseReadinessScore(),
      debateConfidenceLevel: this.calculateDebateConfidence(),
      practiceRoundsCompleted: this.practiceRounds,
      readinessRecommendation: this.generateReadinessRecommendation()
    };
  }

  private calculateDebateConfidence(): number {
    let confidence = 50; // Base confidence

    // Adjust based on message discipline
    confidence += (this.messageTraining.getOverallScore() - 50) * 0.4;

    // Adjust based on vulnerability level
    confidence -= this.vulnerabilityAssessment.getOverallVulnerabilityLevel() * 0.3;

    // Adjust based on defense readiness
    confidence += (this.opponentSimulation.getDefenseReadinessScore() - 50) * 0.3;

    // Adjust based on practice rounds completed
    const practiceBonus = (this.practiceRounds / this.maxPracticeRounds) * 20;
    confidence += practiceBonus;

    return Math.max(0, Math.min(100, confidence));
  }

  private generateReadinessRecommendation(): string {
    const confidence = this.calculateDebateConfidence();
    const vulnerabilityLevel = this.vulnerabilityAssessment.getOverallVulnerabilityLevel();
    const messageDiscipline = this.messageTraining.getOverallScore();

    if (confidence > 80) {
      return "You're well-prepared for the debate. Focus on staying confident and on-message.";
    } else if (vulnerabilityLevel > 60) {
      return "Address your key vulnerabilities before the debate. Practice defensive responses.";
    } else if (messageDiscipline < 50) {
      return "Practice staying on message. Avoid getting pulled into opponent's preferred topics.";
    } else if (this.practiceRounds < this.maxPracticeRounds / 2) {
      return "Complete more practice rounds to build confidence and identify weak spots.";
    } else {
      return "Continue practicing, especially on your weakest policy areas.";
    }
  }

  private generatePreparationReport(): any {
    return {
      overallReadiness: this.calculateDebateConfidence(),
      strengthAreas: this.identifyStrengthAreas(),
      improvementAreas: this.identifyImprovementAreas(),
      opponentAnalysis: this.generateOpponentAnalysis(),
      recommendedStrategy: this.generateRecommendedStrategy(),
      practiceSessionSummary: {
        roundsCompleted: this.practiceRounds,
        totalQuestions: this.state.answeredQuestions.length,
        averageResponseTime: this.calculateAverageResponseTime(),
        consistencyScore: this.state.performanceMetrics.consistency
      }
    };
  }

  // Helper methods
  private extractKeyMessages(responseText: string): string[] {
    // Simple keyword extraction - in a real implementation this would be more sophisticated
    const commonPoliticalMessages = [
      'jobs', 'economy', 'healthcare', 'education', 'security', 'climate',
      'families', 'future', 'change', 'experience', 'trust', 'leadership'
    ];

    return commonPoliticalMessages.filter(message =>
      responseText.toLowerCase().includes(message)
    );
  }

  private calculateMessageDisciplineScore(keyMessages: string[], question: DynamicQuestion): number {
    // Score based on how well the response stayed on preferred messages
    const questionTopic = this.extractQuestionTopic(question.question);
    const relevantMessages = keyMessages.filter(msg =>
      this.isMessageRelevantToTopic(msg, questionTopic)
    );

    return Math.min(100, (relevantMessages.length / Math.max(1, keyMessages.length)) * 100);
  }

  private extractMainTopic(responseText: string): string {
    // Simple topic extraction
    if (responseText.toLowerCase().includes('econom')) return 'the economy';
    if (responseText.toLowerCase().includes('healthcare')) return 'healthcare';
    if (responseText.toLowerCase().includes('education')) return 'education';
    if (responseText.toLowerCase().includes('climate')) return 'climate change';
    return 'policy issues';
  }

  private selectBestCounterAttack(counterAttacks: string[], opponent: DebateOpponent, responseText: string): string {
    // Select counter-attack based on opponent's likely strengths
    if (opponent.strengths.includes('economy') && responseText.toLowerCase().includes('econom')) {
      return counterAttacks[1]; // Economic focus counter
    } else if (opponent.strengths.includes('experience')) {
      return counterAttacks[2]; // Experience/preparedness attack
    } else {
      return counterAttacks[0]; // Generic out-of-touch attack
    }
  }

  private identifyStrengthAreas(): string[] {
    const strengths = [];

    if (this.state.performanceMetrics.confidence > 70) {
      strengths.push("Strong confidence and composure");
    }
    if (this.state.performanceMetrics.consistency > 70) {
      strengths.push("Good message discipline");
    }
    if (this.state.performanceMetrics.authenticity > 70) {
      strengths.push("Authentic communication style");
    }

    return strengths.length > 0 ? strengths : ["Developing debate skills"];
  }

  private identifyImprovementAreas(): string[] {
    const improvements = [];

    if (this.vulnerabilityAssessment.getOverallVulnerabilityLevel() > 50) {
      improvements.push("Address policy vulnerabilities");
    }
    if (this.messageTraining.getOverallScore() < 60) {
      improvements.push("Improve message discipline");
    }
    if (this.state.performanceMetrics.majorMistakes.length > 2) {
      improvements.push("Reduce unforced errors");
    }

    return improvements.length > 0 ? improvements : ["Continue practicing"];
  }

  private generateOpponentAnalysis(): any {
    return this.debateConfig.opponentProfiles.map(opponent => ({
      name: opponent.name,
      primaryThreat: opponent.strengths[0] || 'Unknown',
      recommendedCounterStrategy: this.getCounterStrategy(opponent),
      vulnerabilityToExploit: opponent.weaknesses[0] || 'None identified',
      defenseReadiness: this.opponentSimulation.getDefenseScore(opponent.id)
    }));
  }

  private generateRecommendedStrategy(): string {
    const confidence = this.calculateDebateConfidence();
    const preparationFocus = this.debateConfig.preparationFocus;

    if (preparationFocus === 'attack') {
      return confidence > 70 ?
        "Go on the offensive early and maintain pressure" :
        "Focus on targeted attacks where you have clear advantages";
    } else if (preparationFocus === 'defense') {
      return "Prepare strong defensive responses and pivot to your strengths quickly";
    } else if (preparationFocus === 'policy') {
      return "Stay focused on policy details and demonstrate expertise";
    } else {
      return "Emphasize your character and leadership qualities";
    }
  }

  private getCounterStrategy(opponent: DebateOpponent): string {
    if (opponent.strengths.includes('experience')) {
      return "Emphasize fresh perspective and change";
    } else if (opponent.strengths.includes('economy')) {
      return "Focus on economic inequality and fairness";
    } else {
      return "Challenge their record and results";
    }
  }

  private calculateAverageResponseTime(): number {
    if (this.state.playerResponses.length < 2) return 0;

    const responseTimes = [];
    for (let i = 1; i < this.state.playerResponses.length; i++) {
      const timeDiff = this.state.playerResponses[i].timestamp - this.state.playerResponses[i-1].timestamp;
      responseTimes.push(timeDiff / 1000); // Convert to seconds
    }

    return responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
  }

  private extractQuestionTopic(question: string): string {
    // Simple topic extraction from question text
    const lowerQuestion = question.toLowerCase();
    if (lowerQuestion.includes('econom')) return 'economy';
    if (lowerQuestion.includes('health')) return 'healthcare';
    if (lowerQuestion.includes('education')) return 'education';
    if (lowerQuestion.includes('climate')) return 'climate';
    if (lowerQuestion.includes('security')) return 'security';
    return 'general';
  }

  private isMessageRelevantToTopic(message: string, topic: string): boolean {
    const relevanceMap: Record<string, string[]> = {
      'economy': ['jobs', 'economy', 'families'],
      'healthcare': ['healthcare', 'families'],
      'education': ['education', 'future', 'families'],
      'climate': ['climate', 'future'],
      'security': ['security', 'leadership'],
      'general': ['leadership', 'experience', 'trust', 'change']
    };

    return relevanceMap[topic]?.includes(message) || false;
  }
}

// Supporting classes for debate preparation

class OpponentSimulation {
  private opponents: DebateOpponent[];
  private defensePerformance: Map<string, number[]> = new Map();

  constructor(opponents: DebateOpponent[]) {
    this.opponents = opponents;
  }

  evaluateDefense(opponent: DebateOpponent, responseText: string, tone: string): number {
    let effectiveness = 50; // Base effectiveness

    // Check if response addresses opponent's likely attacks
    const likelyAttacks = opponent.likelyAttackVectors || [];
    const addressedAttacks = likelyAttacks.filter(attack =>
      responseText.toLowerCase().includes(attack.toLowerCase())
    );

    effectiveness += (addressedAttacks.length / Math.max(1, likelyAttacks.length)) * 30;

    // Adjust based on tone appropriateness
    if (tone === 'confident' || tone === 'diplomatic') {
      effectiveness += 10;
    } else if (tone === 'defensive' || tone === 'evasive') {
      effectiveness -= 15;
    }

    return Math.max(0, Math.min(100, effectiveness));
  }

  recordDefensePerformance(opponentId: string, effectiveness: number): void {
    if (!this.defensePerformance.has(opponentId)) {
      this.defensePerformance.set(opponentId, []);
    }
    this.defensePerformance.get(opponentId)!.push(effectiveness);
  }

  getDefenseReadinessScore(): number {
    let totalScore = 0;
    let totalEntries = 0;

    this.defensePerformance.forEach(scores => {
      totalScore += scores.reduce((sum, score) => sum + score, 0);
      totalEntries += scores.length;
    });

    return totalEntries > 0 ? totalScore / totalEntries : 50;
  }

  getDefenseScore(opponentId: string): number {
    const scores = this.defensePerformance.get(opponentId) || [50];
    return scores.reduce((sum, score) => sum + score, 0) / scores.length;
  }
}

class MessageTraining {
  private focus: string;
  private messageDisciplineScores: number[] = [];

  constructor(focus: string) {
    this.focus = focus;
  }

  recordMessageDiscipline(questionId: string, score: number): void {
    this.messageDisciplineScores.push(score);
  }

  getOverallScore(): number {
    if (this.messageDisciplineScores.length === 0) return 50;
    return this.messageDisciplineScores.reduce((sum, score) => sum + score, 0) / this.messageDisciplineScores.length;
  }
}

class VulnerabilityAssessment {
  private keyIssues: DebateIssue[];
  private backgroundId: string;
  private identifiedVulnerabilities: Array<{description: string, severity: number}> = [];

  constructor(keyIssues: DebateIssue[], backgroundId: string) {
    this.keyIssues = keyIssues;
    this.backgroundId = backgroundId;
  }

  identifyNewVulnerabilities(responseText: string): Array<{description: string, severity: number}> {
    const newVulnerabilities = [];

    // Check for contradictions or weak positions
    if (responseText.toLowerCase().includes('i don\'t know')) {
      newVulnerabilities.push({
        description: "Admitted lack of knowledge on policy issue",
        severity: 60
      });
    }

    if (responseText.toLowerCase().includes('that\'s not my fault')) {
      newVulnerabilities.push({
        description: "Deflected responsibility - may appear weak",
        severity: 40
      });
    }

    // Add to identified vulnerabilities
    this.identifiedVulnerabilities.push(...newVulnerabilities);

    return newVulnerabilities;
  }

  getOverallVulnerabilityLevel(): number {
    if (this.identifiedVulnerabilities.length === 0) return 20; // Low baseline vulnerability

    const averageSeverity = this.identifiedVulnerabilities.reduce((sum, vuln) => sum + vuln.severity, 0) /
                           this.identifiedVulnerabilities.length;

    return Math.min(100, averageSeverity + (this.identifiedVulnerabilities.length * 5));
  }
}