<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { DUTCH_ISSUES } from '../types/game.js';
	import type { PoliticalPosition, StartingScenario, CharacterBackground, InterviewResponse } from '../types/game.js';

	// Props from CharacterCreation
	export let selectedScenario: StartingScenario;
	export let selectedBackground: CharacterBackground;

	const dispatch = createEventDispatcher();

	// Interview state
	let currentQuestionId: string | null = null;
	let isComplete = false;
	let positions: PoliticalPosition[] = [];
	let interviewStarted = false;

	// Adaptive interview tracking
	let answeredQuestions: string[] = [];
	let selectedAnswers: InterviewResponse[] = [];
	let responseTones: string[] = [];
	let contradictions: { [key: string]: boolean } = {};
	let interviewerMood: 'professional' | 'skeptical' | 'hostile' | 'sympathetic' = 'professional';

	// Interview performance tracking
	let consistencyScore = 100;
	let confidenceScore = 50;
	let authenticityScore = 50;

	// Initialize interviewer mood based on scenario
	$: {
		if (selectedScenario) {
			interviewerMood = selectedScenario.interviewerTone;
		}
	}

	// Dynamic question database with branching logic
	interface InterviewQuestion {
		id: string;
		issueId?: string;
		scenario: string;
		question: string;
		options: {
			text: string;
			position?: number;
			priority?: number;
			tone: 'aggressive' | 'defensive' | 'evasive' | 'confrontational' | 'diplomatic';
			triggers?: string[]; // What follow-up questions this might trigger
		}[];
		conditions?: {
			background?: string[];
			scenario?: string[];
			previousAnswers?: string[];
			mood?: string[];
		};
		followUpTo?: string; // Which question this follows up on
		type: 'opening' | 'follow-up' | 'background-challenge' | 'consistency-check' | 'closing';
	}

	// Base question database - will be filtered dynamically
	const questionDatabase: InterviewQuestion[] = [
		{
			id: 'climate-intro',
			type: 'opening',
			issueId: 'climate',
			scenario: "Good evening, and welcome to 'Political Spotlight.' The Netherlands faces mounting pressure to meet climate targets while maintaining economic growth. A major chemical company in your constituency is threatening to move operations abroad if stricter environmental regulations are imposed, potentially costing 2,000 jobs.",
			question: "How would you balance environmental protection with economic concerns?",
			options: [
				{
					text: "Environmental protection must come first. We need to accelerate the green transition and help workers retrain for clean energy jobs.",
					position: -75,
					priority: 5,
					tone: 'diplomatic',
					triggers: ['climate-follow-up-green']
				},
				{
					text: "We should work with industry to find sustainable solutions that protect both the environment and jobs through innovation incentives.",
					position: -25,
					priority: 4,
					tone: 'diplomatic',
					triggers: ['climate-follow-up-moderate']
				},
				{
					text: "Economic stability is crucial. We should pursue gradual environmental improvements that don't threaten existing employment.",
					position: 25,
					priority: 3,
					tone: 'defensive',
					triggers: ['climate-follow-up-business']
				},
				{
					text: "Market forces should determine the pace of change. Government interference in business decisions hurts our competitiveness.",
					position: 75,
					priority: 2,
					tone: 'aggressive',
					triggers: ['climate-follow-up-market']
				}
			]
		},

		// Background-specific challenge questions
		{
			id: 'toeslagenaffaire-challenge',
			type: 'background-challenge',
			conditions: {
				background: ['toeslagenaffaire-whistleblower']
			},
			scenario: "Let me ask you about your role in exposing the toeslagenaffaire. While many praised your courage, others argue you destroyed families' faith in government institutions.",
			question: "You exposed government racism, but some say you destroyed families' faith in the system. Was the cure worse than the disease?",
			options: [
				{
					text: "The system was already broken. Families deserved to know the truth, even if it was painful.",
					tone: 'confrontational',
					triggers: ['accountability-follow-up']
				},
				{
					text: "I understand the concern, but institutional racism had to be exposed to prevent future harm.",
					tone: 'diplomatic',
					triggers: ['reform-follow-up']
				},
				{
					text: "Perhaps I could have found a quieter way to address these issues internally first.",
					tone: 'defensive',
					triggers: ['weakness-follow-up']
				},
				{
					text: "That question ignores the thousands of families who suffered while politicians stayed silent.",
					tone: 'aggressive',
					triggers: ['media-challenge']
				}
			]
		},
		{
			id: 'shell-executive-challenge',
			type: 'background-challenge',
			conditions: {
				background: ['shell-executive']
			},
			scenario: "During your time at Shell, the company fought against climate regulations while Dutch cities faced increasing flood risks.",
			question: "You profited from fossil fuels while Dutch cities flood. How can you claim to care about climate when you helped cause it?",
			options: [
				{
					text: "I was part of the problem, which is exactly why I understand how to solve it from the inside.",
					tone: 'diplomatic',
					triggers: ['experience-follow-up']
				},
				{
					text: "That's an oversimplification. We need pragmatic energy transition, not ideological purity.",
					tone: 'defensive',
					triggers: ['pragmatism-follow-up']
				},
				{
					text: "I made difficult decisions in a complex industry. Now I want to lead the transition responsibly.",
					tone: 'evasive',
					triggers: ['responsibility-follow-up']
				},
				{
					text: "Shell employed thousands of Dutch workers. Easy to criticize from the sidelines.",
					tone: 'aggressive',
					triggers: ['deflection-follow-up']
				}
			]
		},
		{
			id: 'bbb-defector-challenge',
			type: 'background-challenge',
			conditions: {
				background: ['bbb-defector']
			},
			scenario: "You left the BBB movement that trusted you to represent farmers' interests in national politics.",
			question: "You abandoned the farmers who trusted you. If you'll betray your own people, what makes you think voters can trust you?",
			options: [
				{
					text: "I realized the BBB was becoming too narrow. Farmers need broader political solutions.",
					tone: 'diplomatic',
					triggers: ['evolution-follow-up']
				},
				{
					text: "I never abandoned farmers. I'm fighting for them in a more effective way.",
					tone: 'defensive',
					triggers: ['loyalty-follow-up']
				},
				{
					text: "Sometimes leadership means making unpopular decisions for the greater good.",
					tone: 'confrontational',
					triggers: ['leadership-follow-up']
				},
				{
					text: "The BBB leadership lost sight of farmers' real needs. I stayed true to the original mission.",
					tone: 'aggressive',
					triggers: ['authenticity-follow-up']
				}
			]
		},
		{
			id: 'rutte-survivor-challenge',
			type: 'background-challenge',
			conditions: {
				background: ['rutte-survivor']
			},
			scenario: "You served in the government that lied to Parliament about the toeslagenaffaire and other scandals.",
			question: "You were part of the government that lied to Parliament about the toeslagenaffaire. How are you any different from the corruption you claim to oppose?",
			options: [
				{
					text: "I tried to fix things from within. Sometimes you need experience in government to understand how to reform it.",
					tone: 'defensive',
					triggers: ['insider-follow-up']
				},
				{
					text: "I was complicit, and I take responsibility. That's why I'm committed to radical transparency now.",
					tone: 'diplomatic',
					triggers: ['redemption-follow-up']
				},
				{
					text: "The whole system needs to change. I have the insider knowledge to make that happen.",
					tone: 'confrontational',
					triggers: ['system-change-follow-up']
				},
				{
					text: "Easy to judge from the outside. Governing means making difficult compromises.",
					tone: 'evasive',
					triggers: ['compromise-follow-up']
				},
				{
					text: "At least I had the courage to serve when it mattered. Where were you when tough decisions needed to be made?",
					tone: 'aggressive',
					triggers: ['service-courage-follow-up']
				}
			]
		},

		// Standard interview questions
		{
			id: 'immigration-crisis',
			type: 'opening',
			issueId: 'immigration',
			scenario: "Recent events in Ter Apel have highlighted the asylum system crisis. The reception center is severely overcrowded, with asylum seekers sleeping outdoors. Local residents are concerned about safety and resources, while humanitarian organizations call for immediate action.",
			question: "What is your immediate response to this humanitarian and administrative crisis?",
			options: [
				{
					text: "We need emergency EU assistance and immediate temporary housing solutions for asylum seekers.",
					position: -70,
					priority: 5,
					tone: 'diplomatic',
					triggers: ['immigration-follow-up-open']
				},
				{
					text: "Build more reception centers while streamlining the asylum process to reduce waiting times.",
					position: -20,
					priority: 4,
					tone: 'diplomatic',
					triggers: ['immigration-follow-up-moderate']
				},
				{
					text: "We need to cap asylum numbers and send a clear message that the Netherlands cannot take everyone.",
					position: 40,
					priority: 4,
					tone: 'confrontational',
					triggers: ['immigration-follow-up-restrictive']
				},
				{
					text: "Close Ter Apel and implement strict border controls. This crisis proves our asylum system has failed.",
					position: 80,
					priority: 5,
					tone: 'aggressive',
					triggers: ['immigration-follow-up-closure']
				}
			]
		},

		// Nitrogen crisis question
		{
			id: 'nitrogen-crisis',
			type: 'opening',
			issueId: 'climate',
			scenario: "The nitrogen crisis has brought Dutch agriculture to a standstill. Farmers face forced closures, construction projects are halted, and the economy suffers. Meanwhile, environmental groups demand immediate action to protect nature areas.",
			question: "You say you support both farmers AND the environment. But scientists say livestock must be cut by 30%. Which farmers will you force to close their businesses?",
			options: [
				{
					text: "We need innovation and voluntary buyouts, not forced closures. Technology can solve this.",
					position: 20,
					priority: 4,
					tone: 'evasive',
					triggers: ['nitrogen-follow-up-innovation']
				},
				{
					text: "Some difficult decisions are necessary to meet our environmental obligations and avoid EU sanctions.",
					position: -40,
					priority: 5,
					tone: 'diplomatic',
					triggers: ['nitrogen-follow-up-compliance']
				},
				{
					text: "I refuse to sacrifice Dutch farmers for abstract environmental targets set by Brussels.",
					position: 60,
					priority: 5,
					tone: 'aggressive',
					triggers: ['nitrogen-follow-up-farmers']
				},
				{
					text: "We'll find alternative measures that don't destroy farming communities while meeting emission targets.",
					position: 0,
					priority: 3,
					tone: 'defensive',
					triggers: ['nitrogen-follow-up-alternatives']
				}
			]
		},

		// Housing crisis question
		{
			id: 'housing-crisis',
			type: 'opening',
			issueId: 'economy',
			scenario: "Young Dutch people can't afford homes while international investors buy properties for speculation. Average house prices have doubled in major cities, creating a generation locked out of homeownership.",
			question: "Will you support rent controls to make housing affordable, yes or no?",
			options: [
				{
					text: "Yes, we need immediate rent controls and speculation taxes to protect Dutch families.",
					position: -60,
					priority: 5,
					tone: 'confrontational',
					triggers: ['housing-follow-up-controls']
				},
				{
					text: "We need comprehensive solutions: more building, affordable housing quotas, and investor restrictions.",
					position: -20,
					priority: 4,
					tone: 'evasive',
					triggers: ['housing-follow-up-comprehensive']
				},
				{
					text: "Rent controls will reduce housing supply. We need to build more homes, not control prices.",
					position: 30,
					priority: 4,
					tone: 'defensive',
					triggers: ['housing-follow-up-supply']
				},
				{
					text: "No. Market interventions make housing shortages worse. Remove building regulations instead.",
					position: 70,
					priority: 3,
					tone: 'aggressive',
					triggers: ['housing-follow-up-market']
				}
			]
		},

		// Follow-up questions triggered by responses
		{
			id: 'accountability-follow-up',
			type: 'follow-up',
			followUpTo: 'toeslagenaffaire-challenge',
			scenario: "You say families deserved to know the truth about institutional racism.",
			question: "But wasn't there a way to expose this without destroying public trust in all government institutions?",
			options: [
				{
					text: "Public trust was already destroyed by racist policies. Truth rebuilds trust, lies destroy it.",
					tone: 'confrontational'
				},
				{
					text: "I regret the broader impact, but the specific injustice had to be addressed.",
					tone: 'diplomatic'
				},
				{
					text: "Perhaps the government should have taken responsibility instead of shooting the messenger.",
					tone: 'aggressive'
				},
				{
					text: "I focused on the families affected. Broader institutional questions weren't my priority.",
					tone: 'defensive'
				}
			]
		},

		// Consistency check questions
		{
			id: 'climate-contradiction-check',
			type: 'consistency-check',
			scenario: "Earlier you supported environmental protection, but now you're defending business interests.",
			question: "That contradicts what you just said about climate action. Which position is actually correct?",
			options: [
				{
					text: "Both positions are correct. Climate action must be economically viable to succeed.",
					tone: 'diplomatic'
				},
				{
					text: "I'm being pragmatic. Pure environmental policy without economic consideration fails.",
					tone: 'defensive'
				},
				{
					text: "That's not a contradiction, that's called nuanced policy-making.",
					tone: 'aggressive'
				},
				{
					text: "Climate action is my priority, but we need to consider all stakeholders.",
					tone: 'evasive'
				}
			]
		},

		// Media Pariah and other background challenges
		{
			id: 'media-pariah-challenge',
			type: 'background-challenge',
			conditions: {
				background: ['media-pariah']
			},
			scenario: "You were fired from mainstream media for controversial positions on COVID and immigration.",
			question: "You were fired for controversial views. If mainstream media won't trust you, why should voters?",
			options: [
				{
					text: "Mainstream media fired me for telling truths they didn't want to hear. I represent voters, not media executives.",
					tone: 'aggressive',
					triggers: ['media-independence-follow-up']
				},
				{
					text: "I was punished for asking difficult questions. That's exactly the independence voters need in politics.",
					tone: 'confrontational',
					triggers: ['difficult-questions-follow-up']
				},
				{
					text: "I made mistakes in how I expressed my views, but the underlying concerns were legitimate.",
					tone: 'defensive',
					triggers: ['mistakes-follow-up']
				},
				{
					text: "Media consensus doesn't equal truth. Voters deserve politicians who think independently.",
					tone: 'diplomatic',
					triggers: ['independent-thinking-follow-up']
				}
			]
		},
		{
			id: 'healthcare-pressure',
			issueId: 'healthcare',
			scenario: "Dutch hospitals are facing severe staff shortages, with nurses emigrating to Germany for better conditions. Waiting times have increased dramatically, and some rural areas may lose their hospitals entirely.",
			question: "How would you reform healthcare to address these systemic challenges?",
			options: [
				{
					text: "Increase public healthcare funding, improve working conditions, and reduce privatization in the system.",
					position: -65,
					priority: 5,
					tone: 'confrontational'
				},
				{
					text: "Invest in healthcare education and retention programs while maintaining the current mixed public-private model.",
					position: -15,
					priority: 4,
					tone: 'diplomatic'
				},
				{
					text: "Encourage more private healthcare options to reduce pressure on public system and improve efficiency.",
					position: 35,
					priority: 3,
					tone: 'defensive'
				},
				{
					text: "Transition to a more market-based system with increased individual responsibility and insurance competition.",
					position: 75,
					priority: 2,
					tone: 'aggressive'
				}
			]
		},
		{
			id: 'eu-sovereignty',
			issueId: 'eu',
			scenario: "The European Union is proposing new fiscal rules that would limit the Netherlands' ability to set its own tax rates. Some argue this protects European unity, while others see it as an attack on Dutch sovereignty.",
			question: "What should be the Netherlands' response to increased European fiscal integration?",
			options: [
				{
					text: "Support deeper European integration. Shared challenges require shared solutions and coordinated policies.",
					position: -75,
					priority: 4,
					tone: 'diplomatic',
					triggers: ['eu-follow-up-integration']
				},
				{
					text: "Engage constructively while protecting key Dutch interests and maintaining some fiscal autonomy.",
					position: -20,
					priority: 3,
					tone: 'diplomatic',
					triggers: ['eu-follow-up-balanced']
				},
				{
					text: "Resist fiscal integration that undermines Dutch sovereignty while remaining committed to European cooperation.",
					position: 40,
					priority: 4,
					tone: 'defensive',
					triggers: ['eu-follow-up-resistance']
				},
				{
					text: "Defend Dutch sovereignty strongly and consider reducing EU integration if our interests are not protected.",
					position: 80,
					priority: 5,
					tone: 'confrontational',
					triggers: ['eu-follow-up-sovereignty']
				},
				{
					text: "Brussels can take their fiscal rules and shove them. The Netherlands will set its own tax policy, period.",
					position: 85,
					priority: 5,
					tone: 'aggressive',
					triggers: ['eu-follow-up-hostile']
				}
			]
		},
		{
			id: 'economic-inequality',
			issueId: 'economy',
			scenario: "Income inequality has reached a 30-year high in the Netherlands. The top 1% now controls 25% of national wealth, while many middle-class families struggle with rising costs and stagnant wages.",
			question: "What measures would you take to address growing economic inequality?",
			options: [
				{
					text: "Implement wealth taxes, raise top income tax rates, and expand social programs to redistribute wealth more fairly.",
					position: -80,
					priority: 5,
					tone: 'confrontational',
					triggers: ['inequality-follow-up-redistribution']
				},
				{
					text: "Focus on education, job training, and moderate tax adjustments to create more opportunities for advancement.",
					position: -25,
					priority: 4,
					tone: 'diplomatic',
					triggers: ['inequality-follow-up-opportunity']
				},
				{
					text: "Encourage entrepreneurship and economic growth that benefits everyone rather than redistributive policies.",
					position: 30,
					priority: 3,
					tone: 'defensive',
					triggers: ['inequality-follow-up-growth']
				},
				{
					text: "Reduce taxes and regulations to stimulate job creation and economic mobility through market mechanisms.",
					position: 75,
					priority: 2,
					tone: 'confrontational',
					triggers: ['inequality-follow-up-market']
				},
				{
					text: "Inequality is natural. Successful people deserve their wealth - jealousy won't solve anything.",
					position: 80,
					priority: 3,
					tone: 'aggressive',
					triggers: ['inequality-follow-up-meritocracy']
				}
			]
		},
		{
			id: 'education-reform',
			type: 'opening',
			issueId: 'education',
			scenario: "Dutch education rankings have declined internationally while educational inequality has increased. Children from disadvantaged backgrounds lag significantly behind their peers, and teacher shortages affect school quality.",
			question: "How would you reform education to improve outcomes and equality?",
			options: [
				{
					text: "Increase public education funding, reduce school segregation, and ensure equal resources for all schools.",
					position: -70,
					priority: 5,
					tone: 'diplomatic',
					triggers: ['education-follow-up-equality']
				},
				{
					text: "Improve teacher training and compensation while maintaining the current system with targeted interventions.",
					position: -20,
					priority: 4,
					tone: 'diplomatic',
					triggers: ['education-follow-up-moderate']
				},
				{
					text: "Expand school choice and performance-based funding to improve quality through competition.",
					position: 35,
					priority: 3,
					tone: 'defensive',
					triggers: ['education-follow-up-choice']
				},
				{
					text: "Promote private education and merit-based selection to drive excellence and educational innovation.",
					position: 75,
					priority: 2,
					tone: 'aggressive',
					triggers: ['education-follow-up-private']
				}
			]
		},

		// ===== NEW BACKGROUND-SPECIFIC CHALLENGE QUESTIONS (Task 5.2) =====
		// Gotcha questions targeting controversial backgrounds with Dutch political context

		// Toeslagenaffaire Whistleblower - Second Challenge
		{
			id: 'toeslagenaffaire-consequences',
			type: 'background-challenge',
			conditions: {
				background: ['toeslagenaffaire-whistleblower']
			},
			scenario: "Your whistleblowing led to the fall of Rutte III, cost taxpayers billions in compensation, and destroyed careers of civil servants.",
			question: "Your actions collapsed the government and cost billions. Some families still haven't been compensated while lawyers got rich. Was destroying the system worth it?",
			options: [
				{
					text: "The system destroyed itself through racism. I just exposed what politicians wanted hidden.",
					tone: 'confrontational',
					triggers: ['systematic-racism-follow-up']
				},
				{
					text: "Those billions should have been paid decades ago. The delay is on politicians, not me.",
					tone: 'aggressive',
					triggers: ['political-blame-follow-up']
				},
				{
					text: "I regret the chaos, but systematic injustice required drastic action to fix.",
					tone: 'defensive',
					triggers: ['necessary-chaos-follow-up']
				},
				{
					text: "Every euro spent on compensation was already owed. The real cost was doing nothing.",
					tone: 'diplomatic',
					triggers: ['moral-cost-follow-up']
				}
			]
		},

		// Shell Executive - Second Challenge
		{
			id: 'shell-climate-lawsuits',
			type: 'background-challenge',
			conditions: {
				background: ['shell-executive']
			},
			scenario: "During your tenure, Shell lost the landmark climate case and was ordered to cut emissions by 45%. The company spent millions fighting climate science while you knew the truth.",
			question: "You personally signed off on climate denial campaigns while Shell's own scientists confirmed global warming. How do you sleep at night?",
			options: [
				{
					text: "I followed company policy and legal advice. Personal responsibility lies with the board and shareholders.",
					tone: 'evasive',
					triggers: ['responsibility-deflection-follow-up']
				},
				{
					text: "The transition had to be managed responsibly to protect Dutch jobs and energy security.",
					tone: 'defensive',
					triggers: ['jobs-vs-climate-follow-up']
				},
				{
					text: "I was wrong, and I'm now dedicating my political career to fighting the damage I helped cause.",
					tone: 'diplomatic',
					triggers: ['redemption-path-follow-up']
				},
				{
					text: "Easy to judge from the sidelines. Try making energy decisions for 17 million people.",
					tone: 'aggressive',
					triggers: ['leadership-burden-follow-up']
				}
			]
		},

		// BBB Defector - Second Challenge
		{
			id: 'bbb-betrayal-profits',
			type: 'background-challenge',
			conditions: {
				background: ['bbb-defector']
			},
			scenario: "You used BBB resources, farmer donations, and activist networks to build your profile, then abandoned them when mainstream politics offered better opportunities.",
			question: "Farmers scraped together donations to fund your political career, and you used their trust to climb to power. That's not defection, that's fraud, isn't it?",
			options: [
				{
					text: "I repaid every cent the BBB invested in me when I left. My conscience is clear.",
					tone: 'defensive',
					triggers: ['financial-ethics-follow-up']
				},
				{
					text: "BBB became too radical and anti-democratic. I stayed true to farmers' real interests.",
					tone: 'confrontational',
					triggers: ['radicalization-claim-follow-up']
				},
				{
					text: "Those farmers deserve representation in Parliament, not just protest movements. I'm fighting for them here.",
					tone: 'diplomatic',
					triggers: ['institutional-representation-follow-up']
				},
				{
					text: "Politics is about building coalitions, not staying in ideological bubbles. Farmers need allies.",
					tone: 'aggressive',
					triggers: ['coalition-building-follow-up']
				}
			]
		},

		// Activist Background - First Challenge
		{
			id: 'activist-extremist-past',
			type: 'background-challenge',
			conditions: {
				background: ['activist-background']
			},
			scenario: "Your environmental activism included blocking highways, disrupting parliament, and occupying Shell headquarters. Police arrested you 12 times for public disorder.",
			question: "You broke the law repeatedly as an activist, disrupted democracy, and blocked working people from getting to their jobs. Why should law-abiding citizens trust you?",
			options: [
				{
					text: "Civil disobedience is necessary when democratic institutions fail to address existential threats.",
					tone: 'confrontational',
					triggers: ['civil-disobedience-follow-up']
				},
				{
					text: "I never used violence and always accepted legal consequences. That's principled activism.",
					tone: 'diplomatic',
					triggers: ['peaceful-resistance-follow-up']
				},
				{
					text: "Those arrests were badges of honor. Sometimes democracy needs to be disrupted to save it.",
					tone: 'aggressive',
					triggers: ['disruptive-democracy-follow-up']
				},
				{
					text: "I understand concerns about my methods, but the climate crisis justified extraordinary action.",
					tone: 'defensive',
					triggers: ['climate-justification-follow-up']
				}
			]
		},

		// Activist Background - Second Challenge
		{
			id: 'activist-corporate-hypocrisy',
			type: 'background-challenge',
			conditions: {
				background: ['activist-background']
			},
			scenario: "Despite your anti-corporate activism, you now accept donations from green energy companies and drive a Tesla while ordinary families can't afford electric cars.",
			question: "You've gone from fighting corporations to being funded by them. Green capitalism is still capitalism - aren't you just another sellout?",
			options: [
				{
					text: "Working within the system is how you change it. Pure ideology helps no one.",
					tone: 'diplomatic',
					triggers: ['pragmatic-change-follow-up']
				},
				{
					text: "Green companies are allies in the climate fight. Rejecting help would be stupid.",
					tone: 'aggressive',
					triggers: ['strategic-alliances-follow-up']
				},
				{
					text: "My positions haven't changed, just my methods. The climate needs political solutions now.",
					tone: 'defensive',
					triggers: ['evolving-tactics-follow-up']
				},
				{
					text: "Show me a politician who's never compromised, and I'll show you someone who's never accomplished anything.",
					tone: 'confrontational',
					triggers: ['political-realism-follow-up']
				}
			]
		},

		// Business Leader - First Challenge
		{
			id: 'business-wealth-inequality',
			type: 'background-challenge',
			conditions: {
				background: ['business-leader']
			},
			scenario: "As CEO, you earned 200 times the median worker's salary while cutting jobs and moving production to cheaper countries. Your company avoided taxes through Dutch letterbox structures.",
			question: "You got rich by exploiting Dutch tax loopholes and destroying Dutch jobs. How can you claim to represent working families?",
			options: [
				{
					text: "I created shareholder value and jobs globally. That's what good CEOs do for competitiveness.",
					tone: 'aggressive',
					triggers: ['shareholder-primacy-follow-up']
				},
				{
					text: "Those decisions were necessary for survival in global markets. The alternative was company bankruptcy.",
					tone: 'defensive',
					triggers: ['market-necessity-follow-up']
				},
				{
					text: "I've seen how business decisions affect real families. That experience will guide my politics.",
					tone: 'diplomatic',
					triggers: ['business-experience-follow-up']
				},
				{
					text: "The tax system forced those choices. I want to fix the system that created those perverse incentives.",
					tone: 'confrontational',
					triggers: ['system-reform-follow-up']
				}
			]
		},

		// Business Leader - Second Challenge
		{
			id: 'business-covid-profits',
			type: 'background-challenge',
			conditions: {
				background: ['business-leader']
			},
			scenario: "During COVID, your company took millions in government support while paying out dividends and bonuses. Small businesses went bankrupt while you profited from public money.",
			question: "You took taxpayer money meant to save jobs, then paid it out to shareholders and executives. That's stealing from Dutch families during a crisis, isn't it?",
			options: [
				{
					text: "We followed government rules and saved jobs. Dividend payments came from other sources.",
					tone: 'defensive',
					triggers: ['rule-following-follow-up']
				},
				{
					text: "Companies that survived created more jobs than companies that died. Support worked as intended.",
					tone: 'aggressive',
					triggers: ['survival-benefit-follow-up']
				},
				{
					text: "Those programs were poorly designed by politicians. We operated within legal parameters.",
					tone: 'evasive',
					triggers: ['political-blame-follow-up']
				},
				{
					text: "I regret those decisions and support stricter conditions on future business support programs.",
					tone: 'diplomatic',
					triggers: ['policy-improvement-follow-up']
				}
			]
		},

		// Academic/Expert - First Challenge
		{
			id: 'academic-ivory-tower',
			type: 'background-challenge',
			conditions: {
				background: ['academic-expert']
			},
			scenario: "You spent decades in universities earning a professor's salary while Dutch families struggled with real problems. Your research was funded by EU grants that Dutch taxpayers pay for.",
			question: "You've lived in an academic bubble, funded by taxpayers, writing papers nobody reads. What do you know about real life in the Netherlands?",
			options: [
				{
					text: "Academic research informs evidence-based policy. That's exactly what Dutch politics needs more of.",
					tone: 'confrontational',
					triggers: ['evidence-based-policy-follow-up']
				},
				{
					text: "I studied Dutch society systematically. That's more insight than most politicians' anecdotes provide.",
					tone: 'aggressive',
					triggers: ['systematic-knowledge-follow-up']
				},
				{
					text: "Universities serve society by developing knowledge. That research helps solve real problems.",
					tone: 'diplomatic',
					triggers: ['university-purpose-follow-up']
				},
				{
					text: "I've also worked in business and consulted for government. My experience isn't purely academic.",
					tone: 'defensive',
					triggers: ['diverse-experience-follow-up']
				}
			]
		},

		// Academic/Expert - Second Challenge
		{
			id: 'academic-expert-wrong',
			type: 'background-challenge',
			conditions: {
				background: ['academic-expert']
			},
			scenario: "Your economic models predicted the eurozone would strengthen Dutch competitiveness, but it led to austerity and slower growth. Your climate models underestimated the speed of change.",
			question: "Your expert predictions were wrong about the euro, wrong about climate timing, wrong about COVID spread. Why should voters trust experts who keep getting it wrong?",
			options: [
				{
					text: "Science evolves as we learn more. That's intellectual honesty, not failure.",
					tone: 'diplomatic',
					triggers: ['scientific-evolution-follow-up']
				},
				{
					text: "My predictions were based on best available data. Politicians ignored uncertainty ranges in my analysis.",
					tone: 'defensive',
					triggers: ['data-limitations-follow-up']
				},
				{
					text: "Better imperfect analysis than political gut feelings. At least I show my working.",
					tone: 'aggressive',
					triggers: ['analysis-vs-intuition-follow-up']
				},
				{
					text: "Experts aren't fortune tellers. We provide tools for decision-making under uncertainty.",
					tone: 'confrontational',
					triggers: ['uncertainty-management-follow-up']
				}
			]
		},

		// Former Civil Servant - First Challenge
		{
			id: 'civil-servant-system-failure',
			type: 'background-challenge',
			conditions: {
				background: ['civil-servant']
			},
			scenario: "As a senior civil servant, you implemented the policies that created the toeslagenaffaire, housing crisis, and nitrogen deadlock. You were part of the system that failed Dutch families.",
			question: "You spent your career implementing failed policies that hurt ordinary Dutch people. How are you the solution when you were part of the problem?",
			options: [
				{
					text: "I saw the system's flaws from inside and know exactly how to fix them.",
					tone: 'confrontational',
					triggers: ['insider-knowledge-follow-up']
				},
				{
					text: "Civil servants implement political decisions. The failures were political, not administrative.",
					tone: 'defensive',
					triggers: ['political-vs-administrative-follow-up']
				},
				{
					text: "I tried to reform the system from within. Political change requires different tools.",
					tone: 'diplomatic',
					triggers: ['internal-reform-limits-follow-up']
				},
				{
					text: "I followed orders and professional ethics. Blaming civil servants misses the real problems.",
					tone: 'aggressive',
					triggers: ['professional-duty-follow-up']
				}
			]
		},

		// Former Civil Servant - Second Challenge
		{
			id: 'civil-servant-bureaucratic-elite',
			type: 'background-challenge',
			conditions: {
				background: ['civil-servant']
			},
			scenario: "You epitomize the bureaucratic elite that ordinary Dutch people distrust. Safe government job, good pension, making rules for people whose lives you don't understand.",
			question: "You're the embodiment of everything wrong with Dutch bureaucracy - comfortable elites making rules for people you've never met. Why should anyone vote for more bureaucracy?",
			options: [
				{
					text: "Government exists to serve citizens. I understand that mission from 20 years of public service.",
					tone: 'diplomatic',
					triggers: ['public-service-mission-follow-up']
				},
				{
					text: "I know where the bodies are buried in Dutch bureaucracy. That's exactly what we need to clean it up.",
					tone: 'aggressive',
					triggers: ['bureaucracy-reform-follow-up']
				},
				{
					text: "Civil servants work with citizens daily on housing, benefits, permits. I understand their needs directly.",
					tone: 'defensive',
					triggers: ['citizen-interaction-follow-up']
				},
				{
					text: "Less bureaucracy sounds good until your house floods or food poisoning kills your child. Government matters.",
					tone: 'confrontational',
					triggers: ['government-necessity-follow-up']
				}
			]
		},

		// Media Background - Second Challenge
		{
			id: 'media-bias-agenda',
			type: 'background-challenge',
			conditions: {
				background: ['media-background']
			},
			scenario: "As a journalist, you promoted immigration, climate activism, and EU integration. Your reporting shaped public opinion while claiming objectivity.",
			question: "You spent years pushing a left-wing agenda while pretending to be objective. Now you want to drop the pretense and push that agenda directly. At least you're honest about your bias now?",
			options: [
				{
					text: "Good journalism requires advocating for truth and human rights. That's not bias, that's ethics.",
					tone: 'confrontational',
					triggers: ['journalistic-ethics-follow-up']
				},
				{
					text: "I reported facts. If facts have a liberal bias, that says more about conservative positions than journalism.",
					tone: 'aggressive',
					triggers: ['facts-vs-bias-follow-up']
				},
				{
					text: "Every journalist has perspectives. The difference is being transparent about them in politics.",
					tone: 'diplomatic',
					triggers: ['transparent-bias-follow-up']
				},
				{
					text: "I covered all sides fairly. My personal views developed from what I witnessed reporting.",
					tone: 'defensive',
					triggers: ['fair-coverage-follow-up']
				}
			]
		},

		// Healthcare Worker - First Challenge
		{
			id: 'healthcare-covid-authority',
			type: 'background-challenge',
			conditions: {
				background: ['healthcare-worker']
			},
			scenario: "During COVID, healthcare workers demanded lockdowns that destroyed businesses and children's education. You prioritized hospital capacity over broader social costs.",
			question: "You pushed for lockdowns that ruined businesses and traumatized children to protect hospital capacity. Why should your medical opinion override everyone else's welfare?",
			options: [
				{
					text: "We prevented healthcare collapse and saved lives. That was our professional duty.",
					tone: 'defensive',
					triggers: ['medical-duty-follow-up']
				},
				{
					text: "I witnessed preventable deaths daily. Anyone criticizing our advice should have worked COVID wards.",
					tone: 'aggressive',
					triggers: ['frontline-experience-follow-up']
				},
				{
					text: "Public health requires balancing many factors. Medical expertise is one input, not the only one.",
					tone: 'diplomatic',
					triggers: ['balanced-expertise-follow-up']
				},
				{
					text: "Dead people don't have jobs or education. Keeping people alive was the prerequisite for everything else.",
					tone: 'confrontational',
					triggers: ['life-first-principle-follow-up']
				}
			]
		},

		// Healthcare Worker - Second Challenge
		{
			id: 'healthcare-system-profits',
			type: 'background-challenge',
			conditions: {
				background: ['healthcare-worker']
			},
			scenario: "Healthcare workers earn good salaries and have strong unions while demanding more money from taxpayers. Meanwhile, patients wait months for care and small businesses struggle with health insurance costs.",
			question: "You earn more than most Dutch workers and have better job security, but constantly demand more taxpayer money. Why should struggling families pay even more for your comfortable lifestyle?",
			options: [
				{
					text: "Healthcare workers earn every euro dealing with life and death decisions. Our salaries reflect that responsibility.",
					tone: 'aggressive',
					triggers: ['professional-value-follow-up']
				},
				{
					text: "Underfunding healthcare hurts patients more than workers. We advocate for better care, not just better pay.",
					tone: 'diplomatic',
					triggers: ['patient-advocacy-follow-up']
				},
				{
					text: "Good healthcare requires skilled professionals. If you want quality care, you need to pay for it.",
					tone: 'confrontational',
					triggers: ['quality-payment-follow-up']
				},
				{
					text: "Many healthcare workers leave for better conditions abroad. Competitive compensation keeps talent in the Netherlands.",
					tone: 'defensive',
					triggers: ['talent-retention-follow-up']
				}
			]
		},

		// Military/Police - First Challenge
		{
			id: 'military-police-violence',
			type: 'background-challenge',
			conditions: {
				background: ['military-police']
			},
			scenario: "Police brutality against minorities, military failures in Afghanistan, and institutional racism in security forces define your professional background.",
			question: "Your career was built on institutions that systematically discriminate against minorities and use violence against citizens. How can you represent everyone when you enforced an unjust system?",
			options: [
				{
					text: "I witnessed these problems firsthand and fought to reform them from within. That's why I'm here.",
					tone: 'diplomatic',
					triggers: ['internal-reform-follow-up']
				},
				{
					text: "The vast majority of security work protects all citizens. A few bad cases don't define the profession.",
					tone: 'defensive',
					triggers: ['professional-defense-follow-up']
				},
				{
					text: "Society needs security services. The question is making them accountable, not eliminating them.",
					tone: 'confrontational',
					triggers: ['necessary-security-follow-up']
				},
				{
					text: "I served with honor under difficult circumstances. Armchair critics don't understand operational realities.",
					tone: 'aggressive',
					triggers: ['operational-reality-follow-up']
				}
			]
		},

		// Military/Police - Second Challenge
		{
			id: 'military-police-authoritarian',
			type: 'background-challenge',
			conditions: {
				background: ['military-police']
			},
			scenario: "Your security background represents authoritarian thinking - following orders, enforcing rules, using force against civilians. These aren't democratic values.",
			question: "You spent your career in hierarchical institutions that suppress individual freedom and democratic dissent. Aren't you exactly the wrong person to represent democratic values?",
			options: [
				{
					text: "Military and police service teaches the value of democratic institutions by protecting them.",
					tone: 'diplomatic',
					triggers: ['democratic-protection-follow-up']
				},
				{
					text: "Someone has to be willing to defend democracy when it's threatened. That requires understanding force.",
					tone: 'confrontational',
					triggers: ['democratic-defense-follow-up']
				},
				{
					text: "Security services operate under civilian control and constitutional law. That's democracy in action.",
					tone: 'defensive',
					triggers: ['civilian-control-follow-up']
				},
				{
					text: "Easy to criticize order and authority until chaos threatens your family's safety.",
					tone: 'aggressive',
					triggers: ['order-necessity-follow-up']
				}
			]
		},

		// ===== NEW CONFRONTATIONAL QUESTIONS (Task 5.1) =====
		// Eva Jinek-style persistent, fact-based challenges covering all Dutch political issues

		{
			id: 'schiphol-disruption',
			type: 'opening',
			issueId: 'economy',
			scenario: "Schiphol Airport faces chaos with flight cancellations affecting hundreds of thousands of travelers. KLM threatens to move operations abroad if slot restrictions continue, potentially costing 100,000 jobs. Meanwhile, residents in surrounding areas suffer from noise pollution and demand flight reductions.",
			question: "You can't have it both ways - either you protect Dutch jobs at Schiphol or you protect residents from noise. Which families will you disappoint?",
			options: [
				{
					text: "We'll cap flights at current levels and help KLM transition to quieter aircraft with government subsidies.",
					position: -30,
					priority: 4,
					tone: 'diplomatic',
					triggers: ['schiphol-follow-up-compromise']
				},
				{
					text: "Economic reality comes first. We need Schiphol to remain competitive or lose our position as Europe's gateway.",
					position: 50,
					priority: 5,
					tone: 'aggressive',
					triggers: ['schiphol-follow-up-economy']
				},
				{
					text: "Residents' health cannot be negotiated. We'll reduce flights even if airlines threaten to leave.",
					position: -60,
					priority: 5,
					tone: 'confrontational',
					triggers: ['schiphol-follow-up-environment']
				},
				{
					text: "This is a false choice. Innovation and smart planning can solve both problems simultaneously.",
					position: 0,
					priority: 3,
					tone: 'evasive',
					triggers: ['schiphol-follow-up-innovation']
				}
			]
		},

		{
			id: 'pension-robbery',
			type: 'opening',
			issueId: 'economy',
			scenario: "The new pension system forces Dutch workers to gamble their retirement on stock markets. A construction worker earning €35,000 now faces uncertainty instead of guaranteed benefits, while wealthy retirees with private pensions remain protected.",
			question: "You're asking ordinary workers to take investment risks that rich people avoid with their private pensions. How is that fair?",
			options: [
				{
					text: "The old system was unsustainable. This reform ensures pensions exist for future generations.",
					position: 40,
					priority: 4,
					tone: 'defensive',
					triggers: ['pension-follow-up-necessity']
				},
				{
					text: "We need stronger guarantees for basic pensions while allowing market participation for additional benefits.",
					position: -20,
					priority: 4,
					tone: 'diplomatic',
					triggers: ['pension-follow-up-hybrid']
				},
				{
					text: "Market-based pensions offer better returns. Workers should have the freedom to build wealth.",
					position: 60,
					priority: 3,
					tone: 'aggressive',
					triggers: ['pension-follow-up-freedom']
				},
				{
					text: "You're right - we need to return to guaranteed defined benefit pensions funded by employer contributions.",
					position: -70,
					priority: 5,
					tone: 'confrontational',
					triggers: ['pension-follow-up-guarantee']
				}
			]
		},

		{
			id: 'ukraine-weapons',
			type: 'opening',
			issueId: 'security',
			scenario: "The Netherlands has sent €3.8 billion in weapons to Ukraine while Dutch hospitals face budget cuts and teachers strike for better pay. Ukrainian refugees receive immediate housing while Dutch families wait years on housing lists.",
			question: "Why do Ukrainian needs come before Dutch citizens? Shouldn't charity begin at home?",
			options: [
				{
					text: "If Ukraine falls, we're next. This investment protects Dutch security and prevents a larger war.",
					position: -50,
					priority: 5,
					tone: 'confrontational',
					triggers: ['ukraine-follow-up-security']
				},
				{
					text: "We can do both - support Ukraine AND invest in Dutch society. This isn't zero-sum.",
					position: -20,
					priority: 4,
					tone: 'evasive',
					triggers: ['ukraine-follow-up-both']
				},
				{
					text: "Dutch taxpayers come first. We should focus on our own problems before sending billions abroad.",
					position: 40,
					priority: 5,
					tone: 'aggressive',
					triggers: ['ukraine-follow-up-domestic']
				},
				{
					text: "We have moral obligations to help refugees and defend democracy, but we need better resource management.",
					position: -30,
					priority: 4,
					tone: 'diplomatic',
					triggers: ['ukraine-follow-up-moral']
				}
			]
		},

		{
			id: 'energy-poverty',
			type: 'opening',
			issueId: 'climate',
			scenario: "Energy prices have tripled since the green transition began. Working families choose between heating and eating while affluent households install solar panels with government subsidies. Meanwhile, energy companies report record profits.",
			question: "Your climate policies are creating a two-tier society where only the rich can afford to be green. How do you justify this?",
			options: [
				{
					text: "Climate action requires short-term sacrifice for long-term survival. We'll increase energy subsidies for low incomes.",
					position: -60,
					priority: 5,
					tone: 'confrontational',
					triggers: ['energy-follow-up-sacrifice']
				},
				{
					text: "We need to phase climate measures more gradually and ensure costs don't fall on working families.",
					position: -10,
					priority: 4,
					tone: 'defensive',
					triggers: ['energy-follow-up-gradual']
				},
				{
					text: "Green subsidies should be means-tested. Help the poor first, then worry about the climate.",
					position: 20,
					priority: 4,
					tone: 'diplomatic',
					triggers: ['energy-follow-up-means-test']
				},
				{
					text: "Expensive energy is the price of environmental virtue. Market forces will eventually solve this.",
					position: 50,
					priority: 3,
					tone: 'aggressive',
					triggers: ['energy-follow-up-market']
				}
			]
		},

		{
			id: 'groningen-gas',
			type: 'opening',
			issueId: 'climate',
			scenario: "Groningen residents still live in damaged homes from gas extraction earthquakes while the government imports expensive Russian gas. The Groningen field could solve energy independence but residents fear for their safety.",
			question: "You lecture us about climate while importing dirty energy from dictators. Why won't you compensate Groningen residents and reopen safe gas extraction?",
			options: [
				{
					text: "Groningen has suffered enough. We must transition to renewables regardless of short-term costs.",
					position: -70,
					priority: 5,
					tone: 'confrontational',
					triggers: ['groningen-follow-up-transition']
				},
				{
					text: "Limited extraction is possible with modern technology and full compensation for residents.",
					position: 10,
					priority: 4,
					tone: 'diplomatic',
					triggers: ['groningen-follow-up-limited']
				},
				{
					text: "Energy independence requires tough choices. We need Groningen gas until renewables are ready.",
					position: 40,
					priority: 4,
					tone: 'defensive',
					triggers: ['groningen-follow-up-independence']
				},
				{
					text: "The market will solve this. Remove regulations and let companies extract safely with full liability.",
					position: 70,
					priority: 3,
					tone: 'aggressive',
					triggers: ['groningen-follow-up-deregulate']
				}
			]
		},

		{
			id: 'multicultural-failure',
			type: 'opening',
			issueId: 'immigration',
			scenario: "Rotterdam and Amsterdam have become majority non-Dutch cities. Moroccan crime gangs control neighborhoods while integration courses fail spectacularly. Meanwhile, white Dutch families flee to smaller towns, creating demographic upheaval.",
			question: "Multiculturalism has clearly failed in major Dutch cities. Will you admit this policy was a mistake?",
			options: [
				{
					text: "That's racist rhetoric. Dutch cities are culturally richer and more dynamic than ever before.",
					position: -70,
					priority: 4,
					tone: 'confrontational',
					triggers: ['multicultural-follow-up-success']
				},
				{
					text: "Integration takes time. We need better programs and more investment in mixed neighborhoods.",
					position: -30,
					priority: 4,
					tone: 'defensive',
					triggers: ['multicultural-follow-up-improvement']
				},
				{
					text: "Some communities integrate better than others. We need honest conversations about cultural compatibility.",
					position: 20,
					priority: 4,
					tone: 'diplomatic',
					triggers: ['multicultural-follow-up-honest']
				},
				{
					text: "You're absolutely right. Uncontrolled immigration has damaged Dutch social cohesion irreparably.",
					position: 60,
					priority: 5,
					tone: 'aggressive',
					triggers: ['multicultural-follow-up-failure']
				}
			]
		},

		{
			id: 'asylum-hotels',
			type: 'opening',
			issueId: 'immigration',
			scenario: "Asylum seekers live in luxury hotels at €100 per night while Dutch homeless people sleep on the streets. Local communities protest as their villages are transformed overnight without consultation. Hotel owners profit while taxpayers foot the bill.",
			question: "Why do foreign asylum seekers get hotel rooms while Dutch homeless people get nothing? Where's the logic in that?",
			options: [
				{
					text: "We have international obligations to provide decent accommodation for asylum seekers fleeing persecution.",
					position: -60,
					priority: 4,
					tone: 'diplomatic',
					triggers: ['asylum-follow-up-obligations']
				},
				{
					text: "This is a temporary emergency measure. We're building proper reception centers to replace hotels.",
					position: -20,
					priority: 3,
					tone: 'defensive',
					triggers: ['asylum-follow-up-temporary']
				},
				{
					text: "Both groups need help, but Dutch homeless should get priority access to Dutch resources.",
					position: 30,
					priority: 4,
					tone: 'confrontational',
					triggers: ['asylum-follow-up-priority']
				},
				{
					text: "This proves our asylum system is broken. Close the hotels and process applications elsewhere in Europe.",
					position: 70,
					priority: 5,
					tone: 'aggressive',
					triggers: ['asylum-follow-up-close']
				}
			]
		},

		{
			id: 'istanbul-convention',
			type: 'opening',
			issueId: 'immigration',
			scenario: "The Istanbul Convention forces the Netherlands to accept gender-based asylum claims while Turkish and Afghan men claim persecution for domestic violence charges. Critics argue this creates asylum shopping and undermines legitimate refugee protection.",
			question: "You're giving asylum to men who beat their wives because they claim their home countries prosecute domestic violence. How does that protect women?",
			options: [
				{
					text: "The Istanbul Convention protects genuine victims of persecution, including men who face honor-based violence.",
					position: -50,
					priority: 4,
					tone: 'defensive',
					triggers: ['istanbul-follow-up-protection']
				},
				{
					text: "We need better screening to ensure only legitimate gender persecution cases qualify for asylum.",
					position: -10,
					priority: 4,
					tone: 'diplomatic',
					triggers: ['istanbul-follow-up-screening']
				},
				{
					text: "International law is being manipulated. We should withdraw from treaties that enable asylum abuse.",
					position: 50,
					priority: 4,
					tone: 'confrontational',
					triggers: ['istanbul-follow-up-withdraw']
				},
				{
					text: "This is exactly why we need stricter asylum rules and national sovereignty over immigration policy.",
					position: 70,
					priority: 5,
					tone: 'aggressive',
					triggers: ['istanbul-follow-up-sovereignty']
				}
			]
		},

		{
			id: 'teacher-exodus',
			type: 'opening',
			issueId: 'education',
			scenario: "Teacher shortages have reached crisis levels with classes of 35+ students and subjects taught by unqualified staff. Young teachers flee to Germany and Belgium for better pay and conditions. Meanwhile, education budgets are spent on diversity consultants and administrative bureaucracy.",
			question: "Teachers are literally fleeing the Netherlands while you spend money on consultants. Don't you think priorities are backwards?",
			options: [
				{
					text: "Teacher pay and working conditions are our absolute priority. We'll redirect all administrative spending to classrooms.",
					position: -40,
					priority: 5,
					tone: 'confrontational',
					triggers: ['teacher-follow-up-priority']
				},
				{
					text: "We need comprehensive reform: better pay, smaller classes, and yes, addressing systemic educational inequality.",
					position: -20,
					priority: 4,
					tone: 'diplomatic',
					triggers: ['teacher-follow-up-comprehensive']
				},
				{
					text: "Market-based solutions work better. Allow schools to set teacher salaries and compete for talent.",
					position: 40,
					priority: 4,
					tone: 'defensive',
					triggers: ['teacher-follow-up-market']
				},
				{
					text: "Foreign teachers and online learning can replace expensive Dutch teachers. Embrace educational innovation.",
					position: 60,
					priority: 3,
					tone: 'aggressive',
					triggers: ['teacher-follow-up-innovation']
				}
			]
		},

		{
			id: 'healthcare-waiting',
			type: 'opening',
			issueId: 'healthcare',
			scenario: "Cancer patients wait months for treatment while health insurers report billion-euro profits. Mental health waiting lists stretch over a year while psychiatrists emigrate to countries with better funding. Emergency rooms close due to staff shortages.",
			question: "People are dying on waiting lists while insurers get rich. How is our healthcare system not completely broken?",
			options: [
				{
					text: "We need to eliminate private health insurance and return to a fully public system with government funding.",
					position: -70,
					priority: 5,
					tone: 'confrontational',
					triggers: ['healthcare-follow-up-public']
				},
				{
					text: "Increase healthcare spending, cap insurance profits, and improve working conditions for medical staff.",
					position: -30,
					priority: 5,
					tone: 'diplomatic',
					triggers: ['healthcare-follow-up-reform']
				},
				{
					text: "Allow more private healthcare options to reduce pressure on the public system and decrease waiting times.",
					position: 30,
					priority: 4,
					tone: 'defensive',
					triggers: ['healthcare-follow-up-private']
				},
				{
					text: "Competition improves quality. Expand private healthcare and let patients choose better insurance options.",
					position: 60,
					priority: 3,
					tone: 'aggressive',
					triggers: ['healthcare-follow-up-competition']
				}
			]
		},

		{
			id: 'brussels-dictatorship',
			type: 'opening',
			issueId: 'eu',
			scenario: "Brussels imposed €4.7 billion in fines on the Netherlands for nitrogen emissions while our farmers face bankruptcy. EU migration quotas force us to accept asylum seekers we can't house. Meanwhile, Eastern European countries ignore EU rules without consequences.",
			question: "Brussels punishes the Netherlands while letting Poland and Hungary break EU law freely. Why should we follow rules that others ignore?",
			options: [
				{
					text: "EU law applies equally to everyone. We must lead by example and work to ensure better enforcement.",
					position: -60,
					priority: 4,
					tone: 'diplomatic',
					triggers: ['brussels-follow-up-equality']
				},
				{
					text: "We need EU reform to ensure fair treatment for all members, including the Netherlands.",
					position: -20,
					priority: 4,
					tone: 'defensive',
					triggers: ['brussels-follow-up-reform']
				},
				{
					text: "The Netherlands should only follow EU rules when other members do the same. Reciprocity matters.",
					position: 30,
					priority: 4,
					tone: 'confrontational',
					triggers: ['brussels-follow-up-reciprocity']
				},
				{
					text: "It's time to consider Nexit. The EU has become a threat to Dutch sovereignty and prosperity.",
					position: 70,
					priority: 5,
					tone: 'aggressive',
					triggers: ['brussels-follow-up-nexit']
				}
			]
		},

		{
			id: 'security-laxity',
			type: 'opening',
			issueId: 'security',
			scenario: "Rotterdam has become Europe's cocaine capital with daily shootings and explosions. Known drug criminals walk free while police lack resources to investigate. Meanwhile, the government talks about prison reform and rehabilitation for violent offenders.",
			question: "Crime is out of control and criminals laugh at our justice system. When will you choose victims over criminals?",
			options: [
				{
					text: "We need community policing, better social programs, and addressing root causes of crime through rehabilitation.",
					position: -50,
					priority: 4,
					tone: 'defensive',
					triggers: ['security-follow-up-community']
				},
				{
					text: "Increase police funding, build more prisons, but also invest in crime prevention and youth programs.",
					position: -10,
					priority: 4,
					tone: 'diplomatic',
					triggers: ['security-follow-up-balanced']
				},
				{
					text: "Zero tolerance for violent crime. Longer sentences, more police powers, and stop coddling criminals.",
					position: 50,
					priority: 5,
					tone: 'confrontational',
					triggers: ['security-follow-up-tough']
				},
				{
					text: "Bring back the death penalty for drug kingpins and deploy the military in Rotterdam to restore order.",
					position: 80,
					priority: 5,
					tone: 'aggressive',
					triggers: ['security-follow-up-extreme']
				}
			]
		},

		{
			id: 'housing-speculation',
			type: 'opening',
			issueId: 'housing',
			scenario: "Chinese investors and European pension funds buy entire Amsterdam neighborhoods while Dutch starters can't get mortgages. A parking space costs €50,000 while teachers and nurses live with their parents. The housing minister owns six rental properties.",
			question: "Foreign speculators are buying our country while Dutch families become homeless in their own land. What will you actually do about it?",
			options: [
				{
					text: "Ban foreign speculation, nationalize land ownership, and build 200,000 social housing units immediately.",
					position: -80,
					priority: 5,
					tone: 'confrontational',
					triggers: ['housing-follow-up-radical']
				},
				{
					text: "Implement speculation taxes, mortgage support for starters, and rapid construction of affordable housing.",
					position: -40,
					priority: 5,
					tone: 'diplomatic',
					triggers: ['housing-follow-up-intervention']
				},
				{
					text: "Remove building regulations, allow taller construction, and let the market build more housing supply.",
					position: 30,
					priority: 4,
					tone: 'defensive',
					triggers: ['housing-follow-up-deregulate']
				},
				{
					text: "Foreign investment creates jobs. Focus on increasing income so Dutch people can compete for housing.",
					position: 60,
					priority: 3,
					tone: 'aggressive',
					triggers: ['housing-follow-up-income']
				}
			]
		},

		{
			id: 'farmer-destruction',
			type: 'opening',
			issueId: 'climate',
			scenario: "Dutch farmers face forced buyouts while the government imports food from countries with lower environmental standards. Family farms that fed Europe for generations will be bulldozed for asylum centers and highways. Meanwhile, Timmermans preaches to the world about sustainability.",
			question: "You're destroying Dutch agriculture to import food from polluting countries. How does that help the environment?",
			options: [
				{
					text: "Some farms must close to meet emission targets, but we'll support transition to sustainable agriculture methods.",
					position: -40,
					priority: 4,
					tone: 'defensive',
					triggers: ['farmer-follow-up-transition']
				},
				{
					text: "Innovation and technology can reduce emissions without closing farms. We reject forced buyouts completely.",
					position: 20,
					priority: 5,
					tone: 'diplomatic',
					triggers: ['farmer-follow-up-innovation']
				},
				{
					text: "Dutch farmers are the most efficient in the world. Climate fanatics are destroying our food security.",
					position: 60,
					priority: 5,
					tone: 'confrontational',
					triggers: ['farmer-follow-up-efficiency']
				},
				{
					text: "Scrap all emission targets and let farmers produce food without Brussels interference.",
					position: 80,
					priority: 5,
					tone: 'aggressive',
					triggers: ['farmer-follow-up-freedom']
				}
			]
		},

		{
			id: 'digital-surveillance',
			type: 'opening',
			issueId: 'security',
			scenario: "The government tracks every citizen's digital activity while claiming to protect privacy. COVID apps monitored movement, bank transactions are reported automatically, and police use facial recognition without warrants. Meanwhile, criminals use encrypted apps freely.",
			question: "Law-abiding citizens are surveilled like criminals while actual criminals use encryption. Isn't this surveillance state backwards?",
			options: [
				{
					text: "Repeal all mass surveillance laws and require judicial warrants for any digital monitoring of citizens.",
					position: -60,
					priority: 4,
					tone: 'confrontational',
					triggers: ['digital-follow-up-privacy']
				},
				{
					text: "Balance security needs with privacy rights through stronger oversight and limited surveillance powers.",
					position: -20,
					priority: 4,
					tone: 'diplomatic',
					triggers: ['digital-follow-up-balance']
				},
				{
					text: "Expand surveillance capabilities but ban criminal encryption to catch real criminals effectively.",
					position: 40,
					priority: 4,
					tone: 'defensive',
					triggers: ['digital-follow-up-criminal']
				},
				{
					text: "Safety requires surveillance. Citizens have nothing to fear if they have nothing to hide.",
					position: 70,
					priority: 3,
					tone: 'aggressive',
					triggers: ['digital-follow-up-safety']
				}
			]
		},

		// ===== SCENARIO-SPECIFIC PROBING QUESTIONS (Task 5.3) =====
		// Questions that probe specific starting scenarios

		// New Party Founder - Challenge about inexperience
		{
			id: 'new-party-inexperience',
			type: 'opening',
			conditions: {
				scenario: ['new-party']
			},
			scenario: "You're starting completely fresh with no political experience, no established network, and no proven track record in government.",
			question: "Why should Dutch voters trust someone with zero political experience when the country faces complex crises requiring experienced leadership?",
			options: [
				{
					text: "Fresh perspective is exactly what Dutch politics needs. Experienced politicians created these problems.",
					tone: 'confrontational',
					triggers: ['outsider-follow-up']
				},
				{
					text: "I bring expertise from other sectors and will surround myself with experienced advisors.",
					tone: 'diplomatic',
					triggers: ['expertise-follow-up']
				},
				{
					text: "The established parties have had decades to solve these problems and failed. Time for new approaches.",
					tone: 'aggressive',
					triggers: ['failure-follow-up']
				},
				{
					text: "Everyone starts somewhere. What matters is having the right vision and values for the Netherlands.",
					tone: 'defensive',
					triggers: ['vision-follow-up']
				}
			]
		},

		// Party Rehabilitator - Challenge about toxic legacy
		{
			id: 'party-rehabilitator-toxic',
			type: 'background-challenge',
			conditions: {
				scenario: ['party-rehabilitator']
			},
			scenario: "You're trying to rehabilitate a party with a toxic reputation - scandals, extremism, or corruption that voters remember clearly.",
			question: "How can you ask voters to trust a party that betrayed their faith before? Isn't this just putting new paint on a rotten foundation?",
			options: [
				{
					text: "We've completely cleaned house. Every person responsible for past failures is gone.",
					tone: 'confrontational',
					triggers: ['clean-house-follow-up']
				},
				{
					text: "The party's values remain sound. It was specific leaders who failed, not our fundamental principles.",
					tone: 'defensive',
					triggers: ['values-follow-up']
				},
				{
					text: "Past mistakes make us stronger. We learned from failure and built better systems to prevent it.",
					tone: 'diplomatic',
					triggers: ['learning-follow-up']
				},
				{
					text: "Every voter deserves representation. Writing off entire parties eliminates democratic choice.",
					tone: 'evasive',
					triggers: ['democracy-follow-up']
				}
			]
		},

		// Scandal Survivor - Personal redemption challenge
		{
			id: 'scandal-survivor-redemption',
			type: 'background-challenge',
			conditions: {
				scenario: ['scandal-survivor']
			},
			scenario: "You're attempting a political comeback after your career was derailed by scandal - whether personal misconduct, corruption, or policy disaster.",
			question: "You had your chance and blew it spectacularly. Why should voters give you a second chance when so many qualified people never get a first one?",
			options: [
				{
					text: "I paid the price for my mistakes and learned from them. That experience makes me a better leader.",
					tone: 'diplomatic',
					triggers: ['redemption-follow-up']
				},
				{
					text: "The scandal was overblown by media and political opponents who wanted me gone.",
					tone: 'defensive',
					triggers: ['persecution-follow-up']
				},
				{
					text: "Democracy means voters decide, not journalists. If they want me back, I'll serve.",
					tone: 'confrontational',
					triggers: ['democracy-choice-follow-up']
				},
				{
					text: "I have unique experience dealing with crisis and accountability that current leaders lack.",
					tone: 'aggressive',
					triggers: ['unique-experience-follow-up']
				}
			]
		},

		// Emergency Replacement - Crisis leadership challenge
		{
			id: 'emergency-replacement-crisis',
			type: 'opening',
			conditions: {
				scenario: ['emergency-replacement']
			},
			scenario: "You've been thrust into leadership after the previous leader resigned in scandal, leaving the party in chaos during a national crisis.",
			question: "You're essentially cleaning up someone else's mess while trying to lead during crisis. How can you provide stability when your own position is inherently unstable?",
			options: [
				{
					text: "Crisis demands decisive action, not endless debate. I'll focus on solutions, not politics.",
					tone: 'confrontational',
					triggers: ['crisis-action-follow-up']
				},
				{
					text: "The party chose me because I have the experience and judgment to handle both challenges.",
					tone: 'diplomatic',
					triggers: ['capability-follow-up']
				},
				{
					text: "Sometimes stability comes from admitting problems and fixing them, not pretending everything is fine.",
					tone: 'aggressive',
					triggers: ['honesty-follow-up']
				},
				{
					text: "I didn't create this situation, but I'm committed to resolving it responsibly.",
					tone: 'defensive',
					triggers: ['responsibility-follow-up']
				}
			]
		},

		// Coalition Defector - Betrayal challenge
		{
			id: 'coalition-defector-betrayal',
			type: 'background-challenge',
			conditions: {
				scenario: ['coalition-defector']
			},
			scenario: "You abandoned a coalition government, potentially destabilizing Dutch governance during critical policy implementation.",
			question: "You broke your commitment to coalition partners and voters who supported that government. If you'll betray them, why wouldn't you betray new supporters?",
			options: [
				{
					text: "I left because they betrayed the principles we promised voters. I stayed loyal to the program.",
					tone: 'confrontational',
					triggers: ['principle-loyalty-follow-up']
				},
				{
					text: "Sometimes difficult decisions require personal sacrifice for the greater good of the country.",
					tone: 'diplomatic',
					triggers: ['greater-good-follow-up']
				},
				{
					text: "Coalition partners ignored my warnings about disastrous policies. I refused to be complicit.",
					tone: 'aggressive',
					triggers: ['warning-ignored-follow-up']
				},
				{
					text: "Political circumstances changed dramatically. Rigid adherence to old agreements would have harmed the Netherlands.",
					tone: 'evasive',
					triggers: ['circumstances-changed-follow-up']
				}
			]
		},

		// Hostile Takeover - Internal warfare challenge
		{
			id: 'hostile-takeover-warfare',
			type: 'background-challenge',
			conditions: {
				scenario: ['hostile-takeover']
			},
			scenario: "You fought a brutal internal war to seize control of your own party, creating divisions and destroying longtime relationships.",
			question: "You tore your own party apart to gain power. If you can't unite your own people, how can you unite the country?",
			options: [
				{
					text: "Sometimes you have to break things to fix them. The party was failing under weak leadership.",
					tone: 'aggressive',
					triggers: ['break-to-fix-follow-up']
				},
				{
					text: "Internal democracy is healthy. Members chose change through legitimate party processes.",
					tone: 'diplomatic',
					triggers: ['democratic-process-follow-up']
				},
				{
					text: "The old guard was leading us to electoral disaster. I saved the party from irrelevance.",
					tone: 'confrontational',
					triggers: ['salvation-follow-up']
				},
				{
					text: "Politics requires difficult choices. Unity without direction is just comfortable failure.",
					tone: 'defensive',
					triggers: ['difficult-choices-follow-up']
				}
			]
		},

		// Multi-scenario: Electoral viability challenge
		{
			id: 'scenario-electoral-math',
			type: 'follow-up',
			conditions: {
				scenario: ['party-rehabilitator', 'scandal-survivor', 'hostile-takeover']
			},
			scenario: "Polling shows your starting position makes electoral success extremely difficult, potentially wasting voters' time and energy.",
			question: "Honest question: Given your starting disadvantages, aren't you just wasting resources that could support viable candidates with better chances?",
			options: [
				{
					text: "Campaigns aren't decided by starting polls. Voters deserve real choice, not predetermined outcomes.",
					tone: 'confrontational',
					triggers: ['voter-choice-follow-up']
				},
				{
					text: "Long-term change requires someone willing to start difficult conversations, even from behind.",
					tone: 'diplomatic',
					triggers: ['long-term-follow-up']
				},
				{
					text: "I've been counted out before and proven the experts wrong. Dutch voters are smarter than pollsters think.",
					tone: 'aggressive',
					triggers: ['underdog-follow-up']
				},
				{
					text: "Democracy works best when voters have genuine alternatives, not just safe establishment choices.",
					tone: 'evasive',
					triggers: ['alternatives-follow-up']
				}
			]
		},

		// Multi-scenario: Coalition potential challenge
		{
			id: 'scenario-coalition-poison',
			type: 'follow-up',
			conditions: {
				scenario: ['party-rehabilitator', 'scandal-survivor', 'coalition-defector', 'hostile-takeover']
			},
			scenario: "Other parties have already indicated they won't work with you in coalition, potentially making your party irrelevant even if elected.",
			question: "If established parties won't work with you, aren't you condemning your supporters to permanent opposition and irrelevance?",
			options: [
				{
					text: "Their refusal to work with us proves they're more interested in protecting their club than serving voters.",
					tone: 'aggressive',
					triggers: ['establishment-club-follow-up']
				},
				{
					text: "Electoral success changes everything. They'll negotiate if voters give us enough seats to be necessary.",
					tone: 'confrontational',
					triggers: ['electoral-necessity-follow-up']
				},
				{
					text: "Opposition can be effective too. Not every contribution requires being in government.",
					tone: 'defensive',
					triggers: ['opposition-value-follow-up']
				},
				{
					text: "Politics is pragmatic. They're saying that now, but positions change when power is at stake.",
					tone: 'diplomatic',
					triggers: ['pragmatic-politics-follow-up']
				}
			]
		},

		// Multi-scenario: Media scrutiny challenge
		{
			id: 'scenario-media-target',
			type: 'follow-up',
			conditions: {
				scenario: ['party-rehabilitator', 'scandal-survivor', 'coalition-defector', 'hostile-takeover']
			},
			scenario: "Your controversial background means every mistake will be magnified, every statement scrutinized, every ally questioned by hostile media.",
			question: "You're starting with a target on your back. How can you govern effectively when every decision will face maximum media hostility?",
			options: [
				{
					text: "Media hostility might actually help by showing voters I'm fighting their establishment.",
					tone: 'confrontational',
					triggers: ['media-advantage-follow-up']
				},
				{
					text: "Good governance speaks louder than media noise. Results will eventually overcome narratives.",
					tone: 'diplomatic',
					triggers: ['results-over-noise-follow-up']
				},
				{
					text: "I've survived media attacks before. Experience teaches you to focus on voters, not journalists.",
					tone: 'aggressive',
					triggers: ['media-survival-follow-up']
				},
				{
					text: "Every leader faces media scrutiny. The question is whether you let it paralyze you or drive better performance.",
					tone: 'defensive',
					triggers: ['scrutiny-motivation-follow-up']
				}
			]
		},

		// Multi-scenario: Voter skepticism challenge
		{
			id: 'scenario-voter-cynicism',
			type: 'closing',
			conditions: {
				scenario: ['party-rehabilitator', 'scandal-survivor', 'emergency-replacement', 'coalition-defector', 'hostile-takeover']
			},
			scenario: "Dutch voters are increasingly cynical about politics. Your controversial path into leadership might reinforce their belief that politics is just about power, not principle.",
			question: "Aren't you part of the problem? Your path to leadership - scandal, betrayal, internal warfare - this is exactly why voters hate politics. How do you restore faith when you represent what's wrong?",
			options: [
				{
					text: "Real change requires people willing to challenge the system from within, even at personal cost.",
					tone: 'confrontational',
					triggers: ['system-challenge-follow-up']
				},
				{
					text: "I understand their cynicism because I've seen how politics really works. That's why I can fix it.",
					tone: 'diplomatic',
					triggers: ['insider-knowledge-follow-up']
				},
				{
					text: "Voters are smart. They can distinguish between fighting for principle and fighting for power.",
					tone: 'defensive',
					triggers: ['voter-intelligence-follow-up']
				},
				{
					text: "The system is already broken. At least I'm honest about the fight instead of pretending everything is fine.",
					tone: 'aggressive',
					triggers: ['honest-fighter-follow-up']
				}
			]
		}
	];

	// Response option templates (Task 6.1)
	const responseTemplates = {
		aggressive: [
			"That's completely wrong and anyone who believes that is naive.",
			"I'm not going to apologize for having strong positions on important issues.",
			"The media keeps pushing this narrative because they can't handle the truth.",
			"Other politicians are too cowardly to say what everyone is thinking.",
			"This question ignores the real issue that everyone else is avoiding."
		],
		defensive: [
			"That's a mischaracterization of my position and you know it.",
			"I'm being targeted unfairly while real problems get ignored.",
			"My record speaks for itself, despite what critics say.",
			"That's taken out of context and doesn't reflect the full situation.",
			"I've always been consistent on this issue if you look at the facts."
		],
		deflection: [
			"The real question is why we're focusing on this instead of what matters to voters.",
			"I think we should be discussing solutions, not playing political games.",
			"That's exactly the kind of insider politics that Dutch people are tired of.",
			"Let me address the underlying issue that's actually important here.",
			"I prefer to focus on results rather than political theater."
		],
		diplomatic: [
			"I understand the concerns on both sides and believe we can find common ground.",
			"This is a complex issue that requires careful consideration of all perspectives.",
			"I'm committed to working with anyone who wants to solve this problem.",
			"There are valid points in that criticism that I take seriously.",
			"I believe in bringing people together rather than driving them apart."
		],
		confrontational: [
			"That question reveals more about your bias than about the actual issue.",
			"I'm not going to let you frame this discussion around false premises.",
			"Let's be honest about what's really happening here instead of playing games.",
			"You're asking the wrong question and I think you know it.",
			"I'll challenge anyone who tries to distort my record for political gain."
		],
		evasive: [
			"That's a very complex issue with many different aspects to consider.",
			"I think the voters will ultimately decide what matters most to them.",
			"There are many factors that need to be taken into account here.",
			"I'm still reviewing all the information before making any final decisions.",
			"The situation is still evolving and I want to be careful about premature judgments."
		]
	};

	// Function to get template response for a given tone
	function getResponseTemplate(tone: string, context?: string): string {
		const templates = responseTemplates[tone as keyof typeof responseTemplates] || responseTemplates.diplomatic;
		const randomTemplate = templates[Math.floor(Math.random() * templates.length)];
		return randomTemplate;
	}

	// Function to create standardized response options for any question
	function createStandardResponseOptions(questionContext: string, includeAllTones: boolean = false) {
		const standardTones = ['aggressive', 'defensive', 'diplomatic', 'confrontational'];
		if (includeAllTones) {
			standardTones.push('evasive', 'deflection');
		}

		return standardTones.map(tone => ({
			text: getResponseTemplate(tone, questionContext),
			tone: tone,
			triggers: [`${tone}-standard-follow-up`]
		}));
	}

	// Consequence preview system (Task 6.5)
	function getResponseConsequences(option: { text: string; position?: number; priority?: number; tone: string; triggers?: string[] }) {
		const consequences = [];

		// Tone-based consequences
		switch (option.tone) {
			case 'aggressive':
				consequences.push({
					type: 'interviewer_mood',
					effect: 'Interviewer becomes more hostile',
					icon: '🔥',
					severity: 'high'
				});
				consequences.push({
					type: 'authenticity',
					effect: '-5 to -10 authenticity',
					icon: '📉',
					severity: 'medium'
				});
				consequences.push({
					type: 'confidence',
					effect: '+5 to +8 confidence',
					icon: '📈',
					severity: 'positive'
				});
				break;

			case 'defensive':
				consequences.push({
					type: 'confidence',
					effect: '-3 confidence',
					icon: '📉',
					severity: 'medium'
				});
				consequences.push({
					type: 'authenticity',
					effect: '+2 authenticity',
					icon: '📈',
					severity: 'low'
				});
				break;

			case 'evasive':
				consequences.push({
					type: 'interviewer_mood',
					effect: 'Interviewer becomes more persistent',
					icon: '🤨',
					severity: 'medium'
				});
				consequences.push({
					type: 'authenticity',
					effect: '-8 to -10 authenticity',
					icon: '📉',
					severity: 'high'
				});
				consequences.push({
					type: 'consistency',
					effect: '-5 consistency',
					icon: '📉',
					severity: 'medium'
				});
				break;

			case 'diplomatic':
				consequences.push({
					type: 'authenticity',
					effect: '+5 to +8 authenticity',
					icon: '📈',
					severity: 'positive'
				});
				consequences.push({
					type: 'interviewer_mood',
					effect: 'May calm hostile interviewer',
					icon: '😊',
					severity: 'positive'
				});
				break;

			case 'confrontational':
				consequences.push({
					type: 'interviewer_mood',
					effect: 'Escalates tension significantly',
					icon: '⚡',
					severity: 'high'
				});
				consequences.push({
					type: 'confidence',
					effect: '+10 confidence',
					icon: '📈',
					severity: 'positive'
				});
				consequences.push({
					type: 'authenticity',
					effect: '+5 authenticity',
					icon: '📈',
					severity: 'positive'
				});
				break;
		}

		// Position-based consequences
		if (option.position !== undefined) {
			if (Math.abs(option.position) > 50) {
				consequences.push({
					type: 'polarization',
					effect: 'Strong position may alienate moderate voters',
					icon: '⚠️',
					severity: 'medium'
				});
			}

			// Check for consistency with existing positions
			const existingPosition = positions.find(p => p.position !== undefined);
			if (existingPosition && Math.abs(option.position - existingPosition.position) > 40) {
				consequences.push({
					type: 'consistency',
					effect: 'May trigger contradiction follow-up',
					icon: '🔄',
					severity: 'high'
				});
			}
		}

		// Background-specific consequences
		const backgroundId = selectedBackground?.id;
		if (backgroundId === 'whistleblower' && option.tone === 'evasive') {
			consequences.push({
				type: 'credibility',
				effect: 'Evasiveness contradicts whistleblower image',
				icon: '⚠️',
				severity: 'high'
			});
		}

		if (backgroundId === 'business-leader' && option.tone === 'aggressive') {
			consequences.push({
				type: 'professionalism',
				effect: 'Aggressive tone may hurt business credibility',
				icon: '💼',
				severity: 'medium'
			});
		}

		// Scenario-specific consequences
		const scenarioId = selectedScenario?.id;
		if (scenarioId === 'scandal-survivor' && option.tone === 'evasive') {
			consequences.push({
				type: 'redemption',
				effect: 'Evasiveness undermines redemption narrative',
				icon: '📉',
				severity: 'high'
			});
		}

		return consequences;
	}

	// Show consequence preview for hovered option
	let hoveredOption: any = null;
	let hoveredConsequences: any[] = [];

	function showConsequencePreview(option: any) {
		hoveredOption = option;
		hoveredConsequences = getResponseConsequences(option);
	}

	function hideConsequencePreview() {
		hoveredOption = null;
		hoveredConsequences = [];
	}

	// Dynamic contradiction follow-up questions (Task 5.4)
	function generateContradictionFollowUp(contradictionType: string, questionId: string, previousResponse: string, currentResponse: string): InterviewQuestion {
		const baseId = `contradiction-${contradictionType}-${Date.now()}`;

		switch (contradictionType) {
			case 'position-flip':
				return {
					id: baseId,
					type: 'consistency-check',
					scenario: `Let me challenge you on something. Earlier in this interview, you took a very different position on this same issue.`,
					question: `You just said "${currentResponse.substring(0, 100)}..." but moments ago you argued "${previousResponse.substring(0, 100)}..." Which one do you actually believe?`,
					options: [
						{
							text: "Both responses reflect different aspects of a complex issue that can't be reduced to simple positions.",
							tone: 'diplomatic',
							triggers: ['complexity-defense-follow-up']
						},
						{
							text: "I was exploring different angles to find the best solution. That's called thinking through problems.",
							tone: 'defensive',
							triggers: ['exploration-follow-up']
						},
						{
							text: "You're trying to create a 'gotcha' moment where none exists. Real leadership means adapting to new information.",
							tone: 'aggressive',
							triggers: ['gotcha-pushback-follow-up']
						},
						{
							text: "Let me clarify my position - I support a balanced approach that considers multiple factors.",
							tone: 'evasive',
							triggers: ['clarification-follow-up']
						},
						{
							text: "You caught an inconsistency. Let me be direct about what I actually believe on this issue.",
							tone: 'confrontational',
							triggers: ['honesty-follow-up']
						}
					]
				};

			case 'issue-contradiction':
				return {
					id: baseId,
					type: 'consistency-check',
					scenario: `I notice you're taking contradictory positions on related issues that most political observers see as logically connected.`,
					question: `How can you simultaneously support both of these positions when they work against each other in practice?`,
					options: [
						{
							text: "Political issues are more complex than simple either/or choices. Nuance isn't contradiction.",
							tone: 'diplomatic',
							triggers: ['nuance-defense-follow-up']
						},
						{
							text: "Those aren't contradictory if you understand the details of implementation and timing.",
							tone: 'defensive',
							triggers: ['implementation-follow-up']
						},
						{
							text: "Real leadership means refusing to be trapped by false dilemmas and finding third options.",
							tone: 'confrontational',
							triggers: ['third-option-follow-up']
						},
						{
							text: "I prioritize outcomes over ideological consistency. What matters is what works for Dutch families.",
							tone: 'aggressive',
							triggers: ['outcomes-over-ideology-follow-up']
						}
					]
				};

			case 'background-betrayal':
				return {
					id: baseId,
					type: 'consistency-check',
					scenario: `Your current position directly contradicts everything your background and experience should have taught you.`,
					question: `Given your background, how can you take a position that goes against everything you claimed to stand for in your previous career?`,
					options: [
						{
							text: "Experience taught me that my old assumptions were wrong. I changed my mind based on evidence.",
							tone: 'diplomatic',
							triggers: ['evidence-change-follow-up']
						},
						{
							text: "People grow and evolve. Rigid adherence to past positions prevents learning and progress.",
							tone: 'defensive',
							triggers: ['growth-follow-up']
						},
						{
							text: "My background gives me unique insight into why that approach fails. I'm not betraying anything.",
							tone: 'confrontational',
							triggers: ['insider-insight-follow-up']
						},
						{
							text: "Politics requires adapting to new circumstances. What worked in my old job doesn't work in politics.",
							tone: 'evasive',
							triggers: ['adaptation-follow-up']
						}
					]
				};

			case 'tone-pattern':
				return {
					id: baseId,
					type: 'consistency-check',
					scenario: `Your tone and approach keep shifting dramatically throughout this interview - diplomatic one moment, aggressive the next.`,
					question: `Voters need to know who you really are. Are you the reasonable diplomat or the aggressive fighter? You can't be both.`,
					options: [
						{
							text: "Effective leadership requires different approaches for different challenges. Flexibility isn't weakness.",
							tone: 'diplomatic',
							triggers: ['flexible-leadership-follow-up']
						},
						{
							text: "I'm showing you I can be both collaborative and tough depending on what the situation demands.",
							tone: 'confrontational',
							triggers: ['situational-leadership-follow-up']
						},
						{
							text: "You're trying to box me into a simple category. Real people are more complex than your labels.",
							tone: 'aggressive',
							triggers: ['complexity-defense-follow-up']
						},
						{
							text: "I believe in meeting people where they are and matching the tone that gets results.",
							tone: 'defensive',
							triggers: ['matching-tone-follow-up']
						}
					]
				};

			default:
				return {
					id: baseId,
					type: 'consistency-check',
					scenario: `I need to challenge you on something that doesn't add up in your responses.`,
					question: `Can you explain the contradiction I'm seeing in your positions?`,
					options: [
						{
							text: "I don't see a contradiction. Can you be more specific about what you think doesn't add up?",
							tone: 'defensive',
							triggers: ['specificity-request-follow-up']
						},
						{
							text: "Complex issues require complex answers. Simple consistency can be simplistic thinking.",
							tone: 'diplomatic',
							triggers: ['complexity-defense-follow-up']
						},
						{
							text: "If there's an inconsistency, it's because I'm still thinking through the implications.",
							tone: 'evasive',
							triggers: ['thinking-process-follow-up']
						}
					]
				};
		}
	}

	// Enhanced question selection with contradiction detection
	function selectNextQuestionWithContradictionCheck(): string | null {
		// First check if we detected any contradictions in the last response
		const lastQuestionId = currentQuestionId;
		const contradictionKeys = Object.keys(contradictions);

		if (contradictionKeys.length > 0 && Math.random() > 0.3) { // 70% chance to follow up on contradiction
			const latestContradiction = contradictionKeys[contradictionKeys.length - 1];

			// Determine contradiction type
			let contradictionType = 'general';
			if (latestContradiction.includes('-flip')) {
				contradictionType = 'position-flip';
			} else if (latestContradiction.includes('background')) {
				contradictionType = 'background-betrayal';
			} else if (responseTones.length >= 2) {
				const lastTwoTones = responseTones.slice(-2);
				if (lastTwoTones[0] !== lastTwoTones[1] &&
					['aggressive', 'diplomatic'].includes(lastTwoTones[0]) &&
					['aggressive', 'diplomatic'].includes(lastTwoTones[1])) {
					contradictionType = 'tone-pattern';
				} else {
					contradictionType = 'issue-contradiction';
				}
			}

			// Generate dynamic follow-up question
			const previousResponse = selectedAnswers.length >= 2 ? selectedAnswers[selectedAnswers.length - 2].text : '';
			const currentResponse = selectedAnswers.length >= 1 ? selectedAnswers[selectedAnswers.length - 1].text : '';

			const contradictionQuestion = generateContradictionFollowUp(
				contradictionType,
				lastQuestionId!,
				previousResponse,
				currentResponse
			);

			// Temporarily add to question database for this interview
			questionDatabase.push(contradictionQuestion);

			return contradictionQuestion.id;
		}

		// If no contradictions or we choose not to follow up, use normal selection logic
		return selectNextQuestion();
	}

	// Calculate final positions based on answers
	function calculatePositions(answers: Array<{issueId: string, position: number, priority: number}>) {
		const issuePositions = new Map<string, {totalWeight: number, weightedSum: number, maxPriority: number}>();

		answers.forEach(answer => {
			const current = issuePositions.get(answer.issueId) || {totalWeight: 0, weightedSum: 0, maxPriority: 0};
			current.totalWeight += answer.priority;
			current.weightedSum += answer.position * answer.priority;
			current.maxPriority = Math.max(current.maxPriority, answer.priority);
			issuePositions.set(answer.issueId, current);
		});

		const finalPositions: PoliticalPosition[] = [];
		issuePositions.forEach((data, issueId) => {
			finalPositions.push({
				issueId,
				position: Math.round(data.weightedSum / data.totalWeight),
				priority: data.maxPriority
			});
		});

		return finalPositions;
	}

	// Branching logic functions
	function getAvailableQuestions(): InterviewQuestion[] {
		return questionDatabase.filter(q => {
			// Don't repeat questions
			if (answeredQuestions.includes(q.id)) return false;

			// Check conditions
			if (q.conditions) {
				if (q.conditions.background && !q.conditions.background.includes(selectedBackground.id)) return false;
				if (q.conditions.scenario && !q.conditions.scenario.includes(selectedScenario.id)) return false;
				if (q.conditions.mood && !q.conditions.mood.includes(interviewerMood)) return false;
			}

			return true;
		});
	}

	function selectNextQuestion(): string | null {
		const available = getAvailableQuestions();

		// Prioritize follow-ups first
		const followUps = available.filter(q => q.type === 'follow-up');
		if (followUps.length > 0) {
			return followUps[0].id;
		}

		// Then background challenges if appropriate
		const backgroundChallenges = available.filter(q => q.type === 'background-challenge');
		if (backgroundChallenges.length > 0 && answeredQuestions.length >= 2) {
			return backgroundChallenges[0].id;
		}

		// Then opening questions
		const openings = available.filter(q => q.type === 'opening');
		if (openings.length > 0) {
			return openings[0].id;
		}

		// End if no more questions
		return null;
	}

	function selectAnswer(option: { text: string; position?: number; priority?: number; tone: string; triggers?: string[] }) {
		const currentQuestion = questionDatabase.find(q => q.id === currentQuestionId);
		if (!currentQuestion) return;

		// Check for consistency before recording response
		const isConsistent = checkResponseConsistency(currentQuestion, option);

		// Record the response
		const response: InterviewResponse = {
			text: option.text,
			position: option.position || 0,
			priority: option.priority || 3,
			tone: option.tone as any,
			consistency: isConsistent
		};

		selectedAnswers.push(response);
		responseTones.push(option.tone);
		answeredQuestions.push(currentQuestionId!);

		// Track contradictions if found
		if (!isConsistent) {
			contradictions[currentQuestionId!] = true;
			// Apply consistency penalty
			consistencyScore = Math.max(0, consistencyScore - 20);
		}

		// Add to political positions if it's a policy question
		if (currentQuestion.issueId && option.position !== undefined && option.priority !== undefined) {
			const existingIndex = positions.findIndex(p => p.issueId === currentQuestion.issueId);
			if (existingIndex >= 0) {
				// Check for position flip (major inconsistency)
				const previousPosition = positions[existingIndex].position;
				const positionChange = Math.abs(option.position - previousPosition);

				if (positionChange > 50) {
					// Major position flip detected
					contradictions[`${currentQuestion.issueId}-flip`] = true;
					consistencyScore = Math.max(0, consistencyScore - 30);
				}

				positions[existingIndex] = {
					issueId: currentQuestion.issueId,
					position: option.position,
					priority: option.priority
				};
			} else {
				positions.push({
					issueId: currentQuestion.issueId,
					position: option.position,
					priority: option.priority
				});
			}
		}

		// Check for triggers and update mood if needed
		updateInterviewerMood(option.tone);

		// Move to next question (check for contradictions first)
		const nextQuestionId = selectNextQuestionWithContradictionCheck();
		if (nextQuestionId) {
			currentQuestionId = nextQuestionId;
		} else {
			completeInterview();
		}
	}

	function updateInterviewerMood(playerTone: string) {
		// Interviewer reacts to player's tone based on their base personality
		const baseTone = selectedScenario.interviewerTone;

		if (playerTone === 'aggressive') {
			if (baseTone === 'hostile') {
				// Hostile interviewers escalate quickly
				interviewerMood = 'hostile';
			} else if (interviewerMood === 'professional') {
				interviewerMood = 'skeptical';
			} else if (interviewerMood === 'skeptical') {
				interviewerMood = 'hostile';
			}
		} else if (playerTone === 'evasive') {
			if (baseTone === 'skeptical' || baseTone === 'hostile') {
				// Skeptical/hostile interviewers push harder on evasion
				interviewerMood = 'hostile';
			} else if (interviewerMood !== 'hostile') {
				interviewerMood = 'skeptical';
			}
		} else if (playerTone === 'diplomatic') {
			if (baseTone === 'sympathetic') {
				// Sympathetic interviewers stay supportive
				interviewerMood = 'sympathetic';
			} else if (interviewerMood === 'hostile' && baseTone !== 'hostile') {
				// Can de-escalate from hostile unless naturally hostile
				interviewerMood = 'skeptical';
			}
		} else if (playerTone === 'confrontational') {
			// Confrontational responses always escalate tension
			if (interviewerMood !== 'hostile') {
				interviewerMood = 'hostile';
			}
		}

		// Update performance scores based on tone tracking
		updatePerformanceScores(playerTone);
	}

	// Response tone detection and tracking system
	function updatePerformanceScores(playerTone: string) {
		const toneWeights = {
			'diplomatic': { confidence: 5, authenticity: 8, consistency: 3 },
			'aggressive': { confidence: 8, authenticity: -5, consistency: -2 },
			'defensive': { confidence: -3, authenticity: 2, consistency: 0 },
			'evasive': { confidence: -8, authenticity: -10, consistency: -5 },
			'confrontational': { confidence: 2, authenticity: -3, consistency: -8 }
		};

		const weights = toneWeights[playerTone as keyof typeof toneWeights] || { confidence: 0, authenticity: 0, consistency: 0 };

		// Apply tone-based scoring adjustments
		confidenceScore = Math.max(0, Math.min(100, confidenceScore + weights.confidence));
		authenticityScore = Math.max(0, Math.min(100, authenticityScore + weights.authenticity));
		consistencyScore = Math.max(0, Math.min(100, consistencyScore + weights.consistency));

		// Additional scenario-specific penalties/bonuses
		applyScenarioModifiers(playerTone);
	}

	function applyScenarioModifiers(playerTone: string) {
		// Scenario-specific tone modifiers
		const scenarioId = selectedScenario.id;
		const backgroundId = selectedBackground.id;

		// High-risk scenarios get penalized for evasive responses
		if (selectedScenario.riskLevel === 'extreme' && playerTone === 'evasive') {
			authenticityScore = Math.max(0, authenticityScore - 15);
			consistencyScore = Math.max(0, consistencyScore - 10);
		}

		// Controversial backgrounds require careful tone management
		if (selectedBackground.riskLevel === 'high' || selectedBackground.riskLevel === 'extreme') {
			if (playerTone === 'aggressive') {
				// Aggressive responses from controversial figures backfire
				authenticityScore = Math.max(0, authenticityScore - 10);
				confidenceScore = Math.max(0, confidenceScore - 5);
			} else if (playerTone === 'diplomatic') {
				// Diplomatic responses help controversial figures
				authenticityScore = Math.min(100, authenticityScore + 5);
			}
		}

		// Specific scenario modifiers
		if (scenarioId === 'whistleblower' && playerTone === 'confrontational') {
			// Whistleblowers get bonus for standing firm
			confidenceScore = Math.min(100, confidenceScore + 10);
			authenticityScore = Math.min(100, authenticityScore + 5);
		} else if (scenarioId === 'scandal-recovery' && playerTone === 'defensive') {
			// Defensive responses hurt scandal recovery
			consistencyScore = Math.max(0, consistencyScore - 10);
			authenticityScore = Math.max(0, authenticityScore - 8);
		}
	}

	function calculateToneConsistency(): number {
		if (responseTones.length < 2) return 100;

		// Calculate tone variation penalty
		const toneVariations = new Set(responseTones).size;
		const maxVariations = Math.min(responseTones.length, 5);

		// Penalty for excessive tone switching
		const variationPenalty = Math.max(0, (toneVariations - 2) * 10);

		// Bonus for consistent diplomatic approach
		const diplomaticCount = responseTones.filter(tone => tone === 'diplomatic').length;
		const diplomaticBonus = diplomaticCount >= responseTones.length * 0.7 ? 10 : 0;

		// Penalty for consecutive aggressive/confrontational responses
		let aggressionPenalty = 0;
		for (let i = 0; i < responseTones.length - 1; i++) {
			if (['aggressive', 'confrontational'].includes(responseTones[i]) &&
				['aggressive', 'confrontational'].includes(responseTones[i + 1])) {
				aggressionPenalty += 15;
			}
		}

		return Math.max(0, Math.min(100, 100 - variationPenalty + diplomaticBonus - aggressionPenalty));
	}

	function getOverallInterviewRating(): { score: number; grade: string; description: string } {
		const overallScore = Math.round((consistencyScore + confidenceScore + authenticityScore) / 3);

		let grade: string;
		let description: string;

		if (overallScore >= 85) {
			grade = 'A+';
			description = 'Excellent performance. Professional, authentic, and consistent responses.';
		} else if (overallScore >= 75) {
			grade = 'A';
			description = 'Strong performance. Mostly consistent with good confidence.';
		} else if (overallScore >= 65) {
			grade = 'B';
			description = 'Solid performance. Some inconsistencies but generally good.';
		} else if (overallScore >= 55) {
			grade = 'C';
			description = 'Average performance. Noticeable weaknesses in tone or consistency.';
		} else if (overallScore >= 45) {
			grade = 'D';
			description = 'Below average. Significant issues with authenticity or evasiveness.';
		} else {
			grade = 'F';
			description = 'Poor performance. Contradictory, evasive, or overly aggressive responses.';
		}

		return { score: overallScore, grade, description };
	}

	// Consistency checking system
	function checkResponseConsistency(currentQuestion: InterviewQuestion, option: { text: string; position?: number; priority?: number; tone: string; triggers?: string[] }): boolean {
		// If this is the first response, it's automatically consistent
		if (selectedAnswers.length === 0) return true;

		// Check for logical contradictions based on issues and positions
		if (currentQuestion.issueId && option.position !== undefined) {
			return checkIssueConsistency(currentQuestion.issueId, option.position);
		}

		// Check for background-specific consistency requirements
		if (currentQuestion.type === 'background-challenge') {
			return checkBackgroundConsistency(currentQuestion, option);
		}

		// Check for scenario-specific consistency
		return checkScenarioConsistency(currentQuestion, option);
	}

	function checkIssueConsistency(issueId: string, newPosition: number): boolean {
		// Find existing position on this issue
		const existingPosition = positions.find(p => p.issueId === issueId);
		if (!existingPosition) return true; // No previous position to contradict

		// Check for major position flip (more than 60 points)
		const positionDiff = Math.abs(newPosition - existingPosition.position);
		if (positionDiff > 60) return false;

		// Check for related issue consistency
		return checkRelatedIssueConsistency(issueId, newPosition);
	}

	function checkRelatedIssueConsistency(issueId: string, newPosition: number): boolean {
		// Define issue relationships and their consistency rules
		const issueRelationships: { [key: string]: { relatedIssue: string; rule: (pos1: number, pos2: number) => boolean }[] } = {
			'climate': [{
				relatedIssue: 'economy',
				rule: (climate: number, economy: number) => {
					// Very pro-environment stance should be somewhat anti-business
					if (climate < -50 && economy > 30) return false;
					// Very pro-business stance should be somewhat anti-environment
					if (economy > 50 && climate < -30) return false;
					return true;
				}
			}],
			'immigration': [{
				relatedIssue: 'culture',
				rule: (immigration: number, culture: number) => {
					// Open immigration typically aligns with multicultural stance
					if (immigration < -30 && culture > 40) return false;
					// Restrictive immigration typically aligns with traditional culture
					if (immigration > 30 && culture < -40) return false;
					return true;
				}
			}],
			'economy': [{
				relatedIssue: 'welfare',
				rule: (economy: number, welfare: number) => {
					// Free market stance should align with limited welfare
					if (economy > 40 && welfare < -20) return true;
					// Social economy should align with expanded welfare
					if (economy < -20 && welfare > 40) return true;
					// Moderate inconsistency is allowed
					return Math.abs(economy + welfare) < 80;
				}
			}]
		};

		const relationships = issueRelationships[issueId] || [];

		for (const relationship of relationships) {
			const relatedPosition = positions.find(p => p.issueId === relationship.relatedIssue);
			if (relatedPosition && !relationship.rule(newPosition, relatedPosition.position)) {
				return false;
			}
		}

		return true;
	}

	function checkBackgroundConsistency(currentQuestion: InterviewQuestion, option: { text: string; position?: number; priority?: number; tone: string; triggers?: string[] }): boolean {
		const backgroundId = selectedBackground.id;

		// Background-specific consistency rules
		switch (backgroundId) {
			case 'whistleblower':
				// Whistleblowers should maintain consistent anti-corruption stance
				if (option.tone === 'evasive' && currentQuestion.question.toLowerCase().includes('corruption')) {
					return false;
				}
				break;

			case 'business-leader':
				// Business leaders should maintain pro-business consistency
				if (option.position !== undefined && option.position < -40 && currentQuestion.issueId === 'economy') {
					return false;
				}
				break;

			case 'activist':
				// Activists should maintain consistent ideological stance
				if (option.tone === 'diplomatic' && currentQuestion.question.toLowerCase().includes('protest')) {
					return false;
				}
				break;

			case 'defector':
				// Defectors can be inconsistent with their original party but should explain
				if (option.tone === 'evasive' && currentQuestion.question.toLowerCase().includes('party')) {
					return false;
				}
				break;
		}

		return true;
	}

	function checkScenarioConsistency(currentQuestion: InterviewQuestion, option: { text: string; position?: number; priority?: number; tone: string; triggers?: string[] }): boolean {
		const scenarioId = selectedScenario.id;

		// Scenario-specific consistency requirements
		switch (scenarioId) {
			case 'scandal-recovery':
				// During scandal recovery, evasive responses are seen as inconsistent
				if (option.tone === 'evasive') return false;
				break;

			case 'coalition-crisis':
				// During coalition crisis, consistent party loyalty is expected
				if (option.tone === 'confrontational' && currentQuestion.question.toLowerCase().includes('coalition')) {
					return false;
				}
				break;

			case 'policy-disaster':
				// After policy disasters, deflection is seen as inconsistent
				if (option.tone === 'evasive' && currentQuestion.question.toLowerCase().includes('responsibility')) {
					return false;
				}
				break;
		}

		return true;
	}

	function getContradictionSummary(): string[] {
		const contradictionMessages: string[] = [];

		Object.keys(contradictions).forEach(key => {
			if (key.includes('-flip')) {
				const issue = key.replace('-flip', '');
				contradictionMessages.push(`Major position change on ${issue}`);
			} else {
				const question = questionDatabase.find(q => q.id === key);
				if (question && question.issueId) {
					contradictionMessages.push(`Inconsistent response on ${question.issueId}`);
				}
			}
		});

		return contradictionMessages;
	}

	// Personality-specific question filtering and presentation
	function getPersonalityAdjustedQuestion(question: InterviewQuestion): InterviewQuestion {
		// Clone the question to avoid mutating the original
		const adjustedQuestion = { ...question };

		// Adjust question tone based on interviewer mood
		switch (interviewerMood) {
			case 'hostile':
				adjustedQuestion.question = makeQuestionHostile(question.question);
				break;
			case 'skeptical':
				adjustedQuestion.question = makeQuestionSkeptical(question.question);
				break;
			case 'sympathetic':
				adjustedQuestion.question = makeQuestionSympathetic(question.question);
				break;
			// 'professional' stays as-is
		}

		return adjustedQuestion;
	}

	function makeQuestionHostile(question: string): string {
		// Add hostile framing
		const hostilePrefixes = [
			"Let me challenge you on this: ",
			"I have to ask you directly: ",
			"Don't you think it's contradictory that ",
			"How do you justify the fact that "
		];
		const randomPrefix = hostilePrefixes[Math.floor(Math.random() * hostilePrefixes.length)];
		return randomPrefix + question.charAt(0).toLowerCase() + question.slice(1);
	}

	function makeQuestionSkeptical(question: string): string {
		// Add skeptical framing
		const skepticalPrefixes = [
			"I'm curious about your position: ",
			"Help me understand: ",
			"Some would argue that ",
			"Critics might say that "
		];
		const randomPrefix = skepticalPrefixes[Math.floor(Math.random() * skepticalPrefixes.length)];
		return randomPrefix + question.charAt(0).toLowerCase() + question.slice(1);
	}

	function makeQuestionSympathetic(question: string): string {
		// Add sympathetic framing
		const sympatheticPrefixes = [
			"I understand this is a complex issue: ",
			"Given the challenges you face: ",
			"I appreciate your willingness to discuss: ",
			"This must be difficult to address: "
		];
		const randomPrefix = sympatheticPrefixes[Math.floor(Math.random() * sympatheticPrefixes.length)];
		return randomPrefix + question.charAt(0).toLowerCase() + question.slice(1);
	}

	function completeInterview() {
		positions = calculatePositions(selectedAnswers);

		// Calculate final tone consistency score
		consistencyScore = Math.round((consistencyScore + calculateToneConsistency()) / 2);

		// Dispatch interview completion with performance data
		const performanceData = {
			positions,
			scores: {
				consistency: consistencyScore,
				confidence: confidenceScore,
				authenticity: authenticityScore
			},
			rating: getOverallInterviewRating(),
			tonePattern: responseTones,
			interviewerMoodProgression: [selectedScenario.interviewerTone, interviewerMood]
		};

		isComplete = true;
		dispatch('complete', performanceData);
	}

	function startInterview() {
		interviewStarted = true;
		// Start with first available question
		const firstQuestionId = selectNextQuestion();
		if (firstQuestionId) {
			currentQuestionId = firstQuestionId;
		}
	}

	function finishInterview() {
		// Include interview performance data
		const interviewResults = {
			positions,
			responseTones,
			interviewerMood,
			consistencyScore,
			confidenceScore,
			authenticityScore,
			selectedAnswers
		};
		dispatch('complete', interviewResults);
	}

	// Reactive statements
	$: rawQuestion = currentQuestionId ? questionDatabase.find(q => q.id === currentQuestionId) : null;
	$: currentQuestion = rawQuestion ? getPersonalityAdjustedQuestion(rawQuestion) : null;
	$: progress = isComplete ? 100 : (answeredQuestions.length / Math.max(5, answeredQuestions.length + 1)) * 100;
</script>

<div class="media-interview">
	{#if !interviewStarted}
		<!-- Introduction Screen -->
		<div class="interview-intro">
			<div class="studio-setup">
				<div class="tv-screen">
					<div class="channel-header">
						<span class="channel-logo">NOS</span>
						<span class="program-title">Political Spotlight</span>
					</div>
					<div class="host-intro">
						<div class="host-avatar">📺</div>
						<div class="intro-text">
							<h2>Welcome to Political Spotlight</h2>
							<p>Good evening. I'm here with the leader of the new political party that's making waves in Dutch politics.</p>
							<p>Tonight, we'll discuss your positions on the key issues facing the Netherlands. Your responses will help voters understand where your party stands.</p>
							<p><strong>This is live television</strong> — your answers will define your political platform.</p>
						</div>
					</div>
				</div>
				<button class="start-interview-btn" on:click={startInterview}>
					🔴 Go Live
				</button>
			</div>
		</div>
	{:else if !isComplete}
		<!-- Active Interview -->
		<div class="live-interview">
			<div class="interview-header">
				<div class="live-indicator">
					<span class="live-dot"></span>
					LIVE
				</div>
				<div class="interviewer-mood">
					<span class="mood-indicator mood-{interviewerMood}">
						{#if interviewerMood === 'hostile'}🔥
						{:else if interviewerMood === 'skeptical'}🤨
						{:else if interviewerMood === 'sympathetic'}😊
						{:else}📝{/if}
						{interviewerMood.toUpperCase()}
					</span>
				</div>
				<div class="progress-bar">
					<div class="progress-fill" style="width: {progress}%"></div>
				</div>
				<div class="question-counter">
					Q{answeredQuestions.length + 1}
				</div>
			</div>

			{#if currentQuestion}
			<div class="interview-content">
				<div class="scenario-setup">
					<h3>Current Affairs</h3>
					<p class="scenario-text">{currentQuestion.scenario}</p>
				</div>

				<div class="host-question">
					<div class="host-avatar">🎤</div>
					<div class="question-bubble mood-{interviewerMood}">
						<p><strong>Journalist:</strong> "{currentQuestion.question}"</p>
					</div>
				</div>

				<div class="response-options">
					<h4>Your Response:</h4>
					{#each currentQuestion.options as option, index}
						<button
							class="response-option tone-{option.tone}"
							on:click={() => selectAnswer(option)}
							on:mouseenter={() => showConsequencePreview(option)}
							on:mouseleave={hideConsequencePreview}
						>
							<span class="option-letter">{String.fromCharCode(65 + index)}</span>
							<div class="option-content">
								<span class="option-text">"{option.text}"</span>
								<span class="tone-indicator">
									{#if option.tone === 'aggressive'}⚡
									{:else if option.tone === 'defensive'}🛡️
									{:else if option.tone === 'evasive'}🔄
									{:else if option.tone === 'confrontational'}⚔️
									{:else}🤝{/if}
									{option.tone}
								</span>
							</div>
						</button>
					{/each}

					<!-- Consequence Preview Panel -->
					{#if hoveredConsequences.length > 0}
						<div class="consequence-preview">
							<h5>📊 Potential Consequences:</h5>
							<div class="consequence-list">
								{#each hoveredConsequences as consequence}
									<div class="consequence-item severity-{consequence.severity}">
										<span class="consequence-icon">{consequence.icon}</span>
										<span class="consequence-text">{consequence.effect}</span>
									</div>
								{/each}
							</div>
						</div>
					{/if}
				</div>
			</div>
			{:else}
				<div class="interview-loading">
					<p>Preparing next question...</p>
				</div>
			{/if}
		</div>
	{:else}
		<!-- Interview Complete -->
		<div class="interview-complete">
			<div class="completion-header">
				<h2>🎬 Interview Complete</h2>
				<p>Your political positions have been established based on your responses.</p>
			</div>

			<!-- Interview Performance Report -->
			{#if true}
				{@const rating = getOverallInterviewRating()}
				<div class="performance-report">
					<h3>📊 Interview Performance</h3>

					<div class="overall-rating">
						<div class="grade-circle grade-{rating.grade.toLowerCase().replace('+', 'plus')}">
							{rating.grade}
						</div>
						<div class="rating-details">
							<div class="score">{rating.score}/100</div>
							<div class="description">{rating.description}</div>
						</div>
					</div>

					<div class="performance-metrics">
						<div class="metric">
							<div class="metric-label">Consistency</div>
							<div class="metric-bar">
								<div class="metric-fill" style="width: {consistencyScore}%; background-color: {consistencyScore >= 70 ? '#10b981' : consistencyScore >= 50 ? '#f59e0b' : '#ef4444'}"></div>
							</div>
							<div class="metric-value">{consistencyScore}%</div>
						</div>

						<div class="metric">
							<div class="metric-label">Confidence</div>
							<div class="metric-bar">
								<div class="metric-fill" style="width: {confidenceScore}%; background-color: {confidenceScore >= 70 ? '#10b981' : confidenceScore >= 50 ? '#f59e0b' : '#ef4444'}"></div>
							</div>
							<div class="metric-value">{confidenceScore}%</div>
						</div>

						<div class="metric">
							<div class="metric-label">Authenticity</div>
							<div class="metric-bar">
								<div class="metric-fill" style="width: {authenticityScore}%; background-color: {authenticityScore >= 70 ? '#10b981' : authenticityScore >= 50 ? '#f59e0b' : '#ef4444'}"></div>
							</div>
							<div class="metric-value">{authenticityScore}%</div>
						</div>
					</div>

					<div class="tone-analysis">
						<h4>Response Tone Pattern</h4>
						<div class="tone-sequence">
							{#each responseTones as tone, index}
								<span class="tone-badge tone-{tone}" title="Question {index + 1}: {tone}">
									{#if tone === 'aggressive'}⚡
									{:else if tone === 'defensive'}🛡️
									{:else if tone === 'evasive'}🔄
									{:else if tone === 'confrontational'}⚔️
									{:else}🤝{/if}
								</span>
							{/each}
						</div>
						<p class="tone-summary">
							Interviewer mood: {selectedScenario.interviewerTone} → {interviewerMood}
						</p>
					</div>
				</div>
			{/if}

				<!-- Consistency Analysis -->
				{#if true}
					{@const contradictionList = getContradictionSummary()}
					{#if contradictionList.length > 0}
						<div class="consistency-issues">
							<h4>⚠️ Consistency Issues Detected</h4>
							<ul class="contradiction-list">
								{#each contradictionList as contradiction}
									<li class="contradiction-item">{contradiction}</li>
								{/each}
							</ul>
							<p class="consistency-note">
								These contradictions may affect your credibility with voters and coalition partners.
							</p>
						</div>
					{:else}
						<div class="consistency-success">
							<h4>✅ Consistent Messaging</h4>
							<p>No major contradictions detected in your responses. Your positions appear coherent and authentic.</p>
						</div>
				{/if}
			</div>
			{/if}

			<div class="position-summary">
				<h3>Your Political Platform</h3>
				{#each positions as position}
					{@const issue = DUTCH_ISSUES.find(i => i.id === position.issueId)}
					{#if issue}
						<div class="position-card">
							<div class="position-header">
								<h4>{issue.name}</h4>
								<span class="position-value" class:left={position.position < -30} class:center={position.position >= -30 && position.position <= 30} class:right={position.position > 30}>
									{position.position > 0 ? '+' : ''}{position.position}
								</span>
							</div>
							<div class="position-description">
								{position.position < -30 ? issue.spectrum.left : position.position > 30 ? issue.spectrum.right : 'Moderate position between competing approaches'}
							</div>
							<div class="priority-level">
								Priority: {'★'.repeat(position.priority)}{'☆'.repeat(5 - position.priority)}
							</div>
						</div>
					{/if}
				{/each}
			</div>

			<button class="finish-btn" on:click={finishInterview}>
				Continue to Campaign →
			</button>
		</div>
	{/if}
</div>

<style>
	.media-interview {
		padding: 20px;
		max-width: 900px;
		margin: 0 auto;
		min-height: 600px;
	}

	/* Introduction Screen */
	.interview-intro {
		text-align: center;
	}

	.studio-setup {
		background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
		border-radius: 20px;
		padding: 40px;
		box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
	}

	.tv-screen {
		background: #000;
		border-radius: 15px;
		padding: 20px;
		margin-bottom: 30px;
		border: 3px solid #333;
		box-shadow: inset 0 0 20px rgba(0, 100, 255, 0.2);
	}

	.channel-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		color: white;
		margin-bottom: 20px;
		font-size: 14px;
		font-weight: bold;
	}

	.channel-logo {
		background: #ff0000;
		padding: 4px 12px;
		border-radius: 4px;
		color: white;
	}

	.program-title {
		color: #00aaff;
	}

	.host-intro {
		display: flex;
		gap: 20px;
		align-items: center;
	}

	.host-avatar {
		font-size: 48px;
		filter: grayscale(100%) brightness(0.8);
	}

	.intro-text {
		text-align: left;
		color: white;
	}

	.intro-text h2 {
		color: #00aaff;
		margin-bottom: 15px;
	}

	.intro-text p {
		margin-bottom: 10px;
		line-height: 1.6;
	}

	.start-interview-btn {
		background: linear-gradient(135deg, #ff0000 0%, #cc0000 100%);
		color: white;
		border: none;
		padding: 15px 30px;
		border-radius: 8px;
		font-size: 18px;
		font-weight: bold;
		cursor: pointer;
		transition: all 0.3s ease;
		box-shadow: 0 4px 15px rgba(255, 0, 0, 0.3);
	}

	.start-interview-btn:hover {
		transform: translateY(-2px);
		box-shadow: 0 6px 20px rgba(255, 0, 0, 0.4);
	}

	/* Live Interview */
	.live-interview {
		background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 100%);
		border-radius: 15px;
		overflow: hidden;
		box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
	}

	.interview-header {
		background: linear-gradient(90deg, #ff0000 0%, #cc0000 100%);
		padding: 15px 20px;
		display: flex;
		justify-content: space-between;
		align-items: center;
		color: white;
	}

	.live-indicator {
		display: flex;
		align-items: center;
		gap: 8px;
		font-weight: bold;
		font-size: 16px;
	}

	.live-dot {
		width: 12px;
		height: 12px;
		background: white;
		border-radius: 50%;
		animation: pulse 1.5s infinite;
	}

	@keyframes pulse {
		0%, 100% { opacity: 1; }
		50% { opacity: 0.3; }
	}

	.progress-bar {
		flex: 1;
		height: 6px;
		background: rgba(255, 255, 255, 0.3);
		border-radius: 3px;
		margin: 0 20px;
		overflow: hidden;
	}

	.progress-fill {
		height: 100%;
		background: white;
		transition: width 0.3s ease;
		border-radius: 3px;
	}

	.question-counter {
		font-weight: bold;
	}

	.interview-content {
		padding: 30px;
		color: white;
	}

	.scenario-setup {
		background: rgba(255, 255, 255, 0.05);
		padding: 20px;
		border-radius: 10px;
		margin-bottom: 25px;
		border-left: 4px solid #00aaff;
	}

	.scenario-setup h3 {
		color: #00aaff;
		margin-bottom: 10px;
	}

	.scenario-text {
		line-height: 1.6;
		font-style: italic;
	}

	.host-question {
		display: flex;
		gap: 15px;
		margin-bottom: 30px;
		align-items: flex-start;
	}

	.question-bubble {
		background: linear-gradient(135deg, #333 0%, #444 100%);
		padding: 20px;
		border-radius: 20px 20px 20px 5px;
		border: 2px solid #555;
		flex: 1;
	}

	.response-options h4 {
		color: #00aaff;
		margin-bottom: 20px;
	}

	.response-option {
		display: flex;
		gap: 15px;
		align-items: flex-start;
		background: linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.1) 100%);
		border: 2px solid rgba(255, 255, 255, 0.2);
		border-radius: 12px;
		padding: 20px;
		margin-bottom: 15px;
		cursor: pointer;
		transition: all 0.3s ease;
		text-align: left;
		color: white;
		width: 100%;
	}

	.response-option:hover {
		background: linear-gradient(135deg, rgba(0, 170, 255, 0.1) 0%, rgba(0, 170, 255, 0.2) 100%);
		border-color: #00aaff;
		transform: translateY(-2px);
		box-shadow: 0 5px 15px rgba(0, 170, 255, 0.2);
	}

	.option-letter {
		background: #00aaff;
		color: white;
		width: 32px;
		height: 32px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: bold;
		flex-shrink: 0;
	}

	.option-text {
		line-height: 1.5;
		font-style: italic;
	}

	/* Interview Complete */
	.interview-complete {
		text-align: center;
	}

	.completion-header h2 {
		color: #00aa00;
		margin-bottom: 10px;
	}

	.position-summary {
		margin: 30px 0;
		text-align: left;
	}

	.position-summary h3 {
		text-align: center;
		color: #333;
		margin-bottom: 25px;
	}

	.position-card {
		background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
		border-radius: 10px;
		padding: 20px;
		margin-bottom: 15px;
		border: 1px solid #dee2e6;
	}

	.position-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 10px;
	}

	.position-header h4 {
		margin: 0;
		color: #333;
	}

	.position-value {
		font-weight: bold;
		font-size: 18px;
		padding: 4px 12px;
		border-radius: 20px;
	}

	.position-value.left {
		background: #dc3545;
		color: white;
	}

	.position-value.center {
		background: #6c757d;
		color: white;
	}

	.position-value.right {
		background: #007bff;
		color: white;
	}

	.position-description {
		color: #666;
		font-style: italic;
		margin-bottom: 8px;
		line-height: 1.4;
	}

	.priority-level {
		color: #ffc107;
		font-size: 14px;
	}

	.finish-btn {
		background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
		color: white;
		border: none;
		padding: 15px 30px;
		border-radius: 8px;
		font-size: 18px;
		font-weight: bold;
		cursor: pointer;
		transition: all 0.3s ease;
		box-shadow: 0 4px 15px rgba(40, 167, 69, 0.3);
	}

	.finish-btn:hover {
		transform: translateY(-2px);
		box-shadow: 0 6px 20px rgba(40, 167, 69, 0.4);
	}

	/* Responsive */
	@media (max-width: 768px) {
		.media-interview {
			padding: 10px;
		}

		.host-intro {
			flex-direction: column;
			text-align: center;
		}

		.response-option {
			padding: 15px;
		}

		.interview-header {
			flex-direction: column;
			gap: 10px;
		}

		.progress-bar {
			margin: 0;
		}
	}

	/* New Adaptive Interview Styles */
	.interviewer-mood {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.mood-indicator {
		padding: 4px 8px;
		border-radius: 20px;
		font-size: 12px;
		font-weight: bold;
		border: 1px solid rgba(255, 255, 255, 0.3);
	}

	.mood-professional {
		background: rgba(0, 170, 255, 0.3);
		color: #00aaff;
	}

	.mood-skeptical {
		background: rgba(255, 193, 7, 0.3);
		color: #ffc107;
	}

	.mood-hostile {
		background: rgba(220, 53, 69, 0.3);
		color: #dc3545;
	}

	.mood-sympathetic {
		background: rgba(40, 167, 69, 0.3);
		color: #28a745;
	}

	.question-bubble.mood-hostile {
		border-color: #dc3545;
		background: linear-gradient(135deg, #4a1a1a 0%, #5a2222 100%);
	}

	.question-bubble.mood-skeptical {
		border-color: #ffc107;
		background: linear-gradient(135deg, #4a3a1a 0%, #5a4422 100%);
	}

	.question-bubble.mood-sympathetic {
		border-color: #28a745;
		background: linear-gradient(135deg, #1a4a2a 0%, #225a33 100%);
	}

	.option-content {
		display: flex;
		flex-direction: column;
		gap: 8px;
		flex: 1;
	}

	.tone-indicator {
		font-size: 11px;
		padding: 2px 6px;
		border-radius: 10px;
		align-self: flex-start;
		opacity: 0.8;
	}

	.response-option.tone-aggressive {
		border-left: 4px solid #dc3545;
	}

	.response-option.tone-aggressive .tone-indicator {
		background: rgba(220, 53, 69, 0.2);
		color: #dc3545;
	}

	.response-option.tone-defensive {
		border-left: 4px solid #6c757d;
	}

	.response-option.tone-defensive .tone-indicator {
		background: rgba(108, 117, 125, 0.2);
		color: #6c757d;
	}

	.response-option.tone-evasive {
		border-left: 4px solid #ffc107;
	}

	.response-option.tone-evasive .tone-indicator {
		background: rgba(255, 193, 7, 0.2);
		color: #ffc107;
	}

	.response-option.tone-confrontational {
		border-left: 4px solid #fd7e14;
	}

	.response-option.tone-confrontational .tone-indicator {
		background: rgba(253, 126, 20, 0.2);
		color: #fd7e14;
	}

	.response-option.tone-diplomatic {
		border-left: 4px solid #28a745;
	}

	.response-option.tone-diplomatic .tone-indicator {
		background: rgba(40, 167, 69, 0.2);
		color: #28a745;
	}

	.interview-loading {
		padding: 40px;
		text-align: center;
		color: white;
		font-style: italic;
	}

	/* Performance Report Styles */
	.performance-report {
		background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
		border-radius: 15px;
		padding: 25px;
		margin: 25px 0;
		border: 1px solid rgba(255, 255, 255, 0.1);
	}

	.performance-report h3 {
		color: #ffffff;
		margin-bottom: 20px;
		font-size: 1.3em;
		display: flex;
		align-items: center;
		gap: 10px;
	}

	.overall-rating {
		display: flex;
		align-items: center;
		gap: 20px;
		margin-bottom: 25px;
		padding: 20px;
		background: rgba(255, 255, 255, 0.05);
		border-radius: 12px;
	}

	.grade-circle {
		width: 80px;
		height: 80px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 24px;
		font-weight: bold;
		color: white;
		border: 3px solid;
	}

	.grade-circle.grade-aplus,
	.grade-circle.grade-a {
		background: linear-gradient(135deg, #10b981 0%, #059669 100%);
		border-color: #10b981;
	}

	.grade-circle.grade-b {
		background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
		border-color: #3b82f6;
	}

	.grade-circle.grade-c {
		background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
		border-color: #f59e0b;
	}

	.grade-circle.grade-d,
	.grade-circle.grade-f {
		background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
		border-color: #ef4444;
	}

	.rating-details {
		flex: 1;
	}

	.rating-details .score {
		font-size: 2em;
		font-weight: bold;
		color: #ffffff;
		margin-bottom: 5px;
	}

	.rating-details .description {
		color: rgba(255, 255, 255, 0.8);
		line-height: 1.4;
	}

	.performance-metrics {
		display: flex;
		flex-direction: column;
		gap: 15px;
		margin-bottom: 25px;
	}

	.metric {
		display: flex;
		align-items: center;
		gap: 15px;
		padding: 12px 15px;
		background: rgba(255, 255, 255, 0.05);
		border-radius: 8px;
	}

	.metric-label {
		min-width: 100px;
		color: #ffffff;
		font-weight: 500;
	}

	.metric-bar {
		flex: 1;
		height: 8px;
		background: rgba(255, 255, 255, 0.1);
		border-radius: 4px;
		overflow: hidden;
	}

	.metric-fill {
		height: 100%;
		transition: width 0.8s ease-in-out;
		border-radius: 4px;
	}

	.metric-value {
		min-width: 50px;
		text-align: right;
		color: #ffffff;
		font-weight: bold;
	}

	.tone-analysis {
		background: rgba(255, 255, 255, 0.05);
		border-radius: 10px;
		padding: 20px;
	}

	.tone-analysis h4 {
		color: #ffffff;
		margin-bottom: 15px;
		font-size: 1.1em;
	}

	.tone-sequence {
		display: flex;
		gap: 8px;
		margin-bottom: 15px;
		flex-wrap: wrap;
	}

	.tone-badge {
		width: 32px;
		height: 32px;
		border-radius: 6px;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 14px;
		border: 2px solid;
		cursor: pointer;
		transition: transform 0.2s ease;
	}

	.tone-badge:hover {
		transform: scale(1.1);
	}

	.tone-badge.tone-aggressive {
		background: rgba(220, 53, 69, 0.2);
		border-color: #dc3545;
	}

	.tone-badge.tone-defensive {
		background: rgba(108, 117, 125, 0.2);
		border-color: #6c757d;
	}

	.tone-badge.tone-evasive {
		background: rgba(255, 193, 7, 0.2);
		border-color: #ffc107;
	}

	.tone-badge.tone-confrontational {
		background: rgba(253, 126, 20, 0.2);
		border-color: #fd7e14;
	}

	.tone-badge.tone-diplomatic {
		background: rgba(40, 167, 69, 0.2);
		border-color: #28a745;
	}

	.tone-summary {
		color: rgba(255, 255, 255, 0.8);
		font-style: italic;
		margin: 0;
	}

	/* Consistency Analysis Styles */
	.consistency-issues,
	.consistency-success {
		background: rgba(255, 255, 255, 0.05);
		border-radius: 10px;
		padding: 20px;
		margin-top: 20px;
	}

	.consistency-issues {
		border-left: 4px solid #ef4444;
	}

	.consistency-success {
		border-left: 4px solid #10b981;
	}

	.consistency-issues h4 {
		color: #ef4444;
		margin-bottom: 15px;
		font-size: 1.1em;
	}

	.consistency-success h4 {
		color: #10b981;
		margin-bottom: 15px;
		font-size: 1.1em;
	}

	.contradiction-list {
		list-style: none;
		padding: 0;
		margin: 0 0 15px 0;
	}

	.contradiction-item {
		background: rgba(239, 68, 68, 0.1);
		color: #ffffff;
		padding: 8px 12px;
		margin: 5px 0;
		border-radius: 6px;
		border-left: 3px solid #ef4444;
		font-size: 0.9em;
	}

	.consistency-note {
		color: rgba(255, 255, 255, 0.7);
		font-style: italic;
		margin: 0;
		font-size: 0.9em;
	}

	.consistency-success p {
		color: rgba(255, 255, 255, 0.8);
		margin: 0;
		line-height: 1.4;
	}

	/* Consequence Preview Styles (Task 6.5) */
	.consequence-preview {
		background: linear-gradient(135deg, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.9) 100%);
		border: 1px solid rgba(0, 170, 255, 0.3);
		border-radius: 10px;
		padding: 15px;
		margin-top: 15px;
		backdrop-filter: blur(10px);
		animation: fadeInUp 0.3s ease-out;
	}

	.consequence-preview h5 {
		color: #00aaff;
		margin: 0 0 10px 0;
		font-size: 1em;
		font-weight: 600;
	}

	.consequence-list {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.consequence-item {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 8px 12px;
		border-radius: 6px;
		font-size: 0.9em;
		transition: all 0.2s ease;
	}

	.consequence-item.severity-high {
		background: rgba(239, 68, 68, 0.15);
		border-left: 3px solid #ef4444;
		color: #ffffff;
	}

	.consequence-item.severity-medium {
		background: rgba(251, 191, 36, 0.15);
		border-left: 3px solid #fbbf24;
		color: #ffffff;
	}

	.consequence-item.severity-low {
		background: rgba(156, 163, 175, 0.15);
		border-left: 3px solid #9ca3af;
		color: #ffffff;
	}

	.consequence-item.severity-positive {
		background: rgba(34, 197, 94, 0.15);
		border-left: 3px solid #22c55e;
		color: #ffffff;
	}

	.consequence-icon {
		font-size: 1.1em;
		flex-shrink: 0;
	}

	.consequence-text {
		flex: 1;
		line-height: 1.3;
	}

	@keyframes fadeInUp {
		from {
			opacity: 0;
			transform: translateY(10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	/* Responsive adjustments for consequence preview */
	@media (max-width: 768px) {
		.consequence-preview {
			padding: 12px;
			margin-top: 10px;
		}

		.consequence-item {
			padding: 6px 10px;
			font-size: 0.85em;
		}

		.consequence-preview h5 {
			font-size: 0.9em;
		}
	}
</style>