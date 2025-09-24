/**
 * Coalition Negotiation Interview Engine
 * Manages complex coalition formation interviews with real-time negotiation dynamics
 */

import type {
  InterviewConfig,
  QuestionArc,
  DynamicQuestion,
  InterviewerPersonality,
  ConversationMemory,
  CoalitionNegotiationConfig,
  NegotiationPhase,
  PartyPosition,
  RedLine,
  NegotiationPressure,
  NegotiationMomentum,
  CoalitionNegotiationPerformance,
  CoalitionInterviewAnalytics,
  StakeholderReaction,
  PartyDelegation,
  CoalitionQuestionType
} from '../types/interview.js';

import { InterviewEngine } from './InterviewEngine.js';

export class CoalitionNegotiationEngine extends InterviewEngine {
  private coalitionConfig: CoalitionNegotiationConfig;
  private negotiationMomentum: NegotiationMomentum;
  private performance: CoalitionNegotiationPerformance;
  private analytics: CoalitionInterviewAnalytics;
  private redLineTestingHistory: Map<string, number> = new Map();
  private compromiseOffers: string[] = [];
  private partnerTrustLevels: Map<string, number> = new Map();

  constructor(
    config: InterviewConfig,
    coalitionConfig: CoalitionNegotiationConfig,
    personality: InterviewerPersonality,
    memory: ConversationMemory
  ) {
    super(config, personality, memory);
    this.coalitionConfig = coalitionConfig;
    this.negotiationMomentum = this.initializeNegotiationMomentum();
    this.performance = this.initializePerformance();
    this.analytics = this.initializeAnalytics();
    this.initializePartnerTrust();
  }

  private initializeNegotiationMomentum(): NegotiationMomentum {
    const phase = this.coalitionConfig.negotiationPhase;

    return {
      direction: phase === 'initial-soundings' ? 'positive' :
                phase === 'breakdown-recovery' ? 'deteriorating' : 'stalled',
      recentBreakthroughs: [],
      emergingObstacles: this.coalitionConfig.redLines.map(r => r.issue),
      mediaSentiment: this.calculateInitialMediaSentiment(),
      stakeholderReactions: this.generateInitialStakeholderReactions()
    };
  }

  private initializePerformance(): CoalitionNegotiationPerformance {
    return {
      credibilityWithPartners: 70,
      publicTrustworthiness: 65,
      negotiationSkill: 60,
      mandateRespected: true,
      coalitionViability: this.calculateInitialViability(),
      personalReadiness: 55
    };
  }

  private initializeAnalytics(): CoalitionInterviewAnalytics {
    return {
      responseAuthenticity: 70,
      strategicClarity: 60,
      partnershipBuilding: 65,
      publicCommunication: 60,
      pressureHandling: 55,
      compromiseWillingness: 50
    };
  }

  private initializePartnerTrust(): void {
    this.coalitionConfig.partyPositions.forEach(party => {
      // Base trust on coalition appetite and red line alignment
      const baseTrust = party.coalitionAppetite * 0.6;
      const redLineConflicts = this.countRedLineConflicts(party);
      const adjustedTrust = Math.max(20, baseTrust - (redLineConflicts * 15));

      this.partnerTrustLevels.set(party.party, adjustedTrust);
    });
  }

  private calculateInitialMediaSentiment(): number {
    const pressureLevel = this.coalitionConfig.negotiationPressure.timeToElection;
    const publicPatience = this.coalitionConfig.negotiationPressure.publicPatience;

    // Media sentiment deteriorates as time runs out and public patience wanes
    let sentiment = 20; // Neutral starting point

    if (pressureLevel < 30) sentiment -= 30; // Very close to election
    else if (pressureLevel < 60) sentiment -= 15; // Some time pressure

    if (publicPatience < 40) sentiment -= 25; // Public getting impatient
    else if (publicPatience < 70) sentiment -= 10; // Some public concern

    return Math.max(-80, Math.min(80, sentiment));
  }

  private generateInitialStakeholderReactions(): StakeholderReaction[] {
    return this.coalitionConfig.stakeholderExpectations.map(stakeholder => ({
      stakeholder: stakeholder.stakeholder,
      sentiment: this.calculateStakeholderSentiment(stakeholder),
      publicStatement: this.generateStakeholderStatement(stakeholder),
      privateMessage: undefined,
      actionThreat: stakeholder.influenceLevel > 80 ?
        this.generateActionThreat(stakeholder) : undefined
    }));
  }

  private calculateStakeholderSentiment(stakeholder: any): number {
    // Business generally wants stability, unions want worker protections, etc.
    const baseMap: Record<string, number> = {
      'business': 10, // Want predictable government
      'unions': -10, // Often skeptical of coalitions
      'advocacy': 0, // Depends on specific issues
      'international': 20, // Want stable partner
      'coalition-partner': 30 // Want successful negotiations
    };

    const base = baseMap[stakeholder.type] || 0;
    const influence = stakeholder.influenceLevel;
    const publicPressure = stakeholder.publicPressure ? -10 : 5; // Public pressure adds stress

    return Math.max(-60, Math.min(60, base + (influence / 10) + publicPressure));
  }

  private generateStakeholderStatement(stakeholder: any): string {
    const templates = {
      'business': [
        "We need certainty and stable economic policies from any coalition government.",
        "Business confidence depends on clear governance and predictable policy direction.",
        "The economy cannot afford prolonged political uncertainty."
      ],
      'unions': [
        "Workers' rights must be protected in any coalition agreement.",
        "We expect strong commitments to employment protection and fair wages.",
        "Any government must prioritize working families' interests."
      ],
      'advocacy': [
        "Our issues cannot be compromise away in political horse-trading.",
        "We expect meaningful action on our policy priorities.",
        "Coalition governments must still deliver on important social issues."
      ],
      'international': [
        "We look forward to working with a stable Dutch government.",
        "International cooperation requires reliable governmental partners.",
        "European stability benefits from strong democratic institutions."
      ],
      'coalition-partner': [
        "We remain committed to finding common ground for governance.",
        "Compromise is necessary but our core principles are non-negotiable.",
        "Voters deserve a government that can deliver on its promises."
      ]
    };

    const typeTemplates = templates[stakeholder.type] || templates['advocacy'];
    return typeTemplates[Math.floor(Math.random() * typeTemplates.length)];
  }

  private generateActionThreat(stakeholder: any): string {
    const threats = {
      'business': [
        "Major investment decisions may be delayed indefinitely",
        "Business groups may publicly withdraw support for economic policies",
        "International investors may seek more stable markets"
      ],
      'unions': [
        "Strike action may be necessary to protect workers' interests",
        "Union support for government policies cannot be guaranteed",
        "Public campaigns against anti-worker policies will be launched"
      ],
      'advocacy': [
        "Public mobilization campaigns will target coalition negotiations",
        "Electoral consequences for parties that abandon our issues",
        "Direct action to highlight ignored policy priorities"
      ],
      'international': [
        "Bilateral cooperation agreements may need to be reconsidered",
        "International support for Dutch positions may be affected",
        "Regional partnerships require reliable governmental commitment"
      ]
    };

    const typeThreats = threats[stakeholder.type] || threats['advocacy'];
    return typeThreats[Math.floor(Math.random() * typeThreats.length)];
  }

  private countRedLineConflicts(party: PartyPosition): number {
    // Count how many red lines conflict with other parties
    let conflicts = 0;

    party.absoluteRedLines.forEach(redLine => {
      const otherParties = this.coalitionConfig.partyPositions.filter(p => p.party !== party.party);
      otherParties.forEach(otherParty => {
        if (otherParty.coreInterests.some(interest =>
          interest.toLowerCase().includes(redLine.toLowerCase()) ||
          redLine.toLowerCase().includes(interest.toLowerCase())
        )) {
          conflicts++;
        }
      });
    });

    return conflicts;
  }

  private calculateInitialViability(): number {
    const partyCount = this.coalitionConfig.partyPositions.length;
    const avgCoalitionAppetite = this.coalitionConfig.partyPositions
      .reduce((sum, p) => sum + p.coalitionAppetite, 0) / partyCount;

    const redLineConflicts = this.coalitionConfig.redLines.length;
    const timeToElection = this.coalitionConfig.negotiationPressure.timeToElection;
    const publicPatience = this.coalitionConfig.negotiationPressure.publicPatience;

    let viability = avgCoalitionAppetite;
    viability -= (redLineConflicts * 8); // Each red line reduces viability
    viability -= Math.max(0, (90 - timeToElection) / 2); // Time pressure reduces viability
    viability += (publicPatience - 50) / 5; // Public support affects viability

    return Math.max(10, Math.min(90, viability));
  }

  // Core engine methods
  public processResponse(response: string, questionId: string): void {
    super.processResponse(response, questionId);

    this.analyzeNegotiationImpact(response, questionId);
    this.updatePartnerTrust(response, questionId);
    this.assessCompromiseWillingness(response);
    this.trackRedLineTesting(response, questionId);
    this.updateNegotiationMomentum();
    this.calculatePerformanceMetrics();
  }

  private analyzeNegotiationImpact(response: string, questionId: string): void {
    const question = this.currentArc?.questions.find(q => q.id === questionId);
    if (!question) return;

    // Analyze response for key negotiation indicators
    const compromiseLanguage = this.detectCompromiseLanguage(response);
    const redLineFlexibility = this.detectRedLineFlexibility(response);
    const partnershipBuilding = this.detectPartnershipBuilding(response);
    const publicAccountability = this.detectPublicAccountability(response);

    // Update analytics
    this.analytics.compromiseWillingness += compromiseLanguage * 5;
    this.analytics.partnershipBuilding += partnershipBuilding * 4;
    this.analytics.publicCommunication += publicAccountability * 3;
    this.analytics.strategicClarity += this.detectStrategicClarity(response) * 4;

    // Ensure analytics stay within bounds
    Object.keys(this.analytics).forEach(key => {
      this.analytics[key as keyof CoalitionInterviewAnalytics] = Math.max(0,
        Math.min(100, this.analytics[key as keyof CoalitionInterviewAnalytics]));
    });
  }

  private detectCompromiseLanguage(response: string): number {
    const compromiseIndicators = [
      'willing to discuss', 'open to considering', 'room for negotiation',
      'find middle ground', 'work together', 'mutual understanding',
      'flexibility', 'common ground', 'win-win', 'accommodate'
    ];

    const resistance = [
      'absolutely not', 'non-negotiable', 'impossible', 'never',
      'completely unacceptable', 'out of the question'
    ];

    let score = 0;
    const lowerResponse = response.toLowerCase();

    compromiseIndicators.forEach(indicator => {
      if (lowerResponse.includes(indicator)) score += 1;
    });

    resistance.forEach(resist => {
      if (lowerResponse.includes(resist)) score -= 2;
    });

    return Math.max(-2, Math.min(2, score));
  }

  private detectRedLineFlexibility(response: string): number {
    const flexibility = [
      'depends on', 'under certain conditions', 'if we can ensure',
      'with proper guarantees', 'perhaps if', 'might consider'
    ];

    const rigidity = [
      'absolutely no', 'never accept', 'completely unacceptable',
      'fundamental principle', 'core value', 'cannot compromise'
    ];

    let score = 0;
    const lowerResponse = response.toLowerCase();

    flexibility.forEach(flex => {
      if (lowerResponse.includes(flex)) score += 1;
    });

    rigidity.forEach(rigid => {
      if (lowerResponse.includes(rigid)) score -= 1;
    });

    return score;
  }

  private detectPartnershipBuilding(response: string): number {
    const partnership = [
      'work with', 'collaborate', 'partner', 'together we',
      'mutual respect', 'understand their position', 'shared goals',
      'common vision', 'joint approach'
    ];

    const divisive = [
      'they are wrong', 'unacceptable behavior', 'cannot trust',
      'impossible to work with', 'fundamental disagreement'
    ];

    let score = 0;
    const lowerResponse = response.toLowerCase();

    partnership.forEach(partner => {
      if (lowerResponse.includes(partner)) score += 1;
    });

    divisive.forEach(divide => {
      if (lowerResponse.includes(divide)) score -= 1;
    });

    return score;
  }

  private detectPublicAccountability(response: string): number {
    const accountability = [
      'voters deserve', 'promised to voters', 'electoral mandate',
      'democratic responsibility', 'accountable to people',
      'public interest', 'serve the country'
    ];

    const evasion = [
      'political games', 'inside politics', 'party interests',
      'technical details', 'complex negotiations'
    ];

    let score = 0;
    const lowerResponse = response.toLowerCase();

    accountability.forEach(account => {
      if (lowerResponse.includes(account)) score += 1;
    });

    evasion.forEach(evade => {
      if (lowerResponse.includes(evade)) score -= 0.5;
    });

    return score;
  }

  private detectStrategicClarity(response: string): number {
    const clarity = [
      'specifically', 'concrete steps', 'clear plan', 'detailed approach',
      'measurable', 'timeline', 'implementation', 'exactly how'
    ];

    const vagueness = [
      'generally', 'sort of', 'kind of', 'maybe', 'perhaps',
      'we will see', 'depends', 'possibly'
    ];

    let score = 0;
    const lowerResponse = response.toLowerCase();

    clarity.forEach(clear => {
      if (lowerResponse.includes(clear)) score += 1;
    });

    vagueness.forEach(vague => {
      if (lowerResponse.includes(vague)) score -= 0.5;
    });

    return score;
  }

  private updatePartnerTrust(response: string, questionId: string): void {
    const compromiseScore = this.detectCompromiseLanguage(response);
    const partnershipScore = this.detectPartnershipBuilding(response);

    // Update trust with all parties based on response
    this.coalitionConfig.partyPositions.forEach(party => {
      const currentTrust = this.partnerTrustLevels.get(party.party) || 50;
      const trustChange = (compromiseScore + partnershipScore) * 2;
      const newTrust = Math.max(0, Math.min(100, currentTrust + trustChange));

      this.partnerTrustLevels.set(party.party, newTrust);
    });
  }

  private assessCompromiseWillingness(response: string): void {
    const offer = this.extractCompromiseOffer(response);
    if (offer) {
      this.compromiseOffers.push(offer);
      this.performance.negotiationSkill += 3;
      this.analytics.compromiseWillingness += 5;
    }
  }

  private extractCompromiseOffer(response: string): string | null {
    const offerPatterns = [
      /we could offer (.*?)(?=\.|$)/i,
      /willing to (.*?)(?=\.|$)/i,
      /propose that (.*?)(?=\.|$)/i,
      /what if we (.*?)(?=\.|$)/i
    ];

    for (const pattern of offerPatterns) {
      const match = response.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }

    return null;
  }

  private trackRedLineTesting(response: string, questionId: string): void {
    // Check if response involves testing or discussing red lines
    this.coalitionConfig.redLines.forEach(redLine => {
      const issue = redLine.issue.toLowerCase();
      const responseText = response.toLowerCase();

      if (responseText.includes(issue) || this.isRelatedToRedLine(responseText, redLine)) {
        const currentCount = this.redLineTestingHistory.get(redLine.issue) || 0;
        this.redLineTestingHistory.set(redLine.issue, currentCount + 1);

        // Assess flexibility shown
        const flexibility = this.detectRedLineFlexibility(response);
        if (flexibility > 0) {
          this.performance.negotiationSkill += 2;
          this.analytics.compromiseWillingness += 3;
        } else if (flexibility < 0) {
          this.performance.credibilityWithPartners -= 1;
        }
      }
    });
  }

  private isRelatedToRedLine(response: string, redLine: RedLine): boolean {
    const keywords = redLine.description.toLowerCase().split(' ');
    return keywords.some(keyword =>
      keyword.length > 3 && response.includes(keyword)
    );
  }

  private updateNegotiationMomentum(): void {
    const recentPerformance = this.calculateRecentPerformance();
    const stakeholderReactions = this.updateStakeholderSentiment();
    const mediaSentiment = this.calculateCurrentMediaSentiment();

    // Determine momentum direction
    if (recentPerformance > 70) {
      this.negotiationMomentum.direction = 'breakthrough';
      this.addBreakthrough("Strong negotiation performance building coalition support");
    } else if (recentPerformance > 50) {
      this.negotiationMomentum.direction = 'positive';
    } else if (recentPerformance > 30) {
      this.negotiationMomentum.direction = 'stalled';
    } else {
      this.negotiationMomentum.direction = 'deteriorating';
      this.addObstacle("Weak negotiation performance undermining coalition prospects");
    }

    this.negotiationMomentum.mediaSentiment = mediaSentiment;
    this.negotiationMomentum.stakeholderReactions = stakeholderReactions;
  }

  private calculateRecentPerformance(): number {
    return (
      this.analytics.strategicClarity +
      this.analytics.partnershipBuilding +
      this.analytics.compromiseWillingness +
      this.performance.credibilityWithPartners
    ) / 4;
  }

  private updateStakeholderSentiment(): StakeholderReaction[] {
    return this.negotiationMomentum.stakeholderReactions.map(reaction => {
      const performanceImpact = this.calculateRecentPerformance() - 50;
      const sentimentChange = performanceImpact / 10;

      return {
        ...reaction,
        sentiment: Math.max(-80, Math.min(80, reaction.sentiment + sentimentChange))
      };
    });
  }

  private calculateCurrentMediaSentiment(): number {
    const timeProgress = this.getTimeProgress();
    const performanceLevel = this.calculateRecentPerformance();
    const publicPatience = this.coalitionConfig.negotiationPressure.publicPatience;

    let sentiment = this.negotiationMomentum.mediaSentiment;

    // Media sentiment deteriorates over time if no progress
    sentiment -= timeProgress * 0.3;

    // Good performance improves sentiment
    if (performanceLevel > 60) {
      sentiment += 2;
    } else if (performanceLevel < 40) {
      sentiment -= 3;
    }

    // Public patience affects media sentiment
    if (publicPatience < 30) {
      sentiment -= 10;
    }

    return Math.max(-100, Math.min(100, sentiment));
  }

  private getTimeProgress(): number {
    // Simulate time progress based on question count
    const questionsAnswered = this.memory.conversationHistory.length;
    return Math.min(100, questionsAnswered * 5); // Each question = 5% time progress
  }

  private addBreakthrough(description: string): void {
    this.negotiationMomentum.recentBreakthroughs.push(description);
    // Keep only recent breakthroughs
    if (this.negotiationMomentum.recentBreakthroughs.length > 3) {
      this.negotiationMomentum.recentBreakthroughs.shift();
    }
  }

  private addObstacle(description: string): void {
    this.negotiationMomentum.emergingObstacles.push(description);
    // Keep only recent obstacles
    if (this.negotiationMomentum.emergingObstacles.length > 5) {
      this.negotiationMomentum.emergingObstacles.shift();
    }
  }

  private calculatePerformanceMetrics(): void {
    // Update credibility based on consistency and compromise balance
    const compromiseBalance = this.calculateCompromiseBalance();
    this.performance.credibilityWithPartners = Math.max(0, Math.min(100,
      this.performance.credibilityWithPartners + compromiseBalance
    ));

    // Update public trustworthiness based on accountability
    const accountability = this.analytics.publicCommunication;
    this.performance.publicTrustworthiness = Math.max(0, Math.min(100,
      (this.performance.publicTrustworthiness * 0.9) + (accountability * 0.1)
    ));

    // Update coalition viability based on partner trust
    const avgPartnerTrust = Array.from(this.partnerTrustLevels.values())
      .reduce((sum, trust) => sum + trust, 0) / this.partnerTrustLevels.size;

    this.performance.coalitionViability = Math.max(0, Math.min(100,
      (avgPartnerTrust + this.performance.credibilityWithPartners +
       this.analytics.partnershipBuilding) / 3
    ));

    // Update personal readiness
    this.performance.personalReadiness = Math.max(0, Math.min(100,
      (this.analytics.strategicClarity + this.analytics.pressureHandling +
       this.performance.negotiationSkill) / 3
    ));
  }

  private calculateCompromiseBalance(): number {
    // Balance between being too rigid (negative) and too flexible (also negative)
    const flexibility = this.analytics.compromiseWillingness;
    const clarity = this.analytics.strategicClarity;

    // Ideal compromise: flexible but with clear principles
    if (flexibility > 40 && flexibility < 80 && clarity > 60) {
      return 2; // Good balance
    } else if (flexibility < 20) {
      return -3; // Too rigid
    } else if (flexibility > 90) {
      return -2; // Too flexible, unprincipled
    }

    return 0; // Neutral
  }

  // Public getters for interview interface
  public getNegotiationMomentum(): NegotiationMomentum {
    return { ...this.negotiationMomentum };
  }

  public getPerformanceMetrics(): CoalitionNegotiationPerformance {
    return { ...this.performance };
  }

  public getAnalytics(): CoalitionInterviewAnalytics {
    return { ...this.analytics };
  }

  public getPartnerTrustLevels(): Map<string, number> {
    return new Map(this.partnerTrustLevels);
  }

  public getCompromiseHistory(): string[] {
    return [...this.compromiseOffers];
  }

  public getRedLineTestingHistory(): Map<string, number> {
    return new Map(this.redLineTestingHistory);
  }

  public getCurrentNegotiationPhase(): NegotiationPhase {
    return this.coalitionConfig.negotiationPhase;
  }

  public getPartyPositions(): PartyPosition[] {
    return [...this.coalitionConfig.partyPositions];
  }

  public getActiveRedLines(): RedLine[] {
    return [...this.coalitionConfig.redLines];
  }

  public getNegotiationPressure(): NegotiationPressure {
    return { ...this.coalitionConfig.negotiationPressure };
  }
}