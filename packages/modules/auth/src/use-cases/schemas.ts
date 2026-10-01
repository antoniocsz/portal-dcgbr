// Path: packages/modules/auth/src/use-cases/schemas.ts
// Schemas Zod de entrada dos use cases — mesma fonte de verdade para os route handlers.
import { z } from 'zod'
import type { Role } from '@digimon/contracts'

const email = z.string().trim().toLowerCase().email('Email inválido')

/** Senha forte: mínimo 8, com maiúscula, minúscula e número. */
const password = z
  .string()
  .min(8, 'Senha deve ter ao menos 8 caracteres')
  .regex(/[A-Z]/, 'Senha deve ter ao menos uma letra maiúscula')
  .regex(/[a-z]/, 'Senha deve ter ao menos uma letra minúscula')
  .regex(/[0-9]/, 'Senha deve ter ao menos um número')

export const registerSchema = z.object({
  email,
  name: z.string().trim().min(2, 'Nome deve ter ao menos 2 caracteres').max(120),
  password
})

export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Senha é obrigatória')
})

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token é obrigatório')
})

export const forgotPasswordSchema = z.object({
  email
})

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token é obrigatório'),
  password
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>

export interface AuthUserView {
  id: string
  email: string
  name: string
  avatarUrl: string | null
  role: Role
}

export interface AuthSession {
  accessToken: string
  refreshToken: string
  refreshTokenHash: string
  user: AuthUserView
}
