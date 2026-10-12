import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { api } from '../../services/api.ts';
import { CareerStatus, UserProfile } from '../../types.ts';
import { 
  GraduationCap, 
  Sparkles, 
  Briefcase, 
  Compass, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  X, 
  Plus, 
  Link2, 
  AlertCircle,
  FileText,
  Upload,
  Check,
  RotateCcw,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

interface OnboardingWizardModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

interface ExtractedResumeDiff {
  resumeId: string;
  extractedFacts: any;
  profileDiff: {
    newSkills: string[];
    existingSkills: string[];
    education: { current: string; extracted: string; hasConflict: boolean };
    experience: { current: string; extracted: string; hasConflict: boolean };
    targetRole: { current: string; extracted: string; hasConflict: boolean };
    projects: any[];
    certifications: any[];
    extractedSummary: string;
  };
}

export const OnboardingWizardModal: React.FC<OnboardingWizardModalProps> = ({
  isOpen,
  onComplete
}) => {
  const { user, updateProfileState } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Active Wizard Step: 1 = Career Status, 2 = Profile Details, 3 = Optional Resume Enrichment
  const [step, setStep] = useState<number>(1);
  const [careerStatus, setCareerStatus] = useState<CareerStatus>('student');

  // Form Fields State
  const [college, setCollege] = useState('');
  const [degree, setDegree] = useState('B.Tech');
  const [specialization, setSpecialization] = useState('Computer Science');
  const [academicYear, setAcademicYear] = useState('4th Year');
  const [graduationYear, setGraduationYear] = useState<number>(2026);
  const [targetRole, setTargetRole] = useState('Full Stack Engineer');

  // Working professional fields
  const [currentJobTitle, setCurrentJobTitle] = useState('');
  const [yearsOfExperience, setYearsOfExperience] = useState('1 - 2 Years');
  const [currentCompany, setCurrentCompany] = useState('');
  const [workMode, setWorkMode] = useState<'Remote' | 'Hybrid' | 'On-site'>('Hybrid');
  const [preferredLocation, setPreferredLocation] = useState('Bengaluru');

  // Career switcher fields
  const [previousBackground, setPreviousBackground] = useState('');
  const [relevantExperience, setRelevantExperience] = useState('');
  const [desiredCareerPath, setDesiredCareerPath] = useState('Full Stack Web Development');
  const [learningGoals, setLearningGoals] = useState('');

  // Skills
  const [skills, setSkills] = useState<string[]>(['JavaScript', 'React', 'Node.js']);
  const [newSkillInput, setNewSkillInput] = useState('');

  // Optional Professional Links
  const [githubUrl, setGithubUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');

  // Optional extra notes
  const [optionalNotes, setOptionalNotes] = useState('');

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);

  // --- Step 3: Resume Enrichment State ---
  const [resumeMode, setResumeMode] = useState<'prompt' | 'upload' | 'review'>('prompt');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pastedResumeText, setPastedResumeText] = useState('');
  const [showPastedInput, setShowPastedInput] = useState(false);
  const [resumeProcessingStatus, setResumeProcessingStatus] = useState<'idle' | 'uploading' | 'processing' | 'failed'>('idle');
  const [extractedResult, setExtractedResult] = useState<ExtractedResumeDiff | null>(null);

  // Review & Conflict Resolution state
  const [selectedNewSkills, setSelectedNewSkills] = useState<string[]>([]);
  const [educationChoice, setEducationChoice] = useState<'current' | 'resume'>('current');
  const [experienceChoice, setExperienceChoice] = useState<'current' | 'resume'>('current');
  const [roleChoice, setRoleChoice] = useState<'current' | 'resume'>('current');

  // Restore saved progress from user.profile on mount or update
  useEffect(() => {
    if (user?.profile) {
      const p = user.profile;
      if (p.careerStatus) {
        setCareerStatus(p.careerStatus);
      }
      if (p.onboardingStatus?.step && p.onboardingStatus.step > 1) {
        setStep(p.onboardingStatus.step);
      }
      if (p.college) setCollege(p.college);
      if (p.degree) setDegree(p.degree);
      if (p.specialization) setSpecialization(p.specialization);
      if (p.academicYear) setAcademicYear(p.academicYear);
      if (p.graduationYear) setGraduationYear(p.graduationYear);
      if (p.targetRole) setTargetRole(p.targetRole);
      if (p.currentJobTitle) setCurrentJobTitle(p.currentJobTitle);
      if (p.yearsOfExperience) setYearsOfExperience(p.yearsOfExperience);
      if (p.currentCompany) setCurrentCompany(p.currentCompany);
      if (p.workMode) setWorkMode(p.workMode);
      if (p.preferredLocation) setPreferredLocation(p.preferredLocation);
      if (p.previousBackground) setPreviousBackground(p.previousBackground);
      if (p.relevantExperience) setRelevantExperience(p.relevantExperience);
      if (p.desiredCareerPath) setDesiredCareerPath(p.desiredCareerPath);
      if (p.learningGoals) setLearningGoals(p.learningGoals);
      if (p.githubUrl || p.github) setGithubUrl(p.githubUrl || p.github || '');
      if (p.linkedinUrl || p.linkedin) setLinkedinUrl(p.linkedinUrl || p.linkedin || '');
      if (p.portfolioUrl || p.portfolio) setPortfolioUrl(p.portfolioUrl || p.portfolio || '');
      if (Array.isArray(p.skills) && p.skills.length > 0) {
        setSkills(p.skills.map((s: any) => (typeof s === 'string' ? s : s.name)));
      }
    }
  }, [user]);

  if (!isOpen) return null;

  // URL format validator
  const validateUrl = (url: string): boolean => {
    if (!url.trim()) return true;
    try {
      const parsed = new URL(url.trim());
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  };

  // Add / Remove skills
  const handleAddSkill = () => {
    const trimmed = newSkillInput.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
      setNewSkillInput('');
      setErrors((prev) => {
        const next = { ...prev };
        delete next.skills;
        return next;
      });
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  // Step 1: Save Career Status & Advance
  const handleSaveStep1 = async () => {
    setApiError(null);
    setIsSubmitting(true);
    try {
      const response = await api.profile.saveOnboardingStep({
        step: 1,
        careerStatus
      });
      if (response.success && response.profile) {
        updateProfileState(response.profile);
      }
      setStep(2);
    } catch (err: any) {
      setApiError(err.message || 'Failed to save career status. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 2: Validate & Save Profile Details
  const handleSaveStep2 = async () => {
    setApiError(null);
    const newErrors: Record<string, string> = {};

    // Validate URLs
    if (githubUrl.trim() && !validateUrl(githubUrl)) {
      newErrors.githubUrl = 'Please enter a valid URL starting with https:// or http://';
    }
    if (linkedinUrl.trim() && !validateUrl(linkedinUrl)) {
      newErrors.linkedinUrl = 'Please enter a valid URL starting with https:// or http://';
    }
    if (portfolioUrl.trim() && !validateUrl(portfolioUrl)) {
      newErrors.portfolioUrl = 'Please enter a valid URL starting with https:// or http://';
    }

    // Validate Skills
    if (skills.length === 0) {
      newErrors.skills = 'Please add at least one technical skill.';
    }

    // Conditional Validation per Career Status
    if (careerStatus === 'student') {
      if (!college.trim()) newErrors.college = 'College or University name is required.';
      if (!degree.trim() && !specialization.trim()) newErrors.degree = 'Degree or Specialization is required.';
      if (!academicYear.trim()) newErrors.academicYear = 'Current academic year is required.';
      if (!graduationYear || graduationYear < 2020) newErrors.graduationYear = 'Valid expected graduation year is required.';
      if (!targetRole.trim()) newErrors.targetRole = 'Target job role is required.';
    } else if (careerStatus === 'fresher') {
      if (!college.trim() && !degree.trim()) newErrors.college = 'Degree and College name are required.';
      if (!graduationYear || graduationYear < 2015) newErrors.graduationYear = 'Valid graduation year is required.';
      if (!targetRole.trim()) newErrors.targetRole = 'Target job role is required.';
    } else if (careerStatus === 'working') {
      if (!currentJobTitle.trim()) newErrors.currentJobTitle = 'Current job title is required.';
      if (!yearsOfExperience.trim()) newErrors.yearsOfExperience = 'Years of experience is required.';
      if (!targetRole.trim()) newErrors.targetRole = 'Target role is required.';
    } else if (careerStatus === 'career_switcher') {
      if (!previousBackground.trim()) newErrors.previousBackground = 'Previous domain or background is required.';
      if (!desiredCareerPath.trim()) newErrors.desiredCareerPath = 'Desired career path is required.';
      if (!targetRole.trim()) newErrors.targetRole = 'Target role is required.';
      if (!learningGoals.trim()) newErrors.learningGoals = 'Learning goals are required.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      const formattedSkills = skills.map((name) => ({
        name,
        level: 'Intermediate' as const,
        proficiency: 75
      }));

      const payloadData: Partial<UserProfile> = {
        careerStatus,
        targetRole,
        skills: formattedSkills,
        college,
        degree,
        specialization,
        academicYear,
        graduationYear,
        education: `${degree} in ${specialization || 'Engineering'}`,
        currentJobTitle,
        yearsOfExperience,
        currentCompany,
        workMode,
        preferredLocation,
        previousBackground,
        relevantExperience,
        desiredCareerPath,
        learningGoals,
        github: githubUrl.trim(),
        githubUrl: githubUrl.trim(),
        linkedin: linkedinUrl.trim(),
        linkedinUrl: linkedinUrl.trim(),
        portfolio: portfolioUrl.trim(),
        portfolioUrl: portfolioUrl.trim(),
        bio: optionalNotes.trim() || undefined
      };

      const response = await api.profile.saveOnboardingStep({
        step: 2,
        careerStatus,
        data: payloadData
      });

      if (response.success && response.profile) {
        updateProfileState(response.profile);
      }
      setStep(3);
    } catch (err: any) {
      setApiError(err.message || 'Failed to save profile details. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Step 3: Handle Resume Upload & Extraction ---
  const handleUploadResumeFile = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    if (!selectedFile && !pastedResumeText.trim()) {
      setApiError('Please select a resume file (PDF/DOCX/TXT) or paste your resume text.');
      return;
    }

    setResumeProcessingStatus('uploading');
    setIsSubmitting(true);

    try {
      let response;
      if (selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        setResumeProcessingStatus('processing');
        response = await api.resume.upload(formData);
      } else {
        setResumeProcessingStatus('processing');
        response = await api.resume.upload({
          resumeText: pastedResumeText.trim(),
          fileName: 'candidate_resume.txt'
        });
      }

      if (response.success && response.data) {
        setExtractedResult(response.data);
        // Pre-select all newly extracted skills
        setSelectedNewSkills(response.data.profileDiff.newSkills || []);
        // Default conflict resolution choices to current profile to protect manual inputs
        setEducationChoice('current');
        setExperienceChoice('current');
        setRoleChoice('current');
        setResumeMode('review');
        setResumeProcessingStatus('idle');
      } else {
        throw new Error(response.message || 'Failed to parse resume.');
      }
    } catch (err: any) {
      setResumeProcessingStatus('failed');
      setApiError(err.message || 'Failed to process resume. You can retry or choose "Skip for now".');
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Step 3: Confirm Fact Merge & Finish Onboarding ---
  const handleConfirmResumeEnrichment = async () => {
    if (!extractedResult) return;
    setApiError(null);
    setIsSubmitting(true);

    try {
      const diff = extractedResult.profileDiff;
      const facts = extractedResult.extractedFacts;

      // Combine existing skills with user-selected new skills
      const approvedSkills = Array.from(new Set([...skills, ...selectedNewSkills]));

      // Determine chosen values for fields with conflicts
      const finalEducation =
        educationChoice === 'resume' && diff.education.extracted
          ? diff.education.extracted
          : user?.profile?.education || `${degree} in ${specialization || 'Engineering'}`;

      const finalExperience =
        experienceChoice === 'resume' && diff.experience.extracted
          ? diff.experience.extracted
          : user?.profile?.yearsOfExperience || yearsOfExperience;

      const finalTargetRole =
        roleChoice === 'resume' && diff.targetRole.extracted
          ? diff.targetRole.extracted
          : targetRole;

      const response = await api.resume.confirm({
        resumeId: extractedResult.resumeId,
        confirmedFacts: {
          approvedSkills,
          education: finalEducation,
          experience: finalExperience,
          targetRole: finalTargetRole,
          bio: diff.extractedSummary || user?.profile?.bio
        }
      });

      if (response.success && response.data?.profile) {
        updateProfileState(response.data.profile);
      } else {
        // Also ensure profile state has onboarding completed marked
        if (user?.profile) {
          updateProfileState({
            ...user.profile,
            targetRole: finalTargetRole,
            onboardingStatus: {
              isCompleted: true,
              step: 3,
              careerStatus
            }
          });
        }
      }

      onComplete();
    } catch (err: any) {
      setApiError(err.message || 'Failed to confirm resume enrichment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 3: Skip-for-now to Dashboard
  const handleCompleteOrSkip = async () => {
    setApiError(null);
    setIsSubmitting(true);
    try {
      const response = await api.profile.skipOnboarding();
      if (response.success && response.profile) {
        updateProfileState(response.profile);
      } else if (user?.profile) {
        updateProfileState({
          ...user.profile,
          onboardingStatus: {
            isCompleted: true,
            step: 3,
            careerStatus
          }
        });
      }
      onComplete();
    } catch (err: any) {
      setApiError(err.message || 'Failed to complete onboarding. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className="modal fade show d-block" 
      style={{ backgroundColor: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(5px)', zIndex: 1060 }}
      tabIndex={-1}
      role="dialog"
    >
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content border-0 shadow-2xl rounded-4 overflow-hidden bg-white">
          
          {/* Header & Step Tracker */}
          <div className="modal-header border-bottom px-4 py-3 bg-light d-flex flex-column gap-3">
            <div className="w-100 d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center gap-2.5">
                <div 
                  className="p-2 rounded-3 text-white d-flex align-items-center justify-content-center"
                  style={{ background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)' }}
                >
                  <Sparkles size={20} />
                </div>
                <div>
                  <h5 className="modal-title fw-bold text-dark fs-6 mb-0">Candidate Profile Setup</h5>
                  <small className="text-secondary">Personalize your interview & job matching path</small>
                </div>
              </div>
              <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-2.5 py-1.5 rounded-pill fw-semibold">
                Step {step} of 3
              </span>
            </div>

            {/* Stepper progress bar */}
            <div className="w-100 d-flex align-items-center gap-2">
              <div className={`flex-grow-1 rounded-pill ${step >= 1 ? 'bg-primary' : 'bg-secondary-subtle'}`} style={{ height: '5px' }} />
              <div className={`flex-grow-1 rounded-pill ${step >= 2 ? 'bg-primary' : 'bg-secondary-subtle'}`} style={{ height: '5px' }} />
              <div className={`flex-grow-1 rounded-pill ${step >= 3 ? 'bg-primary' : 'bg-secondary-subtle'}`} style={{ height: '5px' }} />
            </div>
          </div>

          {/* Modal Body */}
          <div className="modal-body p-4 max-h-75vh overflow-y-auto" style={{ maxHeight: '72vh' }}>
            
            {/* Global API Error Alert */}
            {apiError && (
              <div className="alert alert-danger d-flex align-items-center gap-2 py-2 px-3 rounded-3 mb-4 small" role="alert">
                <AlertCircle size={18} className="flex-shrink-0" />
                <span>{apiError}</span>
              </div>
            )}

            {/* ---------------- STEP 1: CAREER STATUS SELECTION ---------------- */}
            {step === 1 && (
              <div>
                <div className="text-center mb-4">
                  <h6 className="fw-bold text-dark fs-5 mb-1">What best describes your current career stage?</h6>
                  <p className="text-secondary small mb-0">
                    We adapt questions, interview mock tracks, and recommendations to match your background.
                  </p>
                </div>

                <div className="row g-3">
                  {/* Card 1: College student */}
                  <div className="col-12 col-md-6">
                    <div 
                      onClick={() => setCareerStatus('student')}
                      className={`card h-100 p-3 rounded-4 cursor-pointer transition-all border-2 ${
                        careerStatus === 'student' ? 'border-primary bg-primary-subtle shadow-xs' : 'border-light-subtle hover-border-primary'
                      }`}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="d-flex align-items-start gap-3">
                        <div className={`p-2.5 rounded-3 ${careerStatus === 'student' ? 'bg-primary text-white' : 'bg-light text-secondary'}`}>
                          <GraduationCap size={24} />
                        </div>
                        <div className="flex-grow-1">
                          <div className="d-flex align-items-center justify-content-between mb-1">
                            <span className="fw-bold text-dark">College Student</span>
                            {careerStatus === 'student' && <CheckCircle2 size={18} className="text-primary" />}
                          </div>
                          <p className="text-secondary small mb-0 lh-sm">
                            Currently pursuing degree. Seeking internships, summer training, or campus placements.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card 2: Fresher */}
                  <div className="col-12 col-md-6">
                    <div 
                      onClick={() => setCareerStatus('fresher')}
                      className={`card h-100 p-3 rounded-4 cursor-pointer transition-all border-2 ${
                        careerStatus === 'fresher' ? 'border-primary bg-primary-subtle shadow-xs' : 'border-light-subtle hover-border-primary'
                      }`}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="d-flex align-items-start gap-3">
                        <div className={`p-2.5 rounded-3 ${careerStatus === 'fresher' ? 'bg-primary text-white' : 'bg-light text-secondary'}`}>
                          <Sparkles size={24} />
                        </div>
                        <div className="flex-grow-1">
                          <div className="d-flex align-items-center justify-content-between mb-1">
                            <span className="fw-bold text-dark">Fresher / Graduate</span>
                            {careerStatus === 'fresher' && <CheckCircle2 size={18} className="text-primary" />}
                          </div>
                          <p className="text-secondary small mb-0 lh-sm">
                            Recently graduated. Actively seeking first full-time tech role or entry-level SDE position.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card 3: Working Professional */}
                  <div className="col-12 col-md-6">
                    <div 
                      onClick={() => setCareerStatus('working')}
                      className={`card h-100 p-3 rounded-4 cursor-pointer transition-all border-2 ${
                        careerStatus === 'working' ? 'border-primary bg-primary-subtle shadow-xs' : 'border-light-subtle hover-border-primary'
                      }`}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="d-flex align-items-start gap-3">
                        <div className={`p-2.5 rounded-3 ${careerStatus === 'working' ? 'bg-primary text-white' : 'bg-light text-secondary'}`}>
                          <Briefcase size={24} />
                        </div>
                        <div className="flex-grow-1">
                          <div className="d-flex align-items-center justify-content-between mb-1">
                            <span className="fw-bold text-dark">Working Professional</span>
                            {careerStatus === 'working' && <CheckCircle2 size={18} className="text-primary" />}
                          </div>
                          <p className="text-secondary small mb-0 lh-sm">
                            Employed in software or IT. Looking for senior roles, switch, or interview practice.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card 4: Career Switcher */}
                  <div className="col-12 col-md-6">
                    <div 
                      onClick={() => setCareerStatus('career_switcher')}
                      className={`card h-100 p-3 rounded-4 cursor-pointer transition-all border-2 ${
                        careerStatus === 'career_switcher' ? 'border-primary bg-primary-subtle shadow-xs' : 'border-light-subtle hover-border-primary'
                      }`}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="d-flex align-items-start gap-3">
                        <div className={`p-2.5 rounded-3 ${careerStatus === 'career_switcher' ? 'bg-primary text-white' : 'bg-light text-secondary'}`}>
                          <Compass size={24} />
                        </div>
                        <div className="flex-grow-1">
                          <div className="d-flex align-items-center justify-content-between mb-1">
                            <span className="fw-bold text-dark">Career Switcher</span>
                            {careerStatus === 'career_switcher' && <CheckCircle2 size={18} className="text-primary" />}
                          </div>
                          <p className="text-secondary small mb-0 lh-sm">
                            Transitioning into tech from another domain. Building skills and coding portfolio.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="d-flex justify-content-end mt-4 pt-2">
                  <button
                    type="button"
                    onClick={handleSaveStep1}
                    disabled={isSubmitting}
                    className="btn btn-primary rounded-pill px-4 py-2 d-inline-flex align-items-center gap-2 fw-semibold"
                  >
                    <span>Continue to Details</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* ---------------- STEP 2: CONDITIONAL PROFILE DETAILS ---------------- */}
            {step === 2 && (
              <div>
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <div>
                    <h6 className="fw-bold text-dark fs-5 mb-0">
                      {careerStatus === 'student' && 'College & Academic Details'}
                      {careerStatus === 'fresher' && 'Graduate & Career Target'}
                      {careerStatus === 'working' && 'Professional Experience & Target'}
                      {careerStatus === 'career_switcher' && 'Transition Goals & Background'}
                    </h6>
                    <small className="text-secondary">Please fill in the required fields to build your candidate context.</small>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => setStep(1)} 
                    className="btn btn-sm btn-outline-secondary rounded-pill px-3 d-inline-flex align-items-center gap-1.5"
                  >
                    <ArrowLeft size={14} />
                    <span>Change Status</span>
                  </button>
                </div>

                {/* --- CONDITIONAL FIELDS: COLLEGE STUDENT --- */}
                {careerStatus === 'student' && (
                  <div className="row g-3">
                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold text-dark mb-1">
                        College / University Name <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className={`form-control rounded-3 ${errors.college ? 'is-invalid' : ''}`}
                        placeholder="e.g. IIT Bombay / NIT Surathkal / VIT"
                        value={college}
                        onChange={(e) => setCollege(e.target.value)}
                      />
                      {errors.college && <div className="invalid-feedback small">{errors.college}</div>}
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold text-dark mb-1">
                        Degree & Specialization <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className={`form-control rounded-3 ${errors.degree ? 'is-invalid' : ''}`}
                        placeholder="e.g. B.Tech Computer Science"
                        value={degree}
                        onChange={(e) => setDegree(e.target.value)}
                      />
                      {errors.degree && <div className="invalid-feedback small">{errors.degree}</div>}
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold text-dark mb-1">
                        Current Academic Year <span className="text-danger">*</span>
                      </label>
                      <select
                        className="form-select rounded-3"
                        value={academicYear}
                        onChange={(e) => setAcademicYear(e.target.value)}
                      >
                        <option value="1st Year">1st Year</option>
                        <option value="2nd Year">2nd Year</option>
                        <option value="3rd Year">3rd Year</option>
                        <option value="4th Year / Final Year">4th Year / Final Year</option>
                        <option value="Postgraduate (1st Year)">Postgraduate (1st Year)</option>
                        <option value="Postgraduate (Final Year)">Postgraduate (Final Year)</option>
                      </select>
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold text-dark mb-1">
                        Expected Graduation Year <span className="text-danger">*</span>
                      </label>
                      <input
                        type="number"
                        className={`form-control rounded-3 ${errors.graduationYear ? 'is-invalid' : ''}`}
                        value={graduationYear}
                        onChange={(e) => setGraduationYear(Number(e.target.value))}
                        min={2024}
                        max={2032}
                      />
                      {errors.graduationYear && <div className="invalid-feedback small">{errors.graduationYear}</div>}
                    </div>

                    <div className="col-12">
                      <label className="form-label small fw-semibold text-dark mb-1">
                        Target Job Role <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className={`form-control rounded-3 ${errors.targetRole ? 'is-invalid' : ''}`}
                        placeholder="e.g. Software Engineer (SDE-1) / Frontend Developer"
                        value={targetRole}
                        onChange={(e) => setTargetRole(e.target.value)}
                      />
                      {errors.targetRole && <div className="invalid-feedback small">{errors.targetRole}</div>}
                    </div>
                  </div>
                )}

                {/* --- CONDITIONAL FIELDS: FRESHER --- */}
                {careerStatus === 'fresher' && (
                  <div className="row g-3">
                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold text-dark mb-1">
                        College / University Name <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className={`form-control rounded-3 ${errors.college ? 'is-invalid' : ''}`}
                        placeholder="e.g. Delhi University / Anna University"
                        value={college}
                        onChange={(e) => setCollege(e.target.value)}
                      />
                      {errors.college && <div className="invalid-feedback small">{errors.college}</div>}
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold text-dark mb-1">
                        Degree / Branch <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control rounded-3"
                        placeholder="e.g. B.E. Information Technology"
                        value={degree}
                        onChange={(e) => setDegree(e.target.value)}
                      />
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold text-dark mb-1">
                        Graduation Year <span className="text-danger">*</span>
                      </label>
                      <input
                        type="number"
                        className={`form-control rounded-3 ${errors.graduationYear ? 'is-invalid' : ''}`}
                        value={graduationYear}
                        onChange={(e) => setGraduationYear(Number(e.target.value))}
                        min={2018}
                        max={2026}
                      />
                      {errors.graduationYear && <div className="invalid-feedback small">{errors.graduationYear}</div>}
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold text-dark mb-1">
                        Target Job Role <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className={`form-control rounded-3 ${errors.targetRole ? 'is-invalid' : ''}`}
                        placeholder="e.g. Full Stack Developer / SDE Intern"
                        value={targetRole}
                        onChange={(e) => setTargetRole(e.target.value)}
                      />
                      {errors.targetRole && <div className="invalid-feedback small">{errors.targetRole}</div>}
                    </div>
                  </div>
                )}

                {/* --- CONDITIONAL FIELDS: WORKING PROFESSIONAL --- */}
                {careerStatus === 'working' && (
                  <div className="row g-3">
                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold text-dark mb-1">
                        Current Job Title <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className={`form-control rounded-3 ${errors.currentJobTitle ? 'is-invalid' : ''}`}
                        placeholder="e.g. Software Engineer / Frontend Developer"
                        value={currentJobTitle}
                        onChange={(e) => setCurrentJobTitle(e.target.value)}
                      />
                      {errors.currentJobTitle && <div className="invalid-feedback small">{errors.currentJobTitle}</div>}
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold text-dark mb-1">
                        Years of Experience <span className="text-danger">*</span>
                      </label>
                      <select
                        className="form-select rounded-3"
                        value={yearsOfExperience}
                        onChange={(e) => setYearsOfExperience(e.target.value)}
                      >
                        <option value="1 - 2 Years">1 - 2 Years</option>
                        <option value="2 - 4 Years">2 - 4 Years</option>
                        <option value="4 - 7 Years">4 - 7 Years</option>
                        <option value="7+ Years">7+ Years</option>
                      </select>
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold text-dark mb-1">
                        Current Company <span className="text-muted fw-normal">(Optional)</span>
                      </label>
                      <input
                        type="text"
                        className="form-control rounded-3"
                        placeholder="e.g. Infosys / Startup / Cognizant"
                        value={currentCompany}
                        onChange={(e) => setCurrentCompany(e.target.value)}
                      />
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold text-dark mb-1">
                        Target Role <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className={`form-control rounded-3 ${errors.targetRole ? 'is-invalid' : ''}`}
                        placeholder="e.g. Senior Software Engineer / Full Stack Lead"
                        value={targetRole}
                        onChange={(e) => setTargetRole(e.target.value)}
                      />
                      {errors.targetRole && <div className="invalid-feedback small">{errors.targetRole}</div>}
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold text-dark mb-1">
                        Preferred Work Mode <span className="text-muted fw-normal">(Optional)</span>
                      </label>
                      <select
                        className="form-select rounded-3"
                        value={workMode}
                        onChange={(e) => setWorkMode(e.target.value as any)}
                      >
                        <option value="Remote">Remote</option>
                        <option value="Hybrid">Hybrid</option>
                        <option value="On-site">On-site</option>
                      </select>
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold text-dark mb-1">
                        Preferred Location <span className="text-muted fw-normal">(Optional)</span>
                      </label>
                      <input
                        type="text"
                        className="form-control rounded-3"
                        placeholder="e.g. Bengaluru, Hyderabad, or Any"
                        value={preferredLocation}
                        onChange={(e) => setPreferredLocation(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                {/* --- CONDITIONAL FIELDS: CAREER SWITCHER --- */}
                {careerStatus === 'career_switcher' && (
                  <div className="row g-3">
                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold text-dark mb-1">
                        Previous Background / Domain <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className={`form-control rounded-3 ${errors.previousBackground ? 'is-invalid' : ''}`}
                        placeholder="e.g. Mechanical Engineering / Sales / Banking"
                        value={previousBackground}
                        onChange={(e) => setPreviousBackground(e.target.value)}
                      />
                      {errors.previousBackground && <div className="invalid-feedback small">{errors.previousBackground}</div>}
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold text-dark mb-1">
                        Desired Career Path <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className={`form-control rounded-3 ${errors.desiredCareerPath ? 'is-invalid' : ''}`}
                        placeholder="e.g. MERN Full Stack Development"
                        value={desiredCareerPath}
                        onChange={(e) => setDesiredCareerPath(e.target.value)}
                      />
                      {errors.desiredCareerPath && <div className="invalid-feedback small">{errors.desiredCareerPath}</div>}
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold text-dark mb-1">
                        Target Role <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className={`form-control rounded-3 ${errors.targetRole ? 'is-invalid' : ''}`}
                        placeholder="e.g. Junior Software Engineer"
                        value={targetRole}
                        onChange={(e) => setTargetRole(e.target.value)}
                      />
                      {errors.targetRole && <div className="invalid-feedback small">{errors.targetRole}</div>}
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold text-dark mb-1">
                        Learning Goals & Milestones <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className={`form-control rounded-3 ${errors.learningGoals ? 'is-invalid' : ''}`}
                        placeholder="e.g. Master React, Node.js & complete 3 portfolio apps"
                        value={learningGoals}
                        onChange={(e) => setLearningGoals(e.target.value)}
                      />
                      {errors.learningGoals && <div className="invalid-feedback small">{errors.learningGoals}</div>}
                    </div>

                    <div className="col-12">
                      <label className="form-label small fw-semibold text-dark mb-1">
                        Relevant / Transferable Experience <span className="text-muted fw-normal">(Optional)</span>
                      </label>
                      <input
                        type="text"
                        className="form-control rounded-3"
                        placeholder="e.g. 2 years problem-solving in data analysis, agile team collaboration"
                        value={relevantExperience}
                        onChange={(e) => setRelevantExperience(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                {/* --- TECHNICAL SKILLS SECTION (ALL STATUSES) --- */}
                <div className="mt-4 pt-3 border-top">
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <label className="form-label small fw-bold text-dark mb-0">
                      Technical Skills <span className="text-danger">*</span>
                    </label>
                    <span className="small text-secondary">{skills.length} skills selected</span>
                  </div>

                  {/* Pills */}
                  <div className="d-flex flex-wrap gap-2 mb-2.5">
                    {skills.map((skill) => (
                      <span 
                        key={skill} 
                        className="badge bg-light text-dark border px-3 py-2 rounded-3 d-inline-flex align-items-center gap-1.5 shadow-2xs font-monospace small"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skill)}
                          className="btn btn-link p-0 text-secondary hover-text-danger border-0 d-flex align-items-center"
                          aria-label={`Remove ${skill}`}
                        >
                          <X size={13} />
                        </button>
                      </span>
                    ))}
                  </div>

                  {/* Quick-add popular badges */}
                  <div className="d-flex flex-wrap align-items-center gap-1.5 mb-2.5">
                    <span className="text-secondary small me-1">Quick add:</span>
                    {['TypeScript', 'Python', 'Docker', 'MongoDB', 'SQL', 'AWS', 'Next.js'].map((quick) => (
                      !skills.includes(quick) && (
                        <button
                          key={quick}
                          type="button"
                          onClick={() => setSkills([...skills, quick])}
                          className="btn btn-outline-secondary btn-sm py-0.5 px-2 rounded-pill small"
                          style={{ fontSize: '0.78rem' }}
                        >
                          + {quick}
                        </button>
                      )
                    ))}
                  </div>

                  {/* Add skill custom input */}
                  <div className="input-group input-group-sm max-w-sm" style={{ maxWidth: '320px' }}>
                    <input
                      type="text"
                      className={`form-control rounded-start-3 ${errors.skills ? 'is-invalid' : ''}`}
                      placeholder="Type custom skill..."
                      value={newSkillInput}
                      onChange={(e) => setNewSkillInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddSkill();
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleAddSkill}
                      className="btn btn-primary rounded-end-3 px-3 d-flex align-items-center gap-1"
                    >
                      <Plus size={14} />
                      <span>Add</span>
                    </button>
                  </div>
                  {errors.skills && <div className="text-danger small mt-1">{errors.skills}</div>}
                </div>

                {/* --- OPTIONAL PROFESSIONAL LINKS SECTION (FOR EVERY STATUS) --- */}
                <div className="mt-4 pt-3 border-top">
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <Link2 size={16} className="text-primary" />
                    <span className="fw-bold text-dark small">Professional Links (Optional)</span>
                    <span className="text-secondary small">(Can add, edit, or remove anytime in profile)</span>
                  </div>

                  <div className="row g-2.5">
                    <div className="col-12 col-md-4">
                      <label className="form-label small text-secondary mb-1">GitHub Profile URL</label>
                      <input
                        type="url"
                        className={`form-control form-control-sm rounded-3 ${errors.githubUrl ? 'is-invalid' : ''}`}
                        placeholder="https://github.com/username"
                        value={githubUrl}
                        onChange={(e) => {
                          setGithubUrl(e.target.value);
                          if (errors.githubUrl) {
                            setErrors((prev) => { const n = { ...prev }; delete n.githubUrl; return n; });
                          }
                        }}
                      />
                      {errors.githubUrl && <div className="invalid-feedback small">{errors.githubUrl}</div>}
                    </div>

                    <div className="col-12 col-md-4">
                      <label className="form-label small text-secondary mb-1">LinkedIn Profile URL</label>
                      <input
                        type="url"
                        className={`form-control form-control-sm rounded-3 ${errors.linkedinUrl ? 'is-invalid' : ''}`}
                        placeholder="https://linkedin.com/in/username"
                        value={linkedinUrl}
                        onChange={(e) => {
                          setLinkedinUrl(e.target.value);
                          if (errors.linkedinUrl) {
                            setErrors((prev) => { const n = { ...prev }; delete n.linkedinUrl; return n; });
                          }
                        }}
                      />
                      {errors.linkedinUrl && <div className="invalid-feedback small">{errors.linkedinUrl}</div>}
                    </div>

                    <div className="col-12 col-md-4">
                      <label className="form-label small text-secondary mb-1">Portfolio Website URL</label>
                      <input
                        type="url"
                        className={`form-control form-control-sm rounded-3 ${errors.portfolioUrl ? 'is-invalid' : ''}`}
                        placeholder="https://myportfolio.dev"
                        value={portfolioUrl}
                        onChange={(e) => {
                          setPortfolioUrl(e.target.value);
                          if (errors.portfolioUrl) {
                            setErrors((prev) => { const n = { ...prev }; delete n.portfolioUrl; return n; });
                          }
                        }}
                      />
                      {errors.portfolioUrl && <div className="invalid-feedback small">{errors.portfolioUrl}</div>}
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="d-flex justify-content-between align-items-center mt-4 pt-3 border-top">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    disabled={isSubmitting}
                    className="btn btn-outline-secondary rounded-pill px-3.5 py-2 d-inline-flex align-items-center gap-1.5"
                  >
                    <ArrowLeft size={16} />
                    <span>Back</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveStep2}
                    disabled={isSubmitting}
                    className="btn btn-primary rounded-pill px-4 py-2 d-inline-flex align-items-center gap-2 fw-semibold"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                        <span>Saving Profile...</span>
                      </>
                    ) : (
                      <>
                        <span>Save & Continue</span>
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* ---------------- STEP 3: OPTIONAL RESUME ENRICHMENT FLOW ---------------- */}
            {step === 3 && (
              <div>
                {/* --- A. INITIAL PROMPT: Upload or Skip --- */}
                {resumeMode === 'prompt' && (
                  <div className="text-center py-2">
                    <div 
                      className="rounded-circle d-inline-flex align-items-center justify-content-center bg-primary-subtle text-primary mb-3"
                      style={{ width: '64px', height: '64px' }}
                    >
                      <FileText size={32} />
                    </div>

                    <h5 className="fw-bold text-dark fs-5 mb-1">Enrich Your Profile with Resume (Optional)</h5>
                    <p className="text-secondary small max-w-md mx-auto mb-4" style={{ maxWidth: '520px' }}>
                      Upload your resume to automatically extract additional technical skills and project highlights. 
                      You will have complete control to review, edit, or reject any suggestions before saving.
                    </p>

                    <div className="row g-3 max-w-lg mx-auto mb-4 text-start" style={{ maxWidth: '540px' }}>
                      <div className="col-12 col-sm-6">
                        <div 
                          onClick={() => setResumeMode('upload')}
                          className="card h-100 p-3 rounded-4 border-2 border-primary bg-primary-subtle cursor-pointer shadow-xs hover-shadow transition-all"
                          style={{ cursor: 'pointer' }}
                        >
                          <div className="d-flex align-items-center gap-2.5 mb-2">
                            <div className="p-2 bg-primary text-white rounded-3">
                              <Upload size={18} />
                            </div>
                            <span className="fw-bold text-dark small">Upload Resume</span>
                          </div>
                          <p className="text-secondary small mb-0 lh-sm" style={{ fontSize: '0.8rem' }}>
                            PDF, DOCX, or TXT up to 5MB. Zero ATS scoring; purely for skills extraction.
                          </p>
                        </div>
                      </div>

                      <div className="col-12 col-sm-6">
                        <div 
                          onClick={handleCompleteOrSkip}
                          className="card h-100 p-3 rounded-4 border-light-subtle bg-light cursor-pointer hover-border-secondary transition-all"
                          style={{ cursor: 'pointer' }}
                        >
                          <div className="d-flex align-items-center gap-2.5 mb-2">
                            <div className="p-2 bg-secondary text-white rounded-3">
                              <ChevronRight size={18} />
                            </div>
                            <span className="fw-bold text-dark small">Skip for Now</span>
                          </div>
                          <p className="text-secondary small mb-0 lh-sm" style={{ fontSize: '0.8rem' }}>
                            Proceed directly to your personalized dashboard. You can upload anytime in settings.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="d-flex justify-content-between align-items-center pt-3 border-top">
                      <button
                        type="button"
                        onClick={() => setStep(2)}
                        disabled={isSubmitting}
                        className="btn btn-outline-secondary rounded-pill px-3 py-1.5 small d-inline-flex align-items-center gap-1"
                      >
                        <ArrowLeft size={14} />
                        <span>Back to Details</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleCompleteOrSkip}
                        disabled={isSubmitting}
                        className="btn btn-link text-secondary text-decoration-none small"
                      >
                        Skip and Go to Dashboard
                      </button>
                    </div>
                  </div>
                )}

                {/* --- B. UPLOAD INTERFACE --- */}
                {resumeMode === 'upload' && (
                  <div>
                    <div className="d-flex align-items-center justify-content-between mb-3">
                      <div>
                        <h6 className="fw-bold text-dark fs-5 mb-0">Upload Resume for Enrichment</h6>
                        <small className="text-secondary">Supported formats: PDF, DOCX, or TXT (Max size: 5MB)</small>
                      </div>
                      <button
                        type="button"
                        onClick={() => setResumeMode('prompt')}
                        className="btn btn-sm btn-outline-secondary rounded-pill px-3"
                      >
                        Back
                      </button>
                    </div>

                    <form onSubmit={handleUploadResumeFile}>
                      {/* Drag & Drop Card */}
                      {!showPastedInput ? (
                        <div 
                          className="border border-2 border-dashed rounded-4 p-4 text-center bg-light cursor-pointer mb-3 transition-all hover-border-primary"
                          onClick={() => fileInputRef.current?.click()}
                          style={{ cursor: 'pointer' }}
                        >
                          <input 
                            type="file" 
                            ref={fileInputRef}
                            accept=".pdf,.docx,.doc,.txt"
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                setSelectedFile(e.target.files[0]);
                                setApiError(null);
                              }
                            }}
                            className="d-none"
                          />

                          <div className="p-3 bg-white text-primary rounded-circle d-inline-flex mb-2 shadow-2xs">
                            <Upload size={28} />
                          </div>

                          {selectedFile ? (
                            <div>
                              <p className="fw-bold text-dark mb-0">{selectedFile.name}</p>
                              <small className="text-secondary">
                                {(selectedFile.size / 1024).toFixed(1)} KB &bull; Click to choose another file
                              </small>
                            </div>
                          ) : (
                            <div>
                              <p className="fw-bold text-dark mb-1">Click to browse or drag & drop resume here</p>
                              <small className="text-secondary d-block">PDF, DOCX, or plain text document up to 5MB</small>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="mb-3">
                          <label className="form-label small fw-semibold text-dark">Paste Resume Text</label>
                          <textarea
                            className="form-control rounded-3 font-monospace small"
                            rows={6}
                            placeholder="Paste your technical resume text here..."
                            value={pastedResumeText}
                            onChange={(e) => setPastedResumeText(e.target.value)}
                          />
                        </div>
                      )}

                      <div className="d-flex justify-content-between align-items-center mb-4">
                        <button
                          type="button"
                          onClick={() => {
                            setShowPastedInput(!showPastedInput);
                            setSelectedFile(null);
                          }}
                          className="btn btn-link text-primary p-0 small text-decoration-none"
                        >
                          {showPastedInput ? '← Switch to file upload' : 'Or paste resume text directly'}
                        </button>
                        <span className="small text-secondary">
                          <ShieldCheck size={14} className="text-success me-1 d-inline" />
                          Parsed strictly for your profile; never shared.
                        </span>
                      </div>

                      {/* Processing status banner */}
                      {resumeProcessingStatus === 'processing' && (
                        <div className="alert alert-info py-2 px-3 rounded-3 small d-flex align-items-center gap-2 mb-3">
                          <span className="spinner-border spinner-border-sm text-primary" role="status" aria-hidden="true" />
                          <span>Extracting skills and candidate facts...</span>
                        </div>
                      )}

                      <div className="d-flex justify-content-between align-items-center pt-3 border-top">
                        <button
                          type="button"
                          onClick={handleCompleteOrSkip}
                          disabled={isSubmitting}
                          className="btn btn-outline-secondary rounded-pill px-3.5 py-2 small"
                        >
                          Skip for now
                        </button>

                        <button
                          type="submit"
                          disabled={isSubmitting || (!selectedFile && !pastedResumeText.trim())}
                          className="btn btn-primary rounded-pill px-4 py-2 d-inline-flex align-items-center gap-2 fw-semibold"
                        >
                          {isSubmitting ? (
                            <>
                              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                              <span>Processing...</span>
                            </>
                          ) : (
                            <>
                              <span>Extract Facts</span>
                              <ArrowRight size={16} />
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* --- C. REVIEW & CONFLICT RESOLUTION --- */}
                {resumeMode === 'review' && extractedResult && (
                  <div>
                    <div className="d-flex align-items-center justify-content-between mb-3">
                      <div>
                        <h6 className="fw-bold text-dark fs-5 mb-0">Review Resume Suggestions</h6>
                        <small className="text-secondary">Review extracted candidate facts before confirming profile updates.</small>
                      </div>
                      <span className="badge bg-success-subtle text-success border border-success-subtle px-2.5 py-1 rounded-pill">
                        Extracted Successfully
                      </span>
                    </div>

                    {/* 1. New Skills Selection */}
                    <div className="card bg-light border-0 rounded-4 p-3 mb-3">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="fw-bold text-dark small">New Skills Discovered</span>
                        <span className="small text-secondary">{selectedNewSkills.length} selected to add</span>
                      </div>
                      {extractedResult.profileDiff.newSkills.length > 0 ? (
                        <div className="d-flex flex-wrap gap-2 pt-1">
                          {extractedResult.profileDiff.newSkills.map((skill) => {
                            const isChecked = selectedNewSkills.includes(skill);
                            return (
                              <button
                                key={skill}
                                type="button"
                                onClick={() => {
                                  if (isChecked) {
                                    setSelectedNewSkills(selectedNewSkills.filter((s) => s !== skill));
                                  } else {
                                    setSelectedNewSkills([...selectedNewSkills, skill]);
                                  }
                                }}
                                className={`btn btn-sm rounded-pill px-3 py-1 small d-inline-flex align-items-center gap-1.5 transition-all ${
                                  isChecked ? 'btn-primary' : 'btn-outline-secondary bg-white'
                                }`}
                              >
                                {isChecked ? <Check size={13} /> : <Plus size={13} />}
                                <span>{skill}</span>
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="small text-secondary mb-0">No new skills detected beyond your current profile list.</p>
                      )}
                    </div>

                    {/* 2. Conflict: Education */}
                    {extractedResult.profileDiff.education.hasConflict && (
                      <div className="card border rounded-3 p-3 mb-3">
                        <span className="fw-bold text-dark small d-block mb-1">Education Comparison</span>
                        <p className="small text-secondary mb-2">Choose which value to preserve on your profile:</p>
                        <div className="d-flex flex-column gap-2">
                          <label className="d-flex align-items-center gap-2 small cursor-pointer">
                            <input
                              type="radio"
                              name="educationChoice"
                              checked={educationChoice === 'current'}
                              onChange={() => setEducationChoice('current')}
                            />
                            <span>Keep Profile Value: <strong>{extractedResult.profileDiff.education.current}</strong></span>
                          </label>
                          <label className="d-flex align-items-center gap-2 small cursor-pointer">
                            <input
                              type="radio"
                              name="educationChoice"
                              checked={educationChoice === 'resume'}
                              onChange={() => setEducationChoice('resume')}
                            />
                            <span>Update with Resume: <strong>{extractedResult.profileDiff.education.extracted}</strong></span>
                          </label>
                        </div>
                      </div>
                    )}

                    {/* 3. Conflict: Target Role */}
                    {extractedResult.profileDiff.targetRole.hasConflict && (
                      <div className="card border rounded-3 p-3 mb-3">
                        <span className="fw-bold text-dark small d-block mb-1">Target Role Comparison</span>
                        <div className="d-flex flex-column gap-2">
                          <label className="d-flex align-items-center gap-2 small cursor-pointer">
                            <input
                              type="radio"
                              name="roleChoice"
                              checked={roleChoice === 'current'}
                              onChange={() => setRoleChoice('current')}
                            />
                            <span>Keep Profile: <strong>{extractedResult.profileDiff.targetRole.current}</strong></span>
                          </label>
                          <label className="d-flex align-items-center gap-2 small cursor-pointer">
                            <input
                              type="radio"
                              name="roleChoice"
                              checked={roleChoice === 'resume'}
                              onChange={() => setRoleChoice('resume')}
                            />
                            <span>Update with Resume: <strong>{extractedResult.profileDiff.targetRole.extracted}</strong></span>
                          </label>
                        </div>
                      </div>
                    )}

                    {/* 4. Extracted Projects Preview */}
                    {extractedResult.profileDiff.projects && extractedResult.profileDiff.projects.length > 0 && (
                      <div className="card bg-light border-0 rounded-3 p-3 mb-3">
                        <span className="fw-bold text-dark small mb-1.5 d-block">Extracted Projects</span>
                        <ul className="list-unstyled mb-0 small">
                          {extractedResult.profileDiff.projects.slice(0, 2).map((proj: any, idx: number) => (
                            <li key={idx} className="mb-1">
                              <strong>{proj.title}</strong>
                              {proj.description && <span className="text-secondary"> &bull; {proj.description}</span>}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Final Confirmation Buttons */}
                    <div className="d-flex justify-content-between align-items-center pt-3 border-top">
                      <button
                        type="button"
                        onClick={() => setResumeMode('upload')}
                        disabled={isSubmitting}
                        className="btn btn-outline-secondary rounded-pill px-3 py-2 small d-inline-flex align-items-center gap-1.5"
                      >
                        <RotateCcw size={14} />
                        <span>Re-upload</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleConfirmResumeEnrichment}
                        disabled={isSubmitting}
                        className="btn btn-primary rounded-pill px-4 py-2 fw-semibold d-inline-flex align-items-center gap-2 shadow-xs"
                      >
                        {isSubmitting ? (
                          <>
                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                            <span>Confirming & Saving...</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 size={16} />
                            <span>Confirm & Go to Dashboard</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};
