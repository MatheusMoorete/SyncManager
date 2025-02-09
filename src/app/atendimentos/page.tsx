'use client'

/**
 * @component AtendimentosPage
 * @description Página principal de gerenciamento de atendimentos com suporte a filtros, busca e atualização de status
 *
 * @features
 * - Filtros por período (hoje, semana, mês)
 * - Busca por cliente ou serviço
 * - Atualização de status com diálogo de conclusão
 * - Visualização em lista com scroll infinito
 * - Responsivo mobile-first
 *
 * @example
 * // Rota: /atendimentos
 * <AtendimentosPage />
 */

import { useEffect, useState } from 'react'
import { format, parseISO, startOfMonth, endOfMonth } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useScheduleStore } from '@/store/schedule-store'
import { useServiceStore } from '@/store/service-store'
import { AppLayout } from '@/components/layout/app-layout'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Search, Calendar, ChevronDown, Loader2, Filter } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { Timestamp } from 'firebase/firestore'

/** Status possíveis para um atendimento */
type AppointmentStatus = 'scheduled' | 'completed' | 'canceled' | 'no_show'
/** Status possíveis para filtro, incluindo 'all' */
type FilterStatus = AppointmentStatus | 'all'

/**
 * @interface CompletionDialogData
 * @description Dados necessários para o diálogo de conclusão de atendimento
 */
interface CompletionDialogData {
  appointmentId: string
  serviceName: string
  basePrice: number
  clientName: string
}

export default function AtendimentosPage() {
  const { appointments, isLoading, actions } = useScheduleStore()
  const { actions: serviceActions } = useServiceStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all')
  const [startDate, setStartDate] = useState<string>(format(startOfMonth(new Date()), 'yyyy-MM-dd'))
  const [endDate, setEndDate] = useState<string>(format(endOfMonth(new Date()), 'yyyy-MM-dd'))
  const [showFilters, setShowFilters] = useState(false)
  const [completionDialog, setCompletionDialog] = useState<CompletionDialogData | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [completionData, setCompletionData] = useState({
    duration: '',
    finalPrice: '',
    notes: '',
  })

  useEffect(() => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    end.setHours(23, 59, 59, 999)

    actions.updateFilters({
      search: searchTerm,
      startDate: start,
      endDate: end,
      status: statusFilter !== 'all' ? statusFilter : undefined,
    })
    actions.fetchAppointments()
  }, [actions, searchTerm, statusFilter, startDate, endDate])

  /**
   * @function handleStatusChange
   * @description Gerencia a mudança de status de um atendimento
   * @param appointmentId ID do atendimento
   * @param newStatus Novo status a ser aplicado
   */
  const handleStatusChange = async (appointmentId: string, newStatus: AppointmentStatus) => {
    const appointment = appointments.find(a => a.id === appointmentId)
    if (!appointment) return

    if (newStatus === 'completed') {
      // Abrir diálogo de conclusão
      setCompletionDialog({
        appointmentId,
        serviceName: appointment.service.name,
        basePrice: appointment.service.base_price,
        clientName: appointment.client.full_name,
      })
      setCompletionData({
        duration: appointment.service.duration,
        finalPrice: appointment.service.base_price.toString(),
        notes: appointment.notes || '',
      })
      return
    }

    await updateAppointmentStatus(appointmentId, newStatus)
  }

  /**
   * @function updateAppointmentStatus
   * @description Atualiza o status de um atendimento no banco de dados
   * @param appointmentId ID do atendimento
   * @param status Novo status
   * @param completionData Dados adicionais para conclusão (opcional)
   */
  const updateAppointmentStatus = async (
    appointmentId: string,
    status: AppointmentStatus,
    completionData?: {
      duration: string
      finalPrice: number
      notes: string
    }
  ) => {
    const appointment = appointments.find(a => a.id === appointmentId)
    if (!appointment) return

    try {
      setIsSaving(true)

      // Criar objeto base de atualização
      const updateData: any = {
        client_id: appointment.client_id,
        service_id: appointment.service_id,
        scheduled_time: appointment.scheduled_time,
        final_price: completionData?.finalPrice || appointment.final_price,
        status,
      }

      // Adicionar campos opcionais apenas se tiverem valor
      if (completionData?.duration) {
        updateData.actual_duration = completionData.duration
      }
      if (completionData?.notes) {
        updateData.notes = completionData.notes
      }
      if (appointment.discount) {
        updateData.discount = appointment.discount
      }

      await actions.updateAppointment(appointmentId, updateData)

      // Se o status for 'completed', criar uma transação financeira
      if (status === 'completed') {
        const { useFinanceStore } = await import('@/store/finance-store')
        const financeStore = useFinanceStore.getState()

        await financeStore.actions.addTransaction({
          type: 'income',
          category: 'Serviços',
          amount: completionData?.finalPrice || appointment.final_price,
          paymentMethod: 'pix',
          transactionDate: Timestamp.fromDate(new Date()),
          notes: `Atendimento: ${appointment.service.name} - Cliente: ${appointment.client.full_name}`,
          clientId: appointment.client_id,
          receiptUrl: null,
        })

        toast.success('Atendimento concluído com sucesso!')
      } else {
        toast.success('Status do atendimento atualizado!')
      }
    } catch (error) {
      console.error('Error updating appointment:', error)
      toast.error('Erro ao atualizar atendimento')
    } finally {
      setIsSaving(false)
      setCompletionDialog(null)
    }
  }

  /**
   * @function handleCompleteAppointment
   * @description Valida e processa a conclusão de um atendimento
   */
  const handleCompleteAppointment = async () => {
    if (!completionDialog) return

    const finalPrice = parseFloat(completionData.finalPrice)
    if (isNaN(finalPrice) || finalPrice < 0) {
      toast.error('Valor inválido')
      return
    }

    // Converter minutos para o formato HH:mm:ss
    const minutes = parseInt(completionData.duration)
    if (isNaN(minutes)) {
      toast.error('Duração inválida')
      return
    }

    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    const formattedDuration = `${hours.toString().padStart(2, '0')}:${remainingMinutes
      .toString()
      .padStart(2, '0')}:00`

    await updateAppointmentStatus(completionDialog.appointmentId, 'completed', {
      duration: formattedDuration,
      finalPrice,
      notes: completionData.notes,
    })
  }

  const statusMap = {
    scheduled: { label: 'Agendado', class: 'bg-blue-100 text-blue-800' },
    completed: { label: 'Concluído', class: 'bg-green-100 text-green-800' },
    canceled: { label: 'Cancelado', class: 'bg-rose-100 text-rose-800' },
    no_show: { label: 'Não Compareceu', class: 'bg-gray-100 text-gray-800' },
  }

  /**
   * @function handleFilterPeriod
   * @description Atualiza os filtros de data baseado no período selecionado
   * @param period Período desejado ('today' | 'week' | 'month' | 'all')
   */
  const handleFilterPeriod = (period: 'today' | 'week' | 'month' | 'all') => {
    const today = new Date()

    switch (period) {
      case 'today':
        setStartDate(format(today, 'yyyy-MM-dd'))
        setEndDate(format(today, 'yyyy-MM-dd'))
        break
      case 'week':
        const weekStart = new Date(today)
        weekStart.setDate(today.getDate() - today.getDay())
        const weekEnd = new Date(today)
        weekEnd.setDate(weekStart.getDate() + 6)
        setStartDate(format(weekStart, 'yyyy-MM-dd'))
        setEndDate(format(weekEnd, 'yyyy-MM-dd'))
        break
      case 'month':
        setStartDate(format(startOfMonth(today), 'yyyy-MM-dd'))
        setEndDate(format(endOfMonth(today), 'yyyy-MM-dd'))
        break
      case 'all':
        // Definir um período amplo, por exemplo, último ano
        const yearStart = new Date(today)
        yearStart.setFullYear(today.getFullYear() - 1)
        setStartDate(format(yearStart, 'yyyy-MM-dd'))
        setEndDate(format(today, 'yyyy-MM-dd'))
        break
    }
  }

  return (
    <AppLayout>
      <div className="flex-1 space-y-4 p-4">
        {/* Header com Busca Integrada */}
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div>
            <h2 className="text-2xl font-semibold">Atendimentos</h2>
            <p className="text-sm text-muted-foreground">
              Gerencie os atendimentos e acompanhe o histórico dos clientes
            </p>
          </div>

          <div className="relative w-full md:w-[300px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por cliente ou serviço..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Filtros Rápidos */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleFilterPeriod('today')}
              className={cn(
                startDate === format(new Date(), 'yyyy-MM-dd') &&
                  endDate === format(new Date(), 'yyyy-MM-dd') &&
                  'bg-primary text-primary-foreground hover:bg-primary/90'
              )}
            >
              Hoje
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleFilterPeriod('week')}>
              Esta Semana
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleFilterPeriod('month')}>
              Este Mês
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleFilterPeriod('all')}>
              Todos
            </Button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filtros Avançados
            <ChevronDown
              className={cn('h-4 w-4 transition-transform', showFilters && 'transform rotate-180')}
            />
          </Button>
        </div>

        {/* Filtros Avançados */}
        <Card className={cn('p-4 space-y-4', !showFilters && 'hidden')}>
          <div className="grid gap-4 md:grid-cols-3">
            <Select
              value={statusFilter}
              onValueChange={(value: FilterStatus) => setStatusFilter(value)}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="scheduled">Agendado</SelectItem>
                <SelectItem value="completed">Concluído</SelectItem>
                <SelectItem value="canceled">Cancelado</SelectItem>
                <SelectItem value="no_show">Não Compareceu</SelectItem>
              </SelectContent>
            </Select>

            <div className="space-y-2">
              <label className="text-sm font-medium">Data Inicial</label>
              <Input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Data Final</label>
              <Input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="w-full"
              />
            </div>
          </div>
        </Card>

        {/* Lista de Atendimentos */}
        <Card className="p-4">
          <ScrollArea className="h-[calc(100vh-280px)]">
            <div className="space-y-4">
              {appointments.map(appointment => (
                <Card key={appointment.id} className="p-4">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {format(parseISO(appointment.scheduled_time), "PPP 'às' HH:mm", {
                              locale: ptBR,
                            })}
                          </span>
                        </div>
                        <div className="flex flex-col md:flex-row md:items-center md:gap-2">
                          <span className="text-sm font-medium">
                            {appointment.client.full_name}
                          </span>
                          {appointment.client.phone && (
                            <>
                              <span className="hidden md:inline text-sm text-muted-foreground">
                                •
                              </span>
                              <span className="text-sm">{appointment.client.phone}</span>
                            </>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{appointment.service.name}</span>
                          <span className="text-sm text-muted-foreground">•</span>
                          <span className="text-sm">
                            R$ {Number(appointment.final_price).toFixed(2)}
                          </span>
                        </div>
                        {appointment.notes && (
                          <div className="text-sm text-muted-foreground">{appointment.notes}</div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col md:flex-row items-start md:items-center gap-2">
                      <div
                        className={cn(
                          'px-2.5 py-0.5 rounded-full text-xs font-semibold',
                          statusMap[appointment.status].class
                        )}
                      >
                        {statusMap[appointment.status].label}
                      </div>
                      <Select
                        value={appointment.status}
                        disabled={isSaving}
                        onValueChange={(value: AppointmentStatus) =>
                          handleStatusChange(appointment.id, value)
                        }
                      >
                        <SelectTrigger className="w-[140px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="scheduled">Agendado</SelectItem>
                          <SelectItem value="completed">Concluído</SelectItem>
                          <SelectItem value="canceled">Cancelado</SelectItem>
                          <SelectItem value="no_show">Não Compareceu</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </Card>
              ))}

              {appointments.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhum atendimento encontrado
                </div>
              )}
            </div>
          </ScrollArea>
        </Card>

        {/* Diálogo de Conclusão */}
        <Dialog open={!!completionDialog} onOpenChange={() => setCompletionDialog(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Concluir Atendimento</DialogTitle>
              <DialogDescription>
                Preencha os detalhes para concluir o atendimento
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {completionDialog && (
                <>
                  <div className="space-y-2">
                    <h3 className="font-medium">{completionDialog.serviceName}</h3>
                    <p className="text-sm text-muted-foreground">
                      Cliente: {completionDialog.clientName}
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Duração</label>
                      <Input
                        type="number"
                        placeholder="Duração em minutos"
                        value={completionData.duration}
                        onChange={e =>
                          setCompletionData(prev => ({ ...prev, duration: e.target.value }))
                        }
                      />
                      <p className="text-xs text-muted-foreground">Digite a duração em minutos</p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Valor Cobrado</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                          R$
                        </span>
                        <Input
                          type="number"
                          className="pl-8"
                          placeholder="0,00"
                          value={completionData.finalPrice}
                          onChange={e =>
                            setCompletionData(prev => ({ ...prev, finalPrice: e.target.value }))
                          }
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Valor base: R$ {Number(completionDialog.basePrice).toFixed(2)}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Observações</label>
                      <Textarea
                        placeholder="Adicione observações sobre o atendimento..."
                        value={completionData.notes}
                        onChange={e =>
                          setCompletionData(prev => ({ ...prev, notes: e.target.value }))
                        }
                      />
                    </div>
                  </div>
                </>
              )}
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setCompletionDialog(null)}
                disabled={isSaving}
              >
                Cancelar
              </Button>
              <Button onClick={handleCompleteAppointment} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  'Concluir Atendimento'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  )
}
