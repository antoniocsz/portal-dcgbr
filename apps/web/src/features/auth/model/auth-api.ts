// Path: apps/web/src/features/auth/model/auth-api.ts
// Repository de auth: chamadas fetch aos route handlers (credentials: include
// envia os cookies httpOnly de sessão). Sem hooks, sem JSX — camada Model.
import type { AuthUser, ForgotPasswordForm, LoginForm, RegisterForm, ResetPasswordForm } from './types'

const API = '/api/auth'

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    credentials: 'include'
  })
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as
      | { error?: { code: string; message: string } }
      | null
    throw new Error(body?.error?.message ?? `Erro ${res.status}`)
  }
  return (await res.json()) as T
}

export const authApi = {
  register(input: RegisterForm): Promise<{ user: AuthUser }> {
    return request('/register', { method: 'POST', body: JSON.stringify(input) })
  },
  login(input: LoginForm): Promise<{ user: AuthUser }> {
    return request('/login', { method: 'POST', body: JSON.stringify(input) })
  },
  refresh(): Promise<{ user: AuthUser }> {
    return request('/refresh', { method: 'POST' })
  },
  logout(): Promise<{ ok: true }> {
    return request('/logout', { method: 'POST' })
  },
  forgotPassword(input: ForgotPasswordForm): Promise<{ ok: true }> {
    return request('/forgot-password', { method: 'POST', body: JSON.stringify(input) })
  },
  resetPassword(input: ResetPasswordForm): Promise<{ ok: true }> {
    return request('/reset-password', { method: 'POST', body: JSON.stringify(input) })
  }
}
