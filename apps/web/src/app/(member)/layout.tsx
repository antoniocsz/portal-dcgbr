// Path: apps/web/src/app/(member)/layout.tsx
// Layout das rotas de membro (Server Component): gate server-side — exige sessão
// válida (getSession valida o access_token httpOnly) e redireciona o anônimo
// para /login. O chrome público (SiteHeader/SiteFooter) é injetado pelo
// SiteChrome do root layout — aqui não duplicamos header/footer.
import type { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'

export default async function MemberLayout({ children }: { children: ReactNode }) {
  const session = await getSession()
  if (!session) redirect('/login')

  return <div className="min-h-full">{children}</div>
}
