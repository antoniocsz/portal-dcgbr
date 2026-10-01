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
  shadcn/ui, tema escuro customizado
- **Backend** — Route Handlers do Next.js + validação Zod (sem servidor
  separado)
- **Dados** — PostgreSQL + Prisma 7, busca full-text nativa (sem Redis na v1)
- **Auth** — própria, JWT com access + refresh rotation
- **Deploy** — Coolify + Dockerfile, domínio único `digimoncardgamebrasil.com.br`

## Estrutura do monorepo

```
apps/
  web/              # Next.js — site público + painel admin (MVVM)
packages/
  contracts/        # tipos, erros, eventos e EventBus (cola entre módulos)
  database/         # Prisma 7, schema, migrations, seed e docker-compose do Postgres
  modules/
    auth/ users/    # conta, sessão JWT e perfis
    content/        # posts/notícias (inclui categoria Simuladores)
    cards/ decks/ tournaments/ comments/
  api-client/       # http client tipado
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
cp .env.example .env                     # raiz: DATABASE_URL (Prisma)
cp apps/web/.env.example apps/web/.env   # app: JWT_SECRET (>=32 chars) + DATABASE_URL
```

> O Next.js **não lê** o `.env` da raiz — por isso o app tem `.env` próprio.

```bash
# 4. Migrations + seed (cria o administrador inicial)
pnpm --filter @digimon/database db:deploy
pnpm --filter @digimon/database db:seed

# 5. Dev server
pnpm dev   # http://localhost:3000
```

**Seed (dev):** `admin@digimoncardgamebrasil.com.br` / `admin12345`.
Em produção, defina `ADMIN_EMAIL` e `ADMIN_PASSWORD` no seed (e um `JWT_SECRET`
forte no app).

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
- `context/project/adr/` — decisões arquiteturais (ex.: portal único, sem Redis)
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