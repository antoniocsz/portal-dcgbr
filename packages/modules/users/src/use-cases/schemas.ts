// Path: packages/modules/users/src/use-cases/schemas.ts
// Schemas Zod de entrada dos use cases — mesma fonte de verdade para os route handlers.
import { z } from 'zod'
import type { Role } from '@digimon/contracts'

const roleSchema = z.enum(['administrator', 'editor', 'member'])
const statusSchema = z.enum(['active', 'inactive'])

export const updateProfileSchema = z
  .object({
    name: z.string().trim().min(2, 'Nome deve ter ao menos 2 caracteres').max(120).optional(),
    avatarUrl: z.string().url('URL de avatar inválida').nullable().optional()
  })
  .refine((data) => data.name !== undefined || data.avatarUrl !== undefined, {
    message: 'Informe ao menos um campo para atualizar'
  })

export const assignRoleSchema = z.object({
  role: roleSchema
})

export const setUserStatusSchema = z.object({
  status: statusSchema
})

export const listUsersSchema = z.object({
  search: z.string().trim().max(120).optional(),
  role: roleSchema.optional(),
  status: statusSchema.optional(),
  page: z.coerce.number().int().positive().optional(),
  pageSize: z.coerce.number().int().positive().max(100).optional()
})

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>
export type AssignRoleInput = z.infer<typeof assignRoleSchema>
export type SetUserStatusInput = z.infer<typeof setUserStatusSchema>
export type ListUsersInput = z.infer<typeof listUsersSchema>

export interface UserView {
  id: string
  email: string
  name: string
  avatarUrl: string | null
  role: Role
  status: 'active' | 'inactive'
  emailVerifiedAt: Date | null
  createdAt: Date
  updatedAt: Date
}
