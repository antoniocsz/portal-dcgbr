// Path: apps/web/src/features/auth/model/auth-api.ts
// Repository de auth: chamadas à API separada (ADR-007) via @digimon/api-client
// (credentials: 'include' envia os cookies httpOnly de sessão). Sem hooks, sem JSX.
import { apiClient } from '@/lib/api-base'
import type { AuthUser, ForgotPasswordForm, LoginForm, RegisterForm, ResetPasswordForm } from './types'

export const authApi = {
  register(input: RegisterForm): Promise<{ user: AuthUser }> {
    return apiClient.post('/auth/register', input)
  },
  login(input: LoginForm): Promise<{ user: AuthUser }> {
    return apiClient.post('/auth/login', input)
  },
  refresh(): Promise<{ user: AuthUser }> {
    return apiClient.post('/auth/refresh')
  },
  logout(): Promise<{ ok: true }> {
    return apiClient.post('/auth/logout')
  },
  forgotPassword(input: ForgotPasswordForm): Promise<{ ok: true }> {
    return apiClient.post('/auth/forgot-password', input)
  },
  resetPassword(input: ResetPasswordForm): Promise<{ ok: true }> {
    return apiClient.post('/auth/reset-password', input)
  }
}
