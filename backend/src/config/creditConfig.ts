/**
 * Central Credit & Pricing Configuration
 * Authoritative source of truth for packages, feature deduction rules, and initial balances.
 * Client requests never dictate prices or credit quantities.
 */

export interface CreditPackage {
  id: string;
  name: string;
  priceInr: number;
  credits: number;
  description: string;
  features: string[];
  badge?: string;
  popular?: boolean;
}

export const CREDIT_CONFIG = {
  // New account complimentary credits
  DEFAULT_SIGNUP_CREDITS: 100,

  // Feature costs in credits
  COSTS: {
    AI_TECHNICAL_INTERVIEW: 50,
    AI_EVALUATION_PER_SESSION: 0, // Included with interview start
    PROFILE_RESUME_ENRICHMENT: 0, // Free optional onboarding profile enrichment (No ATS charge)
  },

  // Authoritative server-side packages
  PACKAGES: {
    free: {
      id: 'free',
      name: 'Free Trial',
      priceInr: 0,
      credits: 100,
      description: 'Default credits granted for practicing introductory mock interviews.',
      features: [
        '100 AI Interview Credits',
        '2 Full Technical Interviews (50 credits/session)',
        'Question-by-Question AI Analysis',
        'PDF Performance Report'
      ]
    },
    starter: {
      id: 'starter',
      name: 'Starter Pack',
      priceInr: 100,
      credits: 150,
      description: 'Ideal for candidates preparing for upcoming technical rounds.',
      features: [
        '150 AI Interview Credits',
        '3 Complete Mock Interview Sessions',
        'Detailed Rubric & Mistakes Analysis',
        'Performance Trend Analytics'
      ]
    },
    pro: {
      id: 'pro',
      name: 'Pro Pack',
      priceInr: 500,
      credits: 650,
      badge: 'Best Value',
      popular: true,
      description: 'Comprehensive package for active job seekers targeting tier-1 tech companies.',
      features: [
        '650 AI Interview Credits',
        '13 Full Mock Interview Sessions',
        'Voice Interaction & Video Interviewer',
        'Deep Conceptual Gap Recommendations',
        'Lifetime History & Report Export'
      ]
    },
    ultimate: {
      id: 'ultimate',
      name: 'Ultimate Prep',
      priceInr: 1000,
      credits: 1500,
      badge: 'Maximum Value',
      description: 'Full season prep pack for extensive technical & HR round mastery.',
      features: [
        '1500 AI Interview Credits',
        '30 Comprehensive Mock Interviews',
        'Advanced Topic-Specific Drills',
        'Priority AI Processing Pipeline'
      ]
    }
  } as Record<string, CreditPackage>
};

export function getPackageById(planId: string): CreditPackage | null {
  if (!planId) return null;
  const key = planId.toLowerCase().trim();
  return CREDIT_CONFIG.PACKAGES[key] || null;
}
