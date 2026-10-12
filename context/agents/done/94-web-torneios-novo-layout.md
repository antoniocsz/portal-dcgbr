# Task: web — /torneios/novo em container largo (alinhar com /decks/novo e editar)
## Agente: `agente-frontend`
## Módulo: `apps/web`
## Escopo (arquivos que esta task vai tocar):
- `apps/web/src/app/(member)/torneios/novo/page.tsx`
## Depende de: [ ] `90-frontend-torneio-editar.md`
## Contexto para ler: context/modules/tournaments/context.md, context/modules/web/context.md, context/project/design
## Skills a carregar: codegen.md + frontend.md + ui-ux.md
## Pendência:
`(member)/torneios/novo` ainda usa o `AuthShell` (card estreito ~420px), enquanto `(member)/torneios/[slug]/editar` (task 90) e `(member)/decks/novo` (task 75) usam container largo. Divergência de layout no mesmo fluxo.
## O que fazer:
1. Trocar o `AuthShell` estreito por um **container largo** (`mx-auto w-full max-w-[760px] px-4 py-10 lg:px-12` — mesmo padrão da página de editar torneio), com cabeçalho próprio (título "Publicar torneio" + subtítulo) usando a tipografia do design system.
2. **Manter o gate de Member** (rota sob `(member)` — o layout do grupo já redireciona anônimo para `/login`; não remover).
3. Não alterar `AuthShell`/`features/auth` (usado por login/registro) nem o `TournamentFormView`.
## Critério de conclusão:
- [ ] `/torneios/novo` usa layout largo, consistente com `editar` e `/decks/novo`
- [ ] Gate de Member preservado
- [ ] `pnpm turbo typecheck lint --filter=@digimon/app-web` passando (não rodar `next build`)
## Ao terminar: atualizar `context/modules/web/status.md`, rodar `pnpm harness finish 94` e registrar o handoff
## Complexidade: baixa

## Baseline (git)
- context/agents/queue/94-web-torneios-novo-layout.md
- context/agents/queue/95-web-not-found-brandado.md
- context/agents/queue/96-web-download-png-anchor.md
- context/agents/queue/97-backend-testes-integracao-postgres.md
- context/agents/queue/98-backend-import-assincrono.md
