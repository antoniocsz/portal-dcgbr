// Path: apps/web/src/app/(member)/layout.tsx
// Layout das rotas de membro. O chrome público (SiteHeader/SiteFooter) é
// injetado pelo SiteChrome do root layout — aqui não duplicamos header/footer.
import type { ReactNode } from 'react'

export default function MemberLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-full">{children}</div>
}
