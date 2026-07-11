import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = '026Newsblog';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0a1a14 0%, #0f2e24 100%)',
          color: '#f2f9f5',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <div style={{ fontSize: 72, fontWeight: 700, letterSpacing: '-0.03em' }}>
          <span style={{ color: '#8fd6bd' }}>026</span>Newsblog
        </div>
        <div style={{ fontSize: 24, color: '#8a9e95', marginTop: 16, textAlign: 'center', maxWidth: '70%' }}>
          Breaking news, trending stories, and insights from top authors worldwide.
        </div>
      </div>
    ),
    size,
  );
}
