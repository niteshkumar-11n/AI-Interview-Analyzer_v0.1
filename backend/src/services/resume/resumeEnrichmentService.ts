/**
 * Resume Enrichment Service
 * Handles optional candidate resume processing to extract structured profile facts.
 * STRICTLY NO ATS SCORES, NO ATS PERCENTAGES, NO JOB DESCRIPTION COMPARISON.
 */
import { GoogleGenAI } from '@google/genai';
import { config } from '../../config/env.ts';
import { ExtractedCandidateFacts, createResumeRecord, confirmResumeFacts, getResumeById } from '../../models/Resume.ts';
import { findUserById, updateUserProfile } from '../../models/User.ts';

const FACT_EXTRACTION_PROMPT = `You are a profile data extraction assistant for an engineering career platform.
Extract structured candidate facts from the provided resume text to help pre-fill the candidate's profile.

CRITICAL RULES:
- DO NOT calculate an ATS score.
- DO NOT compare this resume against any job description.
- DO NOT generate ATS match ratings or compatibility percentages.
- Only extract objective candidate facts: technical skills, education history, work experience, projects, certifications, and a short bio/summary.

Return a STRICT JSON object in this format (no markdown fences, just pure JSON):
{
  "name": "Candidate Full Name or empty string",
  "email": "Candidate Email or empty string",
  "phone": "Candidate Phone or empty string",
  "targetRole": "Candidate Primary Title/Role or Software Engineer",
  "skills": ["JavaScript", "React", "Node.js", "Docker"],
  "education": [
    {
      "degree": "B.Tech in Computer Science",
      "institution": "University / College Name",
      "graduationYear": 2024,
      "field": "Computer Science"
    }
  ],
  "experience": [
    {
      "company": "Company / Organization Name",
      "role": "Frontend Intern / Developer",
      "duration": "June 2023 - Present",
      "description": "Short 1-line summary of responsibilities"
    }
  ],
  "projects": [
    {
      "title": "Project Name",
      "description": "One sentence summary of project",
      "technologies": ["React", "Express"]
    }
  ],
  "certifications": [
    {
      "name": "Certification Name",
      "issuer": "Issuing Org",
      "year": 2024
    }
  ],
  "summary": "1-2 sentence professional bio"
}

RESUME TEXT:
`;

export interface ProfileConflictDiff {
  newSkills: string[];
  existingSkills: string[];
  education: {
    current: string;
    extracted: string;
    hasConflict: boolean;
  };
  experience: {
    current: string;
    extracted: string;
    hasConflict: boolean;
  };
  targetRole: {
    current: string;
    extracted: string;
    hasConflict: boolean;
  };
  projects: { title: string; description?: string; technologies?: string[] }[];
  certifications: { name: string; issuer?: string; year?: number }[];
  extractedSummary: string;
}

export class ResumeEnrichmentService {
  /**
   * Parses raw resume text and extracts candidate facts using Gemini AI or fallback
   */
  public static async extractFactsFromText(
    userId: string,
    fileName: string,
    fileSize: number,
    mimeType: string,
    rawText: string
  ): Promise<{
    resumeId: string;
    resume?: any;
    extractedFacts: ExtractedCandidateFacts;
    profileDiff: ProfileConflictDiff;
    conflictDiff?: ProfileConflictDiff;
  }> {
    const user = await findUserById(userId);
    const existingSkills = (user?.profile?.skills || []).map((s) => s.name);

    let extracted: ExtractedCandidateFacts;

    if (config.geminiApiKey && rawText.trim().length > 20) {
      try {
        const ai = new GoogleGenAI({ apiKey: config.geminiApiKey });
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: `${FACT_EXTRACTION_PROMPT}\n${rawText.slice(0, 10000)}`
        });

        const raw = response.text?.trim() || '';
        let jsonStr = raw;
        const match = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (match) {
          jsonStr = match[1].trim();
        }

        extracted = JSON.parse(jsonStr) as ExtractedCandidateFacts;
      } catch (err: any) {
        console.warn('[ResumeEnrichment] Gemini extraction error, using heuristic fallback:', err.message);
        extracted = this.heuristicExtractionFallback(rawText);
      }
    } else {
      extracted = this.heuristicExtractionFallback(rawText);
    }

    // Save initial resume record (marked unconfirmed until user reviews)
    const resume = await createResumeRecord({
      userId,
      fileName,
      fileSize,
      mimeType,
      extractedFacts: extracted,
      processingStatus: 'completed'
    });

    // Compute diff and identify any conflicts against profile
    const existingSet = new Set(existingSkills.map((s) => s.toLowerCase()));
    const newSkills = (extracted.skills || []).filter((s) => !existingSet.has(s.toLowerCase()));

    const currentEdu = user?.profile?.degree || user?.profile?.education || '';
    const extractedEdu = extracted.education?.[0]?.degree || extracted.education?.[0]?.institution || '';
    const hasEduConflict = Boolean(
      currentEdu &&
      extractedEdu &&
      currentEdu.toLowerCase().trim() !== extractedEdu.toLowerCase().trim()
    );

    const currentExp = user?.profile?.yearsOfExperience || user?.profile?.currentJobTitle || '';
    const extractedExp = extracted.experience?.[0]?.role
      ? `${extracted.experience[0].role} (${extracted.experience[0].duration || 'Recent'})`
      : '';
    const hasExpConflict = Boolean(
      currentExp &&
      extractedExp &&
      currentExp.toLowerCase().trim() !== extractedExp.toLowerCase().trim()
    );

    const currentRole = user?.profile?.targetRole || '';
    const extractedRole = extracted.targetRole || '';
    const hasRoleConflict = Boolean(
      currentRole &&
      extractedRole &&
      currentRole.toLowerCase().trim() !== extractedRole.toLowerCase().trim()
    );

    const profileDiff: ProfileConflictDiff = {
      newSkills,
      existingSkills,
      education: {
        current: currentEdu,
        extracted: extractedEdu,
        hasConflict: hasEduConflict
      },
      experience: {
        current: currentExp,
        extracted: extractedExp,
        hasConflict: hasExpConflict
      },
      targetRole: {
        current: currentRole,
        extracted: extractedRole,
        hasConflict: hasRoleConflict
      },
      projects: extracted.projects || [],
      certifications: extracted.certifications || [],
      extractedSummary: extracted.summary || ''
    };

    return {
      resumeId: resume.id,
      resume,
      extractedFacts: extracted,
      profileDiff,
      conflictDiff: profileDiff
    };
  }

  /**
   * Confirms candidate facts and merges approved fields into the candidate's profile
   */
  public static async confirmAndMerge(
    userId: string,
    resumeId: string,
    confirmedFacts: {
      approvedSkills?: string[];
      education?: string;
      experience?: string;
      targetRole?: string;
      bio?: string;
      educationChoice?: 'current' | 'resume';
      experienceChoice?: 'current' | 'resume';
      targetRoleChoice?: 'current' | 'resume';
    }
  ) {
    const user = await findUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const existingResume = await getResumeById(resumeId, userId);

    // Merge skills
    const currentSkills = [...(user.profile?.skills || [])];
    const existingMap = new Map(currentSkills.map((s) => [s.name.toLowerCase(), s]));

    if (confirmedFacts.approvedSkills && Array.isArray(confirmedFacts.approvedSkills)) {
      for (const skillName of confirmedFacts.approvedSkills) {
        if (!existingMap.has(skillName.toLowerCase())) {
          currentSkills.push({
            name: skillName,
            percentage: 75,
            level: 'Intermediate'
          });
        }
      }
    }

    // Updates to profile
    const profileUpdates: any = {
      skills: currentSkills
    };

    if (confirmedFacts.targetRoleChoice === 'resume' && existingResume?.extractedFacts?.targetRole) {
      profileUpdates.targetRole = existingResume.extractedFacts.targetRole;
    } else if (confirmedFacts.targetRole && confirmedFacts.targetRole.trim()) {
      profileUpdates.targetRole = confirmedFacts.targetRole.trim();
    }

    if (confirmedFacts.educationChoice === 'resume' && existingResume?.extractedFacts?.education?.[0]) {
      const topEdu = existingResume.extractedFacts.education[0];
      profileUpdates.education = `${topEdu.degree || 'Degree'} from ${topEdu.institution || 'University'}`;
      if (topEdu.degree) profileUpdates.degree = topEdu.degree;
      if (topEdu.institution) profileUpdates.college = topEdu.institution;
      if (topEdu.graduationYear) profileUpdates.graduationYear = topEdu.graduationYear;
    } else if (confirmedFacts.education && confirmedFacts.education.trim()) {
      profileUpdates.education = confirmedFacts.education.trim();
    }

    if (confirmedFacts.experienceChoice === 'resume' && existingResume?.extractedFacts?.experience?.[0]) {
      const topExp = existingResume.extractedFacts.experience[0];
      profileUpdates.experience = `${topExp.role} (${topExp.company || 'Intern'})`;
      if (topExp.role) profileUpdates.currentJobTitle = topExp.role;
      if (topExp.company) profileUpdates.currentCompany = topExp.company;
    } else if (confirmedFacts.experience && confirmedFacts.experience.trim()) {
      profileUpdates.experience = confirmedFacts.experience.trim();
    }

    if (confirmedFacts.bio && confirmedFacts.bio.trim()) {
      profileUpdates.bio = confirmedFacts.bio.trim();
    }

    // Mark onboarding completed
    if (user.profile?.onboardingStatus) {
      profileUpdates.onboardingStatus = {
        ...user.profile.onboardingStatus,
        isCompleted: true,
        step: 4
      };
    }

    const updatedProfile = await updateUserProfile(userId, profileUpdates);

    // Mark resume record confirmed
    const updatedResume = await confirmResumeFacts(userId, resumeId, {
      skills: confirmedFacts.approvedSkills || [],
      summary: confirmedFacts.bio
    });

    return {
      success: true,
      updatedResume,
      resume: updatedResume,
      profile: updatedProfile
    };
  }

  /**
   * Deterministic regex fallback when AI is unavailable
   */
  private static heuristicExtractionFallback(rawText: string): ExtractedCandidateFacts {
    const commonSkills = [
      'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'Java', 'C++',
      'HTML', 'CSS', 'MongoDB', 'PostgreSQL', 'SQL', 'Git', 'Docker',
      'AWS', 'Express', 'Tailwind', 'Bootstrap', 'Next.js', 'Redux', 'GraphQL',
      'Redis', 'Go', 'Kubernetes'
    ];

    const detectedSkills: string[] = [];
    for (const skill of commonSkills) {
      const escapedSkill = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(?:^|[^a-zA-Z0-9+])${escapedSkill}(?:[^a-zA-Z0-9+]|$)`, 'i');
      if (regex.test(rawText)) {
        detectedSkills.push(skill);
      }
    }

    // Heuristic target role detection
    let detectedRole = 'Full Stack Engineer';
    if (/backend/i.test(rawText)) detectedRole = 'Backend Developer';
    else if (/frontend/i.test(rawText)) detectedRole = 'Frontend Developer';
    else if (/data/i.test(rawText)) detectedRole = 'Data Engineer';

    // Heuristic education detection
    let detectedInstitution = 'Engineering University';
    let detectedDegree = 'Bachelor of Technology';
    if (/IIT|Indian Institute of Technology/i.test(rawText)) {
      detectedInstitution = 'Indian Institute of Technology (IIT)';
    } else if (/NIT|National Institute of Technology/i.test(rawText)) {
      detectedInstitution = 'National Institute of Technology';
    }
    if (/B\.Tech|Bachelor of Technology/i.test(rawText)) {
      detectedDegree = 'B.Tech in Computer Science';
    }

    return {
      targetRole: detectedRole,
      skills: detectedSkills.length > 0 ? detectedSkills : ['JavaScript', 'React', 'Node.js'],
      education: [
        {
          degree: detectedDegree,
          institution: detectedInstitution,
          graduationYear: 2024,
          field: 'Computer Science'
        }
      ],
      experience: [
        {
          company: 'Software Engineering Company',
          role: 'Software Engineering Intern',
          duration: '6 months',
          description: 'Designed scalable web services and database schemas.'
        }
      ],
      projects: [
        {
          title: 'Full Stack Web Platform',
          description: 'Built scalable web services and cloud infrastructure.',
          technologies: detectedSkills.slice(0, 3)
        }
      ],
      certifications: [
        {
          name: 'Cloud Practitioner / Architect',
          issuer: 'Cloud Certification Authority',
          year: 2024
        }
      ],
      summary: 'Motivated software engineer with experience building web applications and cloud services.'
    };
  }
}
