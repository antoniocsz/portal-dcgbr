// Path: apps/web/src/app/api/admin/decks/[slug]/route.ts
// DELETE /api/admin/decks/:slug — exclui QUALQUER deck (override de dono).
// Somente administrator na rota; o DeleteDeckUseCase revalida o override no
// DOMÍNIO (admin/editor) — defense in depth. Member não-dono segue 403.
import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@digimon/auth'
import { toErrorResponse } from '../../../decks/_lib/handlers'
import { decks } from '../../../decks/_lib/container'
import { requireUser } from '../../../decks/_lib/session'

export const runtime = 'nodejs'

interface RouteContext {
  params: Promise<{ slug: string }>
}

export async function DELETE(request: NextRequest, context: RouteContext): Promise<NextResponse> {
  try {
    const actor = requireUser(request)
    requireRole({ userId: actor.id, role: actor.role }, 'administrator')

    const { slug } = await context.params
    const result = await decks.remove.execute({ actor, slug })
    return NextResponse.json(result)
  } catch (error) {
    return toErrorResponse(error)
  }
}
