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
  InterviewType,
  NewsArticle,
  TVNewsClip,
  DemographicRelationshipChange
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
    
    // Task 4.5 & 4.6: Enhanced news coverage
    const newsArticles = this.generateNewsArticles(performance, state);
    const tvNewsClips = this.generateTVNewsClips(performance, state);
    
    // Task 4.7: Demographic relationship impact system
    const demographicRelationshipChanges = this.calculateDemographicRelationshipChanges(performance, state);

    return {
      headlines,
      socialMediaReactions,
      coalitionPartnerReactions,
      approvalRatingImpact,
      viralMoments,
      newsArticles,
      tvNewsClips,
      demographicRelationshipChanges
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

  /**
   * Generate newspaper articles based on interview performance - Task 4.5
   */
  private generateNewsArticles(performance: InterviewPerformance, state: ConversationState): NewsArticle[] {
    const articles: NewsArticle[] = [];
    
    // Select 2-3 major newspapers for in-depth coverage
    const majorOutlets = ['de Volkskrant', 'NRC Handelsblad', 'De Telegraaf'];
    
    for (const outlet of majorOutlets) {
      const outletProfile = this.NEWS_OUTLETS[outlet];
      const article = this.generateNewsArticle(outlet, outletProfile, performance, state);
      articles.push(article);
    }

    return articles;
  }

  private generateNewsArticle(
    outlet: string,
    profile: { tone: string; bias: string },
    performance: InterviewPerformance,
    state: ConversationState
  ): NewsArticle {
    const backgroundTemplates = this.getNewsArticleTemplates(performance.backgroundId);
    const performanceLevel = this.getPerformanceLevel(performance.overallScore);
    
    // Generate headline
    const headlineTemplate = this.selectArticleHeadlineTemplate(backgroundTemplates, profile.bias, performanceLevel);
    const headline = this.fillHeadlineTemplate(headlineTemplate, performance, state);
    
    // Generate article summary
    const summaryTemplate = this.selectArticleSummaryTemplate(backgroundTemplates, profile.bias, performanceLevel);
    const summary = this.fillArticleTemplate(summaryTemplate, performance, state);
    
    // Extract key quotes from conversation
    const keyQuotes = this.extractKeyQuotes(performance, state);
    
    // Determine focus based on performance and outlet bias
    const focus = this.determineArticleFocus(performance, profile.bias);
    
    // Determine tone
    const tone = this.determineArticleTone(performance, profile.bias);
    
    return {
      outlet,
      headline,
      summary,
      keyQuotes,
      focus,
      tone,
      wordCount: Math.floor(Math.random() * 400) + 300 // 300-700 words
    };
  }

  /**
   * Generate TV news clips with interviewer quotes - Task 4.6  
   */
  private generateTVNewsClips(performance: InterviewPerformance, state: ConversationState): TVNewsClip[] {
    const clips: TVNewsClip[] = [];
    
    // Major Dutch TV news programs
    const tvPrograms = [
      { channel: 'NPO1', program: 'NOS Journaal', anchor: 'Dionne Stax' },
      { channel: 'RTL4', program: 'RTL Nieuws', anchor: 'Jeroen Pauw' },
      { channel: 'NPO2', program: 'Nieuwsuur', anchor: 'Saskia Houttuin' }
    ];
    
    for (const program of tvPrograms) {
      const clip = this.generateTVNewsClip(program, performance, state);
      clips.push(clip);
    }

    return clips;
  }

  private generateTVNewsClip(
    program: { channel: string; program: string; anchor: string },
    performance: InterviewPerformance,
    state: ConversationState
  ): TVNewsClip {
    const summaryTemplate = this.getTVNewsSummaryTemplate(performance.backgroundId, program.program);
    const summary = this.fillArticleTemplate(summaryTemplate, performance, state);
    
    // Generate interviewer quotes based on performance
    const interviewerQuotes = this.generateInterviewerQuotes(performance, state);
    
    // Determine tone based on performance
    const tone = this.determineTVNewsTone(performance, program.program);
    
    return {
      channel: program.channel,
      program: program.program,
      anchor: program.anchor,
      summary,
      interviewerQuotes,
      duration: Math.floor(Math.random() * 60) + 90, // 90-150 seconds
      tone
    };
  }

  private getNewsArticleTemplates(backgroundId: string): Record<string, Record<string, string>> {
    const templates: Record<string, Record<string, Record<string, string>>> = {
      'toeslagenaffaire-whistleblower': {
        'positive': {
          'headline': "[NAME] Demonstrates Leadership in Addressing Toeslagenaffaire Legacy",
          'summary': "In a candid interview, [NAME] showed remarkable composure while addressing their role in the Toeslagenaffaire scandal. The candidate's willingness to confront difficult questions and accept responsibility impressed viewers and political commentators alike."
        },
        'negative': {
          'headline': "Toeslagenaffaire Questions Leave [NAME] Struggling for Answers",
          'summary': "Former civil servant [NAME] faced intense scrutiny over their role in the childcare benefits scandal, with several responses raising more questions than answers. Critics argue the candidate failed to adequately address concerns about accountability and trust."
        },
        'neutral': {
          'headline': "[NAME] Addresses Toeslagenaffaire Role in Televised Interview",
          'summary': "[NAME] spoke publicly about their involvement in the Toeslagenaffaire during a comprehensive interview. The candidate outlined their perspective on the scandal while fielding questions about lessons learned and future policy priorities."
        }
      },
      'financial-analyst': {
        'positive': {
          'headline': "Financial Expert [NAME] Presents Clear Economic Vision",
          'summary': "[NAME] demonstrated deep understanding of Dutch economic challenges, offering specific policy proposals backed by detailed analysis. The candidate's expertise in financial markets and economic policy was evident throughout the interview."
        },
        'negative': {
          'headline': "[NAME]'s Economic Plans Face Skepticism from Critics",
          'summary': "Financial analyst [NAME] struggled to convince viewers of their economic proposals' viability. Several responses revealed potential gaps in understanding of working-class economic concerns."
        },
        'neutral': {
          'headline': "Former Analyst [NAME] Discusses Economic Policy Vision",
          'summary': "[NAME] outlined their economic policy platform in a detailed interview, covering topics from taxation to employment. The candidate drew on their financial sector experience while addressing various economic challenges."
        }
      }
    };

    return templates[backgroundId] || templates['financial-analyst'];
  }

  private getTVNewsSummaryTemplate(backgroundId: string, program: string): string {
    const templates: Record<string, Record<string, string>> = {
      'toeslagenaffaire-whistleblower': {
        'NOS Journaal': "[NAME] faced pointed questions about the Toeslagenaffaire during today's interview. The candidate's responses will likely influence public perception as they seek political office.",
        'RTL Nieuws': "Political newcomer [NAME] was grilled about their past role in the childcare benefits scandal. Viewers saw a candidate grappling with difficult questions about accountability.",
        'Nieuwsuur': "Tonight we examine [NAME]'s interview performance and what it reveals about their readiness for political leadership. The candidate's handling of Toeslagenaffaire questions was particularly noteworthy."
      }
    };

    return templates[backgroundId]?.[program] || "Political candidate [NAME] discussed their background and policy priorities in today's interview.";
  }

  private extractKeyQuotes(performance: InterviewPerformance, state: ConversationState): string[] {
    const quotes: string[] = [];
    
    // Add quotes from strong moments
    if (performance.strongMoments.length > 0) {
      quotes.push(`"${performance.strongMoments[0]}"`);
    }
    
    // Add quotes from mistakes (if any)
    if (performance.majorMistakes.length > 0) {
      quotes.push(`"${performance.majorMistakes[0]}"`);
    }
    
    // Add generic response based on dominant tone
    quotes.push(`"${this.getGenericQuoteForTone(performance.dominantTone)}"`);
    
    return quotes.slice(0, 3); // Maximum 3 quotes
  }

  private generateInterviewerQuotes(performance: InterviewPerformance, state: ConversationState): string[] {
    const quotes: string[] = [];
    
    // Generate interviewer quotes based on performance
    if (performance.overallScore < 40) {
      quotes.push("The candidate struggled to provide clear answers to several key questions.");
      quotes.push("There were moments where the responses seemed evasive or unprepared.");
    } else if (performance.overallScore > 75) {
      quotes.push("I was impressed by the candidate's willingness to address difficult topics head-on.");
      quotes.push("The responses showed both authenticity and political acumen.");
    } else {
      quotes.push("The candidate handled most questions competently, though some areas need development.");
      quotes.push("Overall, it was a solid performance with room for improvement.");
    }
    
    return quotes.slice(0, 2); // Maximum 2 interviewer quotes
  }

  private selectArticleHeadlineTemplate(templates: Record<string, Record<string, string>>, bias: string, performanceLevel: string): string {
    if (performanceLevel === 'excellent') return templates.positive?.headline || templates.neutral?.headline;
    if (performanceLevel === 'poor') return templates.negative?.headline || templates.neutral?.headline;
    return templates.neutral?.headline || "[NAME] Discusses Political Future";
  }

  private selectArticleSummaryTemplate(templates: Record<string, Record<string, string>>, bias: string, performanceLevel: string): string {
    if (performanceLevel === 'excellent') return templates.positive?.summary || templates.neutral?.summary;
    if (performanceLevel === 'poor') return templates.negative?.summary || templates.neutral?.summary;
    return templates.neutral?.summary || "[NAME] participated in a comprehensive interview covering their background and policy positions.";
  }

  private fillArticleTemplate(template: string, performance: InterviewPerformance, state: ConversationState): string {
    const candidateName = this.getCandidateName(performance.backgroundId);
    return template.replace(/\[NAME\]/g, candidateName);
  }

  private determineArticleFocus(performance: InterviewPerformance, bias: string): string {
    if (performance.majorMistakes.length > 0) return 'Performance concerns';
    if (performance.strongMoments.length > 0) return 'Strong leadership moments';
    if (performance.contradictionCount > 1) return 'Consistency issues';
    return 'Policy positions';
  }

  private determineArticleTone(performance: InterviewPerformance, bias: string): 'positive' | 'negative' | 'neutral' {
    const score = performance.overallScore;
    if (score > 75) return 'positive';
    if (score < 40) return 'negative';
    return 'neutral';
  }

  private determineTVNewsTone(performance: InterviewPerformance, program: string): 'positive' | 'negative' | 'neutral' {
    const score = performance.overallScore;
    
    // Nieuwsuur tends to be more analytical/neutral
    if (program === 'Nieuwsuur') {
      return score < 30 ? 'negative' : 'neutral';
    }
    
    // Other programs more reactive to performance
    if (score > 70) return 'positive';
    if (score < 40) return 'negative';
    return 'neutral';
  }

  private getGenericQuoteForTone(tone: string): string {
    const quotes: Record<string, string> = {
      'confident': 'I stand by my record and my vision for the Netherlands.',
      'defensive': 'I think the criticism is unfair and politically motivated.',
      'diplomatic': 'We need to work together to find solutions that benefit everyone.',
      'evasive': 'That\'s a complex issue that requires careful consideration.',
      'passionate': 'This is exactly why I\'m running - to make a real difference.',
      'principled': 'I will always do what I believe is right for the country.'
    };
    
    return quotes[tone] || 'I\'m committed to serving the Dutch people to the best of my ability.';
  }

  /**
   * Calculate demographic relationship changes - Task 4.7
   */
  private calculateDemographicRelationshipChanges(performance: InterviewPerformance, state: ConversationState): DemographicRelationshipChange[] {
    const relationshipChanges: DemographicRelationshipChange[] = [];

    for (const demographic of this.DEMOGRAPHICS) {
      const changes = this.analyzeDemographicRelationshipImpact(demographic, performance, state);
      relationshipChanges.push(...changes);
    }

    // Filter out minor changes that don't meaningfully impact relationships
    return relationshipChanges.filter(change => Math.abs(change.change) >= 1);
  }

  private analyzeDemographicRelationshipImpact(
    demographic: string,
    performance: InterviewPerformance,
    state: ConversationState
  ): DemographicRelationshipChange[] {
    const changes: DemographicRelationshipChange[] = [];

    // Trust impact based on authenticity and consistency
    const trustChange = this.calculateTrustChange(demographic, performance, state);
    if (Math.abs(trustChange) >= 1) {
      changes.push({
        demographic,
        relationshipType: 'trust',
        change: trustChange,
        reason: this.getTrustChangeReason(trustChange, performance),
        duration: this.getDuration('trust', trustChange),
        severity: this.getSeverity(Math.abs(trustChange))
      });
    }

    // Credibility impact based on consistency and expertise
    const credibilityChange = this.calculateCredibilityChange(demographic, performance, state);
    if (Math.abs(credibilityChange) >= 1) {
      changes.push({
        demographic,
        relationshipType: 'credibility',
        change: credibilityChange,
        reason: this.getCredibilityChangeReason(credibilityChange, performance),
        duration: this.getDuration('credibility', credibilityChange),
        severity: this.getSeverity(Math.abs(credibilityChange))
      });
    }

    // Relatability impact based on background and tone
    const relatabilityChange = this.calculateRelatabilityChange(demographic, performance, state);
    if (Math.abs(relatabilityChange) >= 1) {
      changes.push({
        demographic,
        relationshipType: 'relatability',
        change: relatabilityChange,
        reason: this.getRelatabilityChangeReason(relatabilityChange, performance, demographic),
        duration: this.getDuration('relatability', relatabilityChange),
        severity: this.getSeverity(Math.abs(relatabilityChange))
      });
    }

    // Leadership perception impact
    const leadershipChange = this.calculateLeadershipChange(demographic, performance, state);
    if (Math.abs(leadershipChange) >= 1) {
      changes.push({
        demographic,
        relationshipType: 'leadership',
        change: leadershipChange,
        reason: this.getLeadershipChangeReason(leadershipChange, performance),
        duration: this.getDuration('leadership', leadershipChange),
        severity: this.getSeverity(Math.abs(leadershipChange))
      });
    }

    // Competence perception impact
    const competenceChange = this.calculateCompetenceChange(demographic, performance, state);
    if (Math.abs(competenceChange) >= 1) {
      changes.push({
        demographic,
        relationshipType: 'competence',
        change: competenceChange,
        reason: this.getCompetenceChangeReason(competenceChange, performance),
        duration: this.getDuration('competence', competenceChange),
        severity: this.getSeverity(Math.abs(competenceChange))
      });
    }

    return changes;
  }

  private calculateTrustChange(demographic: string, performance: InterviewPerformance, state: ConversationState): number {
    let trustChange = 0;

    // Base trust change from consistency
    if (performance.consistency > 85) {
      trustChange += 3;
    } else if (performance.consistency < 60) {
      trustChange -= 2;
    }

    // Major contradictions severely damage trust
    if (performance.contradictionCount > 1) {
      trustChange -= 4;
    }

    // Authenticity impacts trust
    if (performance.authenticity > 80) {
      trustChange += 2;
    } else if (performance.authenticity < 50) {
      trustChange -= 3;
    }

    // Demographic-specific trust factors
    const trustMultipliers: Record<string, number> = {
      'elderly': performance.dominantTone === 'respectful' ? 1.3 : 0.8,
      'working-class': performance.dominantTone === 'evasive' ? 0.4 : 1.1,
      'young-professionals': performance.authenticity > 70 ? 1.2 : 0.9,
      'religious-conservatives': performance.consistency > 80 ? 1.4 : 0.7
    };

    return Math.round(trustChange * (trustMultipliers[demographic] || 1.0));
  }

  private calculateCredibilityChange(demographic: string, performance: InterviewPerformance, state: ConversationState): number {
    let credibilityChange = 0;

    // Major mistakes hurt credibility
    if (performance.majorMistakes.length > 0) {
      credibilityChange -= performance.majorMistakes.length * 2;
    }

    // Strong moments boost credibility
    if (performance.strongMoments.length > 0) {
      credibilityChange += performance.strongMoments.length * 1.5;
    }

    // Expertise demonstration
    if (performance.dominantTone === 'confident' && performance.consistency > 75) {
      credibilityChange += 2;
    }

    // Background-specific credibility factors
    const backgroundMultipliers: Record<string, Record<string, number>> = {
      'business-owners': {
        'financial-analyst': 1.5,
        'shell-executive': 1.2,
        'small-business-owner': 1.3
      },
      'environmentalists': {
        'shell-executive': 0.3,
        'environmental-activist': 1.8
      },
      'academic-researchers': {
        'academic-researcher': 1.4,
        'tech-entrepreneur': 1.1
      }
    };

    const multiplier = backgroundMultipliers[demographic]?.[performance.backgroundId] || 1.0;
    return Math.round(credibilityChange * multiplier);
  }

  private calculateRelatabilityChange(demographic: string, performance: InterviewPerformance, state: ConversationState): number {
    let relatabilityChange = 0;

    // Background compatibility with demographic
    const relatabilityMatrix: Record<string, Record<string, number>> = {
      'working-class': {
        'small-business-owner': 2,
        'shell-executive': -3,
        'financial-analyst': -1,
        'academic-researcher': -2
      },
      'business-owners': {
        'financial-analyst': 3,
        'shell-executive': 2,
        'small-business-owner': 4,
        'environmental-activist': -2
      },
      'students': {
        'academic-researcher': 3,
        'environmental-activist': 2,
        'tech-entrepreneur': 3,
        'shell-executive': -2
      },
      'farmers': {
        'small-business-owner': 2,
        'environmental-activist': -1,
        'shell-executive': -2,
        'academic-researcher': -1
      },
      'urban-renters': {
        'environmental-activist': 2,
        'small-business-owner': 1,
        'shell-executive': -2
      }
    };

    relatabilityChange += relatabilityMatrix[demographic]?.[performance.backgroundId] || 0;

    // Tone compatibility
    if (performance.dominantTone === 'authentic' || performance.dominantTone === 'passionate') {
      relatabilityChange += 1;
    } else if (performance.dominantTone === 'evasive' || performance.dominantTone === 'corporate') {
      relatabilityChange -= 2;
    }

    return relatabilityChange;
  }

  private calculateLeadershipChange(demographic: string, performance: InterviewPerformance, state: ConversationState): number {
    let leadershipChange = 0;

    // Strong confident performance boosts leadership perception
    if (performance.confidence > 75 && performance.overallScore > 70) {
      leadershipChange += 3;
    }

    // Poor performance under pressure hurts leadership perception
    if (performance.confidence < 50 || performance.overallScore < 40) {
      leadershipChange -= 2;
    }

    // Handling difficult questions shows leadership
    if (performance.strongMoments.length > performance.majorMistakes.length) {
      leadershipChange += 1;
    }

    // Demographic-specific leadership expectations
    const leadershipExpectations: Record<string, number> = {
      'business-owners': performance.confidence > 80 ? 1.3 : 0.8,
      'elderly': performance.dominantTone === 'respectful' ? 1.2 : 0.7,
      'young-professionals': performance.dominantTone === 'innovative' ? 1.4 : 1.0
    };

    return Math.round(leadershipChange * (leadershipExpectations[demographic] || 1.0));
  }

  private calculateCompetenceChange(demographic: string, performance: InterviewPerformance, state: ConversationState): number {
    let competenceChange = 0;

    // Overall performance directly impacts competence perception
    if (performance.overallScore > 80) {
      competenceChange += 3;
    } else if (performance.overallScore < 50) {
      competenceChange -= 2;
    }

    // Expertise demonstration
    if (performance.dominantTone === 'knowledgeable' && performance.consistency > 70) {
      competenceChange += 2;
    }

    // Major mistakes hurt competence perception more than other factors
    if (performance.majorMistakes.length > 0) {
      competenceChange -= performance.majorMistakes.length * 1.5;
    }

    return competenceChange;
  }

  private getTrustChangeReason(change: number, performance: InterviewPerformance): string {
    if (change > 0) {
      if (performance.consistency > 85) return 'Consistent and authentic responses built trust';
      if (performance.authenticity > 80) return 'Genuine and honest communication increased trust';
      return 'Reliable performance strengthened trust';
    } else {
      if (performance.contradictionCount > 1) return 'Contradictory statements damaged trustworthiness';
      if (performance.authenticity < 50) return 'Responses seemed calculated rather than genuine';
      return 'Inconsistent messaging undermined trust';
    }
  }

  private getCredibilityChangeReason(change: number, performance: InterviewPerformance): string {
    if (change > 0) {
      if (performance.strongMoments.length > 0) return 'Strong responses demonstrated expertise and competence';
      return 'Confident and knowledgeable answers enhanced credibility';
    } else {
      if (performance.majorMistakes.length > 0) return 'Significant errors raised questions about competence';
      return 'Uncertain or incorrect responses hurt credibility';
    }
  }

  private getRelatabilityChangeReason(change: number, performance: InterviewPerformance, demographic: string): string {
    if (change > 0) {
      return `Background and communication style resonated well with ${demographic.replace('-', ' ')}`;
    } else {
      return `Responses seemed disconnected from ${demographic.replace('-', ' ')} concerns and experiences`;
    }
  }

  private getLeadershipChangeReason(change: number, performance: InterviewPerformance): string {
    if (change > 0) {
      if (performance.confidence > 75) return 'Confident handling of pressure demonstrated leadership qualities';
      return 'Strong performance under scrutiny showed leadership potential';
    } else {
      if (performance.confidence < 50) return 'Uncertain responses raised questions about leadership readiness';
      return 'Difficulty handling challenging questions undermined leadership perception';
    }
  }

  private getCompetenceChangeReason(change: number, performance: InterviewPerformance): string {
    if (change > 0) {
      return 'Knowledgeable responses and policy expertise demonstrated competence';
    } else {
      if (performance.majorMistakes.length > 0) return 'Factual errors and unclear responses raised competence concerns';
      return 'Struggled to demonstrate sufficient knowledge and expertise';
    }
  }

  private getDuration(relationshipType: string, change: number): 'temporary' | 'permanent' | 'long-term' {
    const magnitude = Math.abs(change);
    
    if (relationshipType === 'trust' && magnitude > 3) return 'permanent';
    if (relationshipType === 'credibility' && magnitude > 4) return 'long-term';
    if (magnitude > 5) return 'permanent';
    if (magnitude > 2) return 'long-term';
    return 'temporary';
  }

  private getSeverity(magnitude: number): 'minor' | 'moderate' | 'major' {
    if (magnitude >= 5) return 'major';
    if (magnitude >= 3) return 'moderate';
    return 'minor';
  }

  private getPerformanceLevel(score: number): 'excellent' | 'good' | 'average' | 'poor' | 'terrible' {
    if (score >= 85) return 'excellent';
    if (score >= 70) return 'good';
    if (score >= 55) return 'average';
    if (score >= 35) return 'poor';
    return 'terrible';
  }
}