// Path: packages/modules/auth/src/domain/constants.ts
// TTLs de tokens — fonte única (ADR-002: access curto, refresh 7d, reset 15min).
export const ACCESS_TOKEN_TTL_MS = 15 * 60 * 1000
export const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000
export const PASSWORD_RESET_TOKEN_TTL_MS = 15 * 60 * 1000
