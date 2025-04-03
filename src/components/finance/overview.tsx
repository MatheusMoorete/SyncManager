'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowUpIcon, ArrowDownIcon, DollarSign, TrendingUp, Calendar, ChevronDown } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useFinanceStore } from '@/store/finance-store'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useState } from 'react'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

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
        <div className="text-xl sm:text-2xl font-bold">
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
  const { stats, selectedPeriod, actions } = useFinanceStore()
  const [customPeriodDialogOpen, setCustomPeriodDialogOpen] = useState(false)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  if (!stats) return null

  const handlePeriodChange = (period: string) => {
    actions.setPeriod(period)
  }

  const handleCustomPeriodSubmit = () => {
    if (!startDate || !endDate) return
    
    actions.setPeriod('custom', {
      start: new Date(startDate),
      end: new Date(endDate)
    })
    
    setCustomPeriodDialogOpen(false)
  }

  return (
    <>
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-6">
        <div className="text-sm text-muted-foreground">
          {stats.period?.label ? (
            <span>Mostrando dados de: <span className="font-semibold">{stats.period.label}</span></span>
          ) : 'Dados do mês atual'}
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Calendar className="h-4 w-4" />
              Selecionar Período
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handlePeriodChange('current')}>
              Mês Atual
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handlePeriodChange('previous')}>
              Mês Anterior
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handlePeriodChange('quarter')}>
              Trimestre Atual
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handlePeriodChange('year')}>
              Ano Atual
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setCustomPeriodDialogOpen(true)}>
              Período Personalizado...
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <OverviewCard
          title="Receita Total"
          value={stats.totalIncome}
          description={
            <>
              <ArrowUpIcon className="h-3 w-3" />
              {selectedPeriod === 'current' ? 'Mês atual' : stats.period?.label || 'Período selecionado'}
            </>
          }
          icon={<DollarSign className="h-4 w-4" />}
          tooltipText="Total de receitas no período selecionado"
          iconContainerClassName="bg-soft-sage/5 text-soft-sage hover:bg-soft-sage/10 transition-colors"
          descriptionClassName="text-soft-sage"
        />
        <OverviewCard
          title="Despesas"
          value={stats.totalExpenses}
          description={
            <>
              <ArrowDownIcon className="h-3 w-3" />
              {selectedPeriod === 'current' ? 'Mês atual' : stats.period?.label || 'Período selecionado'}
            </>
          }
          icon={<ArrowDownIcon className="h-4 w-4" />}
          tooltipText="Total de despesas no período selecionado"
          iconContainerClassName="bg-terracotta/5 text-terracotta hover:bg-terracotta/10 transition-colors"
          descriptionClassName="text-terracotta"
        />
        <OverviewCard
          title="Lucro Líquido"
          value={stats.netProfit}
          description={
            <>
              <ArrowUpIcon className="h-3 w-3" />
              {selectedPeriod === 'current' ? 'Mês atual' : stats.period?.label || 'Período selecionado'}
            </>
          }
          icon={<TrendingUp className="h-4 w-4" />}
          tooltipText="Lucro líquido (receitas - despesas) no período selecionado"
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
      
      <Dialog open={customPeriodDialogOpen} onOpenChange={setCustomPeriodDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Definir Período Personalizado</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="startDate" className="text-right col-span-1">
                Data inicial
              </Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="endDate" className="text-right col-span-1">
                Data final
              </Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCustomPeriodDialogOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" onClick={handleCustomPeriodSubmit}>
              Aplicar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
