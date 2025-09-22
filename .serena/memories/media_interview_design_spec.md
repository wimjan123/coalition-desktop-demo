# Media Interview Character Creation - Design Specification

## Overview
Replace the current slider-based policy selection (Step 4) with an immersive "Meet the Press" style political interview that naturally reveals character positions and traits through dialogue choices.

## User Experience Flow

### Setup Phase
1. **Transition from Step 3**: After selecting traits, player sees:
   - "You've been invited for your first major political interview"
   - "Your responses will establish your political record"
   - Warning: "The media will remember your positions"

2. **Interview Setting**: 
   - Split-screen: Player on left, Journalist on right
   - "LIVE" indicator in corner
   - Viewer count ticker (building pressure)
   - Time pressure indicator for responses

### Interview Structure

#### Opening Questions (Establishes Baseline)
**Journalist**: "Thank you for joining us. As a new political voice, where do you see yourself on the political spectrum?"

**Response Options** (sets overall ideology):
- A) "I believe in progressive change and social justice" → Left-leaning baseline
- B) "I'm focused on practical solutions that work for everyone" → Centrist baseline  
- C) "I value traditional principles and economic freedom" → Right-leaning baseline
- D) "I don't fit into simple categories - each issue deserves its own approach" → Independent baseline

#### Core Issue Deep-Dives (6-8 Questions)

**Economic Policy**:
Journalist: "The Netherlands faces rising inflation. What's your approach?"

Options:
- A) "Government must intervene to protect workers and families" (-60 economic position)
- B) "We need targeted support while maintaining fiscal responsibility" (-20 position)
- C) "Market forces will correct this - government intervention often makes it worse" (+40 position)
- D) "This requires a completely new economic model" (creates "Innovative" trait)

**Immigration**:
Journalist: "What's your stance on asylum seeker quotas?"

Options with follow-ups:
- A) "We have a moral obligation to help those in need" → Follow-up: "Even if it strains local resources?"
- B) "We need managed immigration that benefits the Netherlands" → Follow-up: "How do you define 'beneficial'?"
- C) "Current levels are unsustainable for our communities" → Follow-up: "What would you reduce first?"

#### Pressure Testing (Reveals Character Traits)

**Journalist Challenges**:
- "Your opponent calls that position 'unrealistic' - your response?"
- "Critics say you're avoiding the hard questions..."
- "That contradicts what you said about economic policy..."

**Response Styles** (determines personality traits):
- **Aggressive**: "That's completely wrong and here's why..." → +Charisma, -Integrity
- **Diplomatic**: "I understand their concern, but let me clarify..." → +Negotiation, +Integrity
- **Passionate**: "This is about real people and real lives..." → +Charisma, -Negotiation
- **Data-Driven**: "The evidence clearly shows..." → +Integrity, -Charisma

#### Gotcha Moments (Establishes Stakes)

**Scenario**: Journalist plays video of player's earlier statement
"Earlier you mentioned supporting business growth, but your economic plan increases corporate taxes. Which is it?"

**Options**:
- A) Clarify/Explain → Establishes "Thoughtful" trait
- B) Deflect/Pivot → Creates "Political" trait  
- C) Admit evolution → Sets up future flip-flop tracking
- D) Double down → Creates "Stubborn" trait

## Technical Implementation

### Data Structure
```typescript
interface InterviewResponse {
  questionId: string;
  selectedOption: string;
  timestamp: number;
  positionImpact: { [issueId: string]: number };
  traitImpact: { [trait: string]: number };
  publicRecord: string; // What the media will remember
}

interface InterviewSession {
  responses: InterviewResponse[];
  finalPositions: { [issueId: string]: number };
  establishedTraits: string[];
  mediaPerception: number; // How well the interview went
  publicRecord: string[]; // Quotes that can be used against player later
}
```

### Position Mapping System
- Each response contributes to multiple issue positions
- Responses can affect multiple traits simultaneously
- Consistency bonus: aligned responses strengthen positions
- Contradiction penalty: conflicting responses create "Uncertain" areas

### Visual Design

#### Interview Set
```css
.interview-container {
  display: grid;
  grid-template-columns: 1fr 1px 1fr;
  height: 100vh;
  background: linear-gradient(to bottom, #1a1a2e, #16213e);
}

.politician-side {
  /* Player's view with subtle camera angle */
  background: radial-gradient(circle at 60% 40%, rgba(59, 130, 246, 0.1), transparent);
}

.journalist-side {
  /* Interviewer's side with professional lighting */
  background: radial-gradient(circle at 40% 40%, rgba(239, 68, 68, 0.1), transparent);
}
```

#### Pressure Indicators
- **Live Viewer Count**: Increases tension
- **Time Pressure**: Response timer (but not punitive)
- **Journalist Reaction**: Subtle animations show approval/skepticism
- **Social Media Ticker**: Fake tweets responding to answers

### Response Mechanics

#### Time Pressure
- 15-20 second response window
- Timer creates urgency but doesn't force selection
- Quick responses = "Decisive" trait
- Careful consideration = "Thoughtful" trait

#### Dialogue Tree Branching
- Initial response leads to follow-up questions
- Journalist adapts based on previous answers
- Contradictions get called out immediately
- Evasive answers prompt "That's not really an answer..." pushback

#### Consequence Preview
- Subtle UI hints show position changes as player hovers options
- "This may affect your [Economic] position" tooltip
- No exact numbers - maintains immersion

### Integration with Existing System

#### Replacing Current Step 4
- Remove all policy sliders
- Keep character name, age, background, traits from Steps 1-3
- Interview becomes new Step 4
- Results feed into same game state structure

#### Position Establishment
- Map interview responses to same policy positions used elsewhere
- Create initial "political record" for future flip-flop tracking
- Establish media relationships (friendly/hostile journalists)

#### Trait Refinement
- Interview can modify traits selected in Step 3
- Adds interview-specific traits: "Media Savvy", "Under Pressure", etc.
- Creates personality profile that affects future interactions

## Outcome & Transition

### Interview Conclusion
**Journalist**: "Thank you for joining us. Viewers now have a clear picture of your political vision."

**Results Screen**:
- "Your Political Profile" with established positions
- "Media Assessment" showing interview performance
- "Public Perception" initial ratings
- Warning: "Remember - the press never forgets"

### Future Consequences Setup
- Established positions become baseline for flip-flop detection
- Interview quotes stored for future opposition research
- Journalist relationship affects future media availability
- Sets expectation that consistency matters

This system transforms character creation from administrative form-filling into an engaging political simulation where players immediately feel the stakes and consequences of their choices.