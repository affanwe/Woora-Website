"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { BarChart3, MapPin, ArrowRight, FolderOpen } from 'lucide-react';
import ScrollReveal from '../../components/ScrollReveal';
import TiltCard from '../../components/TiltCard';
import { supabase } from '../../lib/supabase';

const STATUS_STYLES = {
  'Running':     { background: 'rgba(0,208,156,0.15)', color: '#00D09C', border: '1px solid rgba(0,208,156,0.3)' },
  'Coming Soon': { background: 'rgba(245,158,11,0.15)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.3)' },
  'Planning':    { background: 'rgba(99,102,241,0.15)', color: '#818CF8', border: '1px solid rgba(99,102,241,0.3)' },
};

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setProjects(data || []);
        setLoading(false);
      });
  }, []);

  return (
    <div className="projects-page">

      {/* Hero */}
      <section className="projects-hero">
        <div className="container">
          <ScrollReveal direction="up" delay={0.1}>
            <span className="projects-hero__badge">
              <BarChart3 size={14} /> Investment Opportunities
            </span>
          </ScrollReveal>
          <ScrollReveal direction="up" delay={0.2}>
            <h1 className="projects-hero__title">
              Our Investment <span className="gradient-text">Projects</span>
            </h1>
          </ScrollReveal>
          <ScrollReveal direction="up" delay={0.3}>
            <p className="projects-hero__subtitle">
              Every project listed on WOORA Group undergoes rigorous due diligence,
              financial auditing, and risk assessment before launch.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="projects-grid-section section">
        <div className="container">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '80px', color: 'var(--color-text-muted)' }}>Loading projects...</div>
          ) : projects.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--color-text-muted)' }}>
              <FolderOpen size={48} style={{ opacity: 0.3, marginBottom: '16px', display: 'block', margin: '0 auto 16px' }} />
              <p>Projects coming soon. Stay tuned.</p>
            </div>
          ) : (
            <div className="projects-grid">
              {projects.map((project, index) => {
                const ss = STATUS_STYLES[project.status] || STATUS_STYLES['Planning'];
                const coverImg = project.images && project.images.length > 0 ? project.images[0] : null;
                return (
                  <ScrollReveal key={project.id} direction="up" delay={0.1 + index * 0.08}>
                    <TiltCard className="project-card-3d">
                      {/* Image */}
                      <div className="project-card__image-wrapper" style={{ position: 'relative' }}>
                        {coverImg ? (
                          <img src={coverImg} alt={project.name} className="project-card__image" loading="lazy" />
                        ) : (
                          <div className="project-card__image" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-surface)' }}>
                            <FolderOpen size={40} style={{ opacity: 0.2 }} />
                          </div>
                        )}
                        <span className="project-card__category-badge">{project.category}</span>
                        <span style={{ position: 'absolute', top: '10px', right: '10px', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 600, ...ss }}>{project.status}</span>
                        <div className="project-card__image-overlay" />
                      </div>

                      {/* Body */}
                      <div className="project-card__body">
                        <h3 className="project-card__title">{project.name}</h3>
                        {project.tagline && (
                          <p className="project-card__description">{project.tagline}</p>
                        )}
                        {project.location && (
                          <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '4px', margin: '0 0 16px' }}>
                            <MapPin size={13} /> {project.location}
                          </p>
                        )}
                        <Link href={`/projects/${project.id}`} className="project-card__btn">
                          View Details <ArrowRight size={16} />
                        </Link>
                      </div>
                    </TiltCard>
                  </ScrollReveal>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
