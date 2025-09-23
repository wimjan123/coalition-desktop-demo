# Enhance Confrontational Interview System

## Why

The current character creation interview system, while functional, lacks the intensity and responsiveness of real political interviews. Players want a more challenging and dynamic experience that:

- Features confrontational questioning that tests their political resolve
- Adapts based on their background and previous answers
- Offers more diverse and controversial starting scenarios beyond "new party leader"
- Creates meaningful gameplay consequences for different character origins

This enhancement would transform character creation from a friendly policy discussion into a realistic political gauntlet that sets the stage for the entire campaign.

## What Changes

**NEW: Starting Scenario Selection**
- Pre-character creation step to choose political entry context
- 6 different scenarios: New Party Founder, Party Rehabilitator, Scandal Survivor, Emergency Replacement, Coalition Defector, Hostile Takeover
- Each scenario affects starting conditions, interview tone, and gameplay mechanics

**ENHANCED: Character Backgrounds**
- Add 6 controversial background options with clear risk/reward mechanics
- Party Rehabilitator (taking over racist/extremist party), Scandal Survivor, Corporate Whistleblower, Failed Entrepreneur, Controversial Academic, Reform Extremist
- Each background shows upfront gameplay implications (trust penalties, special opportunities)

**ENHANCED: Interview System**
- **BREAKING**: Replace static 7-question format with adaptive questioning engine
- Multiple interviewer personalities (hostile investigative, sympathetic, neutral professional)
- Questions branch based on background choice and previous answers
- Confrontational follow-ups that challenge inconsistencies and controversial positions
- Player response options for handling hostility (deflect, attack back, stay calm, etc.)

**NEW: Enhanced Game Integration**
- Starting scenario affects initial approval ratings and coalition opportunities
- Interview performance influences demographic group relationships
- Controversial backgrounds unlock special campaign actions and unique events
- Media handling skill influenced by confrontation responses

## Impact

- **Affected specs**: Will create new `character-creation` and `interview-system` capabilities
- **Affected code**: Major enhancement to `CharacterCreation.svelte` and `MediaInterview.svelte`
- **Gameplay**: More challenging and diverse starting conditions with long-term consequences
- **Replayability**: 6 starting scenarios × 14 backgrounds × multiple interview paths = high replay value
- **Educational value**: More realistic simulation of political pressure and media scrutiny