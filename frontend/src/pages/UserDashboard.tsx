import React from 'react';
import { Link } from 'react-router-dom';
import { User, FileText, Sparkles, Activity, ShieldCheck, Clock, Settings, ArrowRight, HardDrive, CheckCircle2 } from 'lucide-react';

interface UserDashboardProps {
  user?: any;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({ user: currentUser }) => {
  const savedUser = React.useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}');
    } catch (e) {
      return {};
    }
  }, []);

  const activeUser = currentUser || savedUser;
  const isUserAdmin = activeUser?.is_admin || activeUser?.role === 'ADMIN' || activeUser?.role === 'SUPER_ADMIN';

  return (
    <div className="app-container" style={{ padding: '3rem 1.25rem' }}>
      {/* HEADER BANNER */}
      <div className="glass-card" style={{ padding: '2rem', marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'var(--brand-gradient)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            fontWeight: 800,
            fontSize: '1.5rem',
            overflow: 'hidden'
          }}>
            {activeUser?.profile_image_url ? (
              <img src={activeUser.profile_image_url} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              (activeUser?.name || 'U').charAt(0).toUpperCase()
            )}
          </div>

          <div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.25rem' }}>
              Welcome back, {activeUser?.name || 'Member'}!
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              <span>{activeUser?.email || 'user@gmail.com'}</span>
              <span style={{
                padding: '0.2rem 0.6rem',
                borderRadius: '999px',
                fontSize: '0.75rem',
                fontWeight: 700,
                background: isUserAdmin ? 'rgba(59, 130, 246, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                color: isUserAdmin ? '#3b82f6' : '#10b981'
              }}>
                Account Role: {isUserAdmin ? 'Administrator' : 'User'}
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/tools" className="btn-primary" style={{ padding: '0.65rem 1.25rem', fontSize: '0.9rem' }}>
            <Sparkles size={16} /> Explore All Tools
          </Link>
          {isUserAdmin && (
            <Link to="/admin" className="btn-secondary" style={{ padding: '0.65rem 1.25rem', fontSize: '0.9rem' }}>
              Admin Dashboard
            </Link>
          )}
        </div>
      </div>

      {/* METRICS ROW */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Total Conversions
          </span>
          <strong style={{ fontSize: '1.8rem', fontWeight: 800 }}>12</strong>
          <span style={{ fontSize: '0.75rem', color: '#10b981', display: 'block', marginTop: '0.25rem' }}>● 100% Success Rate</span>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Current Subscription
          </span>
          <strong style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--brand-primary)' }}>Free Starter</strong>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginTop: '0.25rem' }}>Up to 50MB per file</span>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Google Identity
          </span>
          <strong style={{ fontSize: '1.2rem', fontWeight: 700, color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.4rem' }}>
            <CheckCircle2 size={18} /> Verified OAuth 2.0
          </strong>
        </div>
      </div>

      {/* QUICK LAUNCH TOOLS */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '1.25rem' }}>Favorite Conversion Tools</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
          {[
            { id: 'pdf-to-word', name: 'PDF to Word', desc: 'Convert PDF files to editable DOCX documents' },
            { id: 'image-to-text', name: 'Image to Text OCR', desc: 'Extract text from scanned images and photos' },
            { id: 'compress-pdf', name: 'Compress PDF', desc: 'Reduce PDF file size without quality loss' },
            { id: 'ai-summary', name: 'AI Document Summarizer', desc: 'Generate instant key insights & summaries' },
          ].map(tool => (
            <Link
              key={tool.id}
              to={`/tools/${tool.id}`}
              className="glass-card"
              style={{
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                textDecoration: 'none',
                color: 'inherit',
                transition: 'transform 0.2s ease, border-color 0.2s ease'
              }}
            >
              <div>
                <strong style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--brand-primary)', display: 'block', marginBottom: '0.4rem' }}>
                  {tool.name}
                </strong>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                  {tool.desc}
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', fontWeight: 700, color: 'var(--brand-primary)', marginTop: '1rem' }}>
                Launch Tool <ArrowRight size={14} />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};
