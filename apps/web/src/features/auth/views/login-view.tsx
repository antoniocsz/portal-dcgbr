// Path: apps/web/src/features/auth/views/login-view.tsx
'use client'

// View: apenas JSX — estado e submissão vêm do ViewModel (MVVM estrito).
import Link from 'next/link'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useLoginViewModel } from '../viewmodel/use-login-view-model'
import { AuthBenefits } from './auth-benefits'
import { AuthField, AuthFormError } from './auth-field'
import { AuthDivider, AuthHeader, AuthShell } from './auth-shell'

export function LoginView() {
  const { form, isSubmitting, error, user, updateField, submit } = useLoginViewModel()

  if (user) {
    return (
      <AuthShell>
        <AuthHeader title="Login efetuado" subtitle={`Sessão iniciada como ${user.email}.`} />
        <Link href="/" className={cn(buttonVariants(), 'w-full lg:w-fit')}>
          Ir para a home
        </Link>
      </AuthShell>
    )
  }

  return (
    <AuthShell aside={<AuthBenefits />}>
      <AuthHeader title="Entrar na sua conta" subtitle="Comente, monte decks e publique torneios." />
      <form onSubmit={submit} className="flex w-full flex-col gap-4 lg:gap-[18px]">
        <AuthField
          id="login-email"
          label="Email"
          type="email"
          value={form.email}
          onChange={(value) => updateField('email', value)}
          placeholder="voce@email.com"
          autoComplete="email"
          required
        />
        <AuthField
          id="login-password"
          label="Senha"
          type="password"
          value={form.password}
          onChange={(value) => updateField('password', value)}
          placeholder="••••••••"
          autoComplete="current-password"
          required
        />
        <AuthFormError message={error} />
        <Button type="submit" disabled={isSubmitting} className="w-full lg:w-fit">
          {isSubmitting ? 'Entrando…' : 'Entrar'}
        </Button>
        <Link
          href="/esqueci-senha"
          className="text-center text-[13px] font-semibold text-primary hover:underline"
        >
          Esqueci minha senha
        </Link>
        <AuthDivider label="novo por aqui?" />
        <Link
          href="/registro"
          className={cn(buttonVariants({ variant: 'dark' }), 'w-full lg:w-fit')}
        >
          Criar conta gratuita
        </Link>
      </form>
    </AuthShell>
  )
}
