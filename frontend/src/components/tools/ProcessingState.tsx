import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

interface ProcessingStateProps {
  toolName: string;
}

export const ProcessingState: React.FC<ProcessingStateProps> = ({ toolName }) => {
  const [progress, setProgress] = useState(15);
  const [stageText, setStageText] = useState('Uploading document...');

  useEffect(() => {
    const timer1 = setTimeout(() => {
      setProgress(45);
      setStageText('Processing file structure...');
    }, 800);

    const timer2 = setTimeout(() => {
      setProgress(75);
      setStageText('Converting and formatting output...');
    }, 1800);

    const timer3 = setTimeout(() => {
      setProgress(95);
      setStageText('Finalizing download payload...');
    }, 2800);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  return (
    <div style={{
      textAlign: 'center',
      padding: '3.5rem 2rem',
      background: 'var(--bg-surface)',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--border-subtle)',
      boxShadow: 'var(--shadow-md)'
    }}>
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '64px',
        height: '64px',
        borderRadius: '50%',
        background: 'rgba(59, 130, 246, 0.1)',
        color: 'var(--brand-primary)',
        marginBottom: '1.25rem'
      }}>
        <Loader2 size={32} className="animate-spin" />
      </div>

      <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>
        Processing your file with {toolName}
      </h3>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
        {stageText}
      </p>

      {/* Progress track */}
      <div style={{ maxWidth: '400px', margin: '0 auto' }}>
        <div className="progress-bar-track">
          <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
        </div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem', textAlign: 'right' }}>
          {progress}%
        </div>
      </div>
    </div>
  );
};
