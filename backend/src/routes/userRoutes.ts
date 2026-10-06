/**
 * User/Profile Routes
 */
import { Router } from 'express';
import { getProfile, updateProfile } from '../controllers/userController.ts';
import { authMiddleware } from '../middleware/authMiddleware.ts';

const router = Router();

router.get('/', authMiddleware, getProfile);
router.put('/', authMiddleware, updateProfile);

export default router;
