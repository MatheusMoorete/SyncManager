'use client'

import { 
  Calendar,
  Users,
  Star,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Plus,
  Edit,
  Trash2
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { AppLayout } from '@/components/layout/app-layout'

const stats = [
  {
    title: 'Agendamentos do Mês',
    value: '48',
    trend: '+15% que o mês anterior',
    trendUp: true,
    icon: Calendar,
    color: 'text-soft-sage'
  },
  {
    title: 'Clientes Ativos',
    value: '32',
    trend: '+8% que o mês anterior',
    trendUp: true,
    icon: Users,
    color: 'text-blush-pink'
  },
  {
    title: 'Avaliação Média',
    value: '4.8',
    trend: '+0.2 que o mês anterior',
    trendUp: true,
    icon: Star,
    color: 'text-terracotta'
  },
  {
    title: 'Faturamento Mensal',
    value: 'R$ 3.840,00',
    trend: '+12% que o mês anterior',
    trendUp: true,
    icon: DollarSign,
    color: 'text-soft-sage'
  }
]

const topServices = [
  { name: 'Design de Sobrancelhas', quantity: '28 agendamentos' },
  { name: 'Micropigmentação', quantity: '12 agendamentos' },
  { name: 'Extensão de Cílios', quantity: '8 agendamentos' }
]

const categories = [
  { name: 'Design', percentage: 60 },
  { name: 'Micropigmentação', percentage: 25 },
  { name: 'Cílios', percentage: 15 }
]

export default function DashboardPage() {
  return (
    <AppLayout>
      <div className="min-h-screen flex flex-col gap-4 p-4 pb-20 md:pb-8 md:gap-6 lg:gap-8 md:p-6 lg:p-8 bg-gradient-to-br from-neutral-cream to-neutral-cream/50">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-semibold font-heading text-heading">Dashboard</h2>
            <p className="text-sm text-muted-foreground">
              Acompanhe o desempenho do seu estúdio
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 md:gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <Card key={stat.title} className="p-4 bg-white/95 hover:bg-white/100 transition-all md:p-4 lg:p-6 shadow-lg hover:shadow-xl border-none ring-1 ring-charcoal/5">
                <div className="flex items-center gap-3 md:gap-4">
                  <div className={cn(
                    "rounded-lg p-2 ring-1 ring-inset shadow-sm",
                    stat.color,
                    stat.color.replace('text-', 'bg-').concat('/5')
                  )}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-charcoal/60 truncate">
                      {stat.title}
                    </p>
                    <p className="text-lg md:text-xl lg:text-2xl font-bold text-charcoal">{stat.value}</p>
                  </div>
                </div>
                <div className="mt-3 md:mt-4 flex items-center gap-1 text-xs">
                  {stat.trendUp ? (
                    <TrendingUp className="h-3 w-3 text-soft-sage shrink-0" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-terracotta shrink-0" />
                  )}
                  <span
                    className={cn(
                      "font-medium truncate",
                      stat.trendUp ? "text-soft-sage" : "text-terracotta"
                    )}
                  >
                    {stat.trend}
                  </span>
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
              <h2 className="text-base md:text-lg font-semibold text-charcoal">Serviços Mais Agendados</h2>
            </div>
            <div className="mt-4 space-y-3">
              {topServices.map((service, index) => (
                <div
                  key={service.name}
                  className="flex items-center justify-between p-3 rounded-lg bg-neutral-cream/30 hover:bg-neutral-cream/50 transition-colors"
                >
                  <span className="font-medium text-sm md:text-base text-charcoal truncate mr-2">{service.name}</span>
                  <span className="text-sm text-charcoal/60 shrink-0">
                    {service.quantity}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {/* Categories */}
          <Card className="p-4 bg-white/95 hover:bg-white/100 transition-all md:p-4 lg:p-6 shadow-lg hover:shadow-xl border-none ring-1 ring-charcoal/5">
            <div className="flex items-center justify-between">
              <h2 className="text-base md:text-lg font-semibold text-charcoal">Distribuição de Serviços</h2>
            </div>
            <div className="mt-4 space-y-4">
              {categories.map((category) => (
                <div key={category.name} className="space-y-2 p-3 rounded-lg bg-neutral-cream/30 hover:bg-neutral-cream/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-charcoal truncate mr-2">{category.name}</span>
                    <span className="text-sm text-charcoal/60 shrink-0">
                      {category.percentage}%
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-white shadow-inner">
                    <div
                      className="h-full bg-gradient-to-r from-terracotta/80 to-terracotta transition-all"
                      style={{ width: `${category.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Appointments Table - Hidden on Mobile */}
        <div className="hidden md:block">
          <Card className="mt-3 md:mt-4 bg-white/95 hover:bg-white/100 transition-all shadow-lg hover:shadow-xl border-none ring-1 ring-charcoal/5">
            <div className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between md:gap-4 md:p-4 lg:p-6">
              <h2 className="text-base md:text-lg font-semibold text-charcoal">Próximos Agendamentos</h2>
              <Button className="bg-gradient-to-r from-terracotta to-terracotta/90 hover:from-terracotta/90 hover:to-terracotta shadow-md hover:shadow-lg text-white transition-all">
                <Plus className="mr-2 h-4 w-4" />
                Novo Agendamento
              </Button>
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
                  <tr className="hover:bg-neutral-cream/20 transition-colors">
                    <td className="px-3 py-3 md:px-4 lg:px-6 md:py-4">
                      <div>
                        <p className="font-medium text-charcoal">Maria Silva</p>
                        <p className="text-xs md:text-sm text-charcoal/60">11 99999-9999</p>
                      </div>
                    </td>
                    <td className="px-3 py-3 md:px-4 lg:px-6 md:py-4 text-sm text-charcoal">Design de Sobrancelhas</td>
                    <td className="px-3 py-3 md:px-4 lg:px-6 md:py-4 text-sm text-charcoal">24/03/2024</td>
                    <td className="px-3 py-3 md:px-4 lg:px-6 md:py-4 text-sm text-charcoal">14:30</td>
                    <td className="px-3 py-3 md:px-4 lg:px-6 md:py-4 text-sm text-charcoal">R$ 80,00</td>
                    <td className="px-3 py-3 md:px-4 lg:px-6 md:py-4">
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="text-soft-sage hover:text-soft-sage/80 hover:bg-soft-sage/10">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-terracotta hover:text-terracotta/80 hover:bg-terracotta/10">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
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
                <h2 className="text-base font-semibold text-charcoal">Próximos Agendamentos</h2>
              </div>
              <Button className="w-full bg-gradient-to-r from-terracotta to-terracotta/90 hover:from-terracotta/90 hover:to-terracotta shadow-md hover:shadow-lg text-white transition-all mb-4">
                <Plus className="mr-2 h-4 w-4" />
                Novo Agendamento
              </Button>
              <div className="space-y-4">
                <div className="p-3 rounded-lg bg-neutral-cream/30 hover:bg-neutral-cream/50 transition-colors shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium text-charcoal">Maria Silva</p>
                      <p className="text-xs text-charcoal/60">11 99999-9999</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-soft-sage hover:text-soft-sage/80 hover:bg-soft-sage/10">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-terracotta hover:text-terracotta/80 hover:bg-terracotta/10">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-charcoal/60">Serviço:</span>
                      <span className="text-charcoal">Design de Sobrancelhas</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-charcoal/60">Data:</span>
                      <span className="text-charcoal">24/03/2024</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-charcoal/60">Horário:</span>
                      <span className="text-charcoal">14:30</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-charcoal/60">Valor:</span>
                      <span className="text-charcoal">R$ 80,00</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </AppLayout>
  )
} 