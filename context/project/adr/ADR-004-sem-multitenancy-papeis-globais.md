# ADR-004: Sem multi-tenancy — papéis globais fixos

**Data:** 2026-09-29
**Status:** accepted

## Contexto

O scaffold inicial (`@saas`) era um SaaS multi-tenant genérico (hierarquia Platform → Organization → ClientAccount, tenancy via header `X-Tenant-Id`, RBAC/ABAC por tenant). A context-interview redefiniu o produto: **portal de notícias público**, não multi-tenant.

## Decisão

Produto **não multi-tenant**. Papéis **fixos e globais** (não customizáveis): `Administrator`, `Editor`, `Member` (membro registrado gratuito). `Reader` não é papel — é consumo público. `Author` não é papel — é a relação `createdBy` de cada conteúdo. Permissões gerenciadas exclusivamente pelo Administrator.

## Consequências positivas

- Modelo de autorização muito mais simples (sem tenantId em queries, sem cache de abilities por tenant, sem roles customizadas)
- Sem middleware de tenancy, sem header `X-Tenant-Id`
- Módulos `@saas/tenancy`, `@saas/authorization` (RBAC/ABAC) e `@saas/audit` foram arquivados

## Trade-offs aceitos

- Menos flexibilidade para o futuro (se um dia virar SaaS multi-tenant, será uma migração) — aceito: fora do escopo do produto hoje

## Alternativas descartadas

- **Manter tenancy/@saas:** stack antiga desalinhada com o produto portal de notícias
- **Papéis customizáveis:** complexidade de UI/gerência de permissões sem necessidade real — papéis fixos resolvem os 3 perfis definidos