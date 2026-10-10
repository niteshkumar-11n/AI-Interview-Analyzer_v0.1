/**
 * Technical Interview Routes
 */
import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware.ts';
import {
  generateInterview,
  submitAnswer,
  finishInterview,
  getMyInterviews,
  getInterviewReport
} from '../controllers/interviewController.ts';

const router = Router();

// Protected interview workflow endpoints
router.post('/generate-questions', authMiddleware, generateInterview);
router.post('/submit-answer', authMiddleware, submitAnswer);
router.post('/finish', authMiddleware, finishInterview);
router.get('/history', authMiddleware, getMyInterviews);
router.get('/report/:id', authMiddleware, getInterviewReport);

export default router;
