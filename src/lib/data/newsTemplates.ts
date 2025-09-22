import type { NewsEventTemplate, ResponseTemplate } from '../types/news.js';

// News event templates for procedural generation
export const NEWS_EVENT_TEMPLATES: NewsEventTemplate[] = [
	// Economy Events
	{
		id: 'inflation-spike',
		category: 'economy',
		urgency: 'high',
		headlineTemplates: [
			'Inflation Hits {{rate}}% - Highest in {{years}} Years',
			'Cost of Living Crisis: Inflation Soars to {{rate}}%',
			'Dutch Families Struggle as Inflation Reaches {{rate}}%'
		],
		descriptionTemplates: [
			'Consumer prices have risen to {{rate}}% year-over-year, putting pressure on Dutch households. Opposition parties are calling for immediate government action.',
			'The latest CBS statistics show inflation at {{rate}}%, driven by {{cause}}. Citizens are demanding political solutions to the cost of living crisis.'
		],
		triggerChance: 15,
		triggerConditions: [
			{ type: 'random', condition: 'true', multiplier: 1.0 },
			{ type: 'day', condition: 'day > 10', multiplier: 1.5 },
			{ type: 'polling', condition: 'polling < 40', multiplier: 2.0 }
		],
		primaryIssue: 'economy',
		secondaryIssues: ['housing'],
		responseTemplates: [
			{
				type: 'talkshow',
				titleTemplate: 'Defend Economic Policies on {{show}}',
				descriptionTemplate: 'Appear on {{show}} to explain your party\'s position on inflation and economic management.',
				tone: 'defensive',
				basePollingImpact: 2,
				demographicMultipliers: { 'elderly': 1.5, 'working-class': 1.3 }
			},
			{
				type: 'tweet',
				titleTemplate: 'Social Media Response on Economy',
				descriptionTemplate: 'Send a measured response addressing inflation concerns while highlighting your economic plan.',
				tone: 'analytical',
				basePollingImpact: 1,
				demographicMultipliers: { 'young': 1.2, 'urban': 1.1 }
			},
			{
				type: 'policy-proposal',
				titleTemplate: 'Emergency Economic Relief Package',
				descriptionTemplate: 'Propose concrete measures to address inflation and support Dutch families.',
				tone: 'empathetic',
				basePollingImpact: 4,
				demographicMultipliers: { 'working-class': 2.0, 'middle-aged': 1.5 },
				minimumStats: { 'negotiation': 6 }
			},
			{
				type: 'ignore',
				titleTemplate: 'No Public Response',
				descriptionTemplate: 'Choose not to comment publicly on the inflation figures.',
				tone: 'dismissive',
				basePollingImpact: -2,
				demographicMultipliers: { 'working-class': -1.5 }
			}
		]
	},

	// Immigration Events
	{
		id: 'refugee-crisis',
		category: 'social',
		urgency: 'high',
		headlineTemplates: [
			'{{number}} Asylum Seekers Arrive in Netherlands This Week',
			'Refugee Housing Crisis Intensifies with {{number}} New Arrivals',
			'Local Communities Split Over {{number}} Asylum Seekers'
		],
		descriptionTemplates: [
			'A new wave of {{number}} asylum seekers has arrived, reigniting debates about Dutch immigration policy and integration programs.',
			'Housing shortages for refugees have reached crisis levels with {{number}} people still awaiting placement. Local municipalities are calling for government support.'
		],
		triggerChance: 12,
		triggerConditions: [
			{ type: 'random', condition: 'true', multiplier: 1.0 },
			{ type: 'day', condition: 'day > 5', multiplier: 1.3 }
		],
		primaryIssue: 'immigration',
		secondaryIssues: ['housing', 'security'],
		responseTemplates: [
			{
				type: 'press-conference',
				titleTemplate: 'Address Immigration Policy',
				descriptionTemplate: 'Hold a press conference to outline your party\'s stance on refugee policy and integration.',
				tone: 'empathetic',
				basePollingImpact: 3,
				demographicMultipliers: { 'urban': 1.5, 'educated': 1.3, 'rural': -0.5 }
			},
			{
				type: 'interview',
				titleTemplate: 'Radio Interview on Refugee Crisis',
				descriptionTemplate: 'Give a detailed interview explaining your balanced approach to immigration.',
				tone: 'analytical',
				basePollingImpact: 1,
				demographicMultipliers: { 'middle-aged': 1.2 }
			},
			{
				type: 'tweet',
				titleTemplate: 'Strong Statement on Immigration',
				descriptionTemplate: 'Post a firm but compassionate statement about Dutch immigration policy.',
				tone: 'aggressive',
				basePollingImpact: 2,
				demographicMultipliers: { 'young': 1.1, 'rural': 1.4, 'urban': -0.3 }
			}
		]
	},

	// Scandal Events
	{
		id: 'corruption-allegation',
		category: 'scandal',
		urgency: 'crisis',
		headlineTemplates: [
			'Opposition Alleges {{party}} Corruption in {{sector}} Deals',
			'{{amount}} Euro Contract Under Investigation - {{party}} Involved',
			'Whistleblower Claims Corruption in {{party}} {{department}}'
		],
		descriptionTemplates: [
			'Serious allegations have emerged regarding {{party}} involvement in {{sector}} contracts worth {{amount}} euros. Your party demands immediate response.',
			'A former insider has come forward with documents suggesting improper influence in {{department}} decisions. Media attention is intense.'
		],
		triggerChance: 8,
		triggerConditions: [
			{ type: 'polling', condition: 'polling > 50', multiplier: 1.5 },
			{ type: 'day', condition: 'day > 15', multiplier: 1.2 }
		],
		primaryIssue: 'economy',
		responseTemplates: [
			{
				type: 'press-conference',
				titleTemplate: 'Emergency Press Conference',
				descriptionTemplate: 'Call an immediate press conference to address the allegations head-on.',
				tone: 'defensive',
				basePollingImpact: -1,
				demographicMultipliers: { 'all': 1.0 },
				requiredTraits: ['honest']
			},
			{
				type: 'statement',
				titleTemplate: 'Official Written Statement',
				descriptionTemplate: 'Release a carefully crafted written statement denying wrongdoing.',
				tone: 'analytical',
				basePollingImpact: -2,
				demographicMultipliers: { 'educated': 0.8 }
			},
			{
				type: 'ignore',
				titleTemplate: 'No Comment Strategy',
				descriptionTemplate: 'Refuse to comment until investigations are complete.',
				tone: 'dismissive',
				basePollingImpact: -4,
				demographicMultipliers: { 'all': 1.2 }
			}
		]
	},

	// Climate Events
	{
		id: 'extreme-weather',
		category: 'environment',
		urgency: 'medium',
		headlineTemplates: [
			'Severe {{weather}} Hits Netherlands - Climate Action Demanded',
			'{{weather}} Causes €{{damage}}M Damage Across Country',
			'Record-Breaking {{weather}} Sparks Climate Debate'
		],
		descriptionTemplates: [
			'Extreme {{weather}} has caused significant damage across the Netherlands, with climate activists calling for immediate government action on emissions.',
			'The unprecedented {{weather}} event has resulted in €{{damage}} million in damages, intensifying discussions about climate adaptation and prevention.'
		],
		triggerChance: 10,
		triggerConditions: [
			{ type: 'random', condition: 'true', multiplier: 1.0 },
			{ type: 'day', condition: 'day % 7 === 0', multiplier: 1.8 }
		],
		primaryIssue: 'climate',
		secondaryIssues: ['economy'],
		responseTemplates: [
			{
				type: 'policy-proposal',
				titleTemplate: 'Emergency Climate Action Plan',
				descriptionTemplate: 'Propose immediate climate adaptation measures and long-term emissions reduction.',
				tone: 'empathetic',
				basePollingImpact: 5,
				demographicMultipliers: { 'young': 2.0, 'educated': 1.5, 'urban': 1.3 },
				minimumStats: { 'integrity': 7 }
			},
			{
				type: 'talkshow',
				titleTemplate: 'Climate Discussion on {{show}}',
				descriptionTemplate: 'Participate in a climate-focused talk show to discuss your environmental policies.',
				tone: 'analytical',
				basePollingImpact: 2,
				demographicMultipliers: { 'young': 1.5, 'educated': 1.2 }
			},
			{
				type: 'tweet',
				titleTemplate: 'Climate Solidarity Message',
				descriptionTemplate: 'Express solidarity with affected communities while outlining climate priorities.',
				tone: 'empathetic',
				basePollingImpact: 1,
				demographicMultipliers: { 'young': 1.3, 'urban': 1.1 }
			}
		]
	},

	// Healthcare Events
	{
		id: 'hospital-shortage',
		category: 'healthcare',
		urgency: 'high',
		headlineTemplates: [
			'{{hospital}} Faces Critical Staff Shortage',
			'Healthcare Crisis: {{percentage}}% of Nurses Consider Quitting',
			'Emergency Services Overwhelmed at {{hospital}}'
		],
		descriptionTemplates: [
			'{{hospital}} is operating at critically low staff levels, with {{percentage}}% of positions unfilled. Healthcare workers are demanding immediate government action.',
			'A staffing crisis at {{hospital}} has led to delayed treatments and overworked medical staff. The situation highlights systemic issues in Dutch healthcare.'
		],
		triggerChance: 11,
		triggerConditions: [
			{ type: 'random', condition: 'true', multiplier: 1.0 },
			{ type: 'day', condition: 'day > 8', multiplier: 1.4 }
		],
		primaryIssue: 'healthcare',
		secondaryIssues: ['economy'],
		responseTemplates: [
			{
				type: 'interview',
				titleTemplate: 'Healthcare Policy Interview',
				descriptionTemplate: 'Give an in-depth interview about your plans for healthcare reform and funding.',
				tone: 'empathetic',
				basePollingImpact: 3,
				demographicMultipliers: { 'elderly': 1.8, 'middle-aged': 1.4 }
			},
			{
				type: 'policy-proposal',
				titleTemplate: 'Healthcare Emergency Funding',
				descriptionTemplate: 'Propose emergency funding and structural reforms for the healthcare system.',
				tone: 'analytical',
				basePollingImpact: 4,
				demographicMultipliers: { 'elderly': 2.0, 'working-class': 1.5 },
				minimumStats: { 'competence': 6 }
			},
			{
				type: 'private-meeting',
				titleTemplate: 'Meet with Healthcare Leaders',
				descriptionTemplate: 'Arrange private meetings with hospital administrators and union representatives.',
				tone: 'empathetic',
				basePollingImpact: 2,
				demographicMultipliers: { 'elderly': 1.3 },
				requiredTraits: ['diplomatic']
			}
		]
	},

	// International Events
	{
		id: 'eu-conflict',
		category: 'international',
		urgency: 'medium',
		headlineTemplates: [
			'Netherlands Clashes with {{country}} Over {{issue}}',
			'EU Summit: Dutch Position on {{issue}} Under Fire',
			'{{country}} Criticizes Netherlands {{policy}} Policy'
		],
		descriptionTemplates: [
			'Tensions have escalated between the Netherlands and {{country}} over {{issue}}, with Dutch citizens divided on the government\'s response.',
			'At the latest EU summit, the Netherlands found itself isolated on {{issue}}, raising questions about Dutch diplomacy and European relationships.'
		],
		triggerChance: 9,
		triggerConditions: [
			{ type: 'random', condition: 'true', multiplier: 1.0 },
			{ type: 'day', condition: 'day > 12', multiplier: 1.3 }
		],
		primaryIssue: 'eu',
		secondaryIssues: ['economy', 'security'],
		responseTemplates: [
			{
				type: 'statement',
				titleTemplate: 'Defend Dutch Sovereignty',
				descriptionTemplate: 'Issue a strong statement defending Netherlands\' right to independent policy decisions.',
				tone: 'aggressive',
				basePollingImpact: 2,
				demographicMultipliers: { 'rural': 1.5, 'elderly': 1.3, 'educated': -0.3 }
			},
			{
				type: 'interview',
				titleTemplate: 'Diplomatic Balance Interview',
				descriptionTemplate: 'Explain your balanced approach to EU relationships and Dutch interests.',
				tone: 'analytical',
				basePollingImpact: 1,
				demographicMultipliers: { 'educated': 1.4, 'urban': 1.2 }
			},
			{
				type: 'private-meeting',
				titleTemplate: 'Behind-the-Scenes Diplomacy',
				descriptionTemplate: 'Work diplomatically through private channels to resolve the conflict.',
				tone: 'empathetic',
				basePollingImpact: 3,
				demographicMultipliers: { 'educated': 1.5, 'middle-aged': 1.2 },
				requiredTraits: ['diplomatic']
			}
		]
	}
];

// Variables that can be used in templates
export const TEMPLATE_VARIABLES = {
	rate: ['6.2', '7.1', '5.8', '8.3', '4.9'],
	years: ['5', '8', '10', '12', '15'],
	cause: ['energy costs', 'supply chain issues', 'housing prices', 'food costs'],
	number: ['250', '180', '320', '150', '280'],
	party: ['VVD', 'PvdA', 'CDA', 'other parties'],
	amount: ['50', '75', '100', '125', '200'],
	sector: ['construction', 'healthcare', 'energy', 'transport'],
	department: ['Infrastructure', 'Health', 'Economic Affairs', 'Education'],
	weather: ['flooding', 'storms', 'heat waves', 'drought'],
	damage: ['15', '25', '40', '60', '35'],
	show: ['Pauw', 'Jinek', 'Op1', 'Nieuwsuur'],
	hospital: ['OLVG', 'VUmc', 'Erasmus MC', 'UMCG'],
	percentage: ['35', '42', '28', '51', '38'],
	country: ['Germany', 'France', 'Poland', 'Hungary'],
	issue: ['migration', 'energy policy', 'defense spending', 'agricultural rules'],
	policy: ['Climate', 'Immigration', 'Tax', 'Agricultural']
};

// Function to generate news events from templates
export function generateNewsEvent(template: NewsEventTemplate, variables: any = {}) {
	// Select random variations
	const headline = selectRandomTemplate(template.headlineTemplates);
	const description = selectRandomTemplate(template.descriptionTemplates);

	// Apply variable substitution
	const processedHeadline = substituteVariables(headline, variables);
	const processedDescription = substituteVariables(description, variables);

	return {
		id: `${template.id}-${Date.now()}`,
		headline: processedHeadline,
		description: processedDescription,
		category: template.category,
		urgency: template.urgency,
		primaryIssue: template.primaryIssue,
		secondaryIssues: template.secondaryIssues,
		availableResponses: template.responseTemplates.map(rt => ({
			id: `${rt.type}-${Date.now()}`,
			type: rt.type,
			title: substituteVariables(rt.titleTemplate, variables),
			description: substituteVariables(rt.descriptionTemplate, variables),
			tone: rt.tone,
			stance: 'neutral' as const,
			timeRequired: getTimeForResponseType(rt.type),
			pollingImpact: calculatePollingImpact(rt.basePollingImpact, rt.demographicMultipliers),
			trustImpact: rt.type === 'ignore' ? -2 : Math.floor(Math.random() * 3) - 1,
			mediaImpact: rt.type === 'press-conference' ? 3 : Math.floor(Math.random() * 3),
			partyStatsImpact: {},
			backfireChance: Math.floor(Math.random() * 20),
			requiredTraits: rt.requiredTraits,
			requiredStats: rt.minimumStats
		})),
		triggerDay: 0,
		expiresAfterDays: template.urgency === 'crisis' ? 1 : template.urgency === 'high' ? 2 : 3,
		basePollingImpact: -1,
		demographicMultipliers: { 'all': 1.0 },
		mediaAttention: template.urgency === 'crisis' ? 90 : template.urgency === 'high' ? 70 : 50,
		socialMediaViral: Math.random() < 0.3
	};
}

function selectRandomTemplate(templates: string[]): string {
	return templates[Math.floor(Math.random() * templates.length)];
}

function substituteVariables(template: string, variables: any): string {
	let result = template;

	// Replace template variables with random values
	const variablePattern = /\{\{(\w+)\}\}/g;
	result = result.replace(variablePattern, (match, varName) => {
		if (variables[varName]) {
			return variables[varName];
		}
		if (TEMPLATE_VARIABLES[varName as keyof typeof TEMPLATE_VARIABLES]) {
			const options = TEMPLATE_VARIABLES[varName as keyof typeof TEMPLATE_VARIABLES];
			return options[Math.floor(Math.random() * options.length)];
		}
		return match;
	});

	return result;
}

function getTimeForResponseType(type: string): number {
	switch (type) {
		case 'tweet': return 1;
		case 'statement': return 2;
		case 'interview': return 3;
		case 'talkshow': return 4;
		case 'press-conference': return 6;
		case 'policy-proposal': return 8;
		case 'private-meeting': return 12;
		case 'ignore': return 0;
		default: return 2;
	}
}

function calculatePollingImpact(baseImpact: number, multipliers: any): any {
	const demographics = ['young', 'middle-aged', 'elderly', 'urban', 'rural', 'educated', 'working-class'];
	const result: any = {};

	demographics.forEach(demo => {
		const multiplier = multipliers[demo] || 1.0;
		result[demo] = Math.round(baseImpact * multiplier);
	});

	return result;
}