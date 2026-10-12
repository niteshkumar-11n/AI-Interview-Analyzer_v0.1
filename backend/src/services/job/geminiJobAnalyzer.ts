/**
 * Gemini Job Description Analyzer Service
 * Uses Google Gemini AI to analyze job descriptions and compare them against resumes.
 * Returns structured JSON with match scores, skill gaps, and learning recommendations.
 */
import { GoogleGenAI } from '@google/genai';
import { config } from '../../config/env.ts';

export interface GeminiJDAnalysisResult {
  jobPosting: {
    title: string;
    company: string;
    location: string;
    experienceRequired: string;
    educationRequired: string;
  };
  extractedRequirements: {
    mustHaveSkills: string[];
    niceToHaveSkills: string[];
    technologiesMentioned: string[];
    keyResponsibilities: string[];
  };
  matchAnalysis: {
    overallMatchScore: number;
    skillsMatchPercent: number;
    experienceMatchPercent: number;
    educationMatchPercent: number;
    projectRelevancePercent: number;
  };
  skillComparison: {
    matchedSkills: string[];
    partialSkills: { name: string; note: string }[];
    missingSkills: { name: string; priority: 'Critical' | 'Moderate' | 'Low'; scoreImpact: string }[];
  };
  learningPath: {
    title: string;
    description: string;
    duration: string;
  }[];
  summary: string;
  improvementTips: string[];
}

const ANALYSIS_PROMPT = `You are an expert career counselor and technical recruiter AI. 
Analyze the following Job Description against the Candidate's Resume.

Return a VALID JSON object (no markdown, no code fences, just pure JSON) with the following exact structure:

{
  "jobPosting": {
    "title": "extracted job title",
    "company": "extracted company name (or 'Unknown Company' if not found)",
    "location": "extracted location (or 'Not Specified')",
    "experienceRequired": "extracted experience requirement (e.g., '2-4 years')",
    "educationRequired": "extracted education requirement"
  },
  "extractedRequirements": {
    "mustHaveSkills": ["skill1", "skill2"],
    "niceToHaveSkills": ["skill1", "skill2"],
    "technologiesMentioned": ["tech1", "tech2"],
    "keyResponsibilities": ["responsibility1", "responsibility2"]
  },
  "matchAnalysis": {
    "overallMatchScore": 78,
    "skillsMatchPercent": 80,
    "experienceMatchPercent": 70,
    "educationMatchPercent": 85,
    "projectRelevancePercent": 72
  },
  "skillComparison": {
    "matchedSkills": ["skill1", "skill2"],
    "partialSkills": [{"name": "skill1", "note": "reason for partial match"}],
    "missingSkills": [{"name": "skill1", "priority": "Critical", "scoreImpact": "+8% match score"}]
  },
  "learningPath": [
    {"title": "Learning Step Title", "description": "What to learn and how", "duration": "1-2 weeks"}
  ],
  "summary": "A 2-3 sentence summary of the overall match and key insights",
  "improvementTips": ["tip1", "tip2", "tip3"]
}

IMPORTANT RULES:
- Be realistic and honest with match scores (0-100 scale)
- Priority should be 'Critical', 'Moderate', or 'Low'
- Provide actionable, specific learning paths based on actual skill gaps
- Keep learning path items to 3-5 max
- If resume text is empty or minimal, assume a fresh graduate with basic CS knowledge
- Always return valid JSON, nothing else

---

JOB DESCRIPTION:
{JOB_DESCRIPTION}

---

CANDIDATE RESUME:
{RESUME_TEXT}
`;

/**
 * Analyzes a job description against a resume using Google Gemini
 */
export async function analyzeJobWithGemini(
  jobDescriptionText: string,
  resumeText: string
): Promise<GeminiJDAnalysisResult> {
  if (!config.geminiApiKey) {
    throw new Error('GEMINI_API_KEY is not configured. Set it in your .env file.');
  }

  const ai = new GoogleGenAI({ apiKey: config.geminiApiKey });

  const prompt = ANALYSIS_PROMPT
    .replace('{JOB_DESCRIPTION}', jobDescriptionText)
    .replace('{RESUME_TEXT}', resumeText || 'No resume provided. Assume fresh CS graduate with basic HTML, CSS, JavaScript knowledge.');

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const rawText = response.text?.trim() || '';

    // Try to parse the response as JSON
    // Sometimes Gemini wraps it in ```json ... ``` fences
    let jsonText = rawText;
    const jsonMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonText = jsonMatch[1].trim();
    }

    const parsed = JSON.parse(jsonText) as GeminiJDAnalysisResult;

    // Validate essential fields exist
    if (!parsed.jobPosting || !parsed.matchAnalysis || !parsed.skillComparison) {
      throw new Error('Gemini response missing required fields');
    }

    // Clamp scores to 0-100
    const ma = parsed.matchAnalysis;
    ma.overallMatchScore = Math.max(0, Math.min(100, ma.overallMatchScore));
    ma.skillsMatchPercent = Math.max(0, Math.min(100, ma.skillsMatchPercent));
    ma.experienceMatchPercent = Math.max(0, Math.min(100, ma.experienceMatchPercent));
    ma.educationMatchPercent = Math.max(0, Math.min(100, ma.educationMatchPercent));
    ma.projectRelevancePercent = Math.max(0, Math.min(100, ma.projectRelevancePercent));

    return parsed;
  } catch (error: any) {
    console.error('[GeminiJobAnalyzer] Error:', error.message);
    throw new Error(`Gemini analysis failed: ${error.message}`);
  }
}
