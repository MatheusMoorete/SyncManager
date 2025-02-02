import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  LayoutGrid,
  Scissors,
  Tags,
  Users,
  DollarSign,
  UserCircle,
  Settings,
  LogOut,
  X
} from "lucide-react"

const mainNavItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutGrid,
  },
]

const managementNavItems = [
  {
    title: "Serviços",
    href: "/services",
    icon: Scissors,
  },
  {
    title: "Categorias",
    href: "/categories",
    icon: Tags,
  },
  {
    title: "Clientes",
    href: "/customers",
    icon: Users,
  },
  {
    title: "Financeiro",
    href: "/finance",
    icon: DollarSign,
  },
]

const systemNavItems = [
  {
    title: "Usuários",
    href: "/users",
    icon: UserCircle,
  },
  {
    title: "Configurações",
    href: "/settings",
    icon: Settings,
  },
]

interface SidebarProps {
  onClose?: () => void
}

export function Sidebar({ onClose }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside className="flex h-screen w-[280px] lg:w-64 flex-col bg-charcoal">
      {/* Logo */}
      <div className="flex h-16 lg:h-16 items-center justify-between border-b border-white/10 px-4 lg:px-6">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 lg:h-6 lg:w-6 rounded bg-white/10" />
          <div>
            <p className="text-lg lg:text-base font-semibold text-white">BrowStudio</p>
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
          {mainNavItems.map((item) => (
            <NavItem
              key={item.href}
              item={item}
              isActive={pathname === item.href}
            />
          ))}
        </div>

        {/* Management */}
        <div>
          <p className="mb-3 lg:mb-2 px-3 lg:px-2 text-sm lg:text-xs font-medium text-white/40">GESTÃO</p>
          <div className="space-y-1">
            {managementNavItems.map((item) => (
              <NavItem
                key={item.href}
                item={item}
                isActive={pathname === item.href}
              />
            ))}
          </div>
        </div>

        {/* System */}
        <div>
          <p className="mb-3 lg:mb-2 px-3 lg:px-2 text-sm lg:text-xs font-medium text-white/40">SISTEMA</p>
          <div className="space-y-1">
            {systemNavItems.map((item) => (
              <NavItem
                key={item.href}
                item={item}
                isActive={pathname === item.href}
              />
            ))}
          </div>
        </div>
      </nav>

      {/* Logout */}
      <button className="flex items-center gap-3 px-6 py-5 lg:py-4 text-base lg:text-sm text-white/60 transition-colors hover:text-white">
        <LogOut className="h-5 w-5 lg:h-4 lg:w-4" />
        Sair
      </button>
    </aside>
  )
}

interface NavItemProps {
  item: {
    title: string
    href: string
    icon: React.ComponentType<{ className?: string }>
  }
  isActive?: boolean
}

function NavItem({ item, isActive }: NavItemProps) {
  const Icon = item.icon

  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2.5 lg:gap-2 lg:px-2 lg:py-1.5 text-base lg:text-sm transition-colors",
        isActive
          ? "bg-white/10 text-white"
          : "text-white/60 hover:bg-white/5 hover:text-white"
      )}
    >
      <Icon className="h-5 w-5 lg:h-4 lg:w-4" />
      {item.title}
    </Link>
  )
} 