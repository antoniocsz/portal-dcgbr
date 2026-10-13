// Path: apps/web/src/features/users/views/delete-account-modal.tsx
// View pura: confirmação de exclusão da conta (LGPD — eliminação). Sem hooks de
// dados — recebe estado + callbacks do ViewModel. Explica a política de
// anonimização antes do usuário confirmar.
'use client'

import { Button, X } from '@/components'

export interface DeleteAccountModalProps {
  open: boolean
  isPending: boolean
  error: string | null
  onConfirm: () => void
  onClose: () => void
}

export function DeleteAccountModal({
  open,
  isPending,
  error,
  onConfirm,
  onClose
}: DeleteAccountModalProps) {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-account-title"
    >
      <div className="w-full max-w-md border border-border bg-surface p-6">
        <div className="flex items-start justify-between gap-4">
          <h2 id="delete-account-title" className="font-display text-lg font-bold text-ink">
            Excluir minha conta
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="shrink-0 text-ink-faint transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
          >
            <X className="size-5" />
          </button>
        </div>

        <p className="pt-2 text-sm leading-6 text-ink-soft">
          Esta ação é permanente e não pode ser desfeita. Sua conta será{' '}
          <strong className="text-ink">desativada</strong> e seus dados pessoais serão{' '}
          <strong className="text-ink">anonimizados</strong> (nome, e-mail e avatar deixam de
          identificar você). Comentários, decks e torneios que você criou permanecem no site, mas
          passarão a constar como <strong className="text-ink">&ldquo;Usuário removido&rdquo;</strong>.
          Suas sessões ativas serão encerradas.
        </p>

        {error ? (
          <p role="alert" className="pt-3 text-xs font-semibold text-danger">
            {error}
          </p>
        ) : null}

        <div className="flex justify-end gap-3 pt-6">
          <Button variant="dark" size="sm" onClick={onClose} disabled={isPending}>
            Cancelar
          </Button>
          <Button
            variant="dark"
            size="sm"
            onClick={onConfirm}
            disabled={isPending}
            className="border-danger text-danger hover:border-danger hover:text-danger"
          >
            {isPending ? 'Excluindo…' : 'Excluir definitivamente'}
          </Button>
        </div>
      </div>
    </div>
  )
}
