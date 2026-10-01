# ADR-003: Busca via full-text do Postgres

**Data:** 2026-09-29
**Status:** accepted

## Contexto

O card database e o conteúdo precisam de busca (nome/efeito de cartas, posts, decks). A stack antiga previa engine de busca externa; o portal quer SEO-first com infraestrutura enxuta (Postgres + Prisma, sem Redis).

## Decisão

Busca via **full-text do Postgres** (índices GIN com `tsvector`/`to_tsvector`), sem engine externa de busca (Algolia/Meilisearch) na v1.

## Consequências positivas

- Zero infraestrutura adicional — apenas Postgres
- Consistência transacional com os dados (sem sincronização de índices externos)
- Custo operacional mínimo no deploy Coolify

## Trade-offs aceitos

- Relevância/ranking inferior a engines dedicadas para buscas complexas
- Full-text em português exige config de dicionário/stopwords (`pt`)

## Alternativas descartadas

- **Algolia/Meilisearch:** engine externa com custo e sincronização extra; não justificada para o porte na v1
- **Redis (RediSearch):** decisão de não usar Redis por enquanto (ADR-005) torna esta opção inviável na v1