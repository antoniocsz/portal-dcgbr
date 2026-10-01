// Path: apps/web/src/app/admin/comentarios/page.tsx
// Moderação de comentários — acessível a administrator e editor.
import type { Metadata } from 'next'
import { AdminCommentsView } from '@/features/admin/views/admin-comments-view'

export const metadata: Metadata = { title: 'Comentários' }

export default function AdminCommentsPage() {
  return <AdminCommentsView />
}
