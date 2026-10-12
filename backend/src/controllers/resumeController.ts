/**
 * Resume & Candidate Context Controller
 * Handles optional resume upload, candidate fact review/confirmation, and context retrieval.
 * STRICTLY NO ATS SCORING OR ATS REPORTS.
 */
import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware.ts';
import { ResumeEnrichmentService } from '../services/resume/resumeEnrichmentService.ts';
import { CandidateContextService } from '../services/candidate/candidateContextService.ts';
import { getLatestUserResume, getResumeById } from '../models/Resume.ts';
import { validateResumeFile, extractTextFromBuffer } from '../utils/textExtractor.ts';

/**
 * POST /api/resume/upload
 * Optional resume upload for candidate profile enrichment
 */
export async function uploadResume(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    const userId = req.user.id;
    let fileName = 'resume.txt';
    let fileSize = 0;
    let mimeType = 'text/plain';
    let rawText = '';

    const uploadedFile = req.file || (req.files && (req.files as any)['file']?.[0]) || (req.files && (req.files as any)['resume']?.[0]);

    if (uploadedFile) {
      fileName = uploadedFile.originalname;
      fileSize = uploadedFile.size;
      mimeType = uploadedFile.mimetype;

      // Validate file type and size
      const validation = validateResumeFile(fileName, fileSize, mimeType);
      if (!validation.valid) {
        return res.status(400).json({
          success: false,
          message: validation.error,
          error: validation.error
        });
      }

      // Extract text safely from buffer
      const extracted = extractTextFromBuffer(uploadedFile.buffer, fileName, mimeType);
      rawText = extracted.text;
    } else if (req.body.resumeText) {
      rawText = String(req.body.resumeText).trim();
      fileName = req.body.fileName || 'resume_pasted.txt';
      fileSize = Buffer.byteLength(rawText, 'utf-8');
      mimeType = 'text/plain';

      if (fileSize > 5 * 1024 * 1024) {
        return res.status(400).json({
          success: false,
          message: 'Resume text exceeds maximum limit of 5MB.',
          error: 'Resume text exceeds maximum limit of 5MB.'
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        message: 'No file or resume text provided.',
        error: 'No file or resume text provided.'
      });
    }

    if (!rawText || rawText.trim().length < 15) {
      return res.status(400).json({
        success: false,
        message: 'Could not extract readable text from document. Please ensure the file is not empty or corrupted, or paste your resume text.',
        error: 'Could not extract readable text from document.'
      });
    }

    const result = await ResumeEnrichmentService.extractFactsFromText(
      userId,
      fileName,
      fileSize,
      mimeType,
      rawText
    );

    return res.json({
      success: true,
      message: 'Resume analyzed successfully for profile enrichment (No ATS scoring).',
      data: result,
      ...result
    });
  } catch (err: any) {
    console.error('uploadResume error:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Failed to process resume for profile enrichment.',
      error: err.message
    });
  }
}

/**
 * POST /api/resume/confirm or POST /api/resume/:id/confirm
 * Reviews, edits, and confirms extracted candidate facts to merge into profile
 */
export async function confirmResume(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    const resumeId = req.params.id || req.body.resumeId;
    if (!resumeId) {
      return res.status(400).json({ success: false, message: 'resumeId is required.' });
    }

    const confirmedFacts = req.body.confirmedFacts || req.body;

    // Authenticated ownership check: verify resume belongs to requesting user
    const existingResume = await getResumeById(resumeId, req.user.id);
    if (!existingResume) {
      return res.status(404).json({
        success: false,
        message: 'Resume record not found or access unauthorized.',
        error: 'Resume record not found or access unauthorized.'
      });
    }

    const result = await ResumeEnrichmentService.confirmAndMerge(
      req.user.id,
      resumeId,
      confirmedFacts || {}
    );

    return res.json({
      success: true,
      message: 'Candidate facts confirmed and profile enriched successfully!',
      data: result,
      ...result
    });
  } catch (err: any) {
    console.error('confirmResume error:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Failed to confirm resume facts.',
      error: err.message
    });
  }
}

/**
 * GET /api/resume/status
 * Retrieves current resume enrichment status
 */
export async function getResumeStatus(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    const latest = await getLatestUserResume(req.user.id);
    return res.json({
      success: true,
      hasResume: Boolean(latest),
      resume: latest,
      data: {
        hasResume: Boolean(latest),
        resume: latest
      }
    });
  } catch (err: any) {
    console.error('getResumeStatus error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve resume status.' });
  }
}

/**
 * GET /api/candidate/context
 * Returns unified candidate context for feature consumption
 */
export async function getCandidateContext(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    const feature = String(req.query.feature || '').toLowerCase();
    let data: any;

    if (feature === 'interview') {
      data = await CandidateContextService.getContextForInterview(req.user.id);
    } else if (feature === 'jobs') {
      data = await CandidateContextService.getContextForJobs(req.user.id);
    } else if (feature === 'coding') {
      data = await CandidateContextService.getContextForCoding(req.user.id);
    } else if (feature === 'github') {
      data = await CandidateContextService.getContextForGitHub(req.user.id);
    } else {
      data = await CandidateContextService.getCandidateContext(req.user.id);
    }

    if (!data) {
      return res.status(404).json({ success: false, message: 'Candidate context not found.' });
    }

    return res.json({
      success: true,
      data,
      context: data
    });
  } catch (err: any) {
    console.error('getCandidateContext error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve candidate context.' });
  }
}
