// Path: apps/web/src/features/decks/viewmodels/use-deck-image-export.ts
// ViewModel de export do deck em PNG: monta o documento de render (título,
// formato, cores, capa + seções de cartas) e desenha tudo em <canvas>. A arte
// oficial vem de outra origem, então usamos a imagem otimizada same-origin do
// Next (`/_next/image?url=…`) como fonte — o canvas não é contaminado e o
// `toBlob` funciona. Falha de cada imagem cai num placeholder colorido, sem
// quebrar o export. A View só dispara os callbacks (gerar/baixar/reset).
'use client'

import { useCallback, useEffect, useState } from 'react'
import { ATTRIBUTE_COLORS, type AttributeColor } from '@/components'
import type { Deck } from '../model/types'
import type { DeckSectionGroup } from './deck-sections'

export interface DeckImageCardVisual {
  imageUrl: string | null
  color: AttributeColor
}

export interface DeckImageExportInput {
  deck: Deck
  group: DeckSectionGroup
  coverImageUrl: string | null
  resolveCard: (cardId: string) => DeckImageCardVisual | null
}

export type DeckImageExportStatus = 'idle' | 'generating' | 'ready' | 'error'

const WIDTH = 1200
const PAD = 48
const SCALE = 2

const TITLE_SIZE = 40
const TITLE_LINE_HEIGHT = 50
const META_SIZE = 17
const META_LINE_HEIGHT = 26
const DESC_SIZE = 15
const DESC_LINE_HEIGHT = 23
const SECTION_TITLE_HEIGHT = 34
const ROW_HEIGHT = 66
const ROW_GAP = 8
const SECTION_GAP = 28
const THUMB_WIDTH = 44
const THUMB_HEIGHT = 58
const COVER_WIDTH = 156
const COVER_HEIGHT = 218
const DIVIDER_OFFSET = 28
const FOOTER_HEIGHT = 42

const FONT = 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif'

const COLOR_BG = '#0C0C0E'
const COLOR_SURFACE = '#16161A'
const COLOR_SURFACE_2 = '#202024'
const COLOR_INK = '#F3F1EE'
const COLOR_INK_SOFT = '#B5B3AE'
const COLOR_INK_FAINT = '#8A8890'
const COLOR_BORDER = '#292930'
const COLOR_PRIMARY = '#C22B33'

interface RenderCard {
  name: string
  number: string | null
  quantity: number
  color: AttributeColor
  imageUrl: string | null
}

interface RenderSection {
  title: string
  total: number
  cards: RenderCard[]
}

interface RenderDocument {
  name: string
  format: string
  description: string | null
  mainCount: number
  eggCount: number
  total: number
  colors: AttributeColor[]
  coverImageUrl: string | null
  sections: RenderSection[]
}

interface LoadedImages {
  cover: HTMLImageElement | null
  cards: Map<string, HTMLImageElement | null>
}

interface DrawLayout {
  hasCover: boolean
  nameLines: string[]
  descriptionLines: string[]
  headerHeight: number
  footerY: number
  height: number
}

function buildDocument(input: DeckImageExportInput): RenderDocument {
  const colors: AttributeColor[] = []
  const sections = input.group.sections.map((section): RenderSection => {
    const cards = section.items.map((item): RenderCard => {
      const visual = input.resolveCard(item.cardId)
      if (visual && !colors.includes(visual.color)) colors.push(visual.color)
      return {
        name: item.name,
        number: item.number,
        quantity: item.quantity,
        color: visual?.color ?? 'option',
        imageUrl: visual?.imageUrl ?? null
      }
    })
    return { title: section.title, total: section.total, cards }
  })
  return {
    name: input.deck.name,
    format: input.deck.format,
    description: input.deck.description,
    mainCount: input.group.mainCount,
    eggCount: input.group.eggCount,
    total: input.group.total,
    colors: colors.slice(0, 3),
    coverImageUrl: input.coverImageUrl,
    sections
  }
}

/** Imagem otimizada same-origin do Next — não contamina o canvas (`toBlob`). */
function optimizedImageUrl(imageUrl: string, width: number): string {
  return `/_next/image?url=${encodeURIComponent(imageUrl)}&w=${width}&q=75`
}

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => resolve(null)
    image.src = src
  })
}

async function loadImages(doc: RenderDocument): Promise<LoadedImages> {
  const cover = doc.coverImageUrl
    ? await loadImage(optimizedImageUrl(doc.coverImageUrl, 384))
    : null

  const urls = new Set<string>()
  for (const section of doc.sections) {
    for (const card of section.cards) {
      if (card.imageUrl) urls.add(card.imageUrl)
    }
  }

  const cards = new Map<string, HTMLImageElement | null>()
  await Promise.all(
    [...urls].map(async (url) => {
      cards.set(url, await loadImage(optimizedImageUrl(url, 128)))
    })
  )

  return { cover, cards }
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number
): string[] {
  const words = text.split(/\s+/).filter(Boolean)
  const lines: string[] = []
  let current = ''
  let truncated = false

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word
    if (ctx.measureText(candidate).width <= maxWidth) {
      current = candidate
      continue
    }
    if (current) lines.push(current)
    current = word
    if (lines.length >= maxLines) {
      truncated = true
      break
    }
  }

  if (!truncated && current) lines.push(current)
  if (truncated) {
    const last = lines[lines.length - 1]
    if (last) lines[lines.length - 1] = `${last}…`
  }
  return lines.slice(0, maxLines)
}

function truncateText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string {
  if (ctx.measureText(text).width <= maxWidth) return text
  let result = text
  while (result.length > 1 && ctx.measureText(`${result}…`).width > maxWidth) {
    result = result.slice(0, -1)
  }
  return `${result}…`
}

function drawImageCover(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number
): void {
  const ratio = Math.max(width / image.width, height / image.height)
  const drawWidth = image.width * ratio
  const drawHeight = image.height * ratio
  const offsetX = x + (width - drawWidth) / 2
  const offsetY = y + (height - drawHeight) / 2
  ctx.drawImage(image, offsetX, offsetY, drawWidth, drawHeight)
}

function drawImageContain(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number
): void {
  const ratio = Math.min(width / image.width, height / image.height)
  const drawWidth = image.width * ratio
  const drawHeight = image.height * ratio
  const offsetX = x + (width - drawWidth) / 2
  const offsetY = y + (height - drawHeight) / 2
  ctx.drawImage(image, offsetX, offsetY, drawWidth, drawHeight)
}

function drawDeckImage(
  ctx: CanvasRenderingContext2D,
  doc: RenderDocument,
  images: LoadedImages,
  layout: DrawLayout
): void {
  ctx.fillStyle = COLOR_BG
  ctx.fillRect(0, 0, WIDTH, layout.height)
  ctx.fillStyle = COLOR_PRIMARY
  ctx.fillRect(0, 0, WIDTH, 6)

  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'

  let y = PAD
  ctx.fillStyle = COLOR_INK
  ctx.font = `700 ${TITLE_SIZE}px ${FONT}`
  for (const line of layout.nameLines) {
    ctx.fillText(line, PAD, y)
    y += TITLE_LINE_HEIGHT
  }

  y += 6
  ctx.fillStyle = COLOR_INK_SOFT
  ctx.font = `500 ${META_SIZE}px ${FONT}`
  ctx.fillText(
    `${doc.format} · main ${doc.mainCount} · egg ${doc.eggCount} · ${doc.total} cartas`,
    PAD,
    y
  )
  y += META_LINE_HEIGHT

  if (layout.descriptionLines.length > 0) {
    y += 10
    ctx.fillStyle = COLOR_INK_SOFT
    ctx.font = `400 ${DESC_SIZE}px ${FONT}`
    for (const line of layout.descriptionLines) {
      ctx.fillText(line, PAD, y)
      y += DESC_LINE_HEIGHT
    }
  }

  if (doc.colors.length > 0) {
    y += 18
    let x = PAD
    for (const color of doc.colors) {
      ctx.fillStyle = ATTRIBUTE_COLORS[color]
      ctx.fillRect(x, y, 26, 14)
      x += 32
    }
  }

  if (layout.hasCover && images.cover) {
    drawImageContain(ctx, images.cover, WIDTH - PAD - COVER_WIDTH, PAD, COVER_WIDTH, COVER_HEIGHT)
  }

  const dividerY = PAD + layout.headerHeight + DIVIDER_OFFSET - 14
  ctx.strokeStyle = COLOR_BORDER
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(PAD, dividerY + 0.5)
  ctx.lineTo(WIDTH - PAD, dividerY + 0.5)
  ctx.stroke()

  let cursor = PAD + layout.headerHeight + DIVIDER_OFFSET
  for (const section of doc.sections) {
    ctx.textAlign = 'left'
    ctx.textBaseline = 'top'
    ctx.fillStyle = COLOR_INK
    ctx.font = `700 21px ${FONT}`
    ctx.fillText(section.title, PAD, cursor)

    ctx.fillStyle = COLOR_INK_FAINT
    ctx.font = `500 16px ${FONT}`
    ctx.textAlign = 'right'
    ctx.fillText(String(section.total), WIDTH - PAD, cursor + 4)
    ctx.textAlign = 'left'

    cursor += SECTION_TITLE_HEIGHT

    for (const card of section.cards) {
      ctx.fillStyle = COLOR_SURFACE
      ctx.fillRect(PAD, cursor, WIDTH - 2 * PAD, ROW_HEIGHT)
      ctx.strokeStyle = COLOR_BORDER
      ctx.lineWidth = 1
      ctx.strokeRect(PAD + 0.5, cursor + 0.5, WIDTH - 2 * PAD - 1, ROW_HEIGHT - 1)

      const thumbX = PAD + 10
      const thumbY = cursor + (ROW_HEIGHT - THUMB_HEIGHT) / 2
      const image = card.imageUrl ? images.cards.get(card.imageUrl) ?? null : null

      if (image) {
        ctx.save()
        ctx.beginPath()
        ctx.rect(thumbX, thumbY, THUMB_WIDTH, THUMB_HEIGHT)
        ctx.clip()
        drawImageCover(ctx, image, thumbX, thumbY, THUMB_WIDTH, THUMB_HEIGHT)
        ctx.restore()
      } else {
        ctx.fillStyle = COLOR_SURFACE_2
        ctx.fillRect(thumbX, thumbY, THUMB_WIDTH, THUMB_HEIGHT)
        ctx.fillStyle = ATTRIBUTE_COLORS[card.color]
        ctx.fillRect(thumbX, thumbY, 3, THUMB_HEIGHT)
        if (card.number) {
          ctx.fillStyle = COLOR_INK_FAINT
          ctx.font = `700 10px ${FONT}`
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText(card.number, thumbX + THUMB_WIDTH / 2, thumbY + THUMB_HEIGHT / 2)
          ctx.textAlign = 'left'
          ctx.textBaseline = 'top'
        }
      }

      const labelX = thumbX + THUMB_WIDTH + 14
      const label = card.number ? `${card.number}   ${card.name}` : card.name
      const labelMaxWidth = WIDTH - PAD - 96 - labelX
      ctx.fillStyle = COLOR_INK
      ctx.font = `500 16px ${FONT}`
      ctx.textBaseline = 'middle'
      ctx.fillText(truncateText(ctx, label, labelMaxWidth), labelX, cursor + ROW_HEIGHT / 2)

      ctx.fillStyle = COLOR_INK_SOFT
      ctx.font = `600 16px ${FONT}`
      ctx.textAlign = 'right'
      ctx.fillText(`×${card.quantity}`, WIDTH - PAD - 14, cursor + ROW_HEIGHT / 2)
      ctx.textAlign = 'left'
      ctx.textBaseline = 'top'

      cursor += ROW_HEIGHT + ROW_GAP
    }

    cursor += SECTION_GAP
  }

  ctx.fillStyle = COLOR_INK_FAINT
  ctx.font = `400 13px ${FONT}`
  ctx.textAlign = 'left'
  ctx.textBaseline = 'alphabetic'
  ctx.fillText('digimoncardgamebrasil.com.br · deck builder', PAD, layout.footerY + 16)
}

async function renderDeckImage(input: DeckImageExportInput): Promise<Blob> {
  const doc = buildDocument(input)
  const images = await loadImages(doc)

  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas indisponível neste navegador.')

  const hasCover = Boolean(doc.coverImageUrl && images.cover)
  const textWidth = (hasCover ? WIDTH - PAD - COVER_WIDTH - 32 : WIDTH - PAD) - PAD

  ctx.font = `700 ${TITLE_SIZE}px ${FONT}`
  const nameLines = wrapText(ctx, doc.name, textWidth, 2)

  let headerHeight = nameLines.length * TITLE_LINE_HEIGHT + 6 + META_LINE_HEIGHT
  let descriptionLines: string[] = []
  if (doc.description) {
    ctx.font = `400 ${DESC_SIZE}px ${FONT}`
    descriptionLines = wrapText(ctx, doc.description, textWidth, 3)
    headerHeight += 10 + descriptionLines.length * DESC_LINE_HEIGHT
  }
  if (doc.colors.length > 0) headerHeight += 18 + 14
  if (hasCover) headerHeight = Math.max(headerHeight, COVER_HEIGHT)

  let sectionsHeight = 0
  for (const section of doc.sections) {
    sectionsHeight += SECTION_TITLE_HEIGHT
    sectionsHeight += section.cards.length * (ROW_HEIGHT + ROW_GAP)
    sectionsHeight += SECTION_GAP
  }

  const footerY = PAD + headerHeight + DIVIDER_OFFSET + sectionsHeight + 6
  const height = PAD + headerHeight + DIVIDER_OFFSET + sectionsHeight + FOOTER_HEIGHT + PAD

  canvas.width = Math.round(WIDTH * SCALE)
  canvas.height = Math.round(height * SCALE)
  ctx.scale(SCALE, SCALE)

  drawDeckImage(ctx, doc, images, {
    hasCover,
    nameLines,
    descriptionLines,
    headerHeight,
    footerY,
    height
  })

  return await new Promise<Blob>((resolve, reject) => {
    try {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob)
        else reject(new Error('Não foi possível gerar o PNG do deck.'))
      }, 'image/png')
    } catch {
      reject(new Error('Não foi possível gerar o PNG do deck.'))
    }
  })
}

export function useDeckImageExport(input: DeckImageExportInput) {
  const [status, setStatus] = useState<DeckImageExportStatus>('idle')
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fileName = `deck-${input.deck.slug || 'deck'}.png`

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  const generate = useCallback(async (): Promise<void> => {
    setStatus('generating')
    setError(null)
    try {
      const blob = await renderDeckImage(input)
      setPreviewUrl(URL.createObjectURL(blob))
      setStatus('ready')
    } catch (cause) {
      setStatus('error')
      setError(cause instanceof Error ? cause.message : 'Não foi possível gerar a imagem do deck.')
    }
  }, [input])

  const download = useCallback((): void => {
    if (!previewUrl) return
    const anchor = document.createElement('a')
    anchor.href = previewUrl
    anchor.download = fileName
    anchor.click()
  }, [previewUrl, fileName])

  const reset = useCallback((): void => {
    setStatus('idle')
    setError(null)
    setPreviewUrl(null)
  }, [])

  return { status, previewUrl, error, fileName, generate, download, reset }
}
