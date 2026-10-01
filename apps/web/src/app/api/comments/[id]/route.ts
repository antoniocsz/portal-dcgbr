// apps/web/src/app/api/comments/[id]/route.ts
// PATCH  /api/comments/:id — autor edita o próprio comentário
// DELETE /api/comments/:id — autor remove o próprio; Admin/Editor removem qualquer

import { NextRequest, NextResponse } from 'next/server'
import { commentsContainer } from '../_lib/container'
import { toErrorResponse } from '../_lib/http'
import { getSessionUser } from '../_lib/session'

type RouteContext = { params: Promise<{ id: string }> }

export async function PATCH(request: NextRequest, context: RouteContext): Promise<NextResponse> {
  try {
    const actor = getSessionUser(request)
    const { id } = await context.params
    const body = (await request.json()) as { body?: unknown }
    const comment = await commentsContainer.update.execute({
      actor,
      commentId: id,
      body: typeof body.body === 'string' ? body.body : ''
    })
    return NextResponse.json({ comment })
  } catch (error) {
    return toErrorResponse(error)
  }
}

export async function DELETE(request: NextRequest, context: RouteContext): Promise<NextResponse> {
  try {
    const actor = getSessionUser(request)
    const { id } = await context.params
    await commentsContainer.delete.execute({ actor, commentId: id })
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    return toErrorResponse(error)
  }
}
