# Task: web — home: esconder "Junte-se à comunidade" quando o usuário está logado
## Agente: `agente-frontend`
## Módulo: `apps/web`
## Escopo (arquivos que esta task vai tocar):
- `apps/web/src/features/content/views/home-view.tsx`
## Depende de: [ ] `59-frontend-fix-sessao-login.md`
## Contexto para ler: context/modules/content/context.md, context/modules/web/context.md, context/project/design
## Skills a carregar: codegen.md + frontend.md + ui-ux.md
## Pedido do usuário:
Na home, a área **"Junte-se à comunidade"** (com os botões "Entrar" e "Criar conta grátis") **não deve aparecer quando o usuário está logado**.
## O que fazer:
1. Em `home-view.tsx` (já é `'use client'`), usar o hook de sessão `useSession()` de `@/lib/use-session` (store compartilhado) para saber se há usuário.
2. Renderizar o bloco `<CommunityCta />` **somente quando NÃO houver usuário logado**.
   - Evitar "flash": enquanto `loading` (sessão ainda não resolvida), **não** renderizar o CTA (some quando logado, sem piscar). Alternativa aceitável: não renderizar quando `loading || user`.
3. Não alterar o componente `CommunityCta` em si nem o resto da home; não mexer no header/UserMenu.
## Especificação:
- MVVM: o `useSession` é um ViewModel compartilhado; a View só decide renderizar. Sem fetch na View.
## Critério de conclusão:
- [ ] Logado: o bloco "Junte-se à comunidade" não aparece
- [ ] Deslogado: continua aparecendo normalmente (sem flash indevido)
- [ ] `pnpm turbo typecheck lint --filter=@digimon/app-web` passando (não rodar `next build`)
## Ao terminar: atualizar `context/modules/web/status.md` e `context/modules/content/status.md`, rodar `pnpm harness finish 100` e registrar o handoff
## Complexidade: baixa

## Baseline (git)
- context/agents/queue/100-web-home-cta-logado.md
- context/agents/queue/101-backend-jobs-ttl-paginacao.md
