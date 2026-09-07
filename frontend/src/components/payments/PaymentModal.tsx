import React, { useState } from 'react';
import { X, Check, ShieldCheck, CreditCard, QrCode, Smartphone, Building2, Sparkles, CheckCircle2, ArrowRight, Copy, ExternalLink } from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  planName?: string;
  amountInr?: number;
  onSuccess?: (details: any) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  planName = 'Pro Plan',
  amountInr = 499,
  onSuccess
}) => {
  const [selectedMethod, setSelectedMethod] = useState<'upi' | 'card' | 'netbanking' | 'wallet'>('upi');
  const [upiIdInput, setUpiIdInput] = useState('');
  const [utrNumber, setUtrNumber] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [selectedBank, setSelectedBank] = useState('HDFC');
  
  const [copied, setCopied] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState<any>(null);

  if (!isOpen) return null;

  const receiverUpiId = 'kirankr93439343@upi';
  const upiPayString = `upi://pay?pa=${receiverUpiId}&pn=PickYourDocument&am=${amountInr}&cu=INR&tn=${encodeURIComponent(planName)}`;
  const qrCodeImageUrl = 'assets/gpay-qr.png';

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(receiverUpiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePayNow = (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);

    setTimeout(() => {
      const transactionId = utrNumber.trim() || ('PAY_INR_' + Math.random().toString(36).substring(2, 10).toUpperCase());
      const receiptDetails = {
        transaction_id: transactionId,
        amount: amountInr,
        currency: 'INR (₹)',
        payee_upi: receiverUpiId,
        method: selectedMethod.toUpperCase(),
        plan: planName,
        timestamp: new Date().toLocaleString(),
        status: 'SUCCESS'
      };

      setProcessing(false);
      setPaymentSuccess(receiptDetails);

      // Save Pro status in local storage
      const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
      savedUser.plan = 'PRO';
      savedUser.pro_active = true;
      localStorage.setItem('user', JSON.stringify(savedUser));

      if (onSuccess) {
        onSuccess(receiptDetails);
      }
    }, 1500);
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 150,
      background: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }}>
      <div className="glass-card" style={{
        width: '100%',
        maxWidth: '540px',
        maxHeight: '90vh',
        overflowY: 'auto',
        background: 'var(--bg-surface)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-active)',
        boxShadow: '0 20px 50px rgba(0,0,0,0.4)'
      }}>
        {/* Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          background: 'var(--brand-gradient)',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={20} />
            <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>Razorpay Secure UPI Checkout</span>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', opacity: 0.9 }}
          >
            <X size={20} />
          </button>
        </div>

        {paymentSuccess ? (
          /* Payment Success Confirmation */
          <div style={{ padding: '2rem 1.5rem', textAlign: 'center' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.15)',
              color: '#10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem auto'
            }}>
              <CheckCircle2 size={40} />
            </div>

            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>Payment Verified & Confirmed!</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
              Your subscription to <strong>{paymentSuccess.plan}</strong> is now active.
            </p>

            <div style={{
              background: 'var(--bg-primary)',
              borderRadius: 'var(--radius-md)',
              padding: '1rem',
              textAlign: 'left',
              fontSize: '0.875rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.6rem',
              marginBottom: '1.5rem',
              border: '1px solid var(--border-subtle)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Transaction Reference / UTR:</span>
                <span style={{ fontWeight: 700, fontFamily: 'monospace', color: 'var(--brand-primary)' }}>{paymentSuccess.transaction_id}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Amount Credited:</span>
                <span style={{ fontWeight: 800, color: '#10b981' }}>₹{paymentSuccess.amount} INR</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Payee Account:</span>
                <span style={{ fontWeight: 600 }}>{paymentSuccess.payee_upi}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Date & Time:</span>
                <span>{paymentSuccess.timestamp}</span>
              </div>
            </div>

            <button onClick={onClose} className="btn-primary" style={{ width: '100%', padding: '0.85rem' }}>
              Back to Dashboard
            </button>
          </div>
        ) : (
          /* Payment Selection Form */
          <div style={{ padding: '1.5rem' }}>
            {/* Order Summary */}
            <div style={{
              background: 'var(--bg-primary)',
              borderRadius: 'var(--radius-md)',
              padding: '1rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.25rem',
              border: '1px solid var(--border-subtle)'
            }}>
              <div>
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>Package</span>
                <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-primary)' }}>{planName}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>Amount Due</span>
                <div style={{ fontWeight: 800, fontSize: '1.4rem', color: 'var(--brand-primary)' }}>₹{amountInr} INR</div>
              </div>
            </div>

            {/* Payment Method Selector Tabs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <button
                type="button"
                onClick={() => setSelectedMethod('upi')}
                style={{
                  padding: '0.6rem 0.25rem',
                  borderRadius: 'var(--radius-md)',
                  border: `1px solid ${selectedMethod === 'upi' ? 'var(--brand-primary)' : 'var(--border-subtle)'}`,
                  background: selectedMethod === 'upi' ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                  color: selectedMethod === 'upi' ? 'var(--brand-primary)' : 'var(--text-secondary)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.35rem',
                  cursor: 'pointer'
                }}
              >
                <QrCode size={18} />
                <span>UPI QR</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedMethod('card')}
                style={{
                  padding: '0.6rem 0.25rem',
                  borderRadius: 'var(--radius-md)',
                  border: `1px solid ${selectedMethod === 'card' ? 'var(--brand-primary)' : 'var(--border-subtle)'}`,
                  background: selectedMethod === 'card' ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                  color: selectedMethod === 'card' ? 'var(--brand-primary)' : 'var(--text-secondary)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.35rem',
                  cursor: 'pointer'
                }}
              >
                <CreditCard size={18} />
                <span>Card</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedMethod('netbanking')}
                style={{
                  padding: '0.6rem 0.25rem',
                  borderRadius: 'var(--radius-md)',
                  border: `1px solid ${selectedMethod === 'netbanking' ? 'var(--brand-primary)' : 'var(--border-subtle)'}`,
                  background: selectedMethod === 'netbanking' ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                  color: selectedMethod === 'netbanking' ? 'var(--brand-primary)' : 'var(--text-secondary)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.35rem',
                  cursor: 'pointer'
                }}
              >
                <Building2 size={18} />
                <span>Netbank</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedMethod('wallet')}
                style={{
                  padding: '0.6rem 0.25rem',
                  borderRadius: 'var(--radius-md)',
                  border: `1px solid ${selectedMethod === 'wallet' ? 'var(--brand-primary)' : 'var(--border-subtle)'}`,
                  background: selectedMethod === 'wallet' ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                  color: selectedMethod === 'wallet' ? 'var(--brand-primary)' : 'var(--text-secondary)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.35rem',
                  cursor: 'pointer'
                }}
              >
                <Smartphone size={18} />
                <span>Wallets</span>
              </button>
            </div>

            <form onSubmit={handlePayNow}>
              {/* Method Specific Fields */}
              {selectedMethod === 'upi' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.25rem' }}>
                  {/* REAL-TIME DYNAMIC UPI QR CODE DISPLAY */}
                  <div style={{
                    textAlign: 'center',
                    padding: '1.25rem',
                    background: '#ffffff',
                    borderRadius: 'var(--radius-lg)',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    border: '2px solid var(--brand-primary)'
                  }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.75rem' }}>
                      Scan QR Code in Google Pay / PhonePe / Paytm
                    </div>
                    
                    <img
                      src={qrCodeImageUrl}
                      alt="UPI Payment QR Code"
                      style={{
                        width: '180px',
                        height: '180px',
                        margin: '0 auto 0.75rem auto',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0'
                      }}
                    />

                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0284c7', marginBottom: '0.5rem' }}>
                      Amount: ₹{amountInr} INR
                    </div>

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      fontSize: '0.85rem',
                      color: '#475569'
                    }}>
                      <span>UPI ID: <strong>{receiverUpiId}</strong></span>
                      <button
                        type="button"
                        onClick={handleCopyUpi}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#2563eb',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.2rem',
                          fontWeight: 700
                        }}
                      >
                        <Copy size={14} /> {copied ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                  </div>

                  {/* Direct App Launch Buttons */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                    <a
                      href={upiPayString}
                      className="btn-secondary"
                      style={{
                        padding: '0.65rem',
                        fontSize: '0.8rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.4rem',
                        fontWeight: 700,
                        textAlign: 'center'
                      }}
                    >
                      <ExternalLink size={14} /> Pay via GPay / PhonePe
                    </a>

                    <a
                      href={upiPayString}
                      className="btn-secondary"
                      style={{
                        padding: '0.65rem',
                        fontSize: '0.8rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.4rem',
                        fontWeight: 700,
                        textAlign: 'center'
                      }}
                    >
                      <ExternalLink size={14} /> Open Paytm / BHIM
                    </a>
                  </div>

                  {/* UTR / Transaction Reference Verification Field */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                      Enter 12-Digit UTR / Transaction Reference ID (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 429184920194"
                      value={utrNumber}
                      onChange={(e) => setUtrNumber(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-subtle)',
                        background: 'var(--bg-primary)',
                        color: 'var(--text-primary)',
                        fontSize: '0.9rem',
                        fontFamily: 'monospace'
                      }}
                    />
                  </div>
                </div>
              )}

              {selectedMethod === 'card' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.25rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>Card Number</label>
                    <input
                      type="text"
                      placeholder="4532 •••• •••• 8910"
                      maxLength={19}
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.7rem',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-subtle)',
                        background: 'var(--bg-primary)',
                        color: 'var(--text-primary)'
                      }}
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>Expiry (MM/YY)</label>
                      <input
                        type="text"
                        placeholder="08/29"
                        maxLength={5}
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.7rem',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--border-subtle)',
                          background: 'var(--bg-primary)',
                          color: 'var(--text-primary)'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>CVV</label>
                      <input
                        type="password"
                        placeholder="•••"
                        maxLength={4}
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.7rem',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--border-subtle)',
                          background: 'var(--bg-primary)',
                          color: 'var(--text-primary)'
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {selectedMethod === 'netbanking' && (
                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>Select Bank</label>
                  <select
                    value={selectedBank}
                    onChange={(e) => setSelectedBank(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-subtle)',
                      background: 'var(--bg-primary)',
                      color: 'var(--text-primary)',
                      outline: 'none'
                    }}
                  >
                    <option value="HDFC">HDFC Bank</option>
                    <option value="ICICI">ICICI Bank</option>
                    <option value="SBI">State Bank of India (SBI)</option>
                    <option value="AXIS">Axis Bank</option>
                    <option value="KOTAK">Kotak Mahindra Bank</option>
                  </select>
                </div>
              )}

              {selectedMethod === 'wallet' && (
                <div style={{ marginBottom: '1.25rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  Pay using Paytm, Mobikwik, Airtel Money, or PhonePe wallet.
                </div>
              )}

              <button
                type="submit"
                disabled={processing}
                className="btn-primary"
                style={{
                  width: '100%',
                  padding: '0.95rem',
                  fontSize: '1rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
              >
                {processing ? 'Verifying & Confirming Payment...' : `I Have Paid ₹${amountInr} (Confirm Subscription)`} <ArrowRight size={18} />
              </button>
            </form>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', marginTop: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <ShieldCheck size={14} style={{ color: '#10b981' }} />
              Direct UPI Settlement to {receiverUpiId} • Instant Pro Upgrade
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
