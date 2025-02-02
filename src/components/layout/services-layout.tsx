'use client'

import { AppLayout } from "@/components/layout/app-layout"

interface ServicesLayoutProps {
  children: React.ReactNode
}

export function ServicesLayout({ children }: ServicesLayoutProps) {
  return <AppLayout>{children}</AppLayout>
} 