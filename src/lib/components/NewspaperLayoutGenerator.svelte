<script lang="ts">
	import { createEventDispatcher, onMount, onDestroy } from 'svelte';
	import type {
		InterviewerPersonality,
		BackgroundArc,
		DemographicGroup,
		NewspaperLayout,
		NewspaperArticle,
		NewspaperSection,
		NewspaperConfig,
		NewspaperTheme,
		ArticleType,
		HeadlineStyle
	} from '$lib/types/interview';

	export let personality: InterviewerPersonality;
	export let backgroundArc: BackgroundArc;
	export let interviewContent: string = '';
	export let interviewOutcome: string = '';
	export let interviewMoments: string[] = [];
	export let config: NewspaperConfig = {
		enabled: true,
		theme: 'broadsheet',
		updateFrequency: 5000,
		showMultiplePapers: true,
		generateBreakingNews: true,
		includeEditorials: true,
		includeOpEds: true,
		maxArticlesPerPaper: 8,
		politicalLeaning: 'balanced'
	};

	interface NewspaperGeneratorState {
		newspapers: NewspaperLayout[];
		breakingNewsAlert: string | null;
		updateTimer: number | null;
		isGenerating: boolean;
		lastUpdateTime: Date;
		totalArticlesGenerated: number;
	}

	let generatorState: NewspaperGeneratorState = {
		newspapers: [],
		breakingNewsAlert: null,
		updateTimer: null,
		isGenerating: false,
		lastUpdateTime: new Date(),
		totalArticlesGenerated: 0
	};

	let newspaperContainer: HTMLElement;
	let currentNewspaperIndex = 0;

	const dispatch = createEventDispatcher<{
		breakingNews: { headline: string; article: NewspaperArticle };
		newspaperGenerated: { newspaper: NewspaperLayout };
		editorialPublished: { editorial: NewspaperArticle };
		headlineCreated: { headline: string; impact: number };
	}>();

	// Newspaper themes and styles
	const newspaperThemes: Record<NewspaperTheme, any> = {
		broadsheet: {
			name: 'The Daily Chronicle',
			style: 'traditional',
			columns: 6,
			fontSize: 'medium',
			headerStyle: 'serif',
			politicalLeaning: 'center',
			credibility: 85,
			circulation: 150000
		},
		tabloid: {
			name: 'City Pulse',
			style: 'modern',
			columns: 4,
			fontSize: 'large',
			headerStyle: 'sans-serif',
			politicalLeaning: 'populist',
			credibility: 65,
			circulation: 200000
		},
		progressive: {
			name: 'Progressive Tribune',
			style: 'clean',
			columns: 5,
			fontSize: 'medium',
			headerStyle: 'modern-serif',
			politicalLeaning: 'left',
			credibility: 80,
			circulation: 75000
		},
		conservative: {
			name: 'National Standard',
			style: 'classic',
			columns: 6,
			fontSize: 'small',
			headerStyle: 'traditional-serif',
			politicalLeaning: 'right',
			credibility: 82,
			circulation: 120000
		}
	};

	// Article type configurations
	const articleTypes: Record<ArticleType, any> = {
		'main-story': {
			priority: 1,
			wordCount: [800, 1200],
			placement: 'front-page',
			imageRequired: true,
			bylineRequired: true
		},
		'breaking-news': {
			priority: 0,
			wordCount: [300, 600],
			placement: 'front-page-banner',
			imageRequired: false,
			bylineRequired: true
		},
		'analysis': {
			priority: 2,
			wordCount: [1000, 1500],
			placement: 'inside-pages',
			imageRequired: false,
			bylineRequired: true
		},
		'editorial': {
			priority: 3,
			wordCount: [600, 900],
			placement: 'editorial-page',
			imageRequired: false,
			bylineRequired: false
		},
		'op-ed': {
			priority: 3,
			wordCount: [700, 1000],
			placement: 'editorial-page',
			imageRequired: false,
			bylineRequired: true
		},
		'sidebar': {
			priority: 4,
			wordCount: [200, 400],
			placement: 'complementary',
			imageRequired: false,
			bylineRequired: false
		},
		'brief': {
			priority: 5,
			wordCount: [100, 200],
			placement: 'news-briefs',
			imageRequired: false,
			bylineRequired: false
		}
	};

	// Headline style configurations
	const headlineStyles: Record<HeadlineStyle, any> = {
		'sensational': {
			characteristics: ['ALL CAPS', 'Dramatic', 'Emotional'],
			templates: [
				'SHOCKING: {politician} {action}!',
				'EXPLOSIVE: {controversy} ROCKS GOVERNMENT!',
				'SCANDAL: {details} EXPOSED!'
			],
			punctuation: '!',
			fontSize: 'extra-large'
		},
		'analytical': {
			characteristics: ['Measured', 'Factual', 'Precise'],
			templates: [
				'{politician} Faces Questions Over {topic}',
				'Interview Reveals {finding} on {issue}',
				'Analysis: {politician}\'s {topic} Strategy'
			],
			punctuation: '.',
			fontSize: 'large'
		},
		'neutral': {
			characteristics: ['Balanced', 'Informative', 'Professional'],
			templates: [
				'{politician} Discusses {topic} in Interview',
				'{topic}: {politician} Responds to Concerns',
				'Interview: {politician} on {issue}'
			],
			punctuation: '',
			fontSize: 'large'
		},
		'investigative': {
			characteristics: ['Probing', 'Detailed', 'Questioning'],
			templates: [
				'Questions Raised Over {politician}\'s {topic}',
				'Investigation: {politician} and {issue}',
				'Probe Deepens Into {politician}\'s {controversy}'
			],
			punctuation: '',
			fontSize: 'large'
		}
	};

	// Generate newspaper content based on interview
	function generateNewspaper(): NewspaperLayout {
		const theme = newspaperThemes[config.theme];
		const articles = generateArticles();
		const mainHeadline = generateMainHeadline();

		const newspaper: NewspaperLayout = {
			id: `newspaper_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
			name: theme.name,
			theme: config.theme,
			date: new Date(),
			mainHeadline,
			sections: organizeSections(articles),
			layout: generateLayout(theme, articles),
			metadata: {
				edition: 'Morning Edition',
				circulation: theme.circulation,
				credibility: theme.credibility,
				politicalLeaning: theme.politicalLeaning,
				publisher: `${theme.name} Publishing Group`,
				editorInChief: generateEditorName()
			}
		};

		return newspaper;
	}

	function generateArticles(): NewspaperArticle[] {
		const articles: NewspaperArticle[] = [];

		// Main story
		articles.push(generateMainStory());

		// Breaking news if applicable
		if (config.generateBreakingNews && hasBreakingNewsContent()) {
			articles.push(generateBreakingNewsStory());
		}

		// Analysis piece
		articles.push(generateAnalysis());

		// Editorial if enabled
		if (config.includeEditorials) {
			articles.push(generateEditorial());
		}

		// Op-ed if enabled
		if (config.includeOpEds) {
			articles.push(generateOpEd());
		}

		// Sidebar content
		articles.push(generateSidebar());

		// News briefs
		articles.push(...generateNewsBriefs());

		return articles.slice(0, config.maxArticlesPerPaper);
	}

	function generateMainStory(): NewspaperArticle {
		const headline = generateMainHeadline();
		const content = generateMainStoryContent();

		return {
			id: `main_${Date.now()}`,
			type: 'main-story',
			headline,
			subheadline: generateSubheadline(headline),
			byline: generateByline('political-reporter'),
			content,
			wordCount: content.split(' ').length,
			imageCaption: generateImageCaption(),
			section: 'politics',
			priority: 1,
			timestamp: new Date(),
			tags: extractTags(content),
			relatedArticles: []
		};
	}

	function generateMainHeadline(): string {
		const style = determineHeadlineStyle();
		const styleConfig = headlineStyles[style];
		const template = styleConfig.templates[Math.floor(Math.random() * styleConfig.templates.length)];

		return template
			.replace('{politician}', backgroundArc.name || 'Politician')
			.replace('{action}', getInterviewAction())
			.replace('{topic}', getMainTopic())
			.replace('{controversy}', getControversy())
			.replace('{details}', getKeyDetails())
			.replace('{finding}', getKeyFinding())
			.replace('{issue}', getMainIssue());
	}

	function determineHeadlineStyle(): HeadlineStyle {
		if (config.theme === 'tabloid') return 'sensational';
		if (interviewMoments.some(moment => moment.includes('investigative'))) return 'investigative';
		if (interviewMoments.some(moment => moment.includes('confrontational'))) return 'analytical';
		return 'neutral';
	}

	function generateMainStoryContent(): string {
		const theme = newspaperThemes[config.theme];
		const paragraphs: string[] = [];

		// Lead paragraph
		paragraphs.push(generateLeadParagraph());

		// Quote from interview
		paragraphs.push(generateQuoteParagraph());

		// Context paragraph
		paragraphs.push(generateContextParagraph());

		// Analysis paragraph
		paragraphs.push(generateAnalysisParagraph());

		// Response/reaction paragraph
		if (Math.random() > 0.3) {
			paragraphs.push(generateResponseParagraph());
		}

		// Concluding paragraph
		paragraphs.push(generateConcludingParagraph());

		return paragraphs.join('\n\n');
	}

	function generateLeadParagraph(): string {
		const politician = backgroundArc.name || 'The politician';
		const topic = getMainTopic();
		const interviewer = personality.name;

		const leadTemplates = [
			`${politician} faced intense questioning about ${topic} during a heated interview with ${interviewer} yesterday, defending their position amid growing controversy.`,
			`In a candid interview with ${interviewer}, ${politician} addressed concerns over ${topic}, offering detailed explanations of their approach.`,
			`${politician} sat down with ${interviewer} for an in-depth discussion about ${topic}, revealing new insights into their decision-making process.`,
			`Tough questions about ${topic} dominated ${politician}'s interview with ${interviewer}, as they sought to clarify their position on the contentious issue.`
		];

		return leadTemplates[Math.floor(Math.random() * leadTemplates.length)];
	}

	function generateQuoteParagraph(): string {
		const politician = backgroundArc.name || 'The politician';
		const quotes = [
			`"This is about doing what's right for the people," ${politician} emphasized during the interview.`,
			`"We've made difficult decisions, but they were necessary," ${politician} stated firmly.`,
			`"I understand there are different perspectives on this issue," ${politician} acknowledged.`,
			`"The facts speak for themselves," ${politician} insisted when pressed by the interviewer.`,
			`"We remain committed to transparency and accountability," ${politician} declared.`
		];

		return quotes[Math.floor(Math.random() * quotes.length)];
	}

	function generateContextParagraph(): string {
		const topic = getMainTopic();
		return `The interview comes amid ongoing debate over ${topic}, with stakeholders expressing diverse views on the government's approach. Recent developments have intensified scrutiny of policy decisions and their implementation.`;
	}

	function generateAnalysisParagraph(): string {
		const politician = backgroundArc.name || 'The politician';
		const analysisTemplates = [
			`Political analysts suggest that ${politician}'s performance in the interview may influence public opinion on the matter.`,
			`The interview revealed both strengths and potential vulnerabilities in ${politician}'s communication strategy.`,
			`Observers note that ${politician}'s responses demonstrate a careful balance between accountability and political positioning.`,
			`The exchange highlighted the complex challenges facing policymakers in addressing public concerns.`
		];

		return analysisTemplates[Math.floor(Math.random() * analysisTemplates.length)];
	}

	function generateResponseParagraph(): string {
		const responseTemplates = [
			`Opposition leaders were quick to respond, calling for further investigation into the matter.`,
			`Coalition partners expressed support for the politician's stance, emphasizing party unity.`,
			`Stakeholder groups welcomed the clarification but called for concrete action.`,
			`Civil society organizations said they would monitor developments closely.`
		];

		return responseTemplates[Math.floor(Math.random() * responseTemplates.length)];
	}

	function generateConcludingParagraph(): string {
		const politician = backgroundArc.name || 'The politician';
		const concludingTemplates = [
			`${politician} concluded the interview by reaffirming their commitment to serving the public interest.`,
			`The full interview transcript is expected to be released later this week.`,
			`Further discussions on this topic are planned for upcoming parliamentary sessions.`,
			`${politician}'s office said they remain open to continued dialogue with stakeholders.`
		];

		return concludingTemplates[Math.floor(Math.random() * concludingTemplates.length)];
	}

	function generateBreakingNewsStory(): NewspaperArticle {
		const headline = `BREAKING: ${generateBreakingHeadline()}`;
		const content = generateBreakingNewsContent();

		const article: NewspaperArticle = {
			id: `breaking_${Date.now()}`,
			type: 'breaking-news',
			headline,
			subheadline: 'Developing Story',
			byline: generateByline('news-reporter'),
			content,
			wordCount: content.split(' ').length,
			imageCaption: 'Live coverage continues',
			section: 'breaking-news',
			priority: 0,
			timestamp: new Date(),
			tags: ['breaking', 'developing'],
			relatedArticles: []
		};

		// Dispatch breaking news event
		dispatch('breakingNews', { headline, article });

		return article;
	}

	function generateBreakingHeadline(): string {
		const politician = backgroundArc.name || 'Politician';
		const breakingTemplates = [
			`${politician} Interview Sparks Immediate Response`,
			`Controversy Erupts Following ${politician} Interview`,
			`${politician}'s Comments Draw Swift Reaction`,
			`Interview Revelations Send Shockwaves Through Capital`
		];

		return breakingTemplates[Math.floor(Math.random() * breakingTemplates.length)];
	}

	function generateBreakingNewsContent(): string {
		return `This is a developing story. More details to follow as they become available. Our newsroom is working to verify information and will provide updates as the situation unfolds.`;
	}

	function generateAnalysis(): NewspaperArticle {
		const headline = generateAnalysisHeadline();
		const content = generateAnalysisContent();

		return {
			id: `analysis_${Date.now()}`,
			type: 'analysis',
			headline,
			subheadline: 'Political Analysis',
			byline: generateByline('political-analyst'),
			content,
			wordCount: content.split(' ').length,
			imageCaption: null,
			section: 'analysis',
			priority: 2,
			timestamp: new Date(),
			tags: ['analysis', 'politics'],
			relatedArticles: []
		};
	}

	function generateAnalysisHeadline(): string {
		const politician = backgroundArc.name || 'Politician';
		const analysisTemplates = [
			`Analysis: What ${politician}'s Interview Reveals About Their Strategy`,
			`The Political Implications of ${politician}'s Latest Comments`,
			`Reading Between the Lines: ${politician}'s Interview Decoded`,
			`${politician}'s Performance: Strength or Vulnerability?`
		];

		return analysisTemplates[Math.floor(Math.random() * analysisTemplates.length)];
	}

	function generateAnalysisContent(): string {
		const politician = backgroundArc.name || 'The politician';
		const paragraphs = [
			`${politician}'s recent interview offers valuable insights into their current political positioning and strategic thinking.`,
			`The choice of messaging and defensive posture suggests careful consideration of various stakeholder interests.`,
			`Political observers will be watching closely for how this interview affects public sentiment and policy debates.`,
			`The interview's timing and content may signal broader shifts in the government's communications strategy.`
		];

		return paragraphs.join('\n\n');
	}

	function generateEditorial(): NewspaperArticle {
		const headline = generateEditorialHeadline();
		const content = generateEditorialContent();

		const editorial: NewspaperArticle = {
			id: `editorial_${Date.now()}`,
			type: 'editorial',
			headline,
			subheadline: 'Editorial Board Opinion',
			byline: 'Editorial Board',
			content,
			wordCount: content.split(' ').length,
			imageCaption: null,
			section: 'editorial',
			priority: 3,
			timestamp: new Date(),
			tags: ['editorial', 'opinion'],
			relatedArticles: []
		};

		dispatch('editorialPublished', { editorial });

		return editorial;
	}

	function generateEditorialHeadline(): string {
		const topic = getMainTopic();
		const editorialTemplates = [
			`The Need for Transparency on ${topic}`,
			`Our View: Accountability Must Come First`,
			`Moving Forward on ${topic} Policy`,
			`A Balanced Approach to ${topic} is Essential`
		];

		return editorialTemplates[Math.floor(Math.random() * editorialTemplates.length)];
	}

	function generateEditorialContent(): string {
		const theme = newspaperThemes[config.theme];
		const politician = backgroundArc.name || 'the politician';

		let editorial = '';

		switch (theme.politicalLeaning) {
			case 'left':
				editorial = `The recent interview with ${politician} raises important questions about accountability and transparency in government. While we appreciate efforts to address public concerns, more concrete action is needed to restore public trust.`;
				break;
			case 'right':
				editorial = `${politician} demonstrated leadership and clarity in addressing complex policy challenges during the recent interview. The approach taken shows a commitment to responsible governance and public service.`;
				break;
			case 'center':
			default:
				editorial = `The interview with ${politician} highlighted both the complexity of current policy challenges and the need for continued dialogue. We encourage all stakeholders to engage constructively in finding solutions.`;
		}

		return editorial + '\n\nThis newspaper believes that informed public discourse is essential to democratic governance. We will continue to monitor developments and provide balanced coverage of these important issues.';
	}

	function generateOpEd(): NewspaperArticle {
		const headline = generateOpEdHeadline();
		const content = generateOpEdContent();

		return {
			id: `oped_${Date.now()}`,
			type: 'op-ed',
			headline,
			subheadline: 'Guest Commentary',
			byline: generateGuestByline(),
			content,
			wordCount: content.split(' ').length,
			imageCaption: null,
			section: 'opinion',
			priority: 3,
			timestamp: new Date(),
			tags: ['opinion', 'commentary'],
			relatedArticles: []
		};
	}

	function generateOpEdHeadline(): string {
		const topic = getMainTopic();
		const opedTemplates = [
			`Why ${topic} Policy Needs Reform`,
			`A Different Perspective on ${topic}`,
			`The Citizen's View on Recent ${topic} Developments`,
			`Beyond Politics: ${topic} and Public Interest`
		];

		return opedTemplates[Math.floor(Math.random() * opedTemplates.length)];
	}

	function generateOpEdContent(): string {
		return `As a concerned citizen and stakeholder, I believe it's important to consider multiple perspectives on this issue. The recent interview highlighted various viewpoints, and we must work together to find common ground and effective solutions.\n\nPublic participation in these discussions is crucial for democratic decision-making. I encourage others to stay informed and engaged as these important matters are debated and decided.`;
	}

	function generateSidebar(): NewspaperArticle {
		const headline = 'Key Facts';
		const content = generateSidebarContent();

		return {
			id: `sidebar_${Date.now()}`,
			type: 'sidebar',
			headline,
			subheadline: null,
			byline: null,
			content,
			wordCount: content.split(' ').length,
			imageCaption: null,
			section: 'news',
			priority: 4,
			timestamp: new Date(),
			tags: ['facts', 'sidebar'],
			relatedArticles: []
		};
	}

	function generateSidebarContent(): string {
		const politician = backgroundArc.name || 'The politician';
		const facts = [
			`• Interview conducted by ${personality.name}`,
			`• Background: ${backgroundArc.category} expertise`,
			`• Duration: Approximately 30 minutes`,
			`• Topics covered: Policy, implementation, public concerns`,
			`• ${politician}'s office provided follow-up statements`
		];

		return facts.join('\n');
	}

	function generateNewsBriefs(): NewspaperArticle[] {
		const briefTopics = [
			'Parliamentary Schedule Update',
			'Public Consultation Announced',
			'Coalition Meeting Scheduled',
			'Policy Implementation Timeline'
		];

		return briefTopics.map((topic, index) => ({
			id: `brief_${Date.now()}_${index}`,
			type: 'brief',
			headline: topic,
			subheadline: null,
			byline: null,
			content: `Brief update on ${topic.toLowerCase()}. More details available on our website.`,
			wordCount: 12,
			imageCaption: null,
			section: 'briefs',
			priority: 5,
			timestamp: new Date(),
			tags: ['brief', 'update'],
			relatedArticles: []
		}));
	}

	function organizeSections(articles: NewspaperArticle[]): NewspaperSection[] {
		const sections: Record<string, NewspaperArticle[]> = {};

		articles.forEach(article => {
			if (!sections[article.section]) {
				sections[article.section] = [];
			}
			sections[article.section].push(article);
		});

		return Object.entries(sections).map(([name, articles]) => ({
			name,
			articles: articles.sort((a, b) => a.priority - b.priority),
			layout: determineSectionLayout(name, articles.length)
		}));
	}

	function determineSectionLayout(sectionName: string, articleCount: number): string {
		if (sectionName === 'breaking-news') return 'banner';
		if (sectionName === 'politics' && articleCount === 1) return 'full-width';
		if (articleCount <= 2) return 'two-column';
		if (articleCount <= 4) return 'four-column';
		return 'grid';
	}

	function generateLayout(theme: any, articles: NewspaperArticle[]): any {
		return {
			type: 'responsive-grid',
			columns: theme.columns,
			headerHeight: '120px',
			contentArea: {
				mainStory: { span: 3, position: 'top-left' },
				sidebar: { span: 1, position: 'top-right' },
				analysis: { span: 2, position: 'middle-left' },
				editorial: { span: 1, position: 'middle-right' },
				briefs: { span: 6, position: 'bottom' }
			},
			typography: {
				headlineFont: theme.headerStyle,
				bodyFont: 'serif',
				headlineSize: theme.fontSize
			}
		};
	}

	// Helper functions
	function hasBreakingNewsContent(): boolean {
		return interviewMoments.some(moment =>
			moment.includes('viral') ||
			moment.includes('shocking') ||
			moment.includes('breaking')
		);
	}

	function getInterviewAction(): string {
		const actions = ['Defends Policy', 'Addresses Concerns', 'Responds to Critics', 'Clarifies Position'];
		return actions[Math.floor(Math.random() * actions.length)];
	}

	function getMainTopic(): string {
		const topics = ['Economic Policy', 'Healthcare Reform', 'Climate Action', 'Social Programs', 'Infrastructure', 'Education'];
		return topics[Math.floor(Math.random() * topics.length)];
	}

	function getControversy(): string {
		const controversies = ['Policy Debate', 'Implementation Issues', 'Budget Concerns', 'Public Criticism'];
		return controversies[Math.floor(Math.random() * controversies.length)];
	}

	function getKeyDetails(): string {
		const details = ['New Information', 'Policy Changes', 'Implementation Timeline', 'Budget Allocation'];
		return details[Math.floor(Math.random() * details.length)];
	}

	function getKeyFinding(): string {
		const findings = ['Policy Impact Assessment', 'Stakeholder Feedback', 'Implementation Challenges', 'Public Response'];
		return findings[Math.floor(Math.random() * findings.length)];
	}

	function getMainIssue(): string {
		return getMainTopic();
	}

	function generateSubheadline(headline: string): string {
		const subheadlines = [
			'Exclusive interview reveals new details',
			'Policy implications under scrutiny',
			'Stakeholder reactions emerge',
			'Public debate continues'
		];
		return subheadlines[Math.floor(Math.random() * subheadlines.length)];
	}

	function generateByline(type: string): string {
		const bylines = {
			'political-reporter': ['Sarah Johnson, Political Reporter', 'Michael Chen, Senior Correspondent', 'Emma Rodriguez, Government Affairs'],
			'news-reporter': ['Alex Thompson, Breaking News', 'Jamie Park, News Desk', 'Chris Taylor, Reporter'],
			'political-analyst': ['Dr. Rebecca Williams, Political Analyst', 'Prof. David Lee, Policy Expert', 'Maria Santos, Political Commentator']
		};

		const typeBylines = bylines[type] || bylines['news-reporter'];
		return typeBylines[Math.floor(Math.random() * typeBylines.length)];
	}

	function generateGuestByline(): string {
		const guestBylines = [
			'Dr. Jennifer Adams, Policy Research Institute',
			'Tom Mitchell, Citizens Advocacy Group',
			'Lisa Chen, Former Government Advisor',
			'Professor John Wilson, University Political Science'
		];
		return guestBylines[Math.floor(Math.random() * guestBylines.length)];
	}

	function generateEditorName(): string {
		const names = ['Margaret Thompson', 'Robert Chang', 'Elena Vasquez', 'James Morrison'];
		return names[Math.floor(Math.random() * names.length)];
	}

	function generateImageCaption(): string {
		const politician = backgroundArc.name || 'The politician';
		const captions = [
			`${politician} during yesterday's interview`,
			`${politician} addressing key policy questions`,
			`The interview took place at government offices`,
			`${politician} responds to interviewer's questions`
		];
		return captions[Math.floor(Math.random() * captions.length)];
	}

	function extractTags(content: string): string[] {
		const commonTags = ['politics', 'policy', 'interview', 'government', 'public-interest'];
		return commonTags.slice(0, 3);
	}

	// Lifecycle and reactive updates
	function startGeneration() {
		if (generatorState.isGenerating) return;

		generatorState.isGenerating = true;

		// Generate initial newspapers
		if (config.showMultiplePapers) {
			const themes: NewspaperTheme[] = ['broadsheet', 'tabloid', 'progressive', 'conservative'];
			generatorState.newspapers = themes.map(theme => {
				const oldTheme = config.theme;
				config.theme = theme;
				const newspaper = generateNewspaper();
				config.theme = oldTheme;

				dispatch('newspaperGenerated', { newspaper });
				return newspaper;
			});
		} else {
			const newspaper = generateNewspaper();
			generatorState.newspapers = [newspaper];
			dispatch('newspaperGenerated', { newspaper });
		}

		generatorState.totalArticlesGenerated = generatorState.newspapers.reduce(
			(sum, newspaper) => sum + newspaper.sections.reduce((sectionSum, section) => sectionSum + section.articles.length, 0), 0
		);

		generatorState.lastUpdateTime = new Date();
		generatorState.isGenerating = false;

		// Set up periodic updates
		if (config.updateFrequency > 0) {
			generatorState.updateTimer = setInterval(() => {
				if (Math.random() > 0.7) { // 30% chance of update
					updateNewspapers();
				}
			}, config.updateFrequency);
		}
	}

	function updateNewspapers() {
		if (generatorState.isGenerating) return;

		generatorState.newspapers = generatorState.newspapers.map(newspaper => {
			// Occasionally add a new brief or update
			if (Math.random() > 0.8) {
				const newBrief = generateNewsBriefs()[0];
				const newsSection = newspaper.sections.find(s => s.name === 'briefs');
				if (newsSection) {
					newsSection.articles.push(newBrief);
				}
			}

			return { ...newspaper, date: new Date() };
		});

		generatorState.lastUpdateTime = new Date();
		generatorState = { ...generatorState }; // Trigger reactivity
	}

	// Navigation functions
	function nextNewspaper() {
		currentNewspaperIndex = (currentNewspaperIndex + 1) % generatorState.newspapers.length;
	}

	function previousNewspaper() {
		currentNewspaperIndex = currentNewspaperIndex === 0
			? generatorState.newspapers.length - 1
			: currentNewspaperIndex - 1;
	}

	// Lifecycle
	onMount(() => {
		if (config.enabled && (interviewContent || interviewOutcome)) {
			setTimeout(startGeneration, 1000);
		}
	});

	onDestroy(() => {
		if (generatorState.updateTimer) {
			clearInterval(generatorState.updateTimer);
		}
	});

	// Reactive updates
	$: if (interviewOutcome || interviewMoments.length > 0) {
		if (config.enabled && !generatorState.isGenerating) {
			setTimeout(startGeneration, 500);
		}
	}

	// Formatting helpers
	function formatDate(date: Date): string {
		return date.toLocaleDateString('en-US', {
			weekday: 'long',
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	}

	function getThemeClass(theme: NewspaperTheme): string {
		return `newspaper-${theme}`;
	}

	function getArticleClass(type: ArticleType): string {
		return `article-${type}`;
	}
</script>

<div class="newspaper-generator" class:generating={generatorState.isGenerating}>
	{#if generatorState.newspapers.length === 0}
		<div class="generation-placeholder">
			<div class="placeholder-icon">📰</div>
			<div class="placeholder-message">
				{#if generatorState.isGenerating}
					Generating newspaper layouts...
				{:else}
					Newspapers will be generated based on interview content
				{/if}
			</div>
		</div>
	{:else}
		<div class="newspaper-controls">
			{#if generatorState.newspapers.length > 1}
				<button class="nav-button" on:click={previousNewspaper} disabled={generatorState.isGenerating}>
					‹ Previous
				</button>
				<span class="newspaper-indicator">
					{currentNewspaperIndex + 1} of {generatorState.newspapers.length}
				</span>
				<button class="nav-button" on:click={nextNewspaper} disabled={generatorState.isGenerating}>
					Next ›
				</button>
			{/if}

			<div class="generation-info">
				<span class="article-count">
					{generatorState.totalArticlesGenerated} articles generated
				</span>
				<span class="last-updated">
					Updated: {formatDate(generatorState.lastUpdateTime)}
				</span>
			</div>
		</div>

		{#if generatorState.newspapers[currentNewspaperIndex]}
			{@const newspaper = generatorState.newspapers[currentNewspaperIndex]}
			<div class="newspaper-layout {getThemeClass(newspaper.theme)}" bind:this={newspaperContainer}>
				<div class="newspaper-header">
					<div class="newspaper-masthead">
						<h1 class="newspaper-name">{newspaper.name}</h1>
						<div class="newspaper-date">{formatDate(newspaper.date)}</div>
						<div class="newspaper-edition">{newspaper.metadata.edition}</div>
					</div>
				</div>

				<div class="newspaper-content">
					{#each newspaper.sections as section}
						<div class="newspaper-section section-{section.name}">
							{#if section.name !== 'briefs'}
								<h2 class="section-title">{section.name.toUpperCase()}</h2>
							{/if}

							<div class="section-articles layout-{section.layout}">
								{#each section.articles as article}
									<article class="newspaper-article {getArticleClass(article.type)}">
										{#if article.type === 'breaking-news'}
											<div class="breaking-banner">BREAKING NEWS</div>
										{/if}

										<h3 class="article-headline">{article.headline}</h3>

										{#if article.subheadline}
											<h4 class="article-subheadline">{article.subheadline}</h4>
										{/if}

										{#if article.byline}
											<div class="article-byline">By {article.byline}</div>
										{/if}

										{#if article.imageCaption && article.type === 'main-story'}
											<div class="article-image">
												<div class="image-placeholder">📷</div>
												<div class="image-caption">{article.imageCaption}</div>
											</div>
										{/if}

										<div class="article-content">
											{#each article.content.split('\n\n') as paragraph}
												<p>{paragraph}</p>
											{/each}
										</div>

										{#if article.tags.length > 0}
											<div class="article-tags">
												{#each article.tags as tag}
													<span class="tag">{tag}</span>
												{/each}
											</div>
										{/if}
									</article>
								{/each}
							</div>
						</div>
					{/each}
				</div>

				<div class="newspaper-footer">
					<div class="footer-info">
						<span class="publisher">{newspaper.metadata.publisher}</span>
						<span class="editor">Editor: {newspaper.metadata.editorInChief}</span>
						<span class="circulation">Circulation: {newspaper.metadata.circulation.toLocaleString()}</span>
					</div>
				</div>
			</div>
		{/if}
	{/if}
</div>

<style>
	.newspaper-generator {
		width: 100%;
		height: 100%;
		background: #f5f5f5;
		padding: 20px;
		font-family: 'Times New Roman', Georgia, serif;
		overflow: hidden;
		display: flex;
		flex-direction: column;
	}

	.generation-placeholder {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100%;
		color: #666;
	}

	.placeholder-icon {
		font-size: 64px;
		margin-bottom: 20px;
		opacity: 0.6;
	}

	.placeholder-message {
		font-size: 18px;
		text-align: center;
	}

	.generating {
		opacity: 0.8;
	}

	.newspaper-controls {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 20px;
		padding: 10px 0;
		border-bottom: 1px solid #ddd;
	}

	.nav-button {
		background: #2c3e50;
		color: white;
		border: none;
		padding: 8px 16px;
		border-radius: 4px;
		cursor: pointer;
		font-size: 14px;
	}

	.nav-button:hover:not(:disabled) {
		background: #34495e;
	}

	.nav-button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.newspaper-indicator {
		font-weight: bold;
		color: #2c3e50;
	}

	.generation-info {
		display: flex;
		gap: 20px;
		font-size: 12px;
		color: #666;
	}

	.newspaper-layout {
		flex: 1;
		background: white;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
		border-radius: 8px;
		overflow-y: auto;
		padding: 20px;
	}

	/* Theme-specific styling */
	.newspaper-broadsheet {
		font-family: 'Times New Roman', serif;
		line-height: 1.4;
	}

	.newspaper-tabloid {
		font-family: Arial, sans-serif;
		line-height: 1.3;
	}

	.newspaper-progressive {
		font-family: 'Georgia', serif;
		line-height: 1.5;
		color: #2c3e50;
	}

	.newspaper-conservative {
		font-family: 'Times New Roman', serif;
		line-height: 1.3;
		color: #1a1a1a;
	}

	.newspaper-header {
		border-bottom: 3px solid #000;
		margin-bottom: 20px;
		padding-bottom: 15px;
	}

	.newspaper-masthead {
		text-align: center;
	}

	.newspaper-name {
		font-size: 48px;
		font-weight: bold;
		margin: 0;
		letter-spacing: 2px;
		text-transform: uppercase;
	}

	.newspaper-date {
		font-size: 14px;
		margin: 5px 0;
		color: #666;
	}

	.newspaper-edition {
		font-size: 12px;
		color: #888;
		font-style: italic;
	}

	.newspaper-content {
		display: flex;
		flex-direction: column;
		gap: 30px;
	}

	.newspaper-section {
		margin-bottom: 20px;
	}

	.section-title {
		font-size: 16px;
		font-weight: bold;
		border-bottom: 2px solid #000;
		padding-bottom: 5px;
		margin-bottom: 15px;
		letter-spacing: 1px;
	}

	.section-articles {
		display: grid;
		gap: 20px;
	}

	.layout-banner {
		grid-template-columns: 1fr;
	}

	.layout-full-width {
		grid-template-columns: 1fr;
	}

	.layout-two-column {
		grid-template-columns: 1fr 1fr;
	}

	.layout-four-column {
		grid-template-columns: 1fr 1fr;
		grid-template-rows: auto auto;
	}

	.layout-grid {
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
	}

	.newspaper-article {
		break-inside: avoid;
		margin-bottom: 15px;
	}

	.article-main-story {
		grid-column: 1 / -1;
	}

	.article-breaking-news {
		background: linear-gradient(135deg, #ff6b6b, #ee5a52);
		color: white;
		padding: 15px;
		border-radius: 8px;
		margin-bottom: 20px;
	}

	.breaking-banner {
		background: #ff0000;
		color: white;
		padding: 4px 12px;
		font-size: 12px;
		font-weight: bold;
		letter-spacing: 1px;
		margin-bottom: 10px;
		display: inline-block;
		text-transform: uppercase;
	}

	.article-headline {
		font-size: 24px;
		font-weight: bold;
		line-height: 1.2;
		margin: 0 0 8px 0;
		color: #000;
	}

	.article-main-story .article-headline {
		font-size: 36px;
	}

	.article-breaking-news .article-headline {
		color: white;
		font-size: 28px;
	}

	.article-analysis .article-headline {
		font-size: 20px;
	}

	.article-editorial .article-headline,
	.article-op-ed .article-headline {
		font-size: 18px;
		font-style: italic;
	}

	.article-sidebar .article-headline,
	.article-brief .article-headline {
		font-size: 14px;
		font-weight: bold;
	}

	.article-subheadline {
		font-size: 16px;
		color: #666;
		font-style: italic;
		margin: 0 0 8px 0;
		line-height: 1.3;
	}

	.article-byline {
		font-size: 12px;
		color: #888;
		margin-bottom: 10px;
		font-weight: 500;
	}

	.article-image {
		margin: 15px 0;
	}

	.image-placeholder {
		width: 100%;
		height: 200px;
		background: #f0f0f0;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 48px;
		color: #ccc;
		border: 1px solid #ddd;
	}

	.image-caption {
		font-size: 11px;
		color: #666;
		font-style: italic;
		margin-top: 5px;
		padding: 0 5px;
	}

	.article-content {
		font-size: 14px;
		line-height: 1.6;
		text-align: justify;
	}

	.article-content p {
		margin: 0 0 12px 0;
	}

	.article-content p:first-letter {
		font-size: 1.2em;
		font-weight: bold;
	}

	.article-main-story .article-content p:first-of-type:first-letter {
		font-size: 3em;
		float: left;
		line-height: 1;
		margin: 0 8px 0 0;
		font-family: 'Times New Roman', serif;
	}

	.article-tags {
		margin-top: 10px;
		display: flex;
		flex-wrap: wrap;
		gap: 5px;
	}

	.tag {
		background: #e9ecef;
		color: #495057;
		padding: 2px 6px;
		border-radius: 12px;
		font-size: 10px;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.newspaper-footer {
		border-top: 2px solid #000;
		margin-top: 30px;
		padding-top: 15px;
		font-size: 10px;
		color: #666;
	}

	.footer-info {
		display: flex;
		justify-content: space-between;
		flex-wrap: wrap;
		gap: 10px;
	}

	/* Responsive design */
	@media (max-width: 768px) {
		.newspaper-generator {
			padding: 10px;
		}

		.newspaper-name {
			font-size: 32px;
		}

		.article-headline {
			font-size: 20px;
		}

		.article-main-story .article-headline {
			font-size: 28px;
		}

		.layout-two-column,
		.layout-four-column,
		.layout-grid {
			grid-template-columns: 1fr;
		}

		.newspaper-controls {
			flex-direction: column;
			gap: 10px;
			align-items: stretch;
		}

		.generation-info {
			flex-direction: column;
			gap: 5px;
		}
	}

	/* Print-like appearance */
	.newspaper-layout {
		background: white;
		box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
	}

	/* Animation for generating state */
	.generating .newspaper-layout {
		animation: pulse 2s infinite;
	}

	@keyframes pulse {
		0%, 100% { opacity: 0.8; }
		50% { opacity: 1; }
	}

	/* Accessibility */
	@media (prefers-reduced-motion: reduce) {
		.generating .newspaper-layout {
			animation: none;
		}
	}
</style>