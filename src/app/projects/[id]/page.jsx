"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, MapPin, Tag, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

const STATUS_STYLES = {
  'Running':     { background: 'rgba(16,185,129,0.15)', color: '#10B981', border: '1px solid rgba(16,185,129,0.3)' },
  'Coming Soon': { background: 'rgba(245,158,11,0.15)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.3)' },
  'Planning':    { background: 'rgba(99,102,241,0.15)', color: '#818CF8', border: '1px solid rgba(99,102,241,0.3)' },
};

export default function ProjectDetail() {
  const { id }     = useParams();
  const router     = useRouter();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    if (!id) return;
    supabase.from('projects').select('*').eq('id', id).single()
      .then(({ data, error }) => {
        if (error || !data) { router.push('/projects'); return; }
        setProject(data);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)' }}>
        Loading...
      </div>
    );
  }

  if (!project) return null;

  const images  = project.images || [];
  const ss      = STATUS_STYLES[project.status] || STATUS_STYLES['Planning'];

  return (
    <div style={{ paddingBottom: '80px' }}>

      {/* Back */}
      <div className="container" style={{ paddingTop: '40px' }}>
        <Link href="/projects" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--color-text-muted)', fontSize: '14px', textDecoration: 'none', marginBottom: '32px' }}>
          <ArrowLeft size={16} /> Back to Projects
        </Link>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '48px' }}>

          {/* Image Gallery */}
          {images.length > 0 && (
            <div>
              {/* Main Image */}
              <div style={{ position: 'relative', borderRadius: '16px', overflow: 'hidden', aspectRatio: '16/7', background: 'var(--color-surface)', marginBottom: '12px' }}>
                <img src={images[activeImg]} alt={project.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />

                {images.length > 1 && (
                  <>
                    <button onClick={() => setActiveImg(i => (i - 1 + images.length) % images.length)}
                      style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}>
                      <ChevronLeft size={20} />
                    </button>
                    <button onClick={() => setActiveImg(i => (i + 1) % images.length)}
                      style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}>
                      <ChevronRight size={20} />
                    </button>
                    <span style={{ position: 'absolute', bottom: '12px', right: '12px', background: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: '12px', padding: '4px 10px', borderRadius: '20px' }}>
                      {activeImg + 1} / {images.length}
                    </span>
                  </>
                )}
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {images.map((url, i) => (
                    <button key={i} onClick={() => setActiveImg(i)}
                      style={{ width: '72px', height: '54px', borderRadius: '8px', overflow: 'hidden', border: activeImg === i ? '2px solid var(--color-primary)' : '2px solid transparent', padding: 0, cursor: 'pointer', background: 'none', flexShrink: 0 }}>
                      <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Project Info */}
          <div>
            {/* Badges */}
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '16px' }}>
              <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, background: 'rgba(59,130,246,0.1)', color: 'var(--color-primary)', border: '1px solid rgba(59,130,246,0.2)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Tag size={12} /> {project.category}
              </span>
              <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, ...ss }}>
                {project.status}
              </span>
            </div>

            {/* Name */}
            <h1 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 800, color: 'var(--color-text-white)', margin: '0 0 12px', lineHeight: 1.2 }}>
              {project.name}
            </h1>

            {/* Tagline */}
            {project.tagline && (
              <p style={{ fontSize: '18px', color: 'var(--color-text-muted)', margin: '0 0 20px', lineHeight: 1.5 }}>
                {project.tagline}
              </p>
            )}

            {/* Location */}
            {project.location && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-text-muted)', fontSize: '14px', marginBottom: '24px' }}>
                <MapPin size={15} /> {project.location}
              </div>
            )}

            {/* Divider */}
            <div style={{ height: '1px', background: 'var(--color-border)', marginBottom: '24px' }} />

            {/* Description */}
            {project.description && (
              <div style={{ color: 'var(--color-text)', fontSize: '15px', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
                {project.description}
              </div>
            )}

            {/* CTA */}
            <div style={{ marginTop: '40px' }}>
              <Link href="/register" className="btn btn-primary btn-lg">
                Invest in WOORA
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
