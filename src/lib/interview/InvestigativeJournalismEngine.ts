/**
 * Investigative Journalism Interview Engine
 * Manages sophisticated investigative journalism interviews with evidence confrontation and accountability tracking
 */

import type {
  InterviewConfig,
  QuestionArc,
  DynamicQuestion,
  InterviewerPersonality,
  ConversationMemory,
  InvestigativeJournalismConfig,
  InvestigationDetails,
  EvidenceFramework,
  InvestigativeInterviewPerformance,
  InvestigativeInterviewAnalytics,
  InvestigationSubject,
  InvestigativeQuestionType,
  EvidenceOfConnection,
  Allegation,
  InvestigationCategory
} from '../types/interview.js';

import { InterviewEngine } from './InterviewEngine.js';

export class InvestigativeJournalismEngine extends InterviewEngine {
  private investigationConfig: InvestigativeJournalismConfig;
  private performance: InvestigativeInterviewPerformance;
  private analytics: InvestigativeInterviewAnalytics;
  private evidencePresented: Map<string, boolean> = new Map(); // Track evidence confrontation
  private contradictions: string[] = []; // Track contradictory statements
  private evasionCount: number = 0;
  private truthfulness: number = 70; // Overall truthfulness assessment
  private accountability: number = 30; // Accountability acceptance level

  constructor(
    config: InterviewConfig,
    investigationConfig: InvestigativeJournalismConfig,
    personality: InterviewerPersonality,
    memory: ConversationMemory
  ) {
    super(config, personality, memory);
    this.investigationConfig = investigationConfig;
    this.performance = this.initializePerformance();
    this.analytics = this.initializeAnalytics();
    this.initializeEvidenceTracking();
  }

  private initializePerformance(): InvestigativeInterviewPerformance {
    return {
      truthElicitation: 50,
      evidenceConfrontation: 60,
      consistencyMaintenance: this.calculateInitialConsistency(),
      accountabilityAcceptance: 30,
      reformCommitment: 40,
      publicTrustworthiness: this.calculateInitialTrustworthiness()
    };
  }

  private initializeAnalytics(): InvestigativeInterviewAnalytics {
    return {
      evasiveness: 40,
      contradictionCount: 0,
      evidenceAcknowledgment: 30,
      responsibilityAcceptance: 20,
      cooperativeness: 60,
      damageControl: 70
    };
  }

  private calculateInitialConsistency(): number {
    // Base consistency on allegation evidence levels
    const verifiedAllegations = this.investigationConfig.investigation.keyAllegations
      .filter(a => a.evidenceLevel === 'verified' || a.evidenceLevel === 'documented');

    const totalAllegations = this.investigationConfig.investigation.keyAllegations.length;
    const evidenceRatio = verifiedAllegations.length / Math.max(1, totalAllegations);

    // Lower consistency expected when strong evidence exists
    return Math.max(30, 80 - (evidenceRatio * 40));
  }

  private calculateInitialTrustworthiness(): number {
    // Base trustworthiness on subject profile and investigation severity
    const subjects = this.investigationConfig.subjects;
    if (subjects.length === 0) return 60;

    const avgReputation = subjects.reduce((sum, subject) =>
      sum + (subject.subjectProfile.reputation.publicReputation || 60), 0
    ) / subjects.length;

    const severityPenalty = this.calculateSeverityPenalty();

    return Math.max(20, avgReputation - severityPenalty);
  }

  private calculateSeverityPenalty(): number {
    const criticalAllegations = this.investigationConfig.investigation.keyAllegations
      .filter(a => a.severity === 'critical').length;
    const seriousAllegations = this.investigationConfig.investigation.keyAllegations
      .filter(a => a.severity === 'serious').length;

    return (criticalAllegations * 20) + (seriousAllegations * 10);
  }

  private initializeEvidenceTracking(): void {
    // Initialize evidence tracking for all subjects
    this.investigationConfig.subjects.forEach(subject => {
      subject.connectionToAllegations.evidenceOfConnection.forEach(evidence => {
        this.evidencePresented.set(evidence.evidenceDescription, false);
      });
    });
  }

  // Core engine methods
  public processResponse(response: string, questionId: string): void {
    super.processResponse(response, questionId);

    this.analyzeResponseTruthfulness(response, questionId);
    this.detectEvasionPatterns(response);
    this.checkForContradictions(response, questionId);
    this.assessEvidenceAcknowledgment(response);
    this.evaluateAccountabilityAcceptance(response);
    this.updatePerformanceMetrics();
    this.updateAnalytics();
  }

  private analyzeResponseTruthfulness(response: string, questionId: string): void {
    const question = this.currentArc?.questions.find(q => q.id === questionId);
    if (!question) return;

    // Assess truthfulness based on response patterns
    const truthfulnessIndicators = [
      'i don\'t recall', 'to the best of my knowledge', 'as far as i remember',
      'i believe', 'i think', 'it\'s possible', 'i cannot be certain'
    ];

    const deceptiveIndicators = [
      'absolutely not', 'never happened', 'completely false', 'total fabrication',
      'i would never', 'that\'s impossible', 'i categorically deny'
    ];

    const cooperativeIndicators = [
      'yes, that\'s correct', 'i can confirm', 'that did happen',
      'you\'re right', 'i admit', 'i acknowledge', 'i take responsibility'
    ];

    const lowerResponse = response.toLowerCase();
    let truthfulnessChange = 0;

    // Check for different response patterns
    truthfulnessIndicators.forEach(indicator => {
      if (lowerResponse.includes(indicator)) {
        truthfulnessChange += 2; // Honest uncertainty is better than lies
      }
    });

    deceptiveIndicators.forEach(indicator => {
      if (lowerResponse.includes(indicator)) {
        // Check if this contradicts known evidence
        if (this.contradictsKnownEvidence(response)) {
          truthfulnessChange -= 5; // Likely deception
          this.truthfulness = Math.max(0, this.truthfulness - 5);
        }
      }
    });

    cooperativeIndicators.forEach(indicator => {
      if (lowerResponse.includes(indicator)) {
        truthfulnessChange += 4; // Cooperation with investigation
        this.truthfulness = Math.min(100, this.truthfulness + 3);
      }
    });

    // Update truth elicitation performance
    this.performance.truthElicitation = Math.max(0, Math.min(100,
      this.performance.truthElicitation + truthfulnessChange
    ));
  }

  private contradictsKnownEvidence(response: string): boolean {
    // Check if response contradicts documented evidence
    let contradicts = false;

    this.investigationConfig.subjects.forEach(subject => {
      subject.connectionToAllegations.evidenceOfConnection.forEach(evidence => {
        if (evidence.evidenceStrength > 70 && evidence.verificationStatus === 'verified') {
          // This is strong, verified evidence
          const evidenceKeywords = evidence.evidenceDescription.toLowerCase().split(' ');
          const responseWords = response.toLowerCase().split(' ');

          // Simple contradiction detection
          if (evidenceKeywords.some(word => word.length > 3 && responseWords.includes(word))) {
            const denialPatterns = ['never', 'not', 'false', 'incorrect', 'wrong'];
            if (denialPatterns.some(pattern => response.toLowerCase().includes(pattern))) {
              contradicts = true;
            }
          }
        }
      });
    });

    return contradicts;
  }

  private detectEvasionPatterns(response: string): void {
    const evasionIndicators = [
      'i don\'t recall', 'i can\'t remember', 'that\'s not my area',
      'you\'d have to ask', 'i wasn\'t involved in', 'that\'s above my pay grade',
      'i wasn\'t responsible for', 'that predates my time', 'i wasn\'t aware',
      'i don\'t have that information', 'i\'d need to check', 'that\'s confidential'
    ];

    const deflectionIndicators = [
      'what about', 'look at', 'focus on', 'the real issue is',
      'you should be asking', 'more importantly', 'let\'s talk about'
    ];

    const lowerResponse = response.toLowerCase();
    let evasionScore = 0;

    evasionIndicators.forEach(indicator => {
      if (lowerResponse.includes(indicator)) {
        evasionScore += 1;
      }
    });

    deflectionIndicators.forEach(indicator => {
      if (lowerResponse.includes(indicator)) {
        evasionScore += 2; // Deflection is more evasive
      }
    });

    if (evasionScore > 0) {
      this.evasionCount++;
      this.analytics.evasiveness = Math.min(100, this.analytics.evasiveness + (evasionScore * 3));
      this.performance.truthElicitation = Math.max(0, this.performance.truthElicitation - (evasionScore * 2));
    }
  }

  private checkForContradictions(response: string, questionId: string): void {
    const previousResponses = this.memory.conversationHistory.slice(0, -1); // Exclude current response

    previousResponses.forEach((prevResponse, index) => {
      if (this.detectContradiction(response, prevResponse.response)) {
        const contradiction = `Q${index + 1} vs Q${questionId}: Inconsistent statements about similar topics`;
        this.contradictions.push(contradiction);
        this.analytics.contradictionCount++;

        // Reduce consistency performance
        this.performance.consistencyMaintenance = Math.max(0,
          this.performance.consistencyMaintenance - 8
        );
      }
    });
  }

  private detectContradiction(current: string, previous: string): boolean {
    // Simple contradiction detection - look for opposite statements
    const currentLower = current.toLowerCase();
    const previousLower = previous.toLowerCase();

    // Check for direct contradictions
    const contradictionPairs = [
      ['yes', 'no'],
      ['true', 'false'],
      ['did', 'didn\'t'],
      ['was', 'wasn\'t'],
      ['were', 'weren\'t'],
      ['can', 'cannot'],
      ['will', 'won\'t'],
      ['have', 'haven\'t']
    ];

    return contradictionPairs.some(([positive, negative]) => {
      return (currentLower.includes(positive) && previousLower.includes(negative)) ||
             (currentLower.includes(negative) && previousLower.includes(positive));
    });
  }

  private assessEvidenceAcknowledgment(response: string): void {
    let acknowledgmentCount = 0;
    let totalEvidenceReferences = 0;

    this.investigationConfig.subjects.forEach(subject => {
      subject.connectionToAllegations.evidenceOfConnection.forEach(evidence => {
        const evidenceKeywords = evidence.evidenceDescription.toLowerCase().split(' ')
          .filter(word => word.length > 3);

        const responseWords = response.toLowerCase().split(' ');
        const evidenceReferenced = evidenceKeywords.some(keyword =>
          responseWords.includes(keyword)
        );

        if (evidenceReferenced) {
          totalEvidenceReferences++;
          this.evidencePresented.set(evidence.evidenceDescription, true);

          // Check if evidence is acknowledged
          const acknowledgmentPatterns = [
            'yes, that\'s true', 'that\'s correct', 'i confirm', 'that happened',
            'you\'re right', 'that\'s accurate', 'i acknowledge'
          ];

          if (acknowledgmentPatterns.some(pattern =>
            response.toLowerCase().includes(pattern)
          )) {
            acknowledgmentCount++;
          }
        }
      });
    });

    if (totalEvidenceReferences > 0) {
      const acknowledgmentRate = (acknowledgmentCount / totalEvidenceReferences) * 100;
      this.analytics.evidenceAcknowledgment =
        (this.analytics.evidenceAcknowledgment + acknowledgmentRate) / 2;

      this.performance.evidenceConfrontation = Math.min(100,
        this.performance.evidenceConfrontation + (acknowledgmentCount * 5)
      );
    }
  }

  private evaluateAccountabilityAcceptance(response: string): void {
    const accountabilityIndicators = [
      'i take responsibility', 'i\'m accountable', 'that was my fault',
      'i should have', 'i failed to', 'i made a mistake',
      'i\'m sorry', 'i apologize', 'i regret', 'i accept responsibility'
    ];

    const accountabilityResistance = [
      'not my responsibility', 'wasn\'t my fault', 'i\'m not accountable',
      'others were responsible', 'i followed orders', 'i was just doing my job',
      'that\'s not on me', 'i had no choice', 'i was following protocol'
    ];

    const lowerResponse = response.toLowerCase();
    let accountabilityChange = 0;

    accountabilityIndicators.forEach(indicator => {
      if (lowerResponse.includes(indicator)) {
        accountabilityChange += 3;
        this.accountability = Math.min(100, this.accountability + 5);
      }
    });

    accountabilityResistance.forEach(indicator => {
      if (lowerResponse.includes(indicator)) {
        accountabilityChange -= 2;
        this.accountability = Math.max(0, this.accountability - 3);
      }
    });

    this.performance.accountabilityAcceptance = Math.max(0, Math.min(100,
      this.performance.accountabilityAcceptance + accountabilityChange
    ));

    this.analytics.responsibilityAcceptance = Math.max(0, Math.min(100,
      this.analytics.responsibilityAcceptance + accountabilityChange
    ));
  }

  private updatePerformanceMetrics(): void {
    // Update reform commitment based on forward-looking statements
    const lastResponse = this.memory.conversationHistory[this.memory.conversationHistory.length - 1];
    if (lastResponse) {
      const reformLanguage = this.detectReformCommitment(lastResponse.response);
      this.performance.reformCommitment = Math.max(0, Math.min(100,
        this.performance.reformCommitment + reformLanguage
      ));
    }

    // Update public trustworthiness based on overall performance
    const avgPerformance = (
      this.performance.truthElicitation +
      this.performance.consistencyMaintenance +
      this.performance.accountabilityAcceptance
    ) / 3;

    this.performance.publicTrustworthiness = Math.max(0, Math.min(100,
      (this.performance.publicTrustworthiness * 0.8) + (avgPerformance * 0.2)
    ));
  }

  private detectReformCommitment(response: string): number {
    const reformIndicators = [
      'we will change', 'we will improve', 'we will implement',
      'we will prevent', 'we will ensure', 'going forward',
      'in the future', 'we\'re committed to', 'we will reform',
      'we will strengthen', 'we will enhance', 'new procedures'
    ];

    const resistanceIndicators = [
      'we already have', 'current system is', 'no need to change',
      'works fine as is', 'not necessary', 'adequate safeguards exist'
    ];

    const lowerResponse = response.toLowerCase();
    let reformScore = 0;

    reformIndicators.forEach(indicator => {
      if (lowerResponse.includes(indicator)) reformScore += 2;
    });

    resistanceIndicators.forEach(indicator => {
      if (lowerResponse.includes(indicator)) reformScore -= 3;
    });

    return Math.max(-5, Math.min(5, reformScore));
  }

  private updateAnalytics(): void {
    // Update cooperativeness based on response length and detail
    const lastResponse = this.memory.conversationHistory[this.memory.conversationHistory.length - 1];
    if (lastResponse) {
      const responseLength = lastResponse.response.length;
      const detailLevel = responseLength > 200 ? 2 : responseLength > 100 ? 1 : -1;

      this.analytics.cooperativeness = Math.max(0, Math.min(100,
        this.analytics.cooperativeness + detailLevel
      ));
    }

    // Update damage control assessment
    const damageControlIndicators = [
      'clarify', 'context', 'misunderstanding', 'taken out of context',
      'let me explain', 'important to note', 'full picture', 'circumstances'
    ];

    if (lastResponse) {
      const lowerResponse = lastResponse.response.toLowerCase();
      let damageControlCount = 0;

      damageControlIndicators.forEach(indicator => {
        if (lowerResponse.includes(indicator)) damageControlCount++;
      });

      if (damageControlCount > 0) {
        this.analytics.damageControl = Math.min(100,
          this.analytics.damageControl + (damageControlCount * 2)
        );
      }
    }
  }

  // Investigative-specific assessment methods
  public presentEvidence(evidenceDescription: string): void {
    this.evidencePresented.set(evidenceDescription, true);
    // Increase confrontation pressure
    this.performance.evidenceConfrontation = Math.min(100,
      this.performance.evidenceConfrontation + 5
    );
  }

  public assessResponseToEvidence(response: string, evidenceDescription: string): number {
    const lowerResponse = response.toLowerCase();

    // Score response based on acknowledgment vs denial
    if (lowerResponse.includes('that\'s true') || lowerResponse.includes('that\'s correct')) {
      return 20; // Full acknowledgment
    } else if (lowerResponse.includes('i don\'t recall') || lowerResponse.includes('i don\'t remember')) {
      return 5; // Evasive but not denial
    } else if (lowerResponse.includes('that\'s false') || lowerResponse.includes('never happened')) {
      return -10; // Direct denial (problematic if evidence is strong)
    }

    return 0; // Neutral response
  }

  public evaluateAccountabilityLevel(): number {
    return this.accountability;
  }

  public getInvestigationProgress(): number {
    const evidencePresentedCount = Array.from(this.evidencePresented.values())
      .filter(presented => presented).length;
    const totalEvidence = this.evidencePresented.size;

    return totalEvidence > 0 ? (evidencePresentedCount / totalEvidence) * 100 : 0;
  }

  // Public getters for interview interface
  public getPerformanceMetrics(): InvestigativeInterviewPerformance {
    return { ...this.performance };
  }

  public getAnalytics(): InvestigativeInterviewAnalytics {
    return { ...this.analytics };
  }

  public getEvidenceTracker(): Map<string, boolean> {
    return new Map(this.evidencePresented);
  }

  public getContradictions(): string[] {
    return [...this.contradictions];
  }

  public getEvasionCount(): number {
    return this.evasionCount;
  }

  public getTruthfulnessAssessment(): number {
    return this.truthfulness;
  }

  public getAccountabilityLevel(): number {
    return this.accountability;
  }

  public getInvestigationDetails(): InvestigationDetails {
    return { ...this.investigationConfig.investigation };
  }

  public getEvidenceFramework(): EvidenceFramework {
    return { ...this.investigationConfig.evidence };
  }

  public getSubjects(): InvestigationSubject[] {
    return [...this.investigationConfig.subjects];
  }

  public getAllegations(): Allegation[] {
    return [...this.investigationConfig.investigation.keyAllegations];
  }

  public getInvestigationCategory(): InvestigationCategory {
    return this.investigationConfig.investigation.category;
  }

  public getPublicInterestJustification(): string {
    return this.investigationConfig.publicInterest.publicInterestJustification.primaryJustification;
  }

  // Advanced investigative methods
  public identifyVulnerableSubjects(): InvestigationSubject[] {
    return this.investigationConfig.subjects.filter(subject =>
      subject.vulnerabilityAssessment.overallVulnerability > 70
    );
  }

  public getStrongestEvidence(): EvidenceOfConnection[] {
    const allEvidence: EvidenceOfConnection[] = [];

    this.investigationConfig.subjects.forEach(subject => {
      subject.connectionToAllegations.evidenceOfConnection.forEach(evidence => {
        if (evidence.evidenceStrength > 80 && evidence.verificationStatus === 'verified') {
          allEvidence.push(evidence);
        }
      });
    });

    return allEvidence.sort((a, b) => b.evidenceStrength - a.evidenceStrength);
  }

  public calculateInvestigationSeverity(): number {
    const allegations = this.investigationConfig.investigation.keyAllegations;
    let severityScore = 0;

    allegations.forEach(allegation => {
      switch (allegation.severity) {
        case 'critical': severityScore += 4; break;
        case 'serious': severityScore += 3; break;
        case 'significant': severityScore += 2; break;
        case 'minor': severityScore += 1; break;
      }
    });

    return Math.min(100, (severityScore / allegations.length) * 25);
  }

  public assessSubjectCooperation(subjectName: string): number {
    // Assess how cooperative a specific subject has been
    const subject = this.investigationConfig.subjects.find(s =>
      s.subjectProfile.name === subjectName
    );

    if (!subject) return 50; // Default if subject not found

    // Base cooperation on response patterns and evidence acknowledgment
    return (
      this.analytics.cooperativeness * 0.4 +
      this.analytics.evidenceAcknowledgment * 0.3 +
      this.analytics.responsibilityAcceptance * 0.3
    );
  }
}