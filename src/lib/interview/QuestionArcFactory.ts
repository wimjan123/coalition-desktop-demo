/**
 * Question Arc Factory
 * Creates background-specific question arcs with appropriate difficulty scaling
 */

import type {
  QuestionArc,
  DifficultyLevel,
  DynamicQuestion,
  InterviewerType,
  QuestionArcDefinition
} from '../types/interview.js';

export class QuestionArcFactory {
  private static arcDefinitions: Map<string, QuestionArcDefinition> = new Map();

  static {
    this.initializeArcDefinitions();
  }

  /**
   * Create a question arc for the given background and difficulty
   */
  static create(backgroundId: string, difficulty: DifficultyLevel): QuestionArc {
    const definition = this.arcDefinitions.get(backgroundId);
    if (!definition) {
      throw new Error(`No question arc defined for background: ${backgroundId}`);
    }

    // Scale difficulty if needed
    const scaledDefinition = this.scaleDifficulty(definition, difficulty);

    return {
      backgroundId,
      difficulty,
      interviewerApproach: scaledDefinition.interviewerApproach,
      questionCount: scaledDefinition.questionCount,
      questions: scaledDefinition.arc
    };
  }

  /**
   * Initialize all background-specific question arc definitions
   */
  private static initializeArcDefinitions(): void {
    // Toeslagenaffaire Whistleblower - Extreme Difficulty
    this.arcDefinitions.set('toeslagenaffaire-whistleblower', {
      backgroundId: 'toeslagenaffaire-whistleblower',
      difficulty: 'extreme',
      interviewerApproach: 'confrontational',
      questionCount: 7,
      arc: [
        {
          id: 'opener-accountability',
          type: 'opener',
          setup: "The Toeslagenaffaire affected thousands of families, destroying lives and trust in government institutions.",
          question: "You were inside the system that destroyed lives. How can voters trust you to fix what you helped break?",
          interruptionTriggers: [
            {
              condition: 'evasion',
              probability: 0.8,
              message: "That's not an answer. You were PART of the problem.",
              followUpAction: 'accountability-pressure'
            },
            {
              condition: 'deflection',
              probability: 0.9,
              message: "Don't blame the system—you WERE the system. Take responsibility.",
              followUpAction: 'responsibility-challenge'
            }
          ],
          followUpRules: [
            { if: 'tone:defensive', then: 'accountability-pressure' },
            { if: 'tone:aggressive', then: 'responsibility-challenge' },
            { if: 'word_count<20', then: 'deeper-probing' }
          ],
          responseOptions: [
            {
              text: "I exposed the system precisely because I saw how broken it was from the inside.",
              tone: 'confrontational',
              consequences: [
                { type: 'mood-change', value: 'skeptical', description: 'Interviewer becomes more skeptical' }
              ],
              triggers: ['whistleblower-defense']
            },
            {
              text: "That's exactly why I'm running—to rebuild the trust that was destroyed.",
              tone: 'diplomatic',
              consequences: [
                { type: 'performance-impact', value: { authenticity: +10 }, description: 'Honest acknowledgment' }
              ],
              triggers: ['rebuild-trust']
            },
            {
              text: "I was following orders and procedures. The real problem was systemic racism.",
              tone: 'defensive',
              consequences: [
                { type: 'mood-change', value: 'hostile', description: 'Deflecting responsibility angers interviewer' },
                { type: 'trigger-follow-up', value: 'responsibility-attack', description: 'Triggers aggressive follow-up' }
              ],
              triggers: ['deflection-attack']
            },
            {
              text: "You're oversimplifying a complex situation. I did what I thought was right.",
              tone: 'evasive',
              consequences: [
                { type: 'mood-change', value: 'frustrated', description: 'Evasion increases frustration' },
                { type: 'memory-update', value: 'evasive_on_accountability', description: 'Remembered as evasive' }
              ],
              triggers: ['evasion-pressure']
            }
          ]
        },
        {
          id: 'institutional-trust',
          type: 'challenge',
          setup: "Recent polls show only 23% of Dutch citizens trust government institutions.",
          question: "If you couldn't fix it from the inside before, what makes you think you can fix it from the inside now?",
          interruptionTriggers: [
            {
              condition: 'repeated_evasion',
              probability: 1.0,
              message: "Stop dodging. This is about YOUR credibility.",
              followUpAction: 'credibility-attack'
            }
          ],
          followUpRules: [
            { if: 'contradicts:previous', then: 'contradiction-challenge' },
            { if: 'tone:confident', then: 'overconfidence-check' }
          ],
          responseOptions: [
            {
              text: "Because now I have the mandate and authority to make real changes, not just report problems.",
              tone: 'confident',
              consequences: [
                { type: 'performance-impact', value: { confidence: +15 }, description: 'Shows leadership confidence' }
              ],
              triggers: ['authority-claim']
            },
            {
              text: "The difference is accountability. As an elected official, I answer directly to voters.",
              tone: 'diplomatic',
              consequences: [
                { type: 'performance-impact', value: { authenticity: +5 }, description: 'Reasonable response' }
              ],
              triggers: ['accountability-focus']
            },
            {
              text: "I learned from my mistakes. Sometimes you need to break a system to fix it.",
              tone: 'aggressive',
              consequences: [
                { type: 'mood-change', value: 'surprised', description: 'Unexpected admission' },
                { type: 'memory-update', value: 'admits_mistakes', description: 'Acknowledges mistakes' }
              ],
              triggers: ['learning-admission']
            }
          ]
        },
        {
          id: 'victim-impact',
          type: 'gotcha',
          setup: "Fatima Hassan, one of the affected mothers, is watching tonight. She lost her home and custody of her children.",
          question: "What would you say to Fatima, knowing that your work contributed to her family's destruction?",
          urgency: {
            timeLimit: 15,
            warningThreshold: 5,
            timeoutAction: 'penalty'
          },
          interruptionTriggers: [
            {
              condition: 'word_count>60',
              probability: 0.7,
              message: "She doesn't need explanations. She needs accountability.",
              followUpAction: 'personal-accountability'
            }
          ],
          followUpRules: [
            { if: 'tone:evasive', then: 'victim-disrespect' },
            { if: 'word_count<10', then: 'insufficient-response' }
          ],
          responseOptions: [
            {
              text: "I would tell her that I'm deeply sorry and that I'm running to make sure this never happens again.",
              tone: 'diplomatic',
              consequences: [
                { type: 'performance-impact', value: { authenticity: +20 }, description: 'Genuine apology resonates' }
              ],
              triggers: ['genuine-apology']
            },
            {
              text: "I can't undo the damage, but I can ensure the system works for families like hers going forward.",
              tone: 'confident',
              consequences: [
                { type: 'performance-impact', value: { confidence: +10 }, description: 'Forward-looking response' }
              ],
              triggers: ['forward-focus']
            },
            {
              text: "The system failed her, not me personally. I was just doing my job.",
              tone: 'defensive',
              consequences: [
                { type: 'mood-change', value: 'hostile', description: 'Blaming system angers interviewer' },
                { type: 'performance-impact', value: { authenticity: -25 }, description: 'Seen as heartless' }
              ],
              triggers: ['system-blame']
            }
          ]
        },
        {
          id: 'political-motivation',
          type: 'challenge',
          setup: "You've gone from exposing government failures to wanting to lead that same government.",
          question: "Are you running for office out of genuine conviction, or is this about personal redemption after destroying your own career?",
          interruptionTriggers: [
            {
              condition: 'deflection',
              probability: 0.8,
              message: "That sounds like a campaign speech. Answer the question about YOUR motivations.",
              followUpAction: 'motivation-probe'
            }
          ],
          followUpRules: [
            { if: 'tone:defensive', then: 'career-destruction-probe' },
            { if: 'tone:confident', then: 'conviction-test' },
            { if: 'word_count>80', then: 'conciseness-demand' }
          ],
          responseOptions: [
            {
              text: "I destroyed my career to do the right thing. Now I want to build something better from the pieces.",
              tone: 'confident',
              consequences: [
                { type: 'performance-impact', value: { authenticity: +15 }, description: 'Powerful personal admission' },
                { type: 'mood-change', value: 'sympathetic', description: 'Interviewer shows slight respect' }
              ],
              triggers: ['redemption-narrative']
            },
            {
              text: "Personal redemption is irrelevant. The system needs fixing and I know exactly what's broken.",
              tone: 'confrontational',
              consequences: [
                { type: 'mood-change', value: 'skeptical', description: 'Dismissing personal element raises questions' }
              ],
              triggers: ['system-focus']
            },
            {
              text: "This isn't about my career. It's about making sure no family goes through what those parents did.",
              tone: 'diplomatic',
              consequences: [
                { type: 'performance-impact', value: { authenticity: +8 }, description: 'Focus on victims resonates' }
              ],
              triggers: ['victim-advocacy']
            },
            {
              text: "That's a false choice. You can care about fixing things AND want personal vindication.",
              tone: 'defensive',
              consequences: [
                { type: 'mood-change', value: 'frustrated', description: 'Defensiveness confirms interviewer suspicions' },
                { type: 'performance-impact', value: { confidence: -5 }, description: 'Appears uncertain about motivations' }
              ],
              triggers: ['motivation-confusion']
            }
          ]
        },
        {
          id: 'competence-challenge',
          type: 'challenge',
          setup: "The Toeslagenaffaire investigation revealed massive systemic incompetence across multiple departments.",
          question: "If you couldn't spot these problems while working inside the system, how can we trust your judgment to identify other hidden crises?",
          urgency: {
            timeLimit: 20,
            warningThreshold: 5,
            timeoutAction: 'penalty'
          },
          interruptionTriggers: [
            {
              condition: 'evasion',
              probability: 0.9,
              message: "You're not answering the competence question. This is about YOUR judgment.",
              followUpAction: 'competence-pressure'
            },
            {
              condition: 'word_count>100',
              probability: 0.6,
              message: "The longer you talk, the more it sounds like you're making excuses.",
              followUpAction: 'excuse-making'
            }
          ],
          followUpRules: [
            { if: 'tone:confident', then: 'arrogance-check' },
            { if: 'tone:evasive', then: 'competence-attack' },
            { if: 'contradicts:previous', then: 'credibility-challenge' }
          ],
          responseOptions: [
            {
              text: "I did spot the problems. That's exactly WHY I became a whistleblower. Others stayed silent.",
              tone: 'confident',
              consequences: [
                { type: 'performance-impact', value: { confidence: +10 }, description: 'Reframes competence as courage' }
              ],
              triggers: ['competence-reframe']
            },
            {
              text: "The system was designed to hide these problems. Even well-meaning people couldn't see the full picture.",
              tone: 'diplomatic',
              consequences: [
                { type: 'performance-impact', value: { authenticity: +5 }, description: 'Acknowledges systemic issues' }
              ],
              triggers: ['systemic-blindness']
            },
            {
              text: "Nobody could have predicted the scale of this crisis. We were all working with incomplete information.",
              tone: 'defensive',
              consequences: [
                { type: 'mood-change', value: 'frustrated', description: 'Sounds like excuse-making' },
                { type: 'performance-impact', value: { confidence: -10 }, description: 'Appears to avoid responsibility' }
              ],
              triggers: ['excuse-deflection']
            },
            {
              text: "That's exactly the wrong question. The question is: who else had the courage to speak up when they saw wrongdoing?",
              tone: 'aggressive',
              consequences: [
                { type: 'mood-change', value: 'hostile', description: 'Attacking interviewer angers them' },
                { type: 'performance-impact', value: { authenticity: -5 }, description: 'Deflecting onto others' }
              ],
              triggers: ['deflection-attack']
            }
          ]
        },
        {
          id: 'coalition-viability',
          type: 'challenge',
          setup: "Recent polling shows other parties are reluctant to work with controversial figures.",
          question: "If no one wants to form a coalition with you because of your past, how can you actually govern?",
          interruptionTriggers: [
            {
              condition: 'word_count>70',
              probability: 0.7,
              message: "That's a lot of theory. Give me one concrete example of a party that would work with you.",
              followUpAction: 'concrete-example-demand'
            }
          ],
          followUpRules: [
            { if: 'tone:confident', then: 'overconfidence-reality-check' },
            { if: 'tone:evasive', then: 'coalition-impossibility' },
            { if: 'word_count<25', then: 'insufficient-detail' }
          ],
          responseOptions: [
            {
              text: "Parties that actually care about good governance will work with anyone who can deliver results.",
              tone: 'confident',
              consequences: [
                { type: 'performance-impact', value: { confidence: +8 }, description: 'Projects leadership confidence' }
              ],
              triggers: ['results-focus']
            },
            {
              text: "The controversy will fade, but competent governance lasts. Smart politicians know the difference.",
              tone: 'diplomatic',
              consequences: [
                { type: 'performance-impact', value: { authenticity: +5 }, description: 'Mature perspective on politics' }
              ],
              triggers: ['long-term-thinking']
            },
            {
              text: "I'll work with anyone willing to put citizens before party politics. If they won't, that says more about them.",
              tone: 'confrontational',
              consequences: [
                { type: 'mood-change', value: 'skeptical', description: 'Sounds idealistic and naive' }
              ],
              triggers: ['idealism-naivety']
            },
            {
              text: "Coalition politics are complex. We'll see what happens after the election results.",
              tone: 'evasive',
              consequences: [
                { type: 'mood-change', value: 'frustrated', description: 'Non-answer frustrates interviewer' },
                { type: 'performance-impact', value: { confidence: -10 }, description: 'Appears unprepared for governance' }
              ],
              triggers: ['coalition-evasion']
            }
          ]
        },
        {
          id: 'loyalty-test',
          type: 'gotcha',
          setup: "Your former colleagues at the ministry have remained silent about your claims of systemic problems.",
          question: "If you're right about the problems, why hasn't a single colleague come forward to support your version of events?",
          urgency: {
            timeLimit: 18,
            warningThreshold: 4,
            timeoutAction: 'penalty'
          },
          interruptionTriggers: [
            {
              condition: 'deflection',
              probability: 0.9,
              message: "Don't attack them. Answer why NO ONE supports your story.",
              followUpAction: 'isolation-emphasis'
            },
            {
              condition: 'conspiracy_theory',
              probability: 0.8,
              message: "That sounds like conspiracy thinking. Do you really believe everyone is lying?",
              followUpAction: 'reality-check'
            }
          ],
          followUpRules: [
            { if: 'tone:aggressive', then: 'colleague-attack-probe' },
            { if: 'tone:defensive', then: 'isolation-reality' },
            { if: 'word_count>90', then: 'rambling-stop' }
          ],
          responseOptions: [
            {
              text: "They're protecting their careers and pensions. I chose to protect families instead.",
              tone: 'confident',
              consequences: [
                { type: 'performance-impact', value: { authenticity: +12 }, description: 'Powerful moral contrast' },
                { type: 'mood-change', value: 'impressed', description: 'Interviewer respects the moral stance' }
              ],
              triggers: ['moral-courage']
            },
            {
              text: "They saw the same things I did, but speaking up meant career suicide. I had nothing left to lose.",
              tone: 'diplomatic',
              consequences: [
                { type: 'performance-impact', value: { authenticity: +8 }, description: 'Understands colleague motivations' }
              ],
              triggers: ['career-sacrifice']
            },
            {
              text: "The system punishes whistleblowers and rewards silence. They're making the rational choice for them.",
              tone: 'defensive',
              consequences: [
                { type: 'mood-change', value: 'skeptical', description: 'Sounds like rationalization' },
                { type: 'performance-impact', value: { confidence: -5 }, description: 'Weak explanation for isolation' }
              ],
              triggers: ['system-excuse']
            },
            {
              text: "Some have supported me privately. They're scared of retaliation for speaking publicly.",
              tone: 'evasive',
              consequences: [
                { type: 'mood-change', value: 'frustrated', description: 'Unverifiable claims frustrate interviewer' },
                { type: 'performance-impact', value: { authenticity: -8 }, description: 'Sounds like making excuses' }
              ],
              triggers: ['private-support-claim']
            }
          ]
        },
        {
          id: 'closer-legacy',
          type: 'closer',
          setup: "We're almost out of time, but this is perhaps the most important question.",
          question: "When history judges the Toeslagenaffaire, do you want to be remembered as the person who exposed it, or the person who fixed it?",
          interruptionTriggers: [
            {
              condition: 'word_count>60',
              probability: 0.5,
              message: "That's our time. Give me one final sentence.",
              followUpAction: 'final-word'
            }
          ],
          followUpRules: [
            { if: 'tone:evasive', then: 'final-evasion-call-out' },
            { if: 'tone:confident', then: 'legacy-confidence-probe' }
          ],
          responseOptions: [
            {
              text: "Both. I exposed it because fixing it is the only way to honor the families who suffered.",
              tone: 'confident',
              consequences: [
                { type: 'performance-impact', value: { authenticity: +15, confidence: +10 }, description: 'Perfect closing statement' },
                { type: 'mood-change', value: 'impressed', description: 'Strong finish impresses interviewer' }
              ],
              triggers: ['legacy-synthesis']
            },
            {
              text: "History will decide. I just want to make sure it never happens again.",
              tone: 'diplomatic',
              consequences: [
                { type: 'performance-impact', value: { authenticity: +8 }, description: 'Humble and forward-looking' }
              ],
              triggers: ['future-focus']
            },
            {
              text: "I'd rather be remembered as the person who had the courage to act when it mattered.",
              tone: 'confrontational',
              consequences: [
                { type: 'performance-impact', value: { confidence: +5 }, description: 'Shows personal conviction' }
              ],
              triggers: ['courage-emphasis']
            },
            {
              text: "That's not for me to decide. I did what I thought was right at the time.",
              tone: 'defensive',
              consequences: [
                { type: 'mood-change', value: 'disappointed', description: 'Weak ending disappoints interviewer' },
                { type: 'performance-impact', value: { confidence: -8 }, description: 'Uncertain about own legacy' }
              ],
              triggers: ['weak-closer']
            }
          ]
        }
        // Complete 7-question extreme difficulty arc
      ]
    });

    // Small Business Owner - Low Difficulty
    this.arcDefinitions.set('small-business-owner', {
      backgroundId: 'small-business-owner',
      difficulty: 'low',
      interviewerApproach: 'professional',
      questionCount: 5,
      arc: [
        {
          id: 'business-experience',
          type: 'opener',
          setup: "You've run a successful small business for over a decade in Utrecht.",
          question: "How does running a business prepare you for political leadership?",
          interruptionTriggers: [
            {
              condition: 'word_count>100',
              probability: 0.3,
              message: "Let me stop you there—can you be more concise?",
              followUpAction: 'conciseness-request'
            }
          ],
          followUpRules: [
            { if: 'tone:confident', then: 'experience-validation' },
            { if: 'word_count<15', then: 'elaboration-request' }
          ],
          responseOptions: [
            {
              text: "Business teaches you to make tough decisions with limited resources—exactly what government needs.",
              tone: 'confident',
              consequences: [
                { type: 'performance-impact', value: { confidence: +10 }, description: 'Clear practical connection' }
              ],
              triggers: ['practical-leadership']
            },
            {
              text: "I understand what working families face because I've had to make payroll every month.",
              tone: 'diplomatic',
              consequences: [
                { type: 'mood-change', value: 'sympathetic', description: 'Interviewer appreciates authenticity' }
              ],
              triggers: ['working-family-connection']
            },
            {
              text: "Politics and business are completely different. I'll need to learn as I go.",
              tone: 'defensive',
              consequences: [
                { type: 'performance-impact', value: { confidence: -5 }, description: 'Shows uncertainty' }
              ],
              triggers: ['learning-curve']
            }
          ]
        },
        {
          id: 'policy-priorities',
          type: 'challenge',
          question: "What's your top policy priority, and how would you fund it?",
          interruptionTriggers: [],
          followUpRules: [
            { if: 'topic:economy', then: 'economic-policy-detail' },
            { if: 'tone:evasive', then: 'specificity-request' }
          ],
          responseOptions: [
            {
              text: "Small business tax relief funded by closing corporate loopholes.",
              tone: 'confident',
              consequences: [
                { type: 'performance-impact', value: { confidence: +5 }, description: 'Specific policy proposal' }
              ],
              triggers: ['business-tax-focus']
            },
            {
              text: "Healthcare access—we need to support our healthcare workers better.",
              tone: 'diplomatic',
              consequences: [
                { type: 'performance-impact', value: { authenticity: +5 }, description: 'Shows care for others' }
              ],
              triggers: ['healthcare-priority']
            },
            {
              text: "I'd need to study the budget more before making specific commitments.",
              tone: 'evasive',
              consequences: [
                { type: 'performance-impact', value: { confidence: -10 }, description: 'Appears unprepared' }
              ],
              triggers: ['preparation-question']
            }
          ]
        },
        {
          id: 'economic-challenges',
          type: 'practical-focus',
          setup: "As a business owner, you've dealt with economic ups and downs, inflation, supply chain issues.",
          question: "What's the biggest economic challenge facing small businesses right now, and what would you do about it?",
          interruptionTriggers: [
            {
              condition: 'word_count>80',
              probability: 0.2,
              message: "Keep it practical—what's the main issue?",
              followUpAction: 'simplification-request'
            }
          ],
          followUpRules: [
            { if: 'mentions:specific_challenge', then: 'solution-detail' },
            { if: 'tone:general', then: 'specificity-push' }
          ],
          responseOptions: [
            {
              text: "Rising costs and labor shortages. We need streamlined hiring processes and targeted support for training programs.",
              tone: 'confident',
              consequences: [
                { type: 'performance-impact', value: { confidence: +10, authenticity: +5 }, description: 'Specific, experienced answer' }
              ],
              triggers: ['practical-solution']
            },
            {
              text: "Inflation is killing us. Energy costs, rent, everything's going up but we can't raise prices fast enough.",
              tone: 'frustrated',
              consequences: [
                { type: 'performance-impact', value: { authenticity: +10 }, description: 'Personal experience shows' },
                { type: 'mood-change', value: 'sympathetic', description: 'Understands real struggle' }
              ],
              triggers: ['real-experience']
            },
            {
              text: "There are many challenges—regulation, taxation, market competition. It's complex.",
              tone: 'diplomatic',
              consequences: [
                { type: 'performance-impact', value: { engagement: +0 }, description: 'Generic answer' }
              ],
              triggers: ['general-response']
            },
            {
              text: "Each business faces different issues depending on their sector and size.",
              tone: 'evasive',
              consequences: [
                { type: 'performance-impact', value: { confidence: -5 }, description: 'Avoids taking position' }
              ],
              triggers: ['avoid-specificity']
            }
          ]
        },
        {
          id: 'employee-perspective',
          type: 'empathy-test',
          setup: "You've been the boss, but you're asking to represent workers too.",
          question: "How do you balance being pro-business with protecting employee rights?",
          interruptionTriggers: [
            {
              condition: 'mentions:both_sides OR mentions:balance',
              probability: 0.4,
              message: "That sounds like you're trying to please everyone. Pick a side.",
              followUpAction: 'position-demand'
            }
          ],
          followUpRules: [
            { if: 'tone:diplomatic', then: 'real-scenario' },
            { if: 'mentions:personal_experience', then: 'example-request' }
          ],
          responseOptions: [
            {
              text: "I've been both employer and employee. Good businesses treat workers well because it's smart business—happy employees are productive employees.",
              tone: 'confident',
              consequences: [
                { type: 'performance-impact', value: { authenticity: +10, confidence: +5 }, description: 'Personal experience backing position' }
              ],
              triggers: ['win-win-approach']
            },
            {
              text: "Sometimes I had to make tough calls about wages when cash flow was tight. Workers deserve fair treatment, but businesses need to survive too.",
              tone: 'honest',
              consequences: [
                { type: 'performance-impact', value: { authenticity: +15 }, description: 'Honest about real trade-offs' },
                { type: 'memory-update', value: 'honest_trade_offs', description: 'Acknowledges difficult decisions' }
              ],
              triggers: ['honest-trade-offs']
            },
            {
              text: "Workers and businesses both want the same thing—a strong economy with good jobs.",
              tone: 'diplomatic',
              consequences: [
                { type: 'performance-impact', value: { engagement: +5 }, description: 'Reasonable but safe' }
              ],
              triggers: ['common-ground']
            },
            {
              text: "That's exactly why we need more business people in politics—to find practical solutions.",
              tone: 'deflective',
              consequences: [
                { type: 'performance-impact', value: { confidence: -5 }, description: 'Doesn\'t answer the question' }
              ],
              triggers: ['question-dodge']
            }
          ]
        },
        {
          id: 'local-connection',
          type: 'relatability-test',
          setup: "You're running as someone who understands regular people's concerns.",
          question: "Tell me about a time when your business decisions directly affected your employees' lives.",
          interruptionTriggers: [
            {
              condition: 'word_count>100 AND not_mentioned:specific_example',
              probability: 0.5,
              message: "Give me a specific example—what happened?",
              followUpAction: 'story-demand'
            },
            {
              condition: 'tone:vague',
              probability: 0.6,
              message: "That's too general. Tell me about one specific person or situation.",
              followUpAction: 'personal-story'
            }
          ],
          followUpRules: [
            { if: 'mentions:specific_person', then: 'emotional-impact' },
            { if: 'tone:abstract', then: 'grounding-request' }
          ],
          responseOptions: [
            {
              text: "During COVID, I had to furlough three people. I called each one personally and made sure they knew it wasn't performance-related. When we recovered, I brought them all back with raises.",
              tone: 'honest',
              consequences: [
                { type: 'performance-impact', value: { authenticity: +15, empathy: +10 }, description: 'Personal, specific story' },
                { type: 'mood-change', value: 'moved', description: 'Touched by personal story' },
                { type: 'memory-update', value: 'covid_story', description: 'Shows care for employees' }
              ],
              triggers: ['human-story']
            },
            {
              text: "When we expanded, I promoted my longest-serving employee to manager. She'd been with us since the beginning and deserved the opportunity.",
              tone: 'proud',
              consequences: [
                { type: 'performance-impact', value: { authenticity: +10, confidence: +5 }, description: 'Positive leadership story' }
              ],
              triggers: ['promotion-story']
            },
            {
              text: "I always tried to make decisions that were fair to everyone while keeping the business sustainable.",
              tone: 'diplomatic',
              consequences: [
                { type: 'performance-impact', value: { engagement: +0 }, description: 'Too general' }
              ],
              triggers: ['generic-leadership']
            },
            {
              text: "Business decisions have to be based on facts and numbers, not emotions.",
              tone: 'cold',
              consequences: [
                { type: 'performance-impact', value: { empathy: -10 }, description: 'Lacks human connection' },
                { type: 'mood-change', value: 'concerned', description: 'Worried about lack of empathy' }
              ],
              triggers: ['cold-leadership']
            }
          ]
        },
        {
          id: 'future-vision',
          type: 'closer',
          setup: "You're asking voters to trust a business owner to represent everyone's interests.",
          question: "Five years from now, what would success look like for the Netherlands?",
          interruptionTriggers: [
            {
              condition: 'word_count>90',
              probability: 0.3,
              message: "Keep it simple—what's the main thing you want to achieve?",
              followUpAction: 'focus-request'
            }
          ],
          followUpRules: [
            { if: 'mentions:specific_metric', then: 'measurement-follow' },
            { if: 'tone:vague', then: 'specificity-request' }
          ],
          responseOptions: [
            {
              text: "More small businesses thriving, young people able to afford homes, and families not worrying about next month's bills.",
              tone: 'hopeful',
              consequences: [
                { type: 'performance-impact', value: { empathy: +10, confidence: +5 }, description: 'Concrete, relatable vision' },
                { type: 'memory-update', value: 'practical_vision', description: 'Focuses on everyday concerns' }
              ],
              triggers: ['practical-vision']
            },
            {
              text: "A stronger economy that works for everyone, not just big corporations.",
              tone: 'determined',
              consequences: [
                { type: 'performance-impact', value: { confidence: +5 }, description: 'Clear direction' }
              ],
              triggers: ['populist-vision']
            },
            {
              text: "Economic growth with sustainable fiscal policies and competitive business environment.",
              tone: 'professional',
              consequences: [
                { type: 'performance-impact', value: { engagement: +0 }, description: 'Sounds like business speak' }
              ],
              triggers: ['business-speak']
            },
            {
              text: "It's hard to predict exactly what will happen in five years.",
              tone: 'cautious',
              consequences: [
                { type: 'performance-impact', value: { confidence: -10 }, description: 'Lacks vision' }
              ],
              triggers: ['no-vision']
            }
          ]
        }
      ]
    });

    // Financial Analyst - Medium Difficulty
    this.arcDefinitions.set('financial-analyst', {
      backgroundId: 'financial-analyst',
      difficulty: 'medium',
      interviewerApproach: 'professional',
      questionCount: 5,
      arc: [
        {
          id: 'financial-expertise',
          type: 'opener',
          setup: "You've spent 15 years analyzing European markets and economic policy.",
          question: "With your financial background, how do you view the Netherlands' current fiscal position?",
          interruptionTriggers: [
            {
              condition: 'word_count>120',
              probability: 0.4,
              message: "That's quite technical—can you explain it in terms voters will understand?",
              followUpAction: 'simplification-request'
            }
          ],
          followUpRules: [
            { if: 'tone:confident', then: 'economic-detail' },
            { if: 'topic:economy', then: 'fiscal-policy-probe' }
          ],
          responseOptions: [
            {
              text: "We're in a strong position but face challenges from inflation and housing costs that require targeted intervention.",
              tone: 'confident',
              consequences: [
                { type: 'performance-impact', value: { authenticity: +10 }, description: 'Expert knowledge shows' }
              ],
              triggers: ['economic-analysis']
            },
            {
              text: "The fundamentals are sound, but we need to invest more in sustainable growth.",
              tone: 'diplomatic',
              consequences: [
                { type: 'performance-impact', value: { confidence: +5 }, description: 'Balanced assessment' }
              ],
              triggers: ['sustainable-growth']
            },
            {
              text: "It's complicated—there are many factors to consider.",
              tone: 'evasive',
              consequences: [
                { type: 'performance-impact', value: { confidence: -15 }, description: 'Fails to use expertise' }
              ],
              triggers: ['expertise-waste']
            }
          ]
        },
        {
          id: 'inflation-policy',
          type: 'policy-challenge',
          setup: "Inflation is hitting Dutch households hard, and traditional monetary policy tools are limited at the national level.",
          question: "As someone who's analyzed markets for years, what specific fiscal measures would you take to help families deal with rising costs?",
          interruptionTriggers: [
            {
              condition: 'mentions:ECB OR mentions:interest_rates',
              probability: 0.6,
              message: "You can't control ECB policy—what can YOU actually do as an MP?",
              followUpAction: 'practical-focus'
            },
            {
              condition: 'word_count>100 AND not_mentioned:concrete_measures',
              probability: 0.7,
              message: "That's theory—give me one specific policy you'd implement next month.",
              followUpAction: 'specificity-demand'
            }
          ],
          followUpRules: [
            { if: 'tone:confident AND mentions:specific_policy', then: 'implementation-details' },
            { if: 'tone:evasive', then: 'preparation-challenge' }
          ],
          responseOptions: [
            {
              text: "Targeted VAT reductions on essentials like food and energy, plus expanded housing allowances indexed to real inflation.",
              tone: 'confident',
              consequences: [
                { type: 'performance-impact', value: { confidence: +15, authenticity: +10 }, description: 'Specific, actionable policy' },
                { type: 'memory-update', value: 'concrete_proposals', description: 'Offers specific measures' }
              ],
              triggers: ['policy-specificity']
            },
            {
              text: "We need a comprehensive approach looking at both supply-side factors and demand management.",
              tone: 'diplomatic',
              consequences: [
                { type: 'performance-impact', value: { engagement: -5 }, description: 'Too academic' }
              ],
              triggers: ['academic-speak']
            },
            {
              text: "Honestly, the tools available at national level are limited. We're dealing with global forces beyond our control.",
              tone: 'honest',
              consequences: [
                { type: 'performance-impact', value: { authenticity: +10 }, description: 'Honest admission' },
                { type: 'mood-change', value: 'surprised', description: 'Unexpected honesty' }
              ],
              triggers: ['honest-limits']
            },
            {
              text: "That requires careful study of the data before proposing solutions.",
              tone: 'evasive',
              consequences: [
                { type: 'performance-impact', value: { confidence: -10 }, description: 'Avoiding the question' },
                { type: 'mood-change', value: 'frustrated', description: 'Expected expertise, got evasion' }
              ],
              triggers: ['expertise-dodge']
            }
          ]
        },
        {
          id: 'housing-crisis',
          type: 'challenge',
          setup: "You've modeled housing markets professionally. The Netherlands has one of the worst housing affordability crises in Europe.",
          question: "You've seen this crisis building for years in your analysis. Why didn't financial experts like you speak up sooner, and what makes you think politicians will listen now?",
          interruptionTriggers: [
            {
              condition: 'mentions:not_my_job OR mentions:analyst_role',
              probability: 0.8,
              message: "But you profited from analyzing these markets while regular families suffered—isn't that part of the problem?",
              followUpAction: 'moral-challenge'
            },
            {
              condition: 'tone:defensive',
              probability: 0.6,
              message: "That sounds defensive. Take responsibility—what should you have done differently?",
              followUpAction: 'accountability-pressure'
            }
          ],
          followUpRules: [
            { if: 'mentions:responsibility', then: 'accountability-follow' },
            { if: 'tone:defensive', then: 'moral-pressure' }
          ],
          responseOptions: [
            {
              text: "You're right—we focused on returns instead of social consequences. That's exactly why I'm running: to bring that analysis into policy-making.",
              tone: 'honest',
              consequences: [
                { type: 'performance-impact', value: { authenticity: +20, confidence: +5 }, description: 'Takes responsibility' },
                { type: 'mood-change', value: 'neutral', description: 'Appreciates honesty' },
                { type: 'memory-update', value: 'accepts_responsibility', description: 'Admits professional failure' }
              ],
              triggers: ['accountability-moment']
            },
            {
              text: "My job was analysis, not advocacy. But you're right that we could have been more vocal about the risks we saw.",
              tone: 'diplomatic',
              consequences: [
                { type: 'performance-impact', value: { authenticity: +5 }, description: 'Mild acknowledgment' }
              ],
              triggers: ['mild-responsibility']
            },
            {
              text: "Financial analysts provide data; politicians make decisions. We warned about bubbles but were ignored.",
              tone: 'defensive',
              consequences: [
                { type: 'performance-impact', value: { authenticity: -10 }, description: 'Deflects responsibility' },
                { type: 'mood-change', value: 'frustrated', description: 'Frustrated by defensiveness' }
              ],
              triggers: ['blame-shifting']
            },
            {
              text: "The housing crisis is complex—it's not fair to blame analysts for political failures.",
              tone: 'evasive',
              consequences: [
                { type: 'performance-impact', value: { confidence: -15 }, description: 'Avoids accountability' },
                { type: 'mood-change', value: 'frustrated', description: 'Expected more from expert' }
              ],
              triggers: ['accountability-dodge']
            }
          ]
        },
        {
          id: 'tax-policy',
          type: 'detailed-policy',
          setup: "Your financial background gives you insight into how different tax structures affect economic behavior.",
          question: "The Netherlands has one of the highest tax burdens in Europe. Walk me through exactly how you'd reform the tax system without crashing government revenues.",
          interruptionTriggers: [
            {
              condition: 'word_count>150 AND not_mentioned:specific_rates',
              probability: 0.7,
              message: "Stop—give me specific numbers. What tax rates would you actually set?",
              followUpAction: 'numbers-demand'
            },
            {
              condition: 'mentions:study_needed OR mentions:commission',
              probability: 0.8,
              message: "You're the expert here! Don't hide behind more studies—what's your professional recommendation?",
              followUpAction: 'expertise-pressure'
            }
          ],
          followUpRules: [
            { if: 'mentions:specific_rates', then: 'implementation-timeline' },
            { if: 'tone:evasive', then: 'expert-competence-challenge' }
          ],
          responseOptions: [
            {
              text: "Flatten income tax to 30% and 45%, eliminate mortgage deduction over 5 years, carbon tax at €75/tonne with revenue recycling to lower earners.",
              tone: 'confident',
              consequences: [
                { type: 'performance-impact', value: { confidence: +20, expertise: +15 }, description: 'Specific, technical proposal' },
                { type: 'memory-update', value: 'detailed_policy', description: 'Provides concrete numbers' }
              ],
              triggers: ['expert-specificity']
            },
            {
              text: "The key is shifting from income tax to consumption and wealth taxes while maintaining progressivity.",
              tone: 'diplomatic',
              consequences: [
                { type: 'performance-impact', value: { engagement: +5 }, description: 'Sound principles' }
              ],
              triggers: ['general-direction']
            },
            {
              text: "Tax reform needs to be evidence-based. I'd start with comprehensive modeling of different scenarios.",
              tone: 'cautious',
              consequences: [
                { type: 'performance-impact', value: { confidence: -10 }, description: 'Avoids commitment' },
                { type: 'mood-change', value: 'frustrated', description: 'Expected expertise, got caution' }
              ],
              triggers: ['analysis-paralysis']
            },
            {
              text: "That's incredibly complex—any changes would need careful consultation with Treasury and stakeholders.",
              tone: 'evasive',
              consequences: [
                { type: 'performance-impact', value: { confidence: -15 }, description: 'Fails to use expertise' },
                { type: 'mood-change', value: 'frustrated', description: 'Disappointed by expert evasion' }
              ],
              triggers: ['expert-dodge']
            }
          ]
        },
        {
          id: 'european-integration',
          type: 'broader-vision',
          setup: "You've analyzed European markets extensively. The EU is facing pressure from multiple directions.",
          question: "Looking at the data you've seen: should the Netherlands pursue deeper fiscal integration with Europe, or protect our financial sovereignty?",
          interruptionTriggers: [
            {
              condition: 'word_count>120 AND not_mentioned:position',
              probability: 0.6,
              message: "I need a clear position—are you for or against deeper integration?",
              followUpAction: 'position-demand'
            },
            {
              condition: 'mentions:both_sides OR mentions:depends',
              probability: 0.7,
              message: "That's fence-sitting. You're running for office—take a stand.",
              followUpAction: 'decision-pressure'
            }
          ],
          followUpRules: [
            { if: 'mentions:integration_support', then: 'sovereignty-challenge' },
            { if: 'mentions:sovereignty_protection', then: 'isolation-risk' }
          ],
          responseOptions: [
            {
              text: "Deeper integration. Small economies like ours need collective strength against global financial shocks. The risks of isolation outweigh sovereignty concerns.",
              tone: 'confident',
              consequences: [
                { type: 'performance-impact', value: { confidence: +15 }, description: 'Clear position based on analysis' },
                { type: 'memory-update', value: 'pro_integration', description: 'Supports EU integration' }
              ],
              triggers: ['integration-position']
            },
            {
              text: "Protect sovereignty. We've built strong institutions and fiscal discipline—we shouldn't surrender that to EU-wide policies we can't control.",
              tone: 'confident',
              consequences: [
                { type: 'performance-impact', value: { confidence: +10 }, description: 'Clear alternative position' },
                { type: 'memory-update', value: 'sovereignty_focus', description: 'Prioritizes national control' }
              ],
              triggers: ['sovereignty-position']
            },
            {
              text: "It's about finding the right balance—integration where it helps, sovereignty where it matters most.",
              tone: 'diplomatic',
              consequences: [
                { type: 'performance-impact', value: { engagement: -10 }, description: 'Non-committal answer' }
              ],
              triggers: ['balance-attempt']
            },
            {
              text: "Both options have significant trade-offs that require careful analysis of the specific integration mechanisms proposed.",
              tone: 'analytical',
              consequences: [
                { type: 'performance-impact', value: { confidence: -10 }, description: 'Avoids taking position' },
                { type: 'mood-change', value: 'frustrated', description: 'Frustrated by analysis without conclusion' }
              ],
              triggers: ['analysis-without-position']
            }
          ]
        }
      ]
    });

    // Add more background definitions...
    this.initializeRemainingBackgrounds();
  }

  /**
   * Initialize the remaining background question arcs
   */
  private static initializeRemainingBackgrounds(): void {
    // Former Politician - High Difficulty
    this.arcDefinitions.set('former-politician', {
      backgroundId: 'former-politician',
      difficulty: 'high',
      interviewerApproach: 'investigative',
      questionCount: 6,
      arc: [
        {
          id: 'political-comeback',
          type: 'opener',
          setup: "You left politics five years ago after your party's electoral defeat.",
          question: "Why should voters give you another chance after your party failed them?",
          interruptionTriggers: [
            {
              condition: 'deflection',
              probability: 0.8,
              message: "That sounds like the same political rhetoric that voters rejected.",
              followUpAction: 'rhetoric-challenge'
            }
          ],
          followUpRules: [
            { if: 'tone:defensive', then: 'accountability-probe' },
            { if: 'tone:aggressive', then: 'humility-check' }
          ],
          responseOptions: [
            {
              text: "I've learned from our mistakes and have a clearer vision for what needs to change.",
              tone: 'diplomatic',
              consequences: [
                { type: 'performance-impact', value: { authenticity: +10 }, description: 'Shows growth' }
              ],
              triggers: ['learning-growth']
            },
            {
              text: "The failure wasn't ours alone—voters weren't ready for necessary changes.",
              tone: 'defensive',
              consequences: [
                { type: 'mood-change', value: 'skeptical', description: 'Blaming voters causes skepticism' }
              ],
              triggers: ['voter-blame']
            },
            {
              text: "Politics taught me humility. I made mistakes, but I also learned what actually works versus what sounds good in speeches.",
              tone: 'honest',
              consequences: [
                { type: 'performance-impact', value: { authenticity: +15, confidence: +5 }, description: 'Genuine self-reflection' },
                { type: 'mood-change', value: 'surprised', description: 'Unexpected honesty' },
                { type: 'memory-update', value: 'admits_mistakes', description: 'Acknowledges political failures' }
              ],
              triggers: ['humility-moment']
            },
            {
              text: "Because now I'm not constrained by party politics—I can speak honestly about what needs to be done.",
              tone: 'confident',
              consequences: [
                { type: 'performance-impact', value: { confidence: +10 }, description: 'Shows independence' }
              ],
              triggers: ['independence-claim']
            }
          ]
        },
        {
          id: 'policy-failure-accountability',
          type: 'gotcha',
          setup: "During your time in office, your party promised to reduce waiting lists in healthcare but they actually increased by 30%.",
          question: "You were personally responsible for that policy area. Can you name one specific decision you made that contributed to that failure?",
          interruptionTriggers: [
            {
              condition: 'mentions:coalition_partners OR mentions:opposition_blocking',
              probability: 0.9,
              message: "Stop blaming others—what was YOUR specific contribution to this failure?",
              followUpAction: 'personal-accountability'
            },
            {
              condition: 'word_count>80 AND not_mentioned:specific_decision',
              probability: 0.8,
              message: "That's not an answer. Give me ONE specific decision you made that made things worse.",
              followUpAction: 'specificity-demand'
            },
            {
              condition: 'tone:defensive',
              probability: 0.7,
              message: "You sound like you're making excuses. Take responsibility—what did YOU do wrong?",
              followUpAction: 'responsibility-pressure'
            }
          ],
          followUpRules: [
            { if: 'mentions:specific_mistake', then: 'learning-follow' },
            { if: 'tone:evasive', then: 'competence-challenge' }
          ],
          responseOptions: [
            {
              text: "I pushed through budget cuts to specialist care without properly analyzing wait time impacts. That was a mistake I own completely.",
              tone: 'honest',
              consequences: [
                { type: 'performance-impact', value: { authenticity: +25 }, description: 'Takes specific responsibility' },
                { type: 'mood-change', value: 'neutral', description: 'Respects honesty' },
                { type: 'memory-update', value: 'specific_accountability', description: 'Admits concrete failure' }
              ],
              triggers: ['accountability-moment']
            },
            {
              text: "I underestimated how long our reforms would take to show results. We should have implemented transitional measures.",
              tone: 'diplomatic',
              consequences: [
                { type: 'performance-impact', value: { authenticity: +10 }, description: 'Mild responsibility' }
              ],
              triggers: ['mild-admission']
            },
            {
              text: "Healthcare is complex—every decision has trade-offs, and some negative outcomes were inevitable given the budget constraints we inherited.",
              tone: 'defensive',
              consequences: [
                { type: 'performance-impact', value: { authenticity: -15 }, description: 'Deflects responsibility' },
                { type: 'mood-change', value: 'frustrated', description: 'Frustrated by excuse-making' }
              ],
              triggers: ['excuse-making']
            },
            {
              text: "That figure is misleading—it doesn't account for the demographic changes and increased demand we were dealing with.",
              tone: 'evasive',
              consequences: [
                { type: 'performance-impact', value: { confidence: -20 }, description: 'Questions the premise instead of answering' },
                { type: 'mood-change', value: 'frustrated', description: 'Angry at evasion' }
              ],
              triggers: ['data-deflection']
            }
          ]
        },
        {
          id: 'party-loyalty-betrayal',
          type: 'challenge',
          setup: "You're running independently now, but you spent eight years defending your party's positions in public.",
          question: "How do we know this isn't just opportunism? What party positions did you privately disagree with but publicly defend?",
          interruptionTriggers: [
            {
              condition: 'mentions:party_loyalty OR mentions:collective_responsibility',
              probability: 0.8,
              message: "That's politician-speak. Give me ONE example where you said something you didn't believe.",
              followUpAction: 'honesty-demand'
            },
            {
              condition: 'word_count>100 AND not_mentioned:specific_position',
              probability: 0.7,
              message: "Stop dancing around it—name a specific policy you defended but disagreed with.",
              followUpAction: 'specificity-pressure'
            }
          ],
          followUpRules: [
            { if: 'mentions:specific_disagreement', then: 'integrity-test' },
            { if: 'tone:evasive', then: 'opportunism-accusation' }
          ],
          responseOptions: [
            {
              text: "I publicly supported our immigration quotas but privately believed they were too restrictive. Party discipline required it, but it felt wrong.",
              tone: 'honest',
              consequences: [
                { type: 'performance-impact', value: { authenticity: +20, confidence: +10 }, description: 'Specific, vulnerable admission' },
                { type: 'memory-update', value: 'internal_conflicts', description: 'Admits to public-private split' }
              ],
              triggers: ['integrity-moment']
            },
            {
              text: "Politics requires compromise. I always found ways to express my concerns through the party process, even when I had reservations.",
              tone: 'diplomatic',
              consequences: [
                { type: 'performance-impact', value: { engagement: +5 }, description: 'Reasonable but vague' }
              ],
              triggers: ['process-answer']
            },
            {
              text: "I believed in our overall direction even when I had doubts about specific tactics. That's what governing parties do.",
              tone: 'defensive',
              consequences: [
                { type: 'performance-impact', value: { authenticity: -10 }, description: 'Avoids the core question' }
              ],
              triggers: ['general-deflection']
            },
            {
              text: "That's not a fair question—every politician faces moments where personal views and party positions don't perfectly align.",
              tone: 'evasive',
              consequences: [
                { type: 'performance-impact', value: { confidence: -15 }, description: 'Refuses to engage with question' },
                { type: 'mood-change', value: 'frustrated', description: 'Annoyed by non-answer' }
              ],
              triggers: ['question-dodge']
            }
          ]
        },
        {
          id: 'corruption-proximity',
          type: 'aggressive-probe',
          setup: "Three of your former party colleagues have been investigated for corruption since you left office. You worked closely with all of them.",
          question: "Did you see signs of the corruption that's now being investigated? And if you did, why didn't you speak up?",
          interruptionTriggers: [
            {
              condition: 'mentions:no_knowledge OR mentions:surprised',
              probability: 0.9,
              message: "Really? You had no idea? That seems hard to believe for someone so close to these people.",
              followUpAction: 'credibility-challenge'
            },
            {
              condition: 'mentions:legal_process OR mentions:cant_comment',
              probability: 0.8,
              message: "This isn't a court—I'm asking what YOU knew. What did you see?",
              followUpAction: 'direct-pressure'
            },
            {
              condition: 'word_count>120',
              probability: 0.6,
              message: "Yes or no—did you see anything that concerned you about their conduct?",
              followUpAction: 'binary-demand'
            }
          ],
          followUpRules: [
            { if: 'mentions:saw_signs', then: 'whistleblower-failure' },
            { if: 'tone:defensive', then: 'guilt-by-association' }
          ],
          responseOptions: [
            {
              text: "I saw concerning patterns but was told it was normal politics. I should have trusted my instincts and spoken up—that's on me.",
              tone: 'honest',
              consequences: [
                { type: 'performance-impact', value: { authenticity: +20 }, description: 'Admits moral failure' },
                { type: 'mood-change', value: 'surprised', description: 'Unexpected confession' },
                { type: 'memory-update', value: 'corruption_awareness', description: 'Admits seeing warning signs' }
              ],
              triggers: ['moral-accountability']
            },
            {
              text: "Looking back, there were things that didn't feel right, but hindsight is 20/20. I trusted colleagues I thought I knew.",
              tone: 'reflective',
              consequences: [
                { type: 'performance-impact', value: { authenticity: +10 }, description: 'Some acknowledgment' }
              ],
              triggers: ['hindsight-admission']
            },
            {
              text: "I had no knowledge of any wrongdoing. These allegations have shocked me as much as anyone.",
              tone: 'defensive',
              consequences: [
                { type: 'performance-impact', value: { authenticity: -10 }, description: 'Claims implausible ignorance' },
                { type: 'mood-change', value: 'skeptical', description: 'Doesn\'t buy the innocence claim' }
              ],
              triggers: ['implausible-denial']
            },
            {
              text: "I can't comment on ongoing investigations, but I have full confidence in the judicial process.",
              tone: 'evasive',
              consequences: [
                { type: 'performance-impact', value: { confidence: -20 }, description: 'Hides behind legal process' },
                { type: 'mood-change', value: 'frustrated', description: 'Angry at stonewalling' }
              ],
              triggers: ['legal-shield']
            }
          ]
        },
        {
          id: 'power-hunger-motivation',
          type: 'psychological-probe',
          setup: "You had power, lost it, and now you want it back. That's a pattern.",
          question: "Be honest—how much of this comeback is about proving your critics wrong versus actually serving the public?",
          interruptionTriggers: [
            {
              condition: 'mentions:public_service OR mentions:duty',
              probability: 0.7,
              message: "That's what every politician says. What's the real personal motivation here?",
              followUpAction: 'sincerity-challenge'
            },
            {
              condition: 'tone:indignant',
              probability: 0.8,
              message: "Your reaction suggests I hit a nerve. Why does that question make you defensive?",
              followUpAction: 'reaction-analysis'
            }
          ],
          followUpRules: [
            { if: 'tone:honest', then: 'human-moment' },
            { if: 'mentions:vindication', then: 'ego-exploration' }
          ],
          responseOptions: [
            {
              text: "Both, honestly. I want to prove I can do better, but that drive comes from caring about the outcomes for people.",
              tone: 'honest',
              consequences: [
                { type: 'performance-impact', value: { authenticity: +15, confidence: +10 }, description: 'Human, honest answer' },
                { type: 'mood-change', value: 'neutral', description: 'Appreciates honesty about motivation' }
              ],
              triggers: ['human-honesty']
            },
            {
              text: "It's entirely about service. Personal vindication is irrelevant when people are struggling.",
              tone: 'noble',
              consequences: [
                { type: 'performance-impact', value: { authenticity: -5 }, description: 'Too perfect, slightly unbelievable' }
              ],
              triggers: ['noble-claim']
            },
            {
              text: "That's an offensive question. I've dedicated my life to public service, not personal ambition.",
              tone: 'indignant',
              consequences: [
                { type: 'performance-impact', value: { confidence: -10 }, description: 'Defensive reaction suggests truth' },
                { type: 'mood-change', value: 'skeptical', description: 'Reaction confirms suspicion' }
              ],
              triggers: ['hit-nerve']
            },
            {
              text: "Every politician has personal motivations—the question is whether they align with public good.",
              tone: 'deflective',
              consequences: [
                { type: 'performance-impact', value: { engagement: -10 }, description: 'Avoids personal reflection' }
              ],
              triggers: ['philosophical-dodge']
            }
          ]
        },
        {
          id: 'legacy-redemption',
          type: 'closer',
          setup: "This is your political legacy on the line. Win or lose, this campaign will define how you're remembered.",
          question: "What would you want written on your political tombstone if this comeback fails?",
          interruptionTriggers: [
            {
              condition: 'mentions:wont_fail OR mentions:confident',
              probability: 0.6,
              message: "Humor me—assume you lose. What would you want people to remember?",
              followUpAction: 'legacy-focus'
            },
            {
              condition: 'word_count>100 AND not_mentioned:specific_achievement',
              probability: 0.5,
              message: "One specific thing—what one accomplishment do you want remembered?",
              followUpAction: 'specificity-request'
            }
          ],
          followUpRules: [
            { if: 'tone:reflective', then: 'wisdom-moment' },
            { if: 'mentions:fighting', then: 'courage-recognition' }
          ],
          responseOptions: [
            {
              text: "That he learned from his mistakes and had the courage to try again, even knowing he might fail.",
              tone: 'reflective',
              consequences: [
                { type: 'performance-impact', value: { authenticity: +15, confidence: +10 }, description: 'Wise, self-aware response' },
                { type: 'memory-update', value: 'legacy_wisdom', description: 'Shows philosophical maturity' }
              ],
              triggers: ['wisdom-legacy']
            },
            {
              text: "That he fought for what he believed in until the end, regardless of political cost.",
              tone: 'determined',
              consequences: [
                { type: 'performance-impact', value: { confidence: +10 }, description: 'Shows conviction' }
              ],
              triggers: ['conviction-legacy']
            },
            {
              text: "I'm not planning to fail, so that's a hypothetical I don't need to consider.",
              tone: 'confident',
              consequences: [
                { type: 'performance-impact', value: { engagement: -5 }, description: 'Avoids reflection' }
              ],
              triggers: ['failure-denial']
            },
            {
              text: "That's too morbid a question for a campaign interview.",
              tone: 'dismissive',
              consequences: [
                { type: 'performance-impact', value: { confidence: -10 }, description: 'Uncomfortable with depth' }
              ],
              triggers: ['depth-avoidance']
            }
          ]
        }
      ]
    });

    // Academic Researcher - Medium Difficulty
    this.arcDefinitions.set('academic-researcher', {
      backgroundId: 'academic-researcher',
      difficulty: 'medium',
      interviewerApproach: 'professional',
      questionCount: 5,
      arc: [
        {
          id: 'theory-practice',
          type: 'opener',
          setup: "You've spent your career studying policy in academia.",
          question: "How do you bridge the gap between academic theory and practical politics?",
          interruptionTriggers: [
            {
              condition: 'word_count>100',
              probability: 0.4,
              message: "This sounds quite academic—how does this help real people?",
              followUpAction: 'practical-application'
            }
          ],
          followUpRules: [
            { if: 'tone:confident', then: 'implementation-challenge' },
            { if: 'topic:education', then: 'education-expertise' }
          ],
          responseOptions: [
            {
              text: "Research gives you evidence-based solutions, but politics requires compromise and communication.",
              tone: 'diplomatic',
              consequences: [
                { type: 'performance-impact', value: { authenticity: +8 }, description: 'Understands both worlds' }
              ],
              triggers: ['balanced-approach']
            },
            {
              text: "Academic rigor ensures policies are based on facts, not emotions or politics.",
              tone: 'confident',
              consequences: [
                { type: 'performance-impact', value: { confidence: +5 }, description: 'Values expertise' }
              ],
              triggers: ['fact-based-approach']
            },
            {
              text: "I've spent years studying what works and what doesn't. That knowledge is exactly what politics needs more of.",
              tone: 'confident',
              consequences: [
                { type: 'performance-impact', value: { confidence: +8 }, description: 'Emphasizes expertise value' }
              ],
              triggers: ['expertise-value']
            },
            {
              text: "Academia can be quite removed from reality. I'll need to learn to think differently.",
              tone: 'honest',
              consequences: [
                { type: 'performance-impact', value: { authenticity: +10 }, description: 'Self-aware admission' },
                { type: 'mood-change', value: 'surprised', description: 'Unexpected honesty' }
              ],
              triggers: ['reality-check']
            }
          ]
        },
        {
          id: 'research-limitations',
          type: 'challenge',
          setup: "You've published papers on policy effectiveness, but research often doesn't translate to real-world implementation.",
          question: "Give me an example where your research conclusions wouldn't work in practice due to political realities.",
          interruptionTriggers: [
            {
              condition: 'word_count>120 AND not_mentioned:specific_example',
              probability: 0.7,
              message: "Stop the lecture—give me a concrete example from your own work.",
              followUpAction: 'specificity-demand'
            },
            {
              condition: 'mentions:all_research_practical',
              probability: 0.8,
              message: "Come on—there must be something you've studied that can't just be implemented as written.",
              followUpAction: 'realism-check'
            }
          ],
          followUpRules: [
            { if: 'mentions:specific_study', then: 'implementation-barriers' },
            { if: 'tone:defensive', then: 'ivory-tower-accusation' }
          ],
          responseOptions: [
            {
              text: "My research on universal basic income shows clear benefits, but implementing it requires massive political consensus and fiscal restructuring that might take decades.",
              tone: 'realistic',
              consequences: [
                { type: 'performance-impact', value: { authenticity: +15, wisdom: +10 }, description: 'Understands implementation challenges' },
                { type: 'memory-update', value: 'realistic_about_limits', description: 'Acknowledges political constraints' }
              ],
              triggers: ['practical-wisdom']
            },
            {
              text: "Housing policy research suggests rent controls reduce supply, but politically, people want immediate relief from high rents, not long-term market solutions.",
              tone: 'analytical',
              consequences: [
                { type: 'performance-impact', value: { authenticity: +10 }, description: 'Good example of theory-practice tension' }
              ],
              triggers: ['theory-practice-gap']
            },
            {
              text: "Good research should translate to policy. If it doesn't, then either the research is flawed or the political system needs reform.",
              tone: 'idealistic',
              consequences: [
                { type: 'performance-impact', value: { confidence: +5, authenticity: -5 }, description: 'Somewhat naive about politics' }
              ],
              triggers: ['academic-idealism']
            },
            {
              text: "Research provides frameworks for thinking about problems—implementation is a separate skill set entirely.",
              tone: 'evasive',
              consequences: [
                { type: 'performance-impact', value: { confidence: -10 }, description: 'Dodges the core question' }
              ],
              triggers: ['implementation-dodge']
            }
          ]
        },
        {
          id: 'expertise-vs-democracy',
          type: 'philosophical-challenge',
          setup: "You've made a career of being an expert, but democracy is about representing ordinary people's views.",
          question: "When your expertise conflicts with what voters want, whose judgment should prevail?",
          interruptionTriggers: [
            {
              condition: 'mentions:educate_voters OR mentions:wrong_about',
              probability: 0.8,
              message: "That sounds dangerously close to saying voters are too stupid to decide for themselves.",
              followUpAction: 'elitism-challenge'
            },
            {
              condition: 'word_count>100 AND not_mentioned:specific_stance',
              probability: 0.6,
              message: "That's very philosophical. In practice—experts or voters?",
              followUpAction: 'practical-choice'
            }
          ],
          followUpRules: [
            { if: 'mentions:voter_education', then: 'condescension-probe' },
            { if: 'tone:humble', then: 'democracy-respect' }
          ],
          responseOptions: [
            {
              text: "Voters' judgment, always. My role is to present evidence clearly and let people decide. If I can't convince them, maybe I'm wrong or explaining poorly.",
              tone: 'humble',
              consequences: [
                { type: 'performance-impact', value: { authenticity: +20, humility: +15 }, description: 'Deeply democratic response' },
                { type: 'mood-change', value: 'impressed', description: 'Impressed by democratic humility' },
                { type: 'memory-update', value: 'democratic_humility', description: 'Respects voter sovereignty' }
              ],
              triggers: ['democratic-humility']
            },
            {
              text: "It depends on the issue. On technical matters like vaccine safety, expertise matters. On values questions like tax levels, voters decide.",
              tone: 'analytical',
              consequences: [
                { type: 'performance-impact', value: { wisdom: +10 }, description: 'Thoughtful distinction' }
              ],
              triggers: ['expertise-domains']
            },
            {
              text: "Part of leadership is helping people understand complex issues so they can make informed decisions.",
              tone: 'diplomatic',
              consequences: [
                { type: 'performance-impact', value: { engagement: +5 }, description: 'Reasonable but vague' }
              ],
              triggers: ['education-leadership']
            },
            {
              text: "Experts exist for a reason. Populism that ignores expertise leads to disasters like Brexit or COVID denialism.",
              tone: 'condescending',
              consequences: [
                { type: 'performance-impact', value: { authenticity: -15, arrogance: +10 }, description: 'Dismissive of democratic choice' },
                { type: 'mood-change', value: 'concerned', description: 'Worried about elitist attitude' }
              ],
              triggers: ['expert-arrogance']
            }
          ]
        },
        {
          id: 'publication-record',
          type: 'credibility-test',
          setup: "Looking at your publication record, most of your research has been in academic journals that policymakers probably don't read.",
          question: "How do we know your research has actually influenced real policy decisions?",
          interruptionTriggers: [
            {
              condition: 'mentions:citations OR mentions:peer_review',
              probability: 0.7,
              message: "Academic citations don't write laws. Show me where your work changed actual policy.",
              followUpAction: 'real-impact-demand'
            },
            {
              condition: 'word_count>90 AND not_mentioned:specific_policy',
              probability: 0.6,
              message: "Give me one specific policy that exists because of your research.",
              followUpAction: 'concrete-impact'
            }
          ],
          followUpRules: [
            { if: 'mentions:specific_policy_change', then: 'impact-validation' },
            { if: 'tone:defensive', then: 'relevance-challenge' }
          ],
          responseOptions: [
            {
              text: "You're right—most of my work stayed in academic circles. That's exactly why I'm running: to bridge that gap and make research actually useful for policy.",
              tone: 'honest',
              consequences: [
                { type: 'performance-impact', value: { authenticity: +20, self_awareness: +15 }, description: 'Admits limitation and shows motivation' },
                { type: 'memory-update', value: 'academic_isolation_awareness', description: 'Recognizes ivory tower problem' }
              ],
              triggers: ['honest-limitation']
            },
            {
              text: "My work on education inequality was cited in the parliamentary committee report that led to increased funding for disadvantaged schools.",
              tone: 'confident',
              consequences: [
                { type: 'performance-impact', value: { credibility: +15, confidence: +10 }, description: 'Concrete policy impact' }
              ],
              triggers: ['policy-impact']
            },
            {
              text: "Academic research builds the foundation of knowledge that eventually influences policy, even if not directly.",
              tone: 'defensive',
              consequences: [
                { type: 'performance-impact', value: { confidence: -5 }, description: 'Weak defense of relevance' }
              ],
              triggers: ['indirect-influence']
            },
            {
              text: "Research quality matters more than immediate policy application. Some insights take years to be recognized.",
              tone: 'academic',
              consequences: [
                { type: 'performance-impact', value: { engagement: -10 }, description: 'Sounds disconnected from practical concerns' },
                { type: 'mood-change', value: 'frustrated', description: 'Frustrated by academic mindset' }
              ],
              triggers: ['academic-disconnect']
            }
          ]
        },
        {
          id: 'complexity-communication',
          type: 'closer',
          setup: "Politics requires explaining complex issues to people with varying education levels and attention spans.",
          question: "How will you explain your policy positions without sounding like you're giving a lecture?",
          interruptionTriggers: [
            {
              condition: 'word_count>80',
              probability: 0.5,
              message: "You're doing it right now—you're giving me a lecture. Shorter answer.",
              followUpAction: 'communication-demo'
            },
            {
              condition: 'mentions:education_level OR mentions:dumbing_down',
              probability: 0.7,
              message: "There it is—you think people need things 'dumbed down' for them.",
              followUpAction: 'condescension-call'
            }
          ],
          followUpRules: [
            { if: 'tone:simple AND word_count<50', then: 'communication-success' },
            { if: 'tone:academic', then: 'lecture-failure' }
          ],
          responseOptions: [
            {
              text: "Tell stories. People understand stories better than statistics. Show how policies affect real families, not abstract numbers.",
              tone: 'confident',
              consequences: [
                { type: 'performance-impact', value: { communication: +15, authenticity: +10 }, description: 'Good communication strategy' },
                { type: 'memory-update', value: 'story_communication', description: 'Understands narrative power' }
              ],
              triggers: ['narrative-communication']
            },
            {
              text: "Listen first. Find out what people are worried about, then connect my knowledge to their concerns.",
              tone: 'humble',
              consequences: [
                { type: 'performance-impact', value: { empathy: +15, humility: +10 }, description: 'Audience-centered approach' }
              ],
              triggers: ['listening-first']
            },
            {
              text: "Use clear language and avoid jargon. Make sure I'm answering their questions, not the ones I want to answer.",
              tone: 'practical',
              consequences: [
                { type: 'performance-impact', value: { communication: +10 }, description: 'Basic communication principles' }
              ],
              triggers: ['clear-communication']
            },
            {
              text: "Complex problems require nuanced explanations. I won't oversimplify important issues just to make them more palatable.",
              tone: 'stuborn',
              consequences: [
                { type: 'performance-impact', value: { communication: -15, arrogance: +5 }, description: 'Refuses to adapt communication style' },
                { type: 'mood-change', value: 'concerned', description: 'Worried about ability to connect with voters' }
              ],
              triggers: ['communication-stubbornness']
            }
          ]
        }
      ]
    });

    // Environmental Activist - High Difficulty
    this.arcDefinitions.set('environmental-activist', {
      backgroundId: 'environmental-activist',
      difficulty: 'high',
      interviewerApproach: 'investigative',
      questionCount: 6,
      arc: [
        {
          id: 'activist-compromise',
          type: 'opener',
          setup: "You've spent years protesting government environmental policies.",
          question: "How can voters trust you to compromise when you've spent years saying compromise kills the planet?",
          interruptionTriggers: [
            {
              condition: 'evasion',
              probability: 0.7,
              message: "That's exactly the kind of political speak activists usually reject.",
              followUpAction: 'authenticity-challenge'
            }
          ],
          followUpRules: [
            { if: 'tone:aggressive', then: 'extremism-probe' },
            { if: 'tone:diplomatic', then: 'sellout-accusation' }
          ],
          responseOptions: [
            {
              text: "Some compromises move us forward, others move us backward. I'll know the difference.",
              tone: 'confident',
              consequences: [
                { type: 'performance-impact', value: { authenticity: +10 }, description: 'Principled flexibility' }
              ],
              triggers: ['principled-pragmatism']
            },
            {
              text: "The climate crisis is too urgent for the usual political games and half-measures.",
              tone: 'aggressive',
              consequences: [
                { type: 'mood-change', value: 'skeptical', description: 'Sounds uncompromising' }
              ],
              triggers: ['urgency-emphasis']
            },
            {
              text: "You're right to challenge that. I've learned that activists can achieve more from inside the system than outside it.",
              tone: 'reflective',
              consequences: [
                { type: 'performance-impact', value: { authenticity: +15, wisdom: +10 }, description: 'Shows growth and strategic thinking' },
                { type: 'memory-update', value: 'insider_strategy', description: 'Understands system change' }
              ],
              triggers: ['strategic-evolution']
            },
            {
              text: "I haven't changed my principles, but I've learned that getting 70% of what we need is better than getting 0%.",
              tone: 'pragmatic',
              consequences: [
                { type: 'performance-impact', value: { wisdom: +10 }, description: 'Pragmatic environmentalism' }
              ],
              triggers: ['pragmatic-environmentalism']
            }
          ]
        },
        {
          id: 'economic-transition',
          type: 'economic-challenge',
          setup: "The transition to green energy will cost thousands of jobs in traditional industries like fossil fuels and chemical processing.",
          question: "How do you tell a Shell refinery worker that their job needs to disappear to save the planet?",
          interruptionTriggers: [
            {
              condition: 'mentions:retraining OR mentions:just_transition',
              probability: 0.7,
              message: "Retraining programs—that's what every politician says. What if they don't want to retrain? What if they're 55 years old?",
              followUpAction: 'reality-check'
            },
            {
              condition: 'word_count>100 AND not_mentioned:specific_support',
              probability: 0.8,
              message: "Give me something concrete—what exactly would you offer this worker tomorrow?",
              followUpAction: 'specificity-demand'
            },
            {
              condition: 'tone:abstract',
              probability: 0.6,
              message: "Stop talking about 'workers' in general. This is about real people with mortgages and kids.",
              followUpAction: 'personalization-demand'
            }
          ],
          followUpRules: [
            { if: 'mentions:specific_compensation', then: 'funding-source' },
            { if: 'tone:dismissive', then: 'callousness-challenge' }
          ],
          responseOptions: [
            {
              text: "I'd tell them the truth: their industry is ending, but we won't abandon them. Full pension for anyone over 50, guaranteed income support during transition, and first priority for green infrastructure jobs.",
              tone: 'honest',
              consequences: [
                { type: 'performance-impact', value: { authenticity: +20, empathy: +15 }, description: 'Concrete, compassionate policy' },
                { type: 'memory-update', value: 'worker_support_plan', description: 'Detailed transition support' }
              ],
              triggers: ['honest-transition-plan']
            },
            {
              text: "I'd listen to them first. Many of these workers have transferable skills—maintenance, engineering, project management. We need those skills for renewable energy projects.",
              tone: 'empathetic',
              consequences: [
                { type: 'performance-impact', value: { empathy: +15, wisdom: +10 }, description: 'Recognizes worker value' }
              ],
              triggers: ['worker-value-recognition']
            },
            {
              text: "Change is hard, but staying in a dying industry is worse. The smart ones will adapt—we'll help those who want help.",
              tone: 'cold',
              consequences: [
                { type: 'performance-impact', value: { empathy: -15, authenticity: -10 }, description: 'Callous toward workers' },
                { type: 'mood-change', value: 'concerned', description: 'Worried about lack of compassion' }
              ],
              triggers: ['worker-dismissal']
            },
            {
              text: "We can't sacrifice the planet to save jobs in polluting industries. People will have to adjust to the new economy.",
              tone: 'ideological',
              consequences: [
                { type: 'performance-impact', value: { empathy: -20 }, description: 'Prioritizes ideology over people' },
                { type: 'mood-change', value: 'frustrated', description: 'Frustrated by ideological rigidity' }
              ],
              triggers: ['ideology-over-people']
            }
          ]
        },
        {
          id: 'radical-past-accountability',
          type: 'gotcha',
          setup: "In 2019, you were arrested for chaining yourself to construction equipment to stop the A27 highway expansion.",
          question: "You broke the law to stop legal government projects. Why should voters trust you to respect the rule of law as an MP?",
          interruptionTriggers: [
            {
              condition: 'mentions:civil_disobedience OR mentions:higher_law',
              probability: 0.8,
              message: "So you'll break laws you disagree with? What other laws might you ignore as an MP?",
              followUpAction: 'law-breaking-expansion'
            },
            {
              condition: 'mentions:regret OR mentions:shouldnt_have',
              probability: 0.9,
              message: "Really? You regret fighting for the environment? That sounds like you're just saying what's politically convenient.",
              followUpAction: 'authenticity-challenge'
            },
            {
              condition: 'tone:defensive',
              probability: 0.7,
              message: "You sound defensive. Do you think breaking the law was right or wrong?",
              followUpAction: 'moral-clarity-demand'
            }
          ],
          followUpRules: [
            { if: 'mentions:legal_change', then: 'system-change-approach' },
            { if: 'tone:unapologetic', then: 'radicalism-concern' }
          ],
          responseOptions: [
            {
              text: "I broke an unjust law to defend future generations. I'd do it again, but as an MP I'll work to change laws from within the system.",
              tone: 'unapologetic',
              consequences: [
                { type: 'performance-impact', value: { authenticity: +15, confidence: +10 }, description: 'Stands by principles' },
                { type: 'mood-change', value: 'concerned', description: 'Worried about future law-breaking' },
                { type: 'memory-update', value: 'unrepentant_activist', description: 'Will break laws for environment' }
              ],
              triggers: ['principled-law-breaking']
            },
            {
              text: "Civil disobedience has a long history in democracy—from suffragettes to civil rights. Sometimes breaking bad laws is necessary to expose their injustice.",
              tone: 'academic',
              consequences: [
                { type: 'performance-impact', value: { wisdom: +10 }, description: 'Historical perspective' }
              ],
              triggers: ['historical-justification']
            },
            {
              text: "I respect the rule of law, but I also believe in a higher moral law. MPs take an oath to serve the public good—sometimes that means challenging unjust policies.",
              tone: 'philosophical',
              consequences: [
                { type: 'performance-impact', value: { authenticity: +10 }, description: 'Moral reasoning' }
              ],
              triggers: ['moral-law-priority']
            },
            {
              text: "That was different—I was a private citizen then. As an MP, I'd work within legal channels to achieve the same goals.",
              tone: 'diplomatic',
              consequences: [
                { type: 'performance-impact', value: { authenticity: -5 }, description: 'Sounds like political convenience' }
              ],
              triggers: ['role-distinction']
            }
          ]
        },
        {
          id: 'corporate-funding-hypocrisy',
          type: 'aggressive-probe',
          setup: "Your campaign has received donations from renewable energy companies and green tech firms.",
          question: "You've criticized fossil fuel lobbying, but you're taking money from corporations that profit from environmental policies. How is that different?",
          interruptionTriggers: [
            {
              condition: 'mentions:different_because OR mentions:clean_energy',
              probability: 0.8,
              message: "Money is money—these companies want government subsidies and contracts just like oil companies do.",
              followUpAction: 'profit-motive-challenge'
            },
            {
              condition: 'word_count>90 AND not_mentioned:specific_difference',
              probability: 0.7,
              message: "What's the actual difference? Both are corporations trying to influence policy for profit.",
              followUpAction: 'moral-equivalence-challenge'
            }
          ],
          followUpRules: [
            { if: 'mentions:transparency', then: 'disclosure-follow' },
            { if: 'tone:defensive', then: 'corruption-perception' }
          ],
          responseOptions: [
            {
              text: "You're absolutely right to question that. I shouldn't take money from any corporations that benefit from policies I support. I'll return those donations.",
              tone: 'honest',
              consequences: [
                { type: 'performance-impact', value: { authenticity: +25, integrity: +20 }, description: 'Takes immediate corrective action' },
                { type: 'mood-change', value: 'surprised', description: 'Shocked by immediate accountability' },
                { type: 'memory-update', value: 'donation_return', description: 'Commits to returning corporate money' }
              ],
              triggers: ['immediate-accountability']
            },
            {
              text: "There's a moral difference between supporting companies that help the planet versus those that destroy it, but I understand your concern about the appearance of influence.",
              tone: 'thoughtful',
              consequences: [
                { type: 'performance-impact', value: { authenticity: +10, wisdom: +5 }, description: 'Acknowledges appearance concern' }
              ],
              triggers: ['moral-distinction']
            },
            {
              text: "These companies support environmental protection—fossil fuel companies fight it. The money comes from aligned values, not corporate capture.",
              tone: 'defensive',
              consequences: [
                { type: 'performance-impact', value: { authenticity: -10 }, description: 'Doesn\'t address the influence concern' }
              ],
              triggers: ['values-deflection']
            },
            {
              text: "All political campaigns need funding. At least I'm transparent about my donors, unlike politicians who hide their fossil fuel connections.",
              tone: 'deflective',
              consequences: [
                { type: 'performance-impact', value: { authenticity: -15 }, description: 'Deflects rather than addressing criticism' },
                { type: 'mood-change', value: 'frustrated', description: 'Annoyed by whataboutism' }
              ],
              triggers: ['whataboutism']
            }
          ]
        },
        {
          id: 'lifestyle-hypocrisy',
          type: 'personal-attack',
          setup: "I looked at your social media. You flew to climate conferences in Berlin and Copenhagen last year.",
          question: "How do you justify flying for climate activism while telling everyone else to reduce their carbon footprint?",
          interruptionTriggers: [
            {
              condition: 'mentions:offset OR mentions:necessary',
              probability: 0.8,
              message: "Carbon offsets—that's exactly the kind of greenwashing you criticize when corporations do it.",
              followUpAction: 'offset-hypocrisy'
            },
            {
              condition: 'mentions:train OR mentions:alternative',
              probability: 0.6,
              message: "The train to Copenhagen takes 14 hours. You could have done those meetings by video call.",
              followUpAction: 'convenience-challenge'
            },
            {
              condition: 'tone:defensive',
              probability: 0.7,
              message: "You sound like every politician caught in hypocrisy. Do as I say, not as I do?",
              followUpAction: 'hypocrisy-call'
            }
          ],
          followUpRules: [
            { if: 'mentions:mistake', then: 'accountability-follow' },
            { if: 'tone:justification', then: 'double-standard-probe' }
          ],
          responseOptions: [
            {
              text: "You caught me. I was wrong to fly when I could have taken trains or participated virtually. I've stopped flying and I should have stopped sooner.",
              tone: 'accountable',
              consequences: [
                { type: 'performance-impact', value: { authenticity: +20, humility: +15 }, description: 'Takes full responsibility' },
                { type: 'mood-change', value: 'impressed', description: 'Impressed by accountability' },
                { type: 'memory-update', value: 'admits_hypocrisy', description: 'Acknowledges past inconsistency' }
              ],
              triggers: ['full-accountability']
            },
            {
              text: "Those were important conferences for building international climate coalitions. But you're right—I should practice what I preach. I've changed my travel habits since then.",
              tone: 'reflective',
              consequences: [
                { type: 'performance-impact', value: { authenticity: +10, growth: +5 }, description: 'Shows learning' }
              ],
              triggers: ['learning-admission']
            },
            {
              text: "Sometimes you have to use the system to change the system. Those meetings were crucial for advancing climate policy.",
              tone: 'defensive',
              consequences: [
                { type: 'performance-impact', value: { authenticity: -10 }, description: 'Sounds hypocritical' }
              ],
              triggers: ['ends-justify-means']
            },
            {
              text: "My personal carbon footprint is tiny compared to corporate emissions. Focusing on individual behavior distracts from systemic change.",
              tone: 'deflective',
              consequences: [
                { type: 'performance-impact', value: { authenticity: -15, leadership: -10 }, description: 'Refuses personal responsibility' },
                { type: 'mood-change', value: 'frustrated', description: 'Annoyed by deflection' }
              ],
              triggers: ['personal-responsibility-dodge']
            }
          ]
        },
        {
          id: 'extremist-association',
          type: 'closer',
          setup: "Some environmental groups you've worked with have been linked to more radical actions—pipeline sabotage, property destruction.",
          question: "Where do you draw the line? What environmental tactics are you willing to condemn?",
          interruptionTriggers: [
            {
              condition: 'mentions:violence OR mentions:property_damage',
              probability: 0.6,
              message: "But you didn't condemn them clearly. Are you afraid of alienating your radical supporters?",
              followUpAction: 'condemnation-clarity'
            },
            {
              condition: 'word_count>100 AND not_mentioned:specific_condemnation',
              probability: 0.8,
              message: "I need a clear answer—do you condemn property destruction for environmental causes, yes or no?",
              followUpAction: 'binary-demand'
            }
          ],
          followUpRules: [
            { if: 'mentions:clear_condemnation', then: 'movement-alienation' },
            { if: 'tone:equivocal', then: 'extremism-concern' }
          ],
          responseOptions: [
            {
              text: "I condemn all violence and property destruction, period. There are no exceptions. Legal protest and political engagement are the only legitimate tactics.",
              tone: 'clear',
              consequences: [
                { type: 'performance-impact', value: { leadership: +15, clarity: +20 }, description: 'Clear moral line' },
                { type: 'memory-update', value: 'condemns_extremism', description: 'Clearly rejects radical tactics' }
              ],
              triggers: ['clear-condemnation']
            },
            {
              text: "I don't support property destruction, but I understand the desperation that drives people to extreme actions when governments ignore the climate crisis.",
              tone: 'sympathetic',
              consequences: [
                { type: 'performance-impact', value: { empathy: +5, clarity: -10 }, description: 'Sympathizes with extremists' },
                { type: 'mood-change', value: 'concerned', description: 'Worried about tacit support for extremism' }
              ],
              triggers: ['extremist-sympathy']
            },
            {
              text: "Violence against people is wrong, but property destruction of environmentally harmful infrastructure is a different moral category.",
              tone: 'analytical',
              consequences: [
                { type: 'performance-impact', value: { clarity: -15 }, description: 'Refuses to condemn property destruction' },
                { type: 'mood-change', value: 'alarmed', description: 'Alarmed by endorsement of destruction' }
              ],
              triggers: ['property-destruction-acceptance']
            },
            {
              text: "Every movement has its radicals. I focus on building coalitions, not policing other activists' tactics.",
              tone: 'evasive',
              consequences: [
                { type: 'performance-impact', value: { leadership: -15, clarity: -10 }, description: 'Avoids taking moral stance' }
              ],
              triggers: ['moral-abdication']
            }
          ]
        }
      ]
    });

    // Continue with remaining backgrounds...
    this.initializeFinalBackgrounds();
  }

  /**
   * Initialize the final set of background question arcs
   */
  private static initializeFinalBackgrounds(): void {
    // Tech Entrepreneur - Medium Difficulty
    this.arcDefinitions.set('tech-entrepreneur', {
      backgroundId: 'tech-entrepreneur',
      difficulty: 'medium',
      interviewerApproach: 'professional',
      questionCount: 5,
      arc: [
        {
          id: 'disruption-politics',
          type: 'opener',
          setup: "Your startup revolutionized digital payments in the Netherlands.",
          question: "You disrupted finance—do you plan to 'disrupt' Dutch politics too?",
          interruptionTriggers: [
            {
              condition: 'word_count>80',
              probability: 0.4,
              message: "Let me interrupt—politics isn't a startup. What specific changes would you make?",
              followUpAction: 'specificity-demand'
            }
          ],
          followUpRules: [
            { if: 'tone:confident', then: 'implementation-reality' },
            { if: 'topic:technology', then: 'tech-policy-probe' }
          ],
          responseOptions: [
            {
              text: "Politics needs innovation, but it also needs stability. I'd bring both perspectives.",
              tone: 'diplomatic',
              consequences: [
                { type: 'performance-impact', value: { authenticity: +8 }, description: 'Balanced innovation approach' }
              ],
              triggers: ['balanced-innovation']
            },
            {
              text: "Absolutely. Government is broken and needs to be rebuilt from the ground up.",
              tone: 'aggressive',
              consequences: [
                { type: 'mood-change', value: 'skeptical', description: 'Sounds naive about government' }
              ],
              triggers: ['government-disruption']
            },
            {
              text: "Government could learn from startup efficiency, but democracy isn't a business. I'd improve processes while respecting institutions.",
              tone: 'thoughtful',
              consequences: [
                { type: 'performance-impact', value: { wisdom: +10, authenticity: +5 }, description: 'Shows respect for democratic process' }
              ],
              triggers: ['respectful-improvement']
            },
            {
              text: "Politics moves slowly for good reasons. I'm here to build bridges between tech innovation and democratic governance.",
              tone: 'diplomatic',
              consequences: [
                { type: 'performance-impact', value: { authenticity: +5 }, description: 'Moderate innovation approach' }
              ],
              triggers: ['bridge-building']
            }
          ]
        },
        {
          id: 'wealth-tax-policy',
          type: 'policy-challenge',
          setup: "Your company was valued at €120 million when you sold it. You're now worth significantly more than most voters.",
          question: "Would you support higher taxes on wealth and capital gains, even if it means paying significantly more yourself?",
          interruptionTriggers: [
            {
              condition: 'mentions:fair_share OR mentions:social_responsibility',
              probability: 0.6,
              message: "That's easy to say—give me a specific number. What tax rate would you support on capital gains?",
              followUpAction: 'specificity-demand'
            },
            {
              condition: 'mentions:already_pay OR mentions:current_taxes',
              probability: 0.7,
              message: "But you have ways to minimize taxes that regular workers don't. What about closing those loopholes?",
              followUpAction: 'loophole-challenge'
            },
            {
              condition: 'word_count>100 AND not_mentioned:specific_rate',
              probability: 0.8,
              message: "Stop dancing around it—what specific tax rate should wealthy people like you pay?",
              followUpAction: 'rate-demand'
            }
          ],
          followUpRules: [
            { if: 'mentions:specific_percentage', then: 'implementation-follow' },
            { if: 'tone:evasive', then: 'self-interest-accusation' }
          ],
          responseOptions: [
            {
              text: "Yes, absolutely. I'd support a 30% capital gains tax and 2% annual wealth tax on assets over €1 million. I'd pay more, but society would benefit.",
              tone: 'honest',
              consequences: [
                { type: 'performance-impact', value: { authenticity: +20, courage: +15 }, description: 'Specific, costly commitment' },
                { type: 'memory-update', value: 'wealth_tax_support', description: 'Commits to higher personal taxes' }
              ],
              triggers: ['wealth-tax-commitment']
            },
            {
              text: "I'd support higher rates, but we need to be careful not to drive investment and innovation out of the Netherlands.",
              tone: 'cautious',
              consequences: [
                { type: 'performance-impact', value: { authenticity: +5 }, description: 'Qualified support' }
              ],
              triggers: ['qualified-support']
            },
            {
              text: "I already pay my fair share through income tax and corporate taxes. The focus should be on tax efficiency, not higher rates.",
              tone: 'defensive',
              consequences: [
                { type: 'performance-impact', value: { authenticity: -10 }, description: 'Sounds self-interested' },
                { type: 'mood-change', value: 'skeptical', description: 'Skeptical of wealthy person opposing wealth taxes' }
              ],
              triggers: ['self-interest']
            },
            {
              text: "Wealth taxes are complicated—we need to study the impact on economic growth and competitiveness first.",
              tone: 'evasive',
              consequences: [
                { type: 'performance-impact', value: { confidence: -15 }, description: 'Avoids taking position' },
                { type: 'mood-change', value: 'frustrated', description: 'Frustrated by non-answer' }
              ],
              triggers: ['study-deflection']
            }
          ]
        },
        {
          id: 'tech-regulation-conflict',
          type: 'conflict-of-interest',
          setup: "Your industry expertise is in fintech and digital payments, areas facing increased EU regulation.",
          question: "How can voters trust you to regulate the tech industry when your personal wealth comes from avoiding those same regulations?",
          interruptionTriggers: [
            {
              condition: 'mentions:transparency OR mentions:disclosure',
              probability: 0.7,
              message: "Disclosure isn't enough—you'll still have financial incentives to protect your industry.",
              followUpAction: 'conflict-persistence'
            },
            {
              condition: 'mentions:different_companies OR mentions:not_my_sector',
              probability: 0.8,
              message: "Come on—tech regulation affects the entire ecosystem. Your wealth depends on light regulation.",
              followUpAction: 'ecosystem-challenge'
            },
            {
              condition: 'word_count>90 AND not_mentioned:specific_solution',
              probability: 0.6,
              message: "What's your specific solution to this conflict of interest?",
              followUpAction: 'solution-demand'
            }
          ],
          followUpRules: [
            { if: 'mentions:recusal', then: 'recusal-practicality' },
            { if: 'tone:dismissive', then: 'integrity-challenge' }
          ],
          responseOptions: [
            {
              text: "I'll recuse myself from tech regulation votes and put my assets in a blind trust. Democracy requires that level of commitment.",
              tone: 'principled',
              consequences: [
                { type: 'performance-impact', value: { integrity: +20, authenticity: +15 }, description: 'Sacrifices personal interest for public service' },
                { type: 'memory-update', value: 'blind_trust_commitment', description: 'Commits to blind trust' }
              ],
              triggers: ['blind-trust-commitment']
            },
            {
              text: "My insider knowledge actually helps me understand what regulations will work versus what sounds good but fails in practice.",
              tone: 'confident',
              consequences: [
                { type: 'performance-impact', value: { confidence: +5, authenticity: -5 }, description: 'Justifies conflict as expertise' }
              ],
              triggers: ['expertise-justification']
            },
            {
              text: "I'll be transparent about potential conflicts and let voters judge whether my positions serve the public interest.",
              tone: 'diplomatic',
              consequences: [
                { type: 'performance-impact', value: { transparency: +5 }, description: 'Minimal conflict resolution' }
              ],
              triggers: ['transparency-only']
            },
            {
              text: "Every MP brings their background and interests—at least I'm honest about mine.",
              tone: 'deflective',
              consequences: [
                { type: 'performance-impact', value: { integrity: -10 }, description: 'Normalizes conflicts of interest' },
                { type: 'mood-change', value: 'concerned', description: 'Concerned about ethical standards' }
              ],
              triggers: ['conflict-normalization']
            }
          ]
        },
        {
          id: 'startup-failure-lessons',
          type: 'experience-probe',
          setup: "Before your successful exit, you had two failed startups that laid off employees and lost investor money.",
          question: "What did those failures teach you about leadership that's relevant to governing?",
          interruptionTriggers: [
            {
              condition: 'mentions:learning_experience OR mentions:character_building',
              probability: 0.6,
              message: "That's what every failed entrepreneur says. What specifically did you do wrong?",
              followUpAction: 'failure-specificity'
            },
            {
              condition: 'word_count>100 AND not_mentioned:specific_mistake',
              probability: 0.7,
              message: "Give me one specific mistake you made and how it changed your approach.",
              followUpAction: 'concrete-mistake'
            },
            {
              condition: 'tone:defensive',
              probability: 0.5,
              message: "You sound defensive about failure. How do you handle criticism?",
              followUpAction: 'criticism-tolerance'
            }
          ],
          followUpRules: [
            { if: 'mentions:employee_impact', then: 'empathy-follow' },
            { if: 'tone:dismissive', then: 'accountability-challenge' }
          ],
          responseOptions: [
            {
              text: "I learned that leadership means taking responsibility for other people's livelihoods. When I had to lay off 12 people, I realized decisions affect real families—that's crucial for politics.",
              tone: 'reflective',
              consequences: [
                { type: 'performance-impact', value: { empathy: +15, wisdom: +10, authenticity: +10 }, description: 'Deep lesson about responsibility' },
                { type: 'memory-update', value: 'learned_responsibility', description: 'Understands impact on people' }
              ],
              triggers: ['responsibility-lesson']
            },
            {
              text: "Failure taught me resilience and adaptability. In government, you need to pivot when policies aren't working instead of doubling down.",
              tone: 'analytical',
              consequences: [
                { type: 'performance-impact', value: { wisdom: +10 }, description: 'Good governance insight' }
              ],
              triggers: ['adaptability-lesson']
            },
            {
              text: "The biggest lesson was about stakeholder communication—being honest early when things go wrong, rather than hoping they'll improve.",
              tone: 'honest',
              consequences: [
                { type: 'performance-impact', value: { authenticity: +10 }, description: 'Transparency lesson' }
              ],
              triggers: ['transparency-lesson']
            },
            {
              text: "Failure is just part of the innovation process. You learn, iterate, and move forward—same with policy.",
              tone: 'casual',
              consequences: [
                { type: 'performance-impact', value: { empathy: -5 }, description: 'Sounds disconnected from human impact' }
              ],
              triggers: ['failure-minimization']
            }
          ]
        },
        {
          id: 'digital-divide-inequality',
          type: 'closer',
          setup: "Your tech solutions often require smartphones, internet access, and digital literacy that not everyone has.",
          question: "How do you ensure your technology-focused policies don't leave behind older voters and those with limited digital access?",
          interruptionTriggers: [
            {
              condition: 'mentions:digital_divide OR mentions:training',
              probability: 0.5,
              message: "Digital training—how is that different from saying 'let them learn to code'?",
              followUpAction: 'privilege-check'
            },
            {
              condition: 'word_count>90 AND not_mentioned:specific_accommodation',
              probability: 0.6,
              message: "What specific accommodations would you make for people who can't or won't use digital services?",
              followUpAction: 'accommodation-specificity'
            }
          ],
          followUpRules: [
            { if: 'mentions:offline_alternatives', then: 'implementation-practicality' },
            { if: 'tone:dismissive', then: 'elitism-concern' }
          ],
          responseOptions: [
            {
              text: "Every digital service must have an offline alternative. Phone support, physical offices, paper forms—technology should add options, not replace human service.",
              tone: 'inclusive',
              consequences: [
                { type: 'performance-impact', value: { empathy: +15, practicality: +10 }, description: 'Comprehensive inclusion approach' },
                { type: 'memory-update', value: 'offline_alternatives', description: 'Commits to non-digital options' }
              ],
              triggers: ['digital-inclusion']
            },
            {
              text: "We need massive investment in digital literacy programs and public computer access, especially in libraries and community centers.",
              tone: 'determined',
              consequences: [
                { type: 'performance-impact', value: { empathy: +10 }, description: 'Addresses access barriers' }
              ],
              triggers: ['access-investment']
            },
            {
              text: "My policies would focus on universal broadband and affordable devices, making sure everyone can participate in the digital economy.",
              tone: 'policy-focused',
              consequences: [
                { type: 'performance-impact', value: { confidence: +5 }, description: 'Infrastructure approach' }
              ],
              triggers: ['infrastructure-focus']
            },
            {
              text: "The market will solve this as technology gets cheaper and more user-friendly. Government intervention often slows innovation.",
              tone: 'market-oriented',
              consequences: [
                { type: 'performance-impact', value: { empathy: -10 }, description: 'Market-first approach ignores current exclusion' },
                { type: 'mood-change', value: 'concerned', description: 'Worried about leaving people behind' }
              ],
              triggers: ['market-solution']
            }
          ]
        }
      ]
    });

    // Former Journalist - High Difficulty
    this.arcDefinitions.set('former-journalist', {
      backgroundId: 'former-journalist',
      difficulty: 'high',
      interviewerApproach: 'investigative',
      questionCount: 6,
      arc: [
        {
          id: 'media-relationships',
          type: 'opener',
          setup: "You spent 12 years covering Dutch politics for national media.",
          question: "You know all our tricks. How do we know you won't just become another politician who manipulates the media?",
          interruptionTriggers: [
            {
              condition: 'deflection',
              probability: 0.9,
              message: "See? You're already spinning. This is exactly what voters fear.",
              followUpAction: 'spin-accusation'
            }
          ],
          followUpRules: [
            { if: 'tone:evasive', then: 'transparency-challenge' },
            { if: 'tone:confident', then: 'insider-knowledge-probe' }
          ],
          responseOptions: [
            {
              text: "Knowing how media works means I can communicate directly with voters, not through spin.",
              tone: 'confident',
              consequences: [
                { type: 'performance-impact', value: { authenticity: +10 }, description: 'Uses insider knowledge positively' }
              ],
              triggers: ['direct-communication']
            },
            {
              text: "Journalism taught me to seek truth and hold power accountable—including my own power.",
              tone: 'diplomatic',
              consequences: [
                { type: 'performance-impact', value: { authenticity: +8 }, description: 'Emphasizes accountability' }
              ],
              triggers: ['accountability-focus']
            },
            {
              text: "Look, I've been on both sides of these interviews. I know when politicians are being honest and when they're not—voters deserve that honesty.",
              tone: 'honest',
              consequences: [
                { type: 'performance-impact', value: { authenticity: +15, confidence: +10 }, description: 'Meta-commentary on interview authenticity' },
                { type: 'memory-update', value: 'interview_expertise', description: 'Claims expertise in detecting honesty' }
              ],
              triggers: ['interview-expertise']
            },
            {
              text: "The media doesn't need manipulation—it needs politicians who actually answer questions instead of deflecting.",
              tone: 'aggressive',
              consequences: [
                { type: 'performance-impact', value: { confidence: +5 }, description: 'Criticizes political evasion' },
                { type: 'mood-change', value: 'impressed', description: 'Appreciates direct criticism of political class' }
              ],
              triggers: ['anti-political-class']
            }
          ]
        },
        {
          id: 'insider-information-ethics',
          type: 'gotcha',
          setup: "During your journalism career, you had access to confidential sources and off-the-record information about current politicians.",
          question: "You know things about your potential colleagues that the public doesn't. How do we know you won't use that information for political advantage?",
          interruptionTriggers: [
            {
              condition: 'mentions:journalistic_ethics OR mentions:confidentiality',
              probability: 0.8,
              message: "Ethics are nice in theory—but you're asking for power over the same people you used to investigate. That's a massive conflict.",
              followUpAction: 'power-conflict'
            },
            {
              condition: 'word_count>100 AND not_mentioned:specific_commitment',
              probability: 0.7,
              message: "What specific safeguards will you put in place to prevent using insider information?",
              followUpAction: 'safeguard-demand'
            },
            {
              condition: 'tone:dismissive',
              probability: 0.9,
              message: "You're dismissing a legitimate concern. Voters have a right to worry about information being weaponized.",
              followUpAction: 'concern-validation'
            }
          ],
          followUpRules: [
            { if: 'mentions:specific_protocol', then: 'protocol-practicality' },
            { if: 'tone:defensive', then: 'trust-challenge' }
          ],
          responseOptions: [
            {
              text: "I'll never use confidential information from my journalism career in politics. I'm putting that commitment in writing and making it legally binding.",
              tone: 'principled',
              consequences: [
                { type: 'performance-impact', value: { integrity: +25, authenticity: +20 }, description: 'Strongest possible ethical commitment' },
                { type: 'memory-update', value: 'legal_commitment', description: 'Pledges legal constraints on information use' }
              ],
              triggers: ['legal-binding-commitment']
            },
            {
              text: "Journalistic ethics run deeper than politics. I protected sources for 12 years—I'm not going to start breaking that trust now.",
              tone: 'confident',
              consequences: [
                { type: 'performance-impact', value: { integrity: +15 }, description: 'Appeals to journalistic ethical training' }
              ],
              triggers: ['journalistic-ethics']
            },
            {
              text: "That information belongs to the public, not to me personally. If it's relevant to governance, it should be reported, not used as leverage.",
              tone: 'idealistic',
              consequences: [
                { type: 'performance-impact', value: { integrity: +10 }, description: 'Public interest perspective' }
              ],
              triggers: ['public-interest']
            },
            {
              text: "Every politician has relationships and information they don't share publicly. This isn't different from any other background.",
              tone: 'deflective',
              consequences: [
                { type: 'performance-impact', value: { integrity: -15 }, description: 'Normalizes potential information abuse' },
                { type: 'mood-change', value: 'concerned', description: 'Worried about casual attitude toward ethical concerns' }
              ],
              triggers: ['ethical-normalization']
            }
          ]
        },
        {
          id: 'media-bias-accountability',
          type: 'aggressive-probe',
          setup: "Your reporting consistently favored left-wing parties and was critical of business-friendly policies.",
          question: "Your articles show clear political bias. How can you claim to represent all voters when your journalism reveals your predetermined agenda?",
          interruptionTriggers: [
            {
              condition: 'mentions:objective_journalism OR mentions:no_bias',
              probability: 0.9,
              message: "Come on—I can quote your headlines. 'Corporate Tax Cuts: Gift to the Wealthy' and 'Green Transition: Hope for Working Families.' That's advocacy, not journalism.",
              followUpAction: 'headline-evidence'
            },
            {
              condition: 'mentions:truth_has_bias OR mentions:facts_lean_left',
              probability: 0.8,
              message: "There it is—you think your political views are just 'facts.' That's exactly the problem voters have with media elite.",
              followUpAction: 'elitism-accusation'
            },
            {
              condition: 'word_count>90 AND not_mentioned:specific_examples',
              probability: 0.7,
              message: "Address the specific bias in your reporting—don't give me media theory.",
              followUpAction: 'specific-bias-examples'
            }
          ],
          followUpRules: [
            { if: 'mentions:bias_acknowledgment', then: 'change-commitment' },
            { if: 'tone:defensive', then: 'ideology-rigidity' }
          ],
          responseOptions: [
            {
              text: "You're right—my reporting did have a perspective, and I should acknowledge that. As a politician, I'll represent all constituents, not just those who share my views.",
              tone: 'accountable',
              consequences: [
                { type: 'performance-impact', value: { authenticity: +20, humility: +15 }, description: 'Acknowledges bias and commits to broader representation' },
                { type: 'memory-update', value: 'admits_bias', description: 'Accepts criticism of journalistic bias' }
              ],
              triggers: ['bias-accountability']
            },
            {
              text: "I reported on policy impacts—if that seemed to favor certain parties, maybe it's because their policies had better outcomes for working people.",
              tone: 'defensive',
              consequences: [
                { type: 'performance-impact', value: { authenticity: -10 }, description: 'Justifies bias as truth-telling' },
                { type: 'mood-change', value: 'frustrated', description: 'Frustrated by continued bias justification' }
              ],
              triggers: ['bias-justification']
            },
            {
              text: "Good journalism holds power accountable. If my reporting made some people uncomfortable, that means it was doing its job.",
              tone: 'confrontational',
              consequences: [
                { type: 'performance-impact', value: { confidence: +5, authenticity: -5 }, description: 'Confrontational but avoids bias question' }
              ],
              triggers: ['accountability-deflection']
            },
            {
              text: "I followed the facts wherever they led. If you want to call fact-based reporting 'bias,' that says more about your agenda than mine.",
              tone: 'aggressive',
              consequences: [
                { type: 'performance-impact', value: { authenticity: -15, arrogance: +10 }, description: 'Dismissive and condescending' },
                { type: 'mood-change', value: 'frustrated', description: 'Annoyed by intellectual arrogance' }
              ],
              triggers: ['facts-defense-arrogance']
            }
          ]
        },
        {
          id: 'press-relationships-conflict',
          type: 'conflict-probe',
          setup: "You have personal relationships with journalists who will be covering your political career.",
          question: "Your former colleagues will be writing about your policies and scandals. Won't they go easy on you to protect those relationships?",
          interruptionTriggers: [
            {
              condition: 'mentions:professional_standards OR mentions:journalistic_integrity',
              probability: 0.7,
              message: "Professional standards haven't stopped cozy relationships before. Look at how differently media treats politicians they like.",
              followUpAction: 'favoritism-evidence'
            },
            {
              condition: 'mentions:tough_coverage OR mentions:no_special_treatment',
              probability: 0.8,
              message: "Really? When's the last time you saw a journalist aggressively challenge someone they used to work with?",
              followUpAction: 'colleague-protection'
            },
            {
              condition: 'word_count>90 AND not_mentioned:specific_solution',
              probability: 0.6,
              message: "What's your specific plan to ensure fair coverage despite personal relationships?",
              followUpAction: 'solution-specificity'
            }
          ],
          followUpRules: [
            { if: 'mentions:recusal_request', then: 'enforcement-mechanism' },
            { if: 'tone:naive', then: 'realism-check' }
          ],
          responseOptions: [
            {
              text: "I'll ask former colleagues to recuse themselves from covering me directly. If they won't, I'll call it out publicly—friendship shouldn't compromise journalism.",
              tone: 'principled',
              consequences: [
                { type: 'performance-impact', value: { integrity: +15, courage: +10 }, description: 'Willing to challenge media relationships' },
                { type: 'memory-update', value: 'media_recusal_request', description: 'Will request journalist recusals' }
              ],
              triggers: ['media-recusal-commitment']
            },
            {
              text: "Actually, journalists often overcompensate by being harder on people they know personally. I might get tougher coverage, not easier.",
              tone: 'analytical',
              consequences: [
                { type: 'performance-impact', value: { wisdom: +10 }, description: 'Understands media psychology' }
              ],
              triggers: ['overcompensation-theory']
            },
            {
              text: "Good journalists separate personal relationships from professional duties. I trust my former colleagues to maintain those standards.",
              tone: 'trusting',
              consequences: [
                { type: 'performance-impact', value: { confidence: +5, naivety: +5 }, description: 'Perhaps overly trusting of media ethics' }
              ],
              triggers: ['media-trust']
            },
            {
              text: "The media establishment protects its own—this is exactly why voters don't trust journalists or politicians.",
              tone: 'cynical',
              consequences: [
                { type: 'performance-impact', value: { authenticity: +5, negativity: +10 }, description: 'Cynical view of media-political relationships' },
                { type: 'mood-change', value: 'surprised', description: 'Surprised by cynicism toward former profession' }
              ],
              triggers: ['media-cynicism']
            }
          ]
        },
        {
          id: 'source-protection-politics',
          type: 'ethical-challenge',
          setup: "As a journalist, you promised confidentiality to sources who may have broken laws or violated ethics to give you information.",
          question: "As a politician, you'll be expected to cooperate with investigations and uphold the rule of law. What happens when those conflict?",
          interruptionTriggers: [
            {
              condition: 'mentions:case_by_case OR mentions:depends',
              probability: 0.8,
              message: "That's not an answer—either you keep your promises to sources or you don't. Which is it?",
              followUpAction: 'binary-choice-demand'
            },
            {
              condition: 'word_count>100 AND not_mentioned:specific_scenario',
              probability: 0.7,
              message: "Give me a specific scenario—what if a source gave you evidence of corruption but breaking confidentiality would solve the crime?",
              followUpAction: 'scenario-specificity'
            },
            {
              condition: 'tone:legalistic',
              probability: 0.6,
              message: "Stop hiding behind legal language. This is about personal integrity and conflicting loyalties.",
              followUpAction: 'integrity-focus'
            }
          ],
          followUpRules: [
            { if: 'mentions:sources_first', then: 'democracy-conflict' },
            { if: 'mentions:law_first', then: 'promise-breaking' }
          ],
          responseOptions: [
            {
              text: "I would honor my promises to sources, even as a politician. Breaking those commitments would destroy trust in journalism and democracy.",
              tone: 'principled',
              consequences: [
                { type: 'performance-impact', value: { integrity: +20, consistency: +15 }, description: 'Prioritizes personal commitments over political convenience' },
                { type: 'memory-update', value: 'source_protection_priority', description: 'Will protect sources over political obligations' }
              ],
              triggers: ['source-protection-commitment']
            },
            {
              text: "As a politician, my duty to the law and democratic institutions would override previous commitments. The role demands that sacrifice.",
              tone: 'duty-bound',
              consequences: [
                { type: 'performance-impact', value: { leadership: +10, consistency: -10 }, description: 'Prioritizes political duty over personal promises' }
              ],
              triggers: ['political-duty-priority']
            },
            {
              text: "I'd seek legal counsel to find a way to honor both obligations—there's usually a path that respects both journalism and law.",
              tone: 'diplomatic',
              consequences: [
                { type: 'performance-impact', value: { wisdom: +5 }, description: 'Seeks compromise solution' }
              ],
              triggers: ['compromise-seeking']
            },
            {
              text: "That's a hypothetical bridge I'll cross if I come to it. There's no point in pre-committing to complex ethical scenarios.",
              tone: 'evasive',
              consequences: [
                { type: 'performance-impact', value: { confidence: -15 }, description: 'Avoids taking ethical stance' },
                { type: 'mood-change', value: 'frustrated', description: 'Frustrated by ethical evasion' }
              ],
              triggers: ['ethical-evasion']
            }
          ]
        },
        {
          id: 'media-elite-disconnect',
          type: 'closer',
          setup: "You've spent your career in Amsterdam and The Hague media circles, interviewing politicians and attending policy events.",
          question: "How do you convince voters outside the Randstad that you understand their lives when you've lived in the media-political bubble for over a decade?",
          interruptionTriggers: [
            {
              condition: 'mentions:traveled_country OR mentions:reported_everywhere',
              probability: 0.7,
              message: "Reporting trips aren't the same as living there. You always went back to your Amsterdam apartment and journalist friends.",
              followUpAction: 'tourist-journalist'
            },
            {
              condition: 'word_count>100 AND not_mentioned:specific_connection',
              probability: 0.6,
              message: "Give me one specific way you understand rural or working-class life that's not from an article you wrote.",
              followUpAction: 'personal-connection'
            },
            {
              condition: 'tone:defensive',
              probability: 0.8,
              message: "You're getting defensive—that suggests you know this is a real problem.",
              followUpAction: 'bubble-admission'
            }
          ],
          followUpRules: [
            { if: 'mentions:personal_background', then: 'authenticity-test' },
            { if: 'tone:elitist', then: 'disconnect-confirmation' }
          ],
          responseOptions: [
            {
              text: "You're absolutely right—I have lived in a bubble, and I need to be honest about that. I grew up in Groningen, but I haven't lived that life for years. I have to earn back that connection.",
              tone: 'humble',
              consequences: [
                { type: 'performance-impact', value: { authenticity: +25, humility: +20 }, description: 'Honest admission of elite disconnect' },
                { type: 'mood-change', value: 'impressed', description: 'Impressed by rare political honesty about privilege' },
                { type: 'memory-update', value: 'admits_bubble', description: 'Acknowledges living in political-media bubble' }
              ],
              triggers: ['bubble-acknowledgment']
            },
            {
              text: "My job was to tell those stories—I interviewed farmers, factory workers, teachers. I may not live their daily reality, but I understand their concerns.",
              tone: 'confident',
              consequences: [
                { type: 'performance-impact', value: { authenticity: +5 }, description: 'Professional connection to working people' }
              ],
              triggers: ['professional-understanding']
            },
            {
              text: "I grew up in a working-class family in Groningen. Education and career may have changed my circumstances, but not my values.",
              tone: 'defensive',
              consequences: [
                { type: 'performance-impact', value: { authenticity: +5, consistency: -5 }, description: 'Claims working-class roots but sounds defensive' }
              ],
              triggers: ['roots-defense']
            },
            {
              text: "Geography doesn't determine understanding—plenty of politicians from small towns don't represent working people either.",
              tone: 'dismissive',
              consequences: [
                { type: 'performance-impact', value: { authenticity: -15, elitism: +10 }, description: 'Dismissive of geographic and class concerns' },
                { type: 'mood-change', value: 'frustrated', description: 'Confirms worst fears about media elite' }
              ],
              triggers: ['geographic-dismissal']
            }
          ]
        }
      ]
    });

    // Shell Executive - Extreme Difficulty
    this.arcDefinitions.set('shell-executive', {
      backgroundId: 'shell-executive',
      difficulty: 'extreme',
      interviewerApproach: 'confrontational',
      questionCount: 7,
      arc: [
        {
          id: 'fossil-fuel-responsibility',
          type: 'opener',
          setup: "You spent eight years as a senior executive at Shell while the company fought against climate regulations.",
          question: "You profited from fossil fuels while Dutch cities flood. How can you claim to care about climate when you helped cause it?",
          interruptionTriggers: [
            {
              condition: 'deflection',
              probability: 0.9,
              message: "Don't give me corporate PR. Take responsibility for your role.",
              followUpAction: 'responsibility-demand'
            },
            {
              condition: 'evasion',
              probability: 0.8,
              message: "That's exactly the kind of evasion Shell shareholders expect. But these are voters.",
              followUpAction: 'accountability-pressure'
            }
          ],
          followUpRules: [
            { if: 'tone:defensive', then: 'corporate-mindset-attack' },
            { if: 'tone:aggressive', then: 'arrogance-challenge' },
            { if: 'word_count<20', then: 'insufficient-response' }
          ],
          responseOptions: [
            {
              text: "I was part of the problem, which is exactly why I understand how to solve it from the inside.",
              tone: 'diplomatic',
              consequences: [
                { type: 'performance-impact', value: { authenticity: +15 }, description: 'Owns responsibility' }
              ],
              triggers: ['insider-solution']
            },
            {
              text: "That's an oversimplification. We need pragmatic energy transition, not ideological purity.",
              tone: 'defensive',
              consequences: [
                { type: 'mood-change', value: 'hostile', description: 'Dismissing climate concern angers interviewer' },
                { type: 'performance-impact', value: { authenticity: -20 }, description: 'Sounds like corporate speak' }
              ],
              triggers: ['corporate-defense']
            },
            {
              text: "I made difficult decisions in a complex industry. Now I want to lead the transition responsibly.",
              tone: 'evasive',
              consequences: [
                { type: 'mood-change', value: 'frustrated', description: 'Evasion increases frustration' },
                { type: 'trigger-follow-up', value: 'responsibility-attack', description: 'Triggers responsibility attack' }
              ],
              triggers: ['responsibility-evasion']
            }
          ]
        }
        // Additional questions...
      ]
    });
  }

  /**
   * Scale question difficulty based on requested level
   */
  private static scaleDifficulty(definition: QuestionArcDefinition, targetDifficulty: DifficultyLevel): QuestionArcDefinition {
    if (definition.difficulty === targetDifficulty) {
      return definition;
    }

    const scaledDefinition = { ...definition };

    // Adjust interruption probabilities
    scaledDefinition.arc = definition.arc.map(question => {
      const scaledQuestion = { ...question };

      scaledQuestion.interruptionTriggers = question.interruptionTriggers.map(trigger => ({
        ...trigger,
        probability: this.scaleInterruptionProbability(trigger.probability, definition.difficulty, targetDifficulty)
      }));

      // Add/remove urgency based on difficulty
      if (targetDifficulty === 'extreme' && !question.urgency) {
        scaledQuestion.urgency = {
          timeLimit: 20,
          warningThreshold: 5,
          timeoutAction: 'penalty'
        };
      } else if (targetDifficulty === 'low' && question.urgency) {
        delete scaledQuestion.urgency;
      }

      return scaledQuestion;
    });

    return scaledDefinition;
  }

  /**
   * Scale interruption probability based on difficulty change
   */
  private static scaleInterruptionProbability(
    originalProbability: number,
    originalDifficulty: DifficultyLevel,
    targetDifficulty: DifficultyLevel
  ): number {
    const difficultyLevels = ['low', 'medium', 'high', 'extreme'];
    const originalIndex = difficultyLevels.indexOf(originalDifficulty);
    const targetIndex = difficultyLevels.indexOf(targetDifficulty);

    const scaleFactor = (targetIndex - originalIndex) * 0.2 + 1;
    return Math.max(0, Math.min(1, originalProbability * scaleFactor));
  }

  /**
   * Sophisticated controversy-based difficulty scaling system
   */
  static calculateDifficultyFromControversy(backgroundId: string): DifficultyLevel {
    const controversyFactors = this.getControveryFactors(backgroundId);
    const controversyScore = this.calculateControveryScore(controversyFactors);
    
    // Map controversy score to difficulty levels
    if (controversyScore >= 0.85) return 'extreme';
    if (controversyScore >= 0.65) return 'high';
    if (controversyScore >= 0.35) return 'medium';
    return 'low';
  }

  /**
   * Define controversy factors for each background
   */
  private static getControveryFactors(backgroundId: string): ControversyFactors {
    const factors: Record<string, ControversyFactors> = {
      'small-business-owner': {
        publicScrutiny: 0.2,      // Low media attention
        stakeholderImpact: 0.3,   // Affects some workers/customers
        ethicalComplexity: 0.2,   // Clear business ethics
        politicalSensitivity: 0.1, // Not politically charged
        personalRisk: 0.3,        // Personal financial risk
        systemicInfluence: 0.2    // Limited system impact
      },
      'financial-analyst': {
        publicScrutiny: 0.4,      // Some media interest in finance
        stakeholderImpact: 0.5,   // Affects investors/markets
        ethicalComplexity: 0.6,   // Complex financial ethics
        politicalSensitivity: 0.3, // Somewhat political
        personalRisk: 0.4,        // Career/reputation risk
        systemicInfluence: 0.5    // Market influence
      },
      'academic-researcher': {
        publicScrutiny: 0.3,      // Academic scrutiny
        stakeholderImpact: 0.4,   // Students/research community
        ethicalComplexity: 0.5,   // Research ethics questions
        politicalSensitivity: 0.2, // Generally apolitical
        personalRisk: 0.3,        // Academic career risk
        systemicInfluence: 0.4    // Intellectual influence
      },
      'tech-entrepreneur': {
        publicScrutiny: 0.5,      // High tech media attention
        stakeholderImpact: 0.6,   // Users, workers, society
        ethicalComplexity: 0.7,   // Complex tech ethics
        politicalSensitivity: 0.4, // Tech regulation issues
        personalRisk: 0.6,        // High personal stakes
        systemicInfluence: 0.7    // Significant tech influence
      },
      'environmental-activist': {
        publicScrutiny: 0.7,      // High environmental media focus
        stakeholderImpact: 0.8,   // Climate affects everyone
        ethicalComplexity: 0.6,   // Clear moral stance but complex trade-offs
        politicalSensitivity: 0.8, // Highly political
        personalRisk: 0.6,        // Activist risks
        systemicInfluence: 0.7    // Pushes system change
      },
      'former-politician': {
        publicScrutiny: 0.8,      // Intense political scrutiny
        stakeholderImpact: 0.7,   // Affected constituents
        ethicalComplexity: 0.8,   // Complex political ethics
        politicalSensitivity: 0.9, // Extremely political
        personalRisk: 0.7,        // Political career destruction
        systemicInfluence: 0.8    // Direct system participation
      },
      'former-journalist': {
        publicScrutiny: 0.7,      // Media scrutinizing media
        stakeholderImpact: 0.6,   // Public trust in media
        ethicalComplexity: 0.7,   // Journalism ethics complex
        politicalSensitivity: 0.7, // Press-politics relationship
        personalRisk: 0.6,        // Professional relationships
        systemicInfluence: 0.6    // Media system influence
      },
      'toeslagenaffaire-whistleblower': {
        publicScrutiny: 0.95,     // Maximum public attention
        stakeholderImpact: 0.9,   // Thousands of families affected
        ethicalComplexity: 0.9,   // Complex institutional ethics
        politicalSensitivity: 0.95, // Explosive political issue
        personalRisk: 0.9,        // Career/life destroyed
        systemicInfluence: 0.95   // Exposed systemic failure
      },
      'shell-executive': {
        publicScrutiny: 0.9,      // Climate protests, media attention
        stakeholderImpact: 0.95,  // Global climate impact
        ethicalComplexity: 0.9,   // Environmental vs economic ethics
        politicalSensitivity: 0.8, // Energy policy is political
        personalRisk: 0.8,        // High executive stakes
        systemicInfluence: 0.9    // Massive economic influence
      }
    };

    return factors[backgroundId] || {
      publicScrutiny: 0.5,
      stakeholderImpact: 0.5,
      ethicalComplexity: 0.5,
      politicalSensitivity: 0.5,
      personalRisk: 0.5,
      systemicInfluence: 0.5
    };
  }

  /**
   * Calculate weighted controversy score from factors
   */
  private static calculateControveryScore(factors: ControversyFactors): number {
    // Weight factors by their importance in determining interview difficulty
    const weights = {
      publicScrutiny: 0.2,        // Media attention drives interview intensity
      stakeholderImpact: 0.15,    // Scope of people affected
      ethicalComplexity: 0.15,    // Complexity of moral questions
      politicalSensitivity: 0.25, // Political volatility = harder questions
      personalRisk: 0.1,          // Personal stakes
      systemicInfluence: 0.15     // Scale of system impact
    };

    return (
      factors.publicScrutiny * weights.publicScrutiny +
      factors.stakeholderImpact * weights.stakeholderImpact +
      factors.ethicalComplexity * weights.ethicalComplexity +
      factors.politicalSensitivity * weights.politicalSensitivity +
      factors.personalRisk * weights.personalRisk +
      factors.systemicInfluence * weights.systemicInfluence
    );
  }

  /**
   * Get detailed controversy analysis for a background
   */
  static getControveryAnalysis(backgroundId: string): ControveryAnalysis {
    const factors = this.getControveryFactors(backgroundId);
    const score = this.calculateControveryScore(factors);
    const difficulty = this.calculateDifficultyFromControversy(backgroundId);
    
    return {
      backgroundId,
      overallScore: score,
      difficulty,
      factors,
      reasoning: this.generateControveryReasoning(backgroundId, factors, score)
    };
  }

  /**
   * Generate human-readable reasoning for controversy score
   */
  private static generateControveryReasoning(
    backgroundId: string, 
    factors: ControversyFactors, 
    score: number
  ): string {
    const highestFactor = Object.entries(factors)
      .sort(([,a], [,b]) => b - a)[0];
    
    const backgroundNames: Record<string, string> = {
      'small-business-owner': 'Small Business Owner',
      'financial-analyst': 'Financial Analyst', 
      'academic-researcher': 'Academic Researcher',
      'tech-entrepreneur': 'Tech Entrepreneur',
      'environmental-activist': 'Environmental Activist',
      'former-politician': 'Former Politician',
      'former-journalist': 'Former Journalist',
      'toeslagenaffaire-whistleblower': 'Toeslagenaffaire Whistleblower',
      'shell-executive': 'Shell Executive'
    };

    const factorDescriptions: Record<string, string> = {
      publicScrutiny: 'intense media scrutiny',
      stakeholderImpact: 'broad stakeholder impact',
      ethicalComplexity: 'complex ethical questions',
      politicalSensitivity: 'high political sensitivity',
      personalRisk: 'significant personal stakes',
      systemicInfluence: 'major systemic influence'
    };

    return `${backgroundNames[backgroundId]} scores ${(score * 100).toFixed(0)}% controversy, ` +
           `primarily due to ${factorDescriptions[highestFactor[0]]} (${(highestFactor[1] * 100).toFixed(0)}%). ` +
           `This drives ${this.calculateDifficultyFromControversy(backgroundId)} difficulty interview questions.`;
  }

  /**
   * Get all available background IDs
   */
  static getAvailableBackgrounds(): string[] {
    return Array.from(this.arcDefinitions.keys());
  }

  /**
   * Check if a background has a defined arc
   */
  static hasArc(backgroundId: string): boolean {
    return this.arcDefinitions.has(backgroundId);
  }

  /**
   * Get arc metadata without creating full arc
   */
  static getArcMetadata(backgroundId: string): { difficulty: DifficultyLevel; questionCount: number; interviewerApproach: InterviewerType } | null {
    const definition = this.arcDefinitions.get(backgroundId);
    if (!definition) return null;

    return {
      difficulty: definition.difficulty,
      questionCount: definition.questionCount,
      interviewerApproach: definition.interviewerApproach
    };
  }

  
  /**
   * Get controversy analysis for debugging and transparency
   */
  static getControveryReport(backgroundId: string): ControveryAnalysis {
    return this.getControveryAnalysis(backgroundId);
  }
}