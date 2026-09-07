import React from 'react';
import { Link } from 'react-router-dom';
import { FileCode, Shield, Lock, FileText, CheckCircle2 } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer style={{
      background: 'var(--bg-surface)',
      borderTop: '1px solid var(--border-subtle)',
      padding: '4rem 0 2rem 0',
      marginTop: '5rem'
    }}>
      <div className="app-container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2.5rem', marginBottom: '3rem' }}>
          
          {/* Brand Info */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'var(--brand-gradient)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff'
              }}>
                <FileCode size={18} />
              </div>
              <span style={{ fontSize: '1.1rem', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>
                Pick Your Document
              </span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1rem' }}>
              Free online tools to convert, extract, organize, and transform your documents securely.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
              <Shield size={16} /> 100% Secure & Temporary File Storage
            </div>
          </div>

          {/* PDF Tools */}
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>PDF Tools</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              <li><Link to="/tools/pdf-to-word">PDF to Word</Link></li>
              <li><Link to="/tools/pdf-to-text">PDF to Text</Link></li>
              <li><Link to="/tools/pdf-to-jpg">PDF to JPG</Link></li>
              <li><Link to="/tools/merge-pdf">Merge PDF</Link></li>
              <li><Link to="/tools/split-pdf">Split PDF</Link></li>
              <li><Link to="/tools/compress-pdf">Compress PDF</Link></li>
            </ul>
          </div>

          {/* Image & AI Tools */}
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>Image & AI Tools</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              <li><Link to="/tools/image-to-text">Image to Text (OCR)</Link></li>
              <li><Link to="/tools/image-to-pdf">Image to PDF</Link></li>
              <li><Link to="/tools/word-to-pdf">Word to PDF</Link></li>
              <li><Link to="/tools/pdf-summary">AI PDF Summary</Link></li>
            </ul>
          </div>

          {/* Company & Legal */}
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>Company & Legal</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/pricing">Pricing & Plans</Link></li>
              <li><Link to="/faq">Frequently Asked Questions</Link></li>
              <li><Link to="/privacy">Privacy Policy</Link></li>
              <li><Link to="/terms">Terms of Service</Link></li>
              <li><Link to="/security">Security Specifications</Link></li>
            </ul>
          </div>

        </div>

        <div style={{
          borderTop: '1px solid var(--border-subtle)',
          paddingTop: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          fontSize: '0.85rem',
          color: 'var(--text-muted)'
        }}>
          <div>
            © {new Date().getFullYear()} Pick Your Document. All rights reserved.
          </div>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <span>Convert. Extract. Create. Simplify.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
