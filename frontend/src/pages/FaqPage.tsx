import React from 'react';

export const FaqPage: React.FC = () => {
  const faqs = [
    {
      q: 'Is Pick Your Document completely free to use?',
      a: 'Yes! All 10 core conversion, extraction, PDF manipulation, and AI tools are fully functional and free for standard file sizes.'
    },
    {
      q: 'What happens to my uploaded files after conversion?',
      a: 'Files are processed securely in temporary server memory with random UUID filenames. They are automatically deleted after processing and within 2 hours maximum.'
    },
    {
      q: 'Do I need to register an account to convert files?',
      a: 'No account registration is required for anonymous conversions. Registering an account allows you to save processing history and usage preferences.'
    },
    {
      q: 'What file formats are currently supported?',
      a: 'We support PDF, DOC, DOCX, JPG, JPEG, PNG, WebP, TXT, XLS, XLSX, PPT, and PPTX.'
    },
    {
      q: 'What is the maximum file size limit?',
      a: 'The current file size limit is 50MB per upload for standard anonymous users.'
    }
  ];

  return (
    <div className="app-container" style={{ padding: '3.5rem 1.25rem', maxWidth: '800px' }}>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem', textAlign: 'center' }}>
        Frequently Asked Questions
      </h1>
      <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '3rem' }}>
        Find answers to common questions about document conversion, security, and AI tools.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {faqs.map((f, i) => (
          <div key={i} className="glass-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>{f.q}</h3>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>{f.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
