// Extended party statistics and perception tracking
export interface PartyStats {
	// Core Metrics
	overallApproval: number; // 0-100 general approval
	trustworthiness: number; // 0-100 perceived integrity
	competence: number; // 0-100 perceived effectiveness
	relatability: number; // 0-100 connection with voters

	// Demographic Breakdown
	demographicApproval: {
		[groupId: string]: number; // approval per demographic segment
	};

	// Issue-based Perception
	issueCredibility: {
		[issueId: string]: number; // 0-100 perceived credibility on each issue
	};

	// Media Metrics
	mediaPresence: number; // 0-100 current media attention
	mediaFavorability: number; // -100 to 100 media sentiment
	socialMediaFollowers: number;
	socialMediaEngagement: number; // 0-100 engagement rate

	// Political Capital
	coalitionAppeal: number; // 0-100 attractiveness as coalition partner
	oppositionStrength: number; // 0-100 effectiveness in opposition
	parliamentaryInfluence: number; // 0-100 ability to pass legislation
}

export interface PartyPerformanceHistory {
	date: Date;
	polling: number;
	approval: number;
	keyEvent?: string;
	mediaAttention: number;
}

export interface PartyRelationship {
	partyId: string;
	relationship: number; // -100 to 100 (hostile to ally)
	coalitionCompatibility: number; // 0-100 likelihood of coalition
	publicPerception: 'rivals' | 'neutral' | 'allies' | 'enemies';
}

// Extended Party interface
export interface ExtendedParty extends import('./game.js').Party {
	stats: PartyStats;
	performanceHistory: PartyPerformanceHistory[];
	relationships: PartyRelationship[];
	currentStrategy: PartyStrategy;
}

export interface PartyStrategy {
	focus: 'populist' | 'centrist' | 'ideological' | 'pragmatic';
	targetDemographics: string[]; // demographic group IDs
	keyIssues: string[]; // prioritized issue IDs
	mediaStrategy: 'aggressive' | 'defensive' | 'proactive' | 'reactive';
	coalitionStance: 'open' | 'selective' | 'independent' | 'opposition-only';
}