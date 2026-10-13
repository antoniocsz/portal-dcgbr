# @digimon/privacy — Contexto do Módulo

## Responsabilidade
Tratamento de LGPD do lado servidor: **registro de consentimento** (auditoria de decisões do usuário sobre cookies/analytics/ads) e **canal de solicitações do titular** (LGPD art. 18 §3º) — pedidos de acesso, correção, eliminação, portabilidade etc., com fila de atendimento para o encarregado (DPO)/admin.

## Entidades
- **ConsentRecord** — id, subjectKey (id anônimo do navegador ou id do usuário), userId?, analytics (bool), ads (bool), policyVersion, userAgent?, createdAt.
- **DataRequest** — id, type (`access | correction | deletion | portability | consent_revocation | other`), name, email, message, userId?, status (`open | in_progress | done | rejected`), createdAt, updatedAt.

## Use Cases
- `RecordConsentUseCase` — registra uma decisão de consentimento (público; best-effort no cliente).
- `ListConsentRecordsUseCase` — lista/resumo para admin.
- `CreateDataRequestUseCase` — abre uma solicitação do titular (público).
- `ListDataRequestsUseCase` — fila (admin; filtro por status).
- `UpdateDataRequestStatusUseCase` — muda o status (admin).

## Eventos que Publica
- `consent.recorded`, `privacy.request.created`, `privacy.request.updated`

## Dependências
- `@digimon/contracts`

## Repositórios
- `ConsentRecordRepository` (create/list)
- `DataRequestRepository` (create/list/findById/updateStatus)

## Rotas HTTP (apps/api)
- `POST /consent` — público: registra consentimento (`{ subjectKey, analytics, ads, policyVersion? }`).
- `POST /privacy/requests` — público: abre solicitação (`{ type, name, email, message }`).
- `GET /admin/privacy/requests` — administrator/editor: fila (filtro `status`).
- `PATCH /admin/privacy/requests/:id` — administrator/editor: atualiza status.
- `GET /admin/consent` — administrator: registros/resumo.

## Regras
- Sem PII desnecessária: `subjectKey` é opaco; `userAgent` truncado.
- `policyVersion` versiona a política vigente (bump quando o texto mudar).
- Solicitações são tratadas por administrator/editor; sem resposta automática por e-mail na v1 (fila no painel).
- Não substitui revisão jurídica do conteúdo legal.
