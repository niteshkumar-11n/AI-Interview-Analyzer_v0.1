/**
 * Candidate Context Service
 * Assembles a unified, feature-appropriate candidate context from the profile,
 * optional confirmed resume enrichment, and assessment history.
 * Ensures NO feature depends on a mandatory resume upload or ATS scoring.
 */
import { findUserById, UserProfile, CareerStatus } from '../../models/User.ts';
import { getLatestUserResume, ResumeRecord } from '../../models/Resume.ts';
import { getUserInterviews } from '../../models/Interview.ts';

export interface CandidateContext {
  userId: string;
  email: string;
  credits: number;
  profile: {
    careerStatus: CareerStatus;
    name: string;
    targetRole: string;
    education: {
      degree?: string;
      specialization?: string;
      college?: string;
      graduationYear?: number;
      level?: string;
    };
    experience: {
      currentJobTitle?: string;
      yearsOfExperience?: string;
      currentCompany?: string;
      preferredLocation?: string;
      workMode?: string;
      previousBackground?: string;
      relevantExperience?: string;
    };
    skills: { name: string; percentage: number; level: string }[];
    links: {
      githubUrl?: string;
      linkedinUrl?: string;
      portfolioUrl?: string;
    };
    bio?: string;
    location?: string;
    phone?: string;
  };
  resumeEnrichment: {
    available: boolean;
    status: 'none' | 'pending' | 'completed' | 'failed';
    version: number;
    confirmedFacts: any | null;
  };
  assessmentSummary: {
    interviewsCompleted: number;
    averageScore: number;
    latestScore: number | null;
    recentInterviewTopics: string[];
    skillGaps: string[];
  };
}

export class CandidateContextService {
  /**
   * Retrieves the full unified candidate context for a user
   */
  public static async getCandidateContext(userId: string): Promise<CandidateContext | null> {
    const user = await findUserById(userId);
    if (!user) {
      return null;
    }

    const latestResume = await getLatestUserResume(userId);
    const interviews = await getUserInterviews(userId);

    // Determine career status (default to student if missing)
    const careerStatus: CareerStatus = user.profile?.careerStatus || 'student';

    // Build unified skills list (merging confirmed resume facts if present)
    const profileSkills = user.profile?.skills || [];
    const confirmedSkills = (latestResume?.confirmedFacts?.skills || []) as string[];
    
    // Merge skills preserving profile proficiency
    const mergedSkillNames = new Set<string>();
    const skillsList: { name: string; percentage: number; level: string }[] = [];

    for (const s of profileSkills) {
      mergedSkillNames.add(s.name.toLowerCase());
      skillsList.push(s);
    }

    for (const cSkill of confirmedSkills) {
      if (!mergedSkillNames.has(cSkill.toLowerCase())) {
        mergedSkillNames.add(cSkill.toLowerCase());
        skillsList.push({
          name: cSkill,
          percentage: 75,
          level: 'Intermediate'
        });
      }
    }

    // Calculate assessment summary from actual interview sessions
    const completedInterviews = interviews.filter((i) => i.status === 'completed');
    const totalInterviews = completedInterviews.length;
    let avgScore = 0;
    let latestScore: number | null = null;
    const recentTopics: string[] = [];

    if (totalInterviews > 0) {
      const sum = completedInterviews.reduce((acc, curr) => acc + (Math.round((curr.finalScore || 0) * 10)), 0);
      avgScore = Math.round(sum / totalInterviews);
      latestScore = Math.round((completedInterviews[0].finalScore || 0) * 10);
      completedInterviews.slice(0, 3).forEach((item) => {
        if (item.category && !recentTopics.includes(item.category)) {
          recentTopics.push(item.category);
        }
      });
    }

    // Extract skill gaps from weak areas identified in past evaluations
    const skillGaps: string[] = [];
    for (const interview of completedInterviews.slice(0, 3)) {
      if (interview.recommendedPracticeTopics && Array.isArray(interview.recommendedPracticeTopics)) {
        interview.recommendedPracticeTopics.forEach((imp: string) => {
          if (!skillGaps.includes(imp) && skillGaps.length < 5) {
            skillGaps.push(imp);
          }
        });
      }
    }

    const context: CandidateContext = {
      userId: user.id,
      email: user.email,
      credits: user.credits ?? 100,
      profile: {
        careerStatus,
        name: user.profile?.name || user.email.split('@')[0],
        targetRole: user.profile?.targetRole || 'Full Stack Engineer',
        education: {
          degree: user.profile?.degree || 'Bachelor of Technology',
          specialization: user.profile?.specialization || 'Computer Science',
          college: user.profile?.college || '',
          graduationYear: user.profile?.graduationYear || 2025,
          level: user.profile?.education || 'B.Tech'
        },
        experience: {
          currentJobTitle: user.profile?.currentJobTitle || '',
          yearsOfExperience: user.profile?.yearsOfExperience || (careerStatus === 'fresher' ? '0' : '1+'),
          currentCompany: user.profile?.currentCompany || '',
          preferredLocation: user.profile?.preferredLocation || 'Remote',
          workMode: user.profile?.workMode || 'Hybrid',
          previousBackground: user.profile?.previousBackground || '',
          relevantExperience: user.profile?.relevantExperience || ''
        },
        skills: skillsList,
        links: {
          githubUrl: user.profile?.githubUrl || user.profile?.github || '',
          linkedinUrl: user.profile?.linkedinUrl || user.profile?.linkedin || '',
          portfolioUrl: user.profile?.portfolioUrl || user.profile?.portfolio || ''
        },
        bio: user.profile?.bio,
        location: user.profile?.location,
        phone: user.profile?.phone
      },
      resumeEnrichment: {
        available: Boolean(latestResume && latestResume.isConfirmed),
        status: latestResume ? (latestResume.processingStatus as any) : 'none',
        version: latestResume?.version || 0,
        confirmedFacts: latestResume?.confirmedFacts || null
      },
      assessmentSummary: {
        interviewsCompleted: totalInterviews,
        averageScore: avgScore,
        latestScore,
        recentInterviewTopics: recentTopics,
        skillGaps
      }
    };

    return context;
  }

  /**
   * Helper for technical interview engine: returns tailored skill and role context
   */
  public static async getContextForInterview(userId: string) {
    const ctx = await this.getCandidateContext(userId);
    if (!ctx) return null;

    return {
      candidateName: ctx.profile.name,
      careerStatus: ctx.profile.careerStatus,
      targetRole: ctx.profile.targetRole,
      skills: ctx.profile.skills.map((s) => s.name),
      weakAreas: ctx.assessmentSummary.skillGaps,
      interviewsCompleted: ctx.assessmentSummary.interviewsCompleted
    };
  }

  /**
   * Helper for job recommendations: returns skills, preferences, and experience
   */
  public static async getContextForJobs(userId: string) {
    const ctx = await this.getCandidateContext(userId);
    if (!ctx) return null;

    return {
      skills: ctx.profile.skills.map((s) => s.name),
      targetRole: ctx.profile.targetRole,
      location: ctx.profile.experience.preferredLocation || 'India',
      yearsOfExperience: ctx.profile.experience.yearsOfExperience || '0'
    };
  }
}
