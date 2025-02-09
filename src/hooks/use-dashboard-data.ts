'use client'

import { useQuery } from '@tanstack/react-query'
import { db } from '@/lib/firebase'
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore'
import { DashboardData, TimeRange } from '@/types/dashboard'
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/contexts/AuthContext'

export function useDashboardData(timeRange: TimeRange) {
  const { toast } = useToast()
  const { user } = useAuth()

  return useQuery<DashboardData>({
    queryKey: ['dashboard', timeRange],
    queryFn: async () => {
      try {
        if (!user) throw new Error('Usuário não autenticado')

        const startDate = new Date()
        const endDate = new Date()

        switch (timeRange) {
          case '7d':
            startDate.setDate(startDate.getDate() - 7)
            break
          case '30d':
            startDate.setDate(startDate.getDate() - 30)
            break
          case '90d':
            startDate.setDate(startDate.getDate() - 90)
            break
          case '365d':
            startDate.setDate(startDate.getDate() - 365)
            break
        }

        // Buscar transações
        const transactionsRef = collection(db, 'transactions')
        const transactionsQuery = query(
          transactionsRef,
          where('ownerId', '==', user.uid),
          where('transactionDate', '>=', Timestamp.fromDate(startDate)),
          where('transactionDate', '<=', Timestamp.fromDate(endDate))
        )
        const transactionsSnapshot = await getDocs(transactionsQuery)

        // Buscar agendamentos
        const appointmentsRef = collection(db, 'appointments')
        const appointmentsQuery = query(
          appointmentsRef,
          where('ownerId', '==', user.uid),
          where('scheduled_time', '>=', Timestamp.fromDate(startDate)),
          where('scheduled_time', '<=', Timestamp.fromDate(endDate))
        )
        const appointmentsSnapshot = await getDocs(appointmentsQuery)

        // Calcular métricas
        const transactions = transactionsSnapshot.docs.map(doc => doc.data())
        const appointments = appointmentsSnapshot.docs.map(doc => doc.data())

        const totalIncome = transactions
          .filter(t => t.type === 'income')
          .reduce((sum, t) => sum + t.amount, 0)

        const totalExpenses = transactions
          .filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + t.amount, 0)

        const completedAppointments = appointments.filter(a => a.status === 'completed').length
        const totalAppointments = appointments.length

        return {
          kpis: {
            revenue: {
              title: 'Receita Total',
              value: totalIncome,
              trend: 0,
              formatter: 'currency',
            },
            clients: {
              title: 'Clientes',
              value: new Set(appointments.map(a => a.client_id)).size,
              trend: 0,
              formatter: 'number',
            },
            appointments: {
              title: 'Agendamentos',
              value: totalAppointments,
              trend: totalAppointments > 0 ? (completedAppointments / totalAppointments) * 100 : 0,
              formatter: 'number',
            },
            loyaltyPoints: {
              title: 'Pontos Fidelidade',
              value: 0,
              trend: 0,
              formatter: 'number',
            },
          },
          revenueChart: appointments.map(a => ({
            date: a.scheduled_time,
            revenue: a.final_price || 0,
          })),
          servicesChart: [],
          recentActivities: appointments.slice(0, 5).map(a => ({
            id: a.id,
            client: a.client_id,
            service: a.service_id,
            date: a.scheduled_time,
            status: a.status as 'scheduled' | 'completed' | 'cancelled',
          })),
          lastUpdate: new Date().toISOString(),
        }
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Erro ao carregar dados',
          description: 'Não foi possível carregar os dados do dashboard.',
        })
        throw error
      }
    },
    staleTime: 5 * 60 * 1000, // Cache por 5 minutos
    refetchOnWindowFocus: false,
  })
}
