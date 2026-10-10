/**
 * Payment & Wallet Routes
 */
import { Router } from 'express';
import { authMiddleware, optionalAuthMiddleware } from '../middleware/authMiddleware.ts';
import {
  getPackages,
  getWallet,
  createPaymentOrder,
  verifyPayment,
  getTransactionHistory
} from '../controllers/paymentController.ts';

const router = Router();

// Public package listing
router.get('/packages', getPackages);

// Authenticated wallet routes
router.get('/wallet', authMiddleware, getWallet);
router.post('/order', authMiddleware, createPaymentOrder);
router.post('/verify', authMiddleware, verifyPayment);
router.get('/transactions', authMiddleware, getTransactionHistory);

export default router;
