// Path: apps/web/src/app/api/posts/_lib/authors.ts
// Resolve o nome dos autores de posts (relation User) para enriquecer os DTOs
// editoriais (authorName). Consulta única por lote (findMany in) — sem tocar o
// domínio @digimon/content (a entidade Post não carrega o autor).
import { prisma } from '@digimon/database'

/** Mapa authorId → name para os ids informados. */
export async function resolveAuthorNames(authorIds: string[]): Promise<Map<string, string>> {
  const ids = [...new Set(authorIds.filter(Boolean))]
  if (ids.length === 0) return new Map()
  const rows = await prisma.user.findMany({
    where: { id: { in: ids } },
    select: { id: true, name: true }
  })
  return new Map(rows.map((row) => [row.id, row.name]))
}
