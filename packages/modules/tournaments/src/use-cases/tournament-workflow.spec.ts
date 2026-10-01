// Path: packages/modules/tournaments/src/use-cases/tournament-workflow.spec.ts
// Critérios da task 07:
// - Member publica torneio direto (sem revisão)
// - criador edita/cancela; outros Members não (ForbiddenError)
// - agenda lista próximos por formato/local
// - resultados adicionados só por criador/Admin/Editor
import { describe, expect, it } from 'vitest'
import type { PaginatedResult, Role } from '@digimon/contracts'
import {
  ConflictError,
  ForbiddenError,
  InMemoryEventBus,
  NotFoundError,
  ValidationError
} from '@digimon/contracts'
import type { Actor } from '../domain/actor'
import {
  Tournament,
  type TournamentData
} from '../domain/entities/tournament'
import type {
  ListTournamentsParams,
  TournamentRepository
} from '../domain/repositories/tournament-repository'
import { AddResultsUseCase } from './add-results'
import { CancelTournamentUseCase } from './cancel-tournament'
import { CreateTournamentUseCase, type CreateTournamentCommand } from './create-tournament'
import { GetTournamentUseCase } from './get-tournament'
import { ListTournamentsUseCase } from './list-tournaments'
import { UpdateTournamentUseCase } from './update-tournament'

class InMemoryTournamentRepository implements TournamentRepository {
  private readonly items = new Map<string, Tournament>()

  async create(data: TournamentData): Promise<void> {
    this.items.set(data.id, Tournament.fromData(data))
  }

  async update(tournament: Tournament): Promise<void> {
    this.items.set(tournament.id, tournament)
  }

  async findById(id: string): Promise<Tournament | null> {
    return this.items.get(id) ?? null
  }

  async findBySlug(slug: string): Promise<Tournament | null> {
    for (const tournament of this.items.values()) {
      if (tournament.slug === slug) return tournament
    }
    return null
  }

  async list(params: ListTournamentsParams): Promise<PaginatedResult<Tournament>> {
    const page = params.page ?? 1
    const pageSize = params.pageSize ?? 20
    let items = [...this.items.values()]

    if (params.status) items = items.filter((t) => t.status === params.status)
    if (params.organizerId) items = items.filter((t) => t.organizerId === params.organizerId)

    const format = params.format?.toLowerCase()
    if (format) items = items.filter((t) => t.data.format.toLowerCase() === format)

    const location = params.location?.toLowerCase()
    if (location) items = items.filter((t) => t.data.location.toLowerCase().includes(location))

    const from = params.from
    if (from) items = items.filter((t) => t.data.dateStart.getTime() >= from.getTime())

    items.sort((a, b) => a.data.dateStart.getTime() - b.data.dateStart.getTime())

    return {
      items: items.slice((page - 1) * pageSize, page * pageSize),
      total: items.length,
      page,
      pageSize
    }
  }
}

function actor(role: Role, id = 'user-1'): Actor {
  return { id, role }
}

const member = actor('member')
const editor = actor('editor', 'user-2')
const admin = actor('administrator', 'user-3')

function setup() {
  const repo = new InMemoryTournamentRepository()
  const eventBus = new InMemoryEventBus()
  const events: string[] = []
  for (const type of [
    'tournament.created',
    'tournament.updated',
    'tournament.cancelled',
    'tournament.results.added'
  ]) {
    eventBus.subscribe(type, (event) => {
      events.push(event.type)
    })
  }
  return {
    repo,
    eventBus,
    events,
    create: new CreateTournamentUseCase(repo, eventBus),
    update: new UpdateTournamentUseCase(repo, eventBus),
    cancel: new CancelTournamentUseCase(repo, eventBus),
    addResults: new AddResultsUseCase(repo, eventBus),
    get: new GetTournamentUseCase(repo),
    list: new ListTournamentsUseCase(repo)
  }
}

function createCommand(overrides: Partial<CreateTournamentCommand['input']> = {}): CreateTournamentCommand {
  return {
    actor: member,
    input: {
      name: 'Campeonato DigiTCG São Paulo',
      format: 'Standard',
      location: 'São Paulo/SP',
      dateStart: new Date('2026-11-15T13:00:00.000Z'),
      ...overrides
    }
  }
}

describe('CreateTournamentUseCase', () => {
  it('Member publica torneio direto (published) e emite tournament.created', async () => {
    const { create, repo, events } = setup()
    const result = await create.execute(createCommand())

    expect(result.slug).toBe('campeonato-digitcg-sao-paulo')
    const tournament = await repo.findById(result.id)
    expect(tournament?.status).toBe('published')
    expect(tournament?.organizerId).toBe(member.id)
    expect(tournament?.data.results).toBeNull()
    expect(events).toEqual(['tournament.created'])
  })

  it('rejeita slug duplicado com ConflictError', async () => {
    const { create } = setup()
    await create.execute(createCommand({ slug: 'copa-brasil' }))
    await expect(create.execute(createCommand({ slug: 'copa-brasil' }))).rejects.toBeInstanceOf(
      ConflictError
    )
  })

  it('rejeita dados inválidos (nome curto)', async () => {
    const { create } = setup()
    const error = await create.execute(createCommand({ name: 'x' })).catch((e: unknown) => e)
    expect(error).toBeInstanceOf(ValidationError)
    expect((error as ValidationError).details).toMatchObject({
      fieldErrors: { name: expect.any(Array) }
    })
  })
})

describe('Edição e cancelamento — criador vs outros Members', () => {
  it('criador edita e cancela; eventos são publicados', async () => {
    const { create, update, cancel, repo, events } = setup()
    const created = await create.execute(createCommand())

    await update.execute({ actor: member, slug: created.slug, input: { location: 'Campinas/SP' } })
    expect((await repo.findBySlug(created.slug))?.data.location).toBe('Campinas/SP')

    await cancel.execute({ actor: member, slug: created.slug })
    expect((await repo.findBySlug(created.slug))?.status).toBe('cancelled')
    expect(events).toEqual(['tournament.created', 'tournament.updated', 'tournament.cancelled'])
  })

  it('outro Member não edita nem cancela (ForbiddenError)', async () => {
    const { create, update, cancel } = setup()
    const created = await create.execute(createCommand())
    const intruder = actor('member', 'user-9')

    await expect(
      update.execute({ actor: intruder, slug: created.slug, input: { name: 'Torneio do invasor' } })
    ).rejects.toBeInstanceOf(ForbiddenError)

    await expect(cancel.execute({ actor: intruder, slug: created.slug })).rejects.toBeInstanceOf(
      ForbiddenError
    )
  })

  it('Admin/Editor editam e cancelam torneio de outro Member', async () => {
    const { create, update, cancel, repo } = setup()
    const created = await create.execute(createCommand())

    await update.execute({ actor: editor, slug: created.slug, input: { format: 'Booster Draft' } })
    expect((await repo.findBySlug(created.slug))?.data.format).toBe('Booster Draft')

    await cancel.execute({ actor: admin, slug: created.slug })
    expect((await repo.findBySlug(created.slug))?.status).toBe('cancelled')
  })

  it('edição de torneio inexistente lança NotFoundError', async () => {
    const { update } = setup()
    await expect(
      update.execute({ actor: member, slug: 'nao-existe', input: { name: 'Torneio válido' } })
    ).rejects.toBeInstanceOf(NotFoundError)
  })
})

describe('AddResultsUseCase — resultados só por criador/Admin/Editor', () => {
  it('criador adiciona resultados e finaliza o torneio (tournament.results.added)', async () => {
    const { create, addResults, repo, events } = setup()
    const created = await create.execute(createCommand())

    const result = await addResults.execute({
      actor: member,
      slug: created.slug,
      input: { results: [{ position: 1, player: 'Ana', deck: 'Agumon Rush' }] }
    })

    const tournament = await repo.findBySlug(created.slug)
    expect(result.status).toBe('finished')
    expect(tournament?.status).toBe('finished')
    expect(tournament?.data.results).toEqual([
      { position: 1, player: 'Ana', deck: 'Agumon Rush', record: null }
    ])
    expect(events).toEqual(['tournament.created', 'tournament.results.added'])
  })

  it('outro Member não adiciona resultados (ForbiddenError)', async () => {
    const { create, addResults } = setup()
    const created = await create.execute(createCommand())

    await expect(
      addResults.execute({
        actor: actor('member', 'user-9'),
        slug: created.slug,
        input: { results: [{ position: 1, player: 'Ana' }] }
      })
    ).rejects.toBeInstanceOf(ForbiddenError)
  })

  it('Editor adiciona resultados de torneio de outro Member', async () => {
    const { create, addResults, repo } = setup()
    const created = await create.execute(createCommand())

    await addResults.execute({
      actor: editor,
      slug: created.slug,
      input: { results: [{ position: 1, player: 'Bruno' }] }
    })

    expect((await repo.findBySlug(created.slug))?.status).toBe('finished')
  })

  it('resultados inválidos são rejeitados (ValidationError)', async () => {
    const { create, addResults } = setup()
    const created = await create.execute(createCommand())

    await expect(
      addResults.execute({ actor: member, slug: created.slug, input: { results: [] } })
    ).rejects.toBeInstanceOf(ValidationError)
  })
})

describe('ListTournamentsUseCase — agenda', () => {
  async function seed() {
    const ctx = setup()
    await ctx.create.execute(
      createCommand({
        name: 'Torneio SP Standard',
        location: 'São Paulo/SP',
        dateStart: new Date('2026-11-01T13:00:00.000Z')
      })
    )
    await ctx.create.execute(
      createCommand({
        name: 'Torneio RJ Draft',
        format: 'Booster Draft',
        location: 'Rio de Janeiro/RJ',
        dateStart: new Date('2026-12-05T13:00:00.000Z')
      })
    )
    await ctx.create.execute(
      createCommand({
        name: 'Torneio SP Futuro',
        location: 'São Paulo/SP',
        dateStart: new Date('2027-02-01T13:00:00.000Z')
      })
    )
    return ctx
  }

  it('lista próximos por formato/local (público, só published)', async () => {
    const { list } = await seed()
    const byLocation = await list.execute({ input: { location: 'São Paulo' } })
    expect(byLocation.items.map((t) => t.data.name)).toEqual(['Torneio SP Standard', 'Torneio SP Futuro'])

    const byFormat = await list.execute({ input: { format: 'Booster Draft' } })
    expect(byFormat.items.map((t) => t.data.name)).toEqual(['Torneio RJ Draft'])

    const upcoming = await list.execute({ input: { from: new Date('2026-11-20T00:00:00.000Z') } })
    expect(upcoming.items.map((t) => t.data.name)).toEqual(['Torneio RJ Draft', 'Torneio SP Futuro'])
  })

  it('público nunca vê torneios cancelados', async () => {
    const { list, cancel } = await seed()
    await cancel.execute({ actor: member, slug: 'torneio-sp-standard' })

    const result = await list.execute({ input: {} })
    expect(result.items.map((t) => t.status)).toEqual(['published', 'published'])
  })

  it('mine lista os torneios do próprio ator em qualquer status', async () => {
    const { list, cancel, repo } = await seed()
    await cancel.execute({ actor: member, slug: 'torneio-sp-standard' })

    const mine = await list.execute({ input: {}, actor: member, mine: true })
    expect(mine.total).toBe(3)
    expect(mine.items.some((t) => t.status === 'cancelled')).toBe(true)

    const other = await list.execute({ input: {}, actor: actor('member', 'user-9'), mine: true })
    expect(other.total).toBe(0)
    expect(await repo.findBySlug('torneio-sp-standard')).not.toBeNull()
  })
})

describe('GetTournamentUseCase — leitura pública', () => {
  it('público lê torneios published e finished', async () => {
    const { create, addResults, get } = setup()
    const created = await create.execute(createCommand())
    expect((await get.execute({ slug: created.slug })).status).toBe('published')

    await addResults.execute({
      actor: member,
      slug: created.slug,
      input: { results: [{ position: 1, player: 'Ana' }] }
    })
    expect((await get.execute({ slug: created.slug })).status).toBe('finished')
  })

  it('cancelado é oculto ao público mas visível ao criador/Editor', async () => {
    const { create, cancel, get } = setup()
    const created = await create.execute(createCommand())
    await cancel.execute({ actor: member, slug: created.slug })

    await expect(get.execute({ slug: created.slug })).rejects.toBeInstanceOf(NotFoundError)
    await expect(get.execute({ slug: created.slug, actor: member })).resolves.toBeDefined()
    await expect(get.execute({ slug: created.slug, actor: editor })).resolves.toBeDefined()
  })
})
