/**
 * Resume Enrichment Service
 * Handles optional candidate resume processing to extract structured profile facts.
 * STRICTLY NO ATS SCORES, NO ATS PERCENTAGES, NO JOB DESCRIPTION COMPARISON.
 */
import { GoogleGenAI } from '@google/genai';
import { config } from '../../config/env.ts';
import { ExtractedCandidateFacts, createResumeRecord, confirmResumeFacts } from '../../models/Resume.ts';
import { findUserById, updateUserProfile } from '../../models/User.ts';

const FACT_EXTRACTION_PROMPT = `You are a profile data extraction assistant for an engineering career platform.
Extract structured candidate facts from the provided resume text to help pre-fill the candidate's profile.

CRITICAL RULES:
- DO NOT calculate an ATS score.
- DO NOT compare this resume against any job description.
- DO NOT generate ATS match ratings or compatibility percentages.
- Only extract objective candidate facts: technical skills, education history, work experience, and a short bio/summary.

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
  "summary": "1-2 sentence professional bio"
}

RESUME TEXT:
`;

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
    extractedFacts: ExtractedCandidateFacts;
    profileDiff: {
      newSkills: string[];
      existingSkills: string[];
      detectedEducation: string;
      detectedExperience: string;
    };
  }> {
    const user = await findUserById(userId);
    const existingSkills = (user?.profile?.skills || []).map((s) => s.name);

    let extracted: ExtractedCandidateFacts;

    if (config.geminiApiKey && rawText.trim().length > 20) {
      try {
        const ai = new GoogleGenAI({ apiKey: config.geminiApiKey });
        const response = await ai.models.generateContent({
          model: 'gemini-2.0-flash',
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

    // Compute diff against profile
    const existingSet = new Set(existingSkills.map((s) => s.toLowerCase()));
    const newSkills = (extracted.skills || []).filter((s) => !existingSet.has(s.toLowerCase()));

    const detectedEducation = extracted.education?.[0]?.degree || extracted.education?.[0]?.institution || '';
    const detectedExperience = extracted.experience?.[0]?.role
      ? `${extracted.experience[0].role} at ${extracted.experience[0].company || 'Tech Company'}`
      : '';

    return {
      resumeId: resume.id,
      extractedFacts: extracted,
      profileDiff: {
        newSkills,
        existingSkills,
        detectedEducation,
        detectedExperience
      }
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
    }
  ) {
    const user = await findUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

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

    if (confirmedFacts.targetRole && confirmedFacts.targetRole.trim()) {
      profileUpdates.targetRole = confirmedFacts.targetRole.trim();
    }
    if (confirmedFacts.education && confirmedFacts.education.trim()) {
      profileUpdates.education = confirmedFacts.education.trim();
    }
    if (confirmedFacts.experience && confirmedFacts.experience.trim()) {
      profileUpdates.experience = confirmedFacts.experience.trim();
    }
    if (confirmedFacts.bio && confirmedFacts.bio.trim()) {
      profileUpdates.bio = confirmedFacts.bio.trim();
    }

    // Mark onboarding completed if user reached step 3
    if (user.profile?.onboardingStatus) {
      profileUpdates.onboardingStatus = {
        ...user.profile.onboardingStatus,
        isCompleted: true,
        step: 3
      };
    }

    await updateUserProfile(userId, profileUpdates);

    // Mark resume record confirmed
    const updatedResume = await confirmResumeFacts(userId, resumeId, {
      skills: confirmedFacts.approvedSkills || [],
      summary: confirmedFacts.bio
    });

    return {
      success: true,
      updatedResume,
      profileUpdates
    };
  }

  /**
   * Deterministic regex fallback when AI is unavailable
   */
  private static heuristicExtractionFallback(rawText: string): ExtractedCandidateFacts {
    const commonSkills = [
      'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'Java', 'C++',
      'HTML', 'CSS', 'MongoDB', 'PostgreSQL', 'SQL', 'Git', 'Docker',
      'AWS', 'Express', 'Tailwind', 'Bootstrap', 'Next.js', 'Redux', 'GraphQL'
    ];

    const detectedSkills: string[] = [];
    for (const skill of commonSkills) {
      const regex = new RegExp(`\\b${skill}\\b`, 'i');
      if (regex.test(rawText)) {
        detectedSkills.push(skill);
      }
    }

    return {
      skills: detectedSkills.length > 0 ? detectedSkills : ['JavaScript', 'React', 'Node.js'],
      education: [
        {
          degree: 'Bachelor of Technology',
          institution: 'Engineering College',
          graduationYear: 2025,
          field: 'Computer Science'
        }
      ],
      experience: [],
      summary: 'Software engineering candidate'
    };
  }
}
