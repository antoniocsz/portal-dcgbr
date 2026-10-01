# @digimon/content — Status

## Fase 1 — Fundação (task 03-module-content)
- [x] Pacote `@digimon/content` criado (domain + use-cases + infra + barrel)
- [x] Entidade `Post` (workflow draft → review → published → archived; slug único; slugify)
- [x] `Category` como value-object fixo derivado do enum `PostCategory` (sem tabela)
- [x] Interfaces `IPostRepository` + `ICategoryRepository` (DIP)
- [x] Use cases: CreatePost, UpdatePost, SubmitForReview, PublishPost, ArchivePost, GetPost, ListPosts, GetSimulatorsPage
- [x] Implementação Prisma: `PrismaPostRepository` (mapeia enums Prisma ↔ domínio) + `PrismaCategoryRepository`
- [x] Eventos `post.created/updated/published/archived` via EventBus (`@digimon/contracts`)
- [x] Testes unitários (19): Author não publica direto; leitura pública não expõe rascunhos; slug único; categoria simulator agrega
- [x] Route handlers `apps/web/src/app/api/posts/**` (público + editorial)
- [x] UI MVVM estrito em `apps/web/src/features/content/**` (model + viewmodels + views)
- [x] Barrel export atualizado
- [x] Typecheck: `pnpm turbo typecheck --filter=@digimon/content` passando
- [x] Lint passando (content e arquivos content do web)

## Fase 2 — Refinamentos
- [x] Integração real com o auth (devolução do reviewer): `_lib/session.ts` lê o cookie `access_token` via `readAccessToken` e valida com `verifyJwt`/`requireRole` (`@digimon/auth`) — sem HMAC local, sem fallback de `JWT_SECRET`
- [x] Páginas públicas (`app/(public)/...`) — task 10 (Home, Notícias, Artigo, Simuladores)
- [ ] Painel admin de conteúdo (`app/admin/posts/...`) — task 12
- [ ] Testes de integração com Postgres real

## Fase 3 — Páginas públicas (task 10-frontend-paginas-publicas)
- [x] Rotas `app/(public)/`: `layout.tsx` (passthrough — chrome vem do root/SiteChrome), `page.tsx` (Home), `noticias/page.tsx`, `noticias/[slug]/page.tsx`, `simuladores/page.tsx`
- [x] ViewModels: `use-home` (destaque + últimas via `/api/posts`; torneios estáticos), `use-news-list` (filtro por categoria), `use-simulators` (conteúdo estático) + helpers `post-view` (formatação/mapping, sem hooks/JSX)
- [x] Views reutilizáveis em `features/content/views/`: `HomeView`, `Hero`, `NewsGrid`, `NewsListView`, `SimulatorsView`, `SimulatorCard`, `PostArticle` + barrels (`views/index.ts`, `viewmodels/index.ts`)
- [x] SEO: `metadata` (Home/Notícias/Simuladores) e `generateMetadata` por slug (Artigo)
- [x] Artigo em SSR (fetch server-side da API pública) + `CommentSection` (feature comments)
- [x] Typecheck `@digimon/app-web` ok; Lint ok (0 erros no escopo)
- [ ] Painel admin de conteúdo (`app/admin/posts/...`) — task 12

## Fase 4 — Rota editorial por id (task 18-backend-admin-posts-get)
- [x] `GET /api/posts/admin/:id` — retorna post por **id** (qualquer status: draft/review/published/archived) para usuário editorial (administrator|editor)
- [x] Fronteira igual à do `GetPostUseCase` (NotFound sem vazar existência; defense in depth — rota exige `requireEditorialUser`)
- [x] 401 para não autenticado; 403 para não editorial (testado manualmente com member)
- [x] Serialização igual à do GET público (`serializePost` — `_lib/serialize.ts`)
- [x] Teste manual: login admin → POST /api/posts/admin (draft) → GET /api/posts/admin/:id → 200 com status draft; GET público por slug do draft → 404 (rascunho não vaza)
- [x] Typecheck e lint globais passando (11/11)

## Handoff
- **Task 18 (GET /api/posts/admin/:id):** criado `GET /api/posts/admin/[id]` no route.ts existente (que já tinha PATCH). O domínio `GetPostUseCase` expõe busca por **slug** apenas; para **id** foi criado helper local `apps/web/src/app/api/posts/admin/[id]/_lib/get-post-by-id.ts` que consome `PrismaPostRepository.findById` + `isEditorial` (exports públicos do barrel `@digimon/content` — DIP respeitado, sem tocar em `packages/modules/content/**`) e replica a MESMA fronteira do `GetPostUseCase`: `NotFoundError` para não-publicado/não-editorial (sem vazar existência). A rota usa `requireEditorialUser` (401/403) e responde com `serializePost` — serialização idêntica ao GET público por slug. Testado manualmente: admin autenticado → 200 com draft; sem cookie → 401; member autenticado → 403; GET público por slug do draft → 404 (rascunho não vaza). Typecheck e lint globais (11/11) passando.
- **Task 10 (páginas públicas):** criadas as rotas `app/(public)/**` (Home, Notícias, Artigo por slug, Simuladores) consumindo a API pública `/api/posts` via ViewModels (`use-home`, `use-news-list`, `use-simulators`) e o design system da task 09 (`PostCard`, `TournamentCard`, `Tag`, `Button`, `Avatar`, ícones). `(public)/layout.tsx` é passthrough — o chrome (header/footer) continua no root layout via `SiteChrome` (sem duplicação). Artigo renderizado em SSR com `generateMetadata` por slug + `CommentSection` da feature comments. SEO: `metadata`/`generateMetadata` e `alternates.canonical` em todas as rotas. Removido o placeholder `app/page.tsx` (conflito de rota `/` com `(public)/page.tsx`; o arquivo constava no `## Baseline (git)` da task). Torneios e simuladores usam conteúdo estático (módulos de backend inexistentes). Ícones do design sem equivalente em `components/icons.tsx` (gamepad-2/globe/swords/dice-5) foram mapeados para os disponíveis (Sparkles/Layers/Trophy/LayoutDashboard) — adicionar os ícones exige tocar a task 09.
- **Feito (devolução do reviewer):** corrigido o `_lib/session.ts` de `api/posts` que duplicava validação JWT (HMAC-SHA256 local, cookie `session` nunca setado → 401 em runtime). Agora usa a integração real com o auth (task 02): `readAccessToken` (`src/lib/server/http.ts`) lê o cookie httpOnly `access_token`; `verifyJwt`/`requireRole` (`@digimon/auth`) validam com o `TokenService` real montado em `authDeps()` (`src/lib/server/container.ts`). O secret vem somente do env (`getJwtSecret` lança se `JWT_SECRET` ausente/curto — fallback `'dev-secret-change-me'` removido). Route handlers protegidos por papel: `POST/GET /api/posts/admin` (autenticado / editorial), `PATCH` e `submit` (autenticado; autoria checada no domínio), `publish`/`archive` (editorial — `requireRole(['administrator','editor'])`); rotas públicas (`GET /api/posts`, `GET /api/posts/:slug`) seguem abertas.
- **Pendência task 18:** o frontend `useAdminPostForm` (task 17) ainda resolve id → slug e busca o conteúdo via `GET /api/posts/:slug` público — que não expõe rascunhos. Com a nova rota `GET /api/posts/admin/:id`, uma task de frontend pode trocar `contentApi.getPost(slug)` por uma chamada editorial por id (`/api/posts/admin/{id}`) para carregar rascunhos/review/arquivados na tela `/admin/posts/[id]` (fora do escopo desta task — frontend não tocado). Dados de teste criados no banco de dev: post draft `draft-teste-task-18` e usuário `member18@teste.com`.
- **Pendências:** páginas SSR/ISR (fora do escopo); testes de integração com Postgres real.
- **Decisões (revisão 03):** (1) `submit` (`draft → review`) permanece autenticado e não editorial-only — o domínio `SubmitForReviewUseCase` permite o autor submeter o próprio rascunho (workflow draft → review → published exige isso); `publish`/`archive`/listagem editorial exigem papel editorial na rota **e** no domínio (defense in depth). (2) Erros de lint/typecheck em arquivos de outras tasks em paralelo (comments, features/auth, features/users) não são tocados — reportados. (3) `features/content/**` não usa helpers de sessão — client-side, cookies httpOnly enviados automaticamente (same-origin).
- **Nota de paralelismo:** task 02 (auth) e task 04 (comments) ativas em paralelo — lint/typecheck globais do web podem falhar até elas concluírem (arquivos delas, fora deste escopo).
## Fase 5 — Editor WYSIWYG (task 22-frontend-editor-tiptap)
- [x] `Post.body` agora aceita HTML (TipTap) — o módulo @digimon/content não mudou (body é string)
- [x] Renderização pública com sanitização allowlist + prose (dark)
- [x] Fallback: posts antigos (texto puro com `\n`) renderizam como parágrafos

## Handoff (task 22)
- **Feito:** editor WYSIWYG estilo Notion (TipTap) no PostForm; renderização com formatação no artigo público; sanitização no SSR; migração/fallback de posts antigos.
- **Decisões:** body passa a ser HTML; sanitização allowlist no servidor (defense in depth — o TipTap só gera os nós habilitados); prose-invert para dark.

## Fase 6 — Fix editor WYSIWYG (task 24)
- [x] Causa raiz da perda de foco: `useEditor(..., [value, onChange, extensions])` recriava o editor a cada tecla
- [x] Deps estáveis `[extensions]`; valor externo sincronizado via effect (`value !== editor.getHTML()`)
- [x] Slash menu ancorado na posição do cursor (`view.coordsAtPos`), fecha com Esc/blur
- [x] Toolbar reflete estado ativo conforme seleção (shouldRerenderOnTransaction)

## Handoff (task 24)
- **Feito:** digitação contínua sem perder foco; menu de comandos junto ao cursor.
- **Decisões:** editor é "controlado" apenas para atualizações externas (reset/load); durante a digitação o editor é a fonte da verdade (uncontrolled) — evita o ciclo de recriação.
