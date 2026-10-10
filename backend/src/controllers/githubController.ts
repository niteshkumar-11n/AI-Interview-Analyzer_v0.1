/**
 * GitHub Controller
 * Handles HTTP requests for real GitHub OAuth authorization code flow,
 * profile analysis, repository statistics, 10-question personalized technical assessment,
 * and weakness-driven open-source issue recommendations.
 */
import { Request, Response } from 'express';
import crypto from 'node:crypto';
import { config, reloadEnv } from '../config/env.ts';
import { updateUserProfile } from '../models/User.ts';
import {
  analyzeGitHubProfile,
  findMatchingIssues,
  findIssuesForWeaknesses,
  extractSkillsFromRepos,
  getRateLimitInfo,
  extractUsername,
  fetchGitHubProfile,
  fetchUserRepos,
  fetchLanguageStats,
  type ExtractedSkills,
} from '../services/github/githubService.ts';
import {
  generatePersonalizedAssessment,
  evaluateAssessment,
  getAssessmentResult,
  type AssessmentSubmissionAnswer,
  type IdentifiedWeakness,
} from '../services/github/assessmentService.ts';

// In-memory cache with TTL (5 minutes)
const profileCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000;

function getCachedOrNull(key: string): any | null {
  const cached = profileCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  profileCache.delete(key);
  return null;
}

function setCache(key: string, data: any): void {
  profileCache.set(key, { data, timestamp: Date.now() });
}

// GitHub OAuth State Storage (for CSRF protection, 10 min TTL)
interface OAuthStateRecord {
  createdAt: number;
  userId: string | null;
  redirectUri: string;
}
const oauthStates = new Map<string, OAuthStateRecord>();

// Clean expired states periodically
setInterval(() => {
  const now = Date.now();
  for (const [state, record] of oauthStates.entries()) {
    if (now - record.createdAt > 10 * 60 * 1000) {
      oauthStates.delete(state);
    }
  }
}, 60 * 1000);

// GitHub Connected User Sessions
export interface GitHubSessionData {
  username: string;
  name?: string;
  avatarUrl: string;
  bio?: string;
  publicRepos: number;
  accessToken: string;
  connectedAt: string;
  userId?: string | null;
}
const githubSessions = new Map<string, GitHubSessionData>();

// Helper to extract session from request
function getSessionFromReq(req: Request): GitHubSessionData | null {
  const headerToken = req.headers['x-github-session'] as string | undefined;
  if (headerToken && githubSessions.has(headerToken)) {
    return githubSessions.get(headerToken) || null;
  }

  const queryToken = req.query.session_token as string | undefined;
  if (queryToken && githubSessions.has(queryToken)) {
    return githubSessions.get(queryToken) || null;
  }

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer gh_')) {
    const bearerToken = authHeader.replace('Bearer ', '');
    if (githubSessions.has(bearerToken)) {
      return githubSessions.get(bearerToken) || null;
    }
  }

  // Check if authenticated platform user has a session
  const userId = (req as any).user?.id;
  if (userId) {
    for (const session of githubSessions.values()) {
      if (session.userId === userId) {
        return session;
      }
    }
  }

  return null;
}

// ==================== OAUTH ENDPOINTS ====================

/**
 * GET /api/github/oauth/status
 * Check if GitHub OAuth credentials are configured on the server
 */
export async function getOAuthStatus(_req: Request, res: Response) {
  // Re-read .env to catch any recent changes
  reloadEnv();

  const isConfigured = Boolean(
    config.githubClientId &&
    config.githubClientId.trim() !== '' &&
    config.githubClientSecret &&
    config.githubClientSecret.trim() !== ''
  );

  res.json({
    success: true,
    configured: isConfigured,
    clientId: isConfigured ? config.githubClientId : null,
    callbackUrl: config.githubCallbackUrl,
    mode: isConfigured ? 'production' : 'unconfigured',
    message: isConfigured
      ? 'GitHub OAuth is configured and ready.'
      : 'GitHub OAuth credentials (GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET) are not configured in backend environment.',
  });
}

/**
 * GET /api/github/oauth/authorize-url
 * Generate a secure authorization URL with CSRF state token
 */
export async function getOAuthAuthorizeUrl(req: Request, res: Response) {
  reloadEnv();

  const isConfigured = Boolean(config.githubClientId && config.githubClientSecret);

  if (!isConfigured) {
    return res.status(400).json({
      success: false,
      message: 'GitHub OAuth is not configured on the backend server. Please configure GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET in backend .env',
      configured: false,
    });
  }

  const state = crypto.randomBytes(24).toString('hex');
  const userId = (req as any).user?.id || null;

  oauthStates.set(state, {
    createdAt: Date.now(),
    userId,
    redirectUri: config.githubCallbackUrl,
  });

  const params = new URLSearchParams({
    client_id: config.githubClientId,
    redirect_uri: config.githubCallbackUrl,
    scope: 'read:user,repo',
    state,
  });

  const authUrl = `https://github.com/login/oauth/authorize?${params.toString()}`;

  if (req.query.redirect === 'true') {
    return res.redirect(authUrl);
  }

  res.json({
    success: true,
    authUrl,
    state,
  });
}

/**
 * GET /api/github/oauth/callback
 * Handles OAuth callback from GitHub, exchanges code for access token,
 * fetches profile, and communicates result via popup postMessage / URL redirect.
 */
export async function handleOAuthCallback(req: Request, res: Response) {
  const { code, state, error, error_description } = req.query;

  // Handle user cancellation or GitHub errors
  if (error) {
    const errorMsg = (error_description as string) || (error as string) || 'GitHub authorization cancelled';
    console.warn('[GitHub OAuth] Callback error:', error, error_description);

    return res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>GitHub Authorization Error</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #0F172A; color: white; text-align: center; }
          .card { background: #1E293B; border-radius: 16px; padding: 32px; max-width: 420px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
        </style>
      </head>
      <body>
        <div class="card">
          <h2 style="color: #EF4444; margin-top: 0;">Authorization Failed</h2>
          <p style="color: #94A3B8; font-size: 0.9rem;">${errorMsg}</p>
          <p style="font-size: 0.8rem; color: #64748B;">Closing this window...</p>
        </div>
        <script>
          if (window.opener && !window.opener.closed) {
            window.opener.postMessage({ type: 'GITHUB_OAUTH_ERROR', error: ${JSON.stringify(errorMsg)} }, '*');
            setTimeout(() => window.close(), 1000);
          } else {
            window.location.href = '${config.frontendUrl}/?github_oauth_error=' + encodeURIComponent(${JSON.stringify(errorMsg)});
          }
        </script>
      </body>
      </html>
    `);
  }

  if (!code || !state) {
    return res.status(400).send('Missing code or state in OAuth callback');
  }

  // Validate state (CSRF protection)
  const stateRecord = oauthStates.get(String(state));
  if (!stateRecord) {
    return res.status(403).send('Invalid or expired OAuth state parameter. Please try again.');
  }
  oauthStates.delete(String(state)); // one-time use

  try {
    // Exchange authorization code for access token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'SkillNexus-AI-Interview-Analyzer',
      },
      body: JSON.stringify({
        client_id: config.githubClientId,
        client_secret: config.githubClientSecret,
        code: String(code),
        redirect_uri: config.githubCallbackUrl,
      }),
    });

    const tokenData = await tokenResponse.json() as any;

    if (tokenData.error || !tokenData.access_token) {
      const errMsg = tokenData.error_description || tokenData.error || 'Failed to obtain access token from GitHub.';
      throw new Error(errMsg);
    }

    const accessToken = tokenData.access_token;

    // Fetch user profile from GitHub
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'SkillNexus-AI-Interview-Analyzer',
      },
    });

    if (!userResponse.ok) {
      throw new Error('Failed to retrieve GitHub profile data.');
    }

    const ghUser = await userResponse.json() as any;

    // Generate isolated session token
    const sessionToken = `gh_${crypto.randomBytes(24).toString('hex')}`;
    const sessionData: GitHubSessionData = {
      username: ghUser.login,
      name: ghUser.name || ghUser.login,
      avatarUrl: ghUser.avatar_url,
      bio: ghUser.bio || '',
      publicRepos: ghUser.public_repos || 0,
      accessToken,
      connectedAt: new Date().toISOString(),
      userId: stateRecord.userId,
    };

    githubSessions.set(sessionToken, sessionData);

    // If platform user was logged in, update user record in database
    if (stateRecord.userId) {
      try {
        await updateUserProfile(stateRecord.userId, { github: ghUser.login });
      } catch (e) {
        console.warn('[GitHub OAuth] Could not update user profile with GitHub handle:', e);
      }
    }

    // Success response: works seamlessly for both popup and direct redirect
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>GitHub Connected</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #0F172A; color: white; text-align: center; }
          .card { background: #1E293B; border-radius: 16px; padding: 32px; max-width: 400px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
        </style>
      </head>
      <body>
        <div class="card">
          <img src="${ghUser.avatar_url}" style="width: 72px; height: 72px; border-radius: 50%; margin-bottom: 16px; border: 3px solid #3B82F6;" />
          <h2 style="margin: 0 0 8px 0; font-size: 1.25rem;">Connected @${ghUser.login}</h2>
          <p style="color: #94A3B8; font-size: 0.9rem; margin-bottom: 16px;">Authorization successful! Returning to SkillNexus AI...</p>
        </div>
        <script>
          const payload = {
            type: 'GITHUB_OAUTH_SUCCESS',
            sessionToken: '${sessionToken}',
            username: ${JSON.stringify(ghUser.login)},
            name: ${JSON.stringify(ghUser.name || ghUser.login)},
            avatarUrl: ${JSON.stringify(ghUser.avatar_url)}
          };

          try {
            if (window.opener && !window.opener.closed) {
              window.opener.postMessage(payload, '*');
              setTimeout(() => window.close(), 600);
            } else {
              window.location.href = '${config.frontendUrl}/?github_connected=true&username=' + encodeURIComponent(${JSON.stringify(ghUser.login)}) + '&session_token=${sessionToken}';
            }
          } catch (e) {
            window.location.href = '${config.frontendUrl}/?github_connected=true&username=' + encodeURIComponent(${JSON.stringify(ghUser.login)}) + '&session_token=${sessionToken}';
          }
        </script>
      </body>
      </html>
    `);
  } catch (err: any) {
    console.error('[GitHub OAuth] Code exchange error:', err.message);
    res.status(500).send(`
      <!DOCTYPE html>
      <html>
      <body style="font-family: sans-serif; text-align: center; padding: 40px; background: #0F172A; color: white;">
        <h2 style="color: #EF4444;">GitHub Connection Failed</h2>
        <p>${err.message || 'An error occurred during token exchange.'}</p>
        <script>
          if (window.opener && !window.opener.closed) {
            window.opener.postMessage({ type: 'GITHUB_OAUTH_ERROR', error: ${JSON.stringify(err.message)} }, '*');
            setTimeout(() => window.close(), 2000);
          }
        </script>
      </body>
      </html>
    `);
  }
}

/**
 * GET /api/github/oauth/user
 * Get currently connected GitHub account details for this session
 */
export async function getConnectedOAuthUser(req: Request, res: Response) {
  const session = getSessionFromReq(req);

  if (!session) {
    return res.json({
      success: true,
      connected: false,
      user: null,
    });
  }

  // Never return accessToken
  res.json({
    success: true,
    connected: true,
    user: {
      username: session.username,
      name: session.name,
      avatarUrl: session.avatarUrl,
      bio: session.bio,
      publicRepos: session.publicRepos,
      connectedAt: session.connectedAt,
    },
  });
}

/**
 * POST /api/github/oauth/disconnect
 * Disconnect GitHub account and destroy isolated session
 */
export async function disconnectOAuthUser(req: Request, res: Response) {
  const headerToken = req.headers['x-github-session'] as string | undefined;
  const queryToken = req.query.session_token as string | undefined;
  const userId = (req as any).user?.id;

  if (headerToken) githubSessions.delete(headerToken);
  if (queryToken) githubSessions.delete(queryToken);

  if (userId) {
    for (const [key, session] of githubSessions.entries()) {
      if (session.userId === userId) {
        githubSessions.delete(key);
      }
    }
  }

  res.json({
    success: true,
    message: 'GitHub account disconnected successfully.',
  });
}

// ==================== PROFILE ANALYSIS ====================

/**
 * POST /api/github/analyze
 * Analyze a GitHub profile by username or URL
 * Body: { username: string, forceRefresh?: boolean }
 */
export async function analyzeProfile(req: Request, res: Response) {
  try {
    const { username, forceRefresh } = req.body;

    if (!username || typeof username !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid GitHub username or profile URL.',
      });
    }

    const cleanUsername = extractUsername(username);
    if (!cleanUsername) {
      return res.status(400).json({
        success: false,
        message: 'Invalid GitHub username or URL format. Example: "octocat" or "https://github.com/octocat"',
      });
    }

    // Check cache unless force refresh
    const cacheKey = `profile:${cleanUsername.toLowerCase()}`;
    if (!forceRefresh) {
      const cached = getCachedOrNull(cacheKey);
      if (cached) {
        return res.json({
          success: true,
          data: cached,
          cached: true,
          message: 'Profile analysis loaded from cache.',
        });
      }
    }

    console.log(`[GitHub] Analyzing profile for: ${cleanUsername}`);

    // If active session token exists, use its access token
    const session = getSessionFromReq(req);
    const accessToken = session?.accessToken || undefined;

    const analysis = await analyzeGitHubProfile(cleanUsername, accessToken);

    // Cache the result
    setCache(cacheKey, analysis);

    res.json({
      success: true,
      data: analysis,
      cached: false,
      message: `Successfully analyzed GitHub profile: ${cleanUsername}`,
    });
  } catch (err: any) {
    console.error('[GitHub] Profile analysis error:', err.message);

    const statusCode = err.message?.includes('not found') ? 404
      : err.message?.includes('rate limit') ? 429
      : 500;

    res.status(statusCode).json({
      success: false,
      message: err.message || 'Failed to analyze GitHub profile.',
      error: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
  }
}

// ==================== TECHNICAL ASSESSMENT ENDPOINTS ====================

/**
 * POST /api/github/assessment/start
 * Generates exactly 10 personalized technical questions based on GitHub profile analysis.
 * Body: { username?: string }
 */
export async function startAssessment(req: Request, res: Response) {
  try {
    const { username } = req.body;
    let targetUsername = username ? extractUsername(username) : '';

    if (!targetUsername) {
      const session = getSessionFromReq(req);
      if (session) {
        targetUsername = session.username;
      }
    }

    if (!targetUsername) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a GitHub username to generate your personalized technical assessment.',
      });
    }

    // Check if we have cached profile analysis
    const cacheKey = `profile:${targetUsername.toLowerCase()}`;
    let analysis = getCachedOrNull(cacheKey);

    if (!analysis) {
      const session = getSessionFromReq(req);
      const accessToken = session?.accessToken || undefined;
      analysis = await analyzeGitHubProfile(targetUsername, accessToken);
      setCache(cacheKey, analysis);
    }

    const { assessmentId, questions, totalQuestions } = await generatePersonalizedAssessment(
      targetUsername,
      analysis.skills,
      analysis.repos
    );

    res.json({
      success: true,
      data: {
        assessmentId,
        username: targetUsername,
        totalQuestions,
        questions,
      },
      message: `Generated exactly ${totalQuestions} personalized technical assessment questions for @${targetUsername}.`,
    });
  } catch (err: any) {
    console.error('[GitHub Assessment] Start error:', err.message);
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to generate technical assessment.',
    });
  }
}

/**
 * POST /api/github/assessment/submit
 * Submits answers for evaluation, scores results, identifies weaknesses and strengths.
 * Body: { assessmentId: string, answers: { questionId: number, selectedOptionIndex: number }[] }
 */
export async function submitAssessment(req: Request, res: Response) {
  try {
    const { assessmentId, answers } = req.body;

    if (!assessmentId || !Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        message: 'Assessment ID and answers array are required.',
      });
    }

    const result = await evaluateAssessment(assessmentId, answers as AssessmentSubmissionAnswer[]);

    res.json({
      success: true,
      data: result,
      message: `Assessment evaluated successfully. Score: ${result.score}/${result.totalQuestions} (${result.percentage}%).`,
    });
  } catch (err: any) {
    console.error('[GitHub Assessment] Submit error:', err.message);
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to evaluate assessment submission.',
    });
  }
}

/**
 * GET /api/github/assessment/:assessmentId
 * Get results of an existing evaluated assessment
 */
export async function getAssessment(req: Request, res: Response) {
  try {
    const { assessmentId } = req.params;
    const result = getAssessmentResult(assessmentId);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Assessment result not found or expired.',
      });
    }

    res.json({
      success: true,
      data: result,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to get assessment result.',
    });
  }
}

// ==================== WEAKNESS-BASED ISSUE RECOMMENDATIONS ====================

/**
 * POST /api/github/issues/recommend-for-weaknesses
 * Retrieve real GitHub issues mapped directly to the user's identified weaknesses.
 * Body: { assessmentId?: string, weaknesses?: IdentifiedWeakness[], username?: string, language?: string, difficulty?: string, labels?: string[], weaknessTopic?: string, page?: number, perPage?: number, sort?: string }
 */
export async function getWeaknessIssues(req: Request, res: Response) {
  try {
    const {
      assessmentId,
      weaknesses: providedWeaknesses,
      username,
      language,
      difficulty,
      labels,
      weaknessTopic,
      page = 1,
      perPage = 10,
      sort = 'updated',
    } = req.body;

    let weaknesses: IdentifiedWeakness[] = [];
    let skills: ExtractedSkills = {
      languages: [],
      frameworks: [],
      tools: [],
      databases: [],
      cloud: [],
      other: [],
      all: [],
    };

    if (assessmentId) {
      const assessmentResult = getAssessmentResult(assessmentId);
      if (assessmentResult) {
        weaknesses = assessmentResult.weaknesses;
      }
    }

    if (weaknesses.length === 0 && Array.isArray(providedWeaknesses) && providedWeaknesses.length > 0) {
      weaknesses = providedWeaknesses;
    }

    // Load skills if username or session available
    const targetUsername = username ? extractUsername(username) : getSessionFromReq(req)?.username;
    if (targetUsername) {
      const cached = getCachedOrNull(`profile:${targetUsername.toLowerCase()}`);
      if (cached?.skills) {
        skills = cached.skills;
      }
    }

    // Default weakness if none identified yet
    if (weaknesses.length === 0) {
      weaknesses = [
        {
          id: 'default_practice',
          topic: 'General Code Quality & Testing',
          relatedSkill: language || skills.languages[0] || 'JavaScript',
          category: 'Core Language',
          evidence: 'Selected practice area based on profile stack',
          whyItMatters: 'Writing tests and resolving bugs in active open source builds practical mastery.',
          learningPriority: 'High',
          practicalTasks: ['Inspect issue description', 'Fork and test locally', 'Submit pull request'],
          searchQueries: [`language:${language || 'JavaScript'} label:"good first issue"`],
        },
      ];
    }

    const session = getSessionFromReq(req);
    const accessToken = session?.accessToken || undefined;

    const result = await findIssuesForWeaknesses(
      weaknesses,
      skills,
      {
        language,
        difficulty,
        labels,
        weaknessTopic,
        page,
        perPage,
        sort,
      },
      accessToken
    );

    res.json({
      success: true,
      data: result,
      message: `Found ${result.issues.length} real open-source issues targeting your technical improvement areas.`,
    });
  } catch (err: any) {
    console.error('[GitHub Weakness Issues] Error:', err.message);
    const statusCode = err.message?.includes('rate limit') ? 429 : 500;
    res.status(statusCode).json({
      success: false,
      message: err.message || 'Failed to fetch weakness-targeted issue recommendations.',
    });
  }
}

/**
 * POST /api/github/issues
 * Get recommended open source issues based on skills
 */
export async function getRecommendedIssues(req: Request, res: Response) {
  try {
    const {
      skills: providedSkills,
      username,
      language,
      difficulty,
      labels,
      page = 1,
      perPage = 10,
      sort = 'updated',
    } = req.body;

    let skills: ExtractedSkills;

    if (Array.isArray(providedSkills) && providedSkills.length > 0) {
      skills = {
        languages: providedSkills,
        frameworks: [],
        tools: [],
        databases: [],
        cloud: [],
        other: [],
        all: providedSkills,
      };
    } else if (providedSkills && Array.isArray(providedSkills.all) && providedSkills.all.length > 0) {
      skills = providedSkills;
    } else if (providedSkills && Array.isArray(providedSkills.languages) && providedSkills.languages.length > 0) {
      skills = {
        languages: providedSkills.languages,
        frameworks: providedSkills.frameworks || [],
        tools: providedSkills.tools || [],
        databases: providedSkills.databases || [],
        cloud: providedSkills.cloud || [],
        other: providedSkills.other || [],
        all: [...(providedSkills.languages || []), ...(providedSkills.frameworks || []), ...(providedSkills.tools || [])],
      };
    } else if (username) {
      const cleanUsername = extractUsername(username);
      if (!cleanUsername) {
        return res.status(400).json({
          success: false,
          message: 'Invalid GitHub username.',
        });
      }

      const cacheKey = `profile:${cleanUsername.toLowerCase()}`;
      const cached = getCachedOrNull(cacheKey);

      if (cached) {
        skills = cached.skills;
      } else {
        const session = getSessionFromReq(req);
        const accessToken = session?.accessToken || undefined;
        const repos = await fetchUserRepos(cleanUsername, accessToken);
        const langStats = await fetchLanguageStats(cleanUsername, accessToken);
        skills = extractSkillsFromRepos(repos, langStats);
      }
    } else {
      return res.status(400).json({
        success: false,
        message: 'Please provide skills or a GitHub username to get issue recommendations.',
      });
    }

    const session = getSessionFromReq(req);
    const accessToken = session?.accessToken || undefined;

    const result = await findMatchingIssues(skills, {
      language,
      difficulty,
      labels,
      page,
      perPage,
      sort,
    }, accessToken);

    res.json({
      success: true,
      data: result,
      message: `Found ${result.issues.length} matching issues.`,
    });
  } catch (err: any) {
    console.error('[GitHub] Issue recommendations error:', err.message);
    const statusCode = err.message?.includes('rate limit') ? 429 : 500;
    res.status(statusCode).json({
      success: false,
      message: err.message || 'Failed to fetch issue recommendations.',
    });
  }
}

/**
 * GET /api/github/rate-limit
 * Get current GitHub API rate limit status
 */
export async function checkRateLimit(_req: Request, res: Response) {
  try {
    const info = await getRateLimitInfo();
    res.json({
      success: true,
      data: info,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to check rate limit.',
    });
  }
}

/**
 * POST /api/github/validate-username
 * Validate if a GitHub username exists
 */
export async function validateUsername(req: Request, res: Response) {
  try {
    const { username } = req.body;
    const cleanUsername = extractUsername(username);

    if (!cleanUsername) {
      return res.status(400).json({
        success: false,
        valid: false,
        message: 'Invalid username format.',
      });
    }

    const session = getSessionFromReq(req);
    const accessToken = session?.accessToken || undefined;
    const profile = await fetchGitHubProfile(cleanUsername, accessToken);

    res.json({
      success: true,
      valid: true,
      username: profile.login,
      avatarUrl: profile.avatar_url,
      name: profile.name,
    });
  } catch (err: any) {
    res.json({
      success: true,
      valid: false,
      message: err.message?.includes('not found')
        ? 'GitHub user not found.'
        : 'Could not validate username.',
    });
  }
}

/**
 * POST /api/github/issues/custom
 * Get issues for manually selected skills (for users without GitHub)
 */
export async function getCustomIssues(req: Request, res: Response) {
  try {
    const {
      languages = [],
      frameworks = [],
      tools = [],
      difficulty,
      page = 1,
      perPage = 10,
    } = req.body;

    if (languages.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please select at least one programming language.',
      });
    }

    const skills: ExtractedSkills = {
      languages,
      frameworks,
      tools,
      databases: [],
      cloud: [],
      other: [],
      all: [...languages, ...frameworks, ...tools],
    };

    const session = getSessionFromReq(req);
    const accessToken = session?.accessToken || undefined;

    const result = await findMatchingIssues(skills, {
      language: languages[0],
      difficulty,
      page,
      perPage,
    }, accessToken);

    res.json({
      success: true,
      data: result,
    });
  } catch (err: any) {
    console.error('[GitHub] Custom issues error:', err.message);
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to fetch issues.',
    });
  }
}
