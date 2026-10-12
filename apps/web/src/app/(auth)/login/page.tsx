// Path: apps/web/src/app/(auth)/login/page.tsx
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { LoginView } from '@/features/auth/views'
import { getSession } from '@/lib/session'

export const metadata: Metadata = { title: 'Entrar' }

export default async function LoginPage() {
  // Usuário já logado não deve ver a tela de login.
  const session = await getSession()
  if (session) redirect('/')
  return <LoginView />
}
