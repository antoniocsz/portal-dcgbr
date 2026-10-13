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

## Fase 14 — Dockerfile do web (task 27)
- [x] `apps/web/Dockerfile` multi-stage (deps → build → runtime) baseado na referência @diasbellazzi, adaptado p/ workspace deps @digimon/* (todos os manifests no deps stage)
- [x] `output: 'standalone'` no next.config.ts
- [x] `.dockerignore` (node_modules/.next/.git/.harness/context/.env)
- [x] ADR-006 registrado
- [x] Validação real: `docker build` OK; container rodou (home/noticias 200, /api/auth/me null, /admin 307 → /login, login com JWT contra o banco do host)

## Handoff (task 27)
- **Feito:** imagem Docker pronta para Coolify. Prisma 7 com driver adapter (sem engine binário); client commitado (sem generate no build); páginas públicas estáticas (build sem banco); env runtime: DATABASE_URL, JWT_SECRET, PORT.
- **Decisões:** migrations fora da imagem (db:deploy no pre-deploy/manual); sem NEXT_PUBLIC_* (Route Handlers same-origin); Alpine com allowBuilds para sharp/esbuild/prisma.

## Fase 15 — Porta configurável (task 28)
- [x] Dockerfile: `ARG PORT=3000` → `ENV PORT=$PORT` + `EXPOSE $PORT` no runtime stage
- [x] Validação: `--build-arg PORT=8080` → imagem expõe 8080/tcp; runtime `PORT=3000` sobrescreve (container escutou em 3000, HTTP 200)
- [x] ADR-006 atualizado (porta via ARG/ENV, sem rebuild)

## Handoff (task 28)
- **Feito:** porta configurável no build (ARG) e no runtime (env Coolify). O server.js do standalone já lia process.env.PORT — agora o Dockerfile permite o default e o EXPOSE acompanharem o ARG.

## Fase 16 — Guia de deploy Coolify (task 29)
- [x] `context/project/deploy.md`: runbook completo (Postgres → app Dockerfile → envs → deploy → migrations/seed fora da imagem → domínio/SSL → health check → verificação → atualizações → troubleshooting)
- [x] README linka o guia

## Handoff (task 29)
- **Feito:** guia executável com a arquitetura real (Dockerfile standalone, ADR-006). Migrations/seed documentados como passo manual (imagem não tem pnpm/prisma).
- **Decisões:** health check usa `/` (sem rota /api/health ainda); automação CI fica como passo futuro.

## Fase 17 — Nome do autor nos comentários (task 30)
- [x] CommentDTO com authorName; comment-item renderiza o nome
- [x] E2E validado (listagem pública com authorName)

## Handoff (task 30)
- **Feito:** UUID substituído pelo nome do autor nos comentários públicos.

## Fase 18 — Simuladores dinâmicos (task 31)
- [x] Página /simuladores dinâmica (posts categoria simulator) + campo externalUrl no form
- [x] E2E: API + página 200

## Handoff (task 31)
- **Feito:** página de Simuladores lê do banco; editorial cria posts com link externo.

## Fase 19 — Página "Em breve" configurável (task 32)
- [x] Model `SiteSetting` (key/value) no banco + migration 20261003_site_settings
- [x] `lib/server/site-gate.ts`: getSiteGate/setSiteGate com cache in-process (globalThis + TTL 10s); falha de banco → live (site não cai)
- [x] `proxy.ts` (Next 16, node): allowlist /admin,/api,/login,/registro,/em-breve; resto redireciona para /em-breve no modo coming-soon
- [x] Página /em-breve (noindex, sem chrome)
- [x] GET/PATCH /api/settings/site-gate (somente administrator via requireRole)
- [x] /admin/configuracoes: seletor Site no ar / Em breve + salvar + feedback
- [x] Nav admin: item "Configurações" (somente admin)
- [x] E2E: live→200; coming-soon→/ e /noticias 307→/em-breve, /admin→307→/login, /login 200, /em-breve 200 noindex; live→200

## Handoff (task 32)
- **Feito:** modo "em breve" acionável do painel com efeito imediato (cache limpo no PATCH).
- **Decisões:** proxy.ts (convenção do Next 16 — substitui middleware.ts; runtime Node sempre, sem segment config); gate cache in-process por instância com TTL (single instance no Coolify v1); default `live` se o banco cair.
- **Pendências/atenção:** Turbopack no Windows deu panic transitório de CSS (0xc0000142) após restart — resolveu com `rm -rf apps/web/.next`. Se ocorrer, limpar o cache.

## Fase 20 — Arquitetura: separação backend/frontend (task 33)
- [x] ADR-007 criado: backend separado (`apps/api` Fastify) + `apps/web` frontend puro; API no subdomínio `api.digimoncardgamebrasil.com.br`; auth via CORS + cookies `Domain` (httpOnly/Secure/Lax); `@digimon/api-client` vira o cliente único
- [x] migrate/seed no entrypoint da API (`migrate deploy` + seed `--only-if-empty`); imagem do web sem banco
- [x] Estratégia strangler; web mantém fetch client-side
- [x] `stack.md` + `overview.md` alinhados
- [x] Plano de migração em 7 fases documentado no ADR (tasks a criar após aceite)

## Handoff (task 33)
- **Feito:** decisão arquitetural registrada (ADR-007) — reverte parcialmente o ADR-001 (backend integrado) e ajusta o ADR-006 (web sem banco). Nenhum código de aplicação tocado.
- **Decisões:** Opção A (API pública em subdomínio) por escolha do dono; Fastify; migração strangler; web client-side; runtime Node completo na API p/ entrypoint migrate/seed.
- **Pendências:** criar as tasks da migração (fases 1–7) na queue.

## Fase 21 — Web consome a API separada via `@digimon/api-client` (task 45)
- [x] `apps/web/src/lib/api-base.ts`: resolve o `baseUrl` (browser → `NEXT_PUBLIC_API_URL` com fallback dev `http://localhost:3001`; SSR → `API_INTERNAL_URL` com default `http://api:3001`), normaliza a barra final e expõe a instância compartilhada `apiClient` (`createApiClient` com `credentials: 'include'`)
- [x] Camada **Model** das 10 features migrada para o `apiClient` (sem `/api` relativo): content, auth, users, comments, cards, decks, tournaments, admin (admin-api + admin-decks-api + site-gate-api)
- [x] Paths ajustados (`/api/posts`→`/posts`, `/api/auth`→`/auth`, `/api/users`→`/users`, `/api/comments`→`/comments`, `/api/cards`→`/cards`, `/api/decks`→`/decks`, `/api/tournaments`→`/tournaments`, `/api/admin/decks`→`/admin/decks`, `/api/settings/site-gate`→`/settings/site-gate`), preservando as assinaturas públicas dos objetos `*Api`
- [x] `ApiError` (message/status/code) agora vem de `@digimon/api-client`; reexportado dos models que o expunham (content/cards/decks/tournaments/admin-decks) — ViewModels usam `error instanceof Error ? error.message`
- [x] `cache: 'no-store'` preservado (via `apiClient.request`) em comments (listagem) e site-gate (GET)
- [x] Dep: `@digimon/api-client@workspace:*` em `apps/web/package.json` (+ `pnpm-lock.yaml`)
- [x] **strangler:** `apps/web/src/app/api/**` e `apps/web/src/lib/server/**` intactos (cutover = task 53)
- [x] typecheck + lint + build `@digimon/app-web` ok; `pnpm harness check --barrel --db` ok
- [x] `next.config.ts` **não** precisou de `transpilePackages` (build passou sem ele)

## Handoff (task 45)
- **Feito:** o web passa a falar com a API separada (ADR-007, Opção A) pela camada Model. `api-base.ts` resolve a base URL por ambiente e cria o client único (`credentials: 'include'`).
- **Decisões:** (1) `next.config.ts` intocado — o Turbopack transpilou `@digimon/api-client` sem `transpilePackages`. (2) `ApiError` deixa de ser redefinido por feature e passa a ser reexportado de `@digimon/api-client`. (3) `get` do client não aceita init, então `cache: 'no-store'` foi preservado via `apiClient.request` apenas onde existia (comments/site-gate). (4) `pnpm install` adicionou a dep via workspace.
- **Pendências:** cutover (remover `apps/web/src/app/api/**` + `lib/server/**`) = task 53; SSR das páginas `[slug]`/`[id]` ainda faz `fetch` same-origin a `/api/**` (fora do escopo desta task).

## Fase 22 — Cutover do strangler: web sem backend próprio nem banco (task 53)
- [x] Removidos `apps/web/src/app/api/**` (63 arquivos) e `apps/web/src/lib/server/**` (4 arquivos) — o web deixa de expor `/api/**` e de fazer composition root/DB
- [x] `apps/web` **não importa mais `@digimon/database`** (grep: nenhum `from '@digimon/database'` em `apps/web/src`; as 4 ocorrências restantes são apenas comentários nos tipos de feature explicando que o pacote NÃO é importado)
- [x] `proxy.ts`: lê o site-gate via API (`GET ${apiBaseUrl}/settings/site-gate`, base interna `API_INTERNAL_URL` default `http://api:3001`); cache de módulo curto (10s); `!ok`/erro → `live`; allowlist (`/admin`, `/api`, `/login`, `/registro`, `/em-breve`) e redirect do coming-soon preservados
- [x] `apps/api/src/routes/settings.ts`: `GET /settings/site-gate` agora **público** (o proxy roda para tráfego anônimo); `PATCH` segue administrator-only (403). Decisão aprovada pelo usuário
- [x] `features/admin/model/session.ts`: sessão validada server-side via `@digimon/auth` (`JwtTokenService(process.env.JWT_SECRET)` + `verifyJwt`) lendo o cookie `access_token` (`next/headers`) — sem container/DB; + `fetchCurrentUser()` (`GET /auth/me` encaminhando o cookie)
- [x] `app/admin/layout.tsx`: gate administrator/editor pela sessão; nome do usuário via API (`GET /auth/me`)
- [x] `app/admin/configuracoes/page.tsx`: modo inicial via Model (`fetchSiteGateMode()`, API)
- [x] `(public)/noticias/[slug]` e `(public)/cartas/[id]`: SSR via base interna, preservando `next: { revalidate: 60 }` + `generateMetadata`/`notFound`
- [x] `lib/use-session.ts`: `GET /auth/me` via `apiClient` (browser, `credentials: 'include'`)
- [x] `components/admin/logout-button.tsx` e `components/user-menu.tsx`: logout via Model (`authApi.logout()`)
- [x] typecheck + lint + build `@digimon/app-web` (+ `@digimon/app-api`) ok; `pnpm harness check --barrel --db` ok

## Handoff (task 53)
- **Feito:** cutover final do strangler (ADR-007). O `apps/web` vira frontend puro: `app/api/**` e `lib/server/**` removidos, sem acesso a banco. Site-gate, sessão admin, SSR das páginas `[slug]`/`[id]` e logout passam pela API separada (`@digimon/api-client` / base interna `API_INTERNAL_URL`).
- **Decisões:** (1) `GET /settings/site-gate` público na API (aprovado) — o `proxy.ts` roda para tráfego anônimo e o modo não é sensível; `PATCH` segue administrator-only. (2) Sessão server-side sem composition root: `JwtTokenService` construído do `process.env.JWT_SECRET` dentro do Model (`session.ts`); se ausente/curto → sessão nula (não derruba a página). (3) `proxy.ts` reusa `apiBaseUrl` de `lib/api-base` (mesma resolução SSR `API_INTERNAL_URL`/default) e faz `fetch` cru com cache de módulo curto — `!ok`/erro → `live`. (4) Nome do admin via `GET /auth/me` encaminhando o header `cookie` da requisição (evita Prisma no web). (5) Logout reusa `authApi.logout()` (Model existente) em vez de recriar chamada. (6) `next.config.ts` mantém `transpilePackages` (`@digimon/auth`/`users`/`contracts` ainda usados no web).
- **Pendências/fora do escopo (reportar):** `apps/web/package.json` ainda declara `@digimon/database` (+ `@digimon/cards|comments|content|decks|tournaments|users` usados só por types/tipos espelhados) — remover a dep do web é da **task 48** (Dockerfile enxuto / package.json). Os comentários de doc em `features/*/viewmodels` e tipos ainda citam caminhos `/api/*` (apenas texto). SSR `[slug]`/`[id]` agora usa URL absoluta interna (`http://api:3001`), exigindo a API acessível pela rede do web em runtime.

## Fase 23 — Dockerfile enxuto do web (task 48)
- [x] `apps/web/package.json`: removidas `@digimon/{cards,comments,content,database,decks,tournaments}` (zero imports no `apps/web/src`). Mantidas `@digimon/{api-client,contracts,auth,users}`
- [x] `@digimon/users` **mantida** (não é dep de dados no web): é importada por tipo em `features/users/model/types.ts` (`import type { UserView } from '@digimon/users'`) — sem ela o `tsc --noEmit` quebra. Documentada no handoff
- [x] `pnpm install` reconciliou `pnpm-lock.yaml` (importer `apps/web` perdeu as 6 deps)
- [x] `apps/web/Dockerfile`: removida toda referência a banco/Prisma/migrations (`DATABASE_URL`, driver adapter, `db:deploy`). Comentário de envs atualizado p/ o frontend puro (`JWT_SECRET`, `API_INTERNAL_URL`, `NEXT_PUBLIC_API_URL` em build time, `PORT`)
- [x] `apps/web/Dockerfile` (deps): só os manifests do grafo do web (raiz + `apps/web` + `api-client`/`contracts`/`database`/`modules/{auth,users}`); `cards|comments|content|decks|tournaments` e `apps/api` saíram do install. `@digimon/database` **permanece** porque `auth`/`users` o declaram (tipos de `PrismaClient`)
- [x] `apps/web/Dockerfile` (build): `COPY --from=deps /app ./` (garante `apps/web/node_modules` no estágio de build — padrão do `apps/api/Dockerfile`)
- [x] Validação real: `docker build -f apps/web/Dockerfile .` **OK**; container sobe **sem `DATABASE_URL`** → `/` 200, `/login` 200, `/admin` 307 → `/login`, `/em-breve` 200
- [x] Imagem de runtime **sem Prisma/banco**: `find /app -iname '*prisma*' -o -iname '*database*'` vazio; `DATABASE_URL=[]`; 48.4M
- [x] Local: `pnpm turbo typecheck --filter=@digimon/app-web` OK; `pnpm turbo build --filter=@digimon/app-web` OK (standalone sem prisma/database)
- [x] `pnpm harness check --barrel --db` ok

## Handoff (task 48)
- **Feito:** `apps/web` (frontend puro) não carrega mais nada de banco. `package.json` enxugado (6 deps removidas), `pnpm-lock.yaml` reconciliado e `apps/web/Dockerfile` reescrito: deps instalam só o grafo do web, o runtime standalone não tem Prisma/`DATABASE_URL`, e o build não abre conexão com o Postgres.
- **Deps removidas:** `@digimon/database`, `@digimon/cards`, `@digimon/comments`, `@digimon/content`, `@digimon/decks`, `@digimon/tournaments`.
- **Deps mantidas (e por quê):** `@digimon/api-client` (client HTTP único, runtime), `@digimon/auth` (runtime em `features/admin/model/session.ts` — `JwtTokenService`/`verifyJwt`/`ACCESS_TOKEN_COOKIE`), `@digimon/contracts` (tipos `Role`/`PostStatus`/`CommentStatus`/`PaginatedResult`), **`@digimon/users`** (import de **tipo** `UserView` em `features/users/model/types.ts` — o build/typecheck não passa sem ela; é o único dos "tipos espelhados" que ainda é importado de fato).
- **Decisões:** (1) `@digimon/database` **permanece** no estágio de deps do Dockerfile (não é importada pelo web, mas é declarada por `@digimon/auth`/`@digimon/users`, que o build transpila via `transpilePackages` — os tipos de `PrismaClient` precisam resolver no typecheck do Next). Ela **não** entra no runtime (o standalone só traceia o que é importado). (2) `COPY --from=deps /app ./` no estágio de build (antes copiava só `/app/node_modules`) para garantir `apps/web/node_modules` no build — alinhado ao `apps/api/Dockerfile`. (3) `NEXT_PUBLIC_API_URL` é build-time (documentado no cabeçalho + `deploy.md`).
- **Pendência/fora do escopo (reportar):** o Dockerfile **não** declara `ARG NEXT_PUBLIC_API_URL` no estágio de build. Sem ele, a env "available at buildtime" do Coolify (instruída no `deploy.md`, task 49) não alcança o `next build` — o browser cairia no fallback `http://localhost:3001`. Não adicionei o `ARG` por estar fora do escopo desta task (que pediu **remover** a dependência de banco); recomendo uma task curta para incluir `ARG NEXT_PUBLIC_API_URL` + `ENV` no estágio de build do web.

## Fase 24 — Validação final pós-split (task 50)
- [x] Sem `fetch('/api…')` client-side residual em `apps/web/src` (tudo migrado para `@digimon/api-client`)
- [x] Sem imports de `lib/server` nem `@digimon/database` em `apps/web/src` (grep zero)
- [x] SEO preservado: `metadata`/`canonical`/`openGraph`/`generateMetadata` presentes nas páginas públicas (`/`, `/noticias`, `/noticias/[slug]`, `/cartas`, `/cartas/[id]`, `/decks`, `/torneios`, `/simuladores`)
- [x] Build de produção: **25 páginas**, **zero rotas `/api/*`**, `Proxy (Middleware)` presente
- [x] `pnpm turbo typecheck` 12/12 + `pnpm turbo lint` 12/12
- [x] `pnpm harness check --barrel --db` ok

## Handoff (task 50)
- **Feito:** validação final do portal pós-split (checagens estáticas + build de produção). Sem regressões; **nenhum arquivo de código alterado**.
- **Limitações:** smoke de runtime end-to-end (API + web + DB) não executado nesta sessão (exige a stack completa); a validação cobriu ausência de resíduos, SEO, build e typecheck/lint.
- **Pendências (fora do escopo):** (1) `ARG NEXT_PUBLIC_API_URL` no Dockerfile do web (task 48 — reportado); (2) `apps/web/.env.example` desatualizado (task 49 — reportado).

## Fase 25 — ARG NEXT_PUBLIC_API_URL no build do web (task 54)
- [x] `apps/web/Dockerfile` (estágio `build`): `ARG NEXT_PUBLIC_API_URL` + `ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL` antes do `pnpm turbo build` — recebe `--build-arg` e/ou a env "available at buildtime" do Coolify
- [x] Validação real: `docker build --build-arg NEXT_PUBLIC_API_URL=https://api.digimoncardgamebrasil.com.br -f apps/web/Dockerfile .` — OK (imagem sha256:7a03f3b6, 25 rotas, Proxy/Middleware presente)
- [x] Env efetivamente embutida no bundle client: URL presente em `/app/apps/web/.next/static/chunks/*.js` na imagem (grep na imagem)
- [x] `pnpm harness check --barrel --db` ok

## Handoff (task 54)
- **Feito:** o estágio de build do `apps/web/Dockerfile` agora declara `ARG NEXT_PUBLIC_API_URL` + `ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL` antes do `next build`. O Next inlina `NEXT_PUBLIC_*` em build time; sem o `ARG`, o `--build-arg`/env "available at buildtime" (documentada em `deploy.md`, task 49) não alcançava o build e o browser caía no fallback `http://localhost:3001` (`apps/web/src/lib/api-base.ts`). Fecha o gap reportado pelas tasks 48/50.
- **Validação:** `docker build --build-arg NEXT_PUBLIC_API_URL=https://api.digimoncardgamebrasil.com.br -f apps/web/Dockerfile .` OK; grep na imagem confirma a URL em `.next/static/chunks/*.js` (bundle client).
- **Decisões:** `ARG`/`ENV` declarados no estágio `build` (único consumidor do valor); nada no runtime (o standalone já traz o JS buildado). `ENV` espelha o `ARG` para que a env também funcione quando injetada como variável de build (Coolify), não só via `--build-arg`.
- **Pendências/fora do escopo (reportar):** se a build-arg/env estiver ausente, `ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL` resolve para string vazia e o fallback de `api-base.ts` (`?? 'http://localhost:3001'`) **não** dispara (string vazia não é nullish). Não ajustado aqui (apenas Dockerfile no escopo); sugerir tratamento em `api-base.ts` (ex.: `|| BROWSER_FALLBACK`) numa task futura se desejado.

## Fase 26 — P0: `.dockerignore` exclui `.env` em qualquer nível (task 56)
- [x] `.dockerignore`: adicionados `**/.env` e `**/.env.*` (o padrão Docker `**/` casa a raiz **e** subpastas); mantidos `.env`/`.env.*` (raiz) e as exceções `!.env.example`/`!**/.env.example`
- [x] Causa raiz confirmada: `.env`/`.env.*` **sem `**/`** cobria só a raiz → `apps/web/.env` (com `JWT_SECRET`/`DATABASE_URL` reais) entrava no contexto de build e o `next build` o replicava em `.next/standalone/apps/web/.env`, ficando na imagem publicada
- [x] Prova (contexto de build): imagem-sonda `FROM busybox` + `COPY . /ctx` → `find /ctx \( -name '.env*' -o -name '*.env' \)` = apenas os 4 `.env.example`; **nenhum `.env` real**
- [x] Prova (imagens): `docker build -f apps/web/Dockerfile .` + `docker build -f apps/api/Dockerfile .` → `docker run … find / \( -name '.env' -o -name '.env.*' \)` = **vazio** na web; na API apenas `apps/api/.env.example` (template, sem segredo — permitido de propósito)
- [x] Imagens/containers de teste removidos ao final (nenhuma publicação)
- [x] `pnpm harness check --barrel --db` ok

## Handoff (task 56)
- **Feito:** `.dockerignore` corrigido para excluir `.env`/`.env.*` em **qualquer nível**. O padrão Docker (estilo `filepath.Match` com `**`) foi validado empiricamente com uma imagem-sonda: `**/.env`/`**/.env.*` casam raiz e subpastas; `!**/.env.example` preserva os exemplos (sem segredo). As imagens web e API não contêm nenhum `.env` real (a API traz só `apps/api/.env.example`, template).
- **Segurança:** o `apps/web/.env` (com `JWT_SECRET`/`DATABASE_URL` reais) deixava de vazar para `.next/standalone/apps/web/.env` na imagem publicada. **PENDÊNCIA CRÍTICA (ação do usuário):** se alguma imagem do web já foi construída/publicada antes desta correção, **rotacionar o `JWT_SECRET`** (e quaisquer credenciais do `apps/web/.env`) — o segredo esteve embutido na imagem/camada publicada.
- **Decisões:** manter `.env`/`.env.*` (raiz) **e** `**/.env`/`**/.env.*` (belt-and-suspenders; não dependemos de o `**` casar a raiz em toda versão do Docker, embora o teste confirme que casa). `!.env.example`/`!**/.env.example` ficam após as exclusões (ordem importa no `.dockerignore`).
- **Escopo:** único arquivo tocado = `.dockerignore`. Imagens/containers de teste limpos; nada publicado.

## Fase 27 — Fix da sessão pós-login (task 59)
- [x] `lib/use-session.ts` reescrito como **store compartilhado** (`useSyncExternalStore` + listeners) com `refreshSession()` — todas as instâncias (UserMenu desktop/mobile) reagem à mesma sessão
- [x] `lib/session.ts` (NOVO, server-only): `getSession()` genérico; `features/admin/model/session.ts` delega para ele (dedupe)
- [x] Login/registro: após sucesso, `refreshSession()` + `router.push('/')` — o header mostra o UserMenu **sem F5**
- [x] Guard: `/login` e `/registro` (Server Components) redirecionam para `/` se já houver sessão
- [x] typecheck + lint + build `@digimon/app-web` ok
- [x] `pnpm harness check --barrel --db` ok

## Handoff (task 59)
- **Feito:** corrigidos os 2 bugs de sessão. (1) **header reativo** — store compartilhado + `refreshSession()` após login/registro; (2) **guard de rota** para usuário logado.
- **Decisões:** (1) store de módulo com listeners via `useSyncExternalStore` (o cache por instância não propagava entre o formulário de login e o UserMenu). (2) `getSession()` genérico em `lib/session.ts`; o admin delega. (3) após login/registro, `router.push('/')` (as telas "Login efetuado"/"Conta criada" ficam como fallback). (4) guard só em `/login` e `/registro` — `/esqueci-senha` e `/reset-senha` continuam acessíveis logado (link de e-mail).
- **Pendências:** nenhuma.

## Fase 28 — Comunidade de decks no web (task 66)
- [x] Model: `model/community-types.ts` (contrato literal) + `model/community-api.ts` (client das rotas `/decks/community*`, `/decks/legality`, `/decks/import`, `/decks/:slug/export`)
- [x] Helpers `viewmodels/deck-sections.ts`: seções (Eggs → Digimon por nível → Tamers → Options → Outros), curva de custo e cores dominantes
- [x] ViewModels: `use-community-decks` (feed + like otimista com rollback), `use-community-deck` (detalhe + metadados + copiar pra mim), `use-deck-publications` (publicar/atualizar/despublicar, `outdated`), `use-deck-import-export` (colar/serializar/baixar)
- [x] Views: `community-decks-view`, `community-deck-detail-view`, `deck-publish-modal`, `deck-import-modal`, `deck-export-modal`; `deck-form-view` evoluída (eggList + coverCardId + legalidade ao vivo + import + publicar após salvar)
- [x] Componente `DeckCard` ganhou props aditivas (href/like/contadores/legal) — retrocompatível
- [x] Páginas: `(public)/decks/comunidade` (feed) e `(public)/decks/comunidade/[id]` (detalhe); atalho "Comunidade" no `(public)/decks`
- [x] `pnpm turbo typecheck --filter=@digimon/app-web` ✅ | lint ✅ (0 erros, 0 warnings) | build ✅ (rotas `/decks/comunidade`, `/decks/comunidade/[id]`)
- [x] `pnpm harness check --barrel --db` ✅

## Handoff (task 66)
- **Feito:** frontend completo da comunidade de decks (feed, página do deck, like, publicar, import/export) consumindo as rotas reais de `apps/api/src/routes/community-decks.ts`. MVVM estrito: Model (`community-types`/`community-api`), ViewModels (`use-community-decks`/`use-community-deck`/`use-deck-publications`/`use-deck-import-export` + `deck-sections`/`deck-view`), Views (só JSX). `DeckCard` estendido com props aditivas.
- **Decisões:** (1) `exportDeckList` usa `fetch` cru na `apiBaseUrl` (o client JSON de `@digimon/api-client` não lê `text/plain`) — mantém-se na camada Model. (2) Like otimista atualiza todas as páginas do feed no cache (`applyLikeState`) com rollback em `onError` e reconciliação em `onSuccess`. (3) `PUT`/`DELETE` via `apiClient.request` (o client não expõe `put`). (4) "Copiar pra mim" = cria um rascunho próprio (`decksApi.createDeck`) a partir do snapshot congelado + `POST .../copies` para contabilizar. (5) Estado efêmero de abertura de modal fica na View (`useState`); todo fetch/mutação/validação vive nos ViewModels. (6) `generateMetadata` do detalhe busca o deck via API (`cache: 'no-store'`) para SEO sem tornar a rota estática.
- **Fora do escopo / limitações (reportar):** (a) **Exportar da comunidade é só para o dono** — a rota `GET /decks/:slug/export` exige o slug do deck de ORIGEM, que o payload da comunidade não expõe (só `id`/`ownerName`); o slug é resolvido cruzando `use-deck-publications` (sourceDeckId→slug via meus decks). Não-owners não têm como exportar sem uma rota de export da comunidade. (b) **Página de detalhe do deck próprio (`/decks/[slug]`)** continua inexistente — fora do escopo desta task; o `DecksListView` segue linkando para ela (dívida pré-existente). (c) `next-env.d.ts` é regenerado pelo `next build` (mudança `dev → types`); artefato revertido para não sair do escopo.
- **Pendências:** oferecer export da comunidade a não-owners exigiria rota nova no backend (task futura).

## Fase 29 — Admin: moderação de decks da comunidade (task 67)
- [x] Model `features/admin/model/deck-moderation-api.ts`: client das rotas admin de moderação (`reportedDecks` → `GET /admin/decks/community/reports`, `openReports` → `GET /admin/decks/community/:id/reports`, `dismissReports` → `POST .../reports/dismiss`, `moderate` → `POST .../moderation`) + tipos literais em sync (`ReportedCommunityDeck`/`CommunityDeckReport`/`CommunityModerationAction`) — sem importar `@digimon/decks`
- [x] ViewModel `use-admin-deck-moderation`: fila de reportes, seleção + reportes abertos por deck (query `enabled`), `dismiss`/`moderate` (hide/restore) com invalidação; estados loading/erro
- [x] View `AdminDeckModerationView`: tabela da fila (deck, autor, status, nº de reportes, último reporte) com ações Ocultar/Restaurar/Dispensar (confirmação `window.confirm` nas destrutivas) + painel de reportes abertos por deck; estados vazio/erro
- [x] Página `app/admin/decks/moderacao/page.tsx` (gate administrator/editor herdado de `admin/layout.tsx`) montando a View
- [x] Sidebar `AdminShell`: item **Moderação de decks** (`ShieldAlert`) após Decks; Cartas/Torneios já existiam (pendência da `context/modules/cards/status.md` resolvida na task 15)
- [x] Barrel `features/admin/index.ts`: `deckModerationApi` + tipos + `AdminDeckModerationView` + `useAdminDeckModeration`
- [x] `pnpm turbo typecheck --filter=@digimon/app-web` ✅ | lint ✅ (0 erros, 0 warnings) | build ✅ (rota `/admin/decks/moderacao` no build)
- [x] `pnpm harness finish 67` ✅

## Handoff (task 67)
- **Feito:** telas admin de moderação de decks da comunidade consumindo as rotas reais de `apps/api/src/routes/community-decks.ts`. MVVM estrito: Model (`deck-moderation-api`), ViewModel (`use-admin-deck-moderation`), View (`AdminDeckModerationView` só JSX) + página + item de sidebar + barrel.
- **Arquivos:** `apps/web/src/features/admin/model/deck-moderation-api.ts` (novo), `viewmodels/use-admin-deck-moderation.ts` (novo), `views/admin-deck-moderation-view.tsx` (novo), `views/admin-shell.tsx` (item nav), `apps/web/src/features/admin/index.ts` (barrel), `apps/web/src/app/admin/decks/moderacao/page.tsx` (novo).
- **Decisões:** (1) Tipos de moderação literais no Model do admin (sem `@digimon/decks`); `CommunityDeckStatus`/`COMMUNITY_STATUS_LABELS` reaproveitados de `@/features/decks/model/community-types` (model de feature frontend — mesmo padrão de `adminDecksApi` importando de `features/decks/model/types`). (2) `reportedDecks` mapeia `{ decks }` → array. (3) Ação destrutiva (hide) e "dispensar reportes" usam `window.confirm` (padrão da feature — sem modal no design system); restore não confirma. (4) Painel de reportes abertos é inline (abaixo da tabela) via deck selecionado — sem modal. (5) `views/index.ts`/`viewmodels/index.ts` **não existem** nesta feature (barrel único = `features/admin/index.ts`) — atualizado conforme o padrão das tasks 15/17/21.
- **Fora do escopo:** nenhum. `features/decks/**` apenas consumido por tipos/labels (não editado); `apps/api/**` e `packages/**` intocados.

## Fase 30 — Cartas: arte, filtros e importação externa (task 69)
- [x] `CardTile` mostra a arte da carta (`aspect-[5/7]`, `loading="lazy"`, `decoding="async"`) com fallback gradiente + `Sparkles` em ausência **ou** erro (`onError`); `CardTileData.imageUrl` propagado por `toCardTileData`
- [x] Ficha (`card-detail-view`) com o mesmo fallback de erro da arte
- [x] Filtros públicos: custo de jogo (0–7) + set (`use-card-sets`, oculto quando vazio); busca/tipo/cor mantidos; filtro reseta para a página 1
- [x] Admin: importação do catálogo externo (TakaOtaku) via `POST /cards/admin/import-source` (só administrator) reusando o painel de importação; JSON preservado
- [x] `pnpm turbo typecheck --filter=@digimon/app-web` ✅ | lint ✅ (0 erros, 0 warnings) | build ✅ (27 páginas; rota `/cartas` estática)

## Handoff (task 69)
- **Feito:** catálogo real (4.480 cartas com `imageUrl` oficial) agora exibe a arte na grade e na ficha, com fallback robusto (ausência/erro). Filtros de custo e set expostos no catálogo público. Importação do catálogo externo (TakaOtaku) disponível no admin, reusando o painel existente. MVVM estrito: `CardTile` (view; sem hooks de dados — só estado local de erro), `card-view` (helper de apresentação), ViewModels `use-card-list`/`use-card-sets`/`use-admin-cards`, Model `cards-api`/`types`.
- **Arquivos:** `components/card-tile.tsx`, `features/cards/model/{types,cards-api}.ts`, `features/cards/viewmodels/{card-view,use-admin-cards}.ts`, `features/cards/views/{card-filters,card-detail-view,admin-cards-view}.tsx`.
- **Decisões:** (1) `<img>` nativo (não `next/image`) — sem `images.remotePatterns` para o domínio da TakaOtaku no `next.config.ts` (config fora do escopo). (2) Custo enviado como match exato `playCost=0..7` (a API usa igualdade); "7+" (≥7) exigiria filtro de faixa no backend — reportado. (3) Set se auto-oculta com lista vazia (task 70 popula `card_sets`). (4) Reuso do painel de importação; gatilho do cabeçalho renomeado para "Importação / curadoria".
- **Fora do escopo:** nenhum. `packages/**` e `apps/api/**` intocados; `features/decks/**` e `components/**` (exceto `card-tile.tsx`) intocados.

## Fase 31 — Ficha da carta: arte inteira sem corte (task 71)
- [x] `card-detail-view`: área da arte trocada de altura fixa (`h-72`) + `object-cover` para **proporção de carta** (`aspect-[5/7]`) + `object-contain` — a arte oficial (carta completa) aparece inteira, sem corte
- [x] Fundo neutro `bg-bg` quando há arte (contraste); gradiente da cor + `Sparkles` preservados como **fallback** (`imageUrl` ausente ou `onError`)
- [x] Skeleton de loading alinhado à proporção (`aspect-[5/7] w-full max-w-[400px]`) — sem CLS
- [x] `card-tile`: imagem alinhada para `object-contain` (uniformidade com a ficha; grade já usava `aspect-[5/7]`)
- [x] `alt` com o nome da carta + `loading="lazy"`/`decoding="async"` preservados
- [x] `pnpm turbo typecheck lint build --filter=@digimon/app-web` ✅ (0 erros, 0 warnings; build 30 rotas)

## Handoff (task 71)
- **Feito:** a ficha da carta passa a exibir a arte oficial inteira. A causa era o container de altura fixa (`h-72`) com `object-cover`, que cortava a carta (proporção ~5:7). Trocado por `aspect-[5/7]` + `object-contain` sobre fundo neutro `bg-bg`; o gradiente da cor + `Sparkles` seguem como fallback em ausência/erro da arte. O skeleton de loading foi alinhado à mesma proporção (sem CLS) e o `CardTile` da grade passou a `object-contain` para uniformizar com a ficha.
- **Arquivos:** `apps/web/src/features/cards/views/card-detail-view.tsx`, `apps/web/src/components/card-tile.tsx`.
- **Decisões:** (1) fundo neutro `bg-bg` (token mais escuro) quando há arte — o gradiente de cor fica só no fallback (via `backgroundImage` inline condicional; classe `bg-bg` é sobrescrita pelo inline quando o fallback entra). (2) `bg-bg` dentro do frame `bg-surface` cria o contraste "levemente escurecido" pedido. (3) `object-contain` também no tile (a grade já usa `aspect-[5/7]`, corte era mínimo, mas uniformizar era desejável). (4) Nenhum componente novo, nenhuma `next/image` (mantido `<img>` nativo — sem `remotePatterns` no `next.config.ts`, fora do escopo).
- **Fora do escopo:** nenhum. `packages/**`, `apps/api/**` e demais `components/**` intocados.

## Fase 32 — Redesenho do formulário de criar deck (UX) (task 72)
- [x] **Slug fora do fluxo principal**: virou linha secundária "URL: /decks/<slug>" + `<details>` "Avançado: definir slug manualmente"; o slug é **derivado do nome** (slugify do domínio replicado) quando o campo está vazio (`vm.effectiveSlug`)
- [x] **Sem `<form>` aninhado**: o `<form>` externo e o `<form>` de busca foram removidos — busca por `onKeyDown`/botão, ações por `onClick` em `Button type="button"`; labels/aria preservados
- [x] **Controle de quantidade (1..4)**: VM ganhou `incrementCard`/`decrementCard`/`setQuantity(zone, cardId, qty)` e `addCard`/`addEggCard` respeitando `maxCountInDeck` (default 4) e os caps de zona (main 50 / egg 5); nada mais desabilita "após 1 cópia"
- [x] **Steppers +/− nas listas do deck** (main e egg) com miniatura, nome, contador e Remover; contadores `X/50` e `Y/5` no topo do painel
- [x] **Capa com nomes corretos**: índice de cartas no VM (`resolveCard`) alimentado ao adicionar pela busca + resolução lazy dos ids de import (`cardsApi.getCard` via `useQueries`, cache `['card', id]`); `<select>` de capa e listas usam o índice (cai no `cardId` só se não resolver); preview da capa com `CardTile`
- [x] **Layout em duas colunas responsivo**: esquerda = busca (filtros tipo/cor + resultados com miniatura + stepper/"Adicionar") + import; direita = painel do deck (main/egg, contadores, legalidade, capa) + rodapé de ações (Salvar / Salvar e publicar), `lg:sticky`
- [x] `remainingMain`/`remainingEgg` expostos pelo VM; legalidade ao vivo + violações listadas no painel
- [x] `pnpm turbo typecheck lint build --filter=@digimon/app-web` ✅ (0 erros, 0 warnings; build 31 rotas, `/decks/novo` presente)

## Handoff (task 72)
- **Feito:** redesenho de UX do formulário de criar deck (`/decks/novo`, `deck-form-view.tsx`) atendendo os 6 problemas reportados. MVVM estrito mantido: a View só renderiza e dispara callbacks; todo fetch/estado/validação vive nos ViewModels (`useDeckForm` + `useCardList`/`useDeckPublications`/`useDeckImportExport`).
- **Arquivos:** `apps/web/src/features/decks/views/deck-form-view.tsx`, `apps/web/src/features/decks/viewmodels/use-deck-form.ts`.
- **Decisões:** (1) **`addCard`/`addEggCard` recebem `CardSummary`** (não só o id) para registrar o metadado no índice — resolve o `maxCountInDeck` sem pré-carregar todos os resultados da busca. (2) **Índice de cartas** como `Record<cardId, CardSummary>` (state) + `useQueries` (`queryKey: ['card', id]`, `staleTime 5min`) só para ids órfãos (import) — mesma estratégia de `use-community-deck`; `resolveCard`/`maxCountFor` derivados por `useMemo`. (3) **Slug derivado**: `effectiveSlug = values.slug || slugify(values.name)`; a validação testa o slug efetivo e `buildInput` envia o derivado. (4) **Sem `<form>`**: removidos o form externo e o interno (evita submit implícito ao teclar Enter na busca); ações via `onClick`. (5) **Steppers com `cap = min(maxCountInDeck, qty + restanteDaZona)`** — o `+` desabilita no limite sem depender do VM (que também faz clamp defensivo). (6) Constantes `MAIN_DECK_SIZE`/`EGG_DECK_SIZE`/`DEFAULT_MAX_COUNT_IN_DECK` locais no VM (o client não importa `@digimon/decks` p/ não arrastar o banco). (7) `CardTile` usado no preview da capa; miniaturas das listas/busca em `<img>` (padrão de `community-deck-detail-view`).
- **Fora do escopo (reportar):** nenhum. `apps/api/**`, `packages/**` e `components/**` intocados. A página `(member)/decks/novo/page.tsx` (AuthShell/card 420px) não foi tocada — o formulário agora usa duas colunas dentro do card; se o card estreito do shell incomodar, ajustar o wrapper numa task própria.

## Fase 33 — Home: remover torneios hardcoded (task 73)
- [x] `use-home.ts`: removidos `UPCOMING_TOURNAMENTS`, o import de `TournamentCardData` e o campo `tournaments` de `HomeData`/retorno; comentário do topo atualizado (não menciona mais torneios estáticos)
- [x] `home-view.tsx`: removida a `<section>` "Próximos torneios no Brasil", o import de `TournamentCard` e o destructuring de `tournaments`; comentário do topo atualizado
- [x] Nenhum dado falso de torneios introduzido — home mantém herói, categorias, últimas notícias e CTA
- [x] Sem imports/usos órfãos (grep `tournaments|TournamentCard` em `features/content` = 0)
- [x] `pnpm turbo typecheck lint build --filter=@digimon/app-web` ✅ (0 erros, 0 warnings; build 30 rotas)

## Handoff (task 73)
- **Feito:** removida a seção "Próximos torneios no Brasil" da Home, que renderizava 3 torneios hardcoded (`UPCOMING_TOURNAMENTS`). O ViewModel `useHome` deixou de expor `tournaments` e a View não importa mais `TournamentCard`. A Home permanece com herói, categorias, últimas notícias e CTA.
- **Arquivos:** `apps/web/src/features/content/viewmodels/use-home.ts`, `apps/web/src/features/content/views/home-view.tsx`.
- **Decisões:** remover o dado estático em vez de conectá-lo a uma API — o módulo de torneios existe (`/torneios`), mas a Home não foi pedida para consumi-lo nesta task (evita inventar dados e mantém o escopo mínimo).
- **Fora do escopo:** nenhum. `components/**` (incluindo `TournamentCard`, ainda usado em `/torneios`), `apps/api/**` e `packages/**` intocados.

## Fase 34 — Assets: logo com fundo transparente + fix do rodapé (task 74)
- [x] `public/dcg-logo.png`: versão transparente `937×266` RGBA validada — 52,77% do canvas com alpha=0, os 4 cantos em `(0,0,0,0)`, nenhuma linha 100% opaca (sem retângulo de fundo), halo quase inexistente (39 px semi-transparentes quase brancos)
- [x] `site-footer.tsx`: regressão corrigida — `className="h-[38px] w-auto"` restaurado (a logo voltava ao tamanho natural 1280×364 e estourava o rodapé); `loading="eager"` removido (logo abaixo da dobra)
- [x] `site-header.tsx`: mantida altura controlada `h-9 w-auto` e ausência do texto "Brasil" (`DCG BRASIL` já está na arte); `width/height` intrínsecos alinhados ao asset (937×266)
- [x] `pnpm turbo typecheck lint build --filter=@digimon/app-web` — 3/3 ✅ (0 erros, 0 warnings; build 27 páginas + Proxy)

## Handoff (task 74)
- **Feito:** `apps/web/public/dcg-logo.png` agora tem fundo transparente (`DCG BRASIL`, 937×266 RGBA) e o rodapé voltou a renderizar a logo em `h-[38px] w-auto`. A logo commitada (`HEAD`) tinha fundo opaco; o working tree já trazia a versão transparente (tentativa anterior não commitada), que foi validada/limpa.
- **Arquivos:** `apps/web/public/dcg-logo.png`, `apps/web/src/components/site-footer.tsx`, `apps/web/src/components/site-header.tsx`.
- **Decisões:** (1) usei a versão transparente do working tree em vez de re-derivar do design — a arte do design (`context/project/design/dcg-logo.png`) é "DIGIMON CARD GAME" **sobre um plate opaco** (72,8% opaco), logo re-derivar exigiria remover um fundo multicolorido com risco alto; a arte desejada ("DCG BRASIL", com "BRASIL" embutido) só existe como essa versão transparente. (2) **não** apara o padding horizontal (125 px à esquerda / 99 px à direita): o `crop` pela bbox do alpha deixaria um pixel de arte anti-aliased (alpha=93) encostado no canto superior-direito, violando o critério "cantos alpha=0"; mantive o canvas com os 4 cantos exatamente transparentes (o padding é invisível em `w-auto`). (3) alinhei `width/height` das duas imagens de `1280×364` (dimensões do asset antigo) para `937×266` (asset atual) — evita hint de aspect-ratio desalinhado e o risco de a logo "estourar" se o CSS falhar. (4) removi `loading="eager"` do rodapé (logo abaixo da dobra não deve ser eager; `next/image` volta a lazy) e mantive `priority`/`loading="eager"` no header (acima da dobra).
- **Verificação da logo:** `PIL` — mode RGBA, 937×266; cantos `(0,0,0,0)`; 52,77% alpha=0; 0 linhas totalmente opacas; halo ≈ 39 px. Tamanho final **937×266** (~195 KB).
- **Fora do escopo:** `apps/web/next-env.d.ts` regenerado pelo build mantido como está (artefato, como instruído); demais arquivos do working tree (tasks 71–73) intocados.

## Fase 35 — Página /decks/novo com largura adequada ao deck builder (task 75)
- [x] `(member)/decks/novo/page.tsx`: abandonou o `AuthShell` (card 420px) por um **container largo** `mx-auto w-full max-w-[1440px] px-4 py-10 lg:px-12` + cabeçalho próprio (h1 `font-display` "Criar deck" + subtítulo `text-ink-soft`), no padrão de `decks-list-view`/`profile-view`
- [x] Gate preservado: a rota permanece sob `(member)` (o layout do grupo é passthrough; nenhuma proteção foi removida/alterada)
- [x] `deck-form-view.tsx`: raiz com `w-full` e lista de resultados com `lg:max-h-[40rem]` — as 2 colunas respiram no container largo (o `lg:sticky` do painel do deck continua); MVVM intacto
- [x] `AuthShell`/`features/auth` intocados (tasks bonus zero)
- [x] `pnpm turbo typecheck lint build --filter=@digimon/app-web` ✅ (3/3; 0 erros, 0 warnings; build 27 rotas, `/decks/novo` estática)

## Handoff (task 75)
- **Feito:** o formulário de criar deck (2 colunas, task 72) deixa de ficar apertado no card de 420px do `AuthShell`. A página passa a montar um container largo (`max-w-[1440px]`) com cabeçalho tipográfico próprio; a View ganha `w-full` na raiz e uma lista de resultados mais alta no desktop (`lg:max-h-[40rem]`), aproveitando a largura/altura. A View só renderiza (MVVM intacto — nenhum hook de dados foi movido para a View).
- **Arquivos:** `apps/web/src/app/(member)/decks/novo/page.tsx`, `apps/web/src/features/decks/views/deck-form-view.tsx`, `context/modules/web/status.md`.
- **Decisões:** (1) **Gate preservado sem alteração** — o `(member)/layout.tsx` é passthrough (não contém gate); a proteção reside no agrupamento `(member)` + login do cliente, e a página continua dentro dele (nada removido/movido). (2) **Não usar `AuthHeader`** de `features/auth` (evita acoplar a página ao shell de auth que a task pediu para abandonar); o cabeçalho segue o padrão tipográfico do design system já usado nas listagens. (3) Ajuste mínimo na View (só classes de layout) — nenhuma lógica/ViewModel alterado.
- **Fora do escopo (reportar):** nenhum arquivo tocado além do `## Escopo`. `AuthShell`/`features/auth`, `use-deck-form.ts`, `apps/api/**`, `packages/**` e `components/**` intocados. `context/modules/decks/status.md` **não** foi editado (só `web/status.md` estava no escopo desta task); o handoff da task 72 lá registrava que o wrapper da página ainda era o card de 420px — agora resolvido por esta task.

## Fase 36 — Gate server-side das rotas de membro `(member)` (task 81)
- [x] `(member)/layout.tsx` virou **Server Component** (`async`) que lê `getSession()` e faz `redirect('/login')` se **não autenticado** — fecha a pendência do Lote 9 (antes era passthrough e o anônimo via o form)
- [x] `lib/session.ts` **não precisou de alteração** — o `getSession()` server-only já existia (task 59) e atende integralmente (valida o `access_token` httpOnly via `@digimon/auth`, nunca lança); reusado sem duplicação
- [x] Sem `next`: o `proxy.ts` não injeta o pathname em header e está fora do escopo → redirecionamento simples para `/login`
- [x] Rotas `(public)` e `(auth)` intocadas; páginas individuais de `(member)` intocadas (gate é do grupo)
- [x] `pnpm turbo typecheck lint --filter=@digimon/app-web` ✅ (2/2; 0 erros, 0 warnings)

## Handoff (task 81)
- **Feito:** o grupo de rotas `(member)` (`/decks/novo`, `/decks/[slug]/editar`, `/perfil`, `/torneios/novo`) passa a ter **gate server-side**: o `(member)/layout.tsx` é agora um Server Component que chama `getSession()` e `redirect('/login')` quando não há sessão. Antes era um `<div>` passthrough e a única proteção era o 401 da API (o anônimo conseguia abrir a página e ver o form).
- **Arquivos:** `apps/web/src/app/(member)/layout.tsx` (alterado). `apps/web/src/lib/session.ts` **não alterado** (já atendia — decisão de reuso, não de cópia).
- **Decisões:** (1) Reusar `@/lib/session#getSession` (server-only, compartilhado com o admin via `features/admin/model/session.ts`) — sem duplicar validação de JWT/cookie. (2) Redirect simples para `/login` (sem `?next=`): o `proxy.ts` não expõe o pathname em header e mudá-lo sairia do escopo; a spec previa esse caminho "senão". (3) O gate usa o mesmo padrão do `admin/layout.tsx` (`await getSession()` + `redirect` de `next/navigation`). (4) Ler cookies torna a rota dinâmica — comportamento esperado para área autenticada.
- **Validação:** `pnpm turbo typecheck lint --filter=@digimon/app-web` — 2/2 ok (0 erros, 0 warnings). Critério "anônimo → `/login`" garantido pelo gate; "logado acessa normalmente" preservado (session válida → renderiza `children`).
- **Fora do escopo:** nenhum. `proxy.ts`, `features/cards/**` (tasks ativas 76/77), `(public)`/`(auth)`, páginas de `(member)` e `apps/api/**` intocados.

## Fase 37 — Filtros de `/cartas` como selects (task 76)
- [x] `card-filters.tsx`: tipo, cor, custo e set agora são `<select>` (o set já era) — botões removidos; busca por nome/efeito permanece `<input type="search">` com submit
- [x] Cada select tem opção de limpar (`Todos os tipos` / `Todas as cores` / `Todos os custos` / `Todos os sets`) e é controlado por `filters.* ?? ''`
- [x] Acessibilidade: `<label htmlFor>`/`id` associados (`card-type-filter`, `card-color-filter`, `card-cost-filter`, `card-set-filter`); busca mantém `aria-label`
- [x] Comportamento preservado: `onChange` → `setFilters` do `useCardList` (reset para a página 1); filtro de set só aparece quando `useCardSets` retorna sets
- [x] Helpers `toggle*` viraram `set*` (String de entrada → valor tipado / `delete` do filtro vazio); import `cn` removido (sem uso)
- [x] ViewModel `use-card-list` / `use-card-sets` **intocados** (só a View mudou — MVVM estrito)
- [x] `pnpm turbo typecheck lint --filter=@digimon/app-web` ✅ (2/2; 0 erros, 0 warnings)

## Handoff (task 76)
- **Feito:** a barra de filtros do catálogo público (`/cartas`) trocou os grupos de botões de **tipo**, **cor** e **custo** por `<select>` (o filtro de **set** já era select). Os quatro selects ficam numa linha `flex-wrap` com label acima; cada um tem opção vazia rotulada ("Todos …") que limpa o filtro. A busca permanece um input com submit. Qualquer mudança de filtro continua chamando `setFilters` → `useCardList` reseta para a página 1.
- **Arquivos:** `apps/web/src/features/cards/views/card-filters.tsx` (único arquivo tocado).
- **Decisões:** (1) Selects controlados por `value={filters.x ?? ''}` — single-select, coerente com o contrato atual do ViewModel (um `type`/`color`/`playCost`/`setCode` por vez). (2) Helpers `toggleType/Color/PlayCost` substituídos por `setType/setColor/setPlayCost` recebendo `string` do `<select>` (custo convertido com `Number`); valores vazios fazem `delete` do campo. (3) `aria-label` adicionado apenas ao input de busca (único sem label visível); os selects usam `<label htmlFor>`/`id` visíveis (associação forte, sem rótulo duplicado). (4) Selecionei classes do design system (`border-border`/`bg-surface`/`text-ink`/`focus:ring-primary`) — sem `var()` avulso.
- **Fora do escopo (reportar):** nenhum. ViewModels (`use-card-list`, `use-card-sets`), `model/types.ts`, `cards-grid.tsx` (task 77) e demais arquivos intocados.

## Fase 38 — Hovercard com a arte grande da carta (task 77)
- [x] Novo `components/card-hover-card.tsx` (`CardHoverCard`): preview flutuante com a **arte grande** (`aspect-[5/7]`) + nome + número; abre no **hover/focus** do gatilho e some ao sair
- [x] **Só desktop**: gate por `matchMedia('(pointer: fine)')` — em touch não aparece nem interfere
- [x] **Não bloqueia o clique**: preview via `createPortal` no `document.body`, `pointer-events-none`, `fixed z-50` e `aria-hidden` (o link já tem nome acessível)
- [x] **Sem `<img>` quebrada**: `imageUrl` nulo/erro (`onError`) cai no fallback gradiente + `Sparkles` + nome/número
- [x] Posicionamento robusto: abre à direita (ou à esquerda se faltar espaço) e clampa à viewport (`computePosition`); fecha em scroll/resize/Escape
- [x] Acessível por teclado: `onFocus`/`onBlur` no wrapper (foco visível já existente no `Link`) + Escape fecha
- [x] Integrado em `cards-grid.tsx`: cada `Link`/`CardTile` embrulhado por `CardHoverCard` com `name`/`number`/`color`/`imageUrl` do `GridCard`
- [x] Export no barrel `components/index.ts` (`CardHoverCard` + tipos)
- [x] `pnpm turbo typecheck lint --filter=@digimon/app-web` ✅ (2/2; 0 erros, 0 warnings)

## Handoff (task 77)
- **Feito:** hovercard de carta no design system — ao passar o mouse (ou focar por teclado) uma carta da grade `/cartas`, aparece um card flutuante com a arte grande (`aspect-[5/7]`), nome no cabeçalho colorido e número; some ao sair.
- **Arquivos:** `apps/web/src/components/card-hover-card.tsx` (novo), `apps/web/src/components/index.ts` (barrel), `apps/web/src/features/cards/views/cards-grid.tsx` (integração).
- **Decisões:** (1) **Portal + `fixed`** (`createPortal` em `document.body`) em vez de `absolute` no tile — evita clipping pelo grid/`overflow` e clampa à viewport (`computePosition`: abre à direita, à esquerda se faltar espaço; top centralizado clampado). (2) **`pointer-events-none` + `aria-hidden`** no preview — nunca intercepta o clique do `Link` e é redundante para leitores de tela (o link já tem nome). (3) **Gate de ponteiro fino** via `matchMedia('(pointer: fine)')` — em touch o preview não monta (não interfere). (4) Abre com `hovered || focused`; Escape/scroll/resize fecham (posição fixa não fica obsoleta). (5) Estado local de UI apenas (sem fetch) — coerente com `CardTile`; MVVM intacto. (6) Reuso dos tokens/helpers (`ATTRIBUTE_COLORS`/`ATTRIBUTE_LABELS`, `Sparkles`, `cn`) e do visual do `CardTile`; `imageUrl`/`color` já vinham no `GridCard` via `toCardTileData`. (7) `imageUrl` tipado `string | null | undefined` por causa de `exactOptionalPropertyTypes`.
- **Validação:** `pnpm turbo typecheck lint --filter=@digimon/app-web` — 2/2 ok (0 erros, 0 warnings). `next build` **não** executado (conforme instrução da task).
- **Fora do escopo:** nenhum. `card-filters.tsx` (task 76), `(member)/layout.tsx` (task 81) e `lib/session.ts` (task 81) intocados; `apps/api/**` e `packages/**` intocados.

## Fase 39 — Busca de cartas do criar-deck com "Carregar mais" (task 78)
- [x] Novo ViewModel `features/cards/viewmodels/use-card-search.ts`: busca paginada via `useInfiniteQuery` (`pageSize=24`) que **acumula** páginas; expõe `{ cards, total, search, filters, setFilters, reset, isLoading, isError, isFetchingMore, hasMore, loadMore, refetch }` — reusa `cardsApi.listCards` e o `total` da resposta para o `getNextPageParam`
- [x] `deck-form-view.tsx`: `useCardList` → `useCardSearch`; resultados **acumulados** com contagem "Mostrando X de Y", botão **"Carregar mais"** no fim (quando `hasMore`) e botão **"Limpar filtros"** (aparece quando há busca/tipo/cor ativos → `reset`)
- [x] **Hovercard** `CardHoverCard` (task 77) integrado a cada resultado (arte grande no hover/focus; só ponteiro fino) via `attributeColor(card)`
- [x] Filtros (tipo/cor) e busca por nome/efeito mantidos; qualquer mudança de filtro/busca reinicia a paginação para a 1ª página (nova `queryKey` do `useInfiniteQuery`)
- [x] Steppers "Adicionar"/+/− (task 72) preservados — `addCard`/`addEggCard` continuam recebendo `CardSummary` (o `Card` do resultado é um superset)
- [x] MVVM estrito: nada de `useQuery`/fetch na View (a View só consome o ViewModel `useCardSearch`)
- [x] `pnpm turbo typecheck lint --filter=@digimon/app-web` ✅ (2/2; 0 erros, 0 warnings)

## Handoff (task 78)
- **Feito:** a busca de cartas do `/decks/novo` passa a **carregar mais** resultados em vez de mostrar só a 1ª página. Novo ViewModel de feature `useCardSearch` (`apps/web/src/features/cards/viewmodels/use-card-search.ts`) baseado em `useInfiniteQuery` — acumula páginas de 24 e expõe `hasMore`/`isFetchingMore`/`loadMore` além de `search`/`filters`/`setFilters`/`reset`. A `deck-form-view` trocou `useCardList` por `useCardSearch`, mostra "Mostrando X de Y", um botão **"Carregar mais"** no fim da lista, um **"Limpar filtros"** (usa `reset`) e integra o **hovercard** (`CardHoverCard`, task 77) em cada resultado. Os filtros (tipo/cor) e a busca por nome/efeito continuam resetando a paginação (nova `queryKey`); os steppers de quantidade (task 72) seguem intactos.
- **Arquivos:** `apps/web/src/features/cards/viewmodels/use-card-search.ts` (novo), `apps/web/src/features/decks/views/deck-form-view.tsx`, `context/modules/{web,decks,cards}/status.md`.
- **Decisões:** (1) **`useInfiniteQuery`** (TanStack Query v5) em vez de orquestrar `page`+`useQuery` manualmente — o append de páginas e `hasNextPage` são nativos; `hasMore` = `getNextPageParam` compara `page * pageSize < total` (usa o `total` que a API já devolve). (2) **`filters` como chave da query**: qualquer `setFilters`/busca troca a `queryKey` e reinicia a paginação automaticamente (não há estado de `page` na View). (3) **`search`** exposto como string (o termo aplicado, derivado de `filters.search`) para leitura da View; a aplicação do termo continua via `setFilters` (mesmo padrão do `useCardList`), mantendo o `term` do input como estado local da View (UI-only). (4) **`reset`** limpou também o `term` local (botão "Limpar filtros"), satisfazendo "reset para a 1ª página" + heurística 3 (controle do usuário). (5) **Hovercard dentro do `<li>`** (não envolvendo o `<li>`) para não gerar `<div>` filho direto de `<ul>`; o portal do preview é `pointer-events-none`, então não bloqueia o botão Adicionar/steppers. (6) **`use-deck-form.ts` intocado** — `addCard`/`addEggCard` já aceitam `CardSummary`, do qual `Card` é superset; nenhuma regra mudou.
- **Validação:** `pnpm turbo typecheck lint --filter=@digimon/app-web` — 2/2 ok (0 erros, 0 warnings). `next build` **não** executado (conforme instrução da task).
- **Fora do escopo:** nenhum. `use-deck-form.ts` (no escopo, mas sem mudança necessária), `deck-detail-view.tsx`/`use-deck.ts`/`app/(public)/decks/[slug]/` (task 79 ativa), `apps/api/**` e `packages/**` intocados.

## Fase 40 — Página de detalhe do deck (`/decks/[slug]`) (task 79)
- [x] Rota `app/(public)/decks/[slug]/page.tsx` (nova) — conserta o 404 de `/decks/{slug}` (a lista já linkava para lá): `generateMetadata` SSR (nome/descrição) + `<DeckDetailView slug={slug} />` client
- [x] `deck-detail-view.tsx` reescrito: cabeçalho (nome, `StatusBadge`, formato, contagens main/egg/total, descrição, capa `CardTile`, dono); **legalidade** (`StatusBadge` + violações); **curva de custo**; **decklist em seções** (`groupDeckSections`) com miniatura + nome + número + quantidade + `CardHoverCard` (task 77)
- [x] **Ações por papel** (via `useSession` no ViewModel): dono → Editar (`/decks/{slug}/editar`), Publicar (se draft), Publicar/Despublicar na comunidade (`useDeckPublications`), Exportar (`DeckExportModal`), Excluir (confirmar); visitante → Copiar
- [x] Estados loading/erro/**404 sem vazar** (`isNotFound`) claros
- [x] `use-deck.ts`: ViewModel completo (`useDeck`) — deck + metadados (`useQueries`/`cardsApi.getCard`) + legalidade (`POST /decks/legality`) + ações; MVVM estrito (View sem `useQuery`/`useMutation`)
- [x] `views/index.ts` **sem mudança** (assinatura preservada)
- [x] `pnpm turbo typecheck lint --filter=@digimon/app-web` ✅ (2/2; 0 erros, 0 warnings)

## Handoff (task 79)
- **Feito:** rota `/decks/[slug]` criada (antes 404) e detalhe do deck reescrito. `page.tsx` (Server Component) faz `generateMetadata` via `GET /decks/:slug` (404 → "Deck não encontrado") e monta a View client. `DeckDetailView` mostra cabeçalho (nome/status/formato/contagens/descrição/capa/dono), legalidade, curva de custo e decklist em seções (miniatura + nome + quantidade + hovercard). `use-deck.ts` virou o ViewModel completo que orquestra dados + ações por papel.
- **Arquivos:** `apps/web/src/app/(public)/decks/[slug]/page.tsx` (novo), `apps/web/src/features/decks/views/deck-detail-view.tsx`, `apps/web/src/features/decks/viewmodels/use-deck.ts`, `context/modules/{web,decks}/status.md`.
- **Decisões:** (1) índice de cartas por `useQueries`+`cardsApi.getCard` (cache `['card', id]`, igual ao form/community) → a View recebe `resolveHoverCard(cardId)`; (2) legalidade via `useQuery` (`POST /decks/legality`) sem duplicar regra; (3) `isNotFound` = `ApiError.status === 404` (rascunho de outro usuário não vaza); (4) dono exibido só quando o visitante é o dono (não há `GET /users/:id` público → "senão omitir"); (5) exclusão confirma via `DeckPublishModal` (modal genérico) em vez de `window.confirm`; (6) Editar linka `/decks/{slug}/editar` (task 80) e `useDeck` mantém nome/`export type { Deck }`.
- **Validação:** `pnpm turbo typecheck lint --filter=@digimon/app-web` — 2/2 ✅ (0 erros, 0 warnings). `next build` **não** executado (instrução da task).
- **Fora do escopo (reportar):** exportação em **PNG** inexistente (sem lib/rota) — só o export em **texto** (DigimonCard.io) foi implementado (reuso de `DeckExportModal`); `views/index.ts` intocado; `deck-form-view.tsx`/`use-deck-form.ts` (task 80), `components/**`, `apps/api/**` e `packages/**` intocados.

## Fase 41 — Página de editar o deck (`/decks/[slug]/editar`) (task 80)
- [x] Rota `app/(member)/decks/[slug]/editar/page.tsx` (nova): container largo `max-w-[1440px]` (padrão da task 75) + cabeçalho "Editar deck" + `<DeckFormView mode="edit" slug={slug} />`; `metadata` com `robots: { index: false }`; gate de Member herdado do grupo `(member)`
- [x] `use-deck-form.ts` com modo edição: `useDeckForm({ mode, slug, initialDeck? })`; em `mode: 'edit'` carrega o deck (`decksApi.getDeck` via `useQuery`, `initialData: initialDeck`) e hidrata `values` (nome/slug/descrição/formato/status), `cardList`, `eggList` e `coverCardId`; `handleSubmit` salva via `decksApi.updateDeck(slug, input)` (PATCH)
- [x] PATCH não envia `status` nem `slug` (schema `updateDeckSchema` é `.strict()` — rejeitaria `status`); descrição vazia vira `null` (permite limpar); demais regras (legalidade ao vivo, steppers, import, validação) intactas
- [x] ViewModel expõe `isEdit`/`isLoading`/`loadError`/`isNotFound`/`refetchDeck`; `reset` volta ao baseline (deck carregado em edit; vazio em create)
- [x] `deck-form-view.tsx` com props `mode`/`slug`: CTA primário "Salvar alterações" em edit (create mantém "Salvar deck" + "Salvar e publicar"); slug vira informativo em edit ("O endereço (slug) do deck não muda"); layout 2 colunas (task 72) e busca acumulada (task 78) preservados; estados de loading/404/erro do carregamento com "Voltar para decks"
- [x] Após salvar em edit → `router.push('/decks/{slug}')`; painel "Publicar na comunidade" permanece para decks já salvos (usa o slug do deck)
- [x] Criar continua funcionando (`mode: 'create'` default) — nenhum comportamento do `/decks/novo` alterado
- [x] `pnpm turbo typecheck lint --filter=@digimon/app-web` ✅ (2/2; 0 erros, 0 warnings; `next build` **não** executado)

## Handoff (task 80)
- **Feito:** página de edição de deck `/decks/[slug]/editar` (antes inexistente). A rota é um Server Component sob `(member)` (gate do grupo) com container largo e `<DeckFormView mode="edit" slug={slug} />`. O `useDeckForm` ganhou `mode`/`slug`/`initialDeck`: em `edit`, carrega o deck por `decksApi.getDeck`, hidrata o formulário (`values` nome/slug/descrição/formato/status, `cardList`, `eggList`, `coverCardId`) e salva via `decksApi.updateDeck` (PATCH). A View ajusta os CTAs ("Salvar alterações"), esconde a edição de slug (é fixo) e redireciona para o detalhe após salvar; mantém o painel de "Publicar na comunidade" para o deck já salvo. O fluxo de criação segue idêntico (`mode: 'create'` default).
- **Arquivos:** `apps/web/src/app/(member)/decks/[slug]/editar/page.tsx` (novo), `apps/web/src/features/decks/views/deck-form-view.tsx`, `apps/web/src/features/decks/viewmodels/use-deck-form.ts`, `context/modules/{web,decks}/status.md`.
- **Decisões:** (1) **PATCH sem `status`/`slug`** — `updateDeckSchema` é `.strict()` e não aceita `status`; enviar só os campos editáveis (nome/descrição/formato/cardList/eggList/coverCardId) preserva o status server-side. (2) **Slug fixo na edição**: `values.slug` é preenchido com o do deck só para exibir a URL; a View troca o `<details>` de slug por um aviso informativo. (3) **Descrição vazia → `null`** no edit (permite limpar; no create vazio é omitido). (4) **Hidratação única** via `useRef` para não sobrescrever edições em refetch. (5) **Redirect no View** (`useRouter`), como no `deck-detail-view` — a página é Server Component (mantém `metadata`/`robots`) e não pode receber callback. (6) **`isNotFound` sem vazar** (rascunho de outro/não-dono → `ApiError.status === 404`), com "Voltar para decks"; o gate de dono no save continua no backend (PATCH 403 se não for dono).
- **Validação:** `pnpm turbo typecheck lint --filter=@digimon/app-web` — 2/2 ✅ (0 erros, 0 warnings). `next build` **não** executado (conforme instrução da task).
- **Fora do escopo (reportar):** tasks ativas 82 (`card-filters.tsx`/`packages/modules/cards`) e 83 (`card-tile.tsx`/`card-hover-card.tsx`/`next.config.ts`) **não** tocadas. `views/index.ts` (barrel) e `viewmodels/index.ts` **não** editados — a assinatura de `DeckFormView`/`DeckFormViewProps` foi mantida e `useDeckForm` continua exportada; os novos tipos (`DeckFormMode`/`UseDeckFormOptions`) não foram adicionados ao barrel por estarem fora do `## Escopo`.

## Fase 42 — `next/image` na arte das cartas + espelhar `setsCount` (task 83)
- [x] `next.config.ts`: `images.remotePatterns` para `https://world.digimoncard.com` (`pathname: '/images/cardlist/card/**'`) — host confirmado no mapper TakaOtaku (`TAKA_IMAGE_BASE`)
- [x] `card-tile.tsx`, `card-hover-card.tsx`, `card-detail-view.tsx`: `<img>` → `next/image` (`fill` + `sizes` sobre o container `relative aspect-[5/7]` já existente); **fallback preservado** (`onError` → gradiente + `Sparkles`); componentes seguem client (`'use client'`)
- [x] `features/cards/model/types.ts`: `ImportCardsFromSourceResult` ganhou `setsCount?: number` (espelha o backend — fecha o drift apontado na revisão)
- [x] `pnpm turbo typecheck lint --filter=@digimon/app-web` ✅ (2/2; 0 erros, 0 warnings; `next build` **não** executado, conforme instrução)

## Handoff (task 83)
- **Feito:** a arte oficial das cartas passa a ser servida via `next/image` (otimização do Next) em três pontos — grade (`card-tile`), hovercard (`card-hover-card`) e ficha (`card-detail-view`). `next.config.ts` ganhou `images.remotePatterns` para o host `world.digimoncard.com`, caminho `/images/cardlist/card/**` (fonte: importação TakaOtaku → `Card.imageUrl`, `TAKA_IMAGE_BASE`). O **fallback** foi mantido em todos os pontos: `imageUrl` ausente **ou** `onError` do `Image` cai no gradiente da cor + `Sparkles` (os componentes já eram `'use client'`, exigência do `onError`). No Model, `ImportCardsFromSourceResult` recebeu `setsCount?: number`, espelhando o backend (`ImportCardsFromSourceUseCase` já retorna `setsCount`), fechando o drift de contrato.
- **Arquivos:** `apps/web/next.config.ts`, `apps/web/src/components/card-tile.tsx`, `apps/web/src/components/card-hover-card.tsx`, `apps/web/src/features/cards/views/card-detail-view.tsx`, `apps/web/src/features/cards/model/types.ts`, `context/modules/web/status.md`.
- **Decisões:** (1) `next/image` com **`fill`** (em vez de `width`/`height` explícitos) — o container já é `relative aspect-[5/7]`, então `fill` preenche a área sem reintroduzir dimensões fixas; `sizes` declarado por contexto (`25vw/50vw` na grade, `400px/100vw` na ficha, `280px` no hovercard, largura fixa do preview). (2) `loading="lazy"`/`decoding="async"` removidos — o `next/image` já faz lazy-loading por padrão (só `priority` fica eager). (3) `setsCount?` **opcional** (o backend sempre retorna, mas manter opcional não quebra consumidores e reflete a natureza aditiva do campo). (4) `src={card.imageUrl ?? ''}`/`src={detail.imageUrl}` mantidos sob o guard do `showArt`/`detail.imageUrl && !artFailed` (o TS não estreita a variável derivada; o guard garante `imageUrl` truthy em runtime).
- **Validação:** `pnpm turbo typecheck lint --filter=@digimon/app-web` — 2/2 ✅ (0 erros, 0 warnings). `next build` **não** executado (instrução explícita da task).
- **Escopo:** `## Escopo` estendido (aprovado) para trocar `community-types.ts` (que **não** continha `ImportCardsFromSourceResult`) por `features/cards/model/types.ts` (local real do tipo). `community-types.ts` **não** foi tocado. Tasks ativas/concluídas 80/82 (`deck-form-view.tsx`/`card-filters.tsx`/`packages/modules/cards`) intocadas.

## Fase 43 — Detalhe do deck: metadata SSR com a sessão (task 85)
- [x] `(public)/decks/[slug]/page.tsx`: o `fetchDeck` (SSR do `generateMetadata`) passou a ler os cookies da request (`await cookies()` de `next/headers`) e **encaminhar o cookie de sessão** (`ACCESS_TOKEN_COOKIE`) no header `cookie` do `fetch` — o dono abrindo o próprio rascunho recebe 200 e o título correto (antes: 404 → "Deck não encontrado")
- [x] Resiliente: sem token ou falha do fetch → header omitido / `null` → metadata "Deck não encontrado" (sem quebrar a página)
- [x] Sem vazar: visitante/não-dono (sem token, ou token sem posse) continua 404 → "não encontrado"
- [x] `robots: { index: false }` para rascunhos (`deck.status === 'draft'`), via spread condicional — published segue indexável
- [x] `pnpm turbo typecheck lint --filter=@digimon/app-web` ✅ (2/2; 0 erros, 0 warnings; `next build` **não** executado, conforme instrução)

## Handoff (task 85)
- **Feito:** o `generateMetadata` do detalhe do deck (`/decks/[slug]`) deixa de fazer o `fetch` SSR anônimo. Agora lê `cookies()` (Server Component) e, havendo o cookie de sessão (`ACCESS_TOKEN_COOKIE` de `@digimon/auth`), encaminha `cookie: access_token=<token>` no `fetch` a `GET /decks/:slug` — o dono do rascunho recebe 200 e o título/descrição corretos; era o único ponto afetado (o conteúdo client já usava `apiClient` com `credentials: 'include'`).
- **Arquivos:** `apps/web/src/app/(public)/decks/[slug]/page.tsx`, `context/modules/web/status.md`.
- **Decisões:** (1) **`await cookies()` + `ACCESS_TOKEN_COOKIE`** (não o header `cookie` inteiro) — a spec pediu `cookies()` e o `GET /decks/:slug` só depende do access token (`apps/api` lê `readCookie(request, ACCESS_TOKEN_COOKIE)`); encaminhar só o necessário reduz superfície. (2) Header via **spread condicional** (`...(token ? { headers: { cookie } } : {})`) — sem token, a requisição segue anônima (visitante → 404, comportamento preservado) e o `exactOptionalPropertyTypes` não é violado. (3) **`robots: { index: false }` para rascunhos** com spread condicional — um rascunho (SERP) nunca deve indexar; publicado (default) segue indexável. (4) `cache: 'no-store'` mantido (o `cookies()` já torna o render dinâmico).
- **Validação:** `pnpm turbo typecheck lint --filter=@digimon/app-web` — 2/2 ✅ (0 erros, 0 warnings); `tsc --noEmit` direto também EXIT=0. `next build` **não** executado (instrução da task).
- **Fora do escopo (reportar):** nenhum. Só `page.tsx` foi tocado no código (diff confinado ao `## Escopo`); `deck-detail-view.tsx`/`use-deck.ts` (task 79), `app/(member)/decks/[slug]/editar/page.tsx` (task 86), `features/cards/**` (task 87) e `apps/api/**`/`packages/**` intocados. Observação: durante a validação o working tree trazia `features/cards/views/card-filters.tsx` (task 87) num estado intermediário que quebrou o `tsc` (identificador `FilterState` removido do import mas ainda referenciado); o erro era **fora do escopo** e já sumiu quando a task 87 concluiu o arquivo.

## Fase 45 — Gate de dono na página de editar deck (task 86)
- [x] `(member)/decks/[slug]/editar/page.tsx`: o Server Component passou a ler a sessão (`getSession()` de `@/lib/session`) e o deck via `fetch` SSR encaminhando **o cookie de sessão** (`cookies()` de `next/headers` → header `cookie`), no mesmo padrão da task 85
- [x] Deck **inexistente** → `notFound()` (`fetchDeck` devolve `null` em `!response.ok`/erro) — não-dono de rascunho não vê existência
- [x] `deck.ownerId !== session.userId` (ou sessão ausente) → `redirect('/decks/' + slug)` — o form de edição de terceiros nunca é renderizado (antes o não-dono abria o form e só falhava no PATCH 403)
- [x] Gate de Member (`(member)/layout.tsx`) intacto; ViewModel (`use-deck-form`) e View (`deck-form-view`) **não** tocados (gate é só na página)
- [x] `pnpm turbo typecheck lint --filter=@digimon/app-web` ✅ (2/2; 0 erros, 0 warnings; `next build` **não** executado)

## Handoff (task 86)
- **Feito:** a página `/decks/[slug]/editar` ganhou **gate de dono** no Server Component (continua sob `(member)`, logo já logada). Como o `GET /decks/:slug` é público para decks publicados, um não-dono conseguia abrir a página de edição e só era barrado no `PATCH` (403). Agora a página: (1) lê a sessão com `getSession()`; (2) busca o deck via `fetch` SSR encaminhando o cookie `access_token` da request — para o **dono** enxergar o próprio rascunho; (3) `notFound()` se o deck não existir (não-dono de rascunho recebe 404, sem vazar existência); (4) `redirect('/decks/' + slug)` se `deck.ownerId !== session.userId`.
- **Arquivos:** `apps/web/src/app/(member)/decks/[slug]/editar/page.tsx` (único arquivo tocado), `context/modules/{web,decks}/status.md`.
- **Decisões:** (1) **Reuso do padrão da task 85** (`cookies()` + `fetch` SSR com header `cookie`), em vez de `decksApi.getDeck` (que é client-side e não encaminha o cookie no SSR) — mantém o gate no servidor e o rascunho do dono acessível. (2) **`fetchDeck` local** na página (o web é frontend puro, ADR-007 — não há `lib/server`): `cache: 'no-store'` + `!response.ok`/erro → `null` (resiliente). (3) `!session || deck.ownerId !== session.userId` → `redirect` para a página pública do deck (fallback seguro; o layout `(member)` já garante sessão, o `!session` cobre o tipo). (4) **`apiBaseUrl`** de `@/lib/api-base` (SSR → `API_INTERNAL_URL`), coerente com a task 85. (5) Gate do grupo `(member)` (login) preservado sem alteração.
- **Validação:** `pnpm turbo typecheck lint --filter=@digimon/app-web` — 2/2 ✅ (0 erros, 0 warnings). `next build` **não** executado (conforme instrução da task). Uma execução intermediária de typecheck falhou por um erro **fora do escopo** em `features/cards/views/card-filters.tsx` (`Cannot find name 'FilterState'`) — estado transitório da task 87 concorrente; resolvido por ela no intervalo e revalidado (2/2 ok).
- **Fora do escopo (reportar):** tasks ativas 85 (`app/(public)/decks/[slug]/page.tsx`), 84 (`deck-detail-view.tsx`) e 87 (`features/cards/viewmodels/use-card-list.ts`/`card-filters.tsx`) **não** tocadas por esta task.

## Fase 44 — Detalhe do deck: `CardThumb` via `next/image` + export do deck em PNG (task 84)
- [x] `deck-detail-view.tsx`: `CardThumb` migrado de `<img>` nativo para **`next/image`** (`fill` + `sizes="40px"` sobre container `relative h-14 w-10`); **fallback preservado** — `imageUrl` ausente **ou** `onError` cai no placeholder com o número da carta
- [x] Novo ViewModel `viewmodels/use-deck-image-export.ts`: monta o documento de render (título, formato, main/egg/total, descrição, cores, capa + seções de cartas) e desenha em `<canvas>` (1200px, escala 2×), retornando `Blob` via `toBlob`; estados `idle|generating|ready|error`; download via `URL.createObjectURL` + `<a download>`; nome `deck-<slug>.png`
- [x] **Canvas taint evitado:** as artes são carregadas pela imagem **otimizada same-origin** do Next (`/_next/image?url=<encodeURIComponent(imageUrl)>&w=128|384&q=75`) — não contaminam o canvas; falha de cada imagem (`onerror`) cai num placeholder colorido, sem quebrar o export
- [x] Nova View `deck-image-export-button.tsx`: botão "Gerar imagem do deck" → "Gerando imagem…" → prévia + "Baixar PNG" + "Gerar novamente"; erro inline (heurística 9); `aria-live` com os estados
- [x] `deck-export-modal.tsx`: aba **"Imagem"** (junto de **"Texto"**) via prop **opcional** `imageExport` (`ReactNode`) — tabs acessíveis (`role=tablist/tab/tabpanel`, `aria-selected`/`aria-controls`/`aria-labelledby`); sem a prop, mantém o layout de texto anterior (retrocompatível com `community-deck-detail-view.tsx`)
- [x] `deck-detail-view.tsx` integra a View no modal (`imageExport`) e constrói o resolver de arte (`resolveHoverCard → { imageUrl, color }`)
- [x] `views/index.ts`: exporta `DeckImageExportButton` + `DeckImageExportButtonProps`
- [x] MVVM estrito: a View só dispara `generate`/`download`; canvas/fetch ficam no ViewModel
- [x] `pnpm turbo typecheck lint --filter=@digimon/app-web` ✅ (2/2; 0 erros, 0 warnings; `next build` **não** executado)

## Handoff (task 84)
- **Feito:** (1) o `CardThumb` do decklist do detalhe passou a usar `next/image` (`fill`+`sizes`, fallback por `onError` preservado); (2) nova funcionalidade de **exportar o deck como PNG** — o ViewModel `useDeckImageExport` carrega as artes via `/_next/image` (same-origin, sem contaminar o canvas) e desenha o deck completo (cabeçalho, formato, contagens, descrição, cores, capa e a decklist com arte + número + nome + quantidade) num `<canvas>` 1200px (2×); `toBlob('image/png')` → `URL.createObjectURL` → download `deck-<slug>.png`. A View `DeckImageExportButton` cobre os estados (gerando/pronto/falhou). O `DeckExportModal` ganhou a aba "Imagem" (junto da aba "Texto") por um slot `imageExport` opcional.
- **Arquivos:** `apps/web/src/features/decks/views/deck-detail-view.tsx`, `apps/web/src/features/decks/views/deck-image-export-button.tsx` (novo), `apps/web/src/features/decks/views/deck-export-modal.tsx`, `apps/web/src/features/decks/viewmodels/use-deck-image-export.ts` (novo), `apps/web/src/features/decks/views/index.ts`, `context/modules/{web,decks}/status.md`.
- **Decisões:** (1) **Canvas taint:** desenhar `imageUrl` cross-origin direto quebraria o `toDataURL`/`toBlob`; usamos `/_next/image?url=…` (servido pelo nosso domínio) — `w=128` (miniaturas) e `w=384` (capa), ambas na lista padrão de `imageSizes` do Next. (2) **Funções puras de render no arquivo do VM** (`buildDocument`, `loadImages`, `wrapText`, `drawDeckImage`, `renderDeckImage`) — o `## Escopo` só permite um arquivo de ViewModel; a View permanece só JSX. (3) **Degradação segura:** capa e miniatura falham independentemente (`loadImage` resolve `null`) → placeholder `surface-2` + faixa da cor do atributo + número; nenhuma imagem quebra o export. (4) **Prop `imageExport` opcional** no `DeckExportModal` — preserva o consumidor `community-deck-detail-view.tsx` (fora do escopo) sem tabs. (5) **Download por `objectURL`** (padrão já usado em `use-deck-import-export.downloadText`), revogando o URL no cleanup do effect. (6) `<img>` nativo **apenas** para a prévia `blob:` gerada em memória (o otimizador do `next/image` não processa `blob:`).
- **Validação:** `pnpm turbo typecheck lint --filter=@digimon/app-web` — 2/2 ✅ (0 erros, 0 warnings). `next build` **não** executado (conforme instrução da task). *Nota: a validação end-to-end do PNG (navegador) não foi executada nesta sessão; a lógica roda no cliente e depende do otimizador de imagem do Next em runtime.*
- **Fora do escopo (reportar):** nenhum. Tasks ativas 85 (`app/(public)/decks/[slug]/page.tsx`), 86 (`app/(member)/decks/[slug]/editar/page.tsx`) e 87 (`features/cards/viewmodels/use-card-list.ts`/`card-filters.tsx`) **não** tocadas. `community-deck-detail-view.tsx` **não** tocado (a prop nova é opcional).

## Fase 46 — Detalhe do torneio (`/torneios/[slug]`) + resultados (task 88)
- [x] Rota `app/(public)/torneios/[slug]/page.tsx` (nova) — conserta o 404 de `/torneios/{slug}` (a lista já linkava para lá): `generateMetadata` SSR (título/descrição/canonical/openGraph; `robots: index:false` para "não encontrado" e cancelado) + `<TournamentDetailView slug={slug} />` client
- [x] `tournament-detail-view.tsx` (nova View, só JSX): cabeçalho (nome, `StatusBadge`, formato, local, datas via `formatTournamentDate`, descrição); seções de informação (`<dl>`: formato/local/início/término/organizador); **classificação** (`results` ordenado por `position` — tabela no `sm+`, lista no mobile) com estado vazio claro; **ações por papel** (organizador OU Admin/Editor: Registrar/Editar resultados + Cancelar com confirmação inline; visitante sem ações); estados loading/erro/**404 sem vazar** ("Torneio não encontrado") e link "Voltar para torneios"
- [x] `tournament-results-form.tsx` (nova View, só JSX): linhas dinâmicas (posição/jogador/deck/record), adicionar/remover, validação local (≥1 linha com posição/jogador), feedback de sucesso/erro — submit/mutation recebidos por props do ViewModel
- [x] `use-tournament.ts` enriquecido: `isNotFound` (`ApiError.status === 404`, sem vazar cancelado de terceiros), detecção de papel (`isOrganizer`/`isManager`/`canManage` via `useSession`), `organizerName` só quando o visitante é o organizador, ações `cancel`/`addResults` (reusando `use-tournament-actions`) e **invalidação da query do torneio + listagem** após sucesso; `resultsAdded` de sucesso do form
- [x] Barrel `views/index.ts` atualizado (`TournamentDetailView`/`TournamentResultsForm` + props)
- [x] `pnpm turbo typecheck lint --filter=@digimon/app-web` ✅ (2/2; 0 erros, 0 warnings; `next build` **não** executado, conforme instrução)

## Handoff (task 88)
- **Feito:** rota `/torneios/[slug]` criada (antes 404) e detalhe do torneio com resultados. O `page.tsx` (Server Component) faz `generateMetadata` via `GET /tournaments/:slug` (encaminha o cookie de sessão para o organizador/Admin enxergarem um torneio cancelado; 404 → "Torneio não encontrado" + `index:false`) e monta a View client. A View mostra cabeçalho, informações (`<dl>`), classificação (tabela `sm+` / lista mobile, ordenada por posição) e ações por papel. O ViewModel `useTournament` passou a detectar papel, expor `isNotFound` e orquestrar cancelar/registrar resultados, invalidando a query do torneio + a listagem.
- **Arquivos:** `apps/web/src/app/(public)/torneios/[slug]/page.tsx` (novo), `apps/web/src/features/tournaments/views/tournament-detail-view.tsx` (novo), `apps/web/src/features/tournaments/views/tournament-results-form.tsx` (novo), `apps/web/src/features/tournaments/views/index.ts`, `apps/web/src/features/tournaments/viewmodels/use-tournament.ts`, `context/modules/{web,tournaments}/status.md`.
- **Decisões:** (1) **Sem `notFound()` no corpo da página** — a View renderiza o estado "Torneio não encontrado" (com "Voltar para torneios"), como no detalhe de deck (task 79); `generateMetadata` segue SSR com cookie. (2) **Organizador só quando o visitante é o dono** (não há `GET /users/:id` público) — caso contrário a linha é omitida. (3) **Cancelar só quando `status === 'published'`** (o domínio rejeita cancelar `finished`/`cancelled`) e **registrar/editar resultados quando `status !== 'cancelled'`** — espelha as transições da entidade `Tournament`. (4) **Confirmação de cancelamento inline** (`role="alertdialog"`) em vez de `window.confirm`/modal de outra feature — autossuficiente e acessível; some quando o status vira `cancelled` (após a invalidação). (5) **`use-tournament-actions.ts` fora do escopo** — a invalidação da query `['tournament', slug]` foi feita no `use-tournament.ts` via `onSuccess` das mutations (a listagem `['tournaments']` continua invalidada pelo hook de ações). (6) **Form de resultados recebe submit/mutation por props** do ViewModel (estrito MVVM: a View não usa `useMutation`); estado local das linhas via `useState` (UI-only, coerente com os demais detalhes). (7) `resultsAdded` local (o hook de ações não expõe `isSuccess`).
- **Validação:** `pnpm turbo typecheck lint --filter=@digimon/app-web` — 2/2 ✅ (0 erros, 0 warnings). `next build` **não** executado (instrução explícita da task).
- **Fora do escopo (reportar):** "Editar dados do torneio" **não** foi adicionado (rota inexistente — a task pediu para não linkar para rota que não existe); fica para uma task própria (`PATCH /tournaments/:slug` já existe na API). `packages/**`, `apps/api/**`, `features/decks/**`, `features/cards/**` e `components/**` intocados.

## Fase 47 — HTTP 404 real nas páginas de detalhe (deck e torneio) (task 91)
- [x] `(public)/decks/[slug]/page.tsx` e `(public)/torneios/[slug]/page.tsx`: o `fetchDeck`/`fetchTournament` (SSR, encaminhando o cookie de sessão) passou a retornar um **resultado discriminado** (`ok` | `not-found` | `error`) em vez de `T | null` — distingue 404 de erro transitório
- [x] O **corpo** do Server Component agora busca o recurso e chama `notFound()` (de `next/navigation`) quando o resultado é `not-found` → **HTTP 404 real** (antes: 200 com "não encontrado" renderizado no cliente)
- [x] Sem vazar rascunho/cancelado de terceiros: sem cookie de dono a API responde 404 → a página também responde 404
- [x] Recursos existentes (publicados e rascunho/cancelado do dono) continuam **200** — o dono recebe `ok` (o cookie de sessão vai no header `cookie`)
- [x] `generateMetadata` mantido, reusando o mesmo `fetchDeck`/`fetchTournament` (o fetch é deduplicado pelo React dentro da mesma renderização — sem request duplicado); `robots`/`canonical`/`openGraph` preservados (`index:false` para rascunho/cancelado e "não encontrado")
- [x] Erro que **não** seja 404 (ex.: API fora do ar) mantém o comportamento anterior: renderiza a View, que trata o erro no cliente (não respondemos 404 indevidamente)
- [x] Views/ViewModels **não** tocados (só as páginas SSR)
- [x] `pnpm turbo typecheck lint --filter=@digimon/app-web` ✅ (2/2; 0 erros, 0 warnings; `next build` **não** executado, conforme instrução)

## Handoff (task 91)
- **Feito:** as páginas de detalhe de **deck** (`/decks/[slug]`) e **torneio** (`/torneios/[slug]`) passam a responder **HTTP 404 real** para slug inexistente (ou rascunho/cancelado de terceiro), via `notFound()` no corpo do Server Component. Antes, o corpo só montava a View client e o 404 era "renderizado" no cliente sobre um 200 — ruim para SEO. O `fetchDeck`/`fetchTournament` do SSR (que já lia `cookies()` e encaminhava `ACCESS_TOKEN_COOKIE`) evoluiu de `T | null` para um resultado discriminado (`{status:'ok'|'not-found'|'error'}`), permitindo responder 404 **apenas** no caso 404.
- **Arquivos:** `apps/web/src/app/(public)/decks/[slug]/page.tsx`, `apps/web/src/app/(public)/torneios/[slug]/page.tsx`, `context/modules/web/status.md`. *(Únicos arquivos tocados no código — diff confinado ao `## Escopo`.)*
- **Decisões:** (1) **Resultado discriminado** (`ok`/`not-found`/`error`) em vez de `T | null` — só o 404 vira `notFound()`; um 500/timeout (API indisponível) continua renderizando a View (o cliente mostra o erro), evitando 404 falso que envenenaria o índice de busca. (2) **`generateMetadata` reusa o mesmo `fetchDeck`/`fetchTournament`** e trata `not-found`/`error` do mesmo modo ("…não encontrado") — o React deduplica o `fetch` idêntico dentro da mesma renderização (URL+opções iguais), então não há request duplicado apesar da clareza do helper. (3) Reuso do padrão de `noticias/[slug]` (`notFound()` de `next/navigation`) — a diferença é que aqui o fetch encaminha o cookie de sessão (task 85) e distingue 404 de erro. (4) Views/ViewModels intocados (só a página SSR), conforme a spec e os escopos das tasks 89/90/92.
- **Validação:** `pnpm turbo typecheck lint --filter=@digimon/app-web` — 2/2 ✅ (0 erros, 0 warnings). `next build` **não** executado (conforme instrução). O critério "slug inexistente → HTTP 404" decorre de `notFound()` (comportamento nativo do App Router); "publicado/rascunho-do-dono → 200" decorre de `ok` com o cookie de sessão encaminhado.
- **Fora do escopo (reportar):** nenhum. `components/site-footer.tsx` (task 89) e `features/tournaments/views/tournament-results-form.tsx` (task 92) aparecem modificados no working tree por tasks concorrentes — **não** foram tocados por esta task.

## Fase 47 — Form de resultados: linha com `key` estável + posição sequencial (task 92)
- [x] `tournament-results-form.tsx`: cada linha ganhou `id` estável (`crypto.randomUUID()` com fallback de contador) usado como **`key`** do React — elimina reuso incorreto de inputs ao remover linha do meio
- [x] **Posição derivada da ordem** (`index + 1`) no submit — o input editável de posição foi substituído por um display somente-leitura; sem edição manual, não há mais posições duplicadas
- [x] `addRow`/`removeRow`/`updateRow` passam a operar por `id` (não por índice); `id`/`htmlFor` de acessibilidade seguem por índice para evitar mismatch de hidratação SSR (o `id` de linha é usado só como `key`, nunca renderizado)
- [x] Comportamento preservado: adicionar/remover linha, validação local (toda linha exige `player`), envio via `onSubmit` (`useAddResults` → `POST /tournaments/:slug/results`), feedback sucesso/erro, `deck`/`record` opcionais (`null` quando vazios)
- [x] `pnpm turbo typecheck lint --filter=@digimon/app-web` ✅ (2/2; 0 erros, 0 warnings; `next build` **não** executado)

## Handoff (task 92)
- **Feito:** corrigido o nit apontado na revisão da task 88. As linhas do form de resultados agora têm identidade estável (`id`) usada como `key`, e a posição é derivada da ordem (`index + 1`) no momento do submit — o campo de posição deixou de ser editável (virou display), o que **elimina por construção** posições duplicadas após remover/adicionar linhas do meio.
- **Arquivos:** `apps/web/src/features/tournaments/views/tournament-results-form.tsx`, `context/modules/web/status.md`.
- **Decisões:** (1) `id` de linha via `crypto.randomUUID()` (fallback contador) usado **apenas** como `key` — nunca renderizado, para não gerar mismatch de hidratação SSR; `id`/`htmlFor` dos inputs permanecem por índice (determinístico). (2) Posição derivada de `index + 1` no submit em vez de renumerar o estado a cada add/remove — mais simples e sem estados intermediários inconsistentes. (3) Display de posição como `border`/`bg-surface-2` somente-leitura com `sr-only` "Posição" (acessível), preservando a grade de 5 colunas do desktop. (4) Item opcional da task (ordenar/duplicar linha) **não** implementado — sem tarefa bônus.
- **Validação:** `pnpm turbo typecheck lint --filter=@digimon/app-web` — 2/2 ✅ (0 erros, 0 warnings). `next build` **não** executado (conforme instrução).
- **Fora do escopo (reportar):** tasks ativas 89 (`web-logo-rodape-distorcao`), 90 (`form/detalhe` de torneio) e 91 (`404` de torneios) não tocadas; `components/**`, `apps/api/**` e demais features intocados.

## Fase 48 — Logo do rodapé distorcida (stretch do flex column) (task 89)
- [x] Causa confirmada: em `site-footer.tsx` o `<Image>` da logo fica dentro de `flex max-w-xs flex-col` → `align-items: stretch` (default) esticava o item no eixo cruzado (**horizontal**): largura computada **320px** com altura **38px** → aspecto **8.42** vs. **3.52** da arte (937×266)
- [x] `site-footer.tsx`: logo recebeu **`self-start`** (`align-self: flex-start`) — desliga o stretch; `w-auto` passa a derivar a largura da altura × proporção → **≈134px** para 38px de altura, aspecto ≈3.52
- [x] `site-header.tsx`: **não** alterado — o `Brand` está num `flex row` (eixo cruzado vertical) com `h-9` explícito, então a largura já deriva do aspecto (≈127×36). Layout do header intacto
- [x] `width`/`height` (937×266) e `alt` ("Digimon Card Game") preservados
- [x] `pnpm turbo typecheck lint --filter=@digimon/app-web` ✅ (2/2; 0 erros, 0 warnings; `next build` **não** executado, conforme instrução)

## Handoff (task 89)
- **Feito:** corrigida a distorção da logo no rodapé. A imagem estava num container `flex flex-col`, onde o `align-items: stretch` (default) estica o item no eixo cruzado — horizontal —, sobrepondo-se ao `w-auto` e forçando a largura ao `max-w-xs` (320px) para 38px de altura (aspecto 8.42 vs. 3.52 natural). Adicionado `self-start` ao `<Image>`: `align-self: flex-start` desliga o stretch e a largura volta a ser derivada da altura × proporção (≈134px, aspecto ≈3.52). O header já estava correto (flex row → largura derivada do aspecto) e **não** foi tocado.
- **Arquivos:** `apps/web/src/components/site-footer.tsx` *(único arquivo de código tocado)*. `site-header.tsx` inspecionado e mantido (já correto). `context/modules/web/status.md`.
- **Decisões:** (1) `self-start` no próprio `<Image>` em vez de `items-start` no container `flex flex-col` — a mudança fica confinada ao elemento da logo, sem alterar o alinhamento das outras linhas do bloco (span do wordmark e parágrafo), mantendo o layout do design. (2) `object-contain` (alternativa citada na task) seria redundante: com o stretch desligado e `w-auto`, a caixa já assume exatamente o aspecto intrínseco. (3) Header intocado — não havia stretch (eixo cruzado do flex row é vertical e `h-9` é explícito).
- **Validação:** `pnpm turbo typecheck lint --filter=@digimon/app-web` — 2/2 ✅ (0 erros, 0 warnings). `next build` **não** executado (instrução explícita da task). O critério de aspecto (largura ≈ altura × 937/266 ≈ 134px para 38px) decorre do comportamento nativo do flexbox (`self-start` + `w-auto`), verificável no browser.
- **Fora do escopo (reportar):** nenhum. Tasks concorrentes 90 (`torneios/.../editar`), 91 (`decks|torneios/[slug]/page.tsx`) e 92 (`tournament-results-form.tsx`) aparecem modificadas no working tree — **não** tocadas por esta task.

## Fase 49 — Editar dados do torneio (`/torneios/[slug]/editar`) (task 90)
- [x] Rota `app/(member)/torneios/[slug]/editar/page.tsx` (Server Component, **nova**): gate de login pelo layout do grupo `(member)`; **gate de dono** server-side (`getSession` + fetch SSR com o cookie de sessão — organizador OU Admin/Editor); inexistente → `notFound()`; não autorizado → `redirect('/torneios/:slug')`; container largo (`max-w-[760px]`) + cabeçalho "Editar torneio"
- [x] `use-tournament-form.ts`: modo edição (`{ mode, slug, initial? }`) — carrega o torneio (`getTournament`) e salva via `updateTournament` (**PATCH**); hidratação única (ISO → `datetime-local`); invalida `['tournaments']` + `['tournament', slug]`
- [x] `tournament-form-view.tsx`: props `mode`/`slug` (CTA "Salvar alterações"; slug somente-leitura em edição; estados loading/404/erro/**cancelado**; navega ao detalhe ao salvar) — fluxo de criação **preservado**
- [x] `tournament-detail-view.tsx`: link **Editar** (`/torneios/{slug}/editar`) para `canManage` quando `status !== 'cancelled'`
- [x] Barrel `views/index.ts`: re-export de `TournamentFormMode`
- [x] `pnpm turbo typecheck lint --filter=@digimon/app-web` ✅ (2/2; 0 erros, 0 warnings; `next build` **não** executado, conforme instrução)

## Handoff (task 90)
- **Feito:** edição de torneio ponta-a-ponta sobre o `PATCH /tournaments/:slug` já existente. O `useTournamentForm` ganhou `mode: 'edit'` (query por slug com dedup da `['tournament', slug]`, hidratação única do form, mutation alternando `create`/`update`). A nova rota `(member)/torneios/[slug]/editar` faz o gate de dono server-side (organizador OU Admin/Editor) com o cookie de sessão — 404 para inexistente/terceiro-cancelado e redirect ao detalhe para quem não gerencia. O detalhe passou a exibir "Editar" para quem gerencia (some para cancelado/visitante).
- **Arquivos:** `apps/web/src/app/(member)/torneios/[slug]/editar/page.tsx` (novo), `apps/web/src/features/tournaments/views/tournament-form-view.tsx`, `apps/web/src/features/tournaments/viewmodels/use-tournament-form.ts`, `apps/web/src/features/tournaments/views/tournament-detail-view.tsx`, `apps/web/src/features/tournaments/views/index.ts`, `context/modules/{web,tournaments}/status.md`.
- **Decisões:** (1) **Slug não é editável** — o PATCH é `.strict()` e aceita `slug`, mas mudar o endereço quebraria URLs e não está no pedido; em edição o VM não envia `slug` e a View mostra o endereço atual como texto. (2) **Descrição/`dateEnd` vazios → `null`** no PATCH (schema nullable), para permitir limpar os campos. (3) **Torneio cancelado**: em vez de deixar o PATCH falhar, a View detecta `isCancelled` (do torneio carregado) e mostra aviso + link ao detalhe (prevenção/feedback, Nielsen 5/9); o link "Editar" do detalhe já não aparece. (4) Pós-salvar em edição: `router.push('/torneios/{slug}')` (página server não passa `onSuccess`); criação mantém o box de sucesso inline. (5) **Container largo** (`max-w-[760px]`) — o form é de coluna única; divergência aceita em relação ao `AuthShell` (card 420px) do criar. (6) `tournamentsApi`/Model **intocado** (reuso de `updateTournament`).
- **Validação:** `pnpm turbo typecheck lint --filter=@digimon/app-web` — 2/2 ✅ (0 erros, 0 warnings). `next build` **não** executado (instrução explícita da task); smoke de runtime (PATCH + redirect/404) não executado nesta sessão.
- **Fora do escopo (reportar):** nenhum. A página pública `app/(public)/torneios/[slug]/page.tsx` (task 91 ativa/concorrente) **não** foi tocada; `components/site-footer.tsx` (89) e `tournament-results-form.tsx` (92) aparecem modificados no working tree por tasks concorrentes — **não** tocados por esta task.

## Fase 50 — Editar torneio: não dar 404 falso em erro transitório (task 93)
- [x] `(member)/torneios/[slug]/editar/page.tsx`: o `fetchTournament` (SSR, encaminhando o cookie de sessão) passou a retornar um **resultado discriminado** (`ok` | `not-found` | `error`) — alinhado ao padrão da task 91 (antes retornava `Tournament | null` e dava 404 em qualquer `!ok`)
- [x] **Corpo do Server Component:** `not-found` (404 da API) → `notFound()` (404 real); `error` (5xx/timeout/exceção) → **não** chama `notFound()`; renderiza `TournamentFormView` (o client trata o `loadError` com retry); `ok` → gate `canManage`; sem permissão → `redirect('/torneios/:slug')`
- [x] Comportamento preservado: torneio inexistente/terceiro-cancelado → 404; dono/Admin/Editor → 200; sem permissão → redirect ao detalhe
- [x] ViewModel/View do form **não** tocados
- [x] `pnpm turbo typecheck lint --filter=@digimon/app-web` ✅ (2/2; 0 erros, 0 warnings; `next build` **não** executado, conforme instrução)

## Handoff (task 93)
- **Feito:** a página `(member)/torneios/[slug]/editar` deixou de devolver **HTTP 404 falso** quando a API está fora do ar (5xx/timeout/exceção). O `fetchTournament` SSR evoluiu de `Tournament | null` para um resultado discriminado (`{status:'ok'|'not-found'|'error'}`), conforme o padrão introduzido na task 91 nas páginas de detalhe. No corpo: `not-found` → `notFound()` (404 real para inexistente/terceiro-cancelado); `error` → renderiza a View de edição (o cliente trata o erro de fetch, com retry no `TournamentFormView`); `ok` → gate `canManage` (organizador OU Admin/Editor) com `redirect('/torneios/:slug')` para quem não gerencia.
- **Arquivos:** `apps/web/src/app/(member)/torneios/[slug]/editar/page.tsx` *(único arquivo de código tocado)* + `context/modules/web/status.md`.
- **Decisões:** (1) Mesmo formato `FetchResult<T>` + ordem de checagem da task 91 (404 antes de 5xx) para consistência entre as páginas SSR. (2) No `error`, o gate de dono não é aplicável (não há `tournament`); renderiza-se a View e o próprio client (que refaz `GET /tournaments/:slug`) resolve 404/erro/permissão — a API revalida a autorização de qualquer forma. (3) `error` deliberadamente ignora o `!session` (o gate de login já vive no layout do grupo `(member)`, que redireciona o anônimo) — o `!session` só permanece no ramo `ok`, preservando o comportamento da task 90.
- **Validação:** `pnpm turbo typecheck lint --filter=@digimon/app-web` — 2/2 ✅ (0 erros, 0 warnings). `next build` **não** executado (instrução explícita da task). O critério "erro transitório ≠ 404" decorre de só `not-found` chamar `notFound()`; "inexistente/cancelado → 404" e "dono → 200" decorrem de `not-found`/`ok` com o cookie de sessão encaminhado.
- **Fora do escopo (reportar):** nenhum. ViewModel (`use-tournament-form.ts`) e View (`tournament-form-view.tsx`) **não** tocados; páginas públicas de detalhe (task 91) intactas.

## Fase 51 — `/torneios/novo` em container largo (task 94)
- [x] `(member)/torneios/novo/page.tsx`: abandonou o `AuthShell` (card estreito ~420px) por um **container largo** `mx-auto w-full max-w-[760px] px-4 py-10 lg:px-12` — mesmo padrão de `torneios/[slug]/editar` (task 90) e `decks/novo` (task 75)
- [x] Cabeçalho próprio: `<h1>` `font-display text-3xl font-bold` "Publicar torneio" + subtítulo `text-ink-soft` (`sm:text-4xl lg:text-[40px]`), alinhado à tipografia do design system e às demais páginas de trabalho
- [x] `metadata.title` alinhado ao cabeçalho ("Publicar torneio"); `robots: { index: false }` preservado
- [x] Gate de Member preservado: a rota permanece sob `(member)` (o `layout.tsx` do grupo é o Server Component que redireciona o anônimo para `/login` — nada removido/alterado)
- [x] `AuthShell`/`AuthHeader`/`AuthBenefits` (`features/auth`) **não** alterados (usados por login/registro); `TournamentFormView` **não** tocado
- [x] `pnpm turbo typecheck lint --filter=@digimon/app-web` ✅ (2/2; 0 erros, 0 warnings; `next build` **não** executado, conforme instrução)

## Handoff (task 94)
- **Feito:** a página `/torneios/novo` deixa de usar o `AuthShell` (card estreito ~420px) e passa a montar um **container largo** (`mx-auto w-full max-w-[760px] px-4 py-10 lg:px-12`) com cabeçalho tipográfico próprio ("Publicar torneio" + subtítulo), ficando consistente com `torneios/[slug]/editar` (task 90) e `decks/novo` (task 75). O gate de Member permanece — a rota continua sob o grupo `(member)`, cujo `layout.tsx` é o Server Component que exige sessão e redireciona o anônimo.
- **Arquivos:** `apps/web/src/app/(member)/torneios/novo/page.tsx` *(único arquivo de código tocado)* + `context/modules/web/status.md`.
- **Decisões:** (1) Removidos os componentes `AuthShell`/`AuthHeader`/`AuthBenefits` da página e reconstruído o cabeçalho com a mesma tipografia das listagens/demais páginas de trabalho (`font-display`, `text-ink`/`text-ink-soft`), sem acoplar `AuthHeader` (que pertence ao shell de auth). (2) `max-w-[760px]` idêntico ao de `torneios/[slug]/editar` (form de coluna única) — escolhido em vez do `max-w-[1440px]` de `decks/novo` (deck builder de 2 colunas). (3) `metadata.title` alinhado ao `<h1>` ("Publicar torneio") para consistência; `robots: { index: false }` mantido. (4) Gate de login intocado (vive em `(member)/layout.tsx`, fora do escopo).
- **Validação:** `pnpm turbo typecheck lint --filter=@digimon/app-web` — 2/2 ✅ (0 erros, 0 warnings). `next build` **não** executado (instrução explícita da task). Critério "gate de Member preservado" decorre de a rota permanecer no grupo `(member)` (nenhuma proteção movida/removida).
- **Fora do escopo (reportar):** nenhum. `features/auth/**` (`AuthShell`/`AuthHeader`/`AuthBenefits`) e `features/tournaments/views/tournament-form-view.tsx` (`TournamentFormView`) **não** tocados; `apps/api/**` e `packages/**` intocados.

## Fase 52 — Página 404 brandada (task 95)
- [x] `app/not-found.tsx` (novo, Server Component): "404" decorativo (`aria-hidden`, `font-display`, `text-primary`) + `<h1>` "Página não encontrada" (`font-display`, `text-ink`) + texto de apoio (`text-ink-soft`) explicando o que houve
- [x] Ação primária "Voltar para a home" via `buttonVariants({ variant: 'primary' })` aplicado a `next/link` (CTA de marca, sem recriar `Button`)
- [x] Navegação secundária (`<nav aria-label="Seções do portal">`) para **Notícias / Cartas / Decks / Torneios** (`next/link`, foco visível `focus-visible:ring-primary/60`) — heurística 9 ("recuperar do erro")
- [x] `metadata` com `title: 'Página não encontrada'` + `robots: { index: false, follow: false }` (Next injeta `noindex` em 404 e responde **HTTP 404** automaticamente)
- [x] Tokens do design system apenas (`text-ink`/`text-ink-soft`/`text-ink-faint`/`text-primary`/`border`/`font-display`); container `max-w-[1440px]` alinhado ao chrome; `layout.tsx`/chrome **não** alterados
- [x] `pnpm turbo typecheck lint --filter=@digimon/app-web` ✅ (2/2; 0 erros, 0 warnings; `next build` **não** executado, conforme instrução)

## Handoff (task 95)
- **Feito:** página 404 customizada e brandada em `apps/web/src/app/not-found.tsx` (Server Component do App Router). Cobre tanto rotas inexistentes (`/uma-rota-qualquer`) quanto os `notFound()` das páginas de detalhe (tasks 90/91). Mostra o número "404" decorativo + título + explicação e oferece a ação "Voltar para a home" (CTA primário) e links para as principais seções (Notícias, Cartas, Decks, Torneios).
- **Arquivos:** `apps/web/src/app/not-found.tsx` (novo) + `context/modules/web/status.md`. *(Único arquivo de código tocado — diff confinado ao `## Escopo`.)*
- **Decisões:** (1) **`buttonVariants` + `next/link`** para o CTA primário — a arte expõe `Button` como `<button>`, e um link navegável é o padrão já usado no app (`buttonVariants` aplicado a `Link`); sem recriar primitivas. (2) **`metadata` no `not-found.tsx`** (suportado pelo Next ≥15.4/16) com `robots: index:false` — o Next injeta `noindex` e responde HTTP 404 nativamente para a página de not-found. (3) **Sem alterar** `layout.tsx` nem o chrome — o `SiteChrome` do root já envolve o 404 com header/footer (o `not-found` cobre rotas fora de `/admin`/`/em-breve`). (4) "404" com `aria-hidden` (decorativo; o `h1` carrega o significado) — evita ruído para leitores de tela. (5) Lista de seções segue a `NAV_ITEMS` do header (as 4 principais, sem Simuladores/busca) por instrução da task.
- **Validação:** `pnpm turbo typecheck lint --filter=@digimon/app-web` — 2/2 ✅ (0 erros, 0 warnings). `next build` **não** executado (instrução explícita da task). O critério "HTTP 404" decorre do comportamento nativo do `not-found.tsx` do App Router.
- **Fora do escopo (reportar):** `apps/web/src/app/(member)/torneios/novo/page.tsx` (task 94) e `apps/web/src/features/decks/viewmodels/use-deck-image-export.ts` + `context/modules/decks/status.md` (task 96) aparecem modificados no working tree por tasks concorrentes — **não** tocados por esta task.

## Fase 53 — Home: esconder "Junte-se à comunidade" quando logado (task 100)
- [x] `features/content/views/home-view.tsx` (client) passa a consumir o ViewModel compartilhado `useSession()` de `@/lib/use-session`
- [x] O bloco `<CommunityCta />` só renderiza **deslogado**: `!sessionLoading && !user` — some para o usuário logado
- [x] Sem flash: enquanto `loading` (sessão não resolvida) o CTA **não** é renderizado (alternativa aceita na spec: `loading || user` esconde)
- [x] `CommunityCta` em si, header/`UserMenu` e o resto da home **não** alterados
- [x] MVVM: `useSession` é ViewModel compartilhado; a View só decide renderizar (sem fetch próprio)
- [x] `pnpm turbo typecheck lint --filter=@digimon/app-web` ✅ (2/2; 0 erros, 0 warnings; `next build` **não** executado, conforme instrução)

## Handoff (task 100)
- **Feito:** na Home, a área "Junte-se à comunidade" (botões Entrar / Criar conta grátis) deixa de aparecer para o usuário autenticado. A `HomeView` consome `useSession()` (store compartilhado da task 59) e renderiza `<CommunityCta />` apenas quando `!sessionLoading && !user`. Enquanto a sessão ainda está `loading`, o CTA não é renderizado — evita o "flash" de aparecer e sumir logo após o `/auth/me` resolver.
- **Arquivos:** `apps/web/src/features/content/views/home-view.tsx` *(único arquivo de código tocado)* + `context/modules/web/status.md` + `context/modules/content/status.md`.
- **Decisões:** (1) Guard `!sessionLoading && !user` (equivalente a "não renderizar quando `loading || user`", como a spec permitiu) — o estado "sessão não resolvida" esconde o CTA em vez de assumir deslogado, eliminando o flash. (2) `useSession` é um ViewModel compartilhado (store de módulo via `useSyncExternalStore`); a View apenas decide renderizar — MVVM preservado (nenhum `useQuery`/fetch na View). (3) `CommunityCta`, header/`UserMenu` e o restante da Home intocados.
- **Validação:** `pnpm turbo typecheck lint --filter=@digimon/app-web` — 2/2 ✅ (0 erros, 0 warnings). `next build` **não** executado (instrução explícita da task).
- **Fora do escopo (reportar):** nenhum. A task 101 (`backend-jobs-ttl-paginacao`) está ativa em paralelo; seus arquivos não foram tocados.

## Fase 29 — Slots de anúncio no portal (task 104)
- [x] Feature `ads` (MVVM): `model/{types,ads-api}`, `viewmodels/{use-ads,index}` — sem importar `@digimon/ads` no client (tipos literais)
- [x] Componente `AdSlot` (`components/ad-slot.tsx`): reserva altura (anti-CLS), `<img>` nativo (host dinâmico), `rel="sponsored nofollow noopener"` p/ affiliate/sponsor + rótulo de divulgação, click tracking best-effort; export no barrel
- [x] Posições: `home-top` + `home-infeed` (`home-view`), `article-inline` (`post-article`), `cards-top` (`cards-view`)
- [x] Typecheck + Lint `@digimon/app-web` — 2/2 ✅ (0 erros, 0 warnings)
- [x] `next build` **não** executado (instrução da task)

## Handoff (task 104)
- **Feito:** portal passa a renderizar anúncios por placement via `<AdSlot>` (house/afiliado/patrocínio), consumindo `GET /ads?placement=&limit=` e `POST /ads/:id/click`.
- **Arquivos:** `apps/web/src/features/ads/**` (novo), `apps/web/src/components/ad-slot.tsx` (novo), `apps/web/src/components/index.ts`, `apps/web/src/features/content/views/home-view.tsx`, `apps/web/src/features/content/views/post-article.tsx`, `apps/web/src/features/cards/views/cards-view.tsx` + `context/modules/{ads,web}/status.md`.
- **Decisões:** (1) rotação por peso no cliente (pool default 5 p/ item único; `limit=count` no in-feed); (2) `<img>` nativo — host do criativo é dinâmico, `next.config.ts` intocado; (3) skeleton com altura reservada + `null` quando vazio; (4) `rel` patrocinado só p/ affiliate/sponsor. Detalhes no `context/modules/ads/status.md`.
- **Validação:** `pnpm turbo typecheck lint --filter=@digimon/app-web` ✅. `next build` não executado.
- **Pendências/fora do escopo (reportar):** nenhuma. Admin de anúncios fica na task 105.

## Fase 30 — Admin de anúncios (task 105)
- [x] Model `features/admin/model/ads-admin-api.ts`: `adsAdminApi` (list/create/update/remove nas rotas `/ads/admin`) reusando os tipos da feature `ads` (sem `@digimon/ads` no client)
- [x] ViewModels `features/admin/viewmodels/use-admin-ads.ts`: `useAdminAds` (filtros placement/kind/isActive + paginação + ativar/desativar + excluir) e `useAdminAdForm` (form criar/editar + validação leve)
- [x] View `features/admin/views/admin-ads-view.tsx` (só JSX): tabela (`AdminTable`) + formulário inline com todos os campos (placements multi-seleção, tipo, link de destino com dica por tipo, janela startAt/endAt, prioridade, disclosure, nova aba)
- [x] Página `/admin/anuncios` (`app/admin/anuncios/page.tsx`, server, `robots: index:false`) + item **"Anúncios"** (`Megaphone`) no `AdminShell`, oculto para editor
- [x] Barrel `features/admin/index.ts` atualizado
- [x] Typecheck + Lint `@digimon/app-web` — 2/2 ✅ (0 erros, 0 warnings); `pnpm harness check` ✅
- [x] `next build` **não** executado (instrução da task)

## Handoff (task 105)
- **Feito:** painel `/admin/anuncios` com CRUD de anúncios (house/patrocínio/afiliado) via rotas admin reais (`GET/POST /ads/admin`, `PATCH/DELETE /ads/admin/:id`), MVVM estrito. Detalhes de implementação/decisões em `context/modules/ads/status.md` (Handoff task 105).
- **Arquivos:** `apps/web/src/features/admin/model/ads-admin-api.ts` (novo), `apps/web/src/features/admin/viewmodels/use-admin-ads.ts` (novo), `apps/web/src/features/admin/views/admin-ads-view.tsx` (novo), `apps/web/src/features/admin/views/admin-shell.tsx`, `apps/web/src/features/admin/index.ts`, `apps/web/src/app/admin/anuncios/page.tsx` (novo) + `context/modules/{ads,web}/status.md`.
- **Decisões:** (1) **escopo estendido a `admin-shell.tsx`** — o item de navegação era exigido pela task mas não constava no `## Escopo`; a instrução do usuário autorizou a extensão (item oculto para editor). (2) formulário **inline** na mesma página (o escopo só prevê uma rota); painel controlado pelo ViewModel (`openCreate`/`openEdit`/`closeForm`) e form remontado por `key`. (3) reuso dos tipos literais de `features/ads` + payload próprio espelhando os schemas do backend. (4) sem RHF/Zustand (consistência com as features admin existentes); validação leve no cliente.
- **Validação:** `pnpm turbo typecheck lint --filter=@digimon/app-web` ✅ (2/2 — 0 erros/0 warnings). `pnpm harness check` ✅. `next build` não executado (instrução da task).
- **Pendências/fora do escopo (reportar):** nenhuma. `@digimon/ads` não foi importado no client; sem novas dependências.

## Fase 31 — Gate de editor em /admin/anuncios (task 106)
- [x] `app/admin/anuncios/page.tsx` virou **Server Component `async`** com o mesmo gate de `/admin/usuarios`: lê a sessão e `redirect('/admin')` se o papel **não** for `administrator` (e `redirect('/login')` quando não há sessão)
- [x] Editor que digitar a URL deixa de ver o 403 da listagem — é redirecionado antes de renderizar (consistente com `usuarios`/`configuracoes`)
- [x] Administrator acessa normalmente; `metadata`/`robots: { index: false }` preservados
- [x] Reuso de `getAdminSession` (`@/features/admin/model/session`, que delega a `getSession` de `@/lib/session`) — mesmo import das páginas admin irmãs
- [x] View/ViewModel e backend **não** tocados (o backend já revalida)
- [x] `pnpm turbo typecheck lint --filter=@digimon/app-web` ✅ (2/2; 0 erros, 0 warnings; `next build` **não** executado, conforme instrução)

## Handoff (task 106)
- **Feito:** `/admin/anuncios` passa a redirecionar o editor (ou qualquer não-administrator) para `/admin` antes de renderizar — antes o editor via a URL e só recebia o 403 da listagem admin. Fecha a pendência da revisão do Lote 15, deixando a rota consistente com `/admin/usuarios` e `/admin/configuracoes`.
- **Arquivos:** `apps/web/src/app/admin/anuncios/page.tsx` *(único arquivo de código tocado)* + `context/modules/web/status.md`.
- **Decisões:** (1) **Reuso de `getAdminSession`** (`@/features/admin/model/session`) em vez de importar `getSession` de `@/lib/session` diretamente — é o import das páginas admin irmãs (`usuarios`, `configuracoes`) e delega à mesma `getSession`, logo é o "mesmo gate"; a consistência com `usuarios` era o critério da task. (2) **`redirect('/login')` sem sessão** além do `redirect('/admin')` para não-administrator — replica integralmente o gate de `usuarios` (o `admin/layout.tsx` já garante sessão, mas a checagem mantém o padrão). (3) `async` no Server Component é necessário para `await getAdminSession()` (lê `cookies()`).
- **Validação:** `pnpm turbo typecheck lint --filter=@digimon/app-web` — 2/2 ✅ (0 erros, 0 warnings). `next build` **não** executado (instrução da task). Critério "editor → `/admin`" decorre do `redirect`; "administrator → 200" do fluxo normal.
- **Fora do escopo (reportar):** nenhum. Tasks concorrentes 108 (`features/legal/**`, páginas legais) e 109 (`features/consent/**`) aparecem no working tree — **não** tocadas por esta task.

## Fase 32 — Consentimento de cookies / LGPD (task 109)
- [x] Model `features/consent/model/consent.ts`: tipos (`ConsentState` versionado, `ConsentCategory`, `ConsentPreferences`) + store de módulo (`getConsent`/`setConsent`/`subscribe`/`hasDecided`) com persistência em `localStorage['dcgb.consent.v1']` sob try/catch (SSR/privacidade) + helper de gate `canLoadScript('analytics'|'ads')` documentado
- [x] ViewModel `features/consent/viewmodels/use-consent.ts`: `useSyncExternalStore` sobre o store → `{ consent, hasDecided, acceptAll, rejectNonEssential, savePreferences, hasConsent }`; `hasConsent('essential')` sempre `true`
- [x] View `components/consent-banner.tsx` (client, só JSX): banner fixo no rodapé até decidir (texto curto + **Aceitar todos** / **Rejeitar não essenciais** / **Preferências** + link `/cookies`) e modal de preferências com toggles de `analytics`/`ads` (essenciais sempre ativos e explicados) + **Salvar preferências**; some após decidir
- [x] Integração: `<ConsentBanner />` no `app/layout.tsx` (root, uma vez)
- [x] Barrel `components/index.ts` exporta `ConsentBanner`
- [x] Typecheck + Lint `@digimon/app-web` — 2/2 ✅ (0 erros, 0 warnings); `pnpm harness check` ✅
- [x] `next build` **não** executado (instrução da task)

## Handoff (task 109)
- **Feito:** gestão de consentimento de cookies (LGPD) no cliente — banner até o usuário decidir, preferências granulares e gancho para só carregar scripts não-essenciais com consentimento. Essenciais (autenticação) são isentos e não passam pelo gate.
- **Arquivos:** `apps/web/src/features/consent/model/consent.ts` (novo), `apps/web/src/features/consent/viewmodels/use-consent.ts` (novo), `apps/web/src/features/consent/viewmodels/index.ts` (novo), `apps/web/src/components/consent-banner.tsx` (novo), `apps/web/src/components/index.ts`, `apps/web/src/app/layout.tsx` + `context/modules/web/status.md`.
- **Decisões:** (1) store de módulo com `useSyncExternalStore` (padrão do `use-session.ts`) — `getServerSnapshot` retorna `null`, então o SSR renderiza o banner e o cliente reconcilia após ler o `localStorage` (sem mismatch de hidratação; usuário que já decidiu vê sumir no primeiro paint cliente). (2) persistência versionada (`dcgb.consent.v1`); versão divergente/JSON inválido → tratado como "não decidiu". (3) `hasDecided()` do Model é a verificação pura; o ViewModel expõe `hasDecided` derivado do snapshot observável (reativo). (4) gate de scripts via `canLoadScript(category)` no Model + `hasConsent(category)` no ViewModel; hoje não há scripts de terceiros — só o gancho. (5) banner fixo (`fixed`, `z-50`) não empurra o layout; marcado como `role="region"` + `aria-live="polite"` (barra não-modal) e o painel de preferências como `role="dialog" aria-modal`. (6) `useState` local na View apenas para UI (abrir painel/valores dos toggles) — sem `useQuery`/`useMutation`/`useForm`.
- **Validação:** `pnpm turbo typecheck lint --filter=@digimon/app-web` — 2/2 ✅ (0 erros, 0 warnings). `next build` **não** executado (instrução da task).
- **Pendências/fora do escopo (reportar):** o link `/cookies` depende da **task 108** (páginas legais) ainda ativa — até lá aponta para rota inexistente (404). Não ajustado aqui (fora do escopo). Nenhum arquivo de `site-footer.tsx`/páginas legais foi tocado.

## Fase 33 — Páginas legais (Privacidade, Termos, Cookies) + links no rodapé (task 108)
- [x] Feature `features/legal/**` (MVVM): `model/types.ts` (contrato `LegalDocument`/`LegalSection`/`LegalBlock`/`LegalInline`), `model/content.ts` (fonte única dos 3 documentos em pt-BR + `LEGAL_CONTACT_EMAIL`/`LEGAL_LAST_UPDATED`/`LEGAL_DISCLAIMER`/`getLegalDocument`), `views/legal-document-view.tsx` (View pura, Server Component, sem hooks)
- [x] `/privacidade` — Política de Privacidade: controlador (projeto de fã não afiliado à Bandai), dados coletados, finalidades, **base legal (LGPD art. 7º)**, compartilhamento (não vendemos dados; provedores de infra), retenção, **direitos do titular (art. 18)** com link para `Meus dados` (`/perfil`) e e-mail do DPO, segurança, atualizações/contato
- [x] `/termos` — Termos de Uso: aceitação, cadastro/conta, conduta e conteúdo do usuário, propriedade intelectual (**marca Digimon pertence à Bandai; projeto de fã**), isenções/limitação, suspensão/encerramento, alterações, lei aplicável (Brasil)
- [x] `/cookies` — Política de Cookies: o que são, **essenciais** (`access_token`/`refresh_token`, httpOnly), preferências de consentimento, **sem cookies de terceiros** hoje, como gerenciar no navegador, link para o banner de consentimento
- [x] 3 páginas Server Component com `generateMetadata` (título/description/canonical, conteúdo lido do doc) — indexáveis (sem `noindex`); conteúdo renderizado com o design system (`font-display`, tokens `text-ink*`, `max-w-[760px]`)
- [x] Rodapé (`site-footer.tsx`): coluna **"Legal"** com Termos, Privacidade e Cookies (grid passa a `sm:grid-cols-4`)
- [x] Registro (`register-view.tsx`): aviso "Ao criar a conta você concorda com os **Termos** e a **Política de Privacidade**" com links
- [x] Conteúdo marcado como **documento-modelo sujeito a revisão jurídica** (aviso `role="note"` no topo de cada página); sem inventar fatos
- [x] `pnpm turbo typecheck lint --filter=@digimon/app-web` ✅ (2/2; 0 erros, 0 warnings; `next build` **não** executado, conforme instrução)

## Handoff (task 108)
- **Feito:** páginas legais do portal em pt-BR, com SEO (`generateMetadata` + canonical) e conteúdo LGPD estruturado. O conteúdo vive em `features/legal/model/content.ts` (fonte única, fácil de editar) com tipagem própria; uma View server pura (`LegalDocumentView`) renderiza headings/listas/notas e links inline (internos via `next/link`, externos via `<a>`). O rodapé ganhou a coluna **Legal** e o registro passou a linkar Termos e Privacidade.
- **Arquivos:** `apps/web/src/features/legal/{index.ts,model/types.ts,model/content.ts,views/index.ts,views/legal-document-view.tsx}` (novos), `apps/web/src/app/(public)/{privacidade,termos,cookies}/page.tsx` (novos), `apps/web/src/components/site-footer.tsx`, `apps/web/src/features/auth/views/register-view.tsx` + `context/modules/web/status.md`.
- **Decisões:** (1) **View server pure** (sem `'use client'`) — é só JSX de apresentação do documento, então não precisa de client component; MVVM intacto (nenhum `useQuery`/`useMutation`/`useForm`). (2) **`generateMetadata` lê o doc** (`getLegalDocument(slug)`) — título/descrição têm fonte única no conteúdo. (3) **Links inline via `LegalInline`** (`string | { text, href, external }`) — permite "Meus dados" (`/perfil`), e-mail do DPO (`mailto:`) e cross-links entre as políticas sem HTML cru. (4) **`LEGAL_DISCLAIMER`** compartilhado renderizado como `role="note"` em todas as páginas (modelo sujeito a revisão jurídica). (5) e-mail/DPO = `contato@digimoncardgamebrasil.com.br` (domínio do projeto, ajustável). (6) Não implementei lógica de consentimento (task 109); o `/cookies` menciona o banner do site por texto.
- **Validação:** `pnpm turbo typecheck lint --filter=@digimon/app-web` — 2/2 ✅ (0 erros, 0 warnings). `next build` **não** executado (instrução explícita da task).
- **Fora do escopo (reportar):** tasks concorrentes 106 (`app/admin/anuncios/page.tsx`) e 109 (`features/consent/**`, `components/consent-banner.tsx`, `components/index.ts`, `app/layout.tsx`) aparecem no working tree — **não** tocadas por esta task. O conteúdo legal é um **modelo** e depende de revisão jurídica antes de valer como documento oficial.

## Fase 34 — Direitos do titular no perfil: baixar dados + excluir conta (task 110)
- [x] Model `features/users/model/types.ts`: reexporta o tipo `UserDataExport` de `@digimon/users` (só tipo — sem runtime); `users-api.ts` ganha `exportData()` (`GET /users/me/export`) e `deleteAccount()` (`DELETE /users/me`)
- [x] ViewModel `use-profile-view-model.ts` estendido: `downloadMyData()` (busca o JSON e baixa `meus-dados.json` via Blob), `openDeleteModal`/`closeDeleteModal`, `confirmDeleteAccount()` (`DELETE` → `refreshSession()` + `router.push('/')` + `router.refresh()`), estado `isExportingData`/`isDeletingAccount`/`deleteModalOpen`/`privacyError`
- [x] View `profile-view.tsx`: seção **"Privacidade e meus dados"** com **Baixar meus dados** e **Excluir conta** + link para a Política de Privacidade (`/privacidade`, via `next/link`)
- [x] View `delete-account-modal.tsx` (nova, pura): modal de confirmação explicando a anonimização + desativação e o encerramento de sessão; renderiza erro do VM
- [x] MVVM estrito: View só JSX; orquestração/efeitos (fetch, Blob/download, navegação) no ViewModel; Model sem hooks/JSX; **sem importar `@digimon/users` em runtime** no client (apenas `import type`)
- [x] `pnpm turbo typecheck lint build --filter=@digimon/app-web` ✅ (rota `/perfil` presente no build)
- [x] Smoke `app.inject` (via API): `GET /users/me/export` 200 com dados do titular; `DELETE /users/me` 204 + cookies limpos + login falha

## Handoff (task 110)
- **Feito:** direitos do titular (LGPD art. 18) disponíveis na própria área do usuário. No perfil, a seção "Privacidade e meus dados" permite **baixar um `meus-dados.json`** (portabilidade) e **excluir a conta** com modal de confirmação (eliminação por anonimização + desativação), encerrando a sessão e voltando para `/` após o delete. A exportação/eliminação são servidas pela API (`GET /users/me/export`, `DELETE /users/me`).
- **Arquivos:** `apps/web/src/features/users/model/types.ts`, `apps/web/src/features/users/model/users-api.ts`, `apps/web/src/features/users/viewmodel/use-profile-view-model.ts`, `apps/web/src/features/users/views/profile-view.tsx`, `apps/web/src/features/users/views/delete-account-modal.tsx` (novo) + `context/modules/web/status.md`. O backend está em `context/modules/users/status.md` (Handoff task 110).
- **Decisões:** (1) **Uma ViewModel para o perfil** (`useProfileViewModel`) com as ações de privacidade — evita outro hook e mantém a seção coesa com o resto do perfil. (2) **Download no ViewModel** (Blob + `<a download>`) como o `use-deck-import-export` — a View chama `downloadMyData()` e só renderiza. (3) **`refreshSession()` + `router.push('/')`** após excluir (mesmo padrão do logout/login): como os cookies são limpos pela própria resposta do DELETE, `/auth/me` passa a devolver `null` e o header perde a sessão sem F5. (4) **Erro único** (`privacyError`) exibido no modal quando aberto e abaixo da seção quando fechado (evita mensagem duplicada). (5) Modal sem componente compartilhado (não existe no design system), seguindo o padrão de `deck-publish-modal`. (6) Tipo `UserDataExport` importado **somente como tipo** de `@digimon/users` (erased no build) — o client não importa o pacote em runtime.
- **Validação:** `pnpm turbo typecheck lint build --filter=@digimon/app-web` ✅ (0 erros/0 warnings; `/perfil` no build). Smoke real contra Postgres via API (`app.inject`).
- **Pendências/fora do escopo (reportar):** nenhuma. As tasks 108/109 (páginas legais/consentimento) seguem no working tree como baseline (não tocadas aqui); o link `/privacidade` já resolve (task 108 entregue).

## Fase 35 — Tipos-espelho locais em features/users (task 111)
- [x] `features/users/model/types.ts`: removido o `import type { UserDataExport, UserView } from '@digimon/users'` — substituído por **tipos literais espelhados** (`UserView`, `ExportedUserProfile`, `UserCommentRecord`, `UserDeckRecord`, `UserTournamentRecord`, `UserCommunityDeckRecord`, `UserDataExport`) com a mesma forma dos DTOs do módulo
- [x] Nomes exportados preservados (`UserView`, `UserDataExport`) — `users-api.ts`/viewmodels/views seguem compilando sem mudança
- [x] `features/users` **não** referencia mais `@digimon/users` (grep zero no código-fonte; restam apenas `next.config.ts`/`Dockerfile`/`package.json`, que são config do pacote, fora do escopo)
- [x] Nenhuma mudança de runtime — só tipos
- [x] `pnpm turbo typecheck lint --filter=@digimon/app-web` ✅ (2/2; 0 erros, 0 warnings; `next build` **não** executado, conforme instrução)

## Handoff (task 111)
- **Feito:** o Model de `features/users` deixa de importar `@digimon/users`; os contratos consumidos pela UI passam a ser tipos literais espelhados no client (mesmo padrão dos demais "tipos espelhados"). Elimina a última referência de código-fonte do web ao módulo de domínio.
- **Arquivo:** `apps/web/src/features/users/model/types.ts` *(único arquivo de código tocado)* + `context/modules/web/status.md`.
- **Decisões:** (1) Espelhar **a forma completa** do DTO do export (perfil + 4 coleções de atividade), não só os campos usados — mantém `UserDataExport` fiel ao retorno de `GET /users/me/export`. (2) `Role` continua vindo de `@digimon/contracts` (permitido pela task; usado por outros tipos do arquivo). (3) `UserView`/`UserDataExport` agora `export interface` no próprio arquivo (antes: reexport de `@digimon/users`) — assinatura pública idêntica para os consumidores.
- **Validação:** `pnpm turbo typecheck lint --filter=@digimon/app-web` — 2/2 ✅ (0 erros, 0 warnings). `next build` **não** executado (instrução da task).
- **Fora do escopo (reportar):** (1) `features/auth/model/types.ts` ainda importa `AuthUserView` de `@digimon/auth` (mesma categoria de pendência, fora do escopo desta task). (2) `apps/web/package.json`/`Dockerfile`/`next.config.ts` ainda declaram `@digimon/users` (agora ociosa como dep de código) — remover a dep exige reconciliar `pnpm-lock.yaml` e está fora do escopo. Nenhum desses foi tocado.

## Fase 35 — Banner de consentimento fora do /admin (task 112)
- [x] `components/consent-banner.tsx`: `usePathname()` (de `next/navigation`) + early-return `if (pathname.startsWith('/admin')) return null` antes dos demais returns
- [x] O componente continua montado no root layout e a lógica de consentimento (`useConsent`) permanece intocada
- [x] Banner não renderiza em `/admin/**`; segue no site público
- [x] `pnpm turbo typecheck lint --filter=@digimon/app-web` ✅ (2/2; 0 erros, 0 warnings; `next build` **não** executado, conforme instrução)

## Handoff (task 112)
- **Feito:** o `<ConsentBanner />` não aparece mais na área interna. Como o componente é client e está montado no root layout, o guard de rota é feito na própria View via `usePathname()` + `startsWith('/admin')`.
- **Arquivo:** `apps/web/src/components/consent-banner.tsx` *(único arquivo de código tocado)* + `context/modules/web/status.md`.
- **Decisões:** (1) O hook `usePathname()` é chamado no topo, junto aos demais hooks, antes de qualquer early-return — respeita as regras de hooks. (2) `startsWith('/admin')` cobre `/admin` e todas as subrotas (`/admin/posts`, `/admin/usuarios`, ...). (3) Nada mudou em `app/layout.tsx` nem na ViewModel `useConsent`.
- **Validação:** `pnpm turbo typecheck lint --filter=@digimon/app-web` — 2/2 ✅ (typecheck + lint limpos; `next build` não executado por instrução da task).
- **Fora do escopo (reportar):** nenhum arquivo além do escopo declarado foi tocado por esta task. *(Nota: durante a validação, o lint acusou transitoriamente um erro em `features/users/model/types.ts` — arquivo da task concorrente 111 — que se resolveu com a conclusão daquela task; reexecução passou limpa.)*

## Fase 36 — Consentimento server-side + canal de solicitações LGPD (task 115)
- [x] Model `features/consent/model/consent.ts`: **`subjectKey`** opaco (`getSubjectKey()` — `crypto.randomUUID()` (fallback timestamp+random) em `localStorage['dcgb.subject.v1']`, fallback em memória fora do browser), `CONSENT_POLICY_VERSION = '2026-01'` e `recordConsentOnServer(state)` (best-effort `POST /consent`, nunca lança)
- [x] ViewModel `use-consent.ts`: `acceptAll`/`rejectNonEssential`/`savePreferences` registram a decisão no servidor **depois** do `setConsent` local (best-effort, não bloqueia nem quebra a UI); comportamento local preservado
- [x] Feature `features/privacy/**` (MVVM): Model `model/types.ts` (tipos literais + labels) e `model/privacy-api.ts` (`createDataRequest` → `POST /privacy/requests`); ViewModel `viewmodels/use-data-request.ts` (form + validação + submit + estados); View `views/data-request-form.tsx` (só JSX) + barrels
- [x] Página pública `/privacidade/solicitacao` (Server Component + `metadata`/canonical) renderizando o formulário; link "**Como exercer seus direitos**" → `/privacidade/solicitacao` na Política de Privacidade (`features/legal/model/content.ts`, seção "Seus direitos")
- [x] Admin: Model `admin/model/privacy-admin-api.ts` (`listDataRequests({status})` → `GET /admin/privacy/requests`, `updateStatus(id, status)` → `PATCH /admin/privacy/requests/:id`); ViewModel `use-admin-data-requests.ts` (fila com filtro de status + paginação + mutation com invalidação); View `admin-data-requests-view.tsx` (tabela tipo/nome/e-mail/mensagem/status/data + ações Em andamento/Concluído/Rejeitado)
- [x] Página `/admin/solicitacoes` (administrator|editor — gate herdado do `admin/layout.tsx`; `robots: { index: false }`) + item **"Solicitações LGPD"** (`ShieldCheck`) na sidebar do `AdminShell`
- [x] Barrel `features/admin/index.ts` atualizado; sem importar `@digimon/privacy` no client (tipos literais espelhados)
- [x] `pnpm turbo typecheck lint --filter=@digimon/app-web` ✅ (2/2; 0 erros, 0 warnings; `next build` **não** executado, conforme instrução)

## Handoff (task 115)
- **Feito:** (1) **Consentimento server-side** — o banner de cookies passa a registrar a decisão no servidor de forma best-effort: o Model gera/guarda um `subjectKey` opaco e expõe `recordConsentOnServer`, que o ViewModel `useConsent` chama após persistir a escolha local (`POST /consent` responde sempre 204; falhas são silenciosas). (2) **Canal de solicitações** — nova feature `features/privacy` (Model/ViewModel/View) + página pública `/privacidade/solicitacao` (form de tipo/nome/e-mail/mensagem com validação, confirmação com protocolo) e link "Como exercer seus direitos" na Política de Privacidade. (3) **Fila no admin** — `privacy-admin-api` + `useAdminDataRequests` + `AdminDataRequestsView` + página `/admin/solicitacoes` e item "Solicitações LGPD" na sidebar.
- **Arquivos:** `apps/web/src/features/consent/model/consent.ts`, `apps/web/src/features/consent/viewmodels/use-consent.ts`, `apps/web/src/features/privacy/{index.ts,model/types.ts,model/privacy-api.ts,viewmodels/use-data-request.ts,viewmodels/index.ts,views/data-request-form.tsx,views/index.ts}` (novos), `apps/web/src/app/(public)/privacidade/solicitacao/page.tsx` (novo), `apps/web/src/features/legal/model/content.ts`, `apps/web/src/features/admin/model/privacy-admin-api.ts` (novo), `apps/web/src/features/admin/viewmodels/use-admin-data-requests.ts` (novo), `apps/web/src/features/admin/views/admin-data-requests-view.tsx` (novo), `apps/web/src/features/admin/views/admin-shell.tsx`, `apps/web/src/features/admin/index.ts`, `apps/web/src/app/admin/solicitacoes/page.tsx` (novo) + `context/modules/{web,privacy}/status.md`.
- **Decisões:** (1) **`subjectKey` opaco** (`crypto.randomUUID()`, fallback timestamp+random) em `localStorage['dcgb.subject.v1']`; `recordConsentOnServer` é **best-effort silencioso** — a fonte de verdade da UI continua o `localStorage`, o `POST /consent` é auditoria (o backend responde sempre 204). (2) **`CONSENT_POLICY_VERSION = '2026-01'`** espelha o `DEFAULT_POLICY_VERSION` de `@digimon/privacy`; bump quando o texto legal mudar (documentado no Model). (3) **Tipos literais** em `features/privacy/model/types.ts` (type/status + labels) — o client **não** importa `@digimon/privacy`. (4) A página pública importa a View pelo barrel `features/privacy/views` (não pelo raiz) — evita puxar o hook client no módulo carregado pelo Server Component. (5) Validação leve no cliente (nome/e-mail/mensagem) — o backend revalida com Zod; sucesso mostra o protocolo (`id`) + "Enviar outra solicitação". (6) Admin: filtro "Todas"/Aberta/Em andamento/Concluída/Rejeitada; as ações ocultam a transição corrente; Concluir/Rejeitar confirmam via `window.confirm` (padrão da feature admin); o `PATCH` invalida a query da fila. (7) O item "Solicitações LGPD" fica visível para **administrator e editor** (o filtro de não-admin do `AdminShell` só remove Usuários/Configurações/Anúncios).
- **Validação:** `pnpm turbo typecheck lint --filter=@digimon/app-web` — 2/2 ✅ (0 erros, 0 warnings). `next build` **não** executado (instrução explícita da task).
- **Fora do escopo (reportar):** nenhum. `apps/api/**`, `packages/**`, `components/**` e demais features intocados; sem novas dependências.

## Fase 37 — Limpeza: dependência órfã `@digimon/users` (task 116)
- [x] `apps/web/package.json`: removida `"@digimon/users": "workspace:*"` (a task 111 espelhou os tipos localmente; nenhum import de código em `apps/web/src`)
- [x] `apps/web/next.config.ts`: `transpilePackages` reduzido para `['@digimon/auth', '@digimon/contracts']`
- [x] Grep de confirmação em `apps/web/src`: **zero** ocorrências de `@digimon/users` (só a config do pacote declarava a dep)
- [x] `pnpm install` reconciliou `pnpm-lock.yaml` (importer `apps/web` perdeu as 3 linhas da dep; `apps/api` mantém a sua)
- [x] `pnpm turbo typecheck lint build --filter=@digimon/app-web` ✅ (3/3; 0 erros, 0 warnings; build 33 páginas + Proxy/Middleware)

## Handoff (task 116)
- **Feito:** removida a dependência órfã `@digimon/users` do web depois de a task 111 substituir os imports de tipo por tipos-espelho locais. `package.json` e `transpilePackages` limpos; lockfile reconciliado.
- **Arquivos:** `apps/web/package.json`, `apps/web/next.config.ts`, `pnpm-lock.yaml` + `context/modules/web/status.md`.
- **Decisões:** (1) `pnpm install` reconciliou o lockfile sem novas resoluções ("Already up to date" — a dep era apenas um link de workspace, removida do importer `apps/web`). (2) `@digimon/auth`/`@digimon/contracts` permanecem em `transpilePackages` (únicos pacotes do workspace ainda importados pelo web). (3) `pnpm-lock.yaml` ainda lista `@digimon/users` no importer de `apps/api` — correto, não é escopo.
- **Validação:** `pnpm turbo typecheck lint build --filter=@digimon/app-web` — 3/3 ✅ (build 33 páginas estáticas/rotas, `Proxy (Middleware)` presente). Corte de escopo via `git diff` restrito aos 3 arquivos declarados.
- **Fora do escopo (reportar):** `apps/web/Dockerfile` ainda inclui `packages/modules/users` no grafo de manifests do estágio `deps` e cita `@digimon/users` em comentário (linha 37). Como a dep saiu do `package.json` do web, esse manifest pode ser removido do Dockerfile numa task futura (não tocado aqui — fora do escopo).

## Fase 39 — Favicon a partir da logo (task 121)
- [x] `app/icon.png` — **512×512** PNG RGBA, fundo navy sólido `rgb(8,18,58)` + recorte do "DCG" centralizado (mark com 451 px de largura ≈ 88% de 512)
- [x] `app/apple-icon.png` — **180×180** PNG RGBA, mesma composição
- [x] `app/favicon.ico` — **32×32** ICO, mesma composição (navegadores legados)
- [x] Recorte do "DCG" pela bbox `(125,0,838,197)` (remove o "BRASIL"); redimensionamento com `Image.LANCZOS`
- [x] Composição validada por PIL: mark centralizado em (255,255) no master; cantos no fundo navy `(8,18,58,255)`
- [x] `next.config.ts`/`layout.tsx` **não** tocados; `public/dcg-logo.png` intacto
- [x] Build `pnpm turbo build --filter=@digimon/app-web` ✅ — Next registrou `/icon.png` e `/apple-icon.png` (e o `app/favicon.ico` foi emitido em `.next/server/app/favicon.ico`)

## Handoff (task 121)
- **Feito:** favicons do App Router gerados a partir de `apps/web/public/dcg-logo.png` (937×266 RGBA, fundo transparente) via Python PIL. Recortei o bloco "**DCG**" (bbox `125,0,838,197` — descarta a linha "BRASIL") e montei um master **quadrado** 512×512 com fundo navy sólido `rgb(8,18,58)`, o mark escalado para **~88% da largura** (451 px, aspecto 3.62 preservado) e centralizado (centros H/V = 255). Desse master derivei `apple-icon.png` (180×180) e `favicon.ico` (32×32), sempre com `Image.LANCZOS`, garantindo mark nítido e margem uniforme (6% de cada lado).
- **Arquivos:** `apps/web/src/app/icon.png` (512×512), `apps/web/src/app/apple-icon.png` (180×180), `apps/web/src/app/favicon.ico` (32×32) — todos novos + `context/modules/web/status.md`.
- **Decisões:** (1) Opção preferida da task: recorte do "DCG" (não a logo inteira) — remove o "BRASIL" e mantém o mark legível no quadrado. (2) Composição a partir de **um master 512** e downscale para 180/32 (não recompor em cada tamanho) — garante o mesmo enquadramento e nitidez. (3) `Image.alpha_composite` do mark recortado sobre o navy preserva o anti-aliasing das bordas (sem halo). (4) `favicon.ico` gravado a partir do master reduzido (`sizes=[(32,32)]`). Nenhum código/config foi alterado — só assets, como especificado.
- **Validação:** conferência PIL (dimensões/formato/modo; mark bbox 30..480 × 193..317; centros em 255) + build de produção do Next registrando os ícones.
- **Fora do escopo (reportar):** nenhum. As 3 imagens são assets novos em `src/app/`; `public/dcg-logo.png`, `next.config.ts` e `layout.tsx` permanecem intactos.

## Fase 40 — Padding da tela admin de configurações (task 123)
- [x] `site-settings-view.tsx`: wrapper raiz com `p-4 lg:p-8` adicionado — `className="flex flex-col gap-6 p-4 lg:p-8"`, idêntico às demais views do painel (users, tournaments, cards, ads, decks, deck-moderation, comments, data-requests, posts, dashboard)
- [x] Sem mudança de comportamento: `gap-6`, `max-w-2xl` do `<article>` e toda a lógica/estilos preservados (apenas o padding do contêiner raiz)
- [x] MVVM intacto: View só JSX (nenhum hook/fetch tocado)
- [x] `pnpm turbo typecheck --filter=@digimon/app-web` ✅ (1/1; `tsc --noEmit` EXIT 0)
- [x] `git diff` restrito ao `## Escopo` (1 arquivo, 1 inserção / 1 remoção)

## Handoff (task 123)
- **Feito:** a tela `/admin/configuracoes` (`SiteSettingsView`) deixa de ficar sem padding próprio. O wrapper raiz passou de `flex flex-col gap-6` para `flex flex-col gap-6 p-4 lg:p-8`, igual ao `admin/layout.tsx` (`<main className="flex-1">` sem padding) → cada view aplica seu próprio espaçamento. Agora a tela fica alinhada às demais do painel.
- **Arquivos:** `apps/web/src/features/admin/views/site-settings-view.tsx` (único arquivo tocado) + `context/modules/web/status.md`.
- **Decisões:** seguir exatamente o padrão das outras views (`p-4 lg:p-8`) em vez de mover o padding para o layout — consistente com a arquitetura atual (layout sem padding, views com padding próprio), evitando regressão nas demais telas.
- **Validação:** `pnpm turbo typecheck --filter=@digimon/app-web` — 1/1 ✅ (0 erros). `git diff` confinado ao `## Escopo` (1 linha). `next build`/lint não executados (mudança somente de classe utilitária; instrução da task limitou-se ao typecheck).
- **Fora do escopo (reportar):** nenhum. `apps/web/src/app/admin/layout.tsx`, demais views, `components/**`, `apps/api/**` e `packages/**` intocados.

## Fase 41 — Anúncios (admin): filtros de botões para selects (task 125)
- [x] `admin-ads-view.tsx`: os 3 filtros (status/tipo/posição) deixam de ser lista de botões e passam a `<select>` rotulados (`htmlFor`/`id`) num container `flex flex-wrap items-end gap-4` (padrão de `card-filters.tsx`)
- [x] Reaproveitadas as opções `STATUS_FILTERS`/`KIND_FILTERS`/`PLACEMENT_FILTERS`, os callbacks `vm.selectStatus`/`vm.selectKind`/`vm.selectPlacement` e a classe `INPUT_CLASS` já existente
- [x] Removidos o componente `FilterGroup` e o tipo `FilterGroupProps` (sem uso); ViewModel/formulário/tabela intocados
- [x] `pnpm turbo typecheck --filter=@digimon/app-web` ✅ (1/1, `--force`)
- [x] `git diff` restrito ao `## Escopo`

## Handoff (task 125)
- **Feito:** os filtros de status, tipo e posição da tela `/admin/anuncios` viraram `<select>` acessíveis (rótulo associado via `htmlFor`/`id`), alinhados ao padrão de filtros do catálogo de cartas (`card-filters.tsx`). Sem mudança de lógica: os selects apenas chamam os mesmos callbacks do ViewModel, que seguem resetando a página.
- **Arquivos:** `apps/web/src/features/admin/views/admin-ads-view.tsx` (único arquivo de código) + `context/modules/web/status.md`.
- **Decisões:** manter `INPUT_CLASS` (h-10, `surface-2`) e o rótulo `text-[12px] font-bold text-ink-faint` do `card-filters.tsx` para consistência visual; `FilterGroup`/`FilterGroupProps` removidos por ficarem órfãos.
- **Fora do escopo (reportar):** o `pnpm turbo typecheck` inicial falhou por `TS6053` (3 arquivos "not found") referentes às deleções em andamento da **task 124** (`demo-data.ts`, `use-admin-moderation-view-model.ts`, `moderation-queue.tsx`); a causa era um `apps/web/tsconfig.tsbuildinfo` (cache git-ignored) desatualizado, não o código desta task. Limpei o cache (regenerado) e o typecheck forçado passou 1/1. Nenhum arquivo da task 124 foi tocado.

## Fase 41 — Admin: remover moderação de comentários hardcoded (task 124)
- [x] `admin-dashboard-view.tsx` (Home): removidos o import de `ModerationQueue`/`useAdminModerationViewModel`, a chamada do VM e o bloco `<ModerationQueue ... />` — mantidos cabeçalho, métricas e tabela de posts (API)
- [x] `admin-comments-view.tsx`: removidos o import de `ModerationQueue`/`useAdminModerationViewModel`, a chamada do VM e o bloco `<ModerationQueue ... />` — mantidos cabeçalho, métricas e tabela de comentários (API `GET /comments/admin`)
- [x] Removidos os arquivos mortos: `views/moderation-queue.tsx`, `viewmodels/use-admin-moderation-view-model.ts`, `model/demo-data.ts`
- [x] Removido o tipo `ModerationItem` de `model/types.ts`
- [x] Removidos os exports `ModerationQueue` / `ModerationQueueProps` do barrel `features/admin/index.ts`
- [x] Grep em `apps/web/src`: zero referências a `DEMO_MODERATION`, `DEMO_COMMENTS`, `ModerationItem`, `ModerationQueue`, `useAdminModerationViewModel` ou `moderation-queue`
- [x] `pnpm turbo typecheck --filter=@digimon/app-web` ✅ (1/1, `tsc --noEmit` EXIT 0)
- [x] `git diff` restrito ao `## Escopo` (4 alterados + 3 removidos)

## Handoff (task 124)
- **Feito:** removida a fila de "moderação de comentários" hardcoded das telas `/admin` (Home) e `/admin/comentarios`. O bloco `<ModerationQueue>` era alimentado por `DEMO_MODERATION` (dados de demonstração em `model/demo-data.ts`) porque o domínio **não** tem sinalização/flag de comentário (`CommentStatus` só tem `VISIBLE/HIDDEN/DELETED`) — não há fonte real para a fila. Métricas e tabelas dessas telas continuam vindo da API (`GET /comments/admin`; posts via `useAdminDashboardViewModel`) e ficaram intactas.
- **Arquivos alterados:** `apps/web/src/features/admin/views/admin-dashboard-view.tsx`, `apps/web/src/features/admin/views/admin-comments-view.tsx`, `apps/web/src/features/admin/model/types.ts`, `apps/web/src/features/admin/index.ts`. **Removidos:** `apps/web/src/features/admin/views/moderation-queue.tsx`, `apps/web/src/features/admin/viewmodels/use-admin-moderation-view-model.ts`, `apps/web/src/features/admin/model/demo-data.ts`. + `context/modules/web/status.md`.
- **Decisões:** (1) Remoção total do bloco (não esconder/desabilitar) — não existe backend de sinalização; manter a fila exigiria inventar dados. (2) `adminApi.moderateComment` **permanece** no Model (fora do escopo, e ainda é usado por `use-admin-comments-view-model.ts` na coluna de ações Ocultar/Exibir da tabela real). (3) `DEMO_COMMENTS` já era código morto (nenhum consumidor) → removido junto com o arquivo. (4) MVVM preservado: cada View continua consumindo apenas o seu ViewModel real.
- **Validação:** `pnpm turbo typecheck --filter=@digimon/app-web` — 1/1 ✅ (0 erros). `pnpm harness check --barrel` ✅. `git diff` confinado ao `## Escopo`; `next build`/lint não executados (instrução da task).
- **Fora do escopo (reportar):** nenhum. `apps/api/**`, `packages/**`, `components/**` e demais features intocados. *(Nota: `views/admin-ads-view.tsx` aparece modificado no working tree por ser da task concorrente 125 — não tocado por esta task.)*

## Fase 42 — Web: remover moderação de decks (task 127)
- [x] `admin-shell.tsx`: removido o item de menu **Moderação de decks** (`/admin/decks/moderacao`) e o import órfão do ícone `ShieldAlert` (a ordem segue Visão geral → Posts → Cartas → Torneios → Decks → Anúncios → Comentários → LGPD → Usuários → Configurações)
- [x] Removidos: rota `app/admin/decks/moderacao/page.tsx`, View `admin-deck-moderation-view.tsx`, ViewModel `use-admin-deck-moderation.ts`, Model `deck-moderation-api.ts` (e o diretório vazio `moderacao/`)
- [x] Barrel `features/admin/index.ts`: removidos `deckModerationApi`, os tipos `CommunityDeckReport`/`CommunityModerationAction`/`ReportedCommunityDeck`, `AdminDeckModerationView` e `useAdminDeckModeration` — demais exports mantidos
- [x] `features/decks/model/community-api.ts`: removido `communityDecksApi.report()` + o import órfão `ReportCommunityDeckInput`
- [x] `features/decks/model/community-types.ts`: removidos `CommunityReportReason` e `ReportCommunityDeckInput`; feed/like/copy/publicações/legalidade/import/export preservados
- [x] Grep em `apps/web/src`: zero referências a `deckModerationApi`, `useAdminDeckModeration`, `AdminDeckModerationView`, `DeckModeration`, `CommunityDeckReport`, `ReportedCommunityDeck`, `CommunityModerationAction`, `ReportCommunityDeckInput`, `CommunityReportReason` ou `report(`
- [x] `pnpm turbo typecheck --filter=@digimon/app-web --force` ✅ (1/1; `tsc --noEmit` EXIT 0) | lint ✅ (0 erros) | build ✅ (rota `/admin/decks/moderacao` ausente do build) | `pnpm harness check --barrel` ✅
- [x] `git diff` restrito ao `## Escopo` (+ `context/`)

## Handoff (task 127)
- **Feito:** removida por completo a moderação de decks no web. A tela admin de reportes (menu, rota `/admin/decks/moderacao`, View, ViewModel e Model) foi apagada e o cliente da comunidade perdeu o método `report()` e os tipos de reporte — ambos eram código morto (nenhuma UI chamava). Alinha o web à remoção do backend (task 126, concorrente) e ao princípio "publicação de decks sem moderação".
- **Arquivos:** **removidos** — `apps/web/src/app/admin/decks/moderacao/page.tsx`, `apps/web/src/features/admin/views/admin-deck-moderation-view.tsx`, `apps/web/src/features/admin/viewmodels/use-admin-deck-moderation.ts`, `apps/web/src/features/admin/model/deck-moderation-api.ts`. **Alterados** — `apps/web/src/features/admin/views/admin-shell.tsx`, `apps/web/src/features/admin/index.ts`, `apps/web/src/features/decks/model/community-api.ts`, `apps/web/src/features/decks/model/community-types.ts`. + `context/modules/web/status.md`.
- **Decisões:** (1) Remoção total (não desabilitar/esconder) — o backend deixou de expor as rotas admin de reportes. (2) `communityDecksApi.report()` + tipos removidos porque não tinham nenhum consumidor na UI (tela de reporte de deck nunca existiu no web). (3) Preservados `communityDecksApi.checkLegality`/`importDeckList`/`exportDeckList` e todo o feed/like/copy/publicações. (4) `adminDecksApi`/`AdminDecksView` e a tela `/admin/decks` **não** tocadas.
- **Validação:** `pnpm turbo typecheck --filter=@digimon/app-web --force` — 1/1 ✅ (0 erros). O primeiro typecheck falhou por um artefato de build obsoleto (`apps/web/.next/types/validator.ts` ainda referenciava a rota deletada); o `.next` foi limpo e regenerado com `next build` (artefato git-ignored), após o que o typecheck forçado passou. Lint ✅ (0 erros) e `pnpm harness check --barrel` ✅. `apps/web/next-env.d.ts` (gerado pelo dev/build) foi restaurado ao estado do HEAD por estar fora do escopo.
- **Fora do escopo (reportar):** nenhum. `apps/api/**`, `packages/**`, `components/**`, a tela `/admin/decks` e o feed/like/copy/publicações da comunidade intocados.

## Fase 43 — Editor: botões de Parágrafo, Link e Imagem no toolbar (task 128)
- [x] `apps/web/package.json`: adicionada `@tiptap/extension-image@^3.31.4` (mesma linha das demais `@tiptap`) + `pnpm-lock.yaml` reconciliado
- [x] `post-editor.tsx`: `@tiptap/extension-image` registrada em `extensions` com `Image.configure({ inline: false })` (atributo `src` default)
- [x] `editor-toolbar.tsx`: botão **Parágrafo** (`Pilcrow`, `setParagraph()`, ativo em `isActive('paragraph')`); **Link** (`Link`, prompt da URL + `extendMarkRange('link').setLink({ href })`; prompt vazio → `unsetLink`; ativo em `isActive('link')`); **Imagem** (`Image`, prompt da URL + `setImage({ src })`)
- [x] **Citação/blockquote** mantida como estava (`toggleBlockquote()`); demais botões, slash menu e MVVM do form intocados; `onMouseDown` com `preventDefault` e `aria-label`/`title` preservados em todos os botões
- [x] `pnpm turbo typecheck --filter=@digimon/app-web` ✅ (1/1) | lint ✅ (0 erros)
- [x] `git diff` restrito ao `## Escopo`

## Handoff (task 128)
- **Feito:** o toolbar do editor de Post ganhou os botões **Parágrafo**, **Link** e **Imagem** (Blockquote já existia como "Citação" e foi mantido). Parágrafo usa `setParagraph()` e fica ativo quando o cursor está num parágrafo comum; Link usa `window.prompt` (pré-preenchido com o `href` atual) e aplica `extendMarkRange('link').setLink({ href })`, removendo o link (`unsetLink`) quando o prompt volta vazio/cancelado; Imagem usa `window.prompt` e insere via `setImage({ src })`. A extensão `@tiptap/extension-image` foi instalada (`^3.31.4`, mesma linha das demais `@tiptap`) e registrada no `post-editor.tsx` com `inline: false`.
- **Arquivos:** `apps/web/src/components/editor/editor-toolbar.tsx`, `apps/web/src/components/editor/post-editor.tsx`, `apps/web/package.json`, `pnpm-lock.yaml` + `context/modules/web/status.md`.
- **Decisões:** (1) **Link em botão único** — prompt com o `href` atual; vazio → `unsetLink` (remove), preenchido → `setLink`; estado ativo por `isActive('link')`. (2) **Imagem por URL** (sem endpoint de upload no projeto) — `setImage({ src })` com `inline: false` para o `<img>` ficar em bloco próprio. (3) Agrupamento visual: Parágrafo antes dos títulos; Link logo após os marks; Imagem no fim, após um divisor. (4) Handlers (`handleLink`/`handleImage`) definidos no componente, após o guard `if (!editor)` — `ToolbarButton` continua recebendo `onClick` (a View só dispara comandos do editor; MVVM intacto).
- **Validação:** `pnpm turbo typecheck --filter=@digimon/app-web` — 1/1 ✅ (0 erros). `pnpm turbo lint --filter=@digimon/app-web` ✅ (0 erros). `next build` **não** executado (instrução da task).
- **Fora do escopo (reportar):** a sanitização de render (`lib/sanitize.ts`) **já** permite `img` + `src`/`alt` e links (`a`/`href`), então imagens/links persistem e renderizam sem ajuste. Nenhum arquivo além do `## Escopo` foi tocado; slash menu, MVVM do form e demais botões intocados.
