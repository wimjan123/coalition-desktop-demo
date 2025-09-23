# Interview System Specification

## ADDED Requirements

### Requirement: Modular Interview Engine
The system SHALL provide a modular interview engine that supports multiple interview types and contexts throughout the game.

#### Scenario: Character creation interview
- **WHEN** a player creates a new character with a specific background
- **THEN** the system SHALL load a background-specific question arc
- **AND** the interviewer personality SHALL adapt to the background's controversy level
- **AND** the interview SHALL contain 3-8 questions based on difficulty scaling

#### Scenario: Campaign-stage interview
- **WHEN** a scandal or crisis event occurs during campaign
- **THEN** the system SHALL trigger an appropriate interview scenario
- **AND** the interviewer SHALL reference the player's political history
- **AND** the interview SHALL affect current approval ratings and relationships

#### Scenario: Interview type selection
- **WHEN** the system needs to conduct an interview
- **THEN** it SHALL select from available types: character-creation, scandal-response, debate-prep, crisis-management
- **AND** each type SHALL have distinct question patterns and consequence systems

### Requirement: Background-Specific Question Arcs
The system SHALL provide curated question sets tailored to each character background rather than generic political questions.

#### Scenario: Controversial background interview
- **WHEN** a player selects a high-controversy background (e.g., Toeslagenaffaire whistleblower)
- **THEN** the system SHALL present 6-7 challenging questions specific to that controversy
- **AND** the interviewer SHALL adopt a confrontational tone
- **AND** questions SHALL reference specific details of the player's background

#### Scenario: Professional background interview
- **WHEN** a player selects a professional background (e.g., Financial analyst)
- **THEN** the system SHALL present 5 competency-focused questions
- **AND** the interviewer SHALL adopt a professional, evaluative tone
- **AND** questions SHALL test policy knowledge and leadership capability

#### Scenario: Low-risk background interview
- **WHEN** a player selects a low-controversy background (e.g., Small business owner)
- **THEN** the system SHALL present 4-5 accessibility-focused questions
- **AND** the interviewer SHALL adopt a curious but fair tone
- **AND** questions SHALL focus on relatability and practical experience

### Requirement: Dynamic Interviewer Behavior
The system SHALL provide a reactive interviewer personality that evolves during the conversation based on player responses.

#### Scenario: Mood progression from neutral to skeptical
- **WHEN** a player gives an evasive response to a direct question
- **THEN** the interviewer mood SHALL transition from neutral to skeptical
- **AND** subsequent questions SHALL become more pointed and direct
- **AND** the interviewer SHALL reference the evasion in follow-up questions

#### Scenario: Interruption on continued evasion
- **WHEN** a player gives a second evasive response while interviewer is skeptical
- **THEN** the interviewer SHALL interrupt the response mid-answer
- **AND** present a direct follow-up question immediately
- **AND** transition to hostile mood if pattern continues

#### Scenario: Positive reaction to authentic response
- **WHEN** a player gives a direct, authentic answer to a challenging question
- **THEN** the interviewer SHALL show visible approval or surprise
- **AND** may become more sympathetic in subsequent questions
- **AND** reference the strong answer positively later in the interview

### Requirement: Conversational Flow Engine
The system SHALL provide dynamic conversation management that feels natural and reactive rather than following a predetermined script.

#### Scenario: Rapid-fire follow-up questions
- **WHEN** a player's response creates an opening for deeper questioning
- **THEN** the system SHALL immediately present a follow-up question
- **AND** not wait for the standard question-answer cycle
- **AND** maintain conversation momentum

#### Scenario: Contradiction detection and challenge
- **WHEN** a player's current response contradicts a previous answer
- **THEN** the system SHALL detect the contradiction
- **AND** the interviewer SHALL reference the previous answer
- **AND** demand clarification or acknowledge the inconsistency

#### Scenario: Memory-based questioning
- **WHEN** the interviewer asks a follow-up question
- **THEN** it SHALL reference specific details from previous player responses
- **AND** build on the conversation history naturally
- **AND** create a sense of continuous dialogue

### Requirement: Response Urgency System
The system SHALL provide time pressure mechanics for high-stakes questions to simulate real interview conditions.

#### Scenario: Urgent response timer
- **WHEN** a particularly challenging or controversial question is asked
- **THEN** the system MAY activate a response timer (10-15 seconds)
- **AND** display a countdown to create pressure
- **AND** automatically select a defensive response if time expires

#### Scenario: No timer for complex policy questions
- **WHEN** a question requires thoughtful policy consideration
- **THEN** the system SHALL NOT activate the urgency timer
- **AND** allow unlimited time for response consideration

### Requirement: Interview Performance Tracking
The system SHALL track and analyze player performance throughout the interview for gameplay consequences.

#### Scenario: Performance metrics calculation
- **WHEN** an interview is completed
- **THEN** the system SHALL calculate scores for consistency, confidence, and authenticity
- **AND** track the dominant response tone pattern
- **AND** identify any major contradictions or strong moments

#### Scenario: Difficulty-adjusted scoring
- **WHEN** calculating performance scores
- **THEN** the system SHALL adjust expectations based on background difficulty
- **AND** controversial backgrounds SHALL have more lenient scoring
- **AND** professional backgrounds SHALL have higher consistency requirements

### Requirement: Interview Accessibility
The system SHALL provide accessibility options to ensure all players can engage with the interview system effectively.

#### Scenario: Timer adjustment for accessibility
- **WHEN** a player has accessibility needs
- **THEN** the system SHALL allow disabling of urgency timers
- **AND** provide extended time options
- **AND** maintain interview challenge through other means

#### Scenario: Screen reader compatibility
- **WHEN** a player uses screen reader technology
- **THEN** all interview elements SHALL be properly labeled
- **AND** conversation flow SHALL be navigable via keyboard
- **AND** interviewer mood changes SHALL be announced clearly