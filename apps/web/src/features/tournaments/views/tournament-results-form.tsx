// Path: apps/web/src/features/tournaments/views/tournament-results-form.tsx
// View do formulário de resultados/classificação: linhas dinâmicas
// (jogador/deck/record), adicionar/remover e validação local. Só JSX —
// o submit e o estado da mutation chegam por props (ViewModel useTournament).
// Cada linha tem um `id` estável (usado como `key`) e a posição (1..n) é
// derivada da ordem no submit — sem edição manual, o que elimina duplicatas.
'use client'

import { useState } from 'react'
import { Button } from '@/components'
import { cn } from '@/lib/utils'
import type { TournamentResultEntry } from '../model/types'

interface ResultRow {
  id: string
  player: string
  deck: string
  record: string
}

type ResultField = Exclude<keyof ResultRow, 'id'>

let fallbackRowSeq = 0

function createRowId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  fallbackRowSeq += 1
  return `result-row-${fallbackRowSeq}`
}

function createRow(player = '', deck = '', record = ''): ResultRow {
  return { id: createRowId(), player, deck, record }
}

function toRows(results: TournamentResultEntry[] | null | undefined): ResultRow[] {
  if (!results || results.length === 0) {
    return [createRow()]
  }
  return [...results]
    .sort((a, b) => a.position - b.position)
    .map((entry) => createRow(entry.player, entry.deck ?? '', entry.record ?? ''))
}

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

  const isRowInvalid = (row: ResultRow) => row.player.trim() === ''
  const isValid = rows.length >= 1 && !rows.some(isRowInvalid)
  const errorMessage = error instanceof Error ? error.message : null

  const updateRow = (id: string, field: ResultField, value: string) => {
    setRows((prev) => prev.map((row) => (row.id === id ? { ...row, [field]: value } : row)))
  }

  const addRow = () => {
    setRows((prev) => [...prev, createRow()])
  }

  const removeRow = (id: string) => {
    setRows((prev) => prev.filter((row) => row.id !== id))
  }

  const handleSubmit = () => {
    if (!isValid) return
    onSubmit(
      rows.map((row, index) => {
        const deck = row.deck.trim()
        const record = row.record.trim()
        return {
          position: index + 1,
          player: row.player.trim(),
          deck: deck === '' ? null : deck,
          record: record === '' ? null : record
        }
      })
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
            key={row.id}
            className="grid grid-cols-2 gap-3 sm:grid-cols-[4rem_1fr_1fr_6rem_2.5rem] sm:items-center"
          >
            <span className="flex h-10 w-full items-center border border-border bg-surface-2 px-3 text-sm font-semibold text-ink-soft">
              <span className="sr-only">Posição </span>
              {index + 1}
            </span>

            <label className="sr-only" htmlFor={`result-player-${index}`}>
              Jogador
            </label>
            <input
              id={`result-player-${index}`}
              type="text"
              value={row.player}
              onChange={(event) => updateRow(row.id, 'player', event.target.value)}
              placeholder="Nome do jogador"
              aria-invalid={isRowInvalid(row) ? true : undefined}
              className={cn(
                CELL_CLASS,
                'col-span-2 sm:col-span-1',
                isRowInvalid(row) ? 'border-danger' : 'border-border'
              )}
            />

            <label className="sr-only" htmlFor={`result-deck-${index}`}>
              Deck
            </label>
            <input
              id={`result-deck-${index}`}
              type="text"
              value={row.deck}
              onChange={(event) => updateRow(row.id, 'deck', event.target.value)}
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
              onChange={(event) => updateRow(row.id, 'record', event.target.value)}
              placeholder="4-1"
              className={cn(CELL_CLASS, 'border-border')}
            />

            <Button
              variant="ghost"
              size="sm"
              aria-label={`Remover resultado ${index + 1}`}
              disabled={rows.length <= 1 || isPending}
              onClick={() => removeRow(row.id)}
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
