// Path: apps/web/src/app/(public)/privacidade/page.tsx
// Política de Privacidade (SEO-first): conteúdo em features/legal, metadata a partir do doc.
import type { Metadata } from 'next'
import { getLegalDocument, LegalDocumentView } from '@/features/legal'

export function generateMetadata(): Metadata {
  const doc = getLegalDocument('privacidade')
  return {
    title: doc.title,
    description: doc.description,
    alternates: { canonical: '/privacidade' }
  }
}

export default function PrivacidadePage() {
  return <LegalDocumentView document={getLegalDocument('privacidade')} />
}
