/**
 * Job Routes
 * POST /api/job/analyze - Analyze JD against resume using Google Gemini
 * GET  /api/job/recommendations - Fetch real job listings from Adzuna based on user skills
 */
import { Router, Request, Response } from 'express';
import { analyzeJobWithGemini } from '../services/job/geminiJobAnalyzer.ts';
import { searchAdzunaJobs } from '../services/job/adzunaService.ts';

const router = Router();

/**
 * POST /api/job/analyze
 * Body: { jobDescription: string, resumeText: string }
 * Returns: Gemini-powered analysis result
 */
router.post('/analyze', async (req: Request, res: Response) => {
  try {
    const { jobDescription, resumeText } = req.body;

    if (!jobDescription || typeof jobDescription !== 'string' || jobDescription.trim().length < 20) {
      return res.status(400).json({
        success: false,
        message: 'Job description text is required (minimum 20 characters).',
      });
    }

    console.log(`[Job Analyzer] Analyzing JD (${jobDescription.length} chars) against resume (${(resumeText || '').length} chars)`);

    const result = await analyzeJobWithGemini(jobDescription.trim(), (resumeText || '').trim());

    return res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('[Job Analyzer] Error:', error.message);

    if (error.message.includes('GEMINI_API_KEY')) {
      return res.status(503).json({
        success: false,
        message: 'Gemini API key not configured. Please set GEMINI_API_KEY in your .env file.',
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to analyze job description.',
    });
  }
});

/**
 * GET /api/job/recommendations
 * Query params:
 *   skills      - comma-separated skill names (e.g. "React,Node.js,TypeScript")
 *   country     - ISO 2-letter country code (default: "in")
 *   page        - page number (default: 1)
 *   per_page    - results per page (default: 20, max 50)
 *   location    - optional location filter
 *   salary_min  - optional minimum salary
 *   salary_max  - optional maximum salary
 *   full_time   - set to 1 for full-time only
 *   sort_by     - sort order (default, salary, date, relevance)
 */
router.get('/recommendations', async (req: Request, res: Response) => {
  try {
    const {
      skills,
      country,
      page,
      per_page,
      location,
      salary_min,
      salary_max,
      full_time,
      sort_by,
    } = req.query;

    // Parse skills from comma-separated string
    const skillsArray = typeof skills === 'string' && skills.trim()
      ? skills.split(',').map(s => s.trim()).filter(Boolean)
      : [];

    if (skillsArray.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one skill is required. Pass skills as a comma-separated query parameter.',
      });
    }

    console.log(`[Job Recommendations] Searching for skills: ${skillsArray.join(', ')}`);

    const result = await searchAdzunaJobs({
      skills: skillsArray,
      country: typeof country === 'string' ? country : 'in',
      page: page ? parseInt(String(page), 10) : 1,
      resultsPerPage: per_page ? Math.min(parseInt(String(per_page), 10), 50) : 20,
      location: typeof location === 'string' ? location : undefined,
      salaryMin: salary_min ? parseInt(String(salary_min), 10) : undefined,
      salaryMax: salary_max ? parseInt(String(salary_max), 10) : undefined,
      fullTime: full_time ? parseInt(String(full_time), 10) : undefined,
      sortBy: typeof sort_by === 'string' ? sort_by : undefined,
    });

    return res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('[Job Recommendations] Error:', error.message);

    if (error.message.includes('ADZUNA_APP_ID')) {
      return res.status(503).json({
        success: false,
        message: 'Adzuna API credentials not configured. Set ADZUNA_APP_ID and ADZUNA_APP_KEY in .env.',
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch job recommendations.',
    });
  }
});

export default router;
