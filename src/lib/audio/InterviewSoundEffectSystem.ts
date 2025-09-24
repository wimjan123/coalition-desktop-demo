/**
 * Interview Sound Effect System
 * Manages dynamic audio cues, interruptions, and reaction sounds for immersive interviews
 */

export interface SoundEffect {
	id: string;
	name: string;
	category: SoundCategory;
	filePath: string;
	duration: number; // milliseconds
	volume: number; // 0-1
	fadeIn: number; // milliseconds
	fadeOut: number; // milliseconds
	loop: boolean;
	priority: number; // 1-10, higher numbers override lower
	emotional_impact: EmotionalImpact;
	usage_context: string[];
}

export type SoundCategory =
	| 'interruption' | 'reaction' | 'tension' | 'transition'
	| 'ambient' | 'stinger' | 'musical' | 'mechanical';

export interface EmotionalImpact {
	tension: number; // -100 to +100
	drama: number; // 0-100
	suspense: number; // 0-100
	urgency: number; // 0-100
	comfort: number; // -100 to +100
}

export interface SoundTrigger {
	event: TriggerEvent;
	conditions: TriggerCondition[];
	probability: number; // 0-1
	delay: number; // milliseconds
	max_frequency: number; // per minute
}

export type TriggerEvent =
	| 'question-asked' | 'response-given' | 'interruption-started'
	| 'evasion-detected' | 'contradiction-found' | 'gotcha-moment'
	| 'mood-change' | 'tension-escalation' | 'breakthrough-moment'
	| 'timer-warning' | 'session-start' | 'session-end'
	| 'evidence-presented' | 'accountability-pressed';

export interface TriggerCondition {
	type: 'mood' | 'frustration' | 'intensity' | 'time' | 'response_quality';
	operator: 'equals' | 'greater_than' | 'less_than' | 'between';
	value: number | string | [number, number];
}

export interface AudioLayer {
	id: string;
	name: string;
	sounds: SoundEffect[];
	volume: number; // 0-1
	enabled: boolean;
	mix_priority: number; // 1-10
}

export interface SpatialAudioConfig {
	enabled: boolean;
	interviewer_position: { x: number; y: number; z: number };
	guest_position: { x: number; y: number; z: number };
	room_acoustics: RoomAcoustics;
	distance_attenuation: boolean;
	reverb_enabled: boolean;
}

export interface RoomAcoustics {
	room_size: 'small' | 'medium' | 'large';
	reflectivity: number; // 0-1
	absorption: number; // 0-1
	reverb_time: number; // seconds
	echo_delay: number; // milliseconds
}

export interface DynamicMixConfig {
	tension_amplification: number; // 0-2, multiplier
	mood_sensitivity: number; // 0-1
	adaptive_volume: boolean;
	ducking_enabled: boolean; // lower music when speech
	compression_enabled: boolean;
}

// Comprehensive sound effect library
export const INTERVIEW_SOUND_EFFECTS: Record<string, SoundEffect> = {
	// Interruption Sounds
	'interruption-gentle': {
		id: 'interruption-gentle',
		name: 'Gentle Interruption',
		category: 'interruption',
		filePath: '/audio/sfx/interruption-gentle.wav',
		duration: 800,
		volume: 0.4,
		fadeIn: 50,
		fadeOut: 200,
		loop: false,
		priority: 6,
		emotional_impact: {
			tension: 15,
			drama: 10,
			suspense: 5,
			urgency: 20,
			comfort: -10
		},
		usage_context: ['professional', 'mild-pressure', 'clarification']
	},

	'interruption-firm': {
		id: 'interruption-firm',
		name: 'Firm Interruption',
		category: 'interruption',
		filePath: '/audio/sfx/interruption-firm.wav',
		duration: 1200,
		volume: 0.6,
		fadeIn: 30,
		fadeOut: 300,
		loop: false,
		priority: 7,
		emotional_impact: {
			tension: 35,
			drama: 25,
			suspense: 20,
			urgency: 40,
			comfort: -25
		},
		usage_context: ['confrontational', 'evasion-detected', 'follow-up']
	},

	'interruption-aggressive': {
		id: 'interruption-aggressive',
		name: 'Aggressive Interruption',
		category: 'interruption',
		filePath: '/audio/sfx/interruption-aggressive.wav',
		duration: 1500,
		volume: 0.8,
		fadeIn: 10,
		fadeOut: 400,
		loop: false,
		priority: 9,
		emotional_impact: {
			tension: 60,
			drama: 55,
			suspense: 45,
			urgency: 70,
			comfort: -50
		},
		usage_context: ['hostile', 'contradiction-found', 'gotcha-moment']
	},

	// Reaction Sounds
	'reaction-surprise': {
		id: 'reaction-surprise',
		name: 'Surprise Reaction',
		category: 'reaction',
		filePath: '/audio/sfx/reaction-surprise.wav',
		duration: 900,
		volume: 0.5,
		fadeIn: 20,
		fadeOut: 200,
		loop: false,
		priority: 8,
		emotional_impact: {
			tension: 40,
			drama: 50,
			suspense: 60,
			urgency: 30,
			comfort: -20
		},
		usage_context: ['breakthrough-moment', 'unexpected-answer', 'revelation']
	},

	'reaction-skeptical': {
		id: 'reaction-skeptical',
		name: 'Skeptical Reaction',
		category: 'reaction',
		filePath: '/audio/sfx/reaction-skeptical.wav',
		duration: 1100,
		volume: 0.4,
		fadeIn: 40,
		fadeOut: 250,
		loop: false,
		priority: 5,
		emotional_impact: {
			tension: 25,
			drama: 20,
			suspense: 30,
			urgency: 15,
			comfort: -15
		},
		usage_context: ['evasion-detected', 'weak-answer', 'deflection']
	},

	'reaction-approval': {
		id: 'reaction-approval',
		name: 'Approval Reaction',
		category: 'reaction',
		filePath: '/audio/sfx/reaction-approval.wav',
		duration: 800,
		volume: 0.3,
		fadeIn: 60,
		fadeOut: 300,
		loop: false,
		priority: 4,
		emotional_impact: {
			tension: -20,
			drama: 15,
			suspense: -10,
			urgency: -15,
			comfort: 30
		},
		usage_context: ['good-answer', 'honesty-detected', 'breakthrough']
	},

	'reaction-contempt': {
		id: 'reaction-contempt',
		name: 'Contemptuous Reaction',
		category: 'reaction',
		filePath: '/audio/sfx/reaction-contempt.wav',
		duration: 1300,
		volume: 0.6,
		fadeIn: 25,
		fadeOut: 350,
		loop: false,
		priority: 7,
		emotional_impact: {
			tension: 45,
			drama: 40,
			suspense: 25,
			urgency: 20,
			comfort: -40
		},
		usage_context: ['obvious-lie', 'ridiculous-answer', 'credibility-lost']
	},

	// Tension Building
	'tension-buildup-light': {
		id: 'tension-buildup-light',
		name: 'Light Tension Buildup',
		category: 'tension',
		filePath: '/audio/sfx/tension-buildup-light.wav',
		duration: 3000,
		volume: 0.2,
		fadeIn: 500,
		fadeOut: 1000,
		loop: true,
		priority: 3,
		emotional_impact: {
			tension: 20,
			drama: 15,
			suspense: 25,
			urgency: 10,
			comfort: -10
		},
		usage_context: ['pressure-building', 'difficult-question', 'time-constraint']
	},

	'tension-buildup-dramatic': {
		id: 'tension-buildup-dramatic',
		name: 'Dramatic Tension Buildup',
		category: 'tension',
		filePath: '/audio/sfx/tension-buildup-dramatic.wav',
		duration: 5000,
		volume: 0.4,
		fadeIn: 800,
		fadeOut: 1500,
		loop: true,
		priority: 6,
		emotional_impact: {
			tension: 50,
			drama: 60,
			suspense: 65,
			urgency: 40,
			comfort: -35
		},
		usage_context: ['major-confrontation', 'evidence-presentation', 'climactic-moment']
	},

	'tension-explosive': {
		id: 'tension-explosive',
		name: 'Explosive Tension Release',
		category: 'tension',
		filePath: '/audio/sfx/tension-explosive.wav',
		duration: 2000,
		volume: 0.7,
		fadeIn: 50,
		fadeOut: 800,
		loop: false,
		priority: 9,
		emotional_impact: {
			tension: 80,
			drama: 90,
			suspense: 70,
			urgency: 85,
			comfort: -60
		},
		usage_context: ['gotcha-moment', 'devastating-revelation', 'breakdown']
	},

	// Stingers
	'stinger-revelation': {
		id: 'stinger-revelation',
		name: 'Revelation Stinger',
		category: 'stinger',
		filePath: '/audio/sfx/stinger-revelation.wav',
		duration: 1200,
		volume: 0.5,
		fadeIn: 10,
		fadeOut: 300,
		loop: false,
		priority: 8,
		emotional_impact: {
			tension: 60,
			drama: 70,
			suspense: 50,
			urgency: 55,
			comfort: -30
		},
		usage_context: ['major-revelation', 'gotcha-moment', 'contradiction-exposed']
	},

	'stinger-question': {
		id: 'stinger-question',
		name: 'Question Stinger',
		category: 'stinger',
		filePath: '/audio/sfx/stinger-question.wav',
		duration: 600,
		volume: 0.3,
		fadeIn: 20,
		fadeOut: 150,
		loop: false,
		priority: 4,
		emotional_impact: {
			tension: 15,
			drama: 20,
			suspense: 25,
			urgency: 20,
			comfort: -5
		},
		usage_context: ['important-question', 'transition', 'emphasis']
	},

	'stinger-climax': {
		id: 'stinger-climax',
		name: 'Climactic Stinger',
		category: 'stinger',
		filePath: '/audio/sfx/stinger-climax.wav',
		duration: 2500,
		volume: 0.8,
		fadeIn: 30,
		fadeOut: 600,
		loop: false,
		priority: 10,
		emotional_impact: {
			tension: 90,
			drama: 95,
			suspense: 80,
			urgency: 75,
			comfort: -70
		},
		usage_context: ['final-confrontation', 'ultimate-revelation', 'decisive-moment']
	},

	// Transition Effects
	'transition-smooth': {
		id: 'transition-smooth',
		name: 'Smooth Transition',
		category: 'transition',
		filePath: '/audio/sfx/transition-smooth.wav',
		duration: 1500,
		volume: 0.25,
		fadeIn: 200,
		fadeOut: 400,
		loop: false,
		priority: 2,
		emotional_impact: {
			tension: 0,
			drama: 5,
			suspense: 0,
			urgency: 0,
			comfort: 10
		},
		usage_context: ['topic-change', 'mood-shift', 'calm-transition']
	},

	'transition-dramatic': {
		id: 'transition-dramatic',
		name: 'Dramatic Transition',
		category: 'transition',
		filePath: '/audio/sfx/transition-dramatic.wav',
		duration: 2000,
		volume: 0.4,
		fadeIn: 100,
		fadeOut: 500,
		loop: false,
		priority: 6,
		emotional_impact: {
			tension: 30,
			drama: 40,
			suspense: 35,
			urgency: 25,
			comfort: -20
		},
		usage_context: ['escalation', 'mood-change', 'intensity-shift']
	},

	// Ambient Sounds
	'ambient-newsroom': {
		id: 'ambient-newsroom',
		name: 'Newsroom Ambience',
		category: 'ambient',
		filePath: '/audio/sfx/ambient-newsroom.wav',
		duration: 30000,
		volume: 0.15,
		fadeIn: 1000,
		fadeOut: 2000,
		loop: true,
		priority: 1,
		emotional_impact: {
			tension: 5,
			drama: 10,
			suspense: 5,
			urgency: 10,
			comfort: 5
		},
		usage_context: ['professional-setting', 'news-studio', 'formal-interview']
	},

	'ambient-tension': {
		id: 'ambient-tension',
		name: 'Tension Ambience',
		category: 'ambient',
		filePath: '/audio/sfx/ambient-tension.wav',
		duration: 45000,
		volume: 0.2,
		fadeIn: 1500,
		fadeOut: 3000,
		loop: true,
		priority: 3,
		emotional_impact: {
			tension: 25,
			drama: 20,
			suspense: 30,
			urgency: 15,
			comfort: -20
		},
		usage_context: ['confrontational-setting', 'high-pressure', 'investigation']
	},

	// Mechanical Sounds
	'mechanical-click': {
		id: 'mechanical-click',
		name: 'Mechanical Click',
		category: 'mechanical',
		filePath: '/audio/sfx/mechanical-click.wav',
		duration: 200,
		volume: 0.3,
		fadeIn: 5,
		fadeOut: 50,
		loop: false,
		priority: 3,
		emotional_impact: {
			tension: 5,
			drama: 0,
			suspense: 10,
			urgency: 15,
			comfort: 0
		},
		usage_context: ['timer-tick', 'countdown', 'pressure-building']
	},

	'mechanical-whir': {
		id: 'mechanical-whir',
		name: 'Camera Whir',
		category: 'mechanical',
		filePath: '/audio/sfx/mechanical-whir.wav',
		duration: 1800,
		volume: 0.2,
		fadeIn: 100,
		fadeOut: 400,
		loop: false,
		priority: 2,
		emotional_impact: {
			tension: 10,
			drama: 5,
			suspense: 15,
			urgency: 5,
			comfort: -5
		},
		usage_context: ['camera-adjustment', 'technical', 'studio-activity']
	}
};

// Sound trigger configurations
export const SOUND_TRIGGERS: Record<TriggerEvent, SoundTrigger[]> = {
	'question-asked': [
		{
			event: 'question-asked',
			conditions: [
				{ type: 'intensity', operator: 'greater_than', value: 70 }
			],
			probability: 0.8,
			delay: 200,
			max_frequency: 10
		}
	],

	'interruption-started': [
		{
			event: 'interruption-started',
			conditions: [
				{ type: 'frustration', operator: 'greater_than', value: 50 }
			],
			probability: 0.9,
			delay: 0,
			max_frequency: 15
		}
	],

	'evasion-detected': [
		{
			event: 'evasion-detected',
			conditions: [
				{ type: 'response_quality', operator: 'less_than', value: 40 }
			],
			probability: 0.7,
			delay: 300,
			max_frequency: 8
		}
	],

	'gotcha-moment': [
		{
			event: 'gotcha-moment',
			conditions: [],
			probability: 1.0,
			delay: 100,
			max_frequency: 3
		}
	],

	'mood-change': [
		{
			event: 'mood-change',
			conditions: [
				{ type: 'intensity', operator: 'between', value: [30, 80] }
			],
			probability: 0.6,
			delay: 400,
			max_frequency: 12
		}
	],

	'tension-escalation': [
		{
			event: 'tension-escalation',
			conditions: [
				{ type: 'frustration', operator: 'greater_than', value: 60 }
			],
			probability: 0.8,
			delay: 500,
			max_frequency: 6
		}
	],

	'breakthrough-moment': [
		{
			event: 'breakthrough-moment',
			conditions: [
				{ type: 'response_quality', operator: 'greater_than', value: 80 }
			],
			probability: 0.9,
			delay: 150,
			max_frequency: 4
		}
	],

	'timer-warning': [
		{
			event: 'timer-warning',
			conditions: [
				{ type: 'time', operator: 'less_than', value: 5 }
			],
			probability: 1.0,
			delay: 0,
			max_frequency: 1
		}
	],

	'response-given': [
		{
			event: 'response-given',
			conditions: [],
			probability: 0.3,
			delay: 800,
			max_frequency: 20
		}
	],

	'contradiction-found': [
		{
			event: 'contradiction-found',
			conditions: [],
			probability: 0.95,
			delay: 250,
			max_frequency: 5
		}
	],

	'evidence-presented': [
		{
			event: 'evidence-presented',
			conditions: [
				{ type: 'intensity', operator: 'greater_than', value: 50 }
			],
			probability: 0.85,
			delay: 100,
			max_frequency: 8
		}
	],

	'accountability-pressed': [
		{
			event: 'accountability-pressed',
			conditions: [
				{ type: 'frustration', operator: 'greater_than', value: 40 }
			],
			probability: 0.75,
			delay: 300,
			max_frequency: 10
		}
	],

	'session-start': [
		{
			event: 'session-start',
			conditions: [],
			probability: 1.0,
			delay: 1000,
			max_frequency: 1
		}
	],

	'session-end': [
		{
			event: 'session-end',
			conditions: [],
			probability: 1.0,
			delay: 500,
			max_frequency: 1
		}
	]
};

// Audio layer definitions
export const AUDIO_LAYERS: Record<string, AudioLayer> = {
	'ambient': {
		id: 'ambient',
		name: 'Ambient Layer',
		sounds: [
			INTERVIEW_SOUND_EFFECTS['ambient-newsroom'],
			INTERVIEW_SOUND_EFFECTS['ambient-tension']
		],
		volume: 0.4,
		enabled: true,
		mix_priority: 1
	},

	'effects': {
		id: 'effects',
		name: 'Sound Effects Layer',
		sounds: Object.values(INTERVIEW_SOUND_EFFECTS).filter(s =>
			['interruption', 'reaction', 'stinger', 'mechanical'].includes(s.category)
		),
		volume: 0.7,
		enabled: true,
		mix_priority: 3
	},

	'tension': {
		id: 'tension',
		name: 'Tension Building Layer',
		sounds: Object.values(INTERVIEW_SOUND_EFFECTS).filter(s =>
			s.category === 'tension'
		),
		volume: 0.6,
		enabled: true,
		mix_priority: 2
	},

	'transitions': {
		id: 'transitions',
		name: 'Transition Layer',
		sounds: Object.values(INTERVIEW_SOUND_EFFECTS).filter(s =>
			s.category === 'transition'
		),
		volume: 0.5,
		enabled: true,
		mix_priority: 2
	}
};

export class InterviewSoundEffectSystem {
	private audioContext: AudioContext;
	private audioElements: Map<string, HTMLAudioElement> = new Map();
	private activeSounds: Map<string, { element: HTMLAudioElement; startTime: number }> = new Map();
	private soundHistory: { soundId: string; timestamp: number; context: string }[] = [];
	private layers: Map<string, AudioLayer> = new Map();
	private spatialConfig: SpatialAudioConfig;
	private mixConfig: DynamicMixConfig;
	private triggerFrequency: Map<string, number[]> = new Map();

	constructor(spatialConfig?: SpatialAudioConfig, mixConfig?: DynamicMixConfig) {
		this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
		this.spatialConfig = spatialConfig || this.getDefaultSpatialConfig();
		this.mixConfig = mixConfig || this.getDefaultMixConfig();

		this.initializeAudioLayers();
		this.preloadSoundEffects();
	}

	/**
	 * Initialize audio layers
	 */
	private initializeAudioLayers(): void {
		Object.values(AUDIO_LAYERS).forEach(layer => {
			this.layers.set(layer.id, layer);
		});
	}

	/**
	 * Preload critical sound effects
	 */
	private async preloadSoundEffects(): Promise<void> {
		const criticalSounds = [
			'interruption-firm',
			'reaction-surprise',
			'stinger-revelation',
			'tension-buildup-dramatic'
		];

		for (const soundId of criticalSounds) {
			await this.loadSoundEffect(soundId);
		}
	}

	/**
	 * Load a sound effect
	 */
	private async loadSoundEffect(soundId: string): Promise<HTMLAudioElement> {
		const sound = INTERVIEW_SOUND_EFFECTS[soundId];
		if (!sound) throw new Error(`Sound effect not found: ${soundId}`);

		if (this.audioElements.has(soundId)) {
			return this.audioElements.get(soundId)!;
		}

		const audio = new Audio(sound.filePath);
		audio.volume = sound.volume;
		audio.preload = 'auto';

		return new Promise((resolve, reject) => {
			audio.addEventListener('canplaythrough', () => {
				this.audioElements.set(soundId, audio);
				resolve(audio);
			});

			audio.addEventListener('error', reject);
		});
	}

	/**
	 * Trigger a sound effect based on an event
	 */
	async triggerSoundForEvent(
		event: TriggerEvent,
		context: {
			mood?: string;
			frustration?: number;
			intensity?: number;
			responseQuality?: number;
			timeRemaining?: number;
		}
	): Promise<void> {
		const triggers = SOUND_TRIGGERS[event] || [];

		for (const trigger of triggers) {
			if (this.shouldTriggerSound(trigger, context)) {
				const soundId = this.selectSoundForEvent(event, context);
				if (soundId) {
					setTimeout(() => {
						this.playSound(soundId, context);
					}, trigger.delay);
				}
			}
		}
	}

	/**
	 * Check if sound should be triggered based on conditions
	 */
	private shouldTriggerSound(trigger: SoundTrigger, context: any): boolean {
		// Check probability
		if (Math.random() > trigger.probability) return false;

		// Check frequency limits
		const now = Date.now();
		const eventHistory = this.triggerFrequency.get(trigger.event) || [];
		const recentTriggers = eventHistory.filter(time => now - time < 60000); // Last minute

		if (recentTriggers.length >= trigger.max_frequency) return false;

		// Check conditions
		for (const condition of trigger.conditions) {
			if (!this.evaluateCondition(condition, context)) return false;
		}

		// Update frequency tracking
		eventHistory.push(now);
		this.triggerFrequency.set(trigger.event, eventHistory.slice(-10)); // Keep last 10

		return true;
	}

	/**
	 * Evaluate a trigger condition
	 */
	private evaluateCondition(condition: TriggerCondition, context: any): boolean {
		const value = context[condition.type];
		if (value === undefined) return false;

		switch (condition.operator) {
			case 'equals':
				return value === condition.value;
			case 'greater_than':
				return value > condition.value;
			case 'less_than':
				return value < condition.value;
			case 'between':
				const [min, max] = condition.value as [number, number];
				return value >= min && value <= max;
			default:
				return false;
		}
	}

	/**
	 * Select appropriate sound for event and context
	 */
	private selectSoundForEvent(event: TriggerEvent, context: any): string | null {
		const candidateSounds: string[] = [];

		// Map events to sound categories and specific sounds
		switch (event) {
			case 'interruption-started':
				if (context.frustration > 70) candidateSounds.push('interruption-aggressive');
				else if (context.frustration > 40) candidateSounds.push('interruption-firm');
				else candidateSounds.push('interruption-gentle');
				break;

			case 'gotcha-moment':
				candidateSounds.push('stinger-revelation', 'tension-explosive');
				break;

			case 'evasion-detected':
				candidateSounds.push('reaction-skeptical', 'interruption-firm');
				break;

			case 'breakthrough-moment':
				candidateSounds.push('reaction-surprise', 'reaction-approval');
				break;

			case 'tension-escalation':
				candidateSounds.push('tension-buildup-dramatic', 'stinger-climax');
				break;

			case 'mood-change':
				candidateSounds.push('transition-dramatic', 'transition-smooth');
				break;

			case 'question-asked':
				if (context.intensity > 70) candidateSounds.push('stinger-question');
				else candidateSounds.push('transition-smooth');
				break;

			case 'timer-warning':
				candidateSounds.push('mechanical-click');
				break;

			default:
				candidateSounds.push('stinger-question');
		}

		// Filter by usage context
		const contextualSounds = candidateSounds.filter(soundId => {
			const sound = INTERVIEW_SOUND_EFFECTS[soundId];
			return sound && this.isSoundContextuallyAppropriate(sound, context);
		});

		return contextualSounds.length > 0 ?
			contextualSounds[Math.floor(Math.random() * contextualSounds.length)] :
			candidateSounds[0] || null;
	}

	/**
	 * Check if sound is contextually appropriate
	 */
	private isSoundContextuallyAppropriate(sound: SoundEffect, context: any): boolean {
		// Check if any currently playing high-priority sounds would conflict
		for (const [activeSoundId] of this.activeSounds) {
			const activeSound = INTERVIEW_SOUND_EFFECTS[activeSoundId];
			if (activeSound && activeSound.priority > sound.priority) {
				return false;
			}
		}

		// Check context match
		if (context.mood && sound.usage_context.includes(context.mood)) {
			return true;
		}

		return sound.usage_context.length === 0; // Default sounds are always appropriate
	}

	/**
	 * Play a sound effect
	 */
	async playSound(soundId: string, context?: any): Promise<void> {
		try {
			const sound = INTERVIEW_SOUND_EFFECTS[soundId];
			if (!sound) return;

			// Load sound if not already loaded
			let audio = this.audioElements.get(soundId);
			if (!audio) {
				audio = await this.loadSoundEffect(soundId);
			}

			// Stop conflicting sounds
			this.stopConflictingSounds(sound);

			// Clone audio element for overlapping playback
			const audioClone = audio.cloneNode() as HTMLAudioElement;

			// Apply dynamic volume adjustment
			const adjustedVolume = this.calculateDynamicVolume(sound, context);
			audioClone.volume = adjustedVolume;

			// Apply spatial audio if enabled
			if (this.spatialConfig.enabled && context) {
				this.applySpatialAudio(audioClone, context);
			}

			// Apply fade in
			if (sound.fadeIn > 0) {
				audioClone.volume = 0;
				this.fadeIn(audioClone, adjustedVolume, sound.fadeIn);
			}

			// Setup fade out
			if (sound.fadeOut > 0) {
				setTimeout(() => {
					this.fadeOut(audioClone, sound.fadeOut);
				}, sound.duration - sound.fadeOut);
			}

			// Play the sound
			const playPromise = audioClone.play();
			if (playPromise) {
				await playPromise;
			}

			// Track active sound
			this.activeSounds.set(`${soundId}-${Date.now()}`, {
				element: audioClone,
				startTime: Date.now()
			});

			// Record in history
			this.soundHistory.push({
				soundId,
				timestamp: Date.now(),
				context: JSON.stringify(context || {})
			});

			// Cleanup when finished
			audioClone.addEventListener('ended', () => {
				this.activeSounds.delete(`${soundId}-${Date.now()}`);
			});

		} catch (error) {
			console.error(`Failed to play sound ${soundId}:`, error);
		}
	}

	/**
	 * Stop sounds that conflict with the new sound
	 */
	private stopConflictingSounds(newSound: SoundEffect): void {
		for (const [key, { element }] of this.activeSounds) {
			const activeSoundId = key.split('-')[0];
			const activeSound = INTERVIEW_SOUND_EFFECTS[activeSoundId];

			if (activeSound && activeSound.priority < newSound.priority) {
				this.fadeOut(element, 200);
				this.activeSounds.delete(key);
			}
		}
	}

	/**
	 * Calculate dynamic volume based on context
	 */
	private calculateDynamicVolume(sound: SoundEffect, context?: any): number {
		let volume = sound.volume;

		if (this.mixConfig.adaptive_volume && context) {
			// Increase volume for high tension
			if (context.frustration > 70) {
				volume *= 1.2;
			} else if (context.frustration < 30) {
				volume *= 0.8;
			}

			// Adjust for mood
			if (context.mood === 'hostile' || context.mood === 'frustrated') {
				volume *= 1.1;
			} else if (context.mood === 'sympathetic' || context.mood === 'approving') {
				volume *= 0.9;
			}
		}

		return Math.min(1, Math.max(0, volume));
	}

	/**
	 * Apply spatial audio positioning
	 */
	private applySpatialAudio(audio: HTMLAudioElement, context: any): void {
		// This would integrate with Web Audio API for 3D positioning
		// Implementation depends on specific spatial audio requirements
	}

	/**
	 * Fade in audio element
	 */
	private fadeIn(audio: HTMLAudioElement, targetVolume: number, duration: number): void {
		const startTime = Date.now();
		const fadeInterval = setInterval(() => {
			const elapsed = Date.now() - startTime;
			const progress = Math.min(elapsed / duration, 1);
			audio.volume = targetVolume * progress;

			if (progress >= 1) {
				clearInterval(fadeInterval);
			}
		}, 16); // ~60fps
	}

	/**
	 * Fade out audio element
	 */
	private fadeOut(audio: HTMLAudioElement, duration: number): void {
		const startVolume = audio.volume;
		const startTime = Date.now();
		const fadeInterval = setInterval(() => {
			const elapsed = Date.now() - startTime;
			const progress = Math.min(elapsed / duration, 1);
			audio.volume = startVolume * (1 - progress);

			if (progress >= 1) {
				clearInterval(fadeInterval);
				audio.pause();
			}
		}, 16); // ~60fps
	}

	/**
	 * Stop all sounds
	 */
	stopAllSounds(): void {
		for (const [key, { element }] of this.activeSounds) {
			element.pause();
			this.activeSounds.delete(key);
		}
	}

	/**
	 * Get default spatial configuration
	 */
	private getDefaultSpatialConfig(): SpatialAudioConfig {
		return {
			enabled: false,
			interviewer_position: { x: -1, y: 0, z: 0 },
			guest_position: { x: 1, y: 0, z: 0 },
			room_acoustics: {
				room_size: 'medium',
				reflectivity: 0.3,
				absorption: 0.7,
				reverb_time: 1.2,
				echo_delay: 50
			},
			distance_attenuation: true,
			reverb_enabled: true
		};
	}

	/**
	 * Get default mix configuration
	 */
	private getDefaultMixConfig(): DynamicMixConfig {
		return {
			tension_amplification: 1.2,
			mood_sensitivity: 0.8,
			adaptive_volume: true,
			ducking_enabled: true,
			compression_enabled: true
		};
	}

	/**
	 * Set layer volume
	 */
	setLayerVolume(layerId: string, volume: number): void {
		const layer = this.layers.get(layerId);
		if (layer) {
			layer.volume = Math.max(0, Math.min(1, volume));
		}
	}

	/**
	 * Enable/disable layer
	 */
	setLayerEnabled(layerId: string, enabled: boolean): void {
		const layer = this.layers.get(layerId);
		if (layer) {
			layer.enabled = enabled;
		}
	}

	/**
	 * Get sound history
	 */
	getSoundHistory(): { soundId: string; timestamp: number; context: string }[] {
		return [...this.soundHistory];
	}

	/**
	 * Clear sound history
	 */
	clearSoundHistory(): void {
		this.soundHistory = [];
	}
}