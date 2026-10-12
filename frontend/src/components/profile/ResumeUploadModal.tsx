import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { api } from '../../services/api.ts';
import { 
  FileText, 
  Upload, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  Check, 
  RotateCcw, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

interface ResumeUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedRecord: any) => void;
}

export const ResumeUploadModal: React.FC<ResumeUploadModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { user, updateProfileState } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [mode, setMode] = useState<'upload' | 'review'>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pastedText, setPastedText] = useState('');
  const [showPasted, setShowPasted] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Extracted Results State
  const [extractedData, setExtractedData] = useState<any>(null);
  const [selectedNewSkills, setSelectedNewSkills] = useState<string[]>([]);
  const [educationChoice, setEducationChoice] = useState<'current' | 'resume'>('current');
  const [experienceChoice, setExperienceChoice] = useState<'current' | 'resume'>('current');
  const [roleChoice, setRoleChoice] = useState<'current' | 'resume'>('current');

  if (!isOpen) return null;

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!selectedFile && !pastedText.trim()) {
      setErrorMessage('Please choose a file or paste resume text.');
      return;
    }

    setIsSubmitting(true);
    try {
      let response;
      if (selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        response = await api.resume.upload(formData);
      } else {
        response = await api.resume.upload({
          resumeText: pastedText.trim(),
          fileName: 'pasted_resume.txt'
        });
      }

      if (response.success && response.data) {
        setExtractedData(response.data);
        setSelectedNewSkills(response.data.profileDiff?.newSkills || []);
        setEducationChoice('current');
        setExperienceChoice('current');
        setRoleChoice('current');
        setMode('review');
      } else {
        throw new Error(response.message || 'Failed to extract facts from resume.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to upload and parse resume.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirm = async () => {
    if (!extractedData) return;
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const diff = extractedData.profileDiff;
      const currentSkills = (user?.profile?.skills || []).map((s) => s.name);
      const approvedSkills = Array.from(new Set([...currentSkills, ...selectedNewSkills]));

      const finalEducation =
        educationChoice === 'resume' && diff.education?.extracted
          ? diff.education.extracted
          : user?.profile?.education;

      const finalExperience =
        experienceChoice === 'resume' && diff.experience?.extracted
          ? diff.experience.extracted
          : user?.profile?.yearsOfExperience;

      const finalTargetRole =
        roleChoice === 'resume' && diff.targetRole?.extracted
          ? diff.targetRole.extracted
          : user?.profile?.targetRole;

      const response = await api.resume.confirm({
        resumeId: extractedData.resumeId,
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
      }

      onSuccess(response.data?.updatedResume);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to confirm resume facts.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className="modal fade show d-block" 
      style={{ backgroundColor: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(4px)', zIndex: 1060 }}
      tabIndex={-1}
    >
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content border-0 shadow-2xl rounded-4 overflow-hidden bg-white">
          <div className="modal-header border-bottom px-4 py-3 bg-light d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center gap-2">
              <div className="p-2 bg-primary text-white rounded-3">
                <FileText size={18} />
              </div>
              <h5 className="modal-title fw-bold text-dark fs-6 mb-0">
                {mode === 'upload' ? 'Upload / Replace Resume' : 'Review Extracted Resume Facts'}
              </h5>
            </div>
            <button type="button" className="btn-close" onClick={onClose} aria-label="Close" />
          </div>

          <div className="modal-body p-4" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
            {errorMessage && (
              <div className="alert alert-danger py-2 px-3 rounded-3 small d-flex align-items-center gap-2 mb-3">
                <AlertCircle size={16} className="flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {mode === 'upload' ? (
              <form onSubmit={handleUpload}>
                {!showPasted ? (
                  <div 
                    className="border border-2 border-dashed rounded-4 p-4 text-center bg-light cursor-pointer mb-3 hover-border-primary"
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
                          setErrorMessage(null);
                        }
                      }}
                      className="d-none"
                    />

                    <div className="p-3 bg-white text-primary rounded-circle d-inline-flex mb-2 shadow-2xs">
                      <Upload size={24} />
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
                        <p className="fw-bold text-dark mb-1">Click to select resume document</p>
                        <small className="text-secondary d-block">Supports PDF, DOCX, and TXT files up to 5MB</small>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-dark">Paste Resume Text</label>
                    <textarea 
                      className="form-control rounded-3 font-monospace small"
                      rows={6}
                      placeholder="Paste resume content here..."
                      value={pastedText}
                      onChange={(e) => setPastedText(e.target.value)}
                    />
                  </div>
                )}

                <div className="d-flex justify-content-between align-items-center mb-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowPasted(!showPasted);
                      setSelectedFile(null);
                    }}
                    className="btn btn-link text-primary p-0 small text-decoration-none"
                  >
                    {showPasted ? '← Switch to file upload' : 'Or paste resume text directly'}
                  </button>
                  <span className="small text-secondary">
                    <ShieldCheck size={14} className="text-success me-1 d-inline" />
                    Zero ATS scoring. Used purely for skills extraction.
                  </span>
                </div>

                <div className="d-flex justify-content-end gap-2 pt-2 border-top">
                  <button type="button" onClick={onClose} className="btn btn-light rounded-pill px-3 py-1.5 small border">
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || (!selectedFile && !pastedText.trim())}
                    className="btn btn-primary rounded-pill px-4 py-1.5 small fw-semibold d-inline-flex align-items-center gap-1.5"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                        <span>Extracting...</span>
                      </>
                    ) : (
                      <>
                        <span>Extract Facts</span>
                        <ArrowRight size={14} />
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <div>
                <div className="alert alert-success py-2 px-3 rounded-3 small mb-3">
                  Document parsed. Review the detected facts and resolve any conflicts below:
                </div>

                {/* New skills */}
                <div className="card bg-light border-0 rounded-3 p-3 mb-3">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="fw-bold text-dark small">New Skills Discovered</span>
                    <span className="small text-secondary">{selectedNewSkills.length} selected</span>
                  </div>
                  {extractedData?.profileDiff?.newSkills?.length > 0 ? (
                    <div className="d-flex flex-wrap gap-1.5">
                      {extractedData.profileDiff.newSkills.map((skill: string) => {
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
                            className={`btn btn-sm rounded-pill px-2.5 py-0.5 small d-inline-flex align-items-center gap-1 ${
                              isChecked ? 'btn-primary' : 'btn-outline-secondary bg-white'
                            }`}
                            style={{ fontSize: '0.8rem' }}
                          >
                            {isChecked ? <Check size={12} /> : <Plus size={12} />}
                            <span>{skill}</span>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="small text-secondary mb-0">No new skills detected beyond your current profile list.</p>
                  )}
                </div>

                {/* Conflict: Education */}
                {extractedData?.profileDiff?.education?.hasConflict && (
                  <div className="card border rounded-3 p-3 mb-3">
                    <span className="fw-bold text-dark small d-block mb-1">Education Comparison</span>
                    <div className="d-flex flex-column gap-2">
                      <label className="d-flex align-items-center gap-2 small cursor-pointer">
                        <input 
                          type="radio" 
                          name="pEdu" 
                          checked={educationChoice === 'current'}
                          onChange={() => setEducationChoice('current')}
                        />
                        <span>Keep Profile: <strong>{extractedData.profileDiff.education.current}</strong></span>
                      </label>
                      <label className="d-flex align-items-center gap-2 small cursor-pointer">
                        <input 
                          type="radio" 
                          name="pEdu" 
                          checked={educationChoice === 'resume'}
                          onChange={() => setEducationChoice('resume')}
                        />
                        <span>Update with Resume: <strong>{extractedData.profileDiff.education.extracted}</strong></span>
                      </label>
                    </div>
                  </div>
                )}

                {/* Conflict: Experience */}
                {extractedData?.profileDiff?.experience?.hasConflict && (
                  <div className="card border rounded-3 p-3 mb-3">
                    <span className="fw-bold text-dark small d-block mb-1">Experience Comparison</span>
                    <div className="d-flex flex-column gap-2">
                      <label className="d-flex align-items-center gap-2 small cursor-pointer">
                        <input 
                          type="radio" 
                          name="pExp" 
                          checked={experienceChoice === 'current'}
                          onChange={() => setExperienceChoice('current')}
                        />
                        <span>Keep Profile: <strong>{extractedData.profileDiff.experience.current}</strong></span>
                      </label>
                      <label className="d-flex align-items-center gap-2 small cursor-pointer">
                        <input 
                          type="radio" 
                          name="pExp" 
                          checked={experienceChoice === 'resume'}
                          onChange={() => setExperienceChoice('resume')}
                        />
                        <span>Update with Resume: <strong>{extractedData.profileDiff.experience.extracted}</strong></span>
                      </label>
                    </div>
                  </div>
                )}

                <div className="d-flex justify-content-between align-items-center pt-2 border-top">
                  <button
                    type="button"
                    onClick={() => setMode('upload')}
                    disabled={isSubmitting}
                    className="btn btn-outline-secondary rounded-pill px-3 py-1.5 small d-inline-flex align-items-center gap-1"
                  >
                    <RotateCcw size={13} />
                    <span>Re-upload</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleConfirm}
                    disabled={isSubmitting}
                    className="btn btn-primary rounded-pill px-4 py-1.5 small fw-semibold d-inline-flex align-items-center gap-1.5"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                        <span>Confirming...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={15} />
                        <span>Confirm & Merge</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
