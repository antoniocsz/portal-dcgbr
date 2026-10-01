// Path: apps/web/src/components/user-menu.tsx
// View: indicador de sessão no header público.
// Desktop: avatar + dropdown (nome, papel, painel admin, perfil, sair).
// Mobile: links verticais dentro do menu hambúrguer.
// Usa useSession (ViewModel) — nenhum fetch direto aqui (MVVM).
'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { ChevronDown, LogOut } from 'lucide-react'
import { useSession, type SessionUser } from '@/lib/use-session'
import { Avatar } from './ui/avatar'
import { cn } from '@/lib/utils'

const ROLE_LABELS: Record<SessionUser['role'], string> = {
  administrator: 'Administrador',
  editor: 'Editor',
  member: 'Membro'
}

function canAccessAdmin(user: SessionUser): boolean {
  return user.role === 'administrator' || user.role === 'editor'
}

export function UserMenu({ mobile = false }: { mobile?: boolean }) {
  const { user, loading, refresh } = useSession()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement | null>(null)

  // Fecha o dropdown ao clicar fora ou apertar Esc
  useEffect(() => {
    if (!open) return
    function onPointerDown(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false)
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  async function handleLogout() {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } finally {
      refresh()
      setOpen(false)
      router.push('/')
      router.refresh()
    }
  }

  // --- Variante mobile (menu hambúrguer) ---
  if (mobile) {
    if (loading) return null
    if (!user) {
      return (
        <div className="mt-2 flex gap-2">
          <Link
            href="/login"
            onClick={() => setOpen(false)}
            className="flex-1 border border-border px-4 py-3 text-center text-sm font-semibold text-ink"
          >
            Entrar
          </Link>
          <Link
            href="/registro"
            onClick={() => setOpen(false)}
            className="flex-1 bg-primary px-4 py-3 text-center text-sm font-semibold text-white"
          >
            Criar conta
          </Link>
        </div>
      )
    }
    return (
      <div className="mt-3 flex flex-col border-t border-border pt-3">
        <div className="flex items-center gap-2.5 px-1 pb-3">
          <Avatar name={user.name} size="sm" />
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-sm font-bold text-ink">{user.name}</span>
            <span className="text-[11px] text-ink-faint">{ROLE_LABELS[user.role]}</span>
          </div>
        </div>
        {canAccessAdmin(user) ? (
          <Link
            href="/admin"
            onClick={() => setOpen(false)}
            className="rounded-none px-1 py-2.5 text-sm font-semibold text-ink hover:text-primary"
          >
            Painel administrativo
          </Link>
        ) : null}
        <Link
          href="/perfil"
          onClick={() => setOpen(false)}
          className="rounded-none px-1 py-2.5 text-sm font-semibold text-ink-soft hover:text-ink"
        >
          Meu perfil
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-2 rounded-none px-1 py-2.5 text-left text-sm font-semibold text-danger hover:text-danger/80"
        >
          <LogOut className="size-4" />
          Sair
        </button>
      </div>
    )
  }

  // --- Variante desktop ---
  if (loading) return null
  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Link
          href="/login"
          className="hidden border border-border px-4.5 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-ink-faint sm:inline-flex"
        >
          Entrar
        </Link>
        <Link
          href="/registro"
          className="hidden bg-primary px-4.5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary/90 sm:inline-flex"
        >
          Criar conta
        </Link>
      </div>
    )
  }
  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex items-center gap-2 rounded-none px-1.5 py-1.5 transition-colors hover:bg-surface-2"
      >
        <Avatar name={user.name} size="sm" />
        <span className="hidden max-w-[140px] truncate text-sm font-semibold text-ink lg:inline">
          {user.name.split(' ')[0]}
        </span>
        <ChevronDown
          className={cn('size-4 text-ink-faint transition-transform', open && 'rotate-180')}
        />
      </button>

      {open ? (
        <div
          role="menu"
          aria-label="Menu do usuário"
          className="absolute right-0 top-full z-50 mt-2 w-64 border border-border bg-surface shadow-lg"
        >
          <div className="border-b border-border px-4 py-3">
            <p className="truncate text-sm font-bold text-ink">{user.name}</p>
            <p className="mt-0.5 truncate text-xs text-ink-faint">
              {ROLE_LABELS[user.role]} · {user.email}
            </p>
          </div>
          {canAccessAdmin(user) ? (
            <Link
              href="/admin"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-4 py-3 text-sm font-semibold text-ink transition-colors hover:bg-surface-2"
            >
              Painel administrativo
            </Link>
          ) : null}
          <Link
            href="/perfil"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-4 py-3 text-sm text-ink-soft transition-colors hover:bg-surface-2 hover:text-ink"
          >
            Meu perfil
          </Link>
          <button
            type="button"
            role="menuitem"
            onClick={handleLogout}
            className="flex w-full items-center gap-2.5 border-t border-border px-4 py-3 text-left text-sm font-semibold text-danger transition-colors hover:bg-danger/10"
          >
            <LogOut className="size-4" />
            Sair
          </button>
        </div>
      ) : null}
    </div>
  )
}
