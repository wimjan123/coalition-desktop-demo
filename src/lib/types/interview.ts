/**
 * Dynamic Interview System Types
 * Modular interview engine supporting multiple interview types and stages
 */

export type InterviewType = 'character-creation' | 'scandal-response' | 'debate-prep' | 'crisis-management' | 'coalition-negotiation' | 'policy-announcement' | 'investigative-journalism' | 'late-campaign-pressure';
export type DifficultyLevel = 'low' | 'medium' | 'high' | 'extreme';
export type InterviewerMood = 'neutral' | 'professional' | 'skeptical' | 'excited' | 'frustrated' | 'hostile' | 'sympathetic' | 'surprised' | 'approving';
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
  frustrationSystem?: FrustrationEscalationSystem; // Optional frustration escalation system
  surpriseApprovalSystem?: SurpriseApprovalSystem; // Optional surprise/approval reaction system
}

export interface ReactionPattern {
  trigger: ResponseTone | 'contradiction' | 'evasion' | 'surprise' | 'approval';
  conditions: string[];
  reaction: InterviewerReaction;
}

export interface InterviewerReaction {
  type: 'mood-change' | 'interruption' | 'follow-up' | 'emotional-display' | 'surprise' | 'approval';
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
  // Task 4.5 & 4.6: Enhanced news coverage
  newsArticles?: NewsArticle[];
  tvNewsClips?: TVNewsClip[];
  // Task 4.7: Demographic relationship impact system
  demographicRelationshipChanges?: DemographicRelationshipChange[];
}

export interface NewsHeadline {
  outlet: string;
  headline: string;
  tone: 'positive' | 'negative' | 'neutral';
  focus: string; // What aspect they focused on
}

// Task 4.5: Newspaper article generator
export interface NewsArticle {
  outlet: string;
  headline: string;
  summary: string;
  keyQuotes: string[];
  focus: string;
  tone: 'positive' | 'negative' | 'neutral';
  wordCount: number;
}

// Task 4.6: TV news clip summary  
export interface TVNewsClip {
  channel: string;
  program: string;
  anchor: string;
  summary: string;
  interviewerQuotes: string[];
  duration: number; // in seconds
  tone: 'positive' | 'negative' | 'neutral';
}

// Task 4.7: Demographic relationship impact system
export interface DemographicRelationshipChange {
  demographic: string;
  relationshipType: 'trust' | 'credibility' | 'relatability' | 'leadership' | 'competence';
  change: number; // -10 to +10
  reason: string;
  duration: 'temporary' | 'permanent' | 'long-term';
  severity: 'minor' | 'moderate' | 'major';
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

// Phase 5: Campaign-Stage Interview System Types

// Scandal Response Interview Framework
export interface ScandalScenario {
  id: string;
  type: ScandalType;
  severity: 'minor' | 'moderate' | 'major' | 'catastrophic';
  title: string;
  description: string;
  timeUntilInterview: number; // Hours before interview happens
  stakeholders: ScandalStakeholder[];
  evidenceAgainst: ScandalEvidence[];
  defensiblePositions: DefenseStrategy[];
  mediaAttention: MediaAttentionLevel;
  publicOpinion: PublicOpinionData;
  politicalRamifications: PoliticalConsequence[];
}

export type ScandalType =
  | 'financial-impropriety'    // Financial conflicts, corruption, expenses
  | 'personal-conduct'         // Personal behavior, past actions
  | 'policy-contradiction'     // Flip-flopping, broken promises
  | 'competence-failure'       // Major mistakes, poor judgment
  | 'association-scandal'      // Connections to problematic people/organizations
  | 'corruption-allegation'    // Bribery, influence peddling
  | 'cover-up-accusation'      // Hiding information, lack of transparency
  | 'abuse-of-power'          // Misusing position for personal gain
  | 'ethical-violation'       // Conflict of interest, ethics breaches
  | 'criminal-allegation';    // Actual criminal charges or accusations

export interface ScandalStakeholder {
  id: string;
  name: string;
  role: string;
  relationship: 'ally' | 'neutral' | 'hostile' | 'victim';
  credibility: number; // 0-100
  publicStatement?: string;
  demands?: string[];
}

export interface ScandalEvidence {
  id: string;
  type: 'document' | 'testimony' | 'recording' | 'financial-record' | 'photo' | 'email';
  source: string;
  credibility: number; // 0-100
  damageLevel: number; // 0-100
  description: string;
  isPublic: boolean;
  canBeDisputed: boolean;
  disputeStrength?: number; // 0-100 if can be disputed
}

export interface DefenseStrategy {
  id: string;
  type: DefenseType;
  effectiveness: number; // 0-100
  requirements: string[];
  risks: string[];
  description: string;
  responseTemplates: string[];
}

export type DefenseType =
  | 'deny-completely'          // Full denial of allegations
  | 'admit-but-justify'        // Admit but provide justification
  | 'partial-admission'        // Admit some but not all
  | 'blame-others'             // Redirect blame to others
  | 'claim-misunderstanding'   // Assert media/public misunderstood
  | 'attack-accusers'          // Question credibility of accusers
  | 'deflect-to-policy'        // Pivot to policy discussion
  | 'accept-responsibility'    // Full accountability and apology
  | 'legal-defense'            // Invoke legal protections/processes
  | 'ignorance-defense';       // Claim lack of knowledge/awareness

export type MediaAttentionLevel = 'local' | 'regional' | 'national' | 'international';

export interface PublicOpinionData {
  overallApproval: number; // -100 to 100 change from baseline
  demographicBreakdown: Record<string, number>;
  beliefInAllegations: number; // 0-100 how many believe the scandal
  demandForAccountability: number; // 0-100 how much public wants accountability
}

export interface PoliticalConsequence {
  type: 'coalition-pressure' | 'party-discipline' | 'electoral-impact' | 'resignation-calls';
  severity: number; // 0-100
  description: string;
  timeframe: 'immediate' | 'short-term' | 'long-term';
}

// Scandal Interview Configuration
export interface ScandalInterviewConfig extends InterviewConfig {
  type: 'scandal-response';
  scenarioId: string;
  preparationTime: number; // Minutes player had to prepare
  mediaOutlet: string;
  interviewerCredibility: number; // How respected the interviewer is
  audienceSize: number; // Expected viewership
  pressureLevel: 'low' | 'medium' | 'high' | 'extreme';
  keyQuestions: ScandalQuestion[];
}

export interface ScandalQuestion extends DynamicQuestion {
  evidenceReferenced?: string[]; // IDs of evidence this question references
  stakeholderMentioned?: string[]; // IDs of stakeholders mentioned
  damageIfUnanswered: number; // 0-100 damage for not answering
  escapeDifficulty: number; // 0-100 how hard to evade this question
  followUpIntensity: 'relentless' | 'persistent' | 'normal' | 'gentle';
}

// Enhanced Crisis Timing System
export interface CrisisTimingConfig {
  breakingNewsDelay: number; // Seconds before interviewer mentions new developments
  evidenceRevealTiming: number[]; // When during interview to reveal new evidence
  stakeholderStatements: TimedStatement[];
  mediaUpdates: TimedMediaUpdate[];
  pressureEscalationPoints: number[]; // Question numbers where pressure increases
}

export interface TimedStatement {
  stakeholderId: string;
  statement: string;
  timing: number; // Seconds into interview
  impact: 'supportive' | 'damaging' | 'neutral';
}

export interface TimedMediaUpdate {
  content: string;
  timing: number; // Seconds into interview
  urgency: 'breaking' | 'developing' | 'update';
  source: string;
}

// Scandal Response Performance Metrics
export interface ScandalResponseMetrics extends PerformanceMetrics {
  credibilityMaintained: number; // 0-100
  damageMitigation: number; // 0-100
  newDamageCreated: number; // 0-100
  stakeholderSatisfaction: Record<string, number>; // stakeholder ID -> satisfaction
  mediaReactionScore: number; // 0-100
  defenseStrategyEffectiveness: Record<string, number>; // strategy ID -> effectiveness
  contradictionsCreated: number; // New contradictions during this interview
  opportunitiesMissed: string[]; // Defense opportunities not taken
}

// Debate Preparation Interview System
export interface DebatePreparationConfig extends InterviewConfig {
  type: 'debate-prep';
  debateFormat: 'town-hall' | 'panel' | 'one-on-one' | 'group';
  opponentProfiles: DebateOpponent[];
  keyIssues: DebateIssue[];
  preparationFocus: 'attack' | 'defense' | 'policy' | 'character';
  timeUntilDebate: number; // Hours until actual debate
  mediaExpectations: string[];
}

export interface DebateOpponent {
  id: string;
  name: string;
  party: string;
  strengths: string[];
  weaknesses: string[];
  likelyAttackVectors: string[];
  defensivePositions: string[];
  publicPolling: number; // Current polling position
}

export interface DebateIssue {
  id: string;
  topic: string;
  importance: number; // 0-100 importance to voters
  playerVulnerability: number; // 0-100 how vulnerable player is on this issue
  preparationLevel: number; // 0-100 how well prepared player is
  opponentStrengths: Record<string, number>; // opponent ID -> strength on this issue
}

// Crisis Management Interview System
export interface CrisisManagementConfig extends InterviewConfig {
  type: 'crisis-management';
  crisisType: CrisisType;
  crisisPhase: 'immediate' | 'developing' | 'peak' | 'recovery';
  stakeholderPressure: StakeholderPressure[];
  timeConstraints: CrisisTimeConstraints;
  publicExpectation: PublicExpectation;
  mediaEnvironment: CrisisMediaEnvironment;
}

export type CrisisType =
  | 'policy-failure'           // Major policy went wrong
  | 'public-safety'            // Safety crisis requiring response
  | 'economic-crisis'          // Economic emergency
  | 'coalition-collapse'       // Government coalition falling apart
  | 'external-threat'          // International or security crisis
  | 'institutional-failure'    // Government institution failing
  | 'social-unrest'           // Civil disorder or protests
  | 'environmental-disaster'   // Environmental emergency
  | 'corruption-revelation'    // Major corruption exposed
  | 'leadership-crisis';       // Leadership legitimacy questioned

export interface StakeholderPressure {
  stakeholder: string;
  pressureLevel: number; // 0-100
  demands: string[];
  timeframe: string;
  consequencesIfIgnored: string[];
}

export interface CrisisTimeConstraints extends TimeConstraints {
  decisionDeadlines: CrisisDeadline[];
  publicStatementRequired: boolean;
  emergencyMeetingsScheduled: string[];
}

export interface CrisisDeadline {
  decision: string;
  deadline: number; // Hours from now
  consequences: string;
}

export interface PublicExpectation {
  leadership: number; // 0-100 expectation of strong leadership
  transparency: number; // 0-100 expectation of transparency
  immediateAction: number; // 0-100 expectation of quick action
  accountability: number; // 0-100 expectation of taking responsibility
}

export interface CrisisMediaEnvironment {
  attentionLevel: 'focused' | 'intense' | 'overwhelming' | 'crisis-mode';
  narrativeCompetition: string[]; // Competing stories/explanations
  internationalAttention: boolean;
  oppositionResponse: 'supportive' | 'neutral' | 'attacking' | 'opportunistic';
  expertOpinions: ExpertOpinion[];
}

export interface ExpertOpinion {
  expertName: string;
  field: string;
  opinion: string;
  credibility: number; // 0-100
  supportiveness: number; // -100 to 100
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

// Gotcha Moment Detection & Response System
export interface GotchaMoment {
  id: string;
  type: GotchaMomentType;
  severity: 'minor' | 'major' | 'critical';
  description: string;
  evidence: GotchaEvidence[];
  triggerResponse: PlayerResponse;
  followUpQuestion?: string;
  dramaticImpact: number;          // 0-100: How dramatic this gotcha moment should be
  timestamp: number;
}

export type GotchaMomentType =
  | 'direct-contradiction'         // "You said X, now you're saying Y"
  | 'policy-flip'                 // Changed position on major issue
  | 'expertise-fail'              // Couldn't answer basic question in their field
  | 'moral-inconsistency'         // Ethical contradiction
  | 'fact-error'                  // Stated something factually wrong
  | 'evasion-pattern'             // Pattern of avoiding specific topics
  | 'false-credential'            // Claimed experience they don't have
  | 'timeline-contradiction';     // Inconsistent timeline of events

export interface GotchaEvidence {
  type: 'statement' | 'background-fact' | 'public-record' | 'timeline-event';
  content: string;
  source: string;                 // Which response/question this came from
  timestamp?: number;
  confidence: number;             // 0-1: How confident we are this is evidence
}

export interface GotchaDetection {
  enabled: boolean;
  sensitivityLevel: 'low' | 'medium' | 'high';  // How easily gotcha moments trigger
  trackingPeriod: number;         // How far back to look for contradictions (minutes)
  minimumSeverity: 'minor' | 'major' | 'critical';  // Minimum severity to trigger
  dramaticThreshold: number;      // Minimum dramatic impact to show special UI
  cooldownPeriod: number;         // Seconds between gotcha moments
}

export interface GotchaResponse {
  confrontationLevel: 'gentle' | 'firm' | 'aggressive' | 'devastating';
  approach: 'factual' | 'emotional' | 'tactical' | 'moral';
  followUpStrategy: 'pressure' | 'clarification' | 'exposure' | 'recovery-chance';
  visualStyle: 'highlight' | 'dramatic' | 'tense' | 'shocking';
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

export interface GotchaResponseConfig {
  confrontationMessages: Record<GotchaMomentType, Record<string, string[]>>;
  followUpTemplates: Record<GotchaMomentType, string[]>;
  visualEffects: Record<GotchaMomentType, {
    animation: string;
    color: string;
    intensity: number;
    duration: number;
  }>;
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

// Frustration Escalation System
export interface FrustrationEscalationSystem {
  enabled: boolean;
  currentLevel: FrustrationLevel;
  triggers: FrustrationTrigger[];
  escalationThresholds: FrustrationThreshold[];
  behaviorChanges: FrustrationBehaviorChange[];
  visualEffects: FrustrationVisualConfig;
  cooldownPeriod: number;         // Seconds before frustration can escalate again
  decayRate: number;              // How fast frustration decreases over time (per minute)
  maxFrustration: number;         // Maximum frustration level (default 100)
}

export type FrustrationLevel =
  | 'calm'           // 0-20: Normal professional behavior
  | 'mildly-annoyed' // 21-40: Slight impatience, occasional sighs
  | 'frustrated'     // 41-60: More aggressive questioning, interruptions
  | 'very-frustrated' // 61-80: Hostile tone, rapid-fire questions
  | 'losing-patience' // 81-95: Dramatic reactions, threatening interview end
  | 'explosive';     // 96-100: Extreme reactions, interview termination

export interface FrustrationTrigger {
  id: string;
  type: FrustrationTriggerType;
  condition: string;              // e.g., 'consecutive_evasions>=3', 'contradiction_count>=2'
  frustractionIncrease: number;   // How much frustration to add (0-100)
  probability: number;            // 0-1: Chance of triggering
  description: string;
  cooldown?: number;              // Seconds before this trigger can fire again
}

export type FrustrationTriggerType =
  | 'evasion'                    // Player avoids answering questions
  | 'contradiction'              // Player contradicts previous statements
  | 'time-wasting'               // Player takes too long to respond
  | 'deflection'                 // Player deflects to other topics
  | 'non-answer'                 // Player gives non-responsive answers
  | 'interruption-resistance'    // Player talks over interviewer interruptions
  | 'fact-avoidance'             // Player avoids factual questions
  | 'policy-vagueness'           // Player gives vague policy answers
  | 'personal-attack'            // Player attacks interviewer credibility
  | 'question-challenging';      // Player challenges question validity

export interface FrustrationThreshold {
  level: FrustrationLevel;
  minValue: number;               // Minimum frustration value for this level
  maxValue: number;               // Maximum frustration value for this level
  transitionEffects: FrustrationTransitionEffect[];
  behaviorChanges: string[];      // List of behavior change IDs to activate
  moodOverride?: InterviewerMood; // Optional mood to force when reaching this level
}

export interface FrustrationTransitionEffect {
  type: 'visual' | 'audio' | 'text' | 'timing';
  effect: string;                 // e.g., 'camera-shake', 'frustrated-sigh', 'harsh-lighting'
  intensity: number;              // 0-100: How intense the effect should be
  duration: number;               // Milliseconds for the effect
}

export interface FrustrationBehaviorChange {
  id: string;
  frustractionLevel: FrustrationLevel;
  type: FrustrationBehaviorType;
  modifications: FrustrationModification[];
  description: string;
  active: boolean;
}

export type FrustrationBehaviorType =
  | 'questioning-style'          // Change question aggressiveness
  | 'interruption-frequency'     // How often to interrupt
  | 'follow-up-intensity'        // How aggressively to follow up
  | 'time-pressure'              // How much time pressure to apply
  | 'topic-persistence'          // How stubbornly to stick to topics
  | 'voice-tone'                 // Change voice/text tone
  | 'body-language'              // Change visual presentation
  | 'patience-threshold'         // How quickly to lose patience
  | 'question-difficulty'        // Make questions harder/more direct
  | 'fact-checking'              // More aggressive fact verification
  | 'memory-usage'               // More frequent reference to contradictions
  | 'rapid-fire-trigger';        // Lower threshold for rapid-fire questions

export interface FrustrationModification {
  property: string;               // e.g., 'interruptionThreshold', 'questionTimeout'
  modifier: 'multiply' | 'add' | 'subtract' | 'set';
  value: number;
  description: string;
}

export interface FrustrationVisualConfig {
  levelIndicators: Record<FrustrationLevel, FrustrationVisualStyle>;
  transitionAnimations: FrustrationTransitionAnimation[];
  interviewerExpressions: Record<FrustrationLevel, string[]>;
  environmentChanges: Record<FrustrationLevel, EnvironmentChange>;
}

export interface FrustrationVisualStyle {
  backgroundColor?: string;       // Background color changes
  lighting?: string;              // Lighting mood
  cameraAngle?: string;           // Camera positioning
  interviewerExpression: string;  // Facial expression/animation
  textColor?: string;             // Text color for questions
  uiElements?: {                  // UI element styles
    questionBox?: string;
    timerColor?: string;
    borderStyle?: string;
  };
}

export interface FrustrationTransitionAnimation {
  fromLevel: FrustrationLevel;
  toLevel: FrustrationLevel;
  animationType: 'smooth' | 'dramatic' | 'instant' | 'building';
  duration: number;               // Milliseconds
  effects: string[];              // e.g., ['camera-shake', 'flash', 'zoom-in']
}

export interface EnvironmentChange {
  studioLighting?: string;        // e.g., 'harsh', 'dim', 'dramatic'
  backgroundMusic?: string;       // Background audio mood
  ambientSound?: string;          // e.g., 'ticking-clock', 'papers-shuffling'
  cameraWork?: string;            // e.g., 'steady', 'handheld', 'dramatic-zooms'
}

// Enhanced Interviewer Memory for Frustration System
export interface EnhancedInterviewerMemory extends InterviewerMemory {
  frustrationHistory: FrustrationEvent[];
  triggerCooldowns: Map<string, number>;     // Trigger ID -> timestamp of last activation
  escalationPattern: FrustrationPattern;
  recoveryAttempts: number;                  // Times interviewer tried to calm down
  surpriseApprovalHistory?: SurpriseApprovalEvent[]; // Task 3.8: Track positive reactions
}

export interface FrustrationEvent {
  timestamp: number;
  trigger: FrustrationTriggerType;
  frustractionIncrease: number;
  previousLevel: FrustrationLevel;
  newLevel: FrustrationLevel;
  playerResponse?: string;               // What the player said/did
  interviewerReaction?: string;          // How interviewer responded
}

export interface FrustrationPattern {
  dominantTriggers: FrustrationTriggerType[];  // Most common frustration causes
  escalationSpeed: 'gradual' | 'moderate' | 'rapid' | 'explosive';
  recoveryDifficulty: number;                  // 0-1: How hard it is to calm down
  peakFrustration: number;                     // Highest frustration reached
  averageDuration: number;                     // Average time spent frustrated (seconds)
}

// Surprise/Approval Detection System - Task 3.8
export interface SurpriseApprovalSystem {
  enabled: boolean;
  surpriseDetectors: SurpriseDetector[];
  approvalDetectors: ApprovalDetector[];
  reactionHistory: SurpriseApprovalEvent[];
  surpriseThreshold: number;                   // 0-100: Minimum surprise level to trigger reaction
  approvalThreshold: number;                   // 0-100: Minimum approval level to trigger reaction
  cooldownPeriod: number;                      // Seconds between surprise/approval reactions
}

export interface SurpriseDetector {
  id: string;
  type: SurpriseType;
  condition: string;                           // e.g., 'unexpected_expertise', 'authentic_vulnerability'
  surpriseIncrease: number;                    // How much surprise this adds (0-100)
  probability: number;                         // 0-1: Chance of triggering
  backgroundSpecific?: string[];               // Specific backgrounds this applies to
  description: string;
}

export interface ApprovalDetector {
  id: string;
  type: ApprovalType;
  condition: string;                           // e.g., 'honest_admission', 'thoughtful_nuance'
  approvalIncrease: number;                    // How much approval this adds (0-100)
  probability: number;                         // 0-1: Chance of triggering
  backgroundSpecific?: string[];               // Specific backgrounds this applies to
  description: string;
}

export type SurpriseType =
  | 'unexpected-expertise'                     // Shows knowledge in unexpected area
  | 'authentic-vulnerability'                  // Genuine personal admission
  | 'refreshing-honesty'                       // Admits mistake or uncertainty
  | 'creative-solution'                        // Novel approach to problem
  | 'human-moment'                             // Shows genuine emotion/humanity
  | 'policy-depth'                             // Surprisingly detailed policy knowledge
  | 'cross-party-appeal'                       // Position that transcends party lines
  | 'local-knowledge';                         // Deep understanding of local issues

export type ApprovalType =
  | 'principled-stance'                        // Takes difficult but principled position
  | 'thoughtful-nuance'                        // Shows complexity of thinking
  | 'practical-wisdom'                         // Demonstrates real-world experience
  | 'empathetic-understanding'                 // Shows genuine concern for others
  | 'intellectual-humility'                    // Admits limitations or learning
  | 'authentic-passion'                        // Genuine enthusiasm for cause
  | 'constructive-criticism'                   // Criticizes while offering solutions
  | 'bridge-building';                         // Seeks common ground

export interface SurpriseApprovalEvent {
  timestamp: number;
  type: 'surprise' | 'approval';
  detectorType: SurpriseType | ApprovalType;
  levelIncrease: number;
  previousSurprise: number;
  previousApproval: number;
  newSurprise: number;
  newApproval: number;
  playerResponse: string;
  interviewerReaction: string;
  moodImpact?: InterviewerMood;
}

// Coalition Negotiation Interview Types
export interface CoalitionNegotiationConfig {
  negotiationPhase: NegotiationPhase;
  partyPositions: PartyPosition[];
  redLines: RedLine[];
  negotiationPressure: NegotiationPressure;
  mediaCoverage: NegotiationMediaCoverage;
  stakeholderExpectations: StakeholderExpectation[];
  timeConstraints: NegotiationTimeConstraints;
}

export type NegotiationPhase =
  | 'initial-soundings'        // First informal discussions
  | 'formal-talks'             // Official negotiation meetings
  | 'final-negotiations'       // Last push before agreement
  | 'agreement-announcement'   // Presenting the deal
  | 'ratification-pressure'    // Getting party approval
  | 'breakdown-recovery';      // Dealing with failed talks

export interface PartyPosition {
  party: string;
  coreInterests: string[];
  negotiablePositions: string[];
  absoluteRedLines: string[];
  publicCommitments: string[];
  internalPressures: string[];
  coalitionAppetite: number; // 0-100 how much they want to govern
}

export interface RedLine {
  issue: string;
  description: string;
  flexibility: number; // 0-100 how flexible this actually is
  publicCommitment: boolean; // Whether publicly stated
  consequenceIfCrossed: string;
  party?: string; // Which party's red line (if specific)
}

export interface NegotiationPressure {
  timeToElection: number; // Days until new election if no coalition
  publicPatience: number; // 0-100 how long voters will wait
  internationalConcern: boolean; // Are other countries watching?
  economicUrgency: number; // 0-100 economic pressures
  currentGovernmentStatus: 'caretaker' | 'minority' | 'collapsed';
}

export interface NegotiationMediaCoverage {
  intensityLevel: 'background' | 'daily-updates' | 'constant-coverage' | 'crisis-mode';
  narrativeFrames: string[]; // How media is framing the negotiations
  leakage: number; // 0-100 how much gets leaked to press
  publicOpinionPolling: PublicNegotiationOpinion;
}

export interface PublicNegotiationOpinion {
  preferredCoalition: string[];
  patienceLevel: number; // 0-100 voter patience
  priorityConcerns: string[]; // What voters want addressed
  trustInProcess: number; // 0-100 faith in democratic process
}

export interface StakeholderExpectation {
  stakeholder: string;
  type: 'business' | 'unions' | 'advocacy' | 'international' | 'coalition-partner';
  expectations: string[];
  influenceLevel: number; // 0-100 ability to affect outcome
  publicPressure: boolean; // Whether they pressure publicly
}

export interface NegotiationTimeConstraints extends TimeConstraints {
  deadlines: NegotiationDeadline[];
  meetingSchedule: ScheduledMeeting[];
  constitutionalLimits: number; // Days before constitutional crisis
}

export interface NegotiationDeadline {
  event: string;
  daysFromNow: number;
  importance: 'soft' | 'hard' | 'constitutional';
  consequences: string;
}

export interface ScheduledMeeting {
  participants: string[];
  purpose: string;
  urgency: 'routine' | 'important' | 'critical';
  timeframe: string;
}

// Coalition Interview Question Types
export type CoalitionQuestionType =
  | 'position-clarification'   // What exactly do you want?
  | 'red-line-testing'        // How firm are your requirements?
  | 'compromise-exploration'   // What could you live with?
  | 'party-mandate-challenge' // Do your voters really support this?
  | 'coalition-chemistry'     // Can you work with these people?
  | 'leadership-claims'       // Who should lead what?
  | 'policy-implementation'   // How would this actually work?
  | 'timeline-pressure'       // What's your deadline?
  | 'public-accountability'   // How do you explain this to voters?
  | 'stability-assurance';    // How long would this coalition last?

export interface CoalitionInterviewContext {
  negotiationStatus: NegotiationPhase;
  recentDevelopments: string[];
  currentStickingPoints: string[];
  publicPressure: string[];
  partyDelegations: PartyDelegation[];
}

export interface PartyDelegation {
  party: string;
  leadNegotiator: string;
  teamSize: number;
  mandateFlexibility: number; // 0-100 how much room they have
  internalUnity: number; // 0-100 how unified the party is
  publicCommitments: string[];
}

export interface NegotiationMomentum {
  direction: 'positive' | 'stalled' | 'deteriorating' | 'breakthrough' | 'breakdown';
  recentBreakthroughs: string[];
  emergingObstacles: string[];
  mediaSentiment: number; // -100 to 100
  stakeholderReactions: StakeholderReaction[];
}

export interface StakeholderReaction {
  stakeholder: string;
  sentiment: number; // -100 to 100
  publicStatement?: string;
  privateMessage?: string;
  actionThreat?: string; // What they might do if unhappy
}

// Coalition Performance Tracking
export interface CoalitionNegotiationPerformance {
  credibilityWithPartners: number; // 0-100
  publicTrustworthiness: number; // 0-100
  negotiationSkill: number; // 0-100
  mandateRespected: boolean; // Following voter expectations?
  coalitionViability: number; // 0-100 chance of success
  personalReadiness: number; // 0-100 ready to govern?
}

export interface CoalitionInterviewAnalytics {
  responseAuthenticity: number; // 0-100
  strategicClarity: number; // 0-100
  partnershipBuilding: number; // 0-100
  publicCommunication: number; // 0-100
  pressureHandling: number; // 0-100
  compromiseWillingness: number; // 0-100
}

// Policy Announcement Interview Types
export interface PolicyAnnouncementConfig {
  policyDetails: PolicyDetails;
  announcementContext: AnnouncementContext;
  stakeholderReactions: PolicyStakeholderReaction[];
  implementation: PolicyImplementation;
  politicalTiming: PolicyTiming;
  oppositionResponse: OppositionResponse;
  mediaScrutiny: PolicyMediaScrutiny;
}

export interface PolicyDetails {
  policyName: string;
  category: PolicyCategory;
  scope: PolicyScope;
  targetBeneficiaries: string[];
  estimatedCost: PolicyCost;
  timeline: PolicyTimeline;
  keyProvisions: string[];
  precedents: string[];
  evidenceBase: EvidenceQuality;
}

export type PolicyCategory =
  | 'economic'           // Tax, budget, economic stimulus
  | 'social'             // Healthcare, education, welfare
  | 'environmental'      // Climate, energy, sustainability
  | 'security'           // Defense, police, justice
  | 'immigration'        // Border, asylum, integration
  | 'governance'         // Democratic reform, transparency
  | 'infrastructure'     // Transport, housing, digital
  | 'international';     // Foreign policy, EU relations

export type PolicyScope =
  | 'national'           // Affects entire country
  | 'regional'           // Specific regions/provinces
  | 'sectoral'           // Specific industries/groups
  | 'targeted'           // Very specific demographics
  | 'pilot'              // Trial program
  | 'emergency';         // Crisis response measure

export interface PolicyCost {
  estimatedAmount: number; // In millions of euros
  fundingSource: FundingSource[];
  budgetImpact: BudgetImpact;
  economicMultiplier: number; // Expected economic return
  uncertainty: CostUncertainty;
}

export type FundingSource =
  | 'existing-budget'    // Reallocated from current spending
  | 'new-revenue'        // New taxes or fees
  | 'borrowing'          // Government debt
  | 'eu-funds'           // European funding
  | 'private-investment' // Public-private partnerships
  | 'savings'            // From efficiency/cuts elsewhere
  | 'unspecified';       // Funding not clearly identified

export type BudgetImpact =
  | 'neutral'            // Budget neutral
  | 'deficit-increase'   // Increases deficit
  | 'surplus-reduction'  // Reduces surplus
  | 'revenue-positive'   // Generates net revenue
  | 'long-term-savings'; // Saves money over time

export type CostUncertainty =
  | 'low'                // Well-estimated costs
  | 'medium'             // Some uncertainty
  | 'high'               // Significant uncertainty
  | 'unknown';           // Cannot estimate reliably

export interface PolicyTimeline {
  announcementToImplementation: number; // Months
  phaseImplementation: PolicyPhase[];
  fullImplementation: number; // Months to full effect
  reviewSchedule: string[];
  sunsetClause?: number; // Years until automatic expiry
}

export interface PolicyPhase {
  phaseName: string;
  duration: number; // Months
  milestones: string[];
  dependencies: string[];
  risksAndMitigation: string[];
}

export type EvidenceQuality =
  | 'strong'             // Robust research base
  | 'moderate'           // Some supporting evidence
  | 'weak'               // Limited evidence
  | 'experimental'       // Untested approach
  | 'ideological';       // Primarily values-based

export interface AnnouncementContext {
  venue: AnnouncementVenue;
  audience: PrimaryAudience[];
  timing: AnnouncementTiming;
  politicalPressure: PoliticalPressure;
  mediaStrategy: MediaStrategy;
  coalitionStatus?: CoalitionDynamics;
}

export type AnnouncementVenue =
  | 'parliament'         // Parliamentary speech
  | 'press-conference'   // Formal media announcement
  | 'party-conference'   // Party event
  | 'policy-institute'   // Think tank/academic setting
  | 'industry-event'     // Sector-specific announcement
  | 'town-hall'          // Public meeting
  | 'media-interview';   // Exclusive interview reveal

export type PrimaryAudience =
  | 'general-public'     // Broad voter appeal
  | 'party-base'         // Core supporters
  | 'swing-voters'       // Undecided voters
  | 'affected-groups'    // Policy beneficiaries
  | 'business-community' // Economic stakeholders
  | 'media'              // Press and commentators
  | 'international';     // Foreign governments/organizations

export interface AnnouncementTiming {
  electoralCycle: ElectoralContext;
  newsCycle: NewsCycleContext;
  seasonality: SeasonalContext;
  competitorActivity: CompetitorContext;
}

export type ElectoralContext =
  | 'early-term'         // Just after election
  | 'mid-term'           // Middle of electoral cycle
  | 'pre-election'       // Building to election
  | 'campaign-period'    // During active campaign
  | 'coalition-talks'    // During government formation
  | 'crisis-response';   // Emergency/crisis timing

export type NewsCycleContext =
  | 'slow-news'          // Limited competing news
  | 'busy-news'          // Competing stories
  | 'dominant-story'     // Major news dominating
  | 'distraction'        // Announced to distract from other issues
  | 'momentum-building'  // Part of series of announcements
  | 'damage-control';    // Response to negative news

export type SeasonalContext =
  | 'budget-season'      // During budget announcements
  | 'summer-recess'      // Parliamentary break
  | 'new-year'           // January fresh start
  | 'pre-holiday'        // Before major holidays
  | 'crisis-period'      // During national crisis
  | 'routine';           // Normal parliamentary time

export type CompetitorContext =
  | 'first-mover'        // First to announce on this issue
  | 'response'           // Responding to competitor policy
  | 'pre-emption'        // Announcing before expected competitor
  | 'coordination'       // Coordinated with allies
  | 'differentiation';   // Deliberately different from competitors

export interface PoliticalPressure {
  internalPressure: InternalPressure[];
  externalPressure: ExternalPressure[];
  timeConstraints: PolicyTimeConstraints;
  politicalRisks: PoliticalRisk[];
}

export interface InternalPressure {
  source: 'party-members' | 'coalition-partners' | 'advisors' | 'donors';
  intensity: number; // 0-100
  demands: string[];
  consequences: string;
}

export interface ExternalPressure {
  source: 'voters' | 'media' | 'interest-groups' | 'international' | 'markets';
  intensity: number; // 0-100
  expectations: string[];
  deadline?: string;
}

export interface PolicyTimeConstraints {
  legislativeDeadlines: string[];
  budgetCycle: string;
  electionConstraints: string;
  implementationDeadlines: string[];
}

export interface PoliticalRisk {
  riskType: RiskType;
  probability: number; // 0-100
  impact: number; // 0-100
  mitigation: string;
}

export type RiskType =
  | 'voter-backlash'     // Negative public reaction
  | 'coalition-tension'  // Strain on government partners
  | 'implementation-failure' // Policy fails to work
  | 'cost-overrun'       // Exceeds budget
  | 'unintended-consequences' // Unexpected negative effects
  | 'legal-challenge'    // Court challenges
  | 'eu-conflict'        // Conflicts with EU law/policy
  | 'economic-disruption'; // Economic negative effects

export interface MediaStrategy {
  framingStrategy: FramingStrategy;
  messageControl: MessageControl;
  stakeholderEngagement: StakeholderEngagement[];
  anticipatedCriticism: AnticipatedCriticism[];
}

export interface FramingStrategy {
  primaryFrame: PolicyFrame;
  secondaryFrames: PolicyFrame[];
  targetedMessages: TargetedMessage[];
  narrativeArc: string;
}

export type PolicyFrame =
  | 'economic-necessity' // Economic imperative
  | 'social-justice'     // Fairness and equality
  | 'future-investment'  // Long-term thinking
  | 'crisis-response'    // Urgent action needed
  | 'innovation-leadership' // Pioneering/leading
  | 'pragmatic-solution' // Practical problem-solving
  | 'values-alignment'   // Consistent with principles
  | 'international-competitiveness'; // Keeping up globally

export interface TargetedMessage {
  audience: PrimaryAudience;
  keyMessages: string[];
  supportingEvidence: string[];
  emotionalAppeal: EmotionalAppeal;
}

export type EmotionalAppeal =
  | 'hope'               // Optimistic future
  | 'security'           // Safety and stability
  | 'fairness'           // Justice and equality
  | 'pride'              // National/group pride
  | 'urgency'            // Need for immediate action
  | 'responsibility'     // Duty and obligation
  | 'opportunity'        // Positive possibilities
  | 'protection';        // Defending against threats

export interface MessageControl {
  spokespersonStrategy: SpokespersonStrategy;
  talkingPoints: TalkingPoint[];
  responseProtocols: ResponseProtocol[];
  leakManagement: LeakManagement;
}

export interface SpokespersonStrategy {
  primarySpokesperson: string;
  backupSpokespersons: string[];
  expertValidators: string[];
  coalitionCoordination: boolean;
}

export interface TalkingPoint {
  point: string;
  supportingData: string[];
  responseToCounterarguments: string[];
  soundbiteVersion: string;
}

export interface ResponseProtocol {
  scenario: string;
  responseStrategy: 'acknowledge' | 'deflect' | 'attack' | 'pivot' | 'delay';
  preparedResponse: string;
  escalationPath: string[];
}

export interface LeakManagement {
  informationClassification: InfoClassification[];
  stakeholderBriefingOrder: string[];
  damageControlPlan: string;
}

export interface InfoClassification {
  information: string;
  classification: 'public' | 'embargoed' | 'background' | 'confidential';
  releaseStrategy: string;
}

export interface StakeholderEngagement {
  stakeholder: string;
  engagementType: EngagementType;
  timing: StakeholderTiming;
  keyMessages: string[];
  expectedReaction: StakeholderReaction;
}

export type EngagementType =
  | 'advance-briefing'   // Prior to announcement
  | 'simultaneous-brief' // During announcement
  | 'follow-up-meeting'  // After announcement
  | 'consultation'       // Seeking input
  | 'notification-only'  // Information sharing
  | 'negotiation';       // Seeking agreement

export type StakeholderTiming =
  | 'weeks-ahead'        // Well in advance
  | 'days-ahead'         // Short advance notice
  | 'hours-ahead'        // Very short notice
  | 'simultaneous'       // Same time as announcement
  | 'follow-up';         // After public announcement

export interface StakeholderReaction {
  expectedSentiment: number; // -100 to 100
  likelyResponse: string;
  influenceLevel: number; // 0-100 ability to affect policy success
  publicResponseLikely: boolean;
}

export interface AnticipatedCriticism {
  criticismType: CriticismType;
  source: CriticismSource;
  likelihood: number; // 0-100
  preparedResponse: string;
  damagePotential: number; // 0-100
}

export type CriticismType =
  | 'too-expensive'      // Cost concerns
  | 'too-little'         // Insufficient scope
  | 'wrong-priorities'   // Misplaced focus
  | 'poor-timing'        // Bad timing for announcement
  | 'lack-evidence'      // Insufficient justification
  | 'implementation-doubt' // Skepticism about delivery
  | 'political-opportunism' // Accused of vote-buying
  | 'ideological-opposition'; // Fundamental disagreement

export type CriticismSource =
  | 'opposition-parties' // Political opponents
  | 'media-commentators' // Press and pundits
  | 'expert-community'   // Academic/policy experts
  | 'affected-groups'    // Those impacted by policy
  | 'taxpayer-advocates' // Fiscal responsibility groups
  | 'international-observers' // Foreign governments/organizations
  | 'coalition-partners' // Government allies
  | 'party-dissidents';  // Own party critics

export interface CoalitionDynamics {
  partnerSupport: PartnerSupport[];
  negotiationHistory: NegotiationPoint[];
  compromisesRequired: PolicyCompromise[];
  coalitionMessaging: CoalitionMessaging;
}

export interface PartnerSupport {
  partner: string;
  supportLevel: number; // 0-100
  conditions: string[];
  publicSupportWillingness: number; // 0-100
  privateConcerns: string[];
}

export interface NegotiationPoint {
  issue: string;
  originalPosition: string;
  finalPosition: string;
  concessionMade: boolean;
  partnerBenefit: string;
}

export interface PolicyCompromise {
  originalProposal: string;
  compromise: string;
  partnerRequirement: string;
  impactOnPolicy: PolicyImpact;
}

export type PolicyImpact =
  | 'minor-modification'  // Small changes
  | 'significant-change'  // Major alterations
  | 'fundamental-revision' // Completely different policy
  | 'scope-reduction'     // Reduced ambition
  | 'delayed-implementation' // Timing changes
  | 'conditional-implementation'; // Subject to conditions

export interface CoalitionMessaging {
  unifiedPosition: boolean;
  messageCoordination: MessageCoordination;
  differentiationAreas: string[];
  tensionManagement: TensionManagement[];
}

export interface MessageCoordination {
  coordinationLevel: 'full' | 'partial' | 'minimal' | 'none';
  spokespersonAgreement: boolean;
  talkingPointAlignment: number; // 0-100
  responseCoordination: boolean;
}

export interface TensionManagement {
  tensionArea: string;
  managementStrategy: 'downplay' | 'acknowledge' | 'emphasize-benefits' | 'defer';
  riskLevel: number; // 0-100
  contingencyPlan: string;
}

export interface PolicyStakeholderReaction {
  stakeholder: string;
  category: StakeholderCategory;
  predictedReaction: PredictedReaction;
  influenceOnImplementation: number; // 0-100
  publicResponseStrategy: PublicResponseStrategy;
}

export type StakeholderCategory =
  | 'direct-beneficiary'  // Direct recipients of policy
  | 'affected-industry'   // Industries impacted
  | 'regulatory-body'     // Government regulators
  | 'expert-community'    // Academic/policy experts
  | 'advocacy-group'      // Interest groups
  | 'international-partner' // Foreign stakeholders
  | 'opposition-group'    // Groups opposed to policy
  | 'implementation-partner'; // Organizations needed for delivery

export interface PredictedReaction {
  supportLevel: number; // -100 to 100
  publicStatement: boolean;
  lobbyingLikely: boolean;
  litigationRisk: number; // 0-100
  implementationCooperation: number; // 0-100
}

export type PublicResponseStrategy =
  | 'endorsement'         // Public support
  | 'critical-support'    // Support with reservations
  | 'neutral-monitoring'  // Wait and see
  | 'constructive-criticism' // Suggest improvements
  | 'strong-opposition'   // Active resistance
  | 'legal-challenge';    // Court action

export interface PolicyImplementation {
  implementationPlan: ImplementationPlan;
  requiredLegislation: RequiredLegislation[];
  resourceRequirements: ResourceRequirement[];
  riskAssessment: ImplementationRisk[];
  successMetrics: SuccessMetric[];
}

export interface ImplementationPlan {
  phases: ImplementationPhase[];
  keyMilestones: PolicyMilestone[];
  dependencies: PolicyDependency[];
  contingencyPlans: ContingencyPlan[];
}

export interface ImplementationPhase {
  phaseName: string;
  duration: number; // Months
  objectives: string[];
  deliverables: string[];
  responsibleAgencies: string[];
  budgetAllocation: number; // Percentage of total
  successCriteria: string[];
}

export interface PolicyMilestone {
  milestone: string;
  deadline: string;
  dependencies: string[];
  riskFactors: string[];
  successIndicators: string[];
}

export interface PolicyDependency {
  dependencyType: DependencyType;
  description: string;
  riskLevel: number; // 0-100
  mitigation: string;
  responsibleParty: string;
}

export type DependencyType =
  | 'legislative'         // Requires new laws
  | 'regulatory'          // Needs regulation changes
  | 'budgetary'           // Requires budget approval
  | 'technological'       // Depends on technology
  | 'international'       // Requires international cooperation
  | 'stakeholder'         // Needs stakeholder cooperation
  | 'infrastructure'      // Physical infrastructure needed
  | 'capacity-building';  // Skills/training required

export interface ContingencyPlan {
  scenario: string;
  probability: number; // 0-100
  response: string;
  resourceImplications: string;
  timelineImpact: string;
}

export interface RequiredLegislation {
  legislationType: LegislationType;
  priority: LegislationPriority;
  complexity: LegislationComplexity;
  parliamentaryProcess: ParliamentaryProcess;
  politicalRisks: LegislationRisk[];
}

export type LegislationType =
  | 'new-law'             // Completely new legislation
  | 'amendment'           // Modification of existing law
  | 'regulation'          // Administrative regulation
  | 'budget-measure'      // Budget/tax legislation
  | 'constitutional'      // Constitutional change
  | 'international-treaty'; // International agreement

export type LegislationPriority =
  | 'essential'           // Policy cannot work without this
  | 'important'           // Significantly improves policy
  | 'beneficial'          // Nice to have enhancement
  | 'optional';           // Could be added later

export type LegislationComplexity =
  | 'simple'              // Straightforward changes
  | 'moderate'            // Some complexity
  | 'complex'             // Significant technical issues
  | 'highly-complex';     // Major legal/technical challenges

export interface ParliamentaryProcess {
  estimatedTimeframe: string;
  committeesInvolved: string[];
  stakeholderConsultation: boolean;
  amendmentRisk: number; // 0-100
  oppositionResistance: number; // 0-100
}

export interface LegislationRisk {
  riskType: string;
  probability: number; // 0-100
  impact: string;
  mitigation: string;
}

export interface ResourceRequirement {
  resourceType: ResourceType;
  quantity: string;
  timeframe: string;
  availability: ResourceAvailability;
  costImplication: number;
}

export type ResourceType =
  | 'financial'           // Money/budget
  | 'human'               // Staff/personnel
  | 'technological'       // IT systems/technology
  | 'physical'            // Buildings/equipment
  | 'expertise'           // Specialist knowledge
  | 'regulatory'          // Regulatory capacity
  | 'international'       // Foreign cooperation
  | 'stakeholder';        // External partner engagement

export type ResourceAvailability =
  | 'readily-available'   // Already have access
  | 'obtainable'          // Can acquire with effort
  | 'scarce'              // Difficult to obtain
  | 'uncertain'           // Availability unknown
  | 'requires-development'; // Must be created/trained

export interface ImplementationRisk {
  riskCategory: ImplementationRiskCategory;
  description: string;
  likelihood: number; // 0-100
  impact: number; // 0-100
  mitigation: string;
  monitoringPlan: string;
}

export type ImplementationRiskCategory =
  | 'technical'           // Technical implementation issues
  | 'political'           // Political changes affect implementation
  | 'financial'           // Budget/funding problems
  | 'legal'               // Legal challenges or complications
  | 'stakeholder'         // Stakeholder resistance/non-cooperation
  | 'capacity'            // Insufficient capacity to implement
  | 'external'            // External factors beyond control
  | 'timeline';           // Time-related implementation issues

export interface SuccessMetric {
  metricName: string;
  measurementMethod: string;
  targetValue: string;
  timeframe: string;
  reportingFrequency: string;
  responsibleParty: string;
}

export interface PolicyTiming {
  announcementTiming: AnnouncementTiming;
  implementationTiming: ImplementationTiming;
  electoralConsiderations: ElectoralConsiderations;
  competitiveContext: CompetitiveContext;
}

export interface ImplementationTiming {
  startDate: string;
  keyPhases: TimingPhase[];
  criticalPath: string[];
  flexibilityAreas: TimingFlexibility[];
}

export interface TimingPhase {
  phase: string;
  startMonth: number;
  duration: number;
  criticalDependencies: string[];
  delayRisks: string[];
}

export interface TimingFlexibility {
  area: string;
  flexibilityDegree: 'high' | 'medium' | 'low' | 'none';
  implications: string;
  constraints: string[];
}

export interface ElectoralConsiderations {
  electionCycle: ElectoralContext;
  voterImpactTiming: VoterImpactTiming;
  oppositionResponse: OppositionTiming;
  coalitionBenefits: CoalitionBenefitTiming;
}

export interface VoterImpactTiming {
  benefitsVisible: number; // Months until voters see benefits
  costsVisible: number; // Months until voters feel costs
  peakBenefitPeriod: string;
  electoralOptimalTiming: string;
}

export interface OppositionTiming {
  expectedCriticism: ExpectedCriticism[];
  counterAnnouncementRisk: number; // 0-100
  responseTimeWindow: number; // Days until opposition responds
  vulnerabilityPeriods: string[];
}

export interface ExpectedCriticism {
  criticismType: CriticismType;
  timeline: string;
  intensity: number; // 0-100
  counterStrategy: string;
}

export interface CoalitionBenefitTiming {
  partnerBenefits: PartnerBenefitTiming[];
  coalitionStrength: CoalitionStrengthTiming;
  messaging: MessagingTiming;
}

export interface PartnerBenefitTiming {
  partner: string;
  benefitType: string;
  timingOptimal: boolean;
  partnerPriorities: string[];
}

export interface CoalitionStrengthTiming {
  strengthensPeriod: string;
  riskyPeriods: string[];
  overallNetBenefit: number; // -100 to 100
}

export interface MessagingTiming {
  optimalAnnouncementWindow: string;
  messageSequencing: MessageSequence[];
  narrativeBuilding: NarrativeTiming;
}

export interface MessageSequence {
  sequence: number;
  message: string;
  timing: string;
  audience: PrimaryAudience;
  expectedImpact: number; // 0-100
}

export interface NarrativeTiming {
  buildUpPeriod: string;
  peakAttention: string;
  followUpPeriod: string;
  sustainabilityPlan: string;
}

export interface CompetitiveContext {
  competitorPolicies: CompetitorPolicy[];
  marketPosition: MarketPosition;
  differentiationStrategy: DifferentiationStrategy;
  timingAdvantage: TimingAdvantage;
}

export interface CompetitorPolicy {
  competitor: string;
  policyArea: string;
  announcement: string;
  timing: string;
  impactOnOurPolicy: PolicyImpact;
}

export interface MarketPosition {
  firstMover: boolean;
  followingCompetitor: boolean;
  marketLeadership: number; // 0-100
  uniquenessLevel: number; // 0-100
}

export interface DifferentiationStrategy {
  differentiationPoints: string[];
  competitiveAdvantages: string[];
  responseToCompetitors: CompetitorResponse[];
}

export interface CompetitorResponse {
  competitor: string;
  expectedResponse: string;
  responseTimeline: string;
  counterStrategy: string;
}

export interface TimingAdvantage {
  advantageType: 'first-mover' | 'fast-follower' | 'market-timing' | 'crisis-opportunity';
  advantageDescription: string;
  sustainabilityPeriod: string;
  riskOfLosingAdvantage: number; // 0-100
}

export interface OppositionResponse {
  predictedStrategies: OppositionStrategy[];
  counterPolicyRisk: CounterPolicyRisk;
  responseTimeline: OppositionResponseTimeline;
  vulnerabilityAssessment: VulnerabilityAssessment;
}

export interface OppositionStrategy {
  strategy: OppositionStrategyType;
  likelihood: number; // 0-100
  effectiveness: number; // 0-100
  countermeasures: string[];
}

export type OppositionStrategyType =
  | 'direct-attack'       // Front criticism of policy
  | 'alternative-proposal' // Counter-proposal
  | 'cost-challenge'      // Focus on expense
  | 'implementation-doubt' // Question deliverability
  | 'timing-criticism'    // Wrong time for policy
  | 'process-criticism'   // Lack of consultation
  | 'values-attack'       // Inconsistent with stated values
  | 'coalition-wedge';    // Try to split coalition

export interface CounterPolicyRisk {
  riskLevel: number; // 0-100
  competingAnnouncements: CompetingAnnouncement[];
  policyOutbidding: PolicyOutbidding;
}

export interface CompetingAnnouncement {
  source: string;
  policyArea: string;
  competitiveAdvantage: string;
  marketingSuperiority: number; // 0-100
}

export interface PolicyOutbidding {
  riskOfOutbidding: number; // 0-100
  areasOfVulnerability: string[];
  defensiveStrategy: string;
}

export interface OppositionResponseTimeline {
  immediateResponse: string; // Hours/days
  shortTermResponse: string; // Weeks
  longTermResponse: string; // Months
  sustainedCampaign: boolean;
}

export interface VulnerabilityAssessment {
  weakPoints: PolicyWeakPoint[];
  attackVectors: AttackVector[];
  defensivePreparation: DefensivePreparation;
}

export interface PolicyWeakPoint {
  weakness: string;
  exploitability: number; // 0-100
  damageResistance: number; // 0-100
  reinforcementStrategy: string;
}

export interface AttackVector {
  attackType: string;
  likelihood: number; // 0-100
  potentialDamage: number; // 0-100
  preparedness: number; // 0-100 how prepared we are
}

export interface DefensivePreparation {
  preparedness: number; // 0-100
  responseSpeed: ResponseSpeed;
  messageControl: DefensiveMessageControl;
  coalitionCoordination: DefensiveCoordination;
}

export type ResponseSpeed =
  | 'immediate'           // Same day response
  | 'rapid'               // Within 24-48 hours
  | 'deliberate'          // Within week
  | 'strategic-delay';    // Intentionally slow response

export interface DefensiveMessageControl {
  responseStrategy: 'factual-correction' | 'value-reframe' | 'attack-opponent' | 'pivot-topic';
  spokespersonReadiness: number; // 0-100
  supportingEvidence: number; // 0-100
  narrativeControl: number; // 0-100
}

export interface DefensiveCoordination {
  coalitionUnity: number; // 0-100
  messageAlignment: number; // 0-100
  responseCoordination: number; // 0-100
}

export interface PolicyMediaScrutiny {
  expectedCoverage: ExpectedCoverage;
  journalistQuestions: JournalistQuestion[];
  mediaVulnerabilities: MediaVulnerability[];
  communicationStrategy: PolicyCommunicationStrategy;
}

export interface ExpectedCoverage {
  coverageIntensity: 'minimal' | 'standard' | 'high' | 'intense' | 'overwhelming';
  durationOfCoverage: string;
  mediaOutlets: MediaOutletCoverage[];
  internationalAttention: boolean;
}

export interface MediaOutletCoverage {
  outlet: string;
  expectedTone: 'supportive' | 'neutral' | 'skeptical' | 'hostile';
  focus: string[];
  audienceReach: number;
}

export interface JournalistQuestion {
  questionCategory: JournalistQuestionCategory;
  difficulty: 'easy' | 'moderate' | 'hard' | 'gotcha';
  exampleQuestion: string;
  preparednessLevel: number; // 0-100
}

export type JournalistQuestionCategory =
  | 'cost-justification'  // How much and why worth it
  | 'implementation-detail' // How will it actually work
  | 'political-motivation' // Why this, why now
  | 'evidence-basis'      // What evidence supports this
  | 'stakeholder-impact'  // Who wins, who loses
  | 'unintended-consequences' // What could go wrong
  | 'comparison-analysis' // How does this compare to alternatives
  | 'coalition-dynamics' // How did coalition agree
  | 'opposition-response' // Response to criticism
  | 'personal-commitment'; // How personally invested

export interface MediaVulnerability {
  vulnerabilityArea: string;
  severityLevel: number; // 0-100
  mediaInterest: number; // 0-100
  preparedness: number; // 0-100
  damageControl: string;
}

export interface PolicyCommunicationStrategy {
  messagingStrategy: PolicyMessagingStrategy;
  interviewPreparation: InterviewPreparation;
  crisisManagement: PolicyCrisisManagement;
}

export interface PolicyMessagingStrategy {
  coreMessage: string;
  supportingPoints: string[];
  bridgingStatements: string[];
  soundbites: string[];
  narrativeFramework: NarrativeFramework;
}

export interface NarrativeFramework {
  heroJourney: HeroJourneyElements;
  conflictResolution: ConflictElements;
  futureVision: VisionElements;
}

export interface HeroJourneyElements {
  challenge: string; // The problem to solve
  journey: string; // The policy development process
  transformation: string; // The positive outcome
  heroRole: string; // Role of politician/government
}

export interface ConflictElements {
  antagonist: string; // The problem/opposition
  stakes: string; // What's at risk
  resolution: string; // How policy solves conflict
}

export interface VisionElements {
  currentState: string; // Where we are now
  futureState: string; // Where policy takes us
  pathway: string; // How we get there
  benefits: string; // Why it's worth it
}

export interface InterviewPreparation {
  keyQuestions: PreparedQuestion[];
  difficultScenarios: DifficultScenario[];
  bridgingTechniques: BridgingTechnique[];
  nonVerbalStrategy: NonVerbalStrategy;
}

export interface PreparedQuestion {
  question: string;
  answerFramework: string;
  keyPoints: string[];
  bridgeOpportunities: string[];
}

export interface DifficultScenario {
  scenario: string;
  responseStrategy: string;
  fallbackPositions: string[];
  escalationPath: string[];
}

export interface BridgingTechnique {
  triggerPhrase: string;
  bridgeStatement: string;
  targetMessage: string;
  usage: string;
}

export interface NonVerbalStrategy {
  tone: 'confident' | 'thoughtful' | 'passionate' | 'calm' | 'urgent';
  energy: 'high' | 'medium' | 'low';
  visualAids: boolean;
  settingPreference: string;
}

export interface PolicyCrisisManagement {
  crisisScenarios: PolicyCrisisScenario[];
  responseProtocols: PolicyResponseProtocol[];
  escalationProcedures: EscalationProcedure[];
}

export interface PolicyCrisisScenario {
  scenario: string;
  probability: number; // 0-100
  severity: number; // 0-100
  earlyWarnings: string[];
  responseTime: number; // Hours to respond
}

export interface PolicyResponseProtocol {
  triggerConditions: string[];
  responseTeam: string[];
  communicationPlan: string;
  stakeholderNotification: string[];
}

export interface EscalationProcedure {
  escalationLevel: 'minor' | 'moderate' | 'major' | 'crisis';
  decisionMakers: string[];
  responseOptions: string[];
  timeConstraints: string;
}

// Policy Interview Question Types
export type PolicyQuestionType =
  | 'cost-justification'      // Why is this worth the money?
  | 'evidence-basis'          // What evidence supports this?
  | 'implementation-detail'   // How will this actually work?
  | 'political-timing'        // Why announce this now?
  | 'stakeholder-impact'      // Who benefits, who pays?
  | 'unintended-consequences' // What could go wrong?
  | 'alternative-comparison'  // Why not do X instead?
  | 'coalition-dynamics'      // How did partners agree to this?
  | 'opposition-response'     // Response to criticism
  | 'personal-commitment'     // How committed are you personally?
  | 'success-measurement'     // How will we know if it works?
  | 'failure-contingency';    // What if it doesn't work?

// Policy Interview Performance Tracking
export interface PolicyAnnouncementPerformance {
  messageClarity: number; // 0-100
  evidenceCredibility: number; // 0-100
  stakeholderManagement: number; // 0-100
  implementationConfidence: number; // 0-100
  politicalSkill: number; // 0-100
  publicCommunication: number; // 0-100
}

export interface PolicyInterviewAnalytics {
  preparedness: number; // 0-100
  messageConsistency: number; // 0-100
  questionHandling: number; // 0-100
  credibilityMaintenance: number; // 0-100
  narrativeControl: number; // 0-100
  stakeholderReassurance: number; // 0-100
}

// Investigative Journalism Interview Types
export interface InvestigativeJournalismConfig {
  investigation: InvestigationDetails;
  evidence: EvidenceFramework;
  subjects: InvestigationSubject[];
  timeline: InvestigationTimeline;
  legalConstraints: LegalConstraints;
  sourceProtection: SourceProtection;
  publicInterest: PublicInterestFramework;
}

export interface InvestigationDetails {
  investigationName: string;
  category: InvestigationCategory;
  scope: InvestigationScope;
  targetOrganizations: string[];
  keyAllegations: Allegation[];
  investigationStage: InvestigationStage;
  publicationStrategy: PublicationStrategy;
  impact: InvestigationImpact;
}

export type InvestigationCategory =
  | 'corruption'           // Financial misconduct, bribery
  | 'abuse-of-power'       // Misuse of authority
  | 'financial-misconduct' // Tax evasion, fraud
  | 'conflict-of-interest' // Undisclosed relationships
  | 'cover-up'             // Concealing wrongdoing
  | 'negligence'           // Failure to act responsibly
  | 'systemic-failure'     // Institutional breakdown
  | 'human-rights'         // Rights violations
  | 'environmental'        // Environmental damage/cover-up
  | 'international';       // Foreign influence/relations

export type InvestigationScope =
  | 'individual'           // Single person focus
  | 'organizational'       // Institution/company
  | 'systemic'             // Widespread pattern
  | 'network'              // Connected individuals/groups
  | 'international'        // Cross-border investigation
  | 'historical';          // Past events investigation

export interface Allegation {
  allegationType: string;
  severity: AllegationSeverity;
  evidenceLevel: EvidenceLevel;
  timeframe: string;
  involvedParties: string[];
  potentialConsequences: string[];
  publicInterestLevel: number; // 0-100
}

export type AllegationSeverity =
  | 'minor'                // Limited impact
  | 'significant'          // Notable consequences
  | 'serious'              // Major implications
  | 'critical';            // Extremely serious

export type EvidenceLevel =
  | 'unsubstantiated'      // Claims without proof
  | 'circumstantial'       // Indirect evidence
  | 'corroborated'         // Multiple sources confirm
  | 'documented'           // Written/recorded proof
  | 'verified';            // Independently confirmed

export type InvestigationStage =
  | 'preliminary'          // Initial inquiry
  | 'active-investigation' // Ongoing research
  | 'fact-checking'        // Verification phase
  | 'legal-review'         // Legal assessment
  | 'pre-publication'      // Final preparation
  | 'published'            // Story released
  | 'follow-up';           // Post-publication investigation

export interface PublicationStrategy {
  publicationTiming: PublicationTiming;
  mediaCoordination: MediaCoordination;
  impactMaximization: ImpactStrategy;
  responseAnticipation: ResponseAnticipation;
}

export interface PublicationTiming {
  optimalWindow: string;
  avoidancePeriods: string[];
  newsCompetition: NewsCompetition;
  legalDeadlines: string[];
  politicalContext: PoliticalContext;
}

export interface NewsCompetition {
  competingStories: string[];
  attentionLevel: 'low' | 'medium' | 'high' | 'overwhelming';
  optimalSlot: 'morning' | 'afternoon' | 'evening' | 'weekend';
}

export interface PoliticalContext {
  politicalSensitivity: number; // 0-100
  electionProximity: number; // Days to election
  parliamentarySession: boolean;
  governmentStability: 'stable' | 'tense' | 'crisis';
}

export interface MediaCoordination {
  primaryOutlet: string;
  partnerOutlets: string[];
  exclusivityAgreements: ExclusivityAgreement[];
  crossPlatformStrategy: CrossPlatformStrategy;
}

export interface ExclusivityAgreement {
  outlet: string;
  exclusivityPeriod: number; // Hours
  conditions: string[];
  benefits: string[];
}

export interface CrossPlatformStrategy {
  printStrategy: PublicationElement[];
  onlineStrategy: PublicationElement[];
  broadcastStrategy: PublicationElement[];
  socialMediaStrategy: SocialMediaElement[];
}

export interface PublicationElement {
  elementType: 'main-story' | 'sidebar' | 'analysis' | 'timeline' | 'infographic';
  priority: 'primary' | 'secondary' | 'supporting';
  wordCount: number;
  publicationOrder: number;
}

export interface SocialMediaElement {
  platform: string;
  contentType: 'thread' | 'video' | 'infographic' | 'live-updates';
  timing: 'pre-publication' | 'simultaneous' | 'follow-up';
  engagement: EngagementStrategy;
}

export interface EngagementStrategy {
  responseProtocol: ResponseProtocol[];
  moderationGuidelines: string[];
  escalationProcedures: string[];
}

export interface ImpactStrategy {
  targetAudiences: TargetAudience[];
  messageFraming: InvestigativeFraming[];
  callToAction: CallToAction[];
  followUpPlanning: FollowUpPlan;
}

export interface TargetAudience {
  audience: string;
  accessChannels: string[];
  messageTailoring: string;
  expectedReaction: AudienceReaction;
}

export interface AudienceReaction {
  sentiment: number; // -100 to 100
  engagementLevel: 'low' | 'medium' | 'high' | 'viral';
  actionLikelihood: number; // 0-100
  influenceOnOthers: number; // 0-100
}

export interface InvestigativeFraming {
  frame: InvestigativeFrame;
  narrative: string;
  supportingEvidence: string[];
  counterNarratives: string[];
}

export type InvestigativeFrame =
  | 'public-accountability' // Officials must answer to public
  | 'systemic-failure'      // Institution needs reform
  | 'individual-misconduct' // Person acted improperly
  | 'transparency-deficit'  // Lack of openness
  | 'abuse-of-trust'        // Betrayal of public faith
  | 'pattern-of-behavior'   // Recurring problems
  | 'cover-up-exposed'      // Truth revealed
  | 'whistleblower-courage'; // Sources risked for truth

export interface CallToAction {
  actionType: ActionType;
  targetAudience: string;
  specificAction: string;
  timeframe: string;
  measurableOutcome: string;
}

export type ActionType =
  | 'demand-investigation' // Call for official inquiry
  | 'seek-accountability'  // Demand consequences
  | 'policy-change'        // Reform systems
  | 'transparency'         // Demand openness
  | 'support-whistleblowers' // Protect sources
  | 'public-pressure'      // Mobilize opinion
  | 'legal-action'         // Pursue justice
  | 'oversight';           // Increase monitoring

export interface FollowUpPlan {
  immediateFollowUp: ImmediateFollowUp;
  ongoingCoverage: OngoingCoverage;
  impactMeasurement: ImpactMeasurement;
  iterativeInvestigation: IterativeInvestigation;
}

export interface ImmediateFollowUp {
  responseMonitoring: ResponseMonitoring;
  factualCorrections: CorrectionProtocol;
  sourceSupport: SourceSupport;
  legalPreparation: LegalPreparation;
}

export interface ResponseMonitoring {
  keyRespondents: string[];
  monitoringChannels: string[];
  responseTimeframes: ResponseTimeframe[];
  escalationTriggers: string[];
}

export interface ResponseTimeframe {
  respondent: string;
  expectedResponseTime: string;
  responseType: 'denial' | 'partial-admission' | 'full-admission' | 'counter-attack' | 'silence';
  credibilityImpact: number; // -100 to 100
}

export interface CorrectionProtocol {
  verificationProcess: string[];
  correctionStandards: string[];
  publicationProcess: string[];
  sourceNotification: boolean;
}

export interface SourceSupport {
  protectionMeasures: string[];
  legalSupport: boolean;
  communicationProtocol: string[];
  anonymityMaintenance: string[];
}

export interface LegalPreparation {
  litigationRisk: number; // 0-100
  legalStrategy: LegalStrategy;
  evidencePreservation: EvidencePreservation;
  responseCapability: ResponseCapability;
}

export interface LegalStrategy {
  defenseStrategy: 'truth-defense' | 'public-interest' | 'fair-comment' | 'qualified-privilege';
  legalCounsel: string;
  precedentCases: string[];
  riskMitigation: string[];
}

export interface EvidencePreservation {
  digitalEvidence: string[];
  physicalEvidence: string[];
  witnessProtection: string[];
  backupSystems: string[];
}

export interface ResponseCapability {
  responseTeam: string[];
  communicationProtocol: string[];
  mediaStrategy: string[];
  resourceAllocation: string[];
}

export interface OngoingCoverage {
  coveragePlan: CoveragePlan[];
  resourceCommitment: ResourceCommitment;
  partnershipMaintenance: PartnershipMaintenance;
  audienceEngagement: AudienceEngagement;
}

export interface CoveragePlan {
  coverageType: 'follow-up-story' | 'investigation-expansion' | 'impact-analysis' | 'response-coverage';
  timeline: string;
  resourceRequirement: string;
  successMetrics: string[];
}

export interface ResourceCommitment {
  personnelAllocation: string[];
  budgetAllocation: string;
  timeCommitment: string;
  expertiseRequirements: string[];
}

export interface PartnershipMaintenance {
  partnerOutlets: string[];
  collaborationFramework: string[];
  sharedResources: string[];
  coordinationMechanisms: string[];
}

export interface AudienceEngagement {
  engagementChannels: string[];
  feedbackMechanisms: string[];
  communityBuilding: string[];
  educationalContent: string[];
}

export interface ImpactMeasurement {
  quantitativeMetrics: QuantitativeMetric[];
  qualitativeAssessment: QualitativeAssessment[];
  longitudinalTracking: LongitudinalTracking;
  outcomeEvaluation: OutcomeEvaluation;
}

export interface QuantitativeMetric {
  metric: string;
  measurementMethod: string;
  targetValue: string;
  currentValue: string;
  trendDirection: 'increasing' | 'decreasing' | 'stable' | 'fluctuating';
}

export interface QualitativeAssessment {
  assessmentArea: string;
  assessmentMethod: string;
  keyFindings: string[];
  implicationsForFuture: string[];
}

export interface LongitudinalTracking {
  trackingPeriod: string;
  trackingFrequency: string;
  evolutionIndicators: string[];
  adaptationStrategies: string[];
}

export interface OutcomeEvaluation {
  primaryOutcomes: Outcome[];
  secondaryOutcomes: Outcome[];
  unintendedConsequences: UnintendedConsequence[];
  lessonLearned: LessonLearned[];
}

export interface Outcome {
  outcome: string;
  achievementLevel: number; // 0-100
  timeToAchievement: string;
  sustainabilityAssessment: string;
}

export interface UnintendedConsequence {
  consequence: string;
  severity: 'minor' | 'moderate' | 'significant' | 'major';
  mitigation: string;
  preventionStrategy: string;
}

export interface LessonLearned {
  lesson: string;
  applicability: string[];
  implementationGuidance: string;
  sharingStrategy: string;
}

export interface IterativeInvestigation {
  expandedScope: InvestigationExpansion[];
  newLeads: InvestigationLead[];
  collaborativeOpportunities: CollaborativeOpportunity[];
  resourceScaling: ResourceScaling;
}

export interface InvestigationExpansion {
  expansionArea: string;
  rationale: string;
  resourceRequirement: string;
  expectedTimeline: string;
  successProbability: number; // 0-100
}

export interface InvestigationLead {
  leadType: 'source' | 'document' | 'pattern' | 'tip';
  credibilityAssessment: number; // 0-100
  investigationPriority: 'low' | 'medium' | 'high' | 'urgent';
  resourceRequirement: string;
}

export interface CollaborativeOpportunity {
  partnerType: 'media' | 'ngo' | 'academic' | 'international' | 'government';
  collaborationScope: string;
  mutualBenefits: string[];
  riskAssessment: string;
}

export interface ResourceScaling {
  currentCapacity: string;
  requiredCapacity: string;
  scalingStrategy: string[];
  fundingRequirements: string;
}

export interface ResponseAnticipation {
  expectedResponses: ExpectedResponse[];
  responseCountermeasures: ResponseCountermeasure[];
  damageControlPlans: DamageControlPlan[];
  reputationManagement: ReputationManagement;
}

export interface ExpectedResponse {
  respondent: string;
  responseType: ResponseType;
  responseTimeline: string;
  responseIntensity: number; // 0-100
  credibilityThreat: number; // 0-100
}

export type ResponseType =
  | 'denial'               // Flat denial of allegations
  | 'partial-admission'    // Acknowledge some issues
  | 'full-admission'       // Complete acknowledgment
  | 'deflection'           // Redirect attention elsewhere
  | 'attack-messenger'     // Attack journalists/sources
  | 'legal-action'         // Threaten or pursue litigation
  | 'counter-narrative'    // Alternative explanation
  | 'silence';             // No response

export interface ResponseCountermeasure {
  responseType: ResponseType;
  countermeasureStrategy: CountermeasureStrategy[];
  preparedness: number; // 0-100
  resourceRequirement: string;
}

export interface CountermeasureStrategy {
  strategy: string;
  implementation: string[];
  successIndicators: string[];
  fallbackOptions: string[];
}

export interface DamageControlPlan {
  damageScenario: string;
  preventionMeasures: string[];
  responseProtocol: string[];
  recoveryStrategy: string[];
}

export interface ReputationManagement {
  reputationRisks: ReputationRisk[];
  protectionStrategies: ProtectionStrategy[];
  recoveryMechanisms: RecoveryMechanism[];
  stakeholderCommunication: StakeholderCommunication[];
}

export interface ReputationRisk {
  riskType: string;
  probability: number; // 0-100
  impact: number; // 0-100
  mitigation: string;
}

export interface ProtectionStrategy {
  strategy: string;
  implementation: string[];
  effectiveness: number; // 0-100
  resourceRequirement: string;
}

export interface RecoveryMechanism {
  mechanism: string;
  triggerConditions: string[];
  implementation: string[];
  timeToRecovery: string;
}

export interface StakeholderCommunication {
  stakeholder: string;
  communicationStrategy: string;
  keyMessages: string[];
  communicationChannels: string[];
}

export interface InvestigationImpact {
  expectedImpact: ExpectedImpact[];
  impactMeasurement: ImpactMeasurementFramework;
  successCriteria: SuccessCriteria[];
  riskAssessment: InvestigationRiskAssessment;
}

export interface ExpectedImpact {
  impactArea: ImpactArea;
  impactDescription: string;
  impactMagnitude: number; // 0-100
  impactTimeframe: string;
  certaintyLevel: number; // 0-100
}

export type ImpactArea =
  | 'policy-change'        // Government policy reform
  | 'legal-consequences'   // Criminal/civil proceedings
  | 'institutional-reform' // Organizational changes
  | 'public-awareness'     // Increased knowledge
  | 'political-accountability' // Official consequences
  | 'regulatory-action'    // Regulatory response
  | 'corporate-governance' // Business practice changes
  | 'social-change'        // Broader societal impact
  | 'international-relations' // Diplomatic consequences
  | 'media-landscape';     // Journalism impact

export interface ImpactMeasurementFramework {
  shortTermMetrics: ImpactMetric[];
  mediumTermMetrics: ImpactMetric[];
  longTermMetrics: ImpactMetric[];
  measurementMethods: MeasurementMethod[];
}

export interface ImpactMetric {
  metric: string;
  measurementUnit: string;
  baselineValue: string;
  targetValue: string;
  measurementFrequency: string;
}

export interface MeasurementMethod {
  method: string;
  description: string;
  dataRequirements: string[];
  analysisApproach: string;
}

export interface SuccessCriteria {
  criterion: string;
  measurement: string;
  threshold: string;
  timeframe: string;
  priority: 'essential' | 'important' | 'desirable';
}

export interface InvestigationRiskAssessment {
  legalRisks: LegalRisk[];
  reputationalRisks: ReputationalRisk[];
  operationalRisks: OperationalRisk[];
  ethicalRisks: EthicalRisk[];
}

export interface LegalRisk {
  riskType: string;
  probability: number; // 0-100
  impact: string;
  mitigation: string[];
  legalSupport: string;
}

export interface ReputationalRisk {
  riskType: string;
  stakeholder: string;
  probability: number; // 0-100
  impactSeverity: number; // 0-100
  mitigation: string[];
}

export interface OperationalRisk {
  riskType: string;
  operationalArea: string;
  probability: number; // 0-100
  disruption: string;
  contingency: string[];
}

export interface EthicalRisk {
  riskType: string;
  ethicalStandard: string;
  stakeholderImpact: string;
  mitigationStrategy: string[];
}

export interface EvidenceFramework {
  evidenceTypes: EvidenceType[];
  verificationStandards: VerificationStandard[];
  sourceCredibility: SourceCredibilityAssessment[];
  evidenceChain: EvidenceChain;
  qualityAssurance: QualityAssurance;
}

export interface EvidenceType {
  type: EvidenceTypeCategory;
  description: string;
  reliability: number; // 0-100
  verificationMethod: string[];
  legalAdmissibility: boolean;
}

export type EvidenceTypeCategory =
  | 'documentary'          // Written records, emails, reports
  | 'testimonial'          // Witness statements, interviews
  | 'digital'              // Electronic records, metadata
  | 'financial'            // Bank records, transactions
  | 'photographic'         // Images, video evidence
  | 'audio'                // Recordings, phone calls
  | 'circumstantial'       // Indirect evidence, patterns
  | 'expert-analysis'      // Professional assessment
  | 'public-record'        // Government/court documents
  | 'forensic';            // Technical/scientific analysis

export interface VerificationStandard {
  standard: string;
  description: string;
  application: string[];
  acceptanceCriteria: string[];
}

export interface SourceCredibilityAssessment {
  source: string;
  credibilityScore: number; // 0-100
  reliabilityFactors: ReliabilityFactor[];
  verificationHistory: VerificationHistory[];
  riskAssessment: SourceRiskAssessment;
}

export interface ReliabilityFactor {
  factor: string;
  impact: number; // -50 to 50
  explanation: string;
}

export interface VerificationHistory {
  claim: string;
  verificationOutcome: 'verified' | 'partially-verified' | 'unverified' | 'false';
  verificationMethod: string;
  date: string;
}

export interface SourceRiskAssessment {
  motivationAssessment: MotivationAssessment;
  accessAssessment: AccessAssessment;
  reliabilityHistory: ReliabilityHistory;
  vulnerabilityAssessment: VulnerabilityAssessment;
}

export interface MotivationAssessment {
  motivationType: MotivationType;
  motivationStrength: number; // 0-100
  potentialBias: PotentialBias[];
  credibilityImpact: number; // -100 to 100
}

export type MotivationType =
  | 'public-interest'      // Genuine concern for public good
  | 'personal-grievance'   // Personal issue with subject
  | 'whistleblower'        // Institutional conscience
  | 'revenge'              // Desire for retaliation
  | 'financial-gain'       // Monetary motivation
  | 'political'            // Political agenda
  | 'attention-seeking'    // Desire for notoriety
  | 'unknown';             // Unclear motivation

export interface PotentialBias {
  biasType: string;
  biasStrength: number; // 0-100
  impactOnInformation: string;
  mitigationStrategy: string;
}

export interface AccessAssessment {
  accessLevel: AccessLevel;
  informationQuality: InformationQuality;
  verificationPossibility: VerificationPossibility;
  uniqueness: Uniqueness;
}

export type AccessLevel =
  | 'insider'              // Direct institutional access
  | 'close-observer'       // Regular proximity to events
  | 'occasional-access'    // Intermittent exposure
  | 'secondhand'           // Information from others
  | 'peripheral'           // Limited, indirect access
  | 'unknown';             // Access level unclear

export interface InformationQuality {
  specificity: number; // 0-100
  detail: number; // 0-100
  consistency: number; // 0-100
  uniqueness: number; // 0-100
}

export interface VerificationPossibility {
  independentVerification: boolean;
  corroboratingEvidence: boolean;
  documentarySupport: boolean;
  witnessConfirmation: boolean;
}

export interface Uniqueness {
  exclusiveInformation: boolean;
  alternativeSources: number;
  informationRarity: number; // 0-100
  strategicValue: number; // 0-100
}

export interface ReliabilityHistory {
  previousAccuracy: number; // 0-100
  consistencyRecord: number; // 0-100
  verificationSuccessRate: number; // 0-100
  reputationIndicators: ReputationIndicator[];
}

export interface ReputationIndicator {
  indicator: string;
  credibilityImpact: number; // -100 to 100
  verificationLevel: 'confirmed' | 'likely' | 'uncertain' | 'disputed';
}

export interface VulnerabilityAssessment {
  exposureRisks: ExposureRisk[];
  retaliationRisks: RetaliationRisk[];
  legalVulnerabilities: LegalVulnerability[];
  personalSafetyRisks: PersonalSafetyRisk[];
}

export interface ExposureRisk {
  riskType: string;
  probability: number; // 0-100
  consequence: string;
  mitigation: string[];
}

export interface RetaliationRisk {
  retaliationType: string;
  probability: number; // 0-100
  severity: number; // 0-100
  protection: string[];
}

export interface LegalVulnerability {
  vulnerabilityType: string;
  legalExposure: string;
  protectionAvailable: boolean;
  legalSupport: string[];
}

export interface PersonalSafetyRisk {
  riskType: string;
  threatLevel: number; // 0-100
  protectionMeasures: string[];
  monitoringRequired: boolean;
}

export interface EvidenceChain {
  evidenceLinks: EvidenceLink[];
  chainStrength: number; // 0-100
  weakestLinks: WeakLink[];
  strengthenStrategies: StrengthenStrategy[];
}

export interface EvidenceLink {
  linkId: string;
  evidenceElement: string;
  connectionType: string;
  strength: number; // 0-100
  verification: string;
}

export interface WeakLink {
  linkId: string;
  weakness: string;
  impact: number; // 0-100
  strengthenOptions: string[];
}

export interface StrengthenStrategy {
  strategy: string;
  targetLinks: string[];
  implementation: string[];
  expectedImprovement: number; // 0-100
}

export interface QualityAssurance {
  verificationProtocols: VerificationProtocol[];
  reviewProcesses: ReviewProcess[];
  accuracyStandards: AccuracyStandard[];
  correctionMechanisms: CorrectionMechanism[];
}

export interface VerificationProtocol {
  protocol: string;
  applicability: string[];
  steps: string[];
  qualityIndicators: string[];
}

export interface ReviewProcess {
  processName: string;
  reviewStages: ReviewStage[];
  reviewerQualifications: string[];
  approvalCriteria: string[];
}

export interface ReviewStage {
  stage: string;
  reviewFocus: string[];
  reviewMethods: string[];
  passFailCriteria: string[];
}

export interface AccuracyStandard {
  standard: string;
  measurementCriteria: string[];
  acceptanceThreshold: string;
  monitoringMethod: string;
}

export interface CorrectionMechanism {
  triggerConditions: string[];
  correctionProcess: string[];
  publicationProtocol: string[];
  preventionMeasures: string[];
}

export interface InvestigationSubject {
  subjectType: SubjectType;
  subjectProfile: SubjectProfile;
  connectionToAllegations: ConnectionProfile;
  responseCapability: SubjectResponseCapability;
  vulnerabilityAssessment: SubjectVulnerabilityAssessment;
}

export type SubjectType =
  | 'individual-politician' // Single political figure
  | 'political-party'       // Party organization
  | 'government-institution' // Government body
  | 'private-company'       // Business entity
  | 'ngo-organization'      // Non-profit organization
  | 'international-organization' // Global entity
  | 'network'               // Connected group
  | 'system';               // Institutional system

export interface SubjectProfile {
  name: string;
  position: string;
  influence: InfluenceAssessment;
  reputation: ReputationProfile;
  resources: ResourceProfile;
  relationships: RelationshipNetwork;
}

export interface InfluenceAssessment {
  politicalInfluence: number; // 0-100
  economicInfluence: number; // 0-100
  socialInfluence: number; // 0-100
  mediaInfluence: number; // 0-100
  internationalInfluence: number; // 0-100
}

export interface ReputationProfile {
  publicReputation: number; // 0-100
  professionalReputation: number; // 0-100
  mediaReputation: number; // 0-100
  stakeholderReputation: StakeholderReputation[];
  reputationHistory: ReputationHistoryEvent[];
}

export interface StakeholderReputation {
  stakeholder: string;
  reputation: number; // 0-100
  relationship: 'positive' | 'neutral' | 'negative' | 'adversarial';
  influenceLevel: number; // 0-100
}

export interface ReputationHistoryEvent {
  event: string;
  date: string;
  reputationImpact: number; // -100 to 100
  recoveryPattern: string;
}

export interface ResourceProfile {
  financialResources: FinancialResources;
  humanResources: HumanResources;
  informationResources: InformationResources;
  legalResources: LegalResources;
  politicalResources: PoliticalResources;
}

export interface FinancialResources {
  availableFunding: number; // Financial capacity
  fundingSources: string[];
  expenditureCapacity: number; // Spending power
  financialVulnerabilities: string[];
}

export interface HumanResources {
  keyPersonnel: string[];
  expertiseAreas: string[];
  loyaltyAssessment: LoyaltyAssessment[];
  capacityLimitations: string[];
}

export interface LoyaltyAssessment {
  person: string;
  loyaltyLevel: number; // 0-100
  reliabilityFactors: string[];
  riskFactors: string[];
}

export interface InformationResources {
  informationAccess: InformationAccess[];
  intelligenceCapability: IntelligenceCapability;
  dataManagement: DataManagement;
  securityMeasures: SecurityMeasure[];
}

export interface InformationAccess {
  informationType: string;
  accessLevel: number; // 0-100
  controlMechanisms: string[];
  vulnerabilities: string[];
}

export interface IntelligenceCapability {
  gatheringCapability: number; // 0-100
  analysisCapability: number; // 0-100
  distributionNetworks: string[];
  counterintelligence: string[];
}

export interface DataManagement {
  dataSecurityLevel: number; // 0-100
  accessControls: string[];
  retentionPolicies: string[];
  vulnerabilityPoints: string[];
}

export interface SecurityMeasure {
  measureType: string;
  effectiveness: number; // 0-100
  coverage: string[];
  limitations: string[];
}

export interface LegalResources {
  legalRepresentation: LegalRepresentation;
  litigationCapability: LitigationCapability;
  complianceFramework: ComplianceFramework;
  legalVulnerabilities: LegalVulnerabilityProfile[];
}

export interface LegalRepresentation {
  primaryCounsel: string;
  specializedCounsel: string[];
  legalBudget: number;
  legalStrategy: string[];
}

export interface LitigationCapability {
  litigationExperience: number; // 0-100
  successRate: number; // 0-100
  litigationStrategy: string[];
  resourceCommitment: string;
}

export interface ComplianceFramework {
  complianceStandards: string[];
  monitoringMechanisms: string[];
  violationHistory: ViolationHistory[];
  improvementAreas: string[];
}

export interface ViolationHistory {
  violation: string;
  date: string;
  consequence: string;
  remediation: string;
}

export interface LegalVulnerabilityProfile {
  vulnerabilityArea: string;
  riskLevel: number; // 0-100
  exposureFactors: string[];
  mitigationMeasures: string[];
}

export interface PoliticalResources {
  politicalAlliances: PoliticalAlliance[];
  politicalCapital: PoliticalCapital;
  lobbyingCapability: LobbyingCapability;
  politicalVulnerabilities: PoliticalVulnerability[];
}

export interface PoliticalAlliance {
  ally: string;
  allianceStrength: number; // 0-100
  allianceType: 'formal' | 'informal' | 'strategic' | 'opportunistic';
  mutualBenefits: string[];
}

export interface PoliticalCapital {
  currentCapital: number; // 0-100
  capitalSources: string[];
  expenditureHistory: CapitalExpenditure[];
  replenishmentMechanisms: string[];
}

export interface CapitalExpenditure {
  issue: string;
  capitalSpent: number;
  outcome: string;
  lessons: string[];
}

export interface LobbyingCapability {
  lobbyingBudget: number;
  lobbyingTargets: string[];
  lobbyingMethods: string[];
  effectiveness: number; // 0-100
}

export interface PoliticalVulnerability {
  vulnerabilityType: string;
  exposureRisk: number; // 0-100
  mitigationStrategies: string[];
  monitoringRequired: boolean;
}

export interface RelationshipNetwork {
  keyRelationships: KeyRelationship[];
  networkInfluence: NetworkInfluence;
  relationshipVulnerabilities: RelationshipVulnerability[];
  networkResilience: NetworkResilience;
}

export interface KeyRelationship {
  relationship: string;
  relationshipType: RelationshipType;
  strength: number; // 0-100
  mutualDependency: number; // 0-100
  vulnerabilityToInvestigation: number; // 0-100
}

export type RelationshipType =
  | 'professional'         // Work relationships
  | 'personal'             // Personal relationships
  | 'political'            // Political connections
  | 'financial'            // Business relationships
  | 'familial'             // Family connections
  | 'ideological'          // Shared beliefs
  | 'transactional'        // Exchange relationships
  | 'adversarial';         // Opposing relationships

export interface NetworkInfluence {
  networkSize: number;
  networkDiversity: number; // 0-100
  networkReach: NetworkReach[];
  influenceMultipliers: InfluenceMultiplier[];
}

export interface NetworkReach {
  sector: string;
  reachLevel: number; // 0-100
  keyConnections: string[];
  accessCapability: string[];
}

export interface InfluenceMultiplier {
  multiplierType: string;
  amplificationFactor: number;
  applicableContexts: string[];
  limitations: string[];
}

export interface RelationshipVulnerability {
  relationshipTarget: string;
  vulnerabilityType: string;
  exploitability: number; // 0-100
  potentialDamage: number; // 0-100
}

export interface NetworkResilience {
  resilienceFactors: ResilienceFactor[];
  vulnerabilityPoints: NetworkVulnerabilityPoint[];
  recoveryCapability: RecoveryCapability[];
  adaptationMechanisms: AdaptationMechanism[];
}

export interface ResilienceFactor {
  factor: string;
  strength: number; // 0-100
  applicability: string[];
  limitations: string[];
}

export interface NetworkVulnerabilityPoint {
  vulnerabilityPoint: string;
  criticalityLevel: number; // 0-100
  failureConsequences: string[];
  protectionMeasures: string[];
}

export interface RecoveryCapability {
  recoveryArea: string;
  recoverySpeed: number; // 0-100
  resourceRequirements: string[];
  successProbability: number; // 0-100
}

export interface AdaptationMechanism {
  mechanism: string;
  adaptationSpeed: number; // 0-100
  effectivenessRange: string[];
  resourceRequirements: string[];
}

export interface ConnectionProfile {
  connectionType: ConnectionType;
  connectionStrength: number; // 0-100
  evidenceOfConnection: EvidenceOfConnection[];
  connectionTimeline: ConnectionTimeline;
  connectionImpact: ConnectionImpact;
}

export type ConnectionType =
  | 'direct-involvement'   // Direct participation
  | 'indirect-involvement' // Secondary participation
  | 'oversight-failure'    // Failed to prevent/address
  | 'knowledge-concealment' // Knew but didn't act
  | 'enabling-behavior'    // Facilitated wrongdoing
  | 'benefit-recipient'    // Benefited from misconduct
  | 'cover-up-participation' // Helped hide wrongdoing
  | 'institutional-responsibility'; // Organizational accountability

export interface EvidenceOfConnection {
  evidenceType: EvidenceTypeCategory;
  evidenceDescription: string;
  evidenceStrength: number; // 0-100
  corroboration: CorroborationLevel;
  verificationStatus: VerificationStatus;
}

export type CorroborationLevel =
  | 'uncorroborated'       // Single source
  | 'partially-corroborated' // Some supporting evidence
  | 'well-corroborated'    // Multiple sources confirm
  | 'independently-verified'; // Independent confirmation

export type VerificationStatus =
  | 'unverified'           // Not yet verified
  | 'under-verification'   // Verification in progress
  | 'verified'             // Confirmed accurate
  | 'disputed'             // Contested accuracy
  | 'debunked';            // Proven false

export interface ConnectionTimeline {
  involvementStart: string;
  involvementEnd: string;
  keyEvents: TimelineEvent[];
  timelineGaps: TimelineGap[];
}

export interface TimelineEvent {
  event: string;
  date: string;
  significance: number; // 0-100
  evidenceSupport: number; // 0-100
}

export interface TimelineGap {
  gapPeriod: string;
  gapSignificance: number; // 0-100
  possibleExplanations: string[];
  investigationPriority: number; // 0-100
}

export interface ConnectionImpact {
  legalLiability: LegalLiabilityAssessment;
  reputationalImpact: ReputationalImpactAssessment;
  politicalConsequences: PoliticalConsequenceAssessment;
  institutionalImpact: InstitutionalImpactAssessment;
}

export interface LegalLiabilityAssessment {
  criminalLiability: number; // 0-100
  civilLiability: number; // 0-100
  regulatoryViolations: RegulatoryViolation[];
  prosecutionProbability: number; // 0-100
}

export interface RegulatoryViolation {
  regulation: string;
  violationType: string;
  severity: number; // 0-100
  consequences: string[];
}

export interface ReputationalImpactAssessment {
  shortTermImpact: number; // -100 to 100
  longTermImpact: number; // -100 to 100
  stakeholderImpact: StakeholderImpactAssessment[];
  recoveryPossibility: RecoveryPossibilityAssessment;
}

export interface StakeholderImpactAssessment {
  stakeholder: string;
  impactMagnitude: number; // -100 to 100
  relationshipChange: string;
  mitigationPossibility: number; // 0-100
}

export interface RecoveryPossibilityAssessment {
  recoveryProbability: number; // 0-100
  recoveryTimeframe: string;
  recoveryRequirements: string[];
  residualDamage: number; // 0-100
}

export interface PoliticalConsequenceAssessment {
  immediateConsequences: PoliticalConsequence[];
  longerTermConsequences: PoliticalConsequence[];
  careerImpact: CareerImpactAssessment;
  partyImpact: PartyImpactAssessment;
}

export interface PoliticalConsequence {
  consequence: string;
  probability: number; // 0-100
  severity: number; // 0-100
  timeframe: string;
}

export interface CareerImpactAssessment {
  careerTermination: number; // 0-100 probability
  careerStagnation: number; // 0-100 probability
  careerRecovery: CareerRecoveryAssessment;
  alternativePathways: AlternativePathway[];
}

export interface CareerRecoveryAssessment {
  recoveryProbability: number; // 0-100
  recoveryTimeframe: string;
  preconditions: string[];
  limitingFactors: string[];
}

export interface AlternativePathway {
  pathway: string;
  viability: number; // 0-100
  requirements: string[];
  limitations: string[];
}

export interface PartyImpactAssessment {
  partyDamage: number; // 0-100
  electoralImpact: ElectoralImpactAssessment;
  internalConsequences: InternalConsequence[];
  mitigationStrategies: PartyMitigationStrategy[];
}

export interface ElectoralImpactAssessment {
  shortTermImpact: number; // -100 to 100
  longTermImpact: number; // -100 to 100
  demographicImpact: DemographicImpact[];
  competitiveImpact: CompetitiveImpact;
}

export interface DemographicImpact {
  demographic: string;
  impactMagnitude: number; // -100 to 100
  volatility: number; // 0-100
  recoveryPossibility: number; // 0-100
}

export interface CompetitiveImpact {
  competitorBeneficiaries: string[];
  marketShareShift: number; // Percentage points
  competitiveDisadvantage: string[];
  mitigationOpportunities: string[];
}

export interface InternalConsequence {
  consequence: string;
  affectedPersonnel: string[];
  organizationalImpact: string;
  mitigationRequired: boolean;
}

export interface PartyMitigationStrategy {
  strategy: string;
  implementation: string[];
  effectiveness: number; // 0-100
  resourceRequirement: string;
}

export interface InstitutionalImpactAssessment {
  institutionalDamage: number; // 0-100
  trustImpact: TrustImpactAssessment;
  operationalImpact: OperationalImpactAssessment;
  reformPressure: ReformPressureAssessment;
}

export interface TrustImpactAssessment {
  publicTrust: number; // -100 to 100
  stakeholderTrust: StakeholderTrustImpact[];
  trustRecovery: TrustRecoveryAssessment;
  trustMitigation: TrustMitigationStrategy[];
}

export interface StakeholderTrustImpact {
  stakeholder: string;
  trustChange: number; // -100 to 100
  relationshipImpact: string;
  recoveryTimeframe: string;
}

export interface TrustRecoveryAssessment {
  recoveryProbability: number; // 0-100
  recoveryTimeframe: string;
  recoveryRequirements: string[];
  residualSuspicion: number; // 0-100
}

export interface TrustMitigationStrategy {
  strategy: string;
  targetAudience: string;
  implementation: string[];
  expectedEffectiveness: number; // 0-100
}

export interface OperationalImpactAssessment {
  operationalDisruption: number; // 0-100
  efficiencyImpact: EfficiencyImpactAssessment;
  resourceDiversion: ResourceDiversionAssessment;
  performanceImpact: PerformanceImpactAssessment;
}

export interface EfficiencyImpactAssessment {
  efficiencyReduction: number; // 0-100
  affectedProcesses: string[];
  recoveryTimeline: string;
  mitigationMeasures: string[];
}

export interface ResourceDiversionAssessment {
  diversionMagnitude: number; // 0-100
  divertedResources: string[];
  impactOnCoreOperations: number; // 0-100
  reallocatioStrategy: string[];
}

export interface PerformanceImpactAssessment {
  performanceReduction: number; // 0-100
  affectedAreas: string[];
  stakeholderNoticeable: boolean;
  improvementTimeline: string;
}

export interface ReformPressureAssessment {
  reformPressure: number; // 0-100
  reformAreas: ReformArea[];
  reformTimeline: ReformTimeline;
  reformResistance: ReformResistanceAssessment;
}

export interface ReformArea {
  area: string;
  urgency: number; // 0-100
  complexity: number; // 0-100
  stakeholderSupport: number; // 0-100
}

export interface ReformTimeline {
  immediateReforms: string[];
  shortTermReforms: string[];
  longTermReforms: string[];
  ongoingMonitoring: string[];
}

export interface ReformResistanceAssessment {
  resistance: number; // 0-100
  resistanceSources: string[];
  overcomeMechanisms: string[];
  implementationChallenges: string[];
}

export interface SubjectResponseCapability {
  communicationCapability: CommunicationCapability;
  legalResponseCapability: LegalResponseCapability;
  politicalResponseCapability: PoliticalResponseCapability;
  resourceMobilization: ResourceMobilizationCapability;
}

export interface CommunicationCapability {
  mediaRelations: MediaRelationsCapability;
  publicCommunication: PublicCommunicationCapability;
  stakeholderCommunication: StakeholderCommunicationCapability;
  crisisCommunication: CrisisCommunicationCapability;
}

export interface MediaRelationsCapability {
  mediaAccess: number; // 0-100
  mediaRelationships: MediaRelationship[];
  messageControl: number; // 0-100
  mediaStrategy: string[];
}

export interface MediaRelationship {
  outlet: string;
  relationshipQuality: number; // 0-100
  influence: number; // 0-100
  reliability: number; // 0-100
}

export interface PublicCommunicationCapability {
  platformAccess: PlatformAccess[];
  messageReach: number; // 0-100
  credibilityLevel: number; // 0-100
  persuasionCapability: number; // 0-100
}

export interface PlatformAccess {
  platform: string;
  accessLevel: number; // 0-100
  audienceSize: number;
  engagementRate: number; // 0-100
}

export interface StakeholderCommunicationCapability {
  stakeholderRelationships: StakeholderRelationshipCapability[];
  communicationChannels: CommunicationChannel[];
  influenceCapability: InfluenceCapability;
  coordinationCapability: CoordinationCapability;
}

export interface StakeholderRelationshipCapability {
  stakeholder: string;
  relationshipStrength: number; // 0-100
  communicationEffectiveness: number; // 0-100
  mobilizationPotential: number; // 0-100
}

export interface CommunicationChannel {
  channel: string;
  effectiveness: number; // 0-100
  reach: number; // 0-100
  costEfficiency: number; // 0-100
}

export interface InfluenceCapability {
  directInfluence: number; // 0-100
  indirectInfluence: number; // 0-100
  networkInfluence: number; // 0-100
  persuasionSkills: number; // 0-100
}

export interface CoordinationCapability {
  coordinationSkills: number; // 0-100
  networkActivation: number; // 0-100
  resourceCoordination: number; // 0-100
  strategyAlignment: number; // 0-100
}

export interface CrisisCommunicationCapability {
  responseSpeed: number; // 0-100
  messageCoherence: number; // 0-100
  damageControl: number; // 0-100
  recoveryMessaging: number; // 0-100
}

export interface LegalResponseCapability {
  legalExpertise: LegalExpertiseCapability;
  litigationCapability: LitigationCapabilityAssessment;
  complianceManagement: ComplianceManagementCapability;
  regulatoryNavigation: RegulatoryNavigationCapability;
}

export interface LegalExpertiseCapability {
  inHouseExpertise: number; // 0-100
  externalCounselAccess: number; // 0-100
  specializedKnowledge: SpecializedKnowledge[];
  legalStrategyCapability: number; // 0-100
}

export interface SpecializedKnowledge {
  area: string;
  expertiseLevel: number; // 0-100
  applicationCapability: number; // 0-100
  updateFrequency: string;
}

export interface LitigationCapabilityAssessment {
  litigationExperience: number; // 0-100
  resourceAvailability: number; // 0-100
  strategicApproach: string[];
  successPredictors: SuccessPredictor[];
}

export interface SuccessPredictor {
  predictor: string;
  weight: number; // 0-100
  currentStatus: number; // 0-100
  improvementPossibility: number; // 0-100
}

export interface ComplianceManagementCapability {
  complianceFramework: number; // 0-100
  monitoringCapability: number; // 0-100
  responseCapability: number; // 0-100
  improvementCapability: number; // 0-100
}

export interface RegulatoryNavigationCapability {
  regulatoryKnowledge: number; // 0-100
  regulatoryRelationships: number; // 0-100
  complianceHistory: number; // 0-100
  adaptationCapability: number; // 0-100
}

export interface PoliticalResponseCapability {
  politicalCapital: number; // 0-100
  coalitionBuilding: CoalitionBuildingCapability;
  publicSupport: PublicSupportCapability;
  institutionalSupport: InstitutionalSupportCapability;
}

export interface CoalitionBuildingCapability {
  allianceFormation: number; // 0-100
  stakeholderMobilization: number; // 0-100
  interestAlignment: number; // 0-100
  coalitionMaintenance: number; // 0-100
}

export interface PublicSupportCapability {
  publicApproval: number; // 0-100
  supportMobilization: number; // 0-100
  grassrootsOrganizing: number; // 0-100
  narrativeControl: number; // 0-100
}

export interface InstitutionalSupportCapability {
  institutionalRelationships: number; // 0-100
  proceduralKnowledge: number; // 0-100
  institutionalLeverage: number; // 0-100
  reformInfluence: number; // 0-100
}

export interface ResourceMobilizationCapability {
  financialMobilization: FinancialMobilizationCapability;
  humanResourceMobilization: HumanResourceMobilizationCapability;
  informationMobilization: InformationMobilizationCapability;
  networkMobilization: NetworkMobilizationCapability;
}

export interface FinancialMobilizationCapability {
  availableResources: number;
  fundraisingCapability: number; // 0-100
  resourceAccessSpeed: number; // 0-100
  costManagement: number; // 0-100
}

export interface HumanResourceMobilizationCapability {
  talentAccess: number; // 0-100
  expertiseAcquisition: number; // 0-100
  teamCoordination: number; // 0-100
  capacityScaling: number; // 0-100
}

export interface InformationMobilizationCapability {
  informationAccess: number; // 0-100
  researchCapability: number; // 0-100
  analysisCapability: number; // 0-100
  intelligenceNetworks: number; // 0-100
}

export interface NetworkMobilizationCapability {
  networkActivation: number; // 0-100
  resourceLeverage: number; // 0-100
  coordinatedResponse: number; // 0-100
  networkResilience: number; // 0-100
}

export interface SubjectVulnerabilityAssessment {
  overallVulnerability: number; // 0-100
  vulnerabilityAreas: VulnerabilityArea[];
  protectionMechanisms: ProtectionMechanism[];
  vulnerabilityEvolution: VulnerabilityEvolution;
}

export interface VulnerabilityArea {
  area: string;
  vulnerabilityLevel: number; // 0-100
  exploitabilityFactors: ExploitabilityFactor[];
  protectionLevel: number; // 0-100
}

export interface ExploitabilityFactor {
  factor: string;
  exploitability: number; // 0-100
  mitigationDifficulty: number; // 0-100
  strategicValue: number; // 0-100
}

export interface ProtectionMechanism {
  mechanism: string;
  effectiveness: number; // 0-100
  coverage: string[];
  limitations: string[];
}

export interface VulnerabilityEvolution {
  currentTrajectory: 'increasing' | 'stable' | 'decreasing';
  evolutionDrivers: EvolutionDriver[];
  projectedChanges: ProjectedChange[];
  interventionOpportunities: InterventionOpportunity[];
}

export interface EvolutionDriver {
  driver: string;
  impact: number; // -100 to 100
  timeframe: string;
  predictability: number; // 0-100
}

export interface ProjectedChange {
  change: string;
  probability: number; // 0-100
  timeframe: string;
  impact: number; // -100 to 100
}

export interface InterventionOpportunity {
  opportunity: string;
  effectiveness: number; // 0-100
  feasibility: number; // 0-100
  resourceRequirement: string;
}

export interface InvestigationTimeline {
  investigationPhases: InvestigationPhase[];
  keyMilestones: InvestigationMilestone[];
  dependencies: InvestigationDependency[];
  riskPeriods: RiskPeriod[];
}

export interface InvestigationPhase {
  phase: string;
  duration: string;
  objectives: string[];
  deliverables: string[];
  resourceRequirements: PhaseResourceRequirement[];
}

export interface PhaseResourceRequirement {
  resourceType: string;
  quantity: string;
  timeframe: string;
  criticality: 'essential' | 'important' | 'desirable';
}

export interface InvestigationMilestone {
  milestone: string;
  plannedDate: string;
  dependencies: string[];
  successCriteria: string[];
  riskFactors: string[];
}

export interface InvestigationDependency {
  dependency: string;
  dependencyType: InvestigationDependencyType;
  criticalityLevel: number; // 0-100
  mitigation: string[];
}

export type InvestigationDependencyType =
  | 'source-access'        // Access to information sources
  | 'legal-clearance'      // Legal permissions/protections
  | 'resource-availability' // Funding, personnel, tools
  | 'institutional-cooperation' // Organizational support
  | 'timing-constraints'   // Time-sensitive elements
  | 'external-events'      // Outside factors
  | 'stakeholder-cooperation' // Third-party cooperation
  | 'technology-access';   // Technical capabilities

export interface RiskPeriod {
  period: string;
  riskLevel: number; // 0-100
  riskTypes: RiskType[];
  mitigationMeasures: string[];
}

export interface RiskType {
  risk: string;
  probability: number; // 0-100
  impact: number; // 0-100
  mitigation: string[];
}

export interface LegalConstraints {
  jurisdictionalLimitations: JurisdictionalLimitation[];
  legalProtections: LegalProtection[];
  complianceRequirements: ComplianceRequirement[];
  legalRisks: InvestigationLegalRisk[];
}

export interface JurisdictionalLimitation {
  jurisdiction: string;
  limitations: string[];
  workarounds: string[];
  implications: string[];
}

export interface LegalProtection {
  protectionType: LegalProtectionType;
  scope: string[];
  limitations: string[];
  applicationProcess: string[];
}

export type LegalProtectionType =
  | 'press-freedom'        // Journalistic rights
  | 'source-protection'   // Confidentiality rights
  | 'whistleblower-protection' // Whistleblower laws
  | 'public-interest'     // Public interest defense
  | 'fair-comment'        // Commentary protection
  | 'qualified-privilege' // Conditional protection
  | 'absolute-privilege'  // Unconditional protection
  | 'constitutional-protection'; // Constitutional rights

export interface ComplianceRequirement {
  requirement: string;
  applicableContexts: string[];
  complianceSteps: string[];
  nonComplianceRisks: string[];
}

export interface InvestigationLegalRisk {
  riskType: string;
  riskLevel: number; // 0-100
  mitigationStrategies: LegalMitigationStrategy[];
  legalPrecedents: LegalPrecedent[];
}

export interface LegalMitigationStrategy {
  strategy: string;
  effectiveness: number; // 0-100
  implementationRequirements: string[];
  costImplications: string;
}

export interface LegalPrecedent {
  precedent: string;
  relevance: number; // 0-100
  outcome: string;
  lessons: string[];
}

export interface SourceProtection {
  protectionProtocols: SourceProtectionProtocol[];
  anonymityMeasures: AnonymityMeasure[];
  securityMeasures: SourceSecurityMeasure[];
  legalSafeguards: LegalSafeguard[];
}

export interface SourceProtectionProtocol {
  protocol: string;
  applicableContexts: string[];
  implementationSteps: string[];
  effectivenessRating: number; // 0-100
}

export interface AnonymityMeasure {
  measure: string;
  anonymityLevel: number; // 0-100
  implementationComplexity: number; // 0-100
  vulnerabilities: string[];
}

export interface SourceSecurityMeasure {
  measure: string;
  securityLevel: number; // 0-100
  resourceRequirement: string;
  maintenanceRequirement: string;
}

export interface LegalSafeguard {
  safeguard: string;
  protectionScope: string[];
  activationConditions: string[];
  limitations: string[];
}

export interface PublicInterestFramework {
  publicInterestJustification: PublicInterestJustification;
  benefitAnalysis: BenefitAnalysis;
  harmAssessment: HarmAssessment;
  proportionalityAssessment: ProportionalityAssessment;
}

export interface PublicInterestJustification {
  primaryJustification: string;
  supportingJustifications: string[];
  publicBenefits: PublicBenefit[];
  socialValue: SocialValue;
}

export interface PublicBenefit {
  benefit: string;
  beneficiaryGroups: string[];
  magnitude: number; // 0-100
  timeframe: string;
}

export interface SocialValue {
  transparencyValue: number; // 0-100
  accountabilityValue: number; // 0-100
  educationalValue: number; // 0-100
  reformValue: number; // 0-100
}

export interface BenefitAnalysis {
  directBenefits: DirectBenefit[];
  indirectBenefits: IndirectBenefit[];
  longTermBenefits: LongTermBenefit[];
  benefitDistribution: BenefitDistribution;
}

export interface DirectBenefit {
  benefit: string;
  quantification: string;
  certaintyLevel: number; // 0-100
  timeToRealization: string;
}

export interface IndirectBenefit {
  benefit: string;
  causationChain: string[];
  probability: number; // 0-100
  magnitude: number; // 0-100
}

export interface LongTermBenefit {
  benefit: string;
  timeframe: string;
  sustainability: number; // 0-100
  dependencyFactors: string[];
}

export interface BenefitDistribution {
  primaryBeneficiaries: string[];
  secondaryBeneficiaries: string[];
  benefitEquity: number; // 0-100
  accessBarriers: string[];
}

export interface HarmAssessment {
  potentialHarms: PotentialHarm[];
  harmMitigation: HarmMitigation[];
  harmMonitoring: HarmMonitoring;
  acceptableHarmThresholds: AcceptableHarmThreshold[];
}

export interface PotentialHarm {
  harmType: string;
  affectedParties: string[];
  severity: number; // 0-100
  probability: number; // 0-100
}

export interface HarmMitigation {
  mitigationStrategy: string;
  targetedHarms: string[];
  effectiveness: number; // 0-100
  implementationRequirements: string[];
}

export interface HarmMonitoring {
  monitoringMechanisms: string[];
  earlyWarningIndicators: string[];
  responseProtocols: string[];
  reviewFrequency: string;
}

export interface AcceptableHarmThreshold {
  harmCategory: string;
  threshold: string;
  justification: string;
  reviewCriteria: string[];
}

export interface ProportionalityAssessment {
  benefitHarmBalance: BenefitHarmBalance;
  alternativeConsideration: AlternativeConsideration;
  leastHarmPrinciple: LeastHarmPrinciple;
  proportionalityConclusion: ProportionalityConclusion;
}

export interface BenefitHarmBalance {
  overallBalance: number; // -100 to 100
  balanceJustification: string;
  uncertaintyFactors: string[];
  sensitivityAnalysis: SensitivityAnalysis[];
}

export interface SensitivityAnalysis {
  variable: string;
  impactOnBalance: number; // -100 to 100
  likelihoodOfChange: number; // 0-100
  mitigationPossibility: number; // 0-100
}

export interface AlternativeConsideration {
  alternativesConsidered: Alternative[];
  rejectionRationale: RejectionRationale[];
  lessHarmfulOptions: LessHarmfulOption[];
}

export interface Alternative {
  alternative: string;
  benefitPotential: number; // 0-100
  harmPotential: number; // 0-100
  feasibility: number; // 0-100
}

export interface RejectionRationale {
  alternative: string;
  rejectionReasons: string[];
  inadequacyExplanation: string;
}

export interface LessHarmfulOption {
  option: string;
  harmReduction: number; // 0-100
  benefitImpact: number; // -100 to 100
  adoptionFeasibility: number; // 0-100
}

export interface LeastHarmPrinciple {
  principleApplication: string;
  harmMinimizationMeasures: HarmMinimizationMeasure[];
  unavoidableHarms: UnavoidableHarm[];
  harmJustification: HarmJustification;
}

export interface HarmMinimizationMeasure {
  measure: string;
  targetedHarms: string[];
  effectiveness: number; // 0-100
  implementationCost: string;
}

export interface UnavoidableHarm {
  harm: string;
  unavoidabilityReason: string;
  mitigationAttempts: string[];
  acceptabilityJustification: string;
}

export interface HarmJustification {
  justificationFramework: string;
  ethicalBasis: string[];
  legalBasis: string[];
  professionalStandards: string[];
}

export interface ProportionalityConclusion {
  proportionalityVerdict: 'proportionate' | 'disproportionate' | 'marginal';
  conclusionJustification: string;
  conditionalFactors: string[];
  reviewRequirements: string[];
}

// Investigative Interview Question Types
export type InvestigativeQuestionType =
  | 'fact-establishment'      // Establishing basic facts
  | 'evidence-confrontation'  // Presenting evidence for response
  | 'contradiction-exposure'  // Highlighting inconsistencies
  | 'motive-exploration'      // Understanding motivations
  | 'responsibility-attribution' // Assigning accountability
  | 'timeline-clarification'  // Clarifying sequence of events
  | 'relationship-mapping'    // Understanding connections
  | 'knowledge-testing'       // Testing claimed ignorance
  | 'cover-up-investigation'  // Investigating concealment
  | 'impact-assessment'       // Understanding consequences
  | 'reform-commitment'       // Future prevention measures
  | 'accountability-demand';  // Demanding consequences

// Investigative Interview Performance Tracking
export interface InvestigativeInterviewPerformance {
  truthElicitation: number; // 0-100
  evidenceConfrontation: number; // 0-100
  consistencyMaintenance: number; // 0-100
  accountabilityAcceptance: number; // 0-100
  reformCommitment: number; // 0-100
  publicTrustworthiness: number; // 0-100
}

export interface InvestigativeInterviewAnalytics {
  evasiveness: number; // 0-100
  contradictionCount: number;
  evidenceAcknowledgment: number; // 0-100
  responsibilityAcceptance: number; // 0-100
  cooperativeness: number; // 0-100
  damageControl: number; // 0-100
}

// Social Media Feed Visualization Types
export interface SocialMediaFeedConfig {
  enabled: boolean;
  platforms: string[];
  updateFrequency: number; // milliseconds
  maxPosts: number;
  showMetrics: boolean;
  autoScroll: boolean;
  viralThreshold: number;
  trendingThreshold: number;
}

export interface SocialMediaPost {
  id: string;
  platform: string;
  author: SocialMediaAuthor;
  content: string;
  timestamp: Date;
  engagement: EngagementMetrics;
  demographic: DemographicGroup;
  sentiment: 'positive' | 'negative' | 'neutral';
  reactions: SocialMediaReaction[];
  hashtags: string[];
  mentions: string[];
  isViral: boolean;
  isTrending: boolean;
}

export interface SocialMediaAuthor {
  username: string;
  displayName: string;
  avatar: string;
  verified: boolean;
  followers: number;
  bio: string;
}

export interface EngagementMetrics {
  likes: number;
  shares: number;
  comments: number;
  views: number;
}

export type DemographicGroup = 'young-urban' | 'middle-aged-suburban' | 'elderly-rural' | 'professionals';

export interface SocialMediaReaction {
  type: string;
  count: number;
}

export interface ViralMoment {
  id: string;
  trigger: string;
  posts: SocialMediaPost[];
  peakEngagement: number;
  startTime: Date;
  platforms: string[];
  demographics: DemographicGroup[];
}

export interface TrendingTopic {
  hashtag: string;
  count: number;
  posts: SocialMediaPost[];
  sentiment: 'positive' | 'negative' | 'neutral';
  platforms: string[];
}

// Newspaper Layout Generator Types
export interface NewspaperConfig {
  enabled: boolean;
  theme: NewspaperTheme;
  updateFrequency: number; // milliseconds
  showMultiplePapers: boolean;
  generateBreakingNews: boolean;
  includeEditorials: boolean;
  includeOpEds: boolean;
  maxArticlesPerPaper: number;
  politicalLeaning: 'left' | 'right' | 'center' | 'balanced';
}

export type NewspaperTheme = 'broadsheet' | 'tabloid' | 'progressive' | 'conservative';

export type ArticleType = 'main-story' | 'breaking-news' | 'analysis' | 'editorial' | 'op-ed' | 'sidebar' | 'brief';

export type HeadlineStyle = 'sensational' | 'analytical' | 'neutral' | 'investigative';

export interface NewspaperLayout {
  id: string;
  name: string;
  theme: NewspaperTheme;
  date: Date;
  mainHeadline: string;
  sections: NewspaperSection[];
  layout: any; // Layout configuration object
  metadata: NewspaperMetadata;
}

export interface NewspaperSection {
  name: string;
  articles: NewspaperArticle[];
  layout: string; // Layout type for this section
}

export interface NewspaperArticle {
  id: string;
  type: ArticleType;
  headline: string;
  subheadline: string | null;
  byline: string | null;
  content: string;
  wordCount: number;
  imageCaption: string | null;
  section: string;
  priority: number;
  timestamp: Date;
  tags: string[];
  relatedArticles: string[];
}

export interface NewspaperMetadata {
  edition: string;
  circulation: number;
  credibility: number;
  politicalLeaning: string;
  publisher: string;
  editorInChief: string;
}
