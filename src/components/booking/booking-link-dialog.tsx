'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
} from 'firebase/firestore'
import { Info } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { db } from '@/lib/firebase'
import { cn } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { useToast } from '@/components/ui/use-toast'
import { MultiSelect } from '@/components/ui/multi-select'
import { useAuth } from '@/hooks/use-auth'
import { useBookingLinkStore } from '@/store/booking-link-store'

export interface Service {
  id: string
  name: string
  is_active: boolean
  price?: number
  duration?: number
}

export interface BookingLinkFormData {
  name: string
  services: string[]
  days_in_advance: number
  is_active: boolean
}

const formSchema = z.object({
  name: z.string().min(1, {
    message: 'Nome é obrigatório',
  }),
  services: z.array(z.string()).min(1, {
    message: 'Selecione pelo menos um serviço disponível',
  }),
  days_in_advance: z.coerce
    .number()
    .int()
    .min(1, {
      message: 'Deve ser pelo menos 1 dia',
    })
    .max(60, {
      message: 'Não pode ser mais de 60 dias',
    }),
  is_active: z.boolean().default(true),
})

interface BookingLinkDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  linkId?: string
}

export function BookingLinkDialog({ open, onOpenChange, linkId }: BookingLinkDialogProps) {
  const [services, setServices] = useState<Service[]>([])
  const [servicesLoaded, setServicesLoaded] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  const { user } = useAuth()

  const bookingLinkActions = useBookingLinkStore(state => state.actions)

  const form = useForm<BookingLinkFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      services: [],
      days_in_advance: 7,
      is_active: true,
    },
  })

  // Memoize service options para evitar recálculos desnecessários
  const serviceOptions = useMemo(() => {
    return services.map(service => ({
      value: service.id,
      label: service.name,
    }))
  }, [services])

  // Função para selecionar todos os serviços
  const selectAllServices = useCallback(() => {
    const allServiceIds = services.map(service => service.id)
    form.setValue('services', allServiceIds)
  }, [services, form])

  // Carregar serviços apenas uma vez quando o diálogo é aberto pela primeira vez
  useEffect(() => {
    let isMounted = true

    const fetchServices = async () => {
      if (!open || servicesLoaded || !user) return

      try {
        // Filtrar serviços APENAS do usuário atual
        const servicesCollection = collection(db, 'services')
        const servicesQuery = query(servicesCollection, where('ownerId', '==', user.uid))
        const querySnapshot = await getDocs(servicesQuery)

        if (isMounted) {
          if (querySnapshot.empty) {
            toast({
              title: 'Nenhum serviço encontrado',
              description: 'Cadastre serviços primeiro para criar links de agendamento.',
              variant: 'destructive',
            })
            return
          }

          const servicesData = querySnapshot.docs.map(doc => ({
            id: doc.id,
            name: doc.data().name,
            price: doc.data().price,
            duration: doc.data().duration,
          }))

          console.log('Serviços do usuário carregados:', servicesData)
          setServices(servicesData)
          setServicesLoaded(true)

          // Se for uma nova criação (não um edit), selecionar todos os serviços por padrão
          if (!linkId) {
            const allServiceIds = servicesData.map(service => service.id)
            form.setValue('services', allServiceIds)
          }
        }
      } catch (error) {
        console.error('Erro ao carregar serviços:', error)
        if (isMounted) {
          toast({
            title: 'Erro ao carregar serviços',
            description: 'Tente novamente mais tarde.',
            variant: 'destructive',
          })
        }
      }
    }

    fetchServices()

    return () => {
      isMounted = false
    }
  }, [open, toast, servicesLoaded, user, linkId, form])

  // Resetar o estado de carregamento quando o diálogo é fechado
  useEffect(() => {
    if (!open) {
      setServicesLoaded(false)
    }
  }, [open])

  // Carregar dados do link se estiver editando
  useEffect(() => {
    let isMounted = true

    const fetchLinkData = async () => {
      if (!linkId || !open || !user) return

      try {
        console.log('Carregando dados do link:', linkId)
        const docRef = doc(db, 'booking_links', linkId)
        const docSnap = await getDoc(docRef)

        if (docSnap.exists() && isMounted) {
          const data = docSnap.data()
          console.log('Dados do link carregados:', data)

          // Verificar se o usuário atual é o dono do link
          if (data.ownerId !== user.uid) {
            toast({
              title: 'Acesso negado',
              description: 'Você não tem permissão para acessar este link de agendamento.',
              variant: 'destructive',
            })
            onOpenChange(false)
            return
          }

          // Garantir que os serviços sejam uma array de strings válida
          const services = Array.isArray(data.services) ? data.services : []

          form.reset({
            name: data.name || '',
            services: services,
            days_in_advance: data.days_in_advance || 7,
            is_active: data.is_active !== false,
          })
        }
      } catch (error) {
        console.error('Error fetching booking link:', error)
        if (isMounted) {
          toast({
            title: 'Erro ao carregar link',
            description: 'Não foi possível carregar os dados do link. Tente novamente mais tarde.',
            variant: 'destructive',
          })
        }
      }
    }

    fetchLinkData()

    return () => {
      isMounted = false
    }
  }, [linkId, form, toast, open, user, onOpenChange])

  const onSubmit = useCallback(
    async (data: BookingLinkFormData) => {
      if (!user) {
        console.error('Tentativa de criar link sem usuário autenticado')
        toast({
          title: 'Não autenticado',
          description: 'Você precisa estar logado para criar ou editar links.',
          variant: 'destructive',
        })
        return
      }

      setIsSubmitting(true)
      console.log('Dados do formulário recebidos:', data)

      try {
        // Verificações de dados antes de salvar
        if (!data.name || data.name.trim() === '') {
          throw new Error('O nome do link é obrigatório')
        }

        if (!data.services || data.services.length === 0) {
          throw new Error('É necessário selecionar pelo menos um serviço')
        }

        // Marcar os serviços selecionados como disponíveis para booking público
        const markServicesAsPublic = async (serviceIds: string[]) => {
          try {
            console.log('Marcando serviços como públicos:', serviceIds)
            for (const serviceId of serviceIds) {
              const serviceRef = doc(db, 'services', serviceId)
              await updateDoc(serviceRef, {
                public_booking: true,
              })
            }
            console.log('Serviços marcados como públicos com sucesso')
          } catch (error) {
            console.error('Erro ao marcar serviços como públicos:', error)
            throw new Error('Erro ao atualizar serviços para agendamento público')
          }
        }

        // Executar a função para marcar serviços como públicos
        await markServicesAsPublic(data.services)

        // Converter os dados do formulário para o formato da store
        // Garantir que ambos os campos de status estejam definidos
        const isActive = data.is_active !== false
        const bookingLinkData = {
          name: data.name.trim(),
          description: data.name.trim(), // Usar nome como descrição
          services: data.services,
          daysInAdvance: data.days_in_advance,
          active: isActive,
          is_active: isActive, // Duplicar o campo para garantir compatibilidade
        }

        if (linkId) {
          // Atualizar link existente
          console.log('Atualizando link existente via store:', linkId)
          await bookingLinkActions.updateBookingLink(linkId, bookingLinkData)

          toast({
            title: 'Link atualizado',
            description: 'O link de agendamento foi atualizado com sucesso.',
          })
        } else {
          // Criar novo link usando a store
          console.log('Criando novo link de agendamento via store')
          const newLinkId = await bookingLinkActions.createBookingLink(bookingLinkData)
          console.log('Novo link criado com ID:', newLinkId)

          toast({
            title: 'Link criado',
            description: 'Um novo link de agendamento foi criado com sucesso.',
          })
        }

        // Fechar diálogo e atualizar UI
        onOpenChange(false)
        form.reset()

        // Forçar atualização da página
        console.log('Atualizando a página...')
        setTimeout(() => {
          router.refresh()
        }, 500)
      } catch (error) {
        console.error('Erro ao salvar link de agendamento:', error)
        toast({
          title: 'Erro ao salvar',
          description:
            error instanceof Error
              ? error.message
              : 'Não foi possível salvar o link de agendamento. Tente novamente mais tarde.',
          variant: 'destructive',
        })
      } finally {
        setIsSubmitting(false)
      }
    },
    [linkId, toast, onOpenChange, form, router, user, bookingLinkActions]
  )

  // Lógica para redirecionar para a página de serviços
  const goToServicesPage = useCallback(() => {
    onOpenChange(false) // Fecha o diálogo atual
    router.push('/services') // Redireciona para a página de serviços
  }, [onOpenChange, router])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>
            {linkId ? 'Editar link de agendamento' : 'Criar link de agendamento'}
          </DialogTitle>
        </DialogHeader>

        {services.length === 0 && servicesLoaded ? (
          <div className="py-6 text-center space-y-4">
            <p className="text-muted-foreground">
              Você não possui serviços ativos cadastrados. É necessário cadastrar pelo menos um
              serviço para criar links de agendamento.
            </p>
            <Button onClick={goToServicesPage}>Ir para cadastro de serviços</Button>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 py-4">
              {/* Nome do Link */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do link</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Consulta de assessoria" {...field} />
                    </FormControl>
                    <FormDescription>
                      Este nome é apenas para sua identificação e não será exibido aos clientes.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Serviços disponíveis */}
              <FormField
                control={form.control}
                name="services"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex justify-between items-center">
                      <FormLabel>Serviços disponíveis</FormLabel>
                      <div className="flex gap-2">
                        {field.value.length > 0 && (
                          <span className="text-xs text-muted-foreground py-1">
                            {field.value.length} de {services.length} selecionados
                          </span>
                        )}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={goToServicesPage}
                          className="h-8 text-xs"
                        >
                          Gerenciar serviços
                        </Button>
                      </div>
                    </div>
                    <FormControl>
                      <MultiSelect
                        options={serviceOptions}
                        placeholder="Selecione os serviços para este link"
                        value={field.value}
                        onChange={field.onChange}
                        allowSelectAll={true}
                      />
                    </FormControl>
                    <FormDescription>
                      Escolha quais serviços estarão disponíveis neste link de agendamento.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Dias de antecedência */}
              <FormField
                control={form.control}
                name="days_in_advance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dias de antecedência</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} max={60} {...field} />
                    </FormControl>
                    <FormDescription>
                      Quantos dias no futuro os clientes podem agendar um horário.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Status ativo */}
              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Ativo</FormLabel>
                      <FormDescription>
                        Quando desativado, o link não aceitará novos agendamentos.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <DialogFooter className={cn(!linkId && 'pt-4')}>
                <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Salvando...' : 'Salvar'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  )
}
