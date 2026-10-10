/**
 * Resume Model & Persistence Layer
 * Stores optional resume file metadata, processing status, extracted candidate facts, and confirmed facts.
 * STRICTLY NO ATS SCORES, NO ATS REPORTS, NO JOB DESCRIPTION COMPARISON.
 */
import mongoose, { Schema, Document } from 'mongoose';

export type ResumeProcessingStatus = 'pending' | 'completed' | 'failed';

export interface ExtractedCandidateFacts {
  name?: string;
  email?: string;
  phone?: string;
  targetRole?: string;
  skills: string[];
  education: {
    degree?: string;
    institution?: string;
    graduationYear?: number;
    field?: string;
  }[];
  experience: {
    company?: string;
    role?: string;
    duration?: string;
    description?: string;
  }[];
  summary?: string;
}

export interface IResumeDocument extends Document {
  userId: mongoose.Types.ObjectId | string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  version: number;
  processingStatus: ResumeProcessingStatus;
  errorMessage?: string;
  extractedFacts?: ExtractedCandidateFacts;
  confirmedFacts?: Partial<ExtractedCandidateFacts>;
  isConfirmed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ResumeRecord {
  id: string;
  userId: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  version: number;
  processingStatus: ResumeProcessingStatus;
  errorMessage?: string;
  extractedFacts?: ExtractedCandidateFacts;
  confirmedFacts?: Partial<ExtractedCandidateFacts>;
  isConfirmed: boolean;
  createdAt: string;
  updatedAt: string;
}

const ResumeSchema = new Schema<IResumeDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    fileName: {
      type: String,
      required: true
    },
    fileSize: {
      type: Number,
      required: true
    },
    mimeType: {
      type: String,
      required: true
    },
    version: {
      type: Number,
      default: 1
    },
    processingStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending',
      index: true
    },
    errorMessage: {
      type: String
    },
    extractedFacts: {
      name: { type: String },
      email: { type: String },
      phone: { type: String },
      targetRole: { type: String },
      skills: [{ type: String }],
      education: [
        {
          degree: { type: String },
          institution: { type: String },
          graduationYear: { type: Number },
          field: { type: String }
        }
      ],
      experience: [
        {
          company: { type: String },
          role: { type: String },
          duration: { type: String },
          description: { type: String }
        }
      ],
      summary: { type: String }
    },
    confirmedFacts: {
      skills: [{ type: String }],
      education: [{ type: Schema.Types.Mixed }],
      experience: [{ type: Schema.Types.Mixed }],
      summary: { type: String }
    },
    isConfirmed: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

export const ResumeModel: mongoose.Model<IResumeDocument> =
  (mongoose.models.Resume as mongoose.Model<IResumeDocument>) ||
  mongoose.model<IResumeDocument>('Resume', ResumeSchema);

// In-memory fallback
const memoryResumes: Map<string, ResumeRecord[]> = new Map();

function isMongoConnected(): boolean {
  return mongoose.connection.readyState === 1;
}

/**
 * Creates or saves a new resume entry for a user
 */
export async function createResumeRecord(data: {
  userId: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  extractedFacts?: ExtractedCandidateFacts;
  processingStatus?: ResumeProcessingStatus;
  errorMessage?: string;
}): Promise<ResumeRecord> {
  const version = await getNextResumeVersion(data.userId);

  if (isMongoConnected() && mongoose.isValidObjectId(data.userId)) {
    try {
      const doc = await ResumeModel.create({
        userId: data.userId,
        fileName: data.fileName,
        fileSize: data.fileSize,
        mimeType: data.mimeType,
        version,
        processingStatus: data.processingStatus || 'completed',
        extractedFacts: data.extractedFacts,
        errorMessage: data.errorMessage,
        isConfirmed: false
      });

      return {
        id: doc._id.toString(),
        userId: doc.userId.toString(),
        fileName: doc.fileName,
        fileSize: doc.fileSize,
        mimeType: doc.mimeType,
        version: doc.version,
        processingStatus: doc.processingStatus,
        errorMessage: doc.errorMessage,
        extractedFacts: doc.extractedFacts,
        confirmedFacts: doc.confirmedFacts,
        isConfirmed: doc.isConfirmed,
        createdAt: doc.createdAt.toISOString(),
        updatedAt: doc.updatedAt.toISOString()
      };
    } catch (err: any) {
      console.warn('[DB] Failed to create resume in MongoDB, using in-memory fallback:', err.message);
    }
  }

  const rec: ResumeRecord = {
    id: `res_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    userId: data.userId,
    fileName: data.fileName,
    fileSize: data.fileSize,
    mimeType: data.mimeType,
    version,
    processingStatus: data.processingStatus || 'completed',
    errorMessage: data.errorMessage,
    extractedFacts: data.extractedFacts,
    isConfirmed: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const list = memoryResumes.get(data.userId) || [];
  list.unshift(rec);
  memoryResumes.set(data.userId, list);
  return rec;
}

/**
 * Gets the latest confirmed or processed resume record for a candidate
 */
export async function getLatestUserResume(userId: string): Promise<ResumeRecord | null> {
  if (isMongoConnected() && mongoose.isValidObjectId(userId)) {
    try {
      const doc = await ResumeModel.findOne({ userId }).sort({ version: -1 });
      if (doc) {
        return {
          id: doc._id.toString(),
          userId: doc.userId.toString(),
          fileName: doc.fileName,
          fileSize: doc.fileSize,
          mimeType: doc.mimeType,
          version: doc.version,
          processingStatus: doc.processingStatus,
          errorMessage: doc.errorMessage,
          extractedFacts: doc.extractedFacts,
          confirmedFacts: doc.confirmedFacts,
          isConfirmed: doc.isConfirmed,
          createdAt: doc.createdAt.toISOString(),
          updatedAt: doc.updatedAt.toISOString()
        };
      }
    } catch (err: any) {
      console.warn('[DB] Error querying latest resume:', err.message);
    }
  }

  const list = memoryResumes.get(userId);
  return list && list.length > 0 ? list[0] : null;
}

/**
 * Confirms candidate facts and marks resume confirmed
 */
export async function confirmResumeFacts(
  userId: string,
  resumeId: string,
  confirmedFacts: Partial<ExtractedCandidateFacts>
): Promise<ResumeRecord | null> {
  if (isMongoConnected() && mongoose.isValidObjectId(resumeId)) {
    try {
      const doc = await ResumeModel.findOneAndUpdate(
        { _id: resumeId, userId },
        {
          $set: {
            confirmedFacts,
            isConfirmed: true,
            processingStatus: 'completed'
          }
        },
        { new: true }
      );

      if (doc) {
        return {
          id: doc._id.toString(),
          userId: doc.userId.toString(),
          fileName: doc.fileName,
          fileSize: doc.fileSize,
          mimeType: doc.mimeType,
          version: doc.version,
          processingStatus: doc.processingStatus,
          errorMessage: doc.errorMessage,
          extractedFacts: doc.extractedFacts,
          confirmedFacts: doc.confirmedFacts,
          isConfirmed: doc.isConfirmed,
          createdAt: doc.createdAt.toISOString(),
          updatedAt: doc.updatedAt.toISOString()
        };
      }
    } catch (err: any) {
      console.warn('[DB] Error confirming resume facts:', err.message);
    }
  }

  const list = memoryResumes.get(userId) || [];
  const found = list.find((r) => r.id === resumeId);
  if (found) {
    found.confirmedFacts = confirmedFacts;
    found.isConfirmed = true;
    found.processingStatus = 'completed';
    found.updatedAt = new Date().toISOString();
    return found;
  }
  return null;
}

async function getNextResumeVersion(userId: string): Promise<number> {
  if (isMongoConnected() && mongoose.isValidObjectId(userId)) {
    try {
      const highest = await ResumeModel.findOne({ userId }).sort({ version: -1 }).select('version');
      return highest ? highest.version + 1 : 1;
    } catch {
      return 1;
    }
  }
  const list = memoryResumes.get(userId) || [];
  return list.length > 0 ? list[0].version + 1 : 1;
}
