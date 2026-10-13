// Path: packages/modules/users/src/domain/repositories/session-token-revoker.ts
// Porta (DIP): revoga todas as sessões (refresh tokens) do titular. Implementada
// no composition root sobre o repositório de refresh tokens do auth — evita
// import direto entre módulos.

export interface SessionTokenRevoker {
  revokeAllForUser(userId: string): Promise<void>
}
