// Path: apps/web/src/app/(member)/decks/novo/page.tsx
// Criar deck (Member publica direto ou salva rascunho). Layout fiel ao design
// "Criar deck": card 420px com o formulário + painel de benefícios (desktop).
import type { Metadata } from 'next'
import { AuthBenefits, AuthHeader, AuthShell } from '@/features/auth/views'
import { DeckFormView } from '@/features/decks/views'

export const metadata: Metadata = {
  title: 'Criar deck',
  description: 'Monte seu deck do Digimon TCG: busque cartas do catálogo e publique direto.',
  robots: { index: false }
}

export default function CriarDeckPage() {
  return (
    <AuthShell aside={<AuthBenefits />}>
      <AuthHeader
        title="Criar deck"
        subtitle="Publique direto, sem revisão. Edite depois quando quiser."
      />
      <DeckFormView />
    </AuthShell>
  )
}
