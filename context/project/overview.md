# digimon-card-game-brasil — Visão Geral do Projeto

## Problema

O cenário do Digimon TCG no Brasil carece de um portal centralizado, em português, que reúna notícias, cartas, deckbuilder, torneios e curiosidades — hoje espalhados entre sites internacionais (dcg-nexus, digilab, digimonmeta, digimoncard.io) e comunidades. Não existe uma fonte brasileira de referência que também acompanhe os simuladores (os feitos por fãs e o simulador oficial **Alysium**, com lançamento previsto para 2026).

## Produto

Portal de notícias (CMS/Blog) sobre o Digimon Card Game no Brasil, com:

- **Leitura pública** de notícias, matérias, cartas, torneios e curiosidades
- **Card database** (referência: digimoncard.dev)
- **Deckbuilder** colaborativo (montar, salvar, copiar e compartilhar decks)
- **Torneios** colaborativos (agenda, resultados)
- **Comentários** em conteúdo, cartas e decks (somente com conta logada)
- **SEO-first**: precisa performar bem em buscas e indexação

## Público

- **Reader** — público geral: leitura pública de tudo (não é papel atribuível)
- **Member** — membro registrado gratuito: comenta, salva decks próprios, copia decks de outros, publica torneios e decks próprios (direto, sem revisão)
- **Editor** — publica notícias/matérias, modera comentários
- **Administrator** — acesso total: usuários, papéis, conteúdo, configurações

(3 papéis fixos globais, gerenciados pelo Administrator.)

## Stack

Portal único web (Next.js App Router + Tailwind/shadcn-ui) com backend integrado (Route Handlers/Server Actions + Zod), Postgres + Prisma, auth própria (JWT), deploy via Coolify/Dockerfile.
Detalhes em `context/project/stack.md`.

## Princípios

- SEO-first: SSR/ISR, indexação e Core Web Vitals são prioridade
- Portal único: site público + painel admin integrados no mesmo app, mesmo domínio
- Não multi-tenant: papéis globais fixos
- Áreas (bounded contexts) independentes, integradas por entidades de núcleo (Carta, Torneio, Deck) e `@digimon/contracts`
- Colaborativo onde faz sentido (torneios e decks por Members), editorial onde exige curadoria (notícias por Admin/Editor)
- Simuladores (Alysium e de fãs) são conteúdo editorial de notícias
- MVP: Notícias + Auth + Comentários primeiro; depois cards → decks → torneios