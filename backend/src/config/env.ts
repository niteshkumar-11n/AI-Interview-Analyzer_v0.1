/**
 * Backend Environment Configuration
 * Loads and validates environment variables
 */
import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  jwtSecret: process.env.JWT_SECRET || 'skillnexus-secure-jwt-hmac-secret-key-2025',
  nodeEnv: process.env.NODE_ENV || 'development',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  mongoUri: process.env.MONGODB_URI || process.env.MONGO_URI || '',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  adzunaAppId: process.env.ADZUNA_APP_ID || '',
  adzunaAppKey: process.env.ADZUNA_APP_KEY || '',
  judge0ApiUrl: process.env.JUDGE0_API_URL || 'http://localhost:2358',
};

