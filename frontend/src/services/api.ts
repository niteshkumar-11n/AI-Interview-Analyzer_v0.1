import {
  User,
  UserProfile,
  DashboardData,
  InterviewScore,
  CreditPackage,
  WalletInfo,
  WalletTransaction,
  InterviewSessionData,
  TechnicalInterviewReport,
  InterviewHistoryItem,
} from '../types.ts';

const TOKEN_KEY = 'skillnexus_auth_token';

export const authStorage = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  setToken: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  removeToken: () => localStorage.removeItem(TOKEN_KEY),
};

const GITHUB_SESSION_KEY = 'skillnexus_github_session';

export const githubAuthStorage = {
  getSessionToken: () => localStorage.getItem(GITHUB_SESSION_KEY),
  setSessionToken: (token: string) => localStorage.setItem(GITHUB_SESSION_KEY, token),
  removeSessionToken: () => localStorage.removeItem(GITHUB_SESSION_KEY),
};

const RAW_BASE_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || '';
const API_BASE_URL = typeof RAW_BASE_URL === 'string' ? RAW_BASE_URL.replace(/\/$/, '') : '';

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = authStorage.getToken();
  const ghSession = githubAuthStorage.getSessionToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (options.body instanceof FormData) {
    delete headers['Content-Type'];
  }

  if (ghSession) {
    headers['x-github-session'] = ghSession;
  }


  // Only attach Bearer token to authenticated endpoints (never to login or register)
  const isAuthPublicEndpoint =
    endpoint.includes('/auth/login') ||
    endpoint.includes('/auth/register') ||
    endpoint.includes('/auth/forgot-password') ||
    endpoint.includes('/auth/reset-password');

  if (token && !isAuthPublicEndpoint) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const targetUrl = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

  const response = await fetch(targetUrl, {
    ...options,
    headers,
  });

  let data: any = {};
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    try {
      data = await response.json();
    } catch {
      data = {};
    }
  } else {
    const text = await response.text();
    data = { message: text };
  }

  if (!response.ok) {
    throw new Error(data.message || `Request failed with status ${response.status}`);
  }

  return data;
}

export const api = {
  auth: {
    login: (credentials: { email: string; password: string }) =>
      request<{ success: boolean; token: string; user: User; message: string }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      }),

    register: (userData: { name: string; email: string; password: string; targetRole?: string }) =>
      request<{ success: boolean; token: string; user: User; message: string }>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      }),

    logout: () =>
      request<{ success: boolean; message: string }>('/api/auth/logout', {
        method: 'POST',
      }),

    getMe: () =>
      request<{ success: boolean; user: User }>('/api/auth/me'),

    forgotPassword: (email: string) =>
      request<{ success: boolean; message: string; resetToken?: string }>('/api/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      }),

    resetPassword: (payload: { token: string; newPassword: string }) =>
      request<{ success: boolean; message: string }>('/api/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
  },

  profile: {
    get: () =>
      request<{ success: boolean; profile: UserProfile; email: string; id: string }>('/api/profile'),

    update: (profileData: Partial<UserProfile>) =>
      request<{ success: boolean; message: string; profile: UserProfile }>('/api/profile', {
        method: 'PUT',
        body: JSON.stringify(profileData),
      }),

    saveOnboardingStep: (payload: {
      step: number;
      careerStatus?: string;
      data?: Partial<UserProfile> & { completeNow?: boolean };
    }) =>
      request<{ success: boolean; message: string; profile: UserProfile }>('/api/profile/onboarding/step', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),

    skipOnboarding: () =>
      request<{ success: boolean; message: string; profile: UserProfile }>('/api/profile/onboarding/skip', {
        method: 'POST',
      }),
  },

  resume: {
    upload: (payload: FormData | { resumeText: string; fileName?: string }) => {
      const isFormData = payload instanceof FormData;
      return request<{
        success: boolean;
        message: string;
        data: {
          resumeId: string;
          extractedFacts: any;
          profileDiff: {
            newSkills: string[];
            existingSkills: string[];
            education: { current: string; extracted: string; hasConflict: boolean };
            experience: { current: string; extracted: string; hasConflict: boolean };
            targetRole: { current: string; extracted: string; hasConflict: boolean };
            projects: any[];
            certifications: any[];
            extractedSummary: string;
          };
        };
      }>('/api/resume/upload', {
        method: 'POST',
        body: isFormData ? payload : JSON.stringify(payload),
      });
    },

    confirm: (payload: { resumeId: string; confirmedFacts: any }) =>
      request<{ success: boolean; message: string; data: any }>('/api/resume/confirm', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),

    getStatus: () =>
      request<{ success: boolean; data: any }>('/api/resume/status'),

    getContext: (feature?: string) =>
      request<{ success: boolean; data: any }>(
        feature ? `/api/candidate/context?feature=${encodeURIComponent(feature)}` : '/api/candidate/context'
      ),
  },

  candidate: {
    getContext: (feature?: string) =>
      request<{ success: boolean; data: any }>(
        feature ? `/api/candidate/context?feature=${encodeURIComponent(feature)}` : '/api/candidate/context'
      ),
  },

  dashboard: {
    get: () =>
      request<{ success: boolean; data: DashboardData }>('/api/dashboard'),

    recordMockInterview: (interviewData: Partial<InterviewScore>) =>
      request<{ success: boolean; message: string; interview: InterviewScore; data: DashboardData }>(
        '/api/dashboard/mock-interview',
        {
          method: 'POST',
          body: JSON.stringify(interviewData),
        }
      ),

    applyJob: (jobId: string) =>
      request<{ success: boolean; applied: boolean; message: string }>(`/api/dashboard/jobs/${jobId}/apply`, {
        method: 'POST',
      }),
  },

  job: {
    analyzeJD: (jobDescription: string, resumeText: string) =>
      request<{
        success: boolean;
        data: {
          jobPosting: {
            title: string;
            company: string;
            location: string;
            experienceRequired: string;
            educationRequired: string;
          };
          extractedRequirements: {
            mustHaveSkills: string[];
            niceToHaveSkills: string[];
            technologiesMentioned: string[];
            keyResponsibilities: string[];
          };
          matchAnalysis: {
            overallMatchScore: number;
            skillsMatchPercent: number;
            experienceMatchPercent: number;
            educationMatchPercent: number;
            projectRelevancePercent: number;
          };
          skillComparison: {
            matchedSkills: string[];
            partialSkills: { name: string; note: string }[];
            missingSkills: { name: string; priority: 'Critical' | 'Moderate' | 'Low'; scoreImpact: string }[];
          };
          learningPath: {
            title: string;
            description: string;
            duration: string;
          }[];
          summary: string;
          improvementTips: string[];
        };
        message?: string;
      }>('/api/job/analyze', {
        method: 'POST',
        body: JSON.stringify({ jobDescription, resumeText }),
      }),

    getRecommendations: (params: {
      skills: string[];
      country?: string;
      page?: number;
      perPage?: number;
      location?: string;
      salaryMin?: number;
      salaryMax?: number;
      fullTime?: number;
      sortBy?: string;
    }) => {
      const searchParams = new URLSearchParams();
      searchParams.set('skills', params.skills.join(','));
      if (params.country) searchParams.set('country', params.country);
      if (params.page) searchParams.set('page', String(params.page));
      if (params.perPage) searchParams.set('per_page', String(params.perPage));
      if (params.location) searchParams.set('location', params.location);
      if (params.salaryMin) searchParams.set('salary_min', String(params.salaryMin));
      if (params.salaryMax) searchParams.set('salary_max', String(params.salaryMax));
      if (params.fullTime !== undefined) searchParams.set('full_time', String(params.fullTime));
      if (params.sortBy) searchParams.set('sort_by', params.sortBy);
      return request<{
        success: boolean;
        data: {
          count: number;
          results: {
            id: string;
            title: string;
            company: string;
            location: string;
            description: string;
            salary_min?: number;
            salary_max?: number;
            salary_is_predicted: boolean;
            contract_time?: string;
            contract_type?: string;
            category: string;
            created: string;
            redirect_url: string;
            latitude?: number;
            longitude?: number;
          }[];
          mean?: number;
        };
        message?: string;
      }>(`/api/job/recommendations?${searchParams.toString()}`);
    },
  },

  coding: {
    health: () =>
      request<{
        success: boolean;
        service: string;
        status: string;
        version?: string;
        error?: string;
      }>('/api/coding/health'),

    getLanguages: () =>
      request<{
        success: boolean;
        languages: { id: number; name: string }[];
      }>('/api/coding/languages'),

    getProblems: () =>
      request<{
        success: boolean;
        problems: {
          id: string;
          title: string;
          difficulty: 'Easy' | 'Medium' | 'Hard';
          topic: string;
          tags: string[];
          description: string;
          constraints: string[];
          examples: { input: string; output: string; explanation?: string }[];
          starterCode: Record<string, string>;
          visibleTestCases: { stdin: string; expectedOutput: string }[];
          timeComplexity?: string;
          spaceComplexity?: string;
          approach?: { title: string; explanation: string; steps: string[] };
        }[];
      }>('/api/coding/problems'),

    runCode: (params: { languageId: number; sourceCode: string; stdin?: string }) =>
      request<{
        success: boolean;
        result: {
          stdout: string | null;
          stderr: string | null;
          compileOutput: string | null;
          status: { id: number; description: string };
          time: string | null;
          memory: number | null;
        };
        message?: string;
      }>('/api/coding/run', {
        method: 'POST',
        body: JSON.stringify(params),
      }),

    submitCode: (params: {
      languageId: number;
      languageName?: string;
      sourceCode: string;
      problemId: string;
    }) =>
      request<{
        success: boolean;
        result: {
          score: number;
          totalTests: number;
          passedTests: number;
          failedTests: number;
          status: string;
          testResults: {
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
            isHidden?: boolean;
          }[];
          averageTime: string | null;
          averageMemory: number | null;
        };
        message?: string;
      }>('/api/coding/submit', {
        method: 'POST',
        body: JSON.stringify(params),
      }),

    generateAssessment: () =>
      request<{
        success: boolean;
        assessmentId: string;
        questions: any[];
      }>('/api/coding/assessment/generate', {
        method: 'POST',
      }),

    evaluateAssessmentQuestion: (params: {
      assessmentId: string;
      questionId: string;
      languageId: number;
      languageName: string;
      sourceCode: string;
    }) =>
      request<{
        success: boolean;
        result: any;
      }>('/api/coding/assessment/evaluate-question', {
        method: 'POST',
        body: JSON.stringify(params),
      }),

    submitAssessment: (params: {
      assessmentId: string;
      questions: any[];
      durationMinutes?: number;
    }) =>
      request<{
        success: boolean;
        message: string;
        assessment: any;
      }>('/api/coding/assessment/submit', {
        method: 'POST',
        body: JSON.stringify(params),
      }),

    getAssessmentHistory: () =>
      request<{
        success: boolean;
        history: any[];
      }>('/api/coding/assessment/history'),

    getAssessmentById: (id: string) =>
      request<{
        success: boolean;
        assessment: any;
      }>(`/api/coding/assessment/${id}`),
  },

  github: {
    analyzeProfile: (username: string, forceRefresh = false) =>
      request<{
        success: boolean;
        data: GitHubAnalysis;
        cached: boolean;
        message: string;
      }>('/api/github/analyze', {
        method: 'POST',
        body: JSON.stringify({ username, forceRefresh }),
      }),

    getIssues: (params: {
      skills?: any;
      username?: string;
      language?: string;
      difficulty?: string;
      labels?: string[];
      page?: number;
      perPage?: number;
      sort?: string;
    }) =>
      request<{
        success: boolean;
        data: {
          issues: GitHubIssueRecommendation[];
          totalCount: number;
        };
        message: string;
      }>('/api/github/issues', {
        method: 'POST',
        body: JSON.stringify(params),
      }),

    getCustomIssues: (params: {
      languages: string[];
      frameworks?: string[];
      tools?: string[];
      difficulty?: string;
      page?: number;
      perPage?: number;
    }) =>
      request<{
        success: boolean;
        data: {
          issues: GitHubIssueRecommendation[];
          totalCount: number;
        };
      }>('/api/github/issues/custom', {
        method: 'POST',
        body: JSON.stringify(params),
      }),

    validateUsername: (username: string) =>
      request<{
        success: boolean;
        valid: boolean;
        username?: string;
        avatarUrl?: string;
        name?: string;
        message?: string;
      }>('/api/github/validate-username', {
        method: 'POST',
        body: JSON.stringify({ username }),
      }),

    getRateLimit: () =>
      request<{
        success: boolean;
        data: {
          limit: number;
          remaining: number;
          reset: string;
          used: number;
        };
      }>('/api/github/rate-limit'),

    getOAuthStatus: () =>
      request<{
        success: boolean;
        configured: boolean;
        clientId: string | null;
        callbackUrl: string;
        mode: string;
        message: string;
      }>('/api/github/oauth/status'),

    getOAuthAuthorizeUrl: () =>
      request<{
        success: boolean;
        authUrl: string;
        state: string;
        configured?: boolean;
        message?: string;
      }>('/api/github/oauth/authorize-url'),

    getConnectedOAuthUser: () =>
      request<{
        success: boolean;
        connected: boolean;
        user: {
          username: string;
          name?: string;
          avatarUrl: string;
          bio?: string;
          publicRepos: number;
          connectedAt: string;
        } | null;
      }>('/api/github/oauth/user'),

    disconnectOAuthUser: () =>
      request<{
        success: boolean;
        message: string;
      }>('/api/github/oauth/disconnect', {
        method: 'POST',
      }),

    startAssessment: (username?: string) =>
      request<{
        success: boolean;
        data: {
          assessmentId: string;
          username: string;
          totalQuestions: number;
          questions: TechnicalAssessmentQuestion[];
        };
        message: string;
      }>('/api/github/assessment/start', {
        method: 'POST',
        body: JSON.stringify({ username }),
      }),

    submitAssessment: (assessmentId: string, answers: { questionId: number; selectedOptionIndex: number }[]) =>
      request<{
        success: boolean;
        data: TechnicalAssessmentResult;
        message: string;
      }>('/api/github/assessment/submit', {
        method: 'POST',
        body: JSON.stringify({ assessmentId, answers }),
      }),

    getAssessment: (assessmentId: string) =>
      request<{
        success: boolean;
        data: TechnicalAssessmentResult;
      }>(`/api/github/assessment/${assessmentId}`),

    getWeaknessIssues: (params: {
      assessmentId?: string;
      weaknesses?: IdentifiedWeakness[];
      username?: string;
      language?: string;
      difficulty?: string;
      labels?: string[];
      weaknessTopic?: string;
      page?: number;
      perPage?: number;
      sort?: string;
    }) =>
      request<{
        success: boolean;
        data: {
          issues: WeaknessIssueRecommendation[];
          totalCount: number;
        };
        message: string;
      }>('/api/github/issues/recommend-for-weaknesses', {
        method: 'POST',
        body: JSON.stringify(params),
      }),
  },

  interview: {
    generateQuestions: (params: {
      role: string;
      category?: string;
      experience: string;
      difficulty?: string;
      mode?: 'Technical' | 'HR';
      skills?: string[];
      projects?: string[];
    }) =>
      request<{
        success: boolean;
        data: InterviewSessionData;
        message?: string;
      }>('/api/interview/generate-questions', {
        method: 'POST',
        body: JSON.stringify(params),
      }),

    submitAnswer: (params: {
      interviewId: string;
      questionIndex: number;
      answer: string;
      timeTaken: number;
    }) =>
      request<{
        success: boolean;
        data: {
          feedback: string;
          score: number;
          confidence: number;
          communication: number;
          correctness: number;
          strengths?: string[];
          improvements?: string[];
          missingConcepts?: string[];
        };
      }>('/api/interview/submit-answer', {
        method: 'POST',
        body: JSON.stringify(params),
      }),

    finish: (params: { interviewId: string }) =>
      request<{
        success: boolean;
        data: TechnicalInterviewReport;
      }>('/api/interview/finish', {
        method: 'POST',
        body: JSON.stringify(params),
      }),

    getHistory: () =>
      request<{
        success: boolean;
        data: InterviewHistoryItem[];
      }>('/api/interview/history'),

    getReport: (id: string) =>
      request<{
        success: boolean;
        data: TechnicalInterviewReport;
      }>(`/api/interview/report/${id}`),
  },

  payment: {
    getPackages: () =>
      request<{
        success: boolean;
        data: {
          packages: CreditPackage[];
          featureCosts: Record<string, number>;
          isGatewayConfigured: boolean;
          razorpayKeyId: string;
        };
      }>('/api/payment/packages'),

    getWallet: () =>
      request<{
        success: boolean;
        data: WalletInfo;
      }>('/api/payment/wallet'),

    createOrder: (planId: string) =>
      request<{
        success: boolean;
        data: {
          orderId: string;
          amount: number;
          currency: string;
          keyId: string;
          plan: CreditPackage;
        };
        message?: string;
      }>('/api/payment/order', {
        method: 'POST',
        body: JSON.stringify({ planId }),
      }),

    verifyPayment: (payload: {
      razorpay_order_id: string;
      razorpay_payment_id: string;
      razorpay_signature: string;
    }) =>
      request<{
        success: boolean;
        message: string;
        data: {
          credits: number;
          creditsAdded?: number;
          paymentId?: string;
          alreadyProcessed?: boolean;
        };
      }>('/api/payment/verify', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),

    getTransactions: () =>
      request<{
        success: boolean;
        data: WalletTransaction[];
      }>('/api/payment/transactions'),
  },
};


// ===== GitHub Types =====

export interface GitHubAnalysis {
  profile: {
    login: string;
    name: string | null;
    avatar_url: string;
    html_url: string;
    bio: string | null;
    location: string | null;
    company: string | null;
    blog: string | null;
    twitter_username: string | null;
    public_repos: number;
    public_gists: number;
    followers: number;
    following: number;
    created_at: string;
    updated_at: string;
  };
  repos: {
    id: number;
    name: string;
    full_name: string;
    html_url: string;
    description: string | null;
    fork: boolean;
    created_at: string;
    updated_at: string;
    pushed_at: string;
    stargazers_count: number;
    forks_count: number;
    open_issues_count: number;
    language: string | null;
    topics: string[];
    size: number;
  }[];
  languageStats: {
    languages: {
      name: string;
      bytes: number;
      percentage: number;
      color: string;
    }[];
    totalBytes: number;
    totalRepos: number;
  };
  skills: {
    languages: string[];
    frameworks: string[];
    tools: string[];
    databases: string[];
    cloud: string[];
    other: string[];
    all: string[];
  };
  topRepos: {
    id: number;
    name: string;
    full_name: string;
    html_url: string;
    description: string | null;
    stargazers_count: number;
    forks_count: number;
    open_issues_count: number;
    language: string | null;
    topics: string[];
    pushed_at: string;
  }[];
  recentRepos: {
    id: number;
    name: string;
    full_name: string;
    html_url: string;
    description: string | null;
    stargazers_count: number;
    forks_count: number;
    open_issues_count: number;
    language: string | null;
    topics: string[];
    pushed_at: string;
  }[];
  stats: {
    totalStars: number;
    totalForks: number;
    totalOpenIssues: number;
    originalRepos: number;
    forkedRepos: number;
    averageRepoSize: number;
    accountAgeYears: number;
  };
}

export interface GitHubIssueRecommendation {
  id: string;
  repo: string;
  repoUrl: string;
  issueNumber: number;
  title: string;
  body: string;
  labels: string[];
  state: string;
  comments: number;
  created_at: string;
  updated_at: string;
  html_url: string;
  language: string;
  stars: number;
  matchScore: number;
  matchReasons: string[];
  difficulty: string;
}

export interface WeaknessIssueRecommendation extends GitHubIssueRecommendation {
  weaknessAddressed: string;
  whyRecommended: string;
  difficultyEstimate: 'Beginner Friendly' | 'Intermediate' | 'Advanced';
}

export interface TechnicalAssessmentQuestion {
  id: number;
  question: string;
  codeSnippet?: string | null;
  topic: string;
  category: string;
  options: string[];
  relatedSkill: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
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

export interface TechnicalAssessmentResult {
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
