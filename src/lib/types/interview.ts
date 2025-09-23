/**
 * Dynamic Interview System Types
 * Modular interview engine supporting multiple interview types and stages
 */

export type InterviewType = 'character-creation' | 'scandal-response' | 'debate-prep' | 'crisis-management';
export type DifficultyLevel = 'low' | 'medium' | 'high' | 'extreme';
export type InterviewerMood = 'neutral' | 'professional' | 'skeptical' | 'excited' | 'frustrated' | 'hostile' | 'sympathetic';
export type InterviewerType = 'professional' | 'confrontational' | 'investigative';
export type QuestionType = 'opener' | 'challenge' | 'follow-up' | 'gotcha' | 'closer';
export type ResponseTone = 'aggressive' | 'defensive' | 'evasive' | 'confrontational' | 'diplomatic' | 'confident';
export type ConversationActionType = 'question' | 'interruption' | 'follow-up' | 'contradiction-challenge' | 'conclusion';

// Core Interview Configuration
export interface InterviewConfig {
  type: InterviewType;
  backgroundId: string;
  scenarioId?: string;
  difficulty: 'auto' | DifficultyLevel;
  interviewerType: InterviewerType;
  timeConstraints?: TimeConstraints;
}

export interface TimeConstraints {
  maxDuration?: number; // Total interview time limit in minutes
  urgentQuestionTime?: number; // Default time for urgent questions in seconds
  warningThreshold?: number; // Warning threshold in seconds
}

// Question Arc System
export interface QuestionArc {
  backgroundId: string;
  difficulty: DifficultyLevel;
  interviewerApproach: InterviewerType;
  questionCount: number;
  questions: DynamicQuestion[];
}

export interface DynamicQuestion {
  id: string;
  type: QuestionType;
  setup?: string; // Optional scene-setting
  question: string;
  urgency?: {
    timeLimit: number;
    warningThreshold: number;
    timeoutAction: 'auto-select' | 'penalty';
  };
  interruptionTriggers: InterruptionTrigger[];
  followUpRules: FollowUpRule[];
  responseOptions: ContextualResponseOption[];
}

export interface ContextualResponseOption {
  text: string;
  tone: ResponseTone;
  position?: PoliticalPosition;
  consequences: ConversationEffect[];
  triggers: string[]; // What this response might trigger
}

// Conversation Flow
export interface ConversationState {
  answeredQuestions: string[];
  playerResponses: PlayerResponse[];
  interviewerMood: InterviewerMood;
  conversationMemory: ConversationMemory;
  performanceMetrics: PerformanceMetrics;
  contradictions: Contradiction[];
  currentQuestionId?: string;
}

export interface PlayerResponse {
  questionId: string;
  responseText: string;
  tone: ResponseTone;
  position?: PoliticalPosition;
  wordCount: number;
  timestamp: number;
  contradictsPrevious?: boolean;
  topic?: string;
}

export interface ConversationMemory {
  keyStatements: Map<string, string>; // topic -> statement
  positionHistory: PoliticalPosition[];
  contradictions: Contradiction[];
  strongMoments: string[];
  weakMoments: string[];
}

export interface Contradiction {
  questionId1: string;
  questionId2: string;
  description: string;
  severity: 'minor' | 'major' | 'critical';
}

// Interviewer Behavior
export interface InterviewerPersonality {
  type: InterviewerType;
  mood: InterviewerMood;
  reactionPatterns: ReactionPattern[];
  memorySystem: InterviewerMemory;
}

export interface ReactionPattern {
  trigger: ResponseTone | 'contradiction' | 'evasion';
  conditions: string[];
  reaction: InterviewerReaction;
}

export interface InterviewerReaction {
  type: 'mood-change' | 'interruption' | 'follow-up' | 'emotional-display';
  intensity: 'low' | 'medium' | 'high';
  message?: string;
  newMood?: InterviewerMood;
}

export interface InterviewerMemory {
  references: Map<string, string>; // What the interviewer remembers to reference
  frustrationLevel: number;
  surpriseLevel: number;
  approvalLevel: number;
}

// Conversation Actions
export interface ConversationAction {
  type: ConversationActionType;
  content: string;
  metadata?: Record<string, any>;
}

export interface Interruption extends ConversationAction {
  type: 'interruption';
  trigger: string;
  followUp?: string;
}

export interface FollowUpRule {
  if: string; // Condition (e.g., 'tone:defensive', 'contradicts:previous')
  then: string; // Action (e.g., question ID, interruption type)
  probability?: number; // 0-1, default 1
}

export interface InterruptionTrigger {
  condition: string; // e.g., 'evasion', 'deflection', 'word_count>50'
  probability: number;
  message: string;
  followUpAction?: string;
}

export interface ConversationEffect {
  type: 'mood-change' | 'memory-update' | 'performance-impact' | 'trigger-follow-up';
  value: any;
  description?: string;
}

export interface ConversationTrigger {
  id: string;
  condition: string;
  action: ConversationAction;
  oneTime: boolean;
}

// Performance and Metrics
export interface PerformanceMetrics {
  consistency: number;
  confidence: number;
  authenticity: number;
  engagement: number;
  overallScore: number;
  dominantTone: ResponseTone;
  majorMistakes: string[];
  strongMoments: string[];
}

export interface InterviewPerformance extends PerformanceMetrics {
  backgroundId: string;
  duration: number;
  questionsAnswered: number;
  interruptionCount: number;
  contradictionCount: number;
}

// Interview Results and Aftermath
export interface InterviewResult {
  performance: InterviewPerformance;
  positions: PoliticalPosition[];
  aftermath: InterviewAftermath;
  gameplayEffects: GameplayEffect[];
}

export interface InterviewAftermath {
  headlines: NewsHeadline[];
  socialMediaReactions: SocialMediaPost[];
  coalitionPartnerReactions: PartnerReaction[];
  approvalRatingImpact: ApprovalRatingChange[];
  viralMoments?: ViralMoment[];
}

export interface NewsHeadline {
  outlet: string;
  headline: string;
  tone: 'positive' | 'negative' | 'neutral';
  focus: string; // What aspect they focused on
}

export interface SocialMediaPost {
  platform: 'twitter' | 'instagram' | 'linkedin';
  demographic: string;
  content: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  virality: number; // 0-100 viral potential
}

export interface PartnerReaction {
  partyId: string;
  leaderName: string;
  reaction: string;
  impact: 'positive' | 'negative' | 'neutral';
}

export interface ApprovalRatingChange {
  demographic: string;
  change: number; // percentage point change
  reason: string;
}

export interface ViralMoment {
  questionId: string;
  responseText: string;
  reason: string;
  impact: 'positive' | 'negative';
  shareCount: number;
}

export interface GameplayEffect {
  type: 'approval-rating' | 'demographic-relationship' | 'coalition-opinion' | 'media-reputation';
  target: string;
  change: number;
  duration?: 'permanent' | 'temporary';
  description: string;
}

// Political Position (re-exported from game.ts for convenience)
export interface PoliticalPosition {
  issueId: string;
  position: number; // -100 to 100
  priority: number; // 1-5
  confidence: number; // How sure the player seems about this position
}

// Mood progression and transitions
export interface MoodChange {
  from: InterviewerMood;
  to: InterviewerMood;
  trigger: string;
  intensity: 'gradual' | 'sudden';
  visibleReaction?: string;
}

// Question Arc Factory
export interface QuestionArcDefinition {
  backgroundId: string;
  difficulty: DifficultyLevel;
  interviewerApproach: InterviewerType;
  questionCount: number;
  arc: DynamicQuestion[];
  specialRules?: SpecialRule[];
}

export interface SpecialRule {
  id: string;
  condition: string;
  action: string;
  description: string;
}

// Controversy-based Difficulty Scaling System
export interface ControversyFactors {
  publicScrutiny: number;        // 0-1: Level of media/public attention
  stakeholderImpact: number;     // 0-1: Breadth of people affected
  ethicalComplexity: number;     // 0-1: Complexity of moral questions
  politicalSensitivity: number;  // 0-1: Political volatility of the issues
  personalRisk: number;          // 0-1: Personal stakes for the candidate
  systemicInfluence: number;     // 0-1: Scale of system impact/change
}

export interface ControveryAnalysis {
  backgroundId: string;
  overallScore: number;          // 0-1: Weighted controversy score
  difficulty: DifficultyLevel;   // Resulting difficulty level
  factors: ControversyFactors;   // Individual factor scores
  reasoning: string;             // Human-readable explanation
}

// Background-specific Interviewer Personality Adaptations
export interface BackgroundApproach {
  baseAggressiveness: number;      // 0-1: Overall aggressiveness level
  skepticismLevel: number;         // 0-1: Level of skepticism toward candidate
  empathyLevel: number;            // 0-1: Empathy toward candidate's background
  professionalDistance: number;    // 0-1: Professional vs personal approach
  followUpTendency: number;        // 0-1: Likelihood to ask follow-up questions
  interruptionThreshold: number;   // 0-1: Threshold for interrupting (higher = less likely)
  contextualFocus: string[];       // Key topics/themes to focus on
  questioningStyle: string;        // Style descriptor for questioning approach
  description: string;             // Human-readable description of approach
}

// Enhanced Mood Progression System
export interface MoodProgression {
  currentMood: InterviewerMood;
  moodIntensity: number;           // 0-100: How intense the current mood is
  moodStability: number;           // 0-100: How resistant to mood changes
  progressionTriggers: MoodTrigger[];
  allowedTransitions: MoodTransition[];
}

// Rapid-Fire Follow-Up System
export interface RapidFireSession {
  isActive: boolean;
  targetTopic: string;
  questionsRemaining: number;
  maxQuestions: number;
  intensity: 'low' | 'medium' | 'high' | 'extreme';
  currentQuestion: number;
  timeConstraint?: number;         // Seconds to answer each question
  triggerReason: string;
  questions: RapidFireQuestion[];
}

export interface RapidFireQuestion {
  id: string;
  text: string;
  followUpType: 'clarification' | 'challenge' | 'pressure' | 'contradiction';
  timeLimit?: number;
  expectedResponseType: 'direct' | 'detailed' | 'yes-no' | 'specific-fact';
  escalationLevel: number;         // 1-5: How confrontational this question is
}

export interface RapidFireTrigger {
  id: string;
  condition: string;               // e.g., 'evasion_count>=2', 'topic_avoidance>=3'
  targetTopic?: string;
  intensity: 'low' | 'medium' | 'high' | 'extreme';
  questionCount: number;           // How many rapid-fire questions to ask
  timeConstraint?: number;         // Time limit per question
  questions: string[];             // Template questions for this trigger
  description: string;
}

export interface RapidFireConfig {
  enabled: boolean;
  maxConcurrentSessions: number;   // Usually 1, but could allow multiple topics
  cooldownPeriod: number;          // Seconds before another rapid-fire can start
  intensityScaling: RapidFireIntensityConfig;
  triggers: RapidFireTrigger[];
}

export interface RapidFireIntensityConfig {
  low: { questionCount: number; timeLimit: number; escalationRate: number };
  medium: { questionCount: number; timeLimit: number; escalationRate: number };
  high: { questionCount: number; timeLimit: number; escalationRate: number };
  extreme: { questionCount: number; timeLimit: number; escalationRate: number };
}

export interface MoodTrigger {
  id: string;
  condition: string;               // Trigger condition (e.g., 'consecutive_evasions>=3')
  targetMood: InterviewerMood;
  intensityChange: number;         // How much to change intensity
  probability: number;             // 0-1: Chance of triggering
  description: string;
}

export interface MoodTransition {
  from: InterviewerMood;
  to: InterviewerMood;
  minIntensity: number;           // Minimum intensity needed for transition
  transitionSpeed: 'instant' | 'gradual' | 'slow';
  visualCue?: string;             // Animation or visual indicator
  audioData?: string;             // Sound effect data
}

export interface MoodState {
  mood: InterviewerMood;
  intensity: number;
  duration: number;               // How long in this mood (seconds)
  triggers: string[];             // What caused this mood
  stability: number;              // Current stability level
}
