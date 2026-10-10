/**
 * Payment & Credit Wallet Controller
 * Secure server-authoritative Razorpay order management, signature verification, and credit ledger.
 */
import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware.ts';
import { CREDIT_CONFIG, getPackageById } from '../config/creditConfig.ts';
import {
  createPaymentRecord,
  findPaymentByOrderId,
  updatePaymentStatus
} from '../models/Payment.ts';
import {
  getUserCredits,
  addUserCredits,
  findUserById
} from '../models/User.ts';
import {
  recordTransaction,
  getUserTransactions
} from '../models/Transaction.ts';
import {
  createOrder as createRazorpayOrder,
  verifyPaymentSignature,
  isRazorpayConfigured
} from '../services/payment/razorpayService.ts';
import { config } from '../config/env.ts';

/**
 * Public catalog of available credit packages
 */
export async function getPackages(_req: any, res: Response) {
  return res.json({
    success: true,
    data: {
      packages: Object.values(CREDIT_CONFIG.PACKAGES),
      featureCosts: CREDIT_CONFIG.COSTS,
      isGatewayConfigured: isRazorpayConfigured(),
      razorpayKeyId: config.razorpayKeyId
    }
  });
}

/**
 * Get authenticated user's current credit balance & wallet summary
 */
export async function getWallet(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    const credits = await getUserCredits(req.user.id);
    const transactions = await getUserTransactions(req.user.id, 10);

    return res.json({
      success: true,
      data: {
        credits,
        userId: req.user.id,
        email: req.user.email,
        recentTransactions: transactions,
        canStartInterview: credits >= CREDIT_CONFIG.COSTS.AI_TECHNICAL_INTERVIEW,
        interviewCost: CREDIT_CONFIG.COSTS.AI_TECHNICAL_INTERVIEW
      }
    });
  } catch (err: any) {
    console.error('[PaymentController] getWallet error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve wallet information.' });
  }
}

/**
 * Create a new Razorpay payment order for a package
 * Server enforces authoritative prices and credit amounts based on planId.
 */
export async function createPaymentOrder(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    const { planId } = req.body;
    if (!planId) {
      return res.status(400).json({ success: false, message: 'Package planId is required.' });
    }

    // Server-side authoritative validation
    const selectedPackage = getPackageById(planId);
    if (!selectedPackage) {
      return res.status(400).json({ success: false, message: `Invalid package ID "${planId}".` });
    }

    if (selectedPackage.priceInr <= 0) {
      return res.status(400).json({ success: false, message: 'Free package cannot be purchased through payment gateway.' });
    }

    if (!isRazorpayConfigured()) {
      return res.status(503).json({
        success: false,
        message: 'Payment gateway is currently in test mode or unconfigured. Please configure RAZORPAY_KEY_ID & RAZORPAY_KEY_SECRET.'
      });
    }

    const receipt = `rcpt_${Date.now()}_${req.user.id.slice(-4)}`;

    const razorpayOrder = await createRazorpayOrder({
      amountInr: selectedPackage.priceInr,
      receipt,
      notes: {
        userId: req.user.id,
        planId: selectedPackage.id,
        credits: String(selectedPackage.credits)
      }
    });

    // Store order in database
    await createPaymentRecord({
      userId: req.user.id,
      planId: selectedPackage.id,
      amountInr: selectedPackage.priceInr,
      credits: selectedPackage.credits,
      razorpayOrderId: razorpayOrder.id,
      receipt
    });

    return res.json({
      success: true,
      data: {
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        keyId: razorpayOrder.keyId,
        plan: selectedPackage
      }
    });
  } catch (err: any) {
    console.error('[PaymentController] createPaymentOrder error:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Failed to initiate payment order.'
    });
  }
}

/**
 * Verify Razorpay payment signature and grant credits idempotently
 */
export async function verifyPayment(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Missing required Razorpay payment verification fields.'
      });
    }

    // 1. Look up payment order in database
    const payment = await findPaymentByOrderId(razorpay_order_id);
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'No order record found for this transaction.'
      });
    }

    // 2. Strict ownership check
    if (payment.userId.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized. This payment order does not belong to your account.'
      });
    }

    // 3. Idempotency: Prevent duplicate credit grants
    if (payment.status === 'paid') {
      const currentBalance = await getUserCredits(req.user.id);
      return res.json({
        success: true,
        message: 'Payment has already been verified and credited.',
        data: {
          credits: currentBalance,
          alreadyProcessed: true
        }
      });
    }

    // 4. Cryptographic HMAC-SHA256 signature verification
    const isValid = verifyPaymentSignature({
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature
    });

    if (!isValid) {
      await updatePaymentStatus(razorpay_order_id, {
        status: 'failed',
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature
      });

      return res.status(400).json({
        success: false,
        message: 'Cryptographic signature verification failed. Payment cannot be verified.'
      });
    }

    // 5. Update payment status to 'paid'
    await updatePaymentStatus(razorpay_order_id, {
      status: 'paid',
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature
    });

    // 6. Grant credits to user atomically
    const creditResult = await addUserCredits(req.user.id, payment.credits);

    // 7. Record transaction ledger record
    await recordTransaction({
      userId: req.user.id,
      type: 'PURCHASE',
      amountInr: payment.amountInr,
      credits: payment.credits,
      balanceAfter: creditResult.newCredits,
      description: `Purchased ${payment.credits} Credits (${payment.planId.toUpperCase()} Pack)`,
      referenceId: razorpay_payment_id,
      status: 'SUCCESS'
    });

    return res.json({
      success: true,
      message: `Payment verified successfully! ${payment.credits} credits added to your wallet.`,
      data: {
        credits: creditResult.newCredits,
        creditsAdded: payment.credits,
        paymentId: razorpay_payment_id
      }
    });
  } catch (err: any) {
    console.error('[PaymentController] verifyPayment error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to verify payment: ' + (err.message || 'Internal server error.')
    });
  }
}

/**
 * Get user transaction history
 */
export async function getTransactionHistory(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    const transactions = await getUserTransactions(req.user.id, 100);

    return res.json({
      success: true,
      data: transactions
    });
  } catch (err: any) {
    console.error('[PaymentController] getTransactionHistory error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to load transaction history.'
    });
  }
}
