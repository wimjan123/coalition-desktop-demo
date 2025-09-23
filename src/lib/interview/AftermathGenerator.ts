/**
 * Aftermath Generator
 * Generates dynamic news coverage, social media reactions, and coalition partner responses
 */

import type {
  InterviewAftermath,
  InterviewPerformance,
  ConversationState,
  NewsHeadline,
  SocialMediaPost,
  PartnerReaction,
  ApprovalRatingChange,
  ViralMoment,
  InterviewType
} from '../types/interview.js';

export class AftermathGenerator {
  private interviewType: InterviewType;

  // Dutch news outlets with their typical editorial slants
  private readonly NEWS_OUTLETS = {
    'NOS Journaal': { tone: 'neutral', bias: 'center' },
    'RTL Nieuws': { tone: 'accessible', bias: 'center-right' },
    'Nieuwsuur': { tone: 'analytical', bias: 'center-left' },
    'De Telegraaf': { tone: 'populist', bias: 'right' },
    'de Volkskrant': { tone: 'progressive', bias: 'left' },
    'NRC Handelsblad': { tone: 'elite', bias: 'center-right' },
    'Het Financieele Dagblad': { tone: 'business', bias: 'center-right' },
    'Trouw': { tone: 'thoughtful', bias: 'center-left' }
  };

  // Dutch political parties and their typical leaders
  private readonly COALITION_PARTNERS = [
    { partyId: 'VVD', leaderName: 'Mark Rutte', stance: 'center-right' },
    { partyId: 'D66', leaderName: 'Sigrid Kaag', stance: 'center-liberal' },
    { partyId: 'CDA', leaderName: 'Wopke Hoekstra', stance: 'center-right' },
    { partyId: 'ChristenUnie', leaderName: 'Gert-Jan Segers', stance: 'center-christian' },
    { partyId: 'PvdA', leaderName: 'Attje Kuiken', stance: 'center-left' },
    { partyId: 'GroenLinks', leaderName: 'Jesse Klaver', stance: 'left-green' },
    { partyId: 'PVV', leaderName: 'Geert Wilders', stance: 'right-populist' },
    { partyId: 'SP', leaderName: 'Lilian Marijnissen', stance: 'left-socialist' }
  ];

  // Dutch demographic groups
  private readonly DEMOGRAPHICS = [
    'young-professionals', 'working-class', 'elderly', 'students',
    'business-owners', 'immigrants', 'farmers', 'urban-renters',
    'suburban-families', 'environmentalists', 'religious-conservatives'
  ];

  constructor(interviewType: InterviewType) {
    this.interviewType = interviewType;
  }

  /**
   * Generate complete interview aftermath
   */
  async generate(performance: InterviewPerformance, state: ConversationState): Promise<InterviewAftermath> {
    const headlines = this.generateHeadlines(performance, state);
    const socialMediaReactions = this.generateSocialMediaReactions(performance, state);
    const coalitionPartnerReactions = this.generatePartnerReactions(performance, state);
    const approvalRatingImpact = this.calculateApprovalImpact(performance, state);
    const viralMoments = this.identifyViralMoments(performance, state);

    return {
      headlines,
      socialMediaReactions,
      coalitionPartnerReactions,
      approvalRatingImpact,
      viralMoments
    };
  }

  /**
   * Generate news headlines based on interview performance
   */
  private generateHeadlines(performance: InterviewPerformance, state: ConversationState): NewsHeadline[] {
    const headlines: NewsHeadline[] = [];

    for (const [outlet, profile] of Object.entries(this.NEWS_OUTLETS)) {
      const headline = this.generateOutletSpecificHeadline(outlet, profile, performance, state);
      headlines.push(headline);
    }

    return headlines;
  }

  private generateOutletSpecificHeadline(
    outlet: string,
    profile: { tone: string; bias: string },
    performance: InterviewPerformance,
    state: ConversationState
  ): NewsHeadline {
    const backgroundTemplates = this.getBackgroundHeadlineTemplates(performance.backgroundId);
    const performanceLevel = this.getPerformanceLevel(performance.overallScore);

    let template: string;
    let tone: 'positive' | 'negative' | 'neutral';
    let focus: string;

    // Select template based on outlet bias and performance
    if (performanceLevel === 'excellent') {
      template = this.selectPositiveTemplate(backgroundTemplates, profile.bias);
      tone = 'positive';
      focus = 'Strong performance';
    } else if (performanceLevel === 'poor') {
      template = this.selectNegativeTemplate(backgroundTemplates, profile.bias);
      tone = 'negative';
      focus = 'Performance issues';
    } else {
      template = this.selectNeutralTemplate(backgroundTemplates, profile.bias);
      tone = 'neutral';
      focus = 'Mixed performance';
    }

    // Handle major mistakes differently
    if (performance.majorMistakes.length > 0) {
      template = this.selectMistakeTemplate(backgroundTemplates, performance.majorMistakes[0]);
      tone = 'negative';
      focus = 'Major mistakes';
    }

    // Handle contradictions
    if (performance.contradictionCount > 1) {
      template = backgroundTemplates.contradiction || template;
      tone = 'negative';
      focus = 'Inconsistent messaging';
    }

    const headline = this.fillHeadlineTemplate(template, performance, state);

    return {
      outlet,
      headline,
      tone,
      focus
    };
  }

  private getBackgroundHeadlineTemplates(backgroundId: string): Record<string, string> {
    const templates: Record<string, Record<string, string>> = {
      'toeslagenaffaire-whistleblower': {
        positive: "[NAME] Shows Leadership in Confronting Past Mistakes",
        negative: "Toeslagenaffaire Whistleblower [NAME] Struggles Under Pressure",
        neutral: "[NAME] Addresses Role in Toeslagenaffaire During Interview",
        contradiction: "Inconsistent Answers Raise Questions About [NAME]'s Credibility",
        mistake: "Interview Stumble Could Hurt [NAME]'s Political Comeback"
      },
      'small-business-owner': {
        positive: "Small Business Experience Shines in [NAME]'s Interview",
        negative: "[NAME] Lacks Policy Depth in Political Debut",
        neutral: "Business Owner [NAME] Makes Case for Political Change",
        contradiction: "[NAME] Sends Mixed Messages on Economic Policy",
        mistake: "Political Newcomer [NAME] Shows Inexperience in Interview"
      },
      'financial-analyst': {
        positive: "[NAME]'s Economic Expertise Impresses in Interview",
        negative: "Technical Background Can't Save [NAME] from Interview Struggles",
        neutral: "Analyst [NAME] Brings Data-Driven Approach to Politics",
        contradiction: "Economic Expert [NAME] Contradicts Own Analysis",
        mistake: "Financial Background Doesn't Prevent [NAME]'s Interview Errors"
      },
      'shell-executive': {
        positive: "Former Shell Executive [NAME] Shows Climate Leadership",
        negative: "Corporate Past Haunts [NAME] in Difficult Interview",
        neutral: "[NAME] Defends Corporate Experience in Political Interview",
        contradiction: "Mixed Messages on Climate from Former Shell Executive [NAME]",
        mistake: "Corporate Speak Undermines [NAME]'s Political Message"
      }
    };

    return templates[backgroundId] || templates['small-business-owner'];
  }

  private selectPositiveTemplate(templates: Record<string, string>, bias: string): string {
    if (bias === 'left' && Math.random() > 0.7) {
      return templates.neutral; // Left outlets more skeptical of success
    }
    return templates.positive;
  }

  private selectNegativeTemplate(templates: Record<string, string>, bias: string): string {
    if (bias === 'right' && Math.random() > 0.6) {
      return templates.neutral; // Right outlets sometimes more forgiving
    }
    return templates.negative;
  }

  private selectNeutralTemplate(templates: Record<string, string>, bias: string): string {
    return templates.neutral;
  }

  private selectMistakeTemplate(templates: Record<string, string>, mistake: string): string {
    if (mistake.includes('contradiction')) {
      return templates.contradiction;
    }
    return templates.mistake;
  }

  private fillHeadlineTemplate(template: string, performance: InterviewPerformance, state: ConversationState): string {
    // Replace placeholder with candidate name (would come from game state)
    const candidateName = this.getCandidateName(performance.backgroundId);
    return template.replace('[NAME]', candidateName);
  }

  private getCandidateName(backgroundId: string): string {
    // In real implementation, this would come from character creation
    const defaultNames: Record<string, string> = {
      'toeslagenaffaire-whistleblower': 'Van der Berg',
      'small-business-owner': 'De Vries',
      'financial-analyst': 'Jansen',
      'shell-executive': 'Kuipers'
    };
    return defaultNames[backgroundId] || 'De Candidate';
  }

  /**
   * Generate social media reactions from different demographics
   */
  private generateSocialMediaReactions(performance: InterviewPerformance, state: ConversationState): SocialMediaPost[] {
    const posts: SocialMediaPost[] = [];

    for (const demographic of this.DEMOGRAPHICS) {
      const reaction = this.generateDemographicReaction(demographic, performance, state);
      if (reaction) {
        posts.push(reaction);
      }
    }

    return posts;
  }

  private generateDemographicReaction(
    demographic: string,
    performance: InterviewPerformance,
    state: ConversationState
  ): SocialMediaPost | null {
    const templates = this.getDemographicReactionTemplates(demographic);
    const sentiment = this.calculateDemographicSentiment(demographic, performance, state);

    if (Math.random() > 0.7) return null; // Not all demographics react

    const template = this.selectReactionTemplate(templates, sentiment, performance);
    const content = this.fillReactionTemplate(template, performance, state);

    return {
      platform: this.selectPlatform(demographic),
      demographic,
      content,
      sentiment,
      virality: this.calculateVirality(sentiment, performance, demographic)
    };
  }

  private getDemographicReactionTemplates(demographic: string): Record<string, string[]> {
    const templates: Record<string, Record<string, string[]>> = {
      'young-professionals': {
        positive: [
          "Actually impressed by this interview. Real answers for once! #Politics",
          "Finally someone who doesn't talk in circles 🔥 #Interview",
          "This is how you handle tough questions 💪 #Leadership"
        ],
        negative: [
          "Yikes... that interview was painful to watch 😬 #Politics",
          "How do you mess up THIS badly? 🤦‍♀️ #Interview",
          "That was... not good. At all. #PoliticalFail"
        ],
        neutral: [
          "Mixed feelings about this interview tbh #Politics",
          "Some good points, some not so much 🤷‍♀️ #Interview"
        ]
      },
      'working-class': {
        positive: [
          "At least someone understands what we're going through",
          "Finally! A politician who talks like a real person",
          "Been waiting for someone to say this stuff"
        ],
        negative: [
          "Same old political BS, different face",
          "Completely out of touch with regular people",
          "Another politician who doesn't get it"
        ],
        neutral: [
          "We'll see if they actually follow through",
          "Talk is cheap, let's see action"
        ]
      },
      'elderly': {
        positive: [
          "Refreshing to see someone with proper values",
          "This person shows respect for institutions",
          "Finally, some sensible leadership"
        ],
        negative: [
          "Too inexperienced for such responsibility",
          "Lacks the gravitas needed for leadership",
          "Not ready for the complexities of governance"
        ],
        neutral: [
          "Time will tell if they have what it takes",
          "Jury's still out on this one"
        ]
      }
    };

    return templates[demographic] || templates['young-professionals'];
  }

  private calculateDemographicSentiment(
    demographic: string,
    performance: InterviewPerformance,
    state: ConversationState
  ): 'positive' | 'negative' | 'neutral' {
    let baseScore = performance.overallScore;

    // Demographic-specific adjustments
    const adjustments: Record<string, number> = {
      'young-professionals': performance.authenticity > 70 ? 10 : -5,
      'working-class': performance.dominantTone === 'evasive' ? -15 : 5,
      'elderly': performance.consistency > 80 ? 10 : -10,
      'business-owners': performance.confidence > 70 ? 10 : -5,
      'environmentalists': performance.backgroundId === 'shell-executive' ? -20 : 0
    };

    baseScore += adjustments[demographic] || 0;

    if (baseScore > 70) return 'positive';
    if (baseScore < 45) return 'negative';
    return 'neutral';
  }

  private selectReactionTemplate(
    templates: Record<string, string[]>,
    sentiment: string,
    performance: InterviewPerformance
  ): string {
    const sentimentTemplates = templates[sentiment] || templates['neutral'];
    return sentimentTemplates[Math.floor(Math.random() * sentimentTemplates.length)];
  }

  private fillReactionTemplate(template: string, performance: InterviewPerformance, state: ConversationState): string {
    // Simple template filling - in real implementation, could be more sophisticated
    return template;
  }

  private selectPlatform(demographic: string): 'twitter' | 'instagram' | 'linkedin' {
    const platformPrefs: Record<string, 'twitter' | 'instagram' | 'linkedin'> = {
      'young-professionals': Math.random() > 0.5 ? 'twitter' : 'linkedin',
      'working-class': 'twitter',
      'elderly': 'twitter',
      'students': Math.random() > 0.3 ? 'instagram' : 'twitter',
      'business-owners': 'linkedin'
    };

    return platformPrefs[demographic] || 'twitter';
  }

  private calculateVirality(
    sentiment: 'positive' | 'negative' | 'neutral',
    performance: InterviewPerformance,
    demographic: string
  ): number {
    let baseVirality = 0;

    // Extreme sentiments are more viral
    if (sentiment === 'positive' && performance.overallScore > 85) baseVirality = 70;
    else if (sentiment === 'negative' && performance.overallScore < 30) baseVirality = 80;
    else if (sentiment === 'neutral') baseVirality = 20;
    else baseVirality = 40;

    // Major mistakes boost virality
    if (performance.majorMistakes.length > 0) baseVirality += 30;

    // Contradictions are shareable
    if (performance.contradictionCount > 1) baseVirality += 20;

    return Math.min(100, baseVirality);
  }

  /**
   * Generate coalition partner reactions
   */
  private generatePartnerReactions(performance: InterviewPerformance, state: ConversationState): PartnerReaction[] {
    const reactions: PartnerReaction[] = [];

    // Select 2-3 partners to react
    const reactingPartners = this.COALITION_PARTNERS
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.floor(Math.random() * 2) + 2);

    for (const partner of reactingPartners) {
      const reaction = this.generatePartnerReaction(partner, performance, state);
      reactions.push(reaction);
    }

    return reactions;
  }

  private generatePartnerReaction(
    partner: { partyId: string; leaderName: string; stance: string },
    performance: InterviewPerformance,
    state: ConversationState
  ): PartnerReaction {
    const impact = this.calculatePartnerImpact(partner.stance, performance, state);
    const reactionText = this.generatePartnerReactionText(partner, impact, performance);

    return {
      partyId: partner.partyId,
      leaderName: partner.leaderName,
      reaction: reactionText,
      impact
    };
  }

  private calculatePartnerImpact(
    stance: string,
    performance: InterviewPerformance,
    state: ConversationState
  ): 'positive' | 'negative' | 'neutral' {
    let score = performance.overallScore;

    // Stance-specific adjustments
    if (stance === 'center-right' && performance.backgroundId === 'shell-executive') {
      score += 10; // Business-friendly
    }
    if (stance === 'left-green' && performance.backgroundId === 'environmental-activist') {
      score += 15; // Aligned values
    }
    if (stance === 'right-populist' && performance.authenticity < 50) {
      score -= 20; // Populists hate inauthenticity
    }

    if (score > 70) return 'positive';
    if (score < 45) return 'negative';
    return 'neutral';
  }

  private generatePartnerReactionText(
    partner: { partyId: string; leaderName: string; stance: string },
    impact: 'positive' | 'negative' | 'neutral',
    performance: InterviewPerformance
  ): string {
    const templates: Record<string, Record<string, string[]>> = {
      'positive': {
        'center-right': [
          "Impressive interview. We need more pragmatic voices in politics.",
          "Solid performance. This is the kind of leadership we can work with."
        ],
        'center-left': [
          "Refreshing honesty in tonight's interview. We welcome this approach.",
          "Strong answers on key issues. Looking forward to future dialogue."
        ],
        'left-green': [
          "Finally, someone who understands the urgency of our challenges.",
          "Authentic responses that show real commitment to change."
        ]
      },
      'negative': {
        'center-right': [
          "Concerning answers that raise questions about readiness for office.",
          "We need leaders who can provide clear, consistent vision."
        ],
        'right-populist': [
          "Another politician saying what they think people want to hear.",
          "The establishment strikes again. Nothing will change."
        ]
      },
      'neutral': {
        'center-liberal': [
          "Mixed performance. We'll judge based on future actions, not words.",
          "Some good points, but we need to see more concrete proposals."
        ]
      }
    };

    const stanceTemplates = templates[impact]?.[partner.stance] ||
                           templates[impact]?.['center-liberal'] ||
                           ["No comment at this time."];

    return stanceTemplates[Math.floor(Math.random() * stanceTemplates.length)];
  }

  /**
   * Calculate approval rating changes by demographic
   */
  private calculateApprovalImpact(performance: InterviewPerformance, state: ConversationState): ApprovalRatingChange[] {
    const changes: ApprovalRatingChange[] = [];

    for (const demographic of this.DEMOGRAPHICS) {
      const change = this.calculateDemographicApprovalChange(demographic, performance, state);
      if (Math.abs(change) > 0.5) { // Only include meaningful changes
        changes.push({
          demographic,
          change: Math.round(change * 10) / 10, // Round to 1 decimal
          reason: this.getApprovalChangeReason(demographic, change, performance)
        });
      }
    }

    return changes;
  }

  private calculateDemographicApprovalChange(
    demographic: string,
    performance: InterviewPerformance,
    state: ConversationState
  ): number {
    let baseChange = (performance.overallScore - 50) / 10; // -5 to +5 range

    // Demographic-specific multipliers
    const multipliers: Record<string, number> = {
      'young-professionals': performance.authenticity > 70 ? 1.5 : 0.8,
      'working-class': performance.dominantTone === 'evasive' ? 0.3 : 1.2,
      'elderly': performance.consistency > 80 ? 1.3 : 0.7,
      'business-owners': performance.confidence > 70 ? 1.2 : 0.9,
      'environmentalists': performance.backgroundId === 'shell-executive' ? 0.2 : 1.0
    };

    return baseChange * (multipliers[demographic] || 1.0);
  }

  private getApprovalChangeReason(demographic: string, change: number, performance: InterviewPerformance): string {
    if (change > 2) {
      return `Strong interview performance resonated with ${demographic}`;
    } else if (change > 0) {
      return `Positive reception among ${demographic}`;
    } else if (change < -2) {
      return `Interview performance disappointed ${demographic}`;
    } else {
      return `Mixed reaction from ${demographic}`;
    }
  }

  /**
   * Identify viral moments from the interview
   */
  private identifyViralMoments(performance: InterviewPerformance, state: ConversationState): ViralMoment[] {
    const viralMoments: ViralMoment[] = [];

    // Major mistakes often go viral
    if (performance.majorMistakes.length > 0) {
      for (const mistake of performance.majorMistakes.slice(0, 2)) { // Max 2 viral mistakes
        viralMoments.push({
          questionId: 'unknown', // Would need to track this better
          responseText: mistake,
          reason: 'Major interview mistake',
          impact: 'negative',
          shareCount: Math.floor(Math.random() * 10000) + 5000
        });
      }
    }

    // Strong moments can also go viral
    if (performance.strongMoments.length > 0 && performance.overallScore > 75) {
      for (const moment of performance.strongMoments.slice(0, 1)) { // Max 1 positive viral moment
        viralMoments.push({
          questionId: 'unknown',
          responseText: moment,
          reason: 'Powerful response',
          impact: 'positive',
          shareCount: Math.floor(Math.random() * 5000) + 2000
        });
      }
    }

    return viralMoments;
  }

  private getPerformanceLevel(score: number): 'excellent' | 'good' | 'average' | 'poor' | 'terrible' {
    if (score >= 85) return 'excellent';
    if (score >= 70) return 'good';
    if (score >= 55) return 'average';
    if (score >= 35) return 'poor';
    return 'terrible';
  }
}