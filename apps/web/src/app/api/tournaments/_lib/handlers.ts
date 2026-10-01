// Path: apps/web/src/app/api/tournaments/_lib/handlers.ts
// Helpers de resposta dos route handlers: erro → status HTTP (hierarquia
// AppError de @digimon/contracts), sucesso → JSON.
import { NextResponse } from 'next/server'
import { AppError } from '@digimon/contracts'

export function toErrorResponse(error: unknown): NextResponse {
  if (error instanceof AppError) {
    return NextResponse.json(
      { error: { code: error.code, message: error.message } },
      { status: error.statusCode }
    )
  }
  console.error('[api/tournaments] erro inesperado', error)
  return NextResponse.json(
    { error: { code: 'INTERNAL_ERROR', message: 'Erro interno' } },
    { status: 500 }
  )
}

export function queryString(value: string | null): string | undefined {
  return value === null || value === '' ? undefined : value
}
