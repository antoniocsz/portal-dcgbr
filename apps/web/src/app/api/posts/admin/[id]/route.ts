// Path: apps/web/src/app/api/posts/admin/[id]/route.ts
// GET   /api/posts/admin/:id — post por id, qualquer status (draft/review/
//   published/archived) para usuário editorial (Admin/Editor). Fronteira igual
//   à do GetPostUseCase (NotFound sem vazar existência — defense in depth).
// PATCH /api/posts/admin/:id — edita post (autor do post OU Admin/Editor).
import { NextRequest, NextResponse } from 'next/server'
import type { UpdatePostInput } from '@digimon/content'
import { toErrorResponse } from '../../_lib/handlers'
import { serializePost } from '../../_lib/serialize'
import { resolveAuthorNames } from '../../_lib/authors'
import { posts } from '../../_lib/use-cases'
import { requireEditorialUser, requireUser } from '../../_lib/session'
import { getPostById } from './_lib/get-post-by-id'

export const runtime = 'nodejs'

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, context: RouteContext): Promise<NextResponse> {
  try {
    const actor = requireEditorialUser(request)
    const { id } = await context.params
    const post = await getPostById(id, actor)
    const authorNames = await resolveAuthorNames([post.data.authorId])
    return NextResponse.json(serializePost(post, authorNames.get(post.data.authorId) ?? undefined))
  } catch (error) {
    return toErrorResponse(error)
  }
}

export async function PATCH(request: NextRequest, context: RouteContext): Promise<NextResponse> {
  try {
    const actor = requireUser(request)
    const { id } = await context.params
    const body = (await request.json()) as UpdatePostInput
    const result = await posts.update.execute({ actor, id, input: body })
    return NextResponse.json(result)
  } catch (error) {
    return toErrorResponse(error)
  }
}
