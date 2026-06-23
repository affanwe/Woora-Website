"use client";

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { User, CreditCard, Phone, MapPin, Upload, CheckCircle, ArrowRight } from 'lucide-react';
import ScrollReveal from '../../components/ScrollReveal';

const compressImage = (file) => new Promise((resolve, reject) => {
  if (file.size > 10 * 1024 * 1024) { reject(new Error('File too large. Max 10MB.')); return; }
  const reader = new FileReader();
  reader.onloadend = () => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let { width, height } = img;
      const MAX = 800;
      if (width > height && width > MAX) { height = Math.round(height * MAX / width); width = MAX; }
      else if (height > MAX) { width = Math.round(width * MAX / height); height = MAX; }
      canvas.width = width;
      canvas.height = height;
      canvas.getContext('2d').drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', 0.7));
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
    if (!cleanNid || !/^\d+$/.test(cleanNid) || (cleanNid.length !== 10 && cleanNid.length !== 13 && cleanNid.length !== 17))
      return setError('Please enter a valid NID (10, 13, or 17 digits).');
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
              <div className="auth-logo-badge-3d" style={{ background: 'linear-gradient(135deg,#10b981,#059669)' }}>
                <CheckCircle size={20} />
              </div>
              <h2 className="auth-header-3d__title">Activate Your Account</h2>
              <p className="auth-header-3d__subtitle">
                Complete your profile to become an Investment Partner
              </p>
            </div>

            {/* Step indicator */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', justifyContent: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#10b981' }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#10b981', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '12px' }}>✓</div>
                Account Created
              </div>
              <div style={{ flex: 1, height: '2px', background: 'linear-gradient(90deg,#10b981,var(--color-primary))', alignSelf: 'center', borderRadius: '2px' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--color-primary)' }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--color-primary)', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '12px' }}>2</div>
                Complete Profile
              </div>
            </div>

            <div style={{ padding: '12px 16px', borderRadius: '8px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', marginBottom: '20px', fontSize: '13px', color: 'var(--color-text-muted)' }}>
              Your Investor ID: <strong style={{ color: 'var(--color-primary)' }}>#{userData.id}</strong> &nbsp;|&nbsp; Email: <strong>{userData.email}</strong>
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            <form onSubmit={handleSubmit} className="auth-form-3d">
              {/* Photo */}
              <div className="form-group">
                <label className="form-label-3d">Profile Photo <span style={{ color: 'var(--color-text-muted)', fontWeight: 400 }}>(optional)</span></label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div onClick={() => fileRef.current.click()}
                    style={{ width: '80px', height: '80px', borderRadius: '50%', border: '2px dashed var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden', flexShrink: 0, background: 'var(--color-surface)' }}>
                    {preview
                      ? <img src={preview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <Upload size={22} color="var(--color-text-muted)" />}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
                    <div>Max 10MB — auto-compressed to 800px</div>
                    <div>JPEG, PNG accepted</div>
                    <button type="button" onClick={() => fileRef.current.click()}
                      style={{ marginTop: '6px', background: 'none', border: '1px solid var(--color-border)', borderRadius: '6px', color: 'var(--color-text-muted)', padding: '4px 10px', cursor: 'pointer', fontSize: '12px' }}>
                      Choose Photo
                    </button>
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
                    <input id="act-nid" type="text" className="form-control-3d" placeholder="10, 13 or 17 digits"
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

              <button type="submit" className="btn-auth-submit" disabled={loading} style={{ background: 'linear-gradient(135deg,#10b981,#059669)', marginTop: '8px' }}>
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
