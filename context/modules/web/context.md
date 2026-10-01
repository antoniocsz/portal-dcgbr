# @digimon/app-web — Contexto (app shell + design system)

## Responsabilidade
App único Next.js (App Router) que serve o portal público e o painel admin no mesmo domínio
(ADR-001). Este módulo cobre o **design system** (tokens + componentes compartilhados) e o
**layout base** do portal. As features de domínio vivem em `apps/web/src/features/**` e em
`packages/modules/*` (content, auth, users, comments, cards, decks, tournaments).

## Design system (fonte: `context/project/design/dcg.pen`)
- Tokens em `apps/web/src/app/globals.css` via `@theme` (Tailwind v4, sem tailwind.config.js).
- Componentes em `apps/web/src/components/**` — Views puras (MVVM: sem useQuery/useMutation/useForm).
- Dark-only, cantos retos (radius 0), Sora (display) + Inter (body) via next/font.

## Tokens
- Superfícies: `bg` #0C0C0E, `surface` #16161A, `surface-2` #202024
- Tinta: `ink` #F3F1EE, `ink-soft` #B5B3AE, `ink-faint` #8A8890
- Borda: `border` #292930
- Marca: `primary` #C22B33, `primary-soft` #331519, `accent` #6FA0A8, `accent-soft` #1A2A2E
- Estados: `success` #3EB575, `warning` #E0A33D, `danger` #E5484D
- Atributos Digimon: `c-red`, `c-blue`, `c-yellow`, `c-green`, `c-purple`, `c-black`, `c-tamer`, `c-option`
- Fontes: `font-display` (Sora), `font-body`/`font-sans` (Inter)

## Regras
- Views não fazem fetch nem formulário — recebem props/callbacks do ViewModel.
- Sem `var()` avulso no JSX: usar utilitários gerados pelo `@theme` (`bg-surface`, `text-ink`, ...).
- Links internos via `next/link`; ícones via `components/icons.tsx` (substituível por lucide-react).
- `/admin` tem layout próprio (task 12); `SiteChrome` esconde header/footer público nessas rotas.
