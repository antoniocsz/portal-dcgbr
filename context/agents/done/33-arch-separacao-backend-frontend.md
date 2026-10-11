# 33 — Arquitetura: separar backend (API) do frontend (web) — ADR + plano de migração

## Agente: `agente-backend`
## Módulo: `web` + `database` + `packages/modules/*` + `infra`

## Descrição
Decisão arquitetural de separar o backend do frontend: o backend deixa de viver nos
Route Handlers do Next (`apps/web/src/app/api/**`) e passa a um app dedicado
(`apps/api`, Node — Fastify/Hono), consumindo os mesmos `packages/modules/*` e
`packages/database`. O `apps/web` vira frontend puro. Reverte parcialmente o ADR-001
(portal único com backend integrado) e ajusta o escopo do ADR-006 (runtime do web
deixa de tocar banco; nasce o runtime Node da API, que habilita migrate+seed no
entrypoint — padrão do projeto `diasbellazzi`).

Esta task é **de decisão e planejamento** — não gera código de aplicação.

## Escopo (arquivos que esta task vai tocar):
- `context/project/adr/ADR-007-backend-separado-do-frontend.md` (NOVO)
- `context/project/stack.md` (seção Backend/Frontend/Infra)
- `context/project/overview.md` (menção à stack)
- `context/modules/web/status.md`
- `context/agents/queue/33-arch-separacao-backend-frontend.md` (este arquivo — baseline)

## Decisões a confirmar com o humano (Fase 1 — clarificação):
1. **Framework da API:** Fastify (idêntico ao `diasbellazzi`, mais baterias prontas) vs Hono (citado no ADR-001)
2. **Auth/sessão:** same-origin via roteamento por path no proxy `/api/*` → API (recomendado — preserva cookie httpOnly da ADR-002) vs subdomínio `api.` + Bearer
3. **Estratégia de migração:** strangler (mover módulo a módulo, web continua funcionando) vs big-bang
4. **Web (dados):** manter fetch client-side atual (páginas estáticas) vs migrar para SSR/ISR server-side
5. **Runtime da API:** imagem Node completa (monorepo + `packages/database`) com entrypoint `migrate deploy` + seed `--only-if-empty` — habilita o seed em prod

## Entregáveis
- ADR-007 com decisão, trade-offs e alternativas descartadas (incluindo as 3 opções de seed: entrypoint / container de migrate / CI)
- Plano de migração em fases com ordem de dependências e critérios de aceite
- Lista de tasks subsequentes proposta para a queue (a criar SÓ após aceite do ADR)
- `stack.md` / `overview.md` alinhados à decisão

## Critério de conclusão:
- [ ] ADR-007 criado (Contexto/Decisão/Consequências/Trade-offs/Alternativas)
- [ ] Plano de migração com fases + ordem (server → apps/api → web client → Docker → auth/proxy → dados)
- [ ] Riscos mapeados (auth cookie/CSRF, SEO, build sem banco, dois deploys)
- [ ] `stack.md` / `overview.md` alinhados
- [ ] Lista de tasks subsequentes proposta (não criada)
- [ ] `pnpm harness check --barrel --db` ok (docs — sem impacto em código)

## Depende de: —
## Complexidade: média (decisão) — a execução da migração será alta
## Baseline (git)
- context/agents/queue/33-arch-separacao-backend-frontend.md

## Baseline (git)
- context/agents/queue/33-arch-separacao-backend-frontend.md
