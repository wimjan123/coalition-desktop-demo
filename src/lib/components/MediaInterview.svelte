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
					priority: 4
				},
				{
					text: "Engage constructively while protecting key Dutch interests and maintaining some fiscal autonomy.",
					position: -20,
					priority: 3
				},
				{
					text: "Resist fiscal integration that undermines Dutch sovereignty while remaining committed to European cooperation.",
					position: 40,
					priority: 4
				},
				{
					text: "Defend Dutch sovereignty strongly and consider reducing EU integration if our interests are not protected.",
					position: 80,
					priority: 5
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
					priority: 5
				},
				{
					text: "Focus on education, job training, and moderate tax adjustments to create more opportunities for advancement.",
					position: -25,
					priority: 4
				},
				{
					text: "Encourage entrepreneurship and economic growth that benefits everyone rather than redistributive policies.",
					position: 30,
					priority: 3
				},
				{
					text: "Reduce taxes and regulations to stimulate job creation and economic mobility through market mechanisms.",
					position: 75,
					priority: 2
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
		}
	];

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

		// Move to next question
		const nextQuestionId = selectNextQuestion();
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

				<!-- Consistency Analysis -->
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
</style>