# ADR-002: Auth própria (JWT + refresh rotation)

**Data:** 2026-09-29
**Status:** accepted

## Contexto

O portal precisa de autenticação para Member (registro gratuito), Editor e Administrator: login, sessão, recuperação de senha e proteção de rotas do painel admin. Havia duas opções: biblioteca pronta (Auth.js/NextAuth) ou auth própria com JWT.

## Decisão

Auth **própria** com JWT: access token de curta duração + refresh token (7 dias) com **rotation e revogação** (token antigo rejeitado). Hash de senha via `IPasswordHasher` (bcrypt/argon2). Recuperação de senha com token single-use (TTL 15min). Rate limit em `register` (5 req/15min). Papel padrão no registro: **Member**.

## Consequências positivas

- Controle total do ciclo de vida da sessão (rotation/revogação) sem abstrações de terceiros
- Integração direta com o modelo de papéis globais (Administrator/Editor/Member) já decidido
- Menos dependências externas no monorepo

## Trade-offs aceitos

- Mais código de segurança para manter (hash, rotation, rate limit) — mitigado por testes obrigatórios (rotation, reset expirado/reutilizado, senha fraca)
- Responsabilidade de manter práticas seguras atualizadas (algoritmos, expirações)

## Alternativas descartadas

- **Auth.js/NextAuth:** camada de abstração com comportamento de sessão menos previsível para o modelo de papéis globais simples do portal; adiciona dependências e flows opinados