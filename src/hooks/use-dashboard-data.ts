'use client'

import { useQuery } from '@tanstack/react-query'
import { db } from '@/lib/firebase'
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore'
import type { DashboardData, TimeRange } from '@/types/dashboard'
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/contexts/AuthContext'

interface FirestoreTransaction {
  id: string
  type: 'income' | 'expense'
  amount: number
  ownerId: string
  transactionDate: Timestamp
}

interface FirestoreAppointment {
  id: string
  client_id: string
  service_id: string
  scheduled_time: Timestamp
  final_price: number
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show'
  ownerId: string
}

interface FirestoreCustomer {
  id: string
  full_name: string
  ownerId: string
}

interface FirestoreService {
  id: string
  name: string
  ownerId: string
}

export function useDashboardData(timeRange: TimeRange) {
  const { toast } = useToast()
  const { user, loading } = useAuth()

  return useQuery<DashboardData | null>({
    queryKey: ['dashboard', timeRange, user?.uid],
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

        // Buscar clientes e serviços
        const customersRef = collection(db, 'customers')
        const customersQuery = query(customersRef, where('ownerId', '==', user.uid))
        const customersSnapshot = await getDocs(customersQuery)
        const customers = customersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as FirestoreCustomer[]

        const servicesRef = collection(db, 'services')
        const servicesQuery = query(servicesRef, where('ownerId', '==', user.uid))
        const servicesSnapshot = await getDocs(servicesQuery)
        const services = servicesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as FirestoreService[]

        // Calcular métricas
        const transactions = transactionsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as FirestoreTransaction[]

        const appointments = appointmentsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as FirestoreAppointment[]

        const totalIncome = transactions
          .filter(t => t.type === 'income')
          .reduce((sum, t) => sum + t.amount, 0)

        const totalExpenses = transactions
          .filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + t.amount, 0)

        const completedAppointments = appointments.filter(a => a.status === 'completed').length
        const totalAppointments = appointments.length

        const recentActivities = appointments.slice(0, 5).map(appointment => {
          const client = customers.find(c => c.id === appointment.client_id)
          const service = services.find(s => s.id === appointment.service_id)
          return {
            id: appointment.id,
            type: appointment.status,
            title: client?.full_name || 'Cliente não encontrado',
            description: service?.name || 'Serviço não encontrado',
            date: appointment.scheduled_time.toDate().toISOString(),
            value: appointment.final_price || 0,
            status: appointment.status,
          }
        })

        const dashboardData: DashboardData = {
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
            expenses: {
              title: 'Despesas',
              value: totalExpenses,
              trend: 0,
              formatter: 'currency',
            },
          },
          revenueChart: appointments
            .filter(a => a.status === 'completed')
            .map(a => ({
              date: a.scheduled_time.toDate().toISOString(),
              revenue: a.final_price || 0,
            }))
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
          servicesChart: [],
          birthdays: [],
          recentActivities,
          lastUpdate: new Date().toISOString(),
        }

        return dashboardData
      } catch (error) {
        console.error('Erro ao carregar dados do dashboard:', error)
        toast({
          variant: 'destructive',
          title: 'Erro ao carregar dados',
          description:
            error instanceof Error
              ? error.message
              : 'Não foi possível carregar os dados do dashboard.',
        })
        throw error
      }
    },
    enabled: !loading && !!user, // Só executa a query quando o usuário estiver carregado e autenticado
    staleTime: 5 * 60 * 1000, // Cache por 5 minutos
    refetchOnWindowFocus: false,
  })
}
