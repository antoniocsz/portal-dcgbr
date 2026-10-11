#!/usr/bin/env node
// Varredura de segredos (gitleaks) via Docker — cross-platform (Windows/Linux/macOS).
// Usa a config `.gitleaks.toml` do repositório.
//
// Uso:
//   pnpm secret:scan                 # varre o histórico completo (git log)
//   pnpm secret:scan -- --no-git     # varre só o working tree
//   pnpm secret:scan -- -v           # verboso
import { spawnSync } from 'node:child_process'
import { resolve } from 'node:path'

const repo = resolve(process.cwd()).replace(/\\/g, '/')
const extra = process.argv.slice(2)

const args = [
  'run', '--rm',
  '-v', `${repo}:/repo`,
  '-w', '/repo',
  'zricethezav/gitleaks:latest',
  'detect',
  '--source=/repo',
  '--config=/repo/.gitleaks.toml',
  '--redact',
  '-v',
  ...extra
]

const result = spawnSync('docker', args, { stdio: 'inherit' })

if (result.error) {
  console.error('\n[secret:scan] não foi possível executar o Docker.')
  console.error('Verifique se o Docker está instalado e no PATH.')
  console.error(result.error.message)
  process.exit(1)
}

process.exit(result.status ?? 1)
