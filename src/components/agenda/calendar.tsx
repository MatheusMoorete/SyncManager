'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react'
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  startOfWeek,
  endOfWeek,
  addWeeks,
  subWeeks,
  eachHourOfInterval,
  startOfDay,
  endOfDay,
  addDays,
  subDays,
  isSameDay,
} from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useScheduleStore } from '@/store/schedule-store'
import { Appointment } from '@/types/schedule'
import { AppointmentDetailsDialog } from './appointment-details-dialog'
import { DayEventsDialog } from './day-events-dialog'
import { useBusinessHoursStore } from '@/store/business-hours-store'
import { BusinessHoursDialog } from './business-hours-dialog'

interface CalendarProps {
  className?: string
}

const WEEKDAYS = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB']
const WEEKDAYS_LONG = ['DOMINGO', 'SEGUNDA', 'TERÇA', 'QUARTA', 'QUINTA', 'SEXTA', 'SÁBADO']

export function Calendar({ className }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState<'month' | 'week' | 'day'>('month')
  const [isMobile, setIsMobile] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [selectedDayEvents, setSelectedDayEvents] = useState<{
    date: Date
    appointments: Appointment[]
  } | null>(null)
  const [isDayEventsOpen, setIsDayEventsOpen] = useState(false)
  const { appointments, actions } = useScheduleStore()
  const { config: businessHours } = useBusinessHoursStore()
  const [isBusinessHoursOpen, setIsBusinessHoursOpen] = useState(false)

  // Detectar se é mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768) // 768px é o breakpoint md do Tailwind
      if (window.innerWidth < 768) {
        setView('day')
      }
    }

    checkIfMobile()
    window.addEventListener('resize', checkIfMobile)
    return () => window.removeEventListener('resize', checkIfMobile)
  }, [])

  // Efeito para buscar agendamentos ao mudar o mês/semana
  useEffect(() => {
    let start, end
    if (view === 'month') {
      start = startOfMonth(currentDate)
      end = endOfMonth(currentDate)
    } else if (view === 'week') {
      start = startOfWeek(currentDate, { locale: ptBR })
      end = endOfWeek(currentDate, { locale: ptBR })
    } else {
      start = startOfDay(currentDate)
      end = endOfDay(currentDate)
    }
    actions.updateFilters({ startDate: start, endDate: end })
    actions.fetchAppointments()
  }, [currentDate, view, actions])

  // Carregar configurações ao montar o componente
  useEffect(() => {
    const { actions } = useBusinessHoursStore.getState()
    actions.fetchConfig()
  }, [])

  // Navegação
  const handlePrevious = () => {
    if (view === 'month') {
      setCurrentDate(subMonths(currentDate, 1))
    } else if (view === 'week') {
      setCurrentDate(subWeeks(currentDate, 1))
    } else {
      setCurrentDate(subDays(currentDate, 1))
    }
  }

  const handleNext = () => {
    if (view === 'month') {
      setCurrentDate(addMonths(currentDate, 1))
    } else if (view === 'week') {
      setCurrentDate(addWeeks(currentDate, 1))
    } else {
      setCurrentDate(addDays(currentDate, 1))
    }
  }

  const handleToday = () => setCurrentDate(new Date())

  // Gerar dias do mês/semana
  const getDays = () => {
    if (view === 'month') {
      const start = startOfWeek(startOfMonth(currentDate), { locale: ptBR })
      const end = endOfWeek(endOfMonth(currentDate), { locale: ptBR })
      return eachDayOfInterval({ start, end })
    } else if (view === 'week') {
      const start = startOfWeek(currentDate, { locale: ptBR })
      const end = endOfWeek(currentDate, { locale: ptBR })
      return eachDayOfInterval({ start, end })
    }
    return [currentDate]
  }

  const days = getDays()

  // Gerar horários para visualização semanal
  const getHours = () => {
    if (!businessHours) return []

    const [startHour] = businessHours.starttime.split(':').map(Number)
    const [endHour] = businessHours.endtime.split(':').map(Number)

    const start = new Date().setHours(startHour, 0, 0, 0)
    const end = new Date().setHours(endHour, 0, 0, 0)

    return eachHourOfInterval({ start: new Date(start), end: new Date(end) })
  }

  // Verificar se o dia atual é um dia de folga
  const isDayOff = (date: Date) => {
    if (!businessHours) return false
    return businessHours.daysoff.includes(date.getDay())
  }

  // Verificar se o horário está dentro do intervalo de almoço
  const isLunchBreak = (hour: number) => {
    if (!businessHours?.lunchbreak) return false

    const [startHour] = businessHours.lunchbreak.start.split(':').map(Number)
    const [endHour] = businessHours.lunchbreak.end.split(':').map(Number)

    return hour >= startHour && hour < endHour
  }

  // Agrupar agendamentos por dia e hora
  const getAppointmentsForDayAndHour = (date: Date, hour: number): Appointment[] => {
    return appointments.filter(appointment => {
      const appointmentDate = new Date(appointment.scheduled_time)
      return isSameDay(appointmentDate, date) && appointmentDate.getHours() === hour
    })
  }

  // Formatar título do período
  const formatPeriodTitle = () => {
    if (view === 'month') {
      return format(currentDate, 'MMMM yyyy', { locale: ptBR })
    } else if (view === 'week') {
      const start = startOfWeek(currentDate, { locale: ptBR })
      const end = endOfWeek(currentDate, { locale: ptBR })
      return `${format(start, 'd')} - ${format(end, "d 'de' MMMM yyyy", { locale: ptBR })}`
    }
    return format(currentDate, "d 'de' MMMM yyyy", { locale: ptBR })
  }

  const handleAppointmentClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment)
    setIsDetailsOpen(true)
  }

  const handleDayEventsClick = (date: Date, dayAppointments: Appointment[]) => {
    setSelectedDayEvents({ date, appointments: dayAppointments })
    setIsDayEventsOpen(true)
  }

  return (
    <Card className={cn('p-2 md:p-4', className)}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleToday}>
            Hoje
          </Button>
          <Button variant="outline" size="sm" onClick={() => setIsBusinessHoursOpen(true)}>
            <Clock className="h-4 w-4 mr-2" />
            Horário de Expediente
          </Button>
        </div>

        <h2 className="text-lg font-semibold capitalize order-first md:order-none">
          {formatPeriodTitle()}
        </h2>

        <div className="flex items-center gap-2">
          {/* Esconder os botões de visualização em mobile */}
          <div className="hidden md:flex items-center rounded-md border">
            <Button
              variant="ghost"
              size="sm"
              className={cn('rounded-none border-r px-2 md:px-3', view === 'month' && 'bg-accent')}
              onClick={() => setView('month')}
            >
              Mês
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={cn('rounded-none border-r px-2 md:px-3', view === 'week' && 'bg-accent')}
              onClick={() => setView('week')}
            >
              Semana
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={cn('rounded-none px-2 md:px-3', view === 'day' && 'bg-accent')}
              onClick={() => setView('day')}
            >
              Dia
            </Button>
          </div>

          <div className="flex items-center space-x-1">
            <Button variant="outline" size="icon" onClick={handlePrevious}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={handleNext}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Em mobile, sempre mostrar a visão diária */}
      {isMobile ? (
        // Visualização diária para mobile
        <div className="rounded-lg border overflow-hidden">
          {/* Cabeçalho do dia */}
          <div className="grid grid-cols-[80px_1fr] border-b">
            <div className="p-2 border-r bg-background" />
            <div
              className={cn(
                'p-2 text-center bg-background',
                isToday(currentDate) && 'bg-accent/10'
              )}
            >
              <div className="font-medium text-base">{WEEKDAYS_LONG[currentDate.getDay()]}</div>
              <div className="text-sm text-muted-foreground">
                {format(currentDate, "d 'de' MMMM", { locale: ptBR })}
              </div>
            </div>
          </div>

          {/* Grid de horários */}
          <div className="grid grid-cols-[80px_1fr]">
            {/* Coluna de horários */}
            <div className="border-r">
              {getHours().map(hour => {
                const hourNumber = hour.getHours()
                const isBreak = isLunchBreak(hourNumber)

                return (
                  <div
                    key={hour.toString()}
                    className={cn(
                      'h-16 border-b p-2 text-xs text-muted-foreground',
                      isBreak && 'bg-gray-50'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span>{format(hour, 'HH:mm')}</span>
                      {isBreak && <span className="text-[10px] text-muted-foreground">Almoço</span>}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Coluna de eventos */}
            <div className="relative">
              {getHours().map(hour => {
                const appointments = getAppointmentsForDayAndHour(currentDate, hour.getHours())
                return (
                  <div key={hour.toString()} className="h-16 border-b p-1">
                    {appointments.map(appointment => (
                      <div
                        key={appointment.id}
                        onClick={() => handleAppointmentClick(appointment)}
                        className={cn(
                          'text-xs p-1.5 mb-1 rounded-sm cursor-pointer hover:opacity-80',
                          {
                            'bg-blue-100 text-blue-800': appointment.status === 'scheduled',
                            'bg-green-100 text-green-800': appointment.status === 'completed',
                            'bg-rose-100 text-rose-800': appointment.status === 'canceled',
                            'bg-gray-100 text-gray-800': appointment.status === 'no_show',
                          }
                        )}
                      >
                        <div className="font-medium truncate">
                          {format(new Date(appointment.scheduled_time), 'HH:mm')} -{' '}
                          {appointment.client.full_name}
                        </div>
                        <div className="text-[10px] truncate">{appointment.service.name}</div>
                      </div>
                    ))}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      ) : // Visualizações normais para desktop
      view === 'month' ? (
        // Visualização mensal
        <div className="grid grid-cols-7 gap-[1px] bg-muted rounded-lg overflow-hidden">
          {/* Weekday headers */}
          {WEEKDAYS.map(day => (
            <div
              key={day}
              className="bg-background p-1.5 md:p-2 text-center text-[11px] md:text-sm font-medium"
            >
              {day}
            </div>
          ))}

          {/* Calendar days */}
          {days.map(date => {
            const dayAppointments = appointments.filter(appointment =>
              isSameDay(new Date(appointment.scheduled_time), date)
            )
            const isCurrentMonth = isSameMonth(date, currentDate)
            const isCurrentDay = isToday(date)

            return (
              <div
                key={date.toISOString()}
                className={cn(
                  'min-h-[90px] md:min-h-[120px] p-1 md:p-2 bg-background transition-colors',
                  !isCurrentMonth && 'text-muted-foreground/40',
                  isCurrentDay && 'bg-accent/10'
                )}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={cn('text-xs md:text-sm', isCurrentDay && 'font-bold')}>
                    {format(date, 'd')}
                  </span>
                  {dayAppointments.length > 0 && (
                    <span className="text-[9px] md:text-xs text-muted-foreground">
                      {dayAppointments.length} eventos
                    </span>
                  )}
                </div>

                <div className="space-y-[2px]">
                  {dayAppointments.slice(0, 2).map(appointment => (
                    <div
                      key={appointment.id}
                      onClick={() => handleAppointmentClick(appointment)}
                      className={cn(
                        'text-[9px] md:text-xs py-0.5 px-1 rounded-sm truncate cursor-pointer hover:opacity-80',
                        {
                          'bg-blue-100 text-blue-800': appointment.status === 'scheduled',
                          'bg-green-100 text-green-800': appointment.status === 'completed',
                          'bg-rose-100 text-rose-800': appointment.status === 'canceled',
                          'bg-gray-100 text-gray-800': appointment.status === 'no_show',
                        }
                      )}
                    >
                      <div className="flex items-center gap-0.5">
                        <span className="font-medium whitespace-nowrap">
                          {format(new Date(appointment.scheduled_time), 'HH:mm')}
                        </span>
                        <span className="truncate">- {appointment.client.full_name}</span>
                      </div>
                    </div>
                  ))}
                  {dayAppointments.length > 2 && (
                    <div
                      className="text-[9px] md:text-xs text-blue-500 cursor-pointer hover:text-blue-600 pl-1"
                      onClick={() => handleDayEventsClick(date, dayAppointments)}
                    >
                      +{dayAppointments.length - 2} mais
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ) : view === 'week' ? (
        // Visualização semanal
        <div className="rounded-lg border overflow-hidden">
          {/* Cabeçalho dos dias da semana */}
          <div className="grid grid-cols-8 border-b">
            <div className="p-2 border-r bg-background" />
            {days.map(date => (
              <div
                key={date.toISOString()}
                className={cn('p-2 text-center bg-background', isToday(date) && 'bg-accent/10')}
              >
                <div className="font-medium text-sm">{WEEKDAYS_LONG[date.getDay()]}</div>
                <div className={cn('text-sm', isToday(date) && 'font-bold text-primary')}>
                  {format(date, 'd')}
                </div>
              </div>
            ))}
          </div>

          {/* Grid de horários */}
          <div className="grid grid-cols-8">
            {/* Coluna de horários */}
            <div className="border-r">
              {getHours().map(hour => {
                const hourNumber = hour.getHours()
                const isBreak = isLunchBreak(hourNumber)

                return (
                  <div
                    key={hour.toString()}
                    className={cn(
                      'h-20 border-b p-2 text-sm text-muted-foreground',
                      isBreak && 'bg-gray-50'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span>{format(hour, 'HH:mm')}</span>
                      {isBreak && <span className="text-[10px] text-muted-foreground">Almoço</span>}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Colunas dos dias */}
            {days.map(date => (
              <div key={date.toISOString()} className="relative">
                {getHours().map(hour => {
                  const appointments = getAppointmentsForDayAndHour(date, hour.getHours())
                  return (
                    <div key={hour.toString()} className="h-20 border-b border-r p-1">
                      {appointments.map(appointment => (
                        <div
                          key={appointment.id}
                          onClick={() => handleAppointmentClick(appointment)}
                          className={cn(
                            'text-xs p-1.5 mb-1 rounded-sm cursor-pointer hover:opacity-80',
                            {
                              'bg-blue-100 text-blue-800': appointment.status === 'scheduled',
                              'bg-green-100 text-green-800': appointment.status === 'completed',
                              'bg-rose-100 text-rose-800': appointment.status === 'canceled',
                              'bg-gray-100 text-gray-800': appointment.status === 'no_show',
                            }
                          )}
                        >
                          {format(new Date(appointment.scheduled_time), 'HH:mm')} -{' '}
                          {appointment.client.full_name}
                        </div>
                      ))}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      ) : (
        // Visualização diária
        <div className="rounded-lg border overflow-hidden">
          {/* Cabeçalho do dia */}
          <div className="grid grid-cols-[100px_1fr] border-b">
            <div className="p-2 border-r bg-background" />
            <div
              className={cn(
                'p-2 text-center bg-background',
                isToday(currentDate) && 'bg-accent/10'
              )}
            >
              <div className="font-medium text-lg">{WEEKDAYS_LONG[currentDate.getDay()]}</div>
              <div className="text-sm text-muted-foreground">
                {format(currentDate, "d 'de' MMMM", { locale: ptBR })}
              </div>
            </div>
          </div>

          {/* Grid de horários */}
          <div className="grid grid-cols-[100px_1fr]">
            {/* Coluna de horários */}
            <div className="border-r">
              {getHours().map(hour => {
                const hourNumber = hour.getHours()
                const isBreak = isLunchBreak(hourNumber)

                return (
                  <div
                    key={hour.toString()}
                    className={cn(
                      'h-20 border-b p-2 text-sm text-muted-foreground',
                      isBreak && 'bg-gray-50'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span>{format(hour, 'HH:mm')}</span>
                      {isBreak && <span className="text-[10px] text-muted-foreground">Almoço</span>}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Coluna de eventos */}
            <div className="relative">
              {getHours().map(hour => {
                const appointments = getAppointmentsForDayAndHour(currentDate, hour.getHours())
                return (
                  <div key={hour.toString()} className="h-20 border-b p-1">
                    {appointments.map(appointment => (
                      <div
                        key={appointment.id}
                        onClick={() => handleAppointmentClick(appointment)}
                        className={cn('text-sm p-2 mb-1 rounded cursor-pointer hover:opacity-80', {
                          'bg-blue-100 text-blue-800': appointment.status === 'scheduled',
                          'bg-green-100 text-green-800': appointment.status === 'completed',
                          'bg-rose-100 text-rose-800': appointment.status === 'canceled',
                          'bg-gray-100 text-gray-800': appointment.status === 'no_show',
                        })}
                      >
                        <div className="font-medium">
                          {format(new Date(appointment.scheduled_time), 'HH:mm')} -{' '}
                          {appointment.client.full_name}
                        </div>
                        <div className="text-xs mt-1">{appointment.service.name}</div>
                      </div>
                    ))}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      <AppointmentDetailsDialog
        appointment={selectedAppointment}
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
      />

      {selectedDayEvents && (
        <DayEventsDialog
          date={selectedDayEvents.date}
          appointments={selectedDayEvents.appointments}
          open={isDayEventsOpen}
          onOpenChange={setIsDayEventsOpen}
          onAppointmentClick={appointment => {
            setSelectedAppointment(appointment)
            setIsDetailsOpen(true)
            setIsDayEventsOpen(false)
          }}
        />
      )}

      <BusinessHoursDialog open={isBusinessHoursOpen} onOpenChange={setIsBusinessHoursOpen} />
    </Card>
  )
}
