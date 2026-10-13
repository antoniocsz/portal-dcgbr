#!/usr/bin/env node
// Path: scripts/import-catalog.mjs
//
// CLI portável para importar o catálogo externo de cartas (TakaOtaku) em
// QUALQUER ambiente — local ou produção — a partir da máquina do operador.
// Necessário porque o servidor de produção é remoto (sem shell): dispara a
// importação pela própria API e acompanha o job por polling.
//
// Fluxo: login (cookie `access_token`) → POST /cards/admin/import-source/jobs
// (202 { jobId }) → polling em GET /cards/admin/import-source/jobs/{jobId} até
// `status` ∈ {done, error}, imprimindo o resultado (`imported/updated/skipped/
// setsCount`) ou o erro.
//
// Idempotente: reexecutar é seguro — a importação faz upsert por `dcgId`, então
// uma nova execução apenas atualiza as cartas já existentes (`updated`).
//
// Alternativa de 1 clique (mesma operação, pela UI): abra `/admin/cartas` como
// `administrator` → "Importar catálogo externo" (task 98). Este script usa
// exatamente os mesmos endpoints, útil para rodar de fora do browser/CI.
//
// Requisitos: Node >= 22 (usa `fetch` nativo) e NENHUMA dependência — sem
// `package.json`. Não vaza segredo: a senha e o token nunca são impressos.
//
// --- Variáveis de ambiente ---------------------------------------------------
//   API_URL         Base da API. Default: http://localhost:3001
//   ADMIN_EMAIL     (obrigatório) e-mail do administrador
//   ADMIN_PASSWORD  (obrigatório) senha do administrador
//   IMPORT_SETS     (opcional) sets separados por vírgula (ex.: `BT1,BT2`)
//   IMPORT_IDS      (opcional) dcgIds/números separados por vírgula
//   IMPORT_MAX      (opcional) limite máximo de cartas importadas (inteiro > 0)
//   IMPORT_SOURCE   (opcional) fonte externa. Default: `taka` (única suportada)
//
// --- Uso ---------------------------------------------------------------------
//   # local
//   ADMIN_EMAIL=admin@exemplo.com ADMIN_PASSWORD=... node scripts/import-catalog.mjs
//
//   # produção
//   API_URL=https://api.digimoncardgamebrasil.com.br \
//     ADMIN_EMAIL=... ADMIN_PASSWORD=... node scripts/import-catalog.mjs
//
//   # importação parcial (opcional)
//   IMPORT_SETS=BT1 IMPORT_MAX=50 ADMIN_EMAIL=... ADMIN_PASSWORD=... node scripts/import-catalog.mjs
// -----------------------------------------------------------------------------

const DEFAULT_API_URL = 'http://localhost:3001'
const DEFAULT_SOURCE = 'taka'
const POLL_INTERVAL_MS = 3_000
const POLL_TIMEOUT_MS = 10 * 60 * 1_000 // ~10min

function info(message) {
  console.log(message)
}

function fail(message) {
  console.error(`\n✖ ${message}`)
  process.exit(1)
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function requireEnv(name) {
  const value = process.env[name]?.trim()
  if (!value) fail(`Variável de ambiente obrigatória ausente: ${name}.`)
  return value
}

/** "a, b ,c" → ["a","b","c"]; vazio/ausente → undefined (não envia o filtro). */
function parseCsv(value) {
  if (!value) return undefined
  const items = value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
  return items.length > 0 ? items : undefined
}

/** Inteiro positivo; ausente → undefined; inválido → encerra com erro. */
function parsePositiveInt(value, name) {
  if (value === undefined || value.trim() === '') return undefined
  const parsed = Number(value)
  if (!Number.isInteger(parsed) || parsed <= 0) {
    fail(`Variável ${name} inválida: "${value}" (esperado inteiro > 0).`)
  }
  return parsed
}

function setCookieHeaders(response) {
  if (typeof response.headers.getSetCookie === 'function') {
    return response.headers.getSetCookie()
  }
  const single = response.headers.get('set-cookie')
  return single ? [single] : []
}

/** Extrai o valor URL-decoded do cookie `access_token` de um Set-Cookie. */
function extractAccessToken(headers) {
  for (const raw of headers) {
    const pair = raw.split(';')[0]
    const separator = pair.indexOf('=')
    if (separator === -1) continue
    if (pair.slice(0, separator).trim() !== 'access_token') continue
    const value = pair.slice(separator + 1).trim()
    if (value) return decodeURIComponent(value)
  }
  return null
}

/** Mensagem de erro da API (`{ error: { message } }`) ou fallback HTTP. */
async function readErrorMessage(response, fallback) {
  try {
    const text = await response.text()
    if (!text) return fallback
    try {
      const data = JSON.parse(text)
      return data?.error?.message ?? fallback
    } catch {
      return fallback
    }
  } catch {
    return fallback
  }
}

async function login(apiUrl, email, password) {
  info(`→ Autenticando em ${apiUrl} como ${email}…`)
  const response = await fetch(`${apiUrl}/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email, password })
  })

  if (!response.ok) {
    const detail = await readErrorMessage(response, `HTTP ${response.status}`)
    fail(`Falha no login (HTTP ${response.status}): ${detail}`)
  }

  const token = extractAccessToken(setCookieHeaders(response))
  if (!token) fail('Login respondeu sem o cookie de sessão "access_token".')

  const body = await response.json().catch(() => null)
  const role = body?.user?.role
  if (role && role !== 'administrator') {
    fail(`Usuário "${email}" não é administrator (role: ${role}).`)
  }

  info('✔ Autenticado.')
  return token
}

async function startImportJob(apiUrl, token, body) {
  info('→ Disparando a importação do catálogo externo…')
  const response = await fetch(`${apiUrl}/cards/admin/import-source/jobs`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      cookie: `access_token=${token}`
    },
    body: JSON.stringify(body)
  })

  if (!response.ok) {
    const detail = await readErrorMessage(response, `HTTP ${response.status}`)
    fail(`Falha ao disparar a importação (HTTP ${response.status}): ${detail}`)
  }

  const data = await response.json().catch(() => null)
  if (!data?.jobId) fail('A API não retornou o "jobId" do job de importação.')

  info(`✔ Job criado: ${data.jobId}`)
  return data.jobId
}

async function pollJob(apiUrl, token, jobId) {
  const startedAt = Date.now()
  info(
    `→ Acompanhando o job (polling a cada ${POLL_INTERVAL_MS / 1_000}s, ` +
      `timeout ${POLL_TIMEOUT_MS / 60_000}min)…`
  )

  for (;;) {
    await sleep(POLL_INTERVAL_MS)
    const elapsed = Math.round((Date.now() - startedAt) / 1_000)

    if (Date.now() - startedAt > POLL_TIMEOUT_MS) {
      fail(`Timeout de ${POLL_TIMEOUT_MS / 60_000}min aguardando o job terminar.`)
    }

    const response = await fetch(`${apiUrl}/cards/admin/import-source/jobs/${jobId}`, {
      headers: { cookie: `access_token=${token}` }
    })

    if (response.status === 404) {
      fail(
        'Job de importação não encontrado (a API pode ter reiniciado — ' +
          'o progresso dos jobs é volátil/em memória).'
      )
    }
    if (!response.ok) {
      const detail = await readErrorMessage(response, `HTTP ${response.status}`)
      fail(`Falha ao consultar o job (HTTP ${response.status}): ${detail}`)
    }

    const job = await response.json()
    if (job.status === 'done' || job.status === 'error') return job

    info(`  … importando (${elapsed}s)`)
  }
}

function printResult(job) {
  const result = job.result ?? {}
  const fields = [
    ['imported', result.imported ?? 0],
    ['updated', result.updated ?? 0],
    ['skipped', result.skipped ?? 0],
    ['setsCount', result.setsCount ?? 0]
  ]
  console.log('')
  info('✔ Importação concluída.')
  for (const [label, value] of fields) {
    info(`  ${label.padEnd(10)} ${value}`)
  }
  if (Array.isArray(result.sets) && result.sets.length > 0) {
    info(`  ${'sets'.padEnd(10)} ${result.sets.join(', ')}`)
  }
}

async function main() {
  const apiUrl = (process.env.API_URL?.trim() || DEFAULT_API_URL).replace(/\/+$/, '')
  const email = requireEnv('ADMIN_EMAIL')
  const password = requireEnv('ADMIN_PASSWORD')
  const source = process.env.IMPORT_SOURCE?.trim() || DEFAULT_SOURCE
  const sets = parseCsv(process.env.IMPORT_SETS)
  const ids = parseCsv(process.env.IMPORT_IDS)
  const max = parsePositiveInt(process.env.IMPORT_MAX, 'IMPORT_MAX')

  const body = { source }
  if (sets) body.sets = sets
  if (ids) body.ids = ids
  if (max !== undefined) body.max = max

  info(`Importação do catálogo externo — API: ${apiUrl} · fonte: ${source}`)

  const token = await login(apiUrl, email, password)
  const jobId = await startImportJob(apiUrl, token, body)
  const job = await pollJob(apiUrl, token, jobId)

  if (job.status === 'error') {
    fail(`Importação falhou: ${job.error ?? 'erro desconhecido'}`)
  }

  printResult(job)
}

main().catch((error) => {
  fail(error instanceof Error ? error.message : String(error))
})
