// Path: apps/web/src/app/api/cards/[id]/route.ts
// GET /api/cards/:id — ficha pública da carta. Aceita id interno ou dcgId; para
// buscar por número use ?number=BT1-001.
import { NextRequest, NextResponse } from 'next/server'
import { cards } from '../_lib/container'
import { toErrorResponse, queryString } from '../_lib/handlers'
import { serializeCard } from '../_lib/serialize'

export const runtime = 'nodejs'

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, context: RouteContext): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url)
    const number = queryString(searchParams.get('number'))
    if (number) {
      const card = await cards.get.execute({ number })
      return NextResponse.json(serializeCard(card))
    }

    const { id } = await context.params
    const card = await cards.get.execute({ id })
    return NextResponse.json(serializeCard(card))
  } catch (error) {
    return toErrorResponse(error)
  }
}
