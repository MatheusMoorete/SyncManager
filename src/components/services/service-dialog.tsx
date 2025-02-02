'use client'

import { ReactNode, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ServiceForm } from "./service-form"
import { ServiceFormValues } from "@/types/service"

interface ServiceDialogProps {
  trigger: ReactNode
  title?: string
  initialData?: ServiceFormValues
  onSubmit: (data: ServiceFormValues) => Promise<void>
  isLoading?: boolean
}

export function ServiceDialog({
  trigger,
  title = "Novo Serviço",
  initialData,
  onSubmit,
  isLoading
}: ServiceDialogProps) {
  const [open, setOpen] = useState(false)

  const handleSubmit = async (data: ServiceFormValues) => {
    try {
      await onSubmit(data)
      setOpen(false)
    } catch (error) {
      // Error is already handled by the store
      console.error('Error in service dialog:', error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-heading text-heading">{title}</DialogTitle>
          <p className="text-sm text-muted-foreground">
            {initialData ? "Atualize os dados do serviço" : "Adicione um novo serviço ao seu catálogo"}
          </p>
        </DialogHeader>
        <ServiceForm
          initialData={initialData}
          onSubmit={handleSubmit}
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  )
} 