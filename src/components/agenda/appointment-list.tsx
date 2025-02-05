'use client'

import { useCallback, useMemo } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Plus } from 'lucide-react'
import { useScheduleStore } from '@/store/schedule-store'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { AppointmentCard } from './appointment-card'

export function AppointmentList() {
  const { selectedDate, appointments, filters, actions } = useScheduleStore()

  const handleSearch = useCallback((value: string) => {
    actions.updateFilters({ search: value })
    actions.fetchAppointments()
  }, [actions])

  const formattedDate = useMemo(() => {
    return format(selectedDate, "EEEE, d 'de' MMMM", { locale: ptBR })
  }, [selectedDate])

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="space-y-1">
          <h3 className="font-semibold">Agendamentos</h3>
          <p className="text-sm text-muted-foreground capitalize">
            {formattedDate}
          </p>
        </div>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Novo Agendamento
        </Button>
      </div>

      <div className="space-y-4">
        <Input
          placeholder="Buscar agendamentos..."
          value={filters.search}
          onChange={(e) => handleSearch(e.target.value)}
        />

        <ScrollArea className="h-[calc(100vh-20rem)]">
          <div className="space-y-4">
            {appointments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <p className="text-sm text-muted-foreground">
                  Nenhum agendamento encontrado para esta data.
                </p>
              </div>
            ) : (
              appointments.map((appointment) => (
                <AppointmentCard
                  key={appointment.id}
                  appointment={appointment}
                />
              ))
            )}
          </div>
        </ScrollArea>
      </div>
    </Card>
  )
} 