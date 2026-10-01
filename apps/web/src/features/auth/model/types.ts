// Path: apps/web/src/features/auth/model/types.ts
// Tipos do domínio de auth consumidos pela UI (espelham os DTOs dos módulos).
import type { Role } from '@digimon/contracts'
import type { AuthUserView } from '@digimon/auth'

export type { AuthUserView }
export type AuthUser = AuthUserView

export interface RegisterForm {
  email: string
  name: string
  password: string
}

export interface LoginForm {
  email: string
  password: string
}

export interface ForgotPasswordForm {
  email: string
}

export interface ResetPasswordForm {
  token: string
  password: string
}

export interface AuthApiError {
  code: string
  message: string
}

export interface SessionUser extends AuthUser {
  role: Role
}
