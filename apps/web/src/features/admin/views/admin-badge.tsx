// Path: apps/web/src/features/admin/views/admin-badge.tsx
// Views puras: badges de papel, status de conta, status de post e de comentário.
// Reaproveitam StatusBadge do design system.
import type { CommentStatus, PostStatus, Role } from '@digimon/contracts'
import { StatusBadge } from '@/components'
import type { StatusTone } from '@/components'

const ROLE_TONES: Record<Role, StatusTone> = {
  administrator: 'success',
  editor: 'warning',
  member: 'info'
}

const ROLE_LABELS: Record<Role, string> = {
  administrator: 'Administrator',
  editor: 'Editor',
  member: 'Member'
}

export function AdminRoleBadge({ role }: { role: Role }) {
  return <StatusBadge tone={ROLE_TONES[role]}>{ROLE_LABELS[role]}</StatusBadge>
}

const ACCOUNT_TONES: Record<'active' | 'inactive', StatusTone> = {
  active: 'success',
  inactive: 'neutral'
}

export function AdminStatusBadge({ status }: { status: 'active' | 'inactive' }) {
  return <StatusBadge tone={ACCOUNT_TONES[status]}>{status === 'active' ? 'Ativo' : 'Inativo'}</StatusBadge>
}

const POST_TONES: Record<PostStatus, StatusTone> = {
  published: 'success',
  review: 'warning',
  draft: 'neutral',
  archived: 'neutral'
}

export function AdminPostBadge({ status }: { status: PostStatus }) {
  return <StatusBadge tone={POST_TONES[status]}>{status}</StatusBadge>
}

const COMMENT_TONES: Record<CommentStatus, StatusTone> = {
  visible: 'success',
  hidden: 'warning',
  deleted: 'neutral'
}

const COMMENT_LABELS: Record<CommentStatus, string> = {
  visible: 'Visível',
  hidden: 'Oculto',
  deleted: 'Removido'
}

export function AdminCommentBadge({ status }: { status: CommentStatus }) {
  return <StatusBadge tone={COMMENT_TONES[status]}>{COMMENT_LABELS[status]}</StatusBadge>
}
