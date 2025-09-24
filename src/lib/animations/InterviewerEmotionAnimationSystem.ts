/**
 * Advanced Interviewer Emotion Animation System
 * Handles complex emotional transitions and reactions for dynamic interviews
 */

export interface EmotionAnimationConfig {
	emotion: InterviewerEmotion;
	intensity: number; // 0-100
	duration: number; // milliseconds
	trigger: AnimationTrigger;
	chainable: boolean;
	priority: number; // 1-10, higher numbers override lower
}

export type InterviewerEmotion =
	| 'neutral' | 'professional' | 'skeptical' | 'frustrated' | 'hostile'
	| 'sympathetic' | 'surprised' | 'approving' | 'disappointed' | 'incredulous'
	| 'amused' | 'contemptuous' | 'concerned' | 'impatient' | 'calculating'
	| 'shocked' | 'disgusted' | 'triumphant' | 'dismissive' | 'intense';

export type AnimationTrigger =
	| 'response-received' | 'evasion-detected' | 'contradiction-found'
	| 'gotcha-moment' | 'evidence-presented' | 'accountability-pressed'
	| 'time-pressure' | 'breakthrough-achieved' | 'deflection-attempted'
	| 'vulnerability-exposed' | 'credibility-questioned' | 'mood-escalation';

export interface EmotionTransition {
	from: InterviewerEmotion;
	to: InterviewerEmotion;
	catalyst: AnimationTrigger;
	probability: number; // 0-1
	intensity_change: number; // -50 to +50
	animation_style: TransitionStyle;
}

export type TransitionStyle =
	| 'instant' | 'smooth' | 'dramatic' | 'subtle'
	| 'building' | 'explosive' | 'gradual' | 'sharp';

export interface AnimationKeyframe {
	time: number; // 0-1 (percentage of animation)
	properties: {
		scale?: number;
		rotation?: number;
		translation?: { x: number; y: number };
		filter?: string;
		opacity?: number;
		transform_origin?: string;
	};
	easing?: string;
}

export interface EmotionAnimationSequence {
	emotion: InterviewerEmotion;
	intensity: number;
	keyframes: AnimationKeyframe[];
	duration: number;
	iteration_count: number | 'infinite';
	fill_mode: 'none' | 'forwards' | 'backwards' | 'both';
}

export interface FacialExpressionMap {
	eyebrows: ExpressionIntensity;
	eyes: ExpressionIntensity;
	mouth: ExpressionIntensity;
	jaw: ExpressionIntensity;
	overall_tension: ExpressionIntensity;
}

export type ExpressionIntensity = 'none' | 'subtle' | 'moderate' | 'pronounced' | 'extreme';

// Comprehensive emotion animation definitions
export const EMOTION_ANIMATIONS: Record<InterviewerEmotion, EmotionAnimationSequence> = {
	'neutral': {
		emotion: 'neutral',
		intensity: 0,
		keyframes: [
			{
				time: 0,
				properties: {
					scale: 1,
					rotation: 0,
					translation: { x: 0, y: 0 },
					filter: 'brightness(100%) contrast(100%)',
					opacity: 1
				}
			}
		],
		duration: 1000,
		iteration_count: 1,
		fill_mode: 'forwards'
	},

	'professional': {
		emotion: 'professional',
		intensity: 20,
		keyframes: [
			{
				time: 0,
				properties: {
					scale: 1,
					rotation: 0,
					translation: { x: 0, y: 0 },
					filter: 'brightness(98%) contrast(105%)'
				}
			},
			{
				time: 0.5,
				properties: {
					scale: 1.01,
					rotation: 0,
					translation: { x: 0, y: -1 },
					filter: 'brightness(99%) contrast(108%)'
				},
				easing: 'ease-in-out'
			},
			{
				time: 1,
				properties: {
					scale: 1,
					rotation: 0,
					translation: { x: 0, y: 0 },
					filter: 'brightness(98%) contrast(105%)'
				}
			}
		],
		duration: 2000,
		iteration_count: 'infinite',
		fill_mode: 'both'
	},

	'skeptical': {
		emotion: 'skeptical',
		intensity: 40,
		keyframes: [
			{
				time: 0,
				properties: {
					scale: 1,
					rotation: 0,
					translation: { x: 0, y: 0 },
					filter: 'brightness(95%) contrast(110%)'
				}
			},
			{
				time: 0.3,
				properties: {
					scale: 1.02,
					rotation: -1,
					translation: { x: -2, y: 0 },
					filter: 'brightness(93%) contrast(115%)'
				},
				easing: 'ease-out'
			},
			{
				time: 0.7,
				properties: {
					scale: 1.01,
					rotation: 1,
					translation: { x: 1, y: -1 },
					filter: 'brightness(94%) contrast(113%)'
				},
				easing: 'ease-in-out'
			},
			{
				time: 1,
				properties: {
					scale: 1,
					rotation: 0,
					translation: { x: 0, y: 0 },
					filter: 'brightness(95%) contrast(110%)'
				}
			}
		],
		duration: 3000,
		iteration_count: 'infinite',
		fill_mode: 'both'
	},

	'frustrated': {
		emotion: 'frustrated',
		intensity: 60,
		keyframes: [
			{
				time: 0,
				properties: {
					scale: 1,
					rotation: 0,
					translation: { x: 0, y: 0 },
					filter: 'brightness(90%) contrast(125%) hue-rotate(10deg)'
				}
			},
			{
				time: 0.2,
				properties: {
					scale: 1.05,
					rotation: -2,
					translation: { x: -3, y: -1 },
					filter: 'brightness(87%) contrast(135%) hue-rotate(15deg)'
				},
				easing: 'ease-out'
			},
			{
				time: 0.4,
				properties: {
					scale: 1.03,
					rotation: 2,
					translation: { x: 2, y: 0 },
					filter: 'brightness(88%) contrast(130%) hue-rotate(12deg)'
				},
				easing: 'ease-in-out'
			},
			{
				time: 0.6,
				properties: {
					scale: 1.04,
					rotation: -1,
					translation: { x: -1, y: -2 },
					filter: 'brightness(89%) contrast(128%) hue-rotate(13deg)'
				}
			},
			{
				time: 1,
				properties: {
					scale: 1.02,
					rotation: 0,
					translation: { x: 0, y: 0 },
					filter: 'brightness(90%) contrast(125%) hue-rotate(10deg)'
				}
			}
		],
		duration: 2500,
		iteration_count: 'infinite',
		fill_mode: 'both'
	},

	'hostile': {
		emotion: 'hostile',
		intensity: 85,
		keyframes: [
			{
				time: 0,
				properties: {
					scale: 1.05,
					rotation: 0,
					translation: { x: 0, y: -2 },
					filter: 'brightness(85%) contrast(150%) hue-rotate(20deg) saturate(120%)'
				}
			},
			{
				time: 0.15,
				properties: {
					scale: 1.08,
					rotation: -3,
					translation: { x: -4, y: -3 },
					filter: 'brightness(80%) contrast(160%) hue-rotate(25deg) saturate(130%)'
				},
				easing: 'ease-out'
			},
			{
				time: 0.35,
				properties: {
					scale: 1.06,
					rotation: 3,
					translation: { x: 3, y: -1 },
					filter: 'brightness(82%) contrast(155%) hue-rotate(22deg) saturate(125%)'
				},
				easing: 'ease-in-out'
			},
			{
				time: 0.55,
				properties: {
					scale: 1.07,
					rotation: -2,
					translation: { x: -2, y: -4 },
					filter: 'brightness(81%) contrast(158%) hue-rotate(23deg) saturate(128%)'
				}
			},
			{
				time: 0.75,
				properties: {
					scale: 1.06,
					rotation: 1,
					translation: { x: 1, y: -2 },
					filter: 'brightness(83%) contrast(153%) hue-rotate(21deg) saturate(122%)'
				}
			},
			{
				time: 1,
				properties: {
					scale: 1.05,
					rotation: 0,
					translation: { x: 0, y: -2 },
					filter: 'brightness(85%) contrast(150%) hue-rotate(20deg) saturate(120%)'
				}
			}
		],
		duration: 2000,
		iteration_count: 'infinite',
		fill_mode: 'both'
	},

	'surprised': {
		emotion: 'surprised',
		intensity: 70,
		keyframes: [
			{
				time: 0,
				properties: {
					scale: 1,
					rotation: 0,
					translation: { x: 0, y: 0 },
					filter: 'brightness(100%) contrast(100%)'
				}
			},
			{
				time: 0.1,
				properties: {
					scale: 1.15,
					rotation: 0,
					translation: { x: 0, y: -5 },
					filter: 'brightness(110%) contrast(120%) saturate(110%)'
				},
				easing: 'ease-out'
			},
			{
				time: 0.3,
				properties: {
					scale: 1.08,
					rotation: 0,
					translation: { x: 0, y: -3 },
					filter: 'brightness(105%) contrast(115%) saturate(105%)'
				},
				easing: 'ease-in-out'
			},
			{
				time: 1,
				properties: {
					scale: 1.02,
					rotation: 0,
					translation: { x: 0, y: -1 },
					filter: 'brightness(102%) contrast(108%) saturate(102%)'
				}
			}
		],
		duration: 1500,
		iteration_count: 1,
		fill_mode: 'forwards'
	},

	'triumphant': {
		emotion: 'triumphant',
		intensity: 80,
		keyframes: [
			{
				time: 0,
				properties: {
					scale: 1,
					rotation: 0,
					translation: { x: 0, y: 0 },
					filter: 'brightness(100%) contrast(100%)'
				}
			},
			{
				time: 0.2,
				properties: {
					scale: 1.1,
					rotation: -2,
					translation: { x: 0, y: -3 },
					filter: 'brightness(120%) contrast(130%) saturate(120%) hue-rotate(-10deg)'
				},
				easing: 'ease-out'
			},
			{
				time: 0.5,
				properties: {
					scale: 1.08,
					rotation: 1,
					translation: { x: 1, y: -2 },
					filter: 'brightness(115%) contrast(125%) saturate(115%) hue-rotate(-8deg)'
				},
				easing: 'ease-in-out'
			},
			{
				time: 0.8,
				properties: {
					scale: 1.05,
					rotation: -0.5,
					translation: { x: 0, y: -1 },
					filter: 'brightness(110%) contrast(120%) saturate(110%) hue-rotate(-5deg)'
				}
			},
			{
				time: 1,
				properties: {
					scale: 1.03,
					rotation: 0,
					translation: { x: 0, y: 0 },
					filter: 'brightness(108%) contrast(115%) saturate(108%) hue-rotate(-3deg)'
				}
			}
		],
		duration: 2000,
		iteration_count: 1,
		fill_mode: 'forwards'
	},

	'calculating': {
		emotion: 'calculating',
		intensity: 50,
		keyframes: [
			{
				time: 0,
				properties: {
					scale: 1,
					rotation: 0,
					translation: { x: 0, y: 0 },
					filter: 'brightness(92%) contrast(115%)'
				}
			},
			{
				time: 0.25,
				properties: {
					scale: 1.01,
					rotation: -0.5,
					translation: { x: -1, y: 0 },
					filter: 'brightness(90%) contrast(120%)'
				},
				easing: 'ease-in-out'
			},
			{
				time: 0.5,
				properties: {
					scale: 1.02,
					rotation: 0,
					translation: { x: 0, y: -1 },
					filter: 'brightness(88%) contrast(125%)'
				}
			},
			{
				time: 0.75,
				properties: {
					scale: 1.01,
					rotation: 0.5,
					translation: { x: 1, y: 0 },
					filter: 'brightness(90%) contrast(120%)'
				},
				easing: 'ease-in-out'
			},
			{
				time: 1,
				properties: {
					scale: 1,
					rotation: 0,
					translation: { x: 0, y: 0 },
					filter: 'brightness(92%) contrast(115%)'
				}
			}
		],
		duration: 4000,
		iteration_count: 'infinite',
		fill_mode: 'both'
	},

	'incredulous': {
		emotion: 'incredulous',
		intensity: 65,
		keyframes: [
			{
				time: 0,
				properties: {
					scale: 1,
					rotation: 0,
					translation: { x: 0, y: 0 },
					filter: 'brightness(95%) contrast(110%)'
				}
			},
			{
				time: 0.2,
				properties: {
					scale: 1.03,
					rotation: -1,
					translation: { x: -2, y: 0 },
					filter: 'brightness(92%) contrast(120%)'
				},
				easing: 'ease-out'
			},
			{
				time: 0.5,
				properties: {
					scale: 1.05,
					rotation: 0,
					translation: { x: 0, y: -2 },
					filter: 'brightness(90%) contrast(125%)'
				},
				easing: 'ease-in-out'
			},
			{
				time: 0.8,
				properties: {
					scale: 1.02,
					rotation: 1,
					translation: { x: 1, y: -1 },
					filter: 'brightness(93%) contrast(118%)'
				}
			},
			{
				time: 1,
				properties: {
					scale: 1,
					rotation: 0,
					translation: { x: 0, y: 0 },
					filter: 'brightness(95%) contrast(110%)'
				}
			}
		],
		duration: 3000,
		iteration_count: 2,
		fill_mode: 'forwards'
	},

	'contemptuous': {
		emotion: 'contemptuous',
		intensity: 75,
		keyframes: [
			{
				time: 0,
				properties: {
					scale: 1,
					rotation: 0,
					translation: { x: 0, y: 0 },
					filter: 'brightness(88%) contrast(130%)'
				}
			},
			{
				time: 0.3,
				properties: {
					scale: 1.02,
					rotation: -2,
					translation: { x: -1, y: 1 },
					filter: 'brightness(85%) contrast(140%) hue-rotate(5deg)'
				},
				easing: 'ease-out'
			},
			{
				time: 0.7,
				properties: {
					scale: 1.01,
					rotation: 1,
					translation: { x: 1, y: 0 },
					filter: 'brightness(87%) contrast(135%) hue-rotate(3deg)'
				},
				easing: 'ease-in-out'
			},
			{
				time: 1,
				properties: {
					scale: 1,
					rotation: 0,
					translation: { x: 0, y: 0 },
					filter: 'brightness(88%) contrast(130%)'
				}
			}
		],
		duration: 2500,
		iteration_count: 'infinite',
		fill_mode: 'both'
	},

	'approving': {
		emotion: 'approving',
		intensity: 45,
		keyframes: [
			{
				time: 0,
				properties: {
					scale: 1,
					rotation: 0,
					translation: { x: 0, y: 0 },
					filter: 'brightness(105%) contrast(105%) hue-rotate(-15deg)'
				}
			},
			{
				time: 0.4,
				properties: {
					scale: 1.02,
					rotation: 0,
					translation: { x: 0, y: -1 },
					filter: 'brightness(108%) contrast(110%) hue-rotate(-18deg)'
				},
				easing: 'ease-in-out'
			},
			{
				time: 1,
				properties: {
					scale: 1,
					rotation: 0,
					translation: { x: 0, y: 0 },
					filter: 'brightness(105%) contrast(105%) hue-rotate(-15deg)'
				}
			}
		],
		duration: 2000,
		iteration_count: 1,
		fill_mode: 'forwards'
	},

	'sympathetic': {
		emotion: 'sympathetic',
		intensity: 35,
		keyframes: [
			{
				time: 0,
				properties: {
					scale: 1,
					rotation: 0,
					translation: { x: 0, y: 0 },
					filter: 'brightness(102%) contrast(105%) hue-rotate(-20deg)'
				}
			},
			{
				time: 0.5,
				properties: {
					scale: 1.01,
					rotation: 0,
					translation: { x: 0, y: -0.5 },
					filter: 'brightness(104%) contrast(108%) hue-rotate(-22deg)'
				},
				easing: 'ease-in-out'
			},
			{
				time: 1,
				properties: {
					scale: 1,
					rotation: 0,
					translation: { x: 0, y: 0 },
					filter: 'brightness(102%) contrast(105%) hue-rotate(-20deg)'
				}
			}
		],
		duration: 3000,
		iteration_count: 'infinite',
		fill_mode: 'both'
	},

	'disappointed': {
		emotion: 'disappointed',
		intensity: 55,
		keyframes: [
			{
				time: 0,
				properties: {
					scale: 1,
					rotation: 0,
					translation: { x: 0, y: 0 },
					filter: 'brightness(90%) contrast(110%)'
				}
			},
			{
				time: 0.3,
				properties: {
					scale: 0.98,
					rotation: 0,
					translation: { x: 0, y: 1 },
					filter: 'brightness(88%) contrast(115%)'
				},
				easing: 'ease-out'
			},
			{
				time: 0.7,
				properties: {
					scale: 0.99,
					rotation: 0,
					translation: { x: 0, y: 0.5 },
					filter: 'brightness(89%) contrast(112%)'
				},
				easing: 'ease-in-out'
			},
			{
				time: 1,
				properties: {
					scale: 1,
					rotation: 0,
					translation: { x: 0, y: 0 },
					filter: 'brightness(90%) contrast(110%)'
				}
			}
		],
		duration: 2500,
		iteration_count: 1,
		fill_mode: 'forwards'
	},

	'amused': {
		emotion: 'amused',
		intensity: 40,
		keyframes: [
			{
				time: 0,
				properties: {
					scale: 1,
					rotation: 0,
					translation: { x: 0, y: 0 },
					filter: 'brightness(103%) contrast(105%)'
				}
			},
			{
				time: 0.2,
				properties: {
					scale: 1.01,
					rotation: 0.5,
					translation: { x: 0.5, y: -0.5 },
					filter: 'brightness(105%) contrast(108%)'
				},
				easing: 'ease-out'
			},
			{
				time: 0.5,
				properties: {
					scale: 1.02,
					rotation: -0.5,
					translation: { x: -0.5, y: -1 },
					filter: 'brightness(106%) contrast(110%)'
				},
				easing: 'ease-in-out'
			},
			{
				time: 0.8,
				properties: {
					scale: 1.01,
					rotation: 0.3,
					translation: { x: 0.3, y: -0.5 },
					filter: 'brightness(104%) contrast(107%)'
				}
			},
			{
				time: 1,
				properties: {
					scale: 1,
					rotation: 0,
					translation: { x: 0, y: 0 },
					filter: 'brightness(103%) contrast(105%)'
				}
			}
		],
		duration: 2000,
		iteration_count: 2,
		fill_mode: 'forwards'
	},

	'concerned': {
		emotion: 'concerned',
		intensity: 50,
		keyframes: [
			{
				time: 0,
				properties: {
					scale: 1,
					rotation: 0,
					translation: { x: 0, y: 0 },
					filter: 'brightness(95%) contrast(108%)'
				}
			},
			{
				time: 0.4,
				properties: {
					scale: 1.01,
					rotation: -0.5,
					translation: { x: -0.5, y: -0.5 },
					filter: 'brightness(93%) contrast(112%)'
				},
				easing: 'ease-in-out'
			},
			{
				time: 1,
				properties: {
					scale: 1,
					rotation: 0,
					translation: { x: 0, y: 0 },
					filter: 'brightness(95%) contrast(108%)'
				}
			}
		],
		duration: 3000,
		iteration_count: 'infinite',
		fill_mode: 'both'
	},

	'impatient': {
		emotion: 'impatient',
		intensity: 60,
		keyframes: [
			{
				time: 0,
				properties: {
					scale: 1,
					rotation: 0,
					translation: { x: 0, y: 0 },
					filter: 'brightness(92%) contrast(115%)'
				}
			},
			{
				time: 0.15,
				properties: {
					scale: 1.02,
					rotation: -1,
					translation: { x: -1, y: 0 },
					filter: 'brightness(90%) contrast(120%)'
				},
				easing: 'ease-out'
			},
			{
				time: 0.3,
				properties: {
					scale: 1.01,
					rotation: 1,
					translation: { x: 1, y: 0 },
					filter: 'brightness(91%) contrast(118%)'
				},
				easing: 'ease-in-out'
			},
			{
				time: 0.45,
				properties: {
					scale: 1.02,
					rotation: -0.5,
					translation: { x: -0.5, y: -0.5 },
					filter: 'brightness(90%) contrast(120%)'
				}
			},
			{
				time: 0.6,
				properties: {
					scale: 1.01,
					rotation: 0.5,
					translation: { x: 0.5, y: 0 },
					filter: 'brightness(91%) contrast(118%)'
				}
			},
			{
				time: 1,
				properties: {
					scale: 1,
					rotation: 0,
					translation: { x: 0, y: 0 },
					filter: 'brightness(92%) contrast(115%)'
				}
			}
		],
		duration: 1500,
		iteration_count: 'infinite',
		fill_mode: 'both'
	},

	'shocked': {
		emotion: 'shocked',
		intensity: 90,
		keyframes: [
			{
				time: 0,
				properties: {
					scale: 1,
					rotation: 0,
					translation: { x: 0, y: 0 },
					filter: 'brightness(100%) contrast(100%)'
				}
			},
			{
				time: 0.05,
				properties: {
					scale: 1.2,
					rotation: 0,
					translation: { x: 0, y: -8 },
					filter: 'brightness(130%) contrast(150%) saturate(130%)'
				},
				easing: 'ease-out'
			},
			{
				time: 0.2,
				properties: {
					scale: 1.15,
					rotation: 0,
					translation: { x: 0, y: -6 },
					filter: 'brightness(125%) contrast(140%) saturate(120%)'
				},
				easing: 'ease-in-out'
			},
			{
				time: 0.5,
				properties: {
					scale: 1.08,
					rotation: 0,
					translation: { x: 0, y: -3 },
					filter: 'brightness(115%) contrast(125%) saturate(110%)'
				}
			},
			{
				time: 1,
				properties: {
					scale: 1.03,
					rotation: 0,
					translation: { x: 0, y: -1 },
					filter: 'brightness(108%) contrast(115%) saturate(105%)'
				}
			}
		],
		duration: 2000,
		iteration_count: 1,
		fill_mode: 'forwards'
	},

	'disgusted': {
		emotion: 'disgusted',
		intensity: 70,
		keyframes: [
			{
				time: 0,
				properties: {
					scale: 1,
					rotation: 0,
					translation: { x: 0, y: 0 },
					filter: 'brightness(88%) contrast(125%)'
				}
			},
			{
				time: 0.3,
				properties: {
					scale: 0.98,
					rotation: -2,
					translation: { x: -2, y: 1 },
					filter: 'brightness(85%) contrast(135%) hue-rotate(10deg)'
				},
				easing: 'ease-out'
			},
			{
				time: 0.7,
				properties: {
					scale: 0.99,
					rotation: 1,
					translation: { x: 1, y: 0.5 },
					filter: 'brightness(86%) contrast(130%) hue-rotate(8deg)'
				},
				easing: 'ease-in-out'
			},
			{
				time: 1,
				properties: {
					scale: 1,
					rotation: 0,
					translation: { x: 0, y: 0 },
					filter: 'brightness(88%) contrast(125%)'
				}
			}
		],
		duration: 2000,
		iteration_count: 1,
		fill_mode: 'forwards'
	},

	'dismissive': {
		emotion: 'dismissive',
		intensity: 55,
		keyframes: [
			{
				time: 0,
				properties: {
					scale: 1,
					rotation: 0,
					translation: { x: 0, y: 0 },
					filter: 'brightness(90%) contrast(115%)'
				}
			},
			{
				time: 0.4,
				properties: {
					scale: 0.98,
					rotation: 2,
					translation: { x: 2, y: 0 },
					filter: 'brightness(88%) contrast(120%)'
				},
				easing: 'ease-out'
			},
			{
				time: 0.8,
				properties: {
					scale: 0.99,
					rotation: -1,
					translation: { x: -1, y: 0 },
					filter: 'brightness(89%) contrast(118%)'
				},
				easing: 'ease-in-out'
			},
			{
				time: 1,
				properties: {
					scale: 1,
					rotation: 0,
					translation: { x: 0, y: 0 },
					filter: 'brightness(90%) contrast(115%)'
				}
			}
		],
		duration: 2500,
		iteration_count: 1,
		fill_mode: 'forwards'
	},

	'intense': {
		emotion: 'intense',
		intensity: 95,
		keyframes: [
			{
				time: 0,
				properties: {
					scale: 1.03,
					rotation: 0,
					translation: { x: 0, y: -1 },
					filter: 'brightness(85%) contrast(160%) saturate(125%)'
				}
			},
			{
				time: 0.1,
				properties: {
					scale: 1.08,
					rotation: -1,
					translation: { x: -2, y: -3 },
					filter: 'brightness(80%) contrast(180%) saturate(140%)'
				},
				easing: 'ease-out'
			},
			{
				time: 0.25,
				properties: {
					scale: 1.06,
					rotation: 1,
					translation: { x: 1, y: -2 },
					filter: 'brightness(82%) contrast(170%) saturate(135%)'
				},
				easing: 'ease-in-out'
			},
			{
				time: 0.4,
				properties: {
					scale: 1.07,
					rotation: -0.5,
					translation: { x: -1, y: -3 },
					filter: 'brightness(81%) contrast(175%) saturate(138%)'
				}
			},
			{
				time: 0.55,
				properties: {
					scale: 1.05,
					rotation: 0.5,
					translation: { x: 0.5, y: -2 },
					filter: 'brightness(83%) contrast(168%) saturate(132%)'
				}
			},
			{
				time: 0.7,
				properties: {
					scale: 1.06,
					rotation: -0.3,
					translation: { x: -0.5, y: -3 },
					filter: 'brightness(82%) contrast(172%) saturate(135%)'
				}
			},
			{
				time: 1,
				properties: {
					scale: 1.04,
					rotation: 0,
					translation: { x: 0, y: -2 },
					filter: 'brightness(84%) contrast(165%) saturate(130%)'
				}
			}
		],
		duration: 1500,
		iteration_count: 'infinite',
		fill_mode: 'both'
	}
};

// Emotional transition patterns
export const EMOTION_TRANSITIONS: EmotionTransition[] = [
	// Professional to Skeptical
	{
		from: 'professional',
		to: 'skeptical',
		catalyst: 'evasion-detected',
		probability: 0.8,
		intensity_change: 20,
		animation_style: 'gradual'
	},

	// Skeptical to Frustrated
	{
		from: 'skeptical',
		to: 'frustrated',
		catalyst: 'deflection-attempted',
		probability: 0.7,
		intensity_change: 20,
		animation_style: 'building'
	},

	// Frustrated to Hostile
	{
		from: 'frustrated',
		to: 'hostile',
		catalyst: 'contradiction-found',
		probability: 0.9,
		intensity_change: 25,
		animation_style: 'dramatic'
	},

	// Neutral to Surprised
	{
		from: 'neutral',
		to: 'surprised',
		catalyst: 'breakthrough-achieved',
		probability: 0.95,
		intensity_change: 70,
		animation_style: 'explosive'
	},

	// Surprised to Triumphant
	{
		from: 'surprised',
		to: 'triumphant',
		catalyst: 'gotcha-moment',
		probability: 0.85,
		intensity_change: 10,
		animation_style: 'building'
	},

	// Any emotion to Shocked
	{
		from: 'neutral',
		to: 'shocked',
		catalyst: 'vulnerability-exposed',
		probability: 0.95,
		intensity_change: 90,
		animation_style: 'explosive'
	},

	// Hostile to Contemptuous
	{
		from: 'hostile',
		to: 'contemptuous',
		catalyst: 'credibility-questioned',
		probability: 0.6,
		intensity_change: -10,
		animation_style: 'smooth'
	},

	// Professional to Calculating
	{
		from: 'professional',
		to: 'calculating',
		catalyst: 'evidence-presented',
		probability: 0.75,
		intensity_change: 30,
		animation_style: 'subtle'
	}
];

// Facial expression mapping for detailed animations
export const FACIAL_EXPRESSIONS: Record<InterviewerEmotion, FacialExpressionMap> = {
	'neutral': {
		eyebrows: 'none',
		eyes: 'none',
		mouth: 'none',
		jaw: 'none',
		overall_tension: 'none'
	},
	'professional': {
		eyebrows: 'subtle',
		eyes: 'subtle',
		mouth: 'none',
		jaw: 'none',
		overall_tension: 'subtle'
	},
	'skeptical': {
		eyebrows: 'moderate',
		eyes: 'moderate',
		mouth: 'subtle',
		jaw: 'subtle',
		overall_tension: 'moderate'
	},
	'frustrated': {
		eyebrows: 'pronounced',
		eyes: 'pronounced',
		mouth: 'moderate',
		jaw: 'moderate',
		overall_tension: 'pronounced'
	},
	'hostile': {
		eyebrows: 'extreme',
		eyes: 'extreme',
		mouth: 'pronounced',
		jaw: 'pronounced',
		overall_tension: 'extreme'
	},
	'surprised': {
		eyebrows: 'extreme',
		eyes: 'extreme',
		mouth: 'pronounced',
		jaw: 'moderate',
		overall_tension: 'pronounced'
	},
	'triumphant': {
		eyebrows: 'moderate',
		eyes: 'pronounced',
		mouth: 'pronounced',
		jaw: 'subtle',
		overall_tension: 'moderate'
	},
	'calculating': {
		eyebrows: 'moderate',
		eyes: 'pronounced',
		mouth: 'subtle',
		jaw: 'subtle',
		overall_tension: 'moderate'
	},
	'incredulous': {
		eyebrows: 'pronounced',
		eyes: 'pronounced',
		mouth: 'moderate',
		jaw: 'moderate',
		overall_tension: 'pronounced'
	},
	'contemptuous': {
		eyebrows: 'moderate',
		eyes: 'pronounced',
		mouth: 'pronounced',
		jaw: 'moderate',
		overall_tension: 'pronounced'
	},
	'approving': {
		eyebrows: 'subtle',
		eyes: 'moderate',
		mouth: 'moderate',
		jaw: 'none',
		overall_tension: 'subtle'
	},
	'sympathetic': {
		eyebrows: 'subtle',
		eyes: 'moderate',
		mouth: 'subtle',
		jaw: 'none',
		overall_tension: 'subtle'
	},
	'disappointed': {
		eyebrows: 'moderate',
		eyes: 'moderate',
		mouth: 'moderate',
		jaw: 'subtle',
		overall_tension: 'moderate'
	},
	'amused': {
		eyebrows: 'subtle',
		eyes: 'moderate',
		mouth: 'moderate',
		jaw: 'none',
		overall_tension: 'subtle'
	},
	'concerned': {
		eyebrows: 'moderate',
		eyes: 'moderate',
		mouth: 'subtle',
		jaw: 'subtle',
		overall_tension: 'moderate'
	},
	'impatient': {
		eyebrows: 'pronounced',
		eyes: 'pronounced',
		mouth: 'moderate',
		jaw: 'moderate',
		overall_tension: 'pronounced'
	},
	'shocked': {
		eyebrows: 'extreme',
		eyes: 'extreme',
		mouth: 'extreme',
		jaw: 'pronounced',
		overall_tension: 'extreme'
	},
	'disgusted': {
		eyebrows: 'pronounced',
		eyes: 'pronounced',
		mouth: 'pronounced',
		jaw: 'moderate',
		overall_tension: 'pronounced'
	},
	'dismissive': {
		eyebrows: 'moderate',
		eyes: 'moderate',
		mouth: 'moderate',
		jaw: 'subtle',
		overall_tension: 'moderate'
	},
	'intense': {
		eyebrows: 'extreme',
		eyes: 'extreme',
		mouth: 'pronounced',
		jaw: 'pronounced',
		overall_tension: 'extreme'
	}
};

export class InterviewerEmotionAnimationSystem {
	private currentEmotion: InterviewerEmotion = 'neutral';
	private currentIntensity: number = 0;
	private animationQueue: EmotionAnimationConfig[] = [];
	private isAnimating: boolean = false;
	private emotionHistory: { emotion: InterviewerEmotion; timestamp: number; intensity: number }[] = [];

	constructor() {
		this.emotionHistory.push({
			emotion: 'neutral',
			timestamp: Date.now(),
			intensity: 0
		});
	}

	/**
	 * Trigger an emotion animation based on context
	 */
	triggerEmotion(
		emotion: InterviewerEmotion,
		trigger: AnimationTrigger,
		intensity: number = 50,
		priority: number = 5
	): void {
		const config: EmotionAnimationConfig = {
			emotion,
			intensity: Math.max(0, Math.min(100, intensity)),
			duration: EMOTION_ANIMATIONS[emotion].duration,
			trigger,
			chainable: this.isEmotionChainable(emotion),
			priority
		};

		// Check if this should override current animation
		if (this.shouldOverrideCurrentAnimation(config)) {
			this.animationQueue.unshift(config);
		} else {
			this.animationQueue.push(config);
		}

		if (!this.isAnimating) {
			this.processAnimationQueue();
		}
	}

	/**
	 * Process the emotion animation queue
	 */
	private async processAnimationQueue(): Promise<void> {
		if (this.animationQueue.length === 0) {
			this.isAnimating = false;
			return;
		}

		this.isAnimating = true;
		const config = this.animationQueue.shift()!;

		// Check for transition animations
		const transition = this.findTransition(this.currentEmotion, config.emotion, config.trigger);
		if (transition) {
			await this.executeTransition(transition, config);
		}

		// Execute the main emotion animation
		await this.executeEmotionAnimation(config);

		// Update current state
		this.currentEmotion = config.emotion;
		this.currentIntensity = config.intensity;

		// Record in history
		this.emotionHistory.push({
			emotion: config.emotion,
			timestamp: Date.now(),
			intensity: config.intensity
		});

		// Keep history manageable
		if (this.emotionHistory.length > 20) {
			this.emotionHistory.shift();
		}

		// Continue processing queue
		setTimeout(() => this.processAnimationQueue(), 100);
	}

	/**
	 * Execute an emotion animation
	 */
	private async executeEmotionAnimation(config: EmotionAnimationConfig): Promise<void> {
		const animation = EMOTION_ANIMATIONS[config.emotion];
		const adjustedDuration = this.adjustDurationForIntensity(animation.duration, config.intensity);

		return new Promise(resolve => {
			// Apply the animation to the interviewer element
			this.applyAnimationToElement(animation, adjustedDuration, config.intensity);

			setTimeout(resolve, adjustedDuration);
		});
	}

	/**
	 * Execute a transition animation between emotions
	 */
	private async executeTransition(transition: EmotionTransition, targetConfig: EmotionAnimationConfig): Promise<void> {
		const transitionDuration = this.getTransitionDuration(transition.animation_style);

		return new Promise(resolve => {
			// Apply transition-specific animation
			this.applyTransitionAnimation(transition, transitionDuration);

			setTimeout(resolve, transitionDuration);
		});
	}

	/**
	 * Find appropriate transition for emotion change
	 */
	private findTransition(
		from: InterviewerEmotion,
		to: InterviewerEmotion,
		trigger: AnimationTrigger
	): EmotionTransition | null {
		return EMOTION_TRANSITIONS.find(
			t => t.from === from && t.to === to && t.catalyst === trigger
		) || null;
	}

	/**
	 * Check if emotion should override current animation
	 */
	private shouldOverrideCurrentAnimation(config: EmotionAnimationConfig): boolean {
		if (!this.isAnimating) return false;

		// High priority emotions always override
		if (config.priority >= 8) return true;

		// Shock and surprise always override
		if (config.emotion === 'shocked' || config.emotion === 'surprised') return true;

		// Gotcha moments override most things
		if (config.trigger === 'gotcha-moment') return true;

		return false;
	}

	/**
	 * Check if emotion can be chained with others
	 */
	private isEmotionChainable(emotion: InterviewerEmotion): boolean {
		const nonChainableEmotions: InterviewerEmotion[] = ['shocked', 'surprised', 'triumphant'];
		return !nonChainableEmotions.includes(emotion);
	}

	/**
	 * Adjust animation duration based on intensity
	 */
	private adjustDurationForIntensity(baseDuration: number, intensity: number): number {
		const intensityFactor = intensity / 100;
		// Higher intensity = faster, more dramatic animations
		return Math.max(500, baseDuration * (1.2 - intensityFactor * 0.4));
	}

	/**
	 * Get transition duration based on style
	 */
	private getTransitionDuration(style: TransitionStyle): number {
		const durations: Record<TransitionStyle, number> = {
			'instant': 100,
			'smooth': 800,
			'dramatic': 1200,
			'subtle': 600,
			'building': 1500,
			'explosive': 300,
			'gradual': 2000,
			'sharp': 400
		};
		return durations[style];
	}

	/**
	 * Apply animation to the interviewer element (to be implemented with actual DOM manipulation)
	 */
	private applyAnimationToElement(
		animation: EmotionAnimationSequence,
		duration: number,
		intensity: number
	): void {
		// This would interface with the actual DOM element
		console.log(`Applying ${animation.emotion} animation with intensity ${intensity} for ${duration}ms`);

		// Generate CSS animation or use Web Animations API
		const element = document.querySelector('.confrontational-interviewer');
		if (element) {
			this.createKeyframeAnimation(element as HTMLElement, animation, duration, intensity);
		}
	}

	/**
	 * Create and apply keyframe animation
	 */
	private createKeyframeAnimation(
		element: HTMLElement,
		animation: EmotionAnimationSequence,
		duration: number,
		intensity: number
	): void {
		const keyframes = animation.keyframes.map(kf => {
			const frame: any = {};

			if (kf.properties.scale) {
				frame.transform = (frame.transform || '') + ` scale(${kf.properties.scale})`;
			}
			if (kf.properties.rotation) {
				frame.transform = (frame.transform || '') + ` rotate(${kf.properties.rotation}deg)`;
			}
			if (kf.properties.translation) {
				frame.transform = (frame.transform || '') + ` translate(${kf.properties.translation.x}px, ${kf.properties.translation.y}px)`;
			}
			if (kf.properties.filter) {
				frame.filter = kf.properties.filter;
			}
			if (kf.properties.opacity !== undefined) {
				frame.opacity = kf.properties.opacity;
			}

			return frame;
		});

		const animationOptions: KeyframeAnimationOptions = {
			duration,
			iterations: animation.iteration_count === 'infinite' ? Infinity : animation.iteration_count,
			fill: animation.fill_mode as FillMode,
			easing: 'ease-in-out'
		};

		element.animate(keyframes, animationOptions);
	}

	/**
	 * Apply transition animation
	 */
	private applyTransitionAnimation(transition: EmotionTransition, duration: number): void {
		console.log(`Applying transition from ${transition.from} to ${transition.to} with style ${transition.animation_style}`);
	}

	/**
	 * Get current emotional state
	 */
	getCurrentEmotion(): InterviewerEmotion {
		return this.currentEmotion;
	}

	/**
	 * Get current intensity
	 */
	getCurrentIntensity(): number {
		return this.currentIntensity;
	}

	/**
	 * Get emotion history
	 */
	getEmotionHistory(): { emotion: InterviewerEmotion; timestamp: number; intensity: number }[] {
		return [...this.emotionHistory];
	}

	/**
	 * Clear animation queue (emergency stop)
	 */
	clearAnimationQueue(): void {
		this.animationQueue = [];
		this.isAnimating = false;
	}

	/**
	 * Get recommended emotion for context
	 */
	getRecommendedEmotion(
		trigger: AnimationTrigger,
		responseQuality: number,
		frustrationLevel: number
	): { emotion: InterviewerEmotion; intensity: number } {
		// Base emotion selection logic
		const emotionMap: Record<AnimationTrigger, InterviewerEmotion[]> = {
			'response-received': ['neutral', 'professional', 'approving'],
			'evasion-detected': ['skeptical', 'frustrated', 'impatient'],
			'contradiction-found': ['surprised', 'incredulous', 'triumphant'],
			'gotcha-moment': ['triumphant', 'shocked', 'intense'],
			'evidence-presented': ['calculating', 'intense', 'professional'],
			'accountability-pressed': ['frustrated', 'hostile', 'intense'],
			'time-pressure': ['impatient', 'frustrated', 'intense'],
			'breakthrough-achieved': ['surprised', 'triumphant', 'approving'],
			'deflection-attempted': ['skeptical', 'frustrated', 'impatient'],
			'vulnerability-exposed': ['shocked', 'triumphant', 'intense'],
			'credibility-questioned': ['incredulous', 'contemptuous', 'dismissive'],
			'mood-escalation': ['frustrated', 'hostile', 'intense']
		};

		const candidates = emotionMap[trigger] || ['neutral'];

		// Select emotion based on frustration level and response quality
		let selectedEmotion: InterviewerEmotion;
		let intensity: number;

		if (frustrationLevel > 70) {
			selectedEmotion = candidates[candidates.length - 1]; // Most intense option
			intensity = Math.min(95, 60 + frustrationLevel / 2);
		} else if (frustrationLevel > 40) {
			selectedEmotion = candidates[Math.min(1, candidates.length - 1)]; // Middle option
			intensity = Math.min(80, 40 + frustrationLevel / 2);
		} else {
			selectedEmotion = candidates[0]; // Mildest option
			intensity = Math.min(60, 20 + frustrationLevel / 3);
		}

		// Adjust for response quality
		if (responseQuality < 30) {
			intensity += 20;
		} else if (responseQuality > 80) {
			intensity = Math.max(intensity - 15, 10);
		}

		return {
			emotion: selectedEmotion,
			intensity: Math.max(10, Math.min(100, intensity))
		};
	}
}