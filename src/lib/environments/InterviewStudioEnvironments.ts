/**
 * Background-Specific Interview Studio Environments
 * Provides unique visual settings for different interview contexts and backgrounds
 */

export interface StudioEnvironment {
	id: string;
	name: string;
	description: string;
	context: InterviewContext[];
	visualElements: StudioVisualElements;
	lighting: StudioLightingConfig;
	atmosphere: AtmosphereConfig;
	props: StudioProps[];
	cameraAngles: CameraConfiguration[];
}

export type InterviewContext =
	| 'character-creation' | 'scandal-response' | 'crisis-management'
	| 'debate-prep' | 'investigative-journalism' | 'late-campaign-pressure'
	| 'coalition-negotiation' | 'policy-announcement';

export interface StudioVisualElements {
	backgroundType: 'green-screen' | 'physical-set' | 'virtual-environment' | 'hybrid';
	wallTexture: string;
	floorMaterial: string;
	ceiling: string;
	colorScheme: ColorScheme;
	brandingElements: BrandingElement[];
	digitalScreens: DigitalScreen[];
	furnitureLayout: FurnitureLayout;
}

export interface ColorScheme {
	primary: string;
	secondary: string;
	accent: string;
	neutral: string;
	background: string;
	text: string;
}

export interface BrandingElement {
	type: 'logo' | 'text' | 'graphic' | 'ticker';
	position: Position3D;
	size: { width: number; height: number };
	content: string;
	opacity: number;
	animation?: string;
}

export interface DigitalScreen {
	id: string;
	position: Position3D;
	size: { width: number; height: number };
	content: ScreenContent;
	interactivity: boolean;
	updateFrequency: number; // seconds
}

export interface ScreenContent {
	type: 'news-feed' | 'social-media' | 'polling-data' | 'static-graphics' | 'live-data';
	template: string;
	dataSource?: string;
	refreshRate: number;
}

export interface Position3D {
	x: number;
	y: number;
	z: number;
	rotation: { x: number; y: number; z: number };
}

export interface FurnitureLayout {
	interviewerDesk: DeskConfiguration;
	guestSeating: SeatingConfiguration;
	backgroundElements: BackgroundElement[];
	decorativeItems: DecorativeItem[];
}

export interface DeskConfiguration {
	style: 'modern' | 'traditional' | 'minimalist' | 'executive' | 'rustic';
	material: string;
	color: string;
	position: Position3D;
	accessories: DeskAccessory[];
}

export interface SeatingConfiguration {
	type: 'chair' | 'sofa' | 'bench' | 'stool';
	style: string;
	material: string;
	color: string;
	position: Position3D;
	comfort_level: number; // 1-10, affects guest stress
}

export interface BackgroundElement {
	type: 'bookshelf' | 'artwork' | 'plant' | 'flag' | 'window' | 'cityscape' | 'abstract';
	position: Position3D;
	scale: number;
	detail_level: 'low' | 'medium' | 'high';
}

export interface DecorativeItem {
	item: string;
	position: Position3D;
	scale: number;
	significance: 'neutral' | 'symbolic' | 'intimidating' | 'comforting';
}

export interface DeskAccessory {
	item: 'papers' | 'laptop' | 'coffee' | 'pen' | 'folder' | 'tablet' | 'microphone';
	position: { x: number; y: number };
	interaction_potential: boolean;
}

export interface StudioLightingConfig {
	scheme: LightingScheme;
	keyLight: LightSource;
	fillLight: LightSource;
	backLight: LightSource;
	ambient: AmbientLighting;
	dramatic: DramaticLighting;
	mood_responsive: boolean;
}

export type LightingScheme = 'professional' | 'dramatic' | 'intimate' | 'harsh' | 'soft' | 'dynamic';

export interface LightSource {
	type: 'softbox' | 'led-panel' | 'spotlight' | 'natural' | 'neon';
	intensity: number; // 0-100
	color_temperature: number; // Kelvin
	position: Position3D;
	diffusion: number; // 0-100
	beam_angle: number; // degrees
}

export interface AmbientLighting {
	base_intensity: number;
	color_cast: string;
	variation: number; // how much it changes
	transition_speed: number; // seconds
}

export interface DramaticLighting {
	shadow_harshness: number; // 0-100
	contrast_boost: number; // 0-100
	color_shift: string;
	movement: boolean;
}

export interface AtmosphereConfig {
	tension_level: number; // 0-100
	formality: number; // 0-100
	intimidation_factor: number; // 0-100
	comfort_level: number; // 0-100
	media_presence: number; // 0-100
	background_activity: BackgroundActivity[];
	sound_profile: SoundProfile;
}

export interface BackgroundActivity {
	type: 'staff-movement' | 'technical-adjustment' | 'camera-operation' | 'production-noise';
	frequency: number; // events per minute
	intensity: number; // 0-100
	visibility: number; // 0-100
}

export interface SoundProfile {
	ambient_volume: number; // 0-100
	echo_level: number; // 0-100
	background_hum: number; // 0-100
	technical_sounds: boolean;
	air_conditioning: boolean;
}

export interface CameraConfiguration {
	name: string;
	position: Position3D;
	focal_length: number;
	aperture: number;
	angle: 'wide' | 'medium' | 'close' | 'extreme-close';
	movement: 'static' | 'subtle-drift' | 'dynamic' | 'handheld';
	usage_context: string[];
}

// Predefined studio environments
export const STUDIO_ENVIRONMENTS: Record<string, StudioEnvironment> = {
	'professional-newsroom': {
		id: 'professional-newsroom',
		name: 'Professional News Studio',
		description: 'Modern professional broadcast studio with news desk and city backdrop',
		context: ['character-creation', 'policy-announcement', 'debate-prep'],
		visualElements: {
			backgroundType: 'hybrid',
			wallTexture: 'matte-blue-gradient',
			floorMaterial: 'polished-concrete',
			ceiling: 'grid-lighting-system',
			colorScheme: {
				primary: '#1e3a8a', // Deep blue
				secondary: '#3b82f6', // Lighter blue
				accent: '#fbbf24', // Gold
				neutral: '#6b7280', // Gray
				background: '#f8fafc', // Off-white
				text: '#111827' // Dark gray
			},
			brandingElements: [
				{
					type: 'logo',
					position: { x: -200, y: 100, z: 50, rotation: { x: 0, y: 0, z: 0 } },
					size: { width: 120, height: 60 },
					content: 'NEWS-LOGO',
					opacity: 0.8
				},
				{
					type: 'ticker',
					position: { x: 0, y: -150, z: 10, rotation: { x: 0, y: 0, z: 0 } },
					size: { width: 800, height: 40 },
					content: 'BREAKING-NEWS-TICKER',
					opacity: 0.9,
					animation: 'scroll-left'
				}
			],
			digitalScreens: [
				{
					id: 'main-backdrop',
					position: { x: 0, y: 0, z: -200, rotation: { x: 0, y: 0, z: 0 } },
					size: { width: 400, height: 300 },
					content: {
						type: 'live-data',
						template: 'cityscape-live',
						refreshRate: 30
					},
					interactivity: false,
					updateFrequency: 5
				},
				{
					id: 'side-monitor',
					position: { x: 150, y: 50, z: -50, rotation: { x: 0, y: -15, z: 0 } },
					size: { width: 80, height: 60 },
					content: {
						type: 'polling-data',
						template: 'real-time-polls',
						refreshRate: 10
					},
					interactivity: true,
					updateFrequency: 15
				}
			],
			furnitureLayout: {
				interviewerDesk: {
					style: 'modern',
					material: 'glass-steel',
					color: '#374151',
					position: { x: 0, y: -20, z: 0, rotation: { x: 0, y: 0, z: 0 } },
					accessories: [
						{ item: 'laptop', position: { x: -20, y: 0 }, interaction_potential: true },
						{ item: 'papers', position: { x: 0, y: 5 }, interaction_potential: true },
						{ item: 'coffee', position: { x: 15, y: -5 }, interaction_potential: false }
					]
				},
				guestSeating: {
					type: 'chair',
					style: 'executive',
					material: 'leather',
					color: '#1f2937',
					position: { x: 100, y: -20, z: 20, rotation: { x: 0, y: -20, z: 0 } },
					comfort_level: 7
				},
				backgroundElements: [
					{
						type: 'cityscape',
						position: { x: 0, y: 0, z: -300, rotation: { x: 0, y: 0, z: 0 } },
						scale: 1.2,
						detail_level: 'high'
					},
					{
						type: 'flag',
						position: { x: -180, y: 50, z: -80, rotation: { x: 0, y: 30, z: 0 } },
						scale: 0.8,
						detail_level: 'medium'
					}
				],
				decorativeItems: [
					{
						item: 'award-trophy',
						position: { x: -150, y: 20, z: -30, rotation: { x: 0, y: 0, z: 0 } },
						scale: 0.6,
						significance: 'symbolic'
					}
				]
			}
		},
		lighting: {
			scheme: 'professional',
			keyLight: {
				type: 'softbox',
				intensity: 85,
				color_temperature: 5600,
				position: { x: -100, y: 200, z: 100, rotation: { x: -30, y: 0, z: 0 } },
				diffusion: 80,
				beam_angle: 60
			},
			fillLight: {
				type: 'led-panel',
				intensity: 40,
				color_temperature: 5600,
				position: { x: 150, y: 150, z: 80, rotation: { x: -20, y: -15, z: 0 } },
				diffusion: 90,
				beam_angle: 80
			},
			backLight: {
				type: 'spotlight',
				intensity: 60,
				color_temperature: 6500,
				position: { x: 0, y: 250, z: -150, rotation: { x: -45, y: 0, z: 0 } },
				diffusion: 20,
				beam_angle: 20
			},
			ambient: {
				base_intensity: 25,
				color_cast: '#f0f9ff',
				variation: 5,
				transition_speed: 3
			},
			dramatic: {
				shadow_harshness: 30,
				contrast_boost: 15,
				color_shift: 'none',
				movement: false
			},
			mood_responsive: true
		},
		atmosphere: {
			tension_level: 20,
			formality: 85,
			intimidation_factor: 15,
			comfort_level: 70,
			media_presence: 90,
			background_activity: [
				{
					type: 'technical-adjustment',
					frequency: 0.5,
					intensity: 20,
					visibility: 10
				},
				{
					type: 'camera-operation',
					frequency: 1.2,
					intensity: 30,
					visibility: 15
				}
			],
			sound_profile: {
				ambient_volume: 25,
				echo_level: 15,
				background_hum: 10,
				technical_sounds: true,
				air_conditioning: true
			}
		},
		props: [],
		cameraAngles: [
			{
				name: 'standard-interview',
				position: { x: 0, y: 80, z: 200, rotation: { x: -5, y: 0, z: 0 } },
				focal_length: 50,
				aperture: 2.8,
				angle: 'medium',
				movement: 'static',
				usage_context: ['normal-questions', 'opening', 'closing']
			},
			{
				name: 'pressure-angle',
				position: { x: -50, y: 60, z: 150, rotation: { x: 0, y: 15, z: 0 } },
				focal_length: 85,
				aperture: 1.8,
				angle: 'close',
				movement: 'subtle-drift',
				usage_context: ['confrontational', 'gotcha-moments']
			}
		]
	},

	'investigative-bunker': {
		id: 'investigative-bunker',
		name: 'Investigative Journalism Bunker',
		description: 'Dark, intense studio designed for serious investigative confrontations',
		context: ['investigative-journalism', 'scandal-response', 'crisis-management'],
		visualElements: {
			backgroundType: 'physical-set',
			wallTexture: 'dark-concrete',
			floorMaterial: 'industrial-metal',
			ceiling: 'exposed-industrial',
			colorScheme: {
				primary: '#1f2937', // Dark gray
				secondary: '#374151', // Medium gray
				accent: '#dc2626', // Red
				neutral: '#6b7280', // Gray
				background: '#111827', // Very dark
				text: '#f9fafb' // Off-white
			},
			brandingElements: [
				{
					type: 'text',
					position: { x: 0, y: 120, z: -100, rotation: { x: 0, y: 0, z: 0 } },
					size: { width: 300, height: 50 },
					content: 'INVESTIGATIVE UNIT',
					opacity: 0.7
				}
			],
			digitalScreens: [
				{
					id: 'evidence-wall',
					position: { x: -200, y: 50, z: -150, rotation: { x: 0, y: 30, z: 0 } },
					size: { width: 200, height: 150 },
					content: {
						type: 'static-graphics',
						template: 'evidence-board',
						refreshRate: 0
					},
					interactivity: false,
					updateFrequency: 0
				},
				{
					id: 'document-viewer',
					position: { x: 0, y: 0, z: -50, rotation: { x: 0, y: 0, z: 0 } },
					size: { width: 100, height: 140 },
					content: {
						type: 'static-graphics',
						template: 'documents',
						refreshRate: 0
					},
					interactivity: true,
					updateFrequency: 0
				}
			],
			furnitureLayout: {
				interviewerDesk: {
					style: 'traditional',
					material: 'dark-wood',
					color: '#1f2937',
					position: { x: 0, y: -20, z: 0, rotation: { x: 0, y: 0, z: 0 } },
					accessories: [
						{ item: 'folder', position: { x: -15, y: 0 }, interaction_potential: true },
						{ item: 'papers', position: { x: 0, y: 0 }, interaction_potential: true },
						{ item: 'pen', position: { x: 10, y: 5 }, interaction_potential: true }
					]
				},
				guestSeating: {
					type: 'chair',
					style: 'interrogation',
					material: 'metal',
					color: '#374151',
					position: { x: 120, y: -20, z: 30, rotation: { x: 0, y: -25, z: 0 } },
					comfort_level: 3
				},
				backgroundElements: [
					{
						type: 'bookshelf',
						position: { x: 150, y: 0, z: -120, rotation: { x: 0, y: -15, z: 0 } },
						scale: 1.0,
						detail_level: 'high'
					}
				],
				decorativeItems: [
					{
						item: 'evidence-box',
						position: { x: -100, y: -10, z: -20, rotation: { x: 0, y: 0, z: 0 } },
						scale: 0.8,
						significance: 'intimidating'
					},
					{
						item: 'legal-books',
						position: { x: 180, y: 40, z: -100, rotation: { x: 0, y: -20, z: 0 } },
						scale: 0.7,
						significance: 'symbolic'
					}
				]
			}
		},
		lighting: {
			scheme: 'dramatic',
			keyLight: {
				type: 'spotlight',
				intensity: 95,
				color_temperature: 4800,
				position: { x: -80, y: 300, z: 50, rotation: { x: -60, y: 0, z: 0 } },
				diffusion: 30,
				beam_angle: 30
			},
			fillLight: {
				type: 'led-panel',
				intensity: 20,
				color_temperature: 4800,
				position: { x: 200, y: 150, z: 100, rotation: { x: -30, y: -20, z: 0 } },
				diffusion: 70,
				beam_angle: 90
			},
			backLight: {
				type: 'neon',
				intensity: 40,
				color_temperature: 3200,
				position: { x: 0, y: 200, z: -200, rotation: { x: -30, y: 0, z: 0 } },
				diffusion: 10,
				beam_angle: 120
			},
			ambient: {
				base_intensity: 10,
				color_cast: '#1f2937',
				variation: 15,
				transition_speed: 8
			},
			dramatic: {
				shadow_harshness: 85,
				contrast_boost: 60,
				color_shift: '#dc2626',
				movement: true
			},
			mood_responsive: true
		},
		atmosphere: {
			tension_level: 90,
			formality: 60,
			intimidation_factor: 85,
			comfort_level: 20,
			media_presence: 70,
			background_activity: [
				{
					type: 'staff-movement',
					frequency: 0.2,
					intensity: 40,
					visibility: 30
				}
			],
			sound_profile: {
				ambient_volume: 15,
				echo_level: 40,
				background_hum: 20,
				technical_sounds: false,
				air_conditioning: false
			}
		},
		props: [],
		cameraAngles: [
			{
				name: 'intimidation-angle',
				position: { x: -30, y: 50, z: 100, rotation: { x: 5, y: 20, z: 0 } },
				focal_length: 85,
				aperture: 1.4,
				angle: 'close',
				movement: 'handheld',
				usage_context: ['confrontational', 'evidence-presentation']
			},
			{
				name: 'wide-pressure',
				position: { x: 0, y: 100, z: 250, rotation: { x: -10, y: 0, z: 0 } },
				focal_length: 35,
				aperture: 2.8,
				angle: 'wide',
				movement: 'subtle-drift',
				usage_context: ['tension-building', 'reaction-shots']
			}
		]
	},

	'crisis-situation-room': {
		id: 'crisis-situation-room',
		name: 'Crisis Situation Room',
		description: 'High-tech emergency briefing room for crisis management interviews',
		context: ['crisis-management', 'late-campaign-pressure', 'scandal-response'],
		visualElements: {
			backgroundType: 'virtual-environment',
			wallTexture: 'high-tech-panels',
			floorMaterial: 'polished-stone',
			ceiling: 'recessed-led-grid',
			colorScheme: {
				primary: '#0f172a', // Very dark blue
				secondary: '#1e293b', // Dark blue
				accent: '#ef4444', // Red
				neutral: '#475569', // Blue-gray
				background: '#020617', // Almost black
				text: '#f1f5f9' // Light blue
			},
			brandingElements: [
				{
					type: 'text',
					position: { x: 0, y: 150, z: -80, rotation: { x: 0, y: 0, z: 0 } },
					size: { width: 200, height: 30 },
					content: 'CRISIS CENTER',
					opacity: 0.8
				}
			],
			digitalScreens: [
				{
					id: 'crisis-monitor-1',
					position: { x: -150, y: 80, z: -100, rotation: { x: 0, y: 20, z: 0 } },
					size: { width: 120, height: 80 },
					content: {
						type: 'live-data',
						template: 'crisis-metrics',
						refreshRate: 5
					},
					interactivity: false,
					updateFrequency: 2
				},
				{
					id: 'crisis-monitor-2',
					position: { x: 150, y: 80, z: -100, rotation: { x: 0, y: -20, z: 0 } },
					size: { width: 120, height: 80 },
					content: {
						type: 'news-feed',
						template: 'breaking-news',
						refreshRate: 10
					},
					interactivity: false,
					updateFrequency: 5
				},
				{
					id: 'main-display',
					position: { x: 0, y: 50, z: -200, rotation: { x: 0, y: 0, z: 0 } },
					size: { width: 300, height: 200 },
					content: {
						type: 'live-data',
						template: 'situation-map',
						refreshRate: 3
					},
					interactivity: true,
					updateFrequency: 1
				}
			],
			furnitureLayout: {
				interviewerDesk: {
					style: 'executive',
					material: 'carbon-fiber',
					color: '#1e293b',
					position: { x: 0, y: -20, z: 0, rotation: { x: 0, y: 0, z: 0 } },
					accessories: [
						{ item: 'tablet', position: { x: -10, y: 0 }, interaction_potential: true },
						{ item: 'microphone', position: { x: 0, y: 5 }, interaction_potential: false },
						{ item: 'folder', position: { x: 15, y: -5 }, interaction_potential: true }
					]
				},
				guestSeating: {
					type: 'chair',
					style: 'high-tech',
					material: 'synthetic',
					color: '#334155',
					position: { x: 110, y: -20, z: 15, rotation: { x: 0, y: -20, z: 0 } },
					comfort_level: 5
				},
				backgroundElements: [
					{
						type: 'abstract',
						position: { x: 0, y: 0, z: -250, rotation: { x: 0, y: 0, z: 0 } },
						scale: 1.5,
						detail_level: 'high'
					}
				],
				decorativeItems: [
					{
						item: 'emergency-phone',
						position: { x: -120, y: 10, z: -30, rotation: { x: 0, y: 0, z: 0 } },
						scale: 0.7,
						significance: 'symbolic'
					}
				]
			}
		},
		lighting: {
			scheme: 'dynamic',
			keyLight: {
				type: 'led-panel',
				intensity: 80,
				color_temperature: 6500,
				position: { x: -100, y: 250, z: 80, rotation: { x: -45, y: 0, z: 0 } },
				diffusion: 60,
				beam_angle: 70
			},
			fillLight: {
				type: 'led-panel',
				intensity: 35,
				color_temperature: 6500,
				position: { x: 180, y: 180, z: 120, rotation: { x: -35, y: -25, z: 0 } },
				diffusion: 80,
				beam_angle: 90
			},
			backLight: {
				type: 'neon',
				intensity: 70,
				color_temperature: 8000,
				position: { x: 0, y: 300, z: -180, rotation: { x: -40, y: 0, z: 0 } },
				diffusion: 20,
				beam_angle: 45
			},
			ambient: {
				base_intensity: 15,
				color_cast: '#0f172a',
				variation: 25,
				transition_speed: 5
			},
			dramatic: {
				shadow_harshness: 70,
				contrast_boost: 45,
				color_shift: '#ef4444',
				movement: true
			},
			mood_responsive: true
		},
		atmosphere: {
			tension_level: 85,
			formality: 70,
			intimidation_factor: 75,
			comfort_level: 30,
			media_presence: 60,
			background_activity: [
				{
					type: 'technical-adjustment',
					frequency: 1.5,
					intensity: 60,
					visibility: 40
				},
				{
					type: 'staff-movement',
					frequency: 0.8,
					intensity: 50,
					visibility: 20
				}
			],
			sound_profile: {
				ambient_volume: 30,
				echo_level: 25,
				background_hum: 35,
				technical_sounds: true,
				air_conditioning: true
			}
		},
		props: [],
		cameraAngles: [
			{
				name: 'crisis-overview',
				position: { x: 0, y: 120, z: 180, rotation: { x: -15, y: 0, z: 0 } },
				focal_length: 40,
				aperture: 2.2,
				angle: 'medium',
				movement: 'dynamic',
				usage_context: ['crisis-briefing', 'urgent-questions']
			},
			{
				name: 'pressure-close',
				position: { x: -60, y: 70, z: 120, rotation: { x: -5, y: 25, z: 0 } },
				focal_length: 100,
				aperture: 1.8,
				angle: 'close',
				movement: 'handheld',
				usage_context: ['high-pressure', 'breakdown-moments']
			}
		]
	},

	'intimate-conversation': {
		id: 'intimate-conversation',
		name: 'Intimate Conversation Space',
		description: 'Warm, comfortable setting for personal and empathetic interviews',
		context: ['character-creation', 'coalition-negotiation'],
		visualElements: {
			backgroundType: 'physical-set',
			wallTexture: 'warm-wood-panels',
			floorMaterial: 'hardwood',
			ceiling: 'coffered-wood',
			colorScheme: {
				primary: '#92400e', // Warm brown
				secondary: '#d97706', // Orange
				accent: '#059669', // Green
				neutral: '#78716c', // Warm gray
				background: '#fef7ed', // Warm off-white
				text: '#1c1917' // Dark brown
			},
			brandingElements: [],
			digitalScreens: [],
			furnitureLayout: {
				interviewerDesk: {
					style: 'rustic',
					material: 'reclaimed-wood',
					color: '#92400e',
					position: { x: 0, y: -20, z: 0, rotation: { x: 0, y: 0, z: 0 } },
					accessories: [
						{ item: 'coffee', position: { x: -15, y: 0 }, interaction_potential: false },
						{ item: 'papers', position: { x: 10, y: 5 }, interaction_potential: false }
					]
				},
				guestSeating: {
					type: 'sofa',
					style: 'comfortable',
					material: 'fabric',
					color: '#d97706',
					position: { x: 90, y: -25, z: 10, rotation: { x: 0, y: -15, z: 0 } },
					comfort_level: 9
				},
				backgroundElements: [
					{
						type: 'bookshelf',
						position: { x: -150, y: 0, z: -100, rotation: { x: 0, y: 15, z: 0 } },
						scale: 0.9,
						detail_level: 'medium'
					},
					{
						type: 'window',
						position: { x: 100, y: 50, z: -150, rotation: { x: 0, y: -10, z: 0 } },
						scale: 1.0,
						detail_level: 'high'
					},
					{
						type: 'plant',
						position: { x: 150, y: 0, z: -80, rotation: { x: 0, y: 0, z: 0 } },
						scale: 0.8,
						detail_level: 'medium'
					}
				],
				decorativeItems: [
					{
						item: 'family-photo',
						position: { x: -100, y: 30, z: -70, rotation: { x: 0, y: 20, z: 0 } },
						scale: 0.5,
						significance: 'comforting'
					},
					{
						item: 'coffee-table-book',
						position: { x: 50, y: -15, z: 20, rotation: { x: 0, y: -10, z: 0 } },
						scale: 0.6,
						significance: 'neutral'
					}
				]
			}
		},
		lighting: {
			scheme: 'soft',
			keyLight: {
				type: 'natural',
				intensity: 70,
				color_temperature: 3200,
				position: { x: 100, y: 200, z: 150, rotation: { x: -30, y: -20, z: 0 } },
				diffusion: 95,
				beam_angle: 120
			},
			fillLight: {
				type: 'softbox',
				intensity: 30,
				color_temperature: 3200,
				position: { x: -80, y: 150, z: 100, rotation: { x: -25, y: 10, z: 0 } },
				diffusion: 90,
				beam_angle: 80
			},
			backLight: {
				type: 'natural',
				intensity: 50,
				color_temperature: 2800,
				position: { x: 0, y: 180, z: -120, rotation: { x: -35, y: 0, z: 0 } },
				diffusion: 85,
				beam_angle: 60
			},
			ambient: {
				base_intensity: 40,
				color_cast: '#fef7ed',
				variation: 3,
				transition_speed: 15
			},
			dramatic: {
				shadow_harshness: 10,
				contrast_boost: 5,
				color_shift: 'none',
				movement: false
			},
			mood_responsive: false
		},
		atmosphere: {
			tension_level: 10,
			formality: 30,
			intimidation_factor: 5,
			comfort_level: 95,
			media_presence: 20,
			background_activity: [],
			sound_profile: {
				ambient_volume: 20,
				echo_level: 5,
				background_hum: 5,
				technical_sounds: false,
				air_conditioning: false
			}
		},
		props: [],
		cameraAngles: [
			{
				name: 'conversational',
				position: { x: 0, y: 90, z: 200, rotation: { x: -10, y: 0, z: 0 } },
				focal_length: 50,
				aperture: 2.8,
				angle: 'medium',
				movement: 'static',
				usage_context: ['personal-questions', 'background-discussion']
			}
		]
	}
};

export class InterviewStudioEnvironmentManager {
	private currentEnvironment: StudioEnvironment;
	private dynamicElements: Map<string, any> = new Map();

	constructor(environmentId: string = 'professional-newsroom') {
		this.currentEnvironment = STUDIO_ENVIRONMENTS[environmentId];
		this.initializeDynamicElements();
	}

	setEnvironment(environmentId: string): void {
		if (STUDIO_ENVIRONMENTS[environmentId]) {
			this.currentEnvironment = STUDIO_ENVIRONMENTS[environmentId];
			this.initializeDynamicElements();
		}
	}

	getCurrentEnvironment(): StudioEnvironment {
		return this.currentEnvironment;
	}

	getEnvironmentForContext(context: InterviewContext): StudioEnvironment {
		const suitable = Object.values(STUDIO_ENVIRONMENTS).find(env =>
			env.context.includes(context)
		);
		return suitable || STUDIO_ENVIRONMENTS['professional-newsroom'];
	}

	adjustAtmosphereForMood(
		mood: string,
		intensity: number
	): AtmosphereConfig {
		const baseAtmosphere = { ...this.currentEnvironment.atmosphere };

		// Adjust tension based on mood and intensity
		switch (mood) {
			case 'hostile':
			case 'frustrated':
				baseAtmosphere.tension_level = Math.min(100, baseAtmosphere.tension_level + intensity);
				baseAtmosphere.intimidation_factor = Math.min(100, baseAtmosphere.intimidation_factor + intensity / 2);
				break;
			case 'sympathetic':
			case 'approving':
				baseAtmosphere.tension_level = Math.max(0, baseAtmosphere.tension_level - intensity / 2);
				baseAtmosphere.comfort_level = Math.min(100, baseAtmosphere.comfort_level + intensity / 3);
				break;
			case 'shocked':
			case 'surprised':
				baseAtmosphere.tension_level = Math.min(100, baseAtmosphere.tension_level + intensity * 1.5);
				break;
		}

		return baseAtmosphere;
	}

	updateScreenContent(screenId: string, newContent: ScreenContent): void {
		const screen = this.currentEnvironment.visualElements.digitalScreens.find(s => s.id === screenId);
		if (screen) {
			screen.content = newContent;
		}
	}

	getDynamicLighting(mood: string, intensity: number): StudioLightingConfig {
		const baseLighting = { ...this.currentEnvironment.lighting };

		if (!baseLighting.mood_responsive) return baseLighting;

		// Adjust lighting based on mood
		switch (mood) {
			case 'hostile':
			case 'frustrated':
				baseLighting.keyLight.intensity = Math.min(100, baseLighting.keyLight.intensity + intensity / 3);
				baseLighting.dramatic.shadow_harshness = Math.min(100, baseLighting.dramatic.shadow_harshness + intensity / 2);
				baseLighting.dramatic.contrast_boost = Math.min(100, baseLighting.dramatic.contrast_boost + intensity / 2);
				break;
			case 'sympathetic':
			case 'approving':
				baseLighting.fillLight.intensity = Math.min(100, baseLighting.fillLight.intensity + intensity / 4);
				baseLighting.dramatic.shadow_harshness = Math.max(0, baseLighting.dramatic.shadow_harshness - intensity / 3);
				break;
			case 'shocked':
			case 'surprised':
				baseLighting.keyLight.intensity = Math.min(100, baseLighting.keyLight.intensity + intensity / 2);
				baseLighting.backLight.intensity = Math.min(100, baseLighting.backLight.intensity + intensity / 2);
				break;
		}

		return baseLighting;
	}

	getCameraAngleForContext(context: string[]): CameraConfiguration | null {
		return this.currentEnvironment.cameraAngles.find(angle =>
			angle.usage_context.some(usage => context.includes(usage))
		) || this.currentEnvironment.cameraAngles[0] || null;
	}

	private initializeDynamicElements(): void {
		this.dynamicElements.clear();

		// Initialize screen content
		this.currentEnvironment.visualElements.digitalScreens.forEach(screen => {
			this.dynamicElements.set(`screen_${screen.id}`, screen.content);
		});

		// Initialize atmosphere
		this.dynamicElements.set('atmosphere', this.currentEnvironment.atmosphere);

		// Initialize lighting
		this.dynamicElements.set('lighting', this.currentEnvironment.lighting);
	}

	generateEnvironmentCSS(): string {
		const env = this.currentEnvironment;
		const colors = env.visualElements.colorScheme;

		return `
			.interview-environment-${env.id} {
				--primary-color: ${colors.primary};
				--secondary-color: ${colors.secondary};
				--accent-color: ${colors.accent};
				--neutral-color: ${colors.neutral};
				--background-color: ${colors.background};
				--text-color: ${colors.text};
				--tension-level: ${env.atmosphere.tension_level};
				--formality-level: ${env.atmosphere.formality};
				--comfort-level: ${env.atmosphere.comfort_level};
			}

			.interview-background-${env.id} {
				background: linear-gradient(135deg, ${colors.background} 0%, ${colors.primary} 100%);
				filter: brightness(${100 - env.atmosphere.tension_level / 5}%);
			}

			.interview-lighting-${env.id} {
				filter:
					brightness(${env.lighting.keyLight.intensity}%)
					contrast(${100 + env.lighting.dramatic.contrast_boost}%)
					hue-rotate(${env.lighting.dramatic.color_shift === 'none' ? 0 : 10}deg);
			}
		`;
	}
}