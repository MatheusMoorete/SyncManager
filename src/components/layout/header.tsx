'use client'

/**
 * @component Header
 * @description Cabeçalho principal da aplicação com informações do usuário e controles de navegação
 *
 * @features
 * - Exibição de boas-vindas personalizada
 * - Avatar do usuário com fallback
 * - Controle do menu mobile
 * - Layout responsivo
 *
 * @example
 * <Header
 *   user={{ name: "John Doe", role: "Admin" }}
 *   onMenuClick={() => setIsSidebarOpen(true)}
 * />
 */

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Menu } from 'lucide-react'
import { useAuthStore } from '@/store/auth-store'

/**
 * @interface HeaderProps
 * @description Props do componente Header
 * @property {Function} onMenuClick - Função chamada ao clicar no botão do menu mobile
 */
interface HeaderProps {
  onMenuClick: () => void
}

/**
 * @function Header
 * @description Componente de cabeçalho com informações do usuário e controles de navegação
 * @param {HeaderProps} props - Props do componente
 * @returns {JSX.Element} Header renderizado com informações do usuário
 */
export function Header({ onMenuClick }: HeaderProps) {
  const { user } = useAuthStore()
  const firstName = user?.displayName?.split(' ')[0] || 'Usuário'

  return (
    <header className="flex h-14 lg:h-16 items-center justify-between border-b border-charcoal/10 bg-white/80 px-4 lg:px-6">
      <div className="flex flex-col">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden absolute left-4 top-4"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div className="hidden lg:block">
          <h1 className="text-lg font-semibold text-charcoal">Bem-vindo, {firstName}!</h1>
          <p className="text-sm text-charcoal/60">
            Organize seus agendamentos e alcance seus objetivos
          </p>
        </div>
      </div>
    </header>
  )
}
