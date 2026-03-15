import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default function TwitterImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #1D4ED8 0%, #2563EB 45%, #0F766E 100%)',
          color: '#FFFFFF',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(circle at top left, rgba(255,255,255,0.24), transparent 34%), radial-gradient(circle at bottom right, rgba(191,219,254,0.22), transparent 36%)',
          }}
        />
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            width: '100%',
            padding: '64px 72px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 18,
              fontSize: 28,
              fontWeight: 600,
              letterSpacing: 1,
              textTransform: 'uppercase',
            }}
          >
            <div
              style={{
                display: 'flex',
                height: 48,
                width: 48,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 9999,
                background: 'rgba(255,255,255,0.16)',
                border: '1px solid rgba(255,255,255,0.24)',
              }}
            >
              A
            </div>
            Auto Loan Pro
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 820 }}>
            <div style={{ fontSize: 82, fontWeight: 700, lineHeight: 1.05 }}>
              Auto Loan Pro
            </div>
            <div style={{ fontSize: 42, lineHeight: 1.2, color: '#DBEAFE' }}>
              Pre-Approved in Minutes, Not Weeks
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              gap: 18,
              fontSize: 24,
              color: '#DBEAFE',
            }}
          >
            <div style={{ display: 'flex' }}>Multiple lenders</div>
            <div style={{ display: 'flex' }}>Soft pull start</div>
            <div style={{ display: 'flex' }}>Dealer-ready offers</div>
          </div>
        </div>
      </div>
    ),
    size
  );
}
