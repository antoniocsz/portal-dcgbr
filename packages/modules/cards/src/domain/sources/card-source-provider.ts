// Path: packages/modules/cards/src/domain/sources/card-source-provider.ts
// Porta (DIP) para uma fonte externa de catálogo de cartas. O domínio depende
// apenas desta abstração — nenhum I/O aqui (os adapters vivem em `infra/sources`).
// `RawSourceCard` é um registro bruto (JSON não confiável) de uma fonte; cada
// mapper concreto (ex.: TakaOtaku) interpreta os campos que conhece.

/** Registro bruto de uma carta vindo de uma fonte externa (JSON arbitrário). */
export type RawSourceCard = Record<string, unknown>

/** Fonte externa de catálogo de cartas. Implementações em `infra/sources`. */
export interface CardSourceProvider {
  fetchCatalog(): Promise<RawSourceCard[]>
}
