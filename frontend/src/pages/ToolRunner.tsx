import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { TOOLS_CONFIG } from '../config/tools.config';
import { Dropzone } from '../components/tools/Dropzone';
import { ProcessingState } from '../components/tools/ProcessingState';
import { ResultCard } from '../components/tools/ResultCard';
import { EditableTextArea } from '../components/tools/EditableTextArea';
import { AiSummaryDisplay } from '../components/tools/AiSummaryDisplay';
import { AdBanner } from '../components/ads/AdBanner';
import { AlertTriangle, ChevronRight, HelpCircle } from 'lucide-react';

import {
  clientMergePdf,
  clientSplitPdf,
  clientImageToPdf,
  clientImageToText,
  clientCompressPdf,
  clientPdfToText,
  clientPdfToWord,
  clientWordToPdf,
  clientPdfToJpg,
  clientPdfSummary
} from '../lib/clientConverters';

export const ToolRunner: React.FC = () => {
  const { toolId } = useParams<{ toolId: string }>();
  const tool = toolId ? TOOLS_CONFIG[toolId] : undefined;

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [pageRanges, setPageRanges] = useState('');
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [ocrText, setOcrText] = useState<string | null>(null);
  const [ocrWordCount, setOcrWordCount] = useState<number>(0);
  const [aiData, setAiData] = useState<any>(null);
  const [compressionStats, setCompressionStats] = useState<any>(null);

  // Update window document title dynamically for SEO
  useEffect(() => {
    if (tool) {
      document.title = tool.seoTitle;
    }
  }, [tool]);

  if (!tool) {
    return (
      <div className="app-container" style={{ textAlign: 'center', padding: '5rem 1rem' }}>
        <h2>Tool Not Found</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>The requested document tool does not exist.</p>
        <Link to="/tools" className="btn-primary">Browse All Tools</Link>
      </div>
    );
  }

  const handleStartProcess = async () => {
    if (selectedFiles.length === 0) return;

    setStatus('processing');
    setErrorMsg(null);

    const formData = new FormData();
    if (tool.multipleFiles) {
      selectedFiles.forEach((file) => formData.append('files', file));
    } else {
      formData.append('file', selectedFiles[0]);
    }

    if (tool.id === 'split-pdf' && pageRanges) {
      formData.append('page_ranges', pageRanges);
    }

    try {
      // 1. Try Backend API call first
      let apiSuccess = false;
      try {
        const response = await fetch(tool.apiEndpoint, {
          method: 'POST',
          body: formData,
        });

        const contentType = response.headers.get('content-type') || '';
        if (response.ok && contentType.includes('application/json')) {
          const data = await response.json();
          if (data.success) {
            setDownloadUrl(data.download_url);
            if (tool.id === 'image-to-text' && data.extracted_text !== undefined) {
              setOcrText(data.extracted_text);
              setOcrWordCount(data.word_count || 0);
            }
            if (tool.id === 'pdf-summary' && data.summary_data) {
              setAiData(data.summary_data);
            }
            if (tool.id === 'compress-pdf' && data.percentage_saved !== undefined) {
              setCompressionStats({
                original_size: data.original_size,
                compressed_size: data.compressed_size,
                saved_bytes: data.saved_bytes,
                percentage_saved: data.percentage_saved
              });
            }
            apiSuccess = true;
          }
        }
      } catch (backendErr) {
        // Backend not available or running on static host like GitHub Pages
      }

      // 2. Client-side fallback if backend call wasn't available
      if (!apiSuccess) {
        const primaryFile = selectedFiles[0];

        switch (tool.id) {
          case 'merge-pdf': {
            const res = await clientMergePdf(selectedFiles);
            setDownloadUrl(res.download_url);
            break;
          }
          case 'split-pdf': {
            const res = await clientSplitPdf(primaryFile, pageRanges);
            setDownloadUrl(res.download_url);
            break;
          }
          case 'image-to-pdf': {
            const res = await clientImageToPdf(selectedFiles);
            setDownloadUrl(res.download_url);
            break;
          }
          case 'image-to-text': {
            const res = await clientImageToText(primaryFile);
            setOcrText(res.extracted_text);
            setOcrWordCount(res.word_count);
            setDownloadUrl(res.download_url);
            break;
          }
          case 'compress-pdf': {
            const res = await clientCompressPdf(primaryFile);
            setDownloadUrl(res.download_url);
            setCompressionStats({
              original_size: res.original_size,
              compressed_size: res.compressed_size,
              saved_bytes: res.saved_bytes,
              percentage_saved: res.percentage_saved
            });
            break;
          }
          case 'pdf-to-text': {
            const res = await clientPdfToText(primaryFile);
            setDownloadUrl(res.download_url);
            break;
          }
          case 'pdf-to-word': {
            const res = await clientPdfToWord(primaryFile);
            setDownloadUrl(res.download_url);
            break;
          }
          case 'word-to-pdf': {
            const res = await clientWordToPdf(primaryFile);
            setDownloadUrl(res.download_url);
            break;
          }
          case 'pdf-to-jpg': {
            const res = await clientPdfToJpg(primaryFile);
            setDownloadUrl(res.download_url);
            break;
          }
          case 'pdf-summary': {
            const res = await clientPdfSummary(primaryFile);
            setAiData(res.summary_data);
            setDownloadUrl(URL.createObjectURL(new Blob([JSON.stringify(res.summary_data, null, 2)], { type: 'application/json' })));
            break;
          }
          default:
            throw new Error(`Tool '${tool.id}' engine processing fallback not configured.`);
        }
      }

      setStatus('success');
    } catch (err: any) {
      setStatus('error');
      setErrorMsg(err.message || 'An error occurred during file conversion.');
    }
  };

  const handleReset = () => {
    setSelectedFiles([]);
    setPageRanges('');
    setStatus('idle');
    setErrorMsg(null);
    setDownloadUrl(null);
    setOcrText(null);
    setAiData(null);
    setCompressionStats(null);
  };

  return (
    <div className="app-container" style={{ padding: '2.5rem 1.25rem' }}>
      
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
        <Link to="/" style={{ color: 'var(--text-muted)' }}>Home</Link>
        <ChevronRight size={14} />
        <Link to="/tools" style={{ color: 'var(--text-muted)' }}>Tools</Link>
        <ChevronRight size={14} />
        <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{tool.name}</span>
      </div>

      {/* Header */}
      <div style={{ textAlign: 'center', maxWidth: '750px', margin: '0 auto 2.5rem auto' }}>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, marginBottom: '0.75rem' }}>
          {tool.name}
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: '1.5' }}>
          {tool.description}
        </p>
      </div>

      {/* TOOL INTERACTIVE WORKFLOW REGION */}
      <div style={{ maxWidth: '700px', margin: '0 auto 4rem auto' }}>
        {status === 'idle' && (
          <Dropzone
            tool={tool}
            selectedFiles={selectedFiles}
            setSelectedFiles={setSelectedFiles}
            pageRanges={pageRanges}
            setPageRanges={setPageRanges}
            onStartProcess={handleStartProcess}
          />
        )}

        {status === 'processing' && (
          <ProcessingState toolName={tool.name} />
        )}

        {status === 'error' && (
          <div style={{
            textAlign: 'center',
            padding: '2.5rem 2rem',
            background: 'var(--error-bg)',
            border: '1px solid var(--error-border)',
            borderRadius: 'var(--radius-lg)'
          }}>
            <AlertTriangle size={48} style={{ color: 'var(--error-text)', marginBottom: '1rem' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--error-text)', marginBottom: '0.5rem' }}>
              Processing Encountered an Error
            </h3>
            <p style={{ color: 'var(--error-text)', fontSize: '0.95rem', marginBottom: '1.5rem', maxWidth: '500px', margin: '0 auto 1.5rem auto' }}>
              {errorMsg}
            </p>
            <button onClick={handleReset} className="btn-primary">
              Try Another File
            </button>
          </div>
        )}

        {status === 'success' && (
          <>
            {tool.id === 'image-to-text' && ocrText !== null ? (
              <EditableTextArea
                initialText={ocrText}
                wordCount={ocrWordCount}
                downloadUrl={downloadUrl!}
                onReset={handleReset}
              />
            ) : tool.id === 'pdf-summary' && aiData !== null ? (
              <AiSummaryDisplay
                data={aiData}
                onReset={handleReset}
              />
            ) : (
              <ResultCard
                toolName={tool.name}
                downloadUrl={downloadUrl!}
                onReset={handleReset}
                compressionStats={compressionStats}
              />
            )}
          </>
        )}
      </div>

      <AdBanner slot="below-tool-runner" />

      {/* RICH SEO CONTENT SECTION BELOW TOOL */}
      <section style={{
        marginTop: '4rem',
        paddingTop: '3rem',
        borderTop: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        gap: '3rem'
      }}>
        
        {/* What does this tool do */}
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.75rem' }}>
            What does this {tool.name} do?
          </h2>
          <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', lineHeight: '1.7' }}>
            {tool.description} It processes {tool.inputFormats.join(', ')} files securely and converts them to high quality {tool.outputFormat} format without requiring any permanent file storage or registration.
          </p>
        </div>

        {/* How to use */}
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1rem' }}>
            How to use {tool.name} step-by-step
          </h2>
          <ol style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '1rem', color: 'var(--text-secondary)' }}>
            {tool.howToSteps.map((step, idx) => (
              <li key={idx} style={{ lineHeight: '1.6' }}>
                <strong style={{ color: 'var(--text-primary)' }}>Step {idx + 1}:</strong> {step}
              </li>
            ))}
          </ol>
        </div>

        {/* Realistic Limitations */}
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.75rem' }}>
            Technical Specs & Limitations
          </h2>
          <ul style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
            {tool.limitations.map((lim, idx) => (
              <li key={idx}>{lim}</li>
            ))}
            <li>Maximum uploaded file size limit: 50MB per request.</li>
            <li>All files automatically expire and are purged from temporary memory after processing.</li>
          </ul>
        </div>

        {/* FAQs */}
        {tool.faqs.length > 0 && (
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <HelpCircle size={22} style={{ color: 'var(--brand-primary)' }} /> Frequently Asked Questions
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {tool.faqs.map((faq, idx) => (
                <div key={idx} className="glass-card" style={{ padding: '1.25rem' }}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.4rem' }}>{faq.question}</h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        )}

      </section>

    </div>
  );
};
