'use client'

import { useState } from 'react'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { CalendarDays, Filter, ArrowUpDown, Search } from 'lucide-react'
import { Appointment } from '@/types/schedule'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AppointmentDetailsDialog } from '@/components/agenda/appointment-details-dialog'
import { EmptyState } from '@/components/ui/empty-state'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface CustomerHistoryProps {
  customerId: string
  appointments: Appointment[]
}

export function CustomerHistory({ customerId, appointments }: CustomerHistoryProps) {
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')

  // Filtra apenas os agendamentos deste cliente
  const customerAppointments = appointments.filter(app => app.client_id === customerId)

  // Aplicar filtro de status
  const filteredByStatus =
    statusFilter === 'all'
      ? customerAppointments
      : customerAppointments.filter(app => app.status === statusFilter)

  // Aplicar filtro de pesquisa
  const filteredAppointments = searchTerm
    ? filteredByStatus.filter(
        app =>
          app.service?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          app.notes?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : filteredByStatus

  // Ordenar por data
  const sortedAppointments = [...filteredAppointments].sort((a, b) => {
    const dateA = new Date(a.scheduled_time).getTime()
    const dateB = new Date(b.scheduled_time).getTime()
    return sortOrder === 'desc' ? dateB - dateA : dateA - dateB
  })

  // Map de status para exibição
  const statusMap = {
    scheduled: { label: 'Agendado', class: 'bg-blue-100 text-blue-800' },
    completed: { label: 'Concluído', class: 'bg-green-100 text-green-800' },
    canceled: { label: 'Cancelado', class: 'bg-rose-100 text-rose-800' },
    no_show: { label: 'Não Compareceu', class: 'bg-gray-100 text-gray-800' },
  }

  const handleSort = () => {
    setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')
  }

  const handleAppointmentClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment)
    setIsDialogOpen(true)
  }

  // Calcular estatísticas
  const totalAppointments = customerAppointments.length
  const completedAppointments = customerAppointments.filter(
    app => app.status === 'completed'
  ).length
  const canceledAppointments = customerAppointments.filter(app => app.status === 'canceled').length
  const noShowAppointments = customerAppointments.filter(app => app.status === 'no_show').length
  const upcomingAppointments = customerAppointments.filter(app => app.status === 'scheduled').length

  return (
    <div className="space-y-6">
      {/* Resumo de atendimentos */}
      <Card className="bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-medium">Resumo de Atendimentos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
            <div className="p-3 rounded-md bg-muted/40">
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-xl font-medium">{totalAppointments}</p>
            </div>
            <div className="p-3 rounded-md bg-blue-50">
              <p className="text-sm text-blue-600">Agendados</p>
              <p className="text-xl font-medium text-blue-700">{upcomingAppointments}</p>
            </div>
            <div className="p-3 rounded-md bg-green-50">
              <p className="text-sm text-green-600">Concluídos</p>
              <p className="text-xl font-medium text-green-700">{completedAppointments}</p>
            </div>
            <div className="p-3 rounded-md bg-rose-50">
              <p className="text-sm text-rose-600">Cancelados</p>
              <p className="text-xl font-medium text-rose-700">{canceledAppointments}</p>
            </div>
            <div className="p-3 rounded-md bg-gray-50">
              <p className="text-sm text-gray-600">Não Compareceu</p>
              <p className="text-xl font-medium text-gray-700">{noShowAppointments}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filtros e histórico de atendimentos */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-4">
          <CardTitle className="text-lg font-medium">Histórico de Atendimentos</CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleSort}>
              <ArrowUpDown className="h-4 w-4 mr-1" />
              {sortOrder === 'desc' ? 'Mais recentes' : 'Mais antigos'}
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-4 pt-0">
          {/* Filtros */}
          <div className="flex flex-col md:flex-row gap-3 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Buscar por serviço ou observações..."
                className="pl-8"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="scheduled">Agendados</SelectItem>
                <SelectItem value="completed">Concluídos</SelectItem>
                <SelectItem value="canceled">Cancelados</SelectItem>
                <SelectItem value="no_show">Não Compareceu</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Lista de atendimentos */}
          {sortedAppointments.length > 0 ? (
            <div className="space-y-3">
              {sortedAppointments.map(appointment => (
                <div
                  key={appointment.id}
                  className="flex items-center justify-between p-3 rounded-md hover:bg-accent/50 cursor-pointer transition-colors"
                  onClick={() => handleAppointmentClick(appointment)}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <CalendarDays className="h-5 w-5 text-primary" />
                    </div>

                    <div>
                      <p className="font-medium">
                        {appointment.service?.name || 'Serviço não especificado'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {format(
                          new Date(appointment.scheduled_time),
                          "d 'de' MMMM 'de' yyyy, HH:mm",
                          { locale: ptBR }
                        )}
                      </p>
                      {appointment.notes && (
                        <p className="text-xs text-muted-foreground mt-1 max-w-[250px] truncate">
                          <span className="font-medium">Obs:</span> {appointment.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge
                      variant="outline"
                      className={
                        statusMap[appointment.status]?.class || 'bg-gray-100 text-gray-800'
                      }
                    >
                      {statusMap[appointment.status]?.label || appointment.status}
                    </Badge>

                    <p className="font-medium">
                      {appointment.final_price
                        ? `R$ ${Number(appointment.final_price).toFixed(2).replace('.', ',')}`
                        : '—'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title={
                searchTerm || statusFilter !== 'all'
                  ? 'Nenhum atendimento encontrado com os filtros atuais'
                  : 'Nenhum atendimento encontrado'
              }
              description={
                searchTerm || statusFilter !== 'all'
                  ? 'Tente mudar os filtros para ver mais resultados'
                  : 'Este cliente ainda não possui atendimentos registrados.'
              }
              icon="appointments"
            />
          )}
        </CardContent>
      </Card>

      {/* Diálogo de detalhes do agendamento */}
      {selectedAppointment && (
        <AppointmentDetailsDialog
          appointment={selectedAppointment}
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
        />
      )}
    </div>
  )
}
