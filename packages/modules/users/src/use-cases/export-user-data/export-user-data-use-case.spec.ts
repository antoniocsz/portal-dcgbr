// Path: packages/modules/users/src/use-cases/export-user-data/export-user-data-use-case.spec.ts
import { describe, expect, it } from 'vitest'
import { NotFoundError } from '@digimon/contracts'
import { ExportUserDataUseCase } from './export-user-data-use-case'
import { InMemoryUserActivityProvider, InMemoryUserRepository } from '../../testing/fakes'
import { User } from '../../domain/entities/user'

describe('ExportUserDataUseCase', () => {
  it('reúne perfil + atividade do titular', async () => {
    const repo = new InMemoryUserRepository()
    const user = User.create({
      id: 'member-1',
      email: 'member@example.com',
      name: 'Membro',
      passwordHash: 'hash',
      role: 'member'
    })
    repo.seed(user)

    const activity = new InMemoryUserActivityProvider()
    activity.comments.set('member-1', [
      {
        id: 'c1',
        targetType: 'POST',
        targetId: 'post-1',
        body: 'Bom texto',
        status: 'VISIBLE',
        createdAt: new Date('2026-01-02'),
        updatedAt: new Date('2026-01-02')
      }
    ])
    activity.decks.set('member-1', [
      {
        id: 'd1',
        slug: 'meu-deck',
        name: 'Meu Deck',
        description: null,
        format: 'standard',
        status: 'PUBLISHED',
        isPublic: true,
        cardList: [{ cardId: 'card-1', quantity: 4 }],
        eggList: [],
        createdAt: new Date('2026-01-01'),
        updatedAt: new Date('2026-01-01')
      }
    ])
    activity.communityDecks.set('member-1', [
      { id: 'p1', name: 'Meu Deck', status: 'PUBLIC', likeCount: 3, copyCount: 1, publishedAt: new Date('2026-01-03') }
    ])

    const useCase = new ExportUserDataUseCase({ users: repo, activity })
    const result = await useCase.execute('member-1')

    expect(result.user.id).toBe('member-1')
    expect(result.user.email).toBe('member@example.com')
    expect(result.comments).toHaveLength(1)
    expect(result.decks).toHaveLength(1)
    expect(result.tournaments).toHaveLength(0)
    expect(result.communityDecks).toHaveLength(1)
    expect(result.exportedAt).toBeInstanceOf(Date)
  })

  it('NotFoundError para titular inexistente', async () => {
    const useCase = new ExportUserDataUseCase({
      users: new InMemoryUserRepository(),
      activity: new InMemoryUserActivityProvider()
    })

    await expect(useCase.execute('ghost')).rejects.toBeInstanceOf(NotFoundError)
  })
})
