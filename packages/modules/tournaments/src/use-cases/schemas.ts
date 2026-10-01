// Path: packages/modules/tournaments/src/use-cases/schemas.ts
// Schemas Zod de entrada dos use cases — mesma fonte de verdade para os route handlers.
import { z } from 'zod'
import { SLUG_PATTERN } from '../domain/entities/tournament'

export const tournamentStatusSchema = z.enum(['published', 'cancelled', 'finished'])

export const tournamentResultSchema = z.object({
  position: z.number().int().positive('Posição deve ser um inteiro positivo'),
  player: z.string().trim().min(1, 'Jogador é obrigatório').max(120),
  deck: z.string().trim().max(200).nullable().optional(),
  record: z.string().trim().max(40).nullable().optional()
})

export const createTournamentSchema = z.object({
  name: z.string().trim().min(3, 'Nome deve ter ao menos 3 caracteres').max(200),
  slug: z
    .string()
    .regex(SLUG_PATTERN, 'Slug inválido (use letras minúsculas, números e hífens)')
    .max(200)
    .optional(),
  description: z.string().trim().max(2000).nullable().optional(),
  format: z.string().trim().min(2, 'Formato é obrigatório').max(80),
  location: z.string().trim().min(2, 'Local é obrigatório').max(120),
  dateStart: z.coerce.date(),
  dateEnd: z.coerce.date().nullable().optional()
})

export const updateTournamentSchema = z
  .object({
    name: z.string().trim().min(3, 'Nome deve ter ao menos 3 caracteres').max(200).optional(),
    slug: z
      .string()
      .regex(SLUG_PATTERN, 'Slug inválido (use letras minúsculas, números e hífens)')
      .max(200)
      .optional(),
    description: z.string().trim().max(2000).nullable().optional(),
    format: z.string().trim().min(2, 'Formato é obrigatório').max(80).optional(),
    location: z.string().trim().min(2, 'Local é obrigatório').max(120).optional(),
    dateStart: z.coerce.date().optional(),
    dateEnd: z.coerce.date().nullable().optional()
  })
  .strict()

export const listTournamentsSchema = z.object({
  format: z.string().trim().min(1).max(80).optional(),
  location: z.string().trim().min(1).max(120).optional(),
  status: tournamentStatusSchema.optional(),
  from: z.coerce.date().optional(),
  page: z.coerce.number().int().positive().optional(),
  pageSize: z.coerce.number().int().positive().max(100).optional()
})

export const addResultsSchema = z.object({
  results: z.array(tournamentResultSchema).min(1, 'Informe ao menos um resultado').max(512)
})

export type CreateTournamentInput = z.infer<typeof createTournamentSchema>
export type UpdateTournamentInput = z.infer<typeof updateTournamentSchema>
export type ListTournamentsInput = z.infer<typeof listTournamentsSchema>
export type AddResultsInput = z.infer<typeof addResultsSchema>
