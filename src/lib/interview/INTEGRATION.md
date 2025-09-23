# Dynamic Interview System - Integration Guide

## Overview

The new Dynamic Interview System replaces the static question database with a modular, reactive interview engine that provides personalized, background-specific question arcs with dynamic interviewer behavior.

## Integration Points

### 1. Character Creation Flow

**Component**: `src/lib/components/CharacterCreation.svelte`

The interview system integrates after background selection:

```typescript
// After background selection
import { InterviewEngine } from '../interview/index.js';

// Pass selected background and scenario to interview
const interviewConfig: InterviewConfig = {
  type: 'character-creation',
  backgroundId: selectedBackground.id,
  scenarioId: selectedScenario.id,
  difficulty: 'auto', // Auto-determines based on background
  interviewerType: selectedScenario.interviewerTone === 'confrontational' ? 'confrontational' : 'professional'
};

// Initialize and conduct interview
const engine = new InterviewEngine(interviewConfig);
```

### 2. Game State Integration

**Files**: `src/lib/stores/gameStore.ts`, `src/lib/types/game.ts`

The interview results need to be integrated into the game state:

```typescript
// Interview completion event handler
function handleInterviewComplete(event: CustomEvent) {
  const { result, performance, aftermath, gameplayEffects } = event.detail;

  // Apply interview results to game state
  gameState.update(state => ({
    ...state,
    player: {
      ...state.player,
      positions: result.positions, // Political positions from interview
      approvalRatings: applyInterviewEffects(state.player.approvalRatings, aftermath.approvalRatingImpact),
      backgroundData: {
        ...state.player.backgroundData,
        interviewPerformance: performance
      }
    },
    // Update news coverage and social media
    newsSystem: {
      ...state.newsSystem,
      headlines: [...state.newsSystem.headlines, ...aftermath.headlines],
      socialMediaPosts: [...state.newsSystem.socialMediaPosts, ...aftermath.socialMediaReactions]
    },
    // Apply gameplay effects
    coalitionRelationships: applyPartnerReactions(state.coalitionRelationships, aftermath.coalitionPartnerReactions)
  }));
}
```

### 3. Political Position System

**Integration**: The interview engine generates `PoliticalPosition[]` that should be merged with the existing political position system.

```typescript
// src/lib/types/game.ts - Update interface
export interface InterviewPosition extends PoliticalPosition {
  source: 'interview-response';
  questionId: string;
  confidence: number; // How confident the player seemed
}

// Merge interview positions with existing system
function mergeInterviewPositions(
  existingPositions: PoliticalPosition[],
  interviewPositions: InterviewPosition[]
): PoliticalPosition[] {
  // Interview positions take precedence as they're more recent
  // and based on actual player responses
  return interviewPositions.map(pos => ({
    issueId: pos.issueId,
    position: pos.position,
    priority: pos.priority,
    confidence: pos.confidence
  }));
}
```

### 4. News and Media System

**Integration**: The aftermath system generates news coverage and social media reactions that should feed into the existing news system.

```typescript
// src/lib/systems/newsSystem.ts
export class NewsSystem {
  processInterviewAftermath(aftermath: InterviewAftermath) {
    // Add generated headlines to news feed
    this.addHeadlines(aftermath.headlines);

    // Process social media reactions
    this.addSocialMediaPosts(aftermath.socialMediaReactions);

    // Handle viral moments
    if (aftermath.viralMoments && aftermath.viralMoments.length > 0) {
      this.processViralMoments(aftermath.viralMoments);
    }

    // Update coalition partner relationships
    this.updatePartnerRelationships(aftermath.coalitionPartnerReactions);
  }
}
```

### 5. Approval Rating System

**Integration**: Interview performance directly affects starting approval ratings.

```typescript
// src/lib/systems/approvalSystem.ts
export function applyInterviewEffects(
  currentRatings: ApprovalRatings,
  changes: ApprovalRatingChange[]
): ApprovalRatings {
  const updatedRatings = { ...currentRatings };

  changes.forEach(change => {
    if (updatedRatings[change.demographic]) {
      updatedRatings[change.demographic] = Math.max(0, Math.min(100,
        updatedRatings[change.demographic] + change.change
      ));
    }
  });

  return updatedRatings;
}
```

## Data Flow

### 1. Interview Initialization
```
CharacterCreation → InterviewConfig → InterviewEngine → QuestionArcFactory
```

### 2. Interview Execution
```
PlayerResponse → InterviewerPersonality → ConversationFlow → NextAction
                ↓
         PerformanceAnalyzer
```

### 3. Interview Completion
```
InterviewEngine → AftermathGenerator → InterviewResult → GameState Update
```

## Event System

### Custom Events

The interview system emits events that other systems can listen to:

```typescript
// MediaInterview.svelte dispatches
dispatch('complete', {
  result: InterviewResult,
  positions: PoliticalPosition[],
  performance: InterviewPerformance,
  aftermath: InterviewAftermath,
  gameplayEffects: GameplayEffect[]
});

// Listen in parent component
<MediaInterview
  {selectedScenario}
  {selectedBackground}
  on:complete={handleInterviewComplete}
/>
```

## Extension Points

### 1. New Interview Types

Add new interview types for campaign events:

```typescript
// Add to InterviewType
export type InterviewType =
  | 'character-creation'
  | 'scandal-response'    // New: Handle scandals
  | 'debate-prep'         // New: Debate preparation
  | 'crisis-management'   // New: Crisis response
  | 'election-night';     // New: Election interviews
```

### 2. Custom Question Arcs

Add new backgrounds by extending `QuestionArcFactory`:

```typescript
// In QuestionArcFactory.ts
this.arcDefinitions.set('new-background-id', {
  backgroundId: 'new-background-id',
  difficulty: 'medium',
  interviewerApproach: 'investigative',
  questionCount: 6,
  arc: [/* DynamicQuestion[] */]
});
```

### 3. Interviewer Personalities

Extend interviewer behavior:

```typescript
// New interviewer types
export type InterviewerType =
  | 'professional'
  | 'confrontational'
  | 'investigative'
  | 'friendly'      // New: Supportive interviewer
  | 'celebrity';    // New: Entertainment focus
```

### 4. Performance Metrics

Add new performance dimensions:

```typescript
// Extend PerformanceMetrics
export interface PerformanceMetrics {
  // Existing metrics...
  charisma: number;        // New: Personal appeal
  expertise: number;       // New: Subject knowledge
  relatability: number;    // New: Connection with voters
}
```

## Testing Integration

### Unit Tests

Test individual components:

```typescript
// interview/InterviewEngine.test.ts
describe('InterviewEngine', () => {
  test('processes responses correctly', () => {
    const engine = new InterviewEngine(testConfig);
    const action = await engine.processResponse("Test response", "confident");
    expect(action.type).toBe('question');
  });
});
```

### Integration Tests

Test full interview flow:

```typescript
// integration/interview-flow.test.ts
describe('Interview Flow', () => {
  test('complete interview updates game state', () => {
    // Test full interview → game state integration
  });
});
```

### E2E Tests

Test user experience:

```typescript
// e2e/interview.spec.ts
test('user can complete interview', async ({ page }) => {
  await page.goto('/character-creation');
  await page.click('[data-testid="small-business-owner"]');
  await page.click('[data-testid="begin-interview"]');
  // ... complete interview flow
  await expect(page.locator('[data-testid="interview-complete"]')).toBeVisible();
});
```

## Performance Considerations

### 1. Question Arc Loading

Question arcs are loaded on-demand based on selected background:

```typescript
// Lazy loading in QuestionArcFactory
static create(backgroundId: string, difficulty: DifficultyLevel): QuestionArc {
  if (!this.arcDefinitions.has(backgroundId)) {
    // Load from external source if needed
    this.loadBackgroundArc(backgroundId);
  }
  // ...
}
```

### 2. Memory Management

The interview engine maintains conversation state efficiently:

```typescript
// Clean up when interview completes
onDestroy(() => {
  if (interviewEngine) {
    interviewEngine.cleanup?.();
  }
});
```

### 3. Response Caching

Common response patterns can be cached:

```typescript
// In PerformanceAnalyzer
private responseCache = new Map<string, AnalysisResult>();

analyzeResponse(response: PlayerResponse): void {
  const cacheKey = `${response.tone}-${response.wordCount}`;
  if (this.responseCache.has(cacheKey)) {
    // Use cached analysis
  }
  // ...
}
```

## Security Considerations

### 1. Input Validation

All user responses are validated:

```typescript
function validateResponse(text: string): boolean {
  // Prevent XSS and injection attacks
  return text.length <= 500 &&
         !text.includes('<script>') &&
         !text.includes('javascript:');
}
```

### 2. Content Security

Generated content is sanitized:

```typescript
// In AftermathGenerator
private sanitizeContent(content: string): string {
  return content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '');
}
```

## Monitoring and Analytics

### 1. Performance Metrics

Track interview completion rates:

```typescript
// Analytics integration
analytics.track('interview_started', {
  backgroundId,
  difficulty,
  timestamp: Date.now()
});

analytics.track('interview_completed', {
  backgroundId,
  duration,
  performance: overallScore,
  timestamp: Date.now()
});
```

### 2. A/B Testing

Test different question formulations:

```typescript
// Feature flag integration
const questionVariant = featureFlags.getVariant('question-phrasing');
const question = questionVariant === 'formal'
  ? formalQuestion
  : conversationalQuestion;
```

## Migration Notes

### From Old System

1. **Question Database**: Old static questions in `MediaInterview.svelte` are replaced by dynamic question arcs in `QuestionArcFactory`

2. **Response Processing**: Old simple tone detection is replaced by comprehensive performance analysis

3. **State Management**: Interview results now flow through proper TypeScript interfaces instead of loose objects

4. **UI Updates**: New reactive UI based on conversation state instead of static question progression

### Backward Compatibility

The new system maintains the same external interface:

```typescript
// Same props and events as old MediaInterview
export let selectedScenario: StartingScenario;
export let selectedBackground: CharacterBackground;

// Same completion event structure
dispatch('complete', { /* results */ });
```

This ensures existing integrations continue to work while providing enhanced functionality.