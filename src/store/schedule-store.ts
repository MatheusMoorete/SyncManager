/**
 * @store ScheduleStore
 * @description Gerenciamento centralizado de agendamentos com suporte a CRUD, verificação de disponibilidade e filtros
 */

import { create } from 'zustand'
import { toast } from 'sonner'
import {
  addDays,
  format,
  parse,
  isWithinInterval,
  areIntervalsOverlapping,
  parseISO,
} from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  Appointment,
  AppointmentFormValues,
  ScheduleFilters,
  TimeSlot,
  BusinessHours,
} from '@/types/schedule'
import { useServiceStore } from '@/store/service-store'
import { useCustomerStore } from '@/store/customer-store'
import { db } from '@/lib/firebase'
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  Timestamp,
  orderBy,
  getDoc,
  DocumentData,
} from 'firebase/firestore'
import { useAuthStore } from './auth-store'

/**
 * @const businessHours
 * @description Configuração padrão do horário de funcionamento
 */
const businessHours: BusinessHours = {
  start: '09:00',
  end: '18:00',
  interval: 30, // 30 minutos
  daysOff: [0], // domingo
}

/**
 * @interface AppointmentError
 * @description Estrutura de erro customizada para operações com agendamentos
 */
interface AppointmentError extends Error {
  message: string
  code?: string
}

/**
 * @interface ScheduleState
 * @description Estado global do gerenciamento de agendamentos
 */
interface ScheduleState {
  appointments: Appointment[]
  selectedDate: Date
  loading: boolean
  isLoading: boolean
  filters: ScheduleFilters
  businessHours: BusinessHours
  actions: {
    /** Busca todos os agendamentos aplicando os filtros atuais */
    fetchAppointments: () => Promise<void>
    /** Cria um novo agendamento */
    createAppointment: (data: AppointmentFormValues) => Promise<void>
    /** Atualiza os dados de um agendamento existente */
    updateAppointment: (id: string, data: AppointmentFormValues) => Promise<void>
    /** Remove um agendamento */
    deleteAppointment: (id: string) => Promise<void>
    /** Atualiza os filtros de busca */
    updateFilters: (filters: Partial<ScheduleFilters>) => void
    /** Define a data selecionada no calendário */
    setSelectedDate: (date: Date) => void
    /** Retorna os horários disponíveis para uma data e duração específicas */
    getAvailableTimeSlots: (date: Date, duration: string) => TimeSlot[]
    /** Verifica se um horário específico está disponível */
    checkAvailability: (
      date: Date,
      time: string,
      duration: string,
      currentAppointmentId?: string
    ) => boolean
  }
}

interface AppointmentData {
  ownerId: string
  client_id: string
  service_id: string
  scheduled_time: Timestamp
  actual_duration: string | null
  final_price: string
  status: 'scheduled' | 'completed' | 'canceled' | 'no_show'
  notes: string | null
  discount: number | null
  created_at: Timestamp
  paymentMethod: 'cash' | 'credit_card' | 'debit_card' | 'pix' | null
}

/**
 * @hook useScheduleStore
 * @description Hook Zustand para gerenciamento de estado dos agendamentos
 * @example
 * const { appointments, isLoading, actions } = useScheduleStore()
 *
 * // Buscar agendamentos
 * useEffect(() => {
 *   actions.fetchAppointments()
 * }, [])
 *
 * // Verificar disponibilidade
 * const isAvailable = actions.checkAvailability(
 *   new Date(),
 *   '14:00',
 *   '01:00:00'
 * )
 */
export const useScheduleStore = create<ScheduleState>((set, get) => ({
  appointments: [],
  selectedDate: new Date(),
  loading: false,
  isLoading: false,
  filters: {
    search: '',
    date: new Date(),
  },
  businessHours,
  actions: {
    fetchAppointments: async () => {
      const { user } = useAuthStore.getState()
      if (!user) throw new Error('Usuário não autenticado')

      try {
        set({ loading: true })
        const { filters } = get()

        let q = query(
          collection(db, 'appointments'),
          where('ownerId', '==', user.uid),
          orderBy('scheduled_time', 'asc')
        )

        // Filtrar por intervalo de datas ou data específica
        if (filters.startDate && filters.endDate) {
          q = query(
            q,
            where('scheduled_time', '>=', Timestamp.fromDate(filters.startDate)),
            where('scheduled_time', '<', Timestamp.fromDate(filters.endDate))
          )
        } else if (filters.date) {
          const startOfDay = new Date(filters.date)
          startOfDay.setHours(0, 0, 0, 0)
          const endOfDay = new Date(filters.date)
          endOfDay.setHours(23, 59, 59, 999)

          q = query(
            q,
            where('scheduled_time', '>=', Timestamp.fromDate(startOfDay)),
            where('scheduled_time', '<=', Timestamp.fromDate(endOfDay))
          )
        }

        if (filters.status) {
          q = query(q, where('status', '==', filters.status.toLowerCase()))
        }

        if (filters.clientId) {
          q = query(q, where('client_id', '==', filters.clientId))
        }

        if (filters.serviceId) {
          q = query(q, where('service_id', '==', filters.serviceId))
        }

        const snapshot = await getDocs(q)
        const appointments: Appointment[] = []

        // Buscar detalhes do cliente e serviço para cada agendamento
        for (const docSnapshot of snapshot.docs) {
          const appointmentData = docSnapshot.data()
          const [clientDoc, serviceDoc] = await Promise.all([
            getDoc(doc(db, 'customers', appointmentData.client_id)),
            getDoc(doc(db, 'services', appointmentData.service_id)),
          ])

          if (clientDoc.exists() && serviceDoc.exists()) {
            const clientData = clientDoc.data()
            const serviceData = serviceDoc.data()

            // Filtrar por termo de busca nos dados do cliente ou serviço
            if (filters.search) {
              const searchTerm = filters.search.toLowerCase()
              const matchesSearch =
                clientData.full_name.toLowerCase().includes(searchTerm) ||
                serviceData.name.toLowerCase().includes(searchTerm)

              if (!matchesSearch) continue
            }

            appointments.push({
              id: docSnapshot.id,
              client_id: appointmentData.client_id,
              service_id: appointmentData.service_id,
              scheduled_time: appointmentData.scheduled_time.toDate().toISOString(),
              actual_duration: appointmentData.actual_duration || null,
              final_price: appointmentData.final_price.toString(),
              status: appointmentData.status,
              notes: appointmentData.notes || null,
              discount: appointmentData.discount || null,
              created_at: appointmentData.created_at.toDate().toISOString(),
              client: {
                full_name: clientData.full_name,
                phone: clientData.phone,
              },
              service: {
                name: serviceData.name,
                duration: serviceData.duration,
                base_price: serviceData.price.toString(),
              },
            } as Appointment)
          }
        }

        set({ appointments })
      } catch (error) {
        console.error('Error fetching appointments:', error)
        toast.error('Erro ao carregar agendamentos')
      } finally {
        set({ loading: false })
      }
    },

    createAppointment: async (data: AppointmentFormValues) => {
      const { user } = useAuthStore.getState()
      if (!user) throw new Error('Usuário não autenticado')

      try {
        set({ loading: true })

        // Buscar o serviço
        const serviceStore = useServiceStore.getState()
        const service = serviceStore.services.find(s => s.id === data.service_id)
        if (!service) {
          throw new Error('Serviço não encontrado')
        }

        // Buscar o cliente
        const customerStore = useCustomerStore.getState()
        const client = customerStore.customers.find(c => c.id === data.client_id)
        if (!client) {
          throw new Error('Cliente não encontrado')
        }

        // Verificar disponibilidade
        const appointmentDate = new Date(data.scheduled_time)
        const isAvailable = get().actions.checkAvailability(
          appointmentDate,
          format(appointmentDate, 'HH:mm'),
          `${Math.floor(service.duration / 60)}:${service.duration % 60}`
        )

        if (!isAvailable) {
          throw new Error('Horário indisponível')
        }

        // Criar o agendamento no Firestore
        const appointmentData = {
          ...data,
          ownerId: user.uid,
          created_at: Timestamp.now(),
          scheduled_time: Timestamp.fromDate(new Date(data.scheduled_time)),
        }

        const docRef = await addDoc(collection(db, 'appointments'), appointmentData)

        // Buscar os dados completos do agendamento criado
        const [clientDoc, serviceDoc] = await Promise.all([
          getDoc(doc(db, 'customers', data.client_id)),
          getDoc(doc(db, 'services', data.service_id)),
        ])

        if (clientDoc.exists() && serviceDoc.exists()) {
          const clientData = clientDoc.data()!
          const serviceData = serviceDoc.data()!

          const newAppointment: Appointment = {
            id: docRef.id,
            client_id: data.client_id,
            service_id: data.service_id,
            scheduled_time: appointmentData.scheduled_time.toDate().toISOString(),
            actual_duration: data.actual_duration || null,
            final_price: data.final_price,
            status: data.status,
            notes: data.notes || null,
            discount: data.discount || null,
            created_at: appointmentData.created_at.toDate().toISOString(),
            client: {
              full_name: clientData.full_name,
              phone: clientData.phone,
            },
            service: {
              name: serviceData.name,
              duration: serviceData.duration,
              base_price: serviceData.price.toString(),
            },
          }

          set(state => ({
            appointments: [...state.appointments, newAppointment],
          }))

          toast.success('Agendamento criado com sucesso!')
        }
      } catch (error) {
        const appointmentError = error as AppointmentError
        console.error('Error creating appointment:', appointmentError)
        toast.error(appointmentError.message || 'Erro ao criar agendamento')
      } finally {
        set({ loading: false })
      }
    },

    updateAppointment: async (id: string, data: AppointmentFormValues) => {
      const { user } = useAuthStore.getState()
      if (!user) throw new Error('Usuário não autenticado')

      try {
        set({ loading: true })

        // Buscar o serviço
        const serviceStore = useServiceStore.getState()
        const service = serviceStore.services.find(s => s.id === data.service_id)
        if (!service) {
          throw new Error('Serviço não encontrado')
        }

        // Verificar disponibilidade se a data ou hora mudou
        const currentAppointment = get().appointments.find(a => a.id === id)
        if (!currentAppointment) {
          throw new Error('Agendamento não encontrado')
        }

        if (data.scheduled_time !== currentAppointment.scheduled_time) {
          const appointmentDate = new Date(data.scheduled_time)
          const isAvailable = get().actions.checkAvailability(
            appointmentDate,
            format(appointmentDate, 'HH:mm'),
            `${Math.floor(service.duration / 60)}:${service.duration % 60}`,
            id
          )

          if (!isAvailable) {
            throw new Error('Horário indisponível')
          }
        }

        // Atualizar o agendamento no Firestore
        const appointmentData = {
          ...data,
          scheduled_time: Timestamp.fromDate(new Date(data.scheduled_time)),
        }

        await updateDoc(doc(db, 'appointments', id), appointmentData)

        // Buscar os dados atualizados
        const [clientDoc, serviceDoc] = await Promise.all([
          getDoc(doc(db, 'customers', data.client_id)),
          getDoc(doc(db, 'services', data.service_id)),
        ])

        if (clientDoc.exists() && serviceDoc.exists()) {
          const clientData = clientDoc.data()!
          const serviceData = serviceDoc.data()!

          const updatedAppointment: Appointment = {
            id,
            client_id: data.client_id,
            service_id: data.service_id,
            scheduled_time: appointmentData.scheduled_time.toDate().toISOString(),
            actual_duration: data.actual_duration || null,
            final_price: data.final_price,
            status: data.status,
            notes: data.notes || null,
            discount: data.discount || null,
            created_at: currentAppointment.created_at,
            client: {
              full_name: clientData.full_name,
              phone: clientData.phone,
            },
            service: {
              name: serviceData.name,
              duration: serviceData.duration,
              base_price: serviceData.price.toString(),
            },
          }

          set(state => ({
            appointments: state.appointments.map(a => (a.id === id ? updatedAppointment : a)),
          }))

          toast.success('Agendamento atualizado com sucesso!')
        }
      } catch (error) {
        const appointmentError = error as AppointmentError
        console.error('Error updating appointment:', appointmentError)
        toast.error(appointmentError.message || 'Erro ao atualizar agendamento')
      } finally {
        set({ loading: false })
      }
    },

    deleteAppointment: async (id: string) => {
      const { user } = useAuthStore.getState()
      if (!user) throw new Error('Usuário não autenticado')

      try {
        set({ loading: true })

        await deleteDoc(doc(db, 'appointments', id))

        set(state => ({
          appointments: state.appointments.filter(a => a.id !== id),
        }))

        toast.success('Agendamento excluído com sucesso!')
      } catch (error) {
        console.error('Error deleting appointment:', error)
        toast.error('Erro ao excluir agendamento')
      } finally {
        set({ loading: false })
      }
    },

    updateFilters: (filters: Partial<ScheduleFilters>) => {
      set(state => ({
        filters: {
          ...state.filters,
          ...filters,
        },
      }))
      get().actions.fetchAppointments()
    },

    setSelectedDate: (date: Date) => {
      set({ selectedDate: date })
    },

    getAvailableTimeSlots: (date: Date, duration: string) => {
      const { appointments, businessHours } = get()
      const slots: TimeSlot[] = []
      const [hours, minutes] = duration.split(':').map(Number)
      const durationInMinutes = hours * 60 + minutes

      // Verificar se é um dia de funcionamento
      const dayOfWeek = date.getDay()
      if (businessHours.daysOff.includes(dayOfWeek)) {
        return slots
      }

      // Gerar slots de horário
      const startTime = parse(businessHours.start, 'HH:mm', date)
      const endTime = parse(businessHours.end, 'HH:mm', date)
      let currentSlot = startTime

      while (currentSlot < endTime) {
        const slotEnd = addDays(currentSlot, 0)
        slotEnd.setMinutes(slotEnd.getMinutes() + durationInMinutes)

        if (slotEnd <= endTime) {
          const isAvailable = get().actions.checkAvailability(
            date,
            format(currentSlot, 'HH:mm'),
            duration
          )

          if (isAvailable) {
            slots.push({
              time: format(currentSlot, 'HH:mm'),
              available: true,
            })
          }
        }

        currentSlot.setMinutes(currentSlot.getMinutes() + businessHours.interval)
      }

      return slots
    },

    checkAvailability: (
      date: Date,
      time: string,
      duration: string,
      currentAppointmentId?: string
    ) => {
      const { appointments, businessHours } = get()

      // Verificar se é um dia de funcionamento
      const dayOfWeek = date.getDay()
      if (businessHours.daysOff.includes(dayOfWeek)) {
        return false
      }

      // Verificar se está dentro do horário de funcionamento
      const [hours, minutes] = duration.split(':').map(Number)
      const durationInMinutes = hours * 60 + minutes

      const appointmentStart = parse(time, 'HH:mm', date)
      const appointmentEnd = addDays(appointmentStart, 0)
      appointmentEnd.setMinutes(appointmentEnd.getMinutes() + durationInMinutes)

      const businessStart = parse(businessHours.start, 'HH:mm', date)
      const businessEnd = parse(businessHours.end, 'HH:mm', date)

      if (appointmentStart < businessStart || appointmentEnd > businessEnd) {
        return false
      }

      // Verificar conflitos com outros agendamentos
      const hasConflict = appointments.some(appointment => {
        if (currentAppointmentId && appointment.id === currentAppointmentId) {
          return false
        }

        const existingStart = appointment.scheduled_time
        const existingEnd = addDays(existingStart, 0)
        existingEnd.setMinutes(
          existingEnd.getMinutes() +
            parseInt(appointment.service.duration.split(':')[0]) * 60 +
            parseInt(appointment.service.duration.split(':')[1])
        )

        return areIntervalsOverlapping(
          { start: appointmentStart, end: appointmentEnd },
          { start: existingStart, end: existingEnd }
        )
      })

      return !hasConflict
    },
  },
}))
