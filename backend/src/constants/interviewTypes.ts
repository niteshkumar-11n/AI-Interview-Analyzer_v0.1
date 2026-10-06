/**
 * Interview Types Constants
 */
export const INTERVIEW_TYPES = {
  TECHNICAL: 'technical',
  BEHAVIORAL: 'behavioral',
  SYSTEM_DESIGN: 'system_design',
  CODING: 'coding',
  HR: 'hr',
} as const;

export type InterviewType = typeof INTERVIEW_TYPES[keyof typeof INTERVIEW_TYPES];

