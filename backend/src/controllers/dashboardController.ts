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

  if (req.user?.id) {
    const user = await findUserById(req.user.id);
    if (user) {
      candidateName = user.profile?.name || user.email.split('@')[0];
      if (user.profile?.skills && user.profile.skills.length > 0) {
        userSkills = user.profile.skills as any;
      }
    }
  }

  res.json({
    success: true,
    data: {
      candidateName,
      interviewReadiness: {
        overallScore: 78,
        status: 'Almost Ready',
        description: 'Keep practicing to reach 90+'
      },
      recentInterview: interviewRecords[0] || {
        title: 'Technical Interview',
        score: 82,
        date: '1 Sep 2025'
      },
      stats: {
        interviewsTaken: 12,
        interviewsDelta: '+3 this month',
        practiceTimeHours: 18,
        practiceTimeDelta: '+5 hrs this week'
      },
      skills: userSkills,
      weakAreas,
      recommendedJobs,
      recommendedIssues: openSourceIssues,
      recentActivities: activities,
      scoreHistory: [
        { month: 'Jul', score: 60 },
        { month: 'Aug', score: 68 },
        { month: 'Sep', score: 82 }
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
