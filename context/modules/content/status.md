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

## Fase 7 — Simuladores dinâmicos + externalUrl (task 31)
- [x] Campo `externalUrl String?` no Post (schema + migration 20261003_external_url aplicada + client regenerado)
- [x] Domínio/use cases/repo: externalUrl em PostData/Create/Update, Zod (url), mapping Prisma
- [x] DTOs serializados com externalUrl; nova rota GET /api/posts/simulators (usa GetSimulatorsPageUseCase, já existente)
- [x] Frontend: useSimulators dinâmico (useQuery), SimulatorsView com destaque/grade/estados (loading/erro/vazio), SimulatorCard baseado em post (capa + Acessar/Ler matéria)
- [x] Form: campo "Link externo" (hint explicativo) + PostFormValues/toPostFormValues
- [x] E2E: post simulator + externalUrl → publicado → GET /api/posts/simulators retorna com externalUrl

## Handoff (task 31)
- **Feito:** página de Simuladores 100% dinâmica — simuladores são posts da categoria `simulator` (editorial, como no domain-model). Destaque = mais recente; grade = demais. Botão "Acessar" só aparece quando externalUrl preenchido.
- **Decisões:** externalUrl como campo opcional do Post (não módulo novo); fallback de capa com gradiente; content estático antigo removido (use-simulators agora é ViewModel de query).
- **Pendências:** posts de simulador precisam ser criados/editados pelo editorial no /admin/posts (categoria Simuladores).

## Fase 8 — Rotas Fastify no `apps/api` (task 38-backend-content-routes)
- [x] `apps/api/src/routes/content.ts` — porte de `apps/web/src/app/api/posts/**` (públicas + admin + simuladores)
- [x] `apps/api/src/routes/settings.ts` — porte de `apps/web/src/app/api/settings/site-gate` (administrator)
- [x] Reuso de `@digimon/content` (use cases/schemas/`PrismaPostRepository`) + `@digimon/database` + `eventBus`/plugins de auth do `apps/api` — nenhuma regra de domínio duplicada
- [x] Contratos JSON e workflow editorial idênticos (draft → review → published → archived); erros via `AppError` (handler global)
- [x] Typecheck + lint + build `@digimon/app-api` ok; smoke `app.inject` (público + workflow editorial + guards 401/403)
- [x] Strangler: `apps/web/**` intocado (web segue funcionando)

## Handoff (task 38)
- **Feito:** portados os handlers de conteúdo para `apps/api/src/routes/content.ts` (10 rotas: `GET /posts`, `GET /posts/simulators`, `GET /posts/:slug`, `POST/GET /posts/admin`, `GET/PATCH /posts/admin/:id`, `POST /posts/admin/:id/{submit,publish,archive}`) e os de site-gate para `apps/api/src/routes/settings.ts` (`GET/PATCH /settings/site-gate`). Composição local no plugin com `PrismaPostRepository(prisma)` + `eventBus` do container; use cases e schemas vêm do barrel `@digimon/content`. Helpers que no web viviam em `_lib/` (serialize/authors/session/handlers) foram embutidos no `content.ts` (o escopo da task só permite este arquivo), replicando a serialização (`Dates → ISO`, listagem sem body) e a resolução de `authorName` por lote.
- **Arquivos:** `apps/api/src/routes/content.ts`, `apps/api/src/routes/settings.ts`, `context/modules/content/status.md`.
- **Rotas/status:** públicas 200 (`/posts`, `/posts/simulators`, `/posts/:slug`); `POST /posts/admin` 201 `{id,slug}`; admin/editorial exige sessão + papel (401 sem sessão, 403 member); `submit` 200 review, `publish` 200 publishedAt, `archive` 200 archived; `GET/PATCH /settings/site-gate` exigem `administrator` (GET 401, PATCH 403 — paridade com o web).
- **Validações:** `pnpm turbo typecheck/lint/build --filter=@digimon/app-api` ok; smoke via `app.inject` (health 200; guards sem sessão 401/403; member 403; workflow completo draft→review→published→archived com post de teste criado e **removido** ao final); `pnpm harness check --barrel --db` ok.
- **Decisões:** (1) `content.ts`/`settings.ts` montam a composição inline (repo Prisma + `eventBus` do container) — não foi possível adicionar um `contentDeps()` ao `container.ts` (fora do escopo). (2) preHandlers `[authenticate, requireRoleHook([...])]` para rotas editoriais — `requireRoleHook` sozinho não injeta `request.auth`, então `authenticate` roda antes. (3) `settings.ts` replica a assimetria do web: GET devolve 401 (não-admin), PATCH devolve 403. (4) `ValidationError` (422) substitui os objetos de erro manuais do web no PATCH do site-gate.
- **Divergência conhecida (reportar):** JSON malformado no PATCH `/settings/site-gate` o web devolvia 422 `VALIDATION_ERROR` ("Corpo inválido"); no Fastify o parser rejeita antes do handler (400 `FST_ERR_CTP_INVALID_JSON_BODY`). Afeta só corpo sintaticamente inválido; `mode` inválido segue 422 com a mensagem idêntica.
- **Pendências:** nenhuma neste escopo. `POST /posts/admin/:id/publish` etc. reutilizam `eventBus` in-process do `apps/api` (eventos `post.*` publicados como no web).

## Fase 9 — Home sem torneios hardcoded (task 73)
- [x] `features/content/viewmodels/use-home.ts`: removidos `UPCOMING_TOURNAMENTS`, o import de `TournamentCardData` e o campo `tournaments` de `HomeData`/retorno
- [x] `features/content/views/home-view.tsx`: removida a `<section>` "Próximos torneios no Brasil", o import de `TournamentCard` e o destructuring de `tournaments`
- [x] Home mantém herói, categorias, últimas notícias e CTA — sem dados falsos de torneios
- [x] `pnpm turbo typecheck lint build --filter=@digimon/app-web` ✅ (0 erros, 0 warnings)

## Handoff (task 73)
- **Feito:** a Home do portal deixou de exibir a seção estática "Próximos torneios no Brasil". O `useHome` não expõe mais `tournaments` e a `HomeView` não importa `TournamentCard`.
- **Arquivos:** `apps/web/src/features/content/viewmodels/use-home.ts`, `apps/web/src/features/content/views/home-view.tsx`.
- **Decisões:** apenas remoção — a Home não foi conectada à API de torneios nesta task (escopo mínimo; evita inventar dados).
- **Fora do escopo:** nenhum. `TournamentCard` (components) segue usado pela página `/torneios`; `apps/api/**` e `packages/**` intocados.

## Fase 10 — Home: esconder CTA da comunidade quando logado (task 100)
- [x] `features/content/views/home-view.tsx` consome `useSession()` (`@/lib/use-session`) e renderiza `<CommunityCta />` só quando `!sessionLoading && !user`
- [x] Sem alteração no `CommunityCta`/`useHome` nem no restante da Home; MVVM estrito (View só decide renderizar)
- [x] `pnpm turbo typecheck lint --filter=@digimon/app-web` ✅ (2/2; 0 erros, 0 warnings; `next build` **não** executado)

## Handoff (task 100)
- **Feito:** a área "Junte-se à comunidade" da Home (feature content) some para usuário logado. A `HomeView` usa o ViewModel compartilhado `useSession` e passa a renderizar o CTA **apenas deslogado**; enquanto `loading`, o CTA não aparece (sem flash). O componente `CommunityCta` e o ViewModel `useHome` não mudaram.
- **Arquivos:** `apps/web/src/features/content/views/home-view.tsx` (código) + `context/modules/{web,content}/status.md`.
- **Decisões:** guard `!sessionLoading && !user`; reuso do `useSession` compartilhado (task 59) — sem fetch na View.
- **Validação:** `pnpm turbo typecheck lint --filter=@digimon/app-web` — 2/2 ✅ (0 erros, 0 warnings); `next build` **não** executado (instrução da task).
- **Fora do escopo:** nenhum.
