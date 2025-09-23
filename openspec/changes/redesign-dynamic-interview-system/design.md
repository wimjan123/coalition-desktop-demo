# Dynamic Interview System Technical Design

## Context
The current interview system is fundamentally flawed for creating engaging, personalized political conversations. This design outlines a complete architectural redesign that transforms interviews from static surveys into dynamic, consequence-driven conversations that adapt to player choices and background.

## Goals / Non-Goals

### Goals
- **Personalized Experience**: Each background gets a unique, carefully crafted interview arc
- **Dynamic Conversation**: Interviewer reacts, interrupts, and builds on previous answers
- **Consequential Outcomes**: Interview performance meaningfully affects gameplay
- **Modular Architecture**: Easy to add new interview types and scenarios
- **Authentic Journalism**: Feels like real Dutch political interviews
- **Replayability**: Different backgrounds provide genuinely different experiences

### Non-Goals
- **Comprehensive Policy Coverage**: Not trying to cover every political issue
- **AI-Generated Content**: Questions are human-crafted, not procedurally generated
- **Real-Time Multiplayer**: Interviews remain single-player experiences
- **Voice Recognition**: Text-based interaction only

## Architectural Decisions

### 1. Modular Interview Engine

**Decision**: Create a pluggable interview engine that supports multiple interview types

**Architecture**:
```typescript
// Core engine that orchestrates the interview experience
class InterviewEngine {
  private personality: InterviewerPersonality;
  private questionArc: QuestionArc;
  private conversationState: ConversationState;
  private aftermathGenerator: AftermathGenerator;

  constructor(config: InterviewConfig) {
    this.personality = new InterviewerPersonality(config.interviewerType);
    this.questionArc = QuestionArcFactory.create(config.backgroundId, config.difficulty);
    this.conversationState = new ConversationState();
    this.aftermathGenerator = new AftermathGenerator(config.aftermathType);
  }

  async conductInterview(): Promise<InterviewResult> {
    // Orchestrates the entire interview flow
  }
}

// Pluggable question arc system
interface QuestionArc {
  backgroundId: string;
  difficulty: DifficultyLevel;
  questions: DynamicQuestion[];
  getNextQuestion(state: ConversationState): DynamicQuestion | null;
  handleResponse(questionId: string, response: PlayerResponse): ConversationEffect[];
}
```

**Rationale**: Modularity allows us to easily add new interview types (scandal response, debate prep, crisis management) without duplicating core conversation logic.

### 2. Background-Specific Question Arcs

**Decision**: Replace generic question database with curated, background-specific question sets

**Implementation**:
```typescript
// Each background gets a custom-designed question journey
const questionArcs: Record<string, QuestionArcDefinition> = {
  'toeslagenaffaire-whistleblower': {
    difficulty: 'extreme',
    interviewerApproach: 'confrontational',
    questionCount: 7,
    arc: [
      {
        id: 'opener-accountability',
        type: 'opener',
        setup: "The Toeslagenaffaire affected thousands of families...",
        question: "You were inside the system that destroyed lives. How can voters trust you to fix what you helped break?",
        interruptionTriggers: ['evasion', 'deflection'],
        followUpRules: [
          { if: 'tone:defensive', then: 'accountability-pressure' },
          { if: 'tone:aggressive', then: 'responsibility-challenge' }
        ]
      }
      // ... 6 more carefully crafted questions
    ]
  }
};
```

**Rationale**: Curated questions feel personal and authentic, avoiding the generic survey problem while ensuring each background gets appropriate challenge level.

### 3. Dynamic Interviewer Behavior System

**Decision**: Create reactive interviewer personality that evolves during conversation

**Components**:
```typescript
class InterviewerPersonality {
  private mood: InterviewerMood = 'neutral';
  private memory: ConversationMemory;
  private reactions: ReactionEngine;

  // Mood progression based on player responses
  updateMood(response: PlayerResponse): MoodChange {
    if (response.tone === 'evasive' && this.mood === 'neutral') {
      return this.transitionTo('skeptical');
    }
    if (response.contradictsPrevious && this.mood === 'skeptical') {
      return this.transitionTo('hostile');
    }
    // ... more mood transitions
  }

  // Generate interruptions based on response analysis
  checkForInterruption(response: PlayerResponse): Interruption | null {
    if (response.tone === 'evasive' && response.wordCount > 50) {
      return {
        type: 'cut-off',
        message: "Hold on—you're not answering the question. Let me be more direct...",
        followUp: this.generateDirectFollowUp(response.topic)
      };
    }
  }
}
```

**Rationale**: Dynamic behavior makes the interviewer feel human and reactive, creating genuine conversation tension.

### 4. Conversational Flow Engine

**Decision**: Replace linear question progression with context-aware conversation flow

**Flow Logic**:
```typescript
class ConversationFlow {
  private state: ConversationState;
  private triggers: ConversationTrigger[];

  determineNextAction(playerResponse: PlayerResponse): ConversationAction {
    // Check for immediate interruptions
    const interruption = this.checkInterruptions(playerResponse);
    if (interruption) return interruption;

    // Check for rapid follow-ups
    const followUp = this.checkFollowUps(playerResponse);
    if (followUp) return followUp;

    // Check for contradiction challenges
    const contradiction = this.checkContradictions(playerResponse);
    if (contradiction) return contradiction;

    // Progress to next planned question
    return this.getNextPlannedQuestion();
  }
}
```

### 5. News Impact & Aftermath System

**Decision**: Generate dynamic post-interview content based on specific responses

**Generation Pipeline**:
```typescript
class AftermathGenerator {
  generateHeadline(performance: InterviewPerformance): string {
    const { backgroundId, dominantTone, majorMistakes, strongMoments } = performance;

    if (majorMistakes.length > 0) {
      return this.generateNegativeHeadline(backgroundId, majorMistakes[0]);
    }

    if (strongMoments.length > 0 && dominantTone === 'confident') {
      return this.generatePositiveHeadline(backgroundId, strongMoments[0]);
    }

    return this.generateNeutralHeadline(backgroundId, dominantTone);
  }

  generateSocialMediaReactions(performance: InterviewPerformance): SocialMediaFeed {
    const reactions: SocialMediaPost[] = [];

    // Generate demographic-specific reactions
    for (const demographic of DUTCH_DEMOGRAPHICS) {
      const reaction = this.generateDemographicReaction(demographic, performance);
      reactions.push(reaction);
    }

    return new SocialMediaFeed(reactions);
  }
}
```

## Cross-Cutting Concerns

### Performance Considerations
- **Lazy Loading**: Question arcs loaded on-demand based on selected background
- **Response Caching**: Common response patterns cached to avoid recalculation
- **Animation Optimization**: Interviewer reactions use CSS transforms, not layout changes

### Accessibility
- **Screen Reader Support**: All conversation elements properly labeled
- **Keyboard Navigation**: Full interview completable without mouse
- **Timing Controls**: Option to disable urgency timers for accessibility needs

### Internationalization
- **Question Localization**: Question arcs support multiple languages
- **Cultural Adaptation**: Interviewer personality adapts to cultural context
- **News Format Adaptation**: Aftermath format matches local news conventions

## Data Models

### Core Interview Data
```typescript
interface InterviewConfig {
  type: 'character-creation' | 'scandal-response' | 'debate-prep' | 'crisis-management';
  backgroundId: string;
  scenarioId?: string;
  difficulty: 'auto' | 'low' | 'medium' | 'high' | 'extreme';
  interviewerType: 'professional' | 'confrontational' | 'investigative';
  timeConstraints?: TimeConstraints;
}

interface ConversationState {
  answeredQuestions: string[];
  playerResponses: PlayerResponse[];
  interviewerMood: InterviewerMood;
  conversationMemory: ConversationMemory;
  performanceMetrics: PerformanceMetrics;
  contradictions: Contradiction[];
}

interface InterviewResult {
  performance: InterviewPerformance;
  positions: PoliticalPosition[];
  aftermath: InterviewAftermath;
  gameplayEffects: GameplayEffect[];
}
```

### Question Arc Structure
```typescript
interface DynamicQuestion {
  id: string;
  type: 'opener' | 'challenge' | 'follow-up' | 'gotcha' | 'closer';
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

interface ContextualResponseOption {
  text: string;
  tone: ResponseTone;
  position?: PoliticalPosition;
  consequences: ConversationEffect[];
  triggers: string[]; // What this response might trigger
}
```

## Migration Strategy

### Phase 1: Parallel Development
- Build new system alongside existing interview component
- Use feature flag to switch between old and new systems
- Allows safe development and testing without breaking existing functionality

### Phase 2: Background-by-Background Migration
- Start with one background (e.g., Small Business Owner - lowest complexity)
- Test thoroughly before proceeding to more complex backgrounds
- Gradual rollout reduces risk and allows for iterative improvements

### Phase 3: Complete Replacement
- Remove old interview system once all backgrounds are migrated
- Clean up legacy code and components
- Update all references and dependencies

## Testing Strategy

### Unit Testing
- **Question Arc Logic**: Test question selection and flow for each background
- **Conversation State**: Test state transitions and memory management
- **Aftermath Generation**: Test news content generation algorithms

### Integration Testing
- **End-to-End Interview Flow**: Complete interview for each background
- **Game Integration**: Test how interview results affect game state
- **Performance Testing**: Test with multiple concurrent interviews

### User Experience Testing
- **Engagement Metrics**: Track completion rates and reading time
- **Authenticity Testing**: Validate with Dutch political journalism experts
- **Accessibility Testing**: Test with screen readers and keyboard navigation

## Risks & Mitigations

### Risk: Overly Complex Implementation
**Mitigation**: Start with simple MVP version, add complexity incrementally

### Risk: Content Creation Bottleneck
**Mitigation**: Create content templates and guidelines for efficient question writing

### Risk: Performance Impact
**Mitigation**: Implement lazy loading and optimize critical path performance

### Risk: Balancing Difficulty
**Mitigation**: Extensive playtesting and analytics to tune difficulty progression

## Open Questions

1. **Interview Length Variation**: Should interview length vary more dramatically based on background (3 questions for safe vs 8 for extreme)?

2. **Player Agency**: How much should players be able to influence interviewer behavior vs. having it be determined by their responses?

3. **Aftermath Persistence**: Should news aftermath be visible during gameplay, or just affect starting conditions?

4. **Multiplayer Considerations**: Future consideration for comparing interview performances between players?

5. **Content Management**: How to efficiently create and maintain content for multiple backgrounds and interview types?