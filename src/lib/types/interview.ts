/**
 * Dynamic Interview System Types
 * Modular interview engine supporting multiple interview types and stages
 */

export type InterviewType = 'character-creation' | 'scandal-response' | 'debate-prep' | 'crisis-management';
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
