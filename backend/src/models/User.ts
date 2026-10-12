/**
 * User Model & Database Layer
 * Supports MongoDB Atlas via Mongoose with dynamic in-memory fallback
 */
import mongoose, { Schema, Document } from 'mongoose';
import crypto from 'node:crypto';
import { hashPassword } from '../utils/password.ts';

// --- Type Definitions ---
export type CareerStatus = 'student' | 'fresher' | 'working' | 'career_switcher';

export interface OnboardingStatus {
  isCompleted: boolean;
  step: number; // 1: career-status, 2: conditional-details, 3: optional-resume
  careerStatus?: CareerStatus;
}

export interface UserProfile {
  name: string;
  targetRole: string;
  careerStatus?: CareerStatus;
  onboardingStatus?: OnboardingStatus;
  experience?: string;

  // Student & Fresher specific
  degree?: string;
  specialization?: string;
  college: string;
  academicYear?: string;
  graduationYear: number;
  education: string;

  // Working professional specific
  currentJobTitle?: string;
  yearsOfExperience?: string;
  currentCompany?: string;
  workHistory?: { company: string; role: string; period: string; description: string }[];
  preferredLocation?: string;
  workMode?: 'Remote' | 'Hybrid' | 'On-site';

  // Career switcher specific
  previousBackground?: string;
  relevantExperience?: string;
  desiredCareerPath?: string;
  learningGoals?: string;

  // Universal profile fields
  bio: string;
  location: string;
  github: string;
  linkedin: string;
  portfolio: string;
  githubUrl?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  phone?: string;
  skills: { name: string; percentage: number; level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert' }[];
  workExperience: { company: string; role: string; period: string; description: string }[];
}

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  passwordSalt: string;
  createdAt: string;
  resetToken?: string;
  resetTokenExpiry?: number;
  credits: number;
  profile: UserProfile;
}

// --- Mongoose Schema & Model for MongoDB Atlas ---
export interface IUserDocument extends Document {
  email: string;
  passwordHash: string;
  passwordSalt: string;
  createdAt: Date;
  resetToken?: string;
  resetTokenExpiry?: number;
  credits: number;
  profile: UserProfile;
}

const UserSchema = new Schema<IUserDocument>({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  passwordSalt: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  resetToken: { type: String },
  resetTokenExpiry: { type: Number },
  credits: { type: Number, default: 100, min: 0 },
  profile: {
    name: { type: String, required: true },
    targetRole: { type: String, default: 'Full Stack Engineer' },
    careerStatus: { type: String, enum: ['student', 'fresher', 'working', 'career_switcher'], default: 'student' },
    onboardingStatus: {
      isCompleted: { type: Boolean, default: false },
      step: { type: Number, default: 1 },
      careerStatus: { type: String, default: 'student' }
    },
    experience: { type: String, default: 'Fresher' },
    degree: { type: String, default: 'B.Tech' },
    specialization: { type: String, default: 'Computer Science' },
    academicYear: { type: String, default: '4th Year' },
    college: { type: String, default: '' },
    graduationYear: { type: Number, default: 2025 },
    education: { type: String, default: 'Bachelor of Technology' },
    currentJobTitle: { type: String, default: '' },
    yearsOfExperience: { type: String, default: '' },
    currentCompany: { type: String, default: '' },
    preferredLocation: { type: String, default: 'Remote' },
    workMode: { type: String, default: 'Hybrid' },
    previousBackground: { type: String, default: '' },
    relevantExperience: { type: String, default: '' },
    desiredCareerPath: { type: String, default: '' },
    learningGoals: { type: String, default: '' },
    bio: { type: String, default: 'Aspiring software engineer eager to build modern web solutions.' },
    location: { type: String, default: 'India' },
    github: { type: String, default: '' },
    linkedin: { type: String, default: '' },
    portfolio: { type: String, default: '' },
    githubUrl: { type: String, default: '' },
    linkedinUrl: { type: String, default: '' },
    portfolioUrl: { type: String, default: '' },
    phone: { type: String, default: '' },
    skills: [
      {
        name: { type: String },
        percentage: { type: Number, default: 75 },
        level: { type: String, default: 'Intermediate' }
      }
    ],
    workExperience: [
      {
        company: { type: String },
        role: { type: String },
        period: { type: String },
        description: { type: String }
      }
    ]
  }
});

export const UserModel: mongoose.Model<IUserDocument> =
  (mongoose.models.User as mongoose.Model<IUserDocument>) || mongoose.model<IUserDocument>('User', UserSchema);

// --- In-Memory Fallback Cache ---
export const users: Map<string, User> = new Map();

// Helper to check if MongoDB is connected
function isMongoConnected(): boolean {
  return mongoose.connection.readyState === 1;
}

// Map MongoDB doc to standard User object
function docToUser(doc: any): User {
  const p = doc.profile || {};
  return {
    id: doc._id ? doc._id.toString() : doc.id,
    email: doc.email,
    passwordHash: doc.passwordHash,
    passwordSalt: doc.passwordSalt,
    createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : new Date().toISOString(),
    resetToken: doc.resetToken,
    resetTokenExpiry: doc.resetTokenExpiry,
    credits: typeof doc.credits === 'number' ? doc.credits : 100,
    profile: {
      name: p.name || '',
      targetRole: p.targetRole || 'Full Stack Engineer',
      careerStatus: p.careerStatus || 'student',
      onboardingStatus: p.onboardingStatus ? {
        isCompleted: Boolean(p.onboardingStatus.isCompleted),
        step: typeof p.onboardingStatus.step === 'number' ? p.onboardingStatus.step : 1,
        careerStatus: p.onboardingStatus.careerStatus || p.careerStatus || 'student'
      } : {
        isCompleted: false,
        step: 1,
        careerStatus: p.careerStatus || 'student'
      },
      experience: p.experience || 'Fresher',
      degree: p.degree || '',
      specialization: p.specialization || '',
      college: p.college || '',
      academicYear: p.academicYear || '',
      graduationYear: typeof p.graduationYear === 'number' ? p.graduationYear : 2025,
      education: p.education || 'Bachelor of Technology',
      currentJobTitle: p.currentJobTitle || '',
      yearsOfExperience: p.yearsOfExperience || '',
      currentCompany: p.currentCompany || '',
      workHistory: Array.isArray(p.workHistory) ? p.workHistory : [],
      preferredLocation: p.preferredLocation || 'Remote',
      workMode: p.workMode || 'Hybrid',
      previousBackground: p.previousBackground || '',
      relevantExperience: p.relevantExperience || '',
      desiredCareerPath: p.desiredCareerPath || '',
      learningGoals: p.learningGoals || '',
      bio: p.bio || '',
      location: p.location || 'India',
      github: p.github || '',
      linkedin: p.linkedin || '',
      portfolio: p.portfolio || '',
      githubUrl: p.githubUrl || p.github || '',
      linkedinUrl: p.linkedinUrl || p.linkedin || '',
      portfolioUrl: p.portfolioUrl || p.portfolio || '',
      phone: p.phone || '',
      skills: Array.isArray(p.skills) ? p.skills : [
        { name: 'JavaScript', percentage: 80, level: 'Advanced' },
        { name: 'React', percentage: 75, level: 'Intermediate' }
      ],
      workExperience: Array.isArray(p.workExperience) ? p.workExperience : []
    }
  };
}

// --- Data Access Functions ---

export async function findUserByEmail(email: string): Promise<User | null> {
  if (!email) return null;
  const cleanEmail = email.trim().toLowerCase();

  if (isMongoConnected()) {
    try {
      const doc = await UserModel.findOne({ email: cleanEmail }).lean();
      if (doc) {
        const u = docToUser(doc);
        users.set(u.id, u);
        return u;
      }
    } catch (err) {
      console.warn('[DB] MongoDB lookup by email error:', err);
    }
  }

  // Fallback to in-memory store
  const found = Array.from(users.values()).find(u => u.email.toLowerCase() === cleanEmail);
  return found || null;
}

export async function findUserById(id: string): Promise<User | null> {
  if (!id) return null;

  if (isMongoConnected()) {
    try {
      if (mongoose.isValidObjectId(id)) {
        const doc = await UserModel.findById(id).lean();
        if (doc) {
          const u = docToUser(doc);
          users.set(u.id, u);
          return u;
        }
      }
    } catch (err) {
      console.warn('[DB] MongoDB lookup by ID error:', err);
    }
  }

  // Fallback to in-memory store
  return users.get(id) || null;
}

export async function findUserByResetToken(token: string): Promise<User | null> {
  if (!token) return null;

  if (isMongoConnected()) {
    try {
      const doc = await UserModel.findOne({
        resetToken: token,
        resetTokenExpiry: { $gt: Date.now() }
      }).lean();
      if (doc) {
        return docToUser(doc);
      }
    } catch (err) {
      console.warn('[DB] MongoDB lookup by reset token error:', err);
    }
  }

  const found = Array.from(users.values()).find(
    u => u.resetToken === token && u.resetTokenExpiry && u.resetTokenExpiry > Date.now()
  );
  return found || null;
}

export async function createUser(userData: {
  name: string;
  email: string;
  passwordHash: string;
  passwordSalt: string;
  targetRole?: string;
}): Promise<User> {
  const cleanEmail = userData.email.trim().toLowerCase();
  const defaultProfile: UserProfile = {
    name: userData.name.trim(),
    targetRole: userData.targetRole || 'Full Stack Engineer',
    careerStatus: 'student',
    onboardingStatus: {
      isCompleted: false,
      step: 1,
      careerStatus: 'student'
    },
    experience: 'Fresher developer',
    degree: 'B.Tech',
    specialization: 'Computer Science',
    academicYear: '4th Year',
    college: '',
    graduationYear: 2025,
    education: 'Bachelor of Technology',
    currentJobTitle: '',
    yearsOfExperience: '',
    currentCompany: '',
    preferredLocation: 'Remote',
    workMode: 'Hybrid',
    previousBackground: '',
    relevantExperience: '',
    desiredCareerPath: '',
    learningGoals: '',
    bio: `Passionate ${userData.targetRole || 'developer'} eager to build innovative software solutions.`,
    location: 'India',
    github: '',
    linkedin: '',
    portfolio: '',
    githubUrl: '',
    linkedinUrl: '',
    portfolioUrl: '',
    skills: [
      { name: 'JavaScript', percentage: 75, level: 'Intermediate' },
      { name: 'React', percentage: 70, level: 'Intermediate' },
      { name: 'Node.js', percentage: 65, level: 'Intermediate' }
    ],
    workExperience: []
  };

  if (isMongoConnected()) {
    try {
      console.log(`[DB: Atlas] Saving new registered user "${cleanEmail}" to MongoDB Atlas...`);
      const newDoc = await UserModel.create({
        email: cleanEmail,
        passwordHash: userData.passwordHash,
        passwordSalt: userData.passwordSalt,
        createdAt: new Date(),
        profile: defaultProfile
      });
      console.log(`[DB: Atlas] Successfully stored user "${cleanEmail}" with ID: ${newDoc._id}`);
      const user = docToUser(newDoc.toObject());
      users.set(user.id, user);
      return user;
    } catch (err: any) {
      console.error('[DB: Atlas] Error saving user to MongoDB Atlas:', err.message);
    }
  }

  // Fallback in-memory creation
  const memoryId = `usr_${crypto.randomBytes(6).toString('hex')}`;
  const newUser: User = {
    id: memoryId,
    email: cleanEmail,
    passwordHash: userData.passwordHash,
    passwordSalt: userData.passwordSalt,
    createdAt: new Date().toISOString(),
    credits: 100,
    profile: defaultProfile
  };
  users.set(newUser.id, newUser);
  return newUser;
}

export async function updateUserProfile(id: string, updates: Partial<UserProfile>): Promise<UserProfile | null> {
  if (isMongoConnected() && mongoose.isValidObjectId(id)) {
    try {
      const doc = await UserModel.findById(id);
      if (doc) {
        doc.profile = {
          ...doc.profile,
          ...updates
        };
        doc.markModified('profile');
        await doc.save();
        const updated = docToUser(doc.toObject());
        users.set(id, updated);
        return updated.profile;
      }
    } catch (err) {
      console.warn('[DB] MongoDB profile update error:', err);
    }
  }

  const user = users.get(id);
  if (user) {
    user.profile = {
      ...user.profile,
      ...updates
    };
    return user.profile;
  }
  return null;
}

export async function updateUserPassword(id: string, passwordHash: string, passwordSalt: string): Promise<boolean> {
  if (isMongoConnected() && mongoose.isValidObjectId(id)) {
    try {
      await UserModel.findByIdAndUpdate(id, {
        passwordHash,
        passwordSalt,
        resetToken: undefined,
        resetTokenExpiry: undefined
      });
      return true;
    } catch (err) {
      console.warn('[DB] MongoDB password update error:', err);
    }
  }

  const user = users.get(id);
  if (user) {
    user.passwordHash = passwordHash;
    user.passwordSalt = passwordSalt;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    return true;
  }
  return false;
}

export async function setPasswordResetToken(email: string, token: string, expiry: number): Promise<boolean> {
  const cleanEmail = email.trim().toLowerCase();
  if (isMongoConnected()) {
    try {
      const result = await UserModel.findOneAndUpdate(
        { email: cleanEmail },
        { resetToken: token, resetTokenExpiry: expiry }
      );
      if (result) return true;
    } catch (err) {
      console.warn('[DB] MongoDB set reset token error:', err);
    }
  }

  const user = Array.from(users.values()).find(u => u.email.toLowerCase() === cleanEmail);
  if (user) {
    user.resetToken = token;
    user.resetTokenExpiry = expiry;
    return true;
  }
  return false;
}

export async function getUserCredits(id: string): Promise<number> {
  const user = await findUserById(id);
  return user?.credits ?? 100;
}

export async function deductUserCredits(
  id: string,
  amount: number
): Promise<{ success: boolean; remainingCredits: number; message?: string }> {
  if (amount <= 0) return { success: true, remainingCredits: await getUserCredits(id) };

  if (isMongoConnected() && mongoose.isValidObjectId(id)) {
    try {
      const updated = await UserModel.findOneAndUpdate(
        { _id: id, credits: { $gte: amount } },
        { $inc: { credits: -amount } },
        { new: true }
      ).lean();

      if (updated) {
        const u = docToUser(updated);
        users.set(u.id, u);
        return { success: true, remainingCredits: u.credits };
      }

      // Check current credits to provide informative message
      const current = await UserModel.findById(id).lean();
      const currentCredits = current?.credits ?? 0;
      return {
        success: false,
        remainingCredits: currentCredits,
        message: `Insufficient credits. Required: ${amount}, Available: ${currentCredits}`
      };
    } catch (err: any) {
      console.error('[DB] deductUserCredits error:', err);
      return { success: false, remainingCredits: 0, message: 'Database error while deducting credits.' };
    }
  }

  // Fallback in-memory
  const memUser = users.get(id);
  if (!memUser) {
    return { success: false, remainingCredits: 0, message: 'User not found.' };
  }
  const available = memUser.credits ?? 100;
  if (available < amount) {
    return {
      success: false,
      remainingCredits: available,
      message: `Insufficient credits. Required: ${amount}, Available: ${available}`
    };
  }
  memUser.credits = available - amount;
  users.set(id, memUser);
  return { success: true, remainingCredits: memUser.credits };
}

export async function addUserCredits(
  id: string,
  amount: number
): Promise<{ success: boolean; newCredits: number }> {
  if (amount <= 0) return { success: true, newCredits: await getUserCredits(id) };

  if (isMongoConnected() && mongoose.isValidObjectId(id)) {
    try {
      const updated = await UserModel.findByIdAndUpdate(
        id,
        { $inc: { credits: amount } },
        { new: true }
      ).lean();

      if (updated) {
        const u = docToUser(updated);
        users.set(u.id, u);
        return { success: true, newCredits: u.credits };
      }
    } catch (err: any) {
      console.error('[DB] addUserCredits error:', err);
    }
  }

  // Fallback in-memory
  const memUser = users.get(id);
  if (memUser) {
    memUser.credits = (memUser.credits ?? 100) + amount;
    users.set(id, memUser);
    return { success: true, newCredits: memUser.credits };
  }
  return { success: false, newCredits: 0 };
}
