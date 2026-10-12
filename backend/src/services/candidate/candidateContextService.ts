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
  hasResume: boolean;
  targetRole: string;
  skills: { name: string; percentage: number; level: string }[];
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

    const targetRole = user.profile?.targetRole || 'Full Stack Engineer';

    const context: CandidateContext = {
      userId: user.id,
      email: user.email,
      credits: user.credits ?? 100,
      hasResume: Boolean(latestResume && latestResume.isConfirmed),
      targetRole,
      skills: skillsList,
      profile: {
        careerStatus,
        name: user.profile?.name || user.email.split('@')[0],
        targetRole,
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
   * Helper for interview engine: returns tailored resume facts, projects, experience, and past questions
   */
  public static async getContextForInterview(userId: string) {
    const user = await findUserById(userId);
    const ctx = await this.getCandidateContext(userId);
    if (!ctx) return null;

    const latestResume = await getLatestUserResume(userId);
    const interviews = await getUserInterviews(userId);

    // Extract projects from resume
    const rawProjects = latestResume?.confirmedFacts?.projects || latestResume?.extractedFacts?.projects || [];
    const projects = Array.isArray(rawProjects)
      ? rawProjects.map((p: any) => ({
          title: p.title || 'Project',
          description: p.description || '',
          technologies: Array.isArray(p.technologies) ? p.technologies : []
        }))
      : [];

    // Extract work experience from resume or profile
    const rawExp = latestResume?.confirmedFacts?.experience || latestResume?.extractedFacts?.experience || (user?.profile?.workExperience as any) || [];
    const workExperience = Array.isArray(rawExp)
      ? rawExp.map((e: any) => ({
          company: e.company || '',
          role: e.role || '',
          duration: e.duration || e.period || '',
          description: e.description || ''
        }))
      : [];

    // Extract summary/bio
    const summary = latestResume?.confirmedFacts?.summary || latestResume?.extractedFacts?.summary || user?.profile?.bio || '';

    // Collect all previous questions asked to this candidate to prevent repetitions
    const previousQuestions: string[] = [];
    interviews.forEach((inv) => {
      if (Array.isArray(inv.questions)) {
        inv.questions.forEach((q) => {
          if (q.question && typeof q.question === 'string') {
            previousQuestions.push(q.question.trim());
          }
        });
      }
    });

    return {
      candidateName: ctx.profile.name,
      careerStatus: ctx.profile.careerStatus,
      targetRole: ctx.profile.targetRole,
      skills: ctx.profile.skills.map((s) => s.name),
      projects,
      workExperience,
      summary,
      previousQuestions,
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

  /**
   * Helper for coding practice: returns tailored skill and programming language preferences
   */
  public static async getContextForCoding(userId: string) {
    const ctx = await this.getCandidateContext(userId);
    if (!ctx) return null;

    const skillNames = ctx.profile.skills.map((s) => s.name);
    const preferredLang = skillNames.find((s) =>
      ['JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'Go'].includes(s)
    ) || 'JavaScript';

    return {
      candidateName: ctx.profile.name,
      targetRole: ctx.profile.targetRole,
      skills: skillNames,
      technicalSkills: skillNames,
      preferredLanguage: preferredLang,
      experienceLevel: ctx.profile.careerStatus === 'student' || ctx.profile.careerStatus === 'fresher' ? 'Entry' : 'Experienced'
    };
  }

  /**
   * Helper for GitHub and open-source matching: returns verified skills and repository languages
   */
  public static async getContextForGitHub(userId: string) {
    const ctx = await this.getCandidateContext(userId);
    if (!ctx) return null;

    return {
      candidateName: ctx.profile.name,
      targetRole: ctx.profile.targetRole,
      skills: ctx.profile.skills.map((s) => s.name),
      githubUrl: ctx.profile.links.githubUrl,
      careerStatus: ctx.profile.careerStatus
    };
  }
}
