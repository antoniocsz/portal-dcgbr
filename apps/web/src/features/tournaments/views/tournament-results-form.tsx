// Path: apps/web/src/features/tournaments/views/tournament-results-form.tsx
// View do formulário de resultados/classificação: linhas dinâmicas
// (posição/jogador/deck/record), adicionar/remover e validação local. Só JSX —
// o submit e o estado da mutation chegam por props (ViewModel useTournament).
'use client'

import { useState } from 'react'
import { Button } from '@/components'
import { cn } from '@/lib/utils'
import type { TournamentResultEntry } from '../model/types'

interface ResultRow {
  position: string
  player: string
  deck: string
  record: string
}

function toRows(results: TournamentResultEntry[] | null | undefined): ResultRow[] {
  if (!results || results.length === 0) {
    return [{ position: '1', player: '', deck: '', record: '' }]
  }
  return [...results]
    .sort((a, b) => a.position - b.position)
    .map((entry) => ({
      position: String(entry.position),
      player: entry.player,
      deck: entry.deck ?? '',
      record: entry.record ?? ''
    }))
}

const EMPTY_ROW: ResultRow = { position: '', player: '', deck: '', record: '' }

const CELL_CLASS =
  'h-10 w-full border bg-surface-2 px-3 text-sm text-ink outline-none transition-colors placeholder:text-ink-faint focus:border-primary'

export interface TournamentResultsFormProps {
  initialResults?: TournamentResultEntry[] | null
  isPending: boolean
  error?: unknown
  success?: boolean
  onSubmit: (results: TournamentResultEntry[]) => void
  onClose?: () => void
}

export function TournamentResultsForm({
  initialResults,
  isPending,
  error,
  success,
  onSubmit,
  onClose
}: TournamentResultsFormProps) {
  const [rows, setRows] = useState<ResultRow[]>(() => toRows(initialResults ?? null))

  const parsed = rows.map((row) => ({
    position: Number(row.position),
    player: row.player.trim(),
    deck: row.deck.trim(),
    record: row.record.trim()
  }))
  const invalidRows = parsed.map(
    (entry) => !Number.isInteger(entry.position) || entry.position < 1 || entry.player === ''
  )
  const isValid = parsed.length >= 1 && !invalidRows.some(Boolean)
  const errorMessage = error instanceof Error ? error.message : null

  const updateRow = (index: number, field: keyof ResultRow, value: string) => {
    setRows((prev) => prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)))
  }

  const addRow = () => {
    setRows((prev) => [...prev, { ...EMPTY_ROW, position: String(prev.length + 1) }])
  }

  const removeRow = (index: number) => {
    setRows((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = () => {
    if (!isValid) return
    onSubmit(
      parsed.map((entry) => ({
        position: entry.position,
        player: entry.player,
        deck: entry.deck === '' ? null : entry.deck,
        record: entry.record === '' ? null : entry.record
      }))
    )
  }

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(event) => {
        event.preventDefault()
        handleSubmit()
      }}
    >
      <div className="hidden grid-cols-[4rem_1fr_1fr_6rem_2.5rem] gap-3 text-xs font-semibold text-ink-soft sm:grid">
        <span>Posição</span>
        <span>Jogador</span>
        <span>Deck</span>
        <span>Record</span>
        <span className="sr-only">Remover</span>
      </div>

      <div className="flex flex-col gap-3">
        {rows.map((row, index) => (
          <div
            key={index}
            className="grid grid-cols-2 gap-3 sm:grid-cols-[4rem_1fr_1fr_6rem_2.5rem] sm:items-center"
          >
            <label className="sr-only" htmlFor={`result-position-${index}`}>
              Posição
            </label>
            <input
              id={`result-position-${index}`}
              type="number"
              min={1}
              inputMode="numeric"
              value={row.position}
              onChange={(event) => updateRow(index, 'position', event.target.value)}
              placeholder="1"
              aria-invalid={invalidRows[index] ? true : undefined}
              className={cn(CELL_CLASS, invalidRows[index] ? 'border-danger' : 'border-border')}
            />

            <label className="sr-only" htmlFor={`result-player-${index}`}>
              Jogador
            </label>
            <input
              id={`result-player-${index}`}
              type="text"
              value={row.player}
              onChange={(event) => updateRow(index, 'player', event.target.value)}
              placeholder="Nome do jogador"
              aria-invalid={invalidRows[index] ? true : undefined}
              className={cn(
                CELL_CLASS,
                'col-span-2 sm:col-span-1',
                invalidRows[index] ? 'border-danger' : 'border-border'
              )}
            />

            <label className="sr-only" htmlFor={`result-deck-${index}`}>
              Deck
            </label>
            <input
              id={`result-deck-${index}`}
              type="text"
              value={row.deck}
              onChange={(event) => updateRow(index, 'deck', event.target.value)}
              placeholder="Deck (opcional)"
              className={cn(CELL_CLASS, 'border-border')}
            />

            <label className="sr-only" htmlFor={`result-record-${index}`}>
              Record
            </label>
            <input
              id={`result-record-${index}`}
              type="text"
              value={row.record}
              onChange={(event) => updateRow(index, 'record', event.target.value)}
              placeholder="4-1"
              className={cn(CELL_CLASS, 'border-border')}
            />

            <Button
              variant="ghost"
              size="sm"
              aria-label={`Remover resultado ${index + 1}`}
              disabled={rows.length <= 1 || isPending}
              onClick={() => removeRow(index)}
            >
              Remover
            </Button>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button variant="dark" size="sm" disabled={isPending} onClick={addRow}>
          + Adicionar linha
        </Button>
      </div>

      {errorMessage ? (
        <p role="alert" className="text-xs font-semibold text-danger">
          {errorMessage}
        </p>
      ) : success ? (
        <p role="status" className="text-xs font-semibold text-success">
          Resultados registrados. O torneio foi finalizado.
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-3 pt-1">
        <Button type="submit" variant="primary" size="md" disabled={!isValid || isPending}>
          {isPending ? 'Salvando…' : 'Salvar resultados'}
        </Button>
        {onClose ? (
          <Button variant="ghost" size="md" disabled={isPending} onClick={onClose}>
            Cancelar
          </Button>
        ) : null}
      </div>
    </form>
  )
}
