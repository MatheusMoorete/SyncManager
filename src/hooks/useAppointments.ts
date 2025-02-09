import { db } from '@/lib/firebase'
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  getDocs,
  where,
  Timestamp,
} from 'firebase/firestore'
import { useAuth } from '@/contexts/AuthContext'

export interface Appointment {
  id: string
  clientId: string
  serviceId: string
  date: Timestamp
  status: 'scheduled' | 'completed' | 'cancelled'
  ownerId: string
  notes?: string
}

export interface AppointmentWithDate extends Omit<Appointment, 'date'> {
  date: Date
}

// Criando um tipo separado para os dados de entrada
export type AppointmentInput = Omit<Appointment, 'id' | 'ownerId' | 'status' | 'date'> & {
  date: Date
}

export function useAppointments() {
  const { user } = useAuth()

  const addAppointment = async (appointmentData: AppointmentInput) => {
    if (!user) throw new Error('Usuário não autenticado')

    return addDoc(collection(db, 'appointments'), {
      ...appointmentData,
      status: 'scheduled',
      ownerId: user.uid,
      date: Timestamp.fromDate(appointmentData.date),
      createdAt: new Date(),
    })
  }

  const updateAppointment = async (id: string, data: Partial<AppointmentWithDate>) => {
    const updateData = { ...data }
    if (data.date) {
      updateData.date = Timestamp.fromDate(data.date) as unknown as Date
    }
    return updateDoc(doc(db, 'appointments', id), updateData as Partial<Appointment>)
  }

  const deleteAppointment = async (id: string) => {
    return deleteDoc(doc(db, 'appointments', id))
  }

  const getAppointmentsByDate = async (startDate: Date, endDate: Date) => {
    if (!user) throw new Error('Usuário não autenticado')

    const q = query(
      collection(db, 'appointments'),
      where('ownerId', '==', user.uid),
      where('date', '>=', Timestamp.fromDate(startDate)),
      where('date', '<=', Timestamp.fromDate(endDate))
    )

    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => {
      const data = doc.data() as Omit<Appointment, 'id'>
      return {
        id: doc.id,
        ...data,
        date: data.date.toDate(),
      } as AppointmentWithDate
    })
  }

  return {
    addAppointment,
    updateAppointment,
    deleteAppointment,
    getAppointmentsByDate,
  }
}
