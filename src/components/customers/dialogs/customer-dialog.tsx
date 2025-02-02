import { ReactNode } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { CustomerForm } from "../forms/customer-form"
import { CustomerFormValues } from "@/types/customer"

export interface CustomerDialogProps {
  trigger: ReactNode
  title?: string
  initialData?: Partial<CustomerFormValues>
  onSubmit: (data: CustomerFormValues) => Promise<void>
  isLoading?: boolean
}

export function CustomerDialog({
  trigger,
  title = "Novo Cliente",
  initialData,
  onSubmit,
  isLoading
}: CustomerDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="font-heading text-heading">{title}</DialogTitle>
          <p className="text-sm text-muted-foreground">
            {initialData ? 'Edite os dados do cliente' : 'Adicione um novo cliente ao seu cadastro'}
          </p>
        </DialogHeader>
        <CustomerForm
          initialData={initialData}
          onSubmit={onSubmit}
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  )
} 