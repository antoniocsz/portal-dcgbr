// Path: packages/modules/decks/src/use-cases/schemas.ts
// Schemas Zod de entrada dos use cases — mesma fonte de verdade para os route handlers.
import { z } from 'zod'
import { SLUG_PATTERN } from '../domain/entities/deck'

export const deckStatusSchema = z.enum(['draft', 'published'])

export const deckCardSchema = z.object({
  cardId: z.string().trim().min(1, 'cardId é obrigatório').max(200),
  quantity: z.number().int().min(1, 'Quantidade deve ser um inteiro positivo').max(50)
})

export const createDeckSchema = z.object({
  name: z.string().trim().min(3, 'Nome deve ter ao menos 3 caracteres').max(200),
  slug: z
    .string()
    .regex(SLUG_PATTERN, 'Slug inválido (use letras minúsculas, números e hífens)')
    .max(200)
    .optional(),
  description: z.string().trim().max(2000).nullable().optional(),
  cardList: z.array(deckCardSchema).max(200, 'cardList com limite de 200 cartas'),
  format: z.string().trim().min(2, 'Formato é obrigatório').max(80),
  status: deckStatusSchema.optional(),
  isPublic: z.boolean().optional()
})

export const updateDeckSchema = z
  .object({
    name: z.string().trim().min(3, 'Nome deve ter ao menos 3 caracteres').max(200).optional(),
    slug: z
      .string()
      .regex(SLUG_PATTERN, 'Slug inválido (use letras minúsculas, números e hífens)')
      .max(200)
      .optional(),
    description: z.string().trim().max(2000).nullable().optional(),
    cardList: z.array(deckCardSchema).max(200, 'cardList com limite de 200 cartas').optional(),
    format: z.string().trim().min(2, 'Formato é obrigatório').max(80).optional(),
    isPublic: z.boolean().optional()
  })
  .strict()

export const listDecksSchema = z.object({
  search: z.string().trim().min(1).max(200).optional(),
  format: z.string().trim().min(1).max(80).optional(),
  status: deckStatusSchema.optional(),
  page: z.coerce.number().int().positive().optional(),
  pageSize: z.coerce.number().int().positive().max(100).optional()
})

export type CreateDeckInput = z.infer<typeof createDeckSchema>
export type UpdateDeckInput = z.infer<typeof updateDeckSchema>
export type ListDecksInput = z.infer<typeof listDecksSchema>
