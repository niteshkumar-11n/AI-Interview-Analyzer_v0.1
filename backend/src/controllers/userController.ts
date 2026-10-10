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
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const isLastStep = step === 3;
    const updates: any = {
      ...(data || {}),
      careerStatus: careerStatus || user.profile?.careerStatus || 'student',
      onboardingStatus: {
        isCompleted: isLastStep,
        step: Number(step) || 1,
        careerStatus: careerStatus || user.profile?.careerStatus || 'student'
      }
    };

    const updated = await updateUserProfile(req.user.id, updates);

    return res.json({
      success: true,
      message: isLastStep ? 'Onboarding completed!' : `Step ${step} progress saved.`,
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
        step: 3,
        careerStatus: user.profile?.careerStatus || 'student'
      }
    });

    return res.json({
      success: true,
      message: 'Onboarding completed. Welcome to your dashboard!',
      profile: updated
    });
  } catch (err: any) {
    console.error('skipOnboardingResume error:', err);
    return res.status(500).json({ success: false, message: 'Failed to complete onboarding.' });
  }
}
