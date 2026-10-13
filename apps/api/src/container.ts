// Path: apps/api/src/container.ts
// Composition root da API: monta os use cases com as implementações Prisma (DIP).
// Os use cases recebem interfaces; o app escolhe as implementações.
// Porte de apps/web/src/lib/server/container.ts (strangler, ADR-007) —
// nenhuma regra de domínio é duplicada aqui.
import { InMemoryEventBus, ValidationError } from '@digimon/contracts'
import { prisma } from '@digimon/database'
import type { PrismaClient } from '@digimon/database'
import {
  JwtTokenService,
  PrismaPasswordResetTokenRepository,
  PrismaRefreshTokenRepository,
  ScryptPasswordHasher
} from '@digimon/auth'
import { PrismaUserRepository } from '@digimon/users'
import type {
  UserActivityProvider,
  UserCommentRecord,
  UserCommunityDeckRecord,
  UserDeckRecord,
  UserTournamentRecord
} from '@digimon/users'
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
  ImportCardsFromSourceUseCase,
  ImportCardsUseCase,
  ListCardsUseCase,
  ListSetsUseCase,
  PrismaCardRepository,
  PrismaCardSetRepository,
  TakaCardsSourceProvider
} from '@digimon/cards'
import type { Card, ImportCardsFromSourceResult } from '@digimon/cards'
import {
  CheckDeckLegalityUseCase,
  CopyDeckUseCase,
  CreateDeckUseCase,
  DeleteDeckUseCase,
  DismissDeckReportsUseCase,
  GetCommunityDeckUseCase,
  GetDeckUseCase,
  LikeCommunityDeckUseCase,
  ListCommunityDecksUseCase,
  ListDecksUseCase,
  ListPublicationsUseCase,
  ListReportedDecksUseCase,
  ModerateCommunityDeckUseCase,
  OpenDeckReportsUseCase,
  PrismaDeckRepository,
  PrismaPublicDeckRepository,
  PublishDeckToCommunityUseCase,
  PublishDeckUseCase,
  RecordDeckCopyUseCase,
  ReportCommunityDeckUseCase,
  UnlikeCommunityDeckUseCase,
  UnpublishDeckFromCommunityUseCase,
  UpdateDeckUseCase
} from '@digimon/decks'
import type {
  CardColorInfo,
  CardReferenceInfo,
  CardReferenceValidator,
  DeckCardEntry,
  DeckCardResolver,
  DeckColorResolver,
  ResolvedDeckCard
} from '@digimon/decks'
import {
  AddResultsUseCase,
  CancelTournamentUseCase,
  CreateTournamentUseCase,
  GetTournamentUseCase,
  ListTournamentsUseCase,
  PrismaTournamentRepository,
  UpdateTournamentUseCase
} from '@digimon/tournaments'
import {
  CreateAdUseCase,
  DeleteAdUseCase,
  GetAdUseCase,
  ListAdsUseCase,
  PrismaAdRepository,
  TrackAdClickUseCase,
  UpdateAdUseCase
} from '@digimon/ads'
import {
  CreateDataRequestUseCase,
  ListConsentRecordsUseCase,
  ListDataRequestsUseCase,
  PrismaConsentRecordRepository,
  PrismaDataRequestRepository,
  RecordConsentUseCase,
  UpdateDataRequestStatusUseCase
} from '@digimon/privacy'
import { UserAccountAdapter } from './http/user-account-adapter'
import { ImportJobRegistry } from './jobs'

const eventBus = new InMemoryEventBus()

/**
 * Registry de jobs de importação externa (process-local — ADR-005, sem Redis).
 * Singleton por processo: o POST dispara o job e o GET consulta o mesmo estado.
 * Limitação conhecida: o progresso some em restart da API.
 */
const importSourceJobs = new ImportJobRegistry<ImportCardsFromSourceResult>()

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
  const refreshTokens = new PrismaRefreshTokenRepository(prisma)
  const activity = new PrismaUserActivityProvider(prisma)
  return { users, eventBus, refreshTokens, activity }
}

/**
 * UserActivityProvider (DIP) sobre Prisma — reúne a atividade do titular para o
 * export LGPD (portabilidade). Lê comentários, decks, torneios e publicações na
 * comunidade pelo id do titular; nunca expõe dados de terceiros.
 */
class PrismaUserActivityProvider implements UserActivityProvider {
  constructor(private readonly prisma: PrismaClient) {}

  async listComments(authorId: string): Promise<UserCommentRecord[]> {
    const rows = await this.prisma.comment.findMany({
      where: { authorId },
      orderBy: { createdAt: 'desc' }
    })
    return rows.map((row) => ({
      id: row.id,
      targetType: row.targetType,
      targetId: row.targetId,
      body: row.body,
      status: row.status,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt
    }))
  }

  async listDecks(ownerId: string): Promise<UserDeckRecord[]> {
    const rows = await this.prisma.deck.findMany({
      where: { ownerId },
      orderBy: { createdAt: 'desc' }
    })
    return rows.map((row) => ({
      id: row.id,
      slug: row.slug,
      name: row.name,
      description: row.description,
      format: row.format,
      status: row.status,
      isPublic: row.isPublic,
      cardList: row.cardList,
      eggList: row.eggList,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt
    }))
  }

  async listTournaments(organizerId: string): Promise<UserTournamentRecord[]> {
    const rows = await this.prisma.tournament.findMany({
      where: { organizerId },
      orderBy: { dateStart: 'desc' }
    })
    return rows.map((row) => ({
      id: row.id,
      slug: row.slug,
      name: row.name,
      format: row.format,
      location: row.location,
      dateStart: row.dateStart,
      dateEnd: row.dateEnd,
      status: row.status,
      createdAt: row.createdAt
    }))
  }

  async listCommunityDecks(accountId: string): Promise<UserCommunityDeckRecord[]> {
    const rows = await this.prisma.publicDeck.findMany({
      where: { accountId },
      orderBy: { publishedAt: 'desc' }
    })
    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      status: row.status,
      likeCount: row.likeCount,
      copyCount: row.copyCount,
      publishedAt: row.publishedAt
    }))
  }
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
  const importCards = new ImportCardsUseCase(cardRepository, cardSetRepository, eventBus)
  const cardsSource = new TakaCardsSourceProvider()
  return {
    list: new ListCardsUseCase(cardRepository),
    get: new GetCardUseCase(cardRepository),
    listSets: new ListSetsUseCase(cardSetRepository),
    import: importCards,
    importFromSource: new ImportCardsFromSourceUseCase(importCards, cardsSource),
    importSourceJobs
  }
}

/** Referência do cardList validada contra o catálogo @digimon/cards (tabela cards). */
class PrismaCardReferenceValidator implements CardReferenceValidator {
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

  async inspect(entries: DeckCardEntry[]): Promise<CardReferenceInfo[]> {
    const ids = [...new Set(entries.map((entry) => entry.cardId))]
    const found = await prisma.card.findMany({
      where: { id: { in: ids } },
      select: { id: true, type: true, maxCountInDeck: true }
    })
    const byId = new Map(found.map((card) => [card.id, card]))

    return entries.map((entry) => {
      const card = byId.get(entry.cardId)
      return {
        cardId: entry.cardId,
        quantity: entry.quantity,
        exists: card !== undefined,
        maxCountInDeck: card?.maxCountInDeck ?? 4,
        isDigiEgg: card?.type === 'DIGIEGG'
      }
    })
  }
}

export function decksDeps() {
  const deckRepository = new PrismaDeckRepository(prisma)
  const cardValidator = new PrismaCardReferenceValidator()
  const checkLegality = new CheckDeckLegalityUseCase(cardValidator)
  return {
    create: new CreateDeckUseCase(deckRepository, cardValidator, eventBus),
    update: new UpdateDeckUseCase(deckRepository, cardValidator, eventBus),
    publish: new PublishDeckUseCase(deckRepository, checkLegality, eventBus),
    remove: new DeleteDeckUseCase(deckRepository),
    get: new GetDeckUseCase(deckRepository),
    list: new ListDecksUseCase(deckRepository),
    copy: new CopyDeckUseCase(deckRepository, eventBus),
    checkLegality
  }
}

/** Carta do catálogo → dados usados no parse/serialização de decklist. */
function toResolvedDeckCard(card: Card | null): ResolvedDeckCard | undefined {
  if (!card) return undefined
  const d = card.data
  return {
    cardId: d.id,
    number: d.number,
    name: d.name,
    isDigiEgg: d.type === 'digiegg',
    maxCountInDeck: d.maxCountInDeck
  }
}

/** DeckCardResolver (DIP) sobre @digimon/cards — código ↔ cardId do catálogo. */
class PrismaDeckCardResolver implements DeckCardResolver {
  constructor(private readonly cards: PrismaCardRepository) {}

  async resolveByNumber(number: string): Promise<ResolvedDeckCard | undefined> {
    return toResolvedDeckCard(await this.cards.findByNumber(number))
  }

  async resolveById(cardId: string): Promise<ResolvedDeckCard | undefined> {
    return toResolvedDeckCard(await this.cards.findById(cardId))
  }
}

/** DeckColorResolver (DIP) sobre @digimon/cards — cores das cartas do snapshot. */
class PrismaDeckColorResolver implements DeckColorResolver {
  constructor(private readonly cards: PrismaCardRepository) {}

  async resolveColors(entries: DeckCardEntry[]): Promise<CardColorInfo[]> {
    const infos: CardColorInfo[] = []
    for (const entry of entries) {
      const card = await this.cards.findById(entry.cardId)
      infos.push({ cardId: entry.cardId, colors: card ? [...card.data.colors] : [] })
    }
    return infos
  }
}

export function communityDecksDeps() {
  const deckRepository = new PrismaDeckRepository(prisma)
  const publicDecks = new PrismaPublicDeckRepository(prisma)
  const cardValidator = new PrismaCardReferenceValidator()
  const cardRepository = new PrismaCardRepository(prisma)
  const colors = new PrismaDeckColorResolver(cardRepository)
  const cardResolver = new PrismaDeckCardResolver(cardRepository)
  const checkLegality = new CheckDeckLegalityUseCase(cardValidator)

  return {
    publish: new PublishDeckToCommunityUseCase(
      deckRepository,
      publicDecks,
      checkLegality,
      colors,
      eventBus
    ),
    unpublish: new UnpublishDeckFromCommunityUseCase(deckRepository, publicDecks, eventBus),
    listPublications: new ListPublicationsUseCase(publicDecks),
    list: new ListCommunityDecksUseCase(publicDecks, checkLegality),
    get: new GetCommunityDeckUseCase(publicDecks, checkLegality),
    like: new LikeCommunityDeckUseCase(publicDecks, eventBus),
    unlike: new UnlikeCommunityDeckUseCase(publicDecks),
    copy: new RecordDeckCopyUseCase(publicDecks),
    report: new ReportCommunityDeckUseCase(publicDecks, eventBus),
    moderate: new ModerateCommunityDeckUseCase(publicDecks, eventBus),
    listReported: new ListReportedDecksUseCase(publicDecks),
    openReports: new OpenDeckReportsUseCase(publicDecks),
    dismissReports: new DismissDeckReportsUseCase(publicDecks),
    cardResolver,
    checkLegality
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

export function adsDeps() {
  const repository = new PrismaAdRepository(prisma)
  return {
    // Repositório exposto para o incremento de impressões best-effort da rota pública.
    repository,
    list: new ListAdsUseCase(repository),
    get: new GetAdUseCase(repository),
    create: new CreateAdUseCase(repository, eventBus),
    update: new UpdateAdUseCase(repository, eventBus),
    remove: new DeleteAdUseCase(repository, eventBus),
    trackClick: new TrackAdClickUseCase(repository)
  }
}

/**
 * LGPD (@digimon/privacy): consentimento (auditoria) + solicitações do titular.
 * Repositórios Prisma expostos para composição nas rotas.
 */
export function privacyDeps() {
  const consentRecords = new PrismaConsentRecordRepository(prisma)
  const dataRequests = new PrismaDataRequestRepository(prisma)
  return {
    consentRecords,
    dataRequests,
    recordConsent: new RecordConsentUseCase(consentRecords, eventBus),
    listConsentRecords: new ListConsentRecordsUseCase(consentRecords),
    createDataRequest: new CreateDataRequestUseCase(dataRequests, eventBus),
    listDataRequests: new ListDataRequestsUseCase(dataRequests),
    updateDataRequestStatus: new UpdateDataRequestStatusUseCase(dataRequests, eventBus)
  }
}

export { eventBus }
