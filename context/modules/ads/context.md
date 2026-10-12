# @digimon/ads — Contexto do Módulo

## Responsabilidade
Gestão de anúncios/patrocínios do portal: **house ads** (divulgação própria — ex.: o e-commerce do projeto), **patrocínio direto** (lojas/organizadores de torneios) e **links de afiliado** (ex.: Amazon). O módulo define os criativos e as **posições** (`placements`) onde aparecem; o frontend renderiza via um componente de slot.

## Entidades
- **Ad** — id, title, subtitle, imageUrl, targetUrl, kind (`house | affiliate | sponsor`), placements (`string[]`: ex. `home-top`, `home-infeed`, `cards-top`, `article-inline`), ctaLabel, sponsorName, disclosure (rótulo "publicidade/parceiro"), isActive, priority (peso de rotação), startAt/endAt (janela de exibição), openInNewTab, impressions, clicks, createdBy, timestamps.

## Use Cases
- `ListAdsUseCase` — admin: todos (filtros); público: ativos para um `placement`, dentro da janela de datas, ordenados por peso.
- `GetAdUseCase` — leitura por id (admin).
- `CreateAdUseCase` / `UpdateAdUseCase` / `DeleteAdUseCase` — curadoria (administrator).
- `TrackAdClickUseCase` — incrementa `clicks` (público, best-effort).

## Eventos que Publica
- `ad.created`, `ad.updated`, `ad.deleted`

## Eventos que Consome
- Nenhum

## Dependências
- `@digimon/contracts` (tipos, erros, eventos, EventBus)

## Repositórios
- `AdRepository` (create/update/delete/findById/list/activeForPlacement/incrementImpressions/incrementClicks)

## Rotas HTTP (apps/api)
- `GET /ads?placement=<p>` — público: anúncios ativos para a posição (rotação por peso; incrementa `impressions` best-effort).
- `POST /ads/:id/click` — público: incrementa `clicks` (204).
- `GET /ads/admin` — administrator: lista todos (filtros `placement`, `kind`, `isActive`).
- `POST /ads/admin` — administrator: cria.
- `PATCH /ads/admin/:id` — administrator: edita.
- `DELETE /ads/admin/:id` — administrator: remove.

## Regras
- `targetUrl` obrigatório e http(s); `placements` com ao menos 1 item.
- Janela de datas opcional (`startAt`/`endAt`); fora da janela não é servido no público.
- **Afiliado/patrocínio**: o frontend marca o link com `rel="sponsored nofollow noopener"` e exibe rótulo de divulgação (`disclosure`).
- Sem cookies/scripts de terceiros (house/afiliado) — não exige banner de consentimento; redes programáticas (AdSense) ficam para depois.
- `impressions`/`clicks` são contadores simples (sem PII).
