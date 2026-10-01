// Path: apps/web/src/app/(public)/layout.tsx
// Layout das rotas públicas: passthrough — o root layout já renderiza
// SiteHeader/SiteFooter via SiteChrome (task 09). Não duplicar o chrome.
import type { ReactNode } from 'react'

export default function PublicLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
