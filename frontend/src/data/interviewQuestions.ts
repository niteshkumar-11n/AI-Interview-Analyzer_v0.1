export interface InterviewSkillQuestion {
  id: string;
  skill: string;
  level: 'easy' | 'medium' | 'hard';
  levelName: string;
  timeLimit: number; // 30 for easy, 40 for medium, 60 for hard
  question: string;
  context: string;
  keyPoints: string[];
  sampleAnswerHint: string;
  jdAlignment: string;
}

export interface SkillQuestionPack {
  skill: string;
  category: 'Frontend' | 'Backend' | 'Database' | 'DevOps' | 'Architecture';
  inResume: boolean;
  inJD: boolean;
  proficiency?: number;
  questions: {
    easy: InterviewSkillQuestion;
    medium: InterviewSkillQuestion;
    hard: InterviewSkillQuestion;
  };
}

export const SKILL_QUESTION_DATABASE: SkillQuestionPack[] = [
  {
    skill: 'React',
    category: 'Frontend',
    inResume: true,
    inJD: true,
    proficiency: 90,
    questions: {
      easy: {
        id: 'react-easy-1',
        skill: 'React',
        level: 'easy',
        levelName: 'Level 1: Easy',
        timeLimit: 30, // 30s
        question: 'What is JSX in React, and what is the key difference between props and state?',
        context: 'Resume: React (Expert 90%) • JD: Component Architecture',
        keyPoints: [
          'JSX is a syntax extension for JavaScript that compiles to React.createElement() calls',
          'Props are read-only, passed from parent to child',
          'State is locally managed within a component and triggers re-renders on change'
        ],
        sampleAnswerHint: 'JSX allows writing HTML-like structures inside JavaScript. Props are immutable parameters passed downward; state is mutable and encapsulated inside the component.',
        jdAlignment: 'Core JD requirement: React component lifecycle and state management'
      },
      medium: {
        id: 'react-med-1',
        skill: 'React',
        level: 'medium',
        levelName: 'Level 2: Medium',
        timeLimit: 40, // 40s
        question: 'How does the useEffect dependency array work, and how do you prevent stale closures in asynchronous effects?',
        context: 'Resume: React Hooks • JD: Performance Optimization',
        keyPoints: [
          'Dependencies are checked using Object.is shallow comparison between renders',
          'Empty array runs once on mount; omitted array runs after every render',
          'Prevent stale closures using functional state updates (prev => prev + 1) or useRef to keep fresh values'
        ],
        sampleAnswerHint: 'useEffect compares deps with Object.is. Stale closures occur when async callbacks capture old scope values; resolve using functional state setters or mutable ref pointers.',
        jdAlignment: 'Vital for avoiding memory leaks and re-render loops in interactive web apps'
      },
      hard: {
        id: 'react-hard-1',
        skill: 'React',
        level: 'hard',
        levelName: 'Level 3: Hard',
        timeLimit: 60, // 1 min (60s)
        question: 'Explain React 18 Concurrent Rendering, how the Fiber reconciliation scheduler prioritizes work, and when to use useTransition versus useDeferredValue.',
        context: 'Resume: Advanced Frontend • JD: High Throughput UI Performance',
        keyPoints: [
          'Concurrent rendering pauses, resumes, and discards render work without blocking the main browser thread',
          'Fiber nodes represent virtual stack frames with priority lanes (Sync, Continuous, Default, Transition)',
          'useTransition wraps state update triggers (actions), while useDeferredValue wraps derived values/props',
          'Prevents UI input freezing during heavy DOM reconciliations'
        ],
        sampleAnswerHint: 'Concurrent React breaks render work into interruptible chunks. useTransition tells React that a state dispatch is low-priority (e.g. search filter), whereas useDeferredValue defers re-rendering heavy child trees receiving fast-changing props.',
        jdAlignment: 'Directly addresses large-scale dashboard responsiveness requested in JD'
      }
    }
  },
  {
    skill: 'Node.js',
    category: 'Backend',
    inResume: true,
    inJD: true,
    proficiency: 84,
    questions: {
      easy: {
        id: 'node-easy-1',
        skill: 'Node.js',
        level: 'easy',
        levelName: 'Level 1: Easy',
        timeLimit: 30, // 30s
        question: 'What is the Node.js Event Loop, and why is Node described as single-threaded yet non-blocking?',
        context: 'Resume: Node.js (84%) • JD: Scalable Microservices',
        keyPoints: [
          'JavaScript runs on a single main thread handling execution stack and event dispatching',
          'libuv handles I/O operations, disk access, and networking using background thread pools',
          'Callbacks are queued and processed through Event Loop phases (Timers, I/O, Poll, Check, Close)'
        ],
        sampleAnswerHint: 'Node executes JS on one thread, but delegates asynchronous file and network operations to libuv worker threads, returning results through the event loop non-blockingly.',
        jdAlignment: 'Core backend requirement for building asynchronous REST services'
      },
      medium: {
        id: 'node-med-1',
        skill: 'Node.js',
        level: 'medium',
        levelName: 'Level 2: Medium',
        timeLimit: 40, // 40s
        question: 'Explain how Express middleware works and how centralized error-handling middleware differs from regular route middleware.',
        context: 'Resume: Express.js • JD: Robust Backend APIs',
        keyPoints: [
          'Middleware functions execute sequentially in the pipeline: (req, res, next)',
          'Calling next() forwards flow to the next handler; omitting it leaves the request hanging',
          'Error middleware has 4 parameters: (err, req, res, next)',
          'Express recognizes 4-arity functions as error catchers at the end of the chain'
        ],
        sampleAnswerHint: 'Regular middleware processes (req, res, next). Error-handling middleware specifies 4 arguments (err, req, res, next) and is placed at the end of the app chain to catch forward errors from next(err).',
        jdAlignment: 'Ensures API error resilience and standardized JSON error responses'
      },
      hard: {
        id: 'node-hard-1',
        skill: 'Node.js',
        level: 'hard',
        levelName: 'Level 3: Hard',
        timeLimit: 60, // 1 min (60s)
        question: 'How would you architect a Node.js service handling 15,000 requests/sec with CPU-intensive data transformations to keep event-loop delay under 30ms?',
        context: 'Resume: Backend Architecture • JD: Distributed Systems & Concurrency',
        keyPoints: [
          'Offload heavy computation to Worker Threads (worker_threads) or separate worker microservices via Redis Queue',
          'Utilize Node Cluster module or PM2 cluster to fork processes matching CPU core count',
          'Implement stream-based backpressure (Readable.pipe(Transform).pipe(Writable)) to minimize memory heap spikes',
          'Monitor Event Loop lag using perf_hooks or libuv metrics'
        ],
        sampleAnswerHint: 'Scale horizontally using Cluster/PM2 across cores. Offload CPU-bound tasks to Worker Threads or an asynchronous message queue (RabbitMQ/BullMQ). Use Node streams with backpressure to prevent buffer bloat.',
        jdAlignment: 'Directly tests scalability standards specified in the JD requirements'
      }
    }
  },
  {
    skill: 'JavaScript',
    category: 'Frontend',
    inResume: true,
    inJD: true,
    proficiency: 85,
    questions: {
      easy: {
        id: 'js-easy-1',
        skill: 'JavaScript',
        level: 'easy',
        levelName: 'Level 1: Easy',
        timeLimit: 30, // 30s
        question: 'What are the main differences between var, let, and const in JavaScript scoping and hoisting?',
        context: 'Resume: JavaScript (85%) • JD: ES6+ Standards',
        keyPoints: [
          'var is function-scoped and hoisted with undefined initialization',
          'let and const are block-scoped and hoisted into the Temporal Dead Zone (TDZ)',
          'const cannot be reassigned (though mutated if reference object)'
        ],
        sampleAnswerHint: 'var has function scope and hoists to undefined. let and const have block scope and reside in the TDZ until declared. const prevents reassignment.',
        jdAlignment: 'Fundamental language standard required for all full stack codebases'
      },
      medium: {
        id: 'js-med-1',
        skill: 'JavaScript',
        level: 'medium',
        levelName: 'Level 2: Medium',
        timeLimit: 40, // 40s
        question: 'What is a closure in JavaScript, and what is a practical scenario where closures can cause unexpected memory leaks?',
        context: 'Resume: Core JS Mechanics • JD: Memory & Performance',
        keyPoints: [
          'A closure is a function that retains access to its lexical outer scope even when executed outside that scope',
          'Practical uses include data privacy/encapsulation, memoization, and currying',
          'Memory leaks happen when closures hold references to large outer objects in long-lived event listeners or intervals'
        ],
        sampleAnswerHint: 'A closure preserves variables from its lexical environment. Leaks occur when closures inside uncleared event listeners or timers retain references to heavy DOM elements or arrays.',
        jdAlignment: 'Critical for developing clean, leak-free single-page applications'
      },
      hard: {
        id: 'js-hard-1',
        skill: 'JavaScript',
        level: 'hard',
        levelName: 'Level 3: Hard',
        timeLimit: 60, // 1 min (60s)
        question: 'Explain the exact execution order of JavaScript Microtasks, Macrotasks, MutationObservers, and requestAnimationFrame during browser event loop turns.',
        context: 'Resume: Advanced JS Engine • JD: Frontend Optimization',
        keyPoints: [
          'Synchronous call stack executes first until completely empty',
          'Microtask queue (Promises, queueMicrotask) empties entirely before any macrotask runs',
          'MutationObserver callbacks execute as microtasks at the end of current turn',
          'requestAnimationFrame callbacks fire just before browser layout/paint steps',
          'Macrotask queue (setTimeout, setInterval, I/O) executes one task per loop iteration'
        ],
        sampleAnswerHint: 'Call stack runs first. The microtask queue completely drains immediately after stack clearance. The browser renders (triggering rAF, style recalc, paint), then processes the next single macrotask from the task queue.',
        jdAlignment: 'Advanced front-end performance requirement for real-time applications'
      }
    }
  },
  {
    skill: 'MongoDB',
    category: 'Database',
    inResume: true,
    inJD: true,
    proficiency: 80,
    questions: {
      easy: {
        id: 'mongo-easy-1',
        skill: 'MongoDB',
        level: 'easy',
        levelName: 'Level 1: Easy',
        timeLimit: 30, // 30s
        question: 'What is MongoDB, and what is the difference between a collection and a document?',
        context: 'Resume: MongoDB (80%) • JD: NoSQL Schema Modeling',
        keyPoints: [
          'MongoDB is a document-oriented NoSQL database storing JSON-like BSON records',
          'A document is an individual record (analogous to a SQL row)',
          'A collection is a grouped set of documents (analogous to a SQL table)'
        ],
        sampleAnswerHint: 'MongoDB stores flexible BSON documents. A document is a single data record; a collection is a container grouping multiple related documents.',
        jdAlignment: 'Core database stack in candidate resume and target role'
      },
      medium: {
        id: 'mongo-med-1',
        skill: 'MongoDB',
        level: 'medium',
        levelName: 'Level 2: Medium',
        timeLimit: 40, // 40s
        question: 'When should you choose embedded subdocuments versus referenced relationships in MongoDB data modeling?',
        context: 'Resume: Database Design • JD: Scalable Schema Modeling',
        keyPoints: [
          'Embed for 1-to-few relationships with bounded growth (e.g. user addresses)',
          'Embed provides atomic single-document reads without joins/lookups',
          'Reference for 1-to-many or many-to-many with unbounded growth (e.g. log items, social followers)',
          'Avoid hitting the 16MB BSON document hard limit'
        ],
        sampleAnswerHint: 'Embed when data is accessed together and growth is bounded (under 16MB). Reference when relationships are 1-to-millions, frequently queried independently, or require normalization.',
        jdAlignment: 'Essential for designing e-commerce order and product schemas'
      },
      hard: {
        id: 'mongo-hard-1',
        skill: 'MongoDB',
        level: 'hard',
        levelName: 'Level 3: Hard',
        timeLimit: 60, // 1 min (60s)
        question: 'How do multi-document ACID transactions, write concern ("majority"), and change streams ensure data consistency during network partitions in MongoDB replica sets?',
        context: 'Resume: Distributed Data • JD: High Availability & Consistency',
        keyPoints: [
          'Multi-document ACID transactions use snapshot isolation across sessions',
          'Write concern { w: "majority", j: true } ensures writes commit to a quorum and journal on disk before acknowledging',
          'Read concern "linearizable" or "majority" prevents dirty reads during primary failovers',
          'Change Streams leverage the replica set oplog to emit reliable event feeds to downstream services'
        ],
        sampleAnswerHint: 'Transactions provide multi-document atomicity via sessions. Write concern "majority" guarantees committed writes survive primary reelection. Change streams tail the oplog to trigger sync events.',
        jdAlignment: 'Tests financial transaction reliability specified in target job description'
      }
    }
  },
  {
    skill: 'REST API',
    category: 'Backend',
    inResume: true,
    inJD: true,
    proficiency: 88,
    questions: {
      easy: {
        id: 'rest-easy-1',
        skill: 'REST API',
        level: 'easy',
        levelName: 'Level 1: Easy',
        timeLimit: 30, // 30s
        question: 'What are the main HTTP methods in REST, and what is the difference between PUT and PATCH?',
        context: 'Resume: RESTful APIs • JD: Clean API Contracts',
        keyPoints: [
          'Standard methods: GET (read), POST (create), PUT (replace), PATCH (partial update), DELETE (remove)',
          'PUT is idempotent and replaces the entire target resource representation',
          'PATCH applies partial modifications to the resource'
        ],
        sampleAnswerHint: 'PUT replaces the complete resource idempotently. PATCH applies delta/partial updates to specific fields.',
        jdAlignment: 'Core API integration required for client-server communication'
      },
      medium: {
        id: 'rest-med-1',
        skill: 'REST API',
        level: 'medium',
        levelName: 'Level 2: Medium',
        timeLimit: 40, // 40s
        question: 'How do idempotency keys and exponential backoff prevent duplicate transactions in distributed REST APIs?',
        context: 'Resume: Webhook & Payment APIs • JD: Fault Tolerant Architecture',
        keyPoints: [
          'Client generates unique Idempotency-Key header for sensitive operations (e.g. payments)',
          'Server caches the key in Redis and returns cached result on retries without re-executing',
          'Exponential backoff with jitter prevents thundering herd problem during transient network drops'
        ],
        sampleAnswerHint: 'Clients supply an Idempotency-Key header. The server checks if the key was already processed; if so, it returns the cached response. Exponential backoff increases retry intervals with randomized jitter.',
        jdAlignment: 'Critical for preventing double-charges in payment and booking workflows'
      },
      hard: {
        id: 'rest-hard-1',
        skill: 'REST API',
        level: 'hard',
        levelName: 'Level 3: Hard',
        timeLimit: 60, // 1 min (60s)
        question: 'Design a distributed rate-limiting architecture for public REST APIs using the Token Bucket algorithm and Redis Lua scripts with sub-millisecond overhead.',
        context: 'Resume: API Security • JD: Distributed Microservices & Traffic Control',
        keyPoints: [
          'Token bucket tracks capacity, refill rate, and timestamp per API key/IP',
          'Execute logic inside a single Redis Lua script to guarantee atomic evaluation and zero race conditions',
          'Return HTTP 429 Too Many Requests with Retry-After and X-RateLimit headers',
          'Use Redis cluster with local in-memory fallback tier for high availability'
        ],
        sampleAnswerHint: 'Store tokens and last_refill_timestamp in Redis hash. Evaluate and refill tokens atomically via a Lua script to avoid round-trips. When tokens drop below required cost, return 429 with standard rate-limit headers.',
        jdAlignment: 'Directly validates system security and traffic management from JD'
      }
    }
  },
  {
    skill: 'Git',
    category: 'DevOps',
    inResume: true,
    inJD: true,
    proficiency: 88,
    questions: {
      easy: {
        id: 'git-easy-1',
        skill: 'Git',
        level: 'easy',
        levelName: 'Level 1: Easy',
        timeLimit: 30, // 30s
        question: 'What is the difference between git fetch and git pull in Git workflow?',
        context: 'Resume: Git (88%) • JD: Collaborative CI/CD',
        keyPoints: [
          'git fetch downloads commits and references from remote without modifying working files',
          'git pull runs git fetch followed by git merge into the current local branch',
          'git fetch allows inspecting changes before integrating'
        ],
        sampleAnswerHint: 'git fetch retrieves remote changes into origin tracking branches without altering your work. git pull fetches and immediately merges remote changes into your active branch.',
        jdAlignment: 'Standard development workflow prerequisite'
      },
      medium: {
        id: 'git-med-1',
        skill: 'Git',
        level: 'medium',
        levelName: 'Level 2: Medium',
        timeLimit: 40, // 40s
        question: 'Compare git merge versus git rebase, and what is the "Golden Rule of Rebasing"?',
        context: 'Resume: Branching Strategy • JD: Clean Git History',
        keyPoints: [
          'Merge creates a merge commit preserving non-linear branch history',
          'Rebase replays branch commits on top of base branch for a linear history',
          'Golden Rule: Never rebase commits that have been pushed to a shared public branch'
        ],
        sampleAnswerHint: 'Merge preserves real branch timelines with explicit merge commits. Rebase rewrites commit hashes to create linear history. Never rebase shared public branches because it alters commit history for teammates.',
        jdAlignment: 'Ensures healthy branch management and release integrity'
      },
      hard: {
        id: 'git-hard-1',
        skill: 'Git',
        level: 'hard',
        levelName: 'Level 3: Hard',
        timeLimit: 60, // 1 min (60s)
        question: 'Explain Git internal plumbing objects (blobs, trees, commits, annotated tags) and how to recover a hard-deleted commit using git reflog.',
        context: 'Resume: Advanced DevOps • JD: Repository Management',
        keyPoints: [
          'Blobs store file content; Trees store directory structure and filenames mapping to SHA-1 hashes',
          'Commit objects point to a tree, parent commits, author, committer, and message',
          'git reflog logs every HEAD update locally, even after git reset --hard',
          'Recover by inspecting reflog, finding the lost commit SHA, and running git branch recovery-branch <SHA>'
        ],
        sampleAnswerHint: 'Git is a content-addressable store: blobs hold data, trees hold structure, commits hold metadata. Even after a hard reset, commits remain in git reflog until garbage collected; restore with git branch restore-branch HEAD@{n}.',
        jdAlignment: 'Advanced team troubleshooting capability'
      }
    }
  },
  {
    skill: 'Docker',
    category: 'DevOps',
    inResume: false, // In target JD
    inJD: true,
    proficiency: 65,
    questions: {
      easy: {
        id: 'docker-easy-1',
        skill: 'Docker',
        level: 'easy',
        levelName: 'Level 1: Easy',
        timeLimit: 30, // 30s
        question: 'What is the difference between a Docker image and a Docker container?',
        context: 'Target JD Skill • JD: Containerization & Cloud Deployment',
        keyPoints: [
          'An image is an immutable, read-only template with application code, runtime, and libraries',
          'A container is a live, runnable instance of an image with a writable layer on top',
          'Multiple containers can run from a single base image'
        ],
        sampleAnswerHint: 'An image is a static snapshot and recipe. A container is the active running process isolated with its own runtime state.',
        jdAlignment: 'Target Job Description requirement for deployment automation'
      },
      medium: {
        id: 'docker-med-1',
        skill: 'Docker',
        level: 'medium',
        levelName: 'Level 2: Medium',
        timeLimit: 40, // 40s
        question: 'What are Docker multi-stage builds, and why are they recommended for production Node.js applications?',
        context: 'Target JD Requirement • JD: Optimized Docker Images',
        keyPoints: [
          'Multi-stage builds use multiple FROM directives in a single Dockerfile',
          'Build stage compiles code and installs build tools/devDependencies',
          'Production stage copies only compiled artifacts and production dependencies',
          'Drastically shrinks final image size (e.g. from 1GB to 90MB) and eliminates build attack vectors'
        ],
        sampleAnswerHint: 'Multi-stage builds allow separating build-time dependencies from production images. You build TypeScript in stage 1, then copy only the dist/ folder and production node_modules into a minimal Alpine image.',
        jdAlignment: 'Reduces cloud hosting costs and attack surface required in JD'
      },
      hard: {
        id: 'docker-hard-1',
        skill: 'Docker',
        level: 'hard',
        levelName: 'Level 3: Hard',
        timeLimit: 60, // 1 min (60s)
        question: 'How do Linux cgroups and namespaces isolate containers, and how do you configure graceful SIGTERM handling and health checks in Docker?',
        context: 'Target JD Requirement • JD: Container Orchestration & Reliability',
        keyPoints: [
          'Namespaces provide process, network, mount, IPC, and PID isolation',
          'Control Groups (cgroups) limit and throttle hardware resources (CPU, RAM, block I/O)',
          'Node.js must not run as PID 1 directly unless using init (tini/dumb-init) to properly handle SIGTERM and avoid zombie processes',
          'HEALTHCHECK instruction tests liveness endpoint and allows orchestrators to restart unhealthy containers'
        ],
        sampleAnswerHint: 'Namespaces isolate what processes can see; cgroups limit resource consumption. For graceful shutdowns, wrap Node with dumb-init so SIGTERM reaches the process, allowing server.close() to finish pending requests.',
        jdAlignment: 'Crucial for Kubernetes production deployments mentioned in target JD'
      }
    }
  },
  {
    skill: 'System Design',
    category: 'Architecture',
    inResume: true,
    inJD: true,
    proficiency: 78,
    questions: {
      easy: {
        id: 'sys-easy-1',
        skill: 'System Design',
        level: 'easy',
        levelName: 'Level 1: Easy',
        timeLimit: 30, // 30s
        question: 'What is the difference between horizontal and vertical scaling in web application architecture?',
        context: 'Resume: System Design • JD: Scalable Infrastructure',
        keyPoints: [
          'Vertical scaling (scaling up) adds more CPU/RAM to a single existing server',
          'Horizontal scaling (scaling out) adds more server instances behind a load balancer',
          'Horizontal scaling provides higher fault tolerance and avoids single-machine hardware ceilings'
        ],
        sampleAnswerHint: 'Vertical scaling upgrades machine hardware (limited by physical constraints). Horizontal scaling adds more machines behind a load balancer, providing resilience against server crashes.',
        jdAlignment: 'Core architectural foundation required for full stack roles'
      },
      medium: {
        id: 'sys-med-1',
        skill: 'System Design',
        level: 'medium',
        levelName: 'Level 2: Medium',
        timeLimit: 40, // 40s
        question: 'Explain the Cache-Aside pattern and how you handle cache invalidation when data updates in the database.',
        context: 'Resume: Redis / Caching • JD: High Performance APIs',
        keyPoints: [
          'Application first queries cache; on cache miss, reads from DB and populates cache',
          'On updates, write to database and delete/invalidate the corresponding cache key',
          'Set a defensive TTL (Time-to-Live) to prevent indefinitely stale data',
          'Use cache locking or single-flight to avoid cache stampede (thundering herd)'
        ],
        sampleAnswerHint: 'Cache-Aside reads from cache first. On miss, it reads from database and saves to cache with a TTL. On write, mutate database and invalidate/delete the cache key so next read fetches fresh data.',
        jdAlignment: 'Essential for high-traffic endpoints in target job description'
      },
      hard: {
        id: 'sys-hard-1',
        skill: 'System Design',
        level: 'hard',
        levelName: 'Level 3: Hard',
        timeLimit: 60, // 1 min (60s)
        question: 'Design a distributed notifications system supporting Push, SMS, and Email with guaranteed at-least-once delivery, rate limiting, and priority queues.',
        context: 'Resume: Distributed Systems • JD: Message Queues & Event-Driven Systems',
        keyPoints: [
          'API Gateway validates request and pushes payload to Apache Kafka / RabbitMQ with priority partitioning',
          'Workers consume messages based on priority (OTP > Transactional > Promotional)',
          'Dead Letter Queues (DLQ) capture failed attempts with exponential retry backoff',
          'User preference and rate-limit filter checks user opt-outs and frequency caps in Redis',
          'Idempotency keys prevent duplicated delivery across third-party provider webhooks'
        ],
        sampleAnswerHint: 'Use an event-driven pub/sub architecture. Route notifications to priority Kafka topics. Worker pools consume by priority, check user preferences and rate limits in Redis, call third-party providers with idempotency keys, and route failures to DLQ.',
        jdAlignment: 'Matches high-availability distributed systems expectations in JD'
      }
    }
  }
];

export function getTimeLimitForLevel(level: 'easy' | 'medium' | 'hard'): number {
  switch (level) {
    case 'easy':
      return 30;
    case 'medium':
      return 40;
    case 'hard':
      return 60;
  }
}
