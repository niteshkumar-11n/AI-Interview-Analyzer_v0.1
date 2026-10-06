import React from 'react';
import { ResumeAnalyzerView } from '../../pages/resume/ResumeAnalyzerView.tsx';

interface ResumeAnalyzerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenMockTest?: () => void;
}

export const ResumeAnalyzerModal: React.FC<ResumeAnalyzerModalProps> = ({ 
  isOpen, 
  onClose,
  onOpenMockTest 
}) => {
  if (!isOpen) return null;

  return (
    <div 
      className="modal fade show d-block" 
      style={{ backgroundColor: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(4px)', zIndex: 1050 }} 
      tabIndex={-1}
    >
      <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable" style={{ maxWidth: '1240px' }}>
        <div className="modal-content border-0 shadow-2xl rounded-4 overflow-hidden" style={{ maxHeight: '92vh' }}>
          {/* Top Modal Nav Bar */}
          <div className="modal-header border-bottom px-4 py-3 bg-white d-flex justify-content-between align-items-center sticky-top">
            <div className="d-flex align-items-center gap-2.5">
              <span 
                className="badge rounded-pill fw-semibold px-3 py-1"
                style={{ backgroundColor: '#EFF6FF', color: '#2563EB', border: '1px solid #DBEAFE', fontSize: '0.78rem' }}
              >
                AI Resume Intelligence
              </span>
              <span className="text-secondary small fw-medium d-none d-sm-inline">
                Benchmarked against 10,000+ hired engineers
              </span>
            </div>
            <button 
              type="button" 
              className="btn-close" 
              onClick={onClose} 
              aria-label="Close" 
            />
          </div>

          {/* Modal Body with Full Resume Analyzer Experience */}
          <div className="modal-body p-0 overflow-auto" style={{ backgroundColor: '#F8FAFC' }}>
            <ResumeAnalyzerView onOpenMockTest={onOpenMockTest} />
          </div>

          {/* Footer Bar */}
          <div className="modal-footer border-top bg-white px-4 py-2.5 d-flex justify-content-between align-items-center">
            <span className="text-secondary small" style={{ fontSize: '0.76rem' }}>
              Files are encrypted with AES-256 and processed with privacy-first AI analysis.
            </span>
            <button 
              type="button" 
              className="btn btn-sm btn-outline-secondary rounded-pill px-4 fw-semibold shadow-xs" 
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
