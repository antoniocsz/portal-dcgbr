// apps/web/src/app/api/comments/admin/route.ts
// GET /api/comments/admin — listagem GLOBAL de comentários para moderação
// (Admin/Editor). Filtros: status (visible|hidden|deleted), targetType
// (post|card|deck) e paginação. Inclui o nome do autor.
import { NextRequest, NextResponse } from 'next/server'
import { UnauthorizedError } from '@digimon/contracts'
import type { CommentActor } from '@digimon/comments'
import type { CommentStatus, CommentTargetType } from '@digimon/contracts'
import { commentsContainer } from '../_lib/container'
import { toErrorResponse } from '../_lib/http'
import { getSessionUser } from '../_lib/session'

export const runtime = 'nodejs'

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const actor = getSessionUser(request)
    if (!actor) throw new UnauthorizedError('Não autenticado')

    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')
    const targetType = searchParams.get('targetType')
    const page = Number(searchParams.get('page') ?? 1)
    const pageSize = Number(searchParams.get('pageSize') ?? 20)

    const input: {
      actor: CommentActor
      status?: CommentStatus
      targetType?: CommentTargetType
      page: number
      pageSize: number
    } = {
      actor,
      page: Number.isFinite(page) && page > 0 ? page : 1,
      pageSize: Number.isFinite(pageSize) && pageSize > 0 ? pageSize : 20
    }
    if (status === 'visible' || status === 'hidden' || status === 'deleted') input.status = status
    if (targetType === 'post' || targetType === 'card' || targetType === 'deck') {
      input.targetType = targetType
    }

    const result = await commentsContainer.listAll.execute(input)

    return NextResponse.json({
      items: result.items.map(({ comment, authorName }) => ({
        id: comment.id,
        authorId: comment.authorId,
        authorName,
        targetType: comment.targetType,
        targetId: comment.targetId,
        body: comment.body,
        status: comment.status,
        createdAt: comment.createdAt.toISOString(),
        updatedAt: comment.updatedAt.toISOString()
      })),
      total: result.total,
      page: result.page,
      pageSize: result.pageSize
    })
  } catch (error) {
    return toErrorResponse(error)
  }
}
