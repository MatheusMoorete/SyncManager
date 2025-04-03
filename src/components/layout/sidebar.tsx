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
 * - Modo colapsado que mostra apenas ícones
 */

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
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
  Database,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { signOut } from '@/lib/auth'

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
    title: 'Finanças',
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
    title: 'Sistema de Fidelidade',
    href: '/configuracoes/fidelidade',
    icon: Star,
  },
  {
    title: 'Backup de Dados',
    href: '/configuracoes/backup',
    icon: Database,
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
  const [collapsed, setCollapsed] = useState(() => {
    // Verifica se está no browser e carrega a preferência do usuário
    if (typeof window !== 'undefined') {
      const savedState = localStorage.getItem('sidebar-collapsed')
      return savedState === 'true'
    }
    return false
  })

  // Atualiza o localStorage quando o estado muda
  const toggleCollapsed = (state: boolean) => {
    setCollapsed(state)
    if (typeof window !== 'undefined') {
      localStorage.setItem('sidebar-collapsed', state.toString())
    }
  }

  const handleLogout = async () => {
    try {
      await signOut()
      router.push('/login')
    } catch (error) {
      console.error('Error signing out:', error)
      toast.error('Erro ao sair')
    }
  }

  return (
    <aside
      className={cn(
        'flex h-screen flex-col bg-charcoal transition-all duration-300',
        collapsed ? 'w-[70px] lg:w-[64px]' : 'w-[280px] lg:w-64'
      )}
    >
      {/* Logo */}
      <div className="flex h-16 lg:h-16 items-center justify-between border-b border-white/10 px-4">
        <div className={cn('flex items-center gap-3', collapsed && 'justify-center')}>
          <div
            className="h-9 w-9 lg:h-8 lg:w-8 rounded-lg flex items-center justify-center bg-gradient-to-br from-soft-sage/90 to-soft-sage/50 shadow-sm transition-all duration-200 hover:from-soft-sage hover:to-soft-sage/80 group cursor-pointer"
            onClick={() => toggleCollapsed(!collapsed)}
            title={collapsed ? 'Expandir menu' : 'Colapsar menu'}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 lg:h-5 lg:w-5 text-charcoal transition-transform duration-300 group-hover:rotate-[15deg]"
            >
              <path
                d="M7.5 21.5C4.5 19.5 2.5 16 2.5 12C2.5 6.75 6.75 2.5 12 2.5C17.25 2.5 21.5 6.75 21.5 12C21.5 16 19.5 19.5 16.5 21.5"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M12 6.5V12L16 14"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M17 15.5L19 13.5L21 15.5"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M17 18.5V13.5"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M7 8.5L5 10.5L3 8.5"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M7 5.5V10.5"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          {!collapsed && (
            <div>
              <p className="text-lg lg:text-base font-semibold text-white transition-all duration-200">
                SyncManager
              </p>
              <p className="text-sm lg:text-xs text-white/60 transition-all duration-200">
                Sistema de Gestão
              </p>
            </div>
          )}
        </div>
        {collapsed ? (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-[-12px] top-8 h-6 w-6 rounded-full bg-charcoal text-white/60 hover:text-white border border-white/10 hidden lg:flex"
            onClick={() => toggleCollapsed(false)}
          >
            <ChevronRight className="h-3 w-3" />
          </Button>
        ) : (
          <>
            {onClose ? (
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 text-white/60 hover:text-white lg:hidden"
                onClick={onClose}
              >
                <X className="h-6 w-6" />
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-white/60 hover:text-white hidden lg:flex"
                onClick={() => toggleCollapsed(true)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            )}
          </>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-8 lg:space-y-6 p-4 lg:py-6 lg:px-2 overflow-y-auto">
        {/* Main */}
        <div>
          {mainNavItems.map(item => (
            <NavItem
              key={item.href}
              item={item}
              isActive={pathname === item.href}
              collapsed={collapsed}
            />
          ))}
        </div>

        {/* Management */}
        <div>
          {!collapsed && (
            <p className="mb-3 lg:mb-2 px-3 lg:px-2 text-sm lg:text-xs font-medium text-white/40">
              GESTÃO
            </p>
          )}
          <div className="space-y-1">
            {managementNavItems.map(item => (
              <NavItem
                key={item.href}
                item={item}
                isActive={pathname === item.href}
                collapsed={collapsed}
              />
            ))}
          </div>
        </div>

        {/* System */}
        <div>
          {!collapsed && (
            <p className="mb-3 lg:mb-2 px-3 lg:px-2 text-sm lg:text-xs font-medium text-white/40">
              SISTEMA
            </p>
          )}
          <div className="space-y-1">
            {systemNavItems.map(item => (
              <NavItem
                key={item.href}
                item={item}
                isActive={pathname === item.href}
                collapsed={collapsed}
              />
            ))}
          </div>
        </div>
      </nav>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className={cn(
          'flex items-center gap-3 py-5 lg:py-4 text-base lg:text-sm text-white/60 transition-colors hover:text-white hover:bg-white/5',
          collapsed ? 'justify-center px-3' : 'px-6'
        )}
      >
        <LogOut className="h-5 w-5 lg:h-4 lg:w-4" />
        {!collapsed && 'Sair'}
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
 * @property {boolean} [collapsed] - Indica se a sidebar está colapsada
 */
interface NavItemProps {
  item: {
    title: string
    href: string
    icon: React.ComponentType<{ className?: string }>
  }
  isActive?: boolean
  collapsed?: boolean
}

/**
 * @function NavItem
 * @description Componente de item individual da navegação
 * @param {NavItemProps} props - Props do componente
 * @returns {JSX.Element} Link de navegação estilizado com ícone
 */
function NavItem({ item, isActive, collapsed }: NavItemProps) {
  const Icon = item.icon

  return (
    <Link
      href={item.href}
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2.5 lg:gap-2 lg:py-1.5 text-base lg:text-sm transition-colors',
        isActive ? 'bg-white/10 text-white' : 'text-white/60 hover:bg-white/5 hover:text-white',
        collapsed && 'justify-center px-2'
      )}
      title={collapsed ? item.title : undefined}
    >
      <Icon className="h-5 w-5 lg:h-4 lg:w-4" />
      {!collapsed && item.title}
    </Link>
  )
}
