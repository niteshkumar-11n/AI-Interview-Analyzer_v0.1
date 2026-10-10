/**
 * Resume & Candidate Context Controller
 * Handles optional resume upload, candidate fact review/confirmation, and context retrieval.
 * STRICTLY NO ATS SCORING OR ATS REPORTS.
 */
import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware.ts';
import { ResumeEnrichmentService } from '../services/resume/resumeEnrichmentService.ts';
import { CandidateContextService } from '../services/candidate/candidateContextService.ts';
import { getLatestUserResume } from '../models/Resume.ts';

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

    if (req.file) {
      fileName = req.file.originalname;
      fileSize = req.file.size;
      mimeType = req.file.mimetype;
      // Convert buffer to UTF-8 text (or extracted plain string)
      rawText = req.file.buffer.toString('utf-8');
    } else if (req.body.resumeText) {
      rawText = String(req.body.resumeText).trim();
      fileName = req.body.fileName || 'resume_pasted.txt';
      fileSize = Buffer.byteLength(rawText, 'utf-8');
      mimeType = 'text/plain';
    }

    if (!rawText || rawText.length < 15) {
      return res.status(400).json({
        success: false,
        message: 'No readable resume content provided. Please upload a valid document or paste text.'
      });
    }

    // Size limit check: 5MB max
    if (fileSize > 5 * 1024 * 1024) {
      return res.status(400).json({
        success: false,
        message: 'File size exceeds maximum limit of 5MB.'
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
      data: result
    });
  } catch (err: any) {
    console.error('uploadResume error:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Failed to process resume for profile enrichment.'
    });
  }
}

/**
 * POST /api/resume/confirm
 * Reviews, edits, and confirms extracted candidate facts to merge into profile
 */
export async function confirmResume(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    const { resumeId, confirmedFacts } = req.body;
    if (!resumeId) {
      return res.status(400).json({ success: false, message: 'resumeId is required.' });
    }

    const result = await ResumeEnrichmentService.confirmAndMerge(
      req.user.id,
      resumeId,
      confirmedFacts || {}
    );

    return res.json({
      success: true,
      message: 'Candidate facts confirmed and profile enriched successfully!',
      data: result
    });
  } catch (err: any) {
    console.error('confirmResume error:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Failed to confirm resume facts.'
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
      data: latest
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

    const context = await CandidateContextService.getCandidateContext(req.user.id);
    if (!context) {
      return res.status(404).json({ success: false, message: 'Candidate context not found.' });
    }

    return res.json({
      success: true,
      data: context
    });
  } catch (err: any) {
    console.error('getCandidateContext error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve candidate context.' });
  }
}
