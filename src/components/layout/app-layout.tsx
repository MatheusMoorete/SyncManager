'use client'

/**
 * @component AppLayout
 * @description Layout principal da aplicação com suporte a responsividade e navegação
 *
 * @features
 * - Sidebar responsiva com suporte a mobile
 * - Header com informações do usuário
 * - Sistema de notificações via Toaster
 * - Navegação adaptativa (mobile/desktop)
 *
 * @example
 * <AppLayout>
 *   <DashboardPage />
 * </AppLayout>
 */

import { useState } from 'react'
import { Header } from './header'
import { Sidebar } from './sidebar'
import { Button } from '@/components/ui/button'
import { Menu } from 'lucide-react'
import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

/**
 * @interface AppLayoutProps
 * @description Props do componente de layout principal
 * @property {React.ReactNode} children - Conteúdo a ser renderizado dentro do layout
 */
interface AppLayoutProps {
  children: React.ReactNode
  className?: string
}

/**
 * @function AppLayout
 * @description Componente de layout principal que envolve todas as páginas da aplicação
 * @param {AppLayoutProps} props - Props do componente
 * @returns {JSX.Element} Layout renderizado com sidebar, header e conteúdo principal
 */
export function AppLayout({ children, className }: AppLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <TooltipProvider>
      <>
        <div className={cn('min-h-screen bg-background font-sans antialiased', className)}>
          <div className="flex h-screen overflow-hidden">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
              <div
                className="fixed inset-0 bg-charcoal/50 backdrop-blur-sm lg:hidden z-40"
                onClick={() => setIsSidebarOpen(false)}
              />
            )}

            {/* Sidebar */}
            <div
              className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 lg:relative lg:translate-x-0 ${
                isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
              }`}
            >
              <Sidebar onClose={() => setIsSidebarOpen(false)} />
            </div>

            {/* Main Content */}
            <div className="flex flex-1 flex-col w-full">
              <Header
                user={{
                  name: 'Matheus Moorete',
                  role: 'Administrador',
                }}
                onMenuClick={() => setIsSidebarOpen(true)}
              />
              <main className="flex-1 overflow-y-auto bg-neutral-cream/50 pb-safe">{children}</main>
            </div>
          </div>
          <Toaster position="top-center" expand richColors />
        </div>
      </>
    </TooltipProvider>
  )
}
