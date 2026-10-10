import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.ts';
import { InterviewHistoryItem, TechnicalInterviewReport } from '../../types.ts';
import { 
  History, 
  X, 
  Calendar, 
  Award, 
  Clock, 
  ChevronRight, 
  Loader2, 
  FileText, 
  CheckCircle, 
  AlertCircle,
  Download
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface InterviewHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectInterview?: (interviewId: string) => void;
}

export const InterviewHistoryModal: React.FC<InterviewHistoryModalProps> = ({
  isOpen,
  onClose,
  onSelectInterview
}) => {
  const [history, setHistory] = useState<InterviewHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<TechnicalInterviewReport | null>(null);
  const [loadingReportId, setLoadingReportId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      setSelectedReport(null);
      api.interview.getHistory()
        .then((res) => {
          if (res.success) {
            setHistory(res.data);
          }
        })
        .catch((err) => console.error('Fetch history error:', err))
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  const handleViewReport = async (id: string) => {
    setLoadingReportId(id);
    try {
      const res = await api.interview.getReport(id);
      if (res.success && res.data) {
        setSelectedReport(res.data);
      }
    } catch (err) {
      console.error('Fetch report error:', err);
    } finally {
      setLoadingReportId(null);
    }
  };

  const handleDownloadPdf = (rep: TechnicalInterviewReport) => {
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 18;
    const contentWidth = pageWidth - margin * 2;
    let y = 22;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(37, 99, 235);
    doc.text('SkillNexus AI — Interview Performance Report', pageWidth / 2, y, { align: 'center' });
    y += 7;

    doc.setDrawColor(226, 232, 240);
    doc.line(margin, y, pageWidth - margin, y);
    y += 10;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(`Role: ${rep.role} (${rep.mode})`, margin, y);
    doc.text(`Date: ${new Date(rep.createdAt).toLocaleDateString('en-GB')}`, pageWidth - margin - 45, y);
    y += 6;
    doc.text(`Difficulty: ${rep.difficulty}`, margin, y);
    y += 12;

    doc.setFillColor(239, 246, 255);
    doc.roundedRect(margin, y, contentWidth, 20, 3, 3, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(30, 64, 175);
    doc.text(`Overall Score: ${rep.finalScore} / 10  (${Math.round(rep.finalScore * 10)}%)`, pageWidth / 2, y + 13, { align: 'center' });
    y += 28;

    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      head: [['#', 'Question', 'Score', 'Feedback']],
      body: rep.questionWiseScore.map((q, i) => [
        `${i + 1}`,
        q.question,
        `${q.score}/10`,
        q.feedback || 'Answer recorded.'
      ]),
      styles: { fontSize: 8.5, cellPadding: 4, valign: 'top' },
      headStyles: { fillColor: [37, 99, 235], textColor: 255, halign: 'center' },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center' },
        1: { cellWidth: 70 },
        2: { cellWidth: 18, halign: 'center' },
        3: { cellWidth: 'auto' }
      }
    });

    doc.save(`SkillNexus_Report_${rep.role.replace(/\s+/g, '_')}.pdf`);
  };

  if (!isOpen) return null;

  return (
    <div 
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center z-50 p-3"
      style={{ backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(6px)' }}
    >
      <div 
        className="bg-white rounded-4 shadow-2xl w-100 overflow-hidden d-flex flex-column"
        style={{ maxWidth: '900px', maxHeight: '90vh' }}
      >
        {/* Header */}
        <div className="d-flex align-items-center justify-content-between px-4 py-3 border-bottom bg-slate-50">
          <div className="d-flex align-items-center gap-2.5">
            <div 
              className="rounded-3 d-flex align-items-center justify-content-center"
              style={{ width: '40px', height: '40px', backgroundColor: '#EFF6FF', color: '#2563EB' }}
            >
              <History size={20} />
            </div>
            <div>
              <h5 className="fw-bold mb-0 text-dark">Interview History & Reports</h5>
              <p className="text-secondary small mb-0">Browse completed technical interviews and detailed feedback scorecards.</p>
            </div>
          </div>

          <button onClick={onClose} className="btn btn-sm btn-light rounded-circle p-1.5 text-secondary border-0">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 overflow-y-auto flex-grow-1" style={{ backgroundColor: '#F8FAFC' }}>
          {loading ? (
            <div className="text-center py-5">
              <Loader2 size={32} className="animate-spin text-primary mx-auto mb-2" />
              <p className="text-secondary small">Loading historical sessions...</p>
            </div>
          ) : selectedReport ? (
            /* Selected Detailed Report View */
            <div>
              <div className="d-flex align-items-center justify-content-between mb-4">
                <button
                  onClick={() => setSelectedReport(null)}
                  className="btn btn-sm btn-outline-secondary rounded-pill px-3 py-1 fw-semibold small"
                >
                  ← Back to List
                </button>

                <button
                  onClick={() => handleDownloadPdf(selectedReport)}
                  className="btn btn-sm btn-primary rounded-pill px-3 py-1.5 fw-semibold d-flex align-items-center gap-1.5 small"
                >
                  <Download size={14} />
                  <span>Download PDF</span>
                </button>
              </div>

              {/* Report Header Card */}
              <div className="card border-0 rounded-4 shadow-xs bg-white p-4 mb-3">
                <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
                  <div>
                    <h5 className="fw-bold text-dark mb-0">{selectedReport.role} ({selectedReport.mode})</h5>
                    <span className="text-muted small">{new Date(selectedReport.createdAt).toLocaleDateString('en-GB')} • {selectedReport.difficulty}</span>
                  </div>

                  <div className="badge bg-primary text-white fs-6 px-3 py-2 rounded-pill">
                    Score: {selectedReport.finalScore} / 10
                  </div>
                </div>

                <div className="row g-2 pt-2 border-top">
                  <div className="col-4 text-center">
                    <span className="text-muted small d-block">Correctness</span>
                    <strong className="text-dark">{selectedReport.correctness}/10</strong>
                  </div>
                  <div className="col-4 text-center border-start border-end">
                    <span className="text-muted small d-block">Communication</span>
                    <strong className="text-dark">{selectedReport.communication}/10</strong>
                  </div>
                  <div className="col-4 text-center">
                    <span className="text-muted small d-block">Confidence</span>
                    <strong className="text-dark">{selectedReport.confidence}/10</strong>
                  </div>
                </div>
              </div>

              {/* Questions List */}
              <div className="d-flex flex-column gap-3">
                {selectedReport.questionWiseScore.map((q, idx) => (
                  <div key={idx} className="p-3.5 rounded-3 border bg-white shadow-xs">
                    <div className="d-flex align-items-start justify-content-between gap-3 mb-2">
                      <span className="fw-bold text-dark small">Q{idx + 1}: {q.question}</span>
                      <span className="badge bg-primary-subtle text-primary fw-bold small">{q.score}/10</span>
                    </div>
                    {q.answer && (
                      <div className="p-2.5 rounded-2 bg-slate-50 border small text-secondary mb-2 font-monospace" style={{ fontSize: '0.8rem' }}>
                        {q.answer}
                      </div>
                    )}
                    <div className="p-2.5 rounded-2 bg-blue-50 border border-blue-100 text-blue-900 small" style={{ fontSize: '0.82rem' }}>
                      <strong>AI Feedback: </strong>{q.feedback}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-5 bg-white rounded-3 border">
              <History size={36} className="text-slate-300 mx-auto mb-2" />
              <h6 className="fw-bold text-dark mb-1">No Past Interviews Yet</h6>
              <p className="text-secondary small mb-0">Launch an interview in the studio to start tracking your performance history.</p>
            </div>
          ) : (
            /* History List */
            <div className="d-flex flex-column gap-2.5">
              {history.map((item) => (
                <div 
                  key={item.id}
                  onClick={() => handleViewReport(item.id)}
                  className="card border rounded-3 p-3 transition-all hover-shadow bg-white d-flex flex-row align-items-center justify-content-between cursor-pointer"
                  style={{ cursor: 'pointer' }}
                >
                  <div className="d-flex align-items-center gap-3">
                    <div 
                      className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
                      style={{ width: '44px', height: '44px', backgroundColor: '#EFF6FF', color: '#2563EB' }}
                    >
                      <Award size={22} />
                    </div>

                    <div>
                      <h6 className="fw-bold text-dark mb-0.5">{item.role}</h6>
                      <div className="d-flex align-items-center gap-2 text-secondary small" style={{ fontSize: '0.78rem' }}>
                        <span>{item.category}</span>
                        <span>•</span>
                        <span>{item.experience}</span>
                        <span>•</span>
                        <span>{new Date(item.createdAt).toLocaleDateString('en-GB')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="d-flex align-items-center gap-3">
                    <div className="text-end">
                      <div className="fw-bold text-dark fs-6">{item.finalScore} / 10</div>
                      <span className={`badge rounded-pill ${
                        item.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`} style={{ fontSize: '0.7rem' }}>
                        {item.status}
                      </span>
                    </div>

                    <button 
                      disabled={loadingReportId === item.id}
                      className="btn btn-sm btn-light rounded-circle p-2"
                    >
                      {loadingReportId === item.id ? <Loader2 size={16} className="animate-spin" /> : <ChevronRight size={16} />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
