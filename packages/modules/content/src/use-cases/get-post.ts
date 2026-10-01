// Path: packages/modules/content/src/use-cases/get-post.ts
// Leitura por slug. Público: somente posts published. Admin/Editor veem qualquer
// status (versão de edição). Rascunhos nunca são expostos ao público (NotFound,
// sem vazar existência).
import { NotFoundError } from '@digimon/contracts'
import { isEditorial, type Actor } from '../domain/actor'
import type { Post } from '../domain/entities/post'
import type { PostRepository } from '../domain/repositories/post-repository'

export interface GetPostCommand {
  slug: string
  actor?: Actor | null
}

export class GetPostUseCase {
  constructor(private readonly repo: PostRepository) {}

  async execute(command: GetPostCommand): Promise<Post> {
    const post = await this.repo.findBySlug(command.slug)
    if (!post) throw new NotFoundError('Post não encontrado')
    if (!post.isPublished && !isEditorial(command.actor ?? null)) {
      throw new NotFoundError('Post não encontrado')
    }
    return post
  }
}
