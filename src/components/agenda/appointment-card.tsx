'use client'

import { Clock, Phone, User } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Appointment } from '@/types/schedule'
import { useScheduleStore } from '@/store/schedule-store'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { useState } from 'react'
import { AppointmentForm } from './appointment-form'

interface AppointmentCardProps {
  appointment: Appointment
}

export function AppointmentCard({ appointment }: AppointmentCardProps) {
  const { actions } = useScheduleStore()
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  const handleDelete = () => {
    toast.custom((t) => (
      <div className="p-4 bg-white rounded-lg shadow-lg border border-charcoal/10">
        <h3 className="font-medium text-heading mb-2">Confirmar exclusão</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Tem certeza que deseja excluir este agendamento?
        </p>
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.dismiss(t)}
            className="hover:bg-neutral-cream/50"
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={async () => {
              try {
                await actions.deleteAppointment(appointment.id)
                toast.success('Agendamento excluído com sucesso!')
                toast.dismiss(t)
              } catch (error) {
                console.error('Error deleting appointment:', error)
                toast.error('Erro ao excluir agendamento')
              }
            }}
            className="bg-error hover:bg-error/90 text-white"
          >
            Excluir
          </Button>
        </div>
      </div>
    ), {
      duration: Infinity,
    })
  }

  const handleStatusChange = async (status: 'scheduled' | 'completed' | 'canceled' | 'no_show') => {
    try {
      await actions.updateAppointment(appointment.id, {
        client_id: appointment.client_id,
        service_id: appointment.service_id,
        scheduled_time: appointment.scheduled_time,
        final_price: appointment.final_price,
        status,
        actual_duration: appointment.actual_duration || undefined,
        notes: appointment.notes || undefined,
        discount: appointment.discount || undefined
      })
      toast.success('Status atualizado com sucesso!')
    } catch (error) {
      console.error('Error updating appointment status:', error)
      toast.error('Erro ao atualizar status')
    }
  }

  const scheduledTime = parseISO(appointment.scheduled_time)

  return (
    <>
      <Card className="p-4 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between">
          <div className="space-y-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  {format(scheduledTime, 'HH:mm')}
                </span>
                <span className="text-sm text-muted-foreground">
                  ({appointment.actual_duration})
                </span>
              </div>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{appointment.client.full_name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{appointment.client.phone}</span>
              </div>
            </div>
            <div className={cn(
              'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
              {
                'bg-yellow-100 text-yellow-800': appointment.status === 'scheduled',
                'bg-green-100 text-green-800': appointment.status === 'completed',
                'bg-red-100 text-red-800': appointment.status === 'canceled',
                'bg-gray-100 text-gray-800': appointment.status === 'no_show'
              }
            )}>
              {appointment.status === 'scheduled' && 'Agendado'}
              {appointment.status === 'completed' && 'Concluído'}
              {appointment.status === 'canceled' && 'Cancelado'}
              {appointment.status === 'no_show' && 'Não Compareceu'}
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <span className="sr-only">Abrir menu</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  <circle cx="12" cy="12" r="1" />
                  <circle cx="12" cy="5" r="1" />
                  <circle cx="12" cy="19" r="1" />
                </svg>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusChange('scheduled')}>
                Marcar como Agendado
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusChange('completed')}>
                Marcar como Concluído
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusChange('canceled')}>
                Marcar como Cancelado
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusChange('no_show')}>
                Marcar como Não Compareceu
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Editar Agendamento</DialogTitle>
          </DialogHeader>
          <AppointmentForm appointment={appointment} onSuccess={() => setIsEditDialogOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  )
} 