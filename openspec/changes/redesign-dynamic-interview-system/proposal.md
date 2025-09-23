# Dynamic Interview System Redesign

## Why
The current interview system suffers from fundamental design issues that create a poor player experience:
- **Too many generic questions** (100+) that feel like a survey rather than a conversation
- **Static interviewer personality** that doesn't react dynamically to player responses
- **No personalization** based on character background or choices
- **Missing aftermath impact** - no news coverage or social media reactions
- **Linear, predictable flow** with no interruptions or follow-ups
- **No reusability** for campaign-stage interviews during gameplay

This redesign will transform interviews from boring questionnaires into dynamic, personalized conversations that feel alive and consequential.

## What Changes
- **BREAKING**: Complete architectural redesign of interview system
- **NEW**: Modular interview engine supporting multiple interview types and stages
- **NEW**: Background-specific question arcs (5-7 curated questions per background)
- **NEW**: Dynamic interviewer behavior with interruptions, mood changes, and memory
- **NEW**: Conversational flow with rapid-fire follow-ups and contextual responses
- **NEW**: Post-interview news impact system with dynamic headlines and social media
- **NEW**: Campaign-stage interview system for mid-game events
- **NEW**: Difficulty scaling based on background controversy level
- **ENHANCED**: Interview performance affects starting approval ratings and demographic relationships

## Impact
- Affected specs: `interview-system`, `character-creation`, `news-system`, `campaign-events`
- Affected code: Complete rewrite of `MediaInterview.svelte`, new interview engine modules
- **BREAKING**: Existing interview questions and flow will be replaced
- **NEW**: Modular architecture allows easy addition of new interview types
- **ENHANCED**: Character creation feels more personal and consequential

## Technical Architecture

### Modular Interview Engine
```typescript
// Core interview engine that supports multiple interview types
interface InterviewEngine {
  type: 'character-creation' | 'scandal-response' | 'debate-prep' | 'crisis-management';
  interviewer: InterviewerPersonality;
  questionArc: QuestionArc;
  aftermathSystem: AftermathGenerator;
}

// Background-specific question arcs
interface QuestionArc {
  backgroundId: string;
  difficulty: 'low' | 'medium' | 'high' | 'extreme';
  questions: DynamicQuestion[];
  triggers: ConversationTrigger[];
}

// Dynamic, reactive questions
interface DynamicQuestion {
  id: string;
  setup?: string; // Optional scene-setting
  question: string;
  followUpConditions: FollowUpRule[];
  interruptionTriggers: InterruptionRule[];
  responseOptions: ContextualResponse[];
}
```

### Background-Specific Design
Each character background gets a completely unique interview experience:
- **Controversial backgrounds** (Toeslagenaffaire whistleblower): 7 hard-hitting questions, aggressive interviewer
- **Professional backgrounds** (Financial analyst): 5 competency-focused questions, professional tone
- **Outsider backgrounds** (Small business owner): 6 accessibility questions, curious but fair tone

### Dynamic Interviewer Behavior
- **Mood Evolution**: Starts neutral, becomes skeptical/excited/frustrated based on responses
- **Memory System**: References previous answers ("But you just said...")
- **Interruption Engine**: Cuts off evasive answers with follow-ups
- **Emotional Reactions**: Visible surprise, frustration, or approval

### News Aftermath System
- **Dynamic Headlines**: Generated based on specific answers and performance
- **Social Media Simulation**: Twitter-style reactions from different demographic groups
- **Coalition Partner Responses**: Other party leaders comment on the interview
- **Approval Impact**: Interview performance directly affects starting ratings

## Implementation Phases

### Phase 1: Core Engine (Week 1)
- New modular interview architecture
- Dynamic interviewer personality system
- Basic conversation flow with interruptions

### Phase 2: Background Question Arcs (Week 2)
- Ultra-detailed question sets for each background
- Difficulty scaling and personalization
- Contextual response generation

### Phase 3: News Impact System (Week 3)
- Dynamic headline generation
- Social media reaction simulator
- Approval rating impact calculations

### Phase 4: Campaign Integration (Week 4)
- Mid-game interview system
- Crisis response interviews
- Debate preparation interviews

## Success Metrics
- **Engagement**: Players read questions instead of clicking through
- **Personalization**: Each background feels unique and authentic
- **Consequence**: Interview performance meaningfully affects gameplay
- **Replayability**: Players want to try different backgrounds for different experiences
- **Immersion**: Feels like real political journalism, not a survey