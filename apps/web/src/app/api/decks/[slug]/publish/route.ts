// Path: apps/web/src/app/api/decks/[slug]/publish/route.ts
// POST /api/decks/:slug/publish — publica deck direto (sem revisão). Somente o
// dono. Publicar exige ao menos uma carta no cardList.
import { NextRequest, NextResponse } from 'next/server'
import { toErrorResponse } from '../../_lib/handlers'
import { decks } from '../../_lib/container'
import { requireUser } from '../../_lib/session'

export const runtime = 'nodejs'

interface RouteContext {
  params: Promise<{ slug: string }>
}

export async function POST(request: NextRequest, context: RouteContext): Promise<NextResponse> {
  try {
    const actor = requireUser(request)
    const { slug } = await context.params
    const result = await decks.publish.execute({ actor, slug })
    return NextResponse.json(result)
  } catch (error) {
    return toErrorResponse(error)
  }
}
