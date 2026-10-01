// apps/web/src/app/api/comments/_lib/http.ts
// Traduz AppError → resposta HTTP e erros inesperados → 500.

import { NextResponse } from 'next/server'
import { AppError } from '@digimon/contracts'

export function toErrorResponse(error: unknown): NextResponse {
  if (error instanceof AppError) {
    return NextResponse.json(
      { error: { code: error.code, message: error.message } },
      { status: error.statusCode }
    )
  }
  console.error('Erro inesperado em /api/comments', error)
  return NextResponse.json(
    { error: { code: 'INTERNAL_ERROR', message: 'Erro interno' } },
    { status: 500 }
  )
}

export function parseCommentTargetType(value: string | null): 'post' | 'card' | 'deck' | null {
  if (value === 'post' || value === 'card' || value === 'deck') return value
  return null
}
