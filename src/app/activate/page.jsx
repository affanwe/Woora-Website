"use client";

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { User, CreditCard, Phone, MapPin, Upload, CheckCircle, ArrowRight } from 'lucide-react';
import ScrollReveal from '../../components/ScrollReveal';

const compressImage = (file) => new Promise((resolve, reject) => {
  if (file.size > 3 * 1024 * 1024) { reject(new Error('File too large. Maximum 3MB allowed.')); return; }
  const reader = new FileReader();
  reader.onloadend = () => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let { width, height } = img;
      const MAX = 600;
      if (width > height && width > MAX) { height = Math.round(height * MAX / width); width = MAX; }
      else if (height > MAX) { width = Math.round(width * MAX / height); height = MAX; }
      canvas.width = width;
      canvas.height = height;
      canvas.getContext('2d').drawImage(img, 0, 0, width, height);
      // Start at 60% quality, reduce further if still too large
      let quality = 0.6;
      let result = canvas.toDataURL('image/jpeg', quality);
      while (result.length > 200 * 1024 && quality > 0.2) {
        quality -= 0.1;
        result = canvas.toDataURL('image/jpeg', quality);
      }
      resolve(result);
    };
    img.onerror = reject;
    img.src = reader.result;
  };
  reader.onerror = reject;
  reader.readAsDataURL(file);
});

export default function Activate() {
  const { userData, activateAccount } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({ name: '', nid: '', address: '', guardianMobile: '' });
  const [photo, setPhoto]     = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const fileRef = useRef();

  if (!userData) return null;
  if (userData.isActivated) { router.push('/dashboard'); return null; }

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const compressed = await compressImage(file);
      setPhoto(compressed);
      setPreview(compressed);
    } catch (err) {
      setError(err.message || 'Failed to process image.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return setError('Full name is required.');
    const cleanNid = form.nid.trim();
    if (!cleanNid || !/^\d+$/.test(cleanNid))
      return setError('NID / Birth Certificate must contain digits only.');
    if (!form.guardianMobile.trim()) return setError('Guardian mobile is required.');

    try {
      setError('');
      setLoading(true);
      await activateAccount({ name: form.name, nid: cleanNid, image: photo, address: form.address, guardianMobile: form.guardianMobile });
      router.push('/dashboard');
    } catch (err) {
      setError(err.message || 'Activation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-3d" style={{ minHeight: '100vh', paddingTop: '60px', paddingBottom: '60px' }}>
      <div className="auth-glow-blob auth-glow-blob--emerald" />
      <div className="auth-glow-blob auth-glow-blob--gold" />

      <div className="auth-content-wrapper">
        <ScrollReveal direction="up" delay={0.1}>
          <div className="auth-card-3d auth-card-3d--wide">
            <div className="auth-card-3d__glow-border" />

            <div className="auth-header-3d">
              <div className="auth-logo-badge-3d" style={{ background: 'linear-gradient(135deg,#00D09C,#00B386)' }}>
                <CheckCircle size={20} />
              </div>
              <h2 className="auth-header-3d__title">Activate Your Account</h2>
              <p className="auth-header-3d__subtitle">
                Complete your profile to become an Investment Partner
              </p>
            </div>

            {/* Step indicator */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', justifyContent: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#00D09C' }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#00D09C', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '12px' }}>✓</div>
                Account Created
              </div>
              <div style={{ flex: 1, height: '2px', background: 'linear-gradient(90deg,#00D09C,var(--color-primary))', alignSelf: 'center', borderRadius: '2px' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--color-primary)' }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--color-primary)', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '12px' }}>2</div>
                Complete Profile
              </div>
            </div>

            <div style={{ padding: '12px 16px', borderRadius: '8px', background: 'rgba(0,208,156,0.08)', border: '1px solid rgba(0,208,156,0.2)', marginBottom: '20px', fontSize: '13px', color: 'var(--color-text-muted)' }}>
              Your Investor ID: <strong style={{ color: 'var(--color-primary)' }}>#{userData.id}</strong> &nbsp;|&nbsp; Email: <strong>{userData.email}</strong>
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            <form onSubmit={handleSubmit} className="auth-form-3d">
              {/* Photo */}
              <div className="form-group">
                <label className="form-label-3d">Profile Photo <span style={{ color: 'var(--color-text-muted)', fontWeight: 400 }}>(optional)</span></label>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', padding: '24px', borderRadius: '16px', border: '2px dashed rgba(0,208,156,0.3)', background: 'rgba(0,208,156,0.03)', cursor: 'pointer', transition: 'all 0.3s' }}
                  onClick={() => fileRef.current.click()}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(0,208,156,0.6)'; e.currentTarget.style.background = 'rgba(0,208,156,0.06)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(0,208,156,0.3)'; e.currentTarget.style.background = 'rgba(0,208,156,0.03)'; }}>
                  <div style={{ width: '100px', height: '100px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0, position: 'relative', border: preview ? '3px solid #00D09C' : 'none' }}>
                    {preview
                      ? <img src={preview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : (
                        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
                          <defs>
                            <linearGradient id="avatarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="#1a1a2e" />
                              <stop offset="100%" stopColor="#16213e" />
                            </linearGradient>
                          </defs>
                          <circle cx="50" cy="50" r="50" fill="url(#avatarGrad)" />
                          <circle cx="50" cy="38" r="16" fill="rgba(0,208,156,0.25)" stroke="#00D09C" strokeWidth="1.5">
                            <animate attributeName="r" values="16;17;16" dur="2s" repeatCount="indefinite" />
                          </circle>
                          <ellipse cx="50" cy="78" rx="26" ry="18" fill="rgba(0,208,156,0.25)" stroke="#00D09C" strokeWidth="1.5">
                            <animate attributeName="ry" values="18;19;18" dur="2s" repeatCount="indefinite" />
                          </ellipse>
                          <circle cx="50" cy="50" r="48" fill="none" stroke="rgba(0,208,156,0.3)" strokeWidth="1" strokeDasharray="6 4">
                            <animateTransform attributeName="transform" type="rotate" from="0 50 50" to="360 50 50" dur="20s" repeatCount="indefinite" />
                          </circle>
                          <g>
                            <circle cx="50" cy="8" r="3.5" fill="rgba(0,208,156,0.6)">
                              <animate attributeName="opacity" values="1;0.4;1" dur="1.5s" repeatCount="indefinite" />
                            </circle>
                            <path d="M48 5 L50 2 L52 5" fill="none" stroke="rgba(0,208,156,0.6)" strokeWidth="1.2" strokeLinecap="round">
                              <animate attributeName="opacity" values="1;0.4;1" dur="1.5s" repeatCount="indefinite" />
                            </path>
                          </g>
                        </svg>
                      )}
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <button type="button"
                      style={{
                        background: 'linear-gradient(135deg, #00D09C, #00b386)', border: 'none', borderRadius: '10px',
                        color: '#fff', padding: '10px 28px', cursor: 'pointer', fontSize: '14px', fontWeight: 600,
                        display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(0,208,156,0.3)',
                      }}>
                      <Upload size={16} /> Upload Your Photo
                    </button>
                    <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '8px', margin: '8px 0 0' }}>JPEG, PNG — Max 3MB</p>
                  </div>
                </div>
                <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
              </div>

              {/* Name */}
              <div className="form-group">
                <label className="form-label-3d" htmlFor="act-name">Full Name *</label>
                <div className="input-icon-wrapper-3d">
                  <User className="input-icon-3d" size={18} />
                  <input id="act-name" type="text" className="form-control-3d" placeholder="Your full name"
                    value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
                </div>
              </div>

              {/* NID + Guardian Mobile */}
              <div className="auth-form-row">
                <div className="form-group">
                  <label className="form-label-3d" htmlFor="act-nid">NID / Birth Cert. *</label>
                  <div className="input-icon-wrapper-3d">
                    <CreditCard className="input-icon-3d" size={18} />
                    <input id="act-nid" type="text" className="form-control-3d" placeholder="NID or Birth Certificate number"
                      value={form.nid} onChange={e => setForm(p => ({ ...p, nid: e.target.value }))} required />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label-3d" htmlFor="act-guardian">Guardian Mobile *</label>
                  <div className="input-icon-wrapper-3d">
                    <Phone className="input-icon-3d" size={18} />
                    <input id="act-guardian" type="tel" className="form-control-3d" placeholder="01XXXXXXXXX"
                      value={form.guardianMobile} onChange={e => setForm(p => ({ ...p, guardianMobile: e.target.value }))} required />
                  </div>
                </div>
              </div>

              {/* Address */}
              <div className="form-group">
                <label className="form-label-3d" htmlFor="act-address">Address</label>
                <div className="input-icon-wrapper-3d">
                  <MapPin className="input-icon-3d" size={18} />
                  <input id="act-address" type="text" className="form-control-3d" placeholder="Your full address"
                    value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} />
                </div>
              </div>

              <button type="submit" className="btn-auth-submit" disabled={loading} style={{ background: 'linear-gradient(135deg,#00D09C,#00B386)', marginTop: '8px' }}>
                {loading
                  ? <span className="btn-auth-loading"><span className="auth-spinner" /> Activating...</span>
                  : <><CheckCircle size={18} /> Activate My Account <ArrowRight size={16} /></>}
              </button>
            </form>
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
}
