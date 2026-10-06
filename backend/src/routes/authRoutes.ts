/**
 * Auth Routes
 */
import { Router } from 'express';
import { register, login, logout, getMe, forgotPassword, resetPassword } from '../controllers/authController.ts';
import { authMiddleware } from '../middleware/authMiddleware.ts';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', authMiddleware, getMe);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

export default router;
