'use client'

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"

interface HeaderProps {
  user: {
    name: string
    role: string
  }
  onMenuClick: () => void
}

export function Header({ user, onMenuClick }: HeaderProps) {
  const firstName = user.name.split(' ')[0]

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
          <h1 className="text-lg font-semibold text-charcoal">
            Bem-vindo, {firstName}!
          </h1>
          <p className="text-sm text-charcoal/60">
            Organize seus agendamentos e alcance seus objetivos
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-3 lg:gap-4">
        <div className="text-right">
          <p className="text-sm font-medium text-charcoal">{user.name}</p>
          <p className="text-xs text-charcoal/60">{user.role}</p>
        </div>
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-terracotta/10 text-terracotta">
            {user.name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  )
} 