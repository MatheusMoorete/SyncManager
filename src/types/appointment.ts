export type Appointment = {
  id: string
  clientId: string
  serviceId: string
  professionalId: string
  date: Date
  duration: number // em minutos
  status: 'SCHEDULED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'
  price: number
  discount?: number // 0-1 (%)
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export type CalendarViewMode = 'day' | 'week' | 'work_week'

export type AppointmentFormData = Omit<
  Appointment,
  'id' | 'status' | 'createdAt' | 'updatedAt'
> 