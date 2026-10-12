// Path: apps/web/src/features/tournaments/views/tournament-form-view.tsx
// View do formulário de torneio (criar E editar). Controlada pelo ViewModel
// useTournamentForm — sem hooks de dados diretos. Em `edit` o título muda, o
// campo de slug vira somente-leitura (o endereço não muda) e os estados de
// loading/404/erro/cancelado são tratados; em `create` mantém o fluxo atual.
'use client'

import type { ChangeEvent, ReactNode } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components'
import { cn } from '@/lib/utils'
import {
  useTournamentForm,
  type TournamentFormMode
} from '../viewmodels/use-tournament-form'

const FORMAT_SUGGESTIONS = ['Standard', 'Booster Draft', 'Sealed', 'Casual']

interface FieldProps {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  type?: string
  placeholder?: string
  required?: boolean
  error?: string | null
  children?: ReactNode
}

function TournamentField({
  id,
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  required,
  error,
  children
}: FieldProps) {
  const errorId = `${id}-error`
  const classes = cn(
    'h-10 w-full border bg-surface-2 px-3 text-sm text-ink outline-none transition-colors',
    'placeholder:text-ink-faint focus:border-primary',
    error ? 'border-danger' : 'border-border'
  )
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-xs font-semibold text-ink-soft lg:text-[13px]">
        {label}
        {required ? <span className="text-danger"> *</span> : null}
      </label>
      {children ?? (
        <input
          id={id}
          name={id}
          type={type}
          value={value}
          onChange={(event: ChangeEvent<HTMLInputElement>) => onChange(event.target.value)}
          placeholder={placeholder}
          required={required}
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

export interface TournamentFormViewProps {
  mode?: TournamentFormMode
  slug?: string
  submitLabel?: string
  onSuccess?: (slug: string) => void
}

export function TournamentFormView({
  mode = 'create',
  slug,
  submitLabel,
  onSuccess
}: TournamentFormViewProps) {
  const router = useRouter()
  const vm = useTournamentForm({ mode, slug })
  const { isEdit, values, errors, isPending, error, result, handleChange, handleSubmit } = vm
  const errorMessage = error instanceof Error ? error.message : null
  const resolvedSubmitLabel = submitLabel ?? (isEdit ? 'Salvar alterações' : 'Publicar torneio')

  if (vm.isLoading) {
    return (
      <div className="flex w-full flex-col gap-4" aria-busy="true" aria-label="Carregando torneio">
        <div className="h-10 w-2/3 animate-pulse bg-surface-2" />
        <div className="h-64 animate-pulse bg-surface-2" />
      </div>
    )
  }

  if (vm.isNotFound) {
    return (
      <div className="flex flex-col items-center gap-4 border border-border bg-surface px-4 py-16 text-center">
        <h2 className="font-display text-xl font-bold text-ink">Torneio não encontrado</h2>
        <p className="text-sm text-ink-soft">
          Este torneio não existe ou você não tem permissão para editá-lo.
        </p>
        <Link href="/torneios" className="text-sm font-semibold text-primary hover:underline">
          ← Voltar para torneios
        </Link>
      </div>
    )
  }

  if (vm.loadError) {
    return (
      <div className="flex flex-col items-center gap-4 border border-border bg-surface px-4 py-16 text-center">
        <p role="alert" className="text-sm text-ink-soft">
          {vm.loadError instanceof Error
            ? vm.loadError.message
            : 'Não foi possível carregar o torneio.'}
        </p>
        <Button variant="dark" size="sm" onClick={() => void vm.refetchTournament()}>
          Tentar novamente
        </Button>
        <Link href="/torneios" className="text-sm font-semibold text-primary hover:underline">
          ← Voltar para torneios
        </Link>
      </div>
    )
  }

  if (vm.isCancelled) {
    return (
      <div className="flex flex-col items-center gap-4 border border-danger/40 bg-surface px-4 py-16 text-center">
        <p role="status" className="text-sm font-semibold text-danger">
          Este torneio foi cancelado e não pode mais ser editado.
        </p>
        <Link
          href={slug ? `/torneios/${slug}` : '/torneios'}
          className="text-sm font-semibold text-primary hover:underline"
        >
          ← Ver torneio
        </Link>
      </div>
    )
  }

  return (
    <form
      className="flex flex-col gap-5"
      onSubmit={(event) => {
        event.preventDefault()
        void handleSubmit().then((saved) => {
          if (!saved) return
          if (onSuccess) onSuccess(saved.slug)
          else if (isEdit) router.push(`/torneios/${saved.slug}`)
        })
      }}
    >
      <TournamentField
        id="tournament-name"
        label="Nome do torneio"
        value={values.name}
        onChange={(value) => handleChange('name', value)}
        placeholder="Ex: Campeonato DigiTCG São Paulo"
        required
        error={errors.name ?? null}
      />

      {isEdit ? (
        <p className="text-xs text-ink-faint">
          Endereço: <span className="text-ink-soft">{values.slug}</span> — o endereço não muda ao
          editar.
        </p>
      ) : (
        <TournamentField
          id="tournament-slug"
          label="Slug (opcional)"
          value={values.slug}
          onChange={(value) => handleChange('slug', value)}
          placeholder="slug-seo-friendly (gerado do nome se vazio)"
          error={errors.slug ?? null}
        />
      )}

      <TournamentField
        id="tournament-format"
        label="Formato"
        value={values.format}
        onChange={(value) => handleChange('format', value)}
        placeholder="Ex: Standard"
        required
        error={errors.format ?? null}
      >
        <input
          id="tournament-format"
          name="format"
          type="text"
          list="tournament-formats"
          value={values.format}
          onChange={(event: ChangeEvent<HTMLInputElement>) => handleChange('format', event.target.value)}
          required
          aria-invalid={errors.format ? true : undefined}
          className={cn(
            'h-10 w-full border bg-surface-2 px-3 text-sm text-ink outline-none transition-colors',
            'placeholder:text-ink-faint focus:border-primary',
            errors.format ? 'border-danger' : 'border-border'
          )}
        />
        <datalist id="tournament-formats">
          {FORMAT_SUGGESTIONS.map((format) => (
            <option key={format} value={format} />
          ))}
        </datalist>
      </TournamentField>

      <TournamentField
        id="tournament-location"
        label="Local (cidade/estado)"
        value={values.location}
        onChange={(value) => handleChange('location', value)}
        placeholder="Ex: São Paulo/SP"
        required
        error={errors.location ?? null}
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <TournamentField
          id="tournament-date-start"
          label="Data de início"
          value={values.dateStart}
          onChange={(value) => handleChange('dateStart', value)}
          type="datetime-local"
          required
          error={errors.dateStart ?? null}
        />
        <TournamentField
          id="tournament-date-end"
          label="Data de término (opcional)"
          value={values.dateEnd}
          onChange={(value) => handleChange('dateEnd', value)}
          type="datetime-local"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="tournament-description" className="text-xs font-semibold text-ink-soft lg:text-[13px]">
          Descrição (opcional)
        </label>
        <textarea
          id="tournament-description"
          name="description"
          value={values.description}
          onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
            handleChange('description', event.target.value)
          }
          rows={4}
          placeholder="Premiação, inscrições, estrutura…"
          className={cn(
            'w-full border bg-surface-2 px-3 py-2.5 text-sm text-ink outline-none transition-colors',
            'placeholder:text-ink-faint focus:border-primary',
            errors.description ? 'border-danger' : 'border-border'
          )}
        />
        {errors.description ? (
          <p className="text-xs font-semibold text-danger">{errors.description}</p>
        ) : null}
      </div>

      {errorMessage ? (
        <p role="alert" className="text-xs font-semibold text-danger">
          {errorMessage}
        </p>
      ) : null}

      {result ? (
        <div className="border border-border bg-surface-2 px-4 py-3">
          <p className="text-sm font-semibold text-ink">
            {isEdit ? 'Alterações salvas!' : 'Torneio publicado com sucesso!'}{' '}
            <Link href={`/torneios/${result.slug}`} className="text-primary underline">
              Ver torneio
            </Link>
          </p>
        </div>
      ) : null}

      <Button type="submit" variant="primary" size="md" disabled={isPending}>
        {isPending ? (isEdit ? 'Salvando…' : 'Publicando…') : resolvedSubmitLabel}
      </Button>
    </form>
  )
}
