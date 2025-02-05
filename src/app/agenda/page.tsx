'use client'

import { AppointmentForm } from '@/components/agenda/appointment-form'
import { Calendar } from '@/components/agenda/calendar'

export default function AgendaPage() {
  return (
    <div className="p-2 md:p-4">
      <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-4">
        <div className="w-full lg:w-[400px]">
          <AppointmentForm />
        </div>
        <Calendar />
      </div>
    </div>
  )
} 