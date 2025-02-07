import { Metadata } from 'next'
import { AppLayout } from '@/components/layout/app-layout'
import { Toaster } from '@/components/ui/sonner'

export const metadata: Metadata = {
  title: 'Financeiro | SyncManager',
  description: 'Gerencie as finanças do seu negócio de forma eficiente',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AppLayout>{children}</AppLayout>
      <Toaster position="top-center" expand={true} richColors />
    </>
  )
}
