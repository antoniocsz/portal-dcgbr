// Tipos compartilhados entre apps e módulos: identificadores e enums globais.
// Enums como union de string literals (serializáveis, sem runtime).

declare const entityIdBrand: unique symbol

export type EntityId = string & { readonly [entityIdBrand]: true }

export type Role = 'administrator' | 'editor' | 'member'

export type PostStatus = 'draft' | 'review' | 'published' | 'archived'

export type PostCategory = 'news' | 'article' | 'curiosity' | 'simulator'

export type CommentStatus = 'visible' | 'hidden' | 'deleted'

export type CommentTargetType = 'post' | 'card' | 'deck'

export interface PaginatedResult<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
}

export interface ListParams {
  page?: number
  pageSize?: number
  search?: string
}
