/**
 * Confrontational Interview Visual Theme System
 * Provides comprehensive styling for high-pressure political interviews
 */

export interface ConfrontationalTheme {
	id: string;
	name: string;
	description: string;
	intensity: 'moderate' | 'high' | 'extreme';
	visualElements: VisualElements;
	animations: AnimationSet;
	soundCues: SoundCueSet;
	lighting: LightingConfig;
}

export interface VisualElements {
	background: BackgroundTheme;
	interviewer: InterviewerVisuals;
	questionBox: QuestionBoxStyling;
	responseOptions: ResponseOptionStyling;
	overlays: OverlayEffects;
	indicators: StatusIndicators;
}

export interface BackgroundTheme {
	baseGradient: string;
	intensityOverlay: string;
	studioLighting: string;
	shadowEffects: string;
	pressureFilter: string;
	cameraShake: boolean;
}

export interface InterviewerVisuals {
	position: 'centered' | 'off-center' | 'leaning-forward';
	faceFilters: string[];
	expressionIntensity: number; // 0-100
	gestureAmplification: number; // 0-100
	eyeContactIntensity: 'normal' | 'intense' | 'piercing';
	bodyLanguage: 'professional' | 'aggressive' | 'intimidating';
}

export interface QuestionBoxStyling {
	borderIntensity: 'subtle' | 'prominent' | 'aggressive';
	backgroundOpacity: number;
	textWeight: 'normal' | 'bold' | 'extra-bold';
	pulsing: boolean;
	shadowDepth: 'none' | 'subtle' | 'dramatic';
	colorScheme: 'neutral' | 'warning' | 'critical';
}

export interface ResponseOptionStyling {
	pressureIndicators: boolean;
	consequencePreview: boolean;
	difficultyVisualization: boolean;
	timeConstraintEmphasis: boolean;
	riskHighlighting: boolean;
}

export interface OverlayEffects {
	tensionFlashes: boolean;
	confrontationBorders: boolean;
	pressureGradients: boolean;
	intimidationShadows: boolean;
	spotlightEffects: boolean;
}

export interface StatusIndicators {
	hostilityMeter: boolean;
	pressureGauge: boolean;
	vulnerabilityIndicator: boolean;
	credibilityTracker: boolean;
	momentumShifts: boolean;
}

export interface AnimationSet {
	questionAppearance: string;
	responseSelection: string;
	interviewerReactions: string[];
	transitionEffects: string[];
	climacticMoments: string[];
}

export interface SoundCueSet {
	questionStingers: string[];
	pressureBuildup: string[];
	confrontationHits: string[];
	tensionUnderscore: string[];
	climacticPayoffs: string[];
}

export interface LightingConfig {
	baseIntensity: number; // 0-100
	contrastLevel: number; // 0-100
	shadowHarshness: number; // 0-100
	colorTemperature: 'warm' | 'neutral' | 'cool' | 'harsh';
	dynamicChanges: boolean;
	spotlightIntensity: number; // 0-100
}

// Pre-defined confrontational themes

export const CONFRONTATIONAL_THEMES: Record<string, ConfrontationalTheme> = {
	'moderate-pressure': {
		id: 'moderate-pressure',
		name: 'Professional Pressure',
		description: 'Firm but fair journalistic questioning with subtle pressure building',
		intensity: 'moderate',
		visualElements: {
			background: {
				baseGradient: 'linear-gradient(135deg, #1e293b 0%, #374151 50%, #1f2937 100%)',
				intensityOverlay: 'rgba(59, 130, 246, 0.05)',
				studioLighting: 'filter: brightness(95%) contrast(105%)',
				shadowEffects: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))',
				pressureFilter: 'none',
				cameraShake: false
			},
			interviewer: {
				position: 'centered',
				faceFilters: ['brightness(98%)', 'contrast(102%)'],
				expressionIntensity: 40,
				gestureAmplification: 30,
				eyeContactIntensity: 'normal',
				bodyLanguage: 'professional'
			},
			questionBox: {
				borderIntensity: 'subtle',
				backgroundOpacity: 0.85,
				textWeight: 'normal',
				pulsing: false,
				shadowDepth: 'subtle',
				colorScheme: 'neutral'
			},
			responseOptions: {
				pressureIndicators: true,
				consequencePreview: false,
				difficultyVisualization: true,
				timeConstraintEmphasis: false,
				riskHighlighting: false
			},
			overlays: {
				tensionFlashes: false,
				confrontationBorders: false,
				pressureGradients: true,
				intimidationShadows: false,
				spotlightEffects: false
			},
			indicators: {
				hostilityMeter: false,
				pressureGauge: true,
				vulnerabilityIndicator: false,
				credibilityTracker: true,
				momentumShifts: true
			}
		},
		animations: {
			questionAppearance: 'fadeInUp',
			responseSelection: 'subtle-highlight',
			interviewerReactions: ['nod-slight', 'eyebrow-raise', 'lean-forward'],
			transitionEffects: ['fade-through-blue'],
			climacticMoments: ['emphasis-zoom']
		},
		soundCues: {
			questionStingers: ['subtle-sting.wav'],
			pressureBuildup: ['tension-build-light.wav'],
			confrontationHits: ['emphasis-note.wav'],
			tensionUnderscore: ['underscore-professional.wav'],
			climacticPayoffs: ['resolution-major.wav']
		},
		lighting: {
			baseIntensity: 85,
			contrastLevel: 110,
			shadowHarshness: 30,
			colorTemperature: 'neutral',
			dynamicChanges: true,
			spotlightIntensity: 20
		}
	},

	'high-pressure': {
		id: 'high-pressure',
		name: 'Aggressive Confrontation',
		description: 'Intense confrontational journalism with dramatic pressure tactics',
		intensity: 'high',
		visualElements: {
			background: {
				baseGradient: 'linear-gradient(135deg, #2d1b2d 0%, #3d1b1b 50%, #1a0f0f 100%)',
				intensityOverlay: 'rgba(239, 68, 68, 0.12)',
				studioLighting: 'filter: brightness(90%) contrast(125%) hue-rotate(15deg)',
				shadowEffects: 'drop-shadow(0 8px 16px rgba(239,68,68,0.4))',
				pressureFilter: 'filter: saturate(110%) contrast(115%)',
				cameraShake: true
			},
			interviewer: {
				position: 'leaning-forward',
				faceFilters: ['brightness(92%)', 'contrast(120%)', 'hue-rotate(10deg)'],
				expressionIntensity: 75,
				gestureAmplification: 60,
				eyeContactIntensity: 'intense',
				bodyLanguage: 'aggressive'
			},
			questionBox: {
				borderIntensity: 'prominent',
				backgroundOpacity: 0.95,
				textWeight: 'bold',
				pulsing: true,
				shadowDepth: 'dramatic',
				colorScheme: 'warning'
			},
			responseOptions: {
				pressureIndicators: true,
				consequencePreview: true,
				difficultyVisualization: true,
				timeConstraintEmphasis: true,
				riskHighlighting: true
			},
			overlays: {
				tensionFlashes: true,
				confrontationBorders: true,
				pressureGradients: true,
				intimidationShadows: true,
				spotlightEffects: true
			},
			indicators: {
				hostilityMeter: true,
				pressureGauge: true,
				vulnerabilityIndicator: true,
				credibilityTracker: true,
				momentumShifts: true
			}
		},
		animations: {
			questionAppearance: 'dramatic-slide-in',
			responseSelection: 'pressure-highlight',
			interviewerReactions: ['intense-stare', 'aggressive-lean', 'finger-point', 'head-shake'],
			transitionEffects: ['red-flash-transition', 'pressure-zoom'],
			climacticMoments: ['explosive-emphasis', 'confrontation-climax']
		},
		soundCues: {
			questionStingers: ['aggressive-sting.wav', 'tension-hit.wav'],
			pressureBuildup: ['pressure-rise-dramatic.wav'],
			confrontationHits: ['confrontation-slam.wav', 'gotcha-hit.wav'],
			tensionUnderscore: ['tension-high-strings.wav'],
			climacticPayoffs: ['explosive-resolution.wav']
		},
		lighting: {
			baseIntensity: 75,
			contrastLevel: 140,
			shadowHarshness: 70,
			colorTemperature: 'harsh',
			dynamicChanges: true,
			spotlightIntensity: 60
		}
	},

	'extreme-confrontation': {
		id: 'extreme-confrontation',
		name: 'Devastating Exposure',
		description: 'Maximum intensity investigative confrontation with devastating reveals',
		intensity: 'extreme',
		visualElements: {
			background: {
				baseGradient: 'linear-gradient(135deg, #450a0a 0%, #7f1d1d 30%, #450a0a 70%, #1c0505 100%)',
				intensityOverlay: 'rgba(220, 38, 38, 0.2)',
				studioLighting: 'filter: brightness(80%) contrast(160%) hue-rotate(30deg) saturate(130%)',
				shadowEffects: 'drop-shadow(0 12px 24px rgba(220,38,38,0.6)) drop-shadow(0 0 40px rgba(220,38,38,0.3))',
				pressureFilter: 'filter: saturate(140%) contrast(140%) brightness(85%)',
				cameraShake: true
			},
			interviewer: {
				position: 'off-center',
				faceFilters: ['brightness(85%)', 'contrast(150%)', 'hue-rotate(25deg)', 'saturate(120%)'],
				expressionIntensity: 95,
				gestureAmplification: 85,
				eyeContactIntensity: 'piercing',
				bodyLanguage: 'intimidating'
			},
			questionBox: {
				borderIntensity: 'aggressive',
				backgroundOpacity: 1.0,
				textWeight: 'extra-bold',
				pulsing: true,
				shadowDepth: 'dramatic',
				colorScheme: 'critical'
			},
			responseOptions: {
				pressureIndicators: true,
				consequencePreview: true,
				difficultyVisualization: true,
				timeConstraintEmphasis: true,
				riskHighlighting: true
			},
			overlays: {
				tensionFlashes: true,
				confrontationBorders: true,
				pressureGradients: true,
				intimidationShadows: true,
				spotlightEffects: true
			},
			indicators: {
				hostilityMeter: true,
				pressureGauge: true,
				vulnerabilityIndicator: true,
				credibilityTracker: true,
				momentumShifts: true
			}
		},
		animations: {
			questionAppearance: 'explosive-entrance',
			responseSelection: 'critical-highlight',
			interviewerReactions: ['devastating-stare', 'explosive-gesture', 'accusatory-point', 'gotcha-lean'],
			transitionEffects: ['lightning-transition', 'explosive-zoom', 'shockwave-effect'],
			climacticMoments: ['devastating-reveal', 'explosive-climax', 'final-confrontation']
		},
		soundCues: {
			questionStingers: ['devastating-sting.wav', 'explosive-hit.wav'],
			pressureBuildup: ['extreme-tension-build.wav'],
			confrontationHits: ['devastating-slam.wav', 'explosive-impact.wav'],
			tensionUnderscore: ['extreme-tension-orchestra.wav'],
			climacticPayoffs: ['devastating-resolution.wav', 'final-impact.wav']
		},
		lighting: {
			baseIntensity: 60,
			contrastLevel: 180,
			shadowHarshness: 90,
			colorTemperature: 'harsh',
			dynamicChanges: true,
			spotlightIntensity: 85
		}
	},

	'investigative-exposure': {
		id: 'investigative-exposure',
		name: 'Evidence-Based Confrontation',
		description: 'Methodical evidence presentation with building revelation',
		intensity: 'high',
		visualElements: {
			background: {
				baseGradient: 'linear-gradient(135deg, #1e1b3d 0%, #2d1f3d 50%, #1a0f2a 100%)',
				intensityOverlay: 'rgba(147, 51, 234, 0.1)',
				studioLighting: 'filter: brightness(88%) contrast(130%) hue-rotate(270deg)',
				shadowEffects: 'drop-shadow(0 6px 12px rgba(147,51,234,0.5))',
				pressureFilter: 'filter: saturate(115%) contrast(125%)',
				cameraShake: false
			},
			interviewer: {
				position: 'centered',
				faceFilters: ['brightness(90%)', 'contrast(125%)', 'hue-rotate(270deg)'],
				expressionIntensity: 80,
				gestureAmplification: 50,
				eyeContactIntensity: 'intense',
				bodyLanguage: 'professional'
			},
			questionBox: {
				borderIntensity: 'prominent',
				backgroundOpacity: 0.9,
				textWeight: 'bold',
				pulsing: false,
				shadowDepth: 'dramatic',
				colorScheme: 'warning'
			},
			responseOptions: {
				pressureIndicators: true,
				consequencePreview: true,
				difficultyVisualization: true,
				timeConstraintEmphasis: false,
				riskHighlighting: true
			},
			overlays: {
				tensionFlashes: false,
				confrontationBorders: true,
				pressureGradients: true,
				intimidationShadows: false,
				spotlightEffects: true
			},
			indicators: {
				hostilityMeter: false,
				pressureGauge: true,
				vulnerabilityIndicator: true,
				credibilityTracker: true,
				momentumShifts: true
			}
		},
		animations: {
			questionAppearance: 'evidence-slide-in',
			responseSelection: 'analytical-highlight',
			interviewerReactions: ['knowing-nod', 'evidence-present', 'analytical-stare'],
			transitionEffects: ['purple-evidence-transition', 'revelation-zoom'],
			climacticMoments: ['evidence-revelation', 'gotcha-buildup']
		},
		soundCues: {
			questionStingers: ['evidence-sting.wav', 'revelation-note.wav'],
			pressureBuildup: ['investigation-build.wav'],
			confrontationHits: ['evidence-impact.wav', 'revelation-hit.wav'],
			tensionUnderscore: ['investigation-underscore.wav'],
			climacticPayoffs: ['revelation-payoff.wav']
		},
		lighting: {
			baseIntensity: 80,
			contrastLevel: 130,
			shadowHarshness: 50,
			colorTemperature: 'cool',
			dynamicChanges: true,
			spotlightIntensity: 70
		}
	}
};

// CSS class generation utilities

export function generateThemeClasses(theme: ConfrontationalTheme): Record<string, string> {
	return {
		background: generateBackgroundClasses(theme.visualElements.background),
		interviewer: generateInterviewerClasses(theme.visualElements.interviewer),
		questionBox: generateQuestionBoxClasses(theme.visualElements.questionBox),
		responseOptions: generateResponseOptionClasses(theme.visualElements.responseOptions),
		overlays: generateOverlayClasses(theme.visualElements.overlays),
		indicators: generateIndicatorClasses(theme.visualElements.indicators)
	};
}

function generateBackgroundClasses(bg: BackgroundTheme): string {
	const classes = ['confrontational-background'];

	if (bg.cameraShake) classes.push('camera-shake');
	if (bg.pressureFilter !== 'none') classes.push('pressure-filter');

	return classes.join(' ');
}

function generateInterviewerClasses(interviewer: InterviewerVisuals): string {
	const classes = ['confrontational-interviewer'];

	classes.push(`position-${interviewer.position}`);
	classes.push(`expression-${interviewer.expressionIntensity > 70 ? 'intense' : interviewer.expressionIntensity > 40 ? 'moderate' : 'subtle'}`);
	classes.push(`eye-contact-${interviewer.eyeContactIntensity}`);
	classes.push(`body-language-${interviewer.bodyLanguage}`);

	return classes.join(' ');
}

function generateQuestionBoxClasses(questionBox: QuestionBoxStyling): string {
	const classes = ['confrontational-question-box'];

	classes.push(`border-${questionBox.borderIntensity}`);
	classes.push(`text-${questionBox.textWeight}`);
	classes.push(`shadow-${questionBox.shadowDepth}`);
	classes.push(`color-${questionBox.colorScheme}`);

	if (questionBox.pulsing) classes.push('pulsing');

	return classes.join(' ');
}

function generateResponseOptionClasses(responseOptions: ResponseOptionStyling): string {
	const classes = ['confrontational-response-options'];

	if (responseOptions.pressureIndicators) classes.push('pressure-indicators');
	if (responseOptions.consequencePreview) classes.push('consequence-preview');
	if (responseOptions.difficultyVisualization) classes.push('difficulty-visualization');
	if (responseOptions.timeConstraintEmphasis) classes.push('time-constraint-emphasis');
	if (responseOptions.riskHighlighting) classes.push('risk-highlighting');

	return classes.join(' ');
}

function generateOverlayClasses(overlays: OverlayEffects): string {
	const classes = ['confrontational-overlays'];

	if (overlays.tensionFlashes) classes.push('tension-flashes');
	if (overlays.confrontationBorders) classes.push('confrontation-borders');
	if (overlays.pressureGradients) classes.push('pressure-gradients');
	if (overlays.intimidationShadows) classes.push('intimidation-shadows');
	if (overlays.spotlightEffects) classes.push('spotlight-effects');

	return classes.join(' ');
}

function generateIndicatorClasses(indicators: StatusIndicators): string {
	const classes = ['confrontational-indicators'];

	if (indicators.hostilityMeter) classes.push('hostility-meter');
	if (indicators.pressureGauge) classes.push('pressure-gauge');
	if (indicators.vulnerabilityIndicator) classes.push('vulnerability-indicator');
	if (indicators.credibilityTracker) classes.push('credibility-tracker');
	if (indicators.momentumShifts) classes.push('momentum-shifts');

	return classes.join(' ');
}

// Dynamic theme application utilities

export class ConfrontationalThemeManager {
	private currentTheme: ConfrontationalTheme;
	private intensityLevel: number = 0;

	constructor(themeId: string = 'moderate-pressure') {
		this.currentTheme = CONFRONTATIONAL_THEMES[themeId];
	}

	setTheme(themeId: string): void {
		if (CONFRONTATIONAL_THEMES[themeId]) {
			this.currentTheme = CONFRONTATIONAL_THEMES[themeId];
		}
	}

	getCurrentTheme(): ConfrontationalTheme {
		return this.currentTheme;
	}

	adjustIntensity(level: number): void {
		this.intensityLevel = Math.max(0, Math.min(100, level));
	}

	getAdjustedLighting(): LightingConfig {
		const base = this.currentTheme.lighting;
		const intensityMultiplier = this.intensityLevel / 100;

		return {
			...base,
			baseIntensity: Math.max(50, base.baseIntensity - (intensityMultiplier * 20)),
			contrastLevel: Math.min(200, base.contrastLevel + (intensityMultiplier * 30)),
			shadowHarshness: Math.min(100, base.shadowHarshness + (intensityMultiplier * 20)),
			spotlightIntensity: Math.min(100, base.spotlightIntensity + (intensityMultiplier * 25))
		};
	}

	getIntensityAdjustedClasses(): Record<string, string> {
		const baseClasses = generateThemeClasses(this.currentTheme);
		const intensity = this.intensityLevel;

		// Add intensity-based modifiers
		Object.keys(baseClasses).forEach(key => {
			if (intensity > 70) {
				baseClasses[key] += ' high-intensity';
			} else if (intensity > 40) {
				baseClasses[key] += ' medium-intensity';
			}
		});

		return baseClasses;
	}

	shouldShowElement(elementType: keyof StatusIndicators): boolean {
		return this.currentTheme.visualElements.indicators[elementType];
	}

	getAnimationForContext(context: keyof AnimationSet, subtype?: string): string {
		const animations = this.currentTheme.animations[context];
		if (Array.isArray(animations)) {
			return subtype ? animations.find(a => a.includes(subtype)) || animations[0] : animations[0];
		}
		return animations;
	}

	getSoundCueForContext(context: keyof SoundCueSet, index: number = 0): string {
		const sounds = this.currentTheme.soundCues[context];
		return sounds[Math.min(index, sounds.length - 1)];
	}
}