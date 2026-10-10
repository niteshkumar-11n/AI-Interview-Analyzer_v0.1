import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

const getCurrentDir = () => {
  if (typeof __dirname !== 'undefined') return __dirname;
  return process.cwd();
};
const currentDir = getCurrentDir();

// Robustly load .env from multiple possible locations (cwd, backend dir, parent dir)
const candidateEnvPaths = [
  path.resolve(currentDir, '../../.env'),
  path.resolve(process.cwd(), '.env'),
  path.resolve(process.cwd(), 'backend', '.env'),
  path.resolve(currentDir, '.env'),
  path.resolve(currentDir, '../.env'),
];

export function reloadEnv(): void {
  for (const envPath of candidateEnvPaths) {
    if (fs.existsSync(envPath)) {
      dotenv.config({ path: envPath, override: true });
    }
  }
  dotenv.config({ override: true });
}

// Initial load
reloadEnv();

export const config = {
  get port(): number {
    return parseInt(process.env.PORT || '3000', 10);
  },
  get jwtSecret(): string {
    return process.env.JWT_SECRET || 'skillnexus-secure-jwt-hmac-secret-key-2025';
  },
  get nodeEnv(): string {
    return process.env.NODE_ENV || 'development';
  },
  get backendUrl(): string {
    const p = parseInt(process.env.PORT || '3000', 10);
    return process.env.BACKEND_URL || (process.env.NODE_ENV === 'production' ? 'https://api.skillnexus.ai' : `http://localhost:${p}`);
  },
  get frontendUrl(): string {
    return process.env.FRONTEND_URL || 'http://localhost:5173';
  },
  get geminiApiKey(): string {
    return (process.env.GEMINI_API_KEY || '').trim();
  },
  get mongoUri(): string {
    return process.env.MONGODB_URI || process.env.MONGO_URI || '';
  },
  get adzunaAppId(): string {
    return (process.env.ADZUNA_APP_ID || '').trim();
  },
  get adzunaAppKey(): string {
    return (process.env.ADZUNA_APP_KEY || '').trim();
  },
  get judge0ApiUrl(): string {
    return process.env.JUDGE0_API_URL || 'http://localhost:2358';
  },
  get githubToken(): string {
    return (process.env.GITHUB_TOKEN || '').trim();
  },
  get githubClientId(): string {
    return (process.env.GITHUB_CLIENT_ID || '').trim();
  },
  get githubClientSecret(): string {
    return (process.env.GITHUB_CLIENT_SECRET || '').trim();
  },
  get githubCallbackUrl(): string {
    return (process.env.GITHUB_CALLBACK_URL || `${this.backendUrl}/api/github/oauth/callback`).trim();
  },
  get razorpayKeyId(): string {
    return (process.env.RAZORPAY_KEY_ID || '').trim();
  },
  get razorpayKeySecret(): string {
    return (process.env.RAZORPAY_KEY_SECRET || '').trim();
  },
  get openRouterApiKey(): string {
    return (process.env.OPENROUTER_API_KEY || '').trim();
  },
  get openRouterModel(): string {
    return (process.env.OPENROUTER_MODEL || 'openai/gpt-4o-mini').trim();
  },
};
