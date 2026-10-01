// Path: apps/web/src/app/(auth)/layout.tsx
// Layout do grupo (auth): passthrough — o root layout já aplica o SiteChrome
// (SiteHeader + SiteFooter) em todas as rotas fora de /admin.
import type { ReactNode } from 'react'

export default function AuthLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
