/**
 * Razorpay Payment Gateway Service
 * Server-side order generation and cryptographic HMAC-SHA256 signature verification.
 */
import crypto from 'node:crypto';
import Razorpay from 'razorpay';
import { config } from '../../config/env.ts';

let razorpayClient: Razorpay | null = null;

export function getRazorpayClient(): Razorpay | null {
  if (razorpayClient) return razorpayClient;

  if (config.razorpayKeyId && config.razorpayKeySecret) {
    try {
      razorpayClient = new Razorpay({
        key_id: config.razorpayKeyId,
        key_secret: config.razorpayKeySecret
      });
      return razorpayClient;
    } catch (err: any) {
      console.error('[RazorpayService] Failed to initialize client:', err.message);
      return null;
    }
  }

  return null;
}

export function isRazorpayConfigured(): boolean {
  return Boolean(
    config.razorpayKeyId &&
    config.razorpayKeySecret &&
    !config.razorpayKeyId.includes('your_') &&
    !config.razorpayKeySecret.includes('your_')
  );
}

export interface CreateOrderParams {
  amountInr: number;
  receipt: string;
  notes?: Record<string, string>;
}

export async function createOrder(params: CreateOrderParams): Promise<{
  id: string;
  amount: number;
  currency: string;
  keyId: string;
}> {
  const client = getRazorpayClient();
  if (!client || !isRazorpayConfigured()) {
    throw new Error('Razorpay is not configured on the server. Please verify RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.');
  }

  const amountPaise = Math.round(params.amountInr * 100);
  if (amountPaise <= 0) {
    throw new Error('Order amount must be greater than zero.');
  }

  const options = {
    amount: amountPaise,
    currency: 'INR',
    receipt: params.receipt,
    notes: params.notes || {}
  };

  const order = await client.orders.create(options);

  return {
    id: order.id,
    amount: Number(order.amount),
    currency: order.currency || 'INR',
    keyId: config.razorpayKeyId
  };
}

export interface VerifySignatureParams {
  orderId: string;
  paymentId: string;
  signature: string;
}

export function verifyPaymentSignature(params: VerifySignatureParams): boolean {
  if (!params.orderId || !params.paymentId || !params.signature) {
    return false;
  }

  if (!config.razorpayKeySecret) {
    throw new Error('Razorpay Key Secret is missing on the server.');
  }

  const body = `${params.orderId}|${params.paymentId}`;
  const expectedSignature = crypto
    .createHmac('sha256', config.razorpayKeySecret)
    .update(body)
    .digest('hex');

  // Use timingSafeEqual to protect against side-channel timing attacks
  try {
    const expectedBuf = Buffer.from(expectedSignature, 'utf8');
    const providedBuf = Buffer.from(params.signature, 'utf8');

    if (expectedBuf.length !== providedBuf.length) {
      return false;
    }

    return crypto.timingSafeEqual(expectedBuf, providedBuf);
  } catch (err) {
    console.error('[RazorpayService] Signature check error:', err);
    return false;
  }
}
