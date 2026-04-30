import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'DataMind | Asistente de Análisis de Datos',
  description: 'Tu asistente ejecutivo de inteligencia de negocios. Consulta tus datos de ventas, inventario y clientes en lenguaje natural.',
  keywords: ['Business Intelligence', 'IA', 'Análisis de Datos', 'Dashboard'],
  authors: [{ name: 'DataMind' }],
}

export const viewport: Viewport = {
  themeColor: '#f4f5f7',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className={`${inter.variable} bg-[#f4f5f7]`}>
      <body className="font-sans antialiased min-h-screen bg-[#f4f5f7]">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
