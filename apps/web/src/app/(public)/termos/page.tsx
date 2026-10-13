// Path: apps/web/src/app/(public)/termos/page.tsx
// Termos de Uso (SEO-first): conteúdo em features/legal, metadata a partir do doc.
import type { Metadata } from 'next'
import { getLegalDocument, LegalDocumentView } from '@/features/legal'

export function generateMetadata(): Metadata {
  const doc = getLegalDocument('termos')
  return {
    title: doc.title,
    description: doc.description,
    alternates: { canonical: '/termos' }
  }
}

export default function TermosPage() {
  return <LegalDocumentView document={getLegalDocument('termos')} />
}
