import React from 'react';
import { CheckCircle2, Download, RefreshCw, Trash2, FileCheck, ArrowRight } from 'lucide-react';

interface ResultCardProps {
  toolName: string;
  downloadUrl: string;
  onReset: () => void;
  compressionStats?: {
    original_size: number;
    compressed_size: number;
    saved_bytes: number;
    percentage_saved: number;
  };
}

export const ResultCard: React.FC<ResultCardProps> = ({
  toolName,
  downloadUrl,
  onReset,
  compressionStats
}) => {
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = '';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div style={{
      textAlign: 'center',
      padding: '3rem 2rem',
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
        background: 'var(--success-bg)',
        color: 'var(--success-text)',
        border: '1px solid var(--success-border)',
        marginBottom: '1.25rem'
      }}>
        <CheckCircle2 size={36} />
      </div>

      <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
        ✓ Your file is ready!
      </h3>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
        Conversion via {toolName} finished successfully.
      </p>

      {/* Compression stats banner if present */}
      {compressionStats && (
        <div style={{
          display: 'inline-flex',
          gap: '1.5rem',
          padding: '0.9rem 1.5rem',
          background: 'var(--bg-primary)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
          marginBottom: '2rem',
          fontSize: '0.9rem'
        }}>
          <div>
            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>Original Size</span>
            <strong>{formatSize(compressionStats.original_size)}</strong>
          </div>
          <div style={{ borderLeft: '1px solid var(--border-subtle)', paddingLeft: '1.5rem' }}>
            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>Compressed Size</span>
            <strong>{formatSize(compressionStats.compressed_size)}</strong>
          </div>
          <div style={{ borderLeft: '1px solid var(--border-subtle)', paddingLeft: '1.5rem' }}>
            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>Saved</span>
            <strong style={{ color: 'var(--success-text)' }}>{compressionStats.percentage_saved}%</strong>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: '360px', margin: '0 auto' }}>
        <button
          onClick={handleDownload}
          className="btn-primary"
          style={{ padding: '0.9rem 1.5rem', fontSize: '1.05rem', width: '100%' }}
        >
          <Download size={20} /> Download Converted File
        </button>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={onReset}
            className="btn-secondary"
            style={{ flex: 1, padding: '0.7rem' }}
          >
            <RefreshCw size={16} /> Process Another File
          </button>

          <button
            onClick={onReset}
            className="btn-secondary"
            style={{ color: 'var(--error-text)', padding: '0.7rem' }}
            title="Delete temporary file"
          >
            <Trash2 size={16} /> Delete File
          </button>
        </div>
      </div>
    </div>
  );
};
