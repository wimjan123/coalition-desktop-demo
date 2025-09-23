export interface Issue {
	id: string;
	name: string;
	description: string;
	spectrum: {
		left: string;
		right: string;
	};
}

export interface PoliticalPosition {
	issueId: string;
	position: number; // -100 to 100, where -100 is far left, 100 is far right
	priority: number; // 1-5, how important this issue is to the party
}

export interface Party {
	id: string;
	name: string;
	shortName: string; // e.g., "VVD", "PvdA"
	color: string; // Party color for UI
	description: string;
	positions: PoliticalPosition[];
	isPlayerParty: boolean;
}

export interface StartingScenario {
	id: string;
	name: string;
	description: string;
	interviewerTone: 'hostile' | 'skeptical' | 'neutral' | 'sympathetic' | 'confrontational';
	gameplayModifiers: {
		approvalRating: number;
		mediaRelations: number;
		coalitionTrust: number;
		specialActions: string[];
	};
	riskLevel: 'low' | 'medium' | 'high' | 'extreme';
}

export interface InterviewResponse {
	text: string;
	position: number;
	priority: number;
	tone: 'aggressive' | 'defensive' | 'evasive' | 'confrontational' | 'diplomatic';
	consistency: boolean; // Does this contradict previous answers?
}

export interface InterviewPerformanceScores {
	consistency: number;
	confidence: number;
	authenticity: number;
}

export interface InterviewPerformanceRating {
	score: number;
	grade: string;
	description: string;
}

export interface InterviewPerformanceSummary {
	positions: PoliticalPosition[];
	scores: InterviewPerformanceScores;
	rating: InterviewPerformanceRating;
	tonePattern: string[];
	interviewerMoodProgression: string[];
	contradictions?: string[];
}

export interface PlayerCharacter {
	id: string;
	name: string;
	age: number;
	background: string; // Previous profession
	traits: string[]; // Personality traits that affect gameplay
	experience: number; // Political experience level
	charisma: number; // 1-10
	integrity: number; // 1-10
	negotiation: number; // 1-10
}

export interface CampaignVideo {
	id: string;
	title: string;
	selectedIssues: string[]; // Issue IDs
	positions: { [issueId: string]: number }; // -100 to 100
	tone: 'aggressive' | 'moderate' | 'empathetic';
	createdOn: number; // Day number
	effectiveness: number; // 0-100 calculated score
	targetedRegions?: string[]; // Region IDs for targeted campaigns
	localIssues?: string[]; // Local issue IDs addressed
}

export interface RegionalCampaignData {
	regionId: string;
	polling: number; // 0-100 regional support
	awareness: number; // 0-100 voter awareness in region
	campaignSpending: number; // Total spent in this region
	mediaPresence: number; // 0-100 media coverage in region
	lastActivity?: number; // Day of last campaign activity
	localIssueStances?: { [issueId: string]: number }; // -100 to 100
}

export interface GameState {
	player: PlayerCharacter;
	playerParty: Party;
	currentPhase: 'character-creation' | 'campaign-intro' | 'campaign' | 'coalition' | 'governance';
	gameDate: Date;
	difficulty: 'easy' | 'normal' | 'hard';
	isFirstTime: boolean;
	daysUntilElection?: number;
	currentCrisis?: {
		headline: string;
		description: string;
		trigger: string;
	};
	// Character creation state
	selectedScenario?: StartingScenario;
	approvalRating?: number;
	mediaRelations?: number;
	coalitionTrust?: number;
	specialActions?: {
		scenario: string[];
		background: string[];
	};
	reputation?: { [key: string]: number };
	demographicRelationships?: {
		[groupId: string]: 'hostile' | 'skeptical' | 'neutral' | 'supportive' | 'enthusiastic';
	};
	interviewState?: {
		responseTones: string[]; // Track player response patterns
		contradictions: number; // Count of contradictory answers
		personalityProfile: { [tone: string]: number }; // Scoring for different response styles
		scores?: InterviewPerformanceScores;
		rating?: InterviewPerformanceRating;
		interviewerMoodProgression?: string[];
	};
	// Campaign data
	population?: { [groupId: string]: import('./population.js').PopulationSegment };
	campaignVideos?: CampaignVideo[];
	currentDay?: number; // Days since campaign started
	campaignBudget?: number;
	overallPolling?: number; // 0-100 overall support
	// Regional campaign data
	regionalData?: { [regionId: string]: RegionalCampaignData };
	nationalCampaignFocus?: string; // 'national' | 'regional'
	// Opposition parties with polling data
	oppositionParties?: Party[];
	oppositionPolling?: { [partyId: string]: number }; // 0-100 polling for each party
}

// Dutch political issues for the game
export const DUTCH_ISSUES: Issue[] = [
	{
		id: 'climate',
		name: 'Climate & Environment',
		description: 'Policies on carbon emissions, renewable energy, and environmental protection',
		spectrum: {
			left: 'Aggressive climate action, rapid transition to renewables',
			right: 'Market-based solutions, gradual transition, economic concerns first'
		}
	},
	{
		id: 'immigration',
		name: 'Immigration & Integration',
		description: 'Policies on immigration levels, asylum, and integration requirements',
		spectrum: {
			left: 'Open borders, generous asylum policies, multiculturalism',
			right: 'Strict immigration controls, assimilation requirements, border security'
		}
	},
	{
		id: 'economy',
		name: 'Economy & Taxation',
		description: 'Tax policy, government spending, and economic regulation',
		spectrum: {
			left: 'Higher taxes on wealthy, more government spending, strong regulation',
			right: 'Lower taxes, free market, minimal government intervention'
		}
	},
	{
		id: 'healthcare',
		name: 'Healthcare',
		description: 'Healthcare system structure, funding, and accessibility',
		spectrum: {
			left: 'Universal public healthcare, government-run system',
			right: 'Private healthcare, market competition, individual responsibility'
		}
	},
	{
		id: 'housing',
		name: 'Housing Crisis',
		description: 'Addressing housing shortage, rent controls, and urban planning',
		spectrum: {
			left: 'Rent controls, social housing expansion, strict regulations',
			right: 'Market solutions, remove regulations, incentivize construction'
		}
	},
	{
		id: 'education',
		name: 'Education',
		description: 'Education funding, school choice, and higher education policy',
		spectrum: {
			left: 'Free public education, equal funding, no school selection',
			right: 'School choice, private education, merit-based systems'
		}
	},
	{
		id: 'eu',
		name: 'European Union',
		description: 'Netherlands\' relationship with the EU and European integration',
		spectrum: {
			left: 'Deeper EU integration, transfer more sovereignty to Brussels',
			right: 'EU skepticism, national sovereignty, consider Nexit'
		}
	},
	{
		id: 'security',
		name: 'Security & Defense',
		description: 'Police funding, surveillance, military spending, and law and order',
		spectrum: {
			left: 'Community policing, rehabilitation, diplomacy over military',
			right: 'Strong law and order, increased surveillance, robust defense'
		}
	}
];

export interface CharacterBackground {
	id: string;
	name: string;
	description: string;
	traits: string[];
	bonuses: { [key: string]: number };
	riskLevel?: 'low' | 'medium' | 'high' | 'extreme';
	startingPenalties?: { [key: string]: number };
	uniqueOpportunities?: string[];
	interviewChallenges?: string[];
}

export const CHARACTER_BACKGROUNDS: CharacterBackground[] = [
	// Conventional backgrounds
	{ id: 'business', name: 'Business Leader', description: 'Former CEO or entrepreneur', traits: ['pragmatic', 'ambitious'], bonuses: { negotiation: 2 }, riskLevel: 'low' },
	{ id: 'academic', name: 'University Professor', description: 'Academic researcher and teacher', traits: ['intellectual', 'analytical'], bonuses: { integrity: 2 }, riskLevel: 'low' },
	{ id: 'lawyer', name: 'Lawyer', description: 'Legal professional', traits: ['argumentative', 'detail-oriented'], bonuses: { negotiation: 1, integrity: 1 }, riskLevel: 'low' },
	{ id: 'journalist', name: 'Journalist', description: 'Media professional', traits: ['inquisitive', 'communicative'], bonuses: { charisma: 2 }, riskLevel: 'low' },
	{ id: 'activist', name: 'Activist', description: 'Social or environmental campaigner', traits: ['passionate', 'principled'], bonuses: { charisma: 1, integrity: 1 }, riskLevel: 'low' },
	{ id: 'civil-servant', name: 'Civil Servant', description: 'Government bureaucrat', traits: ['methodical', 'diplomatic'], bonuses: { experience: 10 }, riskLevel: 'low' },
	{ id: 'teacher', name: 'Teacher', description: 'Primary or secondary school educator', traits: ['patient', 'empathetic'], bonuses: { charisma: 1, integrity: 1 }, riskLevel: 'low' },
	{ id: 'military', name: 'Military Officer', description: 'Former armed forces', traits: ['disciplined', 'authoritative'], bonuses: { experience: 5, negotiation: 1 }, riskLevel: 'low' },

	// Controversial Dutch backgrounds
	{
		id: 'toeslagenaffaire-whistleblower',
		name: 'Toeslagenaffaire Whistleblower',
		description: 'Government insider who exposed institutional racism in childcare benefits scandal',
		traits: ['principled', 'honest', 'analytical'],
		bonuses: { integrity: 3 },
		riskLevel: 'high',
		startingPenalties: { establishmentTrust: -20 },
		uniqueOpportunities: ['Institutional Reform', 'Transparency Crusade'],
		interviewChallenges: ['racism-exposure', 'system-destruction']
	},
	{
		id: 'shell-executive',
		name: 'Shell/Unilever Executive',
		description: 'Former multinational executive during dividend tax controversy',
		traits: ['pragmatic', 'ambitious', 'calculating'],
		bonuses: { negotiation: 2, experience: 5 },
		riskLevel: 'medium',
		startingPenalties: { environmentalCredibility: -15 },
		uniqueOpportunities: ['Economic Transition', 'Business Relations'],
		interviewChallenges: ['climate-profits', 'tax-avoidance']
	},
	{
		id: 'bbb-defector',
		name: 'BBB Defector',
		description: 'Former farmers\' movement leader switching to broader politics',
		traits: ['passionate', 'populist', 'bold'],
		bonuses: { charisma: 2 },
		riskLevel: 'medium',
		startingPenalties: { urbanAppeal: -30 },
		uniqueOpportunities: ['Agricultural Reform', 'Anti-Brussels'],
		interviewChallenges: ['farmer-betrayal', 'rural-representation']
	},
	{
		id: 'rutte-survivor',
		name: 'Rutte Administration Survivor',
		description: 'Former government minister during toeslagenaffaire cover-up',
		traits: ['diplomatic', 'calculating', 'experienced'],
		bonuses: { negotiation: 2, experience: 8 },
		riskLevel: 'high',
		startingPenalties: { antiEstablishmentCredibility: -25 },
		uniqueOpportunities: ['Polder Model', 'Coalition Building'],
		interviewChallenges: ['government-lies', 'accountability']
	},
	{
		id: 'nitrogen-researcher',
		name: 'Nitrogen Crisis Researcher',
		description: 'Environmental scientist who exposed livestock emissions data',
		traits: ['analytical', 'principled', 'intellectual'],
		bonuses: { integrity: 2, experience: 3 },
		riskLevel: 'medium',
		startingPenalties: { farmerSupport: -20 },
		uniqueOpportunities: ['Evidence-Based Policy', 'Climate Emergency'],
		interviewChallenges: ['farmer-jobs', 'economic-impact']
	},
	{
		id: 'media-pariah',
		name: 'Media Pariah',
		description: 'Journalist fired for controversial positions on COVID/immigration',
		traits: ['bold', 'principled', 'populist'],
		bonuses: { charisma: 1, integrity: 1 },
		riskLevel: 'extreme',
		startingPenalties: { mainstreamMediaRelations: -30 },
		uniqueOpportunities: ['Alternative Media', 'Truth Campaign'],
		interviewChallenges: ['controversial-views', 'media-credibility']
	}
];

export const STARTING_SCENARIOS: StartingScenario[] = [
	{
		id: 'new-party',
		name: 'New Party Founder',
		description: 'Start fresh with a new political party, free from baggage but with limited resources',
		interviewerTone: 'neutral',
		gameplayModifiers: {
			approvalRating: 0,
			mediaRelations: 0,
			coalitionTrust: 0,
			specialActions: []
		},
		riskLevel: 'low'
	},
	{
		id: 'party-rehabilitator',
		name: 'Party Rehabilitator',
		description: 'Take over leadership of a party with a toxic past requiring complete rebranding',
		interviewerTone: 'hostile',
		gameplayModifiers: {
			approvalRating: -20,
			mediaRelations: -15,
			coalitionTrust: -25,
			specialActions: ['Reform Campaign', 'Historical Apology']
		},
		riskLevel: 'extreme'
	},
	{
		id: 'scandal-survivor',
		name: 'Scandal Survivor',
		description: 'Return to politics after surviving a major personal or political scandal',
		interviewerTone: 'skeptical',
		gameplayModifiers: {
			approvalRating: -15,
			mediaRelations: -20,
			coalitionTrust: -10,
			specialActions: ['Redemption Campaign', 'Scandal Immunity']
		},
		riskLevel: 'high'
	},
	{
		id: 'emergency-replacement',
		name: 'Emergency Replacement',
		description: 'Step in as emergency leader after previous leader resigned in scandal',
		interviewerTone: 'sympathetic',
		gameplayModifiers: {
			approvalRating: -5,
			mediaRelations: 5,
			coalitionTrust: -15,
			specialActions: ['Crisis Management', 'Stability Message']
		},
		riskLevel: 'medium'
	},
	{
		id: 'coalition-defector',
		name: 'Coalition Defector',
		description: 'Leave an existing coalition to start your own political movement',
		interviewerTone: 'confrontational',
		gameplayModifiers: {
			approvalRating: -10,
			mediaRelations: -5,
			coalitionTrust: -30,
			specialActions: ['Principled Stand', 'Coalition Experience']
		},
		riskLevel: 'medium'
	},
	{
		id: 'hostile-takeover',
		name: 'Hostile Takeover',
		description: 'Challenge existing party leadership through internal party warfare',
		interviewerTone: 'hostile',
		gameplayModifiers: {
			approvalRating: -25,
			mediaRelations: -10,
			coalitionTrust: -20,
			specialActions: ['Party Infrastructure', 'Internal Opposition']
		},
		riskLevel: 'high'
	}
];

export const PERSONALITY_TRAITS = [
	'charismatic', 'analytical', 'pragmatic', 'idealistic', 'ambitious', 'principled',
	'diplomatic', 'aggressive', 'patient', 'impulsive', 'cautious', 'bold',
	'empathetic', 'calculating', 'honest', 'strategic', 'populist', 'elitist'
];

// Major Dutch political parties for opposition
export const DUTCH_OPPOSITION_PARTIES: Party[] = [
	{
		id: 'vvd',
		name: 'Volkspartij voor Vrijheid en Democratie',
		shortName: 'VVD',
		color: '#0066CC',
		description: 'Liberal party focused on economic freedom and entrepreneurship',
		isPlayerParty: false,
		positions: [
			{ issueId: 'economy', position: 65, priority: 5 },
			{ issueId: 'immigration', position: 35, priority: 4 },
			{ issueId: 'eu', position: 25, priority: 3 },
			{ issueId: 'healthcare', position: 45, priority: 3 },
			{ issueId: 'security', position: 55, priority: 4 }
		]
	},
	{
		id: 'pvda',
		name: 'Partij van de Arbeid',
		shortName: 'PvdA',
		color: '#DC143C',
		description: 'Social democratic party championing workers\' rights and equality',
		isPlayerParty: false,
		positions: [
			{ issueId: 'economy', position: -55, priority: 5 },
			{ issueId: 'healthcare', position: -65, priority: 4 },
			{ issueId: 'education', position: -60, priority: 4 },
			{ issueId: 'climate', position: -45, priority: 4 },
			{ issueId: 'housing', position: -70, priority: 5 }
		]
	},
	{
		id: 'd66',
		name: 'Democraten 66',
		shortName: 'D66',
		color: '#32A4FF',
		description: 'Progressive liberal party focused on education and democratic reform',
		isPlayerParty: false,
		positions: [
			{ issueId: 'education', position: -40, priority: 5 },
			{ issueId: 'climate', position: -60, priority: 4 },
			{ issueId: 'eu', position: -50, priority: 4 },
			{ issueId: 'economy', position: 20, priority: 3 },
			{ issueId: 'immigration', position: -30, priority: 3 }
		]
	},
	{
		id: 'cda',
		name: 'Christen-Democratisch Appèl',
		shortName: 'CDA',
		color: '#FF8C00',
		description: 'Christian democratic party emphasizing traditional values and social responsibility',
		isPlayerParty: false,
		positions: [
			{ issueId: 'economy', position: 25, priority: 4 },
			{ issueId: 'immigration', position: 30, priority: 4 },
			{ issueId: 'healthcare', position: -20, priority: 4 },
			{ issueId: 'education', position: -10, priority: 3 },
			{ issueId: 'security', position: 40, priority: 3 }
		]
	},
	{
		id: 'pvv',
		name: 'Partij voor de Vrijheid',
		shortName: 'PVV',
		color: '#FFD700',
		description: 'Right-wing populist party focused on immigration restriction and EU criticism',
		isPlayerParty: false,
		positions: [
			{ issueId: 'immigration', position: 85, priority: 5 },
			{ issueId: 'eu', position: 75, priority: 5 },
			{ issueId: 'security', position: 70, priority: 4 },
			{ issueId: 'economy', position: -15, priority: 3 },
			{ issueId: 'healthcare', position: -25, priority: 3 }
		]
	},
	{
		id: 'gl',
		name: 'GroenLinks',
		shortName: 'GL',
		color: '#32CD32',
		description: 'Green left party prioritizing environmental protection and social justice',
		isPlayerParty: false,
		positions: [
			{ issueId: 'climate', position: -85, priority: 5 },
			{ issueId: 'economy', position: -60, priority: 4 },
			{ issueId: 'immigration', position: -70, priority: 4 },
			{ issueId: 'healthcare', position: -75, priority: 4 },
			{ issueId: 'housing', position: -80, priority: 5 }
		]
	},
	{
		id: 'sp',
		name: 'Socialistische Partij',
		shortName: 'SP',
		color: '#FF6347',
		description: 'Socialist party advocating for working class interests and wealth redistribution',
		isPlayerParty: false,
		positions: [
			{ issueId: 'economy', position: -80, priority: 5 },
			{ issueId: 'healthcare', position: -85, priority: 5 },
			{ issueId: 'housing', position: -85, priority: 5 },
			{ issueId: 'eu', position: 45, priority: 4 },
			{ issueId: 'education', position: -70, priority: 4 }
		]
	},
	{
		id: 'fvd',
		name: 'Forum voor Democratie',
		shortName: 'FvD',
		color: '#8B4513',
		description: 'Conservative populist party emphasizing national sovereignty and traditional values',
		isPlayerParty: false,
		positions: [
			{ issueId: 'eu', position: 80, priority: 5 },
			{ issueId: 'immigration', position: 70, priority: 4 },
			{ issueId: 'climate', position: 60, priority: 4 },
			{ issueId: 'security', position: 65, priority: 4 },
			{ issueId: 'economy', position: 40, priority: 3 }
		]
	}
];
