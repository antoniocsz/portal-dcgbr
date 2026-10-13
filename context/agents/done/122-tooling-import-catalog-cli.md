# Task: tooling — CLI para importar o catálogo de cartas em qualquer ambiente
## Agente: `agente-backend`
## Módulo: `apps/api`
## Escopo (arquivos que esta task vai tocar):
- `scripts/import-catalog.mjs`
- `context/modules/cards/status.md`
## Depende de: [ ] `68-backend-cards-import-taka.md`, `98-backend-import-assincrono.md`
## Contexto para ler: context/modules/cards/context.md + status.md, context/project/deploy.md
## Skills a carregar: codegen.md + infra.md
## Pedido do usuário:
"Importar o catálogo no ambiente novo." Como o servidor é remoto (sem shell), o caminho prático é um **script portável** que dispara a importação via API, rodando da máquina do usuário contra qualquer ambiente.
## O que criar:
**`scripts/import-catalog.mjs`** (Node ≥22, sem dependências — só `fetch` nativo):
1. Env: `API_URL` (default `http://localhost:3001`), `ADMIN_EMAIL`, `ADMIN_PASSWORD` (obrigatórios); opcionais `IMPORT_SETS`, `IMPORT_IDS`, `IMPORT_MAX`, `IMPORT_SOURCE` (default `taka`).
2. Login: `POST {API_URL}/auth/login` com `{ email, password }`; guardar o cookie `access_token` (o script mantém o `Set-Cookie` e reenvia em `cookie: access_token=...`).
3. Disparar: `POST {API_URL}/cards/admin/import-source/jobs` (body com os opcionais) → `202 { jobId }`.
4. **Polling**: `GET {API_URL}/cards/admin/import-source/jobs/{jobId}` a cada ~3s até `status` ∈ {`done`,`error`}; imprimir progresso e, ao final, o resultado (`imported/updated/skipped/setsCount`) ou o erro. Timeout total ~10min.
5. **Idempotente**: reexecutar é seguro (o import faz upsert por `dcgId`).
6. Mensagens claras em pt-BR; `exit code` ≠ 0 em falha; não imprimir a senha nem o token.
7. Documentar no cabeçalho: como usar (local e produção), exemplo:
   ```
   API_URL=https://api.digimoncardgamebrasil.com.br ADMIN_EMAIL=... ADMIN_PASSWORD=... node scripts/import-catalog.mjs
   ```
## Especificação:
- Sem `package.json` novo, sem dependências externas.
- **Não** alterar o `apps/api` (rota já existe) nem o `apps/web`.
- Deixar claro no cabeçalho que a **alternativa 1-clique** é `/admin/cartas → Importar catálogo externo` (task 98).
## Critério de conclusão:
- [ ] `scripts/import-catalog.mjs` funcional (login → job → polling → resultado)
- [ ] Rodado **localmente** contra a API em `localhost:3001` (ou reportar bloqueio se a API não estiver no ar) e resultado reportado
- [ ] Idempotente; sem vazar segredos
## Ao terminar: atualizar `context/modules/cards/status.md`, rodar `pnpm harness finish 122` e registrar o handoff
## Complexidade: média

## Baseline (git)
- context/agents/active/121-web-favicon.md
- context/agents/queue/122-tooling-import-catalog-cli.md
