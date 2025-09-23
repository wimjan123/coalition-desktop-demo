# Implementation Tasks

## 1. Data Structure Foundation
- [x] 1.1 Create `StartingScenario` interface in `src/lib/types/game.ts`
- [x] 1.2 Extend `CharacterBackground` interface with risk/reward properties
- [x] 1.3 Add controversial backgrounds to `CHARACTER_BACKGROUNDS` array
- [x] 1.4 Create `InterviewResponse` interface with tone tracking
- [x] 1.5 Add interview state tracking to game store

## 2. Scenario Selection Component
- [x] 2.1 Create `ScenarioSelection.svelte` component
- [x] 2.2 Design scenario cards with risk/reward display
- [x] 2.3 Add scenario selection as Step 0 in character creation flow
- [x] 2.4 Implement scenario-aware styling and descriptions
- [x] 2.5 Add difficulty warning system for extreme combinations

## 3. Enhanced Background Selection
- [x] 3.1 Add controversial backgrounds to background selection UI
- [x] 3.2 Implement risk/reward display for each background
- [x] 3.3 Add background-specific gameplay modifier tooltips
- [x] 3.4 Create confirmation dialog for high-risk backgrounds
- [x] 3.5 Update background selection validation logic

## 4. Adaptive Interview Engine
- [x] 4.1 Rewrite `MediaInterview.svelte` with branching question system
- [x] 4.2 Implement interviewer personality system (hostile/skeptical/professional)
- [x] 4.3 Create question database with conditional triggers
- [x] 4.4 Add response tone detection and tracking
- [x] 4.5 Implement consistency checking across responses

## 5. Confrontational Question Content
- [x] 5.1 Write 15 base confrontational questions covering all political issues
- [x] 5.2 Create 20 background-specific challenge questions
- [x] 5.3 Write 10 scenario-specific probing questions
- [x] 5.4 Implement contradiction detection and follow-up questions
- [x] 5.5 Add aggressive response options for each question type

## 6. Response System Enhancement
- [x] 6.1 Create response option templates (aggressive, defensive, deflection, direct)
- [x] 6.2 Implement response tone scoring system
- [x] 6.3 Add visual feedback for response tone choices
- [x] 6.4 Create interview performance calculator
- [x] 6.5 Add consequence preview system for response choices

## 7. Game Integration
- [x] 7.1 Connect starting scenario to initial game state modifiers
- [x] 7.2 Apply controversial background penalties and bonuses
- [x] 7.3 Implement interview performance effects on approval ratings
- [x] 7.4 Add special campaign actions for controversial backgrounds
- [x] 7.5 Create demographic relationship effects from interview tone

## 8. UI/UX Polish
- [x] 8.1 Design confrontational interview visual style (more intense than current)
- [x] 8.2 Add interviewer emotion indicators (skeptical, aggressive, surprised)
- [x] 8.3 Implement response urgency system (time pressure for some questions)
- [ ] 8.4 Add interview tension music and sound effects
- [x] 8.5 Create post-interview summary with performance breakdown

## 9. Balance and Testing
- [x] 9.1 Test all controversial background + scenario combinations for viability
- [x] 9.2 Adjust starting modifier values based on playtesting
- [x] 9.3 Validate question branching logic for all paths
- [x] 9.4 Test interview performance consequences for realism
- [x] 9.5 Ensure controversial paths remain challenging but winnable

## 10. Integration Testing
- [x] 10.1 Test character creation flow with all new components
- [x] 10.2 Validate data flow from scenario selection through interview completion
- [x] 10.3 Test interview system compatibility with existing campaign mechanics
- [x] 10.4 Verify special campaign actions work correctly for controversial backgrounds
- [x] 10.5 Test edge cases and error handling for complex character combinations