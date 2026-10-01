// Path: apps/web/src/app/api/posts/admin/[id]/_lib/get-post-by-id.ts
// Leitura editorial por id (qualquer status: draft/review/published/archived).
// O domínio @digimon/content expõe GetPostUseCase por SLUG; para id consumimos o
// repositório público via barrel (@digimon/content → PrismaPostRepository) e
// replicamos a MESMA fronteira do GetPostUseCase: não-publicado só para
// Admin/Editor — NotFound sem vazar existência (defense in depth; a rota já
// exige requireEditorialUser).
import { NotFoundError } from '@digimon/contracts'
import { prisma } from '@digimon/database'
import { isEditorial, PrismaPostRepository } from '@digimon/content'
import type { Post } from '@digimon/content'
import type { SessionUser } from '../../../_lib/session'

const postRepo = new PrismaPostRepository(prisma)

export async function getPostById(id: string, actor: SessionUser | null): Promise<Post> {
  const post = await postRepo.findById(id)
  if (!post) throw new NotFoundError('Post não encontrado')
  if (!post.isPublished && !isEditorial(actor)) {
    throw new NotFoundError('Post não encontrado')
  }
  return post
}
