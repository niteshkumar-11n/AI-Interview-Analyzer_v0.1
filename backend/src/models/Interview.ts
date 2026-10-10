/**
 * Technical Interview Session Model
 * Stores technical interview questions, candidate answers, detailed rubric feedback, and status.
 */
import mongoose, { Schema, Document } from 'mongoose';

export interface IQuestionItem {
  question: string;
  difficulty: 'easy' | 'medium' | 'hard';
  timeLimit: number; // in seconds
  answer?: string;
  timeTaken?: number;
  score?: number; // 0 to 10
  confidence?: number; // 0 to 10
  communication?: number; // 0 to 10
  correctness?: number; // 0 to 10
  feedback?: string;
  strengths?: string[];
  improvements?: string[];
  missingConcepts?: string[];
}

export interface IInterviewDocument extends Document {
  userId: mongoose.Types.ObjectId | string;
  role: string;
  category: string;
  experience: string;
  difficulty: string;
  mode: 'Technical' | 'HR';
  questions: IQuestionItem[];
  finalScore: number; // 0 to 10
  confidenceAvg: number;
  communicationAvg: number;
  correctnessAvg: number;
  recommendedPracticeTopics: string[];
  status: 'in-progress' | 'completed' | 'abandoned';
  createdAt: Date;
  updatedAt: Date;
}

export interface InterviewRecord {
  id: string;
  userId: string;
  role: string;
  category: string;
  experience: string;
  difficulty: string;
  mode: 'Technical' | 'HR';
  questions: IQuestionItem[];
  finalScore: number;
  confidenceAvg: number;
  communicationAvg: number;
  correctnessAvg: number;
  recommendedPracticeTopics: string[];
  status: 'in-progress' | 'completed' | 'abandoned';
  createdAt: string;
  updatedAt: string;
}

const QuestionItemSchema = new Schema<IQuestionItem>(
  {
    question: { type: String, required: true },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
    timeLimit: { type: Number, default: 60 },
    answer: { type: String, default: '' },
    timeTaken: { type: Number, default: 0 },
    score: { type: Number, default: 0 },
    confidence: { type: Number, default: 0 },
    communication: { type: Number, default: 0 },
    correctness: { type: Number, default: 0 },
    feedback: { type: String, default: '' },
    strengths: [{ type: String }],
    improvements: [{ type: String }],
    missingConcepts: [{ type: String }]
  },
  { _id: false }
);

const InterviewSchema = new Schema<IInterviewDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    role: { type: String, required: true },
    category: { type: String, default: 'Full Stack' },
    experience: { type: String, required: true },
    difficulty: { type: String, default: 'Intermediate' },
    mode: { type: String, enum: ['Technical', 'HR'], default: 'Technical' },
    questions: [QuestionItemSchema],
    finalScore: { type: Number, default: 0 },
    confidenceAvg: { type: Number, default: 0 },
    communicationAvg: { type: Number, default: 0 },
    correctnessAvg: { type: Number, default: 0 },
    recommendedPracticeTopics: [{ type: String }],
    status: {
      type: String,
      enum: ['in-progress', 'completed', 'abandoned'],
      default: 'in-progress',
      index: true
    }
  },
  { timestamps: true }
);

export const InterviewModel: mongoose.Model<IInterviewDocument> =
  (mongoose.models.Interview as mongoose.Model<IInterviewDocument>) ||
  mongoose.model<IInterviewDocument>('Interview', InterviewSchema);

// In-memory fallback map
export const memoryInterviews: Map<string, InterviewRecord> = new Map();

function isMongoConnected(): boolean {
  return mongoose.connection.readyState === 1;
}

function docToInterview(doc: any): InterviewRecord {
  return {
    id: doc._id ? doc._id.toString() : doc.id,
    userId: doc.userId ? doc.userId.toString() : doc.userId,
    role: doc.role,
    category: doc.category || 'Full Stack',
    experience: doc.experience,
    difficulty: doc.difficulty || 'Intermediate',
    mode: doc.mode || 'Technical',
    questions: doc.questions || [],
    finalScore: doc.finalScore ?? 0,
    confidenceAvg: doc.confidenceAvg ?? 0,
    communicationAvg: doc.communicationAvg ?? 0,
    correctnessAvg: doc.correctnessAvg ?? 0,
    recommendedPracticeTopics: doc.recommendedPracticeTopics || [],
    status: doc.status || 'in-progress',
    createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : new Date().toISOString(),
    updatedAt: doc.updatedAt ? new Date(doc.updatedAt).toISOString() : new Date().toISOString()
  };
}

export async function createInterviewSession(data: {
  userId: string;
  role: string;
  category: string;
  experience: string;
  difficulty: string;
  mode: 'Technical' | 'HR';
  questions: IQuestionItem[];
}): Promise<InterviewRecord> {
  if (isMongoConnected() && mongoose.isValidObjectId(data.userId)) {
    try {
      const doc = await InterviewModel.create({
        userId: data.userId,
        role: data.role,
        category: data.category,
        experience: data.experience,
        difficulty: data.difficulty,
        mode: data.mode,
        questions: data.questions,
        status: 'in-progress',
        finalScore: 0
      });
      const rec = docToInterview(doc);
      memoryInterviews.set(rec.id, rec);
      return rec;
    } catch (err: any) {
      console.error('[DB] createInterviewSession error:', err.message);
    }
  }

  const memoryId = `int_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const rec: InterviewRecord = {
    id: memoryId,
    userId: data.userId,
    role: data.role,
    category: data.category,
    experience: data.experience,
    difficulty: data.difficulty,
    mode: data.mode,
    questions: data.questions,
    finalScore: 0,
    confidenceAvg: 0,
    communicationAvg: 0,
    correctnessAvg: 0,
    recommendedPracticeTopics: [],
    status: 'in-progress',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  memoryInterviews.set(rec.id, rec);
  return rec;
}

export async function findInterviewById(id: string): Promise<InterviewRecord | null> {
  if (isMongoConnected() && mongoose.isValidObjectId(id)) {
    try {
      const doc = await InterviewModel.findById(id).lean();
      if (doc) {
        return docToInterview(doc);
      }
    } catch (err) {
      console.warn('[DB] findInterviewById error:', err);
    }
  }

  return memoryInterviews.get(id) || null;
}

export async function getUserInterviews(userId: string): Promise<InterviewRecord[]> {
  if (isMongoConnected() && mongoose.isValidObjectId(userId)) {
    try {
      const docs = await InterviewModel.find({ userId })
        .sort({ createdAt: -1 })
        .lean();
      return docs.map(docToInterview);
    } catch (err) {
      console.warn('[DB] getUserInterviews error:', err);
    }
  }

  return Array.from(memoryInterviews.values())
    .filter(i => i.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function updateInterviewSession(
  id: string,
  updates: Partial<InterviewRecord>
): Promise<InterviewRecord | null> {
  if (isMongoConnected() && mongoose.isValidObjectId(id)) {
    try {
      const doc = await InterviewModel.findByIdAndUpdate(
        id,
        { $set: updates },
        { new: true }
      ).lean();
      if (doc) {
        const rec = docToInterview(doc);
        memoryInterviews.set(id, rec);
        return rec;
      }
    } catch (err) {
      console.warn('[DB] updateInterviewSession error:', err);
    }
  }

  const existing = memoryInterviews.get(id);
  if (existing) {
    const updated: InterviewRecord = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    memoryInterviews.set(id, updated);
    return updated;
  }

  return null;
}
