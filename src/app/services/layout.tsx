import { Metadata } from "next"
import { ServicesLayout } from "@/components/layout/services-layout"

export const metadata: Metadata = {
  title: "Serviços",
  description: "Gerencie os serviços oferecidos pelo seu estabelecimento",
}

export default function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return <ServicesLayout>{children}</ServicesLayout>
} 