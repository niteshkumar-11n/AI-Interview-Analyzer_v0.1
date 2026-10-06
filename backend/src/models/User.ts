/**
 * User Model & Database Layer
 * Supports MongoDB Atlas via Mongoose with dynamic in-memory fallback
 */
import mongoose, { Schema, Document } from 'mongoose';
import crypto from 'node:crypto';
import { hashPassword } from '../utils/password.ts';

// --- Type Definitions ---
export interface UserProfile {
  name: string;
  targetRole: string;
  experience: string;
  college: string;
  graduationYear: number;
  education: string;
  bio: string;
  location: string;
  github: string;
  linkedin: string;
  portfolio: string;
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
  profile: UserProfile;
}

const UserSchema = new Schema<IUserDocument>({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  passwordSalt: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  resetToken: { type: String },
  resetTokenExpiry: { type: Number },
  profile: {
    name: { type: String, required: true },
    targetRole: { type: String, default: 'Full Stack Engineer' },
    experience: { type: String, default: 'Fresher' },
    college: { type: String, default: '' },
    graduationYear: { type: Number, default: 2025 },
    education: { type: String, default: 'Bachelor of Technology' },
    bio: { type: String, default: 'Aspiring software engineer eager to build modern web solutions.' },
    location: { type: String, default: 'India' },
    github: { type: String, default: '' },
    linkedin: { type: String, default: '' },
    portfolio: { type: String, default: '' },
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
  return {
    id: doc._id ? doc._id.toString() : doc.id,
    email: doc.email,
    passwordHash: doc.passwordHash,
    passwordSalt: doc.passwordSalt,
    createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : new Date().toISOString(),
    resetToken: doc.resetToken,
    resetTokenExpiry: doc.resetTokenExpiry,
    profile: {
      name: doc.profile?.name || '',
      targetRole: doc.profile?.targetRole || 'Full Stack Engineer',
      experience: doc.profile?.experience || 'Fresher',
      college: doc.profile?.college || '',
      graduationYear: doc.profile?.graduationYear || 2025,
      education: doc.profile?.education || 'Bachelor of Technology',
      bio: doc.profile?.bio || '',
      location: doc.profile?.location || 'India',
      github: doc.profile?.github || '',
      linkedin: doc.profile?.linkedin || '',
      portfolio: doc.profile?.portfolio || '',
      phone: doc.profile?.phone || '',
      skills: doc.profile?.skills || [
        { name: 'JavaScript', percentage: 80, level: 'Advanced' },
        { name: 'React', percentage: 75, level: 'Intermediate' }
      ],
      workExperience: doc.profile?.workExperience || []
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
    experience: 'Fresher developer',
    college: '',
    graduationYear: 2025,
    education: 'Bachelor of Technology',
    bio: `Passionate ${userData.targetRole || 'developer'} eager to build innovative software solutions.`,
    location: 'India',
    github: '',
    linkedin: '',
    portfolio: '',
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
