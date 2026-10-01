// Path: apps/web/src/components/attribute-colors.ts
// Paleta de atributos Digimon (dcg.pen) — fonte única para chips, decks e cartas.

export const ATTRIBUTE_COLORS = {
  red: '#dc2626',
  blue: '#3b82f6',
  yellow: '#e5b93b',
  green: '#22c55e',
  purple: '#a855f7',
  black: '#3a3f4a',
  tamer: '#2dd4bf',
  option: '#94a3b8'
} as const

export type AttributeColor = keyof typeof ATTRIBUTE_COLORS

export const ATTRIBUTE_LABELS: Record<AttributeColor, string> = {
  red: 'Vermelho',
  blue: 'Azul',
  yellow: 'Amarelo',
  green: 'Verde',
  purple: 'Roxo',
  black: 'Preto',
  tamer: 'Tamer',
  option: 'Option'
}
