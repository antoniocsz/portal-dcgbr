// Path: packages/modules/cards/src/infra/sources/taka-cards-source-provider.ts
// Adapter de infra que baixa o catálogo da fonte TakaOtaku/Digimon-Card-App
// (~4.482 registros). `fetch` e timeout são injetáveis (testes sem rede). Erros
// de rede/HTTP/parse viram ValidationError com mensagem clara — o handler global
// da API traduz para HTTP.
import { ValidationError } from '@digimon/contracts'
import type { CardSourceProvider, RawSourceCard } from '../../domain/sources/card-source-provider'

export const TAKA_CARDS_URL =
  'https://raw.githubusercontent.com/TakaOtaku/Digimon-Card-App/main/src/assets/cardlists/DigimonCards.json'

const DEFAULT_TIMEOUT_MS = 30_000

export interface TakaCardsSourceProviderOptions {
  url?: string
  fetchImpl?: typeof fetch
  timeoutMs?: number
}

export class TakaCardsSourceProvider implements CardSourceProvider {
  private readonly url: string
  private readonly fetchImpl: typeof fetch
  private readonly timeoutMs: number

  constructor(options: TakaCardsSourceProviderOptions = {}) {
    this.url = options.url ?? TAKA_CARDS_URL
    this.fetchImpl = options.fetchImpl ?? fetch
    this.timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS
  }

  async fetchCatalog(): Promise<RawSourceCard[]> {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), this.timeoutMs)
    try {
      const response = await this.fetchImpl(this.url, { signal: controller.signal })
      if (!response.ok) {
        throw new ValidationError(`Falha ao baixar o catálogo externo (HTTP ${response.status})`)
      }
      const payload: unknown = await response.json()
      if (!Array.isArray(payload)) {
        throw new ValidationError('Catálogo externo inválido: era esperado um array de cartas')
      }
      return payload as RawSourceCard[]
    } catch (error) {
      if (error instanceof ValidationError) throw error
      const reason = error instanceof Error ? error.message : String(error)
      throw new ValidationError(`Falha ao baixar o catálogo externo: ${reason}`)
    } finally {
      clearTimeout(timer)
    }
  }
}
