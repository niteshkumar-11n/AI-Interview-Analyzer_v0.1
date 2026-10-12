/**
 * User/Profile Controller
 * Handles profile read and update with MongoDB Atlas persistence
 */
import { Response } from 'express';
import { findUserById, updateUserProfile } from '../models/User.ts';
import { AuthenticatedRequest } from '../middleware/authMiddleware.ts';

export async function getProfile(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    const user = await findUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User profile not found.' });
    }

    return res.json({
      success: true,
      profile: user.profile,
      email: user.email,
      id: user.id
    });
  } catch (err: any) {
    console.error('getProfile error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
}

export async function updateProfile(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    const updatedProfile = await updateUserProfile(req.user.id, req.body);
    if (!updatedProfile) {
      return res.status(404).json({ success: false, message: 'User not found to update.' });
    }

    return res.json({
      success: true,
      message: 'Profile updated successfully!',
      profile: updatedProfile
    });
  } catch (err: any) {
    console.error('updateProfile error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
}

// URL format validation helper
function isValidUrl(val?: string): boolean {
  if (!val || typeof val !== 'string' || !val.trim()) return true;
  try {
    const parsed = new URL(val.trim());
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Saves onboarding step progress so user can resume anytime after page refresh
 */
export async function saveOnboardingStep(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    const { step, careerStatus, data } = req.body;
    const user = await findUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User account not found.' });
    }

    const currentStep = Number(step) || 1;
    const effectiveCareerStatus = careerStatus || data?.careerStatus || user.profile?.careerStatus || 'student';

    // Validate career status selection
    const validStatuses = ['student', 'fresher', 'working', 'career_switcher'];
    if (careerStatus && !validStatuses.includes(careerStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid career status selection. Must be one of: College student, Fresher, Working professional, or Career switcher.'
      });
    }

    // Step 1: Career status selection
    if (currentStep === 1) {
      const updated = await updateUserProfile(req.user.id, {
        careerStatus: effectiveCareerStatus,
        onboardingStatus: {
          isCompleted: false,
          step: 2,
          careerStatus: effectiveCareerStatus
        }
      });

      return res.json({
        success: true,
        message: 'Career status selected successfully.',
        profile: updated
      });
    }

    // Step 2: Conditional details validation
    if (currentStep === 2) {
      // Validate optional professional URLs if provided
      if (data?.githubUrl && !isValidUrl(data.githubUrl)) {
        return res.status(400).json({ success: false, message: 'Invalid GitHub profile URL. Please provide a valid URL starting with http:// or https://' });
      }
      if (data?.linkedinUrl && !isValidUrl(data.linkedinUrl)) {
        return res.status(400).json({ success: false, message: 'Invalid LinkedIn profile URL. Please provide a valid URL starting with http:// or https://' });
      }
      if (data?.portfolioUrl && !isValidUrl(data.portfolioUrl)) {
        return res.status(400).json({ success: false, message: 'Invalid Portfolio website URL. Please provide a valid URL starting with http:// or https://' });
      }

      // Check skills
      const rawSkills = data?.skills;
      const skillsArray = Array.isArray(rawSkills) ? rawSkills : [];
      if (skillsArray.length === 0) {
        return res.status(400).json({ success: false, message: 'Please specify at least one technical skill to complete your profile.' });
      }

      // Format skills consistently
      const formattedSkills = skillsArray.map((s: any) => {
        if (typeof s === 'string') {
          return { name: s.trim(), level: 'Intermediate', percentage: 75 };
        }
        return {
          name: s.name || 'Skill',
          level: s.level || 'Intermediate',
          percentage: typeof s.percentage === 'number' ? s.percentage : (typeof s.proficiency === 'number' ? s.proficiency : 75)
        };
      });

      // Conditional validation based on careerStatus
      if (effectiveCareerStatus === 'student') {
        if (!data?.college?.trim()) {
          return res.status(400).json({ success: false, message: 'College or University name is required for students.' });
        }
        if (!data?.degree?.trim() && !data?.specialization?.trim()) {
          return res.status(400).json({ success: false, message: 'Degree or Specialization is required.' });
        }
        if (!data?.academicYear?.trim()) {
          return res.status(400).json({ success: false, message: 'Current academic year is required.' });
        }
        if (!data?.graduationYear || isNaN(Number(data.graduationYear))) {
          return res.status(400).json({ success: false, message: 'Expected graduation year is required.' });
        }
        if (!data?.targetRole?.trim()) {
          return res.status(400).json({ success: false, message: 'Target job role is required.' });
        }
      } else if (effectiveCareerStatus === 'fresher') {
        if (!data?.college?.trim() && !data?.degree?.trim()) {
          return res.status(400).json({ success: false, message: 'Degree / College is required for freshers.' });
        }
        if (!data?.graduationYear || isNaN(Number(data.graduationYear))) {
          return res.status(400).json({ success: false, message: 'Graduation year is required.' });
        }
        if (!data?.targetRole?.trim()) {
          return res.status(400).json({ success: false, message: 'Target job role is required.' });
        }
      } else if (effectiveCareerStatus === 'working') {
        if (!data?.currentJobTitle?.trim()) {
          return res.status(400).json({ success: false, message: 'Current job title is required for working professionals.' });
        }
        if (!data?.yearsOfExperience?.trim()) {
          return res.status(400).json({ success: false, message: 'Years of experience is required.' });
        }
        if (!data?.targetRole?.trim()) {
          return res.status(400).json({ success: false, message: 'Target role is required.' });
        }
      } else if (effectiveCareerStatus === 'career_switcher') {
        if (!data?.previousBackground?.trim()) {
          return res.status(400).json({ success: false, message: 'Previous background is required for career switchers.' });
        }
        if (!data?.desiredCareerPath?.trim()) {
          return res.status(400).json({ success: false, message: 'Desired career path is required.' });
        }
        if (!data?.targetRole?.trim()) {
          return res.status(400).json({ success: false, message: 'Target role is required.' });
        }
        if (!data?.learningGoals?.trim()) {
          return res.status(400).json({ success: false, message: 'Learning goals are required.' });
        }
      }

      const isCompleted = Boolean(data?.completeNow);
      const updates: any = {
        ...(data || {}),
        skills: formattedSkills,
        careerStatus: effectiveCareerStatus,
        github: data?.githubUrl || data?.github || '',
        githubUrl: data?.githubUrl || data?.github || '',
        linkedin: data?.linkedinUrl || data?.linkedin || '',
        linkedinUrl: data?.linkedinUrl || data?.linkedin || '',
        portfolio: data?.portfolioUrl || data?.portfolio || '',
        portfolioUrl: data?.portfolioUrl || data?.portfolio || '',
        onboardingStatus: {
          isCompleted,
          step: 3,
          careerStatus: effectiveCareerStatus
        }
      };

      const updated = await updateUserProfile(req.user.id, updates);

      return res.json({
        success: true,
        message: isCompleted ? 'Onboarding completed!' : 'Profile details saved. Ready for optional resume enrichment.',
        profile: updated
      });
    }

    // Default / Step 3 complete
    const isCompleted = Boolean(data?.completeNow) || currentStep >= 3;
    const updated = await updateUserProfile(req.user.id, {
      ...(data || {}),
      onboardingStatus: {
        isCompleted,
        step: 3,
        careerStatus: effectiveCareerStatus
      }
    });

    return res.json({
      success: true,
      message: 'Onboarding progress saved.',
      profile: updated
    });
  } catch (err: any) {
    console.error('saveOnboardingStep error:', err);
    return res.status(500).json({ success: false, message: 'Failed to save onboarding progress.' });
  }
}

/**
 * Skips the optional resume upload and marks onboarding as completed
 */
export async function skipOnboardingResume(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    const user = await findUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const updated = await updateUserProfile(req.user.id, {
      onboardingStatus: {
        isCompleted: true,
        step: 4,
        careerStatus: user.profile?.careerStatus || 'student'
      }
    });

    return res.json({
      success: true,
      message: 'Onboarding completed. Welcome to your dashboard!',
      profile: updated,
      onboardingStatus: updated?.onboardingStatus
    });
  } catch (err: any) {
    console.error('skipOnboardingResume error:', err);
    return res.status(500).json({ success: false, message: 'Failed to complete onboarding.' });
  }
}
