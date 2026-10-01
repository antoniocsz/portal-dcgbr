// Path: packages/modules/auth/src/use-cases/parse-or-throw.ts
// Converte ZodError em ValidationError (hierarquia AppError) — o handler
// global traduz para HTTP 422. Mantém os detalhes de validação.
import { ValidationError } from '@digimon/contracts'
import type { ZodType } from 'zod'

export function parseOrThrow<T>(schema: ZodType<T>, input: unknown): T {
  const result = schema.safeParse(input)
  if (!result.success) {
    throw new ValidationError('Dados inválidos', result.error.flatten())
  }
  return result.data
}
