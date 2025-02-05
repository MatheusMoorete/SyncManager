import { Metadata } from "next"
import { AppLayout } from "@/components/layout/app-layout"

export const metadata: Metadata = {
  title: "Agenda | SyncManager",
  description: "Gerencie seus agendamentos de forma eficiente",
}

export default function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AppLayout>{children}</AppLayout>
} 