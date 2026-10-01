// Path: apps/web/src/app/(public)/simuladores/page.tsx
// Página de Simuladores (SEO-first): metadata + SimulatorsView (conteúdo estático).
import type { Metadata } from 'next'
import { SimulatorsView } from '@/features/content/views'

export const metadata: Metadata = {
  title: 'Simuladores',
  description:
    'Jogue Digimon TCG online: o simulador oficial Alysium e as ferramentas criadas pela ' +
    'comunidade.',
  alternates: { canonical: '/simuladores' }
}

export default function SimuladoresPage() {
  return <SimulatorsView />
}
