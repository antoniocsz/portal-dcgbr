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
