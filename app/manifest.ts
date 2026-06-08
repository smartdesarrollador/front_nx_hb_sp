import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Hub de Servicios',
    short_name: 'Hub',
    description: 'Plataforma SaaS todo en uno',
    start_url: '/',
    display: 'standalone',
    background_color: '#EAF1F8',
    theme_color: '#0F2D45',
    icons: [
      { src: '/icon', sizes: '32x32', type: 'image/png' },
      { src: '/apple-icon', sizes: '180x180', type: 'image/png' },
    ],
  }
}
