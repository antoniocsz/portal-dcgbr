// Path: apps/web/src/app/(auth)/reset-senha/page.tsx
import type { Metadata } from 'next'
import { ResetPasswordView } from '@/features/auth/views'

export const metadata: Metadata = { title: 'Redefinir senha' }

export default function ResetPasswordPage() {
  return <ResetPasswordView />
}
