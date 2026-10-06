/**
 * Judge0 Service
 * Communicates with self-hosted Judge0 CE instance for code execution.
 * All requests go through the backend — never exposed to the frontend.
 */
import { config } from '../../config/env.ts';

/* ===========================
   Judge0 Status Mapping
   =========================== */
export const JUDGE0_STATUS = {
  1: 'In Queue',
  2: 'Processing',
  3: 'Accepted',
  4: 'Wrong Answer',
  5: 'Time Limit Exceeded',
  6: 'Compilation Error',
  7: 'Runtime Error (SIGSEGV)',
  8: 'Runtime Error (SIGXFSZ)',
  9: 'Runtime Error (SIGFPE)',
  10: 'Runtime Error (SIGABRT)',
  11: 'Runtime Error (NZEC)',
  12: 'Runtime Error (Other)',
  13: 'Internal Error',
  14: 'Exec Format Error',
} as const;

export type Judge0StatusId = keyof typeof JUDGE0_STATUS;

/** Check if a status represents a terminal (finished) state */
export function isTerminalStatus(statusId: number): boolean {
  return statusId >= 3; // 1=In Queue, 2=Processing are non-terminal
}

/* ===========================
   Interfaces
   =========================== */
export interface Judge0Language {
  id: number;
  name: string;
}

export interface Judge0Submission {
  stdout: string | null;
  stderr: string | null;
  compile_output: string | null;
  message: string | null;
  status: { id: number; description: string };
  time: string | null;
  memory: number | null;
}

export interface RunCodeResult {
  stdout: string | null;
  stderr: string | null;
  compileOutput: string | null;
  status: { id: number; description: string };
  time: string | null;
  memory: number | null;
}

export interface TestCaseResult {
  testCaseIndex: number;
  passed: boolean;
  status: { id: number; description: string };
  stdout: string | null;
  stderr: string | null;
  compileOutput: string | null;
  expectedOutput: string;
  actualOutput: string | null;
  time: string | null;
  memory: number | null;
}

export interface SubmissionResult {
  score: number;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  status: string;
  testResults: TestCaseResult[];
  averageTime: string | null;
  averageMemory: number | null;
}

/* ===========================
   Helper: make requests to Judge0
   =========================== */
const JUDGE0_TIMEOUT_MS = 30_000;

async function judge0Fetch(path: string, options: RequestInit = {}): Promise<Response> {
  const url = `${config.judge0ApiUrl}${path}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), JUDGE0_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    return response;
  } finally {
    clearTimeout(timeout);
  }
}

/* ===========================
   Public API
   =========================== */

/**
 * Check if Judge0 is reachable
 */
export async function checkJudge0Health(): Promise<{ connected: boolean; version?: string; error?: string }> {
  try {
    const res = await judge0Fetch('/about');
    if (!res.ok) {
      return { connected: false, error: `Judge0 returned status ${res.status}` };
    }
    const data = (await res.json()) as any;
    return { connected: true, version: data.version || data.source_code || 'unknown' };
  } catch (err: any) {
    return { connected: false, error: err.message || 'Judge0 unreachable' };
  }
}

/**
 * Get supported languages from Judge0
 */
export async function getLanguages(): Promise<Judge0Language[]> {
  const res = await judge0Fetch('/languages');
  if (!res.ok) {
    throw new Error(`Judge0 /languages returned status ${res.status}`);
  }
  const data = (await res.json()) as Judge0Language[];
  // Sort by name for cleaner UI display
  return data.sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Submit code for execution and wait for the result (synchronous mode).
 * Uses Judge0's ?wait=true parameter to avoid polling.
 */
export async function submitCode(params: {
  languageId: number;
  sourceCode: string;
  stdin?: string;
  expectedOutput?: string;
  cpuTimeLimit?: number;
  memoryLimit?: number;
}): Promise<Judge0Submission> {
  const body = {
    source_code: params.sourceCode,
    language_id: params.languageId,
    stdin: params.stdin || '',
    expected_output: params.expectedOutput || undefined,
    cpu_time_limit: params.cpuTimeLimit || 5,
    memory_limit: params.memoryLimit || 128000, // 128 MB
  };

  const res = await judge0Fetch('/submissions?base64_encoded=false&wait=true', {
    method: 'POST',
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error(`[Judge0] Submission error ${res.status}: ${text}`);
    throw new Error(`Judge0 submission failed with status ${res.status}: ${text}`);
  }

  return (await res.json()) as Judge0Submission;
}

/**
 * Run code once with optional stdin (for "Run" button — single execution).
 */
export async function runCode(params: {
  languageId: number;
  sourceCode: string;
  stdin?: string;
}): Promise<RunCodeResult> {
  const submission = await submitCode({
    languageId: params.languageId,
    sourceCode: params.sourceCode,
    stdin: params.stdin,
  });

  return {
    stdout: submission.stdout,
    stderr: submission.stderr,
    compileOutput: submission.compile_output,
    status: submission.status,
    time: submission.time,
    memory: submission.memory,
  };
}

/**
 * Submit code against multiple test cases and calculate score.
 * Hidden test cases are evaluated server-side; their input/output is never sent to the frontend.
 */
export async function evaluateAgainstTestCases(params: {
  languageId: number;
  sourceCode: string;
  testCases: { stdin: string; expectedOutput: string }[];
}): Promise<SubmissionResult> {
  const testResults: TestCaseResult[] = [];
  let passedTests = 0;
  let totalTime = 0;
  let totalMemory = 0;
  let timeSamples = 0;
  let memorySamples = 0;

  // Execute each test case sequentially to avoid overloading Judge0
  for (let i = 0; i < params.testCases.length; i++) {
    const tc = params.testCases[i];

    try {
      const submission = await submitCode({
        languageId: params.languageId,
        sourceCode: params.sourceCode,
        stdin: tc.stdin,
        expectedOutput: tc.expectedOutput,
      });

      const actualOutput = (submission.stdout || '').trim();
      const expected = tc.expectedOutput.trim();
      // If Judge0 returns status 3 (Accepted) with expected_output, it already matched.
      // Otherwise, compare manually.
      const passed = submission.status.id === 3 || actualOutput === expected;

      if (passed) passedTests++;
      if (submission.time) {
        totalTime += parseFloat(submission.time);
        timeSamples++;
      }
      if (submission.memory) {
        totalMemory += submission.memory;
        memorySamples++;
      }

      testResults.push({
        testCaseIndex: i,
        passed,
        status: submission.status,
        stdout: submission.stdout,
        stderr: submission.stderr,
        compileOutput: submission.compile_output,
        expectedOutput: tc.expectedOutput,
        actualOutput: actualOutput || null,
        time: submission.time,
        memory: submission.memory,
      });

      // If compilation error, all subsequent tests will also fail — break early
      if (submission.status.id === 6) {
        for (let j = i + 1; j < params.testCases.length; j++) {
          testResults.push({
            testCaseIndex: j,
            passed: false,
            status: { id: 6, description: 'Compilation Error' },
            stdout: null,
            stderr: null,
            compileOutput: submission.compile_output,
            expectedOutput: params.testCases[j].expectedOutput,
            actualOutput: null,
            time: null,
            memory: null,
          });
        }
        break;
      }
    } catch (err: any) {
      testResults.push({
        testCaseIndex: i,
        passed: false,
        status: { id: 13, description: 'Internal Error' },
        stdout: null,
        stderr: err.message,
        compileOutput: null,
        expectedOutput: tc.expectedOutput,
        actualOutput: null,
        time: null,
        memory: null,
      });
    }
  }

  const totalTests = params.testCases.length;
  const failedTests = totalTests - passedTests;
  const score = totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0;

  let status: string;
  if (passedTests === totalTests) {
    status = 'Accepted';
  } else if (passedTests === 0) {
    // Check if it was compilation error
    const firstResult = testResults[0];
    if (firstResult?.status.id === 6) status = 'Compilation Error';
    else if (firstResult?.status.id >= 7 && firstResult?.status.id <= 12) status = 'Runtime Error';
    else if (firstResult?.status.id === 5) status = 'Time Limit Exceeded';
    else if (firstResult?.status.id === 13) status = 'Internal Error';
    else status = 'Wrong Answer';
  } else {
    status = 'Partially Accepted';
  }

  return {
    score,
    totalTests,
    passedTests,
    failedTests,
    status,
    testResults,
    averageTime: timeSamples > 0 ? (totalTime / timeSamples).toFixed(3) : null,
    averageMemory: memorySamples > 0 ? Math.round(totalMemory / memorySamples) : null,
  };
}
