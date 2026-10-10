import React, { useState, useEffect } from 'react';
import { OpenSourceIssue } from '../../types.ts';
import { api, type GitHubIssueRecommendation } from '../../services/api.ts';
import { GitPullRequest, Star, ExternalLink, Sparkles, Loader2, AlertCircle, Search, RefreshCw } from 'lucide-react';

interface OpenSourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  issues: OpenSourceIssue[];
}

export const OpenSourceModal: React.FC<OpenSourceModalProps> = ({
  isOpen,
  onClose,
  issues: staticIssues
}) => {
  const [dynamicIssues, setDynamicIssues] = useState<GitHubIssueRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasAttemptedFetch, setHasAttemptedFetch] = useState(false);

  // Fetch real issues when modal opens
  useEffect(() => {
    if (!isOpen || hasAttemptedFetch) return;

    const fetchIssues = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await api.github.getCustomIssues({
          languages: ['JavaScript', 'TypeScript', 'Python'],
          difficulty: 'good-first-issue',
          perPage: 6,
        });
        if (result.success && result.data?.issues) {
          setDynamicIssues(result.data.issues);
        }
      } catch (err: any) {
        console.warn('Failed to fetch dynamic issues for modal:', err.message);
        setError(err.message);
      } finally {
        setIsLoading(false);
        setHasAttemptedFetch(true);
      }
    };

    fetchIssues();
  }, [isOpen, hasAttemptedFetch]);

  const handleRefresh = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await api.github.getCustomIssues({
        languages: ['JavaScript', 'TypeScript', 'Python'],
        difficulty: 'good-first-issue',
        perPage: 6,
      });
      if (result.success && result.data?.issues) {
        setDynamicIssues(result.data.issues);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  // Use dynamic issues if available, otherwise show loading or static fallback
  const displayIssues = dynamicIssues.length > 0 ? dynamicIssues : [];

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(3px)' }} tabIndex={-1}>
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
          <div className="modal-header border-bottom px-4 py-3 bg-light d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center gap-2.5">
              <div className="p-2 text-white rounded-3" style={{ backgroundColor: '#2563EB' }}>
                <GitPullRequest size={20} />
              </div>
              <div>
                <h5 className="modal-title fw-bold text-dark fs-6 mb-0">Open Source Opportunities</h5>
                <small className="text-secondary">
                  {dynamicIssues.length > 0 
                    ? `${dynamicIssues.length} real issues from GitHub`
                    : 'Finding matching open-source issues...'
                  }
                </small>
              </div>
            </div>
            <div className="d-flex align-items-center gap-2">
              <button 
                type="button" 
                className="btn btn-sm btn-outline-secondary rounded-pill d-flex align-items-center gap-1"
                onClick={handleRefresh}
                disabled={isLoading}
              >
                <RefreshCw size={14} className={isLoading ? 'spin' : ''} />
                Refresh
              </button>
              <button type="button" className="btn-close" onClick={onClose} aria-label="Close"></button>
            </div>
          </div>

          <div className="modal-body p-4">
            {isLoading && displayIssues.length === 0 ? (
              <div className="text-center py-5">
                <Loader2 size={36} className="spin mb-3" style={{ color: '#2563EB' }} />
                <p className="text-secondary">Searching GitHub for matching issues...</p>
              </div>
            ) : error && displayIssues.length === 0 ? (
              <div className="text-center py-5">
                <AlertCircle size={36} className="mb-3" style={{ color: '#F59E0B' }} />
                <p className="text-secondary mb-3">Could not fetch issues: {error}</p>
                <button 
                  type="button" 
                  className="btn btn-primary btn-sm rounded-pill px-4"
                  onClick={handleRefresh}
                >
                  Try Again
                </button>
              </div>
            ) : displayIssues.length > 0 ? (
              <div className="d-flex flex-column gap-3">
                {displayIssues.map((issue) => (
                  <div key={issue.id} className="card p-3 border shadow-xs rounded-3">
                    <div className="d-flex justify-content-between align-items-start gap-2 mb-1">
                      <div>
                        <strong className="text-dark" style={{ fontSize: '0.9rem' }}>{issue.repo}</strong>
                        <span className="text-muted small ms-2">#{issue.issueNumber}</span>
                      </div>
                      <div className="d-flex gap-1">
                        <span 
                          className="badge rounded-pill small" 
                          style={{ backgroundColor: '#DCFCE7', color: '#15803D' }}
                        >
                          {issue.matchScore}% match
                        </span>
                        <span 
                          className="badge rounded-pill small" 
                          style={{ color: '#7C3AED', backgroundColor: '#F3E8FF' }}
                        >
                          {issue.difficulty}
                        </span>
                      </div>
                    </div>
                    <p className="text-dark small mb-2 fw-semibold">{issue.title}</p>
                    {issue.body && (
                      <p className="text-secondary small mb-2" style={{ 
                        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                        fontSize: '0.78rem'
                      }}>
                        {issue.body}
                      </p>
                    )}
                    <div className="d-flex justify-content-between align-items-center">
                      <div className="d-flex align-items-center gap-3 text-secondary small">
                        {issue.labels.slice(0, 3).map((label, idx) => (
                          <span key={idx} className="badge rounded-pill" style={{ backgroundColor: '#EFF6FF', color: '#2563EB', fontSize: '0.68rem' }}>
                            {label}
                          </span>
                        ))}
                      </div>
                      <a
                        href={issue.html_url}
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
            ) : (
              <div className="text-center py-5">
                <Search size={36} className="mb-3" style={{ color: '#94A3B8' }} />
                <p className="text-secondary">No issues found. Try refreshing.</p>
              </div>
            )}
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
