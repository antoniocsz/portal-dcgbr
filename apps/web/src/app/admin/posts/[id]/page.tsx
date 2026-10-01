// Path: apps/web/src/app/admin/posts/[id]/page.tsx
// Admin — Posts: editar post (carrega o conteúdo completo por slug após
// resolver o id na listagem editorial). O layout admin exige
// administrator/editor; o backend revalida cada ação.
import type { Metadata } from 'next'
import { AdminPostFormView } from '@/features/admin/views/admin-posts-view'

export const metadata: Metadata = { title: 'Editar post', robots: { index: false } }

interface AdminEditPostPageProps {
  params: Promise<{ id: string }>
}

export default async function AdminEditPostPage({ params }: AdminEditPostPageProps) {
  const { id } = await params
  return <AdminPostFormView postId={id} />
}
