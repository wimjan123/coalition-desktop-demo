export interface DemographicGroup {
	id: string;
	name: string;
	percentage: number; // Percentage of total population
	characteristics: {
		age: 'young' | 'middle' | 'senior';
		education: 'low' | 'medium' | 'high';
		income: 'low' | 'medium' | 'high';
		region: 'urban' | 'suburban' | 'rural';
		religion: 'secular' | 'christian' | 'muslim' | 'other';
	};
	issueImportance: { [issueId: string]: number }; // 1-10 importance
	basePositions: { [issueId: string]: number }; // -100 to 100 political position
	volatility: number; // 0-1, how easily opinions change
}

export interface PopulationSegment {
	groupId: string;
	currentSupport: number; // 0-100 support for player's party
	issuePositions: { [issueId: string]: number }; // Current positions influenced by campaigns
	awareness: number; // 0-100 how aware they are of player's party
	enthusiasm: number; // 0-100 likelihood to vote
}

export interface CampaignEffect {
	groupId: string;
	issueId: string;
	positionShift: number; // How much position changed
	supportChange: number; // How much support changed
	awarenessGain: number; // How much awareness increased
}

// Dutch demographic segments based on real data
export const DUTCH_DEMOGRAPHICS: DemographicGroup[] = [
	{
		id: 'urban-progressive',
		name: 'Urban Progressives',
		percentage: 18,
		characteristics: {
			age: 'young',
			education: 'high',
			income: 'medium',
			region: 'urban',
			religion: 'secular'
		},
		issueImportance: {
			climate: 9,
			immigration: 6,
			economy: 7,
			healthcare: 8,
			housing: 9,
			education: 8,
			eu: 7,
			security: 4
		},
		basePositions: {
			climate: -70,
			immigration: -60,
			economy: -40,
			healthcare: -50,
			housing: -60,
			education: -50,
			eu: -40,
			security: -30
		},
		volatility: 0.6
	},
	{
		id: 'suburban-families',
		name: 'Suburban Families',
		percentage: 22,
		characteristics: {
			age: 'middle',
			education: 'medium',
			income: 'high',
			region: 'suburban',
			religion: 'christian'
		},
		issueImportance: {
			climate: 6,
			immigration: 7,
			economy: 8,
			healthcare: 9,
			housing: 8,
			education: 9,
			eu: 5,
			security: 7
		},
		basePositions: {
			climate: -20,
			immigration: 20,
			economy: 30,
			healthcare: -20,
			housing: 10,
			education: -10,
			eu: 10,
			security: 40
		},
		volatility: 0.4
	},
	{
		id: 'rural-traditional',
		name: 'Rural Traditional',
		percentage: 15,
		characteristics: {
			age: 'senior',
			education: 'low',
			income: 'low',
			region: 'rural',
			religion: 'christian'
		},
		issueImportance: {
			climate: 4,
			immigration: 8,
			economy: 7,
			healthcare: 8,
			housing: 5,
			education: 6,
			eu: 6,
			security: 8
		},
		basePositions: {
			climate: 40,
			immigration: 60,
			economy: 20,
			healthcare: 0,
			housing: 30,
			education: 20,
			eu: 50,
			security: 60
		},
		volatility: 0.2
	},
	{
		id: 'young-professionals',
		name: 'Young Professionals',
		percentage: 16,
		characteristics: {
			age: 'young',
			education: 'high',
			income: 'high',
			region: 'urban',
			religion: 'secular'
		},
		issueImportance: {
			climate: 7,
			immigration: 5,
			economy: 9,
			healthcare: 6,
			housing: 9,
			education: 7,
			eu: 8,
			security: 5
		},
		basePositions: {
			climate: -40,
			immigration: -20,
			economy: 40,
			healthcare: -10,
			housing: -30,
			education: 20,
			eu: -30,
			security: 10
		},
		volatility: 0.5
	},
	{
		id: 'working-class',
		name: 'Working Class',
		percentage: 20,
		characteristics: {
			age: 'middle',
			education: 'low',
			income: 'low',
			region: 'suburban',
			religion: 'secular'
		},
		issueImportance: {
			climate: 5,
			immigration: 8,
			economy: 9,
			healthcare: 9,
			housing: 8,
			education: 7,
			eu: 4,
			security: 7
		},
		basePositions: {
			climate: 20,
			immigration: 50,
			economy: -30,
			healthcare: -40,
			housing: -40,
			education: -20,
			eu: 30,
			security: 30
		},
		volatility: 0.7
	},
	{
		id: 'seniors',
		name: 'Senior Citizens',
		percentage: 9,
		characteristics: {
			age: 'senior',
			education: 'medium',
			income: 'medium',
			region: 'suburban',
			religion: 'christian'
		},
		issueImportance: {
			climate: 4,
			immigration: 6,
			economy: 6,
			healthcare: 10,
			housing: 5,
			education: 4,
			eu: 5,
			security: 8
		},
		basePositions: {
			climate: 10,
			immigration: 30,
			economy: 10,
			healthcare: -30,
			housing: 0,
			education: 10,
			eu: 20,
			security: 40
		},
		volatility: 0.3
	}
];

// Calculate campaign message effectiveness
export function calculateCampaignImpact(
	message: { issueId: string; position: number; tone: 'aggressive' | 'moderate' | 'empathetic' },
	demographics: DemographicGroup[],
	playerStats: { charisma: number; integrity: number; negotiation: number }
): CampaignEffect[] {
	return demographics.map(group => {
		const importance = group.issueImportance[message.issueId] || 1;
		const basePosition = group.basePositions[message.issueId] || 0;
		const positionDistance = Math.abs(message.position - basePosition);

		// Calculate alignment (closer positions = better reception)
		const alignment = Math.max(0, 1 - (positionDistance / 200));

		// Tone effectiveness varies by group
		let toneMultiplier = 1;
		if (message.tone === 'aggressive') {
			toneMultiplier = group.characteristics.age === 'senior' ? 0.7 :
							 group.characteristics.education === 'low' ? 1.2 : 0.8;
		} else if (message.tone === 'empathetic') {
			toneMultiplier = group.characteristics.education === 'high' ? 1.2 :
							 group.characteristics.age === 'young' ? 1.1 : 0.9;
		}

		// Player stats influence effectiveness
		const charismaEffect = (playerStats.charisma / 10);
		const integrityEffect = message.tone === 'moderate' ? (playerStats.integrity / 10) : 1;

		// Calculate effects
		const baseEffect = importance * alignment * toneMultiplier * charismaEffect * integrityEffect;

		return {
			groupId: group.id,
			issueId: message.issueId,
			positionShift: baseEffect * group.volatility * 5, // Small position shift
			supportChange: baseEffect * 3 - 1, // Can be negative if misaligned
			awarenessGain: Math.min(10, baseEffect * 2) // Always some awareness gain
		};
	});
}

// Initialize population state
export function initializePopulation(): { [groupId: string]: PopulationSegment } {
	const population: { [groupId: string]: PopulationSegment } = {};

	DUTCH_DEMOGRAPHICS.forEach(group => {
		population[group.id] = {
			groupId: group.id,
			currentSupport: 0.1 + Math.random() * 0.9, // Start with minimal support (0.1-1%)
			issuePositions: { ...group.basePositions },
			awareness: 0.5 + Math.random() * 2, // Very low initial awareness (0.5-2.5%)
			enthusiasm: 20 + Math.random() * 10 // Low base turnout for new party
		};
	});

	return population;
}