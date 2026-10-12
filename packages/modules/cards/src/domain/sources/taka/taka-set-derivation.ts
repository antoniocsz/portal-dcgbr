// Path: packages/modules/cards/src/domain/sources/taka/taka-set-derivation.ts
// Derivação pura dos sets (séries/expansões) a partir do catálogo TakaOtaku.
// O agrupamento é pelo `setCode` da carta mapeada (prefixo do número, ex.: "BT1")
// — é esse código que `GET /cards?setCode=<code>` filtra (Card.setCode). O nome
// legível vem do campo bruto `notes`; a fonte usa dois formatos principais:
//   "<CODE>: <NOME>"      → "AD-01: ADVANCED BOOSTER DIGIMON GENERATION"
//   "<NOME> [<CODE>]"     → "BOOSTER BATTLE OF OMNI [BT-05]"
// Só aceitamos um `notes` quando o prefixo alfabético do seu código bate com o do
// `setCode` (ex.: "BT-05" com "BT5") — evita promover o set de uma promo avulsa
// (grupo "P") para o nome errado. Sem `notes` válida, o nome cai para o `setCode`.
// `releaseDate` é sempre `null`: a fonte não traz data confiável.
import type { TakaCardRecord } from './taka-card-mapper'

/** Set derivado do catálogo — estruturalmente compatível com `CardSetInput`. */
export interface DerivedCardSet {
  code: string
  name: string
  releaseDate: null
}

/** Carta mapeada + metadados crus necessários para derivar o seu set. */
export interface TakaSetCandidate {
  setCode: string
  notes: TakaCardRecord['notes']
}

interface ParsedSetNotes {
  code: string
  name: string
}

/** Prefixo alfabético do código (ex.: "BT-05" → "BT", "P" → "P"). */
function alphaPrefix(code: string): string {
  return (/^[A-Za-z]+/.exec(code)?.[0] ?? '').toUpperCase()
}

/** Interpreta `notes` como código + nome de expansão; `null` quando é texto livre. */
export function parseTakaSetNotes(notes: unknown): ParsedSetNotes | null {
  if (typeof notes !== 'string') return null
  const cleaned = notes
    .replace(/\u00a0/g, ' ')
    .replace(/^[\s\u25b9\u2022\u00b7-]+/, '')
    .trim()
  if (!cleaned) return null

  const bracketed = /^(.*?)\s*\[([A-Za-z0-9][A-Za-z0-9-]*)\]\s*$/.exec(cleaned)
  if (bracketed) {
    const name = bracketed[1]
    const code = bracketed[2]
    if (name && code && /[A-Za-z]/.test(name)) {
      return { code, name: name.trim() }
    }
  }

  // Exige código com letra e dígito — descarta textos livres como "Demo Deck: Black".
  const colon = /^([A-Za-z0-9][A-Za-z0-9-]*)\s*:\s*(.+)$/.exec(cleaned)
  if (colon) {
    const code = colon[1]
    const name = colon[2]
    if (code && name && /[A-Za-z]/.test(code) && /\d/.test(code)) {
      return { code, name: name.trim() }
    }
  }

  return null
}

/** Deriva os sets (deduplicados por `code`, ordenados) a partir das cartas mapeadas. */
export function deriveTakaSets(candidates: Iterable<TakaSetCandidate>): DerivedCardSet[] {
  const names = new Map<string, string>()
  const resolved = new Set<string>()

  for (const candidate of candidates) {
    const code = candidate.setCode.trim().toUpperCase()
    if (!code) continue
    if (!names.has(code)) names.set(code, code)

    if (resolved.has(code)) continue
    const parsed = parseTakaSetNotes(candidate.notes)
    if (parsed && alphaPrefix(parsed.code) === alphaPrefix(code)) {
      names.set(code, parsed.name)
      resolved.add(code)
    }
  }

  return [...names.entries()]
    .map(([code, name]) => ({ code, name, releaseDate: null }))
    .sort((a, b) => a.code.localeCompare(b.code))
}
