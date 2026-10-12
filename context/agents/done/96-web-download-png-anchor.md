# Task: fix web — download do PNG com `<a>` anexado ao DOM (robustez)
## Agente: `agente-frontend`
## Módulo: `apps/web`
## Escopo (arquivos que esta task vai tocar):
- `apps/web/src/features/decks/viewmodels/use-deck-image-export.ts`
## Depende de: [ ] `84-decks-detalhe-thumb-e-export-png.md`
## Contexto para ler: context/modules/decks/context.md
## Skills a carregar: codegen.md + frontend.md
## Pendência (robustez, apontada no smoke test do export PNG):
O `download()` cria um `<a>` **destacado do DOM** (`anchor.click()` sem `appendChild`). Funciona nos navegadores principais, mas anexar ao `<body>` (e remover depois) é a prática mais à prova de falhas em alguns ambientes/versões.
## O que fazer:
No `download()`:
1. Anexar o `<a>` ao `document.body`, disparar `click()`, e **remover** em seguida (ex.: `requestAnimationFrame`/`setTimeout` curto).
2. Manter `href = previewUrl` (blob) e `download = fileName`; **não** revogar a URL antes do clique efetivar (a revogação atual no reset/regenerate está correta — não mexer).
3. Sem mudança de comportamento visível (mesmo arquivo/PNG).
## Critério de conclusão:
- [ ] `<a>` anexado ao DOM antes do click e removido depois; download continua gerando `deck-<slug>.png`
- [ ] `pnpm turbo typecheck lint --filter=@digimon/app-web` passando (não rodar `next build`)
## Ao terminar: atualizar `context/modules/decks/status.md`, rodar `pnpm harness finish 96` e registrar o handoff
## Complexidade: baixa

## Baseline (git)
- context/agents/active/94-web-torneios-novo-layout.md
- context/agents/active/95-web-not-found-brandado.md
- context/agents/queue/96-web-download-png-anchor.md
- context/agents/queue/97-backend-testes-integracao-postgres.md
- context/agents/queue/98-backend-import-assincrono.md
