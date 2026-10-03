// Path: packages/modules/content/src/infra/repositories/prisma-post-repository.ts
// Implementação Prisma de PostRepository. Mapeia os enums do Prisma (DRAFT/…)
// para as unions do domínio (draft/…) — @digimon/contracts.
import { PrismaClient, Prisma, PostStatus as PrismaPostStatus, PostCategory as PrismaPostCategory } from '@digimon/database'
import type { PaginatedResult, PostCategory, PostStatus } from '@digimon/contracts'
import { Post, type PostData } from '../../domain/entities/post'
import type { ListPostsParams, PostRepository } from '../../domain/repositories/post-repository'

const STATUS_TO_PRISMA: Record<PostStatus, PrismaPostStatus> = {
  draft: 'DRAFT',
  review: 'REVIEW',
  published: 'PUBLISHED',
  archived: 'ARCHIVED'
}

const CATEGORY_TO_PRISMA: Record<PostCategory, PrismaPostCategory> = {
  news: 'NEWS',
  article: 'ARTICLE',
  curiosity: 'CURIOSITY',
  simulator: 'SIMULATOR'
}

const STATUS_FROM_PRISMA: Record<PrismaPostStatus, PostStatus> = {
  DRAFT: 'draft',
  REVIEW: 'review',
  PUBLISHED: 'published',
  ARCHIVED: 'archived'
}

const CATEGORY_FROM_PRISMA: Record<PrismaPostCategory, PostCategory> = {
  NEWS: 'news',
  ARTICLE: 'article',
  CURIOSITY: 'curiosity',
  SIMULATOR: 'simulator'
}

function mapToDomain(row: Prisma.PostGetPayload<Record<string, never>>): Post {
  const data: PostData = {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    body: row.body,
    coverImage: row.coverImage,
    externalUrl: row.externalUrl,
    category: CATEGORY_FROM_PRISMA[row.category],
    status: STATUS_FROM_PRISMA[row.status],
    authorId: row.authorId,
    publishedAt: row.publishedAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt
  }
  return Post.fromData(data)
}

export class PrismaPostRepository implements PostRepository {
  constructor(private readonly db: PrismaClient) {}

  async create(data: PostData): Promise<void> {
    await this.db.post.create({
      data: {
        id: data.id,
        slug: data.slug,
        title: data.title,
        excerpt: data.excerpt,
        body: data.body,
        coverImage: data.coverImage,
        externalUrl: data.externalUrl,
        category: CATEGORY_TO_PRISMA[data.category],
        status: STATUS_TO_PRISMA[data.status],
        authorId: data.authorId,
        publishedAt: data.publishedAt,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt
      }
    })
  }

  async update(post: Post): Promise<void> {
    const d = post.data
    await this.db.post.update({
      where: { id: d.id },
      data: {
        slug: d.slug,
        title: d.title,
        excerpt: d.excerpt,
        body: d.body,
        coverImage: d.coverImage,
        externalUrl: d.externalUrl,
        category: CATEGORY_TO_PRISMA[d.category],
        status: STATUS_TO_PRISMA[d.status],
        publishedAt: d.publishedAt,
        updatedAt: d.updatedAt
      }
    })
  }

  async findById(id: string): Promise<Post | null> {
    const row = await this.db.post.findUnique({ where: { id } })
    return row ? mapToDomain(row) : null
  }

  async findBySlug(slug: string): Promise<Post | null> {
    const row = await this.db.post.findUnique({ where: { slug } })
    return row ? mapToDomain(row) : null
  }

  async list(params: ListPostsParams): Promise<PaginatedResult<Post>> {
    const page = params.page ?? 1
    const pageSize = params.pageSize ?? 20
    const where: Prisma.PostWhereInput = {}
    if (params.category) where.category = CATEGORY_TO_PRISMA[params.category]
    if (params.status) where.status = STATUS_TO_PRISMA[params.status]

    const [rows, total] = await this.db.$transaction([
      this.db.post.findMany({
        where,
        orderBy: { publishedAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize
      }),
      this.db.post.count({ where })
    ])

    return { items: rows.map(mapToDomain), total, page, pageSize }
  }
}
