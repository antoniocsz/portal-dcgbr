// apps/web/src/app/api/comments/[id]/moderate/route.ts
// POST /api/comments/:id/moderate — Admin/Editor ocultam (hidden) ou exibem comentário

import { NextRequest, NextResponse } from 'next/server'
import { ValidationError } from '@digimon/contracts'
import { commentsContainer } from '../../_lib/container'
import { toErrorResponse } from '../../_lib/http'
import { getSessionUser } from '../../_lib/session'

type RouteContext = { params: Promise<{ id: string }> }

export async function POST(request: NextRequest, context: RouteContext): Promise<NextResponse> {
  try {
    const actor = getSessionUser(request)
    const { id } = await context.params
    const body = (await request.json()) as { action?: unknown }
    if (body.action !== 'hide' && body.action !== 'show') {
      throw new ValidationError('action inválida: use hide ou show')
    }
    const comment = await commentsContainer.moderate.execute({
      actor,
      commentId: id,
      action: body.action
    })
    return NextResponse.json({ comment })
  } catch (error) {
    return toErrorResponse(error)
  }
}
