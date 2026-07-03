"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import SplitHoverText from '../../components/SplitHoverText';
import ScrollReveal from '../../components/ScrollReveal';
import { Landmark, ArrowLeft, Copy, Check, Sparkles, ShieldAlert, Clock } from 'lucide-react';
import { useSiteSettings } from '../../context/SiteSettingsContext';

export default function BuyShares() {
  const { requestShares, userData, shareRequests } = useAuth();
  const { paymentMethods: allPaymentMethods, company, home } = useSiteSettings();
  const activePayments = (allPaymentMethods || []).filter(p => p.active);
  const sharePrice = home?.sharePrice || 500;

  const [sharesCount, setSharesCount] = useState('1');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [trxId, setTrxId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [copiedNum, setCopiedNum] = useState(false);
  const router = useRouter();
  const sharesNum = parseInt(sharesCount) || 0;
  const amount = sharesNum * sharePrice;

  useEffect(() => {
    if (activePayments.length > 0 && !paymentMethod) {
      setPaymentMethod(activePayments[0].name);
    }
  }, [activePayments]);

  useEffect(() => {
    if (userData !== undefined && userData !== null && !userData.isActivated) {
      router.replace('/dashboard');
    }
    if (userData === null) {
      router.replace('/login');
    }
  }, [userData]);

  const currentPM = activePayments.find(p => p.name === paymentMethod) || activePayments[0] || {};
  const displayNumber = currentPM.type === 'Cash' ? (currentPM.address || '') : (currentPM.number || '');

  const handleCopyNumber = () => {
    const textToCopy = currentPM.type === 'Cash' ? (currentPM.address || '') : (currentPM.number || '');
    navigator.clipboard.writeText(textToCopy.split(' ')[0]);
    setCopiedNum(true);
    setTimeout(() => setCopiedNum(false), 2000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (sharesNum <= 0) return setError('Enter a valid number of investment units.');
    if (!trxId.trim()) return setError('Enter the Transaction ID or Reference.');
    try {
      setLoading(true);
      await requestShares(sharesNum, paymentMethod, trxId.trim());
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Failed to submit. Try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="buy-page">
        <div className="container buy-content">
          <ScrollReveal>
            <div className="success-card glass-panel text-center">
              <div className="success-glow"><Sparkles size={32} /></div>
              <h2>Request Submitted!</h2>
              <p className="success-msg">
                Your request to purchase <strong>{sharesNum} investment units</strong> (৳{amount.toLocaleString()}) via <strong>{paymentMethod}</strong> has been submitted.
              </p>
              <div className="success-detail">
                <p><strong>TrxID:</strong> <code>{trxId}</code></p>
                <p><strong>Status:</strong> <span className="badge badge-pending">Pending Review</span></p>
              </div>
              <p className="success-note">Our team will verify and activate your investment units within {company?.verificationTimeline || '1–4 hours'} during business days.</p>
              <div className="success-btns">
                <button className="btn btn-primary" onClick={() => router.push('/dashboard')}>
                  <SplitHoverText>Go to Dashboard</SplitHoverText>
                </button>
                <button className="btn btn-secondary" onClick={() => { setSuccess(false); setTrxId(''); setSharesCount('1'); }}>
                  <SplitHoverText>Buy More</SplitHoverText>
                </button>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    );
  }

  return (
    <div className="buy-page">
      <div className="container buy-content">
        <button className="back-btn" onClick={() => router.push('/dashboard')}>
          <ArrowLeft size={16} /> Back to Dashboard
        </button>

        <div className="buy-layout grid-2">
          <ScrollReveal>
            <div className="buy-form-card glass-panel">
              <div className="buy-form-header">
                <div className="buy-icon-box"><Landmark size={24} /></div>
                <h2>Buy Investment Units</h2>
                <p>Complete payment, then submit transaction details.</p>
              </div>

              {error && <div className="alert alert-error">{error}</div>}

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Number of Investment Units (৳{sharePrice.toLocaleString()} / Unit)</label>
                  <input type="tel" inputMode="numeric" pattern="[0-9]*" className="form-control" value={sharesCount}
                    onChange={(e) => setSharesCount(e.target.value.replace(/[^0-9]/g, ''))}
                    onBlur={() => { if (!sharesCount || parseInt(sharesCount) < 1) setSharesCount('1'); }}
                    onFocus={(e) => e.target.select()} required />
                </div>

                <div className="form-group">
                  <label className="form-label">Payment Method</label>
                  <select className="form-control" value={paymentMethod}
                    onChange={(e) => { setPaymentMethod(e.target.value); setTrxId(''); }}>
                    {activePayments.map(pm => (
                      <option key={pm.name} value={pm.name}>
                        {pm.name}{pm.type === 'Cash' ? ' (Cash Deposit)' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    {currentPM.type === 'Cash' ? 'Receipt No. / Reference' : 'Transaction ID (TrxID)'}
                  </label>
                  <input type="text" className="form-control"
                    placeholder={currentPM.type === 'Cash' ? 'e.g. CSR-10023' : 'e.g. BKA7X89D20'}
                    value={trxId} onChange={(e) => setTrxId(e.target.value)} required />
                </div>

                <div className="price-summary glass-panel">
                  <div className="price-row"><span>Investment Units</span><span>{sharesNum}</span></div>
                  <div className="price-row"><span>Price/Unit</span><span>৳{sharePrice.toLocaleString()}</span></div>
                  <div className="price-row price-total"><span>Total</span><span>৳{amount.toLocaleString()}</span></div>
                </div>

                <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                  <SplitHoverText>{loading ? 'Submitting...' : 'Submit Purchase Request'}</SplitHoverText>
                </button>
              </form>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <div className="buy-instructions">
              <div className="instr-card glass-panel">
                <h3>Payment Instructions</h3>
                {currentPM.type !== 'Cash' ? (
                  <>
                    <p className="instr-text">Send the total amount to our verified wallet before submitting:</p>
                    <div className="wallet-box">
                      <div>
                        <span className="wallet-label">{currentPM.name} Wallet</span>
                        <span className="wallet-num">{displayNumber}</span>
                      </div>
                      <button className="btn btn-secondary btn-sm" onClick={handleCopyNumber}>
                        {copiedNum ? <Check size={14} /> : <Copy size={14} />}
                      </button>
                    </div>
                    <div className="steps">
                      {['Open your ' + currentPM.name + ' app', 'Select "Send Money"', `Enter amount: ৳${amount.toLocaleString()}`, `Use ID ${userData?.id || '1001'} as reference`, 'Copy TrxID and paste above'].map((step, i) => (
                        <div className="step" key={i}>
                          <span className="step-n">{i + 1}</span>
                          <p>{step}</p>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="cash-info">
                    <p>Visit our office for cash payments:</p>
                    <div className="address-block" style={{ whiteSpace: 'pre-line' }}>
                      <strong>{company?.name || 'WOORA Group'} Head Office</strong><br />
                      {company?.officeAddress || 'Level 5, WOORA Tower, Road 12\nGulshan-2, Dhaka'}
                    </div>
                  </div>
                )}
              </div>

              <div className="instr-card glass-panel">
                <h3><ShieldAlert size={16} className="text-gold" /> Verification Notice</h3>
                <p className="instr-text">
                  All requests are manually audited. Fraudulent Transaction IDs will result in account suspension. Verification takes <strong>{company?.verificationTimeline || '1–4 hours'}</strong> during business days.
                </p>
              </div>
            </div>
          </ScrollReveal>
        </div>

        {/* Previous Requests */}
        {shareRequests && shareRequests.length > 0 && (
          <ScrollReveal delay={0.3}>
            <div className="dash-card glass-panel" style={{ marginTop: '2rem' }}>
              <div className="dash-card-header">
                <h3><Clock size={18} /> Previous Investment Unit Requests</h3>
              </div>
              <div className="table-wrap">
                <table className="inv-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Units</th>
                      <th>Amount</th>
                      <th>Method</th>
                      <th>TrxID</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shareRequests.map((req, idx) => (
                      <tr key={idx}>
                        <td>{req.dateRequested ? new Date(req.dateRequested).toLocaleDateString() : 'N/A'}</td>
                        <td className="fw-600">{req.sharesCount}</td>
                        <td className="fw-700">৳{(req.amount || 0).toLocaleString()}</td>
                        <td>{req.paymentMethod || 'N/A'}</td>
                        <td><code className="trx-code">{req.trxId || 'N/A'}</code></td>
                        <td>
                          <span className={`badge badge-${(req.status || 'pending').toLowerCase()}`}>
                            {req.status || 'Pending'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </ScrollReveal>
        )}
      </div>
    </div>
  );
}
