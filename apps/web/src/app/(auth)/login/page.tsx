// Path: apps/web/src/app/(auth)/login/page.tsx
import type { Metadata } from 'next'
import { LoginView } from '@/features/auth/views'

export const metadata: Metadata = { title: 'Entrar' }

export default function LoginPage() {
  return <LoginView />
}
