// Path: apps/web/src/features/privacy/views/data-request-form.tsx
// View do formulário público de solicitação do titular (LGPD). Campos: tipo
// (acesso/correção/eliminação/portabilidade/revogação/outro), nome, e-mail e
// mensagem. Só JSX — estados e callbacks vêm de `useDataRequest` (MVVM estrito).
'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'
import { Button } from '@/components'
import { cn } from '@/lib/utils'
import { useDataRequest } from '../viewmodels/use-data-request'
import {
  DATA_REQUEST_TYPES,
  DATA_REQUEST_TYPE_LABELS,
  type DataRequestType
} from '../model/types'

const INPUT_CLASS =
  'h-10 w-full border bg-surface-2 px-3 text-sm text-ink outline-none transition-colors '
  + 'placeholder:text-ink-faint focus:border-primary disabled:opacity-60'

interface FieldProps {
  id: string
  label: string
  error?: string | undefined
  hint?: string | undefined
  required?: boolean
  children: ReactNode
}

function Field({ id, label, error, hint, required, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[13px] font-semibold text-ink-soft">
        {label}
        {required ? <span className="text-danger"> *</span> : null}
      </label>
      {children}
      {hint ? <p className="text-xs text-ink-faint">{hint}</p> : null}
      {error ? (
        <p id={`${id}-error`} role="alert" className="text-xs font-semibold text-danger">
          {error}
        </p>
      ) : null}
    </div>
  )
}

export function DataRequestFormView() {
  const vm = useDataRequest()
  const { values, errors, isPending, error, result } = vm
  const errorMessage = error instanceof Error ? error.message : null

  if (result) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="flex flex-col gap-3 border border-success/40 bg-success/10 px-5 py-6"
      >
        <h2 className="font-display text-lg font-bold text-ink">Solicitação registrada</h2>
        <p className="text-sm leading-6 text-ink-soft">
          Recebemos a sua solicitação e ela entrou na fila de atendimento do encarregado de dados.
          Protocolo: <span className="font-mono text-ink">{result.id}</span>. Responderemos no
          e-mail informado, nos prazos previstos na LGPD.
        </p>
        <div className="flex flex-wrap items-center gap-4">
          <Button variant="dark" size="sm" onClick={vm.reset}>
            Enviar outra solicitação
          </Button>
          <Link
            href="/privacidade"
            className="text-sm font-semibold text-accent underline underline-offset-2"
          >
            ← Voltar para a Política de Privacidade
          </Link>
        </div>
      </div>
    )
  }

  return (
    <form
      className="flex flex-col gap-5"
      noValidate
      onSubmit={(event) => {
        event.preventDefault()
        void vm.handleSubmit()
      }}
    >
      <Field id="dr-type" label="Tipo de solicitação" required>
        <select
          id="dr-type"
          name="type"
          value={values.type}
          disabled={isPending}
          onChange={(event) => vm.setField('type', event.target.value as DataRequestType)}
          className={cn(INPUT_CLASS, 'border-border')}
        >
          {DATA_REQUEST_TYPES.map((type) => (
            <option key={type} value={type}>
              {DATA_REQUEST_TYPE_LABELS[type]}
            </option>
          ))}
        </select>
      </Field>

      <Field id="dr-name" label="Seu nome" required error={errors.name}>
        <input
          id="dr-name"
          name="name"
          type="text"
          autoComplete="name"
          value={values.name}
          disabled={isPending}
          placeholder="Como devemos chamar você"
          aria-invalid={errors.name ? true : undefined}
          aria-describedby={errors.name ? 'dr-name-error' : undefined}
          onChange={(event) => vm.setField('name', event.target.value)}
          className={cn(INPUT_CLASS, errors.name ? 'border-danger' : 'border-border')}
        />
      </Field>

      <Field id="dr-email" label="E-mail para contato" required error={errors.email}>
        <input
          id="dr-email"
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          value={values.email}
          disabled={isPending}
          placeholder="voce@exemplo.com"
          aria-invalid={errors.email ? true : undefined}
          aria-describedby={errors.email ? 'dr-email-error' : undefined}
          onChange={(event) => vm.setField('email', event.target.value)}
          className={cn(INPUT_CLASS, errors.email ? 'border-danger' : 'border-border')}
        />
      </Field>

      <Field
        id="dr-message"
        label="Descrição da solicitação"
        required
        error={errors.message}
        hint="Descreva o que você precisa. Você pode pedir acesso, correção, eliminação, portabilidade ou revogação do consentimento."
      >
        <textarea
          id="dr-message"
          name="message"
          rows={5}
          value={values.message}
          disabled={isPending}
          placeholder="Conte os detalhes da sua solicitação…"
          aria-invalid={errors.message ? true : undefined}
          aria-describedby={errors.message ? 'dr-message-error' : undefined}
          onChange={(event) => vm.setField('message', event.target.value)}
          className={cn(
            'w-full border bg-surface-2 px-3 py-2.5 text-sm text-ink outline-none transition-colors',
            'placeholder:text-ink-faint focus:border-primary disabled:opacity-60',
            errors.message ? 'border-danger' : 'border-border'
          )}
        />
      </Field>

      {errorMessage ? (
        <p role="alert" className="text-xs font-semibold text-danger">
          {errorMessage}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" variant="primary" size="md" disabled={isPending}>
          {isPending ? 'Enviando…' : 'Enviar solicitação'}
        </Button>
        <p className="text-xs text-ink-faint">
          Seus dados são usados apenas para responder a esta solicitação.
        </p>
      </div>
    </form>
  )
}
