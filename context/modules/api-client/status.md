# @digimon/api-client — Status

## Fase 1 — Cliente único do web (task 44-backend-api-client)
- [x] `createApiClient({ baseUrl })` — `baseUrl` configurável (público no browser / interno no SSR)
- [x] `credentials: 'include'` por padrão (cookie de sessão cross-origin — ADR-007)
- [x] Removido `tenantId`/`x-tenant-id` e `token`/`Authorization` (projeto não é multi-tenant; auth por cookie)
- [x] `ApiError` tipado (`message`, `status`, `code`) compatível com o formato das features
- [x] Parse do envelope de erro `{ error: { message, code } }`
- [x] GET/POST/PATCH/DELETE com JSON; `204` tratado (retorna `undefined`)
- [x] Typecheck `@digimon/api-client` ok

## Handoff (task 44)
- **Feito:** cliente HTTP compartilhado evoluído do código morto herdado do `@saas`.
- **Arquivos:** `packages/api-client/src/index.ts`, `context/modules/api-client/status.md`.
- **Deps:** nenhuma adicionada (`package.json` intocado — `fetch`/`Headers` vêm do lib DOM já no `tsconfig`).
- **Decisões:**
  1. `ApiClientOptions` = apenas `{ baseUrl }`; removidos `tenantId` **e** `token` (auth é
     por cookie `credentials: 'include'`; o `Authorization` Bearer era do template).
  2. `ApiError` passou para `(message, status, code)` — assinatura idêntica ao `ApiError`
     local das features, para que a task 45 substitua os duplicados sem mudar consumo.
  3. `content-type: application/json` só é setado quando há body (POST sem body, ex.
     `submit/publish/archive`, não envia header — evita rejeição de body vazio no Fastify).
  4. `baseUrl` normalizado (trailing slash removido) para concatenar `path` sem `//`.
  5. `delete()` tipado retorna `undefined` em `204` (ex. `DELETE /comments/:id`).
- **Pendências:** task 45 (wire das features) consumirá este cliente com
  `NEXT_PUBLIC_API_URL` (browser) / `http://api:3001` (SSR).
- **Fora do escopo (reportar):** nenhum outro arquivo tocado; `package.json` sem alteração necessária.
