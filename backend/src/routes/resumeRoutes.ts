/**
 * Resume & Candidate Context Routes
 * Provides optional resume upload, candidate fact confirmation, and shared context endpoint.
 * NO ATS SCORING ROUTES.
 */
import { Router } from 'express';
import multer from 'multer';
import { 
  uploadResume, 
  confirmResume, 
  getResumeStatus, 
  getCandidateContext 
} from '../controllers/resumeController.ts';
import { authMiddleware } from '../middleware/authMiddleware.ts';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

router.post('/upload', authMiddleware, upload.single('file'), uploadResume);
router.post('/confirm', authMiddleware, confirmResume);
router.get('/status', authMiddleware, getResumeStatus);
router.get('/context', authMiddleware, getCandidateContext);

export default router;
