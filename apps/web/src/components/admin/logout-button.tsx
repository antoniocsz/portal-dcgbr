// Path: apps/web/src/components/admin/logout-button.tsx
// Ação de sair do painel admin (client). Desktop: item "Sair" na sidebar.
// Mobile: ícone no header do shell. Reutiliza POST /api/auth/logout
// (revoga refresh token + limpa cookies httpOnly) e volta para /login.
'use client'

import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'

export function LogoutButton({ variant = 'sidebar' }: { variant?: 'sidebar' | 'icon' }) {
  const router = useRouter()

  async function handleLogout() {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } finally {
      router.push('/login')
      router.refresh()
    }
  }

  if (variant === 'icon') {
    return (
      <button
        type="button"
        onClick={handleLogout}
        aria-label="Sair do painel"
        title="Sair"
        className="flex size-9 items-center justify-center text-ink-soft transition-colors hover:bg-surface-2 hover:text-danger"
      >
        <LogOut className="size-4.5" />
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className={cn(
        'flex w-full items-center gap-3 rounded-none px-3 py-2.5 text-[13px] font-semibold',
        'text-ink-soft transition-colors hover:bg-surface-2 hover:text-danger'
      )}
    >
      <LogOut className="size-4.5" />
      Sair
    </button>
  )
}
