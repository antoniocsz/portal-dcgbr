# @digimon/content — Contexto do Módulo

## Responsabilidade
CMS editorial: notícias, matérias e curiosidades sobre o Digimon TCG. **Inclui a categoria Simuladores** (info sobre simuladores de fãs e o Alysium — lançamento oficial 2026). Workflow de publicação editorial com autoria (`createdBy`).

## Entidades
- **Post** — id, slug, title, excerpt, body, coverImage, category (news | article | curiosity | simulator), status (draft | review | published | archived), authorId (createdBy), publishedAt, createdAt, updatedAt
- **Category** — value-object fixo derivado do enum `PostCategory` (id, slug, name). Categorias editoriais são fixas e não exigem tabela própria (decisão task 03 — o enum no schema Prisma cobre)

## Use Cases
- `CreatePostUseCase` — qualquer usuário autenticado cria rascunho (draft); slug único (ConflictError)
- `UpdatePostUseCase` — edita rascunho/publicado (autor do post OU Admin/Editor)
- `SubmitForReviewUseCase` — draft → review (autor submete; Admin/Editor também)
- `PublishPostUseCase` — review → published (somente Admin/Editor — regra central)
- `ArchivePostUseCase` — published → archived (Admin/Editor)
- `GetPostUseCase` — leitura pública por slug (published) + versão de edição se autorizado
- `ListPostsUseCase` — listagem pública (filtros: category, status, paginação) — SEO-friendly
- `GetSimulatorsPageUseCase` — conteúdo consolidado sobre simuladores (Alysium + fan-made)

## Eventos que Publica
- `post.created`, `post.updated`, `post.published`, `post.archived` (via `@digimon/contracts` EventBus)

## Eventos que Consome
- Nenhum

## Dependências
- `@digimon/contracts` (tipos, erros, eventos, EventBus)
- `@prisma/client` (infra), `zod` (schemas de entrada)

## Repositórios
- `IPostRepository` (create/update/findById/findBySlug/list)
- `ICategoryRepository` (list/findById — retorna as categorias fixas)

## Rotas (apps/web, route handlers)
- `GET /api/posts` — listagem pública (published)
- `GET /api/posts/:slug` — leitura pública por slug
- `POST /api/posts/admin` — criar rascunho (autenticado)
- `GET /api/posts/admin` — listagem editorial (Admin/Editor, filtra status)
- `PATCH /api/posts/admin/:id` — editar (autor ou Admin/Editor)
- `POST /api/posts/admin/:id/submit` — draft → review
- `POST /api/posts/admin/:id/publish` — review → published (Admin/Editor)
- `POST /api/posts/admin/:id/archive` — published → archived (Admin/Editor)

## Regras
- **Somente Admin/Editor publicam notícias** — Author passa pelo workflow draft → review → published
- Autor de post = `authorId` (createdBy) — Author é relação, não papel
- Categoria `simulator` agrega notícias sobre simuladores (Alysium e fan-made)
- Leitura pública: somente posts `published` (rascunhos nunca expostos — NotFoundError)
- Slug único, SEO-friendly (indexação obrigatória)
- SSR/ISR para páginas públicas (SEO-first) — páginas SSR/ISR em task futura de frontend