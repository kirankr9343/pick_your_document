import React, { useState } from 'react';
import { Copy, Download, Check, RefreshCw } from 'lucide-react';

interface EditableTextAreaProps {
  initialText: string;
  wordCount: number;
  downloadUrl: string;
  onReset: () => void;
}

export const EditableTextArea: React.FC<EditableTextAreaProps> = ({
  initialText,
  wordCount,
  downloadUrl,
  onReset
}) => {
  const [text, setText] = useState(initialText);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadTxt = () => {
    const element = document.createElement("a");
    const file = new Blob([text], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = "extracted_ocr_text.txt";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div style={{
      background: 'var(--bg-surface)',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--border-subtle)',
      padding: '1.5rem',
      boxShadow: 'var(--shadow-md)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Extracted Text (OCR)</h3>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{text.split(/\s+/).filter(Boolean).length} Words</span>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={handleCopy} className="btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
            {copied ? <Check size={14} style={{ color: 'var(--success-text)' }} /> : <Copy size={14} />}
            {copied ? 'Copied!' : 'Copy'}
          </button>

          <button onClick={handleDownloadTxt} className="btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
            <Download size={14} /> Download TXT
          </button>
        </div>
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={12}
        style={{
          width: '100%',
          padding: '1rem',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
          background: 'var(--bg-primary)',
          color: 'var(--text-primary)',
          fontFamily: 'monospace',
          fontSize: '0.9rem',
          lineHeight: '1.5',
          outline: 'none',
          resize: 'vertical'
        }}
      />

      <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button onClick={onReset} className="btn-secondary">
          <RefreshCw size={16} /> Process Another Image
        </button>

        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          You can edit the text directly in the box above before copying or downloading.
        </span>
      </div>
    </div>
  );
};
