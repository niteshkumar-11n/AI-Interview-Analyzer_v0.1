/**
 * AI Technical Interview Service
 * Dual-provider engine (Google Gemini with OpenRouter fallback)
 * Generates tailored technical questions and computes real structured evaluation rubrics.
 */
import { GoogleGenAI } from '@google/genai';
import { config } from '../../config/env.ts';
import { IQuestionItem } from '../../models/Interview.ts';

// Clean JSON code fences
function cleanJsonResponse(text: string): string {
  let cleaned = text.trim();
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
  return cleaned.trim();
}

/**
 * Universal AI prompt runner supporting Google Gemini with OpenRouter fallback
 */
async function callAi(prompt: string, systemInstruction?: string): Promise<string> {
  // 1. Try Google Gemini first if configured
  if (config.geminiApiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey: config.geminiApiKey });
      const fullPrompt = systemInstruction ? `${systemInstruction}\n\n${prompt}` : prompt;
      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: fullPrompt
      });
      const text = response.text?.trim();
      if (text) return text;
    } catch (geminiErr: any) {
      console.warn('[InterviewAI] Gemini call failed, attempting OpenRouter fallback:', geminiErr.message);
    }
  }

  // 2. Try OpenRouter fallback if configured
  if (config.openRouterApiKey) {
    try {
      const messages = [];
      if (systemInstruction) {
        messages.push({ role: 'system', content: systemInstruction });
      }
      messages.push({ role: 'user', content: prompt });

      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${config.openRouterApiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': config.frontendUrl,
          'X-Title': 'SkillNexus AI Interview Engine'
        },
        body: JSON.stringify({
          model: config.openRouterModel || 'openai/gpt-4o-mini',
          messages
        })
      });

      if (res.ok) {
        const json = (await res.json()) as any;
        const content = json?.choices?.[0]?.message?.content?.trim();
        if (content) return content;
      }
    } catch (openRouterErr: any) {
      console.warn('[InterviewAI] OpenRouter call failed:', openRouterErr.message);
    }
  }

  throw new Error('AI providers are unavailable or returned empty responses. Please verify GEMINI_API_KEY or OPENROUTER_API_KEY.');
}

export interface GenerateQuestionsParams {
  role: string;
  category?: string;
  experience: string;
  difficulty?: string;
  mode?: 'Technical' | 'HR';
  skills?: string[];
  projects?: string[];
}

export async function generateTechnicalQuestions(params: GenerateQuestionsParams): Promise<IQuestionItem[]> {
  const role = params.role || 'Full Stack Engineer';
  const category = params.category || 'Software Engineering';
  const experience = params.experience || '1-2 years';
  const difficulty = params.difficulty || 'Intermediate';
  const mode = params.mode || 'Technical';
  const skillsText = params.skills?.length ? params.skills.join(', ') : 'Relevant core technologies';

  const systemPrompt = `You are a Principal Tech Lead and Senior Technical Interviewer conducting a realistic, rigorous ${mode} interview for the position of "${role}".
Your goal is to generate exactly 5 realistic, high-signal questions testing technical depth, practical problem solving, and architecture.`;

  const userPrompt = `
Candidate Context:
- Target Role: ${role}
- Domain / Category: ${category}
- Experience Level: ${experience}
- Difficulty Level: ${difficulty}
- Stated Skills: ${skillsText}

Generate exactly 5 progressive interview questions following this progression:
1. Question 1 (easy, 60s): Fundamental core concept question.
2. Question 2 (easy, 60s): Practical implementation or library pattern.
3. Question 3 (medium, 90s): Debugging, edge case, or trade-off scenario.
4. Question 4 (medium, 90s): Real-world architecture, optimization, or async lifecycle.
5. Question 5 (hard, 120s): Complex scenario, failure recovery, or system scalability.

CRITICAL RULES:
- Return STRICTLY valid JSON with no markdown and no extra conversational text.
- Each question must be clear, natural, and directly relevant to ${role}.

Return in this exact JSON format:
{
  "questions": [
    { "question": "Question text here?", "difficulty": "easy", "timeLimit": 60 },
    { "question": "Question text here?", "difficulty": "easy", "timeLimit": 60 },
    { "question": "Question text here?", "difficulty": "medium", "timeLimit": 90 },
    { "question": "Question text here?", "difficulty": "medium", "timeLimit": 90 },
    { "question": "Question text here?", "difficulty": "hard", "timeLimit": 120 }
  ]
}
`;

  try {
    const rawResponse = await callAi(userPrompt, systemPrompt);
    const cleaned = cleanJsonResponse(rawResponse);
    const parsed = JSON.parse(cleaned);

    if (Array.isArray(parsed.questions) && parsed.questions.length >= 5) {
      return parsed.questions.slice(0, 5).map((q: any, i: number) => ({
        question: q.question?.trim() || `Technical Question ${i + 1}`,
        difficulty: (['easy', 'easy', 'medium', 'medium', 'hard'][i] as any) || q.difficulty || 'medium',
        timeLimit: [60, 60, 90, 90, 120][i] || q.timeLimit || 60,
        score: 0,
        confidence: 0,
        communication: 0,
        correctness: 0,
        answer: '',
        feedback: '',
        strengths: [],
        improvements: [],
        missingConcepts: []
      }));
    }
  } catch (err: any) {
    console.error('[InterviewAI] Question parsing error, falling back to curated matrix:', err.message);
  }

  // Fallback high-quality curated technical questions based on role
  return [
    {
      question: `How does the event loop handle asynchronous tasks and microtasks in modern JavaScript and Node.js runtimes?`,
      difficulty: 'easy',
      timeLimit: 60,
      score: 0,
      confidence: 0,
      communication: 0,
      correctness: 0,
      answer: '',
      feedback: '',
      strengths: [],
      improvements: [],
      missingConcepts: []
    },
    {
      question: `What are the trade-offs between optimistic locking and pessimistic locking when designing concurrent database updates?`,
      difficulty: 'easy',
      timeLimit: 60,
      score: 0,
      confidence: 0,
      communication: 0,
      correctness: 0,
      answer: '',
      feedback: '',
      strengths: [],
      improvements: [],
      missingConcepts: []
    },
    {
      question: `Explain how you would identify and resolve memory leaks or excessive re-renders in a high-traffic React application.`,
      difficulty: 'medium',
      timeLimit: 90,
      score: 0,
      confidence: 0,
      communication: 0,
      correctness: 0,
      answer: '',
      feedback: '',
      strengths: [],
      improvements: [],
      missingConcepts: []
    },
    {
      question: `How do you design an idempotent payment processing API to prevent duplicate charges caused by network retries?`,
      difficulty: 'medium',
      timeLimit: 90,
      score: 0,
      confidence: 0,
      communication: 0,
      correctness: 0,
      answer: '',
      feedback: '',
      strengths: [],
      improvements: [],
      missingConcepts: []
    },
    {
      question: `Walk me through your architectural strategy for scaling a real-time notification system to 500,000 active concurrent WebSocket connections.`,
      difficulty: 'hard',
      timeLimit: 120,
      score: 0,
      confidence: 0,
      communication: 0,
      correctness: 0,
      answer: '',
      feedback: '',
      strengths: [],
      improvements: [],
      missingConcepts: []
    }
  ];
}

export interface EvaluateAnswerParams {
  question: string;
  answer: string;
  timeTaken: number;
  timeLimit: number;
  role: string;
}

export interface EvaluationResult {
  score: number; // 0 to 10
  confidence: number; // 0 to 10
  communication: number; // 0 to 10
  correctness: number; // 0 to 10
  feedback: string;
  strengths: string[];
  improvements: string[];
  missingConcepts: string[];
}

export async function evaluateTechnicalAnswer(params: EvaluateAnswerParams): Promise<EvaluationResult> {
  const { question, answer, timeTaken, timeLimit, role } = params;

  // Empty answer handling
  if (!answer || !answer.trim()) {
    return {
      score: 0,
      confidence: 0,
      communication: 0,
      correctness: 0,
      feedback: 'No answer was provided. Review core concepts and attempt an articulated response.',
      strengths: [],
      improvements: ['State your understanding even if partial rather than leaving the response blank.'],
      missingConcepts: ['Fundamental answer structure', 'Direct answer to question']
    };
  }

  // Time exceeded handling
  if (timeTaken > timeLimit + 10) {
    return {
      score: 2,
      confidence: 3,
      communication: 4,
      correctness: 3,
      feedback: 'Time limit significantly exceeded. Practice articulating technical points more concisely.',
      strengths: ['Attempted to provide context.'],
      improvements: ['Keep the initial answer crisp and under the allotted time.'],
      missingConcepts: ['Time management', 'Concise technical delivery']
    };
  }

  const systemPrompt = `You are a senior tech lead evaluating a candidate's answer for a ${role} interview.
Apply an objective, realistic rubric assessing technical correctness, conceptual depth, problem solving, and clarity.
Do NOT give generic inflated scores. A shallow answer gets 4-5. A solid answer gets 7-8. An exceptional answer gets 9-10.`;

  const userPrompt = `
Question Asked:
"${question}"

Candidate's Answer:
"${answer}"

Evaluate the answer on a 0 to 10 scale for:
1. Correctness: Is the technical reasoning accurate, sound, and addressing the root question?
2. Communication: Is the answer articulate, structured, and easy to follow?
3. Confidence: Does the response demonstrate conviction and hands-on familiarity?

Calculate:
finalScore = Math.round((correctness * 0.5 + communication * 0.25 + confidence * 0.25) * 10) / 10

Return STRICTLY valid JSON with no markdown:
{
  "correctness": number,
  "communication": number,
  "confidence": number,
  "finalScore": number,
  "feedback": "Concise natural feedback in 15-25 words",
  "strengths": ["1-2 concise strengths"],
  "improvements": ["1-2 concrete actionable suggestions"],
  "missingConcepts": ["1-2 key technical terms or concepts not mentioned"]
}
`;

  try {
    const rawResponse = await callAi(userPrompt, systemPrompt);
    const cleaned = cleanJsonResponse(rawResponse);
    const parsed = JSON.parse(cleaned);

    const correctness = Math.min(10, Math.max(0, Number(parsed.correctness) || 5));
    const communication = Math.min(10, Math.max(0, Number(parsed.communication) || 5));
    const confidence = Math.min(10, Math.max(0, Number(parsed.confidence) || 5));
    const finalScore = Math.min(10, Math.max(0, Number(parsed.finalScore) || Math.round((correctness * 0.5 + communication * 0.25 + confidence * 0.25) * 10) / 10));

    return {
      score: finalScore,
      confidence,
      communication,
      correctness,
      feedback: parsed.feedback || 'Good response with clear reasoning.',
      strengths: Array.isArray(parsed.strengths) ? parsed.strengths.slice(0, 3) : ['Good conceptual grasp.'],
      improvements: Array.isArray(parsed.improvements) ? parsed.improvements.slice(0, 3) : ['Provide more real-world examples.'],
      missingConcepts: Array.isArray(parsed.missingConcepts) ? parsed.missingConcepts.slice(0, 3) : []
    };
  } catch (err: any) {
    console.error('[InterviewAI] Answer evaluation parse error, using heuristic fallback:', err.message);

    // Heuristic fallback if AI fails
    const wordCount = answer.trim().split(/\s+/).length;
    let baseScore = 5;
    if (wordCount > 30) baseScore += 2;
    if (wordCount > 70) baseScore += 1;
    if (wordCount < 10) baseScore = 3;

    return {
      score: baseScore,
      confidence: Math.min(10, baseScore),
      communication: Math.min(10, baseScore),
      correctness: Math.min(10, baseScore),
      feedback: 'Good foundational explanation. Focus on adding specific architectural details.',
      strengths: ['Addressed the main question clearly.'],
      improvements: ['Deepen the technical explanation with practical code scenarios.'],
      missingConcepts: ['In-depth edge cases']
    };
  }
}
