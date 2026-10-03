// Path: packages/modules/content/src/domain/entities/post.ts
// Aggregate raiz do módulo content. Invariantes de workflow editorial:
// draft → review → published → archived (somente Admin/Editor publicam).
import type { PostCategory, PostStatus } from '@digimon/contracts'
import { ConflictError } from '@digimon/contracts'

export interface PostData {
  id: string
  slug: string
  title: string
  excerpt: string | null
  body: string
  coverImage: string | null
  externalUrl: string | null
  category: PostCategory
  status: PostStatus
  authorId: string
  publishedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

export interface CreatePostData {
  id: string
  slug: string
  title: string
  excerpt: string | null
  body: string
  coverImage: string | null
  externalUrl: string | null
  category: PostCategory
  authorId: string
}

export interface UpdatePostData {
  slug?: string
  title?: string
  excerpt?: string | null
  body?: string
  coverImage?: string | null
  externalUrl?: string | null
  category?: PostCategory
}

export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export function slugify(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export class Post {
  private constructor(public readonly data: PostData) {}

  static create(props: CreatePostData): Post {
    const now = new Date()
    return new Post({
      ...props,
      status: 'draft',
      publishedAt: null,
      createdAt: now,
      updatedAt: now
    })
  }

  static fromData(data: PostData): Post {
    return new Post(data)
  }

  get id(): string {
    return this.data.id
  }

  get slug(): string {
    return this.data.slug
  }

  get status(): PostStatus {
    return this.data.status
  }

  get category(): PostCategory {
    return this.data.category
  }

  get externalUrl(): string | null {
    return this.data.externalUrl
  }

  get authorId(): string {
    return this.data.authorId
  }

  get isPublished(): boolean {
    return this.data.status === 'published'
  }

  /** Edita conteúdo. Não altera status/author. Archived não é editável. */
  update(patch: UpdatePostData): void {
    if (this.data.status === 'archived') {
      throw new ConflictError('Posts arquivados não podem ser editados')
    }
    if (patch.slug !== undefined) this.data.slug = patch.slug
    if (patch.title !== undefined) this.data.title = patch.title
    if (patch.excerpt !== undefined) this.data.excerpt = patch.excerpt
    if (patch.body !== undefined) this.data.body = patch.body
    if (patch.coverImage !== undefined) this.data.coverImage = patch.coverImage
    if (patch.externalUrl !== undefined) this.data.externalUrl = patch.externalUrl
    if (patch.category !== undefined) this.data.category = patch.category
    this.data.updatedAt = new Date()
  }

  /** draft → review. Autor submete para o editorial. */
  submitForReview(): void {
    if (this.data.status !== 'draft') {
      throw new ConflictError(`Post no status ${this.data.status} não pode ser submetido para review`)
    }
    this.data.status = 'review'
    this.data.updatedAt = new Date()
  }

  /** review → published. Somente Admin/Editor (validado no use case). */
  publish(now: Date = new Date()): void {
    if (this.data.status !== 'review') {
      throw new ConflictError(`Post no status ${this.data.status} não pode ser publicado`)
    }
    this.data.status = 'published'
    this.data.publishedAt ??= now
    this.data.updatedAt = now
  }

  /** published → archived. */
  archive(): void {
    if (this.data.status !== 'published') {
      throw new ConflictError(`Post no status ${this.data.status} não pode ser arquivado`)
    }
    this.data.status = 'archived'
    this.data.updatedAt = new Date()
  }
}
