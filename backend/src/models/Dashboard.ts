/**
 * Dashboard Data Models
 * In-memory stores for jobs, issues, activities, interviews, weak areas
 */

// --- Type Definitions ---
export interface Activity {
  id: string;
  title: string;
  subtitle: string;
  timeAgo: string;
  type: 'interview' | 'resume' | 'dsa' | 'skill' | 'github' | 'job';
}

export interface InterviewHistory {
  id: string;
  title: string;
  score: number;
  date: string;
  technical: number;
  problemSolving: number;
  communication: number;
  codeQuality: number;
}

export interface RecommendedJob {
  id: string;
  company: string;
  title: string;
  location: string;
  matchScore: number;
  skills: string[];
  salary: string;
  type: string;
  applied: boolean;
}

export interface OpenSourceIssue {
  id: string;
  repo: string;
  issueNumber: number;
  title: string;
  difficulty: string;
  matchScore: number;
  language: string;
  stars: number;
  url: string;
  labels: string[];
  bookmarked: boolean;
}

// --- Seed Data ---
export let recommendedJobs: RecommendedJob[] = [
  {
    id: 'job_msft_01',
    company: 'Microsoft',
    title: 'Frontend Developer',
    location: 'Bengaluru, India',
    matchScore: 92,
    skills: ['React', 'JavaScript', 'TypeScript'],
    salary: '₹18 - ₹24 LPA',
    type: 'Full-Time',
    applied: false
  },
  {
    id: 'job_amzn_02',
    company: 'Amazon',
    title: 'Full Stack Developer',
    location: 'Bengaluru, India',
    matchScore: 88,
    skills: ['Node.js', 'React', 'AWS'],
    salary: '₹22 - ₹30 LPA',
    type: 'Full-Time',
    applied: false
  },
  {
    id: 'job_goog_03',
    company: 'Google',
    title: 'Software Engineer',
    location: 'Hyderabad, India',
    matchScore: 84,
    skills: ['Python', 'System Design', 'Backend'],
    salary: '₹25 - ₹35 LPA',
    type: 'Full-Time',
    applied: false
  }
];

export let openSourceIssues: OpenSourceIssue[] = [
  {
    id: 'issue_react_01',
    repo: 'facebook/react',
    issueNumber: 28491,
    title: 'Improve documentation for hooks and concurrent mode',
    difficulty: 'Good First Issue',
    matchScore: 94,
    language: 'JavaScript',
    stars: 228000,
    url: 'https://github.com/facebook/react/issues',
    labels: ['documentation', 'good first issue'],
    bookmarked: false
  },
  {
    id: 'issue_node_02',
    repo: 'nodejs/node',
    issueNumber: 51204,
    title: 'Fix memory leak in HTTP module keep-alive connections',
    difficulty: 'Intermediate',
    matchScore: 89,
    language: 'C++ / JavaScript',
    stars: 104000,
    url: 'https://github.com/nodejs/node/issues',
    labels: ['http', 'memory-leak'],
    bookmarked: false
  },
  {
    id: 'issue_tf_03',
    repo: 'tensorflow/tensorflow',
    issueNumber: 63102,
    title: 'Add examples for new Keras 3.0 distributed training API',
    difficulty: 'Beginner',
    matchScore: 86,
    language: 'Python',
    stars: 185000,
    url: 'https://github.com/tensorflow/tensorflow/issues',
    labels: ['examples', 'keras'],
    bookmarked: false
  }
];

export let activities: Activity[] = [
  {
    id: 'act_1',
    title: 'Completed Technical Interview',
    subtitle: 'Scored 82% • 1 Sep 2025',
    timeAgo: '2 hours ago',
    type: 'interview'
  },
  {
    id: 'act_2',
    title: 'Enriched Candidate Profile',
    subtitle: 'Extracted skills & experience from resume',
    timeAgo: '1 day ago',
    type: 'resume'
  },
  {
    id: 'act_3',
    title: 'Practiced DSA Questions',
    subtitle: 'Solved 5 questions on Arrays',
    timeAgo: '2 days ago',
    type: 'dsa'
  },
  {
    id: 'act_4',
    title: 'Added a new skill',
    subtitle: 'MongoDB',
    timeAgo: '3 days ago',
    type: 'skill'
  },
  {
    id: 'act_5',
    title: 'Connected GitHub',
    subtitle: 'Analyzed 12 repositories',
    timeAgo: '4 days ago',
    type: 'github'
  }
];

export let interviewRecords: InterviewHistory[] = [
  {
    id: 'rec_1',
    title: 'Technical Interview',
    score: 82,
    date: '1 Sep 2025',
    technical: 85,
    problemSolving: 80,
    communication: 82,
    codeQuality: 81
  },
  {
    id: 'rec_2',
    title: 'System Design Round',
    score: 68,
    date: '15 Aug 2025',
    technical: 70,
    problemSolving: 65,
    communication: 72,
    codeQuality: 65
  },
  {
    id: 'rec_3',
    title: 'Algorithmic DSA Assessment',
    score: 60,
    date: '20 Jul 2025',
    technical: 62,
    problemSolving: 58,
    communication: 65,
    codeQuality: 55
  }
];

export const weakAreas = [
  { id: '1', title: 'Dynamic Programming' },
  { id: '2', title: 'System Design' },
  { id: '3', title: 'Database Concepts' },
  { id: '4', title: 'Communication Skills' },
  { id: '5', title: 'Behavioral Questions' }
];
