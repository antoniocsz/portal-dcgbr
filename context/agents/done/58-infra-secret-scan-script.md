# 58 — Infra: script `pnpm secret:scan` (gitleaks via Docker)

## Agente: `agente-backend`
## Módulo: `web`

## Descrição
Adicionar um script cross-platform para rodar o gitleaks localmente via Docker,
facilitando a varredura de segredos antes de commitar. Usa a config `.gitleaks.toml`
da task 57.

## Escopo (arquivos que esta task vai tocar):
- `scripts/secret-scan.mjs`
- `package.json`

## Depende de: `57-infra-gitleaks.md`
## Contexto para ler: `.gitleaks.toml`, `package.json`, `.github/workflows/gitleaks.yml`
## Skills a carregar: infra.md + security.md

## Critério de conclusão:
- [ ] `pnpm secret:scan` roda o gitleaks (Docker) e reporta o resultado
- [ ] Script funciona no Windows (path do volume normalizado)
- [ ] `pnpm harness check --barrel --db` ok

## Ao terminar: `pnpm harness finish 58-infra-secret-scan-script`
## Complexidade: baixa
## Baseline (git)
- context/agents/queue/58-infra-secret-scan-script.md

## Baseline (git)
- package.json
- .github/workflows/gitleaks.yml
- .gitleaks.toml
- context/agents/done/57-infra-gitleaks.md
- context/agents/queue/58-infra-secret-scan-script.md
- scripts/secret-scan.mjs
