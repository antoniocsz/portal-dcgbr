// Path: apps/web/src/components/site-footer.tsx
// View pura: rodapé público (colunas + faixa de 7 cores).
import Image from 'next/image'
import Link from 'next/link'
import { ColorStrip } from './ui/color-strip'

const COLUMNS = [
  {
    title: 'Conteúdo',
    links: [
      { href: '/noticias', label: 'Notícias' },
      { href: '/noticias?categoria=article', label: 'Matérias' },
      { href: '/noticias?categoria=curiosity', label: 'Curiosidades' },
      { href: '/simuladores', label: 'Simuladores' }
    ]
  },
  {
    title: 'Comunidade',
    links: [
      { href: '/decks', label: 'Decks' },
      { href: '/torneios', label: 'Torneios' },
      { href: '/cartas', label: 'Card database' }
    ]
  },
  {
    title: 'Conta',
    links: [
      { href: '/login', label: 'Entrar' },
      { href: '/registro', label: 'Criar conta' },
      { href: '/esqueci-senha', label: 'Recuperar senha' }
    ]
  }
] as const

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border bg-surface">
      <ColorStrip />
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-8 px-4 py-10 lg:flex-row lg:justify-between lg:px-12">
        <div className="flex max-w-xs flex-col gap-1.5">
          <Image
            src="/dcg-logo.png"
            alt="Digimon Card Game"
            width={1280}
            height={364}
            className="h-[38px] w-auto"
          />
          <span className="font-display text-lg font-bold text-ink">DigiTCG Brasil</span>
          <p className="text-[13px] leading-5 text-ink-soft">
            O portal brasileiro de referência do Digimon Card Game:
            {' '}notícias, cartas, decks e torneios.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:gap-16">
          {COLUMNS.map((column) => (
            <div key={column.title} className="flex flex-col gap-2.5">
              <span className="text-[13px] font-bold text-ink">{column.title}</span>
              {column.links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-[13px] text-ink-soft transition-colors hover:text-ink"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto w-full max-w-[1440px] border-t border-border px-4 py-4 lg:px-12">
        <p className="text-xs text-ink-faint">
          © 2026 DigiTCG Brasil — feito pela comunidade. Não afiliado à Bandai Namco.
        </p>
      </div>
    </footer>
  )
}
