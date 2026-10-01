// Path: apps/web/src/features/auth/views/reset-password-view.tsx
'use client'

// View: apenas JSX — estado e submissão vêm do ViewModel (MVVM estrito).
import Link from 'next/link'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useResetPasswordViewModel } from '../viewmodel/use-reset-password-view-model'
import { AuthField, AuthFormError } from './auth-field'
import { AuthHeader, AuthShell } from './auth-shell'

export function ResetPasswordView() {
  const {
    form,
    confirmPassword,
    isSubmitting,
    error,
    done,
    updateField,
    updateConfirmPassword,
    submit
  } = useResetPasswordViewModel()

  if (done) {
    return (
      <AuthShell>
        <AuthHeader
          title="Senha redefinida"
          subtitle="Sua senha foi alterada. Faça login com a nova senha."
        />
        <Link href="/login" className={cn(buttonVariants(), 'w-full lg:w-fit')}>
          Ir para o login
        </Link>
      </AuthShell>
    )
  }

  return (
    <AuthShell>
      <AuthHeader
        title="Redefinir senha"
        subtitle="Informe o token recebido por e-mail e escolha uma nova senha."
      />
      <form onSubmit={submit} className="flex w-full flex-col gap-4 lg:gap-[18px]">
        <AuthField
          id="reset-token"
          label="Token"
          value={form.token}
          onChange={(value) => updateField('token', value)}
          placeholder="Token recebido por email"
          required
        />
        <AuthField
          id="reset-password"
          label="Nova senha"
          type="password"
          value={form.password}
          onChange={(value) => updateField('password', value)}
          placeholder="Mínimo 8 caracteres"
          autoComplete="new-password"
          required
          minLength={8}
        />
        <AuthField
          id="reset-confirm"
          label="Confirmar nova senha"
          type="password"
          value={confirmPassword}
          onChange={updateConfirmPassword}
          placeholder="Repita a nova senha"
          autoComplete="new-password"
          required
          minLength={8}
        />
        <AuthFormError message={error} />
        <Button type="submit" disabled={isSubmitting} className="w-full lg:w-fit">
          {isSubmitting ? 'Salvando…' : 'Salvar nova senha'}
        </Button>
        <Link href="/login" className="text-center text-[13px] text-primary hover:underline">
          Voltar para o login
        </Link>
      </form>
    </AuthShell>
  )
}
