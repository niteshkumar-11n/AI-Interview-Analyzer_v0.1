/**
 * GitHub API Routes
 * All routes for real GitHub OAuth, profile analysis, 10-question technical assessment,
 * and weakness-driven issue recommendations.
 */
import { Router } from 'express';
import {
  analyzeProfile,
  getRecommendedIssues,
  getWeaknessIssues,
  checkRateLimit,
  validateUsername,
  getCustomIssues,
  getOAuthStatus,
  getOAuthAuthorizeUrl,
  handleOAuthCallback,
  getConnectedOAuthUser,
  disconnectOAuthUser,
  startAssessment,
  submitAssessment,
  getAssessment,
} from '../controllers/githubController.ts';
import { optionalAuthMiddleware } from '../middleware/authMiddleware.ts';

const router = Router();

// Real OAuth Authorization & Session Routes
router.get('/oauth/status', getOAuthStatus);
router.get('/oauth/authorize-url', optionalAuthMiddleware, getOAuthAuthorizeUrl);
router.get('/oauth/callback', handleOAuthCallback);
router.get('/oauth/user', optionalAuthMiddleware, getConnectedOAuthUser);
router.post('/oauth/disconnect', optionalAuthMiddleware, disconnectOAuthUser);

// Profile analysis (works with OAuth connected user or public GitHub username)
router.post('/analyze', optionalAuthMiddleware, analyzeProfile);

// Validate a GitHub username
router.post('/validate-username', optionalAuthMiddleware, validateUsername);

// 10-Question Personalized Technical Assessment Routes
router.post('/assessment/start', optionalAuthMiddleware, startAssessment);
router.post('/assessment/submit', optionalAuthMiddleware, submitAssessment);
router.get('/assessment/:assessmentId', optionalAuthMiddleware, getAssessment);

// Open Source Issue Recommendation Routes
router.post('/issues/recommend-for-weaknesses', optionalAuthMiddleware, getWeaknessIssues);
router.post('/issues', optionalAuthMiddleware, getRecommendedIssues);
router.post('/issues/custom', optionalAuthMiddleware, getCustomIssues);

// Check GitHub API rate limit
router.get('/rate-limit', checkRateLimit);

export default router;
