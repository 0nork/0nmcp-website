'use client'

import { VaultProvider } from '@/lib/console/VaultProvider'

export default function Providers({ children }: { children: React.ReactNode }) {
  return <VaultProvider>{children}</VaultProvider>
}
