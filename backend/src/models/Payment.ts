/**
 * Payment Model
 * Tracks Razorpay payment order lifecycle and server-side verification states.
 */
import mongoose, { Schema, Document } from 'mongoose';

export interface IPaymentDocument extends Document {
  userId: mongoose.Types.ObjectId | string;
  planId: string;
  amountInr: number;
  credits: number;
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  status: 'created' | 'paid' | 'failed';
  receipt: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentRecord {
  id: string;
  userId: string;
  planId: string;
  amountInr: number;
  credits: number;
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  status: 'created' | 'paid' | 'failed';
  receipt: string;
  createdAt: string;
  updatedAt: string;
}

const PaymentSchema = new Schema<IPaymentDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    planId: {
      type: String,
      required: true
    },
    amountInr: {
      type: Number,
      required: true
    },
    credits: {
      type: Number,
      required: true
    },
    razorpayOrderId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    razorpayPaymentId: {
      type: String,
      index: true
    },
    razorpaySignature: {
      type: String
    },
    status: {
      type: String,
      enum: ['created', 'paid', 'failed'],
      default: 'created',
      index: true
    },
    receipt: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
);

export const PaymentModel: mongoose.Model<IPaymentDocument> =
  (mongoose.models.Payment as mongoose.Model<IPaymentDocument>) ||
  mongoose.model<IPaymentDocument>('Payment', PaymentSchema);

// Fallback in-memory store
export const memoryPayments: Map<string, PaymentRecord> = new Map();

function isMongoConnected(): boolean {
  return mongoose.connection.readyState === 1;
}

export async function createPaymentRecord(data: {
  userId: string;
  planId: string;
  amountInr: number;
  credits: number;
  razorpayOrderId: string;
  receipt: string;
}): Promise<PaymentRecord> {
  if (isMongoConnected()) {
    try {
      const doc = await PaymentModel.create({
        userId: data.userId,
        planId: data.planId,
        amountInr: data.amountInr,
        credits: data.credits,
        razorpayOrderId: data.razorpayOrderId,
        receipt: data.receipt,
        status: 'created'
      });
      const record: PaymentRecord = {
        id: doc._id.toString(),
        userId: doc.userId.toString(),
        planId: doc.planId,
        amountInr: doc.amountInr,
        credits: doc.credits,
        razorpayOrderId: doc.razorpayOrderId,
        status: doc.status,
        receipt: doc.receipt,
        createdAt: doc.createdAt.toISOString(),
        updatedAt: doc.updatedAt.toISOString()
      };
      memoryPayments.set(record.razorpayOrderId, record);
      return record;
    } catch (err: any) {
      console.error('[DB] createPaymentRecord error:', err.message);
    }
  }

  const record: PaymentRecord = {
    id: `pay_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    userId: data.userId,
    planId: data.planId,
    amountInr: data.amountInr,
    credits: data.credits,
    razorpayOrderId: data.razorpayOrderId,
    status: 'created',
    receipt: data.receipt,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  memoryPayments.set(record.razorpayOrderId, record);
  return record;
}

export async function findPaymentByOrderId(orderId: string): Promise<PaymentRecord | null> {
  if (isMongoConnected()) {
    try {
      const doc = await PaymentModel.findOne({ razorpayOrderId: orderId }).lean();
      if (doc) {
        return {
          id: (doc as any)._id.toString(),
          userId: (doc as any).userId.toString(),
          planId: doc.planId,
          amountInr: doc.amountInr,
          credits: doc.credits,
          razorpayOrderId: doc.razorpayOrderId,
          razorpayPaymentId: doc.razorpayPaymentId,
          razorpaySignature: doc.razorpaySignature,
          status: doc.status,
          receipt: doc.receipt,
          createdAt: new Date(doc.createdAt).toISOString(),
          updatedAt: new Date(doc.updatedAt).toISOString()
        };
      }
    } catch (err) {
      console.warn('[DB] findPaymentByOrderId error:', err);
    }
  }

  return memoryPayments.get(orderId) || null;
}

export async function updatePaymentStatus(
  orderId: string,
  updates: {
    status: 'created' | 'paid' | 'failed';
    razorpayPaymentId?: string;
    razorpaySignature?: string;
  }
): Promise<PaymentRecord | null> {
  if (isMongoConnected()) {
    try {
      const doc = await PaymentModel.findOneAndUpdate(
        { razorpayOrderId: orderId },
        { $set: updates },
        { new: true }
      ).lean();
      if (doc) {
        const record: PaymentRecord = {
          id: (doc as any)._id.toString(),
          userId: (doc as any).userId.toString(),
          planId: doc.planId,
          amountInr: doc.amountInr,
          credits: doc.credits,
          razorpayOrderId: doc.razorpayOrderId,
          razorpayPaymentId: doc.razorpayPaymentId,
          razorpaySignature: doc.razorpaySignature,
          status: doc.status,
          receipt: doc.receipt,
          createdAt: new Date(doc.createdAt).toISOString(),
          updatedAt: new Date(doc.updatedAt).toISOString()
        };
        memoryPayments.set(orderId, record);
        return record;
      }
    } catch (err) {
      console.warn('[DB] updatePaymentStatus error:', err);
    }
  }

  const existing = memoryPayments.get(orderId);
  if (existing) {
    const updated: PaymentRecord = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    memoryPayments.set(orderId, updated);
    return updated;
  }

  return null;
}
