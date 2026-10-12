import React from 'react';
import {
  Trophy,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Code2,
  Clock,
  Zap,
  RotateCcw,
} from 'lucide-react';
import { CodingAssessmentRecord } from '../../types.ts';

interface CodingScorecardModalProps {
  isOpen: boolean;
  onClose: () => void;
  assessment: CodingAssessmentRecord | null;
  onRetake?: () => void;
}

export const CodingScorecardModal: React.FC<CodingScorecardModalProps> = ({
  isOpen,
  onClose,
  assessment,
  onRetake,
}) => {
  if (!isOpen || !assessment) return null;

  const totalScore = assessment.score ?? assessment.totalScore ?? 0;
  const passed = totalScore >= 60;

  return (
    <div
      className="modal fade show d-block"
      style={{ backgroundColor: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(5px)', zIndex: 1060 }}
      tabIndex={-1}
    >
      <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content border-0 shadow-2xl rounded-4 overflow-hidden">
          {/* Header */}
          <div
            className="modal-header px-4 py-3 border-0 d-flex justify-content-between align-items-center"
            style={{
              background: passed
                ? 'linear-gradient(135deg, #064E3B 0%, #065F46 100%)'
                : 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
              color: '#FFFFFF',
            }}
          >
            <div className="d-flex align-items-center gap-3">
              <div
                className="rounded-3 p-2.5 d-flex align-items-center justify-content-center"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)' }}
              >
                <Trophy size={26} className="text-warning" />
              </div>
              <div>
                <div className="d-flex align-items-center gap-2">
                  <h5 className="modal-title fw-bold mb-0 text-white fs-6">
                    {assessment.title || '4-Tier Coding Assessment Scorecard'}
                  </h5>
                  <span
                    className={`badge rounded-pill ${
                      totalScore >= 80
                        ? 'bg-success text-white'
                        : totalScore >= 60
                        ? 'bg-primary text-white'
                        : 'bg-warning text-dark'
                    }`}
                  >
                    {totalScore >= 80 ? 'Mastery Level' : totalScore >= 60 ? 'Proficient' : 'Needs Practice'}
                  </span>
                </div>
                <small className="text-white-50">
                  Completed on {assessment.date || 'Recent'} &bull; 100 Marks Maximum Scale
                </small>
              </div>
            </div>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
              aria-label="Close"
            ></button>
          </div>

          <div className="modal-body p-4 bg-light">
            {/* Top Score Banner */}
            <div className="row g-3 mb-4">
              <div className="col-12 col-lg-4">
                <div className="card h-100 p-4 border-0 rounded-3 shadow-xs bg-white text-center d-flex flex-column justify-content-center align-items-center">
                  <span className="text-secondary small fw-semibold text-uppercase tracking-wider mb-1">
                    Overall Assessment Score
                  </span>
                  <div className="d-flex align-items-baseline gap-1 my-1">
                    <span
                      className="fw-black"
                      style={{
                        fontSize: '3.2rem',
                        lineHeight: 1,
                        color: totalScore >= 80 ? '#10B981' : totalScore >= 60 ? '#2563EB' : '#F59E0B',
                      }}
                    >
                      {totalScore}
                    </span>
                    <span className="text-secondary fw-bold" style={{ fontSize: '1.2rem' }}>
                      / 100
                    </span>
                  </div>
                  <div className="progress w-100 mt-2" style={{ height: '8px' }}>
                    <div
                      className={`progress-bar ${
                        totalScore >= 80 ? 'bg-success' : totalScore >= 60 ? 'bg-primary' : 'bg-warning'
                      }`}
                      style={{ width: `${totalScore}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* 4-Tier Breakdown Cards */}
              <div className="col-12 col-lg-8">
                <div className="row g-2 h-100">
                  {/* Tier 1: Easy */}
                  <div className="col-6 col-sm-3">
                    <div className="card p-3 h-100 border-0 rounded-3 shadow-xs bg-white text-center">
                      <span className="badge bg-success-subtle text-success border border-success-subtle mb-2 small">
                        Tier 1: Easy
                      </span>
                      <div className="fw-bold text-dark fs-5">
                        {assessment.easyScore ?? 0} <span className="small text-secondary fw-normal">/ 10</span>
                      </div>
                      <small className="text-secondary mt-1">Foundation</small>
                    </div>
                  </div>

                  {/* Tier 2: Medium */}
                  <div className="col-6 col-sm-3">
                    <div className="card p-3 h-100 border-0 rounded-3 shadow-xs bg-white text-center">
                      <span className="badge bg-primary-subtle text-primary border border-primary-subtle mb-2 small">
                        Tier 2: Medium
                      </span>
                      <div className="fw-bold text-dark fs-5">
                        {assessment.mediumScore ?? 0} <span className="small text-secondary fw-normal">/ 20</span>
                      </div>
                      <small className="text-secondary mt-1">Algorithmic</small>
                    </div>
                  </div>

                  {/* Tier 3: Medium-Hard */}
                  <div className="col-6 col-sm-3">
                    <div className="card p-3 h-100 border-0 rounded-3 shadow-xs bg-white text-center">
                      <span className="badge bg-warning-subtle text-warning border border-warning-subtle mb-2 small">
                        Tier 3: Med-Hard
                      </span>
                      <div className="fw-bold text-dark fs-5">
                        {assessment.mediumHardScore ?? 0} <span className="small text-secondary fw-normal">/ 30</span>
                      </div>
                      <small className="text-secondary mt-1">Complex DP/Graphs</small>
                    </div>
                  </div>

                  {/* Tier 4: Star Challenge */}
                  <div className="col-6 col-sm-3">
                    <div className="card p-3 h-100 border-0 rounded-3 shadow-xs bg-white text-center">
                      <span className="badge bg-purple-subtle text-purple border border-purple-subtle mb-2 small" style={{ backgroundColor: '#F3E8FF', color: '#7C3AED' }}>
                        ⭐ Star Challenge
                      </span>
                      <div className="fw-bold text-dark fs-5">
                        {assessment.starChallengeScore ?? 0} <span className="small text-secondary fw-normal">/ 40</span>
                      </div>
                      <small className="text-secondary mt-1">Advanced Depth</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Summary / Feedback */}
            {assessment.overallFeedback && (
              <div className="card p-3 bg-white border rounded-3 mb-4 shadow-2xs">
                <div className="d-flex align-items-center gap-2 mb-2">
                  <Sparkles size={17} className="text-primary" />
                  <h6 className="fw-bold mb-0 text-dark small">AI Performance Evaluation &amp; Analysis</h6>
                </div>
                <p className="text-secondary small mb-0 lh-base">{assessment.overallFeedback}</p>
              </div>
            )}

            {/* Questions Detailed Breakdown */}
            <h6 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
              <Code2 size={18} className="text-primary" />
              <span>Question-by-Question Detailed Results</span>
            </h6>

            {assessment.questions && assessment.questions.length > 0 ? (
              <div className="d-flex flex-column gap-3">
                {assessment.questions.map((q: any, idx: number) => {
                  const qMarks = q.marks || (idx === 0 ? 10 : idx === 1 ? 20 : idx === 2 ? 30 : 40);
                  const qScore = q.score ?? 0;
                  const ratio = qMarks > 0 ? qScore / qMarks : 0;

                  return (
                    <div key={q.questionId || idx} className="card bg-white border rounded-3 p-3 shadow-2xs">
                      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2 pb-2.5 border-bottom">
                        <div>
                          <div className="d-flex align-items-center gap-2">
                            <span className="badge bg-dark rounded-pill small">Q{idx + 1}</span>
                            <span className="fw-bold text-dark">{q.title}</span>
                            <span className="badge bg-light text-secondary border small">
                              {q.difficulty}
                            </span>
                          </div>
                        </div>
                        <div className="d-flex align-items-center gap-3">
                          <div className="text-end">
                            <div className="fw-bold text-dark">
                              {qScore} / {qMarks} marks
                            </div>
                            <small className="text-secondary">
                              {q.passedTests ?? 0} of {q.totalTests ?? 0} tests passed
                            </small>
                          </div>
                          <span
                            className={`badge px-2.5 py-1.5 rounded-pill small ${
                              ratio >= 0.9
                                ? 'bg-success text-white'
                                : ratio > 0
                                ? 'bg-warning text-dark'
                                : 'bg-danger text-white'
                            }`}
                          >
                            {ratio >= 0.9 ? 'Passed' : ratio > 0 ? 'Partial' : 'Failed'}
                          </span>
                        </div>
                      </div>

                      {/* AI Code Review */}
                      {q.aiReview && (
                        <div className="mt-3 p-2.5 bg-light rounded-2 border">
                          <div className="d-flex align-items-center justify-content-between mb-1.5">
                            <span className="small fw-bold text-dark d-flex align-items-center gap-1.5">
                              <Sparkles size={13} className="text-primary" />
                              <span>AI Code Review</span>
                            </span>
                            {(q.aiReview.timeComplexity || q.aiReview.spaceComplexity) && (
                              <span className="font-monospace small text-secondary">
                                Time: {q.aiReview.timeComplexity || 'O(N)'} | Space: {q.aiReview.spaceComplexity || 'O(1)'}
                              </span>
                            )}
                          </div>
                          <p className="small text-secondary mb-2">{q.aiReview.feedback}</p>

                          {q.aiReview.improvements?.length > 0 && (
                            <div className="small text-secondary">
                              <strong className="text-dark">Key Improvement: </strong>
                              {q.aiReview.improvements[0]}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-4 text-secondary small bg-white rounded-3 border">
                Question details not recorded for this session.
              </div>
            )}
          </div>

          <div className="modal-footer px-4 py-3 bg-white border-top d-flex justify-content-between align-items-center">
            <button type="button" className="btn btn-sm btn-outline-secondary rounded-pill px-3" onClick={onClose}>
              Close Scorecard
            </button>
            {onRetake && (
              <button
                type="button"
                className="btn btn-sm btn-primary rounded-pill px-4 fw-bold d-flex align-items-center gap-2"
                onClick={() => {
                  onClose();
                  onRetake();
                }}
              >
                <RotateCcw size={14} />
                <span>Retake Assessment</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
