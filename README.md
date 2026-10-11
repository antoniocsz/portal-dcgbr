# Digimon TCG Brasil

Portal de notícias do Digimon Card Game no Brasil — notícias, matérias, cartas,
decks e torneios em português, com foco em SEO. Uma única fonte brasileira de
referência para o TCG, acompanhando também os simuladores (como o oficial
**Alysium**, previsto para 2026).

## Funcionalidades

- **Notícias e matérias** — editorial curado por Admin/Editor, com editor
  WYSIWYG (TipTap, estilo Notion), fluxo de *rascunho → revisão → publicado* e
  busca full-text
- **Card database** — referência de cartas (baseada em digimoncard.dev)
- **Deckbuilder colaborativo** — montar, salvar, copiar e compartilhar decks
- **Torneios** — agenda e resultados (Members publicam direto, sem revisão)
- **Comentários** — em posts, cartas e decks (somente com conta logada)
- **Painel administrativo** — visão geral, posts, cartas, torneios, decks,
  comentários e usuários, tudo integrado no mesmo app

## Papéis

| Papel | Acesso |
|---|---|
| Reader | leitura pública (não é papel atribuível) |
| Member | comenta, salva/copia decks, publica torneios e decks próprios |
| Editor | publica notícias/matérias, modera comentários |
| Administrator | acesso total (usuários, papéis, conteúdo) |

## Stack

- **Monorepo** — Turborepo + pnpm workspaces, TypeScript strict, ESLint flat
- **Web** — Next.js App Router (SSR/ISR, SEO-first) + Tailwind CSS v4 +
  shadcn/ui, tema escuro customizado; frontend puro em `apps/web`
- **Backend** — API separada em `apps/api` (Node + Fastify) + validação Zod
  (ADR-007), exposta em `api.digimoncardgamebrasil.com.br`
- **Dados** — PostgreSQL + Prisma 7, busca full-text nativa (sem Redis na v1)
- **Auth** — própria, JWT com access + refresh rotation (cookies httpOnly com
  `Domain` compartilhado entre web e API)
- **Deploy** — Coolify + Dockerfile, **dois apps**: web
  (`digimoncardgamebrasil.com.br`) + API (`api.digimoncardgamebrasil.com.br`)

## Estrutura do monorepo

```
apps/
  api/              # Node + Fastify — API (ADR-007), migrations/seed no entrypoint
  web/              # Next.js — site público + painel admin (MVVM, frontend puro)
packages/
  contracts/        # tipos, erros, eventos e EventBus (cola entre módulos)
  database/         # Prisma 7, schema, migrations, seed e docker-compose do Postgres
  modules/
    auth/ users/    # conta, sessão JWT e perfis
    content/        # posts/notícias (inclui categoria Simuladores)
    cards/ decks/ tournaments/ comments/
  api-client/       # http client tipado (cliente único do web)
context/            # documentação e pipeline de tasks (ver abaixo)
```

## Como rodar local

Pré-requisitos: Node 20+, pnpm, Docker (para o PostgreSQL).

```bash
# 1. Dependências
pnpm install

# 2. Banco (Postgres 16 em localhost:5432)
docker compose -f packages/database/docker-compose.yml up -d

# 3. Variáveis de ambiente
cp .env.example .env                     # raiz: DATABASE_URL para o Prisma (migrations/seed)
cp apps/api/.env.example apps/api/.env   # API: HOST/PORT + CORS_ORIGIN + COOKIE_DOMAIN

# apps/web/.env (crie a partir de apps/web/.env.example):
#   JWT_SECRET          -> >= 32 chars, o MESMO valor da API (valida a sessão do admin)
#   NEXT_PUBLIC_API_URL -> http://localhost:3001 (URL pública da API usada no browser)
#   API_INTERNAL_URL    -> http://localhost:3001 (endereço usado no SSR/middleware)
```

> O Next.js **não lê** o `.env` da raiz — por isso cada app tem `.env` próprio.
> Em local, a API roda em `localhost:3001`; por isso `API_INTERNAL_URL` aponta para
> `http://localhost:3001` (em produção é o endereço interno do serviço, ex.: `http://api:3001`).

```bash
# 4. Migrations + seed (cria o administrador inicial)
pnpm --filter @digimon/database db:deploy
pnpm --filter @digimon/database db:seed

# 5. Dev server (web + API juntos)
pnpm dev   # web http://localhost:3000 · API http://localhost:3001 (health: /health)
```

> Em local, migrations/seed rodam por comando (acima). **Em produção**, quem
> aplica migrate + seed é o entrypoint do container da API (ver `deploy.md`).

**Seed (dev):** `admin@digimoncardgamebrasil.com.br` / `admin12345`.
Em produção, defina `ADMIN_EMAIL` e `ADMIN_PASSWORD` no seed (e um `JWT_SECRET`
forte, o mesmo na API e no web).

## Scripts

| Comando | O que faz |
|---|---|
| `pnpm dev` | dev server (todos os workspaces) |
| `pnpm build` | build de produção |
| `pnpm test` | testes unitários (Vitest) |
| `pnpm typecheck` | typecheck de todos os pacotes |
| `pnpm lint` | lint + formatação (ESLint @stylistic) |

## Documentação do projeto

- `context/project/overview.md` — produto e problema
- `context/project/stack.md` — stack e decisões técnicas
- `context/project/domain-model.md` — domínio e bounded contexts
- `context/project/adr/` — decisões arquiteturais (ex.: backend separado — ADR-007)
- `context/project/deploy.md` — deploy no Coolify (2 apps: API + web)
- `context/modules/<módulo>/` — contexto e status de cada módulo

## Desenvolvimento assistido (AlterAI — Agentic OS)

O projeto usa um harness de tasks (queue → active → done) com escopos
declarados, validação de fronteiras e git diff:

```bash
pnpm harness task "<descrição>" --module <nome> --scope "p1,p2"  # planejar
pnpm harness start <task>    # iniciar (valida conflito de escopo)
pnpm harness finish <task>   # finalizar (valida git diff)
pnpm harness check           # validar estado
pnpm harness kanban --serve  # painel visual
```

Regras e protocolo completos em `AGENTS.md` e `.agents/`.