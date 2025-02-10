import { Timestamp } from 'firebase/firestore'

export type KpiMetric = 'conversionRate' | 'averageTicket' | 'clientRetention' | 'revenue'

export type ComparePeriod = 'previousDay' | 'previousWeek' | 'previousMonth' | 'previousYear'

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

export interface Transaction {
  id: string
  type: 'income' | 'expense'
  amount: number
  ownerId: string
  transactionDate: Timestamp
}

export interface Appointment {
  id: string
  client_id: string
  service_id: string
  scheduled_time: Timestamp
  final_price: number
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show'
  ownerId: string
}

export type DashboardData = {
  kpis: {
    appointments: {
      value: number
      trend: number | null
      title: string
      formatter: 'number'
    }
    clients: {
      value: number
      trend: number | null
      title: string
      formatter: 'number'
    }
    revenue: {
      value: number
      trend: number | null
      title: string
      formatter: 'currency'
    }
    expenses: {
      value: number
      trend: number | null
      title: string
      formatter: 'currency'
    }
  }
  servicesChart: Array<{
    name: string
    value: number
    percentage: number
  }>
  birthdays: Array<{
    id: string
    name: string
    date: string
  }>
  revenueChart: Array<{
    date: string
    revenue: number
  }>
  recentActivities: Array<{
    id: string
    type: string
    title: string
    description: string
    date: string
    value: number
    status?: string
  }>
  lastUpdate: string
}
