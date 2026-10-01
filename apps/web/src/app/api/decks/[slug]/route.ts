// Path: apps/web/src/app/api/decks/[slug]/route.ts
// GET    /api/decks/:slug — detalhe público (published E isPublic; rascunho ou
//   unlisted só para o dono — NotFound sem vazar existência).
// PATCH  /api/decks/:slug — edita (somente o dono; Member NÃO edita deck de outro).
// DELETE /api/decks/:slug — remove (somente o dono).
import { NextRequest, NextResponse } from 'next/server'
import type { UpdateDeckInput } from '@digimon/decks'
import { toErrorResponse } from '../_lib/handlers'
import { serializeDeck } from '../_lib/serialize'
import { decks } from '../_lib/container'
import { getSessionUser, requireUser } from '../_lib/session'

export const runtime = 'nodejs'

interface RouteContext {
  params: Promise<{ slug: string }>
}

export async function GET(request: NextRequest, context: RouteContext): Promise<NextResponse> {
  try {
    const { slug } = await context.params
    const actor = getSessionUser(request)
    const deck = await decks.get.execute({ slug, actor })
    return NextResponse.json(serializeDeck(deck))
  } catch (error) {
    return toErrorResponse(error)
  }
}

export async function PATCH(request: NextRequest, context: RouteContext): Promise<NextResponse> {
  try {
    const actor = requireUser(request)
    const { slug } = await context.params
    const body = (await request.json()) as UpdateDeckInput
    const result = await decks.update.execute({ actor, slug, input: body })
    return NextResponse.json(result)
  } catch (error) {
    return toErrorResponse(error)
  }
}

export async function DELETE(request: NextRequest, context: RouteContext): Promise<NextResponse> {
  try {
    const actor = requireUser(request)
    const { slug } = await context.params
    const result = await decks.remove.execute({ actor, slug })
    return NextResponse.json(result)
  } catch (error) {
    return toErrorResponse(error)
  }
}
