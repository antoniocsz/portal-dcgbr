# ADR-001: Portal único em Next.js (backend integrado)

**Data:** 2026-09-29
**Status:** accepted

## Contexto

O projeto (portal de notícias Digimon TCG Brasil) precisava de uma arquitetura para site público + painel admin no mesmo produto, com foco forte em SEO e indexação. O scaffold inicial trazia um `apps/api` separado (Fastify) herdado da stack antiga `@saas`, pensada para um SaaS multi-tenant genérico — que foi descartada na context-interview.

## Decisão

Portal **único** em Next.js App Router. O backend vive no próprio Next.js via **Route Handlers + Server Actions** (Hono.js como opção pontual para casos específicos). O app `apps/api` (Fastify) da stack antiga é descartado/removido. Validação com Zod. Tudo no mesmo domínio (`digimoncardgamebrasil.com.br`), sem subdomínios.

## Consequências positivas

- SEO-first: SSR/ISR nativo do Next.js para conteúdo público
- Um único deploy (Dockerfile → Coolify), menor superfície operacional
- Dados e UI próximos — menos fricção entre backend e frontend
- Painel admin integrado nas rotas `/admin/*` com proteção por role

## Trade-offs aceitos

- Acoplamento maior entre camadas (Route Handlers/Server Actions) — mitigado pelo MVVM estrito no frontend e DIP no domínio
- Limite de duração de funções serverless (se deploy for serverless) — mitigado por deploy em contêiner via Coolify

## Alternativas descartadas

- **Backend separado Fastify (`apps/api`):** stack antiga, orientada a SaaS multi-tenant, desalinhada com o produto
- **tRPC:** não trouxe benefício claro sobre Route Handlers + Zod para o porte do projeto