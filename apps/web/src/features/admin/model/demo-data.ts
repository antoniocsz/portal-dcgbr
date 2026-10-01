// Path: apps/web/src/features/admin/model/demo-data.ts
// Dados de demonstração da moderação de comentários. O módulo de comentários
// não expõe listagem global (apenas por target) — enquanto esse endpoint não
// existir, o painel exibe esta amostra e as ações já chamam a API real de
// moderação (/api/comments/:id/moderate) quando o id corresponder a um registro.
import type { AdminCommentRow, ModerationItem } from './types'

export const DEMO_COMMENTS: AdminCommentRow[] = [
  {
    id: 'demo-comment-1',
    body: 'Ótimo artigo sobre o Alysium!',
    status: 'visible',
    authorName: 'Renato K.',
    date: '28 nov'
  },
  {
    id: 'demo-comment-2',
    body: 'Alguém sabe o preço do booster BT-20?',
    status: 'visible',
    authorName: 'Ana P.',
    date: '27 nov'
  },
  {
    id: 'demo-comment-3',
    body: 'Spam repetido em vários posts',
    status: 'hidden',
    authorName: 'Lucas M.',
    date: '26 nov'
  },
  {
    id: 'demo-comment-4',
    body: 'Valeu pelas dicas de deck!',
    status: 'visible',
    authorName: 'Marina C.',
    date: '25 nov'
  }
]

export const DEMO_MODERATION: ModerationItem[] = [
  {
    id: 'demo-flag-1',
    authorName: 'Renato K.',
    title: 'Renato K. em “Alysium: tudo sobre o simulador oficial”',
    detail: 'Conteúdo duvidoso sobre a data de lançamento.',
    tone: 'warning'
  },
  {
    id: 'demo-flag-2',
    authorName: 'Ana P.',
    title: 'Ana P. em “Deck da semana: Royal Knights”',
    detail: 'Spam repetido em vários decks.',
    tone: 'danger'
  }
]
