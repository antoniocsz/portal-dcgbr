# Task: docs — alinhar deploy.md à porta 3022 da API
## Agente: `agente-backend`
## Módulo: `apps/api`
## Escopo (arquivos que esta task vai tocar):
- `context/project/deploy.md`
## Depende de: [ ] `118-infra-api-dockerfile-porta-3022.md`
## Contexto para ler: context/project/deploy.md, context/project/adr/ADR-007*
## Skills a carregar: codegen.md + infra.md
## Pendência (task 118):
O `apps/api/Dockerfile` passou a usar **`ARG PORT=3022`** (porta do servidor), mas `context/project/deploy.md` ainda menciona `PORT=3001` / `0.0.0.0:3001` em vários pontos (resumo, "Ports Exposes", tabela de env, logs, troubleshooting).
## O que fazer:
1. Atualizar `context/project/deploy.md` para refletir **3022** como porta da API em produção (o `ENV PORT` da imagem prevalece; o default local do código segue 3001).
2. Onde fizer sentido, deixar claro que **3001 é o default local** (dev) e **3022 é a porta do container/servidor**.
3. Não alterar código (`apps/api/src/index.ts` mantém o fallback local `?? 3001`) nem `.env.example` (exemplo local) — apenas a documentação de deploy, salvo se houver instrução explícita de produção.
## Critério de conclusão:
- [ ] `deploy.md` sem referências a 3001 como porta de produção da API
- [ ] Consistente com o Dockerfile (`PORT=3022`)
## Ao terminar: rodar `pnpm harness finish 119` e registrar o handoff
## Complexidade: baixa

## Baseline (git)
- apps/api/Dockerfile
- apps/web/next.config.ts
- apps/web/package.json
- apps/web/src/features/consent/model/consent.ts
- context/modules/privacy/context.md
- context/modules/privacy/status.md
- context/modules/web/status.md
- packages/database/prisma/schema.prisma
- packages/modules/privacy/src/domain/entities/consent-record.ts
- pnpm-lock.yaml
- context/agents/done/116-web-remover-dep-users.md
- context/agents/done/117-chore-docs-privacy.md
- context/agents/done/118-infra-api-dockerfile-porta-3022.md
- context/agents/queue/119-docs-deploy-porta-3022.md
