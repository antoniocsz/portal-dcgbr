// Path: apps/web/src/app/api/tournaments/route.ts
// GET  /api/tournaments — agenda pública (somente published; Admin/Editor podem
//   filtrar por status). ?mine=true lista os torneios do próprio Member (qualquer status).
// POST /api/tournaments — Member autenticado publica torneio direto (colaborativo,
//   sem revisão).
import { NextRequest, NextResponse } from 'next/server'
import {
  listTournamentsSchema,
  type CreateTournamentInput
} from '@digimon/tournaments'
import { toErrorResponse, queryString } from './_lib/handlers'
import { serializeList } from './_lib/serialize'
import { tournaments } from './_lib/container'
import { getSessionUser, requireUser } from './_lib/session'

export const runtime = 'nodejs'

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url)
    const mine = searchParams.get('mine') === 'true'
    const input = listTournamentsSchema.parse({
      format: queryString(searchParams.get('format')),
      location: queryString(searchParams.get('location')),
      status: queryString(searchParams.get('status')),
      from: queryString(searchParams.get('from')),
      page: queryString(searchParams.get('page')),
      pageSize: queryString(searchParams.get('pageSize'))
    })

    if (mine) {
      // "Meus torneios" (spec: /me/tournaments) — Member autenticado, qualquer status.
      const actor = requireUser(request)
      const result = await tournaments.list.execute({ input, actor, mine: true })
      return NextResponse.json(serializeList(result))
    }

    // Agenda pública: ator opcional (Admin/Editor ganham filtro por status).
    const actor = getSessionUser(request)
    const result = await tournaments.list.execute({ input, actor })
    return NextResponse.json(serializeList(result))
  } catch (error) {
    return toErrorResponse(error)
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const actor = requireUser(request)
    const body = (await request.json()) as CreateTournamentInput
    const result = await tournaments.create.execute({ actor, input: body })
    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    return toErrorResponse(error)
  }
}
