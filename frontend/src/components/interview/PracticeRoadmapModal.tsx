import React from 'react';
import { TrendingUp, CheckCircle2, Play, BookOpen, Layers, MessageSquare, ArrowRight } from 'lucide-react';

interface PracticeRoadmapModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartCoding: () => void;
}

export const PracticeRoadmapModal: React.FC<PracticeRoadmapModalProps> = ({
  isOpen,
  onClose,
  onStartCoding
}) => {
  if (!isOpen) return null;

  const topics = [
    {
      title: 'Dynamic Programming',
      category: 'Algorithms & Problem Solving',
      severity: 'High Focus',
      description: 'Master grid paths, 0/1 Knapsack, and Longest Common Subsequence state tables.',
      problemCount: '12 Curated LeetCode Patterns',
      icon: <Layers size={18} className="text-danger" />
    },
    {
      title: 'System Design',
      category: 'Architecture & Scalability',
      severity: 'Medium Focus',
      description: 'Deep dive on Redis caching, LRU cache eviction, load balancing, and SQL indexing.',
      problemCount: '8 Mock Architecture Scenarios',
      icon: <BookOpen size={18} className="text-primary" />
    },
    {
      title: 'Communication Skills',
      category: 'Behavioral & Leadership',
      severity: 'Medium Focus',
      description: 'Formulate high-impact responses using the STAR method (Situation, Task, Action, Result).',
      problemCount: '6 Recorded Prompts',
      icon: <MessageSquare size={18} className="text-success" />
    }
  ];

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(3px)' }} tabIndex={-1}>
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
          <div className="modal-header border-bottom px-4 py-3 bg-light d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center gap-2.5">
              <div className="p-2 bg-danger-subtle text-danger rounded-3">
                <TrendingUp size={20} />
              </div>
              <div>
                <h5 className="modal-title fw-bold text-dark fs-6 mb-0">Targeted Weak Areas Practice</h5>
                <small className="text-secondary">Focus sessions generated to boost your readiness score from 78 to 90+</small>
              </div>
            </div>
            <button type="button" className="btn-close" onClick={onClose} aria-label="Close"></button>
          </div>

          <div className="modal-body p-4">
            <div className="d-flex flex-column gap-3">
              {topics.map((item, idx) => (
                <div key={idx} className="card p-3 border shadow-xs rounded-3 d-flex flex-row justify-content-between align-items-center gap-3">
                  <div className="d-flex align-items-start gap-3">
                    <div className="p-2 bg-light rounded-3 mt-1">
                      {item.icon}
                    </div>
                    <div>
                      <div className="d-flex align-items-center gap-2 mb-1">
                        <strong className="text-dark fs-6">{item.title}</strong>
                        <span className="badge bg-danger-subtle text-danger border border-danger-subtle rounded-pill small">
                          {item.severity}
                        </span>
                      </div>
                      <p className="text-secondary small mb-1">{item.description}</p>
                      <span className="text-muted small" style={{ fontSize: '0.75rem' }}>
                        {item.problemCount}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      onClose();
                      onStartCoding();
                    }}
                    className="btn btn-sm btn-primary rounded-pill px-3 py-1.5 d-flex align-items-center gap-1.5 flex-shrink-0"
                  >
                    <span>Practice</span>
                    <ArrowRight size={14} />
                  </button>
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
