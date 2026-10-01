// Path: apps/web/src/features/content/views/simulators-view.tsx
// View da página de Simuladores: destaque Alysium + grade da comunidade.
'use client'

import { Button, Tag } from '@/components'
import { cn } from '@/lib/utils'
import { useSimulators } from '../viewmodels/use-simulators'
import { SimulatorCard, SimulatorIcon } from './simulator-card'

export function SimulatorsView() {
  const { alysium, community } = useSimulators()

  return (
    <div className="mx-auto w-full max-w-[1440px] px-4 py-10 lg:px-12">
      <header className="flex flex-col gap-2.5 pb-6">
        <h1 className="font-display text-3xl font-bold text-ink sm:text-4xl lg:text-[40px]">
          Simuladores
        </h1>
        <p className="max-w-3xl text-base leading-6 text-ink-soft">
          Jogue Digimon TCG online: o simulador oficial Alysium e as ferramentas criadas pela
          comunidade.
        </p>
      </header>

      <section className="pb-6" aria-label="Simulador em destaque">
        <article className="flex flex-col gap-7 border border-border bg-surface p-5 lg:flex-row lg:p-7">
          <div
            className={cn(
              'flex h-[170px] items-center justify-center lg:h-[230px] lg:w-[380px] lg:shrink-0',
              alysium.artClass
            )}
          >
            <SimulatorIcon name={alysium.icon} className="size-12 text-white lg:size-16" />
          </div>
          <div className="flex flex-1 flex-col justify-center gap-3">
            <Tag className="bg-primary-soft font-bold uppercase tracking-widest text-primary">
              {alysium.tag}
            </Tag>
            <h2 className="font-display text-xl font-bold text-ink lg:text-[28px]">{alysium.name}</h2>
            <p className="text-sm leading-6 text-ink-soft lg:text-[15px] lg:leading-[23px]">
              {alysium.description}
            </p>
            <div className="flex flex-wrap gap-3 pt-1">
              <Button size="sm">Acessar Alysium</Button>
              <Button variant="dark" size="sm">
                Saber mais
              </Button>
            </div>
          </div>
        </article>
      </section>

      <section className="flex flex-col gap-4" aria-label="Simuladores da comunidade">
        <h2 className="font-display text-xl font-bold text-ink lg:text-[26px]">
          Simuladores da comunidade
        </h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {community.map((simulator) => (
            <SimulatorCard key={simulator.id} simulator={simulator} />
          ))}
        </div>
      </section>
    </div>
  )
}
