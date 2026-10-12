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

const uploadMiddleware = upload.fields([
  { name: 'file', maxCount: 1 },
  { name: 'resume', maxCount: 1 }
]);

router.post('/upload', authMiddleware, uploadMiddleware, uploadResume);
router.post('/confirm', authMiddleware, confirmResume);
router.post('/:id/confirm', authMiddleware, confirmResume);
router.get('/status', authMiddleware, getResumeStatus);
router.get('/context', authMiddleware, getCandidateContext);

export default router;
