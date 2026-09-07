import React from 'react';
import { Check, Sparkles, Zap } from 'lucide-react';

export const Pricing: React.FC = () => {
  return (
    <div className="app-container" style={{ padding: '3.5rem 1.25rem' }}>
      <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto 3.5rem auto' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.75rem' }}>
          Simple, Transparent Pricing
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
          All MVP conversion tools are 100% free. Upgrade to Pro for high volume batch processing and advanced AI limits.
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '2rem',
        maxWidth: '900px',
        margin: '0 auto'
      }}>
        
        {/* FREE PLAN */}
        <div className="glass-card" style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Free Tier
            </span>
            <h2 style={{ fontSize: '2.25rem', fontWeight: 800, margin: '0.5rem 0 1rem 0' }}>$0</h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              Perfect for quick everyday document conversions and OCR text extraction.
            </p>

            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem', marginBottom: '2rem' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Check size={16} style={{ color: '#10b981' }} /> All 10 Document Converters</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Check size={16} style={{ color: '#10b981' }} /> Up to 50MB File Size Limit</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Check size={16} style={{ color: '#10b981' }} /> Image to Text OCR</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Check size={16} style={{ color: '#10b981' }} /> Basic AI PDF Summary</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Check size={16} style={{ color: '#10b981' }} /> Anonymous Conversion Allowed</li>
            </ul>
          </div>

          <button className="btn-secondary" style={{ width: '100%', padding: '0.8rem' }}>
            Current Default Plan
          </button>
        </div>

        {/* PRO PLAN */}
        <div className="glass-card" style={{
          padding: '2.5rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          borderColor: 'var(--brand-primary)',
          boxShadow: '0 8px 30px rgba(59, 130, 246, 0.2)',
          position: 'relative'
        }}>
          <div style={{
            position: 'absolute',
            top: '-12px',
            right: '24px',
            background: 'var(--brand-gradient)',
            color: '#fff',
            fontSize: '0.75rem',
            fontWeight: 700,
            padding: '0.2rem 0.8rem',
            borderRadius: '999px'
          }}>
            POPULAR
          </div>

          <div>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--brand-primary)', textTransform: 'uppercase' }}>
              Pro Plan
            </span>
            <h2 style={{ fontSize: '2.25rem', fontWeight: 800, margin: '0.5rem 0 1rem 0' }}>
              $9 <span style={{ fontSize: '1rem', fontWeight: 400, color: 'var(--text-muted)' }}>/ month</span>
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              Designed for power users, teams, and high-frequency document workflows.
            </p>

            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem', marginBottom: '2rem' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Check size={16} style={{ color: '#10b981' }} /> Everything in Free Plan</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Check size={16} style={{ color: '#10b981' }} /> Up to 500MB File Size Limit</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Check size={16} style={{ color: '#10b981' }} /> Batch Multi-file Operations</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Check size={16} style={{ color: '#10b981' }} /> Priority Worker Queue Processing</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Check size={16} style={{ color: '#10b981' }} /> Zero Advertisements</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Check size={16} style={{ color: '#10b981' }} /> Advanced Multi-language AI Summary</li>
            </ul>
          </div>

          <button className="btn-primary" style={{ width: '100%', padding: '0.8rem' }}>
            <Sparkles size={16} /> Upgrade to Pro (Coming Soon)
          </button>
        </div>

      </div>
    </div>
  );
};
