// Path: apps/web/src/app/api/decks/route.ts
// GET  /api/decks — listagem pública (somente published E isPublic).
//   ?mine=true lista os decks do próprio Member (qualquer status). Filtros:
//   search (full-text no nome), format, page, pageSize.
// POST /api/decks — Member autenticado cria deck (draft ou published direto,
//   colaborativo, sem revisão).
import { NextRequest, NextResponse } from 'next/server'
import {
  listDecksSchema,
  type CreateDeckInput
} from '@digimon/decks'
import { toErrorResponse, queryString } from './_lib/handlers'
import { serializeList } from './_lib/serialize'
import { decks } from './_lib/container'
import { getSessionUser, requireUser } from './_lib/session'

export const runtime = 'nodejs'

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url)
    const mine = searchParams.get('mine') === 'true'
    const input = listDecksSchema.parse({
      search: queryString(searchParams.get('search')),
      format: queryString(searchParams.get('format')),
      status: queryString(searchParams.get('status')),
      page: queryString(searchParams.get('page')),
      pageSize: queryString(searchParams.get('pageSize'))
    })

    if (mine) {
      // "Meus decks" (spec: /me/decks) — Member autenticado, qualquer status.
      const actor = requireUser(request)
      const result = await decks.list.execute({ input, actor, mine: true })
      return NextResponse.json(serializeList(result))
    }

    // Listagem pública: rascunhos nunca vazam.
    const actor = getSessionUser(request)
    const result = await decks.list.execute({ input, actor })
    return NextResponse.json(serializeList(result))
  } catch (error) {
    return toErrorResponse(error)
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const actor = requireUser(request)
    const body = (await request.json()) as CreateDeckInput
    const result = await decks.create.execute({ actor, input: body })
    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    return toErrorResponse(error)
  }
}
