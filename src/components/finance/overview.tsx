'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowUpIcon, ArrowDownIcon, DollarSign, TrendingUp, Calendar } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useFinanceStore } from '@/store/finance-store'

interface OverviewCardProps {
  title: string
  value: number
  description: React.ReactNode
  icon: React.ReactNode
  tooltipText: string
  iconContainerClassName?: string
  descriptionClassName?: string
}

function OverviewCard({
  title,
  value,
  description,
  icon,
  tooltipText,
  iconContainerClassName,
  descriptionClassName,
}: OverviewCardProps) {
  return (
    <Card className="bg-white/95 hover:bg-white/100 transition-all shadow-lg hover:shadow-xl border-none ring-1 ring-charcoal/5">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Tooltip delayDuration={100}>
          <TooltipTrigger asChild>
            <div
              className={`rounded-lg p-2 ring-1 ring-inset shadow-sm cursor-help ${iconContainerClassName}`}
            >
              {icon}
            </div>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p>{tooltipText}</p>
          </TooltipContent>
        </Tooltip>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          }).format(value)}
        </div>
        <p className={`text-xs flex items-center gap-1 ${descriptionClassName}`}>{description}</p>
      </CardContent>
    </Card>
  )
}

export function Overview() {
  const { stats } = useFinanceStore()

  if (!stats) return null

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <OverviewCard
        title="Receita Total"
        value={stats.totalIncome}
        description={
          <>
            <ArrowUpIcon className="h-3 w-3" />
            Mês atual
          </>
        }
        icon={<DollarSign className="h-4 w-4" />}
        tooltipText="Total de receitas no mês atual"
        iconContainerClassName="bg-soft-sage/5 text-soft-sage hover:bg-soft-sage/10 transition-colors"
        descriptionClassName="text-soft-sage"
      />
      <OverviewCard
        title="Despesas"
        value={stats.totalExpenses}
        description={
          <>
            <ArrowDownIcon className="h-3 w-3" />
            Mês atual
          </>
        }
        icon={<ArrowDownIcon className="h-4 w-4" />}
        tooltipText="Total de despesas no mês atual"
        iconContainerClassName="bg-terracotta/5 text-terracotta hover:bg-terracotta/10 transition-colors"
        descriptionClassName="text-terracotta"
      />
      <OverviewCard
        title="Lucro Líquido"
        value={stats.netProfit}
        description={
          <>
            <ArrowUpIcon className="h-3 w-3" />
            Mês atual
          </>
        }
        icon={<TrendingUp className="h-4 w-4" />}
        tooltipText="Lucro líquido (receitas - despesas) no mês atual"
        iconContainerClassName="bg-soft-sage/5 text-soft-sage hover:bg-soft-sage/10 transition-colors"
        descriptionClassName="text-soft-sage"
      />
      <OverviewCard
        title="Projeção Mensal"
        value={stats.monthlyProjection}
        description={
          <>
            <ArrowUpIcon className="h-3 w-3" />
            Média últimos 3 meses
          </>
        }
        icon={<Calendar className="h-4 w-4" />}
        tooltipText="Projeção baseada na média ponderada dos últimos 3 meses"
        iconContainerClassName="bg-soft-sage/5 text-soft-sage hover:bg-soft-sage/10 transition-colors"
        descriptionClassName="text-soft-sage"
      />
    </div>
  )
}
