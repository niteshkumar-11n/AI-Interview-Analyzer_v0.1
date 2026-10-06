/**
 * Database Configuration
 * Connects to MongoDB Atlas when URI is provided, with seamless fallback to in-memory store
 */
import mongoose from 'mongoose';
import { config } from './env.ts';

export async function connectDB(): Promise<void> {
  const mongoUri = config.mongoUri || process.env.MONGODB_URI || process.env.MONGO_URI;

  if (mongoUri && mongoUri.trim() !== '') {
    try {
      console.log('[DB] Connecting to MongoDB Atlas...');
      await mongoose.connect(mongoUri.trim(), {
        serverSelectionTimeoutMS: 5000,
      });
      console.log('[DB] Connected to MongoDB Atlas successfully.');
      return;
    } catch (err: any) {
      console.warn(`[DB] MongoDB Atlas connection error: ${err.message}`);
      console.log('[DB] Falling back to robust in-memory data store.');
    }
  } else {
    console.log('[DB] No MONGODB_URI configured. Running with in-memory data store.');
  }
}

