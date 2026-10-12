/**
 * GitHub Technical Assessment & Weakness Analysis Service
 * Generates personalized 10-question technical assessments based on real GitHub data,
 * evaluates submitted answers, identifies skill gaps/weaknesses, and maps them to learning paths.
 */

import { GoogleGenAI } from '@google/genai';
import { config } from '../../config/env.ts';
import type { ExtractedSkills, GitHubRepo } from './githubService.ts';

export interface TechnicalQuestion {
  id: number; // 1 to 10
  question: string;
  codeSnippet?: string | null;
  topic: string;
  category: 'Frontend' | 'Backend' | 'Database' | 'DevOps & Tools' | 'Core Language' | 'Architecture & Testing';
  options: string[]; // exactly 4 options
  correctAnswerIndex: number; // 0..3
  explanation: string;
  relatedSkill: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export interface ClientQuestion {
  id: number;
  question: string;
  codeSnippet?: string | null;
  topic: string;
  category: string;
  options: string[];
  relatedSkill: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export interface IdentifiedWeakness {
  id: string;
  topic: string;
  relatedSkill: string;
  category: string;
  evidence: string;
  whyItMatters: string;
  learningPriority: 'High' | 'Medium';
  practicalTasks: string[];
  searchQueries: string[];
}

export interface IdentifiedStrength {
  topic: string;
  relatedSkill: string;
  category: string;
  evidence: string;
}

export interface AssessmentSubmissionAnswer {
  questionId: number;
  selectedOptionIndex: number;
}

export interface QuestionEvaluationResult {
  questionId: number;
  question: string;
  codeSnippet?: string | null;
  topic: string;
  category: string;
  options: string[];
  userAnswerIndex: number;
  correctAnswerIndex: number;
  isCorrect: boolean;
  explanation: string;
  relatedSkill: string;
}

export interface TopicPerformance {
  topic: string;
  category: string;
  correct: number;
  total: number;
  percentage: number;
}

export interface AssessmentResult {
  assessmentId: string;
  username: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  performanceRating: 'Mastery' | 'Proficient' | 'Developing' | 'Needs Improvement';
  evaluationSummary: string;
  questionResults: QuestionEvaluationResult[];
  topicBreakdown: TopicPerformance[];
  strengths: IdentifiedStrength[];
  weaknesses: IdentifiedWeakness[];
  completedAt: string;
}

export interface StoredAssessment {
  id: string;
  username: string;
  createdAt: number;
  questions: TechnicalQuestion[];
  completed: boolean;
  result?: AssessmentResult;
  skills: ExtractedSkills;
}

// In-memory store for active assessments (1 hour TTL)
const assessmentStore = new Map<string, StoredAssessment>();
const ASSESSMENT_TTL = 60 * 60 * 1000;

setInterval(() => {
  const now = Date.now();
  for (const [id, record] of assessmentStore.entries()) {
    if (now - record.createdAt > ASSESSMENT_TTL) {
      assessmentStore.delete(id);
    }
  }
}, 5 * 60 * 1000);

/**
 * Question Bank curated for instant, reliable fallback generation tailored strictly
 * to the candidate's detected languages and frameworks.
 */
const CURATED_QUESTIONS_BY_TECH: Record<string, Omit<TechnicalQuestion, 'id'>[]> = {
  JavaScript: [
    {
      question: 'What is the exact output of this asynchronous JavaScript snippet?',
      codeSnippet: `console.log('1');
setTimeout(() => console.log('2'), 0);
Promise.resolve().then(() => console.log('3'));
console.log('4');`,
      topic: 'Event Loop & Microtask Queue',
      category: 'Core Language',
      options: ['1, 2, 3, 4', '1, 4, 3, 2', '1, 4, 2, 3', '1, 3, 4, 2'],
      correctAnswerIndex: 1,
      explanation: 'Synchronous statements execute first (1, 4). Microtasks from Promise callbacks run before the next event loop tick (3). Macrotasks scheduled via setTimeout execute in the next tick (2).',
      relatedSkill: 'JavaScript',
      difficulty: 'intermediate',
    },
    {
      question: 'How does JavaScript handle closures when referencing variables in an enclosing scope?',
      codeSnippet: `function createCounter() {
  let count = 0;
  return () => ++count;
}`,
      topic: 'Closures & Lexical Scope',
      category: 'Core Language',
      options: [
        'The inner function copies the primitive value of count at creation time',
        'The inner function retains a live reference to the lexical environment containing count',
        'Variables in enclosing scope are converted to global scope properties',
        'The variable count is garbage-collected immediately when createCounter returns',
      ],
      correctAnswerIndex: 1,
      explanation: 'Closures in JavaScript preserve a reference to the lexical environment, enabling the inner function to access and mutate outer variables even after the outer function has completed execution.',
      relatedSkill: 'JavaScript',
      difficulty: 'intermediate',
    },
  ],
  TypeScript: [
    {
      question: 'In TypeScript, what is the key behavioral difference between the "unknown" and "any" types?',
      codeSnippet: `let valA: any = "hello";
valA.toUpperCase(); // Allowed

let valB: unknown = "hello";
// valB.toUpperCase(); // Error!`,
      topic: 'Type Narrowing & Type Safety',
      category: 'Core Language',
      options: [
        '"any" requires type assertions, whereas "unknown" allows arbitrary property access without checks',
        '"unknown" is type-safe and mandates type narrowing or assertions before invoking methods, whereas "any" disables type checking entirely',
        '"unknown" can only hold primitive types, while "any" can hold objects and functions',
        'There is no difference; "unknown" is simply an alias for "any" introduced in newer versions',
      ],
      correctAnswerIndex: 1,
      explanation: '"unknown" is the type-safe counterpart of "any". You cannot call methods or access properties on an "unknown" variable without first checking or narrowing its type.',
      relatedSkill: 'TypeScript',
      difficulty: 'intermediate',
    },
    {
      question: 'How does TypeScript evaluate generic constraints with the "extends keyof" pattern?',
      codeSnippet: `function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}`,
      topic: 'Generics & Indexed Access Types',
      category: 'Core Language',
      options: [
        'It ensures that K can be any arbitrary string regardless of properties on T',
        'It constrains K to be a valid key of T, guaranteeing that the return type accurately matches the property type',
        'It converts object T into an array of keys at runtime',
        'It casts obj to an index signature { [k: string]: any }',
      ],
      correctAnswerIndex: 1,
      explanation: 'K extends keyof T ensures that key must exist on T, providing compile-time safety and inferring the precise return type T[K].',
      relatedSkill: 'TypeScript',
      difficulty: 'intermediate',
    },
  ],
  React: [
    {
      question: 'When should you provide a cleanup function inside a React useEffect hook?',
      codeSnippet: `useEffect(() => {
  const handler = () => console.log('scroll');
  window.addEventListener('scroll', handler);
  return () => window.removeEventListener('scroll', handler);
}, []);`,
      topic: 'Hook Lifecycle & Memory Leak Prevention',
      category: 'Frontend',
      options: [
        'Only when the component throws an unhandled error during rendering',
        'Whenever the effect establishes subscriptions, timers, or event listeners that outlive the render cycle',
        'Whenever state variables inside the effect are marked as immutable',
        'Cleanups are strictly prohibited when using an empty dependency array []',
      ],
      correctAnswerIndex: 1,
      explanation: 'Effect cleanup functions unsubscribe listeners, clear intervals, or abort network requests to prevent memory leaks and zombie event handlers when components unmount or re-render.',
      relatedSkill: 'React',
      difficulty: 'intermediate',
    },
    {
      question: 'What triggers unnecessary re-renders in child components wrapped with React.memo?',
      codeSnippet: `<MemoizedCard onClick={() => handleClick(item.id)} />`,
      topic: 'React Performance Optimization & Memoization',
      category: 'Frontend',
      options: [
        'Passing primitive numbers as props',
        'Passing inline arrow functions or freshly instantiated objects on every parent render without useCallback/useMemo',
        'Placing the child component in a separate file',
        'Using CSS classes instead of inline styles',
      ],
      correctAnswerIndex: 1,
      explanation: 'React.memo performs shallow comparison of props. Inline functions create a new reference on every render, causing shallow equality to evaluate false and forcing the child to re-render.',
      relatedSkill: 'React',
      difficulty: 'intermediate',
    },
  ],
  'Node.js': [
    {
      question: 'In Node.js streams, what is backpressure and how is it properly mitigated?',
      codeSnippet: `readableStream.pipe(writableStream);`,
      topic: 'Streams & Backpressure Management',
      category: 'Backend',
      options: [
        'When data is read faster than the writable destination can consume, handled by pausing reads until drain events fire',
        'When network packets are dropped due to MTU size limits',
        'When garbage collection pauses block the V8 heap allocations',
        'When multiple child processes compete for cluster port bindings',
      ],
      correctAnswerIndex: 0,
      explanation: 'Backpressure occurs when the data producer outpaces the consumer. Readable streams must be paused when Writable.write() returns false, and resumed once the "drain" event is emitted.',
      relatedSkill: 'Node.js',
      difficulty: 'advanced',
    },
    {
      question: 'How should unhandled asynchronous promise rejections be safely handled in modern Node.js applications?',
      codeSnippet: `process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});`,
      topic: 'Asynchronous Error Handling & Process Resilience',
      category: 'Backend',
      options: [
        'Ignore them because modern Node.js automatically swallows rejected promises without side effects',
        'Log the structured error, flush logs, and terminate gracefully to prevent corrupt indeterminate state',
        'Wrap process.exit in an infinite retry loop',
        'Catch them inside synchronous try/catch blocks in the main module',
      ],
      correctAnswerIndex: 1,
      explanation: 'Unhandled promise rejections leave the process in an indeterminate state. Best practice is to log the error, gracefully close server connections, and exit so process supervisors can restart a clean instance.',
      relatedSkill: 'Node.js',
      difficulty: 'intermediate',
    },
  ],
  Python: [
    {
      question: 'What is the primary difference between Python list comprehensions and generator expressions?',
      codeSnippet: `list_comp = [x * 2 for x in range(1000000)]
gen_exp = (x * 2 for x in range(1000000))`,
      topic: 'Memory Optimization & Iterators',
      category: 'Core Language',
      options: [
        'List comprehensions are slower because they cannot use indexing',
        'List comprehensions construct the entire list in memory eagerly, while generator expressions yield items lazily on demand',
        'Generator expressions can only yield strings',
        'List comprehensions run in separate threads concurrently',
      ],
      correctAnswerIndex: 1,
      explanation: 'Generator expressions compute values lazily using the iterator protocol, consuming minimal memory O(1) regardless of sequence size, whereas lists allocate memory eagerly O(N).',
      relatedSkill: 'Python',
      difficulty: 'intermediate',
    },
    {
      question: 'In Python, how does the GIL (Global Interpreter Lock) affect multithreaded CPU-bound vs I/O-bound tasks in CPython?',
      codeSnippet: `import threading`,
      topic: 'Concurrency & CPython GIL',
      category: 'Core Language',
      options: [
        'The GIL prevents threads from running CPU-bound code in parallel across cores, but I/O-bound tasks release the GIL during blocking calls',
        'The GIL completely prevents any threading in Python',
        'The GIL allows unlimited multicore CPU scaling for pure Python arithmetic',
        'The GIL only applies to network sockets and not disk operations',
      ],
      correctAnswerIndex: 0,
      explanation: 'In CPython, the GIL allows only one native thread to execute Python bytecode at a time. CPU-bound tasks do not achieve speedup with threading; however, I/O-bound tasks release the GIL while waiting for I/O.',
      relatedSkill: 'Python',
      difficulty: 'advanced',
    },
  ],
  Docker: [
    {
      question: 'Why should Docker multi-stage builds be utilized for compiled and bundled web applications?',
      codeSnippet: `FROM node:20 AS builder
WORKDIR /app
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html`,
      topic: 'Container Security & Image Optimization',
      category: 'DevOps & Tools',
      options: [
        'To allow multiple containers to share the same kernel namespace at runtime',
        'To leave heavy build tools and source code out of the production image, drastically reducing image size and attack surface',
        'Multi-stage builds are required to bypass Docker Hub rate limits',
        'To execute frontend unit tests automatically in the second stage',
      ],
      correctAnswerIndex: 1,
      explanation: 'Multi-stage builds separate build environments from the runtime environment, leaving compilers, node_modules, and build tooling behind so the final artifact is lean and secure.',
      relatedSkill: 'Docker',
      difficulty: 'intermediate',
    },
  ],
  Git: [
    {
      question: 'What is the principal difference between "git merge" and "git rebase"?',
      codeSnippet: `git checkout feature && git rebase main`,
      topic: 'Version Control & History Management',
      category: 'DevOps & Tools',
      options: [
        '"git merge" modifies existing commit hashes, while "git rebase" preserves all historical parent commits',
        '"git rebase" rewrites commit history by reapplying commits onto the tip of another branch, resulting in a linear history',
        '"git rebase" permanently deletes the remote branch',
        'There is no difference; they are exact aliases in modern Git',
      ],
      correctAnswerIndex: 1,
      explanation: 'Rebase rewrites commits sequentially onto the specified base branch creating a clean linear history, while merge preserves original branch structure and creates a merge commit with multiple parents.',
      relatedSkill: 'Git',
      difficulty: 'intermediate',
    },
  ],
  SQL: [
    {
      question: 'When analyzing slow database queries, what does a "Full Table Scan" (or Seq Scan) typically indicate in an EXPLAIN plan?',
      codeSnippet: `EXPLAIN ANALYZE SELECT * FROM users WHERE email = 'test@example.com';`,
      topic: 'Indexing & Query Performance Optimization',
      category: 'Database',
      options: [
        'The query utilized a covering B-Tree index optimally',
        'The query engine scanned every row because no appropriate index was available or usable for the WHERE predicate',
        'The database has run out of disk space',
        'The connection pool is exhausted',
      ],
      correctAnswerIndex: 1,
      explanation: 'A sequential scan reads every page and row from disk or buffer cache. Adding an index on filtered columns allows the engine to perform index seeks, dramatically speeding up lookups.',
      relatedSkill: 'SQL',
      difficulty: 'intermediate',
    },
  ],
  MongoDB: [
    {
      question: 'In MongoDB, how does compound index prefix matching work when evaluating query filters?',
      codeSnippet: `db.users.createIndex({ status: 1, createdAt: -1, age: 1 });`,
      topic: 'Document Indexing & ESR Rule',
      category: 'Database',
      options: [
        'Queries filtering on { age: 25 } alone can fully utilize the index',
        'Queries must filter using an index prefix starting from the first field (e.g. status, or status + createdAt) to use the index',
        'MongoDB always uses the index regardless of which fields are queried',
        'Compound indexes can only index string fields',
      ],
      correctAnswerIndex: 1,
      explanation: 'MongoDB compound indexes can only support queries that match index prefixes starting from the leftmost field (status, then status+createdAt, etc.). A query on age alone cannot use this index.',
      relatedSkill: 'MongoDB',
      difficulty: 'intermediate',
    },
  ],
  REST_API: [
    {
      question: 'According to HTTP/REST specification standards, what is the key distinction between PUT and PATCH methods?',
      codeSnippet: `PUT /api/users/123 vs PATCH /api/users/123`,
      topic: 'RESTful API Architecture & Idempotence',
      category: 'Backend',
      options: [
        'PUT applies partial updates and is non-idempotent; PATCH replaces the entire resource',
        'PUT replaces the entire resource representation idempotently; PATCH applies partial modifications to a resource',
        'PATCH cannot accept JSON payloads',
        'PUT is only used for creating new resources when the ID is unknown',
      ],
      correctAnswerIndex: 1,
      explanation: 'PUT replaces the entire target resource with the uploaded payload and is idempotent. PATCH applies partial modifications (a set of changes) to the existing resource.',
      relatedSkill: 'REST API',
      difficulty: 'intermediate',
    },
  ],
};

/**
 * Universal pool of high quality engineering questions for general full stack coverage
 */
const GENERAL_ENGINEERING_QUESTIONS: Omit<TechnicalQuestion, 'id'>[] = [
  {
    question: 'In distributed systems and microservices, what does the Idempotency Key pattern achieve?',
    codeSnippet: `POST /api/v1/payments
Idempotency-Key: 9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d`,
    topic: 'Distributed Systems & Safe Retries',
    category: 'Architecture & Testing',
    options: [
      'It encrypts sensitive payload data in transit using asymmetric keys',
      'It allows clients to safely retry requests without accidentally performing the same mutating operation multiple times',
      'It enforces single-threaded database writes across clusters',
      'It bypasses API rate limits for authenticated users',
    ],
    correctAnswerIndex: 1,
    explanation: 'An idempotency key allows servers to recognize identical requests caused by retries or network drops, returning the original result without executing duplicate transactions or double billing.',
    relatedSkill: 'System Design',
    difficulty: 'intermediate',
  },
  {
    question: 'What is the primary vulnerability prevented by utilizing parameterized SQL queries (Prepared Statements)?',
    codeSnippet: `// Safe:
db.query('SELECT * FROM users WHERE username = ?', [userInput]);
// Vulnerable:
db.query(\`SELECT * FROM users WHERE username = '\${userInput}'\`);`,
    topic: 'Application Security & SQL Injection Prevention',
    category: 'Backend',
    options: [
      'Cross-Site Scripting (XSS)',
      'SQL Injection (SQLi) by separating code structure from user-supplied data at the database parser level',
      'Cross-Site Request Forgery (CSRF)',
      'Server-Side Request Forgery (SSRF)',
    ],
    correctAnswerIndex: 1,
    explanation: 'Prepared statements treat inputs purely as literal parameters rather than executable SQL syntax, completely neutralizing SQL injection attacks.',
    relatedSkill: 'Security',
    difficulty: 'intermediate',
  },
  {
    question: 'In automated testing, what characterizes a pure Unit Test compared to an Integration Test?',
    codeSnippet: `describe('calculateTax', () => {
  it('computes 10% tax correctly', () => {
    expect(calculateTax(100)).toBe(10);
  });
});`,
    topic: 'Testing Strategies & Test Isolation',
    category: 'Architecture & Testing',
    options: [
      'Unit tests connect to live external APIs and databases to test realistic latency',
      'Unit tests test an isolated unit in complete isolation without external dependencies or I/O, using mocks where necessary',
      'Integration tests must always be written in Python',
      'Unit tests only test UI components and CSS styling',
    ],
    correctAnswerIndex: 1,
    explanation: 'Unit tests isolate small modules or functions from external subsystems (DBs, network, filesystem), ensuring fast, deterministic, repeatable feedback.',
    relatedSkill: 'Testing',
    difficulty: 'beginner',
  },
  {
    question: 'What is the primary benefit of Continuous Integration (CI) in software development teams?',
    codeSnippet: `.github/workflows/ci.yml:
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm test`,
    topic: 'CI/CD & Code Quality Automation',
    category: 'DevOps & Tools',
    options: [
      'Automatically generating user manuals for marketing teams',
      'Detecting integration bugs, linting issues, and test regressions early and continuously on every pull request',
      'Eliminating the need to write unit tests',
      'Guaranteeing that the server never needs to restart',
    ],
    correctAnswerIndex: 1,
    explanation: 'CI automates building, linting, and testing code across branches, catching defects early before code is merged into trunk or production.',
    relatedSkill: 'CI/CD',
    difficulty: 'beginner',
  },
];

/**
 * Generate 10 personalized questions using Gemini AI when configured,
 * or our comprehensive curated question bank matching the user's specific skills.
 */
export async function generatePersonalizedAssessment(
  username: string,
  skills: ExtractedSkills,
  repos: GitHubRepo[]
): Promise<{ assessmentId: string; questions: ClientQuestion[]; totalQuestions: number }> {
  let questions: TechnicalQuestion[] = [];

  // Try AI-powered personalized generation if GEMINI_API_KEY is configured
  if (config.geminiApiKey) {
    try {
      questions = await generateWithGemini(username, skills, repos);
    } catch (err: any) {
      console.warn('[Assessment Service] Gemini generation failed, falling back to curated bank:', err.message);
      questions = [];
    }
  }

  // Fallback to tailored question selection if AI was not used or failed
  if (questions.length !== 10) {
    questions = selectCuratedQuestions(skills, repos);
  }

  // Ensure exactly 10 questions numbered 1 to 10
  questions = questions.slice(0, 10).map((q, idx) => ({
    ...q,
    id: idx + 1,
  }));

  // Store in memory for secure evaluation
  const assessmentId = `asmt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  assessmentStore.set(assessmentId, {
    id: assessmentId,
    username,
    createdAt: Date.now(),
    questions,
    completed: false,
    skills,
  });

  // Client view: strip correct answers and explanations
  const clientQuestions: ClientQuestion[] = questions.map(q => ({
    id: q.id,
    question: q.question,
    codeSnippet: q.codeSnippet,
    topic: q.topic,
    category: q.category,
    options: q.options,
    relatedSkill: q.relatedSkill,
    difficulty: q.difficulty,
  }));

  return {
    assessmentId,
    questions: clientQuestions,
    totalQuestions: 10,
  };
}

/**
 * AI-driven question generation via Google Gemini
 */
async function generateWithGemini(
  username: string,
  skills: ExtractedSkills,
  repos: GitHubRepo[]
): Promise<TechnicalQuestion[]> {
  const ai = new GoogleGenAI({ apiKey: config.geminiApiKey });

  const topReposSummary = repos
    .filter(r => !r.fork)
    .slice(0, 5)
    .map(r => `${r.name} (${r.language || 'Code'}, ${r.stargazers_count} stars, desc: "${(r.description || '').slice(0, 80)}")`)
    .join('; ');

  const detectedLanguages = skills.languages.join(', ') || 'JavaScript, TypeScript';
  const detectedFrameworks = skills.frameworks.join(', ') || 'React, Node.js';
  const detectedTools = skills.tools.join(', ') || 'Git, Docker';

  const prompt = `You are a Principal Software Engineer and Technical Interview Architect.
Generate EXACTLY 10 personalized technical multiple-choice questions for software engineer "${username}".
Based on their real GitHub repositories, their detected tech stack is:
- Programming Languages: ${detectedLanguages}
- Frameworks & Libraries: ${detectedFrameworks}
- Tools & Infrastructure: ${detectedTools}
- Analyzed Projects: ${topReposSummary || 'Modern Web Application Repositories'}

RULES:
1. Return a JSON array with EXACTLY 10 items. No markdown wrap, no conversational text.
2. Directly personalize questions to the languages and frameworks they actively use (${skills.languages.slice(0, 3).join(', ')}).
3. Test realistic, practical engineering understanding: state management, asynchronous control flow, type narrowing, memory/performance leaks, error propagation, API boundaries, security, and debugging.
4. Each question must have EXACTLY 4 plausible multiple-choice options (options array of 4 strings).
5. correctAnswerIndex MUST be an integer: 0, 1, 2, or 3.
6. Provide an insightful, educational "explanation" of why that answer is correct.
7. Set difficulty to "beginner", "intermediate", or "advanced".
8. Include realistic code snippets in "codeSnippet" (or null if conceptual).

JSON Structure:
[
  {
    "id": 1,
    "question": "Question text here...",
    "codeSnippet": "code snippet or null",
    "topic": "Specific Technical Topic",
    "category": "Frontend | Backend | Database | DevOps & Tools | Core Language | Architecture & Testing",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswerIndex": 0,
    "explanation": "Why this option is correct...",
    "relatedSkill": "JavaScript",
    "difficulty": "intermediate"
  }
]`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      temperature: 0.3,
      responseMimeType: 'application/json',
    },
  });

  const text = response.text?.trim() || '';
  const parsed = JSON.parse(text);

  if (!Array.isArray(parsed) || parsed.length !== 10) {
    throw new Error(`Gemini returned ${parsed?.length || 0} questions instead of 10.`);
  }

  // Validate format of each question
  for (const q of parsed) {
    if (
      !q.question ||
      !Array.isArray(q.options) ||
      q.options.length !== 4 ||
      typeof q.correctAnswerIndex !== 'number' ||
      q.correctAnswerIndex < 0 ||
      q.correctAnswerIndex > 3 ||
      !q.explanation
    ) {
      throw new Error('Invalid question structure returned by AI.');
    }
  }

  return parsed;
}

/**
 * Curated question selector matching candidate's detected skills
 */
function selectCuratedQuestions(skills: ExtractedSkills, repos: GitHubRepo[]): TechnicalQuestion[] {
  const chosen: Omit<TechnicalQuestion, 'id'>[] = [];
  const primaryLangs = skills.languages.length > 0 ? skills.languages : ['JavaScript', 'TypeScript'];
  const primaryFrameworks = skills.frameworks.length > 0 ? skills.frameworks : ['React', 'Node.js'];

  // 1. Add questions from primary languages
  for (const lang of primaryLangs) {
    const list = CURATED_QUESTIONS_BY_TECH[lang];
    if (list) {
      chosen.push(...list);
    }
  }

  // 2. Add questions from primary frameworks
  for (const fw of primaryFrameworks) {
    const list = CURATED_QUESTIONS_BY_TECH[fw];
    if (list) {
      chosen.push(...list);
    }
  }

  // 3. Add questions from tools (Git, Docker, SQL, MongoDB)
  for (const tool of [...skills.tools, ...skills.databases]) {
    const list = CURATED_QUESTIONS_BY_TECH[tool];
    if (list) {
      chosen.push(...list);
    }
  }

  // 4. Fill remaining up to 10 from general engineering pool
  for (const gen of GENERAL_ENGINEERING_QUESTIONS) {
    if (chosen.length < 10 && !chosen.some(c => c.topic === gen.topic)) {
      chosen.push(gen);
    }
  }

  // 5. Fill remaining from other curated questions if still under 10
  if (chosen.length < 10) {
    for (const pool of Object.values(CURATED_QUESTIONS_BY_TECH)) {
      for (const q of pool) {
        if (chosen.length < 10 && !chosen.some(c => c.topic === q.topic)) {
          chosen.push(q);
        }
      }
    }
  }

  // Take exactly 10 and map id
  return chosen.slice(0, 10).map((q, idx) => ({
    ...q,
    id: idx + 1,
  }));
}

/**
 * Submit and evaluate assessment answers, generate scores and weaknesses
 */
export async function evaluateAssessment(
  assessmentId: string,
  answers: AssessmentSubmissionAnswer[]
): Promise<AssessmentResult> {
  const record = assessmentStore.get(assessmentId);
  if (!record) {
    throw new Error('Assessment session not found or expired. Please start a new assessment.');
  }

  if (record.completed && record.result) {
    return record.result;
  }

  const answerMap = new Map<number, number>();
  for (const a of answers) {
    answerMap.set(a.questionId, a.selectedOptionIndex);
  }

  const questionResults: QuestionEvaluationResult[] = [];
  const weaknesses: IdentifiedWeakness[] = [];
  const strengths: IdentifiedStrength[] = [];
  const topicMap = new Map<string, { category: string; correct: number; total: number }>();

  let correctCount = 0;

  for (const q of record.questions) {
    const userAns = answerMap.has(q.id) ? (answerMap.get(q.id) as number) : -1;
    const isCorrect = userAns === q.correctAnswerIndex;

    if (isCorrect) {
      correctCount++;
    }

    // Track topic
    const currentTopic = topicMap.get(q.topic) || { category: q.category, correct: 0, total: 0 };
    currentTopic.total++;
    if (isCorrect) currentTopic.correct++;
    topicMap.set(q.topic, currentTopic);

    questionResults.push({
      questionId: q.id,
      question: q.question,
      codeSnippet: q.codeSnippet,
      topic: q.topic,
      category: q.category,
      options: q.options,
      userAnswerIndex: userAns,
      correctAnswerIndex: q.correctAnswerIndex,
      isCorrect,
      explanation: q.explanation,
      relatedSkill: q.relatedSkill,
    });

    if (isCorrect) {
      strengths.push({
        topic: q.topic,
        relatedSkill: q.relatedSkill,
        category: q.category,
        evidence: `Correctly answered ${q.difficulty} question on ${q.topic}`,
      });
    } else {
      // Create detailed weakness profile
      const chosenOptionText = userAns >= 0 && userAns < q.options.length ? `"${q.options[userAns]}"` : 'no answer provided';
      const correctOptionText = `"${q.options[q.correctAnswerIndex]}"`;

      weaknesses.push({
        id: `weak_${q.id}_${q.relatedSkill.toLowerCase()}`,
        topic: q.topic,
        relatedSkill: q.relatedSkill,
        category: q.category,
        evidence: `Selected ${chosenOptionText} instead of ${correctOptionText} on: ${q.question.slice(0, 90)}...`,
        whyItMatters: getWhyItMatters(q.topic, q.relatedSkill),
        learningPriority: q.difficulty === 'beginner' ? 'High' : 'Medium',
        practicalTasks: getPracticalTasks(q.topic, q.relatedSkill),
        searchQueries: getSearchQueriesForWeakness(q.topic, q.relatedSkill),
      });
    }
  }

  const percentage = Math.round((correctCount / record.questions.length) * 100);

  let performanceRating: AssessmentResult['performanceRating'] = 'Developing';
  if (percentage >= 90) performanceRating = 'Mastery';
  else if (percentage >= 70) performanceRating = 'Proficient';
  else if (percentage >= 50) performanceRating = 'Developing';
  else performanceRating = 'Needs Improvement';

  // Topic performance breakdown
  const topicBreakdown: TopicPerformance[] = Array.from(topicMap.entries()).map(([topic, data]) => ({
    topic,
    category: data.category,
    correct: data.correct,
    total: data.total,
    percentage: Math.round((data.correct / data.total) * 100),
  }));

  // If candidate scored 10/10, recommend advanced stretch goals
  if (weaknesses.length === 0) {
    weaknesses.push({
      id: 'stretch_adv_perf',
      topic: 'Advanced Architecture & High-Scale Optimization',
      relatedSkill: record.skills.languages[0] || 'Software Engineering',
      category: 'Architecture & Testing',
      evidence: 'Scored 10/10! Demonstrates full mastery of foundational and intermediate concepts.',
      whyItMatters: 'To reach senior and staff engineer levels, deepen knowledge in profiling, memory leaks, and distributed resilience.',
      learningPriority: 'Medium',
      practicalTasks: [
        'Profile CPU and memory allocation in a high-throughput microservice',
        'Implement automated mutation testing to evaluate suite robustness',
        'Contribute performance benchmarks to popular open source libraries',
      ],
      searchQueries: [`language:${record.skills.languages[0] || 'TypeScript'} label:"performance"`, 'label:"help wanted" "refactor"'],
    });
  }

  const result: AssessmentResult = {
    assessmentId,
    username: record.username,
    score: correctCount,
    totalQuestions: record.questions.length,
    percentage,
    performanceRating,
    evaluationSummary: `Scored ${correctCount}/${record.questions.length} (${percentage}%). Identified ${strengths.length} verified strong topics and ${weaknesses.length} targeted areas for improvement.`,
    questionResults,
    topicBreakdown,
    strengths,
    weaknesses,
    completedAt: new Date().toISOString(),
  };

  record.completed = true;
  record.result = result;

  return result;
}

/**
 * Get cached assessment result if already evaluated
 */
export function getAssessmentResult(assessmentId: string): AssessmentResult | null {
  const record = assessmentStore.get(assessmentId);
  return record?.result || null;
}

function getWhyItMatters(topic: string, skill: string): string {
  if (topic.includes('Event Loop') || topic.includes('Async')) {
    return 'Understanding asynchronous concurrency and execution order is critical for preventing race conditions, unhandled rejections, and latency bottlenecks.';
  }
  if (topic.includes('Type') || topic.includes('Generics')) {
    return 'Strict type safety and precise generic typing catch runtime errors at compile time, eliminating undefined errors across large production codebases.';
  }
  if (topic.includes('Hook') || topic.includes('Performance') || topic.includes('Memo')) {
    return 'Improper render cycles and missed memoization cause laggy user interfaces and memory leaks in real-world web applications.';
  }
  if (topic.includes('Security') || topic.includes('Injection')) {
    return 'Defensive engineering and input sanitization protect sensitive user data from catastrophic breaches and critical CVE vulnerabilities.';
  }
  if (topic.includes('Index') || topic.includes('Query')) {
    return 'Proper database indexing prevents expensive full-table scans and allows queries to scale efficiently as data volume grows.';
  }
  return `Mastery of ${topic} is an essential competency for building maintainable, robust ${skill} production systems.`;
}

function getPracticalTasks(topic: string, skill: string): string[] {
  return [
    `Build a focused micro-project or unit test suite isolating edge cases in ${topic}`,
    `Review open pull requests in high-star ${skill} repositories to inspect how seasoned contributors handle ${topic}`,
    `Contribute a bug fix or test improvement to a real open-source repository encountering ${topic} issues`,
  ];
}

function getSearchQueriesForWeakness(topic: string, skill: string): string[] {
  const cleanSkill = skill.replace(/[^a-zA-Z0-9]/g, '');
  const terms: string[] = [];

  if (topic.includes('Async') || topic.includes('Event Loop')) {
    terms.push(`language:${cleanSkill} "async" label:"good first issue"`);
    terms.push(`language:${cleanSkill} "promise" label:"help wanted"`);
  } else if (topic.includes('Type') || topic.includes('Generics')) {
    terms.push(`language:TypeScript "types" label:"good first issue"`);
    terms.push(`language:TypeScript label:"help wanted" "typing"`);
  } else if (topic.includes('Hook') || topic.includes('Lifecycle')) {
    terms.push(`"react" "hook" label:"good first issue"`);
    terms.push(`"react" label:"help wanted" "bug"`);
  } else if (topic.includes('Test')) {
    terms.push(`language:${cleanSkill} label:"good first issue" "test"`);
    terms.push(`language:${cleanSkill} label:"documentation"`);
  } else {
    terms.push(`language:${cleanSkill} label:"good first issue"`);
    terms.push(`language:${cleanSkill} label:"help wanted"`);
  }

  return terms;
}
