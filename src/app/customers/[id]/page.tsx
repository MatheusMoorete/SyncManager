'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import { AppLayout } from '@/components/layout/app-layout'
import { useCustomerStore } from '@/store/customer-store'
import { Skeleton } from '@/components/ui/skeleton'
import { useScheduleStore } from '@/store/schedule-store'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

// Importações dos componentes
import { CustomerHeader } from './components/CustomerHeader'
import { CustomerMetrics } from './components/CustomerMetrics'
import { CustomerCombinedCard } from './components/CustomerCombinedCard'
import { CustomerHistory } from './components/CustomerHistory'

// Diálogos
import { ScheduleDialog } from './components/dialogs/ScheduleDialog'
import { WhatsAppDialog } from './components/dialogs/WhatsAppDialog'
import { OfferDialog } from './components/dialogs/OfferDialog'
import { ReminderDialog } from './components/dialogs/ReminderDialog'

export default function CustomerDetailsPage() {
  const { id } = useParams() as { id: string }
  const { selectedCustomer: customer, loading, actions } = useCustomerStore()
  const { appointments, actions: scheduleActions } = useScheduleStore()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('general')

  // Estados para os diálogos
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false)
  const [whatsappDialogOpen, setWhatsappDialogOpen] = useState(false)
  const [offerDialogOpen, setOfferDialogOpen] = useState(false)
  const [reminderDialogOpen, setReminderDialogOpen] = useState(false)

  // Carregar dados do cliente
  useEffect(() => {
    const loadCustomerData = async () => {
      try {
        await actions.fetchCustomer(id)
      } catch (error) {
        console.error('Erro ao carregar dados do cliente:', error)
      }
    }

    loadCustomerData()
  }, [id, actions])

  // Carregar agendamentos do cliente
  useEffect(() => {
    const loadAppointments = async () => {
      try {
        await scheduleActions.fetchCustomerAppointments(id)
      } catch (error) {
        console.error('Erro ao carregar agendamentos:', error)
      }
    }

    loadAppointments()
  }, [id, scheduleActions])

  // Handlers para abrir diálogos
  const handleScheduleDialog = () => setScheduleDialogOpen(true)
  const handleWhatsAppDialog = () => setWhatsappDialogOpen(true)
  const handleOfferDialog = () => setOfferDialogOpen(true)
  const handleReminderDialog = () => setReminderDialogOpen(true)

  // Função para voltar para a página anterior
  const handleGoBack = () => {
    router.push('/customers')
  }

  // Renderização do loading state
  if (loading || !customer) {
    return (
      <AppLayout>
        <div className="p-4 md:p-8 space-y-6">
          <Skeleton className="h-12 w-2/3" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="flex flex-col min-h-full p-4 md:p-8 space-y-6 md:space-y-8">
        {/* Botão Voltar */}
        <Button
          variant="ghost"
          className="w-fit p-0 flex items-center text-muted-foreground hover:text-foreground"
          onClick={handleGoBack}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          <span>Voltar para clientes</span>
        </Button>

        {/* Cabeçalho com informações do cliente */}
        <CustomerHeader customer={customer} />

        {/* Métricas e indicadores */}
        <CustomerMetrics customer={customer} appointments={appointments} />

        {/* Abas: Geral e Histórico */}
        <Tabs defaultValue="general" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 w-full max-w-xs mb-6">
            <TabsTrigger value="general">Geral</TabsTrigger>
            <TabsTrigger value="history">Histórico</TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            {/* Card combinado: Preferências + Ações Rápidas */}
            <CustomerCombinedCard
              customer={customer}
              onUpdateCustomer={actions.updateCustomer}
              onSchedule={() => handleScheduleDialog()}
              onWhatsApp={handleWhatsAppDialog}
              onOffer={handleOfferDialog}
              onReminder={handleReminderDialog}
            />
          </TabsContent>

          <TabsContent value="history">
            {/* Histórico de atendimentos */}
            <CustomerHistory customerId={id} appointments={appointments} />
          </TabsContent>
        </Tabs>

        {/* Diálogos */}
        <ScheduleDialog
          open={scheduleDialogOpen}
          onOpenChange={setScheduleDialogOpen}
          customer={customer}
        />

        <WhatsAppDialog
          open={whatsappDialogOpen}
          onOpenChange={setWhatsappDialogOpen}
          customer={customer}
        />

        <OfferDialog open={offerDialogOpen} onOpenChange={setOfferDialogOpen} customer={customer} />

        <ReminderDialog
          open={reminderDialogOpen}
          onOpenChange={setReminderDialogOpen}
          customer={customer}
        />
      </div>
    </AppLayout>
  )
}
