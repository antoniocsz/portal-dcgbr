// Path: apps/web/src/features/legal/model/types.ts
// Contrato do conteúdo legal (Model — sem hooks, sem JSX).

// Trecho de texto: string simples ou link (interno/externo).
export type LegalInline = string | { text: string; href: string; external?: boolean }

// Bloco de conteúdo de uma seção.
export type LegalBlock =
  | { type: 'paragraph'; content: LegalInline[] }
  | { type: 'list'; items: LegalInline[][] }
  | { type: 'note'; content: LegalInline[] }

export interface LegalSection {
  id: string
  heading: string
  blocks: LegalBlock[]
}

export type LegalSlug = 'privacidade' | 'termos' | 'cookies'

export interface LegalDocument {
  slug: LegalSlug
  title: string
  description: string
  updatedAt: string
  intro: LegalInline[]
  sections: LegalSection[]
}
