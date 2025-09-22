# Campaign Headquarters Dashboard Design Specification

## Current State Analysis

### Problems Identified:
- ❌ **Spreadsheet-like layout**: Data tables and metrics feel administrative
- ❌ **No urgency or immersion**: Static information without time pressure
- ❌ **Assistant perspective**: Player feels like campaign manager, not politician
- ❌ **No narrative context**: Raw numbers without strategic meaning
- ❌ **Missing advisor interactions**: No conflicting perspectives or guidance

### Current Structure (CampaignDashboard.svelte):
- **Header**: Party name, leader info, key metrics (polling, days, budget)
- **Left Panel**: Action buttons, demographic support, regional support  
- **Right Panel**: Timeline/next day button, campaign videos list
- **Overlays**: Video creator, regional campaign interfaces

### Current Functionality:
- Create campaign videos (working)
- Regional campaigns (working)
- Day advancement (working)
- Demographics/regional breakdowns (working)
- Auto-save functionality (working)

## New Design Vision: Political Command Center

### Experience Goals:
- ✅ **Politician in headquarters**: Player feels like party leader making strategic decisions
- ✅ **Advisor briefings**: Information presented as staff recommendations
- ✅ **Time-sensitive urgency**: Breaking news, deadlines, crisis management
- ✅ **Narrative-driven**: Data wrapped in strategic context and consequences
- ✅ **Dynamic adaptation**: Interface changes based on campaign moment (strategy/crisis/war room)

## Design Patterns From Research

### White House Situation Room Principles:
- **Command & Control Center**: 24/7 operations suite with real-time intelligence
- **Modular Design**: Easily reconfigurable for different situations
- **Multiple Data Sources**: Consolidated intelligence from various channels
- **Instant Access**: Critical information available at-a-glance
- **Secure Communications**: Controlled information flow

### Political War Room Best Practices:
- **Real-time Monitoring**: News, social media, opponent tracking
- **Analytics Dashboard**: Voter data, polling insights, engagement metrics
- **Strategic Coordination**: Unified view of campaign operations
- **Response Capabilities**: Quick reaction to attacks and opportunities
- **Resource Allocation**: Data-driven decisions on messaging and outreach

## Interface Architecture

### Three Dynamic Modes:

#### 1. **STRATEGIC MODE** (Default - Planning & Analysis)
- **Ambiance**: Professional conference room, maps on walls
- **Information Style**: Advisor briefing cards with recommendations
- **Interactions**: Strategic decisions with trade-off previews
- **Tone**: Collaborative planning, forward-looking

#### 2. **CRISIS MODE** (Triggered by breaking news/urgent events)
- **Ambiance**: Red alert indicators, urgent notifications
- **Information Style**: Crisis briefings with immediate options
- **Interactions**: Time-pressured decisions with countdown timers
- **Tone**: High-stakes, immediate response required

#### 3. **WAR ROOM MODE** (Final weeks of campaign)
- **Ambiance**: Intense, multiple screens, activity boards
- **Information Style**: Real-time updates, competitive intelligence
- **Interactions**: Rapid-fire tactical decisions
- **Tone**: All-hands-on-deck, election countdown

### Component Redesign:

#### Header → **Situation Board**
- **Current**: Simple metrics display
- **New**: Dynamic situation overview with alert indicators
- **Elements**: 
  - Live clock with days/hours to election
  - Threat level indicator (news sentiment)
  - Recent activity feed (advisor notifications)
  - Campaign mode indicator (Strategic/Crisis/War Room)

#### Left Panel → **Advisor Briefings**
- **Current**: Action buttons + demographic charts
- **New**: Interactive advisor cards with personalities
- **Elements**:
  - **Communications Director**: "Media coverage is trending negative. We need a response video."
  - **Polling Director**: "Support dropped 2% in Amsterdam. Regional campaign recommended."
  - **Strategy Director**: "Budget allocation needs review. See breakdown."
  - **Press Secretary**: "Opposition attack incoming. Prepare counter-narrative."

#### Right Panel → **Intelligence Feed**
- **Current**: Timeline + video list  
- **New**: Real-time intelligence and opportunities
- **Elements**:
  - Breaking news alerts requiring responses
  - Opponent activity monitoring
  - Opportunity windows (events, endorsements)
  - Historical decision context ("Similar to 2017 housing crisis")

#### Bottom Bar → **Action Command Center**
- **Current**: Next day button only
- **New**: Context-aware action tray
- **Elements**:
  - Primary action button (changes based on urgency)
  - Quick access to campaign tools
  - Resource management shortcuts
  - "End Day" with preview of consequences

## Immersive Elements

### Advisor Personalities:
- **Maria (Communications)**: Direct, media-savvy, warns about messaging risks
- **Hans (Strategy)**: Analytical, data-driven, provides historical context  
- **Elena (Polling)**: Numbers-focused, demographic expert, regional insights
- **Joris (Press)**: Political veteran, opposition intelligence, defensive tactics

### Breaking News System:
- **Interruption Overlays**: "BREAKING: Coalition partner threatens to leave"
- **Response Timers**: "Media wants statement in 2 hours"
- **Historical Context**: "Last party that ignored this issue lost 15%"
- **Advisor Reactions**: Different perspectives on same crisis

### Consequence Previews:
- **Decision Shadows**: Hover over actions to see advisor warnings
- **Risk Indicators**: Red/yellow/green risk assessment for major decisions
- **Historical Parallels**: "When VVD did this in 2019, they lost rural support"

## Technical Implementation

### Data Transformation:
- **Current**: Raw numbers (15.2% support)
- **New**: Narrative context ("Strong support in Amsterdam, but declining in suburbs")

### State Management:
- **Campaign Mode**: Strategic/Crisis/War Room (affects entire UI)
- **Advisor Notifications**: Queue of briefings requiring attention
- **News Cycle**: External events that demand responses
- **Time Pressure**: Countdown timers for urgent decisions

### Animation & Transitions:
- **Mode Switching**: Smooth transitions between Strategic/Crisis/War Room
- **Alert System**: Pulsing indicators, sliding notifications
- **Advisor Interactions**: Cards that expand/contract with recommendations
- **Data Updates**: Live updating numbers with change indicators

## Visual Identity

### Color System:
- **Strategic Mode**: Professional blues/grays, calm authority
- **Crisis Mode**: Urgent reds/oranges, high alert
- **War Room Mode**: Intense whites/blacks, competitive focus

### Typography:
- **Headlines**: Bold, authoritative, clear hierarchy
- **Advisor Text**: Conversational, human-readable
- **Data**: Clean, professional, easy to scan

### Layout:
- **Grid System**: Flexible cards that reorganize by mode
- **Responsive**: Desktop-first but works on all screens
- **Information Density**: High but organized, not overwhelming

This design transforms the administrative dashboard into an immersive political command center where players experience the pressure and excitement of leading a real political campaign.