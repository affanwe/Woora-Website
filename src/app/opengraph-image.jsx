import { ImageResponse } from 'next/og';

export const alt = 'WOORA Group — Investment Platform';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #06090F 0%, #0C1220 60%, #0E1F1B 100%)',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 8,
            background: 'linear-gradient(90deg, #00D09C, #4F8BFF)',
            display: 'flex',
          }}
        />
        <div
          style={{
            fontSize: 110,
            fontWeight: 800,
            color: '#FFFFFF',
            letterSpacing: '-0.02em',
            display: 'flex',
          }}
        >
          WOORA{' '}
          <span style={{ color: '#00D09C', marginLeft: 24 }}>Group</span>
        </div>
        <div
          style={{
            fontSize: 34,
            color: '#7B8CA8',
            marginTop: 24,
            display: 'flex',
          }}
        >
          Be part of Bangladesh&apos;s next big ventures
        </div>
        <div
          style={{
            fontSize: 26,
            color: '#00D09C',
            marginTop: 40,
            padding: '12px 36px',
            border: '2px solid rgba(0,208,156,0.4)',
            borderRadius: 50,
            display: 'flex',
          }}
        >
          Investment units start at ৳500 · wooragroup.com
        </div>
      </div>
    ),
    { ...size }
  );
}
