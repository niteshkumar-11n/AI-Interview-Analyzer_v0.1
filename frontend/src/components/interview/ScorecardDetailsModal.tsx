import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.ts';
import { TechnicalInterviewReport } from '../../types.ts';
import { 
  Award, 
  CheckCircle2, 
  AlertCircle, 
  BarChart3, 
  Clock, 
  Calendar,
  Download,
  ChevronDown,
  ChevronUp,
  FileText,
  User,
  Sparkles,
  HelpCircle,
  TrendingUp
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ScorecardDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  interview: any | null;
  interviewId?: string | null;
}

export const ScorecardDetailsModal: React.FC<ScorecardDetailsModalProps> = ({
  isOpen,
  onClose,
  interview,
  interviewId
}) => {
  const [report, setReport] = useState<TechnicalInterviewReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(0);

  const activeId = interviewId || interview?.id;

  useEffect(() => {
    if (!isOpen) {
      setReport(null);
      return;
    }

    if (activeId && (!interview?.questionWiseScore || interview.questionWiseScore.length === 0)) {
      setLoading(true);
      api.interview.getReport(activeId)
        .then((res) => {
          if (res.success && res.data) {
            setReport(res.data);
          }
        })
        .catch((err) => {
          console.warn('[ScorecardModal] Failed to fetch full report:', err);
        })
        .finally(() => {
          setLoading(false);
        });
    } else if (interview?.questionWiseScore) {
      setReport(interview as TechnicalInterviewReport);
    }
  }, [isOpen, activeId]);

  if (!isOpen) return null;

  // Resolve fields from report or passed interview
  const rawScore = report?.finalScore ?? interview?.rawScore ?? (interview?.score ? interview.score / 10 : 8.2);
  const finalScore100 = report?.scoreOutOf100 ?? interview?.score ?? Math.round(rawScore * 10);
  const roleName = report?.role || interview?.role || interview?.title?.replace(/\s*\((Technical|HR)\).*/i, '') || 'Full Stack Engineer';
  const mode = report?.mode || interview?.mode || (interview?.title?.includes('HR') ? 'HR' : 'Technical');
  const dateStr = report?.createdAt 
    ? new Date(report.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    : (interview?.date || 'Recent');

  const technical = report ? Math.round(report.correctness * 10) : (interview?.technical || 82);
  const communication = report ? Math.round(report.communication * 10) : (interview?.communication || 85);
  const problemSolving = report ? Math.round(report.confidence * 10) : (interview?.problemSolving || 80);
  const codeQuality = report ? Math.round(report.correctness * 10) : (interview?.codeQuality || 80);

  const questions = report?.questionWiseScore || [];

  // Export PDF Report
  const handleDownloadPdf = () => {
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 18;
    const contentWidth = pageWidth - margin * 2;
    let y = 22;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(37, 99, 235);
    doc.text(`SkillNexus AI — ${mode} Interview Scorecard`, pageWidth / 2, y, { align: 'center' });
    y += 7;

    doc.setDrawColor(226, 232, 240);
    doc.line(margin, y, pageWidth - margin, y);
    y += 10;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(`Role: ${roleName}`, margin, y);
    doc.text(`Type: ${mode} Interview`, margin + 60, y);
    doc.text(`Date: ${dateStr}`, pageWidth - margin - 35, y);
    y += 10;

    // Score Banner
    doc.setFillColor(239, 246, 255);
    doc.roundedRect(margin, y, contentWidth, 20, 3, 3, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.setTextColor(30, 64, 175);
    doc.text(`Overall Score: ${finalScore100} / 100`, pageWidth / 2, y + 13, { align: 'center' });
    y += 28;

    // Pillars
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(margin, y, contentWidth, 18, 3, 3, 'F');
    doc.setFontSize(9.5);
    doc.setTextColor(15, 23, 42);
    doc.text(`Technical / Correctness: ${technical}%`, margin + 8, y + 11);
    doc.text(`Communication: ${communication}%`, margin + 68, y + 11);
    doc.text(`Confidence / Delivery: ${problemSolving}%`, margin + 120, y + 11);
    y += 26;

    if (questions.length > 0) {
      autoTable(doc, {
        startY: y,
        margin: { left: margin, right: margin },
        head: [['#', 'Question', 'Score', 'Feedback']],
        body: questions.map((q, i) => [
          `${i + 1}`,
          q.question,
          `${Math.round(q.score * 10)}%`,
          q.feedback || 'Evaluated'
        ]),
        styles: { fontSize: 8.5, cellPadding: 3.5, valign: 'top' },
        headStyles: { fillColor: [37, 99, 235], textColor: 255, halign: 'center' },
        columnStyles: {
          0: { cellWidth: 10, halign: 'center' },
          1: { cellWidth: 70 },
          2: { cellWidth: 18, halign: 'center' },
          3: { cellWidth: 'auto' }
        }
      });
    }

    doc.save(`SkillNexus_${mode}_Scorecard_${Date.now()}.pdf`);
  };

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)' }} tabIndex={-1}>
      <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable" style={{ maxWidth: '840px' }}>
        <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
          {/* Header */}
          <div className="modal-header border-bottom px-4 py-3 bg-light d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center gap-2.5">
              <div 
                className="p-2 text-white rounded-3 d-flex align-items-center justify-content-center shadow-xs"
                style={{ backgroundColor: mode === 'HR' ? '#7C3AED' : '#2563EB' }}
              >
                <BarChart3 size={20} />
              </div>
              <div>
                <div className="d-flex align-items-center gap-2">
                  <h5 className="modal-title fw-bold text-dark fs-6 mb-0">Interview Evaluation Scorecard</h5>
                  <span 
                    className="badge rounded-pill fw-semibold px-2 py-0.5"
                    style={{
                      backgroundColor: mode === 'HR' ? '#F3E8FF' : '#EFF6FF',
                      color: mode === 'HR' ? '#7C3AED' : '#2563EB',
                      border: `1px solid ${mode === 'HR' ? '#DDD6FE' : '#BFDBFE'}`,
                      fontSize: '0.72rem'
                    }}
                  >
                    {mode} Interview
                  </span>
                </div>
                <small className="text-secondary">{roleName} &bull; {dateStr}</small>
              </div>
            </div>
            <button type="button" className="btn-close" onClick={onClose} aria-label="Close"></button>
          </div>

          {/* Modal Body */}
          <div className="modal-body p-4" style={{ maxHeight: 'calc(85vh - 120px)' }}>
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary mb-2" role="status">
                  <span className="visually-hidden">Loading detailed scorecard...</span>
                </div>
                <p className="text-secondary small fw-medium">Loading question evaluations...</p>
              </div>
            ) : (
              <>
                {/* Overall Score Banner */}
                <div 
                  className="p-3.5 rounded-3 border d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-4 shadow-2xs"
                  style={{
                    background: mode === 'HR' 
                      ? 'linear-gradient(135deg, #FAF5FF 0%, #F3E8FF 100%)' 
                      : 'linear-gradient(135deg, #F8FAFC 0%, #EFF6FF 100%)',
                    borderColor: mode === 'HR' ? '#E9D5FF' : '#DBEAFE'
                  }}
                >
                  <div>
                    <span className="text-secondary small fw-semibold text-uppercase tracking-wider d-block" style={{ fontSize: '0.72rem' }}>
                      Overall Performance Score
                    </span>
                    <div className="d-flex align-items-baseline gap-2 mt-0.5">
                      <h2 className="fw-black mb-0" style={{ color: mode === 'HR' ? '#6D28D9' : '#1D4ED8', fontSize: '2.4rem' }}>
                        {finalScore100}
                      </h2>
                      <span className="text-secondary fw-semibold" style={{ fontSize: '1rem' }}>/ 100</span>
                      <span 
                        className={`badge rounded-pill ms-2 px-2.5 py-1 fw-bold ${
                          finalScore100 >= 80 ? 'bg-success text-white' : finalScore100 >= 65 ? 'bg-warning text-dark' : 'bg-secondary text-white'
                        }`}
                        style={{ fontSize: '0.75rem' }}
                      >
                        {finalScore100 >= 80 ? 'Excellent' : finalScore100 >= 65 ? 'Proficient' : 'Needs Practice'}
                      </span>
                    </div>
                  </div>

                  <div className="text-sm-end text-secondary small d-flex flex-column gap-1">
                    <div>Target Role: <strong className="text-dark">{roleName}</strong></div>
                    <div>Interview Type: <strong className="text-dark">{mode}</strong></div>
                    <div>Questions: <strong className="text-dark">{questions.length || 5} Questions</strong></div>
                  </div>
                </div>

                {/* 4 Pillars Breakdown */}
                <h6 className="fw-bold text-dark small mb-2.5 d-flex align-items-center gap-1.5">
                  <TrendingUp size={15} className="text-primary" /> Evaluation Pillars
                </h6>
                <div className="row g-2 mb-4">
                  <div className="col-6 col-md-3">
                    <div className="card p-2.5 text-center border rounded-3 bg-white shadow-xs">
                      <span className="text-secondary small" style={{ fontSize: '0.75rem' }}>
                        {mode === 'HR' ? 'Behavioral Match' : 'Technical Depth'}
                      </span>
                      <div className="fw-bold text-dark fs-5 mt-0.5">{technical}%</div>
                      <div className="progress mt-1.5" style={{ height: '4px' }}>
                        <div className="progress-bar bg-primary" style={{ width: `${technical}%` }} />
                      </div>
                    </div>
                  </div>
                  <div className="col-6 col-md-3">
                    <div className="card p-2.5 text-center border rounded-3 bg-white shadow-xs">
                      <span className="text-secondary small" style={{ fontSize: '0.75rem' }}>Problem Solving</span>
                      <div className="fw-bold text-dark fs-5 mt-0.5">{problemSolving}%</div>
                      <div className="progress mt-1.5" style={{ height: '4px' }}>
                        <div className="progress-bar bg-info" style={{ width: `${problemSolving}%` }} />
                      </div>
                    </div>
                  </div>
                  <div className="col-6 col-md-3">
                    <div className="card p-2.5 text-center border rounded-3 bg-white shadow-xs">
                      <span className="text-secondary small" style={{ fontSize: '0.75rem' }}>Communication</span>
                      <div className="fw-bold text-dark fs-5 mt-0.5">{communication}%</div>
                      <div className="progress mt-1.5" style={{ height: '4px' }}>
                        <div className="progress-bar bg-success" style={{ width: `${communication}%` }} />
                      </div>
                    </div>
                  </div>
                  <div className="col-6 col-md-3">
                    <div className="card p-2.5 text-center border rounded-3 bg-white shadow-xs">
                      <span className="text-secondary small" style={{ fontSize: '0.75rem' }}>
                        {mode === 'HR' ? 'Professionalism' : 'Code & Concepts'}
                      </span>
                      <div className="fw-bold text-dark fs-5 mt-0.5">{codeQuality}%</div>
                      <div className="progress mt-1.5" style={{ height: '4px' }}>
                        <div className="progress-bar bg-warning" style={{ width: `${codeQuality}%` }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Individual Question Evaluations */}
                {questions.length > 0 && (
                  <div className="mb-4">
                    <div className="d-flex align-items-center justify-content-between mb-2.5">
                      <h6 className="fw-bold text-dark small mb-0 d-flex align-items-center gap-1.5">
                        <FileText size={15} className="text-primary" /> Individual Question Evaluations ({questions.length})
                      </h6>
                      <span className="text-secondary small" style={{ fontSize: '0.75rem' }}>Click question to expand</span>
                    </div>

                    <div className="d-flex flex-column gap-2.5">
                      {questions.map((q, idx) => {
                        const isExpanded = expandedQuestion === idx;
                        const qScore100 = Math.round((q.score || 0) * 10);
                        return (
                          <div 
                            key={idx} 
                            className="border rounded-3 bg-white overflow-hidden shadow-2xs transition-all"
                            style={{ borderColor: isExpanded ? '#93C5FD' : '#E2E8F0' }}
                          >
                            <div 
                              className="p-3 d-flex align-items-center justify-content-between gap-3 cursor-pointer"
                              style={{ backgroundColor: isExpanded ? '#F8FAFC' : '#FFFFFF', cursor: 'pointer' }}
                              onClick={() => setExpandedQuestion(isExpanded ? null : idx)}
                            >
                              <div className="d-flex align-items-start gap-2.5 text-truncate">
                                <span 
                                  className="badge rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 mt-0.5"
                                  style={{
                                    width: '24px',
                                    height: '24px',
                                    backgroundColor: mode === 'HR' ? '#F3E8FF' : '#EFF6FF',
                                    color: mode === 'HR' ? '#7C3AED' : '#2563EB',
                                    fontWeight: 'bold',
                                    fontSize: '0.75rem'
                                  }}
                                >
                                  {idx + 1}
                                </span>
                                <div className="text-truncate">
                                  <div className="fw-semibold text-dark text-truncate" style={{ fontSize: '0.85rem' }}>
                                    {q.question}
                                  </div>
                                  <div className="text-secondary small mt-0.5" style={{ fontSize: '0.72rem' }}>
                                    Difficulty: <strong className="text-capitalize">{q.difficulty || 'medium'}</strong>
                                    {q.timeTaken ? ` • Time: ${q.timeTaken}s` : ''}
                                  </div>
                                </div>
                              </div>

                              <div className="d-flex align-items-center gap-2 flex-shrink-0">
                                <span 
                                  className={`badge rounded-pill fw-bold px-2 py-0.5 ${
                                    qScore100 >= 80 ? 'bg-success-subtle text-success border border-success-subtle' :
                                    qScore100 >= 60 ? 'bg-warning-subtle text-warning-emphasis border border-warning-subtle' :
                                    'bg-danger-subtle text-danger border border-danger-subtle'
                                  }`}
                                  style={{ fontSize: '0.78rem' }}
                                >
                                  {qScore100}%
                                </span>
                                {isExpanded ? <ChevronUp size={16} className="text-muted" /> : <ChevronDown size={16} className="text-muted" />}
                              </div>
                            </div>

                            {isExpanded && (
                              <div className="p-3 border-top bg-light-subtle" style={{ fontSize: '0.82rem' }}>
                                {/* Candidate Answer */}
                                <div className="mb-2.5">
                                  <span className="fw-bold text-secondary small d-block mb-1" style={{ fontSize: '0.72rem' }}>Candidate Answer:</span>
                                  <div className="p-2.5 rounded-2 bg-white border text-dark" style={{ whiteSpace: 'pre-wrap', lineHeight: '1.45' }}>
                                    {q.answer ? q.answer : <em className="text-muted">No response submitted.</em>}
                                  </div>
                                </div>

                                {/* AI Feedback */}
                                <div className="mb-2.5">
                                  <span className="fw-bold text-primary small d-flex align-items-center gap-1 mb-1" style={{ fontSize: '0.74rem' }}>
                                    <Sparkles size={13} /> AI Feedback &amp; Evaluation:
                                  </span>
                                  <div className="p-2 rounded-2 bg-primary-subtle border border-primary-subtle text-primary-emphasis">
                                    {q.feedback || 'Answer recorded and analyzed against rubric.'}
                                  </div>
                                </div>

                                {/* Strengths and Missing Concepts */}
                                <div className="row g-2">
                                  {q.strengths && q.strengths.length > 0 && (
                                    <div className="col-12 col-md-6">
                                      <div className="p-2 rounded-2 bg-success-subtle border border-success-subtle text-success-emphasis">
                                        <span className="fw-bold small d-block mb-1" style={{ fontSize: '0.72rem' }}>✓ Strengths:</span>
                                        <ul className="mb-0 ps-3 small">
                                          {q.strengths.map((s, i) => (
                                            <li key={i}>{s}</li>
                                          ))}
                                        </ul>
                                      </div>
                                    </div>
                                  )}
                                  {q.improvements && q.improvements.length > 0 && (
                                    <div className="col-12 col-md-6">
                                      <div className="p-2 rounded-2 bg-danger-subtle border border-danger-subtle text-danger-emphasis">
                                        <span className="fw-bold small d-block mb-1" style={{ fontSize: '0.72rem' }}>! Areas to Refine:</span>
                                        <ul className="mb-0 ps-3 small">
                                          {q.improvements.map((imp, i) => (
                                            <li key={i}>{imp}</li>
                                          ))}
                                        </ul>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Recommended Practice Topics */}
                {report?.recommendedPracticeTopics && report.recommendedPracticeTopics.length > 0 && (
                  <div className="card p-3 border-0 bg-amber-50 rounded-3 mb-2" style={{ borderLeft: '4px solid #F59E0B' }}>
                    <h6 className="fw-bold text-amber-900 small mb-1.5 d-flex align-items-center gap-1.5">
                      <Sparkles size={15} /> Recommended Next Practice Topics
                    </h6>
                    <div className="d-flex flex-wrap gap-1.5">
                      {report.recommendedPracticeTopics.map((topic, idx) => (
                        <span key={idx} className="badge bg-white text-dark border rounded-pill px-2.5 py-1 small">
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer */}
          <div className="modal-footer border-top bg-light px-4 py-2.5 d-flex justify-content-between align-items-center">
            <button
              type="button"
              className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1.5 rounded-pill px-3 fw-medium"
              onClick={handleDownloadPdf}
            >
              <Download size={14} />
              <span>Download PDF Report</span>
            </button>
            <button type="button" className="btn btn-sm btn-secondary rounded-pill px-3" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
