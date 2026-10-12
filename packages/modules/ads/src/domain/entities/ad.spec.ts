// Path: packages/modules/ads/src/domain/entities/ad.spec.ts
// Critérios: invariantes do Ad (targetUrl http(s), placements >= 1, title não
// vazio, priority >= 0, janela coerente) e a janela de exibição (isVisibleAt).
import { describe, expect, it } from 'vitest'
import { ValidationError } from '@digimon/contracts'
import { Ad, type CreateAdData } from './ad'

function build(overrides: Partial<CreateAdData> = {}): CreateAdData {
  return {
    id: 'ad-1',
    title: 'Promoção Digimon TCG Brasil',
    targetUrl: 'https://loja.exemplo.com/promo',
    kind: 'house',
    placements: ['home-top'],
    createdBy: 'admin-1',
    ...overrides
  }
}

describe('Ad — invariantes de criação', () => {
  it('cria anúncio válido com defaults (isActive, priority, contadores)', () => {
    const ad = Ad.create(build())
    expect(ad.data.isActive).toBe(true)
    expect(ad.data.priority).toBe(0)
    expect(ad.data.impressions).toBe(0)
    expect(ad.data.clicks).toBe(0)
    expect(ad.data.openInNewTab).toBe(true)
    expect(ad.data.createdBy).toBe('admin-1')
  })

  it('rejeita targetUrl que não seja http(s)', () => {
    expect(() => Ad.create(build({ targetUrl: 'ftp://loja.exemplo.com' }))).toThrow(ValidationError)
    expect(() => Ad.create(build({ targetUrl: 'javascript:alert(1)' }))).toThrow(ValidationError)
    expect(() => Ad.create(build({ targetUrl: 'loja.exemplo.com' }))).toThrow(ValidationError)
  })

  it('rejeita placements vazio', () => {
    expect(() => Ad.create(build({ placements: [] }))).toThrow(ValidationError)
  })

  it('rejeita título vazio ou só espaços', () => {
    expect(() => Ad.create(build({ title: '' }))).toThrow(ValidationError)
    expect(() => Ad.create(build({ title: '   ' }))).toThrow(ValidationError)
  })

  it('rejeita priority negativa', () => {
    expect(() => Ad.create(build({ priority: -1 }))).toThrow(ValidationError)
  })

  it('rejeita janela invertida (startAt > endAt)', () => {
    expect(() =>
      Ad.create(build({ startAt: new Date('2026-02-01'), endAt: new Date('2026-01-01') }))
    ).toThrow(ValidationError)
  })
})

describe('Ad — isVisibleAt (janela de datas)', () => {
  const now = new Date('2026-06-01T12:00:00.000Z')

  it('inativo nunca é visível', () => {
    const ad = Ad.create(build({ isActive: false }))
    expect(ad.isVisibleAt(now)).toBe(false)
  })

  it('sem janela é visível enquanto ativo', () => {
    expect(Ad.create(build()).isVisibleAt(now)).toBe(true)
  })

  it('visível dentro da janela, invisível antes e depois', () => {
    const ad = Ad.create(
      build({ startAt: new Date('2026-01-01'), endAt: new Date('2026-12-31') })
    )
    expect(ad.isVisibleAt(now)).toBe(true)
    expect(ad.isVisibleAt(new Date('2025-12-31'))).toBe(false)
    expect(ad.isVisibleAt(new Date('2027-01-01'))).toBe(false)
  })
})

describe('Ad — update revalida invariantes', () => {
  it('atualiza campos e preserva os contadores', () => {
    const ad = Ad.create(build())
    ad.data.impressions = 7
    ad.data.clicks = 3

    ad.update({ title: 'Novo título', priority: 10, placements: ['home-top', 'home-infeed'] })

    expect(ad.data.title).toBe('Novo título')
    expect(ad.data.priority).toBe(10)
    expect(ad.data.placements).toEqual(['home-top', 'home-infeed'])
    expect(ad.data.impressions).toBe(7)
    expect(ad.data.clicks).toBe(3)
  })

  it('rejeita patch que viola uma invariante', () => {
    const ad = Ad.create(build())
    expect(() => ad.update({ placements: [] })).toThrow(ValidationError)
    expect(() => ad.update({ targetUrl: 'nao-e-url' })).toThrow(ValidationError)
  })
})
