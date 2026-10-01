// Path: apps/web/src/app/api/posts/admin/[id]/archive/route.ts
// POST /api/posts/admin/:id/archive — published → archived (somente Admin/Editor).
import { NextRequest, NextResponse } from 'next/server'
import { toErrorResponse } from '../../../_lib/handlers'
import { posts } from '../../../_lib/use-cases'
import { requireEditorialUser } from '../../../_lib/session'

export const runtime = 'nodejs'

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function POST(request: NextRequest, context: RouteContext): Promise<NextResponse> {
  try {
    const actor = requireEditorialUser(request)
    const { id } = await context.params
    const result = await posts.archive.execute({ actor, id })
    return NextResponse.json(result)
  } catch (error) {
    return toErrorResponse(error)
  }
}
