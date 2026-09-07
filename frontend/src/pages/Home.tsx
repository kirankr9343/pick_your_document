import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { TOOLS_CONFIG } from '../config/tools.config';
import { ArrowRight, ShieldCheck, Zap, Lock, Sparkles, FileText } from 'lucide-react';
import { AdBanner } from '../components/ads/AdBanner';

export const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem', paddingBottom: '3rem' }}>
      
      {/* HERO SECTION */}
      <section className="fade-in-up" style={{
        textAlign: 'center',
        padding: '4.5rem 1rem 2.5rem 1rem',
        maxWidth: '900px',
        margin: '0 auto'
      }}>
        <div className="pulse-badge" style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.45rem 1.2rem',
          borderRadius: '999px',
          background: 'rgba(99, 102, 241, 0.12)',
          color: 'var(--brand-primary)',
          fontSize: '0.875rem',
          fontWeight: 700,
          marginBottom: '1.75rem',
          border: '1px solid rgba(99, 102, 241, 0.25)'
        }}>
          <Sparkles size={16} /> All-in-One Fast Document Conversion Platform
        </div>

        <h1 style={{
          fontSize: 'clamp(2.75rem, 5vw, 4.25rem)',
          fontWeight: 800,
          lineHeight: 1.1,
          marginBottom: '1.25rem',
          color: 'var(--text-primary)'
        }}>
          All your documents. <br />
          <span className="gradient-text">
            One place.
          </span>
        </h1>

        <p style={{
          fontSize: '1.25rem',
          color: 'var(--text-secondary)',
          maxWidth: '680px',
          margin: '0 auto 2.5rem auto',
          lineHeight: 1.6
        }}>
          Convert, extract, compress, organize, and transform your files in seconds with zero hassle and maximum privacy.
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => navigate('/tools')} className="btn-primary" style={{ padding: '1rem 2.25rem', fontSize: '1.1rem' }}>
            Choose a Tool <ArrowRight size={20} />
          </button>
          <button onClick={() => navigate('/tools')} className="btn-secondary" style={{ padding: '1rem 2.25rem', fontSize: '1.1rem' }}>
            Explore All 10 Tools
          </button>
        </div>
      </section>

      {/* TOP ADSENSE BANNER */}
      <div className="app-container">
        <AdBanner slot="top-hero-banner" format="banner" />
      </div>

      {/* QUICK POPULAR TOOLS GRID */}
      <section className="app-container fade-in-up">
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '2.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>
            Most Popular Document Tools
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem' }}>
            Select a tool below to convert or transform your files instantly
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '1.5rem'
        }}>
          {Object.values(TOOLS_CONFIG).map((tool) => (
            <Link
              key={tool.id}
              to={`/tools/${tool.id}`}
              className="glass-card"
              style={{
                padding: '1.75rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                cursor: 'pointer'
              }}
            >
              <div>
                <div style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '14px',
                  background: 'rgba(59, 130, 246, 0.12)',
                  color: 'var(--brand-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.25rem'
                }}>
                  <FileText size={26} />
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>{tool.name}</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>{tool.tagline}</p>
              </div>

              <div style={{
                marginTop: '1.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                color: 'var(--brand-primary)',
                fontWeight: 700,
                fontSize: '0.925rem'
              }}>
                Use Tool <ArrowRight size={16} />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* MIDDLE ADSENSE BANNER */}
      <div className="app-container">
        <AdBanner slot="mid-content-banner" format="fluid" />
      </div>

      {/* FEATURES / TRUST SECTION */}
      <section className="app-container">
        <div className="glass-card" style={{ padding: '3.5rem 2rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <h2 style={{ fontSize: '2.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>
              Why Choose Pick Your Document?
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem' }}>
              Built for lightning speed, mobile privacy, and high conversion accuracy.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '2.5rem' }}>
            <div style={{ textAlign: 'center' }}>
              <div className="floating-icon" style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'rgba(16, 185, 129, 0.12)',
                color: '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem auto'
              }}>
                <Zap size={32} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Lightning Fast</h3>
              <p style={{ fontSize: '0.925rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                Powered by high performance document conversion engines for sub-second processing.
              </p>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div className="floating-icon" style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'rgba(59, 130, 246, 0.12)',
                color: '#3b82f6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem auto'
              }}>
                <Lock size={32} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>100% Secure & Private</h3>
              <p style={{ fontSize: '0.925rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                All uploaded temporary files are automatically deleted after processing. We never store document content.
              </p>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div className="floating-icon" style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'rgba(139, 92, 246, 0.12)',
                color: '#8b5cf6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem auto'
              }}>
                <Sparkles size={32} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>AI Powered Intelligence</h3>
              <p style={{ fontSize: '0.925rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                Extract instant executive summaries, key points, action items, and important terms from long PDFs.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
