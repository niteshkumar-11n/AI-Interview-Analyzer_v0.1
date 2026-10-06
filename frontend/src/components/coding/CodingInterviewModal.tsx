import React, { useState } from 'react';
import { Code2, Play, CheckCircle2, RotateCcw, Sparkles, Clock, AlertCircle } from 'lucide-react';

interface CodingInterviewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CodingInterviewModal: React.FC<CodingInterviewModalProps> = ({ isOpen, onClose }) => {
  const [code, setCode] = useState(`/**
 * Problem: Two Sum (Hash Map Lookup)
 * Given an array of integers nums and an integer target,
 * return indices of the two numbers such that they add up to target.
 */
function twoSum(nums: number[], target: number): number[] {
  const map = new Map<number, number>();
  
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement)!, i];
    }
    map.set(nums[i], i);
  }
  return [];
}`);

  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState<{ passed: boolean; testCases: { input: string; expected: string; actual: string }[] } | null>({
    passed: true,
    testCases: [
      { input: 'nums = [2, 7, 11, 15], target = 9', expected: '[0, 1]', actual: '[0, 1]' },
      { input: 'nums = [3, 2, 4], target = 6', expected: '[1, 2]', actual: '[1, 2]' },
      { input: 'nums = [3, 3], target = 6', expected: '[0, 1]', actual: '[0, 1]' }
    ]
  });

  if (!isOpen) return null;

  const handleRun = () => {
    setIsRunning(true);
    setTimeout(() => {
      setIsRunning(false);
      setOutput({
        passed: true,
        testCases: [
          { input: 'nums = [2, 7, 11, 15], target = 9', expected: '[0, 1]', actual: '[0, 1]' },
          { input: 'nums = [3, 2, 4], target = 6', expected: '[1, 2]', actual: '[1, 2]' },
          { input: 'nums = [3, 3], target = 6', expected: '[0, 1]', actual: '[0, 1]' }
        ]
      });
    }, 600);
  };

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(3px)' }} tabIndex={-1}>
      <div className="modal-dialog modal-xl modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
          <div className="modal-header border-bottom px-4 py-3 bg-light d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center gap-2.5">
              <div className="p-2 bg-success text-white rounded-3">
                <Code2 size={20} />
              </div>
              <div>
                <div className="d-flex align-items-center gap-2">
                  <h5 className="modal-title fw-bold text-dark fs-6 mb-0">Coding Interview Simulator</h5>
                  <span className="badge bg-success-subtle text-success border border-success-subtle rounded-pill small">Easy / Medium</span>
                </div>
                <small className="text-secondary">Two Sum (Optimal O(N) Hash Table) &bull; 45:00 Simulation Clock</small>
              </div>
            </div>
            <button type="button" className="btn-close" onClick={onClose} aria-label="Close"></button>
          </div>

          <div className="modal-body p-4">
            <div className="row g-3">
              {/* Problem Statement */}
              <div className="col-lg-5">
                <div className="card h-100 p-3 bg-light border-0 rounded-3">
                  <h6 className="fw-bold text-dark mb-2">Description</h6>
                  <p className="small text-secondary mb-3 lh-base">
                    Given an array of integers <code>nums</code> and an integer <code>target</code>, return indices of the two numbers such that they add up to <code>target</code>.
                  </p>
                  <div className="bg-white p-2.5 rounded-2 border mb-3 small">
                    <strong className="text-dark d-block mb-1">Example 1:</strong>
                    <div className="font-monospace text-muted" style={{ fontSize: '0.8rem' }}>
                      Input: nums = [2,7,11,15], target = 9<br />
                      Output: [0,1]<br />
                      Explanation: nums[0] + nums[1] == 9, we return [0, 1].
                    </div>
                  </div>
                  <div className="mt-auto">
                    <span className="badge bg-primary-subtle text-primary border border-primary-subtle rounded-pill me-1 small">Array</span>
                    <span className="badge bg-info-subtle text-info border border-info-subtle rounded-pill me-1 small">Hash Table</span>
                    <span className="badge bg-secondary-subtle text-secondary border border-secondary-subtle rounded-pill small">O(N) Time</span>
                  </div>
                </div>
              </div>

              {/* Code Editor & Test Cases */}
              <div className="col-lg-7">
                <div className="card border rounded-3 overflow-hidden shadow-xs">
                  <div className="card-header bg-dark text-white px-3 py-2 d-flex justify-content-between align-items-center">
                    <span className="small font-monospace text-light">solution.ts</span>
                    <div className="d-flex align-items-center gap-2">
                      <button 
                        onClick={handleRun}
                        disabled={isRunning}
                        className="btn btn-sm btn-success rounded-pill px-3 py-1 d-flex align-items-center gap-1.5"
                      >
                        <Play size={14} />
                        <span>{isRunning ? 'Executing...' : 'Run Tests'}</span>
                      </button>
                    </div>
                  </div>
                  <div className="card-body p-0">
                    <textarea 
                      className="form-control font-monospace border-0 p-3 rounded-0"
                      rows={10}
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      style={{
                        backgroundColor: '#0F172A',
                        color: '#E2E8F0',
                        fontSize: '0.85rem',
                        lineHeight: 1.5,
                        resize: 'none'
                      }}
                    />
                  </div>
                  {output && (
                    <div className="p-3 bg-light border-top">
                      <div className="d-flex align-items-center gap-2 text-success small fw-bold mb-2">
                        <CheckCircle2 size={16} />
                        <span>3/3 Test Cases Passed (Runtime: 54ms &bull; Memory: 44.2 MB)</span>
                      </div>
                      <div className="d-flex flex-column gap-1">
                        {output.testCases.map((tc, idx) => (
                          <div key={idx} className="d-flex justify-content-between p-2 bg-white rounded border small font-monospace">
                            <span className="text-secondary">{tc.input}</span>
                            <span className="text-success fw-bold">✓ Pass</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="modal-footer border-top bg-light px-4 py-2.5 d-flex justify-content-between">
            <span className="text-secondary small d-flex align-items-center gap-1">
              <Sparkles size={14} className="text-primary" /> AI Evaluation: Clean code structure and optimal O(N) complexity.
            </span>
            <button type="button" className="btn btn-sm btn-outline-secondary rounded-pill px-3" onClick={onClose}>
              Done Practicing
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
