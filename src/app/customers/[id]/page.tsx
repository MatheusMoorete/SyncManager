'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Calendar, Mail, Phone, Star, Edit, Save, ChevronRight } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { toast } from 'sonner'
import { useCustomerStore } from '@/store/customer-store'
import { useScheduleStore } from '@/store/schedule-store'
import { AppLayout } from '@/components/layout/app-layout'
import { CustomerFormValues } from '@/types/customer'
import { cn } from '@/lib/utils'
import { Appointment } from '@/types/schedule'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'

export default function CustomerDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const { selectedCustomer: customer, loading, actions } = useCustomerStore()
  const { appointments, actions: scheduleActions } = useScheduleStore()

  // Função para ajustar altura do textarea
  const adjustTextareaHeight = (element: HTMLTextAreaElement) => {
    element.style.height = 'auto'
    element.style.height = element.scrollHeight + 'px'
  }

  // Efeito para ajustar altura inicial do textarea
  useEffect(() => {
    const textarea = document.querySelector('textarea')
    if (textarea) {
      adjustTextareaHeight(textarea)
    }
  }, [customer?.notes])

  // Efeito para carregar os dados do cliente
  useEffect(() => {
    if (params.id) {
      actions.fetchCustomer(params.id)
      scheduleActions.updateFilters({ clientId: params.id })
      scheduleActions.fetchAppointments()
    }
  }, [params.id, actions, scheduleActions])

  if (loading || !customer) {
    return (
      <AppLayout>
        <div className="animate-pulse">
          <div className="h-32 bg-neutral-cream/20 rounded-lg mb-4" />
          <div className="space-y-4">
            <div className="h-24 bg-neutral-cream/20 rounded-lg" />
            <div className="h-24 bg-neutral-cream/20 rounded-lg" />
            <div className="h-24 bg-neutral-cream/20 rounded-lg" />
          </div>
        </div>
      </AppLayout>
    )
  }

  const handleUpdateCustomer = async (data: CustomerFormValues) => {
    try {
      await actions.updateCustomer(customer.id!, data)
      setIsEditing(false)
      toast.success('Cliente atualizado com sucesso!')
    } catch (error) {
      toast.error('Erro ao atualizar cliente')
    }
  }

  return (
    <AppLayout>
      <div className="flex flex-col min-h-screen bg-white">
        {/* Header Mobile */}
        <div className="sticky top-0 z-10 bg-white border-b border-charcoal/5 p-4 md:hidden">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => router.back()} className="p-0">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-neutral-cream/30 px-2 py-1 rounded-full">
                <Star className="h-3 w-3 text-terracotta" />
                <span className="text-xs font-medium">{customer.points}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setIsEditing(!isEditing)}>
                {isEditing ? <Save className="h-5 w-5" /> : <Edit className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Cliente Info Mobile */}
        <div className="p-4 md:hidden">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-16 w-16 rounded-full bg-neutral-cream flex items-center justify-center ring-2 ring-white shadow-sm">
              <span className="text-2xl font-medium text-charcoal">
                {customer.full_name.charAt(0)}
              </span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-charcoal">{customer.full_name}</h1>
              <p className="text-sm text-charcoal/60">
                Cliente desde {format(customer.createdAt.toDate(), 'MMM yyyy', { locale: ptBR })}
              </p>
            </div>
          </div>
        </div>

        {/* Desktop Header (mantido como estava) */}
        <div className="hidden md:flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between p-4 md:p-6 lg:p-8 mb-6">
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-neutral-cream flex items-center justify-center ring-2 ring-white shadow-sm">
                <span className="text-lg font-medium text-charcoal">
                  {customer.full_name.charAt(0)}
                </span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-charcoal">{customer.full_name}</h1>
                <p className="text-sm text-charcoal/60">
                  Cliente desde{' '}
                  {format(customer.createdAt.toDate(), 'dd/MM/yyyy', { locale: ptBR })}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-neutral-cream/30 px-3 py-1.5 rounded-full">
              <Star className="h-4 w-4 text-terracotta" />
              <span className="text-sm font-medium">{customer.points} pontos</span>
            </div>
            <Button variant="outline" onClick={() => setIsEditing(!isEditing)} className="gap-2">
              {isEditing ? (
                <>
                  <Save className="h-4 w-4" />
                  Salvar
                </>
              ) : (
                <>
                  <Edit className="h-4 w-4" />
                  Editar
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Tabs e Conteúdo */}
        <Tabs defaultValue="info" className="flex-1">
          <div className="border-b border-charcoal/5">
            <TabsList className="w-full rounded-none bg-transparent p-0 md:w-auto md:rounded-md md:bg-neutral-cream/30 md:p-1">
              <TabsTrigger
                value="info"
                className="flex-1 data-[state=active]:border-b-2 data-[state=active]:border-terracotta data-[state=active]:bg-transparent data-[state=active]:shadow-none md:flex-none md:data-[state=active]:bg-white md:data-[state=active]:shadow-sm"
              >
                Informações
              </TabsTrigger>
              <TabsTrigger
                value="history"
                className="flex-1 data-[state=active]:border-b-2 data-[state=active]:border-terracotta data-[state=active]:bg-transparent data-[state=active]:shadow-none md:flex-none md:data-[state=active]:bg-white md:data-[state=active]:shadow-sm"
              >
                Histórico
              </TabsTrigger>
              <TabsTrigger
                value="preferences"
                className="flex-1 data-[state=active]:border-b-2 data-[state=active]:border-terracotta data-[state=active]:bg-transparent data-[state=active]:shadow-none md:flex-none md:data-[state=active]:bg-white md:data-[state=active]:shadow-sm"
              >
                Preferências
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="p-4 md:p-6">
            <TabsContent value="info" className="mt-0 space-y-4">
              {/* Informações Básicas Mobile */}
              <div className="space-y-4 md:hidden">
                <div className="space-y-3">
                  <Button variant="ghost" className="w-full justify-between p-3 h-auto">
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-charcoal/40" />
                      <div className="text-left">
                        <p className="text-xs text-charcoal/60">Telefone</p>
                        <p className="text-sm font-medium">{customer.phone}</p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-charcoal/40" />
                  </Button>

                  {customer.email && (
                    <Button variant="ghost" className="w-full justify-between p-3 h-auto">
                      <div className="flex items-center gap-3">
                        <Mail className="h-5 w-5 text-charcoal/40" />
                        <div className="text-left">
                          <p className="text-xs text-charcoal/60">Email</p>
                          <p className="text-sm font-medium">{customer.email}</p>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-charcoal/40" />
                    </Button>
                  )}

                  {customer.birth_date && (
                    <Button variant="ghost" className="w-full justify-between p-3 h-auto">
                      <div className="flex items-center gap-3">
                        <Calendar className="h-5 w-5 text-charcoal/40" />
                        <div className="text-left">
                          <p className="text-xs text-charcoal/60">Aniversário</p>
                          <p className="text-sm font-medium">
                            {format(new Date(customer.birth_date!), 'dd/MM/yyyy', {
                              locale: ptBR,
                            })}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-charcoal/40" />
                    </Button>
                  )}
                </div>

                <div className="space-y-2">
                  <h2 className="text-sm font-medium text-charcoal">Observações</h2>
                  <Textarea
                    value={customer.notes || ''}
                    readOnly={!isEditing}
                    placeholder={
                      isEditing ? 'Adicione observações sobre o cliente...' : 'Sem observações'
                    }
                    className="min-h-[120px] bg-neutral-cream/10"
                  />
                </div>
              </div>

              {/* Desktop Info (mantido como estava) */}
              <div className="hidden md:block">
                <Card className="p-6 shadow-lg bg-white/95 backdrop-blur-sm border border-charcoal/10 hover:border-charcoal/20 transition-all duration-200">
                  <div className="grid gap-6 md:grid-cols-2">
                    {/* Informações básicas */}
                    <div className="space-y-4">
                      <h2 className="text-lg font-semibold text-charcoal">Informações Básicas</h2>
                      <div className="space-y-3 bg-neutral-cream/20 p-4 rounded-lg border border-charcoal/5">
                        <div className="flex items-center gap-2">
                          <div className="bg-white p-2 rounded-full shadow-sm">
                            <Phone className="h-4 w-4 text-charcoal/60" />
                          </div>
                          <span className="text-sm text-charcoal">{customer.phone}</span>
                        </div>
                        {customer.email && (
                          <div className="flex items-center gap-2">
                            <div className="bg-white p-2 rounded-full shadow-sm">
                              <Mail className="h-4 w-4 text-charcoal/60" />
                            </div>
                            <span className="text-sm text-charcoal">{customer.email}</span>
                          </div>
                        )}
                        {customer.birth_date && (
                          <div className="flex items-center gap-2">
                            <div className="bg-white p-2 rounded-full shadow-sm">
                              <Calendar className="h-4 w-4 text-charcoal/60" />
                            </div>
                            <span className="text-sm text-charcoal">
                              {format(new Date(customer.birth_date!), 'dd/MM/yyyy', {
                                locale: ptBR,
                              })}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Observações */}
                    <div className="space-y-4">
                      <h2 className="text-lg font-semibold text-charcoal">Observações</h2>
                      <div className="bg-neutral-cream/20 p-4 rounded-lg border border-charcoal/5">
                        <Textarea
                          value={customer.notes || ''}
                          readOnly={!isEditing}
                          placeholder={
                            isEditing
                              ? 'Adicione observações sobre o cliente...'
                              : 'Sem observações'
                          }
                          className="w-full min-h-[120px] max-h-[240px] resize-none bg-white/80 border-charcoal/10 focus:border-charcoal/20 focus:ring-1 focus:ring-charcoal/20 shadow-sm [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-charcoal/20 hover:[&::-webkit-scrollbar-thumb]:bg-charcoal/30 focus:[&::-webkit-scrollbar-thumb]:bg-charcoal/30"
                        />
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="history" className="mt-0">
              {/* Versão Mobile do Histórico */}
              <div className="md:hidden space-y-4">
                <div className="space-y-4">
                  {appointments && appointments.length > 0 ? (
                    appointments.map((appointment: Appointment) => (
                      <div
                        key={appointment.id}
                        className="flex flex-col gap-2 border-b border-charcoal/10 pb-4 last:border-0"
                      >
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {format(parseISO(appointment.scheduled_time), "PPP 'às' HH:mm", {
                              locale: ptBR,
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{appointment.service.name}</span>
                          <span className="text-sm text-muted-foreground">•</span>
                          <span className="text-sm">
                            {new Intl.NumberFormat('pt-BR', {
                              style: 'currency',
                              currency: 'BRL',
                            }).format(Number(appointment.final_price || 0))}
                          </span>
                        </div>
                        {appointment.notes && (
                          <p className="text-sm text-muted-foreground">{appointment.notes}</p>
                        )}
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              'text-xs px-2 py-1 rounded-full',
                              appointment.status === 'completed'
                                ? 'bg-soft-sage/20 text-soft-sage'
                                : appointment.status === 'canceled'
                                ? 'bg-error/20 text-error'
                                : appointment.status === 'no_show'
                                ? 'bg-terracotta/20 text-terracotta'
                                : 'bg-charcoal/10 text-charcoal'
                            )}
                          >
                            {appointment.status === 'completed'
                              ? 'Concluído'
                              : appointment.status === 'canceled'
                              ? 'Cancelado'
                              : appointment.status === 'no_show'
                              ? 'Não Compareceu'
                              : 'Agendado'}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      Nenhum atendimento encontrado.
                    </div>
                  )}
                </div>
              </div>

              {/* Desktop History */}
              <div className="hidden md:block">
                <Card className="p-6 shadow-lg bg-white/95 backdrop-blur-sm border border-charcoal/10 hover:border-charcoal/20 transition-all duration-200">
                  <h2 className="text-lg font-semibold text-charcoal mb-4">
                    Histórico de Atendimentos
                  </h2>
                  <div className="space-y-4">
                    {appointments && appointments.length > 0 ? (
                      appointments.map((appointment: Appointment) => (
                        <div
                          key={appointment.id}
                          className="flex items-start justify-between border-b border-charcoal/10 pb-4 last:border-0"
                        >
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">
                                {format(parseISO(appointment.scheduled_time), "PPP 'às' HH:mm", {
                                  locale: ptBR,
                                })}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">
                                {appointment.service.name}
                              </span>
                              <span className="text-sm text-muted-foreground">•</span>
                              <span className="text-sm">
                                {new Intl.NumberFormat('pt-BR', {
                                  style: 'currency',
                                  currency: 'BRL',
                                }).format(Number(appointment.final_price || 0))}
                              </span>
                            </div>
                            {appointment.notes && (
                              <p className="text-sm text-muted-foreground">{appointment.notes}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className={cn(
                                'text-xs px-2 py-1 rounded-full',
                                appointment.status === 'completed'
                                  ? 'bg-soft-sage/20 text-soft-sage'
                                  : appointment.status === 'canceled'
                                  ? 'bg-error/20 text-error'
                                  : appointment.status === 'no_show'
                                  ? 'bg-terracotta/20 text-terracotta'
                                  : 'bg-charcoal/10 text-charcoal'
                              )}
                            >
                              {appointment.status === 'completed'
                                ? 'Concluído'
                                : appointment.status === 'canceled'
                                ? 'Cancelado'
                                : appointment.status === 'no_show'
                                ? 'Não Compareceu'
                                : 'Agendado'}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        Nenhum atendimento encontrado.
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="preferences" className="mt-0">
              {/* Versão Mobile das Preferências */}
              <div className="md:hidden space-y-4">
                <div className="text-sm text-charcoal/60 text-center py-8">
                  Preferências do cliente serão implementadas em breve.
                </div>
              </div>

              {/* Desktop Preferences (mantido como estava) */}
              <div className="hidden md:block">
                <Card className="p-6 shadow-lg bg-white/95 backdrop-blur-sm border border-charcoal/10 hover:border-charcoal/20 transition-all duration-200">
                  <h2 className="text-lg font-semibold text-charcoal mb-4">
                    Preferências do Cliente
                  </h2>
                  {/* Implementar preferências do cliente */}
                  <div className="text-sm text-charcoal/60">
                    Preferências do cliente serão implementadas em breve.
                  </div>
                </Card>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </AppLayout>
  )
}
