# ADR-005: Sem Redis/cache externo na v1

**Data:** 2026-09-29
**Status:** accepted

## Contexto

A stack antiga previa Redis para cache de abilities, sessões e filas (BullMQ). Após a redefinição do produto (portal público, não multi-tenant, sem assinaturas), o custo/benefício de um cache externo mudou.

## Decisão

**Apenas Postgres** na v1. Sem Redis/cache externo. Cache fica a cargo do **ISR do Next.js** (para conteúdo público) e cache em memória de curta duração onde fizer sentido.

## Consequências positivas

- Infraestrutura mínima no deploy Coolify (só app + Postgres)
- Menos peças para operar/monitorar na v1
- ISR cobre bem o caso SEO-first (páginas públicas revalidáveis)

## Trade-offs aceitos

- Sessão/refresh tokens persistidos no banco (queries a mais) — aceitável para o porte
- Filas assíncronas (ex: eventos) sem BullMQ — na v1, EventBus in-process resolve; reavaliar quando houver volume

## Alternativas descartadas

- **Redis para cache de abilities:** não há mais abilities por tenant (ADR-004)
- **Redis como fila (BullMQ):** adiado até existir demanda real de processamento assíncrono fora do request