import type { Metadata, Viewport } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'

const geist = Geist({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: { default: 'GeoAgri — Plataforma Geoespacial & ESG', template: '%s | GeoAgri' },
  description: 'Plataforma profissional de análise geoespacial, monitoramento ambiental, créditos de carbono e relatórios ESG para o agronegócio brasileiro.',
  manifest: '/manifest.json',
}

export const viewport: Viewport = {
  themeColor: '#1a6e3c',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          crossOrigin=""
        />
        <script
          src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
          crossOrigin=""
          defer
        />
      </head>
      <body className={geist.className}>
        {children}
      </body>
    </html>
  )
}