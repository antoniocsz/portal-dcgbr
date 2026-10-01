# 29 — Guia de deploy no Coolify (passo a passo)

## Agente: `agente-backend`
## Módulo: `web`

## Descrição
Criar um runbook prático de deploy no Coolify para o portal (Dockerfile + standalone):
Postgres, app web, env vars (DATABASE_URL/JWT_SECRET/PORT), migrations/seed fora
da imagem, domínio + SSL, health check e verificação pós-deploy.

## Escopo
- `context/project/deploy.md`
- `README.md`
- `context/modules/web/status.md`

## Critério de conclusão:
- [ ] Passo a passo completo e executável (Postgres → app → envs → deploy → migrations/seed → domínio/SSL → health → verificação)
- [ ] Notas de troubleshooting (porta, JWT_SECRET, DATABASE_URL interno vs. externo)
- [ ] README linka o guia
- [ ] Typecheck/lint não são afetados (docs)
## Baseline (git)
- context/agents/queue/29-guia-deploy-coolify.md
