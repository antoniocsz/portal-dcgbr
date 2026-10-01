# @digimon/contracts — Contexto do Módulo

## Responsabilidade
Tipos compartilhados, erros, eventos e EventBus — a "cola" entre todos os módulos. Nenhum módulo importa outro diretamente; todos dependem apenas deste pacote e dos barrels públicos dos módulos.

## Entidades
- Tipos compartilhados (identificadores, enums globais, DTOs base)
- `AppError` e hierarquia de erros (`NotFoundError`, `ForbiddenError`, `ValidationError`, `ConflictError`, `UnauthorizedError`)
- Eventos de domínio (`DomainEvent`) + `EventBus` (pub/sub in-process + persistido em fila quando necessário)

## Use Cases
- Nenhum (módulo de infraestrutura/contrato)

## Eventos que Publica
- N/A (define o contrato de eventos usados pelos demais módulos)

## Eventos que Consome
- N/A

## Dependências
- Nenhuma (pacote base, sem deps de outros módulos)

## Repositórios
- N/A

## Regras
- Zero dependências de outros módulos — é a camada mais baixa do monorepo
- Barrel `src/index.ts` exporta todo o público
- Todo módulo depende de `@digimon/contracts`, nunca de outro módulo diretamente