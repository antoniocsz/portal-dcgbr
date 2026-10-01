// Path: apps/web/src/features/content/viewmodels/use-simulators.ts
// ViewModel da página de Simuladores: conteúdo estático editorial (categoria simulator).
// O módulo de backend de simuladores ainda não existe — dados fixos nesta task.
'use client'

export type SimulatorIconName = 'gamepad' | 'globe' | 'swords' | 'dice'

export interface SimulatorView {
  id: string
  name: string
  description: string
  icon: SimulatorIconName
  artClass: string
  tag?: string
}

export const ALYSIUM: SimulatorView = {
  id: 'alysium',
  name: 'Alysium — o simulador oficial',
  description:
    'O simulador oficial do Digimon Card Game, com lançamento previsto para 2026. ' +
    'Regras completas, partidas online e suporte a torneios.',
  icon: 'gamepad',
  artClass: 'bg-[linear-gradient(121deg,#C22B33_14.6%,#6FA0A8_85.4%)]',
  tag: 'Oficial'
}

export const COMMUNITY_SIMULATORS: SimulatorView[] = [
  {
    id: 'dcg-sim',
    name: 'DCG Sim',
    description: 'Simulador web open-source com todas as cartas e regras atualizadas.',
    icon: 'globe',
    artClass: 'bg-[linear-gradient(109deg,#2563EB_14.6%,#7C3AED_85.4%)]',
    tag: 'Grátis'
  },
  {
    id: 'digimon-tcg-online',
    name: 'Digimon TCG Online',
    description: 'Partidas casuais e ranqueadas com amigos, com suporte a torneios.',
    icon: 'swords',
    artClass: 'bg-[linear-gradient(109deg,#22C55E_14.6%,#0EA5E9_85.4%)]',
    tag: 'Grátis'
  },
  {
    id: 'tabletop-sim',
    name: 'Tabletop Sim',
    description: 'Mod da comunidade para jogar Digimon TCG no Tabletop Simulator.',
    icon: 'dice',
    artClass: 'bg-[linear-gradient(109deg,#E5B93B_14.6%,#C22B33_85.4%)]',
    tag: 'Grátis'
  }
]

export interface SimulatorsData {
  alysium: SimulatorView
  community: SimulatorView[]
}

export function useSimulators(): SimulatorsData {
  return { alysium: ALYSIUM, community: COMMUNITY_SIMULATORS }
}
