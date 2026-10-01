// Path: packages/modules/cards/src/use-cases/schemas.ts
// Schemas Zod de entrada dos use cases — mesma fonte de verdade para os route handlers.
import { z } from 'zod'
import { CARD_COLORS, CARD_TYPES } from '../domain/entities/card'

export const cardTypeSchema = z.enum(['digimon', 'option', 'tamer'])

export const cardColorSchema = z.enum(['red', 'blue', 'yellow', 'green', 'purple', 'black', 'white'])

export const evolutionConditionSchema = z.object({
  color: cardColorSchema,
  level: z.number().int().positive(),
  cost: z.number().int().nonnegative()
})

export const cardInputSchema = z.object({
  dcgId: z.string().trim().min(1, 'dcgId é obrigatório'),
  name: z.string().trim().min(1, 'Nome é obrigatório'),
  number: z.string().trim().min(1, 'Número é obrigatório'),
  rarity: z.string().trim().min(1, 'Raridade é obrigatória'),
  type: cardTypeSchema,
  colors: z.array(cardColorSchema).min(1, 'Informe ao menos uma cor'),
  level: z.number().int().nonnegative().nullable().optional(),
  digiType: z.string().trim().nullable().optional(),
  attribute: z.string().trim().nullable().optional(),
  dp: z.number().int().nonnegative().nullable().optional(),
  playCost: z.number().int().nonnegative().nullable().optional(),
  evolutionConditions: z.array(evolutionConditionSchema).nullable().optional(),
  effects: z.string().nullable().optional(),
  imageUrl: z.string().url('URL de imagem inválida').nullable().optional(),
  setCode: z.string().trim().nullable().optional(),
  releaseDate: z.coerce.date().nullable().optional()
})

export const cardSetInputSchema = z.object({
  code: z.string().trim().min(1, 'Código do set é obrigatório'),
  name: z.string().trim().min(1, 'Nome do set é obrigatório'),
  releaseDate: z.coerce.date().nullable().optional()
})

export const importCardsSchema = z.object({
  cards: z.array(cardInputSchema).min(1, 'Informe ao menos uma carta'),
  sets: z.array(cardSetInputSchema).optional()
})

export const listCardsSchema = z.object({
  search: z.string().trim().min(1).optional(),
  type: cardTypeSchema.optional(),
  color: cardColorSchema.optional(),
  playCost: z.coerce.number().int().nonnegative().optional(),
  setCode: z.string().trim().min(1).optional(),
  page: z.coerce.number().int().positive().optional(),
  pageSize: z.coerce.number().int().positive().max(100).optional()
})

export type CardInput = z.infer<typeof cardInputSchema>
export type CardSetInput = z.infer<typeof cardSetInputSchema>
export type ImportCardsInput = z.infer<typeof importCardsSchema>
export type ListCardsInput = z.infer<typeof listCardsSchema>

// Garante em compile-time que os enums do schema espelham o domínio.
export const CARD_TYPE_VALUES: readonly string[] = CARD_TYPES
export const CARD_COLOR_VALUES: readonly string[] = CARD_COLORS
