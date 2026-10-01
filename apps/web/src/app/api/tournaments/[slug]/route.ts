// Path: apps/web/src/app/api/tournaments/[slug]/route.ts
// GET    /api/tournaments/:slug — detalhe público (published/finished;
//   cancelado só para o criador ou Admin/Editor — NotFound sem vazar existência).
// PATCH  /api/tournaments/:slug — edita (criador OU Admin/Editor).
// DELETE /api/tournaments/:slug — cancela (criador OU Admin/Editor).
import { NextRequest, NextResponse } from 'next/server'
import type { UpdateTournamentInput } from '@digimon/tournaments'
import { toErrorResponse } from '../_lib/handlers'
import { serializeTournament } from '../_lib/serialize'
import { tournaments } from '../_lib/container'
import { getSessionUser, requireUser } from '../_lib/session'

export const runtime = 'nodejs'

interface RouteContext {
  params: Promise<{ slug: string }>
}

export async function GET(request: NextRequest, context: RouteContext): Promise<NextResponse> {
  try {
    const { slug } = await context.params
    const actor = getSessionUser(request)
    const tournament = await tournaments.get.execute({ slug, actor })
    return NextResponse.json(serializeTournament(tournament))
  } catch (error) {
    return toErrorResponse(error)
  }
}

export async function PATCH(request: NextRequest, context: RouteContext): Promise<NextResponse> {
  try {
    const actor = requireUser(request)
    const { slug } = await context.params
    const body = (await request.json()) as UpdateTournamentInput
    const result = await tournaments.update.execute({ actor, slug, input: body })
    return NextResponse.json(result)
  } catch (error) {
    return toErrorResponse(error)
  }
}

export async function DELETE(request: NextRequest, context: RouteContext): Promise<NextResponse> {
  try {
    const actor = requireUser(request)
    const { slug } = await context.params
    const result = await tournaments.cancel.execute({ actor, slug })
    return NextResponse.json(result)
  } catch (error) {
    return toErrorResponse(error)
  }
}
