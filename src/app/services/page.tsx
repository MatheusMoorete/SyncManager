'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ServiceList } from '@/components/services/service-list'
import { ServiceDialog } from '@/components/services/service-dialog'
import { ServiceFormValues } from '@/types/service'
import { useToast } from '@/components/ui/use-toast'
import { useServiceStore } from '@/store/service-store'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

export default function ServicesPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setloading] = useState(false)
  const { services, actions } = useServiceStore()

  const handleCreateService = async (data: ServiceFormValues) => {
    try {
      setloading(true)
      await actions.createService(data)
      toast({
        title: 'Serviço criado com sucesso!',
        description: `O serviço ${data.name} foi adicionado à sua lista.`,
      })
      router.refresh()
    } catch (error) {
      toast({
        title: 'Erro ao criar serviço',
        description: 'Ocorreu um erro ao criar o serviço. Tente novamente.',
        variant: 'destructive',
      })
    } finally {
      setloading(false)
    }
  }

  const handleUpdateService = async (id: string, data: ServiceFormValues) => {
    try {
      setloading(true)
      await actions.updateService(id, data)
      toast({
        title: 'Serviço atualizado com sucesso!',
        description: `O serviço ${data.name} foi atualizado.`,
      })
      router.refresh()
    } catch (error) {
      toast({
        title: 'Erro ao atualizar serviço',
        description: 'Ocorreu um erro ao atualizar o serviço. Tente novamente.',
        variant: 'destructive',
      })
    } finally {
      setloading(false)
    }
  }

  const handleDeleteService = async (id: string) => {
    try {
      setloading(true)
      await actions.deleteService(id)
      toast({
        title: 'Serviço excluído com sucesso!',
        description: 'O serviço foi removido da sua lista.',
      })
      router.refresh()
    } catch (error) {
      toast({
        title: 'Erro ao excluir serviço',
        description: 'Ocorreu um erro ao excluir o serviço. Tente novamente.',
        variant: 'destructive',
      })
    } finally {
      setloading(false)
    }
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-semibold font-heading text-heading">Serviços</h2>
          <p className="text-sm text-muted-foreground">
            Gerencie seus serviços e histórico de atendimentos
          </p>
        </div>
        {/* Desktop Button */}
        <div className="hidden sm:block">
          <ServiceDialog
            trigger={
              <Button className="bg-terracotta hover:bg-terracotta/90 text-white">
                <Plus className="h-4 w-4 mr-2" />
                <span>Novo Serviço</span>
              </Button>
            }
            onSubmit={handleCreateService}
            loading={loading}
          />
        </div>
      </div>

      <ServiceList
        services={services}
        onUpdate={handleUpdateService}
        onDelete={handleDeleteService}
        loading={loading}
      />

      {/* Mobile FAB */}
      <div className="sm:hidden">
        <ServiceDialog
          trigger={
            <Button
              size="icon"
              className="h-14 w-14 rounded-full bg-terracotta hover:bg-terracotta/90 text-white shadow-lg hover:shadow-xl transition-all fixed right-4 bottom-4"
            >
              <Plus className="h-6 w-6" />
            </Button>
          }
          onSubmit={handleCreateService}
          loading={loading}
        />
      </div>
    </div>
  )
}
