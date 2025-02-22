import { Metadata } from "next"
import { AppLayout } from "@/components/layout/app-layout"

export const metadata: Metadata = {
  title: "Serviços",
  description: "Gerencie os serviços oferecidos pelo seu estabelecimento",
}

export default function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AppLayout>{children}</AppLayout>
} 