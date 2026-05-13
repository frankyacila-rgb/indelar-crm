import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/sonner'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Indelar CRM',
  description: 'Sistema de gestión comercial — Indelar',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${inter.className} antialiased bg-gray-50`}>
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  )
}
