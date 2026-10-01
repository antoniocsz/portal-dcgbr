# 25 — Botão de logout no painel admin

## Agente: `agente-frontend`
## Módulo: `apps/web` (admin)

## Descrição
O painel admin não tem botão de sair. Adicionar `LogoutButton` (client):
- Desktop: item "Sair" no rodapé do `AdminSidebar` (abaixo do usuário)
- Mobile: ícone de logout no header do `AdminShell`
- Fluxo: POST /api/auth/logout → redirect /login + router.refresh

## Escopo
- `apps/web/src/components/admin/logout-button.tsx` (novo)
- `apps/web/src/components/admin/admin-sidebar.tsx`
- `apps/web/src/features/admin/views/admin-shell.tsx`
- `context/modules/web/status.md`

## Regras
- Reutiliza a rota `/api/auth/logout` existente (revoga refresh + limpa cookies)
- MVVM: componente de ação (View), sem hooks de dados
- Acessível: aria-label no mobile, texto visível no desktop

## Critério de conclusão:
- [ ] "Sair" aparece na sidebar desktop (admin/editor)
- [ ] Ícone de logout no header mobile
- [ ] Logout limpa sessão e redireciona para /login
- [ ] Typecheck + lint + build ok
## Baseline (git)
- context/agents/queue/25-admin-logout.md
