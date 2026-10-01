// Path: apps/web/src/app/(member)/perfil/page.tsx
// Página de perfil do membro — monta a ProfileView (feature users).
import type { Metadata } from 'next'
import { ProfileView } from '@/features/users/views/profile-view'

export const metadata: Metadata = {
  title: 'Meu perfil',
  description: 'Seu perfil na comunidade Digimon TCG Brasil.'
}

export default function PerfilPage() {
  return <ProfileView />
}
