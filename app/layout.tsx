import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Providers } from './providers'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://digisider.com'),
  title: {
    default: 'Hub de Servicios | Plataforma SaaS',
    template: '%s | Hub de Servicios',
  },
  description:
    'Gestiona tu suscripción, accede a Workspace, Vista y Desktop desde un único punto de entrada.',
  keywords: ['SaaS', 'workspace', 'servicios digitales', 'automatizaciones', 'plataforma'],
  authors: [{ name: 'Hub de Servicios' }],
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    siteName: 'Hub de Servicios',
    title: 'Hub de Servicios | Plataforma SaaS',
    description: 'Workspace, Vista Digital y Desktop App en una sola suscripción.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hub de Servicios | Plataforma SaaS',
    description: 'Workspace, Vista Digital y Desktop App en una sola suscripción.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(localStorage.getItem('hub-theme')==='dark')document.documentElement.classList.add('dark')}catch{}`,
          }}
        />
      </head>
      <body
        className={`${inter.variable} font-sans antialiased bg-[#EAF1F8] dark:bg-[#071D2E] text-[#0B2740] dark:text-[#EAF1F8]`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
