// Path: apps/web/src/components/site-header.tsx
// View: cabeçalho público (desktop + mobile). Estado de UI local (menu), sem dados.
'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Menu, Search, X } from './icons'
import { ColorStrip } from './ui/color-strip'
import { UserMenu } from './user-menu'

const NAV_ITEMS = [
  { href: '/noticias', label: 'Notícias' },
  { href: '/cartas', label: 'Cartas' },
  { href: '/decks', label: 'Decks' },
  { href: '/torneios', label: 'Torneios' },
  { href: '/simuladores', label: 'Simuladores' }
] as const

function Brand() {
  return (
    <Link href="/" className="flex items-center gap-2.5">
      <Image
        src="/dcg-logo.png"
        alt="Digimon Card Game"
        width={1280}
        height={364}
        priority
        className="h-9 w-auto"
      />
      <span className="font-display text-base font-bold text-ink-soft">Brasil</span>
      <span className="hidden items-center gap-1 bg-surface-2 px-1.5 py-1 sm:flex" aria-hidden="true">
        <span className="size-2.5 rounded-full bg-accent" />
        <span className="h-1 w-10 bg-border" />
      </span>
    </Link>
  )
}

function NavLink({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={cn(
        'relative py-1 text-sm transition-colors',
        active ? 'font-semibold text-primary' : 'font-medium text-ink-faint hover:text-ink'
      )}
    >
      {label}
      {active ? <span className="absolute inset-x-0 -bottom-0.5 h-0.5 bg-primary" /> : null}
    </Link>
  )
}

export type SiteHeaderProps = {
  activePath?: string
}

export function SiteHeader({ activePath = '/' }: SiteHeaderProps) {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface">
      <div className="mx-auto flex h-16 w-full max-w-[1440px] items-center justify-between gap-4 px-4 lg:px-12">
        <Brand />

        <nav className="hidden items-center gap-7 lg:flex" aria-label="Navegação principal">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.href}
              href={item.href}
              label={item.label}
              active={activePath.startsWith(item.href)}
            />
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/busca"
            aria-label="Buscar"
            className="flex size-11 items-center justify-center text-ink-soft transition-colors hover:text-ink"
          >
            <Search className="size-5" />
          </Link>
          {/* Indicador de sessão: avatar dropdown (logado) ou Entrar/Criar conta */}
          <UserMenu />
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-label={open ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={open}
            className="flex size-11 items-center justify-center text-ink lg:hidden"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {open ? (
        <div className="border-t border-border bg-surface lg:hidden">
          <nav className="mx-auto flex w-full max-w-[1440px] flex-col px-4 py-4" aria-label="Navegação móvel">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  'py-3 text-sm font-semibold',
                  activePath.startsWith(item.href) ? 'text-primary' : 'text-ink-soft'
                )}
              >
                {item.label}
              </Link>
            ))}
            {/* Indicador de sessão (mobile): avatar/links ou Entrar/Criar conta */}
            <UserMenu mobile />
          </nav>
        </div>
      ) : null}

      <ColorStrip />
    </header>
  )
}
