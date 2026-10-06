import React, { useState } from 'react';
import { RecommendedJob } from '../../types.ts';
import { Briefcase, Building, MapPin, CheckCircle2, ExternalLink, Search, DollarSign } from 'lucide-react';

interface JobsExplorerModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobs: RecommendedJob[];
  onApplyJob: (jobId: string) => void;
}

export const JobsExplorerModal: React.FC<JobsExplorerModalProps> = ({
  isOpen,
  onClose,
  jobs,
  onApplyJob
}) => {
  const [filter, setFilter] = useState('');

  if (!isOpen) return null;

  const filteredJobs = jobs.filter(j => 
    j.title.toLowerCase().includes(filter.toLowerCase()) ||
    j.company.toLowerCase().includes(filter.toLowerCase()) ||
    j.matchedSkills.some(s => s.toLowerCase().includes(filter.toLowerCase()))
  );

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(3px)' }} tabIndex={-1}>
      <div className="modal-dialog modal-xl modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
          <div className="modal-header border-bottom px-4 py-3 bg-light d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center gap-2.5">
              <div className="p-2 bg-success text-white rounded-3">
                <Briefcase size={20} />
              </div>
              <div>
                <h5 className="modal-title fw-bold text-dark fs-6 mb-0">Recommended Job Opportunities</h5>
                <small className="text-secondary">Matched with your Full Stack Developer skills & interview metrics</small>
              </div>
            </div>
            <button type="button" className="btn-close" onClick={onClose} aria-label="Close"></button>
          </div>

          <div className="modal-body p-4">
            {/* Search Input */}
            <div className="position-relative mb-4">
              <Search size={16} className="position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary" />
              <input
                type="text"
                className="form-control rounded-pill ps-5 py-2 text-sm"
                placeholder="Search jobs by title, company, or tech stack (React, Node, etc.)..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              />
            </div>

            {/* Jobs List */}
            <div className="d-flex flex-column gap-3">
              {filteredJobs.map((job) => (
                <div key={job.id} className="card p-3 border shadow-xs rounded-3 hover-shadow transition-all">
                  <div className="d-flex flex-wrap justify-content-between align-items-start gap-2 mb-2">
                    <div>
                      <div className="d-flex align-items-center gap-2">
                        <h6 className="fw-bold text-dark mb-0 fs-6">{job.title}</h6>
                        <span className="badge bg-success-subtle text-success border border-success-subtle rounded-pill small">
                          Match: {job.matchScore}%
                        </span>
                      </div>
                      <div className="d-flex flex-wrap align-items-center gap-3 text-secondary small mt-1">
                        <span className="d-flex align-items-center gap-1">
                          <Building size={14} /> {job.company}
                        </span>
                        <span className="d-flex align-items-center gap-1">
                          <MapPin size={14} /> {job.location}
                        </span>
                        <span className="d-flex align-items-center gap-1 text-dark fw-medium">
                          <DollarSign size={14} /> {job.salary}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => onApplyJob(job.id)}
                      className={`btn btn-sm rounded-pill px-3 py-1.5 fw-medium d-flex align-items-center gap-1.5 ${
                        job.applied ? 'btn-success text-white' : 'btn-primary'
                      }`}
                    >
                      {job.applied ? (
                        <>
                          <CheckCircle2 size={15} />
                          <span>Applied</span>
                        </>
                      ) : (
                        <span>Quick Apply</span>
                      )}
                    </button>
                  </div>

                  <p className="text-secondary small mb-2 lh-sm">{job.description}</p>

                  <div className="d-flex flex-wrap align-items-center gap-1">
                    <span className="text-secondary small me-1">Matched Skills:</span>
                    {job.matchedSkills.map((sk) => (
                      <span key={sk} className="badge bg-light text-dark border rounded-pill small">
                        {sk}
                      </span>
                    ))}
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
