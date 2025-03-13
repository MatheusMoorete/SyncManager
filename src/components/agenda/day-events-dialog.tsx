import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Appointment } from '@/types/schedule'
import { cn } from '@/lib/utils'

interface DayEventsDialogProps {
  date: Date
  appointments: Appointment[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onAppointmentClick: (appointment: Appointment) => void
}

export function DayEventsDialog({
  date,
  appointments,
  open,
  onOpenChange,
  onAppointmentClick,
}: DayEventsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Agendamentos - {format(date, "d 'de' MMMM", { locale: ptBR })}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[400px] mt-4">
          <div className="space-y-2 pr-4">
            {appointments
              .sort(
                (a, b) =>
                  new Date(a.scheduled_time).getTime() - new Date(b.scheduled_time).getTime()
              )
              .map(appointment => (
                <div
                  key={appointment.id}
                  onClick={() => onAppointmentClick(appointment)}
                  className={cn('p-3 rounded cursor-pointer hover:opacity-80', {
                    'bg-emerald-100 text-emerald-800': appointment.status === 'scheduled',
                    'bg-green-100 text-green-800': appointment.status === 'completed',
                    'bg-rose-100 text-rose-800': appointment.status === 'canceled',
                    'bg-slate-100 text-slate-800': appointment.status === 'no_show',
                  })}
                >
                  <div className="font-medium">
                    {format(new Date(appointment.scheduled_time), 'HH:mm')} -{' '}
                    {appointment.client.full_name}
                  </div>
                  <div className="text-sm mt-1">{appointment.service.name}</div>
                </div>
              ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
