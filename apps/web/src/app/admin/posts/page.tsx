// Path: apps/web/src/app/admin/posts/page.tsx
// Admin — Posts: gestão do workflow editorial (criar, editar, enviar para
// revisão, publicar, arquivar). O layout admin exige administrator/editor;
// o backend revalida cada ação.
import type { Metadata } from 'next'
import { AdminPostsView } from '@/features/admin/views/admin-posts-view'

export const metadata: Metadata = { title: 'Posts', robots: { index: false } }

export default function AdminPostsPage() {
  return <AdminPostsView />
}
