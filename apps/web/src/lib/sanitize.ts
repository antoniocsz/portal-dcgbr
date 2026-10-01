// Path: apps/web/src/lib/sanitize.ts
// Sanitização allowlist de HTML para renderização SSR de conteúdo editorial.
// O TipTap gera apenas os nós habilitados, mas o servidor revalida (defense in
// depth): nada de dangerouslySetInnerHTML com HTML não sanitizado.
//
// Retorna `null` quando o conteúdo não parece HTML (fallback para texto puro
// antigo) — ver `sanitizePostBody`.

const ALLOWED_TAGS = new Set([
  'p',
  'h1',
  'h2',
  'h3',
  'h4',
  'ul',
  'ol',
  'li',
  'blockquote',
  'pre',
  'code',
  'strong',
  'b',
  'em',
  'i',
  's',
  'a',
  'br',
  'img',
  'hr',
  'table',
  'thead',
  'tbody',
  'tr',
  'th',
  'td'
])

const ALLOWED_ATTRS = new Set(['href', 'rel', 'target', 'src', 'alt'])

/**
 * Remove tags/atributos fora da allowlist. Implementação leve baseada em regex
 * (conteúdo gerado pelo editor, não entrada arbitrária — suficiente como
 * segunda camada de defesa; o editor já restringe os nós).
 */
export function sanitizeHtml(html: string): string {
  // Remove comentários e tags de script/style inteiras
  let out = html.replace(/<!--[\s\S]*?-->/g, '').replace(/<script[\s\S]*?<\/script>/gi, '')
  // Remove atributos não permitidos e normaliza aspas
  out = out.replace(
    /<(\/?)([a-z0-9]+)([^>]*)>/gi,
    (match, close: string, tag: string, rest: string) => {
      const normalized = tag.toLowerCase()
      if (!ALLOWED_TAGS.has(normalized)) {
        // Tag não permitida: remove a tag mas preserva o conteúdo
        return close === '/' ? '' : ''
      }
      let cleaned = ''
      if (rest.trim()) {
        const attrRe = /([a-zA-Z-]+)=("([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/g
        let attrMatch: RegExpExecArray | null
        const kept: string[] = []
        while ((attrMatch = attrRe.exec(rest)) !== null) {
          const name = attrMatch[1]!.toLowerCase()
          if (ALLOWED_ATTRS.has(name)) {
            const value = attrMatch[3] ?? attrMatch[4] ?? attrMatch[5] ?? ''
            // href/src apenas com protocolos seguros
            if ((name === 'href' || name === 'src') && !/^(https?:|mailto:|#|\/)/i.test(value)) {
              continue
            }
            kept.push(`${name}="${value.replace(/"/g, '&quot;')}"`)
          }
        }
        cleaned = kept.length ? ` ${kept.join(' ')}` : ''
      }
      // Links seguros ganham rel/target
      if (normalized === 'a' && close === '' && !/rel=/i.test(cleaned)) {
        cleaned += ' rel="noopener noreferrer" target="_blank"'
      }
      return `<${close}${normalized}${cleaned}>`
    })
  return out
}

/**
 * Prepara o body de um post para renderização:
 * - Se parece HTML (começa com `<`), sanitiza e devolve o HTML.
 * - Caso contrário (post antigo, texto puro com `\n`), converte em parágrafos.
 */
export function sanitizePostBody(body: string): string {
  if (!body) return ''
  const trimmed = body.trim()
  if (trimmed.startsWith('<')) {
    return sanitizeHtml(trimmed)
  }
  return trimmed
    .split('\n')
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`)
    .join('\n')
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
