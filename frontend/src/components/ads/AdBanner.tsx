import React from 'react';

// Monetization configuration toggle
export const ADSENSE_CONFIG = {
  enabled: true, // Enabled layout placeholders for Google AdSense slots
  client_id: 'ca-pub-XXXXXXXXXXXXXXXX', // Replace with real Google AdSense client ID when approved
};

interface AdProps {
  slot?: string;
  format?: 'auto' | 'fluid' | 'rectangle' | 'banner';
  className?: string;
}

export const AdBanner: React.FC<AdProps> = ({ slot, format = 'auto', className }) => {
  if (!ADSENSE_CONFIG.enabled) {
    return null;
  }

  return (
    <div className={`adsense-slot-wrapper ${className || ''}`} style={{ maxWidth: format === 'rectangle' ? '336px' : '970px' }}>
      <span className="adsense-label">Advertisement</span>
      
      {/* Google AdSense ins element container */}
      <ins
        className="adsbygoogle"
        style={{
          display: 'block',
          width: '100%',
          minHeight: format === 'rectangle' ? '280px' : '90px',
        }}
        data-ad-client={ADSENSE_CONFIG.client_id}
        data-ad-slot={slot || '1234567890'}
        data-ad-format={format === 'banner' ? 'horizontal' : format}
        data-full-width-responsive="true"
      />

      {/* Visual Placeholder Notice for AdSense Ready Setup */}
      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.5rem 0' }}>
        <strong style={{ color: 'var(--text-secondary)' }}>Google AdSense Reserved Space</strong>
        <div>Slot ID: {slot || 'auto-responsive-unit'}</div>
      </div>
    </div>
  );
};

export const AdRectangle: React.FC<AdProps> = (props) => <AdBanner {...props} format="rectangle" />;
export const AdInContent: React.FC<AdProps> = (props) => <AdBanner {...props} format="fluid" />;
