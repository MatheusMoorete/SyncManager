'use client'

/**
 * @component Sidebar
 * @description Barra lateral de navegação com suporte a responsividade e categorização de itens
 *
 * @features
 * - Navegação categorizada (Principal, Gestão, Sistema)
 * - Suporte a ícones e indicador de página ativa
 * - Layout responsivo com adaptação mobile/desktop
 * - Botão de logout integrado
 */

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import {
  LayoutGrid,
  Scissors,
  Users,
  DollarSign,
  UserCircle,
  Settings,
  LogOut,
  X,
  Calendar,
  ClipboardList,
  Star,
} from 'lucide-react'

/**
 * @const mainNavItems
 * @description Itens de navegação principais do sistema
 */
const mainNavItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutGrid,
  },
]

/**
 * @const managementNavItems
 * @description Itens de navegação relacionados à gestão do negócio
 */
const managementNavItems = [
  {
    title: 'Agenda',
    href: '/agenda',
    icon: Calendar,
  },
  {
    title: 'Atendimentos',
    href: '/atendimentos',
    icon: ClipboardList,
  },
  {
    title: 'Financeiro',
    href: '/finance',
    icon: DollarSign,
  },
  {
    title: 'Clientes',
    href: '/customers',
    icon: Users,
  },
  {
    title: 'Serviços',
    href: '/services',
    icon: Scissors,
  },
]

/**
 * @const systemNavItems
 * @description Itens de navegação relacionados às configurações do sistema
 */
const systemNavItems = [
  {
    title: 'Usuários',
    href: '/users',
    icon: UserCircle,
  },
  {
    title: 'Sistema de Fidelidade',
    href: '/configuracoes/fidelidade',
    icon: Star,
  },
  {
    title: 'Configurações',
    href: '/settings',
    icon: Settings,
  },
]

/**
 * @interface SidebarProps
 * @description Props do componente Sidebar
 * @property {Function} [onClose] - Função chamada ao fechar a sidebar em modo mobile
 */
interface SidebarProps {
  onClose?: () => void
}

/**
 * @function Sidebar
 * @description Componente de barra lateral com navegação e controles do sistema
 * @param {SidebarProps} props - Props do componente
 * @returns {JSX.Element} Sidebar renderizada com itens de navegação
 */
export function Sidebar({ onClose }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error

      // Redirecionar para a página de login
      router.push('/login')
      toast.success('Logout realizado com sucesso')
    } catch (error) {
      console.error('Error logging out:', error)
      toast.error('Erro ao realizar logout')
    }
  }

  return (
    <aside className="flex h-screen w-[280px] lg:w-64 flex-col bg-charcoal">
      {/* Logo */}
      <div className="flex h-16 lg:h-16 items-center justify-between border-b border-white/10 px-4 lg:px-6">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 lg:h-6 lg:w-6 rounded bg-white/10" />
          <div>
            <p className="text-lg lg:text-base font-semibold text-white">SyncManager</p>
            <p className="text-sm lg:text-xs text-white/60">Sistema de Gestão</p>
          </div>
        </div>
        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 lg:h-8 lg:w-8 text-white/60 hover:text-white"
            onClick={onClose}
          >
            <X className="h-6 w-6 lg:h-5 lg:w-5" />
          </Button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-8 lg:space-y-6 p-4 lg:px-4 lg:py-6">
        {/* Main */}
        <div>
          {mainNavItems.map(item => (
            <NavItem key={item.href} item={item} isActive={pathname === item.href} />
          ))}
        </div>

        {/* Management */}
        <div>
          <p className="mb-3 lg:mb-2 px-3 lg:px-2 text-sm lg:text-xs font-medium text-white/40">
            GESTÃO
          </p>
          <div className="space-y-1">
            {managementNavItems.map(item => (
              <NavItem key={item.href} item={item} isActive={pathname === item.href} />
            ))}
          </div>
        </div>

        {/* System */}
        <div>
          <p className="mb-3 lg:mb-2 px-3 lg:px-2 text-sm lg:text-xs font-medium text-white/40">
            SISTEMA
          </p>
          <div className="space-y-1">
            {systemNavItems.map(item => (
              <NavItem key={item.href} item={item} isActive={pathname === item.href} />
            ))}
          </div>
        </div>
      </nav>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="flex items-center gap-3 px-6 py-5 lg:py-4 text-base lg:text-sm text-white/60 transition-colors hover:text-white hover:bg-white/5"
      >
        <LogOut className="h-5 w-5 lg:h-4 lg:w-4" />
        Sair
      </button>
    </aside>
  )
}

/**
 * @interface NavItemProps
 * @description Props do componente de item de navegação
 * @property {Object} item - Dados do item de navegação
 * @property {string} item.title - Título do item
 * @property {string} item.href - URL de destino
 * @property {React.ComponentType} item.icon - Componente de ícone
 * @property {boolean} [isActive] - Indica se o item está ativo
 */
interface NavItemProps {
  item: {
    title: string
    href: string
    icon: React.ComponentType<{ className?: string }>
  }
  isActive?: boolean
}

/**
 * @function NavItem
 * @description Componente de item individual da navegação
 * @param {NavItemProps} props - Props do componente
 * @returns {JSX.Element} Link de navegação estilizado com ícone
 */
function NavItem({ item, isActive }: NavItemProps) {
  const Icon = item.icon

  return (
    <Link
      href={item.href}
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2.5 lg:gap-2 lg:px-2 lg:py-1.5 text-base lg:text-sm transition-colors',
        isActive ? 'bg-white/10 text-white' : 'text-white/60 hover:bg-white/5 hover:text-white'
      )}
    >
      <Icon className="h-5 w-5 lg:h-4 lg:w-4" />
      {item.title}
    </Link>
  )
}
