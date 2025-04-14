'use client'

import { Calendar, MessageSquare, Gift, Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

interface CustomerActionsProps {
  customerId: string
  onSchedule: () => void
  onWhatsApp: () => void
  onOffer: () => void
  onReminder: () => void
}

export function CustomerActions({
  customerId,
  onSchedule,
  onWhatsApp,
  onOffer,
  onReminder,
}: CustomerActionsProps) {
  const router = useRouter()

  // Nova função para redirecionar para a página de agenda
  const handleScheduleRedirect = () => {
    router.push(`/agenda?client=${customerId}`)
  }

  return (
    <div className="bg-card border rounded-lg p-4">
      <h2 className="text-lg font-medium mb-3">Ações Rápidas</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Button
          variant="outline"
          className="flex flex-col h-auto py-4 gap-2 border-primary/20 hover:bg-primary/5 hover:border-primary/30"
          onClick={handleScheduleRedirect}
        >
          <Calendar className="h-5 w-5 text-primary" />
          <span>Agendar</span>
        </Button>

        <Button
          variant="outline"
          className="flex flex-col h-auto py-4 gap-2 border-green-500/20 hover:bg-green-500/5 hover:border-green-500/30"
          onClick={onWhatsApp}
        >
          <MessageSquare className="h-5 w-5 text-green-500" />
          <span>WhatsApp</span>
        </Button>

        <Button
          variant="outline"
          className="flex flex-col h-auto py-4 gap-2 border-amber-500/20 hover:bg-amber-500/5 hover:border-amber-500/30"
          onClick={onOffer}
        >
          <Gift className="h-5 w-5 text-amber-500" />
          <span>Oferta</span>
        </Button>

        <Button
          variant="outline"
          className="flex flex-col h-auto py-4 gap-2 border-blue-500/20 hover:bg-blue-500/5 hover:border-blue-500/30"
          onClick={onReminder}
        >
          <Bell className="h-5 w-5 text-blue-500" />
          <span>Lembrete</span>
        </Button>
      </div>
    </div>
  )
}
