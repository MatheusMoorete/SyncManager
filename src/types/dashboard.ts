export type KpiMetric = 
  | 'conversionRate'
  | 'averageTicket'
  | 'clientRetention'
  | 'revenue'

export type ComparePeriod = 
  | 'previousDay'
  | 'previousWeek'
  | 'previousMonth'
  | 'previousYear'

export type ChartVariant = 'line' | 'bar' | 'donut'

export type KpiData = {
  metric: KpiMetric
  value: number
  previousValue: number
  change: number // percentual de mudança
  trend: 'up' | 'down' | 'stable'
}

export type ChartData = {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    color?: string
  }[]
}

export type TimeRange = '7d' | '30d' | '90d' | '365d'

export interface DashboardKpi {
  title: string
  value: number
  trend?: number | null
  formatter?: 'currency' | 'number' | 'percent' | 'default'
}

export interface RevenueChartData {
  date: string
  revenue: number
}

export interface ServiceChartData {
  name: string
  value: number
  percentage: number
}

export interface RecentActivity {
  id: string
  client: string
  service: string
  date: string
  status: 'scheduled' | 'completed' | 'cancelled'
}

export interface DashboardData {
  kpis: {
    revenue: DashboardKpi
    clients: DashboardKpi
    appointments: DashboardKpi
    loyaltyPoints: DashboardKpi
  }
  revenueChart: RevenueChartData[]
  servicesChart: ServiceChartData[]
  recentActivities: RecentActivity[]
  lastUpdate: string
} 