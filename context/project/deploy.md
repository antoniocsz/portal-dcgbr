# Deploy no Coolify — passo a passo

Runbook de deploy do portal Digimon TCG Brasil (Next.js standalone + Dockerfile).
Stack de deploy: **Dockerfile** (ADR-006) — app único, domínio único, sem Redis.

> Resumo da arquitetura de deploy:
> - Imagem multi-stage em `apps/web/Dockerfile` (deps → build → runtime standalone)
> - Runtime: `node apps/web/server.js` — lê `PORT`/`HOSTNAME` de env
> - **Migrations/seed rodam FORA da imagem** (o runtime não tem pnpm/prisma; ADR-006: imagem imutável)
> - Env de runtime: `DATABASE_URL`, `JWT_SECRET`, `PORT`

---

## 1. Pré-requisitos

- Servidor com **Coolify** instalado e com acesso a domínio (DNS apontável)
- Repositório `digimon-card-game-brasil` no GitHub/GitLab (branch `main`)
- Um **PostgreSQL** — de preferência o serviço de banco do próprio Coolify

## 2. Banco de dados (Postgres)

1. Coolify → **+ New → Database → PostgreSQL**
2. Defina usuário/senha/database (ex.: `digimon` / senha forte / `digimon`)
3. Guarde a connection string no formato:
   ```
   postgresql://<user>:<password>@<host>:5432/<db>
   ```
   - Banco interno do Coolify → host = nome do serviço (ex.: `postgres`)
   - Banco externo → host/porta externos (ex.: `db.exemplo.com:5432`)

## 3. Aplicação web

1. **+ New → Application**
2. Repositório: `digimon-card-game-brasil` · Branch: `main`
3. **Build Pack: `Dockerfile`**
   - Root Directory: `/` (raiz do repo)
   - Dockerfile Location: `apps/web/Dockerfile`
4. **Ports Exposes:** a mesma porta da env `PORT` (default `3000`)

> O build é multi-stage (deps → build → runtime). As páginas públicas são
> estáticas — o build **não** precisa de `DATABASE_URL`.

## 4. Variáveis de ambiente (app)

| Variável | Obrigatória | Exemplo / regra |
|---|---|---|
| `DATABASE_URL` | sim | `postgresql://digimon:****@postgres:5432/digimon` |
| `JWT_SECRET` | sim | mínimo **32 caracteres** (`openssl rand -base64 48`) |
| `PORT` | não | `3000` (padrão da imagem) |

`NEXT_TELEMETRY_DISABLED` já vem na imagem.

> ⚠️ `host.docker.internal` funciona **apenas** no Docker Desktop local. No
> Coolify, use o nome do serviço interno do Postgres (ou o host externo real).

## 5. Deploy

1. Botão **Deploy** → acompanhe os logs (3 estágios)
2. Sucesso esperado:
   ```
   ✓ Compiled successfully
   ✓ Generating static pages (42)
   ✓ Ready in Xms   (Next.js standalone em 0.0.0.0:PORT)
   ```

## 6. Migrations + seed (uma vez, fora da imagem)

A imagem não contém pnpm/prisma. Aplique as migrations **da sua máquina/CI**
apontando para o banco de produção:

```bash
# Migrations (aplica pendentes — nunca cria novas; NUNCA migrate dev)
DATABASE_URL="postgresql://..." pnpm --filter @digimon/database db:deploy

# Seed do administrador inicial (uma vez)
ADMIN_EMAIL="admin@digimoncardgamebrasil.com.br" \
ADMIN_PASSWORD="<senha-forte>" \
DATABASE_URL="postgresql://..." \
pnpm --filter @digimon/database db:seed
```

Depois troque a senha do admin no painel (`/admin/usuarios`) ou via seed.

## 7. Domínio + SSL

1. App → **Domains** → adicione `digimoncardgamebrasil.com.br`
2. DNS: registre o domínio no servidor (A record → IP do servidor)
3. **SSL:** Coolify emite Let's Encrypt automaticamente (force HTTPS)

## 8. Health check

- App → Health Check → path: `/` (responde 200)
- (Opcional futuro: criar rota `/api/health` dedicada)

## 9. Verificação pós-deploy

```bash
curl -I https://digimoncardgamebrasil.com.br/            # 200
curl -I https://digimoncardgamebrasil.com.br/noticias    # 200
curl -I https://digimoncardgamebrasil.com.br/admin       # 307 → /login
curl https://digimoncardgamebrasil.com.br/api/auth/me    # {"user":null}
# login com o admin no navegador → painel
```

## 10. Atualizações futuras

- Push na branch + **Redeploy** (ou webhook de deploy no Coolify)
- **Toda release com schema novo**: rodar `db:deploy` antes/junto do deploy
- Secrets (JWT_SECRET) nunca no repositório — só nas envs do Coolify

---

## Troubleshooting rápido

| Sintoma | Causa provável | Solução |
|---|---|---|
| 502 Bad Gateway | `Ports Exposes` ≠ env `PORT` | alinhar ambos (ex.: 3000) |
| 500 no login | `DATABASE_URL` inacessível | usar nome do serviço interno / host externo |
| 500 "JWT_SECRET ausente ou curto" | env ausente/<32 chars | gerar `openssl rand -base64 48` |
| Build falha em `pnpm install` | lockfile desatualizado | `pnpm install` local + commit do lockfile |
| Páginas 200 mas admin 404 | deploy antigo (standalone não regenerado) | Redeploy limpo (sem cache) |

## Automação futura (CI/CD)

Um GitHub Action pode rodar typecheck/test/build + `db:deploy` + disparar o
redeploy via webhook do Coolify (padrão em `.agents/infra.md`). Não bloqueia o
primeiro deploy manual deste runbook.