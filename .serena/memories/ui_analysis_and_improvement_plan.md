# COALITION UI Analysis & Improvement Plan

## Current UI Issues Identified

### 1. Character Creation Problems
**Current State**: Uses abstract sliders for policy positions
- **Issue**: Feels disconnected from political reality
- **User Feedback**: "Character traits don't really make sense with the stats sometimes"
- **Problem**: "The sliders for policy choices feel overwhelming"
- **Solution Needed**: Media interview-based character creation

### 2. Campaign Dashboard Issues
**Current State**: Administrative interface with sections for demographics, videos, regions
- **Issue**: "Campaign manager is a bit overwhelming and not really game-like"
- **Core Problem**: "Player must be politician and not a assistant"
- **Visual Issue**: "UI feels out of style"
- **Technical Issue**: "Campaign manager is always fullscreen when refreshing"

### 3. Missing Consequence System
**Research Finding**: Political flip-flopping has real electoral consequences
- **Current Gap**: No system for tracking position changes
- **Needed**: "Public should criticize you for reverting/flipping choices"
- **Impact**: "The choices should make your party profile, instead of a simple slider"

### 4. Difficulty & Realism
**Current Issue**: "It feels too easy. It should be more realistic"
- **Need**: More challenging, realistic campaign mechanics
- **User Role**: Must feel like actual politician, not campaign manager

## Research-Based Solutions

### Media Interview Character Creation
**Based on**: Political Machine 2024, Culpa Innata interview mechanics, dialogue tree research

**Design Concept**: "Meet the Press" style interview where:
1. Player sits for political talk show interview
2. Journalist asks about key issues (economy, immigration, climate, etc.)
3. Dialogue trees reveal positions naturally through conversation
4. Response style/tone determines personality traits
5. Answers create party profile and political positions
6. Establishes baseline for future flip-flop tracking

**Technical Implementation**:
- Replace slider-based Step 4 with interview scenario
- Create dialogue tree system for natural position revelation
- Map interview responses to political spectrum positions
- Generate personality stats from response patterns
- Create initial "political record" for consequence tracking

### Immersive Politician Interface
**Current Problem**: Player feels like campaign assistant, not politician

**Solution Design**:
1. **Daily Schedule View**: Show politician's daily agenda
2. **Briefing Reports**: Staff presents options, player makes decisions
3. **Media Requests**: Handle interview invitations, press conferences
4. **Personal Advisors**: Conflicting advice from different staff members
5. **Consequence Tracking**: Media reports on position changes
6. **Approval Ratings**: Real-time feedback on decisions

### Position Change Consequence System
**Based on**: Research showing flip-flopping reduces voter trust

**Mechanics**:
1. **Position History**: Track all policy statements over time
2. **Media Memory**: Journalists reference past positions in interviews
3. **Voter Trust**: Consistency affects credibility ratings
4. **Opposition Research**: Rivals highlight contradictions
5. **Damage Control**: Require explanation/justification for changes

## Implementation Priority

### Phase 1: Core Experience (Immediate)
1. **Interview-based Character Creation**
   - Replace policy sliders with media interview
   - Create dialogue tree system
   - Map responses to positions/traits

2. **Fix Fullscreen Persistence**
   - Campaign dashboard state management
   - Proper window/overlay handling

### Phase 2: Immersion (Next)
1. **Politician-Centric Dashboard**
   - Redesign as daily briefing interface
   - Add advisor recommendations
   - Show media coverage of player actions

2. **Consequence System**
   - Position tracking database
   - Media reaction to flip-flops
   - Voter trust metrics

### Phase 3: Polish (Future)
1. **Unified Design System**
   - Consistent visual style across components
   - Professional political simulation aesthetic
   - Desktop metaphor refinement

## Technical Architecture Changes

### New Components Needed
- `MediaInterview.svelte` - Replace policy sliders
- `PoliticianBriefing.svelte` - Replace campaign dashboard sections
- `PositionTracker.svelte` - Track and display position changes
- `MediaCoverage.svelte` - Show press reactions
- `DialogueTree.svelte` - Reusable interview system

### State Management Updates
- Add position history tracking to game state
- Create media reaction system
- Implement voter trust/credibility metrics
- Add consequence tracking for all political decisions

This plan transforms COALITION from an administrative campaign manager into an immersive political simulation where players truly feel like politicians facing real consequences for their choices.