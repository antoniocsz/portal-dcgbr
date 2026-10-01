// Path: apps/web/src/features/auth/views/register-view.tsx
'use client'

// View: apenas JSX — estado e submissão vêm do ViewModel (MVVM estrito).
import Link from 'next/link'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useRegisterViewModel } from '../viewmodel/use-register-view-model'
import { AuthBenefits } from './auth-benefits'
import { AuthField, AuthFormError } from './auth-field'
import { AuthDivider, AuthHeader, AuthShell } from './auth-shell'

export function RegisterView() {
  const { form, isSubmitting, error, user, updateField, submit } = useRegisterViewModel()

  if (user) {
    return (
      <AuthShell>
        <AuthHeader
          title="Conta criada"
          subtitle={`Bem-vindo(a), ${user.name}! Sua conta ${user.email} foi criada com sucesso.`}
        />
        <Link href="/login" className={cn(buttonVariants(), 'w-full lg:w-fit')}>
          Ir para o login
        </Link>
      </AuthShell>
    )
  }

  return (
    <AuthShell aside={<AuthBenefits />}>
      <AuthHeader title="Criar sua conta" subtitle="Leva menos de um minuto. Grátis para sempre." />
      <form onSubmit={submit} className="flex w-full flex-col gap-4 lg:gap-[18px]">
        <AuthField
          id="register-name"
          label="Nome"
          value={form.name}
          onChange={(value) => updateField('name', value)}
          placeholder="Seu nome completo"
          autoComplete="name"
          required
          minLength={2}
        />
        <AuthField
          id="register-email"
          label="Email"
          type="email"
          value={form.email}
          onChange={(value) => updateField('email', value)}
          placeholder="voce@email.com"
          autoComplete="email"
          required
        />
        <AuthField
          id="register-password"
          label="Senha"
          type="password"
          value={form.password}
          onChange={(value) => updateField('password', value)}
          placeholder="Mínimo 8 caracteres"
          autoComplete="new-password"
          required
          minLength={8}
        />
        <AuthFormError message={error} />
        <Button type="submit" disabled={isSubmitting} className="w-full lg:w-fit">
          {isSubmitting ? 'Criando…' : 'Criar conta'}
        </Button>
        <p className="text-center text-xs text-ink-faint lg:text-[13px] lg:font-semibold lg:text-primary">
          Ao criar a conta você aceita os Termos de Uso e a Política de Privacidade.
        </p>
        <AuthDivider />
        <Link
          href="/login"
          className={cn(buttonVariants({ variant: 'dark' }), 'w-full lg:w-fit')}
        >
          Já tenho conta
        </Link>
      </form>
    </AuthShell>
  )
}
