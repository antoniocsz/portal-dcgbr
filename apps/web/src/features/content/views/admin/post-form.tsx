// Path: apps/web/src/features/content/views/admin/post-form.tsx
// View presentacional do formulário editorial (criação/edição).
// Controlado 100% por props — o ViewModel (usePostForm) orquestra o estado.
// Estilização alinhada ao design system (dcg.pen): cantos retos, tokens
// surface-2/border/danger e primitiva Button (task 17).
'use client'

import type { ChangeEvent } from 'react'
import { Button } from '@/components'
import { PostEditor } from '@/components/editor'
import { cn } from '@/lib/utils'
import type { PostCategory } from '../../model/types'
import { CATEGORY_LABELS } from '../../model/types'
import type { PostFormValues } from '../../viewmodels/use-post-form'

export interface PostFormProps {
  values: PostFormValues
  errors: Record<string, string>
  isPending: boolean
  error?: unknown
  onChange: (field: keyof PostFormValues, value: string) => void
  onSubmit: () => Promise<boolean>
  submitLabel?: string
}

const CATEGORY_OPTIONS = Object.entries(CATEGORY_LABELS) as [PostCategory, string][]

interface FieldProps {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  type?: 'text' | 'url'
  placeholder?: string
  error?: string | null
  as?: 'input' | 'textarea' | 'select'
  children?: React.ReactNode
}

function PostField({
  id,
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  error,
  as = 'input',
  children
}: FieldProps) {
  const errorId = `${id}-error`
  const classes = cn(
    'w-full border bg-surface-2 text-sm text-ink outline-none transition-colors',
    'placeholder:text-ink-faint focus:border-primary',
    error ? 'border-danger' : 'border-border',
    as === 'textarea' ? 'min-h-48 px-3 py-2.5' : 'h-10 px-3'
  )

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-xs font-semibold text-ink-soft lg:text-[13px]">
        {label}
      </label>
      {as === 'textarea' ? (
        <textarea
          id={id}
          name={id}
          value={value}
          onChange={(event: ChangeEvent<HTMLTextAreaElement>) => onChange(event.target.value)}
          placeholder={placeholder}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={classes}
        />
      ) : as === 'select' ? (
        <select
          id={id}
          name={id}
          value={value}
          onChange={(event: ChangeEvent<HTMLSelectElement>) => onChange(event.target.value)}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={classes}
        >
          {children}
        </select>
      ) : (
        <input
          id={id}
          name={id}
          type={type}
          value={value}
          onChange={(event: ChangeEvent<HTMLInputElement>) => onChange(event.target.value)}
          placeholder={placeholder}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={classes}
        />
      )}
      {error ? (
        <p id={errorId} className="text-xs font-semibold text-danger">
          {error}
        </p>
      ) : null}
    </div>
  )
}

export function PostForm({
  values,
  errors,
  isPending,
  error,
  onChange,
  onSubmit,
  submitLabel = 'Salvar rascunho'
}: PostFormProps) {
  const errorMessage = error instanceof Error ? error.message : null

  return (
    <form
      className="flex flex-col gap-5"
      onSubmit={(event) => {
        event.preventDefault()
        void onSubmit()
      }}
    >
      <div className="grid gap-5 lg:grid-cols-2">
        <PostField
          id="post-title"
          label="Título"
          value={values.title}
          onChange={(value) => onChange('title', value)}
          placeholder="Título do post"
          error={errors.title ?? null}
        />

        <PostField
          id="post-slug"
          label="Slug (opcional)"
          value={values.slug}
          onChange={(value) => onChange('slug', value)}
          placeholder="slug-seo-friendly"
          error={errors.slug ?? null}
        />

        <PostField
          id="post-category"
          label="Categoria"
          value={values.category}
          onChange={(value) => onChange('category', value as PostCategory)}
          as="select"
        >
          {CATEGORY_OPTIONS.map(([optionValue, label]) => (
            <option key={optionValue} value={optionValue}>
              {label}
            </option>
          ))}
        </PostField>

        <PostField
          id="post-excerpt"
          label="Resumo (opcional)"
          value={values.excerpt}
          onChange={(value) => onChange('excerpt', value)}
          placeholder="Resumo exibido nas listagens"
        />

        <PostField
          id="post-cover"
          label="URL da imagem de capa (opcional)"
          value={values.coverImage}
          onChange={(value) => onChange('coverImage', value)}
          type="url"
          placeholder="https://…"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="post-body" className="text-xs font-semibold text-ink-soft lg:text-[13px]">
          Conteúdo
        </label>
        <PostEditor
          id="post-body"
          value={values.body}
          onChange={(html) => onChange('body', html)}
          ariaLabel="Conteúdo do post"
        />
        {errors.body ? <p className="text-xs text-danger">{errors.body}</p> : null}
      </div>

      {errorMessage ? (
        <p role="alert" className="border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">
          {errorMessage}
        </p>
      ) : null}

      <Button type="submit" variant="primary" size="md" disabled={isPending}>
        {isPending ? 'Salvando…' : submitLabel}
      </Button>
    </form>
  )
}
