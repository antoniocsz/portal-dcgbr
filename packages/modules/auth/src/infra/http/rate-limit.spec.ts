// Path: packages/modules/auth/src/infra/http/rate-limit.spec.ts
import { describe, expect, it } from 'vitest'
import { InMemoryRateLimiter } from './rate-limit'

describe('InMemoryRateLimiter', () => {
  it('permite até max requisições na janela', () => {
    const limiter = new InMemoryRateLimiter(5, 15 * 60 * 1000)
    for (let i = 0; i < 5; i++) {
      expect(limiter.allow('1.2.3.4')).toBe(true)
    }
    expect(limiter.allow('1.2.3.4')).toBe(false)
  })

  it('chaves independentes', () => {
    const limiter = new InMemoryRateLimiter(1, 15 * 60 * 1000)
    expect(limiter.allow('a')).toBe(true)
    expect(limiter.allow('b')).toBe(true)
    expect(limiter.allow('a')).toBe(false)
  })

  it('reinicia após a janela', () => {
    const limiter = new InMemoryRateLimiter(1, 1000)
    const start = 1_000_000
    expect(limiter.allow('a', start)).toBe(true)
    expect(limiter.allow('a', start + 500)).toBe(false)
    expect(limiter.allow('a', start + 1001)).toBe(true)
  })
})
