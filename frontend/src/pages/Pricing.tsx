import React, { useState } from 'react';
import { Check, Sparkles, Zap, ShieldCheck, ArrowRight } from 'lucide-react';
import { PaymentModal } from '../components/payments/PaymentModal';

export const Pricing: React.FC = () => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<{ name: string; amount: number }>({ name: 'Pro Plan', amount: 499 });

  const handleOpenCheckout = (planName: string, amount: number) => {
    setSelectedPlan({ name: planName, amount });
    setPaymentModalOpen(true);
  };

  return (
    <div className="app-container" style={{ padding: '3.5rem 1.25rem' }}>
      <div style={{ textAlign: 'center', maxWidth: '750px', margin: '0 auto 3.5rem auto' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.35rem 1rem',
          borderRadius: '999px',
          background: 'rgba(59, 130, 246, 0.15)',
          color: 'var(--brand-primary)',
          fontSize: '0.85rem',
          fontWeight: 700,
          marginBottom: '1rem'
        }}>
          🇮🇳 Indian Rupee (INR ₹) Pricing & Razorpay Gateway Enabled
        </div>

        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.75rem' }}>
          Simple, Transparent Pricing in Rupees (₹)
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginBottom: '2rem' }}>
          All MVP conversion tools are 100% free for basic use. Upgrade to Pro for unlimited batch processing, priority workers, and advanced AI document intelligence.
        </p>

        {/* Monthly / Annual Toggle */}
        <div style={{
          display: 'inline-flex',
          background: 'var(--bg-surface)',
          padding: '0.35rem',
          borderRadius: '999px',
          border: '1px solid var(--border-subtle)'
        }}>
          <button
            onClick={() => setBillingCycle('monthly')}
            style={{
              padding: '0.5rem 1.25rem',
              borderRadius: '999px',
              border: 'none',
              background: billingCycle === 'monthly' ? 'var(--brand-gradient)' : 'transparent',
              color: billingCycle === 'monthly' ? '#fff' : 'var(--text-secondary)',
              fontWeight: 700,
              fontSize: '0.875rem',
              cursor: 'pointer'
            }}
          >
            Monthly Billing
          </button>
          <button
            onClick={() => setBillingCycle('annual')}
            style={{
              padding: '0.5rem 1.25rem',
              borderRadius: '999px',
              border: 'none',
              background: billingCycle === 'annual' ? 'var(--brand-gradient)' : 'transparent',
              color: billingCycle === 'annual' ? '#fff' : 'var(--text-secondary)',
              fontWeight: 700,
              fontSize: '0.875rem',
              cursor: 'pointer'
            }}
          >
            Annual Billing (Save 17%)
          </button>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '2rem',
        maxWidth: '1000px',
        margin: '0 auto'
      }}>
        
        {/* FREE PLAN */}
        <div className="glass-card" style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Free Starter
            </span>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, margin: '0.5rem 0 1rem 0' }}>₹0</h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              Perfect for quick everyday document conversions and OCR text extraction.
            </p>

            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem', marginBottom: '2rem' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Check size={16} style={{ color: '#10b981' }} /> All 10 Document Converters</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Check size={16} style={{ color: '#10b981' }} /> Up to 50MB File Size Limit</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Check size={16} style={{ color: '#10b981' }} /> Image to Text OCR</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Check size={16} style={{ color: '#10b981' }} /> Basic AI PDF Summary</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Check size={16} style={{ color: '#10b981' }} /> Anonymous Conversion Allowed</li>
            </ul>
          </div>

          <button className="btn-secondary" style={{ width: '100%', padding: '0.85rem' }}>
            Current Default Plan
          </button>
        </div>

        {/* PRO PLAN */}
        <div className="glass-card" style={{
          padding: '2.5rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          borderColor: 'var(--brand-primary)',
          boxShadow: '0 12px 40px rgba(59, 130, 246, 0.25)',
          position: 'relative'
        }}>
          <div style={{
            position: 'absolute',
            top: '-14px',
            right: '24px',
            background: 'var(--brand-gradient)',
            color: '#fff',
            fontSize: '0.75rem',
            fontWeight: 800,
            padding: '0.3rem 0.9rem',
            borderRadius: '999px'
          }}>
            MOST POPULAR
          </div>

          <div>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--brand-primary)', textTransform: 'uppercase' }}>
              Pro Unlimited
            </span>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, margin: '0.5rem 0 1rem 0', color: 'var(--text-primary)' }}>
              ₹{billingCycle === 'monthly' ? '499' : '4,999'} <span style={{ fontSize: '1rem', fontWeight: 400, color: 'var(--text-muted)' }}>/ {billingCycle === 'monthly' ? 'month' : 'year'}</span>
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              Designed for power users, teams, and high-frequency document processing.
            </p>

            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem', marginBottom: '2rem' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Check size={16} style={{ color: '#10b981' }} /> Everything in Free Plan</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Check size={16} style={{ color: '#10b981' }} /> Up to 500MB File Size Limit</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Check size={16} style={{ color: '#10b981' }} /> Batch Multi-file Operations</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Check size={16} style={{ color: '#10b981' }} /> Priority Worker Queue Processing</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Check size={16} style={{ color: '#10b981' }} /> Zero Advertisements</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Check size={16} style={{ color: '#10b981' }} /> Advanced Multi-language AI Summary</li>
            </ul>
          </div>

          <button
            onClick={() => handleOpenCheckout('Pro Plan', billingCycle === 'monthly' ? 499 : 4999)}
            className="btn-primary"
            style={{ width: '100%', padding: '0.85rem', fontWeight: 800, fontSize: '0.95rem' }}
          >
            <Sparkles size={18} /> Subscribe via Razorpay / UPI (₹{billingCycle === 'monthly' ? '499' : '4,999'})
          </button>
        </div>

        {/* ENTERPRISE PLAN */}
        <div className="glass-card" style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Business & Enterprise
            </span>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, margin: '0.5rem 0 1rem 0' }}>
              ₹1,999 <span style={{ fontSize: '1rem', fontWeight: 400, color: 'var(--text-muted)' }}>/ month</span>
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              Dedicated server processing, custom API access & bulk document pipelines.
            </p>

            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem', marginBottom: '2rem' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Check size={16} style={{ color: '#10b981' }} /> Unlimited File Size Limit</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Check size={16} style={{ color: '#10b981' }} /> Dedicated API Access Keys</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Check size={16} style={{ color: '#10b981' }} /> Custom OCR Model Training</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Check size={16} style={{ color: '#10b981' }} /> 99.9% Uptime SLA & Dedicated Support</li>
            </ul>
          </div>

          <button
            onClick={() => handleOpenCheckout('Enterprise Plan', 1999)}
            className="btn-secondary"
            style={{ width: '100%', padding: '0.85rem', fontWeight: 700 }}
          >
            Get Enterprise Access (₹1,999)
          </button>
        </div>

      </div>

      {/* Razorpay Checkout Modal */}
      <PaymentModal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        planName={selectedPlan.name}
        amountInr={selectedPlan.amount}
      />
    </div>
  );
};
