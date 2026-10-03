// Path: apps/web/src/app/api/posts/simulators/route.ts
// GET /api/posts/simulators — página pública de Simuladores: todos os posts
// published da categoria `simulator` (o primeiro = destaque, mais recente).
// Público, sem autenticação.
import { NextResponse } from 'next/server'
import { toErrorResponse } from '../_lib/handlers'
import { serializePostSummary } from '../_lib/serialize'
import { posts } from '../_lib/use-cases'
import { resolveAuthorNames } from '../_lib/authors'

export const runtime = 'nodejs'

export async function GET(): Promise<NextResponse> {
  try {
    const result = await posts.simulators.execute()
    const authorNames = await resolveAuthorNames(result.posts.map((post) => post.data.authorId))
    return NextResponse.json({
      category: result.category,
      posts: result.posts.map((post) =>
        serializePostSummary(post, authorNames.get(post.data.authorId) ?? undefined)
      )
    })
  } catch (error) {
    return toErrorResponse(error)
  }
}
