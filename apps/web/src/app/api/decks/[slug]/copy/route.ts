// Path: apps/web/src/app/api/decks/[slug]/copy/route.ts
// POST /api/decks/:slug/copy — copia deck de outro usuário → novo deck PRÓPRIO
// do copiador (rascunho). Member autenticado. Registra DeckCopy (deck.copied).
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
    const result = await decks.copy.execute({ actor, slug })
    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    return toErrorResponse(error)
  }
}
