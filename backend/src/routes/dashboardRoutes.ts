/**
 * Dashboard Routes
 */
import { Router } from 'express';
import { getDashboard, recordMockInterview, applyToJob, bookmarkIssue } from '../controllers/dashboardController.ts';
import { authMiddleware, optionalAuthMiddleware } from '../middleware/authMiddleware.ts';

const router = Router();

router.get('/', optionalAuthMiddleware, getDashboard);
router.post('/mock-interview', authMiddleware, recordMockInterview);
router.post('/jobs/:id/apply', authMiddleware, applyToJob);
router.post('/issues/:id/bookmark', authMiddleware, bookmarkIssue);

export default router;
