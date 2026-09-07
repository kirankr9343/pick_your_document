import React from 'react';
import { Shield, Zap, Lock, Sparkles, CheckCircle2 } from 'lucide-react';

export const About: React.FC = () => {
  return (
    <div className="app-container" style={{ padding: '3.5rem 1.25rem', maxWidth: '900px' }}>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem', textAlign: 'center' }}>
        About Pick Your Document
      </h1>
      <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '3rem' }}>
        Our mission is to build the cleanest, fastest, and most privacy-focused document conversion and AI platform on the web.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
        <div className="glass-card" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--brand-primary)' }}>
            The Vision
          </h2>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: '1.7' }}>
            Pick Your Document was created to solve cluttered, ad-riddled, and untrustworthy document converter websites. We provide clean, instant, and mobile-friendly tools for converting PDFs, Word files, images, performing OCR text extraction, splitting, merging, compressing, and leveraging AI for document understanding.
          </p>
        </div>

        <div className="glass-card" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--brand-primary)' }}>
            Privacy Architecture First
          </h2>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: '1.7', marginBottom: '1rem' }}>
            We believe your sensitive documents belong only to you. Our architecture enforces strict security principles:
          </p>
          <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
            <li>Temporary storage only: files are stored with obfuscated UUID names in isolated memory.</li>
            <li>Automatic deletion: all uploaded and output files expire and are permanently purged automatically.</li>
            <li>No content logging: document text, extracted text, or image files are never logged or sold.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
