// Path: packages/modules/decks/src/use-cases/community/schemas.ts
// Schemas Zod de entrada dos use cases da comunidade — mesma fonte de verdade
// para os route handlers (lote 5).
import { z } from 'zod'

export const communityDeckStatusSchema = z.enum(['public', 'hidden', 'unpublished'])
export const communitySortSchema = z.enum(['top', 'new'])
export const communityPeriodSchema = z.enum(['week', 'month', 'all'])

export const listCommunityDecksSchema = z.object({
  colors: z.array(z.string().trim().min(1).max(40)).max(8).optional(),
  search: z.string().trim().min(1).max(200).optional(),
  sort: communitySortSchema.optional(),
  period: communityPeriodSchema.optional(),
  page: z.coerce.number().int().positive().optional(),
  pageSize: z.coerce.number().int().positive().max(60).optional()
})

export type ListCommunityDecksInput = z.infer<typeof listCommunityDecksSchema>
