import { db } from '@/lib/firebase'
import { collection, addDoc, query, where, getDocs, Timestamp, orderBy } from 'firebase/firestore'
import { useAuth } from '@/contexts/AuthContext'

interface AnalyticsEvent {
  id: string
  type: 'appointment_created' | 'appointment_completed' | 'client_added' | 'revenue'
  value?: number
  metadata: Record<string, any>
  createdAt: Timestamp
  ownerId: string
}

interface RevenueMetrics {
  daily: number
  weekly: number
  monthly: number
  appointmentsCount: number
  completionRate: number
}

export function useAnalytics() {
  const { user } = useAuth()

  const trackEvent = async (
    type: AnalyticsEvent['type'],
    value?: number,
    metadata: Record<string, any> = {}
  ) => {
    if (!user) throw new Error('Usuário não autenticado')

    return addDoc(collection(db, 'analytics'), {
      type,
      value,
      metadata,
      ownerId: user.uid,
      createdAt: Timestamp.now(),
    })
  }

  const getRevenueMetrics = async (startDate: Date, endDate: Date): Promise<RevenueMetrics> => {
    if (!user) throw new Error('Usuário não autenticado')

    const q = query(
      collection(db, 'analytics'),
      where('ownerId', '==', user.uid),
      where('type', '==', 'revenue'),
      where('createdAt', '>=', Timestamp.fromDate(startDate)),
      where('createdAt', '<=', Timestamp.fromDate(endDate)),
      orderBy('createdAt', 'desc')
    )

    const snapshot = await getDocs(q)
    const events = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as AnalyticsEvent[]

    const total = events.reduce((acc, event) => acc + (event.value || 0), 0)
    const appointmentsCount = events.length
    const completedAppointments = events.filter(e => e.metadata.status === 'completed').length

    return {
      daily: total / 30, // média diária
      weekly: total / 4, // média semanal
      monthly: total, // total mensal
      appointmentsCount,
      completionRate: appointmentsCount > 0 ? completedAppointments / appointmentsCount : 0,
    }
  }

  return {
    trackEvent,
    getRevenueMetrics,
  }
}
