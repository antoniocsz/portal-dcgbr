# Task: LGPD — direitos do titular: exportar meus dados + excluir conta
## Agente: `agente-backend`
## Módulo: `packages/modules/users`
## Escopo (arquivos que esta task vai tocar):
- `packages/modules/users/**`
- `apps/api/src/routes/users.ts`
- `apps/api/src/container.ts`
- `apps/web/src/features/users/**`
- `apps/web/src/app/(member)/perfil/page.tsx`
## Depende de: [ ] `37-backend-users-routes.md`, `108-web-paginas-legais-lgpd.md`
## Contexto para ler: context/modules/users/context.md, context/modules/users/status.md, context/project/adr/ADR-004*, ADR-007*
## Skills a carregar: codegen.md + backend.md + frontend.md + security.md
## Objetivo (LGPD art. 18 — portabilidade e eliminação):
Dar ao usuário, na própria área, o direito de **exportar seus dados** e **excluir a conta**.
## Backend (use cases no módulo `@digimon/users` + rotas):
1. **`ExportUserDataUseCase`** — reúne os dados do titular: perfil (nome, e-mail, papel, datas), comentários, decks, torneios e publicações na comunidade (referenciando por id/relações; **sem** expor dados de terceiros). Retorna um objeto JSON estruturado.
   - Rota `GET /users/me/export` (autenticado) → JSON (o web transforma em arquivo `.json` para download).
2. **`DeleteUserAccountUseCase`** — **eliminação** com integridade referencial:
   - **Anonimizar + desativar** o titular (política documentada): e-mail → valor não identificável (`deleted+<id>@invalid.local`), nome → "Usuário removido", `avatarUrl` → null, `status` → INACTIVE; **revogar** refresh tokens. Comentários/decks/torneios permanecem, porém **sem PII** (o autor passa a ser "Usuário removido").
   - Rota `DELETE /users/me` (autenticado) → 204. Não permitir que o próprio administrator se exclua se for o único admin (regra defensiva simples, documentada) — ou exigir confirmação.
3. **Composição** no `container.ts` (reusar prisma/eventBus; sem `new PrismaClient` na rota). Erros via handler global.
## Frontend (`features/users` + `/perfil`):
4. Seção **"Privacidade e meus dados"** no perfil (View só JSX; ViewModel orquestra):
   - **Baixar meus dados** → chama `GET /users/me/export` e baixa um `meus-dados.json`.
   - **Excluir minha conta** → modal de confirmação (explicando a anonimização) + `DELETE /users/me`; após sucesso, encerrar sessão e ir para `/`.
   - Link para a Política de Privacidade (`/privacidade`).
## Especificação:
- MVVM estrito no web; sem importar `@digimon/users` no client.
- **Não** apagar conteúdo de terceiros; anonimização é a política (documentar no status + no texto do modal).
## Critério de conclusão:
- [ ] `GET /users/me/export` retorna os dados do titular; `DELETE /users/me` anonimiza+desativa e revoga tokens
- [ ] Perfil com "Baixar meus dados" e "Excluir conta" (com confirmação); sessão encerrada após excluir
- [ ] `pnpm turbo typecheck lint test build --filter=@digimon/users --filter=@digimon/app-api --filter=@digimon/app-web` passando
- [ ] Smoke `app.inject`: export 200 (com dados), delete 204 + login falha depois (ou reportar bloqueio)
## Ao terminar: atualizar `context/modules/users/status.md` e `context/modules/web/status.md`, rodar `pnpm harness finish 110` e registrar o handoff
## Complexidade: alta

## Baseline (git)
- apps/api/src/routes/ads.ts
- apps/web/src/app/admin/anuncios/page.tsx
- apps/web/src/app/layout.tsx
- apps/web/src/components/index.ts
- apps/web/src/components/site-footer.tsx
- apps/web/src/features/auth/views/register-view.tsx
- context/modules/ads/status.md
- context/modules/web/status.md
- apps/web/src/app/(public)/cookies/page.tsx
- apps/web/src/app/(public)/privacidade/page.tsx
- apps/web/src/app/(public)/termos/page.tsx
- apps/web/src/components/consent-banner.tsx
- apps/web/src/features/consent/model/consent.ts
- apps/web/src/features/consent/viewmodels/index.ts
- apps/web/src/features/consent/viewmodels/use-consent.ts
- apps/web/src/features/legal/index.ts
- apps/web/src/features/legal/model/content.ts
- apps/web/src/features/legal/model/types.ts
- apps/web/src/features/legal/views/index.ts
- apps/web/src/features/legal/views/legal-document-view.tsx
- context/agents/done/106-web-admin-anuncios-gate.md
- context/agents/done/107-api-ads-get-id-anti-bot.md
- context/agents/done/108-web-paginas-legais-lgpd.md
- context/agents/done/109-web-consentimento-lgpd.md
- context/agents/queue/110-lgpd-direitos-titular.md
