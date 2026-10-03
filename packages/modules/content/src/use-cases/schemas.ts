// Path: packages/modules/content/src/use-cases/schemas.ts
// Schemas Zod de entrada dos use cases — mesma fonte de verdade para os route handlers.
import { z } from 'zod'
import { SLUG_PATTERN } from '../domain/entities/post'

export const postCategorySchema = z.enum(['news', 'article', 'curiosity', 'simulator'])

export const createPostSchema = z.object({
  title: z.string().trim().min(3, 'Título deve ter ao menos 3 caracteres').max(200),
  slug: z.string().regex(SLUG_PATTERN, 'Slug inválido (use letras minúsculas, números e hífens)').max(200).optional(),
  excerpt: z.string().trim().max(400).nullable().optional(),
  body: z.string().min(1, 'Conteúdo é obrigatório'),
  coverImage: z.string().url('URL de capa inválida').nullable().optional(),
  externalUrl: z.string().url('URL externa inválida').nullable().optional(),
  category: postCategorySchema
})

export const updatePostSchema = z
  .object({
    title: z.string().trim().min(3, 'Título deve ter ao menos 3 caracteres').max(200).optional(),
    slug: z.string().regex(SLUG_PATTERN, 'Slug inválido (use letras minúsculas, números e hífens)').max(200).optional(),
    excerpt: z.string().trim().max(400).nullable().optional(),
    body: z.string().min(1, 'Conteúdo é obrigatório').optional(),
    coverImage: z.string().url('URL de capa inválida').nullable().optional(),
    externalUrl: z.string().url('URL externa inválida').nullable().optional(),
    category: postCategorySchema.optional()
  })
  .strict()

export const listPostsSchema = z.object({
  category: postCategorySchema.optional(),
  status: z.enum(['draft', 'review', 'published', 'archived']).optional(),
  page: z.coerce.number().int().positive().optional(),
  pageSize: z.coerce.number().int().positive().max(100).optional()
})

export type CreatePostInput = z.infer<typeof createPostSchema>
export type UpdatePostInput = z.infer<typeof updatePostSchema>
export type ListPostsInput = z.infer<typeof listPostsSchema>
