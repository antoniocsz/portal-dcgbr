// Path: apps/web/src/features/admin/views/admin-posts-view.tsx
// Views do painel admin de posts (design "Admin — Painel" — tabela editorial
// Título/Status/Autor/Data/Ações):
// - AdminPostsView: listagem editorial com filtro de status, paginação e ações
//   de workflow (enviar p/ revisão / publicar / arquivar) com confirmação.
// - AdminPostFormView: formulário de criação/edição (PostForm controlado pelo
//   usePostForm) + painel de workflow (submit/publish/archive) no desktop.
// Só JSX — dados e callbacks vêm dos ViewModels.
'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button, Card, buttonVariants } from '@/components'
import { cn } from '@/lib/utils'
import { AdminPageHeader } from './admin-page-header'
import { AdminTable } from './admin-table'
import type { AdminTableColumn } from './admin-table'
import { AdminPostBadge } from './admin-badge'
import { PostForm } from '@/features/content/views/admin/post-form'
import { usePostForm } from '@/features/content/viewmodels/use-post-form'
import { usePostActions } from '@/features/content/viewmodels/use-post-actions'
import {
  toPostFormValues,
  useAdminPostForm,
  useAdminPosts
} from '../viewmodels/use-admin-posts'
import type { AdminPostStatusFilter } from '../model/types'
import type { EditorialPostSummary } from '../model/admin-api'
import type { PostFormValues } from '@/features/content/viewmodels/use-post-form'
import type { PostStatus } from '@/features/content/model/types'

const STATUS_FILTERS: { value: AdminPostStatusFilter; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'draft', label: 'Rascunhos' },
  { value: 'review', label: 'Em revisão' },
  { value: 'published', label: 'Publicados' },
  { value: 'archived', label: 'Arquivados' }
]

function formatAdminDate(value: string | null): string {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

export function AdminPostsView() {
  const vm = useAdminPosts()

  const columns: AdminTableColumn<EditorialPostSummary>[] = [
    {
      key: 'title',
      header: 'Título',
      render: (row) => (
        <Link href={`/admin/posts/${row.id}`} className="font-semibold text-ink hover:text-primary">
          {row.title}
        </Link>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <AdminPostBadge status={row.status as PostStatus} />
    },
    {
      key: 'author',
      header: 'Autor',
      render: (row) => <span className="font-mono text-xs text-ink-faint">{row.id.slice(0, 8)}</span>
    },
    {
      key: 'date',
      header: 'Data',
      render: (row) => <span className="text-ink-faint">{formatAdminDate(row.publishedAt ?? row.updatedAt)}</span>
    },
    {
      key: 'actions',
      header: 'Ações',
      render: (row) => (
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/admin/posts/${row.id}`}
            className="text-[13px] font-semibold text-primary hover:underline"
          >
            Editar →
          </Link>
          {row.status === 'draft' ? (
            <Button
              variant="ghost"
              size="sm"
              disabled={vm.busy}
              onClick={() => {
                if (window.confirm(`Enviar "${row.title}" para revisão?`)) vm.submit(row.id)
              }}
            >
              Enviar
            </Button>
          ) : null}
          {row.status === 'review' ? (
            <Button
              variant="ghost"
              size="sm"
              disabled={vm.busy}
              onClick={() => {
                if (window.confirm(`Publicar "${row.title}"?`)) vm.publish(row.id)
              }}
            >
              Publicar
            </Button>
          ) : null}
          {row.status === 'published' ? (
            <Button
              variant="ghost"
              size="sm"
              disabled={vm.busy}
              onClick={() => {
                if (window.confirm(`Arquivar "${row.title}"?`)) vm.archive(row.id)
              }}
            >
              Arquivar
            </Button>
          ) : null}
        </div>
      )
    }
  ]

  return (
    <div className="flex flex-col gap-6 p-4 lg:p-8">
      <AdminPageHeader
        title="Posts"
        subtitle="Workflow editorial: crie, envie para revisão, publique e arquive."
        actions={
          <Link href="/admin/posts/novo" className={buttonVariants({ variant: 'primary', size: 'sm' })}>
            + Novo post
          </Link>
        }
      />

      {vm.actionError ? (
        <p role="alert" className="text-xs font-semibold text-danger">
          {vm.actionError instanceof Error ? vm.actionError.message : 'Falha ao executar a ação.'}
        </p>
      ) : null}

      <Card className="overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-border p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-display text-lg font-bold text-ink">Posts — workflow editorial</h2>
            <span className="text-[13px] text-ink-faint">{vm.total} posts</span>
          </div>

          <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por status">
            {STATUS_FILTERS.map((filter) => (
              <button
                key={filter.value}
                type="button"
                aria-pressed={vm.status === filter.value}
                onClick={() => vm.selectStatus(filter.value)}
                className={cn(
                  'px-3.5 py-2 text-[13px] font-semibold transition-colors',
                  vm.status === filter.value ? 'bg-primary text-white' : 'bg-surface-2 text-ink hover:bg-surface'
                )}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        <AdminTable
          columns={columns}
          rows={vm.rows}
          rowKey={(row) => row.id}
          isLoading={vm.isLoading}
          emptyMessage={vm.isError ? 'Não foi possível carregar os posts.' : 'Nenhum post encontrado.'}
        />

        {vm.totalPages > 1 ? (
          <div className="flex flex-wrap items-center justify-center gap-3 border-t border-border p-4">
            <Button variant="dark" size="sm" disabled={vm.page <= 1} onClick={() => vm.setPage(vm.page - 1)}>
              ← Anterior
            </Button>
            <span className="text-[13px] text-ink-soft">
              Página <span className="font-semibold text-ink">{vm.page}</span> de {vm.totalPages}
            </span>
            <Button
              variant="dark"
              size="sm"
              disabled={vm.page >= vm.totalPages}
              onClick={() => vm.setPage(vm.page + 1)}
            >
              Próxima →
            </Button>
          </div>
        ) : null}
      </Card>
    </div>
  )
}

interface AdminPostFormBodyProps {
  postId?: string
  initial?: PostFormValues
  status?: PostStatus
}

// Corpo do formulário: montado com key={postId} quando o post já foi carregado,
// para o usePostForm inicializar o estado com os valores corretos uma única vez.
function AdminPostFormBody({ postId, initial, status }: AdminPostFormBodyProps) {
  const router = useRouter()
  const isEdit = Boolean(postId)
  const form = usePostForm({
    ...(postId ? { postId } : {}),
    ...(initial ? { initial } : {})
  })
  const actions = usePostActions(postId ?? '')

  const submit = async (): Promise<boolean> => {
    try {
      const ok = await form.handleSubmit()
      if (ok) router.push('/admin/posts')
      return ok
    } catch {
      return false
    }
  }

  const runWorkflowAction = async (fn: () => Promise<unknown>, message: string) => {
    if (!window.confirm(message)) return
    try {
      await fn()
      router.push('/admin/posts')
    } catch {
      // erro já exposto abaixo (mutation.error)
    }
  }

  const workflowError = actions.submit.error ?? actions.publish.error ?? actions.archive.error

  return (
    <div className="flex flex-col gap-6 p-4 lg:p-8">
      <AdminPageHeader
        title={isEdit ? 'Editar post' : 'Novo post'}
        subtitle={
          isEdit
            ? 'Salve alterações e gerencie o workflow editorial.'
            : 'Crie um rascunho e envie para revisão quando estiver pronto.'
        }
        actions={
          <Link href="/admin/posts" className={buttonVariants({ variant: 'dark', size: 'sm' })}>
            ← Voltar
          </Link>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <Card className="p-5 lg:p-6">
          <PostForm
            values={form.values}
            errors={form.errors}
            isPending={form.isPending}
            error={form.error}
            onChange={form.handleChange}
            onSubmit={submit}
            submitLabel={isEdit ? 'Salvar alterações' : 'Salvar rascunho'}
          />
        </Card>

        {isEdit ? (
          <aside className="flex flex-col gap-4">
            <Card className="flex flex-col gap-4 p-5">
              <div className="flex flex-col gap-1">
                <h2 className="font-display text-sm font-bold text-ink">Workflow</h2>
                <span className="text-[11px] uppercase tracking-wide text-ink-faint">
                  draft → review → published
                </span>
              </div>
              <AdminPostBadge status={status ?? 'draft'} />

              {workflowError ? (
                <p role="alert" className="text-xs font-semibold text-danger">
                  {workflowError instanceof Error ? workflowError.message : 'Falha na ação de workflow.'}
                </p>
              ) : null}

              {status === 'draft' ? (
                <Button
                  variant="dark"
                  size="sm"
                  disabled={actions.isPending}
                  onClick={() =>
                    void runWorkflowAction(() => actions.submit.mutateAsync(), 'Enviar para revisão?')
                  }
                >
                  Enviar para revisão
                </Button>
              ) : null}
              {status === 'review' ? (
                <Button
                  variant="primary"
                  size="sm"
                  disabled={actions.isPending}
                  onClick={() =>
                    void runWorkflowAction(() => actions.publish.mutateAsync(), 'Publicar post?')
                  }
                >
                  Publicar
                </Button>
              ) : null}
              {status === 'published' ? (
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={actions.isPending}
                  onClick={() =>
                    void runWorkflowAction(() => actions.archive.mutateAsync(), 'Arquivar post?')
                  }
                >
                  Arquivar
                </Button>
              ) : null}
            </Card>
          </aside>
        ) : null}
      </div>
    </div>
  )
}

function AdminPostFormLoading() {
  return (
    <div className="flex flex-col gap-6 p-4 lg:p-8">
      <AdminPageHeader
        title="Editar post"
        actions={
          <Link href="/admin/posts" className={buttonVariants({ variant: 'dark', size: 'sm' })}>
            ← Voltar
          </Link>
        }
      />
      <Card className="p-5">
        <p className="text-sm text-ink-faint">Carregando post…</p>
      </Card>
    </div>
  )
}

function AdminPostFormError({ error }: { error: unknown }) {
  const message = error instanceof Error ? error.message : 'Não foi possível carregar o post.'
  return (
    <div className="flex flex-col gap-6 p-4 lg:p-8">
      <AdminPageHeader
        title="Editar post"
        actions={
          <Link href="/admin/posts" className={buttonVariants({ variant: 'dark', size: 'sm' })}>
            ← Voltar
          </Link>
        }
      />
      <Card className="p-5">
        <p role="alert" className="text-sm font-semibold text-danger">
          {message}
        </p>
        <p className="mt-2 text-[13px] text-ink-soft">
          Volte para a listagem para usar as ações de workflow (enviar para revisão, publicar,
          arquivar) e reabra o post depois de publicado.
        </p>
      </Card>
    </div>
  )
}

export function AdminPostFormView({ postId }: { postId?: string }) {
  const loader = useAdminPostForm(postId ? { postId } : {})

  if (postId) {
    if (loader.isLoading) return <AdminPostFormLoading />
    if (loader.isError || !loader.data) return <AdminPostFormError error={loader.error} />
    return (
      <AdminPostFormBody
        key={loader.data.post.id}
        postId={postId}
        initial={toPostFormValues(loader.data.post)}
        status={loader.data.post.status}
      />
    )
  }

  return <AdminPostFormBody key="new" />
}
