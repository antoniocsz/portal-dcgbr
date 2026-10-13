// Path: apps/web/src/features/legal/views/legal-document-view.tsx
// View pura (Server Component, sem hooks): renderiza um documento legal com o
// design system — tipografia display, tokens ink*, largura de leitura 760px.
import Link from 'next/link'
import { LEGAL_DISCLAIMER } from '../model/content'
import type { LegalBlock, LegalDocument, LegalInline } from '../model/types'

const LINK_CLASS =
  'text-accent underline underline-offset-2 transition-colors hover:text-ink'

function InlineSegment({ segment }: { segment: LegalInline }) {
  if (typeof segment === 'string') return <>{segment}</>

  if (segment.href.startsWith('/')) {
    return (
      <Link href={segment.href} className={LINK_CLASS}>
        {segment.text}
      </Link>
    )
  }

  return (
    <a
      href={segment.href}
      className={LINK_CLASS}
      {...(segment.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
    >
      {segment.text}
    </a>
  )
}

function Inline({ segments }: { segments: LegalInline[] }) {
  return (
    <>
      {segments.map((segment, index) => (
        <InlineSegment key={index} segment={segment} />
      ))}
    </>
  )
}

function Block({ block }: { block: LegalBlock }) {
  if (block.type === 'paragraph') {
    return (
      <p className="text-[15px] leading-7 text-ink-soft">
        <Inline segments={block.content} />
      </p>
    )
  }

  if (block.type === 'list') {
    return (
      <ul className="flex list-disc flex-col gap-2 pl-5 text-[15px] leading-7 text-ink-soft marker:text-ink-faint">
        {block.items.map((item, index) => (
          <li key={index}>
            <Inline segments={item} />
          </li>
        ))}
      </ul>
    )
  }

  return (
    <p className="border-l-2 border-accent bg-accent-soft/40 px-4 py-3 text-sm leading-6 text-ink-soft">
      <Inline segments={block.content} />
    </p>
  )
}

export function LegalDocumentView({ document }: { document: LegalDocument }) {
  return (
    <article className="mx-auto w-full max-w-[760px] px-4 py-10 lg:py-16">
      <header className="flex flex-col gap-3 border-b border-border pb-6">
        <h1 className="font-display text-3xl font-bold text-ink sm:text-4xl">{document.title}</h1>
        <p className="text-base leading-6 text-ink-soft">{document.description}</p>
        <p className="text-xs text-ink-faint">Última atualização: {document.updatedAt}</p>
      </header>

      <p
        role="note"
        className="mt-6 border border-warning/40 bg-warning/10 px-4 py-3 text-sm leading-6 text-ink-soft"
      >
        {LEGAL_DISCLAIMER}
      </p>

      <p className="mt-6 text-[15px] leading-7 text-ink">
        <Inline segments={document.intro} />
      </p>

      <div className="mt-10 flex flex-col gap-10">
        {document.sections.map((section) => (
          <section key={section.id} id={section.id} className="scroll-mt-24">
            <h2 className="mb-3 font-display text-xl font-bold text-ink">{section.heading}</h2>
            <div className="flex flex-col gap-3">
              {section.blocks.map((block, index) => (
                <Block key={index} block={block} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </article>
  )
}
