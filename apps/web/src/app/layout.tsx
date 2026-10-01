import type { Metadata } from 'next'
import { Inter, Sora } from 'next/font/google'
import { SiteChrome } from '@/components/site-chrome'
import { Providers } from './providers'
import './globals.css'

const sora = Sora({
  subsets: ['latin'],
  variable: '--font-sora',
  display: 'swap',
  weight: ['400', '600', '700', '800']
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap'
})

export const metadata: Metadata = {
  title: {
    default: 'Digimon TCG Brasil',
    template: '%s · Digimon TCG Brasil'
  },
  description: 'Portal de notícias, cartas, decks e torneios do Digimon Card Game no Brasil.'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${sora.variable} ${inter.variable}`}>
      <body className="min-h-screen bg-bg font-body text-ink antialiased">
        <Providers>
          <SiteChrome>{children}</SiteChrome>
        </Providers>
      </body>
    </html>
  )
}
