export interface Region {
	id: string;
	name: string;
	type: 'urban' | 'suburban' | 'rural';
	population: number;
	electoralWeight: number; // Percentage of total Dutch electorate
	provinces: string[];
	majorCities: string[];

	// Economic profile
	economicProfile: {
		primaryIndustries: string[];
		unemploymentRate: number;
		averageIncome: number;
		housingPrices: number;
	};

	// Political characteristics
	politicalProfile: {
		historicalLeaning: 'left' | 'center' | 'right';
		volatility: number; // How easily voters change parties
		turnoutRate: number; // Historical voter turnout
		euSupport: number; // EU favorability
	};

	// Local issues specific to this region
	localIssues: LocalIssue[];

	// Media landscape
	localMedia: LocalMediaOutlet[];

	// Demographic distribution (overrides/modifies national demographics)
	demographicModifiers: {
		[demographicId: string]: {
			prevalenceMultiplier: number; // vs national average
			issueImportanceModifiers: { [issueId: string]: number };
		};
	};
}

export interface LocalIssue {
	id: string;
	name: string;
	description: string;
	category: 'infrastructure' | 'environment' | 'economy' | 'social' | 'governance';
	severity: number; // 1-10 how urgent/important locally
	nationalRelevance: number; // 0-1 how much national parties can influence
	polarization: number; // 0-1 how divisive the issue is
	affectedGroups: string[]; // Which demographic groups care most
}

export interface LocalMediaOutlet {
	id: string;
	name: string;
	type: 'newspaper' | 'radio' | 'tv' | 'website';
	reach: number; // 0-1 percentage of regional population
	credibility: number; // 0-1 how trusted locally
	politicalBias: number; // -1 to 1 (left to right)
	cost: number; // Cost for campaign placement
	effectiveness: number; // How well it influences local voters
}

export interface RegionalCampaignData {
	regionId: string;
	staffAllocation: number; // Number of campaign workers
	budgetAllocation: number; // Money spent in this region
	officesOpened: number; // Local campaign offices
	eventsHeld: number; // Rallies, town halls, etc.
	mediaSpend: { [mediaId: string]: number }; // Spending per local outlet

	// Results
	voterAwareness: number; // 0-100 how well known you are locally
	localPolling: number; // 0-100 current support
	issueAssociation: { [issueId: string]: number }; // How associated you are with local issues
}

// Dutch regions based on real geography and politics
export const DUTCH_REGIONS: Region[] = [
	{
		id: 'randstad-north',
		name: 'Randstad Noord (Amsterdam, Haarlem)',
		type: 'urban',
		population: 3200000,
		electoralWeight: 18.5,
		provinces: ['Noord-Holland'],
		majorCities: ['Amsterdam', 'Haarlem', 'Alkmaar', 'Zaandam'],

		economicProfile: {
			primaryIndustries: ['Finance', 'Technology', 'Tourism', 'Creative Industries'],
			unemploymentRate: 4.2,
			averageIncome: 45000,
			housingPrices: 520000
		},

		politicalProfile: {
			historicalLeaning: 'left',
			volatility: 0.7,
			turnoutRate: 0.82,
			euSupport: 0.75
		},

		localIssues: [
			{
				id: 'amsterdam-housing-crisis',
				name: 'Housing Affordability Crisis',
				description: 'Extreme housing shortage and skyrocketing prices forcing out middle class',
				category: 'social',
				severity: 9,
				nationalRelevance: 0.8,
				polarization: 0.6,
				affectedGroups: ['young-professionals', 'urban-progressive']
			},
			{
				id: 'schiphol-noise',
				name: 'Schiphol Airport Expansion',
				description: 'Debate over airport growth vs noise pollution and climate impact',
				category: 'environment',
				severity: 7,
				nationalRelevance: 0.9,
				polarization: 0.8,
				affectedGroups: ['suburban-families', 'urban-progressive']
			},
			{
				id: 'tourist-overflow',
				name: 'Tourism Overtourism',
				description: 'Amsterdam struggling with too many tourists affecting livability',
				category: 'governance',
				severity: 6,
				nationalRelevance: 0.4,
				polarization: 0.5,
				affectedGroups: ['urban-progressive', 'seniors']
			}
		],

		localMedia: [
			{
				id: 'parool',
				name: 'Het Parool',
				type: 'newspaper',
				reach: 0.35,
				credibility: 0.8,
				politicalBias: -0.3,
				cost: 15000,
				effectiveness: 0.7
			},
			{
				id: 'at5',
				name: 'AT5 Amsterdam',
				type: 'tv',
				reach: 0.45,
				credibility: 0.6,
				politicalBias: 0.1,
				cost: 25000,
				effectiveness: 0.8
			},
			{
				id: 'radio-noord-holland',
				name: 'Radio Noord-Holland',
				type: 'radio',
				reach: 0.25,
				credibility: 0.7,
				politicalBias: 0.0,
				cost: 8000,
				effectiveness: 0.5
			}
		],

		demographicModifiers: {
			'urban-progressive': {
				prevalenceMultiplier: 2.1,
				issueImportanceModifiers: {
					'housing': 2.0,
					'climate': 1.5,
					'immigration': 0.8
				}
			},
			'young-professionals': {
				prevalenceMultiplier: 1.8,
				issueImportanceModifiers: {
					'housing': 2.2,
					'economy': 1.3
				}
			}
		}
	},

	{
		id: 'randstad-south',
		name: 'Randstad Zuid (Den Haag, Rotterdam)',
		type: 'urban',
		population: 2800000,
		electoralWeight: 16.2,
		provinces: ['Zuid-Holland'],
		majorCities: ['Rotterdam', 'Den Haag', 'Dordrecht', 'Leiden'],

		economicProfile: {
			primaryIndustries: ['Government', 'Logistics', 'Petrochemicals', 'International Organizations'],
			unemploymentRate: 5.1,
			averageIncome: 42000,
			housingPrices: 380000
		},

		politicalProfile: {
			historicalLeaning: 'center',
			volatility: 0.6,
			turnoutRate: 0.79,
			euSupport: 0.68
		},

		localIssues: [
			{
				id: 'rotterdam-port-environment',
				name: 'Port of Rotterdam Climate Impact',
				description: 'Balancing economic importance of port with environmental concerns',
				category: 'environment',
				severity: 8,
				nationalRelevance: 0.9,
				polarization: 0.7,
				affectedGroups: ['working-class', 'urban-progressive']
			},
			{
				id: 'den-haag-international',
				name: 'International Organizations Burden',
				description: 'Costs and benefits of hosting international courts and embassies',
				category: 'governance',
				severity: 5,
				nationalRelevance: 0.8,
				polarization: 0.4,
				affectedGroups: ['suburban-families', 'seniors']
			}
		],

		localMedia: [
			{
				id: 'ad-rotterdam',
				name: 'Algemeen Dagblad Rotterdam',
				type: 'newspaper',
				reach: 0.40,
				credibility: 0.75,
				politicalBias: 0.2,
				cost: 18000,
				effectiveness: 0.8
			},
			{
				id: 'omroep-west',
				name: 'Omroep West',
				type: 'tv',
				reach: 0.55,
				credibility: 0.7,
				politicalBias: 0.0,
				cost: 22000,
				effectiveness: 0.7
			}
		],

		demographicModifiers: {
			'working-class': {
				prevalenceMultiplier: 1.4,
				issueImportanceModifiers: {
					'economy': 1.4,
					'immigration': 1.2
				}
			}
		}
	},

	{
		id: 'north-rural',
		name: 'Noord-Nederland (Groningen, Friesland, Drenthe)',
		type: 'rural',
		population: 1800000,
		electoralWeight: 10.4,
		provinces: ['Groningen', 'Friesland', 'Drenthe'],
		majorCities: ['Groningen', 'Leeuwarden', 'Assen', 'Emmen'],

		economicProfile: {
			primaryIndustries: ['Agriculture', 'Natural Gas', 'Renewable Energy', 'Tourism'],
			unemploymentRate: 6.8,
			averageIncome: 32000,
			housingPrices: 220000
		},

		politicalProfile: {
			historicalLeaning: 'right',
			volatility: 0.4,
			turnoutRate: 0.75,
			euSupport: 0.45
		},

		localIssues: [
			{
				id: 'groningen-earthquakes',
				name: 'Gas Extraction Earthquakes',
				description: 'Earthquakes from natural gas extraction damaging homes and communities',
				category: 'environment',
				severity: 10,
				nationalRelevance: 0.9,
				polarization: 0.9,
				affectedGroups: ['rural-traditional', 'working-class']
			},
			{
				id: 'agricultural-regulations',
				name: 'EU Agricultural Regulations',
				description: 'Nitrogen emission limits threatening traditional farming practices',
				category: 'economy',
				severity: 9,
				nationalRelevance: 0.8,
				polarization: 0.8,
				affectedGroups: ['rural-traditional']
			},
			{
				id: 'rural-depopulation',
				name: 'Rural Population Decline',
				description: 'Young people leaving for cities, local services closing',
				category: 'social',
				severity: 7,
				nationalRelevance: 0.6,
				polarization: 0.3,
				affectedGroups: ['rural-traditional', 'seniors']
			}
		],

		localMedia: [
			{
				id: 'dagblad-van-het-noorden',
				name: 'Dagblad van het Noorden',
				type: 'newspaper',
				reach: 0.60,
				credibility: 0.85,
				politicalBias: 0.3,
				cost: 12000,
				effectiveness: 0.9
			},
			{
				id: 'rtvnoord',
				name: 'RTV Noord',
				type: 'tv',
				reach: 0.70,
				credibility: 0.8,
				politicalBias: 0.1,
				cost: 15000,
				effectiveness: 0.8
			}
		],

		demographicModifiers: {
			'rural-traditional': {
				prevalenceMultiplier: 2.5,
				issueImportanceModifiers: {
					'climate': 0.3,
					'immigration': 1.4,
					'economy': 1.6,
					'eu': 0.6
				}
			}
		}
	},

	{
		id: 'east-netherlands',
		name: 'Oost-Nederland (Overijssel, Gelderland)',
		type: 'suburban',
		population: 2400000,
		electoralWeight: 13.9,
		provinces: ['Overijssel', 'Gelderland'],
		majorCities: ['Nijmegen', 'Arnhem', 'Apeldoorn', 'Enschede', 'Zwolle'],

		economicProfile: {
			primaryIndustries: ['Manufacturing', 'Technology', 'Agriculture', 'Logistics'],
			unemploymentRate: 4.8,
			averageIncome: 38000,
			housingPrices: 310000
		},

		politicalProfile: {
			historicalLeaning: 'center',
			volatility: 0.5,
			turnoutRate: 0.81,
			euSupport: 0.58
		},

		localIssues: [
			{
				id: 'german-border-crime',
				name: 'Cross-Border Crime',
				description: 'Drug trafficking and crime from German border affecting local communities',
				category: 'social',
				severity: 6,
				nationalRelevance: 0.7,
				polarization: 0.6,
				affectedGroups: ['suburban-families', 'rural-traditional']
			},
			{
				id: 'nature-development',
				name: 'Nature Reserve Expansion',
				description: 'Conflicts between conservation efforts and agricultural land use',
				category: 'environment',
				severity: 5,
				nationalRelevance: 0.5,
				polarization: 0.6,
				affectedGroups: ['rural-traditional', 'urban-progressive']
			}
		],

		localMedia: [
			{
				id: 'gelderlander',
				name: 'De Gelderlander',
				type: 'newspaper',
				reach: 0.45,
				credibility: 0.8,
				politicalBias: 0.1,
				cost: 14000,
				effectiveness: 0.75
			}
		],

		demographicModifiers: {
			'suburban-families': {
				prevalenceMultiplier: 1.3,
				issueImportanceModifiers: {
					'security': 1.3,
					'education': 1.2
				}
			}
		}
	},

	{
		id: 'south-netherlands',
		name: 'Zuid-Nederland (Noord-Brabant, Limburg)',
		type: 'suburban',
		population: 2500000,
		electoralWeight: 14.5,
		provinces: ['Noord-Brabant', 'Limburg'],
		majorCities: ['Eindhoven', 'Tilburg', 'Breda', 'Maastricht', 'Venlo'],

		economicProfile: {
			primaryIndustries: ['High-Tech', 'Manufacturing', 'Logistics', 'Chemical'],
			unemploymentRate: 4.5,
			averageIncome: 40000,
			housingPrices: 350000
		},

		politicalProfile: {
			historicalLeaning: 'center',
			volatility: 0.5,
			turnoutRate: 0.78,
			euSupport: 0.62
		},

		localIssues: [
			{
				id: 'eindhoven-tech-growth',
				name: 'High-Tech Sector Growth Impact',
				description: 'Rapid growth in tech sector creating housing pressure and infrastructure strain',
				category: 'economy',
				severity: 7,
				nationalRelevance: 0.8,
				polarization: 0.4,
				affectedGroups: ['young-professionals', 'suburban-families']
			},
			{
				id: 'southern-identity',
				name: 'Regional Cultural Identity',
				description: 'Preserving Catholic and regional traditions amid rapid modernization',
				category: 'social',
				severity: 4,
				nationalRelevance: 0.3,
				polarization: 0.5,
				affectedGroups: ['seniors', 'rural-traditional']
			}
		],

		localMedia: [
			{
				id: 'brabants-dagblad',
				name: 'Brabants Dagblad',
				type: 'newspaper',
				reach: 0.40,
				credibility: 0.75,
				politicalBias: 0.2,
				cost: 16000,
				effectiveness: 0.7
			},
			{
				id: 'omroep-brabant',
				name: 'Omroep Brabant',
				type: 'tv',
				reach: 0.50,
				credibility: 0.7,
				politicalBias: 0.0,
				cost: 20000,
				effectiveness: 0.75
			}
		],

		demographicModifiers: {
			'young-professionals': {
				prevalenceMultiplier: 1.4,
				issueImportanceModifiers: {
					'economy': 1.3,
					'housing': 1.4
				}
			}
		}
	},

	{
		id: 'central-netherlands',
		name: 'Midden-Nederland (Utrecht, Flevoland)',
		type: 'suburban',
		population: 1500000,
		electoralWeight: 8.7,
		provinces: ['Utrecht', 'Flevoland'],
		majorCities: ['Utrecht', 'Amersfoort', 'Almere', 'Lelystad'],

		economicProfile: {
			primaryIndustries: ['Services', 'Education', 'Healthcare', 'Agriculture'],
			unemploymentRate: 3.9,
			averageIncome: 44000,
			housingPrices: 420000
		},

		politicalProfile: {
			historicalLeaning: 'center',
			volatility: 0.6,
			turnoutRate: 0.83,
			euSupport: 0.70
		},

		localIssues: [
			{
				id: 'almere-new-city',
				name: 'New City Development Challenges',
				description: 'Rapidly growing new cities like Almere facing infrastructure and identity issues',
				category: 'governance',
				severity: 6,
				nationalRelevance: 0.6,
				polarization: 0.3,
				affectedGroups: ['suburban-families', 'young-professionals']
			},
			{
				id: 'polder-agriculture',
				name: 'Polder Agriculture Future',
				description: 'Sustainable farming in reclaimed land amid climate change concerns',
				category: 'environment',
				severity: 5,
				nationalRelevance: 0.7,
				polarization: 0.4,
				affectedGroups: ['rural-traditional', 'urban-progressive']
			}
		],

		localMedia: [
			{
				id: 'ad-utrecht',
				name: 'AD Utrecht',
				type: 'newspaper',
				reach: 0.35,
				credibility: 0.75,
				politicalBias: 0.0,
				cost: 13000,
				effectiveness: 0.7
			}
		],

		demographicModifiers: {
			'suburban-families': {
				prevalenceMultiplier: 1.5,
				issueImportanceModifiers: {
					'education': 1.3,
					'housing': 1.2
				}
			}
		}
	}
];

// Helper functions for regional calculations
export function calculateRegionalSupport(
	regionId: string,
	baseDemographicSupport: { [demographicId: string]: number },
	localIssuePositions: { [issueId: string]: number }
): number {
	const region = DUTCH_REGIONS.find(r => r.id === regionId);
	if (!region) return 0;

	let totalSupport = 0;
	let totalWeight = 0;

	// Apply demographic modifiers for this region
	Object.entries(baseDemographicSupport).forEach(([demographicId, support]) => {
		const modifier = region.demographicModifiers[demographicId];
		const weight = modifier ? modifier.prevalenceMultiplier : 1.0;

		totalSupport += support * weight;
		totalWeight += weight;
	});

	// Apply local issue bonuses/penalties
	let localIssueModifier = 1.0;
	region.localIssues.forEach(issue => {
		const playerPosition = localIssuePositions[issue.id];
		if (playerPosition !== undefined) {
			// Calculate how well player's position aligns with local sentiment
			// This is simplified - in reality would depend on region's stance on the issue
			const alignmentBonus = (1 - Math.abs(playerPosition) / 100) * issue.severity * 0.02;
			localIssueModifier += alignmentBonus;
		}
	});

	return totalWeight > 0 ? (totalSupport / totalWeight) * localIssueModifier : 0;
}

export function getRegionalMediaCoverage(
	regionId: string,
	mediaSpend: { [mediaId: string]: number }
): number {
	const region = DUTCH_REGIONS.find(r => r.id === regionId);
	if (!region) return 0;

	let totalCoverage = 0;
	region.localMedia.forEach(outlet => {
		const spend = mediaSpend[outlet.id] || 0;
		if (spend > 0) {
			const coverage = Math.min(1, spend / outlet.cost) * outlet.reach * outlet.effectiveness;
			totalCoverage += coverage;
		}
	});

	return Math.min(1, totalCoverage);
}