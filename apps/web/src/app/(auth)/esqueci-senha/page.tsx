// Path: apps/web/src/app/(auth)/esqueci-senha/page.tsx
import type { Metadata } from 'next'
import { ForgotPasswordView } from '@/features/auth/views'

export const metadata: Metadata = { title: 'Recuperar senha' }

export default function ForgotPasswordPage() {
  return <ForgotPasswordView />
}
