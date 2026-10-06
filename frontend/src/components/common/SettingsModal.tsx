import React, { useState } from 'react';
import { Settings, Bell, Shield, Moon, Sun, Check, Globe } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [jobAlerts, setJobAlerts] = useState(true);
  const [privacyPublic, setPrivacyPublic] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(3px)' }} tabIndex={-1}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
          <div className="modal-header border-bottom px-4 py-3 bg-light d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center gap-2.5">
              <div className="p-2 bg-secondary text-white rounded-3">
                <Settings size={20} />
              </div>
              <h5 className="modal-title fw-bold text-dark fs-6 mb-0">Platform Settings</h5>
            </div>
            <button type="button" className="btn-close" onClick={onClose} aria-label="Close"></button>
          </div>

          <div className="modal-body p-4">
            <div className="d-flex flex-column gap-3">
              <div className="d-flex justify-content-between align-items-center p-3 border rounded-3 bg-light">
                <div>
                  <strong className="text-dark d-block small">Interview Practice Reminders</strong>
                  <span className="text-secondary" style={{ fontSize: '0.78rem' }}>Receive daily algorithmic & mock interview alerts</span>
                </div>
                <div className="form-check form-switch mb-0">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={emailAlerts}
                    onChange={(e) => setEmailAlerts(e.target.checked)}
                  />
                </div>
              </div>

              <div className="d-flex justify-content-between align-items-center p-3 border rounded-3 bg-light">
                <div>
                  <strong className="text-dark d-block small">Job Match Notifications</strong>
                  <span className="text-secondary" style={{ fontSize: '0.78rem' }}>Notify when jobs with &gt;85% match are posted</span>
                </div>
                <div className="form-check form-switch mb-0">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={jobAlerts}
                    onChange={(e) => setJobAlerts(e.target.checked)}
                  />
                </div>
              </div>

              <div className="d-flex justify-content-between align-items-center p-3 border rounded-3 bg-light">
                <div>
                  <strong className="text-dark d-block small">Candidate Profile Visibility</strong>
                  <span className="text-secondary" style={{ fontSize: '0.78rem' }}>Allow verified tech recruiters to discover profile</span>
                </div>
                <div className="form-check form-switch mb-0">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={privacyPublic}
                    onChange={(e) => setPrivacyPublic(e.target.checked)}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="modal-footer border-top bg-light px-4 py-2.5 d-flex justify-content-end">
            <button type="button" className="btn btn-sm btn-primary rounded-pill px-4" onClick={onClose}>
              Save Preferences
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
