import React from 'react';
import { useLocation } from 'react-router-dom';

export const LegalPage: React.FC = () => {
  const location = useLocation();
  const path = location.pathname.replace('/', '');

  const getContent = () => {
    switch (path) {
      case 'terms':
        return {
          title: 'Terms of Service',
          text: `
## 1. Acceptance of Terms
By accessing or using Pick Your Document, you agree to comply with and be bound by these Terms of Service.

## 2. Authorized Use
Pick Your Document provides automated file conversion, OCR extraction, PDF utilities, and AI summarization. You agree not to upload illegal, malicious, or copyright-infringing content.

## 3. Temporary Processing & Retention
Uploaded files are processed automatically and temporarily. You acknowledge that uploaded files are automatically deleted after processing.

## 4. Limitation of Liability
Document conversions are provided on a best-effort basis without warranties of perfect layout preservation. Pick Your Document shall not be liable for incidental or consequential damages.
          `
        };
      case 'security':
        return {
          title: 'Security Architecture Specifications',
          text: `
## 1. File Validation & Isolation
- Extension, MIME type, and file size validation (max 50MB).
- Random UUID internal storage pathing to prevent guessing or enumeration attacks.
- Path traversal protection asserting file boundaries strictly within temporary storage directories.

## 2. Automated File Purging
- Background cron worker automatically purges expired temporary storage files older than 2 hours.
- Download links use cryptographically random hex tokens.

## 3. Communication Security
- HTTPS forced transport layer security.
- CORS policy restricts unauthorized cross-origin requests.
- IP-based and account-based rate limiting prevents denial-of-service abuse.
          `
        };
      case 'privacy':
      default:
        return {
          title: 'Privacy Policy',
          text: `
## 1. File Retention Policy
Pick Your Document is built with privacy at its core. **We do NOT permanently retain uploaded files.**
- Files uploaded by users are stored temporarily in isolated memory solely to perform the requested conversion.
- Once conversion completes or after 2 hours maximum, temporary files are permanently erased from disk.

## 2. Information We Collect
- Technical logs: Anonymous IP address, request timestamp, endpoint accessed, file size, and processing duration.
- We do NOT log, store, or sell document textual contents, OCR results, or summary outputs.

## 3. Third-Party Services
If you use AI summarization features, document text is processed strictly through configured secure API abstractions (e.g. OpenAI / Gemini) without persistent training retention.
          `
        };
    }
  };

  const content = getContent();

  return (
    <div className="app-container" style={{ padding: '3.5rem 1.25rem', maxWidth: '800px' }}>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '2rem' }}>
        {content.title}
      </h1>
      <div className="glass-card" style={{ padding: '2rem', lineHeight: '1.8', color: 'var(--text-secondary)' }}>
        {content.text.split('\n\n').map((para, idx) => {
          if (para.startsWith('## ')) {
            return <h2 key={idx} style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', margin: '1.5rem 0 0.5rem 0' }}>{para.replace('## ', '')}</h2>;
          }
          return <p key={idx} style={{ marginBottom: '1rem' }}>{para}</p>;
        })}
      </div>
    </div>
  );
};
