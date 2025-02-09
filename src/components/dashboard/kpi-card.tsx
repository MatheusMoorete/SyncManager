'use client'

import { ArrowDownIcon, ArrowUpIcon } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { DashboardKpi } from '@/types/dashboard'

interface KpiCardProps extends DashboardKpi {
  loading?: boolean
}

/**
 * Card de KPI otimizado para mobile
 * @example
 * <KpiCard
 *   title="Receita Total"
 *   value={1000}
 *   trend={10}
 *   icon="dollar"
 *   formatter="currency"
 * />
 */
export function KpiCard({
  title,
  value,
  trend,
  formatter = 'default',
  loading = false,
}: KpiCardProps) {
  const formatValue = (value: number) => {
    switch (formatter) {
      case 'currency':
        return new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        }).format(value)
      case 'number':
        return new Intl.NumberFormat('pt-BR').format(value)
      case 'percent':
        return new Intl.NumberFormat('pt-BR', {
          style: 'percent',
          minimumFractionDigits: 1,
        }).format(value / 100)
      default:
        return value.toString()
    }
  }

  const trendPercentage = trend ? Math.abs(trend) : 0
  const formattedTrend = `${trendPercentage.toFixed(1)}%`
  const isPositiveTrend = trend && trend > 0

  if (loading) {
    return (
      <Card className="bg-card/50 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            <Skeleton className="h-4 w-[100px]" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-[120px]" />
          <Skeleton className="mt-4 h-4 w-[80px]" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="relative overflow-hidden bg-card/50 backdrop-blur-sm transition-all duration-200 hover:bg-card hover:shadow-lg">
      <div
        className={cn(
          'absolute inset-x-0 -top-px h-px w-full',
          isPositiveTrend ? 'bg-success' : 'bg-destructive'
        )}
      />
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold tracking-tight text-card-foreground">
          {formatValue(value)}
        </div>
        {trend !== undefined && trend !== null && (
          <p
            className={cn(
              'mt-2 flex items-center gap-1.5 text-xs font-medium',
              isPositiveTrend ? 'text-success/80' : 'text-destructive/80'
            )}
          >
            {isPositiveTrend ? (
              <ArrowUpIcon className="h-3.5 w-3.5" />
            ) : (
              <ArrowDownIcon className="h-3.5 w-3.5" />
            )}
            <span>{formattedTrend}</span>
          </p>
        )}
      </CardContent>
    </Card>
  )
}
