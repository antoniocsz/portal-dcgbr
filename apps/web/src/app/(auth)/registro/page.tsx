// Path: apps/web/src/app/(auth)/registro/page.tsx
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { RegisterView } from '@/features/auth/views'
import { getSession } from '@/lib/session'

export const metadata: Metadata = { title: 'Criar conta' }

export default async function RegisterPage() {
  // Usuário já logado não deve ver a tela de registro.
  const session = await getSession()
  if (session) redirect('/')
  return <RegisterView />
}
