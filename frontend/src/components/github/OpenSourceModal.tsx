import React from 'react';
import { OpenSourceIssue } from '../../types.ts';
import { GitPullRequest, Star, ExternalLink, Sparkles } from 'lucide-react';

interface OpenSourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  issues: OpenSourceIssue[];
}

export const OpenSourceModal: React.FC<OpenSourceModalProps> = ({
  isOpen,
  onClose,
  issues
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(3px)' }} tabIndex={-1}>
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
          <div className="modal-header border-bottom px-4 py-3 bg-light d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center gap-2.5">
              <div className="p-2 bg-purple text-white rounded-3" style={{ backgroundColor: '#8B5CF6' }}>
                <GitPullRequest size={20} />
              </div>
              <div>
                <h5 className="modal-title fw-bold text-dark fs-6 mb-0">Open Source Opportunities</h5>
                <small className="text-secondary">Curated issues matched with your React, Node.js & Full-Stack skills</small>
              </div>
            </div>
            <button type="button" className="btn-close" onClick={onClose} aria-label="Close"></button>
          </div>

          <div className="modal-body p-4">
            <div className="d-flex flex-column gap-3">
              {issues.map((iss) => (
                <div key={iss.id} className="card p-3 border shadow-xs rounded-3">
                  <div className="d-flex justify-content-between align-items-start gap-2 mb-1">
                    <div>
                      <strong className="text-dark fs-6">{iss.repo}</strong>
                      <span className="text-muted small ms-2">#{iss.issueNumber}</span>
                    </div>
                    <span className="badge bg-purple-subtle text-purple border border-purple-subtle rounded-pill small" style={{ color: '#7C3AED', backgroundColor: '#F3E8FF' }}>
                      {iss.difficulty}
                    </span>
                  </div>
                  <p className="text-secondary small mb-2">{iss.title}</p>
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center gap-3 text-secondary small">
                      <span className="d-flex align-items-center gap-1">
                        <Star size={14} className="text-warning fill-warning" /> {iss.stars.toLocaleString()}
                      </span>
                      <span>{iss.language}</span>
                    </div>
                    <a
                      href={iss.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-sm btn-outline-primary rounded-pill px-3 py-1 d-flex align-items-center gap-1"
                    >
                      <span>View on GitHub</span>
                      <ExternalLink size={13} />
                    </a>
                  </div>
                </div>
              ))}
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
