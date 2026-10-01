// Path: apps/web/src/components/editor/post-editor.tsx
// Editor de conteúdo WYSIWYG (TipTap) estilo Notion: markdown shortcuts,
// slash commands e placeholder. View pura (MVVM) — recebe value/onChange via
// props; nada de hooks de dados aqui.
'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { EditorContent, useEditor, type Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Link from '@tiptap/extension-link'
import { EditorToolbar } from './editor-toolbar'
import { cn } from '@/lib/utils'

export interface PostEditorProps {
  value: string
  onChange: (html: string) => void
  placeholder?: string
  minHeight?: string
  id?: string
  ariaLabel?: string
}
function withSlashCommands(editor: Editor, apply: (type: string) => void): void {
  // Expõe o handler globalmente para o onInput não precisar de refs
  ;(editor as Editor & { __applySlash?: (t: string) => void }).__applySlash = apply
}

interface SlashPosition {
  top: number
  left: number
}

function SlashMenu({
  position,
  onPick
}: {
  position: SlashPosition
  onPick: (type: string) => void
}) {
  const items: { type: string; label: string; hint: string }[] = [
    { type: 'heading1', label: 'Título 1', hint: 'Seção grande' },
    { type: 'heading2', label: 'Título 2', hint: 'Subseção' },
    { type: 'paragraph', label: 'Parágrafo', hint: 'Texto normal' },
    { type: 'bullet', label: 'Lista', hint: 'Itens com marcador' },
    { type: 'ordered', label: 'Lista numerada', hint: 'Itens numerados' },
    { type: 'quote', label: 'Citação', hint: 'Destaque em bloco' },
    { type: 'code', label: 'Bloco de código', hint: 'Código com monoespaçado' }
  ]
  return (
    <div
      style={{ top: position.top, left: position.left }}
      className="absolute z-10 mt-1 w-56 border border-border bg-surface shadow-lg"
    >
      {items.map((item) => (
        <button
          key={item.type}
          type="button"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => onPick(item.type)}
          className="flex w-full items-center justify-between px-3 py-2 text-left text-sm text-ink hover:bg-surface-2"
        >
          <span>{item.label}</span>
          <span className="text-[11px] text-ink-faint">{item.hint}</span>
        </button>
      ))}
    </div>
  )
}

export function PostEditor({
  value,
  onChange,
  placeholder = 'Escreva ou / para comandos…',
  minHeight = '280px',
  id = 'post-body',
  ariaLabel = 'Conteúdo do post'
}: PostEditorProps) {
  const applySlash = useCallback(
    (type: string) => {
      const chain = editorRef.current?.chain().focus()
      if (!chain) return
      switch (type) {
        case 'heading1':
          chain.toggleHeading({ level: 1 }).run()
          break
        case 'heading2':
          chain.toggleHeading({ level: 2 }).run()
          break
        case 'paragraph':
          chain.setParagraph().run()
          break
        case 'bullet':
          chain.toggleBulletList().run()
          break
        case 'ordered':
          chain.toggleOrderedList().run()
          break
        case 'quote':
          chain.toggleBlockquote().run()
          break
        case 'code':
          chain.toggleCodeBlock().run()
          break
      }
    },
    []
  )

  const extensions = useMemo(
    () => [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4] }
      }),
      Placeholder.configure({ placeholder }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' }
      })
    ],
    [placeholder]
  )

  const containerRef = useRef<HTMLDivElement | null>(null)
  const editorRef = useRef<Editor | null>(null)
  const [showSlash, setShowSlash] = useState(false)
  const [slashPos, setSlashPos] = useState<SlashPosition>({ top: 40, left: 8 })

  // IMPORTANTE: o 2º argumento do useEditor controla a RECRIAÇÃO do editor.
  // value/onChange mudam a cada tecla — se entrarem nas deps, o editor é
  // destruído/recriado a cada keystroke e o foco se perde. Mantemos apenas
  // `extensions` (estável) e sincronizamos valor externo no effect abaixo.
  const editor = useEditor(
    {
      extensions,
      content: value,
      immediatelyRender: false,
      shouldRerenderOnTransaction: true,
      editorProps: {
        attributes: {
          id,
          'aria-label': ariaLabel,
          class: 'editor-prosemirror px-4 py-3'
        },
        handleKeyDown(view, event) {
          // "/" no início de linha abre o menu de comandos próximo ao cursor
          if (event.key === '/' && !event.shiftKey && !event.ctrlKey && !event.metaKey) {
            const { $from } = view.state.selection
            const parentText = $from.parent.textContent
            if (parentText === '') {
              const coords = view.coordsAtPos($from.pos)
              const rect = containerRef.current?.getBoundingClientRect()
              if (rect) {
                const MENU_WIDTH = 224
                const left = Math.max(0, Math.min(coords.left - rect.left, rect.width - MENU_WIDTH))
                setSlashPos({ top: coords.top - rect.top + 26, left })
              }
              setShowSlash(true)
            }
          }
          if (event.key === 'Escape') setShowSlash(false)
          return false
        },
        handleDOMEvents: {
          blur: () => setShowSlash(false)
        }
      },
      onUpdate({ editor: e }) {
        onChange(e.getHTML())
      }
    },
    [extensions]
  )
  editorRef.current = editor ?? null
  if (editor) withSlashCommands(editor, applySlash)

  // Sincroniza valor vindo de fora (reset/load do form). A guarda evita ecoar
  // o próprio conteúdo do editor (que já é enviado via onChange/onUpdate).
  useEffect(() => {
    if (!editor) return
    if (value !== editor.getHTML()) {
      editor.commands.setContent(value, { emitUpdate: false })
    }
  }, [editor, value])

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative border border-border bg-surface transition-colors focus-within:border-ink-faint'
      )}
    >
      <EditorToolbar editor={editor} />
      <EditorContent editor={editor} style={{ minHeight }} />
      {showSlash ? (
        <SlashMenu
          position={slashPos}
          onPick={(type) => {
            applySlash(type)
            setShowSlash(false)
          }}
        />
      ) : null}
    </div>
  )
}
