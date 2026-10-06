import React, { useState } from 'react';
import { HelpCircle, Mail, MessageSquare, CheckCircle2, Send } from 'lucide-react';

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupportModal: React.FC<SupportModalProps> = ({ isOpen, onClose }) => {
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setMessage('');
      onClose();
    }, 1500);
  };

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(3px)' }} tabIndex={-1}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
          <div className="modal-header border-bottom px-4 py-3 bg-light d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center gap-2.5">
              <div className="p-2 bg-primary text-white rounded-3">
                <HelpCircle size={20} />
              </div>
              <div>
                <h5 className="modal-title fw-bold text-dark fs-6 mb-0">Contact Career Support</h5>
                <small className="text-secondary">24/7 Technical & Mock Interview Guidance</small>
              </div>
            </div>
            <button type="button" className="btn-close" onClick={onClose} aria-label="Close"></button>
          </div>

          <div className="modal-body p-4">
            {submitted ? (
              <div className="text-center py-4">
                <CheckCircle2 size={42} className="text-success mb-2" />
                <h6 className="fw-bold text-dark">Message Dispatched!</h6>
                <p className="text-secondary small mb-0">Our career engineering mentors will reply to your registered email shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label small fw-semibold text-dark">Topic</label>
                  <select className="form-select small">
                    <option>Mock Interview Scheduling & Feedback</option>
                    <option>Resume Analyzer Scoring Inquiry</option>
                    <option>Job Recommendation & Matching</option>
                    <option>Technical Platform Issue</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label small fw-semibold text-dark">Message</label>
                  <textarea
                    className="form-control small"
                    rows={4}
                    placeholder="How can our career mentors assist you today?..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary w-100 rounded-pill py-2 small fw-semibold d-flex align-items-center justify-content-center gap-2">
                  <Send size={16} />
                  <span>Send to Career Support</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
