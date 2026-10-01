// Path: apps/web/src/app/api/posts/route.ts
// GET /api/posts — listagem pública (somente published; SEO-friendly).
import { NextRequest, NextResponse } from 'next/server'
import { listPostsSchema } from '@digimon/content'
import { toErrorResponse, queryString } from './_lib/handlers'
import { serializeList } from './_lib/serialize'
import { posts } from './_lib/use-cases'

export const runtime = 'nodejs'

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url)
    const input = listPostsSchema.parse({
      category: queryString(searchParams.get('category')),
      status: queryString(searchParams.get('status')),
      page: queryString(searchParams.get('page')),
      pageSize: queryString(searchParams.get('pageSize'))
    })

    const result = await posts.list.execute({ input })
    return NextResponse.json(serializeList(result))
  } catch (error) {
    return toErrorResponse(error)
  }
}
