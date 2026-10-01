// Path: apps/web/src/features/auth/views/auth-field.tsx
'use client'

// View: campo de formulário com label e erro inline. Não guarda estado —
// valor e onChange vêm do ViewModel (MVVM estrito).
import type { ChangeEvent } from 'react'
import { cn } from '@/lib/utils'

export type AuthFieldProps = {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  type?: 'text' | 'email' | 'password'
  placeholder?: string
  autoComplete?: string
  required?: boolean
  minLength?: number
  error?: string | null
}

export function AuthField({
  id,
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  autoComplete,
  required,
  minLength,
  error
}: AuthFieldProps) {
  const errorId = `${id}-error`
  return (
    <div className="flex w-full flex-col gap-1.5">
      <label
        htmlFor={id}
        className="text-xs font-semibold text-ink-soft lg:text-[13px] lg:font-bold lg:text-ink"
      >
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={(event: ChangeEvent<HTMLInputElement>) => onChange(event.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required={required}
        minLength={minLength}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={cn(
          'h-10 w-full border bg-surface-2 px-3 text-sm text-ink outline-none transition-colors',
          'placeholder:text-ink-faint focus:border-primary',
          error ? 'border-danger' : 'border-border'
        )}
      />
      {error ? (
        <p id={errorId} className="text-xs font-semibold text-danger">
          {error}
        </p>
      ) : null}
    </div>
  )
}

export function AuthFormError({ message }: { message: string | null }) {
  if (!message) return null
  return (
    <p role="alert" className="text-xs font-semibold text-danger">
      {message}
    </p>
  )
}
