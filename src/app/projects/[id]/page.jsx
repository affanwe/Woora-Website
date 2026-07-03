"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, MapPin, Tag, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import ScrollReveal from '../../../components/ScrollReveal';

const STATUS_STYLES = {
  'Running':     { background: 'rgba(0,208,156,0.15)', color: '#00D09C', border: '1px solid rgba(0,208,156,0.3)' },
  'Coming Soon': { background: 'rgba(245,158,11,0.15)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.3)' },
  'Planning':    { background: 'rgba(99,102,241,0.15)', color: '#818CF8', border: '1px solid rgba(99,102,241,0.3)' },
};

const SECTION_TITLES = [
  'Project Introduction',
  'How We Operate',
  'Business Strategy',
  'Market Opportunity',
  'Investment Opportunity',
];

export default function ProjectDetail() {
  const { id } = useParams();
  const router = useRouter();
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

  const images = project.images || [];
  const ss = STATUS_STYLES[project.status] || STATUS_STYLES['Planning'];

  const sections = [
    { title: SECTION_TITLES[0], desc: project.section1_desc, image: project.section1_image, layout: 'text-left' },
    { title: SECTION_TITLES[1], desc: project.section2_desc, video: project.section2_video, layout: 'text-top' },
    { title: SECTION_TITLES[2], desc: project.section3_desc, image: project.section3_image, layout: 'text-right' },
    { title: SECTION_TITLES[3], desc: project.section4_desc, image: project.section4_image, layout: 'image-top' },
    { title: SECTION_TITLES[4], desc: project.section5_desc, image: project.section5_image, layout: 'text-left' },
  ];

  return (
    <div style={{ paddingBottom: '80px' }}>
      <div className="container" style={{ paddingTop: '40px', maxWidth: '1100px' }}>

        {/* Back */}
        <Link href="/projects" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--color-text-muted)', fontSize: '14px', textDecoration: 'none', marginBottom: '24px' }}>
          <ArrowLeft size={16} /> Back to Projects
        </Link>

        {/* Hero: Badges + Title */}
        <ScrollReveal>
          <div style={{ marginBottom: '32px' }}>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '12px' }}>
              <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, background: 'rgba(59,130,246,0.1)', color: 'var(--color-primary)', border: '1px solid rgba(59,130,246,0.2)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Tag size={12} /> {project.category}
              </span>
              <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, ...ss }}>
                {project.status}
              </span>
            </div>
            <h1 style={{ fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, color: 'var(--color-text-white)', margin: '0 0 8px', lineHeight: 1.15 }}>
              {project.name}
            </h1>
            {project.tagline && (
              <p style={{ fontSize: '17px', color: 'var(--color-text-muted)', margin: '0 0 8px', lineHeight: 1.5 }}>
                {project.tagline}
              </p>
            )}
            {project.location && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-text-muted)', fontSize: '14px' }}>
                <MapPin size={15} /> {project.location}
              </div>
            )}
          </div>
        </ScrollReveal>

        {/* Cover Image Gallery */}
        {images.length > 0 && (
          <ScrollReveal>
            <div style={{ marginBottom: '48px' }}>
              <div style={{ position: 'relative', borderRadius: '16px', overflow: 'hidden', aspectRatio: '16/9', background: 'var(--color-surface)', marginBottom: '12px' }}>
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
          </ScrollReveal>
        )}

        {/* 5 Content Sections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '64px' }}>
          {sections.map((sec, idx) => {
            const hasDesc = sec.desc && sec.desc.trim();
            const hasMedia = sec.image || sec.video;
            if (!hasDesc && !hasMedia) return null;

            return (
              <ScrollReveal key={idx} delay={idx * 0.05}>
                <div style={{ borderTop: '1px solid var(--border-color, rgba(255,255,255,0.08))', paddingTop: '32px' }}>
                  {/* Section Label */}
                  <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-primary, #00D09C)', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '16px' }}>
                    {sec.title}
                  </div>

                  {/* Layout: text-left = desc left, image right */}
                  {sec.layout === 'text-left' && (
                    <div className={hasMedia ? 'pd-grid' : ''} style={hasMedia ? {} : {}}>
                      <div style={{ color: 'var(--color-text, #ccc)', fontSize: '15px', lineHeight: 1.85, whiteSpace: 'pre-wrap' }}>
                        {hasDesc && sec.desc}
                      </div>
                      {hasMedia && (
                        <div style={{ borderRadius: '12px', overflow: 'hidden' }}>
                          <img src={sec.image} alt={sec.title} style={{ width: '100%', height: 'auto', objectFit: 'cover', borderRadius: '12px' }} />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Layout: text-top = desc on top, video below */}
                  {sec.layout === 'text-top' && (
                    <div>
                      {hasDesc && (
                        <div style={{ color: 'var(--color-text, #ccc)', fontSize: '15px', lineHeight: 1.85, whiteSpace: 'pre-wrap', marginBottom: hasMedia ? '24px' : 0 }}>
                          {sec.desc}
                        </div>
                      )}
                      {sec.video && (
                        <div style={{ borderRadius: '12px', overflow: 'hidden', background: '#000' }}>
                          <video src={sec.video} controls style={{ width: '100%', maxHeight: '500px', borderRadius: '12px' }} />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Layout: text-right = image left, desc right */}
                  {sec.layout === 'text-right' && (
                    <div className={hasMedia ? 'pd-grid' : ''} style={hasMedia ? {} : {}}>
                      {hasMedia && (
                        <div style={{ borderRadius: '12px', overflow: 'hidden' }}>
                          <img src={sec.image} alt={sec.title} style={{ width: '100%', height: 'auto', objectFit: 'cover', borderRadius: '12px' }} />
                        </div>
                      )}
                      <div style={{ color: 'var(--color-text, #ccc)', fontSize: '15px', lineHeight: 1.85, whiteSpace: 'pre-wrap' }}>
                        {hasDesc && sec.desc}
                      </div>
                    </div>
                  )}

                  {/* Layout: image-top = image on top, desc below */}
                  {sec.layout === 'image-top' && (
                    <div>
                      {hasMedia && (
                        <div style={{ borderRadius: '12px', overflow: 'hidden', marginBottom: hasDesc ? '24px' : 0 }}>
                          <img src={sec.image} alt={sec.title} style={{ width: '100%', height: 'auto', objectFit: 'cover', borderRadius: '12px' }} />
                        </div>
                      )}
                      {hasDesc && (
                        <div style={{ color: 'var(--color-text, #ccc)', fontSize: '15px', lineHeight: 1.85, whiteSpace: 'pre-wrap' }}>
                          {sec.desc}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </ScrollReveal>
            );
          })}
        </div>

        {/* CTA */}
        <ScrollReveal>
          <div style={{ marginTop: '64px', textAlign: 'center', padding: '48px 24px', borderRadius: '16px', background: 'rgba(0,208,156,0.04)', border: '1px solid rgba(0,208,156,0.1)' }}>
            <h3 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--color-text-white)', margin: '0 0 12px' }}>
              Interested in this project?
            </h3>
            <p style={{ fontSize: '15px', color: 'var(--color-text-muted)', margin: '0 0 24px' }}>
              Start investing with WOORA Group today.
            </p>
            <Link href="/register" className="btn btn-primary btn-lg" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              Invest Now <ArrowRight size={16} />
            </Link>
          </div>
        </ScrollReveal>
      </div>

      <style>{`
        .pd-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; align-items: center; }
        @media (max-width: 768px) { .pd-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
}
