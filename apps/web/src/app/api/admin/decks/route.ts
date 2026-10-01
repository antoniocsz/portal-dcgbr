// Path: apps/web/src/app/api/admin/decks/route.ts
// GET /api/admin/decks — gestão admin de decks: agenda COMPLETA (rascunhos +
// published + unlisted) para administrator|editor, com filtros (search, status,
// format) e paginação. Reusa ListDecksUseCase: o actor admin/editor ignora o
// filtro publicOnly — a regra vive no DOMÍNIO do módulo decks (defense in depth).
import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@digimon/auth'
import { listDecksSchema } from '@digimon/decks'
import { toErrorResponse, queryString } from '../../decks/_lib/handlers'
import { serializeList } from '../../decks/_lib/serialize'
import { decks } from '../../decks/_lib/container'
import { requireUser } from '../../decks/_lib/session'

export const runtime = 'nodejs'

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const actor = requireUser(request)
    requireRole({ userId: actor.id, role: actor.role }, ['administrator', 'editor'])

    const { searchParams } = new URL(request.url)
    const input = listDecksSchema.parse({
      search: queryString(searchParams.get('search')),
      format: queryString(searchParams.get('format')),
      status: queryString(searchParams.get('status')),
      page: queryString(searchParams.get('page')),
      pageSize: queryString(searchParams.get('pageSize'))
    })

    const result = await decks.list.execute({ input, actor })
    return NextResponse.json(serializeList(result))
  } catch (error) {
    return toErrorResponse(error)
  }
}
