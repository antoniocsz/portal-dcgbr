// apps/web/src/app/api/comments/route.ts
// GET  /api/comments?targetType=post&targetId=xyz&page=1&pageSize=20 — listagem pública por target
// POST /api/comments — cria comentário (exige conta logada)

import { NextRequest, NextResponse } from 'next/server'
import { ValidationError } from '@digimon/contracts'
import { commentsContainer } from './_lib/container'
import { parseCommentTargetType, toErrorResponse } from './_lib/http'
import { getSessionUser } from './_lib/session'

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const searchParams = request.nextUrl.searchParams
    const targetType = parseCommentTargetType(searchParams.get('targetType'))
    if (!targetType) throw new ValidationError('targetType inválido: use post, card ou deck')
    const targetId = searchParams.get('targetId')
    if (!targetId) throw new ValidationError('targetId é obrigatório')

    const page = Number(searchParams.get('page') ?? 1)
    const pageSize = Number(searchParams.get('pageSize') ?? 20)
    const result = await commentsContainer.list.execute({
      targetType,
      targetId,
      page: Number.isFinite(page) && page > 0 ? page : 1,
      pageSize: Number.isFinite(pageSize) && pageSize > 0 ? pageSize : 20
    })
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

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const actor = getSessionUser(request)
    const body = (await request.json()) as {
      targetType?: unknown
      targetId?: unknown
      body?: unknown
    }
    const targetType = parseCommentTargetType(
      typeof body.targetType === 'string' ? body.targetType : null
    )
    if (!targetType) throw new ValidationError('targetType inválido: use post, card ou deck')

    const comment = await commentsContainer.create.execute({
      actor,
      targetType,
      targetId: typeof body.targetId === 'string' ? body.targetId : '',
      body: typeof body.body === 'string' ? body.body : ''
    })
    return NextResponse.json({ comment }, { status: 201 })
  } catch (error) {
    return toErrorResponse(error)
  }
}
