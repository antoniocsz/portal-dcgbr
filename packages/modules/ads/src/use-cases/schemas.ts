// Path: packages/modules/ads/src/use-cases/schemas.ts
// Schemas Zod de entrada dos use cases — mesma fonte de verdade para as rotas.
import { z } from 'zod'

export const adKindSchema = z.enum(['house', 'affiliate', 'sponsor'])

const httpUrlSchema = z
  .string()
  .trim()
  .max(2048)
  .refine((value) => /^https?:\/\//i.test(value), 'A URL deve ser http(s)')

const placementSchema = z.string().trim().min(1, 'Placement é obrigatório').max(80)

export const createAdSchema = z.object({
  title: z.string().trim().min(1, 'Título é obrigatório').max(200),
  subtitle: z.string().trim().max(300).nullable().optional(),
  imageUrl: httpUrlSchema.nullable().optional(),
  targetUrl: httpUrlSchema,
  kind: adKindSchema,
  placements: z.array(placementSchema).min(1, 'Informe ao menos um placement').max(20),
  ctaLabel: z.string().trim().max(60).nullable().optional(),
  sponsorName: z.string().trim().max(120).nullable().optional(),
  disclosure: z.string().trim().max(120).nullable().optional(),
  isActive: z.boolean().optional(),
  priority: z.number().int().min(0, 'priority deve ser maior ou igual a 0').max(1000).optional(),
  startAt: z.coerce.date().nullable().optional(),
  endAt: z.coerce.date().nullable().optional(),
  openInNewTab: z.boolean().optional()
})

export const updateAdSchema = z
  .object({
    title: z.string().trim().min(1, 'Título é obrigatório').max(200).optional(),
    subtitle: z.string().trim().max(300).nullable().optional(),
    imageUrl: httpUrlSchema.nullable().optional(),
    targetUrl: httpUrlSchema.optional(),
    kind: adKindSchema.optional(),
    placements: z.array(placementSchema).min(1, 'Informe ao menos um placement').max(20).optional(),
    ctaLabel: z.string().trim().max(60).nullable().optional(),
    sponsorName: z.string().trim().max(120).nullable().optional(),
    disclosure: z.string().trim().max(120).nullable().optional(),
    isActive: z.boolean().optional(),
    priority: z.number().int().min(0, 'priority deve ser maior ou igual a 0').max(1000).optional(),
    startAt: z.coerce.date().nullable().optional(),
    endAt: z.coerce.date().nullable().optional(),
    openInNewTab: z.boolean().optional()
  })
  .strict()

/** Query strings chegam como texto: aceita boolean e 'true'/'false'. */
const booleanishSchema = z
  .union([z.boolean(), z.enum(['true', 'false'])])
  .transform((value) => value === true || value === 'true')

export const listAdsSchema = z.object({
  placement: placementSchema.optional(),
  kind: adKindSchema.optional(),
  isActive: booleanishSchema.optional(),
  page: z.coerce.number().int().positive().optional(),
  pageSize: z.coerce.number().int().positive().max(100).optional(),
  limit: z.coerce.number().int().positive().max(50).optional()
})

export type CreateAdInput = z.infer<typeof createAdSchema>
export type UpdateAdInput = z.infer<typeof updateAdSchema>
export type ListAdsInput = z.infer<typeof listAdsSchema>
