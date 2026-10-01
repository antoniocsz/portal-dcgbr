# 28 — Porta do web configurável via env (Coolify)

## Agente: `agente-backend`
## Módulo: `web`

## Descrição
O `server.js` do standalone já lê `process.env.PORT`, mas o Dockerfile fixa
`ENV PORT=3000`. Tornar a porta explicitamente configurável:
- ARG `PORT` (default 3000) no estágio runtime → `ENV PORT=$PORT`
- `EXPOSE $PORT` (interpola o ARG)
- Documentar que o Coolify sobrescreve via env runtime (sem rebuild)

## Escopo
- `apps/web/Dockerfile`
- `context/project/adr/ADR-006-docker-web-standalone.md`
- `context/modules/web/status.md`

## Critério de conclusão:
- [ ] `--build-arg PORT=xxxx` muda a porta exposta da imagem
- [ ] env runtime PORT sobrescreve sem rebuild (standalone lê process.env.PORT)
- [ ] ADR-006 atualizado
- [ ] `docker build --build-arg PORT=8080` valida (EXPOSE interpola ARG)
## Baseline (git)
- context/agents/queue/28-porta-configuravel.md
