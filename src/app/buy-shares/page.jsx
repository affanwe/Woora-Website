"use client";

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import TextShuffle from '../../components/TextShuffle';
import ScrollReveal from '../../components/ScrollReveal';
import { Landmark, ArrowLeft, Copy, Check, Sparkles, ShieldAlert } from 'lucide-react';

export default function BuyShares() {
  const { requestShares, userData } = useAuth();
  const [sharesCount, setSharesCount] = useState(10);
  const [paymentMethod, setPaymentMethod] = useState('bKash');
  const [trxId, setTrxId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [copiedNum, setCopiedNum] = useState(false);
  const router = useRouter();
  const amount = sharesCount * 500;

  const paymentNumbers = {
    bKash: '01712-345678',
    Nagad: '01812-345678',
    Rocket: '01912-345678-0',
    Cash: 'Office — Gulshan 2, Dhaka'
  };

  const handleCopyNumber = () => {
    navigator.clipboard.writeText(paymentNumbers[paymentMethod].split(' ')[0]);
    setCopiedNum(true);
    setTimeout(() => setCopiedNum(false), 2000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (sharesCount <= 0) return setError('Enter a valid number of shares.');
    if (!trxId.trim()) return setError('Enter the Transaction ID or Reference.');
    try {
      setLoading(true);
      await requestShares(Number(sharesCount), paymentMethod, trxId.trim());
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
                Your request to purchase <strong>{sharesCount} shares</strong> (৳{amount.toLocaleString()}) via <strong>{paymentMethod}</strong> has been submitted.
              </p>
              <div className="success-detail">
                <p><strong>TrxID:</strong> <code>{trxId}</code></p>
                <p><strong>Status:</strong> <span className="badge badge-pending">Pending Review</span></p>
              </div>
              <p className="success-note">Our team will verify and activate your shares within 1–4 business hours.</p>
              <div className="success-btns">
                <button className="btn btn-primary" onClick={() => router.push('/dashboard')}>
                  <TextShuffle>Go to Dashboard</TextShuffle>
                </button>
                <button className="btn btn-secondary" onClick={() => { setSuccess(false); setTrxId(''); setSharesCount(10); }}>
                  <TextShuffle>Buy More</TextShuffle>
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
                <h2>Request Share Purchase</h2>
                <p>Complete payment, then submit transaction details.</p>
              </div>

              {error && <div className="alert alert-error">{error}</div>}

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Number of Shares (৳500 / Share)</label>
                  <input type="number" min="1" className="form-control" value={sharesCount}
                    onChange={(e) => setSharesCount(Math.max(1, parseInt(e.target.value) || 0))} required />
                </div>

                <div className="form-group">
                  <label className="form-label">Payment Method</label>
                  <select className="form-control" value={paymentMethod}
                    onChange={(e) => { setPaymentMethod(e.target.value); setTrxId(''); }}>
                    <option value="bKash">bKash</option>
                    <option value="Nagad">Nagad</option>
                    <option value="Rocket">Rocket</option>
                    <option value="Cash">Cash Deposit</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    {paymentMethod === 'Cash' ? 'Receipt No. / Reference' : 'Transaction ID (TrxID)'}
                  </label>
                  <input type="text" className="form-control"
                    placeholder={paymentMethod === 'Cash' ? 'e.g. CSR-10023' : 'e.g. BKA7X89D20'}
                    value={trxId} onChange={(e) => setTrxId(e.target.value)} required />
                </div>

                <div className="price-summary glass-panel">
                  <div className="price-row"><span>Shares</span><span>{sharesCount}</span></div>
                  <div className="price-row"><span>Price/Share</span><span>৳500</span></div>
                  <div className="price-row price-total"><span>Total</span><span>৳{amount.toLocaleString()}</span></div>
                </div>

                <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                  <TextShuffle>{loading ? 'Submitting...' : 'Submit Purchase Request'}</TextShuffle>
                </button>
              </form>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <div className="buy-instructions">
              <div className="instr-card glass-panel">
                <h3>Payment Instructions</h3>
                {paymentMethod !== 'Cash' ? (
                  <>
                    <p className="instr-text">Send the total amount to our verified wallet before submitting:</p>
                    <div className="wallet-box">
                      <div>
                        <span className="wallet-label">{paymentMethod} Wallet</span>
                        <span className="wallet-num">{paymentNumbers[paymentMethod]}</span>
                      </div>
                      <button className="btn btn-secondary btn-sm" onClick={handleCopyNumber}>
                        {copiedNum ? <Check size={14} /> : <Copy size={14} />}
                      </button>
                    </div>
                    <div className="steps">
                      {['Open your ' + paymentMethod + ' app', 'Select "Send Money"', `Enter amount: ৳${amount.toLocaleString()}`, `Use ID ${userData?.id || '1001'} as reference`, 'Copy TrxID and paste above'].map((step, i) => (
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
                    <div className="address-block">
                      <strong>WOORA Group Head Office</strong><br />
                      Level 5, WOORA Tower, Road 12<br />
                      Gulshan-2, Dhaka
                    </div>
                  </div>
                )}
              </div>

              <div className="instr-card glass-panel">
                <h3><ShieldAlert size={16} className="text-gold" /> Verification Notice</h3>
                <p className="instr-text">
                  All requests are manually audited. Fraudulent Transaction IDs will result in account suspension. Verification takes <strong>1–4 hours</strong> during business days.
                </p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </div>
  );
}
