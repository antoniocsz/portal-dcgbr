// Path: apps/api/src/container.ts
// Composition root da API: monta os use cases com as implementações Prisma (DIP).
// Os use cases recebem interfaces; o app escolhe as implementações.
// Porte de apps/web/src/lib/server/container.ts (strangler, ADR-007) —
// nenhuma regra de domínio é duplicada aqui.
import { InMemoryEventBus, ValidationError } from '@digimon/contracts'
import { prisma } from '@digimon/database'
import {
  JwtTokenService,
  PrismaPasswordResetTokenRepository,
  PrismaRefreshTokenRepository,
  ScryptPasswordHasher
} from '@digimon/auth'
import { PrismaUserRepository } from '@digimon/users'
import {
  ArchivePostUseCase,
  CreatePostUseCase,
  GetPostUseCase,
  GetSimulatorsPageUseCase,
  ListPostsUseCase,
  PrismaPostRepository,
  PublishPostUseCase,
  SubmitForReviewUseCase,
  UpdatePostUseCase
} from '@digimon/content'
import {
  CreateCommentUseCase,
  DeleteCommentUseCase,
  ListAllCommentsUseCase,
  ListCommentsUseCase,
  ModerateCommentUseCase,
  PrismaCommentRepository,
  UpdateCommentUseCase
} from '@digimon/comments'
import {
  GetCardUseCase,
  ImportCardsUseCase,
  ListCardsUseCase,
  ListSetsUseCase,
  PrismaCardRepository,
  PrismaCardSetRepository
} from '@digimon/cards'
import {
  CopyDeckUseCase,
  CreateDeckUseCase,
  DeleteDeckUseCase,
  GetDeckUseCase,
  ListDecksUseCase,
  PrismaDeckRepository,
  PublishDeckUseCase,
  UpdateDeckUseCase
} from '@digimon/decks'
import type { DeckCardEntry } from '@digimon/decks'
import {
  AddResultsUseCase,
  CancelTournamentUseCase,
  CreateTournamentUseCase,
  GetTournamentUseCase,
  ListTournamentsUseCase,
  PrismaTournamentRepository,
  UpdateTournamentUseCase
} from '@digimon/tournaments'
import { UserAccountAdapter } from './http/user-account-adapter'

const eventBus = new InMemoryEventBus()

export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET
  if (!secret || secret.length < 32) {
    throw new Error('JWT_SECRET ausente ou curto demais (mínimo 32 caracteres)')
  }
  return secret
}

export function authDeps() {
  const users = new UserAccountAdapter(new PrismaUserRepository(prisma))
  const refreshTokens = new PrismaRefreshTokenRepository(prisma)
  const passwordResetTokens = new PrismaPasswordResetTokenRepository(prisma)
  const passwordHasher = new ScryptPasswordHasher()
  const tokens = new JwtTokenService(getJwtSecret())

  return { users, refreshTokens, passwordResetTokens, passwordHasher, tokens, eventBus }
}

export function usersDeps() {
  const users = new PrismaUserRepository(prisma)
  return { users, eventBus }
}

export function contentDeps() {
  const postRepo = new PrismaPostRepository(prisma)
  return {
    postRepo,
    posts: {
      create: new CreatePostUseCase(postRepo, eventBus),
      update: new UpdatePostUseCase(postRepo, eventBus),
      submitForReview: new SubmitForReviewUseCase(postRepo, eventBus),
      publish: new PublishPostUseCase(postRepo, eventBus),
      archive: new ArchivePostUseCase(postRepo, eventBus),
      get: new GetPostUseCase(postRepo),
      list: new ListPostsUseCase(postRepo),
      simulators: new GetSimulatorsPageUseCase(postRepo)
    }
  }
}

export function commentsDeps() {
  const repository = new PrismaCommentRepository(prisma)
  return {
    create: new CreateCommentUseCase(repository, eventBus),
    list: new ListCommentsUseCase(repository),
    listAll: new ListAllCommentsUseCase(repository),
    update: new UpdateCommentUseCase(repository),
    delete: new DeleteCommentUseCase(repository, eventBus),
    moderate: new ModerateCommentUseCase(repository, eventBus)
  }
}

export function cardsDeps() {
  const cardRepository = new PrismaCardRepository(prisma)
  const cardSetRepository = new PrismaCardSetRepository(prisma)
  return {
    list: new ListCardsUseCase(cardRepository),
    get: new GetCardUseCase(cardRepository),
    listSets: new ListSetsUseCase(cardSetRepository),
    import: new ImportCardsUseCase(cardRepository, cardSetRepository, eventBus)
  }
}

/** Referência do cardList validada contra o catálogo @digimon/cards (tabela cards). */
class PrismaCardReferenceValidator {
  async assertCardsExist(cardList: DeckCardEntry[]): Promise<void> {
    const ids = [...new Set(cardList.map((entry) => entry.cardId))]
    if (ids.length === 0) return

    const found = await prisma.card.findMany({
      where: { id: { in: ids } },
      select: { id: true }
    })
    const foundIds = new Set(found.map((card) => card.id))
    const missing = ids.filter((id) => !foundIds.has(id))
    if (missing.length > 0) {
      throw new ValidationError(`Cartas não encontradas no catálogo: ${missing.join(', ')}`)
    }
  }
}

export function decksDeps() {
  const deckRepository = new PrismaDeckRepository(prisma)
  const cardValidator = new PrismaCardReferenceValidator()
  return {
    create: new CreateDeckUseCase(deckRepository, cardValidator, eventBus),
    update: new UpdateDeckUseCase(deckRepository, cardValidator, eventBus),
    publish: new PublishDeckUseCase(deckRepository, eventBus),
    remove: new DeleteDeckUseCase(deckRepository),
    get: new GetDeckUseCase(deckRepository),
    list: new ListDecksUseCase(deckRepository),
    copy: new CopyDeckUseCase(deckRepository, eventBus)
  }
}

export function tournamentsDeps() {
  const tournamentRepository = new PrismaTournamentRepository(prisma)
  return {
    create: new CreateTournamentUseCase(tournamentRepository, eventBus),
    update: new UpdateTournamentUseCase(tournamentRepository, eventBus),
    cancel: new CancelTournamentUseCase(tournamentRepository, eventBus),
    addResults: new AddResultsUseCase(tournamentRepository, eventBus),
    get: new GetTournamentUseCase(tournamentRepository),
    list: new ListTournamentsUseCase(tournamentRepository)
  }
}

export { eventBus }
