// Barrel público do módulo @digimon/ads — única porta de entrada do pacote.
// Exporta somente o público. Nunca imports internos de outros módulos (ESLint boundaries).

// Domínio
export { CURATION_ROLES, isCuradoria, requireCuradoria } from './domain/actor'
export type { Actor } from './domain/actor'
export { Ad } from './domain/entities/ad'
export type { AdData, AdKind, CreateAdData, UpdateAdData } from './domain/entities/ad'
export { adEvent } from './domain/events/ad-events'
export type { AdEvent, AdEventType } from './domain/events/ad-events'
export type { AdRepository, ListAdsParams } from './domain/repositories/ad-repository'

// Use cases
export { ListAdsUseCase, PUBLIC_ADS_LIMIT } from './use-cases/list-ads'
export type { ListAdsCommand } from './use-cases/list-ads'
export { GetAdUseCase } from './use-cases/get-ad'
export type { GetAdCommand } from './use-cases/get-ad'
export { CreateAdUseCase } from './use-cases/create-ad'
export type { CreateAdCommand } from './use-cases/create-ad'
export { UpdateAdUseCase } from './use-cases/update-ad'
export type { UpdateAdCommand } from './use-cases/update-ad'
export { DeleteAdUseCase } from './use-cases/delete-ad'
export type { DeleteAdCommand } from './use-cases/delete-ad'
export { TrackAdClickUseCase } from './use-cases/track-ad-click'
export type { TrackAdClickCommand } from './use-cases/track-ad-click'

// Schemas de entrada (usados pelas rotas do apps/api)
export { adKindSchema, createAdSchema, listAdsSchema, updateAdSchema } from './use-cases/schemas'
export type { CreateAdInput, ListAdsInput, UpdateAdInput } from './use-cases/schemas'

// Infra
export { PrismaAdRepository } from './infra/repositories/prisma-ad-repository'
