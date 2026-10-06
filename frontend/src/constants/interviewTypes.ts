/**
 * Interview Types Constants (Frontend)
 */
export const INTERVIEW_TYPES = {
  AI_INTERVIEW: 'ai-interview',
  CODING: 'coding-interview',
  COMMUNICATION: 'communication',
  READINESS: 'interview-readiness',
} as const;

export type InterviewTypeKey = typeof INTERVIEW_TYPES[keyof typeof INTERVIEW_TYPES];

