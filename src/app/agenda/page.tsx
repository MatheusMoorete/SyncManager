'use client'

import { AppointmentForm } from '@/components/agenda/appointment-form'
import { Calendar } from '@/components/agenda/calendar'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useCustomerStore } from '@/store/customer-store'

export default function AgendaPage() {
  const searchParams = useSearchParams()
  const { actions } = useCustomerStore()
  const [clientData, setClientData] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  // Verificar se há um cliente selecionado na URL
  useEffect(() => {
    const clientId = searchParams.get('client')
    if (clientId) {
      const loadClient = async () => {
        setLoading(true)
        try {
          // Buscar dados do cliente
          await actions.fetchCustomer(clientId)

          // Preparar dados iniciais para o formulário
          const customer = actions.getCustomerById(clientId)
          if (customer) {
            setClientData({
              client_id: customer.id,
              client: {
                id: customer.id,
                full_name: customer.full_name,
                phone: customer.phone,
                email: customer.email,
              },
            })
          }
        } catch (error) {
          console.error('Erro ao carregar cliente:', error)
        } finally {
          setLoading(false)
        }
      }

      loadClient()
    }
  }, [searchParams, actions])

  return (
    <div className="p-2 md:p-4">
      <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-4">
        <div className="w-full lg:w-[400px]">
          <AppointmentForm initialData={clientData} />
        </div>
        <Calendar />
      </div>
    </div>
  )
}
