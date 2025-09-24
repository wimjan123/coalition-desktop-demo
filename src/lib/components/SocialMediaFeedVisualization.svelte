<script lang="ts">
	import { createEventDispatcher, onMount, onDestroy } from 'svelte';
	import type {
		InterviewerPersonality,
		BackgroundArc,
		DemographicGroup,
		SocialMediaPost,
		SocialMediaFeedConfig,
		SocialMediaReaction,
		ViralMoment,
		TrendingTopic
	} from '$lib/types/interview';

	export let personality: InterviewerPersonality;
	export let backgroundArc: BackgroundArc;
	export let currentQuestion: string = '';
	export let userResponse: string = '';
	export let interviewMoment: string = '';
	export let config: SocialMediaFeedConfig = {
		enabled: true,
		platforms: ['twitter', 'instagram', 'tiktok', 'linkedin'],
		updateFrequency: 2000,
		maxPosts: 50,
		showMetrics: true,
		autoScroll: true,
		viralThreshold: 1000,
		trendingThreshold: 500
	};

	interface SocialMediaFeedState {
		posts: SocialMediaPost[];
		reactions: SocialMediaReaction[];
		viralMoments: ViralMoment[];
		trendingTopics: TrendingTopic[];
		totalEngagement: number;
		sentiment: 'positive' | 'negative' | 'neutral' | 'mixed';
		isActive: boolean;
	}

	let feedState: SocialMediaFeedState = {
		posts: [],
		reactions: [],
		viralMoments: [],
		trendingTopics: [],
		totalEngagement: 0,
		sentiment: 'neutral',
		isActive: false
	};

	let feedContainer: HTMLElement;
	let updateInterval: number;
	let animationFrame: number;

	const dispatch = createEventDispatcher<{
		viralMoment: { moment: ViralMoment; posts: SocialMediaPost[] };
		trendingTopic: { topic: TrendingTopic; posts: SocialMediaPost[] };
		sentimentChange: {
			previous: string;
			current: string;
			posts: SocialMediaPost[]
		};
		engagementSpike: {
			spike: number;
			trigger: string;
			posts: SocialMediaPost[]
		};
	}>();

	// Demographic-specific posting patterns
	const demographicPostingPatterns = {
		'young-urban': {
			platforms: ['twitter', 'instagram', 'tiktok'],
			frequency: 0.8,
			style: 'casual',
			emoji: true,
			hashtags: 3-5
		},
		'middle-aged-suburban': {
			platforms: ['facebook', 'linkedin'],
			frequency: 0.4,
			style: 'formal',
			emoji: false,
			hashtags: 1-2
		},
		'elderly-rural': {
			platforms: ['facebook'],
			frequency: 0.2,
			style: 'conversational',
			emoji: false,
			hashtags: 0-1
		},
		'professionals': {
			platforms: ['linkedin', 'twitter'],
			frequency: 0.6,
			style: 'professional',
			emoji: false,
			hashtags: 2-3
		}
	};

	// Platform-specific content templates
	const platformTemplates = {
		twitter: {
			maxLength: 280,
			format: 'short',
			supportsMemes: true,
			supportsPolls: true,
			supportsThreads: true
		},
		instagram: {
			maxLength: 2200,
			format: 'visual',
			supportsMemes: true,
			supportsStories: true,
			supportsReels: true
		},
		tiktok: {
			maxLength: 150,
			format: 'video',
			supportsMemes: true,
			supportsEffects: true,
			supportsDuets: true
		},
		linkedin: {
			maxLength: 1300,
			format: 'professional',
			supportsMemes: false,
			supportsArticles: true,
			supportsProfessionalContent: true
		},
		facebook: {
			maxLength: 63206,
			format: 'long',
			supportsMemes: true,
			supportsEvents: true,
			supportsGroups: true
		}
	};

	// Generate realistic social media posts
	function generateSocialMediaPost(
		trigger: string,
		demographic: DemographicGroup,
		platform: string
	): SocialMediaPost {
		const pattern = demographicPostingPatterns[demographic] || demographicPostingPatterns['middle-aged-suburban'];
		const template = platformTemplates[platform];

		const baseContent = generateContentByTrigger(trigger, demographic, platform);
		const engagement = generateEngagementMetrics(demographic, platform);

		return {
			id: `post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
			platform,
			author: generateAuthorProfile(demographic),
			content: baseContent,
			timestamp: new Date(),
			engagement,
			demographic,
			sentiment: analyzeSentiment(baseContent),
			reactions: generateReactions(engagement.likes + engagement.shares),
			hashtags: extractHashtags(baseContent),
			mentions: extractMentions(baseContent),
			isViral: engagement.likes > config.viralThreshold,
			isTrending: engagement.shares > config.trendingThreshold
		};
	}

	function generateContentByTrigger(
		trigger: string,
		demographic: DemographicGroup,
		platform: string
	): string {
		const templates = {
			'evasive_answer': [
				"Did anyone else notice how {politician} completely dodged that question? 🤔 #PoliticalInterview #Accountability",
				"Classic politician move - ask about taxes, get a speech about unity 🙄 #EvasiveAnswers",
				"Why can't politicians just give straight answers anymore? #Transparency #Politics"
			],
			'confrontational_moment': [
				"This interviewer is NOT letting up! Finally someone asking the hard questions 👏 #JournalismMatters",
				"Wow, {interviewer} is really going after {politician} today! This is getting intense 🔥 #ConfrontationalInterview",
				"When journalists actually do their job >> #Accountability #HardQuestions"
			],
			'viral_moment': [
				"OMG did {politician} really just say that?! This is going to be EVERYWHERE 😱 #Viral #Politics",
				"I can't believe what I just witnessed... this changes everything #GameChanger #PoliticalInterview",
				"Screenshot taken, clip saved, meme potential: MAXIMUM 📸 #InstantClassic"
			],
			'policy_discussion': [
				"Finally a substantive policy discussion! More of this please 📚 #PolicyMatters #InformedVoting",
				"This is why we need detailed policy conversations, not just soundbites #Politics #Policy",
				"Breaking down complex issues - this is quality journalism 💯 #PolicyExplained"
			]
		};

		const templateArray = templates[trigger] || templates['policy_discussion'];
		const baseTemplate = templateArray[Math.floor(Math.random() * templateArray.length)];

		return personalizeContent(baseTemplate, demographic, platform);
	}

	function personalizeContent(template: string, demographic: DemographicGroup, platform: string): string {
		let content = template;

		// Replace placeholders
		content = content.replace('{politician}', backgroundArc.name || 'the politician');
		content = content.replace('{interviewer}', personality.name);

		// Adjust for demographic
		if (demographic === 'young-urban') {
			content = addGenZSlang(content);
			content = addMoreEmojis(content);
		} else if (demographic === 'elderly-rural') {
			content = makeMoreConservative(content);
			content = removeSlang(content);
		} else if (demographic === 'professionals') {
			content = makeProfessional(content);
			content = addLinkedInStyle(content);
		}

		// Adjust for platform
		if (platform === 'tiktok') {
			content = addTikTokStyle(content);
		} else if (platform === 'linkedin') {
			content = addProfessionalContext(content);
		}

		return content;
	}

	function generateAuthorProfile(demographic: DemographicGroup) {
		const profiles = {
			'young-urban': () => ({
				username: generateUsername(['urbanlife', 'citykid', 'trendsetter', 'socialactivist']),
				displayName: generateDisplayName(['Alex', 'Jordan', 'Casey', 'Riley']),
				avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${Math.random()}`,
				verified: Math.random() < 0.1,
				followers: Math.floor(Math.random() * 10000) + 500,
				bio: "Urban explorer | Social justice advocate | Coffee addict ☕"
			}),
			'middle-aged-suburban': () => ({
				username: generateUsername(['familyperson', 'suburbanlife', 'workingparent', 'communitymember']),
				displayName: generateDisplayName(['Jennifer', 'Michael', 'Sarah', 'David']),
				avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${Math.random()}`,
				verified: Math.random() < 0.05,
				followers: Math.floor(Math.random() * 5000) + 100,
				bio: "Parent | Community volunteer | Working professional"
			}),
			'elderly-rural': () => ({
				username: generateUsername(['countryliving', 'traditionalist', 'grandparent', 'ruralvoice']),
				displayName: generateDisplayName(['Robert', 'Mary', 'William', 'Patricia']),
				avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${Math.random()}`,
				verified: Math.random() < 0.02,
				followers: Math.floor(Math.random() * 1000) + 50,
				bio: "Retired | Grandparent | Country values"
			}),
			'professionals': () => ({
				username: generateUsername(['executive', 'consultant', 'analyst', 'specialist']),
				displayName: generateDisplayName(['Amanda', 'Christopher', 'Michelle', 'Jonathan']),
				avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${Math.random()}`,
				verified: Math.random() < 0.15,
				followers: Math.floor(Math.random() * 20000) + 1000,
				bio: "Senior Manager | Strategy Consultant | MBA"
			})
		};

		const profileGenerator = profiles[demographic] || profiles['middle-aged-suburban'];
		return profileGenerator();
	}

	function generateEngagementMetrics(demographic: DemographicGroup, platform: string) {
		const baseEngagement = {
			'young-urban': { likes: 150, shares: 25, comments: 40, views: 2000 },
			'middle-aged-suburban': { likes: 50, shares: 8, comments: 15, views: 800 },
			'elderly-rural': { likes: 20, shares: 3, comments: 8, views: 300 },
			'professionals': { likes: 100, shares: 20, comments: 30, views: 1500 }
		};

		const platformMultiplier = {
			twitter: 1.0,
			instagram: 1.2,
			tiktok: 2.5,
			linkedin: 0.8,
			facebook: 0.6
		};

		const base = baseEngagement[demographic] || baseEngagement['middle-aged-suburban'];
		const multiplier = platformMultiplier[platform] || 1.0;

		return {
			likes: Math.floor(base.likes * multiplier * (0.5 + Math.random())),
			shares: Math.floor(base.shares * multiplier * (0.5 + Math.random())),
			comments: Math.floor(base.comments * multiplier * (0.5 + Math.random())),
			views: Math.floor(base.views * multiplier * (0.5 + Math.random()))
		};
	}

	function analyzeSentiment(content: string): 'positive' | 'negative' | 'neutral' {
		const positiveWords = ['great', 'excellent', 'amazing', 'love', 'fantastic', 'brilliant', 'outstanding', '👏', '💯', '🔥', '❤️'];
		const negativeWords = ['terrible', 'awful', 'hate', 'disgusting', 'horrible', 'disappointing', '😡', '🤢', '👎', '💩'];

		const words = content.toLowerCase().split(/\s+/);
		let positiveCount = 0;
		let negativeCount = 0;

		words.forEach(word => {
			if (positiveWords.some(pw => word.includes(pw))) positiveCount++;
			if (negativeWords.some(nw => word.includes(nw))) negativeCount++;
		});

		if (positiveCount > negativeCount) return 'positive';
		if (negativeCount > positiveCount) return 'negative';
		return 'neutral';
	}

	function generateReactions(totalEngagement: number): SocialMediaReaction[] {
		const reactions = [];
		const reactionTypes = ['like', 'love', 'laugh', 'wow', 'sad', 'angry'];

		let remaining = totalEngagement;
		for (const type of reactionTypes) {
			if (remaining <= 0) break;
			const count = Math.floor(Math.random() * remaining * 0.4);
			if (count > 0) {
				reactions.push({ type, count });
				remaining -= count;
			}
		}

		return reactions;
	}

	function extractHashtags(content: string): string[] {
		const hashtags = content.match(/#\w+/g) || [];
		return hashtags.map(tag => tag.substring(1));
	}

	function extractMentions(content: string): string[] {
		const mentions = content.match(/@\w+/g) || [];
		return mentions.map(mention => mention.substring(1));
	}

	// Content modification functions
	function addGenZSlang(content: string): string {
		const slangReplacements = {
			'really': 'lowkey',
			'very': 'hella',
			'good': 'slaps',
			'bad': 'mid',
			'cool': 'fire',
			'impressive': 'hits different'
		};

		let result = content;
		Object.entries(slangReplacements).forEach(([formal, slang]) => {
			result = result.replace(new RegExp(`\\b${formal}\\b`, 'gi'), slang);
		});

		return result;
	}

	function addMoreEmojis(content: string): string {
		const emojiMap = {
			'!': '! 💯',
			'?': '? 🤔',
			'amazing': 'amazing ✨',
			'fire': 'fire 🔥',
			'love': 'love ❤️'
		};

		let result = content;
		Object.entries(emojiMap).forEach(([text, replacement]) => {
			result = result.replace(new RegExp(text, 'gi'), replacement);
		});

		return result;
	}

	function makeMoreConservative(content: string): string {
		return content
			.replace(/🔥/g, '')
			.replace(/💯/g, '')
			.replace('OMG', 'Oh my')
			.replace('gonna', 'going to')
			.replace('wanna', 'want to');
	}

	function removeSlang(content: string): string {
		const slangReplacements = {
			'lowkey': 'somewhat',
			'hella': 'very',
			'slaps': 'is good',
			'mid': 'mediocre',
			'fire': 'excellent'
		};

		let result = content;
		Object.entries(slangReplacements).forEach(([slang, formal]) => {
			result = result.replace(new RegExp(`\\b${slang}\\b`, 'gi'), formal);
		});

		return result;
	}

	function makeProfessional(content: string): string {
		return content
			.replace(/😱|🤔|🔥|💯/g, '')
			.replace('OMG', 'Notably,')
			.replace('This is crazy', 'This is significant')
			.replace('gonna', 'going to');
	}

	function addLinkedInStyle(content: string): string {
		if (!content.includes('Thoughts?') && Math.random() < 0.3) {
			content += ' Thoughts?';
		}
		if (!content.includes('#') && Math.random() < 0.5) {
			content += ' #Leadership #Politics #Accountability';
		}
		return content;
	}

	function addTikTokStyle(content: string): string {
		const tikTokPhrases = [
			'POV:',
			'Tell me you\'re a politician without telling me you\'re a politician',
			'This is giving',
			'No cap',
			'It\'s giving'
		];

		if (Math.random() < 0.4) {
			const phrase = tikTokPhrases[Math.floor(Math.random() * tikTokPhrases.length)];
			content = `${phrase} ${content}`;
		}

		return content;
	}

	function addProfessionalContext(content: string): string {
		const contexts = [
			'From a strategic communication perspective:',
			'As someone who works in public affairs:',
			'Having worked in government relations:',
			'From a crisis management standpoint:'
		];

		if (Math.random() < 0.3) {
			const context = contexts[Math.floor(Math.random() * contexts.length)];
			content = `${context} ${content}`;
		}

		return content;
	}

	function generateUsername(themes: string[]): string {
		const theme = themes[Math.floor(Math.random() * themes.length)];
		const number = Math.floor(Math.random() * 999) + 1;
		return `${theme}${number}`;
	}

	function generateDisplayName(names: string[]): string {
		return names[Math.floor(Math.random() * names.length)];
	}

	// Feed update logic
	function updateFeed() {
		if (!feedState.isActive) return;

		// Determine triggers based on current interview state
		const triggers = determineTriggers();

		// Generate new posts for each demographic and platform
		const demographics: DemographicGroup[] = ['young-urban', 'middle-aged-suburban', 'elderly-rural', 'professionals'];

		triggers.forEach(trigger => {
			const randomDemographic = demographics[Math.floor(Math.random() * demographics.length)];
			const randomPlatform = config.platforms[Math.floor(Math.random() * config.platforms.length)];

			const newPost = generateSocialMediaPost(trigger, randomDemographic, randomPlatform);
			feedState.posts.unshift(newPost);

			// Check for viral moments
			if (newPost.isViral && !feedState.viralMoments.find(vm => vm.trigger === trigger)) {
				const viralMoment: ViralMoment = {
					id: `viral_${Date.now()}`,
					trigger,
					posts: [newPost],
					peakEngagement: newPost.engagement.likes + newPost.engagement.shares,
					startTime: new Date(),
					platforms: [randomPlatform],
					demographics: [randomDemographic]
				};

				feedState.viralMoments.push(viralMoment);
				dispatch('viralMoment', { moment: viralMoment, posts: [newPost] });
			}

			// Update trending topics
			newPost.hashtags.forEach(hashtag => {
				const existingTrend = feedState.trendingTopics.find(tt => tt.hashtag === hashtag);
				if (existingTrend) {
					existingTrend.count++;
					existingTrend.posts.push(newPost);
				} else if (newPost.isTrending) {
					const trendingTopic: TrendingTopic = {
						hashtag,
						count: 1,
						posts: [newPost],
						sentiment: newPost.sentiment,
						platforms: [randomPlatform]
					};

					feedState.trendingTopics.push(trendingTopic);
					dispatch('trendingTopic', { topic: trendingTopic, posts: [newPost] });
				}
			});
		});

		// Limit posts to maxPosts
		if (feedState.posts.length > config.maxPosts) {
			feedState.posts = feedState.posts.slice(0, config.maxPosts);
		}

		// Update overall sentiment
		updateOverallSentiment();

		// Update total engagement
		feedState.totalEngagement = feedState.posts.reduce((sum, post) =>
			sum + post.engagement.likes + post.engagement.shares + post.engagement.comments, 0
		);

		// Auto-scroll if enabled
		if (config.autoScroll && feedContainer) {
			feedContainer.scrollTop = 0;
		}

		feedState = { ...feedState }; // Trigger reactivity
	}

	function determineTriggers(): string[] {
		const triggers = [];

		if (interviewMoment.includes('evasive') || interviewMoment.includes('dodge')) {
			triggers.push('evasive_answer');
		}

		if (interviewMoment.includes('confrontational') || interviewMoment.includes('aggressive')) {
			triggers.push('confrontational_moment');
		}

		if (interviewMoment.includes('viral') || interviewMoment.includes('shocking')) {
			triggers.push('viral_moment');
		}

		if (interviewMoment.includes('policy') || interviewMoment.includes('substantive')) {
			triggers.push('policy_discussion');
		}

		// Default trigger if no specific moment
		if (triggers.length === 0) {
			triggers.push('policy_discussion');
		}

		return triggers;
	}

	function updateOverallSentiment() {
		const recentPosts = feedState.posts.slice(0, 10);
		if (recentPosts.length === 0) return;

		const sentimentCounts = {
			positive: recentPosts.filter(p => p.sentiment === 'positive').length,
			negative: recentPosts.filter(p => p.sentiment === 'negative').length,
			neutral: recentPosts.filter(p => p.sentiment === 'neutral').length
		};

		const prevSentiment = feedState.sentiment;

		if (sentimentCounts.positive > sentimentCounts.negative && sentimentCounts.positive > sentimentCounts.neutral) {
			feedState.sentiment = 'positive';
		} else if (sentimentCounts.negative > sentimentCounts.positive && sentimentCounts.negative > sentimentCounts.neutral) {
			feedState.sentiment = 'negative';
		} else if (sentimentCounts.positive === sentimentCounts.negative && sentimentCounts.positive > sentimentCounts.neutral) {
			feedState.sentiment = 'mixed';
		} else {
			feedState.sentiment = 'neutral';
		}

		if (prevSentiment !== feedState.sentiment) {
			dispatch('sentimentChange', {
				previous: prevSentiment,
				current: feedState.sentiment,
				posts: recentPosts
			});
		}
	}

	// Lifecycle
	onMount(() => {
		if (config.enabled) {
			feedState.isActive = true;
			updateInterval = setInterval(updateFeed, config.updateFrequency);

			// Initial feed population
			setTimeout(updateFeed, 100);
		}
	});

	onDestroy(() => {
		if (updateInterval) clearInterval(updateInterval);
		if (animationFrame) cancelAnimationFrame(animationFrame);
	});

	// Reactive updates
	$: if (interviewMoment || userResponse) {
		// Trigger immediate update when interview events occur
		setTimeout(updateFeed, 500);
	}

	// Helper functions for display
	function formatTimestamp(timestamp: Date): string {
		const now = new Date();
		const diff = now.getTime() - timestamp.getTime();
		const minutes = Math.floor(diff / 60000);

		if (minutes < 1) return 'now';
		if (minutes < 60) return `${minutes}m`;
		if (minutes < 1440) return `${Math.floor(minutes / 60)}h`;
		return `${Math.floor(minutes / 1440)}d`;
	}

	function formatEngagement(num: number): string {
		if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
		if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
		return num.toString();
	}

	function getPlatformIcon(platform: string): string {
		const icons = {
			twitter: '🐦',
			instagram: '📷',
			tiktok: '🎵',
			linkedin: '💼',
			facebook: '👥'
		};
		return icons[platform] || '📱';
	}

	function getSentimentColor(sentiment: string): string {
		const colors = {
			positive: '#22c55e',
			negative: '#ef4444',
			neutral: '#6b7280',
			mixed: '#f59e0b'
		};
		return colors[sentiment] || '#6b7280';
	}
</script>

<div class="social-media-feed" class:active={feedState.isActive}>
	{#if config.showMetrics}
		<div class="feed-header">
			<div class="metrics-row">
				<div class="metric">
					<span class="metric-value">{feedState.posts.length}</span>
					<span class="metric-label">Posts</span>
				</div>
				<div class="metric">
					<span class="metric-value">{formatEngagement(feedState.totalEngagement)}</span>
					<span class="metric-label">Engagement</span>
				</div>
				<div class="metric">
					<span
						class="metric-value sentiment"
						style="color: {getSentimentColor(feedState.sentiment)}"
					>
						{feedState.sentiment.toUpperCase()}
					</span>
					<span class="metric-label">Sentiment</span>
				</div>
				<div class="metric">
					<span class="metric-value">{feedState.viralMoments.length}</span>
					<span class="metric-label">Viral</span>
				</div>
			</div>

			{#if feedState.trendingTopics.length > 0}
				<div class="trending-topics">
					<span class="trending-label">Trending:</span>
					{#each feedState.trendingTopics.slice(0, 5) as topic}
						<span class="trending-hashtag">#{topic.hashtag}</span>
					{/each}
				</div>
			{/if}
		</div>
	{/if}

	<div class="posts-container" bind:this={feedContainer}>
		{#each feedState.posts as post (post.id)}
			<div
				class="post"
				class:viral={post.isViral}
				class:trending={post.isTrending}
			>
				<div class="post-header">
					<div class="author-info">
						<img
							src={post.author.avatar}
							alt={post.author.displayName}
							class="avatar"
						/>
						<div class="author-details">
							<div class="author-name">
								{post.author.displayName}
								{#if post.author.verified}
									<span class="verified">✓</span>
								{/if}
							</div>
							<div class="author-handle">@{post.author.username}</div>
						</div>
					</div>
					<div class="post-meta">
						<span class="platform-icon">{getPlatformIcon(post.platform)}</span>
						<span class="timestamp">{formatTimestamp(post.timestamp)}</span>
					</div>
				</div>

				<div class="post-content">
					{post.content}
				</div>

				{#if post.hashtags.length > 0 || post.mentions.length > 0}
					<div class="post-tags">
						{#each post.hashtags as hashtag}
							<span class="hashtag">#{hashtag}</span>
						{/each}
						{#each post.mentions as mention}
							<span class="mention">@{mention}</span>
						{/each}
					</div>
				{/if}

				<div class="post-engagement">
					<div class="engagement-stats">
						<span class="stat">❤️ {formatEngagement(post.engagement.likes)}</span>
						<span class="stat">🔄 {formatEngagement(post.engagement.shares)}</span>
						<span class="stat">💬 {formatEngagement(post.engagement.comments)}</span>
						{#if post.engagement.views > 0}
							<span class="stat">👁️ {formatEngagement(post.engagement.views)}</span>
						{/if}
					</div>

					{#if post.reactions.length > 0}
						<div class="reactions">
							{#each post.reactions as reaction}
								<span class="reaction" title="{reaction.type}: {reaction.count}">
									{reaction.type === 'like' ? '👍' :
									 reaction.type === 'love' ? '❤️' :
									 reaction.type === 'laugh' ? '😂' :
									 reaction.type === 'wow' ? '😮' :
									 reaction.type === 'sad' ? '😢' : '😠'}
									{formatEngagement(reaction.count)}
								</span>
							{/each}
						</div>
					{/if}
				</div>

				{#if post.isViral}
					<div class="viral-indicator">🔥 VIRAL</div>
				{/if}
			</div>
		{/each}

		{#if feedState.posts.length === 0}
			<div class="empty-state">
				<div class="empty-icon">📱</div>
				<div class="empty-message">Social media feed will populate during the interview</div>
			</div>
		{/if}
	</div>
</div>

<style>
	.social-media-feed {
		width: 100%;
		height: 100%;
		background: #f8fafc;
		border: 1px solid #e2e8f0;
		border-radius: 12px;
		display: flex;
		flex-direction: column;
		overflow: hidden;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
	}

	.social-media-feed.active {
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
	}

	.feed-header {
		background: white;
		padding: 16px;
		border-bottom: 1px solid #e2e8f0;
	}

	.metrics-row {
		display: flex;
		justify-content: space-around;
		margin-bottom: 12px;
	}

	.metric {
		text-align: center;
	}

	.metric-value {
		display: block;
		font-size: 18px;
		font-weight: bold;
		color: #1e293b;
	}

	.metric-value.sentiment {
		text-transform: capitalize;
	}

	.metric-label {
		display: block;
		font-size: 12px;
		color: #64748b;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		margin-top: 2px;
	}

	.trending-topics {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		align-items: center;
	}

	.trending-label {
		font-size: 12px;
		font-weight: 600;
		color: #64748b;
	}

	.trending-hashtag {
		background: #dbeafe;
		color: #1d4ed8;
		padding: 2px 8px;
		border-radius: 12px;
		font-size: 12px;
		font-weight: 500;
	}

	.posts-container {
		flex: 1;
		overflow-y: auto;
		padding: 8px;
	}

	.post {
		background: white;
		border: 1px solid #e2e8f0;
		border-radius: 12px;
		margin-bottom: 12px;
		padding: 16px;
		transition: all 0.2s ease;
		position: relative;
	}

	.post:hover {
		border-color: #cbd5e1;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}

	.post.viral {
		border-color: #f59e0b;
		background: linear-gradient(135deg, #fefbf2, white);
	}

	.post.trending {
		border-color: #3b82f6;
		background: linear-gradient(135deg, #f0f9ff, white);
	}

	.post-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 12px;
	}

	.author-info {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.avatar {
		width: 40px;
		height: 40px;
		border-radius: 50%;
		border: 2px solid #e2e8f0;
	}

	.author-details {
		display: flex;
		flex-direction: column;
	}

	.author-name {
		font-weight: 600;
		color: #1e293b;
		display: flex;
		align-items: center;
		gap: 4px;
	}

	.verified {
		color: #1d4ed8;
		font-size: 14px;
	}

	.author-handle {
		font-size: 14px;
		color: #64748b;
	}

	.post-meta {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.platform-icon {
		font-size: 16px;
	}

	.timestamp {
		font-size: 12px;
		color: #64748b;
	}

	.post-content {
		line-height: 1.5;
		color: #374151;
		margin-bottom: 12px;
		word-wrap: break-word;
	}

	.post-tags {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		margin-bottom: 12px;
	}

	.hashtag {
		color: #1d4ed8;
		font-size: 14px;
		font-weight: 500;
	}

	.mention {
		color: #059669;
		font-size: 14px;
		font-weight: 500;
	}

	.post-engagement {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding-top: 12px;
		border-top: 1px solid #f1f5f9;
	}

	.engagement-stats {
		display: flex;
		gap: 16px;
	}

	.stat {
		font-size: 12px;
		color: #64748b;
		display: flex;
		align-items: center;
		gap: 4px;
	}

	.reactions {
		display: flex;
		gap: 8px;
	}

	.reaction {
		font-size: 12px;
		display: flex;
		align-items: center;
		gap: 2px;
	}

	.viral-indicator {
		position: absolute;
		top: 12px;
		right: 12px;
		background: #f59e0b;
		color: white;
		padding: 4px 8px;
		border-radius: 12px;
		font-size: 10px;
		font-weight: bold;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 200px;
		color: #64748b;
	}

	.empty-icon {
		font-size: 48px;
		margin-bottom: 16px;
		opacity: 0.5;
	}

	.empty-message {
		font-size: 16px;
		text-align: center;
	}

	/* Responsive design */
	@media (max-width: 768px) {
		.metrics-row {
			flex-wrap: wrap;
			gap: 12px;
		}

		.post {
			padding: 12px;
		}

		.author-info {
			gap: 8px;
		}

		.avatar {
			width: 32px;
			height: 32px;
		}

		.engagement-stats {
			flex-wrap: wrap;
			gap: 12px;
		}

		.reactions {
			flex-wrap: wrap;
			gap: 6px;
		}
	}

	/* Animation for new posts */
	.post {
		animation: slideIn 0.3s ease-out;
	}

	@keyframes slideIn {
		from {
			opacity: 0;
			transform: translateY(-10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	/* Accessibility */
	@media (prefers-reduced-motion: reduce) {
		.post,
		.post:hover {
			transition: none;
		}

		@keyframes slideIn {
			from, to {
				opacity: 1;
				transform: translateY(0);
			}
		}
	}
</style>