// Path: packages/modules/decks/src/domain/community/deck-name-moderation.ts
// Moderação do nome do deck publicado na comunidade. Função pura e testável:
// normaliza espaços, corta no tamanho máximo e rejeita termos bloqueados.
export interface DeckNameReview {
  allowed: boolean
  name: string
}

export const DECK_NAME_MAX_LENGTH = 40

// Lista simples (substring, case/acento-insensível) — não é um filtro robusto,
// apenas a primeira barreira antes da curadoria humana (reportes/moderação).
const BLOCKED_TERMS: readonly string[] = [
  'idiota',
  'imbecil',
  'burro',
  'otario',
  'babaca',
  'merda',
  'porra',
  'caralho',
  'puta',
  'viado',
  'nazi',
  'hitler'
]

function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

/** Revisa o nome: `{ allowed, name }` — `name` já normalizado/cortado. */
export function reviewDeckName(name: string): DeckNameReview {
  const trimmed = name.trim().replace(/\s+/g, ' ')
  if (trimmed.length === 0) return { allowed: false, name: trimmed }

  const normalized = normalize(trimmed)
  const blocked = BLOCKED_TERMS.some((term) => normalized.includes(term))
  if (blocked) return { allowed: false, name: trimmed }

  return { allowed: true, name: trimmed.slice(0, DECK_NAME_MAX_LENGTH) }
}
