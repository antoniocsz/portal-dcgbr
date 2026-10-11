# 57 — Infra: gitleaks (varredura de segredos no CI + config)

## Agente: `agente-backend`
## Módulo: `web`

## Descrição
Adicionar varredura de segredos com **gitleaks**: um workflow de CI que roda em
push/PR e uma config `.gitleaks.toml` (ruleset default + allowlists dos defaults
de dev — `localhost`, placeholders de `.env.example`, fixtures de teste), para
evitar que segredos entrem no repositório.

## Escopo (arquivos que esta task vai tocar):
- `.gitleaks.toml`
- `.github/workflows/gitleaks.yml`

## Depende de: —
## Contexto para ler: `.github/workflows/ci.yml`, `.gitignore`
## Skills a carregar: infra.md + security.md

## Critério de conclusão:
- [ ] `.gitleaks.toml` (extend default + allowlists de dev)
- [ ] `.github/workflows/gitleaks.yml` (push/PR + workflow_dispatch)
- [ ] Varredura local via Docker passa (sem leaks reais)
- [ ] `pnpm harness check --barrel --db` ok

## Ao terminar: `pnpm harness finish 57-infra-gitleaks`
## Complexidade: baixa
## Baseline (git)
- context/agents/queue/57-infra-gitleaks.md

## Baseline (git)
- context/agents/queue/57-infra-gitleaks.md
