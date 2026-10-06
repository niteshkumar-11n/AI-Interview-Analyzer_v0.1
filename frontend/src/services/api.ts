import { User, UserProfile, DashboardData, InterviewScore } from '../types.ts';

const TOKEN_KEY = 'skillnexus_auth_token';

export const authStorage = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  setToken: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  removeToken: () => localStorage.removeItem(TOKEN_KEY),
};

const RAW_BASE_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || '';
const API_BASE_URL = typeof RAW_BASE_URL === 'string' ? RAW_BASE_URL.replace(/\/$/, '') : '';

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = authStorage.getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

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
  },
};
