'use client'

import { useState, useEffect } from 'react'
import { Clock, Calendar, DollarSign, Star, Repeat } from 'lucide-react'
import { Customer } from '@/types/customer'
import { Appointment } from '@/types/schedule'
import { Card, CardContent } from '@/components/ui/card'
import { format, differenceInMonths, differenceInDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface CustomerMetricsProps {
  customer: Customer
  appointments: Appointment[]
}

export function CustomerMetrics({ customer, appointments }: CustomerMetricsProps) {
  const [metrics, setMetrics] = useState({
    totalAppointments: 0,
    completedAppointments: 0,
    canceledAppointments: 0,
    noShowAppointments: 0,
    totalSpent: 0,
    averageSpent: 0,
    frequencyDays: 0,
    loyaltyLevel: 'Novo',
    lastVisit: null as Date | null,
    firstVisit: null as Date | null,
    daysSinceLastVisit: 0,
  })

  useEffect(() => {
    if (!appointments || !appointments.length) return

    // Filtra apenas os agendamentos deste cliente
    const customerAppointments = appointments.filter(app => app.client_id === customer.id)

    // Métricas básicas
    const completed = customerAppointments.filter(app => app.status === 'completed').length
    const canceled = customerAppointments.filter(app => app.status === 'canceled').length
    const noShow = customerAppointments.filter(app => app.status === 'no_show').length

    // Datas de visitas
    const completedDates = customerAppointments
      .filter(app => app.status === 'completed')
      .map(app => new Date(app.scheduled_time))
      .sort((a, b) => a.getTime() - b.getTime())

    const lastVisit = completedDates.length > 0 ? completedDates[completedDates.length - 1] : null
    const firstVisit = completedDates.length > 0 ? completedDates[0] : null

    // Cálculo de dias desde a última visita
    let daysSinceLastVisit = 0
    if (lastVisit) {
      // Usando Math.abs para garantir um valor positivo
      daysSinceLastVisit = Math.abs(differenceInDays(new Date(), lastVisit))
    }

    // Cálculos financeiros
    const totalSpent = customerAppointments
      .filter(app => app.status === 'completed')
      .reduce((sum, app) => sum + (app.final_price || 0), 0)

    const averageSpent = completed > 0 ? totalSpent / completed : 0

    // Cálculo de frequência
    let frequencyDays = 0
    if (completedDates.length > 1) {
      let totalDays = 0
      for (let i = 1; i < completedDates.length; i++) {
        totalDays +=
          (completedDates[i].getTime() - completedDates[i - 1].getTime()) / (1000 * 60 * 60 * 24)
      }
      frequencyDays = Math.round(totalDays / (completedDates.length - 1))
    }

    // Determina nível de fidelidade
    let loyaltyLevel = 'Novo'
    if (completed >= 10) loyaltyLevel = 'VIP'
    else if (completed >= 5) loyaltyLevel = 'Frequente'
    else if (completed >= 2) loyaltyLevel = 'Regular'

    setMetrics({
      totalAppointments: customerAppointments.length,
      completedAppointments: completed,
      canceledAppointments: canceled,
      noShowAppointments: noShow,
      totalSpent,
      averageSpent,
      frequencyDays,
      loyaltyLevel,
      lastVisit,
      firstVisit,
      daysSinceLastVisit,
    })
  }, [appointments, customer.id])

  // Formatar data da última visita
  const formatLastVisit = () => {
    if (!metrics.lastVisit) return 'Nunca'
    return format(metrics.lastVisit, "d 'de' MMMM 'de' yyyy", { locale: ptBR })
  }

  return (
    <div className="bg-card border rounded-lg p-4">
      <h2 className="text-lg font-medium mb-3">Métricas e Indicadores</h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        <Card className="bg-primary/5 border-primary/10">
          <CardContent className="p-4 flex flex-col items-center text-center">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 mb-2">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground">Atendimentos</p>
            <p className="text-xl font-medium">{metrics.totalAppointments}</p>
            <p className="text-xs text-muted-foreground">
              {metrics.completedAppointments} concluídos
            </p>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-100">
          <CardContent className="p-4 flex flex-col items-center text-center">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-500/10 mb-2">
              <DollarSign className="h-5 w-5 text-green-500" />
            </div>
            <p className="text-sm text-muted-foreground">Total Gasto</p>
            <p className="text-xl font-medium">
              R$ {metrics.totalSpent.toFixed(2).replace('.', ',')}
            </p>
            <p className="text-xs text-muted-foreground">
              Por atendimento: R$ {metrics.averageSpent.toFixed(2).replace('.', ',')}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-amber-50 border-amber-100">
          <CardContent className="p-4 flex flex-col items-center text-center">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-500/10 mb-2">
              <Star className="h-5 w-5 text-amber-500" />
            </div>
            <p className="text-sm text-muted-foreground">Fidelidade</p>
            <p className="text-xl font-medium">{metrics.loyaltyLevel}</p>
            <p className="text-xs text-muted-foreground">{customer.points || 0} pontos</p>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 border-blue-100">
          <CardContent className="p-4 flex flex-col items-center text-center">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-500/10 mb-2">
              <Clock className="h-5 w-5 text-blue-500" />
            </div>
            <p className="text-sm text-muted-foreground">Frequência</p>
            <p className="text-xl font-medium">
              {metrics.frequencyDays ? `${metrics.frequencyDays} dias` : 'N/A'}
            </p>
            <p className="text-xs text-muted-foreground">entre visitas</p>
          </CardContent>
        </Card>

        <Card className="bg-purple-50 border-purple-100">
          <CardContent className="p-4 flex flex-col items-center text-center">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-500/10 mb-2">
              <Repeat className="h-5 w-5 text-purple-500" />
            </div>
            <p className="text-sm text-muted-foreground">Última Visita</p>
            <p className="text-base font-medium leading-tight">{formatLastVisit()}</p>
            <p className="text-xs text-muted-foreground">
              {metrics.lastVisit ? `${metrics.daysSinceLastVisit} dias atrás` : ''}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
