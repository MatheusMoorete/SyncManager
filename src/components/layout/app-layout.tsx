'use client'

import { useState } from "react"
import { Header } from "./header"
import { Sidebar } from "./sidebar"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"
import { Toaster } from "@/components/ui/sonner"

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-charcoal/50 backdrop-blur-sm lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 lg:relative lg:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar onClose={() => setIsSidebarOpen(false)} />
      </div>

      {/* Main Content */}
      <div className="flex flex-1 flex-col">
        <Header
          user={{
            name: "Matheus Moorete",
            role: "Administrador",
          }}
          onMenuClick={() => setIsSidebarOpen(true)}
        />
        <main className="flex-1 overflow-y-auto bg-neutral-cream/50">
          {children}
        </main>
      </div>

      <Toaster />
    </div>
  )
} 