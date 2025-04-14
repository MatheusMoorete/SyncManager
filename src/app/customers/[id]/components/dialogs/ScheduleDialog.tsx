'use client'

import { useState } from 'react'
import { Calendar, Loader2 } from 'lucide-react'
import { Customer } from '@/types/customer'
import { AppointmentForm } from '@/components/agenda/appointment-form'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'

interface ScheduleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  customer: Customer
}

export function ScheduleDialog({ open, onOpenChange, customer }: ScheduleDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const handleSuccess = () => {
    setIsSubmitting(false)
    onOpenChange(false)

    // Redirecionar para a página de agendamentos
    router.push('/agenda')
  }

  // Prepara os dados iniciais para o formulário com o cliente pré-selecionado
  const initialData = {
    client_id: customer.id,
    client: {
      id: customer.id,
      full_name: customer.full_name,
      phone: customer.phone,
      email: customer.email,
    },
  }

  return (
    <Dialog
      open={open}
      onOpenChange={open => {
        if (isSubmitting) return // Impede fechamento durante envio
        onOpenChange(open)
      }}
    >
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle>Agendar Atendimento</DialogTitle>
              <DialogDescription>
                Agende um novo atendimento para {customer.full_name}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="mt-4">
          {/* Pré-selecione o cliente no formulário */}
          <AppointmentForm onSuccess={handleSuccess} initialData={initialData} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
