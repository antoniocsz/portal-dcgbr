// Path: apps/web/src/features/auth/views/auth-benefits.tsx
// View: painel lateral "Por que criar uma conta?" — só no desktop (lg+).
import type { SVGProps } from 'react'

function Check(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={18}
      height={18}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}

const BENEFITS = [
  'Comentar em notícias, cartas e decks',
  'Salvar e copiar decks da comunidade',
  'Publicar torneios direto, sem revisão',
  'Papel Member gratuito — sem planos'
] as const

export function AuthBenefits() {
  return (
    <aside className="hidden w-full max-w-[440px] shrink-0 flex-col gap-4 bg-bg p-8 lg:flex">
      <h2 className="font-display text-2xl font-bold text-ink">Por que criar uma conta?</h2>
      <ul className="flex flex-col gap-4">
        {BENEFITS.map((benefit) => (
          <li key={benefit} className="flex items-center gap-2.5">
            <Check className="size-[18px] shrink-0 text-accent" />
            <span className="flex-1 text-sm text-ink-soft">{benefit}</span>
          </li>
        ))}
      </ul>
    </aside>
  )
}
