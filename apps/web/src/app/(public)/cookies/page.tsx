// Path: apps/web/src/app/(public)/cookies/page.tsx
// Política de Cookies (SEO-first): conteúdo em features/legal, metadata a partir do doc.
import type { Metadata } from 'next'
import { getLegalDocument, LegalDocumentView } from '@/features/legal'

export function generateMetadata(): Metadata {
  const doc = getLegalDocument('cookies')
  return {
    title: doc.title,
    description: doc.description,
    alternates: { canonical: '/cookies' }
  }
}

export default function CookiesPage() {
  return <LegalDocumentView document={getLegalDocument('cookies')} />
}
