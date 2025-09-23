/**
 * Performance Analyzer
 * Analyzes player responses and tracks interview performance metrics
 */

import type {
  PlayerResponse,
  ConversationState,
  PerformanceMetrics,
  ResponseTone
} from '../types/interview.js';

export class PerformanceAnalyzer {
  private readonly TONE_WEIGHTS: Record<ResponseTone, number> = {
    'confident': 1.0,
    'diplomatic': 0.8,
    'aggressive': 0.3,
    'confrontational': 0.2,
    'defensive': 0.1,
    'evasive': -0.2
  };

  private readonly WORD_COUNT_OPTIMAL_RANGE = { min: 20, max: 80 };

  /**
   * Analyze a response and update performance metrics
   */
  analyzeResponse(response: PlayerResponse, state: ConversationState): void {
    this.updateConsistency(response, state);
    this.updateConfidence(response, state);
    this.updateAuthenticity(response, state);
    this.updateEngagement(response, state);
    this.updateOverallScore(state);
    this.updateDominantTone(response, state);
    this.identifyMoments(response, state);
  }

  /**
   * Update consistency score based on contradictions
   */
  private updateConsistency(response: PlayerResponse, state: ConversationState): void {
    const metrics = state.performanceMetrics;

    if (response.contradictsPrevious) {
      // Penalize contradictions
      metrics.consistency = Math.max(0, metrics.consistency - 15);

      // Add to major mistakes if this is a significant contradiction
      const contradictionSeverity = this.assessContradictionSeverity(response, state);
      if (contradictionSeverity === 'major' || contradictionSeverity === 'critical') {
        metrics.majorMistakes.push(`Contradicted previous position on ${response.topic}`);
      }
    } else {
      // Slightly reward consistency
      metrics.consistency = Math.min(100, metrics.consistency + 1);
    }

    // Check for topic consistency across multiple responses
    const topicResponses = state.playerResponses.filter(r => r.topic === response.topic);
    if (topicResponses.length > 1) {
      const toneConsistency = this.checkToneConsistency(topicResponses);
      if (toneConsistency > 0.8) {
        metrics.consistency = Math.min(100, metrics.consistency + 2);
      } else if (toneConsistency < 0.4) {
        metrics.consistency = Math.max(0, metrics.consistency - 5);
      }
    }
  }

  /**
   * Update confidence score based on response tone and assertiveness
   */
  private updateConfidence(response: PlayerResponse, state: ConversationState): void {
    const metrics = state.performanceMetrics;
    const toneWeight = this.TONE_WEIGHTS[response.tone];

    // Base confidence adjustment from tone
    const toneAdjustment = toneWeight * 10;

    // Word count factor (too short or too long hurts confidence)
    let wordCountFactor = 1;
    if (response.wordCount < this.WORD_COUNT_OPTIMAL_RANGE.min) {
      wordCountFactor = 0.5; // Too brief seems uncertain
    } else if (response.wordCount > this.WORD_COUNT_OPTIMAL_RANGE.max) {
      wordCountFactor = 0.7; // Too verbose seems rambling
    }

    // Urgency factor (performing under pressure shows confidence)
    let urgencyFactor = 1;
    const currentQuestion = this.getCurrentQuestion(response.questionId, state);
    if (currentQuestion?.urgency && response.tone !== 'evasive') {
      urgencyFactor = 1.2; // Bonus for handling pressure well
    }

    const confidenceChange = toneAdjustment * wordCountFactor * urgencyFactor;
    metrics.confidence = Math.max(0, Math.min(100, metrics.confidence + confidenceChange));

    // Track strong moments for confident responses
    if (response.tone === 'confident' && response.wordCount >= 20) {
      metrics.strongMoments.push(`Strong confident response on ${response.topic || 'key issue'}`);
    }
  }

  /**
   * Update authenticity score based on response genuineness
   */
  private updateAuthenticity(response: PlayerResponse, state: ConversationState): void {
    const metrics = state.performanceMetrics;

    // Evasive responses hurt authenticity
    if (response.tone === 'evasive') {
      metrics.authenticity = Math.max(0, metrics.authenticity - 8);
      return;
    }

    // Defensive responses without substance hurt authenticity
    if (response.tone === 'defensive' && response.wordCount < 15) {
      metrics.authenticity = Math.max(0, metrics.authenticity - 5);
      return;
    }

    // Direct, substantive responses boost authenticity
    if ((response.tone === 'confident' || response.tone === 'diplomatic') &&
        response.wordCount >= 20 && response.wordCount <= 60) {
      metrics.authenticity = Math.min(100, metrics.authenticity + 3);
    }

    // Personal admissions or vulnerability boost authenticity significantly
    if (this.containsPersonalAdmission(response.responseText)) {
      metrics.authenticity = Math.min(100, metrics.authenticity + 10);
      metrics.strongMoments.push(`Authentic personal admission`);
    }

    // Corporate speak or political jargon hurts authenticity
    if (this.containsCorporateSpeak(response.responseText)) {
      metrics.authenticity = Math.max(0, metrics.authenticity - 6);
    }
  }

  /**
   * Update engagement score based on response depth and interest
   */
  private updateEngagement(response: PlayerResponse, state: ConversationState): void {
    const metrics = state.performanceMetrics;

    // Word count engagement factor
    let engagementChange = 0;
    if (response.wordCount >= 30 && response.wordCount <= 80) {
      engagementChange += 3; // Optimal length shows engagement
    } else if (response.wordCount < 10) {
      engagementChange -= 5; // Too brief shows disengagement
    } else if (response.wordCount > 120) {
      engagementChange -= 3; // Too long loses audience
    }

    // Tone engagement factor
    if (response.tone === 'confident' || response.tone === 'confrontational') {
      engagementChange += 2; // Strong positions are engaging
    } else if (response.tone === 'evasive') {
      engagementChange -= 8; // Evasion is boring
    }

    // Storytelling or concrete examples boost engagement
    if (this.containsStoryOrExample(response.responseText)) {
      engagementChange += 5;
      metrics.strongMoments.push(`Engaging story or example`);
    }

    metrics.engagement = Math.max(0, Math.min(100, metrics.engagement + engagementChange));
  }

  /**
   * Update overall performance score
   */
  private updateOverallScore(state: ConversationState): void {
    const metrics = state.performanceMetrics;

    // Weighted average of all metrics
    const weights = {
      consistency: 0.25,
      confidence: 0.25,
      authenticity: 0.30,
      engagement: 0.20
    };

    metrics.overallScore = Math.round(
      metrics.consistency * weights.consistency +
      metrics.confidence * weights.confidence +
      metrics.authenticity * weights.authenticity +
      metrics.engagement * weights.engagement
    );

    // Apply penalties for major mistakes
    const mistakePenalty = metrics.majorMistakes.length * 5;
    metrics.overallScore = Math.max(0, metrics.overallScore - mistakePenalty);
  }

  /**
   * Track dominant tone pattern
   */
  private updateDominantTone(response: PlayerResponse, state: ConversationState): void {
    const responses = [...state.playerResponses, response];
    const toneCounts = responses.reduce((counts, r) => {
      counts[r.tone] = (counts[r.tone] || 0) + 1;
      return counts;
    }, {} as Record<ResponseTone, number>);

    // Find most frequent tone
    let dominantTone: ResponseTone = 'diplomatic';
    let maxCount = 0;

    for (const [tone, count] of Object.entries(toneCounts)) {
      if (count > maxCount) {
        maxCount = count;
        dominantTone = tone as ResponseTone;
      }
    }

    state.performanceMetrics.dominantTone = dominantTone;
  }

  /**
   * Identify strong and weak moments
   */
  private identifyMoments(response: PlayerResponse, state: ConversationState): void {
    const metrics = state.performanceMetrics;

    // Major mistake identification
    if (response.tone === 'evasive' && response.wordCount < 10) {
      metrics.majorMistakes.push(`Failed to engage with question about ${response.topic}`);
    }

    if (response.contradictsPrevious) {
      const severity = this.assessContradictionSeverity(response, state);
      if (severity === 'critical') {
        metrics.majorMistakes.push(`Critical contradiction on ${response.topic}`);
      }
    }

    // Strong moment identification (already handled in other methods)
  }

  /**
   * Check tone consistency across responses on same topic
   */
  private checkToneConsistency(responses: PlayerResponse[]): number {
    if (responses.length < 2) return 1;

    const toneVariations = new Set(responses.map(r => r.tone)).size;
    return 1 - (toneVariations - 1) / (responses.length - 1);
  }

  /**
   * Assess severity of contradiction
   */
  private assessContradictionSeverity(response: PlayerResponse, state: ConversationState): 'minor' | 'major' | 'critical' {
    const previousResponse = state.playerResponses.find(r =>
      r.topic === response.topic && r.questionId !== response.questionId
    );

    if (!previousResponse) return 'minor';

    // Critical: Opposite tones on same topic
    const criticalTonePairs = [
      ['aggressive', 'defensive'],
      ['confrontational', 'evasive'],
      ['confident', 'defensive']
    ];

    for (const [tone1, tone2] of criticalTonePairs) {
      if ((previousResponse.tone === tone1 && response.tone === tone2) ||
          (previousResponse.tone === tone2 && response.tone === tone1)) {
        return 'critical';
      }
    }

    // Major: Significant tone shift
    if (Math.abs(this.TONE_WEIGHTS[previousResponse.tone] - this.TONE_WEIGHTS[response.tone]) > 0.5) {
      return 'major';
    }

    return 'minor';
  }

  /**
   * Check if response contains personal admission or vulnerability
   */
  private containsPersonalAdmission(text: string): boolean {
    const admissionPhrases = [
      'i was wrong',
      'i made a mistake',
      'i learned',
      'i admit',
      'i regret',
      'my fault',
      'i should have',
      'i failed'
    ];

    const lowerText = text.toLowerCase();
    return admissionPhrases.some(phrase => lowerText.includes(phrase));
  }

  /**
   * Check if response contains corporate speak or jargon
   */
  private containsCorporateSpeak(text: string): boolean {
    const corporatePhrases = [
      'synergies',
      'stakeholders',
      'value proposition',
      'leverage core competencies',
      'paradigm shift',
      'low-hanging fruit',
      'moving forward',
      'at the end of the day',
      'circle back',
      'touch base'
    ];

    const lowerText = text.toLowerCase();
    return corporatePhrases.some(phrase => lowerText.includes(phrase));
  }

  /**
   * Check if response contains story or concrete example
   */
  private containsStoryOrExample(text: string): boolean {
    const storyIndicators = [
      'for example',
      'let me tell you',
      'i remember',
      'last year',
      'when i was',
      'there was a time',
      'i met a',
      'like the case of',
      'such as',
      'imagine'
    ];

    const lowerText = text.toLowerCase();
    return storyIndicators.some(indicator => lowerText.includes(indicator));
  }

  /**
   * Get current question (helper method)
   */
  private getCurrentQuestion(questionId: string, state: ConversationState): any {
    // This would need to be passed in or available through state
    // For now, return null as it's used for optional urgency checks
    return null;
  }

  /**
   * Generate performance summary
   */
  generateSummary(state: ConversationState): {
    grade: string;
    description: string;
    strengths: string[];
    weaknesses: string[];
  } {
    const metrics = state.performanceMetrics;
    const score = metrics.overallScore;

    let grade: string;
    let description: string;

    if (score >= 90) {
      grade = 'A';
      description = 'Exceptional interview performance with authentic, confident responses';
    } else if (score >= 80) {
      grade = 'B';
      description = 'Strong interview performance with mostly consistent messaging';
    } else if (score >= 70) {
      grade = 'C';
      description = 'Adequate interview performance with some strong moments';
    } else if (score >= 60) {
      grade = 'D';
      description = 'Weak interview performance with significant issues';
    } else {
      grade = 'F';
      description = 'Poor interview performance requiring major improvement';
    }

    const strengths: string[] = [];
    const weaknesses: string[] = [];

    // Identify strengths
    if (metrics.consistency > 80) strengths.push('Consistent messaging');
    if (metrics.confidence > 75) strengths.push('Confident delivery');
    if (metrics.authenticity > 75) strengths.push('Authentic responses');
    if (metrics.engagement > 75) strengths.push('Engaging communication');
    if (metrics.strongMoments.length > 2) strengths.push('Multiple strong moments');

    // Identify weaknesses
    if (metrics.consistency < 60) weaknesses.push('Inconsistent positions');
    if (metrics.confidence < 50) weaknesses.push('Lack of confidence');
    if (metrics.authenticity < 50) weaknesses.push('Inauthentic responses');
    if (metrics.engagement < 50) weaknesses.push('Poor audience engagement');
    if (metrics.majorMistakes.length > 2) weaknesses.push('Multiple significant errors');
    if (metrics.dominantTone === 'evasive') weaknesses.push('Too much evasion');
    if (metrics.dominantTone === 'defensive') weaknesses.push('Overly defensive');

    return { grade, description, strengths, weaknesses };
  }
}