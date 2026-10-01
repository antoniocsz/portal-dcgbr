// Path: apps/web/src/app/api/posts/admin/route.ts
// POST /api/posts/admin — cria rascunho (qualquer usuário autenticado).
// GET /api/posts/admin — listagem editorial (Admin/Editor; filtra por status).
import { NextRequest, NextResponse } from 'next/server'
import { listPostsSchema, type CreatePostInput } from '@digimon/content'
import { toErrorResponse, queryString } from '../_lib/handlers'
import { serializeListWithAuthors } from '../_lib/serialize'
import { posts } from '../_lib/use-cases'
import { resolveAuthorNames } from '../_lib/authors'
import { requireEditorialUser, requireUser } from '../_lib/session'

export const runtime = 'nodejs'

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const actor = requireUser(request)
    const body = (await request.json()) as CreatePostInput
    const result = await posts.create.execute({ actor, input: body })
    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    return toErrorResponse(error)
  }
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const actor = requireEditorialUser(request)
    const { searchParams } = new URL(request.url)
    const input = listPostsSchema.parse({
      category: queryString(searchParams.get('category')),
      status: queryString(searchParams.get('status')),
      page: queryString(searchParams.get('page')),
      pageSize: queryString(searchParams.get('pageSize'))
    })

    const result = await posts.list.execute({ input, actor })
    const authorNames = await resolveAuthorNames(result.items.map((post) => post.data.authorId))
    return NextResponse.json(serializeListWithAuthors(result, authorNames))
  } catch (error) {
    return toErrorResponse(error)
  }
}
