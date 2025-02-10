'use client'

import { useEffect } from 'react'
import {
  Calendar,
  Users,
  Star,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Plus,
  Edit,
  Trash2,
  ArrowDown,
  ArrowUp,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { AppLayout } from '@/components/layout/app-layout'
import { formatCurrency } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import Link from 'next/link'
import { Edit as LucideEdit } from 'lucide-react'
import { useDashboardStore } from '@/store/dashboard-store'
import { Timestamp } from 'firebase/firestore'

function formatTimestamp(date: string) {
  const dateObj = new Date(date)
  return {
    date: dateObj.toLocaleDateString('pt-BR'),
    time: dateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
  }
}

export default function DashboardPage() {
  const { data, loading, error, selectedTimeRange, actions } = useDashboardStore()

  useEffect(() => {
    actions.fetchDashboardData()
  }, [actions])

  const stats = [
    {
      title: 'Agendamentos',
      value: data?.kpis.appointments.value || 0,
      trend:
        data?.kpis.appointments.trend != null
          ? `${data?.kpis.appointments.trend.toFixed(1)}% que o mês anterior`
          : undefined,
      trendUp: data?.kpis.appointments.trend != null ? data.kpis.appointments.trend > 0 : undefined,
      icon: Calendar,
      color: 'text-soft-sage',
    },
    {
      title: 'Clientes Ativos',
      value: data?.kpis.clients.value || 0,
      trend:
        data?.kpis.clients.trend != null
          ? `${data?.kpis.clients.trend.toFixed(1)}% que o mês anterior`
          : undefined,
      trendUp: data?.kpis.clients.trend != null ? data.kpis.clients.trend > 0 : undefined,
      icon: Users,
      color: 'text-blush-pink',
    },
    {
      title: 'Despesas',
      value: data?.kpis.expenses.value || 0,
      trend:
        data?.kpis.expenses.trend != null
          ? `${data?.kpis.expenses.trend.toFixed(1)}% que o mês anterior`
          : undefined,
      trendUp: data?.kpis.expenses.trend != null ? data.kpis.expenses.trend < 0 : undefined,
      icon: DollarSign,
      color: 'text-terracotta',
      formatter: 'currency',
    },
    {
      title: 'Faturamento',
      value: (data?.kpis.revenue.value || 0) - (data?.kpis.expenses.value || 0),
      trend:
        data?.kpis.revenue.trend != null
          ? `${data?.kpis.revenue.trend.toFixed(1)}% que o mês anterior`
          : undefined,
      trendUp: data?.kpis.revenue.trend != null ? data.kpis.revenue.trend > 0 : undefined,
      icon: Star,
      color: 'text-golden-yellow',
      formatter: 'currency',
    },
  ]

  // Transformar dados do gráfico de serviços
  const topServices =
    data?.servicesChart.slice(0, 3).map(service => ({
      name: service.name,
      quantity: `${service.value} agendamentos`,
    })) || []

  const categories =
    data?.servicesChart.map(service => ({
      name: service.name,
      percentage: service.percentage,
    })) || []

  if (loading) {
    return (
      <AppLayout>
        <div className="min-h-screen flex flex-col gap-4 p-4 pb-20 md:pb-8 md:gap-6 lg:gap-8 md:p-6 lg:p-8 bg-gradient-to-br from-neutral-cream to-neutral-cream/50">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 md:gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-[120px] rounded-lg" />
            ))}
          </div>
          <Skeleton className="h-[300px] rounded-lg" />
          <Skeleton className="h-[400px] rounded-lg" />
        </div>
      </AppLayout>
    )
  }

  if (error) {
    return (
      <AppLayout>
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-4">
          <h2 className="text-xl font-semibold text-terracotta">Erro ao carregar dados</h2>
          <p className="text-charcoal/60">Não foi possível carregar os dados do dashboard.</p>
          <Button onClick={() => actions.fetchDashboardData()}>Tentar novamente</Button>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="min-h-screen flex flex-col gap-4 p-4 pb-20 md:pb-8 md:gap-6 lg:gap-8 md:p-6 lg:p-8 bg-gradient-to-br from-neutral-cream to-neutral-cream/50">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-semibold font-heading text-heading">Dashboard</h2>
            <p className="text-sm text-muted-foreground">Acompanhe o desempenho do seu estúdio</p>
          </div>
        </div>

        {/* Filtro de período */}
        <div className="flex gap-2">
          <Button
            variant={selectedTimeRange === '7d' ? 'default' : 'outline'}
            onClick={() => actions.setTimeRange('7d')}
          >
            7 dias
          </Button>
          <Button
            variant={selectedTimeRange === '30d' ? 'default' : 'outline'}
            onClick={() => actions.setTimeRange('30d')}
          >
            30 dias
          </Button>
          <Button
            variant={selectedTimeRange === '90d' ? 'default' : 'outline'}
            onClick={() => actions.setTimeRange('90d')}
          >
            90 dias
          </Button>
          <Button
            variant={selectedTimeRange === '365d' ? 'default' : 'outline'}
            onClick={() => actions.setTimeRange('365d')}
          >
            1 ano
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 md:gap-4">
          {stats.map(stat => {
            const Icon = stat.icon
            return (
              <Card
                key={stat.title}
                className="p-4 bg-white/95 hover:bg-white/100 transition-all md:p-4 lg:p-6 shadow-lg hover:shadow-xl border-none ring-1 ring-charcoal/5"
              >
                <div className="flex items-center gap-3 md:gap-4">
                  <div
                    className={cn(
                      'rounded-lg p-2 ring-1 ring-inset shadow-sm',
                      stat.color,
                      stat.color.replace('text-', 'bg-').concat('/5')
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-charcoal/60 truncate">{stat.title}</p>
                    <p className="text-lg md:text-xl lg:text-2xl font-bold text-charcoal">
                      {stat.formatter === 'currency' ? formatCurrency(stat.value) : stat.value}
                    </p>
                  </div>
                </div>
                <div className="mt-3 md:mt-4 flex items-center gap-1 text-xs">
                  {stat.trendUp === true && (
                    <TrendingUp className="h-3 w-3 text-soft-sage shrink-0" />
                  )}
                  {stat.trendUp === false && (
                    <TrendingDown className="h-3 w-3 text-terracotta shrink-0" />
                  )}
                  {stat.trend && (
                    <span
                      className={cn(
                        'font-medium truncate',
                        stat.trendUp === true ? 'text-soft-sage' : 'text-terracotta'
                      )}
                    >
                      {stat.trend}
                    </span>
                  )}
                </div>
              </Card>
            )
          })}
        </div>

        {/* Main Content */}
        <div className="mt-3 md:mt-4 grid grid-cols-1 gap-3 md:gap-4 lg:grid-cols-2">
          {/* Top Services */}
          <Card className="p-4 bg-white/95 hover:bg-white/100 transition-all md:p-4 lg:p-6 shadow-lg hover:shadow-xl border-none ring-1 ring-charcoal/5">
            <div className="flex items-center justify-between">
              <h2 className="text-base md:text-lg font-semibold text-charcoal">
                Serviços Mais Agendados
              </h2>
            </div>
            <div className="mt-4 space-y-3">
              {topServices.map((service, index) => (
                <div
                  key={service.name}
                  className="flex items-center justify-between p-3 rounded-lg bg-neutral-cream/30 hover:bg-neutral-cream/50 transition-colors"
                >
                  <span className="font-medium text-sm md:text-base text-charcoal truncate mr-2">
                    {service.name}
                  </span>
                  <span className="text-sm text-charcoal/60 shrink-0">{service.quantity}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Categories */}
          <Card className="p-4 bg-white/95 hover:bg-white/100 transition-all md:p-4 lg:p-6 shadow-lg hover:shadow-xl border-none ring-1 ring-charcoal/5">
            <div className="flex items-center justify-between">
              <h2 className="text-base md:text-lg font-semibold text-charcoal">
                Aniversariantes da Semana
              </h2>
            </div>
            <div className="mt-4 space-y-4">
              {data?.birthdays && data.birthdays.length > 0 ? (
                data.birthdays.map(birthday => (
                  <div
                    key={birthday.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-neutral-cream/30 hover:bg-neutral-cream/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-terracotta/10 flex items-center justify-center">
                        <Star className="h-4 w-4 text-terracotta" />
                      </div>
                      <div>
                        <p className="font-medium text-charcoal">{birthday.name}</p>
                        <p className="text-sm text-charcoal/60">{birthday.date}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-charcoal/60">
                  Nenhum aniversariante esta semana
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Atividades Recentes */}
        <div className="hidden md:block">
          <Card className="mt-3 md:mt-4 bg-white/95 hover:bg-white/100 transition-all shadow-lg hover:shadow-xl border-none ring-1 ring-charcoal/5">
            <div className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between md:gap-4 md:p-4 lg:p-6">
              <h2 className="text-base md:text-lg font-semibold text-charcoal">
                Atividades Recentes
              </h2>
              <Link href="/agenda">
                <Button className="bg-gradient-to-r from-terracotta to-terracotta/90 hover:from-terracotta/90 hover:to-terracotta shadow-md hover:shadow-lg text-white transition-all">
                  <LucideEdit className="mr-2 h-4 w-4" />
                  Novo Agendamento
                </Button>
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead className="border-b border-charcoal/5 bg-neutral-cream/30">
                  <tr className="text-left">
                    <th className="px-3 py-3 text-xs md:text-sm font-medium text-charcoal/60 md:px-4 lg:px-6">
                      CLIENTE
                    </th>
                    <th className="px-3 py-3 text-xs md:text-sm font-medium text-charcoal/60 md:px-4 lg:px-6">
                      SERVIÇO
                    </th>
                    <th className="px-3 py-3 text-xs md:text-sm font-medium text-charcoal/60 md:px-4 lg:px-6">
                      DATA
                    </th>
                    <th className="px-3 py-3 text-xs md:text-sm font-medium text-charcoal/60 md:px-4 lg:px-6">
                      HORÁRIO
                    </th>
                    <th className="px-3 py-3 text-xs md:text-sm font-medium text-charcoal/60 md:px-4 lg:px-6">
                      VALOR
                    </th>
                    <th className="px-3 py-3 text-xs md:text-sm font-medium text-charcoal/60 md:px-4 lg:px-6">
                      AÇÕES
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-charcoal/5">
                  {data?.recentActivities?.map(activity => (
                    <tr key={activity.id} className="hover:bg-neutral-cream/20 transition-colors">
                      <td className="px-3 py-3 md:px-4 lg:px-6 md:py-4">
                        <div>
                          <p className="font-medium text-charcoal">{activity.title}</p>
                        </div>
                      </td>
                      <td className="px-3 py-3 md:px-4 lg:px-6 md:py-4 text-sm text-charcoal">
                        {activity.description}
                      </td>
                      <td className="px-3 py-3 md:px-4 lg:px-6 md:py-4 text-sm text-charcoal">
                        {formatTimestamp(activity.date).date}
                      </td>
                      <td className="px-3 py-3 md:px-4 lg:px-6 md:py-4 text-sm text-charcoal">
                        {formatTimestamp(activity.date).time}
                      </td>
                      <td className="px-3 py-3 md:px-4 lg:px-6 md:py-4 text-sm text-charcoal">
                        {formatCurrency(activity.value)}
                      </td>
                      <td className="px-3 py-3 md:px-4 lg:px-6 md:py-4">
                        <div className="flex items-center gap-2">
                          <Link href={`/agenda/${activity.id}`}>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Mobile Appointments List */}
        <div className="md:hidden">
          <Card className="mt-3 bg-white/95 hover:bg-white/100 transition-all shadow-lg hover:shadow-xl border-none ring-1 ring-charcoal/5">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-charcoal">Atividades Recentes</h2>
              </div>
              <Link href="/agenda">
                <Button className="w-full bg-gradient-to-r from-terracotta to-terracotta/90 hover:from-terracotta/90 hover:to-terracotta shadow-md hover:shadow-lg text-white transition-all mb-4">
                  <LucideEdit className="mr-2 h-4 w-4" />
                  Novo Agendamento
                </Button>
              </Link>
              <div className="space-y-4">
                {data?.recentActivities?.map(activity => (
                  <div
                    key={activity.id}
                    className="p-3 rounded-lg bg-neutral-cream/30 hover:bg-neutral-cream/50 transition-colors shadow-sm"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium text-charcoal">{activity.title}</p>
                        <p className="text-xs text-charcoal/60">{activity.description}</p>
                      </div>
                      <div className="flex gap-2">
                        <Link href={`/agenda/${activity.id}`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                    <div className="flex justify-between text-xs text-charcoal/60">
                      <span>
                        {formatTimestamp(activity.date).date} às{' '}
                        {formatTimestamp(activity.date).time}
                      </span>
                      <span>{formatCurrency(activity.value)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </AppLayout>
  )
}
