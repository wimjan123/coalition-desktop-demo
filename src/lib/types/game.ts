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
	// Campaign data
	population?: { [groupId: string]: import('./population.js').PopulationSegment };
	campaignVideos?: CampaignVideo[];
	currentDay?: number; // Days since campaign started
	campaignBudget?: number;
	overallPolling?: number; // 0-100 overall support
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

export const CHARACTER_BACKGROUNDS = [
	{ id: 'business', name: 'Business Leader', description: 'Former CEO or entrepreneur', traits: ['pragmatic', 'ambitious'], bonuses: { negotiation: 2 } },
	{ id: 'academic', name: 'University Professor', description: 'Academic researcher and teacher', traits: ['intellectual', 'analytical'], bonuses: { integrity: 2 } },
	{ id: 'lawyer', name: 'Lawyer', description: 'Legal professional', traits: ['argumentative', 'detail-oriented'], bonuses: { negotiation: 1, integrity: 1 } },
	{ id: 'journalist', name: 'Journalist', description: 'Media professional', traits: ['inquisitive', 'communicative'], bonuses: { charisma: 2 } },
	{ id: 'activist', name: 'Activist', description: 'Social or environmental campaigner', traits: ['passionate', 'principled'], bonuses: { charisma: 1, integrity: 1 } },
	{ id: 'civil-servant', name: 'Civil Servant', description: 'Government bureaucrat', traits: ['methodical', 'diplomatic'], bonuses: { experience: 10 } },
	{ id: 'teacher', name: 'Teacher', description: 'Primary or secondary school educator', traits: ['patient', 'empathetic'], bonuses: { charisma: 1, integrity: 1 } },
	{ id: 'military', name: 'Military Officer', description: 'Former armed forces', traits: ['disciplined', 'authoritative'], bonuses: { experience: 5, negotiation: 1 } }
];

export const PERSONALITY_TRAITS = [
	'charismatic', 'analytical', 'pragmatic', 'idealistic', 'ambitious', 'principled',
	'diplomatic', 'aggressive', 'patient', 'impulsive', 'cautious', 'bold',
	'empathetic', 'calculating', 'honest', 'strategic', 'populist', 'elitist'
];