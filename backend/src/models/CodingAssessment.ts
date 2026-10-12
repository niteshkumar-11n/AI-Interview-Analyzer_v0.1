/**
 * Coding Assessment Model
 * MongoDB schema for persisting 4-question, 100-mark coding assessments.
 *
 * Scoring Rubric:
 * 1. Easy           — 10 marks
 * 2. Medium         — 20 marks
 * 3. Medium-Hard    — 30 marks
 * 4. Star Challenge — 40 marks
 * Total: 100 marks
 */
import mongoose, { Schema, Document } from 'mongoose';

export interface ICodingAssessmentQuestion {
  questionId: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Medium-Hard' | 'Star Challenge';
  originalDifficulty?: 'Easy' | 'Medium' | 'Hard';
  marks: number;
  score: number;
  submittedCode: string;
  language: string;
  languageId: number;
  passedTests: number;
  totalTests: number;
  status: string; // 'Accepted' | 'Partially Accepted' | 'Wrong Answer' | 'Compilation Error' | 'Runtime Error' | 'Unattempted'
  executionTime?: string | null;
  memory?: number | null;
  aiReview?: {
    feedback: string;
    strengths: string[];
    improvements: string[];
    timeComplexity?: string;
    spaceComplexity?: string;
  };
  testResults?: {
    testCaseIndex: number;
    passed: boolean;
    status: { id: number; description: string };
    stdout?: string | null;
    stderr?: string | null;
    compileOutput?: string | null;
    expectedOutput?: string;
    actualOutput?: string | null;
    time?: string | null;
    memory?: number | null;
    isHidden?: boolean;
  }[];
}

export interface ICodingAssessment extends Document {
  userId: string;
  assessmentId: string;
  title: string;
  totalScore: number;
  easyScore: number;
  mediumScore: number;
  mediumHardScore: number;
  starChallengeScore: number;
  status: 'in-progress' | 'completed';
  questions: ICodingAssessmentQuestion[];
  overallFeedback?: string;
  weakAreas: string[];
  recommendedTopics: string[];
  durationMinutes: number;
  completedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const TestCaseResultSchema = new Schema(
  {
    testCaseIndex: { type: Number, required: true },
    passed: { type: Boolean, required: true },
    status: {
      id: { type: Number, default: 3 },
      description: { type: String, default: 'Accepted' },
    },
    stdout: { type: String, default: null },
    stderr: { type: String, default: null },
    compileOutput: { type: String, default: null },
    expectedOutput: { type: String, default: '' },
    actualOutput: { type: String, default: null },
    time: { type: String, default: null },
    memory: { type: Number, default: null },
    isHidden: { type: Boolean, default: false },
  },
  { _id: false }
);

const CodingAssessmentQuestionSchema = new Schema<ICodingAssessmentQuestion>(
  {
    questionId: { type: String, required: true },
    title: { type: String, required: true },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Medium-Hard', 'Star Challenge'],
      required: true,
    },
    originalDifficulty: { type: String },
    marks: { type: Number, required: true },
    score: { type: Number, default: 0 },
    submittedCode: { type: String, default: '' },
    language: { type: String, default: 'Python' },
    languageId: { type: Number, default: 71 },
    passedTests: { type: Number, default: 0 },
    totalTests: { type: Number, default: 0 },
    status: { type: String, default: 'Unattempted' },
    executionTime: { type: String, default: null },
    memory: { type: Number, default: null },
    aiReview: {
      feedback: { type: String, default: '' },
      strengths: { type: [String], default: [] },
      improvements: { type: [String], default: [] },
      timeComplexity: { type: String, default: '' },
      spaceComplexity: { type: String, default: '' },
    },
    testResults: { type: [TestCaseResultSchema], default: [] },
  },
  { _id: false }
);

const CodingAssessmentSchema = new Schema<ICodingAssessment>(
  {
    userId: { type: String, required: true, index: true },
    assessmentId: { type: String, required: true, unique: true, index: true },
    title: { type: String, default: 'SkillNexus 4-Tier Coding Assessment' },
    totalScore: { type: Number, default: 0 },
    easyScore: { type: Number, default: 0 },
    mediumScore: { type: Number, default: 0 },
    mediumHardScore: { type: Number, default: 0 },
    starChallengeScore: { type: Number, default: 0 },
    status: { type: String, enum: ['in-progress', 'completed'], default: 'completed' },
    questions: { type: [CodingAssessmentQuestionSchema], required: true },
    overallFeedback: { type: String, default: '' },
    weakAreas: { type: [String], default: [] },
    recommendedTopics: { type: [String], default: [] },
    durationMinutes: { type: Number, default: 0 },
    completedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const CodingAssessmentModel: mongoose.Model<ICodingAssessment> =
  (mongoose.models.CodingAssessment as mongoose.Model<ICodingAssessment>) ||
  mongoose.model<ICodingAssessment>('CodingAssessment', CodingAssessmentSchema);

export async function getUserCodingAssessments(userId: string): Promise<ICodingAssessment[]> {
  try {
    return await CodingAssessmentModel.find({ userId }).sort({ createdAt: -1 }).lean();
  } catch (err: any) {
    console.error('[CodingAssessment] Failed to query assessments:', err.message);
    return [];
  }
}
