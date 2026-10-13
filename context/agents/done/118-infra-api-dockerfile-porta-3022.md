# Task: infra — API Dockerfile: porta default 3022 + manifests de ads/privacy
## Agente: `agente-backend`
## Módulo: `apps/api`
## Escopo (arquivos que esta task vai tocar):
- `apps/api/Dockerfile`
## Depende de: [ ] `47-infra-api-dockerfile-entrypoint.md`, `103-backend-ads-routes.md`, `114-backend-module-privacy.md`
## Contexto para ler: context/project/deploy.md, context/project/adr/ADR-007*, context/modules/ads/context.md
## Skills a carregar: codegen.md + infra.md
## Pedido do usuário:
A API vai rodar na porta **3022** no servidor → ajustar o Dockerfile.
## O que fazer:
1. **Porta default**: mudar `ARG PORT=3001` → **`ARG PORT=3022`** (o `ENV PORT=$PORT` e `EXPOSE $PORT` já derivam). Atualizar os comentários do topo que dizem `PORT → porta HTTP (default 3001)` para **3022**.
2. **Correção de build (importante)**: o estágio `deps` copia os manifests de cada workspace para o `pnpm install --frozen-lockfile --filter "@digimon/app-api..."`. `apps/api` agora depende de **`@digimon/ads`** e **`@digimon/privacy`**, cujos manifests **não estão sendo copiados** → o build da imagem falharia. Adicionar:
   ```
   COPY packages/modules/ads/package.json ./packages/modules/ads/package.json
   COPY packages/modules/privacy/package.json ./packages/modules/privacy/package.json
   ```
   Conferir se **todos** os workspaces dependidos por `apps/api` estão listados (comparar com o grafo de `apps/api/package.json` + deps transitivas de workspace).
3. Não alterar o `docker-entrypoint.sh` nem o `CMD`.
## Especificação:
- Só o `apps/api/Dockerfile` (e comentários). Não tocar no Dockerfile do web.
## Critério de conclusão:
- [ ] `ARG PORT=3022` + comentários atualizados; `EXPOSE` reflete 3022
- [ ] Manifests de `ads`/`privacy` copiados no estágio `deps`; nenhum workspace dependido faltando
- [ ] Dockerfile consistente (sem quebrar o fluxo de estágios)
## Ao terminar: atualizar `context/modules/api/status.md` (ou o status do módulo api correspondente) e `context/project/deploy.md` se mencionar a porta; rodar `pnpm harness finish 118` e registrar o handoff
## Complexidade: baixa

## Baseline (git)
- apps/web/next.config.ts
- apps/web/package.json
- context/modules/web/status.md
- pnpm-lock.yaml
- context/agents/active/117-chore-docs-privacy.md
- context/agents/done/116-web-remover-dep-users.md
- context/agents/queue/118-infra-api-dockerfile-porta-3022.md
