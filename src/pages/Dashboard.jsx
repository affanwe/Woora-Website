import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import TextShuffle from '../components/TextShuffle';
import ScrollReveal from '../components/ScrollReveal';
import TiltCard from '../components/TiltCard';
import {
  TrendingUp, Award, Clock, DollarSign, CreditCard, Copy, Check,
  User, Phone, Mail, Hash, FileText, AlertCircle, Plus
} from 'lucide-react';
import './Dashboard.css';

export default function Dashboard() {
  const { userData } = useAuth();
  const [copied, setCopied] = useState(false);

  const totalShares = (userData?.shares || 0) + (userData?.awardedFreeShares || 0);
  const investedAmount = (userData?.shares || 0) * 500;
  const profitReceived = userData?.profitReceived || 0;
  const freeShares = userData?.awardedFreeShares || 0;
  const hasActiveInvestment = userData?.investments?.some(inv => inv.status === 'Active');
  const accountStatus = hasActiveInvestment || (userData?.shares || 0) > 0 ? 'Active' : 'Pending';
  const referralLink = `${window.location.origin}/register?ref=${userData?.id || '1001'}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
            <Link to="/buy-shares" className="btn btn-primary">
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
                <span className="metric-val">৳{profitReceived.toLocaleString()}</span>
                <span className="metric-lbl">Profit Received</span>
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
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="empty-box text-center">
                    <AlertCircle size={36} />
                    <h4>No Investments Yet</h4>
                    <p>Submit your first share purchase request to get started.</p>
                    <Link to="/buy-shares" className="btn btn-secondary">Buy Shares</Link>
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
