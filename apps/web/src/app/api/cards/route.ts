// Path: apps/web/src/app/api/cards/route.ts
// GET /api/cards — listagem pública do catálogo (filtros + busca full-text).
import { NextRequest, NextResponse } from 'next/server'
import { listCardsSchema } from '@digimon/cards'
import { cards } from './_lib/container'
import { toErrorResponse, queryString } from './_lib/handlers'
import { serializeList } from './_lib/serialize'

export const runtime = 'nodejs'

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url)
    const input = listCardsSchema.parse({
      search: queryString(searchParams.get('search')),
      type: queryString(searchParams.get('type')),
      color: queryString(searchParams.get('color')),
      playCost: queryString(searchParams.get('playCost')),
      setCode: queryString(searchParams.get('setCode')),
      page: queryString(searchParams.get('page')),
      pageSize: queryString(searchParams.get('pageSize'))
    })

    const result = await cards.list.execute({ input })
    return NextResponse.json(serializeList(result))
  } catch (error) {
    return toErrorResponse(error)
  }
}
