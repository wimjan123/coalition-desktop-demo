// News events and response system
export interface NewsEvent {
	id: string;
	headline: string;
	description: string;
	category: NewsCategory;
	urgency: 'low' | 'medium' | 'high' | 'crisis';

	// Issue relevance
	primaryIssue: string; // main issue ID this event relates to
	secondaryIssues?: string[]; // additional relevant issues

	// Timing and context
	triggerDay: number;
	expiresAfterDays: number; // how long responses are available
	requiredEvents?: string[]; // prerequisite events

	// Response options
	availableResponses: NewsResponse[];

	// Impact settings
	basePollingImpact: number; // base polling change if ignored
	demographicMultipliers: { [groupId: string]: number }; // impact per demographic

	// Media attention
	mediaAttention: number; // 0-100 how much media coverage this gets
	socialMediaViral: boolean; // whether this spreads on social media
}

export type NewsCategory =
	| 'economy'
	| 'scandal'
	| 'policy'
	| 'international'
	| 'social'
	| 'environment'
	| 'security'
	| 'healthcare'
	| 'education'
	| 'crisis';

export interface NewsResponse {
	id: string;
	type: ResponseType;
	title: string;
	description: string;

	// Response characteristics
	tone: 'aggressive' | 'defensive' | 'empathetic' | 'dismissive' | 'analytical';
	stance: 'support' | 'oppose' | 'neutral' | 'deflect';

	// Requirements and constraints
	requiredTraits?: string[]; // player traits needed
	requiredStats?: { [stat: string]: number }; // minimum stat requirements
	cost?: number; // budget cost if any
	timeRequired: number; // hours this response takes

	// Impact calculations
	pollingImpact: { [groupId: string]: number }; // polling change per demographic
	trustImpact: number; // trustworthiness change
	mediaImpact: number; // media favorability change
	partyStatsImpact: Partial<import('./party.js').PartyStats>;

	// Risk factors
	backfireChance: number; // 0-100 chance of negative outcome
	backfireConsequences?: NewsEventConsequence[];
}

export type ResponseType =
	| 'talkshow'
	| 'tweet'
	| 'interview'
	| 'press-conference'
	| 'statement'
	| 'ignore'
	| 'private-meeting'
	| 'policy-proposal';

export interface NewsEventConsequence {
	type: 'polling' | 'relationship' | 'media' | 'crisis' | 'opportunity';
	description: string;
	impact: {
		polling?: number;
		approval?: number;
		media?: number;
		relationships?: { [partyId: string]: number };
	};
	duration: number; // days the effect lasts
}

export interface ActiveNewsEvent {
	event: NewsEvent;
	triggeredOn: number; // game day
	playerResponse?: {
		responseId: string;
		respondedOn: number;
		outcome: 'success' | 'neutral' | 'backfire';
		consequences: NewsEventConsequence[];
	};
	mediaAttentionRemaining: number; // how much attention is left
	isExpired: boolean;
}

// News event templates for procedural generation
export interface NewsEventTemplate {
	id: string;
	category: NewsCategory;
	urgency: 'low' | 'medium' | 'high';

	// Template content with variables
	headlineTemplates: string[]; // with {{variable}} placeholders
	descriptionTemplates: string[];

	// Trigger conditions
	triggerChance: number; // 0-100 base chance per day
	triggerConditions: NewsEventTrigger[];

	// Issue relationships
	primaryIssue: string;
	secondaryIssues?: string[];

	// Response templates
	responseTemplates: ResponseTemplate[];
}

export interface NewsEventTrigger {
	type: 'polling' | 'day' | 'event' | 'random' | 'stat';
	condition: string; // condition expression
	multiplier: number; // affects trigger chance
}

export interface ResponseTemplate {
	type: ResponseType;
	titleTemplate: string;
	descriptionTemplate: string;
	tone: 'aggressive' | 'defensive' | 'empathetic' | 'dismissive' | 'analytical';

	// Impact templates with variables
	basePollingImpact: number;
	demographicMultipliers: { [groupId: string]: number };

	// Requirements
	requiredTraits?: string[];
	minimumStats?: { [stat: string]: number };
}

// Game state extension for news system
export interface NewsSystemState {
	activeEvents: ActiveNewsEvent[];
	eventHistory: ActiveNewsEvent[];
	nextEventDay: number;
	eventFrequency: number; // events per week average
	mediaAttentionLevel: number; // 0-100 current media scrutiny

	// Player response patterns (for AI learning)
	responsePatterns: {
		preferredResponseTypes: { [type in ResponseType]: number };
		riskTolerance: number; // 0-100
		averageResponseTime: number; // hours
	};
}