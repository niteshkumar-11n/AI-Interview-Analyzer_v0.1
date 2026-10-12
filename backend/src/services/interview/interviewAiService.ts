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
export async function callAi(prompt: string, systemInstruction?: string): Promise<string> {
  const timeoutPromise = (ms: number) =>
    new Promise<never>((_, reject) => setTimeout(() => reject(new Error(`AI call timed out after ${ms}ms`)), ms));

  // 1. Try Google Gemini first if configured
  if (config.geminiApiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey: config.geminiApiKey });
      const fullPrompt = systemInstruction ? `${systemInstruction}\n\n${prompt}` : prompt;
      const response = await Promise.race([
        ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: fullPrompt,
        }),
        timeoutPromise(15000),
      ]);
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

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);

      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        signal: controller.signal,
        headers: {
          Authorization: `Bearer ${config.openRouterApiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': config.frontendUrl,
          'X-Title': 'SkillNexus AI Interview Engine',
        },
        body: JSON.stringify({
          model: config.openRouterModel || 'openai/gpt-4o-mini',
          messages,
        }),
      }).finally(() => clearTimeout(timeout));

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
  projects?: { title: string; description?: string; technologies?: string[] }[];
  workExperience?: { company?: string; role?: string; duration?: string; description?: string }[];
  summary?: string;
  previousQuestions?: string[];
}

export async function generateTechnicalQuestions(params: GenerateQuestionsParams): Promise<IQuestionItem[]> {
  const role = params.role || 'Full Stack Engineer';
  const category = params.category || 'Software Engineering';
  const experience = params.experience || '1-2 years';
  const difficulty = params.difficulty || 'Intermediate';
  const mode = params.mode === 'HR' ? 'HR' : 'Technical';
  const skillsText = params.skills?.length ? params.skills.join(', ') : 'Relevant core technologies';
  const projectsText = params.projects?.length
    ? params.projects.map((p) => `${p.title}${p.technologies?.length ? ` (${p.technologies.join(', ')})` : ''}: ${p.description || ''}`).join(' | ')
    : 'None specified';
  const experienceText = params.workExperience?.length
    ? params.workExperience.map((e) => `${e.role || 'Role'} at ${e.company || 'Company'} (${e.duration || ''}): ${e.description || ''}`).join(' | ')
    : 'None specified';
  const summaryText = params.summary || 'Aspiring professional aiming for rapid career growth';
  const previousQuestionsText = params.previousQuestions?.length
    ? params.previousQuestions.slice(-25).map((q, idx) => `[${idx + 1}] "${q}"`).join('\n')
    : 'None';

  let systemPrompt: string;
  let userPrompt: string;

  if (mode === 'HR') {
    systemPrompt = `You are a Principal HR Director, Executive Talent Partner, and Senior Behavioral Interviewer conducting a realistic, in-depth HR & Behavioral interview for the position of "${role}".
Your goal is to generate exactly 5 realistic, high-signal behavioral and situational questions assessing communication, interpersonal dynamics, culture fit, resilience, and problem solving.`;

    userPrompt = `
Candidate Background (from Resume & Profile):
- Target Role: ${role}
- Experience Level: ${experience}
- Category: ${category}
- Difficulty Level: ${difficulty}
- Professional Summary: ${summaryText}
- Stated Skills: ${skillsText}
- Past Work Experience: ${experienceText}
- Projects Mentioned: ${projectsText}

PREVIOUSLY ASKED QUESTIONS TO EXCLUDE (DO NOT REPEAT OR DUPLICATE ANY OF THESE):
${previousQuestionsText}

Generate exactly 5 progressive HR interview questions following this progression:
1. Question 1 (easy, 60s): Self-introduction & career motivation — ask about what drew them to ${role} and how their background prepared them.
2. Question 2 (easy, 60s): Team collaboration & communication — a scenario on working effectively with cross-functional teammates or engineers.
3. Question 3 (medium, 90s): Conflict resolution & behavioral challenge (STAR method) — ask about navigating a disagreement, tight stakeholder deadline, or conflicting priorities in a project.
4. Question 4 (medium, 90s): Adaptability & learning from setbacks — ask about a critical mistake, technical setback, or constructive feedback they received and how they responded.
5. Question 5 (hard, 120s): Leadership, career vision, and culture alignment — ask about ownership, driving an initiative forward, or handling ambiguous expectations.

CRITICAL RULES:
- Return STRICTLY valid JSON with no markdown formatting and no extra conversational text.
- Questions must be personalized to the candidate's experience and target role of ${role}.
- STRICTLY DO NOT REPEAT any of the previously asked questions listed above.

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
  } else {
    // Technical Interview Mode
    systemPrompt = `You are a Principal Tech Lead and Senior Technical Interviewer conducting a realistic, rigorous Technical interview for the position of "${role}".
Your goal is to generate exactly 5 realistic, high-signal questions testing technical depth, practical problem solving, real-world project experience, and architecture.`;

    userPrompt = `
Candidate Technical Profile (from Resume & Profile):
- Target Role: ${role}
- Domain / Category: ${category}
- Experience Level: ${experience}
- Difficulty Level: ${difficulty}
- Stated Skills: ${skillsText}
- Candidate Projects: ${projectsText}
- Work Experience: ${experienceText}
- Summary: ${summaryText}

PREVIOUSLY ASKED QUESTIONS TO EXCLUDE (DO NOT REPEAT OR DUPLICATE ANY OF THESE):
${previousQuestionsText}

Generate exactly 5 progressive technical interview questions following this progression:
1. Question 1 (easy, 60s): Fundamental core concept question in ${skillsText.split(',')[0] || 'core technologies'}.
2. Question 2 (easy, 60s): Practical implementation, error handling, or library pattern for ${role}.
3. Question 3 (medium, 90s): Deep dive into a real project or scenario (${projectsText !== 'None specified' ? 'referencing architectural choices or trade-offs in one of their projects' : 'a practical engineering challenge'}).
4. Question 4 (medium, 90s): Real-world debugging, performance bottleneck, caching, or asynchronous concurrency scenario.
5. Question 5 (hard, 120s): System architecture, failure recovery, database trade-offs, or scalability design for a production system.

CRITICAL RULES:
- Return STRICTLY valid JSON with no markdown and no extra conversational text.
- Questions must be concrete, technical, and directly relevant to ${role} and the candidate's stated skills.
- STRICTLY DO NOT REPEAT any of the previously asked questions listed above.

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
  }

  try {
    const rawResponse = await callAi(userPrompt, systemPrompt);
    const cleaned = cleanJsonResponse(rawResponse);
    const parsed = JSON.parse(cleaned);

    if (Array.isArray(parsed.questions) && parsed.questions.length >= 5) {
      return parsed.questions.slice(0, 5).map((q: any, i: number) => ({
        question: q.question?.trim() || `${mode} Question ${i + 1}`,
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
    console.error(`[InterviewAI] Question parsing error for ${mode} interview:`, err.message);
  }

  // Fallbacks: Distinct, high-quality questions for HR vs Technical
  if (mode === 'HR') {
    return [
      {
        question: `Tell me about your professional background and what motivated you to pursue the ${role} position.`,
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
        question: `Can you describe a situation where you had to collaborate with a difficult stakeholder or team member? How did you ensure effective communication?`,
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
        question: `Tell me about a time when a project deadline was at risk or priorities abruptly shifted. How did you manage your workload and adapt?`,
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
        question: `What is one piece of critical feedback you have received in your career, and what concrete steps did you take to act on it?`,
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
        question: `Where do you see yourself growing over the next 2 to 3 years, and how does this organization align with your core values and aspirations?`,
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

  // Fallback high-quality curated technical questions
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
  mode?: 'Technical' | 'HR';
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
  const { question, answer, timeTaken, timeLimit, role, mode = 'Technical' } = params;

  // Empty answer handling
  if (!answer || !answer.trim()) {
    return {
      score: 0,
      confidence: 0,
      communication: 0,
      correctness: 0,
      feedback: mode === 'HR'
        ? 'No answer was provided. In an HR interview, silence is penalized; always attempt to articulate a response using the STAR method.'
        : 'No answer was provided. Review core concepts and attempt an articulated response.',
      strengths: [],
      improvements: ['State your thoughts clearly rather than leaving the response blank.'],
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
      feedback: 'Time limit significantly exceeded. Practice articulating your points more concisely.',
      strengths: ['Attempted to provide context.'],
      improvements: ['Keep the initial answer crisp and under the allotted time.'],
      missingConcepts: ['Time management', 'Concise delivery']
    };
  }

  let systemPrompt: string;
  let userPrompt: string;

  if (mode === 'HR') {
    systemPrompt = `You are an experienced HR Director evaluating a candidate's answer for an HR & Behavioral interview for a ${role} position.
Apply a realistic rubric assessing:
- Communication & Clarity (structure, tone, articulate expression, STAR method)
- Behavioral Reasoning & Professionalism (maturity, self-awareness, empathy, handling pressure)
- Relevance & Alignment (directly answering the question with substance)
Do NOT inflate scores. Shallow or evasive answers get 4-5. Solid, structured answers get 7-8. Outstanding authentic answers get 9-10.`;

    userPrompt = `
Behavioral / HR Question Asked:
"${question}"

Candidate's Answer:
"${answer}"

Evaluate the answer on a 0 to 10 scale for:
1. Communication: Is the answer articulate, structured (STAR method), and delivered with professional poise?
2. Confidence: Does the candidate display self-awareness, conviction, and emotional intelligence?
3. Correctness (Behavioral Relevance): Does the candidate directly address the scenario with genuine, constructive insight and actionable lessons?

Calculate:
finalScore = Math.round((communication * 0.4 + correctness * 0.35 + confidence * 0.25) * 10) / 10

Return STRICTLY valid JSON with no markdown:
{
  "correctness": number,
  "communication": number,
  "confidence": number,
  "finalScore": number,
  "feedback": "Concise constructive HR feedback in 15-25 words",
  "strengths": ["1-2 concise strengths regarding communication or interpersonal approach"],
  "improvements": ["1-2 actionable behavioral tips (e.g., STAR structure, deeper personal impact)"],
  "missingConcepts": ["1-2 behavioral elements or perspectives not addressed"]
}
`;
  } else {
    systemPrompt = `You are a senior tech lead evaluating a candidate's answer for a ${role} technical interview.
Apply an objective, realistic rubric assessing technical correctness, conceptual depth, problem solving, and clarity.
Do NOT give generic inflated scores. A shallow answer gets 4-5. A solid answer gets 7-8. An exceptional answer gets 9-10.`;

    userPrompt = `
Technical Question Asked:
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
  }

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
      feedback: parsed.feedback || (mode === 'HR' ? 'Good behavioral answer with clear structure.' : 'Good response with clear reasoning.'),
      strengths: Array.isArray(parsed.strengths) ? parsed.strengths.slice(0, 3) : [mode === 'HR' ? 'Clear narrative structure.' : 'Good conceptual grasp.'],
      improvements: Array.isArray(parsed.improvements) ? parsed.improvements.slice(0, 3) : [mode === 'HR' ? 'Use specific metrics or outcomes from your past work.' : 'Provide more real-world examples.'],
      missingConcepts: Array.isArray(parsed.missingConcepts) ? parsed.missingConcepts.slice(0, 3) : []
    };
  } catch (err: any) {
    console.error(`[InterviewAI] Answer evaluation parse error for ${mode} interview:`, err.message);

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
      feedback: mode === 'HR'
        ? 'Well-communicated response. Focus on highlighting concrete outcomes and personal accountability.'
        : 'Good foundational explanation. Focus on adding specific architectural details.',
      strengths: ['Addressed the main question clearly.'],
      improvements: [mode === 'HR' ? 'Structure your answer using the Situation-Task-Action-Result format.' : 'Deepen the technical explanation with practical code scenarios.'],
      missingConcepts: [mode === 'HR' ? 'Measurable impact' : 'In-depth edge cases']
    };
  }
}
