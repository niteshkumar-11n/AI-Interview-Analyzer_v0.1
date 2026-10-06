/**
 * Coding Routes
 * Endpoints for the Coding Interview feature powered by self-hosted Judge0 CE.
 *
 * GET  /api/coding/health     — Judge0 health check
 * GET  /api/coding/languages  — Fetch supported languages from Judge0
 * GET  /api/coding/problems   — List all coding problems (no hidden test cases)
 * GET  /api/coding/problems/:id — Get a single problem (no hidden test cases)
 * POST /api/coding/run        — Run code against stdin (single execution)
 * POST /api/coding/submit     — Submit solution against all test cases (hidden + visible)
 */
import { Router, Request, Response } from 'express';
import { authMiddleware, AuthenticatedRequest } from '../middleware/authMiddleware.ts';
import {
  checkJudge0Health,
  getLanguages,
  runCode,
  evaluateAgainstTestCases,
} from '../services/coding/judge0Service.ts';
import {
  findProblemById,
  getProblemsForClient,
  CodingSubmissionModel,
} from '../models/CodingProblem.ts';

const router = Router();

/* ─── Max source code size: 64 KB ─── */
const MAX_SOURCE_CODE_LENGTH = 64 * 1024;

/* ─────────────────────────────────
   GET /api/coding/health
   ───────────────────────────────── */
router.get('/health', async (_req: Request, res: Response) => {
  try {
    const health = await checkJudge0Health();
    return res.json({
      success: true,
      service: 'Judge0 CE',
      status: health.connected ? 'connected' : 'unavailable',
      version: health.version || null,
      error: health.error || null,
    });
  } catch (err: any) {
    return res.json({
      success: true,
      service: 'Judge0 CE',
      status: 'unavailable',
      error: err.message,
    });
  }
});

/* ─── Fallback languages when Judge0 is unavailable ─── */
const FALLBACK_LANGUAGES = [
  { id: 71, name: 'Python (3.8.1)' },
  { id: 63, name: 'JavaScript (Node.js 12.14.0)' },
  { id: 54, name: 'C++ (GCC 9.2.0)' },
  { id: 62, name: 'Java (OpenJDK 13.0.1)' },
  { id: 51, name: 'C# (Mono 6.6.0.161)' },
  { id: 60, name: 'Go (1.13.5)' },
  { id: 73, name: 'Rust (1.40.0)' },
  { id: 74, name: 'TypeScript (3.7.4)' },
  { id: 72, name: 'Ruby (2.7.0)' },
  { id: 68, name: 'PHP (7.4.1)' },
];

/* ─────────────────────────────────
   GET /api/coding/languages
   ───────────────────────────────── */
router.get('/languages', async (_req: Request, res: Response) => {
  try {
    const languages = await getLanguages();
    return res.json({ success: true, languages });
  } catch (err: any) {
    console.warn('[Coding] Judge0 unavailable for languages, returning fallback list:', err.message);
    return res.json({ success: true, languages: FALLBACK_LANGUAGES, fallback: true });
  }
});

/* ─────────────────────────────────
   GET /api/coding/problems
   Returns all problems without hidden test cases
   ───────────────────────────────── */
router.get('/problems', (_req: Request, res: Response) => {
  const problems = getProblemsForClient();
  return res.json({ success: true, problems });
});

/* ─────────────────────────────────
   GET /api/coding/problems/:id
   Returns a single problem without hidden test cases
   ───────────────────────────────── */
router.get('/problems/:id', (req: Request, res: Response) => {
  const problem = findProblemById(req.params.id);
  if (!problem) {
    return res.status(404).json({ success: false, message: 'Problem not found.' });
  }
  // Strip hidden test cases before sending to client
  const { hiddenTestCases, ...safeData } = problem;
  return res.json({ success: true, problem: safeData });
});

/* ─────────────────────────────────
   POST /api/coding/run
   Authenticated — run code against user-provided stdin
   ───────────────────────────────── */
router.post('/run', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { languageId, sourceCode, stdin } = req.body;

    // Validate
    if (!languageId || typeof languageId !== 'number') {
      return res.status(400).json({ success: false, message: 'A valid languageId (number) is required.' });
    }
    if (!sourceCode || typeof sourceCode !== 'string' || sourceCode.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Source code is required.' });
    }
    if (sourceCode.length > MAX_SOURCE_CODE_LENGTH) {
      return res.status(400).json({ success: false, message: `Source code exceeds maximum size of ${MAX_SOURCE_CODE_LENGTH / 1024}KB.` });
    }

    console.log(`[Coding] Run: user=${req.user?.id}, lang=${languageId}, codeLen=${sourceCode.length}`);

    const result = await runCode({
      languageId,
      sourceCode: sourceCode.trim(),
      stdin: typeof stdin === 'string' ? stdin : '',
    });

    return res.json({ success: true, result });
  } catch (err: any) {
    console.error('[Coding] Run error:', err.message);

    if (err.message.includes('Judge0') || err.message.includes('fetch')) {
      return res.status(502).json({
        success: false,
        message: 'Code execution service is unavailable. Please ensure Judge0 is running.',
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to execute code. Please try again.',
    });
  }
});

/* ─────────────────────────────────
   POST /api/coding/submit
   Authenticated — submit solution against all test cases (visible + hidden)
   ───────────────────────────────── */
router.post('/submit', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { languageId, languageName, sourceCode, problemId } = req.body;

    // Validate
    if (!languageId || typeof languageId !== 'number') {
      return res.status(400).json({ success: false, message: 'A valid languageId (number) is required.' });
    }
    if (!sourceCode || typeof sourceCode !== 'string' || sourceCode.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Source code is required.' });
    }
    if (sourceCode.length > MAX_SOURCE_CODE_LENGTH) {
      return res.status(400).json({ success: false, message: `Source code exceeds maximum size of ${MAX_SOURCE_CODE_LENGTH / 1024}KB.` });
    }
    if (!problemId || typeof problemId !== 'string') {
      return res.status(400).json({ success: false, message: 'Problem ID is required.' });
    }

    const problem = findProblemById(problemId);
    if (!problem) {
      return res.status(404).json({ success: false, message: 'Problem not found.' });
    }

    // Combine visible + hidden test cases (all evaluated server-side)
    const allTestCases = [...problem.visibleTestCases, ...problem.hiddenTestCases];

    console.log(`[Coding] Submit: user=${req.user?.id}, problem=${problemId}, lang=${languageId}, tests=${allTestCases.length}`);

    const result = await evaluateAgainstTestCases({
      languageId,
      sourceCode: sourceCode.trim(),
      testCases: allTestCases,
    });

    // Persist submission result to MongoDB (best-effort, don't fail the request)
    try {
      if (req.user?.id) {
        await CodingSubmissionModel.create({
          userId: req.user.id,
          problemId,
          languageId,
          languageName: languageName || '',
          sourceCode: sourceCode.trim(),
          status: result.status,
          score: result.score,
          passedTests: result.passedTests,
          totalTests: result.totalTests,
          executionTime: result.averageTime,
          memory: result.averageMemory,
        });
      }
    } catch (dbErr: any) {
      console.warn('[Coding] Failed to persist submission:', dbErr.message);
    }

    // Strip hidden test case expected outputs from the response
    // Only return results for visible test cases in detail; hidden ones get a summary
    const visibleCount = problem.visibleTestCases.length;
    const safeTestResults = result.testResults.map((tr, idx) => {
      if (idx < visibleCount) {
        return tr; // Visible test case — full details
      }
      // Hidden test case — only status, no expected/actual output
      return {
        testCaseIndex: tr.testCaseIndex,
        passed: tr.passed,
        status: tr.status,
        stdout: null,
        stderr: tr.stderr,
        compileOutput: tr.compileOutput,
        expectedOutput: '(hidden)',
        actualOutput: null,
        time: tr.time,
        memory: tr.memory,
        isHidden: true,
      };
    });

    return res.json({
      success: true,
      result: {
        ...result,
        testResults: safeTestResults,
      },
    });
  } catch (err: any) {
    console.error('[Coding] Submit error:', err.message);

    if (err.message.includes('Judge0') || err.message.includes('fetch')) {
      return res.status(502).json({
        success: false,
        message: 'Code execution service is unavailable. Please ensure Judge0 is running.',
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to submit solution. Please try again.',
    });
  }
});

export default router;
