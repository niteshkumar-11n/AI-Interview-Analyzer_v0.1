/**
 * Dashboard Controller
 * Handles dashboard data, mock interviews, job applications, issue bookmarks
 */
import { Response } from 'express';
import { findUserById } from '../models/User.ts';
import {
  recommendedJobs,
  openSourceIssues,
  activities,
  interviewRecords,
  weakAreas,
  InterviewHistory,
} from '../models/Dashboard.ts';
import { AuthenticatedRequest } from '../middleware/authMiddleware.ts';
import { getUserInterviews } from '../models/Interview.ts';
import { getUserCredits } from '../models/User.ts';
import { getUserTransactions } from '../models/Transaction.ts';
import { CandidateContextService } from '../services/candidate/candidateContextService.ts';
import { CodingAssessmentModel } from '../models/CodingAssessment.ts';

export async function getDashboard(req: AuthenticatedRequest, res: Response) {
  let userSkills = [
    { name: 'JavaScript', percentage: 85, level: 'Advanced' },
    { name: 'React.js', percentage: 82, level: 'Advanced' },
    { name: 'Node.js', percentage: 76, level: 'Intermediate' },
    { name: 'MongoDB', percentage: 70, level: 'Intermediate' },
    { name: 'DSA', percentage: 60, level: 'Intermediate' },
    { name: 'System Design', percentage: 55, level: 'Beginner' },
    { name: 'Communication', percentage: 68, level: 'Intermediate' }
  ];
  let candidateName = 'Guest';
  let credits = 100;
  let recentInterviewHistory: any[] = [];
  let userTransactions: any[] = [];
  let dynamicWeakAreas = weakAreas;
  let dynamicStats = {
    interviewsTaken: 0,
    interviewsDelta: 'Start your 1st session',
    practiceTimeHours: 0,
    practiceTimeDelta: '+0 hrs this week'
  };
  let recentInterviewData: any = null;
  let latestTechnicalInterview: any = null;
  let latestHrInterview: any = null;
  let latestCodingAssessment: any = null;
  let codingMetrics: any = {
    totalAssessments: 0,
    latestScore: null,
    highestScore: null,
    averageScore: null,
    difficultyPerformance: {
      easyAvg: 0,
      mediumAvg: 0,
      mediumHardAvg: 0,
      starChallengeAvg: 0,
    },
    history: [],
  };
  let readinessScore = 78;

  if (req.user?.id) {
    const user = await findUserById(req.user.id);
    if (user) {
      candidateName = user.profile?.name || user.email.split('@')[0];
      if (user.profile?.skills && user.profile.skills.length > 0) {
        userSkills = user.profile.skills as any;
      }
    }

    // Real wallet credit balance
    credits = await getUserCredits(req.user.id);

    // Real user transaction activity
    userTransactions = await getUserTransactions(req.user.id, 5);

    // Real database interviews
    const realInterviews = await getUserInterviews(req.user.id);
    const completedInterviews = realInterviews.filter(i => i.status === 'completed');

    if (completedInterviews.length > 0) {
      dynamicStats.interviewsTaken = completedInterviews.length;
      dynamicStats.interviewsDelta = `+${completedInterviews.length} completed`;
      dynamicStats.practiceTimeHours = Math.round(completedInterviews.length * 0.5);

      const latest = completedInterviews[0];
      const latestScoreOutOf100 = Math.round(latest.finalScore * 10);
      recentInterviewData = {
        id: latest.id,
        title: `${latest.role} (${latest.mode || 'Technical'}) Interview`,
        mode: latest.mode || 'Technical',
        score: latestScoreOutOf100,
        rawScore: latest.finalScore,
        date: new Date(latest.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
        technical: Math.round(latest.correctnessAvg * 10),
        problemSolving: Math.round(latest.confidenceAvg * 10),
        communication: Math.round(latest.communicationAvg * 10),
        codeQuality: Math.round(latest.correctnessAvg * 10)
      };

      // Calculate latest Technical Interview
      const techInterview = completedInterviews.find(i => i.mode === 'Technical');
      if (techInterview) {
        latestTechnicalInterview = {
          id: techInterview.id,
          role: techInterview.role,
          title: `${techInterview.role} Technical Interview`,
          mode: 'Technical',
          score: Math.round(techInterview.finalScore * 10),
          rawScore: techInterview.finalScore,
          date: new Date(techInterview.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
          technical: Math.round(techInterview.correctnessAvg * 10),
          problemSolving: Math.round(techInterview.confidenceAvg * 10),
          communication: Math.round(techInterview.communicationAvg * 10),
          codeQuality: Math.round(techInterview.correctnessAvg * 10)
        };
      }

      // Calculate latest HR Interview
      const hrInterview = completedInterviews.find(i => i.mode === 'HR');
      if (hrInterview) {
        latestHrInterview = {
          id: hrInterview.id,
          role: hrInterview.role,
          title: `${hrInterview.role} HR Interview`,
          mode: 'HR',
          score: Math.round(hrInterview.finalScore * 10),
          rawScore: hrInterview.finalScore,
          date: new Date(hrInterview.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
          communication: Math.round(hrInterview.communicationAvg * 10),
          behavioral: Math.round(hrInterview.confidenceAvg * 10),
          relevance: Math.round(hrInterview.correctnessAvg * 10),
          codeQuality: Math.round(hrInterview.communicationAvg * 10)
        };
      }

      // Calculate average score for readiness
      const totalScoreSum = completedInterviews.reduce((acc, curr) => acc + (curr.finalScore * 10), 0);
      readinessScore = Math.min(100, Math.round(totalScoreSum / completedInterviews.length));

      // Extract real weak areas from interview sessions
      const topics = new Set<string>();
      completedInterviews.forEach(i => {
        i.recommendedPracticeTopics?.forEach(t => topics.add(t));
      });
      if (topics.size > 0) {
        dynamicWeakAreas = Array.from(topics).slice(0, 5).map((t, idx) => ({
          id: String(idx + 1),
          title: t
        }));
      }

      recentInterviewHistory = completedInterviews.slice(0, 8).map(i => ({
        id: i.id,
        role: i.role,
        title: `${i.role} (${i.mode || 'Technical'})`,
        mode: i.mode || 'Technical',
        score: Math.round(i.finalScore * 10),
        rawScore: i.finalScore,
        date: new Date(i.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
        category: i.category,
        experience: i.experience,
        status: i.status,
        questionCount: i.questions?.length || 5
      }));
    }

    // Real database coding assessments
    const realCodingAssessments = await CodingAssessmentModel.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .lean();

    if (realCodingAssessments.length > 0) {
      const latestAssess = realCodingAssessments[0];
      latestCodingAssessment = {
        id: latestAssess.assessmentId || (latestAssess as any)._id,
        title: latestAssess.title || '4-Tier Coding Assessment',
        score: latestAssess.totalScore,
        date: new Date(latestAssess.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
        easyScore: latestAssess.easyScore,
        mediumScore: latestAssess.mediumScore,
        mediumHardScore: latestAssess.mediumHardScore,
        starChallengeScore: latestAssess.starChallengeScore,
        questionsCount: latestAssess.questions?.length || 4,
        weakAreas: latestAssess.weakAreas || [],
      };

      const scores = realCodingAssessments.map(a => a.totalScore);
      const totalScoreSum = scores.reduce((sum, s) => sum + s, 0);
      const highestScore = Math.max(...scores);
      const averageScore = Math.round((totalScoreSum / realCodingAssessments.length) * 100) / 100;

      const easySum = realCodingAssessments.reduce((sum, a) => sum + (a.easyScore || 0), 0);
      const medSum = realCodingAssessments.reduce((sum, a) => sum + (a.mediumScore || 0), 0);
      const medHardSum = realCodingAssessments.reduce((sum, a) => sum + (a.mediumHardScore || 0), 0);
      const starSum = realCodingAssessments.reduce((sum, a) => sum + (a.starChallengeScore || 0), 0);

      codingMetrics = {
        totalAssessments: realCodingAssessments.length,
        latestScore: latestAssess.totalScore,
        highestScore,
        averageScore,
        difficultyPerformance: {
          easyAvg: Math.round((easySum / realCodingAssessments.length) * 10) / 10,
          mediumAvg: Math.round((medSum / realCodingAssessments.length) * 10) / 10,
          mediumHardAvg: Math.round((medHardSum / realCodingAssessments.length) * 10) / 10,
          starChallengeAvg: Math.round((starSum / realCodingAssessments.length) * 10) / 10,
        },
        history: realCodingAssessments.slice(0, 8).map(a => ({
          id: a.assessmentId || (a as any)._id,
          title: a.title,
          score: a.totalScore,
          date: new Date(a.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
          easyScore: a.easyScore,
          mediumScore: a.mediumScore,
          mediumHardScore: a.mediumHardScore,
          starChallengeScore: a.starChallengeScore,
          weakAreas: a.weakAreas,
        })),
      };
    }
  }

  // Determine readiness status label
  const readinessStatus =
    readinessScore >= 85 ? 'Job Ready' :
    readinessScore >= 70 ? 'Almost Ready' :
    'Needs Practice';

  const readinessDesc =
    readinessScore >= 85 ? 'Outstanding readiness across modules!' :
    readinessScore >= 70 ? 'Keep practicing to reach 85+' :
    'Complete technical & HR interviews to boost readiness';

  res.json({
    success: true,
    data: {
      candidateName,
      credits,
      interviewReadiness: {
        overallScore: readinessScore,
        status: readinessStatus,
        description: readinessDesc
      },
      latestTechnicalInterview,
      latestHrInterview,
      latestCodingAssessment,
      codingMetrics,
      recentInterview: recentInterviewData || interviewRecords[0] || {
        title: 'Full Stack Technical Interview',
        mode: 'Technical',
        score: 82,
        date: 'Recent'
      },
      stats: dynamicStats.interviewsTaken > 0 ? dynamicStats : {
        interviewsTaken: 0,
        interviewsDelta: 'Ready for first test',
        practiceTimeHours: 0,
        practiceTimeDelta: 'Get started today'
      },
      skills: userSkills,
      weakAreas: dynamicWeakAreas,
      recommendedJobs,
      recommendedIssues: openSourceIssues,
      recentActivities: activities,
      recentInterviewHistory,
      recentTransactions: userTransactions,
      scoreHistory: [
        { month: 'Jul', score: 60 },
        { month: 'Aug', score: 68 },
        { month: 'Sep', score: readinessScore }
      ]
    }
  });
}

export function recordMockInterview(req: AuthenticatedRequest, res: Response) {
  const { title, score, technical, problemSolving, communication, codeQuality } = req.body;
  const finalScore = Number(score) || 85;
  const newRecord: InterviewHistory = {
    id: `rec_${Date.now()}`,
    title: title || 'Full-Stack Technical Interview',
    score: finalScore,
    date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
    technical: Number(technical) || 85,
    problemSolving: Number(problemSolving) || 82,
    communication: Number(communication) || 88,
    codeQuality: Number(codeQuality) || 80
  };

  interviewRecords.unshift(newRecord);
  activities.unshift({
    id: `act_${Date.now()}`,
    title: `Completed ${newRecord.title}`,
    subtitle: `Scored ${finalScore}% • Just now`,
    timeAgo: 'Just now',
    type: 'interview'
  });

  res.json({
    success: true,
    message: 'Mock interview completed and recorded successfully!',
    record: newRecord
  });
}

export function applyToJob(req: AuthenticatedRequest, res: Response) {
  const { id } = req.params;
  const job = recommendedJobs.find(j => j.id === id);
  if (!job) {
    return res.status(404).json({ success: false, message: 'Job not found.' });
  }
  job.applied = !job.applied;
  activities.unshift({
    id: `act_${Date.now()}`,
    title: job.applied ? `Applied to ${job.company}` : `Withdrew application for ${job.company}`,
    subtitle: `${job.title} • ${job.location}`,
    timeAgo: 'Just now',
    type: 'job'
  });
  res.json({
    success: true,
    applied: job.applied,
    message: job.applied ? `Application submitted to ${job.company}!` : 'Application status updated.'
  });
}

export function bookmarkIssue(req: AuthenticatedRequest, res: Response) {
  const { id } = req.params;
  const issue = openSourceIssues.find(i => i.id === id);
  if (!issue) {
    return res.status(404).json({ success: false, message: 'Issue not found.' });
  }
  issue.bookmarked = !issue.bookmarked;
  res.json({
    success: true,
    bookmarked: issue.bookmarked,
    message: issue.bookmarked ? 'Issue bookmarked for practice.' : 'Bookmark removed.'
  });
}
