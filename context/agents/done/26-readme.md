# 26 — Reescrever README focado no projeto

## Agente: `agente-frontend`
## Módulo: `web`

## Descrição
O README atual é o template genérico do harness: fala mais do harness do que
do projeto, cita stack errada (Fastify + Redis + TanStack Query — não existe),
caminhos de contexto errados (`context/overview.md`, `context/adr/`). Reescrever
focado no produto Digimon TCG Brasil: o que é, funcionalidades, papéis, stack
real, estrutura do monorepo, como rodar local, e uma seção curta do harness no
final.

## Escopo
- `README.md`
- `.env.example`
- `apps/web/.env.example`

## Critério de conclusão:
- [ ] README apresenta o produto (portal de notícias Digimon TCG BR) primeiro
- [ ] Stack correta (Next.js App Router + Route Handlers/Zod + Prisma 7 + Postgres, sem Redis)
- [ ] Como rodar local com comandos reais (docker-compose do @digimon/database, .env, db:deploy, db:seed, pnpm dev)
- [ ] Caminhos de contexto corretos (context/project/*)
- [ ] Seção do harness curta, em segundo plano
## Baseline (git)
- context/agents/queue/26-readme.md
