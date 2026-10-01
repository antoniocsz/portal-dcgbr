# 27 — Dockerfile do web (Next.js standalone) para Coolify

## Agente: `agente-backend`
## Módulo: `web`

## Descrição
Criar o Dockerfile de produção do `apps/web` com base no Dockerfile de
referência (`C:\Users\anton\Projetos\diasbellazzi\apps\web\Dockerfile`):
multi-stage (deps → build → runtime), pnpm frozen-lockfile, turbo filter
`@digimon/app-web`, saída `standalone` do Next.js.

Diferenças vs. referência: o `@digimon/app-web` DEPENDE dos workspace packages
`@digimon/*` — copiar todos os manifests no estágio de deps; Prisma 7 usa driver
adapter (`@prisma/adapter-pg`), sem engine binário no runtime, client gerado
commitado. Sem `NEXT_PUBLIC_*` (Route Handlers same-origin).

## Escopo
- `apps/web/Dockerfile`
- `.dockerignore`
- `apps/web/next.config.ts`
- `context/project/adr/ADR-006-docker-web-standalone.md`
- `context/modules/web/status.md`

## Critério de conclusão:
- [ ] Dockerfile multi-stage funcional (baseado na referência)
- [ ] `output: 'standalone'` no next.config.ts
- [ ] .dockerignore exclui node_modules/.next/.git/.harness/context/.env
- [ ] ADR-006 registrado (decisão de deploy)
- [ ] Typecheck + lint ok
- [ ] `docker build` valida a imagem (se ambiente permitir)
## Baseline (git)
- context/agents/queue/27-dockerfile-web.md
