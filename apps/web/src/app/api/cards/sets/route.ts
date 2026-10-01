// Path: apps/web/src/app/api/cards/sets/route.ts
// GET /api/cards/sets — séries/expansões (leitura pública).
import { NextResponse } from 'next/server'
import { cards } from '../_lib/container'
import { toErrorResponse } from '../_lib/handlers'
import { serializeCardSet } from '../_lib/serialize'

export const runtime = 'nodejs'

export async function GET(): Promise<NextResponse> {
  try {
    const sets = await cards.listSets.execute()
    return NextResponse.json({ items: sets.map(serializeCardSet) })
  } catch (error) {
    return toErrorResponse(error)
  }
}
