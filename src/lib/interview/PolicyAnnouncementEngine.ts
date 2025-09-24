/**
 * Policy Announcement Interview Engine
 * Manages sophisticated policy announcement interviews with real-time scrutiny and performance tracking
 */

import type {
  InterviewConfig,
  QuestionArc,
  DynamicQuestion,
  InterviewerPersonality,
  ConversationMemory,
  PolicyAnnouncementConfig,
  PolicyDetails,
  AnnouncementContext,
  PolicyAnnouncementPerformance,
  PolicyInterviewAnalytics,
  PolicyStakeholderReaction,
  OppositionResponse,
  PolicyMediaScrutiny,
  PolicyQuestionType,
  AnticipatedCriticism,
  PolicyWeakPoint,
  MediaVulnerability
} from '../types/interview.js';

import { InterviewEngine } from './InterviewEngine.js';

export class PolicyAnnouncementEngine extends InterviewEngine {
  private policyConfig: PolicyAnnouncementConfig;
  private performance: PolicyAnnouncementPerformance;
  private analytics: PolicyInterviewAnalytics;
  private stakeholderReactions: Map<string, number> = new Map(); // stakeholder -> sentiment
  private messageConsistency: string[] = []; // Track message consistency
  private evidenceUsage: Map<string, number> = new Map(); // Track evidence citations
  private vulnerabilityExposure: Map<string, number> = new Map(); // Track weaknesses exposed
  private narrativeControl: number = 70; // Overall narrative control score

  constructor(
    config: InterviewConfig,
    policyConfig: PolicyAnnouncementConfig,
    personality: InterviewerPersonality,
    memory: ConversationMemory
  ) {
    super(config, personality, memory);
    this.policyConfig = policyConfig;
    this.performance = this.initializePerformance();
    this.analytics = this.initializeAnalytics();
    this.initializeStakeholderSentiment();
  }

  private initializePerformance(): PolicyAnnouncementPerformance {
    return {
      messageClarity: 70,
      evidenceCredibility: this.calculateInitialCredibility(),
      stakeholderManagement: 65,
      implementationConfidence: this.calculateImplementationConfidence(),
      politicalSkill: 60,
      publicCommunication: 65
    };
  }

  private initializeAnalytics(): PolicyInterviewAnalytics {
    return {
      preparedness: this.calculatePreparedness(),
      messageConsistency: 80,
      questionHandling: 60,
      credibilityMaintenance: 70,
      narrativeControl: 70,
      stakeholderReassurance: 60
    };
  }

  private calculateInitialCredibility(): number {
    const evidenceQuality = this.policyConfig.policyDetails.evidenceBase;
    const evidenceScores = {
      'strong': 85,
      'moderate': 70,
      'weak': 40,
      'experimental': 30,
      'ideological': 20
    };

    let credibility = evidenceScores[evidenceQuality];

    // Adjust for policy complexity and cost uncertainty
    const costUncertainty = this.policyConfig.policyDetails.estimatedCost.uncertainty;
    if (costUncertainty === 'high') credibility -= 15;
    else if (costUncertainty === 'unknown') credibility -= 25;

    return Math.max(20, Math.min(90, credibility));
  }

  private calculateImplementationConfidence(): number {
    const implementation = this.policyConfig.implementation;
    let confidence = 60; // Base confidence

    // Factor in implementation complexity
    const highRiskCount = implementation.riskAssessment.filter(r => r.impact > 70).length;
    confidence -= (highRiskCount * 10);

    // Factor in resource availability
    const unavailableResources = implementation.resourceRequirements.filter(
      r => r.availability === 'scarce' || r.availability === 'uncertain'
    ).length;
    confidence -= (unavailableResources * 8);

    // Factor in legislative requirements
    const complexLegislation = implementation.requiredLegislation.filter(
      l => l.complexity === 'complex' || l.complexity === 'highly-complex'
    ).length;
    confidence -= (complexLegislation * 12);

    return Math.max(20, Math.min(90, confidence));
  }

  private calculatePreparedness(): number {
    let preparedness = 70; // Base preparedness

    // Factor in media strategy comprehensiveness
    const mediaStrategy = this.policyConfig.mediaScrutiny.communicationStrategy;
    if (mediaStrategy.interviewPreparation.keyQuestions.length > 8) preparedness += 10;
    if (mediaStrategy.interviewPreparation.difficultScenarios.length > 5) preparedness += 8;

    // Factor in anticipated criticism preparation
    const preparedCriticisms = this.policyConfig.mediaScrutiny.communicationStrategy
      .messagingStrategy.supportingPoints.length;
    preparedness += Math.min(15, preparedCriticisms * 2);

    // Factor in stakeholder engagement
    const engagedStakeholders = this.policyConfig.announcementContext.mediaStrategy
      .stakeholderEngagement.length;
    preparedness += Math.min(10, engagedStakeholders);

    return Math.max(30, Math.min(95, preparedness));
  }

  private initializeStakeholderSentiment(): void {
    this.policyConfig.stakeholderReactions.forEach(reaction => {
      this.stakeholderReactions.set(
        reaction.stakeholder,
        reaction.predictedReaction.supportLevel
      );
    });
  }

  // Core engine methods
  public processResponse(response: string, questionId: string): void {
    super.processResponse(response, questionId);

    this.analyzeMessageConsistency(response, questionId);
    this.assessEvidenceUsage(response);
    this.evaluateStakeholderReassurance(response, questionId);
    this.trackVulnerabilityExposure(response, questionId);
    this.updateNarrativeControl(response, questionId);
    this.calculatePerformanceMetrics();
    this.updateAnalytics();
  }

  private analyzeMessageConsistency(response: string, questionId: string): void {
    const question = this.currentArc?.questions.find(q => q.id === questionId);
    if (!question) return;

    // Extract key message elements from response
    const coreMessage = this.policyConfig.mediaScrutiny.communicationStrategy
      .messagingStrategy.coreMessage;

    const keyPoints = this.policyConfig.mediaScrutiny.communicationStrategy
      .messagingStrategy.supportingPoints;

    // Check message consistency
    const lowerResponse = response.toLowerCase();
    const lowerCoreMessage = coreMessage.toLowerCase();

    // Basic consistency check - are we staying on message?
    let consistencyScore = 0;

    // Check if core message elements appear in response
    const coreWords = lowerCoreMessage.split(' ').filter(word => word.length > 3);
    const responseWords = lowerResponse.split(' ');

    coreWords.forEach(word => {
      if (responseWords.includes(word)) {
        consistencyScore += 1;
      }
    });

    // Check if supporting points are referenced
    keyPoints.forEach(point => {
      const pointWords = point.toLowerCase().split(' ').filter(word => word.length > 3);
      const pointMatches = pointWords.filter(word => responseWords.includes(word));
      if (pointMatches.length > pointWords.length * 0.3) {
        consistencyScore += 2;
      }
    });

    // Update message consistency tracking
    this.messageConsistency.push(`Q${questionId}: ${consistencyScore}`);

    // Update analytics
    const avgConsistency = consistencyScore > 3 ? 5 : consistencyScore < 1 ? -5 : 0;
    this.analytics.messageConsistency = Math.max(0, Math.min(100,
      this.analytics.messageConsistency + avgConsistency
    ));
  }

  private assessEvidenceUsage(response: string): void {
    const evidenceIndicators = [
      'research shows', 'studies demonstrate', 'data indicates', 'evidence suggests',
      'analysis reveals', 'statistics show', 'experts confirm', 'research confirms',
      'proven track record', 'successful examples', 'pilot program results',
      'international experience', 'best practices', 'peer-reviewed'
    ];

    const lowQualityIndicators = [
      'we believe', 'it\'s clear that', 'obviously', 'everyone knows',
      'common sense', 'it\'s obvious', 'clearly', 'without doubt'
    ];

    const lowerResponse = response.toLowerCase();
    let evidenceScore = 0;

    evidenceIndicators.forEach(indicator => {
      if (lowerResponse.includes(indicator)) {
        evidenceScore += 2;
        // Track specific evidence usage
        const currentUsage = this.evidenceUsage.get(indicator) || 0;
        this.evidenceUsage.set(indicator, currentUsage + 1);
      }
    });

    lowQualityIndicators.forEach(indicator => {
      if (lowerResponse.includes(indicator)) {
        evidenceScore -= 1;
      }
    });

    // Update evidence credibility
    this.performance.evidenceCredibility = Math.max(0, Math.min(100,
      this.performance.evidenceCredibility + evidenceScore
    ));
  }

  private evaluateStakeholderReassurance(response: string, questionId: string): void {
    const stakeholderNames = Array.from(this.stakeholderReactions.keys());
    const lowerResponse = response.toLowerCase();

    // Check if response addresses stakeholder concerns
    stakeholderNames.forEach(stakeholder => {
      const stakeholderLower = stakeholder.toLowerCase();

      if (lowerResponse.includes(stakeholderLower) ||
          this.implicitlyAddressesStakeholder(lowerResponse, stakeholder)) {

        const sentiment = this.analyzeStakeholderSentiment(response, stakeholder);
        const currentSentiment = this.stakeholderReactions.get(stakeholder) || 0;

        // Update stakeholder sentiment
        const newSentiment = Math.max(-100, Math.min(100,
          currentSentiment + sentiment
        ));
        this.stakeholderReactions.set(stakeholder, newSentiment);
      }
    });

    // Update stakeholder management performance
    const avgSentiment = Array.from(this.stakeholderReactions.values())
      .reduce((sum, sentiment) => sum + sentiment, 0) / this.stakeholderReactions.size;

    this.performance.stakeholderManagement = Math.max(0, Math.min(100,
      50 + (avgSentiment / 2) // Convert -100/100 to 0-100 scale
    ));
  }

  private implicitlyAddressesStakeholder(response: string, stakeholder: string): boolean {
    // Map stakeholders to related terms
    const stakeholderKeywords: Record<string, string[]> = {
      'business': ['companies', 'industry', 'employers', 'private sector', 'economy'],
      'unions': ['workers', 'employees', 'labor', 'job security', 'workplace'],
      'consumers': ['families', 'households', 'citizens', 'people', 'individuals'],
      'healthcare': ['patients', 'medical', 'health', 'hospitals', 'doctors'],
      'education': ['students', 'teachers', 'schools', 'universities', 'learning'],
      'environment': ['climate', 'green', 'sustainability', 'carbon', 'renewable'],
      'farmers': ['agriculture', 'rural', 'farming', 'food production', 'countryside']
    };

    const keywords = stakeholderKeywords[stakeholder.toLowerCase()] || [];
    return keywords.some(keyword => response.toLowerCase().includes(keyword));
  }

  private analyzeStakeholderSentiment(response: string, stakeholder: string): number {
    const positiveIndicators = [
      'support', 'benefit', 'help', 'improve', 'strengthen', 'protect',
      'opportunity', 'growth', 'investment', 'partnership', 'collaboration'
    ];

    const negativeIndicators = [
      'burden', 'cost', 'challenge', 'difficult', 'sacrifice', 'tough choices',
      'unfortunately', 'however', 'but', 'restrictions', 'limits'
    ];

    const lowerResponse = response.toLowerCase();
    let sentiment = 0;

    positiveIndicators.forEach(indicator => {
      if (lowerResponse.includes(indicator)) sentiment += 1;
    });

    negativeIndicators.forEach(indicator => {
      if (lowerResponse.includes(indicator)) sentiment -= 1;
    });

    return Math.max(-5, Math.min(5, sentiment));
  }

  private trackVulnerabilityExposure(response: string, questionId: string): void {
    const vulnerabilities = this.policyConfig.oppositionResponse.vulnerabilityAssessment.weakPoints;
    const lowerResponse = response.toLowerCase();

    vulnerabilities.forEach(weakness => {
      const weaknessKeywords = weakness.weakness.toLowerCase().split(' ');
      const exposureIndicators = [
        'admit', 'acknowledge', 'yes, that\'s true', 'you\'re right',
        'challenge', 'difficult', 'uncertain', 'don\'t know', 'unclear'
      ];

      // Check if response exposes this vulnerability
      let exposureLevel = 0;

      // Check if weakness keywords appear with exposure indicators
      weaknessKeywords.forEach(keyword => {
        if (lowerResponse.includes(keyword)) {
          exposureIndicators.forEach(indicator => {
            if (lowerResponse.includes(indicator)) {
              exposureLevel += 1;
            }
          });
        }
      });

      if (exposureLevel > 0) {
        const currentExposure = this.vulnerabilityExposure.get(weakness.weakness) || 0;
        this.vulnerabilityExposure.set(weakness.weakness, currentExposure + exposureLevel);

        // Reduce credibility maintenance
        this.analytics.credibilityMaintenance = Math.max(0,
          this.analytics.credibilityMaintenance - (exposureLevel * 3)
        );
      }
    });
  }

  private updateNarrativeControl(response: string, questionId: string): void {
    const question = this.currentArc?.questions.find(q => q.id === questionId);
    if (!question) return;

    // Assess whether response maintains narrative control
    const controlIndicators = [
      'let me be clear', 'the important thing is', 'what matters is',
      'the real issue here', 'we need to focus on', 'the key point',
      'our priority is', 'we\'re committed to', 'our plan will'
    ];

    const lossIndicators = [
      'i don\'t know', 'that\'s not my area', 'i\'ll have to get back',
      'we\'re still working on', 'that\'s a good question', 'you raise a good point',
      'i\'m not sure', 'we haven\'t decided', 'we\'re looking into'
    ];

    const lowerResponse = response.toLowerCase();
    let controlChange = 0;

    controlIndicators.forEach(indicator => {
      if (lowerResponse.includes(indicator)) controlChange += 2;
    });

    lossIndicators.forEach(indicator => {
      if (lowerResponse.includes(indicator)) controlChange -= 3;
    });

    // Check if response includes bridging to key messages
    const coreMessage = this.policyConfig.mediaScrutiny.communicationStrategy
      .messagingStrategy.coreMessage.toLowerCase();

    if (this.includesBridging(lowerResponse, coreMessage)) {
      controlChange += 3;
    }

    this.narrativeControl = Math.max(0, Math.min(100, this.narrativeControl + controlChange));
    this.analytics.narrativeControl = this.narrativeControl;
  }

  private includesBridging(response: string, coreMessage: string): boolean {
    const bridgingPhrases = [
      'but let\'s talk about', 'more importantly', 'what\'s really important',
      'the bigger picture is', 'we should focus on', 'let\'s not forget'
    ];

    const hasBridging = bridgingPhrases.some(phrase => response.includes(phrase));
    const includesCoreMessage = coreMessage.split(' ').some(word =>
      word.length > 3 && response.includes(word)
    );

    return hasBridging && includesCoreMessage;
  }

  private calculatePerformanceMetrics(): void {
    // Update message clarity based on consistency and evidence
    this.performance.messageClarity = Math.max(0, Math.min(100,
      (this.analytics.messageConsistency + this.performance.evidenceCredibility) / 2
    ));

    // Update implementation confidence based on question handling
    const confidenceBoost = this.analytics.questionHandling > 70 ? 2 : -1;
    this.performance.implementationConfidence = Math.max(0, Math.min(100,
      this.performance.implementationConfidence + confidenceBoost
    ));

    // Update political skill based on narrative control and stakeholder management
    this.performance.politicalSkill = Math.max(0, Math.min(100,
      (this.narrativeControl + this.performance.stakeholderManagement) / 2
    ));

    // Update public communication based on overall performance
    this.performance.publicCommunication = Math.max(0, Math.min(100,
      (this.performance.messageClarity + this.analytics.credibilityMaintenance +
       this.analytics.narrativeControl) / 3
    ));
  }

  private updateAnalytics(): void {
    // Update preparedness based on evidence usage
    const evidenceUsageCount = Array.from(this.evidenceUsage.values())
      .reduce((sum, count) => sum + count, 0);

    if (evidenceUsageCount > 0) {
      this.analytics.preparedness = Math.min(95, this.analytics.preparedness + 1);
    }

    // Update question handling based on narrative control maintenance
    const handlingImprovement = this.narrativeControl > 60 ? 2 : -2;
    this.analytics.questionHandling = Math.max(0, Math.min(100,
      this.analytics.questionHandling + handlingImprovement
    ));

    // Update stakeholder reassurance based on sentiment changes
    const avgSentiment = Array.from(this.stakeholderReactions.values())
      .reduce((sum, sentiment) => sum + sentiment, 0) / this.stakeholderReactions.size;

    this.analytics.stakeholderReassurance = Math.max(0, Math.min(100,
      50 + (avgSentiment / 2)
    ));
  }

  // Policy-specific assessment methods
  public assessCostJustification(response: string): number {
    const costIndicators = [
      'investment', 'value for money', 'economic benefit', 'return on investment',
      'long-term savings', 'cost-effective', 'efficient use', 'taxpayer value'
    ];

    const weakIndicators = [
      'expensive', 'costs a lot', 'significant expense', 'budget strain',
      'hard to justify', 'difficult to afford'
    ];

    const lowerResponse = response.toLowerCase();
    let score = 50; // Neutral baseline

    costIndicators.forEach(indicator => {
      if (lowerResponse.includes(indicator)) score += 8;
    });

    weakIndicators.forEach(indicator => {
      if (lowerResponse.includes(indicator)) score -= 10;
    });

    return Math.max(0, Math.min(100, score));
  }

  public assessImplementationDetail(response: string): number {
    const detailIndicators = [
      'specifically', 'step by step', 'timeline', 'phases', 'milestones',
      'responsible for', 'oversight', 'monitoring', 'evaluation', 'metrics'
    ];

    const vagueIndicators = [
      'we will see', 'depends', 'flexible approach', 'adapt as needed',
      'work out the details', 'figure it out', 'cross that bridge'
    ];

    const lowerResponse = response.toLowerCase();
    let score = 50;

    detailIndicators.forEach(indicator => {
      if (lowerResponse.includes(indicator)) score += 7;
    });

    vagueIndicators.forEach(indicator => {
      if (lowerResponse.includes(indicator)) score -= 8;
    });

    return Math.max(0, Math.min(100, score));
  }

  public assessOppositionResponse(response: string): number {
    const strongResponses = [
      'respectfully disagree', 'evidence shows otherwise', 'our analysis indicates',
      'track record demonstrates', 'proven approach', 'successful elsewhere'
    ];

    const weakResponses = [
      'they have a point', 'valid concern', 'understand their position',
      'fair criticism', 'legitimate question', 'reasonable doubt'
    ];

    const lowerResponse = response.toLowerCase();
    let score = 50;

    strongResponses.forEach(indicator => {
      if (lowerResponse.includes(indicator)) score += 10;
    });

    weakResponses.forEach(indicator => {
      if (lowerResponse.includes(indicator)) score -= 5;
    });

    return Math.max(0, Math.min(100, score));
  }

  // Public getters for interview interface
  public getPerformanceMetrics(): PolicyAnnouncementPerformance {
    return { ...this.performance };
  }

  public getAnalytics(): PolicyInterviewAnalytics {
    return { ...this.analytics };
  }

  public getStakeholderSentiment(): Map<string, number> {
    return new Map(this.stakeholderReactions);
  }

  public getMessageConsistency(): string[] {
    return [...this.messageConsistency];
  }

  public getEvidenceUsage(): Map<string, number> {
    return new Map(this.evidenceUsage);
  }

  public getVulnerabilityExposure(): Map<string, number> {
    return new Map(this.vulnerabilityExposure);
  }

  public getNarrativeControl(): number {
    return this.narrativeControl;
  }

  public getPolicyDetails(): PolicyDetails {
    return { ...this.policyConfig.policyDetails };
  }

  public getAnnouncementContext(): AnnouncementContext {
    return { ...this.policyConfig.announcementContext };
  }

  public getMediaScrutiny(): PolicyMediaScrutiny {
    return { ...this.policyConfig.mediaScrutiny };
  }

  public getAnticipatedCriticism(): AnticipatedCriticism[] {
    return [...this.policyConfig.announcementContext.mediaStrategy.anticipatedCriticism];
  }

  public getOppositionResponse(): OppositionResponse {
    return { ...this.policyConfig.oppositionResponse };
  }

  public getCurrentWeaknesses(): PolicyWeakPoint[] {
    return [...this.policyConfig.oppositionResponse.vulnerabilityAssessment.weakPoints];
  }

  public getMediaVulnerabilities(): MediaVulnerability[] {
    return [...this.policyConfig.mediaScrutiny.mediaVulnerabilities];
  }
}