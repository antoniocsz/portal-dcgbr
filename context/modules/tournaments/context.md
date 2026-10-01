# @digimon/tournaments — Contexto do Módulo

## Responsabilidade
Informações de torneios do Digimon TCG no Brasil: agenda, formato e resultados. **Colaborativo** — Member publica torneios próprios direto (sem revisão). **Pós-MVP**.

## Entidades
- **Tournament** — id, slug, name, organizerId (createdBy), description, format, location (cidade/estado), dateStart, dateEnd, status (published | cancelled | finished), results (JSON: posições/jogadores), createdAt, updatedAt

## Use Cases
- `CreateTournamentUseCase` — Member/Editor/Admin cria torneio (publica direto)
- `UpdateTournamentUseCase` — criador/Editor/Admin edita
- `CancelTournamentUseCase` — criador/Editor/Admin cancela
- `AddResultsUseCase` — criador/Editor/Admin adiciona resultados
- `GetTournamentUseCase` — leitura pública
- `ListTournamentsUseCase` — agenda (próximos, por formato/local) — paginada

## Eventos que Publica
- `tournament.created`, `tournament.updated`, `tournament.cancelled`, `tournament.results.added`

## Eventos que Consome
- Nenhum

## Dependências
- `@digimon/contracts` (tipos, erros, eventos, EventBus)

## Repositórios
- `ITournamentRepository`

## Rotas HTTP (apps/web)
- `GET /api/tournaments` — agenda pública (somente published); `?mine=true` lista os do próprio Member (qualquer status); Admin/Editor filtram por status
- `POST /api/tournaments` — criar (Member autenticado, publica direto)
- `GET /api/tournaments/:slug` — detalhe público (cancelado só criador/Admin/Editor — NotFound sem vazar)
- `PATCH /api/tournaments/:slug` — editar (criador/Admin/Editor)
- `DELETE /api/tournaments/:slug` — cancelar (criador/Admin/Editor)
- `POST /api/tournaments/:slug/results` — resultados (criador/Admin/Editor)

## Regras
- **Member publica torneios direto** — sem revisão (colaborativo)
- Criador pode editar/cancelar; Admin/Editor também
- Resultados alimentam cobertura editorial em @digimon/content (post citando torneio)
- Leitura pública: todos os torneios publicados