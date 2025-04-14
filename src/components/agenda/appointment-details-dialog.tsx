import { useState } from 'react'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Loader2, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Appointment } from '@/types/schedule'
import { useScheduleStore } from '@/store/schedule-store'
import { useServiceStore } from '@/store/service-store'
import { cn } from '@/lib/utils'
import { Timestamp } from 'firebase/firestore'

interface AppointmentDetailsDialogProps {
  appointment: Appointment | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AppointmentDetailsDialog({
  appointment,
  open,
  onOpenChange,
}: AppointmentDetailsDialogProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setloading] = useState(false)
  const [showDeleteAlert, setShowDeleteAlert] = useState(false)
  const { actions: scheduleActions } = useScheduleStore()
  const { services } = useServiceStore()

  // Estados para campos editáveis
  const [editedData, setEditedData] = useState({
    date: '',
    time: '',
    service_id: '',
    notes: '',
    status: '',
  })

  if (!appointment) return null

  const statusMap = {
    scheduled: { label: 'Agendado', class: 'bg-blue-100 text-blue-800' },
    completed: { label: 'Concluído', class: 'bg-green-100 text-green-800' },
    canceled: { label: 'Cancelado', class: 'bg-rose-100 text-rose-800' },
    no_show: { label: 'Não Compareceu', class: 'bg-gray-100 text-gray-800' },
  }

  const handleEdit = () => {
    const scheduledDate = new Date(appointment.scheduled_time)
    setEditedData({
      date: format(scheduledDate, 'yyyy-MM-dd'),
      time: format(scheduledDate, 'HH:mm'),
      service_id: appointment.service_id,
      notes: appointment.notes || '',
      status: appointment.status,
    })
    setIsEditing(true)
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditedData({
      date: '',
      time: '',
      service_id: '',
      notes: '',
      status: '',
    })
  }

  const handleSave = async () => {
    try {
      setloading(true)

      // Se o status atual é completed e está mudando para outro status
      if (appointment.status === 'completed' && editedData.status !== 'completed') {
        const { useFinanceStore } = await import('@/store/finance-store')
        const financeStore = useFinanceStore.getState()

        // Buscar todas as transações
        await financeStore.actions.fetchTransactions()
        const transactions = financeStore.transactions

        // Encontrar a transação relacionada a este agendamento
        const relatedTransaction = transactions.find(t => t.appointmentId === appointment.id)

        // Se encontrou a transação, excluir
        if (relatedTransaction) {
          await financeStore.actions.deleteTransaction(relatedTransaction.id)
        }
      }

      const scheduledDate = new Date(`${editedData.date}T${editedData.time}`)
      const selectedService = services.find(s => s.id === editedData.service_id)

      if (!selectedService) {
        throw new Error('Serviço não encontrado')
      }

      await scheduleActions.updateAppointment(appointment.id, {
        client_id: appointment.client_id,
        service_id: editedData.service_id,
        scheduled_time: scheduledDate.toISOString(),
        final_price: selectedService.price,
        status: editedData.status as 'scheduled' | 'completed' | 'canceled' | 'no_show',
        actual_duration: appointment.actual_duration || undefined,
        notes: editedData.notes || undefined,
        discount: appointment.discount || undefined,
      })

      // Se o status for 'completed', criar uma transação financeira
      if (editedData.status === 'completed') {
        const { useFinanceStore } = await import('@/store/finance-store')
        const financeStore = useFinanceStore.getState()

        const transactionData = {
          type: 'income' as const,
          category: 'Serviços',
          amount: selectedService.price,
          paymentMethod: 'pix' as const,
          notes: `${selectedService.name} - ${appointment.client.full_name}`,
          transactionDate: Timestamp.fromDate(new Date(appointment.scheduled_time)),
          clientId: appointment.client_id,
          receiptUrl: null,
          appointmentId: appointment.id,
        }

        await financeStore.actions.addTransaction(transactionData)

        toast.success('Atendimento concluído e receita registrada com sucesso!')
      }

      setIsEditing(false)
      onOpenChange(false)
    } catch (error) {
      console.error('Error updating appointment:', error)
      toast.error('Erro ao atualizar agendamento')
    } finally {
      setloading(false)
    }
  }

  const handleDelete = async () => {
    try {
      setloading(true)
      await scheduleActions.deleteAppointment(appointment!.id)
      setShowDeleteAlert(false)
      onOpenChange(false)
    } catch (error) {
      console.error('Error deleting appointment:', error)
      toast.error('Erro ao excluir agendamento')
    } finally {
      setloading(false)
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Detalhes do Agendamento</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Status */}
            <div>
              <span className="text-sm font-medium text-muted-foreground">Status</span>
              {isEditing ? (
                <Select
                  value={editedData.status}
                  onValueChange={value => setEditedData(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scheduled">Agendado</SelectItem>
                    <SelectItem value="completed">Concluído</SelectItem>
                    <SelectItem value="canceled">Cancelado</SelectItem>
                    <SelectItem value="no_show">Não Compareceu</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <div className="mt-1">
                  <span
                    className={cn(
                      'px-3 py-1 rounded-full text-sm font-medium',
                      statusMap[appointment.status].class
                    )}
                  >
                    {statusMap[appointment.status].label}
                  </span>
                </div>
              )}
            </div>

            {/* Cliente */}
            <div>
              <span className="text-sm font-medium text-muted-foreground">Cliente</span>
              <h3 className="text-lg font-medium mt-1">{appointment.client.full_name}</h3>
              {appointment.client.phone && (
                <p className="text-sm text-muted-foreground mt-0.5">{appointment.client.phone}</p>
              )}
            </div>

            {/* Serviço */}
            <div>
              <span className="text-sm font-medium text-muted-foreground">Serviço</span>
              {isEditing ? (
                <Select
                  value={editedData.service_id}
                  onValueChange={value => setEditedData(prev => ({ ...prev, service_id: value }))}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Selecione o serviço" />
                  </SelectTrigger>
                  <SelectContent>
                    <ScrollArea className="max-h-[200px]">
                      {services.map(service => (
                        <SelectItem key={service.id} value={service.id!}>
                          {service.name}
                        </SelectItem>
                      ))}
                    </ScrollArea>
                  </SelectContent>
                </Select>
              ) : (
                <>
                  <h3 className="text-lg font-medium mt-1">{appointment.service.name}</h3>
                  <div className="flex items-center gap-3 mt-0.5 text-sm text-muted-foreground">
                    <p>
                      Duração:{' '}
                      {(() => {
                        const duration = appointment.actual_duration || appointment.service.duration
                        // Agora tratando corretamente como um número (em minutos)
                        const durationInMinutes = typeof duration === 'number' ? duration : 0
                        const hours = Math.floor(durationInMinutes / 60)
                        const minutes = durationInMinutes % 60

                        if (hours === 0) {
                          return `${minutes} minutos`
                        } else if (minutes === 0) {
                          return `${hours} ${hours === 1 ? 'hora' : 'horas'}`
                        } else {
                          return `${hours} ${hours === 1 ? 'hora' : 'horas'} e ${minutes} minutos`
                        }
                      })()}
                    </p>
                    <span>•</span>
                    <p>Valor: R$ {Number(appointment.final_price).toFixed(2)}</p>
                  </div>
                </>
              )}
            </div>

            {/* Data e Hora */}
            <div>
              <span className="text-sm font-medium text-muted-foreground">Data e Hora</span>
              {isEditing ? (
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <Input
                    type="date"
                    value={editedData.date}
                    onChange={e => setEditedData(prev => ({ ...prev, date: e.target.value }))}
                  />
                  <Input
                    type="time"
                    value={editedData.time}
                    onChange={e => setEditedData(prev => ({ ...prev, time: e.target.value }))}
                  />
                </div>
              ) : (
                <div className="mt-1">
                  <h3 className="text-lg font-medium">
                    {format(new Date(appointment.scheduled_time), "d 'de' MMMM 'de' yyyy", {
                      locale: ptBR,
                    })}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {format(new Date(appointment.scheduled_time), 'HH:mm')} -{' '}
                    {(() => {
                      const duration = appointment.actual_duration || appointment.service.duration
                      // Agora tratando corretamente como um número (em minutos)
                      const durationInMinutes = typeof duration === 'number' ? duration : 0
                      const endTime = new Date(
                        new Date(appointment.scheduled_time).getTime() + durationInMinutes * 60000
                      )
                      return format(endTime, 'HH:mm')
                    })()}
                  </p>
                </div>
              )}
            </div>

            {/* Observações */}
            {(isEditing || appointment.notes) && (
              <div>
                <span className="text-sm font-medium text-muted-foreground">Observações</span>
                {isEditing ? (
                  <Textarea
                    value={editedData.notes}
                    onChange={e => setEditedData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Adicione observações..."
                    className="mt-2"
                  />
                ) : (
                  appointment.notes && <p className="text-base mt-1">{appointment.notes}</p>
                )}
              </div>
            )}

            {/* Ações */}
            <div className="flex justify-end gap-2 pt-4 border-t">
              {isEditing ? (
                <>
                  <Button variant="outline" onClick={handleCancel} disabled={loading}>
                    Cancelar
                  </Button>
                  <Button onClick={handleSave} disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      'Salvar'
                    )}
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" onClick={() => onOpenChange(false)}>
                    Fechar
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => setShowDeleteAlert(true)}
                    disabled={loading}
                  >
                    Excluir
                  </Button>
                  <Button onClick={handleEdit}>Editar</Button>
                </>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Agendamento</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este agendamento? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDelete}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Excluindo...
                </>
              ) : (
                'Excluir'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
