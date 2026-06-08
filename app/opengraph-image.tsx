import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Hub de Servicios — Plataforma SaaS todo en uno'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #0B2740 0%, #1a4a6e 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui, sans-serif',
          padding: '60px',
        }}
      >
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 32,
          }}
        >
          <span style={{ fontSize: 42, fontWeight: 800, color: '#0B2740' }}>H</span>
        </div>
        <div
          style={{
            fontSize: 64,
            fontWeight: 800,
            color: 'white',
            textAlign: 'center',
            lineHeight: 1.1,
            marginBottom: 20,
          }}
        >
          Hub de Servicios
        </div>
        <div
          style={{
            fontSize: 28,
            color: '#90cdf4',
            textAlign: 'center',
            maxWidth: 700,
          }}
        >
          Workspace, Vista Digital y Desktop App en una sola suscripción
        </div>
      </div>
    ),
    { ...size },
  )
}
