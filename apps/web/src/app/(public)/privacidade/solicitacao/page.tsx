// Path: apps/web/src/app/(public)/privacidade/solicitacao/page.tsx
// Canal público de solicitações do titular (LGPD art. 18 §3º). Server Component
// com metadata; renderiza o formulário (View client) da feature privacy.
import type { Metadata } from 'next'
import Link from 'next/link'
import { DataRequestFormView } from '@/features/privacy/views'

export const metadata: Metadata = {
  title: 'Solicitação de dados (LGPD)',
  description:
    'Exerça os seus direitos como titular de dados: solicite acesso, correção, eliminação, ' +
    'portabilidade ou revogação de consentimento.',
  alternates: { canonical: '/privacidade/solicitacao' }
}

export default function SolicitacaoDadosPage() {
  return (
    <div className="mx-auto w-full max-w-[760px] px-4 py-10 lg:py-16">
      <header className="flex flex-col gap-3 border-b border-border pb-6">
        <h1 className="font-display text-3xl font-bold text-ink sm:text-4xl">
          Solicitação de dados
        </h1>
        <p className="text-base leading-6 text-ink-soft">
          Use este canal para exercer os seus direitos como titular de dados (LGPD, art. 18).
          Envie a sua solicitação e ela será encaminhada ao nosso encarregado de dados (DPO).
        </p>
      </header>

      <div className="mt-8">
        <DataRequestFormView />
      </div>

      <p className="mt-8 text-sm text-ink-faint">
        Prefere entender antes? Leia a{' '}
        <Link
          href="/privacidade"
          className="font-semibold text-accent underline underline-offset-2"
        >
          Política de Privacidade
        </Link>{' '}
        ou saiba quais cookies usamos na{' '}
        <Link href="/cookies" className="font-semibold text-accent underline underline-offset-2">
          Política de Cookies
        </Link>
        .
      </p>
    </div>
  )
}
