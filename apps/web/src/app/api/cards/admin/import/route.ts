// Path: apps/web/src/app/api/cards/admin/import/route.ts
// POST /api/cards/admin/import — importação/curadoria do card database (admin).
// Corpo: { cards: CardInput[], sets?: CardSetInput[] }.
import { NextRequest, NextResponse } from 'next/server'
import type { ImportCardsInput } from '@digimon/cards'
import { cards } from '../../_lib/container'
import { toErrorResponse } from '../../_lib/handlers'
import { requireAdminUser } from '../../_lib/session'

export const runtime = 'nodejs'

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const actor = requireAdminUser(request)
    const body = (await request.json()) as ImportCardsInput
    const result = await cards.import.execute({ actor, input: body })
    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    return toErrorResponse(error)
  }
}
