// Path: packages/modules/ads/src/use-cases/ads.spec.ts
// Critérios dos use cases: curadoria exige administrator; filtro por placement
// no público; janela de datas; rotação por peso (priority desc + limite);
// click incrementa; impressões via repo (best-effort).
import { describe, expect, it } from 'vitest'
import type { Role } from '@digimon/contracts'
import { ForbiddenError, InMemoryEventBus, NotFoundError, ValidationError } from '@digimon/contracts'
import type { Actor } from '../domain/actor'
import { InMemoryAdRepository } from '../test/memory-ad-repository'
import { CreateAdUseCase, type CreateAdCommand } from './create-ad'
import { DeleteAdUseCase } from './delete-ad'
import { GetAdUseCase } from './get-ad'
import { ListAdsUseCase, PUBLIC_ADS_LIMIT } from './list-ads'
import { TrackAdClickUseCase } from './track-ad-click'
import { UpdateAdUseCase } from './update-ad'

function actor(role: Role, id = 'user-1'): Actor {
  return { id, role }
}

const member = actor('member')
const editor = actor('editor', 'user-2')
const admin = actor('administrator', 'user-3')

function setup() {
  const repo = new InMemoryAdRepository()
  const eventBus = new InMemoryEventBus()
  const events: string[] = []
  for (const type of ['ad.created', 'ad.updated', 'ad.deleted']) {
    eventBus.subscribe(type, (event) => {
      events.push(event.type)
    })
  }
  return {
    repo,
    events,
    create: new CreateAdUseCase(repo, eventBus),
    update: new UpdateAdUseCase(repo, eventBus),
    remove: new DeleteAdUseCase(repo, eventBus),
    get: new GetAdUseCase(repo),
    list: new ListAdsUseCase(repo),
    trackClick: new TrackAdClickUseCase(repo)
  }
}

function createCommand(overrides: Partial<CreateAdCommand['input']> = {}): CreateAdCommand {
  return {
    actor: admin,
    input: {
      title: 'Promoção Digimon TCG Brasil',
      targetUrl: 'https://loja.exemplo.com/promo',
      kind: 'house',
      placements: ['home-top'],
      ...overrides
    }
  }
}

describe('CreateAdUseCase — curadoria', () => {
  it('administrator cria e publica ad.created', async () => {
    const { create, repo, events } = setup()
    const result = await create.execute(createCommand())

    const ad = await repo.findById(result.id)
    expect(ad?.data.title).toBe('Promoção Digimon TCG Brasil')
    expect(ad?.data.createdBy).toBe(admin.id)
    expect(events).toEqual(['ad.created'])
  })

  it('member e editor são bloqueados (ForbiddenError)', async () => {
    const { create } = setup()
    await expect(
      create.execute({ actor: member, input: createCommand().input })
    ).rejects.toBeInstanceOf(ForbiddenError)
    await expect(
      create.execute({ actor: editor, input: createCommand().input })
    ).rejects.toBeInstanceOf(ForbiddenError)
  })

  it('rejeita dados inválidos com ValidationError', async () => {
    const { create } = setup()
    const error = await create
      .execute(createCommand({ targetUrl: 'nao-e-url' }))
      .catch((e: unknown) => e)
    expect(error).toBeInstanceOf(ValidationError)
    expect((error as ValidationError).details).toMatchObject({
      fieldErrors: { targetUrl: expect.any(Array) }
    })
  })
})

describe('GetAd / UpdateAd / DeleteAd — curadoria', () => {
  it('get por id exige administrator e lança NotFound quando ausente', async () => {
    const { create, get } = setup()
    const created = await create.execute(createCommand())

    await expect(get.execute({ actor: member, id: created.id })).rejects.toBeInstanceOf(
      ForbiddenError
    )
    const ad = await get.execute({ actor: admin, id: created.id })
    expect(ad.id).toBe(created.id)

    await expect(get.execute({ actor: admin, id: 'nao-existe' })).rejects.toBeInstanceOf(
      NotFoundError
    )
  })

  it('update exige administrator, altera campos e publica ad.updated', async () => {
    const { create, update, repo, events } = setup()
    const created = await create.execute(createCommand())

    await expect(
      update.execute({ actor: member, id: created.id, input: { title: 'Outro título' } })
    ).rejects.toBeInstanceOf(ForbiddenError)

    await update.execute({
      actor: admin,
      id: created.id,
      input: { title: 'Banner de torneio', priority: 5, placements: ['cards-top'] }
    })

    const ad = await repo.findById(created.id)
    expect(ad?.data.title).toBe('Banner de torneio')
    expect(ad?.data.priority).toBe(5)
    expect(ad?.data.placements).toEqual(['cards-top'])
    expect(events).toEqual(['ad.created', 'ad.updated'])
  })

  it('update de id inexistente lança NotFound', async () => {
    const { update } = setup()
    await expect(
      update.execute({ actor: admin, id: 'nao-existe', input: { title: 'Título válido' } })
    ).rejects.toBeInstanceOf(NotFoundError)
  })

  it('delete exige administrator, remove e publica ad.deleted', async () => {
    const { create, remove, repo, events } = setup()
    const created = await create.execute(createCommand())

    await expect(remove.execute({ actor: member, id: created.id })).rejects.toBeInstanceOf(
      ForbiddenError
    )
    const result = await remove.execute({ actor: admin, id: created.id })
    expect(result.deleted).toBe(true)
    expect(await repo.findById(created.id)).toBeNull()
    expect(events).toEqual(['ad.created', 'ad.deleted'])
  })
})

describe('ListAdsUseCase — público', () => {
  const now = new Date('2026-06-01T12:00:00.000Z')

  it('exige placement no modo público', async () => {
    const { list } = setup()
    await expect(list.execute({ input: {}, now })).rejects.toBeInstanceOf(ValidationError)
  })

  it('filtra por placement e respeita a janela de datas', async () => {
    const { create, list } = setup()
    await create.execute(
      createCommand({ title: 'Top', placements: ['home-top'] })
    )
    await create.execute(
      createCommand({ title: 'Infeed', placements: ['home-infeed'] })
    )
    await create.execute(
      createCommand({
        title: 'Expirado',
        placements: ['home-top'],
        startAt: new Date('2026-01-01'),
        endAt: new Date('2026-02-01')
      })
    )
    await create.execute(
      createCommand({ title: 'Inativo', placements: ['home-top'], isActive: false })
    )

    const result = await list.execute({ input: { placement: 'home-top' }, now })
    expect(result.items.map((ad) => ad.data.title)).toEqual(['Top'])
  })

  it('ordena por peso (priority desc) e limita a rotação a N candidatos', async () => {
    const { create, list } = setup()
    await create.execute(createCommand({ title: 'P1', priority: 1 }))
    await create.execute(createCommand({ title: 'P9', priority: 9 }))
    await create.execute(createCommand({ title: 'P5', priority: 5 }))

    const result = await list.execute({ input: { placement: 'home-top', limit: 2 }, now })
    expect(result.items.map((ad) => ad.data.title)).toEqual(['P9', 'P5'])
    expect(result.total).toBe(3)
    expect(result.pageSize).toBe(2)
  })

  it('usa o limite padrão de rotação quando limit não é informado', async () => {
    const { create, list } = setup()
    for (let i = 0; i < PUBLIC_ADS_LIMIT + 2; i += 1) {
      await create.execute(createCommand({ title: `Ad ${i}`, priority: i }))
    }
    const result = await list.execute({ input: { placement: 'home-top' }, now })
    expect(result.items).toHaveLength(PUBLIC_ADS_LIMIT)
    expect(result.total).toBe(PUBLIC_ADS_LIMIT + 2)
  })
})

describe('ListAdsUseCase — curadoria', () => {
  it('administrator lista com filtros kind/isActive e placement', async () => {
    const { create, list } = setup()
    await create.execute(createCommand({ title: 'House', kind: 'house' }))
    await create.execute(
      createCommand({ title: 'Afiliado', kind: 'affiliate', placements: ['article-inline'] })
    )
    await create.execute(createCommand({ title: 'Inativo', kind: 'house', isActive: false }))

    const houses = await list.execute({ actor: admin, input: { kind: 'house', isActive: true } })
    expect(houses.items.map((ad) => ad.data.title)).toEqual(['House'])

    const byPlacement = await list.execute({
      actor: admin,
      input: { placement: 'article-inline' }
    })
    expect(byPlacement.items.map((ad) => ad.data.title)).toEqual(['Afiliado'])
  })
})

describe('TrackAdClickUseCase', () => {
  it('incrementa clicks e ignora id inexistente (best-effort)', async () => {
    const { create, repo, trackClick } = setup()
    const created = await create.execute(createCommand())

    expect(await trackClick.execute({ id: created.id })).toEqual({ tracked: true })
    expect((await repo.findById(created.id))?.data.clicks).toBe(1)

    expect(await trackClick.execute({ id: 'nao-existe' })).toEqual({ tracked: false })
  })
})
