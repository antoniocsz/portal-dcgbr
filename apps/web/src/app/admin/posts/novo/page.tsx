// Path: apps/web/src/app/admin/posts/novo/page.tsx
// Admin — Posts: criar novo post (rascunho). O layout admin exige
// administrator/editor; o backend revalida cada ação.
import type { Metadata } from 'next'
import { AdminPostFormView } from '@/features/admin/views/admin-posts-view'

export const metadata: Metadata = { title: 'Novo post', robots: { index: false } }

export default function AdminNewPostPage() {
  return <AdminPostFormView />
}
