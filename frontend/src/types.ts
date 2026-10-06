export type SkillCategory = 'Frontend' | 'Backend' | 'Database' | 'DevOps' | 'AI/Data';
export type SkillLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';

export interface SkillItem {
  name: string;
  level: SkillLevel;
  proficiency: number; // 0 - 100
  category?: SkillCategory;
}

export interface UserProfile {
  name: string;
  email?: string;
  phone?: string;
  dob?: string;
  education: string;
  degree?: string;
  branch?: string;
  college: string;
  graduationYear: number;
  experience?: string;
  experienceLevel?: string;
  yearsOfExperience?: string;
  currentCompany?: string;
  currentPosition?: string;
  targetRole: string;
  targetCompany?: string;
  targetJobDescription?: string;
  skills: SkillItem[];
  github: string;
  linkedin: string;
  portfolio: string;
  bio?: string;
  location?: string;
  photoUrl?: string;
}

export interface User {
  id: string;
  email: string;
  profile: UserProfile;
}

export interface InterviewScore {
  id: string;
  userId: string;
  title: string;
  role: string;
  score: number;
  date: string;
  durationMinutes: number;
  breakdown: {
    technical: number;
    problemSolving: number;
    communication: number;
    codeQuality: number;
  };
  feedback: string;
  strengths: string[];
  weaknesses: string[];
}

export interface WeakArea {
  id: string;
  topic: string;
  category: string;
  severity: 'High' | 'Medium' | 'Low';
  impactDescription: string;
  recommendedAction: string;
  status: 'Needs Practice' | 'In Progress' | 'Resolved';
}

export interface RecommendedJob {
  id: string;
  title: string;
  company: string;
  logoUrl?: string;
  location: string;
  type: 'Remote' | 'Hybrid' | 'On-site';
  salary: string;
  matchScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  experienceRequired: string;
  description: string;
  postedDaysAgo: number;
  url: string;
  applied?: boolean;
}

export interface OpenSourceIssue {
  id: string;
  repo: string;
  issueNumber: number;
  title: string;
  labels: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Good First Issue' | 'Help Wanted' | string;
  stars: number;
  language: string;
  url: string;
  matchScore?: number;
  bookmarked?: boolean;
}

export interface UserActivity {
  id: string;
  userId: string;
  type: 'interview' | 'profile_update' | 'skill_added' | 'job_saved' | 'login';
  title: string;
  description: string;
  timestamp: string;
  iconName?: string;
}

export interface DashboardData {
  interviewReadiness: {
    overallScore: number;
    readinessLevel: 'Interview Ready' | 'Near Ready' | 'Needs Practice' | 'Early Stage';
    breakdown: {
      technicalDepth: number;
      systemDesign: number;
      problemSolving: number;
      communication: number;
      codeEfficiency: number;
    };
    trend: number;
  };
  recentInterview: InterviewScore | null;
  interviewHistory: InterviewScore[];
  skillsOverview: SkillItem[];
  skillCategoriesSummary?: { name: string; percentage: number }[];
  weakAreas: WeakArea[];
  recommendedJobs: RecommendedJob[];
  recommendedIssues: OpenSourceIssue[];
  recentActivities: UserActivity[];
}
