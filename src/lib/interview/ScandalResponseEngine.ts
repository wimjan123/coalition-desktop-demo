/**
 * Scandal Response Interview Engine
 * Handles high-pressure scandal response interviews with dynamic evidence revelation
 */

import type {
  ScandalScenario,
  ScandalInterviewConfig,
  ScandalQuestion,
  ScandalResponseMetrics,
  DefenseStrategy,
  ScandalEvidence,
  CrisisTimingConfig,
  TimedStatement,
  TimedMediaUpdate,
  InterviewResult,
  ConversationState,
  PlayerResponse,
  ConversationAction
} from '../types/interview.js';

import { InterviewEngine } from './InterviewEngine.js';
import { InterviewerPersonality } from './InterviewerPersonality.js';

export class ScandalResponseEngine extends InterviewEngine {
  private scandalConfig: ScandalInterviewConfig;
  private scenario: ScandalScenario;
  private crisisTiming: CrisisTimingConfig;
  private revealedEvidence: Set<string> = new Set();
  private usedDefenseStrategies: Set<string> = new Set();
  private timedEvents: Array<{timestamp: number, event: TimedStatement | TimedMediaUpdate}> = [];
  private interviewStartTime: number = 0;
  private pressureLevel: number = 50; // 0-100, escalates during interview

  constructor(config: ScandalInterviewConfig, scenario: ScandalScenario) {
    super(config);
    this.scandalConfig = config;
    this.scenario = scenario;
    this.initializeCrisisTiming();
    this.initializePressureSystem();
  }

  private initializeCrisisTiming(): void {
    this.crisisTiming = {
      breakingNewsDelay: this.calculateBreakingNewsDelay(),
      evidenceRevealTiming: this.calculateEvidenceRevealTiming(),
      stakeholderStatements: this.generateStakeholderStatements(),
      mediaUpdates: this.generateMediaUpdates(),
      pressureEscalationPoints: this.calculatePressureEscalationPoints()
    };
  }

  private initializePressureSystem(): void {
    // Initialize pressure based on scandal severity and media attention
    const severityMultiplier = {
      'minor': 0.2,
      'moderate': 0.4,
      'major': 0.6,
      'catastrophic': 0.8
    };

    const mediaMultiplier = {
      'local': 0.2,
      'regional': 0.4,
      'national': 0.7,
      'international': 1.0
    };

    this.pressureLevel = Math.min(100,
      30 +
      (severityMultiplier[this.scenario.severity] * 40) +
      (mediaMultiplier[this.scenario.mediaAttention] * 30)
    );
  }

  async conductScandalInterview(): Promise<InterviewResult> {
    this.interviewStartTime = Date.now();
    this.scheduleTimedEvents();

    // Override the base interview conduct method with scandal-specific logic
    const result = await super.conductInterview();

    // Add scandal-specific performance metrics
    result.performance = {
      ...result.performance,
      ...this.calculateScandalMetrics()
    } as ScandalResponseMetrics;

    return result;
  }

  async processResponse(responseText: string, tone: string): Promise<ConversationAction> {
    // Check for timed events that should fire
    this.checkTimedEvents();

    // Analyze response for defense strategy usage
    this.analyzeDefenseStrategy(responseText, tone);

    // Update pressure level based on response effectiveness
    this.updatePressureLevel(responseText, tone);

    // Check if response creates new vulnerabilities
    this.checkForNewVulnerabilities(responseText);

    // Process with base engine
    const action = await super.processResponse(responseText, tone);

    // Add scandal-specific follow-up logic
    return this.enhanceWithScandalLogic(action, responseText, tone);
  }

  private checkTimedEvents(): void {
    const currentTime = Date.now() - this.interviewStartTime;
    const currentTimeSeconds = Math.floor(currentTime / 1000);

    // Check for stakeholder statements
    this.crisisTiming.stakeholderStatements.forEach(statement => {
      if (statement.timing <= currentTimeSeconds && !this.hasEventFired(statement)) {
        this.fireStakeholderStatement(statement);
      }
    });

    // Check for media updates
    this.crisisTiming.mediaUpdates.forEach(update => {
      if (update.timing <= currentTimeSeconds && !this.hasEventFired(update)) {
        this.fireMediaUpdate(update);
      }
    });

    // Check for evidence reveals
    this.crisisTiming.evidenceRevealTiming.forEach((timing, index) => {
      if (timing <= currentTimeSeconds && !this.revealedEvidence.has(`timed-${index}`)) {
        this.revealTimedEvidence(index);
      }
    });
  }

  private hasEventFired(event: TimedStatement | TimedMediaUpdate): boolean {
    return this.timedEvents.some(timedEvent => timedEvent.event === event);
  }

  private fireStakeholderStatement(statement: TimedStatement): void {
    // Mark as fired
    this.timedEvents.push({timestamp: Date.now(), event: statement});

    // Update interviewer mood based on statement impact
    const stakeholder = this.scenario.stakeholders.find(s => s.id === statement.stakeholderId);
    if (stakeholder) {
      this.personality.processExternalEvent({
        type: 'stakeholder-statement',
        stakeholder: stakeholder.name,
        statement: statement.statement,
        impact: statement.impact,
        credibility: stakeholder.credibility
      });
    }
  }

  private fireMediaUpdate(update: TimedMediaUpdate): void {
    // Mark as fired
    this.timedEvents.push({timestamp: Date.now(), event: update});

    // Increase pressure based on update urgency
    if (update.urgency === 'breaking') {
      this.pressureLevel = Math.min(100, this.pressureLevel + 15);
    } else if (update.urgency === 'developing') {
      this.pressureLevel = Math.min(100, this.pressureLevel + 8);
    }

    // Update interviewer with new information
    this.personality.processExternalEvent({
      type: 'media-update',
      content: update.content,
      urgency: update.urgency,
      source: update.source
    });
  }

  private revealTimedEvidence(index: number): void {
    this.revealedEvidence.add(`timed-${index}`);

    const evidence = this.scenario.evidenceAgainst[index];
    if (evidence) {
      // Increase pressure based on evidence damage level
      this.pressureLevel = Math.min(100, this.pressureLevel + (evidence.damageLevel * 0.3));

      // Update interviewer with new evidence
      this.personality.processExternalEvent({
        type: 'evidence-reveal',
        evidence: evidence.description,
        source: evidence.source,
        credibility: evidence.credibility,
        damageLevel: evidence.damageLevel
      });
    }
  }

  private analyzeDefenseStrategy(responseText: string, tone: string): void {
    // Analyze which defense strategy the player is using
    const strategy = this.identifyDefenseStrategy(responseText, tone);
    if (strategy) {
      this.usedDefenseStrategies.add(strategy.id);

      // Update performance metrics based on strategy effectiveness
      const effectiveness = this.calculateStrategyEffectiveness(strategy, responseText);
      this.updateDefenseEffectiveness(strategy.id, effectiveness);
    }
  }

  private identifyDefenseStrategy(responseText: string, tone: string): DefenseStrategy | null {
    const lowerText = responseText.toLowerCase();

    for (const strategy of this.scenario.defensiblePositions) {
      // Check if response matches strategy templates
      const matches = strategy.responseTemplates.some(template => {
        const templateKeywords = template.toLowerCase().split(' ').slice(0, 5);
        return templateKeywords.some(keyword => lowerText.includes(keyword));
      });

      if (matches) {
        return strategy;
      }
    }

    // Fallback to tone-based strategy identification
    const toneStrategyMap: Record<string, string> = {
      'aggressive': 'attack-accusers',
      'defensive': 'deny-completely',
      'diplomatic': 'accept-responsibility',
      'evasive': 'deflect-to-policy',
      'confrontational': 'blame-others'
    };

    const strategyType = toneStrategyMap[tone];
    if (strategyType) {
      return this.scenario.defensiblePositions.find(s => s.type === strategyType) || null;
    }

    return null;
  }

  private calculateStrategyEffectiveness(strategy: DefenseStrategy, responseText: string): number {
    let effectiveness = strategy.effectiveness;

    // Adjust based on response quality
    const wordCount = responseText.split(' ').length;
    if (wordCount < 10) {
      effectiveness *= 0.6; // Too brief
    } else if (wordCount > 100) {
      effectiveness *= 0.8; // Too verbose, might create new issues
    }

    // Adjust based on pressure level
    const pressureAdjustment = 1 - (this.pressureLevel / 200); // Higher pressure reduces effectiveness
    effectiveness *= Math.max(0.3, pressureAdjustment);

    // Adjust based on evidence strength
    const strongEvidence = this.scenario.evidenceAgainst.filter(e =>
      e.isPublic && e.credibility > 70 && e.damageLevel > 60
    ).length;

    if (strongEvidence > 0 && ['deny-completely', 'claim-misunderstanding'].includes(strategy.type)) {
      effectiveness *= 0.5; // Denial less effective with strong evidence
    }

    return Math.max(0, Math.min(100, effectiveness));
  }

  private updateDefenseEffectiveness(strategyId: string, effectiveness: number): void {
    // Store for performance metrics
    if (!this.state.performanceMetrics) {
      this.state.performanceMetrics = {
        consistency: 100,
        confidence: 50,
        authenticity: 50,
        engagement: 50,
        overallScore: 50,
        dominantTone: 'diplomatic',
        majorMistakes: [],
        strongMoments: []
      };
    }

    // Update authenticity based on strategy effectiveness
    if (effectiveness > 70) {
      this.state.performanceMetrics.authenticity = Math.min(100,
        this.state.performanceMetrics.authenticity + 5
      );
    } else if (effectiveness < 30) {
      this.state.performanceMetrics.authenticity = Math.max(0,
        this.state.performanceMetrics.authenticity - 10
      );
    }
  }

  private updatePressureLevel(responseText: string, tone: string): void {
    // Reduce pressure for strong responses
    if (tone === 'confident' && responseText.length > 50) {
      this.pressureLevel = Math.max(0, this.pressureLevel - 5);
    }

    // Increase pressure for weak responses
    if (['evasive', 'defensive'].includes(tone) || responseText.length < 20) {
      this.pressureLevel = Math.min(100, this.pressureLevel + 8);
    }

    // Increase pressure at escalation points
    const questionNumber = this.state.answeredQuestions.length;
    if (this.crisisTiming.pressureEscalationPoints.includes(questionNumber)) {
      this.pressureLevel = Math.min(100, this.pressureLevel + 12);
    }
  }

  private checkForNewVulnerabilities(responseText: string): void {
    // Check if response creates new contradictions or vulnerabilities
    const words = responseText.toLowerCase().split(' ');

    // Look for problematic admissions
    const problematicPhrases = [
      'i knew', 'i was aware', 'i should have', 'i made a mistake',
      'my fault', 'i regret', 'i was wrong', 'i failed'
    ];

    const hasProblematicAdmission = problematicPhrases.some(phrase =>
      responseText.toLowerCase().includes(phrase)
    );

    if (hasProblematicAdmission) {
      this.state.performanceMetrics.majorMistakes.push(
        `Problematic admission: "${responseText.substring(0, 50)}..."`
      );
    }

    // Check for inconsistencies with previous statements
    const previousResponses = this.state.playerResponses.map(r => r.responseText.toLowerCase());
    // This would need more sophisticated NLP in a real implementation
    // For now, simple keyword contradiction checking
  }

  private enhanceWithScandalLogic(
    action: ConversationAction,
    responseText: string,
    tone: string
  ): ConversationAction {
    // Add scandal-specific follow-up logic
    if (action.type === 'question' && this.pressureLevel > 70) {
      // High pressure situations get more aggressive follow-ups
      action.metadata = {
        ...action.metadata,
        pressureLevel: this.pressureLevel,
        aggressiveness: 'high',
        timeLimit: Math.max(15, 30 - (this.pressureLevel / 5)) // Less time under pressure
      };
    }

    // Add evidence-based follow-ups
    if (this.shouldRevealEvidence(responseText, tone)) {
      const evidence = this.selectRelevantEvidence(responseText);
      if (evidence) {
        action.metadata = {
          ...action.metadata,
          evidenceToReveal: evidence.id,
          evidenceDescription: evidence.description
        };
      }
    }

    return action;
  }

  private shouldRevealEvidence(responseText: string, tone: string): boolean {
    // Reveal evidence for denials or evasions
    if (['defensive', 'evasive'].includes(tone)) {
      return Math.random() < 0.4; // 40% chance
    }

    // Reveal evidence if response seems false
    if (responseText.toLowerCase().includes('never') || responseText.toLowerCase().includes('absolutely not')) {
      return Math.random() < 0.6; // 60% chance for strong denials
    }

    return false;
  }

  private selectRelevantEvidence(responseText: string): ScandalEvidence | null {
    const unrevealed = this.scenario.evidenceAgainst.filter(e =>
      !this.revealedEvidence.has(e.id) && e.isPublic
    );

    if (unrevealed.length === 0) return null;

    // Select highest damage unrevealed evidence
    return unrevealed.reduce((highest, current) =>
      current.damageLevel > highest.damageLevel ? current : highest
    );
  }

  private calculateScandalMetrics(): Partial<ScandalResponseMetrics> {
    const baseMetrics = this.state.performanceMetrics;

    // Calculate scandal-specific metrics
    const credibilityMaintained = this.calculateCredibilityMaintained();
    const damageMitigation = this.calculateDamageMitigation();
    const newDamageCreated = this.calculateNewDamageCreated();
    const stakeholderSatisfaction = this.calculateStakeholderSatisfaction();
    const mediaReactionScore = this.calculateMediaReactionScore();
    const defenseStrategyEffectiveness = this.calculateDefenseStrategyEffectiveness();

    return {
      credibilityMaintained,
      damageMitigation,
      newDamageCreated,
      stakeholderSatisfaction,
      mediaReactionScore,
      defenseStrategyEffectiveness,
      contradictionsCreated: this.state.contradictions.length,
      opportunitiesMissed: this.identifyMissedOpportunities()
    };
  }

  private calculateCredibilityMaintained(): number {
    let credibility = 70; // Start with baseline

    // Reduce for contradictions
    credibility -= this.state.contradictions.length * 15;

    // Reduce for ineffective defense strategies
    const avgStrategyEffectiveness = Array.from(this.usedDefenseStrategies).reduce((sum, id) => {
      const strategy = this.scenario.defensiblePositions.find(s => s.id === id);
      return sum + (strategy?.effectiveness || 0);
    }, 0) / Math.max(1, this.usedDefenseStrategies.size);

    credibility += (avgStrategyEffectiveness - 50) * 0.6;

    // Adjust for pressure handling
    if (this.pressureLevel < 40) {
      credibility += 10; // Handled pressure well
    } else if (this.pressureLevel > 80) {
      credibility -= 15; // Cracked under pressure
    }

    return Math.max(0, Math.min(100, credibility));
  }

  private calculateDamageMitigation(): number {
    // Calculate how well the interview mitigated existing damage
    const severityPenalty = {
      'minor': 10,
      'moderate': 25,
      'major': 45,
      'catastrophic': 65
    };

    let mitigation = 100 - severityPenalty[this.scenario.severity];

    // Improve mitigation for effective responses
    mitigation += this.state.performanceMetrics.authenticity * 0.3;
    mitigation += this.state.performanceMetrics.confidence * 0.2;

    return Math.max(0, Math.min(100, mitigation));
  }

  private calculateNewDamageCreated(): number {
    let newDamage = 0;

    // Add damage for mistakes
    newDamage += this.state.performanceMetrics.majorMistakes.length * 15;

    // Add damage for contradictions
    newDamage += this.state.contradictions.length * 12;

    // Add damage for high pressure breakdown
    if (this.pressureLevel > 85) {
      newDamage += 20;
    }

    return Math.max(0, Math.min(100, newDamage));
  }

  private calculateStakeholderSatisfaction(): Record<string, number> {
    const satisfaction: Record<string, number> = {};

    this.scenario.stakeholders.forEach(stakeholder => {
      let score = 50; // Baseline neutral

      // Adjust based on stakeholder relationship
      if (stakeholder.relationship === 'ally') {
        score += 20;
      } else if (stakeholder.relationship === 'hostile') {
        score -= 20;
      } else if (stakeholder.relationship === 'victim') {
        score -= 10; // Victims harder to satisfy
      }

      // Adjust based on performance
      score += (this.state.performanceMetrics.authenticity - 50) * 0.5;

      satisfaction[stakeholder.id] = Math.max(0, Math.min(100, score));
    });

    return satisfaction;
  }

  private calculateMediaReactionScore(): number {
    let score = 50; // Baseline

    // Adjust based on overall performance
    score += (this.state.performanceMetrics.overallScore - 50) * 0.8;

    // Adjust based on new damage created
    const newDamage = this.calculateNewDamageCreated();
    score -= newDamage * 0.5;

    // Adjust based on pressure handling
    if (this.pressureLevel > 80) {
      score -= 15; // Media notices when politicians crack under pressure
    }

    return Math.max(0, Math.min(100, score));
  }

  private calculateDefenseStrategyEffectiveness(): Record<string, number> {
    const effectiveness: Record<string, number> = {};

    this.usedDefenseStrategies.forEach(strategyId => {
      const strategy = this.scenario.defensiblePositions.find(s => s.id === strategyId);
      if (strategy) {
        effectiveness[strategyId] = this.calculateStrategyEffectiveness(strategy, '');
      }
    });

    return effectiveness;
  }

  private identifyMissedOpportunities(): string[] {
    const opportunities: string[] = [];

    // Check for unused high-effectiveness defense strategies
    const unusedStrategies = this.scenario.defensiblePositions.filter(s =>
      !this.usedDefenseStrategies.has(s.id) && s.effectiveness > 70
    );

    unusedStrategies.forEach(strategy => {
      opportunities.push(`Unused high-effectiveness strategy: ${strategy.type}`);
    });

    // Check for evidence that could have been disputed
    const undisputedEvidence = this.scenario.evidenceAgainst.filter(e =>
      this.revealedEvidence.has(e.id) && e.canBeDisputed && e.disputeStrength && e.disputeStrength > 60
    );

    undisputedEvidence.forEach(evidence => {
      opportunities.push(`Could have disputed: ${evidence.description.substring(0, 30)}...`);
    });

    return opportunities;
  }

  // Helper methods for initialization

  private calculateBreakingNewsDelay(): number {
    // Breaking news arrives faster for bigger scandals
    const baseDelay = {
      'minor': 300,     // 5 minutes
      'moderate': 180,  // 3 minutes
      'major': 120,     // 2 minutes
      'catastrophic': 60 // 1 minute
    };

    return baseDelay[this.scenario.severity];
  }

  private calculateEvidenceRevealTiming(): number[] {
    const questionCount = this.scandalConfig.keyQuestions.length;
    const evidenceCount = this.scenario.evidenceAgainst.filter(e => e.isPublic).length;

    // Spread evidence reveals throughout interview
    const timing: number[] = [];
    for (let i = 0; i < evidenceCount; i++) {
      const intervalSec = (questionCount * 60) / (evidenceCount + 1); // Assuming 1 min per question
      timing.push(Math.floor(intervalSec * (i + 1)));
    }

    return timing;
  }

  private generateStakeholderStatements(): TimedStatement[] {
    const statements: TimedStatement[] = [];

    this.scenario.stakeholders.forEach((stakeholder, index) => {
      if (stakeholder.publicStatement) {
        statements.push({
          stakeholderId: stakeholder.id,
          statement: stakeholder.publicStatement,
          timing: 60 + (index * 120), // Space out statements
          impact: stakeholder.relationship === 'ally' ? 'supportive' :
                  stakeholder.relationship === 'hostile' ? 'damaging' : 'neutral'
        });
      }
    });

    return statements;
  }

  private generateMediaUpdates(): TimedMediaUpdate[] {
    // Generate dynamic media updates based on scandal type and severity
    const updates: TimedMediaUpdate[] = [];

    // Add updates based on scandal severity
    if (this.scenario.severity === 'major' || this.scenario.severity === 'catastrophic') {
      updates.push({
        content: "BREAKING: Opposition calls for immediate resignation",
        timing: 180, // 3 minutes in
        urgency: 'breaking',
        source: 'Political Desk'
      });
    }

    if (this.scenario.mediaAttention === 'national' || this.scenario.mediaAttention === 'international') {
      updates.push({
        content: "Developing: More evidence expected to emerge",
        timing: 300, // 5 minutes in
        urgency: 'developing',
        source: 'Investigation Team'
      });
    }

    return updates;
  }

  private calculatePressureEscalationPoints(): number[] {
    const questionCount = this.scandalConfig.keyQuestions.length;

    // Create pressure escalation at strategic points
    const points = [
      Math.floor(questionCount * 0.3),  // Early pressure
      Math.floor(questionCount * 0.6),  // Mid-interview pressure
      Math.floor(questionCount * 0.9)   // Final pressure
    ];

    return points.filter(p => p > 0 && p < questionCount);
  }
}