/**
 * Transaction Ledger Model
 * Records every wallet credit addition, deduction, purchase, and refund with full auditability.
 */
import mongoose, { Schema, Document } from 'mongoose';

export type TransactionType = 'PURCHASE' | 'DEDUCTION' | 'REFUND' | 'SIGNUP_BONUS';
export type TransactionStatus = 'SUCCESS' | 'PENDING' | 'FAILED';

export interface ITransactionDocument extends Document {
  userId: mongoose.Types.ObjectId | string;
  type: TransactionType;
  amountInr: number;
  credits: number;
  balanceAfter: number;
  description: string;
  referenceId?: string;
  status: TransactionStatus;
  createdAt: Date;
}

export interface TransactionRecord {
  id: string;
  userId: string;
  type: TransactionType;
  amountInr: number;
  credits: number;
  balanceAfter: number;
  description: string;
  referenceId?: string;
  status: TransactionStatus;
  createdAt: string;
}

const TransactionSchema = new Schema<ITransactionDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    type: {
      type: String,
      enum: ['PURCHASE', 'DEDUCTION', 'REFUND', 'SIGNUP_BONUS'],
      required: true,
      index: true
    },
    amountInr: {
      type: Number,
      default: 0
    },
    credits: {
      type: Number,
      required: true
    },
    balanceAfter: {
      type: Number,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    referenceId: {
      type: String,
      index: true
    },
    status: {
      type: String,
      enum: ['SUCCESS', 'PENDING', 'FAILED'],
      default: 'SUCCESS'
    }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const TransactionModel: mongoose.Model<ITransactionDocument> =
  (mongoose.models.Transaction as mongoose.Model<ITransactionDocument>) ||
  mongoose.model<ITransactionDocument>('Transaction', TransactionSchema);

// In-memory fallback transactions list
export const memoryTransactions: TransactionRecord[] = [];

function isMongoConnected(): boolean {
  return mongoose.connection.readyState === 1;
}

export async function recordTransaction(data: {
  userId: string;
  type: TransactionType;
  amountInr?: number;
  credits: number;
  balanceAfter: number;
  description: string;
  referenceId?: string;
  status?: TransactionStatus;
}): Promise<TransactionRecord> {
  const amountInr = data.amountInr || 0;
  const status = data.status || 'SUCCESS';

  if (isMongoConnected() && mongoose.isValidObjectId(data.userId)) {
    try {
      const doc = await TransactionModel.create({
        userId: data.userId,
        type: data.type,
        amountInr,
        credits: data.credits,
        balanceAfter: data.balanceAfter,
        description: data.description,
        referenceId: data.referenceId,
        status
      });

      const rec: TransactionRecord = {
        id: doc._id.toString(),
        userId: doc.userId.toString(),
        type: doc.type,
        amountInr: doc.amountInr,
        credits: doc.credits,
        balanceAfter: doc.balanceAfter,
        description: doc.description,
        referenceId: doc.referenceId,
        status: doc.status,
        createdAt: doc.createdAt.toISOString()
      };
      memoryTransactions.unshift(rec);
      return rec;
    } catch (err: any) {
      console.error('[DB] recordTransaction error:', err.message);
    }
  }

  const rec: TransactionRecord = {
    id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    userId: data.userId,
    type: data.type,
    amountInr,
    credits: data.credits,
    balanceAfter: data.balanceAfter,
    description: data.description,
    referenceId: data.referenceId,
    status,
    createdAt: new Date().toISOString()
  };
  memoryTransactions.unshift(rec);
  return rec;
}

export async function getUserTransactions(userId: string, limit = 50): Promise<TransactionRecord[]> {
  if (isMongoConnected() && mongoose.isValidObjectId(userId)) {
    try {
      const docs = await TransactionModel.find({ userId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();

      return docs.map((d: any) => ({
        id: d._id.toString(),
        userId: d.userId.toString(),
        type: d.type,
        amountInr: d.amountInr,
        credits: d.credits,
        balanceAfter: d.balanceAfter,
        description: d.description,
        referenceId: d.referenceId,
        status: d.status,
        createdAt: new Date(d.createdAt).toISOString()
      }));
    } catch (err) {
      console.warn('[DB] getUserTransactions error:', err);
    }
  }

  return memoryTransactions
    .filter(t => t.userId === userId)
    .slice(0, limit);
}
