import React, { useState } from 'react';
import { Sparkles, CheckCircle, ListChecks, Key, HelpCircle, Copy, Download, RefreshCw, Check } from 'lucide-react';

interface AiSummaryData {
  summary: string;
  key_points: string[];
  important_terms: string[];
  action_items: string[];
  questions_to_review: string[];
}

interface AiSummaryDisplayProps {
  data: AiSummaryData;
  onReset: () => void;
}

export const AiSummaryDisplay: React.FC<AiSummaryDisplayProps> = ({ data, onReset }) => {
  const [copied, setCopied] = useState(false);

  const handleCopySummary = () => {
    const formatted = `=== EXECUTIVE SUMMARY ===\n${data.summary}\n\n=== KEY POINTS ===\n${data.key_points.map(p => '• ' + p).join('\n')}\n\n=== ACTION ITEMS ===\n${data.action_items.map(a => '✓ ' + a).join('\n')}`;
    navigator.clipboard.writeText(formatted);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Sparkles size={24} style={{ color: 'var(--brand-accent)' }} />
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>AI Document Insights</h2>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={handleCopySummary} className="btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
            {copied ? <Check size={16} style={{ color: 'var(--success-text)' }} /> : <Copy size={16} />}
            {copied ? 'Copied Summary' : 'Copy All Insights'}
          </button>
          <button onClick={onReset} className="btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
            <RefreshCw size={16} /> Process Another PDF
          </button>
        </div>
      </div>

      {/* Executive Summary Card */}
      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--brand-primary)' }}>
          <Sparkles size={18} /> Executive Summary
        </h3>
        <p style={{ fontSize: '0.95rem', lineHeight: '1.6', color: 'var(--text-primary)' }}>
          {data.summary}
        </p>
      </div>

      {/* Grid of Key Points & Action Items */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        
        {/* Key Points */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle size={18} style={{ color: 'var(--brand-primary)' }} /> Key Points
          </h3>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {data.key_points.map((pt, idx) => (
              <li key={idx} style={{ fontSize: '0.9rem', display: 'flex', gap: '0.5rem' }}>
                <span style={{ color: 'var(--brand-primary)', fontWeight: 'bold' }}>•</span>
                <span>{pt}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Action Items */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ListChecks size={18} style={{ color: 'var(--success-text)' }} /> Action Items
          </h3>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {data.action_items.map((act, idx) => (
              <li key={idx} style={{ fontSize: '0.9rem', display: 'flex', gap: '0.5rem' }}>
                <span style={{ color: 'var(--success-text)', fontWeight: 'bold' }}>✓</span>
                <span>{act}</span>
              </li>
            ))}
          </ul>
        </div>

      </div>

      {/* Terms & Review Questions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        
        {/* Important Terms */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Key size={18} style={{ color: 'var(--brand-accent)' }} /> Important Terms
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {data.important_terms.map((term, idx) => (
              <span key={idx} style={{
                padding: '0.3rem 0.75rem',
                borderRadius: '999px',
                background: 'var(--bg-primary)',
                border: '1px solid var(--border-subtle)',
                fontSize: '0.85rem',
                fontWeight: 600
              }}>
                {term}
              </span>
            ))}
          </div>
        </div>

        {/* Questions to Review */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <HelpCircle size={18} style={{ color: 'var(--text-muted)' }} /> Questions to Review
          </h3>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {data.questions_to_review.map((q, idx) => (
              <li key={idx} style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                ? {q}
              </li>
            ))}
          </ul>
        </div>

      </div>
    </div>
  );
};
