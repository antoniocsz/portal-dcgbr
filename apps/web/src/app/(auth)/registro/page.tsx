// Path: apps/web/src/app/(auth)/registro/page.tsx
import type { Metadata } from 'next'
import { RegisterView } from '@/features/auth/views'

export const metadata: Metadata = { title: 'Criar conta' }

export default function RegisterPage() {
  return <RegisterView />
}
