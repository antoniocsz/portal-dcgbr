# 59 — Frontend: corrigir sessão pós-login (header reativo + guard de /login)

## Agente: `agente-frontend`
## Módulo: `web`

## Descrição
Dois bugs reportados:
1. Após o login, o header só mostra o `UserMenu` depois de F5 — o `useSession` usa
   cache de módulo + estado por instância, então o `UserMenu` (root layout) não
   reage ao login via navegação SPA.
2. Usuário logado ainda acessa `/login` (e `/registro`) — falta guard.

Correções: transformar `useSession` num **store compartilhado** (`useSyncExternalStore`)
com `refreshSession()`; chamar `refreshSession()` após login/registro; e adicionar
guard server-side (redirect `/` se já logado) em `/login` e `/registro`.

## Escopo (arquivos que esta task vai tocar):
- `apps/web/src/lib/use-session.ts`
- `apps/web/src/lib/session.ts`
- `apps/web/src/features/admin/model/session.ts`
- `apps/web/src/features/auth/viewmodel/use-login-view-model.ts`
- `apps/web/src/features/auth/viewmodel/use-register-view-model.ts`
- `apps/web/src/app/(auth)/login/page.tsx`
- `apps/web/src/app/(auth)/registro/page.tsx`
- `context/modules/web/status.md`

## Depende de: `53-frontend-cutover-remover-handlers-web.md`
## Contexto para ler: `lib/use-session.ts`, `features/admin/model/session.ts`, ADR-007
## Skills a carregar: codegen.md + frontend.md

## Especificação
- `use-session.ts`: store de módulo (lista de listeners) + `refreshSession()`; hook
  via `useSyncExternalStore`; API pública mantida (`{ user, loading, refresh }`).
- `lib/session.ts` (server-only): `getSession()` genérico (valida `access_token` via
  `@digimon/auth`); `features/admin/model/session.ts` delega para ele (dedupe).
- Login/registro: após sucesso, `refreshSession()` + `router.push('/')`.
- Guard: `/login` e `/registro` são Server Components que `redirect('/')` se houver sessão.
- MVVM estrito; sem fetch direto em View.

## Critério de conclusão:
- [ ] Após login, o header mostra o UserMenu sem F5
- [ ] Logado, acessar `/login`/`/registro` redireciona para `/`
- [ ] typecheck + lint + build `@digimon/app-web` ok
- [ ] `pnpm harness check --barrel --db` ok

## Ao terminar: atualizar `context/modules/web/status.md`; `pnpm harness finish 59-frontend-fix-sessao-login`
## Complexidade: média
## Baseline (git)
- context/agents/queue/59-frontend-fix-sessao-login.md

## Baseline (git)
- context/agents/queue/59-frontend-fix-sessao-login.md
