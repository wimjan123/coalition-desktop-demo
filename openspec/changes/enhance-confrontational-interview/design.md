# Enhanced Confrontational Interview System Design

## Context

The current interview system uses a static 7-question format with professional tone. Users want more challenging, adaptive interviews with controversial starting scenarios that affect gameplay. This requires significant architectural changes to support dynamic questioning, response tracking, and long-term consequence systems.

## Goals / Non-Goals

**Goals:**
- Create realistic, confrontational political interview experience
- Support 6 different starting scenarios with unique gameplay implications
- Implement adaptive questioning that responds to player choices
- Balance controversial backgrounds (challenging but viable paths)
- Maintain compatibility with existing game mechanics

**Non-Goals:**
- Complete overhaul of existing game balance systems
- Real-time AI-generated questions (use pre-written branching logic)
- Multiple interviewer characters (single adaptive interviewer personality)

## Decisions

### Starting Scenario Architecture
- **Decision**: Add scenario selection as Step 0 before existing character creation
- **Rationale**: Keeps existing flow intact while enabling scenario-specific customization
- **Implementation**: New `StartingScenario` type with gameplay modifiers

### Controversial Background Balance
- **Decision**: Each controversial background based on real Dutch political scandals with clear trade-offs (penalty + unique opportunity)
- **Rationale**: Must be challenging but not punitive - players should have viable path to success reflecting real Dutch political recovery patterns
- **Examples**:
  - Toeslagenaffaire Whistleblower: -20 establishment trust but +40% anti-discrimination appeal (authentic to Dutch institutional racism debates)
  - Shell Executive: Corporate donation restrictions but +25% business support (reflects real dividend tax controversy)

### Interview Response System
- **Decision**: Track response categories (aggressive, defensive, evasive, confrontational) rather than specific answers
- **Rationale**: Enables consistent personality profiling across different question branches
- **Implementation**: Response scoring system that influences starting reputation and media relations

### Question Branching Logic
- **Decision**: Pre-written question trees based on real Dutch political controversies with conditional triggers, not procedural generation
- **Rationale**: Ensures quality and Dutch political authenticity while maintaining development feasibility
- **Structure**:
  - Base questions referencing real Dutch crises (nitrogen, housing, Ter Apel)
  - Background-specific follow-ups using authentic Dutch political scandals
  - Eva Jinek/Jeroen Pauw-style persistent questioning patterns

## Technical Architecture

### New Data Structures
```typescript
interface StartingScenario {
  id: string;
  name: string;
  description: string;
  interviewerTone: 'hostile' | 'skeptical' | 'neutral' | 'sympathetic';
  gameplayModifiers: {
    approvalRating: number;
    mediaRelations: number;
    coalitionTrust: number;
    specialActions: string[];
  };
}

interface ControversialBackground extends CharacterBackground {
  riskLevel: 'medium' | 'high' | 'extreme';
  startingPenalties: GameModifiers;
  uniqueOpportunities: CampaignAction[];
  interviewChallenges: string[];
}

interface InterviewResponse {
  text: string;
  position: number;
  priority: number;
  tone: 'aggressive' | 'defensive' | 'evasive' | 'confrontational' | 'diplomatic';
  consistency: boolean; // Does this contradict previous answers?
}
```

### Component Structure
```
ScenarioSelection.svelte (NEW)
└── CharacterCreation.svelte (ENHANCED)
    └── MediaInterview.svelte (MAJOR REWRITE)
        ├── InterviewIntro (scenario-aware)
        ├── AdaptiveQuestionEngine (NEW)
        ├── ConsistencyTracker (NEW)
        └── ResponsePersonalityProfiler (NEW)
```

### Question Branching System
- **Base Questions**: 5 core political issues (universal)
- **Scenario Hooks**: 2-3 questions specific to starting scenario
- **Background Challenges**: 1-2 questions targeting controversial background
- **Consistency Traps**: Follow-ups that test for contradictions
- **Confrontation Escalation**: Aggressive follow-ups based on player response tone

## Risks / Trade-offs

### Complexity Risk
- **Risk**: Branching question system becomes too complex to maintain
- **Mitigation**: Start with 3 scenarios and 3 controversial backgrounds, expand iteratively
- **Fallback**: Can revert to enhanced static questions if branching proves unwieldy

### Balance Risk
- **Risk**: Controversial backgrounds become either too punitive or too powerful
- **Mitigation**: Extensive playtesting with clear success metrics for each path
- **Adjustment**: Gameplay modifiers can be tuned without changing core mechanics

### Development Scope Risk
- **Risk**: Full implementation requires significant time investment
- **Mitigation**: Phase implementation - scenarios first, then branching, then advanced features
- **MVP**: Can ship scenario selection + enhanced backgrounds without full question branching

## Migration Plan

### Phase 1: Starting Scenarios (Week 1)
1. Implement `StartingScenario` data structure
2. Create `ScenarioSelection.svelte` component
3. Add scenario-aware interview intro
4. Basic gameplay modifier application

### Phase 2: Controversial Backgrounds (Week 2)
1. Extend `CHARACTER_BACKGROUNDS` with controversial options
2. Implement risk/reward display in background selection
3. Add special campaign actions for controversial backgrounds
4. Test balance with different scenario combinations

### Phase 3: Adaptive Interview Engine (Week 3)
1. Rewrite `MediaInterview.svelte` with branching logic
2. Implement response tone tracking
3. Add consistency checking and confrontational follow-ups
4. Create interviewer personality system

### Phase 4: Integration & Polish (Week 4)
1. Connect interview results to game mechanics
2. Add demographic reputation effects
3. Implement special events for controversial backgrounds
4. Balance testing and adjustment

## Open Questions

1. **Interviewer Voice**: Should we create distinct interviewer personalities or one adaptive personality?
2. **Contradiction Penalties**: How harshly should we punish inconsistent answers during interview?
3. **Recovery Mechanics**: Should controversial backgrounds have redemption arcs built into the campaign?
4. **Demographic Targeting**: Which specific voter groups should be affected by different controversial backgrounds?

## Success Metrics

- **Engagement**: Time spent in character creation increases
- **Replayability**: Players create multiple characters with different scenarios/backgrounds
- **Challenge**: Controversial backgrounds have 60-80% success rate (challenging but viable)
- **Immersion**: Player feedback indicates more realistic political experience