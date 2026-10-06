import React from 'react';
import { InterviewScore } from '../../types.ts';
import { Award, CheckCircle2, AlertCircle, BarChart3, Clock, Calendar } from 'lucide-react';

interface ScorecardDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  interview: InterviewScore | null;
}

export const ScorecardDetailsModal: React.FC<ScorecardDetailsModalProps> = ({
  isOpen,
  onClose,
  interview
}) => {
  if (!isOpen) return null;

  const score = interview?.score || 82;
  const breakdown = interview?.breakdown || {
    technical: 82,
    problemSolving: 78,
    communication: 85,
    codeQuality: 80
  };

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(3px)' }} tabIndex={-1}>
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
          <div className="modal-header border-bottom px-4 py-3 bg-light d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center gap-2.5">
              <div className="p-2 bg-primary text-white rounded-3">
                <BarChart3 size={20} />
              </div>
              <div>
                <h5 className="modal-title fw-bold text-dark fs-6 mb-0">Interview Evaluation Scorecard</h5>
                <small className="text-secondary">{interview?.title || 'Technical Interview'} &bull; 2 days ago</small>
              </div>
            </div>
            <button type="button" className="btn-close" onClick={onClose} aria-label="Close"></button>
          </div>

          <div className="modal-body p-4">
            {/* Overall Banner */}
            <div className="p-3 rounded-3 bg-light border d-flex justify-content-between align-items-center mb-4">
              <div>
                <span className="text-secondary small fw-medium d-block">Overall Assessment Score</span>
                <h3 className="fw-extrabold text-primary mb-0">{score}%</h3>
                <span className="badge bg-success-subtle text-success border border-success-subtle rounded-pill small mt-1">
                  Cleared Technical Screening
                </span>
              </div>
              <div className="text-end text-secondary small">
                <div>Role: <strong className="text-dark">{interview?.role || 'Full Stack Developer'}</strong></div>
                <div>Duration: <strong className="text-dark">45 Mins</strong></div>
              </div>
            </div>

            {/* 4 Pillars Breakdown */}
            <h6 className="fw-bold text-dark small mb-3">Performance by Evaluation Category</h6>
            <div className="row g-2 mb-4">
              <div className="col-6 col-md-3">
                <div className="card p-2.5 text-center border rounded-3 bg-white shadow-xs">
                  <span className="text-secondary small" style={{ fontSize: '0.75rem' }}>Technical Depth</span>
                  <div className="fw-bold text-dark fs-5">{breakdown.technical}%</div>
                  <div className="progress mt-1" style={{ height: '4px' }}>
                    <div className="progress-bar bg-primary" style={{ width: `${breakdown.technical}%` }} />
                  </div>
                </div>
              </div>
              <div className="col-6 col-md-3">
                <div className="card p-2.5 text-center border rounded-3 bg-white shadow-xs">
                  <span className="text-secondary small" style={{ fontSize: '0.75rem' }}>Problem Solving</span>
                  <div className="fw-bold text-dark fs-5">{breakdown.problemSolving}%</div>
                  <div className="progress mt-1" style={{ height: '4px' }}>
                    <div className="progress-bar bg-info" style={{ width: `${breakdown.problemSolving}%` }} />
                  </div>
                </div>
              </div>
              <div className="col-6 col-md-3">
                <div className="card p-2.5 text-center border rounded-3 bg-white shadow-xs">
                  <span className="text-secondary small" style={{ fontSize: '0.75rem' }}>Communication</span>
                  <div className="fw-bold text-dark fs-5">{breakdown.communication}%</div>
                  <div className="progress mt-1" style={{ height: '4px' }}>
                    <div className="progress-bar bg-success" style={{ width: `${breakdown.communication}%` }} />
                  </div>
                </div>
              </div>
              <div className="col-6 col-md-3">
                <div className="card p-2.5 text-center border rounded-3 bg-white shadow-xs">
                  <span className="text-secondary small" style={{ fontSize: '0.75rem' }}>Code Quality</span>
                  <div className="fw-bold text-dark fs-5">{breakdown.codeQuality}%</div>
                  <div className="progress mt-1" style={{ height: '4px' }}>
                    <div className="progress-bar bg-warning" style={{ width: `${breakdown.codeQuality}%` }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Strengths & Weaknesses */}
            <div className="row g-3">
              <div className="col-md-6">
                <div className="card p-3 border-0 bg-success-subtle rounded-3 h-100">
                  <h6 className="fw-bold text-success small mb-2 d-flex align-items-center gap-1.5">
                    <CheckCircle2 size={16} /> Key Strengths
                  </h6>
                  <ul className="list-unstyled small text-secondary mb-0 d-flex flex-column gap-1.5">
                    <li className="d-flex align-items-center gap-1.5">
                      <span className="text-success">&bull;</span> React component architecture & state isolation
                    </li>
                    <li className="d-flex align-items-center gap-1.5">
                      <span className="text-success">&bull;</span> Clean TypeScript interface contracts
                    </li>
                    <li className="d-flex align-items-center gap-1.5">
                      <span className="text-success">&bull;</span> Articulate explanation of async REST lifecycles
                    </li>
                  </ul>
                </div>
              </div>

              <div className="col-md-6">
                <div className="card p-3 border-0 bg-danger-subtle rounded-3 h-100">
                  <h6 className="fw-bold text-danger small mb-2 d-flex align-items-center gap-1.5">
                    <AlertCircle size={16} /> Points to Refine
                  </h6>
                  <ul className="list-unstyled small text-secondary mb-0 d-flex flex-column gap-1.5">
                    <li className="d-flex align-items-center gap-1.5">
                      <span className="text-danger">&bull;</span> Dynamic Programming memoization state space
                    </li>
                    <li className="d-flex align-items-center gap-1.5">
                      <span className="text-danger">&bull;</span> Distributed caching write-through patterns
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="modal-footer border-top bg-light px-4 py-2.5 d-flex justify-content-end">
            <button type="button" className="btn btn-sm btn-outline-secondary rounded-pill px-3" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
