'use client'

import { useEffect, useState } from 'react'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Search, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useScheduleStore } from '@/store/schedule-store'
import { useCustomerStore } from '@/store/customer-store'
import { useServiceStore } from '@/store/service-store'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Customer } from '@/types/customer'
import { Service } from '@/types/service'
import { Appointment } from '@/types/schedule'
import { cn } from '@/lib/utils'
import { useBusinessHoursStore } from '@/store/business-hours-store'
import { useAuthStore } from '@/store/auth-store'

interface AppointmentFormProps {
  appointment?: Appointment
  onSuccess?: () => void
  initialData?: any
}

export function AppointmentForm({ appointment, onSuccess, initialData }: AppointmentFormProps) {
  const [isSearching, setIsSearching] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [isCustomDuration, setIsCustomDuration] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const { selectedDate, actions: scheduleActions } = useScheduleStore()
  const { customers, actions: customerActions } = useCustomerStore()
  const { services, actions: serviceActions } = useServiceStore()
  const { config: businessHours, actions: businessHoursActions } = useBusinessHoursStore()

  const [selectedClient, setSelectedClient] = useState<{
    id: string
    name: string
    phone: string
  } | null>(
    initialData?.client
      ? {
          id: initialData.client.id,
          name: initialData.client.full_name,
          phone: initialData.client.phone || '',
        }
      : appointment
      ? {
          id: appointment.client_id,
          name: appointment.client.full_name,
          phone: appointment.client.phone || '',
        }
      : null
  )
  const [newClient, setNewClient] = useState({
    name: '',
    phone: '',
  })
  const [selectedTime, setSelectedTime] = useState(
    appointment ? format(parseISO(appointment.scheduled_time), 'HH:mm') : ''
  )
  const [selectedService, setSelectedService] = useState<Service | null>(
    appointment ? services.find(s => s.id === appointment.service_id) || null : null
  )
  const [duration, setDuration] = useState(
    appointment ? appointment.actual_duration || appointment.service.duration : ''
  )
  const [notes, setNotes] = useState(appointment?.notes || '')
  const [loading, setloading] = useState(false)

  useEffect(() => {
    if (appointment) {
      const appointmentDate = parseISO(appointment.scheduled_time)
      scheduleActions.setSelectedDate(appointmentDate)
    }
  }, [appointment, scheduleActions])

  // Carregar todos os dados necessários ao montar o componente
  useEffect(() => {
    const loadInitialData = async () => {
      setInitialLoading(true)
      try {
        await Promise.all([
          customerActions.fetchCustomers(),
          serviceActions.fetchServices(),
          businessHoursActions.fetchConfig(),
        ])
      } catch (error) {
        console.error('Erro ao carregar dados iniciais:', error)
        toast.error('Erro ao carregar dados. Tente novamente.')
      } finally {
        setInitialLoading(false)
      }
    }

    loadInitialData()
  }, [])

  // Resetar formulário
  const resetForm = () => {
    setSelectedClient(null)
    setNewClient({ name: '', phone: '' })
    setSelectedTime('')
    setSelectedService(null)
    setDuration('')
    setNotes('')
    setIsSearching(false)
  }

  // Validar horário
  const validateTime = (time: string): boolean => {
    if (!businessHours) return true // Se não há configuração de horário, permite qualquer horário

    // Formato HH:mm
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
    if (!timeRegex.test(time)) return false

    const [hours, minutes] = time.split(':').map(Number)

    // Se há configuração de horário de expediente, valida
    if (businessHours.starttime && businessHours.endtime) {
      const [startHour, startMinute] = businessHours.starttime.split(':').map(Number)
      const [endHour, endMinute] = businessHours.endtime.split(':').map(Number)

      const timeInMinutes = hours * 60 + minutes
      const startInMinutes = startHour * 60 + startMinute
      const endInMinutes = endHour * 60 + endMinute

      if (timeInMinutes < startInMinutes || timeInMinutes >= endInMinutes) {
        return false
      }
    }

    // Verificar se não é horário de almoço (se configurado)
    if (businessHours.lunchbreak) {
      const [lunchStartHour, lunchStartMinute] = businessHours.lunchbreak.start
        .split(':')
        .map(Number)
      const [lunchEndHour, lunchEndMinute] = businessHours.lunchbreak.end.split(':').map(Number)

      const timeInMinutes = hours * 60 + minutes
      const lunchStartInMinutes = lunchStartHour * 60 + lunchStartMinute
      const lunchEndInMinutes = lunchEndHour * 60 + lunchEndMinute

      if (timeInMinutes >= lunchStartInMinutes && timeInMinutes < lunchEndInMinutes) {
        return false
      }
    }

    // Verificar se não é dia de folga (se configurado)
    if (businessHours.daysoff && businessHours.daysoff.length > 0) {
      const selectedDay = selectedDate.getDay()
      if (businessHours.daysoff.includes(selectedDay)) {
        return false
      }
    }

    return true
  }

  // Criar ou atualizar agendamento
  const handleSubmit = async () => {
    try {
      setloading(true)

      // Se não tem cliente selecionado, criar novo cliente
      let clientId: string
      if (selectedClient?.id) {
        clientId = selectedClient.id
      } else {
        if (!newClient.name || !newClient.phone) {
          toast.error('Por favor, preencha os dados do cliente')
          return
        }

        try {
          // Formatar e normalizar o telefone
          const formattedPhone = formatPhoneNumber(newClient.phone)

          // Verificar se o cliente já existe
          console.log(`Verificando se cliente com telefone ${formattedPhone} já existe...`)

          const newClientData = {
            fullName: newClient.name,
            phone: formattedPhone,
          }

          // Usar a lógica centralizada para verificar e criar cliente
          const result = await customerActions.createCustomer(newClientData)

          // Usar o ID retornado diretamente
          if (!result?.id) {
            toast.error('Erro ao processar cliente')
            return
          }

          clientId = result.id

          // Atualizar a lista de clientes
          await customerActions.fetchCustomers()

          // Atualizar o selectedClient com o cliente novo ou existente
          setSelectedClient({
            id: result.id,
            name: result.full_name,
            phone: formatPhoneNumber(result.phone),
          })

          console.log(`Cliente processado com sucesso: ${result.id}`)
        } catch (error) {
          console.error('Erro ao processar cliente:', error)
          toast.error('Erro ao processar cliente')
          return
        }
      }

      if (!selectedService || !selectedTime) {
        toast.error('Por favor, preencha todos os campos obrigatórios')
        return
      }

      if (!validateTime(selectedTime)) {
        let errorMessage = 'Horário inválido.'
        if (businessHours?.starttime && businessHours?.endtime) {
          errorMessage += ` Escolha um horário entre ${businessHours.starttime} e ${businessHours.endtime}`
          if (businessHours.lunchbreak) {
            errorMessage += ` (exceto ${businessHours.lunchbreak.start} - ${businessHours.lunchbreak.end})`
          }
        }
        toast.error(errorMessage)
        return
      }

      // Verificar disponibilidade do horário
      const appointmentDate = new Date(`${format(selectedDate, 'yyyy-MM-dd')}T${selectedTime}`)
      const isAvailable = await scheduleActions.checkAvailability(
        appointmentDate,
        selectedTime,
        duration,
        appointment?.id // Passar o ID do agendamento atual para ignorá-lo na verificação
      )

      if (!isAvailable) {
        toast.error('Horário indisponível')
        return
      }

      const appointmentData = {
        client_id: clientId,
        service_id: selectedService.id!,
        scheduled_time: appointmentDate.toISOString(),
        final_price: Number(selectedService.price),
        status: appointment?.status || ('scheduled' as const),
        actual_duration: duration || undefined,
        notes: notes || undefined,
      }

      if (appointment) {
        await scheduleActions.updateAppointment(appointment.id, appointmentData)
      } else {
        await scheduleActions.createAppointment(appointmentData)
      }

      onSuccess?.()
      if (!appointment) {
        resetForm()
      }
    } catch (error) {
      console.error('Error saving appointment:', error)
      toast.error(appointment ? 'Erro ao atualizar agendamento' : 'Erro ao criar agendamento')
    } finally {
      setloading(false)
    }
  }

  // Filtrar clientes baseado no termo de busca
  const filteredCustomers = customers.filter(
    customer =>
      customer.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (customer.phone && customer.phone.includes(searchTerm))
  )

  const handleClientSelect = (client: Customer) => {
    setSelectedClient({
      id: client.id || '',
      name: client.full_name,
      phone: client.phone || '',
    })
    setIsSearching(false)
  }

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = new Date(e.target.value + 'T00:00:00')
    if (!isNaN(date.getTime())) {
      // Ajustar para o fuso horário local
      const timezoneOffset = date.getTimezoneOffset() * 60000 // offset em milissegundos
      const localDate = new Date(date.getTime() + timezoneOffset)
      scheduleActions.setSelectedDate(localDate)
    }
  }

  const formatPhoneNumber = (value: string) => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, '')

    // Aplica a máscara (XX) XXXXX-XXXX
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{2})?(\d{5})?(\d{4})?/, (_, ddd, first, second) => {
        let formatted = ''
        if (ddd) formatted += `(${ddd})`
        if (first) formatted += ` ${first}`
        if (second) formatted += `-${second}`
        return formatted
      })
    }

    return value
  }

  return (
    <Card className={cn('p-2', !appointment && 'max-w-3xl mx-auto')}>
      {initialLoading ? (
        <div className="flex flex-col items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="mt-4 text-sm text-muted-foreground">Carregando dados...</p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Cabeçalho */}
          {!appointment && (
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-base">Novo Agendamento</h3>
              <Button variant="ghost" size="sm" onClick={() => setIsSearching(!isSearching)}>
                <Search className="h-4 w-4 mr-1" />
                Buscar Cliente
              </Button>
            </div>
          )}

          {/* Formulário */}
          <div className="space-y-4">
            {/* Cliente */}
            {isSearching ? (
              <div className="space-y-2">
                <Label>Buscar Cliente</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Digite o nome ou telefone..."
                    className="pl-9"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
                </div>
                {searchTerm.length > 0 && (
                  <ScrollArea className="h-[200px] w-full rounded-md border">
                    <div className="p-4">
                      {filteredCustomers.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center">
                          Nenhum cliente encontrado
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {filteredCustomers.map(customer => (
                            <div
                              key={customer.id}
                              className="flex items-center justify-between p-2 hover:bg-accent rounded-lg cursor-pointer"
                              onClick={() => handleClientSelect(customer)}
                            >
                              <div>
                                <p className="font-medium">{customer.full_name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {customer.phone || 'Sem telefone'}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <Label>Cliente</Label>
                <Input
                  placeholder="Nome do cliente"
                  value={selectedClient ? selectedClient.name : newClient.name}
                  onChange={e => {
                    if (!selectedClient) {
                      setNewClient(prev => ({ ...prev, name: e.target.value }))
                    }
                  }}
                  readOnly={!!selectedClient}
                />
                <Input
                  placeholder="Telefone"
                  value={selectedClient ? selectedClient.phone : formatPhoneNumber(newClient.phone)}
                  onChange={e => {
                    if (!selectedClient) {
                      setNewClient(prev => ({ ...prev, phone: e.target.value }))
                    }
                  }}
                  readOnly={!!selectedClient}
                />
              </div>
            )}

            {/* Data e Hora */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Data</Label>
                <Input
                  type="date"
                  value={format(selectedDate, 'yyyy-MM-dd')}
                  onChange={handleDateChange}
                />
              </div>
              <div className="space-y-2">
                <Label>Hora</Label>
                <Input
                  type="time"
                  value={selectedTime}
                  onChange={e => setSelectedTime(e.target.value)}
                  onBlur={e => {
                    const time = e.target.value
                    if (!time) return // Não validar se estiver vazio

                    if (!validateTime(time)) {
                      let errorMessage = 'Horário inválido.'
                      if (businessHours?.starttime && businessHours?.endtime) {
                        errorMessage += ` Escolha um horário entre ${businessHours.starttime} e ${businessHours.endtime}`
                        if (businessHours.lunchbreak) {
                          errorMessage += ` (exceto ${businessHours.lunchbreak.start} - ${businessHours.lunchbreak.end})`
                        }
                      }
                      toast.error(errorMessage)
                      setSelectedTime('')
                    }
                  }}
                  step="900" // 15 minutos
                />
              </div>
            </div>

            {/* Serviço e Duração */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Serviço</Label>
                <Select
                  value={selectedService?.id}
                  onValueChange={value => {
                    const service = services.find(s => s.id === value)
                    setSelectedService(service || null)
                    if (service) {
                      const durationInHours = Math.floor(service.duration / 60)
                      const durationInMinutes = service.duration % 60
                      const formattedDuration = `${durationInHours
                        .toString()
                        .padStart(2, '0')}:${durationInMinutes.toString().padStart(2, '0')}:00`

                      // Verifica se a duração está nas opções pré-definidas
                      const standardDurations = [
                        '00:15:00',
                        '00:30:00',
                        '00:45:00',
                        '01:00:00',
                        '01:30:00',
                        '02:00:00',
                      ]
                      if (standardDurations.includes(formattedDuration)) {
                        setIsCustomDuration(false)
                      } else {
                        setIsCustomDuration(true)
                      }
                      setDuration(formattedDuration)
                    }
                  }}
                >
                  <SelectTrigger className="truncate">
                    <SelectValue placeholder="Selecione um serviço" className="truncate" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px]">
                    <ScrollArea className="h-[200px]">
                      {services.map(service => (
                        <SelectItem key={service.id} value={service.id!} className="truncate">
                          {service.name}
                        </SelectItem>
                      ))}
                    </ScrollArea>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Duração</Label>
                <Select
                  value={isCustomDuration ? 'custom' : duration}
                  onValueChange={(value: string) => {
                    if (value === 'custom') {
                      setIsCustomDuration(true)
                    } else {
                      setIsCustomDuration(false)
                      setDuration(value)
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a duração" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="00:15:00">15 minutos</SelectItem>
                    <SelectItem value="00:30:00">30 minutos</SelectItem>
                    <SelectItem value="00:45:00">45 minutos</SelectItem>
                    <SelectItem value="01:00:00">1 hora</SelectItem>
                    <SelectItem value="01:30:00">1 hora e 30 minutos</SelectItem>
                    <SelectItem value="02:00:00">2 horas</SelectItem>
                    <SelectItem value="custom">Personalizado</SelectItem>
                  </SelectContent>
                </Select>
                {isCustomDuration && (
                  <div className="mt-2">
                    <Input
                      type="time"
                      step="900"
                      value={duration ? duration.slice(0, 5) : '00:00'}
                      onChange={e => {
                        if (!e.target.value) return
                        const [hours, minutes] = e.target.value.split(':').map(Number)
                        if (isNaN(hours) || isNaN(minutes)) return
                        const formattedDuration = `${hours.toString().padStart(2, '0')}:${minutes
                          .toString()
                          .padStart(2, '0')}:00`
                        setDuration(formattedDuration)
                      }}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Insira o tempo no formato HH:MM
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Observações */}
            <div className="space-y-2">
              <Label>Observações</Label>
              <Textarea
                placeholder="Adicione observações sobre o agendamento..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
              />
            </div>

            {/* Botões */}
            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={appointment ? () => onSuccess?.() : resetForm}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={
                  loading ||
                  (!selectedClient && (!newClient.name || !newClient.phone)) ||
                  !selectedService ||
                  !selectedTime
                }
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : appointment ? (
                  'Atualizar'
                ) : (
                  'Salvar'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}
