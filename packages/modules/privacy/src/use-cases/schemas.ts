// Path: packages/modules/privacy/src/use-cases/schemas.ts
// Schemas Zod de entrada dos use cases — mesma fonte de verdade para as rotas.
import { z } from 'zod'

export const dataRequestTypeSchema = z.enum([
  'access',
  'correction',
  'deletion',
  'portability',
  'consent_revocation',
  'other'
])

export const dataRequestStatusSchema = z.enum(['open', 'in_progress', 'done', 'rejected'])

export const recordConsentSchema = z.object({
  subjectKey: z.string().trim().min(1, 'subjectKey é obrigatório').max(200),
  analytics: z.boolean(),
  ads: z.boolean(),
  policyVersion: z.string().trim().min(1).max(40).optional()
})

export const listConsentRecordsSchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  pageSize: z.coerce.number().int().positive().max(100).optional()
})

export const createDataRequestSchema = z.object({
  type: dataRequestTypeSchema,
  name: z.string().trim().min(1, 'Nome é obrigatório').max(120),
  email: z.string().trim().email('E-mail inválido').max(254),
  message: z.string().trim().min(1, 'Mensagem é obrigatória').max(4000)
})

export const listDataRequestsSchema = z.object({
  status: dataRequestStatusSchema.optional(),
  page: z.coerce.number().int().positive().optional(),
  pageSize: z.coerce.number().int().positive().max(100).optional()
})

export const updateDataRequestStatusSchema = z.object({
  status: dataRequestStatusSchema
})

export type RecordConsentInput = z.infer<typeof recordConsentSchema>
export type ListConsentRecordsInput = z.infer<typeof listConsentRecordsSchema>
export type CreateDataRequestInput = z.infer<typeof createDataRequestSchema>
export type ListDataRequestsInput = z.infer<typeof listDataRequestsSchema>
export type UpdateDataRequestStatusInput = z.infer<typeof updateDataRequestStatusSchema>
