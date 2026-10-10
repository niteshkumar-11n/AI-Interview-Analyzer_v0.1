/**
 * User/Profile Routes
 */
import { Router } from 'express';
import { getProfile, updateProfile, saveOnboardingStep, skipOnboardingResume } from '../controllers/userController.ts';
import { authMiddleware } from '../middleware/authMiddleware.ts';

const router = Router();

router.get('/', authMiddleware, getProfile);
router.put('/', authMiddleware, updateProfile);
router.post('/onboarding/step', authMiddleware, saveOnboardingStep);
router.post('/onboarding/skip', authMiddleware, skipOnboardingResume);

export default router;
