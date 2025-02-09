'use client'

import { useEffect, Suspense } from 'react'
import { Plus } from 'lucide-react'
import { format, parse } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useCustomerStore } from '@/store/customer-store'
import { CustomerFormValues } from '@/types/customer'
import { AppLayout } from '@/components/layout/app-layout'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

// Componentes carregados dinamicamente
const CustomerList = dynamic(
  () => import('@/components/customers/customer-list').then(mod => mod.CustomerList),
  {
    loading: () => <CustomerListSkeleton />,
    ssr: false,
  }
)

const CustomerDialog = dynamic(
  () => import('@/components/customers/dialogs/customer-dialog').then(mod => mod.CustomerDialog),
  {
    ssr: false,
  }
)

// Skeleton loader para a lista de clientes
function CustomerListSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {[...Array(6)].map((_, i) => (
        <Skeleton key={i} className="h-[120px] rounded-lg" />
      ))}
    </div>
  )
}

export default function CustomersPage() {
  const { customers, loading, actions } = useCustomerStore()
  const router = useRouter()

  useEffect(() => {
    actions.fetchCustomers()
  }, [actions])

  const handleUpdateCustomer = async (id: string, data: CustomerFormValues) => {
    await actions.updateCustomer(id, data)
  }

  const handleDeleteCustomer = async (id: string) => {
    await actions.deleteCustomer(id)
  }

  const handleCreateCustomer = async (data: CustomerFormValues) => {
    await actions.createCustomer(data)
  }

  const formatBirthDate = (date: string | null | undefined) => {
    if (!date) return undefined
    try {
      // Se a data já estiver no formato DD/MM/YYYY, retorna como está
      if (date.includes('/')) {
        return date
      }
      // Se estiver no formato YYYY-MM-DD, converte para DD/MM/YYYY
      const parsedDate = parse(date, 'yyyy-MM-dd', new Date())
      return format(parsedDate, 'dd/MM/yyyy', { locale: ptBR })
    } catch {
      return date
    }
  }

  // Função para navegar para os detalhes do cliente
  const handleCustomerClick = (id: string) => {
    router.push(`/customers/${id}`)
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="flex flex-col gap-4 p-4 md:gap-6 lg:gap-8 md:p-6 lg:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-semibold font-heading text-heading">Clientes</h1>
              <p className="text-sm text-muted-foreground">
                Gerencie seus clientes e histórico de atendimentos
              </p>
            </div>
          </div>
          <CustomerListSkeleton />
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-semibold font-heading text-heading">Clientes</h2>
            <p className="text-sm text-muted-foreground">
              Gerencie seus clientes e histórico de atendimentos
            </p>
          </div>

          {/* Desktop New Customer Button */}
          <div className="hidden sm:block">
            <CustomerDialog
              trigger={
                <Button className="bg-terracotta hover:bg-terracotta/90 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  <span>Novo Cliente</span>
                </Button>
              }
              onSubmit={handleCreateCustomer}
              isLoading={loading}
            />
          </div>
        </div>

        {/* Lista de Clientes com Suspense */}
        <Suspense fallback={<CustomerListSkeleton />}>
          <CustomerList
            customers={customers}
            onUpdate={handleUpdateCustomer}
            onDelete={handleDeleteCustomer}
            isLoading={loading}
          />
        </Suspense>

        {/* Mobile FAB */}
        <div className="fixed right-4 bottom-4 sm:hidden">
          <CustomerDialog
            trigger={
              <Button
                size="icon"
                className="h-14 w-14 rounded-full bg-terracotta hover:bg-terracotta/90 text-white shadow-lg hover:shadow-xl transition-all"
              >
                <Plus className="h-6 w-6" />
              </Button>
            }
            onSubmit={handleCreateCustomer}
            isLoading={loading}
          />
        </div>
      </div>
    </AppLayout>
  )
}
