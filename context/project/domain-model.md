# digimon-card-game-brasil — Modelo de Domínio

> Gerado na context-interview (Bloco 2). Produto: portal de notícias CMS sobre o Digimon Card Game no Brasil. **Não multi-tenant.**

## Visão geral

Domínio dividido em áreas majoritariamente **independentes** (bounded contexts), que se integram via **entidades de núcleo compartilhadas** (Carta, Torneio, Deck) e via `@digimon/contracts` (tipos, erros, eventos, EventBus). Referência de produto: `digimoncard.dev`.

## Bounded contexts (módulos)

| Módulo | Escopo de pacote | Responsabilidade | Crítico v1 |
|---|---|---|---|
| **Content** | `@digimon/content` | CMS editorial: notícias, matérias, curiosidades, posts com autoria e workflow de publicação. **Inclui a categoria Simuladores** (info sobre simuladores de fãs e o oficial Alysium, lançamento 2026) | ✅ |
| **Cards** | `@digimon/cards` | Catálogo/card database (base de referência: digimoncard.dev) | |
| **Decks** | `@digimon/decks` | Deckbuilder: montar, salvar, compartilhar decks | |
| **Tournaments** | `@digimon/tournaments` | Informações de torneios: agenda, resultados, formato | |
| **Users/Auth** | `@digimon/users` · `@digimon/auth` | Contas, autenticação e perfis; roles globais (Admin, Editor, Member) | ✅ |
| **Comments** | `@digimon/comments` | Comentários em conteúdo, cartas e decks | ✅ |
| **Contracts** | `@digimon/contracts` | Tipos compartilhados, erros, eventos, EventBus (cola entre módulos) | ✅ |

## Entidades de núcleo (atravessam vários módulos)

- **Carta** — aparece em Cards (fonte), Content (matérias/reviews), Decks (lista de cartas do deck), Comments
- **Torneio** — aparece em Tournaments (agenda/resultados) e Content (cobertura de eventos)
- **Deck** — aparece em Decks (deckbuilder) e Content (análises/artigos sobre decks), Comments

## Comunicação entre módulos

- Áreas **independentes**: cada módulo é autônomo; não há orquestração pesada entre eles.
- Integração por **entidades compartilhadas** referenciadas por ID + `@digimon/contracts` (eventos publicados para notificações/auditoria quando necessário).
- Regra global: módulos nunca se importam diretamente — apenas via barrel público do módulo ou `@digimon/contracts`.

## Papéis de usuário (3 fixos, globais — gerenciados pelo Administrator)

| Papel | Publica notícias | Publica torneios/decks | Comenta | Salva/copia decks |
|---|---|---|---|---|
| **Administrator** | ✅ (tudo + usuários/config) | ✅ | ✅ | ✅ |
| **Editor** | ✅ (matérias + modera comentários) | ✅ | ✅ | ✅ |
| **Member** *(membro registrado gratuito)* | ❌ | ✅ direto, sem revisão (só os próprios) | ✅ em tudo | ✅ salva os próprios + copia decks de outros |

- **Reader** (público ou logado): leitura pública de tudo — não é papel atribuível.
- **Author** não é papel: é a relação `createdBy` de cada conteúdo (notícia, torneio, deck).
- **Workflow editorial de notícias:** draft → review → published (somente Admin/Editor publicam notícias).
- **Comentários:** somente com conta logada.

(Detalhamento de permissões no Bloco 4 → `authorization`.)