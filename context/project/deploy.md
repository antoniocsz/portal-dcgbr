# Deploy no Coolify — passo a passo (2 apps: API + web)

Runbook de deploy do portal Digimon TCG Brasil. A arquitetura agora tem **dois
aplicativos** (ADR-007), com domínios separados:

- **API** (`apps/api`, Node + Fastify) → `api.digimoncardgamebrasil.com.br`
- **web** (`apps/web`, Next.js standalone) → `digimoncardgamebrasil.com.br`

> Resumo da arquitetura de deploy:
> - **Imagem da API** — `apps/api/Dockerfile` (multi-stage → runtime Node 22). O
>   **entrypoint aplica as migrations e roda o seed** (`prisma migrate deploy` +
>   `seed --only-if-empty`) **antes** de subir o Fastify. Sobe em `PORT=3022` /
>   `HOST=0.0.0.0` (default da imagem; `3001` é o default **local** do código);
>   health check em `GET /health`.
> - **Imagem do web** — `apps/web/Dockerfile` (Next standalone, **sem banco**;
>   `DATABASE_URL` **não** é mais necessária). Sobe em `PORT=3000`.
> - **Ordem de deploy: API primeiro, web depois** — a API é quem aplica as
>   migrations/seed; o web só precisa da API no ar.
> - **Comunicação:** no browser o web fala `https://api.digimoncardgamebrasil.com.br`
>   (CORS + cookie `Domain=.digimoncardgamebrasil.com.br`); no SSR/middleware fala
>   o endereço **interno** da API na rede do Coolify (ex.: `http://api:3022`).

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

## 3. Aplicativo 1 — API (`apps/api`)

1. **+ New → Application**
2. Repositório: `digimon-card-game-brasil` · Branch: `main`
3. **Build Pack: `Dockerfile`**
   - Root Directory: `/` (raiz do repo)
   - Dockerfile Location: `apps/api/Dockerfile`
4. **Ports Exposes:** `3022` (mesma da env `PORT`; `3001` é o default local do código)
5. **Domains:** `api.digimoncardgamebrasil.com.br` (SSL automático — §6)
6. **Health Check:** path `/health` (responde `200 {"status":"ok"}`)

### 3.1 Variáveis de ambiente (API)

| Variável | Obrigatória | Exemplo / regra |
|---|---|---|
| `DATABASE_URL` | sim | `postgresql://digimon:****@postgres:5432/digimon` |
| `JWT_SECRET` | sim | mínimo **32 caracteres** (`openssl rand -base64 48`); **o mesmo** usado no web |
| `CORS_ORIGIN` | sim (produção) | `https://digimoncardgamebrasil.com.br,https://www.digimoncardgamebrasil.com.br` (nunca `*`) |
| `COOKIE_DOMAIN` | não | `=.digimoncardgamebrasil.com.br` (default em produção; vazio = sem `Domain`) |
| `SKIP_SEED` | não | `true` pula o seed (default: roda o seed guardado) |
| `PORT` | não | `3022` (padrão da imagem; `3001` é o default local do código) |
| `HOST` | não | `0.0.0.0` (padrão da imagem) |

> `ADMIN_EMAIL` / `ADMIN_PASSWORD` são lidos pelo seed para criar o administrador
> inicial **apenas** quando o banco está vazio (ver §3.2).

### 3.2 Migrations + seed no entrypoint (automáticos)

O runtime da API é Node **completo** (monorepo + `packages/database`), então o
entrypoint `apps/api/docker-entrypoint.sh` roda, a cada start do container:

```
prisma migrate deploy                    # SEMPRE (aplica pendentes; nunca migrate dev)
tsx prisma/seed.ts --only-if-empty       # só se SKIP_SEED != "true"
exec node apps/api/dist/index.mjs        # sobe o Fastify (CMD sobrescrevível no painel)
```

Diferente do web (ADR-006), aqui **não** é preciso rodar migrations/seed "de
fora" da imagem: o **deploy da API aplica tudo**. O seed é **guardado**
(`--only-if-empty`): em banco já populado loga `Seed ignorado (banco já populado)`
e sai 0 — nunca sobrescreve produção.

## 4. Aplicativo 2 — web (`apps/web`)

1. **+ New → Application**
2. Repositório: `digimon-card-game-brasil` · Branch: `main`
3. **Build Pack: `Dockerfile`**
   - Root Directory: `/` (raiz do repo)
   - Dockerfile Location: `apps/web/Dockerfile`
4. **Ports Exposes:** `3000` (mesma da env `PORT`)
5. **Domains:** `digimoncardgamebrasil.com.br` (+ `www` — §6)
6. **Health Check:** path `/` (responde 200)

### 4.1 Variáveis de ambiente (web)

| Variável | Obrigatória | Exemplo / regra |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | sim | `https://api.digimoncardgamebrasil.com.br` — URL **pública** da API usada no **browser** |
| `API_INTERNAL_URL` | sim (SSR/middleware) | `http://api:3022` — endereço **interno** da API na rede do Coolify |
| `JWT_SECRET` | sim | **o mesmo** segredo da API (valida a sessão do admin no servidor) |
| `PORT` | não | `3000` (padrão da imagem) |

> ⚠️ **`NEXT_PUBLIC_API_URL` é embutida em tempo de build** (prefixo `NEXT_PUBLIC_`):
> no Coolify, deixe essa variável disponível **no build** da aplicação web (toggle
> "available at buildtime"), senão o bundle do browser cai no fallback de dev
> (`http://localhost:3001`). `API_INTERNAL_URL` e `JWT_SECRET` são lidas em runtime.

> ℹ️ `API_INTERNAL_URL` é usada pelo SSR das páginas `[slug]`/`[id]` e pelo
> middleware de site-gate (`proxy.ts`). O default do código é `http://api:3001`
> (fallback **local/legado**); em **produção** a API escuta em `3022` (default da
> imagem), então defina `API_INTERNAL_URL=http://api:3022` — se o serviço da API
> não se chamar `api` no Coolify, ajuste a env para o nome interno real do serviço.

## 5. Ordem de deploy

1. **Deploy da API primeiro** — o entrypoint aplica `migrate deploy` + seed e só
   então sobe o Fastify. Aguarde o `/health` responder 200.
2. **Deploy do web depois** — o web só depende da API no ar (CORS + cookies no
   browser; `API_INTERNAL_URL` no SSR/middleware).

Sucesso esperado nos logs:
- **API:** migrations aplicadas, seed (ou `Seed ignorado`), Fastify ouvindo em `0.0.0.0:3022`
- **web:** `✓ Compiled successfully` → `✓ Ready` (Next standalone em `0.0.0.0:3000`)

## 6. Domínios + SSL

Para **cada** app (API e web):

1. App → **Domains** → adicione o domínio correspondente
   - web: `digimoncardgamebrasil.com.br` (+ `www.digimoncardgamebrasil.com.br`)
   - API: `api.digimoncardgamebrasil.com.br`
2. DNS: registre no provedor (`A` → IP do servidor; `api` como subdomínio)
3. **SSL:** o Coolify emite Let's Encrypt automaticamente (force HTTPS)

## 7. DNS

```
digimoncardgamebrasil.com.br      A   <IP do servidor>
www.digimoncardgamebrasil.com.br  A   <IP do servidor>
api.digimoncardgamebrasil.com.br  A   <IP do servidor>
```

## 8. Health check

- **API:** Health Check → path **`/health`** (o Coolify reinicia o container se
  não responder 200; como o entrypoint roda migrate/seed antes do `listen`, o
  health check só passa depois do boot completo).
- **web:** Health Check → path **`/`** (responde 200).

## 9. Verificação pós-deploy (smoke test)

```bash
# API — health e CORS
curl https://api.digimoncardgamebrasil.com.br/health          # {"status":"ok"}
curl -si -X OPTIONS https://api.digimoncardgamebrasil.com.br/auth/login \
  -H "Origin: https://digimoncardgamebrasil.com.br" \
  -H "Access-Control-Request-Method: POST" | head -n 1        # 204 + Access-Control-Allow-Credentials

# web — páginas públicas e admin
curl -I https://digimoncardgamebrasil.com.br/                 # 200
curl -I https://digimoncardgamebrasil.com.br/noticias         # 200
curl -I https://digimoncardgamebrasil.com.br/admin            # 307 → /login

# fluxo de login (browser)
# 1. abra https://digimoncardgamebrasil.com.br/login
# 2. autentique com o admin → deve entrar em /admin
# 3. verifique no DevTools que o cookie `access_token` tem
#    Domain=.digimoncardgamebrasil.com.br e as chamadas vão para api.*
```

## 10. Atualizações futuras

- Push na branch + **Redeploy** (ou webhook de deploy no Coolify).
- **Toda release com schema novo**: redeploy da **API** (o entrypoint aplica
  `migrate deploy`); não é preciso rodar migrations à mão.
- Deploy do web **depois** da API quando a release envolver mudança de contrato.
- Secrets (`JWT_SECRET`) nunca no repositório — só nas envs do Coolify (mesmo
  valor na API e no web).

---

## Troubleshooting rápido

| Sintoma | Causa provável | Solução |
|---|---|---|
| 502 Bad Gateway | `Ports Exposes` ≠ env `PORT` | alinhar ambos (API 3022, web 3000) |
| API não sobe / reinicia em loop | `DATABASE_URL` inacessível | usar nome do serviço interno / host externo |
| Erro `JWT_SECRET ausente ou curto` | env ausente/<32 chars | gerar `openssl rand -base64 48` (igual na API e no web) |
| Login funciona mas admin não abre | web sem `JWT_SECRET` (sessão server-side nula) | definir `JWT_SECRET` (o mesmo da API) no web |
| Login dá erro de CORS no browser | `CORS_ORIGIN` sem o domínio do web | allowlist exata (`https://digimoncardgamebrasil.com.br,https://www...`), nunca `*` |
| Cookie não persiste entre web e API | `COOKIE_DOMAIN` errado | `COOKIE_DOMAIN=.digimoncardgamebrasil.com.br` |
| SSR/`notícias/[slug]` ou site-gate falha | `API_INTERNAL_URL` errada | apontar para o nome interno real da API (ex.: `http://api:3022`) |
| Browser chama `localhost:3001` | `NEXT_PUBLIC_API_URL` não disponível no build | marcar a env "available at buildtime" e redeployar |
| Build falha em `pnpm install` | lockfile desatualizado | `pnpm install` local + commit do lockfile |
| Páginas 200 mas admin 404 | deploy antigo (standalone não regenerado) | Redeploy limpo (sem cache) |

## Automação futura (CI/CD)

Um GitHub Action pode rodar typecheck/test/build **por app** (filtro por paths:
`apps/api/**` vs `apps/web/**` + `packages/**`), disparar o redeploy da API (que
aplica as migrations no entrypoint) e em seguida o do web, via webhook do Coolify
(padrão em `.agents/infra.md`). Não bloqueia o deploy manual deste runbook.
