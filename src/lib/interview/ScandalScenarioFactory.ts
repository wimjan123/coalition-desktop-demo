/**
 * Scandal Scenario Factory
 * Generates realistic political scandal scenarios for crisis interviews
 */

import type {
  ScandalScenario,
  ScandalType,
  ScandalStakeholder,
  ScandalEvidence,
  DefenseStrategy,
  PublicOpinionData,
  PoliticalConsequence,
  MediaAttentionLevel
} from '../types/interview.js';

export class ScandalScenarioFactory {
  private static dutchMediaOutlets = [
    'NOS', 'RTL Nieuws', 'Volkskrant', 'NRC', 'Telegraaf', 'Trouw',
    'NOVA', 'Nieuwsuur', 'EenVandaag', 'Jinek'
  ];

  private static dutchPoliticalParties = [
    'VVD', 'PvdA', 'PVV', 'CDA', 'SP', 'D66', 'ChristenUnie',
    'GroenLinks', 'SGP', 'DENK', 'FvD', 'Volt', 'JA21', 'BBB'
  ];

  private static dutchDemographics = [
    'urban-professionals', 'rural-farmers', 'elderly-pensioners',
    'young-students', 'working-class', 'small-business-owners',
    'immigrants', 'traditional-families', 'environmental-activists'
  ];

  /**
   * Generate a scandal scenario based on type and severity
   */
  static generateScenario(
    type: ScandalType,
    severity: 'minor' | 'moderate' | 'major' | 'catastrophic',
    playerBackground: string
  ): ScandalScenario {
    const scenarioId = `${type}-${severity}-${Date.now()}`;

    const baseScenario: Partial<ScandalScenario> = {
      id: scenarioId,
      type,
      severity,
      timeUntilInterview: this.calculateTimeUntilInterview(severity),
      mediaAttention: this.calculateMediaAttention(severity),
      publicOpinion: this.generatePublicOpinion(type, severity),
      politicalRamifications: this.generatePoliticalRamifications(type, severity)
    };

    // Generate type-specific scenario details
    switch (type) {
      case 'financial-impropriety':
        return this.generateFinancialScandal(baseScenario, playerBackground);
      case 'personal-conduct':
        return this.generatePersonalConductScandal(baseScenario, playerBackground);
      case 'policy-contradiction':
        return this.generatePolicyContradictionScandal(baseScenario, playerBackground);
      case 'competence-failure':
        return this.generateCompetenceFailureScandal(baseScenario, playerBackground);
      case 'association-scandal':
        return this.generateAssociationScandal(baseScenario, playerBackground);
      case 'corruption-allegation':
        return this.generateCorruptionScandal(baseScenario, playerBackground);
      case 'cover-up-accusation':
        return this.generateCoverUpScandal(baseScenario, playerBackground);
      case 'abuse-of-power':
        return this.generateAbuseOfPowerScandal(baseScenario, playerBackground);
      case 'ethical-violation':
        return this.generateEthicalViolationScandal(baseScenario, playerBackground);
      case 'criminal-allegation':
        return this.generateCriminalAllegationScandal(baseScenario, playerBackground);
      default:
        throw new Error(`Unknown scandal type: ${type}`);
    }
  }

  private static generateFinancialScandal(
    base: Partial<ScandalScenario>,
    playerBackground: string
  ): ScandalScenario {
    const scenarios = {
      'minor': {
        title: 'Questionable Travel Expenses',
        description: 'Travel receipts show expensive hotels and meals charged to public funds',
        evidence: [
          {
            type: 'financial-record' as const,
            description: 'Hotel receipts for €300/night stays during official travel',
            credibility: 85,
            damageLevel: 25
          },
          {
            type: 'document' as const,
            description: 'Expense reports showing frequent first-class travel',
            credibility: 90,
            damageLevel: 30
          }
        ]
      },
      'moderate': {
        title: 'Undisclosed Business Interests',
        description: 'Failed to declare shares in companies affected by your policy decisions',
        evidence: [
          {
            type: 'financial-record' as const,
            description: 'Share certificates showing ownership in construction company',
            credibility: 90,
            damageLevel: 60
          },
          {
            type: 'document' as const,
            description: 'Policy papers benefiting construction industry while owning shares',
            credibility: 95,
            damageLevel: 70
          }
        ]
      },
      'major': {
        title: 'Suspicious Property Deal',
        description: 'Purchased property below market value from developer seeking planning permission',
        evidence: [
          {
            type: 'financial-record' as const,
            description: 'Property deed showing €200K below market value purchase',
            credibility: 95,
            damageLevel: 80
          },
          {
            type: 'email' as const,
            description: 'Emails with developer discussing planning application',
            credibility: 85,
            damageLevel: 75
          }
        ]
      },
      'catastrophic': {
        title: 'Offshore Tax Avoidance Scheme',
        description: 'Documents reveal complex offshore structure to avoid Dutch taxes',
        evidence: [
          {
            type: 'document' as const,
            description: 'Panama Papers-style leaked documents showing offshore companies',
            credibility: 90,
            damageLevel: 95
          },
          {
            type: 'financial-record' as const,
            description: 'Bank statements showing €2M in unreported offshore accounts',
            credibility: 95,
            damageLevel: 90
          }
        ]
      }
    };

    const scenarioData = scenarios[base.severity!];

    return {
      ...base,
      title: scenarioData.title,
      description: scenarioData.description,
      stakeholders: this.generateFinancialStakeholders(base.severity!),
      evidenceAgainst: this.buildEvidenceList(scenarioData.evidence),
      defensiblePositions: this.generateFinancialDefenses(base.severity!)
    } as ScandalScenario;
  }

  private static generatePersonalConductScandal(
    base: Partial<ScandalScenario>,
    playerBackground: string
  ): ScandalScenario {
    const scenarios = {
      'minor': {
        title: 'Inappropriate Social Media Posts',
        description: 'Old social media posts show insensitive comments about minorities'
      },
      'moderate': {
        title: 'Workplace Harassment Allegations',
        description: 'Former staff members allege inappropriate behavior and hostile work environment'
      },
      'major': {
        title: 'Extramarital Affair Revelation',
        description: 'Media reveals long-term affair with lobbyist from industry you regulate'
      },
      'catastrophic': {
        title: 'Historical Abuse Allegations',
        description: 'Multiple witnesses come forward with serious allegations from your university days'
      }
    };

    const scenarioData = scenarios[base.severity!];

    return {
      ...base,
      title: scenarioData.title,
      description: scenarioData.description,
      stakeholders: this.generatePersonalConductStakeholders(base.severity!),
      evidenceAgainst: this.generatePersonalConductEvidence(base.severity!),
      defensiblePositions: this.generatePersonalConductDefenses(base.severity!)
    } as ScandalScenario;
  }

  private static generatePolicyContradictionScandal(
    base: Partial<ScandalScenario>,
    playerBackground: string
  ): ScandalScenario {
    const scenarios = {
      'minor': {
        title: 'Voting Record Inconsistency',
        description: 'Voted against same policy you now champion in different circumstances'
      },
      'moderate': {
        title: 'Campaign Promise Reversal',
        description: 'Implementing opposite of key campaign promise that helped you get elected'
      },
      'major': {
        title: 'Fundamental Position Flip',
        description: 'Complete reversal on core issue after receiving industry lobbying'
      },
      'catastrophic': {
        title: 'Ideological Betrayal',
        description: 'Abandoning foundational party principles for personal or political gain'
      }
    };

    const scenarioData = scenarios[base.severity!];

    return {
      ...base,
      title: scenarioData.title,
      description: scenarioData.description,
      stakeholders: this.generatePolicyContradictionStakeholders(base.severity!),
      evidenceAgainst: this.generatePolicyContradictionEvidence(base.severity!),
      defensiblePositions: this.generatePolicyContradictionDefenses(base.severity!)
    } as ScandalScenario;
  }

  private static generateCompetenceFailureScandal(
    base: Partial<ScandalScenario>,
    playerBackground: string
  ): ScandalScenario {
    const scenarios = {
      'minor': {
        title: 'Factual Error in Speech',
        description: 'Made significant factual errors about basic policy details in public speech'
      },
      'moderate': {
        title: 'Project Management Failure',
        description: 'Major government project under your oversight failed spectacularly'
      },
      'major': {
        title: 'Crisis Mismanagement',
        description: 'Poor handling of crisis led to avoidable public harm and increased costs'
      },
      'catastrophic': {
        title: 'Institutional Collapse',
        description: 'Your decisions directly caused the failure of a major government institution'
      }
    };

    const scenarioData = scenarios[base.severity!];

    return {
      ...base,
      title: scenarioData.title,
      description: scenarioData.description,
      stakeholders: this.generateCompetenceFailureStakeholders(base.severity!),
      evidenceAgainst: this.generateCompetenceFailureEvidence(base.severity!),
      defensiblePositions: this.generateCompetenceFailureDefenses(base.severity!)
    } as ScandalScenario;
  }

  private static generateAssociationScandal(
    base: Partial<ScandalScenario>,
    playerBackground: string
  ): ScandalScenario {
    const scenarios = {
      'minor': {
        title: 'Questionable Photo Opportunity',
        description: 'Photographed with person later revealed to have controversial past'
      },
      'moderate': {
        title: 'Advisor Scandal Connection',
        description: 'Close advisor involved in separate scandal, raising questions about judgment'
      },
      'major': {
        title: 'Organizational Ties Revealed',
        description: 'Hidden connections to organization with extremist or corrupt elements'
      },
      'catastrophic': {
        title: 'Criminal Network Association',
        description: 'Evidence emerges of long-term association with criminal organization'
      }
    };

    const scenarioData = scenarios[base.severity!];

    return {
      ...base,
      title: scenarioData.title,
      description: scenarioData.description,
      stakeholders: this.generateAssociationStakeholders(base.severity!),
      evidenceAgainst: this.generateAssociationEvidence(base.severity!),
      defensiblePositions: this.generateAssociationDefenses(base.severity!)
    } as ScandalScenario;
  }

  private static generateCorruptionScandal(
    base: Partial<ScandalScenario>,
    playerBackground: string
  ): ScandalScenario {
    const scenarios = {
      'moderate': {
        title: 'Lobbying Influence Peddling',
        description: 'Allegations of trading access and influence for personal benefits'
      },
      'major': {
        title: 'Quid Pro Quo Arrangement',
        description: 'Evidence of explicit exchange of favors for political decisions'
      },
      'catastrophic': {
        title: 'Systematic Bribery Scheme',
        description: 'Evidence of long-term bribery operation affecting multiple decisions'
      }
    };

    const scenarioData = scenarios[base.severity! === 'minor' ? 'moderate' : base.severity!];

    return {
      ...base,
      title: scenarioData.title,
      description: scenarioData.description,
      stakeholders: this.generateCorruptionStakeholders(base.severity!),
      evidenceAgainst: this.generateCorruptionEvidence(base.severity!),
      defensiblePositions: this.generateCorruptionDefenses(base.severity!)
    } as ScandalScenario;
  }

  private static generateCoverUpScandal(
    base: Partial<ScandalScenario>,
    playerBackground: string
  ): ScandalScenario {
    return {
      ...base,
      title: 'Information Suppression Allegations',
      description: 'Accused of deliberately hiding information from public and parliament',
      stakeholders: this.generateCoverUpStakeholders(base.severity!),
      evidenceAgainst: this.generateCoverUpEvidence(base.severity!),
      defensiblePositions: this.generateCoverUpDefenses(base.severity!)
    } as ScandalScenario;
  }

  private static generateAbuseOfPowerScandal(
    base: Partial<ScandalScenario>,
    playerBackground: string
  ): ScandalScenario {
    return {
      ...base,
      title: 'Authority Misuse Allegations',
      description: 'Accused of using official position for personal or political advantage',
      stakeholders: this.generateAbuseOfPowerStakeholders(base.severity!),
      evidenceAgainst: this.generateAbuseOfPowerEvidence(base.severity!),
      defensiblePositions: this.generateAbuseOfPowerDefenses(base.severity!)
    } as ScandalScenario;
  }

  private static generateEthicalViolationScandal(
    base: Partial<ScandalScenario>,
    playerBackground: string
  ): ScandalScenario {
    return {
      ...base,
      title: 'Ethics Code Violations',
      description: 'Multiple breaches of parliamentary ethics and conduct standards',
      stakeholders: this.generateEthicalViolationStakeholders(base.severity!),
      evidenceAgainst: this.generateEthicalViolationEvidence(base.severity!),
      defensiblePositions: this.generateEthicalViolationDefenses(base.severity!)
    } as ScandalScenario;
  }

  private static generateCriminalAllegationScandal(
    base: Partial<ScandalScenario>,
    playerBackground: string
  ): ScandalScenario {
    return {
      ...base,
      title: 'Criminal Charges Filed',
      description: 'Formal criminal charges have been filed by prosecutors',
      stakeholders: this.generateCriminalAllegationStakeholders(base.severity!),
      evidenceAgainst: this.generateCriminalAllegationEvidence(base.severity!),
      defensiblePositions: this.generateCriminalAllegationDefenses(base.severity!)
    } as ScandalScenario;
  }

  // Helper methods for generating scenario components

  private static calculateTimeUntilInterview(severity: string): number {
    // More severe scandals get less preparation time
    const timeMapping = {
      'minor': 8,        // 8 hours
      'moderate': 4,     // 4 hours
      'major': 2,        // 2 hours
      'catastrophic': 1  // 1 hour
    };
    return timeMapping[severity as keyof typeof timeMapping];
  }

  private static calculateMediaAttention(severity: string): MediaAttentionLevel {
    const attentionMapping = {
      'minor': 'regional' as MediaAttentionLevel,
      'moderate': 'national' as MediaAttentionLevel,
      'major': 'national' as MediaAttentionLevel,
      'catastrophic': 'international' as MediaAttentionLevel
    };
    return attentionMapping[severity as keyof typeof attentionMapping];
  }

  private static generatePublicOpinion(type: ScandalType, severity: string): PublicOpinionData {
    const baseImpact = {
      'minor': -10,
      'moderate': -25,
      'major': -45,
      'catastrophic': -70
    };

    const typeMultiplier = {
      'financial-impropriety': 1.2,
      'personal-conduct': 0.8,
      'policy-contradiction': 1.0,
      'competence-failure': 1.1,
      'association-scandal': 0.9,
      'corruption-allegation': 1.5,
      'cover-up-accusation': 1.3,
      'abuse-of-power': 1.4,
      'ethical-violation': 1.1,
      'criminal-allegation': 1.8
    };

    const overallApproval = Math.floor(
      baseImpact[severity as keyof typeof baseImpact] * typeMultiplier[type]
    );

    // Generate demographic-specific impacts
    const demographicBreakdown: Record<string, number> = {};
    this.dutchDemographics.forEach(demo => {
      // Add some variation per demographic
      const variation = (Math.random() - 0.5) * 20; // -10 to +10 variation
      demographicBreakdown[demo] = Math.max(-100, Math.min(100, overallApproval + variation));
    });

    return {
      overallApproval,
      demographicBreakdown,
      beliefInAllegations: Math.min(100, Math.abs(overallApproval) + Math.random() * 30),
      demandForAccountability: Math.min(100, Math.abs(overallApproval) * 1.2 + Math.random() * 20)
    };
  }

  private static generatePoliticalRamifications(type: ScandalType, severity: string): PoliticalConsequence[] {
    const consequences: PoliticalConsequence[] = [];

    if (severity === 'major' || severity === 'catastrophic') {
      consequences.push({
        type: 'resignation-calls',
        severity: severity === 'catastrophic' ? 90 : 70,
        description: 'Opposition parties calling for immediate resignation',
        timeframe: 'immediate'
      });
    }

    if (severity === 'moderate' || severity === 'major' || severity === 'catastrophic') {
      consequences.push({
        type: 'coalition-pressure',
        severity: severity === 'catastrophic' ? 80 : 60,
        description: 'Coalition partners expressing concerns and demanding explanations',
        timeframe: 'short-term'
      });
    }

    consequences.push({
      type: 'electoral-impact',
      severity: {
        'minor': 20,
        'moderate': 40,
        'major': 70,
        'catastrophic': 90
      }[severity] || 30,
      description: 'Expected negative impact on party polling and election prospects',
      timeframe: 'long-term'
    });

    return consequences;
  }

  // Stakeholder generation methods (simplified for brevity)
  private static generateFinancialStakeholders(severity: string): ScandalStakeholder[] {
    const stakeholders: ScandalStakeholder[] = [];

    // Always include media and opposition
    stakeholders.push({
      id: 'media-financial',
      name: 'Financial Journalists',
      role: 'Media investigators',
      relationship: 'hostile',
      credibility: 85,
      publicStatement: 'These financial irregularities demand full transparency and accountability.'
    });

    if (severity === 'major' || severity === 'catastrophic') {
      stakeholders.push({
        id: 'ethics-committee',
        name: 'Parliamentary Ethics Committee',
        role: 'Ethics oversight',
        relationship: 'neutral',
        credibility: 95,
        publicStatement: 'We are conducting a thorough investigation into these allegations.',
        demands: ['Full financial disclosure', 'Cooperation with investigation']
      });
    }

    return stakeholders;
  }

  // Evidence building helper
  private static buildEvidenceList(evidenceData: Array<{
    type: 'document' | 'testimony' | 'recording' | 'financial-record' | 'photo' | 'email';
    description: string;
    credibility: number;
    damageLevel: number;
  }>): ScandalEvidence[] {
    return evidenceData.map((data, index) => ({
      id: `evidence-${index}`,
      type: data.type,
      source: this.dutchMediaOutlets[Math.floor(Math.random() * this.dutchMediaOutlets.length)],
      credibility: data.credibility,
      damageLevel: data.damageLevel,
      description: data.description,
      isPublic: true,
      canBeDisputed: data.credibility < 90,
      disputeStrength: data.credibility < 90 ? 100 - data.credibility : undefined
    }));
  }

  // Defense strategy generation methods (simplified)
  private static generateFinancialDefenses(severity: string): DefenseStrategy[] {
    const defenses: DefenseStrategy[] = [
      {
        id: 'financial-explanation',
        type: 'admit-but-justify',
        effectiveness: 60,
        requirements: ['Detailed financial records', 'Valid business justification'],
        risks: ['Might reveal additional irregularities'],
        description: 'Provide full explanation and justification for financial decisions',
        responseTemplates: [
          'These expenses were necessary for official duties and fully documented',
          'I can provide complete transparency on all financial matters'
        ]
      },
      {
        id: 'procedural-compliance',
        type: 'claim-misunderstanding',
        effectiveness: 45,
        requirements: ['Evidence of following procedures'],
        risks: ['Might appear out of touch'],
        description: 'Claim all procedures were followed according to guidelines',
        responseTemplates: [
          'I followed all established procedures and guidelines',
          'These are standard practices within the system'
        ]
      }
    ];

    if (severity === 'minor' || severity === 'moderate') {
      defenses.push({
        id: 'proportionality-argument',
        type: 'deflect-to-policy',
        effectiveness: 50,
        requirements: ['Policy achievements to highlight'],
        risks: ['Might seem to minimize the issue'],
        description: 'Argue the focus should be on policy achievements',
        responseTemplates: [
          'While this is important, let\'s focus on the policies that help Dutch families',
          'I\'d rather discuss how we\'re addressing the real challenges facing our country'
        ]
      });
    }

    return defenses;
  }

  // Placeholder methods for other stakeholder types (would be fully implemented)
  private static generatePersonalConductStakeholders(severity: string): ScandalStakeholder[] {
    return []; // Simplified for brevity
  }

  private static generatePersonalConductEvidence(severity: string): ScandalEvidence[] {
    return []; // Simplified for brevity
  }

  private static generatePersonalConductDefenses(severity: string): DefenseStrategy[] {
    return []; // Simplified for brevity
  }

  // Additional placeholder methods for other scandal types...
  private static generatePolicyContradictionStakeholders(severity: string): ScandalStakeholder[] { return []; }
  private static generatePolicyContradictionEvidence(severity: string): ScandalEvidence[] { return []; }
  private static generatePolicyContradictionDefenses(severity: string): DefenseStrategy[] { return []; }

  private static generateCompetenceFailureStakeholders(severity: string): ScandalStakeholder[] { return []; }
  private static generateCompetenceFailureEvidence(severity: string): ScandalEvidence[] { return []; }
  private static generateCompetenceFailureDefenses(severity: string): DefenseStrategy[] { return []; }

  private static generateAssociationStakeholders(severity: string): ScandalStakeholder[] { return []; }
  private static generateAssociationEvidence(severity: string): ScandalEvidence[] { return []; }
  private static generateAssociationDefenses(severity: string): DefenseStrategy[] { return []; }

  private static generateCorruptionStakeholders(severity: string): ScandalStakeholder[] { return []; }
  private static generateCorruptionEvidence(severity: string): ScandalEvidence[] { return []; }
  private static generateCorruptionDefenses(severity: string): DefenseStrategy[] { return []; }

  private static generateCoverUpStakeholders(severity: string): ScandalStakeholder[] { return []; }
  private static generateCoverUpEvidence(severity: string): ScandalEvidence[] { return []; }
  private static generateCoverUpDefenses(severity: string): DefenseStrategy[] { return []; }

  private static generateAbuseOfPowerStakeholders(severity: string): ScandalStakeholder[] { return []; }
  private static generateAbuseOfPowerEvidence(severity: string): ScandalEvidence[] { return []; }
  private static generateAbuseOfPowerDefenses(severity: string): DefenseStrategy[] { return []; }

  private static generateEthicalViolationStakeholders(severity: string): ScandalStakeholder[] { return []; }
  private static generateEthicalViolationEvidence(severity: string): ScandalEvidence[] { return []; }
  private static generateEthicalViolationDefenses(severity: string): DefenseStrategy[] { return []; }

  private static generateCriminalAllegationStakeholders(severity: string): ScandalStakeholder[] { return []; }
  private static generateCriminalAllegationEvidence(severity: string): ScandalEvidence[] { return []; }
  private static generateCriminalAllegationDefenses(severity: string): DefenseStrategy[] { return []; }
}