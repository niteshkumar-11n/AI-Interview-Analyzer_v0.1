/**
 * AI Technical Interview Controller
 * Manages question generation, answer evaluation, session completion, and history tracking.
 */
import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware.ts';
import { CREDIT_CONFIG } from '../config/creditConfig.ts';
import {
  createInterviewSession,
  findInterviewById,
  getUserInterviews,
  updateInterviewSession
} from '../models/Interview.ts';
import {
  getUserCredits,
  deductUserCredits,
  addUserCredits,
  findUserById
} from '../models/User.ts';
import { recordTransaction } from '../models/Transaction.ts';
import {
  generateTechnicalQuestions,
  evaluateTechnicalAnswer
} from '../services/interview/interviewAiService.ts';
import { activities } from '../models/Dashboard.ts';

/**
 * Generate technical interview questions and reserve/deduct session credits
 */
export async function generateInterview(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    const { role, category, experience, difficulty, mode, skills, projects } = req.body;

    if (!role || !experience) {
      return res.status(400).json({
        success: false,
        message: 'Role and Experience are required to configure an interview.'
      });
    }

    const cost = CREDIT_CONFIG.COSTS.AI_TECHNICAL_INTERVIEW; // 50 credits

    // 1. Check & atomically deduct credits
    const deduction = await deductUserCredits(req.user.id, cost);
    if (!deduction.success) {
      return res.status(402).json({
        success: false,
        message: deduction.message || 'Not enough credits. 50 credits required to start an interview session.',
        creditsAvailable: deduction.remainingCredits,
        requiredCredits: cost
      });
    }

    let questions;
    try {
      // 2. Generate progressive technical questions
      questions = await generateTechnicalQuestions({
        role: role.trim(),
        category: category?.trim() || 'Full Stack',
        experience: experience.trim(),
        difficulty: difficulty?.trim() || 'Intermediate',
        mode: mode === 'HR' ? 'HR' : 'Technical',
        skills: Array.isArray(skills) ? skills : [],
        projects: Array.isArray(projects) ? projects : []
      });
    } catch (aiErr: any) {
      // Automatic credit refund on generation failure
      await addUserCredits(req.user.id, cost);
      console.error('[InterviewController] AI generation error, refunded credits:', aiErr.message);
      return res.status(500).json({
        success: false,
        message: 'Failed to generate interview questions. Your credits have been automatically refunded.'
      });
    }

    // 3. Create interview session in database
    const session = await createInterviewSession({
      userId: req.user.id,
      role: role.trim(),
      category: category?.trim() || 'Full Stack',
      experience: experience.trim(),
      difficulty: difficulty?.trim() || 'Intermediate',
      mode: mode === 'HR' ? 'HR' : 'Technical',
      questions
    });

    // 4. Record credit deduction in transaction ledger
    await recordTransaction({
      userId: req.user.id,
      type: 'DEDUCTION',
      credits: -cost,
      balanceAfter: deduction.remainingCredits,
      description: `AI Technical Interview Session (${role})`,
      referenceId: session.id,
      status: 'SUCCESS'
    });

    const user = await findUserById(req.user.id);
    const userName = user?.profile?.name || req.user.email.split('@')[0];

    return res.json({
      success: true,
      data: {
        interviewId: session.id,
        creditsLeft: deduction.remainingCredits,
        userName,
        role: session.role,
        category: session.category,
        experience: session.experience,
        difficulty: session.difficulty,
        mode: session.mode,
        questions: session.questions
      }
    });
  } catch (err: any) {
    console.error('[InterviewController] generateInterview error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to create interview: ' + (err.message || 'Internal server error.')
    });
  }
}

/**
 * Submit and evaluate a question answer
 */
export async function submitAnswer(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    const { interviewId, questionIndex, answer, timeTaken } = req.body;

    if (!interviewId || questionIndex === undefined) {
      return res.status(400).json({ success: false, message: 'interviewId and questionIndex are required.' });
    }

    const interview = await findInterviewById(interviewId);
    if (!interview) {
      return res.status(404).json({ success: false, message: 'Interview session not found.' });
    }

    // Ownership check
    if (interview.userId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized. You do not own this session.' });
    }

    const idx = Number(questionIndex);
    if (idx < 0 || idx >= interview.questions.length) {
      return res.status(400).json({ success: false, message: 'Invalid question index.' });
    }

    const targetQuestion = interview.questions[idx];

    // Evaluate answer with AI
    const evaluation = await evaluateTechnicalAnswer({
      question: targetQuestion.question,
      answer: String(answer || ''),
      timeTaken: Number(timeTaken) || 0,
      timeLimit: targetQuestion.timeLimit,
      role: interview.role
    });

    // Update question record
    targetQuestion.answer = String(answer || '');
    targetQuestion.timeTaken = Number(timeTaken) || 0;
    targetQuestion.score = evaluation.score;
    targetQuestion.confidence = evaluation.confidence;
    targetQuestion.communication = evaluation.communication;
    targetQuestion.correctness = evaluation.correctness;
    targetQuestion.feedback = evaluation.feedback;
    targetQuestion.strengths = evaluation.strengths;
    targetQuestion.improvements = evaluation.improvements;
    targetQuestion.missingConcepts = evaluation.missingConcepts;

    await updateInterviewSession(interviewId, {
      questions: interview.questions
    });

    return res.json({
      success: true,
      data: {
        feedback: evaluation.feedback,
        score: evaluation.score,
        confidence: evaluation.confidence,
        communication: evaluation.communication,
        correctness: evaluation.correctness,
        strengths: evaluation.strengths,
        improvements: evaluation.improvements,
        missingConcepts: evaluation.missingConcepts
      }
    });
  } catch (err: any) {
    console.error('[InterviewController] submitAnswer error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to submit answer: ' + (err.message || 'Internal server error.')
    });
  }
}

/**
 * Finish interview session and calculate final score aggregate
 */
export async function finishInterview(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    const { interviewId } = req.body;
    if (!interviewId) {
      return res.status(400).json({ success: false, message: 'interviewId is required.' });
    }

    const interview = await findInterviewById(interviewId);
    if (!interview) {
      return res.status(404).json({ success: false, message: 'Interview session not found.' });
    }

    // Ownership check
    if (interview.userId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized. You do not own this session.' });
    }

    const totalQuestions = interview.questions.length;
    let totalScore = 0;
    let totalConfidence = 0;
    let totalCommunication = 0;
    let totalCorrectness = 0;
    const weakTopicsSet = new Set<string>();

    interview.questions.forEach((q) => {
      totalScore += q.score || 0;
      totalConfidence += q.confidence || 0;
      totalCommunication += q.communication || 0;
      totalCorrectness += q.correctness || 0;

      if (q.missingConcepts && q.missingConcepts.length > 0) {
        q.missingConcepts.forEach((mc) => weakTopicsSet.add(mc));
      }
      if (q.improvements && q.improvements.length > 0) {
        q.improvements.forEach((imp) => weakTopicsSet.add(imp));
      }
    });

    const finalScore = totalQuestions ? Number((totalScore / totalQuestions).toFixed(1)) : 0;
    const confidenceAvg = totalQuestions ? Number((totalConfidence / totalQuestions).toFixed(1)) : 0;
    const communicationAvg = totalQuestions ? Number((totalCommunication / totalQuestions).toFixed(1)) : 0;
    const correctnessAvg = totalQuestions ? Number((totalCorrectness / totalQuestions).toFixed(1)) : 0;
    const recommendedPracticeTopics = Array.from(weakTopicsSet).slice(0, 5);

    await updateInterviewSession(interviewId, {
      finalScore,
      confidenceAvg,
      communicationAvg,
      correctnessAvg,
      recommendedPracticeTopics,
      status: 'completed'
    });

    // Record activity in dashboard activity log
    activities.unshift({
      id: `act_${Date.now()}`,
      title: `Completed ${interview.role} Interview`,
      subtitle: `Score: ${finalScore}/10 (${Math.round((finalScore / 10) * 100)}%)`,
      timeAgo: 'Just now',
      type: 'interview'
    });

    return res.json({
      success: true,
      data: {
        interviewId: interview.id,
        role: interview.role,
        finalScore,
        confidence: confidenceAvg,
        communication: communicationAvg,
        correctness: correctnessAvg,
        recommendedPracticeTopics,
        status: 'completed',
        questionWiseScore: interview.questions.map((q, i) => ({
          questionNumber: i + 1,
          question: q.question,
          difficulty: q.difficulty,
          answer: q.answer,
          score: q.score || 0,
          confidence: q.confidence || 0,
          communication: q.communication || 0,
          correctness: q.correctness || 0,
          feedback: q.feedback || '',
          strengths: q.strengths || [],
          improvements: q.improvements || [],
          missingConcepts: q.missingConcepts || []
        }))
      }
    });
  } catch (err: any) {
    console.error('[InterviewController] finishInterview error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to finish interview: ' + (err.message || 'Internal server error.')
    });
  }
}

/**
 * Get all past interview sessions for authenticated user
 */
export async function getMyInterviews(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    const interviews = await getUserInterviews(req.user.id);

    return res.json({
      success: true,
      data: interviews.map((item) => ({
        id: item.id,
        role: item.role,
        category: item.category,
        experience: item.experience,
        difficulty: item.difficulty,
        mode: item.mode,
        finalScore: item.finalScore,
        confidenceAvg: item.confidenceAvg,
        communicationAvg: item.communicationAvg,
        correctnessAvg: item.correctnessAvg,
        status: item.status,
        totalQuestions: item.questions.length,
        createdAt: item.createdAt
      }))
    });
  } catch (err: any) {
    console.error('[InterviewController] getMyInterviews error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve interview history.'
    });
  }
}

/**
 * Get full report for a specific interview
 */
export async function getInterviewReport(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    const { id } = req.params;
    const interview = await findInterviewById(id);

    if (!interview) {
      return res.status(404).json({ success: false, message: 'Interview report not found.' });
    }

    // Ownership check
    if (interview.userId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized. You do not own this report.' });
    }

    return res.json({
      success: true,
      data: {
        id: interview.id,
        role: interview.role,
        category: interview.category,
        experience: interview.experience,
        difficulty: interview.difficulty,
        mode: interview.mode,
        finalScore: interview.finalScore,
        confidence: interview.confidenceAvg,
        communication: interview.communicationAvg,
        correctness: interview.correctnessAvg,
        recommendedPracticeTopics: interview.recommendedPracticeTopics,
        status: interview.status,
        createdAt: interview.createdAt,
        questionWiseScore: interview.questions.map((q, i) => ({
          questionNumber: i + 1,
          question: q.question,
          difficulty: q.difficulty,
          timeLimit: q.timeLimit,
          timeTaken: q.timeTaken,
          answer: q.answer,
          score: q.score || 0,
          confidence: q.confidence || 0,
          communication: q.communication || 0,
          correctness: q.correctness || 0,
          feedback: q.feedback || '',
          strengths: q.strengths || [],
          improvements: q.improvements || [],
          missingConcepts: q.missingConcepts || []
        }))
      }
    });
  } catch (err: any) {
    console.error('[InterviewController] getInterviewReport error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve interview report.'
    });
  }
}
