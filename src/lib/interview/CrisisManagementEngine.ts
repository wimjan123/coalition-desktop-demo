/**
 * Crisis Management Interview Engine
 * Handles high-pressure crisis response interviews during active political crises
 */

import type {
  CrisisManagementConfig,
  CrisisType,
  StakeholderPressure,
  CrisisTimeConstraints,
  PublicExpectation,
  CrisisMediaEnvironment,
  InterviewResult,
  ConversationState,
  PlayerResponse,
  ConversationAction,
  CrisisDeadline
} from '../types/interview.js';

import { InterviewEngine } from './InterviewEngine.js';
import { CrisisQuestionArcFactory } from './CrisisQuestionArcFactory.js';

export class CrisisManagementEngine extends InterviewEngine {
  private crisisConfig: CrisisManagementConfig;
  private activeDeadlines: CrisisDeadline[] = [];
  private stakeholderSatisfaction: Map<string, number> = new Map();
  private decisionPoints: CrisisDecisionPoint[] = [];
  private leadershipTest: LeadershipTest;
  private crisisTimer: CrisisTimer;
  private pressureEscalation: number = 0; // Escalates throughout crisis

  constructor(config: CrisisManagementConfig) {
    super(config);
    this.crisisConfig = config;
    this.initializeCrisisManagement();
  }

  private initializeCrisisManagement(): void {
    this.activeDeadlines = [...this.crisisConfig.timeConstraints.decisionDeadlines];
    this.leadershipTest = new LeadershipTest(this.crisisConfig.publicExpectation);
    this.crisisTimer = new CrisisTimer(this.crisisConfig.crisisPhase);

    // Initialize stakeholder satisfaction based on crisis type
    this.initializeStakeholderSatisfaction();

    // Set initial pressure level based on crisis severity and phase
    this.pressureEscalation = this.calculateInitialPressure();
  }

  async conductCrisisInterview(): Promise<InterviewResult> {
    // Start crisis timer
    this.crisisTimer.start();

    const result = await super.conductInterview();

    // Add crisis-specific performance metrics
    result.performance = {
      ...result.performance,
      ...this.calculateCrisisLeadershipMetrics()
    };

    // Generate crisis-specific aftermath
    result.aftermath = {
      ...result.aftermath,
      crisisResolutionReport: this.generateCrisisResolutionReport(),
      stakeholderReactions: this.generateStakeholderReactions(),
      nextSteps: this.generateNextSteps()
    };

    return result;
  }

  async processResponse(responseText: string, tone: string): Promise<ConversationAction> {
    // Check for approaching deadlines
    this.checkDeadlines();

    // Assess leadership qualities displayed
    this.leadershipTest.assessLeadershipResponse(responseText, tone);

    // Update stakeholder satisfaction based on response
    this.updateStakeholderSatisfaction(responseText, tone);

    // Check for crisis escalation triggers
    this.checkCrisisEscalation(responseText, tone);

    // Evaluate decision-making under pressure
    this.evaluateDecisionMaking(responseText, tone);

    // Process with base engine
    const action = await super.processResponse(responseText, tone);

    // Add crisis-specific enhancements
    return this.enhanceWithCrisisLogic(action, responseText, tone);
  }

  private checkDeadlines(): void {
    const currentTime = Date.now();
    const hoursPassed = (currentTime - this.crisisTimer.startTime) / (1000 * 60 * 60);

    this.activeDeadlines.forEach(deadline => {
      if (hoursPassed >= deadline.deadline - 1 && !deadline.warned) {
        // Issue warning for approaching deadline
        this.personality.processExternalEvent({
          type: 'deadline-warning',
          deadline: deadline.decision,
          timeRemaining: deadline.deadline - hoursPassed,
          consequences: deadline.consequences
        });
        deadline.warned = true;
      }
    });
  }

  private updateStakeholderSatisfaction(responseText: string, tone: string): void {
    this.crisisConfig.stakeholderPressure.forEach(pressure => {
      let satisfactionChange = 0;

      // Check if response addresses their demands
      const addressesDemands = pressure.demands.some(demand =>
        responseText.toLowerCase().includes(demand.toLowerCase())
      );

      if (addressesDemands) {
        satisfactionChange += 15;
      }

      // Adjust based on tone appropriateness
      if (pressure.stakeholder === 'victims' || pressure.stakeholder === 'affected-families') {
        if (tone === 'diplomatic' || tone === 'sympathetic') {
          satisfactionChange += 10;
        } else if (tone === 'aggressive' || tone === 'defensive') {
          satisfactionChange -= 15;
        }
      } else if (pressure.stakeholder === 'opposition') {
        if (tone === 'confident' || tone === 'professional') {
          satisfactionChange += 5;
        } else if (tone === 'evasive') {
          satisfactionChange -= 10;
        }
      }

      // Update satisfaction
      const currentSatisfaction = this.stakeholderSatisfaction.get(pressure.stakeholder) || 50;
      const newSatisfaction = Math.max(0, Math.min(100, currentSatisfaction + satisfactionChange));
      this.stakeholderSatisfaction.set(pressure.stakeholder, newSatisfaction);
    });
  }

  private checkCrisisEscalation(responseText: string, tone: string): void {
    let escalationIncrease = 0;

    // Poor responses escalate the crisis
    if (tone === 'evasive' || tone === 'defensive') {
      escalationIncrease += 10;
    }

    // Attacking others during crisis escalates
    if (responseText.toLowerCase().includes('blame') ||
        responseText.toLowerCase().includes('not my fault')) {
      escalationIncrease += 15;
    }

    // Refusing to take action escalates
    if (responseText.toLowerCase().includes('wait and see') ||
        responseText.toLowerCase().includes('too early')) {
      escalationIncrease += 12;
    }

    this.pressureEscalation = Math.min(100, this.pressureEscalation + escalationIncrease);

    // Strong leadership responses can de-escalate
    if (tone === 'confident' &&
        (responseText.toLowerCase().includes('immediate action') ||
         responseText.toLowerCase().includes('full responsibility'))) {
      this.pressureEscalation = Math.max(0, this.pressureEscalation - 8);
    }
  }

  private evaluateDecisionMaking(responseText: string, tone: string): void {
    const decisionPoint: CrisisDecisionPoint = {
      timestamp: Date.now(),
      response: responseText,
      tone: tone,
      pressureLevel: this.pressureEscalation,
      decisionQuality: this.assessDecisionQuality(responseText, tone),
      timeliness: this.assessTimeliness(),
      stakeholderImpact: this.calculateStakeholderImpact(responseText)
    };

    this.decisionPoints.push(decisionPoint);
  }

  private assessDecisionQuality(responseText: string, tone: string): number {
    let quality = 50; // Base quality

    // Strong indicators
    if (responseText.toLowerCase().includes('specific steps') ||
        responseText.toLowerCase().includes('concrete action')) {
      quality += 20;
    }

    if (responseText.toLowerCase().includes('immediate') ||
        responseText.toLowerCase().includes('urgent')) {
      quality += 15;
    }

    if (tone === 'confident' || tone === 'professional') {
      quality += 10;
    }

    // Weak indicators
    if (responseText.toLowerCase().includes('study') ||
        responseText.toLowerCase().includes('committee')) {
      quality -= 15;
    }

    if (tone === 'evasive' || tone === 'defensive') {
      quality -= 20;
    }

    if (responseText.length < 30) {
      quality -= 10; // Too brief for crisis response
    }

    return Math.max(0, Math.min(100, quality));
  }

  private assessTimeliness(): number {
    const hoursSinceCrisis = this.crisisTimer.getElapsedHours();

    // Timeliness decreases over time
    if (hoursSinceCrisis < 2) return 100;
    if (hoursSinceCrisis < 6) return 80;
    if (hoursSinceCrisis < 12) return 60;
    if (hoursSinceCrisis < 24) return 40;
    return 20;
  }

  private calculateStakeholderImpact(responseText: string): Record<string, number> {
    const impact: Record<string, number> = {};

    this.crisisConfig.stakeholderPressure.forEach(pressure => {
      let score = 0;

      // Check if response addresses their concerns
      pressure.demands.forEach(demand => {
        if (responseText.toLowerCase().includes(demand.toLowerCase())) {
          score += 20;
        }
      });

      impact[pressure.stakeholder] = Math.min(100, score);
    });

    return impact;
  }

  private enhanceWithCrisisLogic(
    action: ConversationAction,
    responseText: string,
    tone: string
  ): ConversationAction {
    // Add crisis urgency indicators
    if (this.pressureEscalation > 70) {
      action.metadata = {
        ...action.metadata,
        crisisEscalation: 'critical',
        urgentActionRequired: true,
        timeRemaining: this.getShortestDeadline()
      };
    }

    // Add stakeholder pressure indicators
    const dissatisfiedStakeholders = this.getHighlyDissatisfiedStakeholders();
    if (dissatisfiedStakeholders.length > 0) {
      action.metadata = {
        ...action.metadata,
        stakeholderPressure: dissatisfiedStakeholders,
        reputationAtRisk: true
      };
    }

    // Add leadership test results
    const leadershipScore = this.leadershipTest.getCurrentScore();
    action.metadata = {
      ...action.metadata,
      leadershipScore,
      leadershipAssessment: this.leadershipTest.getAssessment()
    };

    return action;
  }

  private initializeStakeholderSatisfaction(): void {
    this.crisisConfig.stakeholderPressure.forEach(pressure => {
      // Start with lower satisfaction for more severe crises
      const baseSatisfaction = this.crisisConfig.crisisType === 'policy-failure' ? 30 :
                              this.crisisConfig.crisisType === 'public-safety' ? 20 :
                              this.crisisConfig.crisisType === 'corruption-revelation' ? 10 : 40;

      this.stakeholderSatisfaction.set(pressure.stakeholder, baseSatisfaction);
    });
  }

  private calculateInitialPressure(): number {
    let pressure = 30; // Base pressure

    // Crisis type affects pressure
    const crisisTypePressure = {
      'policy-failure': 40,
      'public-safety': 70,
      'economic-crisis': 60,
      'coalition-collapse': 50,
      'external-threat': 80,
      'institutional-failure': 55,
      'social-unrest': 75,
      'environmental-disaster': 65,
      'corruption-revelation': 85,
      'leadership-crisis': 90
    };

    pressure += crisisTypePressure[this.crisisConfig.crisisType] || 40;

    // Crisis phase affects pressure
    const phasePressure = {
      'immediate': 20,
      'developing': 10,
      'peak': 0,
      'recovery': -10
    };

    pressure += phasePressure[this.crisisConfig.crisisPhase];

    return Math.max(0, Math.min(100, pressure));
  }

  private calculateCrisisLeadershipMetrics(): any {
    const avgDecisionQuality = this.decisionPoints.length > 0 ?
      this.decisionPoints.reduce((sum, dp) => sum + dp.decisionQuality, 0) / this.decisionPoints.length : 50;

    const avgStakeholderSatisfaction = Array.from(this.stakeholderSatisfaction.values()).reduce((sum, val) => sum + val, 0) /
                                      Math.max(1, this.stakeholderSatisfaction.size);

    return {
      crisisLeadershipScore: this.leadershipTest.getCurrentScore(),
      decisionMakingQuality: avgDecisionQuality,
      stakeholderManagement: avgStakeholderSatisfaction,
      crisisEscalationLevel: this.pressureEscalation,
      responseTimeliness: this.assessTimeliness(),
      communicationEffectiveness: this.calculateCommunicationEffectiveness(),
      overallCrisisHandling: this.calculateOverallCrisisHandling()
    };
  }

  private calculateCommunicationEffectiveness(): number {
    let effectiveness = 50;

    // Base on consistency and authenticity
    effectiveness += (this.state.performanceMetrics.consistency - 50) * 0.4;
    effectiveness += (this.state.performanceMetrics.authenticity - 50) * 0.6;

    // Adjust for crisis-specific factors
    if (this.state.performanceMetrics.majorMistakes.length > 2) {
      effectiveness -= 20;
    }

    if (this.pressureEscalation < 50) {
      effectiveness += 15; // Good at preventing escalation
    }

    return Math.max(0, Math.min(100, effectiveness));
  }

  private calculateOverallCrisisHandling(): number {
    const leadershipScore = this.leadershipTest.getCurrentScore();
    const decisionQuality = this.decisionPoints.length > 0 ?
      this.decisionPoints.reduce((sum, dp) => sum + dp.decisionQuality, 0) / this.decisionPoints.length : 50;
    const stakeholderScore = Array.from(this.stakeholderSatisfaction.values()).reduce((sum, val) => sum + val, 0) /
                            Math.max(1, this.stakeholderSatisfaction.size);
    const communicationScore = this.calculateCommunicationEffectiveness();

    // Weighted average
    return Math.round(
      (leadershipScore * 0.3) +
      (decisionQuality * 0.25) +
      (stakeholderScore * 0.25) +
      (communicationScore * 0.2)
    );
  }

  private generateCrisisResolutionReport(): any {
    return {
      crisisType: this.crisisConfig.crisisType,
      crisisPhase: this.crisisConfig.crisisPhase,
      durationHours: this.crisisTimer.getElapsedHours(),
      resolutionStatus: this.determineResolutionStatus(),
      keyDecisions: this.decisionPoints.map(dp => ({
        decision: dp.response.substring(0, 100) + '...',
        quality: dp.decisionQuality,
        impact: dp.stakeholderImpact
      })),
      lessonsLearned: this.generateLessonsLearned(),
      futurePreparedness: this.assessFuturePreparedness()
    };
  }

  private generateStakeholderReactions(): any {
    const reactions: Record<string, any> = {};

    this.stakeholderSatisfaction.forEach((satisfaction, stakeholder) => {
      reactions[stakeholder] = {
        satisfaction,
        publicStatement: this.generateStakeholderStatement(stakeholder, satisfaction),
        futureSupport: satisfaction > 60 ? 'supportive' : satisfaction > 40 ? 'neutral' : 'critical',
        trustLevel: satisfaction
      };
    });

    return reactions;
  }

  private generateNextSteps(): string[] {
    const steps = [];
    const overallHandling = this.calculateOverallCrisisHandling();

    if (overallHandling < 50) {
      steps.push("Consider appointing a crisis management team");
      steps.push("Develop better communication protocols");
    }

    if (this.pressureEscalation > 60) {
      steps.push("Implement immediate damage control measures");
      steps.push("Schedule stakeholder meetings to rebuild trust");
    }

    if (this.getHighlyDissatisfiedStakeholders().length > 0) {
      steps.push("Address specific stakeholder concerns individually");
    }

    steps.push("Review crisis response procedures for future incidents");
    steps.push("Monitor media coverage and public opinion trends");

    return steps;
  }

  // Helper methods
  private getShortestDeadline(): number {
    const now = this.crisisTimer.getElapsedHours();
    const remainingDeadlines = this.activeDeadlines
      .filter(d => d.deadline > now)
      .map(d => d.deadline - now);

    return remainingDeadlines.length > 0 ? Math.min(...remainingDeadlines) : 0;
  }

  private getHighlyDissatisfiedStakeholders(): string[] {
    return Array.from(this.stakeholderSatisfaction.entries())
      .filter(([_, satisfaction]) => satisfaction < 30)
      .map(([stakeholder, _]) => stakeholder);
  }

  private determineResolutionStatus(): string {
    const overallHandling = this.calculateOverallCrisisHandling();

    if (overallHandling > 80) return 'Successfully managed';
    if (overallHandling > 60) return 'Adequately handled';
    if (overallHandling > 40) return 'Partially resolved';
    return 'Requires ongoing attention';
  }

  private generateLessonsLearned(): string[] {
    const lessons = [];

    if (this.pressureEscalation > 70) {
      lessons.push("Crisis communication needs to be faster and more direct");
    }

    if (this.leadershipTest.getCurrentScore() < 60) {
      lessons.push("Leadership presence needs strengthening during crises");
    }

    const avgDecisionQuality = this.decisionPoints.length > 0 ?
      this.decisionPoints.reduce((sum, dp) => sum + dp.decisionQuality, 0) / this.decisionPoints.length : 50;

    if (avgDecisionQuality < 60) {
      lessons.push("Decision-making process needs improvement under pressure");
    }

    return lessons;
  }

  private assessFuturePreparedness(): number {
    let preparedness = 50;

    // Learn from this crisis
    preparedness += Math.min(20, this.calculateOverallCrisisHandling() * 0.3);

    // Reduce based on mistakes made
    preparedness -= this.state.performanceMetrics.majorMistakes.length * 5;

    // Improve based on stakeholder relationships maintained
    const avgStakeholderSatisfaction = Array.from(this.stakeholderSatisfaction.values()).reduce((sum, val) => sum + val, 0) /
                                      Math.max(1, this.stakeholderSatisfaction.size);
    preparedness += (avgStakeholderSatisfaction - 50) * 0.2;

    return Math.max(0, Math.min(100, preparedness));
  }

  private generateStakeholderStatement(stakeholder: string, satisfaction: number): string {
    const statements = {
      high: [
        `We appreciate the leadership shown during this difficult time.`,
        `The response has been appropriate and we support the actions taken.`,
        `We're confident in the direction and support continued efforts.`
      ],
      medium: [
        `We understand the challenges but expect continued improvement.`,
        `The response has been adequate but more needs to be done.`,
        `We're cautiously optimistic about the path forward.`
      ],
      low: [
        `We're deeply disappointed in the handling of this crisis.`,
        `More decisive action should have been taken much earlier.`,
        `Our confidence has been severely shaken by this response.`
      ]
    };

    const level = satisfaction > 60 ? 'high' : satisfaction > 40 ? 'medium' : 'low';
    const statementArray = statements[level];
    return statementArray[Math.floor(Math.random() * statementArray.length)];
  }
}

// Supporting classes for crisis management

interface CrisisDecisionPoint {
  timestamp: number;
  response: string;
  tone: string;
  pressureLevel: number;
  decisionQuality: number;
  timeliness: number;
  stakeholderImpact: Record<string, number>;
}

class LeadershipTest {
  private expectation: PublicExpectation;
  private leadershipScores: number[] = [];

  constructor(expectation: PublicExpectation) {
    this.expectation = expectation;
  }

  assessLeadershipResponse(responseText: string, tone: string): void {
    let score = 50; // Base score

    // Leadership indicators
    if (tone === 'confident' || tone === 'professional') {
      score += this.expectation.leadership * 0.3;
    }

    if (responseText.toLowerCase().includes('take responsibility') ||
        responseText.toLowerCase().includes('i will')) {
      score += this.expectation.accountability * 0.3;
    }

    if (responseText.toLowerCase().includes('immediate') ||
        responseText.toLowerCase().includes('urgent action')) {
      score += this.expectation.immediateAction * 0.2;
    }

    if (responseText.toLowerCase().includes('transparent') ||
        responseText.toLowerCase().includes('full disclosure')) {
      score += this.expectation.transparency * 0.2;
    }

    this.leadershipScores.push(Math.max(0, Math.min(100, score)));
  }

  getCurrentScore(): number {
    if (this.leadershipScores.length === 0) return 50;
    return this.leadershipScores.reduce((sum, score) => sum + score, 0) / this.leadershipScores.length;
  }

  getAssessment(): string {
    const score = this.getCurrentScore();

    if (score > 80) return 'Strong leadership demonstrated';
    if (score > 60) return 'Adequate leadership shown';
    if (score > 40) return 'Leadership questioned';
    return 'Leadership crisis evident';
  }
}

class CrisisTimer {
  public startTime: number = 0;
  private phase: string;

  constructor(phase: string) {
    this.phase = phase;
  }

  start(): void {
    this.startTime = Date.now();
  }

  getElapsedHours(): number {
    return (Date.now() - this.startTime) / (1000 * 60 * 60);
  }
}