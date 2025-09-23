# Interview System Capability

## ADDED Requirements

### Requirement: Adaptive Interview Tone
The system SHALL adjust interviewer personality and question tone based on the selected starting scenario and character background.

#### Scenario: Hostile interview mode
- **WHEN** player has selected controversial scenario or background
- **THEN** interviewer uses aggressive questioning, interrupts responses, and challenges positions confrontationally

#### Scenario: Skeptical interview mode
- **WHEN** player has moderate controversy level
- **THEN** interviewer asks probing follow-up questions and expresses doubt about player responses

#### Scenario: Professional interview mode
- **WHEN** player has conventional starting conditions
- **THEN** interviewer maintains current professional tone with substantive policy questions

### Requirement: Dynamic Question Branching
The system SHALL generate follow-up questions based on player's previous responses and background.

#### Scenario: Consistency challenge
- **WHEN** player gives contradictory responses on related issues
- **THEN** interviewer immediately follows up with "But that contradicts what you just said about [topic]. Which position is correct?"

#### Scenario: Toeslagenaffaire Whistleblower probing
- **WHEN** player has "Toeslagenaffaire Whistleblower" background
- **THEN** interviewer asks "You exposed government racism, but some say you destroyed families' faith in the system. Was the cure worse than the disease?"

#### Scenario: Shell Executive confrontation
- **WHEN** player has "Shell/Unilever Executive" background
- **THEN** interviewer asks "You profited from fossil fuels while Dutch cities flood. How can you claim to care about climate when you helped cause it?"

#### Scenario: BBB Defector challenge
- **WHEN** player has "BBB Defector" background
- **THEN** interviewer asks "You abandoned the farmers who trusted you. If you'll betray your own people, what makes you think voters can trust you?"

#### Scenario: Rutte Administration accountability
- **WHEN** player has "Rutte Administration Survivor" background
- **THEN** interviewer asks "You were part of the government that lied to Parliament about the toeslagenaffaire. How are you any different from the corruption you claim to oppose?"

#### Scenario: Position exploitation
- **WHEN** player gives extreme position on any issue
- **THEN** interviewer follows up with "So you're saying [extreme interpretation of position]. That seems quite radical, doesn't it?"

### Requirement: Confrontational Response Options
The system SHALL provide multiple response strategies for handling hostile questioning.

#### Scenario: Aggressive pushback option
- **WHEN** interviewer asks confrontational question
- **THEN** player can choose "That's a loaded question and you know it. Let me give you the real facts."

#### Scenario: Deflection option
- **WHEN** interviewer asks challenging question
- **THEN** player can choose "The real issue here is [pivot to different topic]."

#### Scenario: Direct engagement option
- **WHEN** interviewer asks hostile question
- **THEN** player can choose "You're absolutely right to ask that tough question. Here's my honest answer."

#### Scenario: Defensive option
- **WHEN** interviewer attacks player character
- **THEN** player can choose "I understand your skepticism, but if you look at my record..."

### Requirement: Response Tone Tracking
The system SHALL track player's response style throughout the interview and apply consequences.

#### Scenario: Aggressive response pattern
- **WHEN** player chooses mostly aggressive responses
- **THEN** system increases player's "Combative" rating and affects starting relationship with establishment media

#### Scenario: Evasive response pattern
- **WHEN** player chooses mostly deflection responses
- **THEN** system increases player's "Politician" rating and affects starting trustworthiness with voters

#### Scenario: Direct response pattern
- **WHEN** player chooses mostly direct engagement responses
- **THEN** system increases player's "Authentic" rating and affects starting relationship with grassroots supporters

### Requirement: Interview Performance Consequences
The system SHALL apply interview results to starting game conditions beyond political positions.

#### Scenario: Poor interview performance
- **WHEN** player handles confrontation badly (defensive + contradictory responses)
- **THEN** system applies -10 starting approval rating and "Shaky Start" campaign event

#### Scenario: Strong interview performance
- **WHEN** player handles confrontation well (consistent + confident responses)
- **THEN** system applies +5 starting approval rating and "Strong Debut" campaign event

#### Scenario: Media relationship formation
- **WHEN** interview concludes
- **THEN** system sets initial media relationship score based on how player interacted with interviewer hostility

### Requirement: Enhanced Question Content
The system SHALL include confrontational questions based on real Dutch political controversies that test player resolve and consistency.

#### Scenario: Nitrogen crisis flip-flop trap
- **WHEN** player supports both environmental protection and farmer interests
- **THEN** interviewer asks "You say you support farmers AND the environment. But scientists say livestock must be cut by 30%. Which farmers will you force to close their businesses?"

#### Scenario: Immigration extremism bait
- **WHEN** player takes moderate immigration stance
- **THEN** interviewer asks "Ter Apel is overcrowded again with asylum seekers sleeping outside. Your 'moderate' approach clearly isn't working. Time for mass deportations?"

#### Scenario: Toeslagenaffaire personal attack
- **WHEN** player has government background
- **THEN** interviewer asks "26,000 families destroyed by institutional racism while you collected your government salary. Do you sleep well at night knowing you were part of that system?"

#### Scenario: Eva Jinek-style gotcha sequence
- **WHEN** player shows pattern of evasion on housing crisis
- **THEN** interviewer escalates: "Young Dutch people can't afford homes." → "Will you support rent controls, yes or no?" → "That's not an answer. Yes or no?" → "Why won't you give a straight answer about rent controls?"