"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Link from 'next/link';
import TextShuffle from '../../components/TextShuffle';
import ScrollReveal from '../../components/ScrollReveal';
import TiltCard from '../../components/TiltCard';
import {
  TrendingUp, Award, Clock, DollarSign, CreditCard, Copy, Check,
  User, Phone, Mail, Hash, FileText, AlertCircle, Plus,
  BarChart3, Calendar, ArrowUpRight, Hourglass
} from 'lucide-react';

export default function Dashboard() {
  const { userData, profitData, returnPayments, shareRequests } = useAuth();
  const [copied, setCopied] = useState(false);
  const [referralLink, setReferralLink] = useState('');

  const totalShares = (userData?.shares || 0) + (userData?.awardedFreeShares || 0);
  const investedAmount = (userData?.shares || 0) * 500;
  const totalProfit = profitData?.totalProfit || 0;
  const pendingProfit = profitData?.pendingProfit || 0;
  const thisMonthProfit = profitData?.thisMonthProfit || 0;
  const freeShares = userData?.awardedFreeShares || 0;
  const hasActiveInvestment = userData?.investments?.some(inv => inv.status === 'Active');
  const accountStatus = hasActiveInvestment || (userData?.shares || 0) > 0 ? 'Active' : 'Pending';

  // Get last 6 months of profit history
  const profitHistory = (returnPayments || []).slice(0, 6);

  // Pending share requests
  const pendingRequests = (shareRequests || []).filter(r => r.status === 'Pending');
  const recentRequests = (shareRequests || []).slice(0, 5);

  const monthNames = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setReferralLink(`${window.location.origin}/register?ref=${userData?.id || '1001'}`);
    }
  }, [userData]);

  const handleCopyLink = () => {
    if (referralLink) {
      navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="dashboard-page">

      <div className="container dashboard-content">
        {/* Header */}
        <ScrollReveal>
          <header className="dash-header">
            <div>
              <h1>Welcome, <span className="gradient-text">{userData?.name || 'Investor'}</span></h1>
              <p className="dash-sub">Your investment overview and portfolio tracker.</p>
            </div>
            <Link href="/buy-shares" className="btn btn-primary">
              <Plus size={16} /> <TextShuffle>Buy Shares</TextShuffle>
            </Link>
          </header>
        </ScrollReveal>

        {/* Metrics */}
        <ScrollReveal delay={0.1}>
          <div className="metrics-row">
            <TiltCard className="metric-tile">
              <div className="metric-tile-inner">
                <TrendingUp size={20} className="metric-icon text-emerald" />
                <span className="metric-val">{totalShares}</span>
                <span className="metric-lbl">Total Shares</span>
              </div>
            </TiltCard>
            <TiltCard className="metric-tile">
              <div className="metric-tile-inner">
                <DollarSign size={20} className="metric-icon text-gold" />
                <span className="metric-val">৳{investedAmount.toLocaleString()}</span>
                <span className="metric-lbl">Capital Invested</span>
              </div>
            </TiltCard>
            <TiltCard className="metric-tile">
              <div className="metric-tile-inner">
                <Award size={20} className="metric-icon text-blue" />
                <span className="metric-val">৳{totalProfit.toLocaleString()}</span>
                <span className="metric-lbl">Total Profit Earned</span>
              </div>
            </TiltCard>
            <TiltCard className="metric-tile">
              <div className="metric-tile-inner">
                <Clock size={20} className="metric-icon text-warning" />
                <span className={`badge badge-${accountStatus.toLowerCase()}`}>{accountStatus}</span>
                <span className="metric-lbl">Account Status</span>
              </div>
            </TiltCard>
          </div>
        </ScrollReveal>

        {/* Profit Section */}
        <ScrollReveal delay={0.15}>
          <div className="dash-card glass-panel" style={{ marginBottom: '1.5rem' }}>
            <div className="dash-card-header">
              <h3><BarChart3 size={18} /> Profit Overview</h3>
            </div>
            <div className="metrics-row" style={{ marginBottom: '1rem' }}>
              <div className="metric-mini">
                <ArrowUpRight size={16} className="text-emerald" />
                <div>
                  <span className="metric-mini-val">৳{totalProfit.toLocaleString()}</span>
                  <span className="metric-mini-lbl">Total Earned</span>
                </div>
              </div>
              <div className="metric-mini">
                <Calendar size={16} className="text-blue" />
                <div>
                  <span className="metric-mini-val">৳{thisMonthProfit.toLocaleString()}</span>
                  <span className="metric-mini-lbl">This Month</span>
                </div>
              </div>
              <div className="metric-mini">
                <Hourglass size={16} className="text-warning" />
                <div>
                  <span className="metric-mini-val">৳{pendingProfit.toLocaleString()}</span>
                  <span className="metric-mini-lbl">Pending</span>
                </div>
              </div>
            </div>
            <div className="table-wrap">
              {profitHistory.length > 0 ? (
                <table className="inv-table">
                  <thead>
                    <tr>
                      <th>Month</th>
                      <th>Amount</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {profitHistory.map((p, idx) => (
                      <tr key={idx}>
                        <td>{monthNames[p.month] || p.month} {p.year}</td>
                        <td className="fw-700">৳{(p.amount || 0).toLocaleString()}</td>
                        <td>
                          <span className={`badge badge-${(p.status || 'paid').toLowerCase()}`}>
                            {p.status || 'Paid'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="empty-box text-center" style={{ padding: '1.5rem' }}>
                  <DollarSign size={28} />
                  <p style={{ margin: '0.5rem 0 0', opacity: 0.7 }}>No profit records yet. Returns are distributed monthly.</p>
                </div>
              )}
            </div>
          </div>
        </ScrollReveal>

        {/* Share Request Status */}
        {recentRequests.length > 0 && (
          <ScrollReveal delay={0.2}>
            <div className="dash-card glass-panel" style={{ marginBottom: '1.5rem' }}>
              <div className="dash-card-header">
                <h3><Clock size={18} /> Share Request Status</h3>
                {pendingRequests.length > 0 && (
                  <span className="badge badge-pending">{pendingRequests.length} Pending</span>
                )}
              </div>
              <div className="table-wrap">
                <table className="inv-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Shares</th>
                      <th>Amount</th>
                      <th>Payment</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentRequests.map((req, idx) => (
                      <tr key={idx}>
                        <td>{req.dateRequested ? new Date(req.dateRequested).toLocaleDateString() : 'N/A'}</td>
                        <td className="fw-600">{req.sharesCount}</td>
                        <td className="fw-700">৳{(req.amount || 0).toLocaleString()}</td>
                        <td>{req.paymentMethod || 'N/A'}</td>
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

        {/* Content Grid */}
        <div className="dash-grid">
          {/* Investments Table */}
          <ScrollReveal>
            <div className="dash-card glass-panel">
              <div className="dash-card-header">
                <h3><CreditCard size={18} /> My Investments</h3>
              </div>
              <div className="table-wrap">
                {userData?.investments?.length > 0 ? (
                  <table className="inv-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Shares</th>
                        <th>Amount</th>
                        <th>TrxID</th>
                        <th>Status</th>
                        <th>Activated</th>
                      </tr>
                    </thead>
                    <tbody>
                      {userData.investments.map((inv, idx) => (
                        <tr key={idx}>
                          <td>{inv.joiningDate || 'N/A'}</td>
                          <td className="fw-600">{inv.shares}</td>
                          <td className="fw-700">৳{(inv.amount || inv.shares * 500).toLocaleString()}</td>
                          <td><code className="trx-code">{inv.trxId || 'N/A'}</code></td>
                          <td>
                            <span className={`badge badge-${inv.status?.toLowerCase() || 'pending'}`}>
                              {inv.status || 'Pending'}
                            </span>
                          </td>
                          <td>{inv.activationDate || (inv.status === 'Active' ? inv.joiningDate : '-')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="empty-box text-center">
                    <AlertCircle size={36} />
                    <h4>No Investments Yet</h4>
                    <p>Submit your first share purchase request to get started.</p>
                    <Link href="/buy-shares" className="btn btn-secondary">Buy Shares</Link>
                  </div>
                )}
              </div>
            </div>
          </ScrollReveal>

          {/* Side Column */}
          <div className="dash-side">
            {/* Profile */}
            <ScrollReveal delay={0.1}>
              <div className="dash-card glass-panel">
                <div className="dash-card-header">
                  <h3><User size={18} /> Profile</h3>
                </div>
                <div className="profile-rows">
                  {[
                    { icon: Hash, label: 'Investor ID', value: userData?.id || 'Pending' },
                    { icon: User, label: 'Name', value: userData?.name || 'N/A' },
                    { icon: Mail, label: 'Email', value: userData?.email || 'N/A' },
                    { icon: Phone, label: 'Mobile', value: userData?.mobile || 'N/A' },
                    { icon: FileText, label: 'NID', value: userData?.nid || 'N/A' },
                  ].map(({ icon: Icon, label, value }, i) => (
                    <div className="profile-row" key={i}>
                      <Icon size={14} className="profile-row-icon" />
                      <div>
                        <span className="profile-row-label">{label}</span>
                        <span className="profile-row-value">{value}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>

            {/* Referral */}
            <ScrollReveal delay={0.2}>
              <div className="dash-card glass-panel">
                <div className="dash-card-header">
                  <h3><Award size={18} className="text-gold" /> Referrals</h3>
                </div>
                <div className="ref-stats">
                  <div className="ref-stat-box">
                    <span className="ref-num">{userData?.referralCount || 0}</span>
                    <span className="ref-label">Referred</span>
                  </div>
                  <div className="ref-stat-box">
                    <span className="ref-num">{freeShares}</span>
                    <span className="ref-label">Free Shares</span>
                  </div>
                </div>
                <div className="ref-link-row">
                  <input type="text" readOnly value={referralLink} className="form-control ref-input" />
                  <button className="btn btn-primary btn-copy" onClick={handleCopyLink}>
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </div>
  );
}
