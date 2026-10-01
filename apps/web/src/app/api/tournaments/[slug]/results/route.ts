// Path: apps/web/src/app/api/tournaments/[slug]/results/route.ts
// POST /api/tournaments/:slug/results — registra resultados (posições/jogadores)
// e finaliza o torneio. Somente criador OU Admin/Editor.
// Resultados alimentam a cobertura editorial em @digimon/content (post citando torneio).
import { NextRequest, NextResponse } from 'next/server'
import type { AddResultsInput } from '@digimon/tournaments'
import { toErrorResponse } from '../../_lib/handlers'
import { tournaments } from '../../_lib/container'
import { requireUser } from '../../_lib/session'

export const runtime = 'nodejs'

interface RouteContext {
  params: Promise<{ slug: string }>
}

export async function POST(request: NextRequest, context: RouteContext): Promise<NextResponse> {
  try {
    const actor = requireUser(request)
    const { slug } = await context.params
    const body = (await request.json()) as AddResultsInput
    const result = await tournaments.addResults.execute({ actor, slug, input: body })
    return NextResponse.json(result)
  } catch (error) {
    return toErrorResponse(error)
  }
}
