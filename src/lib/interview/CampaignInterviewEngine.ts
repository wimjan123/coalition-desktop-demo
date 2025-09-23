/**
 * Campaign Interview Engine
 * Handles election campaign interviews with momentum tracking and voter impact
 */

import type {
  InterviewConfig,
  InterviewResult,
  ConversationState,
  PlayerResponse,
  ConversationAction,
  QuestionArc
} from '../types/interview.js';

import { InterviewEngine } from './InterviewEngine.js';
import { CampaignQuestionArcFactory } from './CampaignQuestionArcFactory.js';

export interface CampaignInterviewConfig extends InterviewConfig {
  campaignPhase: 'early' | 'mid' | 'late' | 'final-week';
  currentPolling: CampaignPolling;
  campaignMomentum: 'rising' | 'stable' | 'falling' | 'surging';
  keyDemographics: string[];
  upcomingEvents: CampaignEvent[];
  opponentActivity: OpponentActivity[];
  mediaEnvironment: CampaignMediaEnvironment;
}

export interface CampaignPolling {
  overall: number; // Current polling percentage
  demographic_breakdown: Record<string, number>;
  trend: 'up' | 'down' | 'stable';
  margin_of_error: number;
}

export interface CampaignEvent {
  type: 'debate' | 'rally' | 'town-hall' | 'policy-speech' | 'endorsement';
  daysUntil: number;
  importance: 'low' | 'medium' | 'high' | 'critical';
  preparationNeeded: string[];
}

export interface OpponentActivity {
  opponentName: string;
  recentActivity: string;
  impact: 'positive' | 'negative' | 'neutral';
  responseNeeded: boolean;
}

export interface CampaignMediaEnvironment {
  coverage_tone: 'favorable' | 'neutral' | 'critical' | 'hostile';
  attention_level: 'low' | 'medium' | 'high' | 'intense';
  dominant_narratives: string[];
  journalist_relationships: Record<string, 'good' | 'neutral' | 'poor'>;
}

export class CampaignInterviewEngine extends InterviewEngine {
  private campaignConfig: CampaignInterviewConfig;
  private momentumTracker: CampaignMomentumTracker;
  private voterImpactAnalyzer: VoterImpactAnalyzer;
  private messageConsistency: MessageConsistencyTracker;
  private electionPredictor: ElectionPredictor;

  constructor(config: CampaignInterviewConfig) {
    super(config);
    this.campaignConfig = config;
    this.initializeCampaignSystems();
  }

  private initializeCampaignSystems(): void {
    this.momentumTracker = new CampaignMomentumTracker(
      this.campaignConfig.campaignMomentum,
      this.campaignConfig.currentPolling
    );

    this.voterImpactAnalyzer = new VoterImpactAnalyzer(
      this.campaignConfig.keyDemographics,
      this.campaignConfig.currentPolling.demographic_breakdown
    );

    this.messageConsistency = new MessageConsistencyTracker(
      this.campaignConfig.campaignPhase
    );

    this.electionPredictor = new ElectionPredictor(
      this.campaignConfig.currentPolling,
      this.campaignConfig.campaignPhase
    );
  }

  async conductCampaignInterview(): Promise<InterviewResult> {
    const result = await super.conductInterview();

    // Add campaign-specific performance metrics
    result.performance = {
      ...result.performance,
      ...this.calculateCampaignMetrics()
    };

    // Generate campaign-specific aftermath
    result.aftermath = {
      ...result.aftermath,
      campaignImpact: this.generateCampaignImpact(),
      voterReactions: this.generateVoterReactions(),
      mediaAnalysis: this.generateMediaAnalysis(),
      momentumChange: this.calculateMomentumChange(),
      electionProjection: this.generateElectionProjection()
    };

    return result;
  }

  async processResponse(responseText: string, tone: string): Promise<ConversationAction> {
    // Track campaign messaging consistency
    this.messageConsistency.analyzeMessage(responseText, tone);

    // Analyze voter impact of response
    this.voterImpactAnalyzer.analyzeResponse(responseText, tone);

    // Update campaign momentum
    this.momentumTracker.updateMomentum(responseText, tone, this.getCurrentQuestionContext());

    // Check for campaign-changing moments
    this.checkForCampaignMoments(responseText, tone);

    // Process with base engine
    const action = await super.processResponse(responseText, tone);

    // Add campaign-specific enhancements
    return this.enhanceWithCampaignLogic(action, responseText, tone);
  }

  private checkForCampaignMoments(responseText: string, tone: string): void {
    // Check for viral moments
    const viralPotential = this.assessViralPotential(responseText, tone);
    if (viralPotential > 70) {
      this.momentumTracker.recordViralMoment(responseText, viralPotential);
    }

    // Check for major gaffes
    const gaffePotential = this.assessGaffePotential(responseText, tone);
    if (gaffePotential > 60) {
      this.momentumTracker.recordGaffe(responseText, gaffePotential);
    }

    // Check for breakthrough moments
    const breakthroughPotential = this.assessBreakthroughPotential(responseText, tone);
    if (breakthroughPotential > 75) {
      this.momentumTracker.recordBreakthrough(responseText, breakthroughPotential);
    }
  }

  private assessViralPotential(responseText: string, tone: string): number {
    let potential = 0;

    // Memorable phrases
    if (responseText.length < 100 && tone === 'confident') {
      potential += 20;
    }

    // Emotional content
    if (['passionate', 'confrontational'].includes(tone)) {
      potential += 15;
    }

    // Policy specifics that are quotable
    if (responseText.includes('I will') && responseText.includes('immediately')) {
      potential += 25;
    }

    // Personal stories
    if (responseText.toLowerCase().includes('my family') ||
        responseText.toLowerCase().includes('when i was')) {
      potential += 20;
    }

    // Unexpected honesty
    if (responseText.toLowerCase().includes('i made a mistake') ||
        responseText.toLowerCase().includes('i was wrong')) {
      potential += 30;
    }

    return Math.min(100, potential);
  }

  private assessGaffePotential(responseText: string, tone: string): number {
    let potential = 0;

    // Factual errors
    if (this.containsLikelyFactualError(responseText)) {
      potential += 40;
    }

    // Insensitive language
    if (this.containsInsensitiveLanguage(responseText)) {
      potential += 35;
    }

    // Contradictions with previous positions
    if (this.contradictsKnownPositions(responseText)) {
      potential += 30;
    }

    // Unclear or confusing statements
    if (responseText.length > 200 && tone === 'evasive') {
      potential += 25;
    }

    // Defensive overreactions
    if (tone === 'aggressive' && responseText.toLowerCase().includes('attack')) {
      potential += 20;
    }

    return Math.min(100, potential);
  }

  private assessBreakthroughPotential(responseText: string, tone: string): number {
    let potential = 0;

    // Clear policy vision
    if (responseText.includes('here\'s how') && responseText.length > 100) {
      potential += 25;
    }

    // Inspiring language
    if (tone === 'confident' &&
        (responseText.toLowerCase().includes('future') ||
         responseText.toLowerCase().includes('together'))) {
      potential += 20;
    }

    // Addresses key voter concerns
    const voterConcerns = ['jobs', 'healthcare', 'housing', 'climate'];
    const addressesConcerns = voterConcerns.filter(concern =>
      responseText.toLowerCase().includes(concern)
    ).length;
    potential += addressesConcerns * 15;

    // Demonstrates competence
    if (responseText.includes('experience') && responseText.includes('results')) {
      potential += 20;
    }

    return Math.min(100, potential);
  }

  private enhanceWithCampaignLogic(
    action: ConversationAction,
    responseText: string,
    tone: string
  ): ConversationAction {
    // Add momentum indicators
    const momentumChange = this.momentumTracker.getRecentMomentumChange();
    if (Math.abs(momentumChange) > 5) {
      action.metadata = {
        ...action.metadata,
        momentumShift: momentumChange > 0 ? 'positive' : 'negative',
        momentumMagnitude: Math.abs(momentumChange)
      };
    }

    // Add voter reaction predictions
    const voterReactions = this.voterImpactAnalyzer.predictReactions(responseText, tone);
    if (Object.keys(voterReactions).length > 0) {
      action.metadata = {
        ...action.metadata,
        voterReactions,
        demographicImpact: this.calculateDemographicImpact(voterReactions)
      };
    }

    // Add campaign phase specific guidance
    action.metadata = {
      ...action.metadata,
      campaignPhase: this.campaignConfig.campaignPhase,
      daysToElection: this.calculateDaysToElection(),
      campaignAdvice: this.generateCampaignAdvice(responseText, tone)
    };

    return action;
  }

  private calculateCampaignMetrics(): any {
    return {
      campaignMomentum: this.momentumTracker.getCurrentMomentum(),
      messageConsistency: this.messageConsistency.getConsistencyScore(),
      voterConnection: this.voterImpactAnalyzer.getOverallConnection(),
      mediaHandling: this.calculateMediaHandling(),
      electoralProjection: this.electionPredictor.getCurrentProjection(),
      campaignDiscipline: this.calculateCampaignDiscipline(),
      demographicAppeals: this.voterImpactAnalyzer.getDemographicAppeals()
    };
  }

  private calculateMediaHandling(): number {
    let handling = 50; // Base score

    // Adjust based on tone appropriateness
    const appropriateTones = ['professional', 'confident', 'diplomatic'];
    const lastResponses = this.state.playerResponses.slice(-3);
    const appropriateToneCount = lastResponses.filter(r =>
      appropriateTones.includes(r.tone)
    ).length;

    handling += (appropriateToneCount / Math.max(1, lastResponses.length)) * 30;

    // Adjust based on message consistency
    handling += (this.messageConsistency.getConsistencyScore() - 50) * 0.4;

    // Adjust based on media environment
    if (this.campaignConfig.mediaEnvironment.coverage_tone === 'hostile') {
      handling += 10; // Bonus for surviving hostile environment
    }

    return Math.max(0, Math.min(100, handling));
  }

  private calculateCampaignDiscipline(): number {
    let discipline = 50;

    // Message consistency is key to discipline
    discipline += (this.messageConsistency.getConsistencyScore() - 50) * 0.6;

    // Staying on message under pressure
    const pressureResponses = this.state.playerResponses.filter(r =>
      r.contradictsPrevious === false && r.wordCount > 30
    );
    discipline += (pressureResponses.length / Math.max(1, this.state.playerResponses.length)) * 30;

    // Avoiding gaffes
    const gaffeCount = this.state.performanceMetrics.majorMistakes.length;
    discipline -= gaffeCount * 10;

    return Math.max(0, Math.min(100, discipline));
  }

  private generateCampaignImpact(): any {
    return {
      momentumChange: this.momentumTracker.getOverallMomentumChange(),
      pollingProjection: this.calculatePollingProjection(),
      fundraisingImpact: this.calculateFundraisingImpact(),
      volunteerImpact: this.calculateVolunteerImpact(),
      endorsementImpact: this.calculateEndorsementImpact(),
      mediaAttentionChange: this.calculateMediaAttentionChange()
    };
  }

  private generateVoterReactions(): any {
    return this.voterImpactAnalyzer.generateDetailedReactions();
  }

  private generateMediaAnalysis(): any {
    return {
      coverageTone: this.predictCoverageTone(),
      headlineProjections: this.generateHeadlineProjections(),
      journalistReactions: this.generateJournalistReactions(),
      editorialResponse: this.generateEditorialResponse(),
      socialMediaBuzz: this.generateSocialMediaBuzz()
    };
  }

  private calculateMomentumChange(): number {
    return this.momentumTracker.getOverallMomentumChange();
  }

  private generateElectionProjection(): any {
    return this.electionPredictor.generateProjection(this.state.performanceMetrics);
  }

  // Helper calculation methods

  private calculatePollingProjection(): Record<string, number> {
    const basePolling = this.campaignConfig.currentPolling.overall;
    const momentumChange = this.momentumTracker.getOverallMomentumChange();

    return {
      overall: Math.max(0, Math.min(100, basePolling + momentumChange)),
      confidence: this.calculateProjectionConfidence(),
      timeframe: this.calculateProjectionTimeframe()
    };
  }

  private calculateFundraisingImpact(): number {
    const momentum = this.momentumTracker.getCurrentMomentum();
    const viralMoments = this.momentumTracker.getViralMoments().length;

    let impact = 0;
    if (momentum > 60) impact += 15;
    if (viralMoments > 0) impact += viralMoments * 10;

    return Math.max(-20, Math.min(30, impact));
  }

  private calculateVolunteerImpact(): number {
    const enthusiasm = this.voterImpactAnalyzer.getEnthusiasmLevel();
    const messageClarity = this.messageConsistency.getConsistencyScore();

    return Math.round((enthusiasm + messageClarity) / 2 - 50);
  }

  private calculateEndorsementImpact(): number {
    const credibility = this.state.performanceMetrics.authenticity;
    const competence = this.state.performanceMetrics.confidence;

    return Math.round((credibility + competence) / 2 - 50);
  }

  private calculateMediaAttentionChange(): number {
    const viralMoments = this.momentumTracker.getViralMoments().length;
    const gaffes = this.momentumTracker.getGaffes().length;

    return (viralMoments * 10) + (gaffes * 15); // Both increase attention
  }

  private predictCoverageTone(): string {
    const performance = this.state.performanceMetrics.overallScore;
    const baseEnvironment = this.campaignConfig.mediaEnvironment.coverage_tone;

    if (performance > 80) return 'favorable';
    if (performance > 60) return 'neutral';
    if (performance > 40) return 'critical';
    return 'hostile';
  }

  private generateHeadlineProjections(): string[] {
    const headlines = [];
    const performance = this.state.performanceMetrics.overallScore;
    const momentum = this.momentumTracker.getCurrentMomentum();

    if (performance > 75 && momentum > 60) {
      headlines.push("Candidate Shows Strong Command in Key Interview");
      headlines.push("Campaign Momentum Builds After Solid Performance");
    } else if (performance < 40) {
      headlines.push("Candidate Struggles Under Pressure");
      headlines.push("Interview Raises Questions About Readiness");
    } else {
      headlines.push("Candidate Delivers Steady Performance");
      headlines.push("Mixed Reviews for Campaign Interview");
    }

    return headlines;
  }

  private generateJournalistReactions(): Record<string, string> {
    const reactions: Record<string, string> = {};
    const performance = this.state.performanceMetrics.overallScore;

    // Generate reactions based on journalist relationships and performance
    Object.entries(this.campaignConfig.mediaEnvironment.journalist_relationships).forEach(([journalist, relationship]) => {
      if (relationship === 'good' && performance > 60) {
        reactions[journalist] = "Impressed by the candidate's grasp of the issues";
      } else if (relationship === 'poor' || performance < 40) {
        reactions[journalist] = "Questions remain about the candidate's preparedness";
      } else {
        reactions[journalist] = "Mixed performance with both strengths and weaknesses";
      }
    });

    return reactions;
  }

  private generateEditorialResponse(): string {
    const performance = this.state.performanceMetrics.overallScore;
    const consistency = this.messageConsistency.getConsistencyScore();

    if (performance > 75 && consistency > 70) {
      return "Editorial boards likely to view performance favorably";
    } else if (performance < 40 || consistency < 40) {
      return "Editorial criticism expected over inconsistencies and weak responses";
    } else {
      return "Editorial response likely to be cautiously neutral";
    }
  }

  private generateSocialMediaBuzz(): any {
    return {
      viralMoments: this.momentumTracker.getViralMoments(),
      gaffes: this.momentumTracker.getGaffes(),
      overallSentiment: this.calculateSocialMediaSentiment(),
      shareability: this.calculateShareability(),
      engagement: this.calculateSocialEngagement()
    };
  }

  // More helper methods

  private getCurrentQuestionContext(): any {
    const currentQuestion = this.getCurrentQuestion();
    return {
      questionType: currentQuestion?.type || 'unknown',
      difficulty: this.questionArc?.difficulty || 'medium'
    };
  }

  private containsLikelyFactualError(responseText: string): boolean {
    // Simple heuristics for fact-checking
    return responseText.toLowerCase().includes('always') ||
           responseText.toLowerCase().includes('never') ||
           responseText.toLowerCase().includes('everyone knows');
  }

  private containsInsensitiveLanguage(responseText: string): boolean {
    // Basic insensitivity detection
    const insensitiveTerms = ['those people', 'you people', 'real dutch', 'real citizens'];
    return insensitiveTerms.some(term =>
      responseText.toLowerCase().includes(term)
    );
  }

  private contradictsKnownPositions(responseText: string): boolean {
    // Check against previous responses for consistency
    const previousPositions = this.state.conversationMemory.positionHistory;
    // Simplified - would need more sophisticated checking
    return false;
  }

  private calculateDemographicImpact(voterReactions: any): string {
    const positiveReactions = Object.values(voterReactions).filter(r => r === 'positive').length;
    const totalReactions = Object.values(voterReactions).length;

    if (positiveReactions / totalReactions > 0.7) return 'broad appeal';
    if (positiveReactions / totalReactions > 0.4) return 'mixed impact';
    return 'concerning reactions';
  }

  private calculateDaysToElection(): number {
    // Simplified - in real implementation would calculate from actual election date
    const phaseMapping = {
      'early': 120,
      'mid': 60,
      'late': 20,
      'final-week': 5
    };
    return phaseMapping[this.campaignConfig.campaignPhase];
  }

  private generateCampaignAdvice(responseText: string, tone: string): string {
    const phase = this.campaignConfig.campaignPhase;
    const momentum = this.momentumTracker.getCurrentMomentum();

    if (phase === 'final-week') {
      return "Focus on closing arguments and voter turnout messages";
    } else if (momentum < 40) {
      return "Consider more aggressive messaging to change campaign dynamics";
    } else if (momentum > 70) {
      return "Maintain discipline and avoid unnecessary risks";
    } else {
      return "Build on strengths while addressing key voter concerns";
    }
  }

  private calculateProjectionConfidence(): number {
    const consistency = this.messageConsistency.getConsistencyScore();
    const sampleSize = this.state.playerResponses.length;
    return Math.min(90, 30 + (consistency * 0.4) + (sampleSize * 2));
  }

  private calculateProjectionTimeframe(): string {
    return this.campaignConfig.campaignPhase === 'final-week' ? 'immediate' : 'next-week';
  }

  private calculateSocialMediaSentiment(): string {
    const viralMoments = this.momentumTracker.getViralMoments().length;
    const gaffes = this.momentumTracker.getGaffes().length;

    if (viralMoments > gaffes) return 'positive';
    if (gaffes > viralMoments) return 'negative';
    return 'neutral';
  }

  private calculateShareability(): number {
    const viralMoments = this.momentumTracker.getViralMoments();
    const avgViralScore = viralMoments.length > 0 ?
      viralMoments.reduce((sum, m) => sum + m.potential, 0) / viralMoments.length : 0;

    return Math.min(100, avgViralScore);
  }

  private calculateSocialEngagement(): string {
    const shareability = this.calculateShareability();

    if (shareability > 70) return 'high';
    if (shareability > 40) return 'medium';
    return 'low';
  }
}

// Supporting classes would be implemented here...
// For brevity, showing class stubs:

class CampaignMomentumTracker {
  private momentum: string;
  private polling: CampaignPolling;
  private viralMoments: Array<{text: string, potential: number}> = [];
  private gaffes: Array<{text: string, severity: number}> = [];
  private momentumHistory: number[] = [];

  constructor(momentum: string, polling: CampaignPolling) {
    this.momentum = momentum;
    this.polling = polling;
    this.momentumHistory.push(50); // Base momentum
  }

  updateMomentum(responseText: string, tone: string, context: any): void {
    // Implementation would track momentum changes
  }

  recordViralMoment(text: string, potential: number): void {
    this.viralMoments.push({text: text.substring(0, 100), potential});
  }

  recordGaffe(text: string, severity: number): void {
    this.gaffes.push({text: text.substring(0, 100), severity});
  }

  recordBreakthrough(text: string, potential: number): void {
    // Record breakthrough moments
  }

  getCurrentMomentum(): number {
    return this.momentumHistory[this.momentumHistory.length - 1] || 50;
  }

  getRecentMomentumChange(): number {
    if (this.momentumHistory.length < 2) return 0;
    const recent = this.momentumHistory[this.momentumHistory.length - 1];
    const previous = this.momentumHistory[this.momentumHistory.length - 2];
    return recent - previous;
  }

  getOverallMomentumChange(): number {
    if (this.momentumHistory.length < 2) return 0;
    return this.getCurrentMomentum() - this.momentumHistory[0];
  }

  getViralMoments(): Array<{text: string, potential: number}> {
    return this.viralMoments;
  }

  getGaffes(): Array<{text: string, severity: number}> {
    return this.gaffes;
  }
}

class VoterImpactAnalyzer {
  constructor(private demographics: string[], private baseline: Record<string, number>) {}

  analyzeResponse(responseText: string, tone: string): void {
    // Implementation would analyze voter impact
  }

  predictReactions(responseText: string, tone: string): Record<string, string> {
    return {}; // Simplified
  }

  getOverallConnection(): number {
    return 50; // Simplified
  }

  getEnthusiasmLevel(): number {
    return 50; // Simplified
  }

  getDemographicAppeals(): Record<string, number> {
    return {}; // Simplified
  }

  generateDetailedReactions(): any {
    return {}; // Simplified
  }
}

class MessageConsistencyTracker {
  constructor(private phase: string) {}

  analyzeMessage(responseText: string, tone: string): void {
    // Implementation would track message consistency
  }

  getConsistencyScore(): number {
    return 50; // Simplified
  }
}

class ElectionPredictor {
  constructor(private polling: CampaignPolling, private phase: string) {}

  getCurrentProjection(): any {
    return {}; // Simplified
  }

  generateProjection(performance: any): any {
    return {}; // Simplified
  }
}