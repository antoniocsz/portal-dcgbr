# Task: web — páginas legais (Privacidade, Termos, Cookies) + links no rodapé
## Agente: `agente-frontend`
## Módulo: `apps/web`
## Escopo (arquivos que esta task vai tocar):
- `apps/web/src/features/legal/**` (novo — conteúdo das páginas)
- `apps/web/src/app/(public)/privacidade/page.tsx` (novo)
- `apps/web/src/app/(public)/termos/page.tsx` (novo)
- `apps/web/src/app/(public)/cookies/page.tsx` (novo)
- `apps/web/src/components/site-footer.tsx`
- `apps/web/src/features/auth/views/register-view.tsx`
## Depende de: [ ] —
## Contexto para ler: context/project/overview.md, context/modules/web/context.md, context/project/design
## Skills a carregar: codegen.md + frontend.md + ui-ux.md
## Objetivo (LGPD — Lei 13.709/2018):
Criar as páginas legais do portal em pt-BR, com boa estrutura/SEO, e expô-las no rodapé. **Conteúdo é um modelo**: escrever com cuidado, marcado como sujeito a revisão jurídica, **sem inventar fatos**.
## O que criar:
1. **Conteúdo** em `features/legal/` (arquivo TS com os textos/estrutura, fácil de editar): dados estruturados (título, seções com headings + parágrafos/listas) para as 3 páginas.
2. **Páginas** (Server Components, `generateMetadata` com título/description/canonical; conteúdo renderizado com o design system — tipografia `font-display`, tokens `text-ink*`, `max-w-[760px]`):
   - **`/privacidade` — Política de Privacidade**: controlador (DigiTCG Brasil, portal de fã **não afiliado à Bandai**), dados coletados (cadastro: nome/e-mail; conteúdo do usuário: comentários/decks/torneios; dados técnicos), finalidades, **base legal (LGPD art. 7)**, compartilhamento (não vendemos dados; provedores de infra), retenção, **direitos do titular (art. 18)**: confirmação, acesso, correção, anonimização, portabilidade, eliminação, revogação do consentimento — e **como exercê-los** (link para `/perfil` → "Meus dados" e e-mail de contato), segurança, contato do encarregado (DPO) e "última atualização".
   - **`/termos` — Termos de Uso**: aceitação, cadastro/conta, conduta e conteúdo do usuário, propriedade intelectual (**marca Digimon pertence à Bandai; projeto de fã não afiliado**), isenções/limitação de responsabilidade, suspensão/encerramento, alterações, lei aplicável (Brasil).
   - **`/cookies` — Política de Cookies**: cookies **essenciais** (autenticação: `access_token`/`refresh_token`, httpOnly) sem os quais o site não funciona; preferências de consentimento (armazenadas no navegador); **sem cookies de terceiros** hoje; como gerenciar no navegador; link para o banner de consentimento.
3. **Rodapé** (`site-footer.tsx`): adicionar uma linha/coluna "Legal" com links para **Termos**, **Privacidade** e **Cookies** (e "Última atualização" nas páginas).
4. **Registro** (`register-view.tsx`): acrescentar o aviso padrão "Ao criar a conta você concorda com os **Termos** e a **Política de Privacidade**" com links.
## Especificação:
- Páginas públicas indexáveis (SEO), mas com `robots` normal (não noindex). Conteúdo em pt-BR, tom claro.
- E-mail de contato/DPO: usar `contato@digimoncardgamebrasil.com.br` (domínio do projeto) — se houver outro, o usuário ajusta.
- **Não** implementar lógica de consentimento (é a task 109) — apenas as páginas + links.
## Critério de conclusão:
- [ ] `/privacidade`, `/termos`, `/cookies` acessíveis, com metadata e conteúdo LGPD
- [ ] Rodapé com os 3 links legais; registro com o aviso + links
- [ ] `pnpm turbo typecheck lint --filter=@digimon/app-web` passando (não rodar `next build`)
## Ao terminar: atualizar `context/modules/web/status.md`, rodar `pnpm harness finish 108` e registrar o handoff
## Complexidade: média

## Baseline (git)
- context/agents/active/106-web-admin-anuncios-gate.md
- context/agents/queue/107-api-ads-get-id-anti-bot.md
- context/agents/queue/108-web-paginas-legais-lgpd.md
- context/agents/queue/109-web-consentimento-lgpd.md
- context/agents/queue/110-lgpd-direitos-titular.md
