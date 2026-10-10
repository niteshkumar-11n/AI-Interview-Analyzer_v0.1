import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { api } from '../../services/api.ts';
import { CreditPackage, WalletInfo, WalletTransaction } from '../../types.ts';
import { 
  Coins, 
  Check, 
  X, 
  ShieldCheck, 
  Sparkles, 
  History, 
  AlertCircle, 
  ArrowRight, 
  Loader2, 
  RefreshCw,
  Clock,
  TrendingUp,
  CreditCard
} from 'lucide-react';

interface CreditWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (newBalance: number) => void;
  insufficientForFeature?: string;
}

// Global reference to prevent duplicate in-flight script loads
let razorpayScriptPromise: Promise<boolean> | null = null;

const loadRazorpaySdk = (): Promise<boolean> => {
  if (typeof window !== 'undefined' && (window as any).Razorpay) {
    return Promise.resolve(true);
  }

  if (razorpayScriptPromise) {
    return razorpayScriptPromise;
  }

  razorpayScriptPromise = new Promise((resolve) => {
    let script = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
    if (!script) {
      script = document.createElement('script');
      script.setAttribute('src', 'https://checkout.razorpay.com/v1/checkout.js');
      script.setAttribute('async', 'true');
      document.body.appendChild(script);
    }

    script.addEventListener('load', () => resolve(true), { once: true });
    script.addEventListener('error', () => {
      razorpayScriptPromise = null;
      resolve(false);
    }, { once: true });

    // Safety timeout
    setTimeout(() => {
      if ((window as any).Razorpay) {
        resolve(true);
      } else {
        razorpayScriptPromise = null;
        resolve(false);
      }
    }, 4500);
  });

  return razorpayScriptPromise;
};

export const CreditWalletModal: React.FC<CreditWalletModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  insufficientForFeature
}) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'packages' | 'history'>('packages');
  const [packages, setPackages] = useState<CreditPackage[]>([]);
  const [wallet, setWallet] = useState<WalletInfo | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasingPlanId, setPurchasingPlanId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchWalletData = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const [pkgRes, walletRes, txRes] = await Promise.all([
        api.payment.getPackages(),
        api.payment.getWallet(),
        api.payment.getTransactions()
      ]);

      if (pkgRes.success) {
        setPackages(pkgRes.data.packages.filter(p => p.priceInr > 0)); // Only paid packages for purchase
      }
      if (walletRes.success) {
        setWallet(walletRes.data);
      }
      if (txRes.success) {
        setTransactions(txRes.data);
      }
    } catch (err: any) {
      console.error('Wallet fetch error:', err);
      setErrorMessage(err.message || 'Failed to load wallet data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchWalletData();
      setSuccessMessage(null);
      setErrorMessage(null);
    }
  }, [isOpen]);

  const handlePurchase = async (pkg: CreditPackage) => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setPurchasingPlanId(pkg.id);

    try {
      // 1. Ensure Razorpay SDK loaded
      const isLoaded = await loadRazorpaySdk();
      if (!isLoaded || !(window as any).Razorpay) {
        throw new Error('Could not load Razorpay payment gateway. Please check your internet connection.');
      }

      // 2. Create authoritative order on backend
      const orderRes = await api.payment.createOrder(pkg.id);
      if (!orderRes.success || !orderRes.data) {
        throw new Error(orderRes.message || 'Failed to generate payment order.');
      }

      const { orderId, amount, currency, keyId } = orderRes.data;

      // 3. Open Razorpay Checkout modal
      const options = {
        key: keyId,
        amount,
        currency: currency || 'INR',
        name: 'SkillNexus AI Platform',
        description: `${pkg.name} — ${pkg.credits} AI Interview Credits`,
        order_id: orderId,
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          try {
            setPurchasingPlanId(pkg.id);
            // 4. Server-side cryptographic signature verification & idempotent credit grant
            const verifyRes = await api.payment.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });

            if (verifyRes.success) {
              const newCredits = verifyRes.data.credits;
              setSuccessMessage(`Payment verified! ${pkg.credits} credits have been successfully added to your wallet.`);
              setWallet(prev => prev ? { ...prev, credits: newCredits } : null);
              if (onSuccess) {
                onSuccess(newCredits);
              }
              // Refresh transaction history
              api.payment.getTransactions().then(res => {
                if (res.success) setTransactions(res.data);
              });
            } else {
              setErrorMessage(verifyRes.message || 'Payment verification failed.');
            }
          } catch (err: any) {
            setErrorMessage(err.message || 'Payment verification error.');
          } finally {
            setPurchasingPlanId(null);
          }
        },
        prefill: {
          name: user?.profile?.name || '',
          email: user?.email || '',
        },
        theme: {
          color: '#2563EB',
        },
        modal: {
          ondismiss: () => {
            setPurchasingPlanId(null);
          }
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', (resp: any) => {
        setPurchasingPlanId(null);
        setErrorMessage(`Payment failed: ${resp.error?.description || 'Transaction cancelled'}`);
      });
      rzp.open();
    } catch (err: any) {
      console.error('Purchase flow error:', err);
      setErrorMessage(err.message || 'Failed to initiate purchase.');
      setPurchasingPlanId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center z-50 p-3"
      style={{ backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(6px)' }}
    >
      <div 
        className="bg-white rounded-4 shadow-2xl w-100 overflow-hidden d-flex flex-column"
        style={{ maxWidth: '850px', maxHeight: '90vh' }}
      >
        {/* Modal Header */}
        <div className="d-flex align-items-center justify-content-between px-4 py-3 border-bottom bg-slate-50">
          <div className="d-flex align-items-center gap-2.5">
            <div 
              className="rounded-3 d-flex align-items-center justify-content-center"
              style={{ width: '40px', height: '40px', backgroundColor: '#FEF3C7', color: '#D97706' }}
            >
              <Coins size={22} />
            </div>
            <div>
              <h5 className="fw-bold mb-0 text-dark" style={{ letterSpacing: '-0.02em' }}>
                Credit Wallet & Packages
              </h5>
              <p className="text-secondary small mb-0">
                Transparent credit management for AI technical interview sessions
              </p>
            </div>
          </div>

          <div className="d-flex align-items-center gap-3">
            {/* Live Balance Pill */}
            <div 
              className="d-flex align-items-center gap-2 px-3 py-1.5 rounded-pill border"
              style={{ backgroundColor: '#FFFBEB', borderColor: '#FDE68A' }}
            >
              <Coins size={16} className="text-amber-500" />
              <span className="fw-bold text-dark fs-6">
                {wallet ? wallet.credits : (user?.credits ?? '—')}
              </span>
              <span className="text-muted small fw-semibold">Credits</span>
            </div>

            <button 
              onClick={onClose}
              className="btn btn-sm btn-light rounded-circle p-1.5 text-secondary border-0"
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Insufficient Credits Notice if triggered */}
        {insufficientForFeature && (
          <div className="bg-amber-50 border-bottom border-amber-200 px-4 py-2.5 d-flex align-items-center gap-2 text-amber-900 small">
            <AlertCircle size={17} className="text-amber-600 flex-shrink-0" />
            <span>
              <strong>Insufficient Credits:</strong> You need at least <strong>50 credits</strong> to launch {insufficientForFeature}. Choose a refill pack below to continue.
            </span>
          </div>
        )}

        {/* Success Alert */}
        {successMessage && (
          <div className="bg-emerald-50 border-bottom border-emerald-200 px-4 py-2.5 d-flex align-items-center gap-2 text-emerald-900 small">
            <ShieldCheck size={18} className="text-emerald-600 flex-shrink-0" />
            <span className="fw-medium">{successMessage}</span>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div className="bg-red-50 border-bottom border-red-200 px-4 py-2.5 d-flex align-items-center gap-2 text-red-900 small">
            <AlertCircle size={18} className="text-red-600 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="d-flex border-bottom px-4 pt-2 gap-4">
          <button
            onClick={() => setActiveTab('packages')}
            className={`btn pb-2.5 px-1 border-0 rounded-0 fw-semibold position-relative small ${
              activeTab === 'packages' ? 'text-primary' : 'text-secondary'
            }`}
          >
            Credit Packages
            {activeTab === 'packages' && (
              <span 
                className="position-absolute bottom-0 start-0 w-100 bg-primary" 
                style={{ height: '2.5px' }} 
              />
            )}
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`btn pb-2.5 px-1 border-0 rounded-0 fw-semibold position-relative small ${
              activeTab === 'history' ? 'text-primary' : 'text-secondary'
            }`}
          >
            Transaction History
            {activeTab === 'history' && (
              <span 
                className="position-absolute bottom-0 start-0 w-100 bg-primary" 
                style={{ height: '2.5px' }} 
              />
            )}
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 overflow-y-auto flex-grow-1" style={{ backgroundColor: '#F8FAFC' }}>
          {loading ? (
            <div className="text-center py-5">
              <Loader2 size={32} className="animate-spin text-primary mx-auto mb-2" />
              <p className="text-secondary small">Loading packages and ledger records...</p>
            </div>
          ) : activeTab === 'packages' ? (
            <div>
              {/* Feature Credit Cost Explanation */}
              <div 
                className="p-3 rounded-3 mb-4 d-flex align-items-center justify-content-between border"
                style={{ backgroundColor: '#EFF6FF', borderColor: '#DBEAFE' }}
              >
                <div className="d-flex align-items-center gap-2.5">
                  <Sparkles size={20} className="text-primary flex-shrink-0" />
                  <div>
                    <h6 className="fw-bold mb-0 text-dark small">AI Interview Session Cost: 50 Credits</h6>
                    <p className="mb-0 text-secondary" style={{ fontSize: '0.78rem' }}>
                      Each technical interview includes 5 progressive questions, audio/video simulation, and full rubric scorecard.
                    </p>
                  </div>
                </div>

                <div className="badge bg-primary text-white px-3 py-1.5 rounded-pill small">
                  Razorpay Verified
                </div>
              </div>

              {/* Package Grid */}
              <div className="row g-3">
                {packages.map((pkg) => {
                  const isProcessing = purchasingPlanId === pkg.id;
                  const isBestValue = pkg.badge === 'Best Value' || pkg.popular;

                  return (
                    <div key={pkg.id} className="col-12 col-md-4">
                      <div 
                        className={`card h-100 p-3.5 rounded-4 transition-all d-flex flex-column justify-content-between ${
                          isBestValue ? 'border-primary shadow-sm bg-white' : 'border-slate-200 bg-white'
                        }`}
                        style={{
                          borderWidth: isBestValue ? '2px' : '1px',
                          position: 'relative'
                        }}
                      >
                        {pkg.badge && (
                          <div 
                            className="position-absolute top-0 end-0 m-3 badge rounded-pill px-2.5 py-1 text-white small"
                            style={{ backgroundColor: isBestValue ? '#2563EB' : '#10B981', fontSize: '0.7rem' }}
                          >
                            {pkg.badge}
                          </div>
                        )}

                        <div>
                          <h6 className="fw-bold text-dark mb-1">{pkg.name}</h6>
                          <p className="text-secondary small mb-3" style={{ fontSize: '0.78rem' }}>
                            {pkg.description}
                          </p>

                          {/* Price & Credits */}
                          <div className="mb-3">
                            <div className="d-flex align-items-baseline gap-1">
                              <span className="fs-3 fw-bold text-dark">₹{pkg.priceInr}</span>
                              <span className="text-muted small">one-time</span>
                            </div>
                            <div className="d-flex align-items-center gap-1.5 text-amber-600 fw-bold small mt-1">
                              <Coins size={15} />
                              <span>{pkg.credits} Credits</span>
                              <span className="text-muted fw-normal">
                                ({Math.floor(pkg.credits / 50)} full sessions)
                              </span>
                            </div>
                          </div>

                          {/* Features list */}
                          <div className="border-top pt-3 mb-4">
                            <ul className="list-unstyled mb-0 d-flex flex-column gap-2">
                              {pkg.features.map((f, idx) => (
                                <li key={idx} className="d-flex align-items-start gap-2 small text-secondary" style={{ fontSize: '0.78rem' }}>
                                  <Check size={14} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                                  <span>{f}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        {/* Pay Button */}
                        <button
                          onClick={() => handlePurchase(pkg)}
                          disabled={Boolean(purchasingPlanId)}
                          className={`btn w-100 rounded-3 py-2 fw-semibold d-flex align-items-center justify-content-center gap-2 ${
                            isBestValue ? 'btn-primary' : 'btn-outline-primary'
                          }`}
                          style={{ fontSize: '0.85rem' }}
                        >
                          {isProcessing ? (
                            <>
                              <Loader2 size={16} className="animate-spin" />
                              <span>Opening Razorpay...</span>
                            </>
                          ) : (
                            <>
                              <CreditCard size={16} />
                              <span>Get {pkg.credits} Credits</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Security info banner */}
              <div className="mt-4 pt-3 border-top d-flex align-items-center justify-content-between text-muted small">
                <div className="d-flex align-items-center gap-2">
                  <ShieldCheck size={16} className="text-emerald-600" />
                  <span>256-Bit SSL Encrypted • Razorpay Server-Verified Webhooks</span>
                </div>
                <span>Test Mode Enabled (Official Sandbox)</span>
              </div>
            </div>
          ) : (
            <div>
              {/* Transaction Ledger Table */}
              {transactions.length === 0 ? (
                <div className="text-center py-5 bg-white rounded-3 border">
                  <History size={36} className="text-slate-300 mx-auto mb-2" />
                  <h6 className="fw-bold text-dark mb-1">No Transactions Recorded Yet</h6>
                  <p className="text-secondary small mb-0">
                    Your credit purchases and interview usage ledger will appear here.
                  </p>
                </div>
              ) : (
                <div className="table-responsive bg-white rounded-3 border">
                  <table className="table table-hover align-middle mb-0" style={{ fontSize: '0.84rem' }}>
                    <thead className="table-light">
                      <tr>
                        <th>Date</th>
                        <th>Type</th>
                        <th>Description</th>
                        <th className="text-center">Credits</th>
                        <th className="text-center">Balance After</th>
                        <th className="text-end">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((tx) => {
                        const isCredit = tx.credits > 0;
                        return (
                          <tr key={tx.id}>
                            <td className="text-secondary small">
                              {new Date(tx.createdAt).toLocaleDateString('en-GB', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </td>
                            <td>
                              <span className={`badge rounded-pill ${
                                tx.type === 'PURCHASE' ? 'bg-emerald-100 text-emerald-700' :
                                tx.type === 'DEDUCTION' ? 'bg-amber-100 text-amber-700' :
                                'bg-slate-100 text-slate-700'
                              }`}>
                                {tx.type}
                              </span>
                            </td>
                            <td className="fw-medium text-dark">{tx.description}</td>
                            <td className={`text-center fw-bold ${isCredit ? 'text-emerald-600' : 'text-slate-700'}`}>
                              {isCredit ? `+${tx.credits}` : tx.credits}
                            </td>
                            <td className="text-center text-muted fw-semibold">
                              {tx.balanceAfter}
                            </td>
                            <td className="text-end text-dark fw-bold">
                              {tx.amountInr > 0 ? `₹${tx.amountInr}` : '—'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
