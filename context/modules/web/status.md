# @digimon/app-web — Status

## Fase 1 — Design system + layout base (task 09-frontend-design-system)
- [x] Tokens Digimon no `globals.css` via `@theme` (Tailwind v4): cores, atributos, fontes + aliases shadcn
- [x] Fontes Sora (display) + Inter (body) via `next/font` no `layout.tsx`
- [x] Primitives: `Button` (primary/ghost/dark), `Tag`, `StatusBadge`, `ColorChip`, `Avatar`, `Card`, `MetricCard`, `ColorStrip`
- [x] Cards compostos: `PostCard`, `CardTile`, `DeckCard`, `TournamentCard`, `CommentRow`
- [x] Chrome público: `SiteHeader` (desktop + mobile), `SiteFooter`, `SiteChrome` (oculta header/footer em `/admin`)
- [x] Admin: `AdminSidebar` (desktop) + `AdminNav` (mobile, chips)
- [x] Ícones inline em `components/icons.tsx` (estilo Lucide) — `lucide-react` não instalado
- [x] Barrel exports: `components/index.ts`, `components/ui/index.ts`, `components/admin/index.ts`
- [x] Typecheck: `pnpm turbo typecheck --filter=@digimon/app-web` — ok
- [x] Lint: `pnpm turbo lint --filter=@digimon/app-web` — 0 erros (3 warnings pré-existentes em features/)

## Fase 2 — Páginas de auth (task 11-frontend-auth-pages)
- [x] `(auth)/layout.tsx` passthrough (root `SiteChrome` já renderiza SiteHeader/SiteFooter fora de `/admin`)
- [x] 4 páginas: `/login`, `/registro`, `/esqueci-senha`, `/reset-senha` (com `metadata`)
- [x] Views reescritas fiéis ao `dcg.pen`: card 420px + painel "Por que criar uma conta?" (desktop) / card full-width (mobile)
- [x] Componentes de View: `AuthShell` (grid 2 colunas), `AuthHeader`, `AuthDivider`, `AuthField` (erro inline + borda danger), `AuthFormError`, `AuthBenefits`
- [x] Estados: loading no submit, erro inline, sucesso (user/sent/done) — ViewModels preservados
- [x] `use-reset-password-view-model`: campo `confirmPassword` (aditivo) para "nova senha + confirmação"
- [x] Barrels: `features/auth/views/index.ts`, `features/auth/viewmodel/index.ts`
- [x] Lint: `pnpm turbo lint --filter=@digimon/app-web` — 0 erros (6 warnings pré-existentes fora da auth)
- [ ] Typecheck: `pnpm turbo typecheck --filter=@digimon/app-web` — **bloqueado por erro fora do escopo** em `features/content/viewmodels/post-view.ts` (task 10 concorrente); arquivos da auth compilam sem erros

## Fase 2 — Páginas públicas (task 10-frontend-paginas-publicas)
- [x] `app/(public)/layout.tsx` passthrough (o chrome continua no root via `SiteChrome` — sem duplicar header/footer)
- [x] Rotas públicas consumindo os componentes da Fase 1: Home, Notícias, Artigo (`[slug]`), Simuladores
- [x] Sem alterações em `components/**` (task 09) — apenas consumo do barrel `@/components`
- [x] Typecheck + Lint `@digimon/app-web` ok

## Fase 2 — Perfil (Member) + Painel Admin (task 12-frontend-perfil-admin)
- [x] Feature `admin` (MVVM): `model/{types,admin-api,demo-data,session}`, `viewmodels/{dashboard,comments,moderation}`, `views/{shell,page-header,metrics,table,badge,moderation-queue,dashboard,comments}` + barrel
- [x] `AdminTable` responsiva (tabela no desktop, cards no mobile), `AdminMetrics`, `ModerationQueue` e badges de papel/status/post/comentário — reaproveitam `StatusBadge`/`MetricCard`/`Avatar`/`Button`/`Card` (task 09)
- [x] `(member)/layout.tsx` + `(member)/perfil/page.tsx`: cabeçalho (avatar, nome, badge de papel, membro desde), métricas (posts/decks/torneios/comentários), abas e lista de decks; edição inline reusa `useProfileViewModel`
- [x] `admin/layout.tsx` (server): exige sessão administrator/editor (redirect) e monta `AdminShell` (AdminSidebar desktop / AdminNav mobile)
- [x] `admin/page.tsx` (Painel: métricas reais de posts + tabela editorial + moderação), `admin/usuarios/page.tsx` (administrator-only; tabela + trocar papel/status), `admin/comentarios/page.tsx` (moderação)
- [x] Typecheck `pnpm turbo typecheck --filter=@digimon/app-web` — ok
- [x] Lint `pnpm turbo lint --filter=@digimon/app-web` — 0 erros (2 warnings pré-existentes em auth-api/users-api)

## Fase 3 — Assets do design (task 14-frontend-assets-logo-hero)
- [x] Assets copiados para `apps/web/public/`: `dcg-logo.png` (1280×364) e `hero-banner.png` (1376×768)
- [x] `SiteHeader` com a logo (`next/image`, `priority`) + "Brasil" no lugar do texto "DigiTCG Brasil" — fiel ao design (LogoBox 140×36 + Brand)
- [x] `SiteFooter` com a logo (`next/image`) acima do wordmark "DigiTCG Brasil" — fiel ao design (FooterLogoImg 150×38)
- [x] `Hero` da Home com `hero-banner.png` (`next/image fill`, `object-cover`) + `HeroScrim` (`linear-gradient(-90deg,#0C0C0E…E6…00)`) e `lg:min-h-[440px]` — fiel ao design
- [x] `components/icons.tsx` migrado para re-export do `lucide-react` (nomes históricos preservados) + `Gamepad2`, `Globe`, `Swords`, `Dice5`; `IconProps` agora é alias de `LucideProps`
- [x] Alt text descritivo nas imagens (`"Digimon Card Game"` / `"Arte do Digimon Card Game"`)
- [x] Typecheck `pnpm turbo typecheck --filter=@digimon/app-web` — ok
- [x] Lint `pnpm turbo lint --filter=@digimon/app-web` — 0 erros (2 warnings pré-existentes em auth-api/users-api)
- [x] Build `pnpm turbo build --filter=@digimon/app-web` — ok (24 rotas)

## Fase 4 — Cartas, Decks e Torneios (task 13-frontend-cards-decks-torneios)
- [x] `(public)/cartas` — Card Database (busca full-text + filtros cor/tipo + grid 2-col mobile/4-col desktop + paginação) — `useCardList`
- [x] `(public)/cartas/[id]` — Ficha da Carta (carta grande, stats grid, efeito, set, digievolução) — `useCard` + `generateMetadata` SSR
- [x] `(public)/decks` — Decks da comunidade (grid DeckCard + copiar + "+ Novo deck")
- [x] `(member)/decks/novo` — Criar deck (busca de cartas do catálogo + deck list + salvar/publicar)
- [x] `(public)/torneios` — Torneios (filtros status + lista TournamentCard + "+ Publicar torneio")
- [x] `(member)/torneios/novo` — Criar torneio (form + publicar direto)
- [x] `admin/cartas` — Admin Cartas (catálogo + filtros + paginação + importação JSON; editor vê, só admin importa)
- [x] `admin/torneios` — Admin Torneios (agenda completa + filtro status + cancelar)
- [x] Features cards/decks/tournaments mantidas MVVM estrito (View só JSX; ViewModels orquestram; Model sem hooks/JSX)
- [x] Responsivo: grids 2 colunas mobile / multi desktop (mobile.html)
- [x] SEO nas páginas públicas (metadata + canonical + openGraph)
- [x] Typecheck `pnpm turbo typecheck --filter=@digimon/app-web` — ok
- [x] Lint `pnpm turbo lint --filter=@digimon/app-web` — 0 erros (2 warnings pré-existentes auth-api/users-api)
- [x] Build `pnpm turbo build --filter=@digimon/app-web` — ok (rotas novas no build)

## Fase 5 — Pendências admin (task 15-frontend-pendencias-admin)
- [x] Sidebar do painel com **Cartas** (`/admin/cartas`, `Layers`), **Torneios** (`/admin/torneios`, `Trophy`) e **Decks** (`/admin/decks`, `Copy`) no `NAV_ITEMS` do `AdminShell`; Usuários segue oculto para editor (filtro existente)
- [x] `admin/decks` — gestão de decks: listagem da comunidade (busca + paginação) + exclusão **só de autoria própria** (API owner-only) — `AdminDecksView`/`useAdminDecks`/`adminDecksApi`
- [x] Warnings `max-len` removidos em `features/auth/model/auth-api.ts` e `features/users/model/users-api.ts` (cast tipado quebrado em 3 linhas)
- [x] Barrel `features/admin/index.ts` atualizado (`adminDecksApi` + `AdminDecksView`)
- [x] Typecheck + Lint (0 erros, **0 warnings**) + Build `@digimon/app-web` ok (rota `/admin/decks` no build)

## Fase 6 — Rota admin de decks (task 16-rota-admin-decks)
- [x] `GET /api/admin/decks` — agenda COMPLETA (rascunhos + published + unlisted) para administrator|editor, filtros search/status/format + paginação (reusa `ListDecksUseCase`)
- [x] `DELETE /api/admin/decks/:slug` — exclusão de QUALQUER deck (override de dono validado no DOMÍNIO), administrator-only na rota (reusa `DeleteDeckUseCase`)
- [x] Feature admin `adminDecksApi`/`useAdminDecks`/`AdminDecksView` migradas para as rotas admin (sem fallback por autoria) + filtro de status + badge Unlisted + botão Excluir só para administrator
- [x] Typecheck: ✅ `pnpm turbo typecheck` (11 pacotes) | Lint: ✅ (11 pacotes) | Testes: ✅ (26 no @digimon/decks)

## Fase 7 — Páginas admin de posts (task 17-frontend-admin-posts)
- [x] `/admin/posts` — listagem editorial (`AdminPostsView` + `useAdminPosts`) com filtro de status (Todos/Rascunhos/Em revisão/Publicados/Arquivados), paginação e ações com confirmação (enviar p/ revisão, publicar, arquivar) + botão "+ Novo post"
- [x] `/admin/posts/novo` — cria rascunho (`PostForm` + `usePostForm`); salvar → volta para a listagem
- [x] `/admin/posts/[id]` — edita post publicado (resolve id→slug na listagem editorial e carrega o conteúdo por `GET /api/posts/[slug]`) + painel de workflow (submit/publish/archive com confirmação)
- [x] Sidebar do `AdminShell` com **Posts** (`/admin/posts`, ícone `FileText`), logo após "Visão geral" (design desktop.html); Usuários segue oculto para editor
- [x] `PostForm` ajustado ao design system: cantos retos, tokens `surface-2`/`border`/`danger`, `Button`, grid 2 colunas no desktop / 1 no mobile
- [x] MVVM estrito mantido: Views só JSX (ViewModels orquestram); `use-admin-posts.ts` (ViewModel) resolve post por id na listagem; `use-post-form.ts` intocado
- [x] Metadata das páginas admin: `robots: { index: false }`
- [x] Typecheck `pnpm turbo typecheck --filter=@digimon/app-web` — ok
- [x] Lint `pnpm turbo lint --filter=@digimon/app-web` — 0 erros, 0 warnings
- [x] Build `pnpm turbo build --filter=@digimon/app-web` — ok (rotas `/admin/posts`, `/admin/posts/[id]`, `/admin/posts/novo`)
- [x] Smoke test: `/admin/posts`, `/admin/posts/novo`, `/admin/posts/[id]` → 307 `/login` sem sessão

## Pendências
- [x] ~~**Gap de API (bloqueia edição de rascunhos):**~~ **RESOLVIDO (tasks 18+19)** — `GET /api/posts/admin/[id]` criado (task 18, retorna qualquer status p/ admin|editor com `requireEditorialUser`); `useAdminPostForm` agora carrega por id (task 19). Teste E2E: draft criado → GET admin por id → 200 com body; sem sessão → 401.
- [x] ~~**Endpoint global de listagem de comentários:**~~ **RESOLVIDO (task 20)** — `GET /api/comments/admin` (admin|editor) com autor; feature conectada (task 21).
- [x] ~~**Nome do autor nos posts editoriais:**~~ **RESOLVIDO (task 20)** — `authorName` no `serializePost`/`serializePostSummary` + `resolveAuthorNames` (batch Prisma) nos handlers admin; `EditorialPostSummary` ganhou `authorName?` no model.
- [x] ~~**Barrel `features/admin/index.ts` sem os novos exports:**~~ **RESOLVIDO (task 21)** — barrel completo.

## Fase 8 — Edição de rascunhos (tasks 18-backend-admin-posts-get + 19-frontend-admin-posts-get)
- [x] `GET /api/posts/admin/[id]` — post por id, qualquer status (draft/review/published/archived) para admin|editor (`requireEditorialUser` + `getPostById` via barrel de `@digimon/content`; `NotFoundError` sem vazar)
- [x] `useAdminPostForm` carrega por id via `GET /api/posts/admin/[id]` (removeu o fallback id→slug + busca por slug público)
- [x] Model: `adminApi.getEditorialPost(id)` adicionado
- [x] Teste E2E: draft criado → GET admin por id → 200 com body + status draft; sem sessão → 401; member → 403; público por slug → 404
- [x] Dados de teste do banco removidos (`draft-teste-task-18`, `member18@teste.com`, posts de teste)
- [x] Typecheck + lint ok
- [x] JWT_SECRET corrigido: `apps/web/.env` criado (Next.js não lê o `.env` da raiz) — login admin funcionando (200)

## Fase 9 — Moderação de comentários + barrel (task 20 + 21)
- [x] `GET /api/comments/admin` (admin|editor) — listagem global com `authorName`, filtros status/targetType, paginação (task 20)
- [x] `authorName` nos DTOs editoriais de posts (`serializePost`/`serializePostSummary` + `resolveAuthorNames` batch) (task 20)
- [x] `useAdminCommentsViewModel` consome a API real (sem `DEMO_COMMENTS`); filtro por status + paginação (task 21)
- [x] Barrel `features/admin/index.ts` completo: `AdminPostsView`, `AdminPostFormView`, `useAdminPosts`, `useAdminPostForm`, `useAdminCommentsViewModel`, `useAdminDecks`, etc. (task 21)
- [x] Typecheck + lint + build ok

## Fase 10 — Editor WYSIWYG TipTap (task 22-frontend-editor-tiptap)
- [x] Deps: `@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-placeholder`, `@tiptap/extension-link`, `@tailwindcss/typography`
- [x] `PostEditor` (components/editor/): WYSIWYG estilo Notion — markdown shortcuts (via StarterKit), slash commands (`/` abre menu de blocos), placeholder "Escreva ou / para comandos…", toolbar (H1/H2, negrito, itálico, riscado, listas, citação, código)
- [x] `EditorToolbar` (View pura, tokens dark) + barrel components/editor
- [x] `lib/sanitize.ts`: sanitização allowlist (tags/atributos/protocolos) no SSR + fallback de posts antigos (texto puro `\n` → `<p>`)
- [x] Renderização pública com `prose prose-invert` (@tailwindcss/typography) via `dangerouslySetInnerHTML` (HTML sanitizado) em `post-article` e `post-detail`
- [x] `PostForm` usa o `PostEditor` no lugar do textarea (body salvo como HTML)
- [x] Estilos ProseMirror no globals.css (dark, cantos retos, fonte display nos headings)
- [x] Typecheck + lint + build ok
- [x] Teste E2E: post com HTML (h2/strong/ul/blockquote) → publicado → página pública renderiza formatação (200)

## Handoff
- **Task 17 (páginas admin de posts):** criadas 3 páginas em `app/admin/posts/**` (server components com `metadata` + `robots: { index: false }`) montando `AdminPostsView` (lista: filtro de status Todos/Rascunhos/Em revisão/Publicados/Arquivados + paginação + ações Enviar/Publicar/Arquivar com `window.confirm` + "+ Novo post") e `AdminPostFormView` (novo/edição: `PostForm` + `usePostForm` em grid 1 col mobile / 2 col desktop, com painel lateral "Workflow" no desktop exibindo status e ações submit/publish/archive com confirmação). ViewModels novos em `use-admin-posts.ts`: `useAdminPosts` (listagem via `GET /api/posts/admin`; "Todos" consolida os 4 statuses em paralelo pois a API exige status; mutations submit/publish/archive com invalidação) e `useAdminPostForm` (resolve id→slug na listagem editorial e carrega o conteúdo completo via `contentApi.getPost`; o body é montado na View com `key={post.id}` para o `usePostForm` inicializar os valores uma única vez). `AdminShell` ganhou o item **Posts** (`FileText`) após "Visão geral". `PostForm` restilizado para o design system (cantos retos, `surface-2`/`border`/`danger`, `Button`, grid 2 col desktop). Model: `AdminPostStatusFilter` em `admin/model/types.ts`. `use-post-form.ts` NÃO precisou de mudança (navegação usa o retorno de `handleSubmit`). Validação: typecheck + lint (0 erros, 0 warnings) + build ok + smoke test (307 → `/login` sem sessão). Nenhum arquivo de `components/**`, `features/cards|decks|tournaments|users`, `packages/**` ou rotas API foi tocado.
- **Decisões (task 17):** (1) Edição por id: como não há `GET /api/posts/admin/:id`, o ViewModel resolve o id na listagem editorial (busca nos 4 statuses, `pageSize: 100`) e usa o slug com `GET /api/posts/[slug]`. (2) Ações de workflow com `window.confirm` (sem modal no design system) — consistente com o requisito "actions com confirmação". (3) "Todos" na listagem = 4 requisições paralelas por status (a API não aceita listagem sem status — `ListPostsUseCase` assume `published`); ordenação por `updatedAt` desc. (4) Pós-salvar/pós-ação de workflow navega para `/admin/posts` (a rota de edição não carrega rascunhos — ver gap de API). (5) Views de formulário exportadas do mesmo arquivo `admin-posts-view.tsx` (escopo limita a 1 arquivo de view novo).
- **Fora do escopo (reportar):** (a) **Gap de API para edição de rascunhos** — ver Pendências (sugestão: `GET` em `/api/posts/admin/[id]` com `requireEditorialUser`, reusando `GetPostUseCase` que já suporta actor). (b) `features/admin/index.ts` (barrel) sem os novos exports — as páginas importam do caminho da view; atualizar o barrel numa task futura. (c) Autor dos posts continua como id curto (DTO sem `authorId`) — pendência pré-existente.
- **Decisões (task 16):** (1) override admin inline nos use cases (`MANAGER_ROLES` + `isManager`) porque `domain/actor.ts` está fora do escopo — ajuste mínimo conforme spec. (2) GET admin exige administrator|editor; DELETE exige administrator (spec) — editor vê a agenda mas não exclui (UI oculta; backend revalida). (3) rotas admin reutilizam os `_lib` de `api/decks` — sem duplicação de composition root (DIP).
- **Task 15 (pendências admin):** sidebar do `AdminShell` ganhou Cartas (`Layers`), Torneios (`Trophy`) e Decks (`Copy`) — ordem Visão geral → Cartas → Torneios → Decks → Comentários → Usuários, com Usuários continuando oculto para editor. `admin/decks` criada seguindo o padrão de `admin/torneios` (task 13): `AdminDecksView` (View só JSX) + `useAdminDecks` (ViewModel: listagem paginada com busca, id do usuário atual via `usersApi.getProfile()`, mutation de exclusão com invalidação) + `adminDecksApi` (Model: `GET /api/decks` + `DELETE /api/decks/:slug`, reutiliza `DeckSummary`/`Paginated`/`STATUS_LABELS` de `features/decks`). Warnings `max-len` removidos em `auth-api.ts`/`users-api.ts` (mesma linha 15 — cast tipado quebrado em 3 linhas). Barrel `features/admin/index.ts` exporta `adminDecksApi` + `AdminDecksView`. Validação: typecheck + lint (0 erros, **0 warnings**) + build ok (rota `/admin/decks`).
- **Decisões (task 15):** (1) Como **não existia rota admin de decks** (`GET /api/decks` só devolve published+isPublic; `DELETE /:slug`/`POST /:slug/publish` eram owner-only via `requireOwner`), a página usava a API pública + `ownerId` (fallback da task) — sem filtro de status (a API o ignora em listagem não-mine). (2) Exclusão aparecia **apenas** em decks com `ownerId === usuário atual` (gate de UI; backend revalida) — evitando 403 em massa na tela. (3) Busca reusa o padrão do form de `admin/cartas` (input + submit → `setSearch` que reseta a página). *(Nota: esse fallback por autoria foi substituído pelas rotas admin na task 16.)*
- **Fora do escopo (reportar):** rota admin de decks (ex.: `GET /api/admin/decks` + override de dono) seria necessária para "agenda completa" (rascunhos/privados, filtro de status real) e para Admin/Editor excluir decks de terceiros — registrada nas Pendências. Nenhum arquivo de `components/**` nem de `features/cards|decks|tournaments` foi tocado.
- **Task 13 (cartas + decks + torneios):** 8 páginas criadas consumindo as features MVVM existentes (sem tocar em `components/**` nem `features/admin/**`). Públicas com SEO (`metadata` + `canonical` + `openGraph`; ficha da carta com `generateMetadata` SSR via `fetch` à API, padrão de `noticias/[slug]`); member com `robots: index:false`; admin protegido pelo `admin/layout.tsx` (sessão) com `admin/cartas` restringindo importação a administrator e `admin/torneios` exigindo Admin/Editor (backend revalida). Features evoluídas dentro do escopo: cards (paginação no `useCardList`, `CardsGrid` com link+ficha+páginação, `card-detail-view` fiel ao design, `useAdminCards`+`AdminCardsView`+`importCards` no model), decks (`DecksListView` grid com copiar no card + `headerAction`, `DeckFormView` com busca de cartas reusando `useCardList`), tournaments (`TournamentsListView` com filtros sempre visíveis + `headerAction`, `useAdminTournaments`+`AdminTournamentsView`). Barrels de views/viewmodels atualizados. Validação: typecheck + lint (0 erros) + build ok (rotas `/cartas`, `/cartas/[id]`, `/decks`, `/decks/novo`, `/torneios`, `/torneios/novo`, `/admin/cartas`, `/admin/torneios`).
- **Decisões (task 13):** (1) `CardTile` não ganhou `id` (components fora do escopo) — `CardsGrid` recebe `GridCard = CardTileData & { id }`. (2) "Digievolução" da ficha renderiza `evolutionConditions` (condições PARA a carta); o modelo não tem os estágios seguintes do design. (3) Botões "+ Novo deck"/"+ Publicar torneio" são `headerAction` das views (prop aditiva). (4) Páginas member usam `AuthShell`+`AuthBenefits` (features/auth, apenas consumo). (5) Filtros de status na página pública de torneios seguem o design; a API só devolve published para visitantes (filtro real para Admin/Editor/mine).
- **Fora do escopo (reportar):** adicionar `admin/cartas`/`admin/torneios` à sidebar do painel exige editar `features/admin/views/admin-shell.tsx` (fora do `## Escopo`). `admin/decks` não estava entre as 8 páginas. Ambos agendados nas Pendências.
- **Task 14 (assets do design + lucide-react):** copiados `dcg-logo.png` e `hero-banner.png` do design para `apps/web/public/` (nomes mantidos). `SiteHeader` usa a logo via `next/image` (`priority`, `h-9 w-auto`, alt "Digimon Card Game") + "Brasil" (`text-ink-soft`); `SiteFooter` usa a logo (`h-[38px] w-auto`) acima do wordmark. `Hero` da Home usa `hero-banner.png` (`next/image fill`, `object-cover`, `priority`, `sizes="100vw"`) sob o `HeroScrim` existente (`linear-gradient(-90deg,#0C0C0E 0%,#0C0C0EE6 45%,#0C0C0E00 100%)`) com `lg:min-h-[440px]`, fiel ao frame "Home — Portal". `components/icons.tsx` agora re-exporta do `lucide-react` mantendo todos os nomes históricos (Search/Menu/X/ArrowRight/MapPin/Copy/Layers/LayoutDashboard/FileText/MessageSquare/Users/Trophy/Sparkles) e adiciona `Gamepad2`/`Globe`/`Swords`/`Dice5`; `IconProps` virou alias de `LucideProps` e `LucideIcon` foi exportado. `components/index.ts` (`export * from './icons'`) e `package.json` não precisaram mudar (lucide-react já instalado). Validação: typecheck + lint (0 erros) + build ok.
- **Decisões (task 14):** (1) O `Hero` passou a usar o banner fixo do design como fundo (antes: `post.coverImage` ou gradiente) — `FeaturedPostView.coverImage` permanece no contrato do ViewModel, apenas não é mais consumido pelo Hero. (2) Alt do banner é descritivo ("Arte do Digimon Card Game") por requisito explícito da task, embora seja um fundo decorativo atrás do texto. (3) `next/image` com dimensões intrínsecas 1280×364 e `w-auto`/altura por utilitário para preservar a proporção real da logo.
- **Fora do escopo (não tocado, reportar):** reverter o mapeamento temporário dos ícones do design em `features/content/views/simulator-card.tsx` e `features/content/viewmodels/use-simulators.ts` (gamepad-2/globe/swords/dice-5 → sparkles/layers/trophy/dashboard) exige editar arquivos fora do `## Escopo` da task 14. Os ícones já estão disponíveis em `components/icons.tsx`; agendar task/adição de escopo para o revert.
- **Task 12 (perfil + admin):** feature `admin` MVVM completa e reaproveitável (Model sem JSX/hooks; ViewModels orquestram; Views só JSX). `(member)/layout.tsx` é passthrough (o chrome continua no root via `SiteChrome` — sem duplicar header/footer); `/perfil` reusa `useProfileViewModel` (edição inline) e `useAdminUsersViewModel`. `/admin` tem layout próprio (server) que valida a sessão (`getAdminSession` sobre `verifyJwt`+`authDeps`) e monta `AdminShell` (`AdminSidebar` desktop / `AdminNav` chips mobile). Rotas: `/admin` (Painel), `/admin/usuarios` (administrator-only), `/admin/comentarios`. Ações reais: `contentApi.publish/archive` (posts) e `PATCH /api/users/:id/{role,status}`; a sidebar só lista rotas existentes (sem 404). A moderação de comentários usa amostra do Model (não há endpoint global de listagem) e já chama `/api/comments/:id/moderate`.
- **Task 10 (páginas públicas):** o `(public)/layout.tsx` ficou passthrough (fonte única do chrome é o `SiteChrome` do root — evita header/footer duplicados). As páginas consomem `@/components` sem recriar nada. Nenhum arquivo de `components/**` foi alterado.
- **Feito:** design system completo do `dcg.pen` em `apps/web/src/components/**` + tokens em `globals.css` + `layout.tsx` com fontes e `SiteChrome`. Views puras (sem hooks de dados), dark-only, mobile-first.
- **Fase 2 (task 11):** 4 páginas de auth (`/login`, `/registro`, `/esqueci-senha`, `/reset-senha`) montando as Views existentes, reescritas fiéis ao design (desktop 2 colunas + painel de benefícios; mobile card full-width). Novos componentes de View em `features/auth/views/` (`AuthShell`, `AuthHeader`, `AuthDivider`, `AuthField`, `AuthFormError`, `AuthBenefits`) + barrels de `views`/`viewmodel`. Reuso do design system (`Button`, `buttonVariants`, `Card`, `cn`).
- **Decisões:** (1) `(auth)/layout.tsx` é passthrough — header/footer vêm do `SiteChrome` no root (evita duplicação, alinhado à pendência da task 09). (2) Erro dos ViewModels é form-level: exibido como `AuthFormError` (login/register/reset) e como erro do campo único em `forgot` (borda `danger` + mensagem). (3) `use-reset-password-view-model` ganhou `confirmPassword`/`updateConfirmPassword` (aditivo, sem alterar `model/types.ts`) para o requisito "nova senha + confirmação". (4) Painel lateral usa `bg-bg` (não há token exato para `#0E0E11`); inputs usam `bg-surface-2`. (5) No registro, o divider não repete o texto "novo por aqui?" do export desktop (incoerente com "Já tenho conta"; o mobile não tem texto). (6) `Check` inline em `auth-benefits.tsx` porque `components/icons.tsx` (task 09) não tem esse ícone e está fora do escopo.
- **Pendências:** instalar `lucide-react`; reconciliar com o `(public)/layout.tsx` da task 10; corrigir `exactOptionalPropertyTypes` em `features/content/viewmodels/post-view.ts` (task 10) para o typecheck do app voltar a passar.
- **Nota:** artefatos `apps/web/.next/**` aparecem como untracked porque o `.gitignore` não ignora `.next/` — o dev server os regenera; não são fonte e não foram tocados.

## Fase 11 — Indicador de sessão no header (task 23) + Fix editor (task 24)
- [x] `GET /api/auth/me`: sessão atual (id, role, name, email) ou null — valida access token httpOnly + GetProfileUseCase
- [x] `useSession` (ViewModel client, cache de módulo): user/loading/refresh; evita fetch duplicado desktop+mobile
- [x] `UserMenu` (View): avatar dropdown desktop (nome, papel, Painel admin p/ administrator/editor, Meu perfil, Sair) + variante mobile no menu hambúrguer; fecha com Esc/clique fora; logout via POST /api/auth/logout
- [x] `SiteHeader` usa UserMenu (deslogado mantém Entrar/Criar conta)
- [x] Fix editor TipTap: deps do useEditor → [extensions] (parava de recriar o editor a cada tecla = perda de foco); sync externo via effect com guarda getHTML; shouldRerenderOnTransaction para toolbar refletir estado ativo; SlashMenu ancorado no cursor (coordsAtPos) em vez de top-full
- [x] Typecheck + lint + build ok (42 páginas estáticas mantidas — sessão lida client-side)

## Handoff

## Fase 12 — Logout no painel admin (task 25)
- [x] `LogoutButton` (client): POST /api/auth/logout → redirect /login + router.refresh
- [x] Sidebar desktop: item "Sair" no rodapé (abaixo do usuário, com divisor)
- [x] Header mobile: ícone de logout (aria-label "Sair do painel")
- [x] Typecheck + lint + build ok

## Handoff (task 25)
- **Feito:** painel admin com logout visível em desktop e mobile.
- **Decisões:** redireciona para /login (contexto de painel) em vez de /; reusa a rota de logout existente.

## Fase 13 — README do projeto (task 26)
- [x] README reescrito focado no produto: visão, funcionalidades, papéis, stack real, estrutura do monorepo, como rodar local, scripts e docs
- [x] Removida referência a stack antiga (Fastify/Redis/TanStack Query)
- [x] `.env.example` criados (raiz e apps/web) referenciados pelo README

## Handoff (task 26)
- **Feito:** README orientado ao projeto; instruções de execução reais e validáveis; caminhos de contexto corrigidos (context/project/*).
- **Decisões:** documentação do produto em primeiro plano; harness vira seção secundária; .env.example documentam DATABASE_URL/SHADOW_DATABASE_URL (raiz) e JWT_SECRET/DATABASE_URL (apps/web — Next.js não lê .env da raiz).
