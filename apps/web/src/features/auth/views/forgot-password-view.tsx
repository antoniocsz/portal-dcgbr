// Path: apps/web/src/features/auth/views/forgot-password-view.tsx
'use client'

// View: apenas JSX — estado e submissão vêm do ViewModel (MVVM estrito).
import Link from 'next/link'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useForgotPasswordViewModel } from '../viewmodel/use-forgot-password-view-model'
import { AuthField } from './auth-field'
import { AuthHeader, AuthShell } from './auth-shell'

export function ForgotPasswordView() {
  const { form, isSubmitting, error, sent, updateField, submit } = useForgotPasswordViewModel()

  if (sent) {
    return (
      <AuthShell>
        <AuthHeader
          title="Email enviado"
          subtitle={`Se existir uma conta para ${form.email}, você receberá um link de recuperação.`}
        />
        <Link href="/login" className={cn(buttonVariants({ variant: 'dark' }), 'w-full lg:w-fit')}>
          Voltar para o login
        </Link>
      </AuthShell>
    )
  }

  return (
    <AuthShell>
      <AuthHeader
        title="Recuperar senha"
        subtitle="Envie seu e-mail e mandaremos um link para redefinir a senha."
      />
      <form onSubmit={submit} className="flex w-full flex-col gap-4 lg:gap-[18px]">
        <AuthField
          id="forgot-email"
          label="Email"
          type="email"
          value={form.email}
          onChange={updateField}
          placeholder="voce@email.com"
          autoComplete="email"
          required
          error={error}
        />
        <Button type="submit" disabled={isSubmitting} className="w-full lg:w-fit">
          {isSubmitting ? 'Enviando…' : 'Enviar link'}
        </Button>
        <Link
          href="/login"
          className="text-center text-[13px] text-primary hover:underline"
        >
          Voltar para o login
        </Link>
      </form>
    </AuthShell>
  )
}
