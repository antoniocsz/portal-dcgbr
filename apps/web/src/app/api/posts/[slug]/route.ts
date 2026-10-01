// Path: apps/web/src/app/api/posts/[slug]/route.ts
// GET /api/posts/:slug — leitura pública por slug (somente published).
// Rascunhos/review não são expostos (NotFoundError — sem vazar existência).
import { NextRequest, NextResponse } from 'next/server'
import { toErrorResponse } from '../_lib/handlers'
import { serializePost } from '../_lib/serialize'
import { posts } from '../_lib/use-cases'

export const runtime = 'nodejs'

interface RouteContext {
  params: Promise<{ slug: string }>
}

export async function GET(_request: NextRequest, context: RouteContext): Promise<NextResponse> {
  try {
    const { slug } = await context.params
    const post = await posts.get.execute({ slug })
    return NextResponse.json(serializePost(post))
  } catch (error) {
    return toErrorResponse(error)
  }
}
