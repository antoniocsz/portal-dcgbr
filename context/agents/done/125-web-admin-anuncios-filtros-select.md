# Task: web — Anúncios (admin): filtros de botões para selects
## Agente: `agente-frontend`
## Módulo: `apps/web`
## Escopo (arquivos que esta task vai tocar):
- `apps/web/src/features/admin/views/admin-ads-view.tsx`
## Depende de: [ ] —
## Contexto para ler: context/modules/web/context.md, context/modules/ads/context.md
## Skills a carregar: codegen.md + frontend.md + ui-ux.md
## Pedido do usuário:
"Em Anúncios, tem os 3 filtros — fariam mais sentido ser selects em vez de lista de botões."
## Diagnóstico:
- `admin-ads-view.tsx` usa o componente local `FilterGroup` (lista de `<button aria-pressed>`) para status, tipo e posição.
- O projeto já usa `<select>` para filtros em `card-filters.tsx` e `admin-users-view.tsx` (padrão existente).
## Especificação:
- Substituir os 3 usos de `FilterGroup` por 3 campos `<select>` rotulados (status, tipo, posição).
- Reaproveitar as mesmas opções já declaradas (`STATUS_FILTERS`, `KIND_FILTERS`, `PLACEMENT_FILTERS`) e os mesmos callbacks do VM (`vm.selectStatus`, `vm.selectKind`, `vm.selectPlacement`).
- Usar a classe de input já existente no arquivo (`INPUT_CLASS`), com `<label>` associado via `htmlFor`/`id` (acessibilidade), num container responsivo (`flex flex-wrap items-end gap-4` como em `card-filters.tsx`).
- Se `FilterGroup` ficar sem uso, remover o componente e seu tipo auxiliar.
- Não alterar lógica do ViewModel, nem as demais seções do formulário/tabela.
## Critério de conclusão:
- [ ] Os 3 filtros de Anúncios são `<select>` (não mais botões), com rótulo acessível
- [ ] Filtrar por status/tipo/posição segue funcionando
- [ ] `pnpm turbo typecheck --filter=@digimon/app-web` passando
- [ ] `git diff` restrito ao `## Escopo`
## Ao terminar: atualizar `context/modules/web/status.md`, rodar `pnpm harness finish 125` e registrar o handoff
## Complexidade: baixa

## Baseline (git)
- apps/web/src/features/admin/views/site-settings-view.tsx
- context/modules/web/status.md
- context/agents/active/124-web-admin-remover-moderacao-comentarios-demo.md
- context/agents/done/123-web-admin-configuracoes-padding.md
- context/agents/queue/125-web-admin-anuncios-filtros-select.md
