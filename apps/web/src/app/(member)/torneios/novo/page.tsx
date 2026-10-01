// Path: apps/web/src/app/(member)/torneios/novo/page.tsx
// Criar torneio (Member publica direto). Layout fiel ao design "Criar torneio":
// card 420px com o formulário + painel de benefícios (desktop).
import type { Metadata } from 'next'
import { AuthBenefits, AuthHeader, AuthShell } from '@/features/auth/views'
import { TournamentFormView } from '@/features/tournaments/views'

export const metadata: Metadata = {
  title: 'Criar torneio',
  description: 'Publique seu torneio do Digimon TCG direto, sem revisão.',
  robots: { index: false }
}

export default function CriarTorneioPage() {
  return (
    <AuthShell aside={<AuthBenefits />}>
      <AuthHeader
        title="Criar torneio"
        subtitle="Publique um torneio direto — Member publica sem revisão."
      />
      <TournamentFormView />
    </AuthShell>
  )
}
