import React from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { 
  Headphones, 
  FileCheck, 
  Edit3, 
  ExternalLink 
} from 'lucide-react';
import { TechnicalInterviewStudio } from '../../components/interview/TechnicalInterviewStudio.tsx';

interface AIInterviewViewProps {
  onOpenUpgradeModal?: () => void;
  onNavigateToProfile?: () => void;
  onOpenCreditModal?: () => void;
  onOpenHistoryModal?: () => void;
  onNavigateToDashboard?: () => void;
}

export const AIInterviewView: React.FC<AIInterviewViewProps> = ({
  onOpenUpgradeModal,
  onNavigateToProfile,
  onOpenCreditModal,
  onOpenHistoryModal,
  onNavigateToDashboard,
}) => {
  const { user, updateProfileState } = useAuth();

  // Candidate context from Profile & Resume
  const candidateName = user?.profile?.name || 'Alex Sharma';
  const targetRole = user?.profile?.targetRole || 'Full Stack Developer';
  const targetCompany = user?.profile?.targetCompany || 'TechCorp Solutions';
  const userProfileJD = user?.profile?.targetJobDescription || 
    'Full Stack Developer role requiring React, Node.js, Express, MongoDB, RESTful APIs, Git, and Docker. Experience with responsive UI design, database optimization, and cloud architecture.';

  // Inline Profile JD Edit Modal
  const [isJdModalOpen, setIsJdModalOpen] = React.useState(false);
  const [editableJdText, setEditableJdText] = React.useState(userProfileJD);

  // Save updated Job Description in Profile
  const handleSaveProfileJd = () => {
    if (user?.profile) {
      updateProfileState({
        ...user.profile,
        targetJobDescription: editableJdText
      });
    }
    setIsJdModalOpen(false);
  };

  return (
    <div className="container-fluid p-3 p-lg-4" style={{ maxWidth: '1440px' }}>
      {/* Top Banner: AI Interview Engine Header */}
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-3">
        <div className="d-flex align-items-center gap-3">
          <div 
            className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0 shadow-xs"
            style={{
              width: '52px',
              height: '52px',
              backgroundColor: '#EFF6FF',
              border: '1px solid #DBEAFE',
              color: '#2563EB'
            }}
          >
            <Headphones size={28} />
          </div>
          <div>
            <div className="d-flex align-items-center gap-2">
              <h1 className="h4 fw-bold text-dark mb-0" style={{ letterSpacing: '-0.02em', color: '#0F172A' }}>
                AI Interview Engine
              </h1>
              <span 
                className="badge rounded-pill fw-semibold px-2 py-0.5" 
                style={{ backgroundColor: '#EFF6FF', color: '#2563EB', border: '1px solid #BFDBFE', fontSize: '0.72rem' }}
              >
                Technical &amp; HR
              </span>
            </div>
            <p className="text-secondary small mb-0" style={{ fontSize: '0.84rem', color: '#64748B' }}>
              Personalized 5-question interviews tailored to your <strong>Resume</strong> &amp; <strong>Profile</strong>. Choose Technical or HR mode.
            </p>
          </div>
        </div>
      </div>

      {/* RESUME & PROFILE JOB DESCRIPTION SYNC BANNER */}
      <div 
        className="card border rounded-3 p-3 mb-4 shadow-2xs"
        style={{
          background: 'linear-gradient(135deg, #F8FAFC 0%, #EFF6FF 100%)',
          borderColor: '#DBEAFE'
        }}
      >
        <div className="d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-3">
          <div className="d-flex align-items-start gap-3">
            <div 
              className="rounded-3 d-flex align-items-center justify-content-center text-white flex-shrink-0 shadow-xs mt-0.5"
              style={{ width: '40px', height: '40px', backgroundColor: '#2563EB' }}
            >
              <FileCheck size={20} />
            </div>
            <div>
              <div className="d-flex flex-wrap align-items-center gap-2 mb-1">
                <span className="fw-bold text-dark" style={{ fontSize: '0.92rem' }}>
                  Resume &amp; Profile Job Description Integration
                </span>
                <span className="badge bg-success-subtle text-success border border-success-subtle rounded-pill px-2 py-0.5" style={{ fontSize: '0.70rem' }}>
                  ✓ Dual Source Active
                </span>
              </div>
              <div className="text-secondary small d-flex flex-wrap align-items-center gap-x-3 gap-y-1" style={{ fontSize: '0.78rem' }}>
                <span><strong>Candidate:</strong> {candidateName}</span>
                <span className="text-muted">•</span>
                <span><strong>Target Role:</strong> {targetRole} @ {targetCompany}</span>
                <span className="text-muted">•</span>
                <span className="text-truncate" style={{ maxWidth: '460px' }}>
                  <strong>Profile JD:</strong> {userProfileJD}
                </span>
              </div>
            </div>
          </div>

          <div className="d-flex align-items-center gap-2 flex-shrink-0">
            <button
              type="button"
              onClick={() => {
                setEditableJdText(userProfileJD);
                setIsJdModalOpen(true);
              }}
              className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1.5 px-3 py-1.5 rounded-2 fw-medium bg-white"
              style={{ fontSize: '0.78rem' }}
            >
              <Edit3 size={14} />
              <span>Edit Target JD</span>
            </button>
            {onNavigateToProfile && (
              <button
                type="button"
                onClick={onNavigateToProfile}
                className="btn btn-sm btn-light border d-flex align-items-center gap-1.5 px-3 py-1.5 rounded-2 fw-medium text-secondary"
                style={{ fontSize: '0.78rem' }}
              >
                <ExternalLink size={13} />
                <span>Open Profile</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* AI SMART INTERVIEW STUDIO (Technical & HR) */}
      <div className="mb-4">
        <TechnicalInterviewStudio
          onOpenCreditModal={onOpenCreditModal || (() => {})}
          onOpenHistoryModal={onOpenHistoryModal || (() => {})}
          onNavigateToDashboard={onNavigateToDashboard}
        />
      </div>

      {/* Inline JD Edit Modal */}
      {isJdModalOpen && (
        <div className="modal d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999 }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 rounded-4 shadow-lg">
              <div className="modal-header border-bottom px-4 py-3">
                <h5 className="modal-title fw-bold" style={{ fontSize: '1rem' }}>
                  ✏️ Edit Target Job Description
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setIsJdModalOpen(false)}
                />
              </div>
              <div className="modal-body p-4">
                <p className="text-secondary small mb-2" style={{ fontSize: '0.82rem' }}>
                  Paste your target Job Description below. AI questions will be personalized to match these requirements.
                </p>
                <textarea
                  className="form-control rounded-3 border"
                  rows={8}
                  value={editableJdText}
                  onChange={(e) => setEditableJdText(e.target.value)}
                  placeholder="Enter your target job description..."
                  style={{ fontSize: '0.88rem', resize: 'vertical' }}
                />
              </div>
              <div className="modal-footer border-top px-4 py-3">
                <button 
                  type="button" 
                  className="btn btn-light border rounded-3 px-4" 
                  onClick={() => setIsJdModalOpen(false)}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary rounded-3 px-4 fw-semibold" 
                  onClick={handleSaveProfileJd}
                >
                  Save Job Description
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
