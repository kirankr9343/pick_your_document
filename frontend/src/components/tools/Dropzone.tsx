import React, { useState, useRef } from 'react';
import { UploadCloud, File, Trash2, ArrowUp, ArrowDown, FileText, AlertCircle, Sparkles } from 'lucide-react';
import { ToolConfig } from '../../config/tools.config';

interface DropzoneProps {
  tool: ToolConfig;
  selectedFiles: File[];
  setSelectedFiles: React.Dispatch<React.SetStateAction<File[]>>;
  pageRanges?: string;
  setPageRanges?: (val: string) => void;
  onStartProcess: () => void;
}

export const Dropzone: React.FC<DropzoneProps> = ({
  tool,
  selectedFiles,
  setSelectedFiles,
  pageRanges,
  setPageRanges,
  onStartProcess
}) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | File[]) => {
    setErrorMsg(null);
    const newFiles = Array.from(files);
    
    // Check max file size (50MB)
    const oversized = newFiles.find(f => f.size > 50 * 1024 * 1024);
    if (oversized) {
      setErrorMsg(`File '${oversized.name}' exceeds the 50MB maximum size limit.`);
      return;
    }

    if (tool.multipleFiles) {
      setSelectedFiles(prev => [...prev, ...newFiles]);
    } else {
      setSelectedFiles([newFiles[0]]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const moveFile = (index: number, direction: 'up' | 'down') => {
    setSelectedFiles(prev => {
      const copy = [...prev];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= copy.length) return copy;
      const temp = copy[index];
      copy[index] = copy[targetIndex];
      copy[targetIndex] = temp;
      return copy;
    });
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="fade-in-up" style={{ width: '100%' }}>
      {/* Animated Drag & Drop Box */}
      <div
        className={`dropzone-container ${isDragActive ? 'is-active' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click(); }}
        role="button"
        aria-label="Upload files area"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={tool.accept}
          multiple={tool.multipleFiles}
          onChange={(e) => { if (e.target.files) handleFiles(e.target.files); }}
          style={{ display: 'none' }}
        />

        <div className="floating-icon" style={{
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          background: 'rgba(59, 130, 246, 0.12)',
          color: 'var(--brand-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.25rem auto',
          boxShadow: '0 8px 20px rgba(59, 130, 246, 0.2)'
        }}>
          <UploadCloud size={36} />
        </div>

        <h3 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.5rem' }}>
          Drag & drop your {tool.inputFormats.join(', ')} file{tool.multipleFiles ? 's' : ''} here
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem', marginBottom: '1.5rem' }}>
          or browse files from your device (Max size: 50MB)
        </p>

        <button
          type="button"
          className="btn-primary"
          onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
        >
          <Sparkles size={16} /> Choose File{tool.multipleFiles ? 's' : ''}
        </button>
      </div>

      {/* Error message */}
      {errorMsg && (
        <div style={{
          marginTop: '1rem',
          padding: '0.85rem 1.25rem',
          background: 'var(--error-bg)',
          border: '1px solid var(--error-border)',
          color: 'var(--error-text)',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          fontSize: '0.9rem'
        }}>
          <AlertCircle size={20} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Selected Files List */}
      {selectedFiles.length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={18} style={{ color: 'var(--brand-primary)' }} /> Selected File{selectedFiles.length > 1 ? 's' : ''} ({selectedFiles.length})
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {selectedFiles.map((file, idx) => (
              <div
                key={idx}
                className="glass-card"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.9rem 1.25rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', overflow: 'hidden' }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    background: 'rgba(59, 130, 246, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--brand-primary)',
                    flexShrink: 0
                  }}>
                    <FileText size={20} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.925rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {file.name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {formatSize(file.size)}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {tool.multipleFiles && (
                    <>
                      <button
                        type="button"
                        onClick={() => moveFile(idx, 'up')}
                        disabled={idx === 0}
                        style={{ opacity: idx === 0 ? 0.3 : 1, background: 'none', border: 'none', cursor: 'pointer', padding: '0.3rem' }}
                        title="Move Up"
                      >
                        <ArrowUp size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveFile(idx, 'down')}
                        disabled={idx === selectedFiles.length - 1}
                        style={{ opacity: idx === selectedFiles.length - 1 ? 0.3 : 1, background: 'none', border: 'none', cursor: 'pointer', padding: '0.3rem' }}
                        title="Move Down"
                      >
                        <ArrowDown size={16} />
                      </button>
                    </>
                  )}

                  <button
                    type="button"
                    onClick={() => removeFile(idx)}
                    style={{ background: 'none', border: 'none', color: 'var(--error-text)', cursor: 'pointer', padding: '0.3rem' }}
                    title="Remove File"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Options for Split PDF */}
          {tool.id === 'split-pdf' && setPageRanges && (
            <div style={{ marginTop: '1.5rem' }}>
              <label style={{ display: 'block', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                Specify Page Ranges (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. 1-3, 5, 8-10 (Leave empty to split all pages)"
                value={pageRanges || ''}
                onChange={(e) => setPageRanges(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.85rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  background: 'var(--bg-surface)',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem',
                  outline: 'none'
                }}
              />
            </div>
          )}

          {/* Action Trigger */}
          <div style={{ marginTop: '1.75rem', textAlign: 'center' }}>
            <button
              onClick={onStartProcess}
              className="btn-primary pulse-badge"
              style={{ width: '100%', padding: '1rem', fontSize: '1.05rem' }}
            >
              Start Processing {tool.name}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
