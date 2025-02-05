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
import { Switch } from '@/components/ui/switch'
import { useScheduleStore } from '@/store/schedule-store'
import { useCustomerStore } from '@/store/customer-store'
import { useServiceStore } from '@/store/service-store'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Customer } from '@/types/customer'
import { Service } from '@/types/service'
import { Appointment } from '@/types/schedule'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'
import { whatsAppService } from '@/services/whatsapp-service'
import { useBusinessHoursStore } from '@/store/business-hours-store'

interface AppointmentFormProps {
  appointment?: Appointment
  onSuccess?: () => void
}

export function AppointmentForm({ appointment, onSuccess }: AppointmentFormProps) {
  const [isSearching, setIsSearching] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const { selectedDate, actions: scheduleActions } = useScheduleStore()
  const { customers, actions: customerActions } = useCustomerStore()
  const { services, actions: serviceActions } = useServiceStore()
  const { config: businessHours } = useBusinessHoursStore()
  
  const [selectedClient, setSelectedClient] = useState<{
    id: string;
    name: string;
    phone: string;
  } | null>(appointment ? {
    id: appointment.client_id,
    name: appointment.client.full_name,
    phone: appointment.client.phone || ''
  } : null)
  const [newClient, setNewClient] = useState({
    name: '',
    phone: ''
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
  const [sendSMS, setSendSMS] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (appointment) {
      const appointmentDate = parseISO(appointment.scheduled_time)
      scheduleActions.setSelectedDate(appointmentDate)
    }
  }, [appointment, scheduleActions])

  // Carregar clientes e serviços ao montar o componente
  useEffect(() => {
    customerActions.fetchCustomers()
    serviceActions.fetchServices()
  }, [customerActions, serviceActions])

  // Carregar configurações ao montar o componente
  useEffect(() => {
    customerActions.fetchCustomers()
    serviceActions.fetchServices()
    const { actions } = useBusinessHoursStore.getState()
    actions.fetchConfig()
  }, [customerActions, serviceActions])

  // Resetar formulário
  const resetForm = () => {
    setSelectedClient(null)
    setNewClient({ name: '', phone: '' })
    setSelectedTime('')
    setSelectedService(null)
    setDuration('')
    setNotes('')
    setSendSMS(false)
    setIsSearching(false)
  }

  // Validar horário
  const validateTime = (time: string): boolean => {
    if (!businessHours) return false

    // Formato HH:mm
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
    if (!timeRegex.test(time)) return false

    const [hours, minutes] = time.split(':').map(Number)
    const [startHour, startMinute] = businessHours.starttime.split(':').map(Number)
    const [endHour, endMinute] = businessHours.endtime.split(':').map(Number)

    // Verificar se está dentro do horário de expediente
    const timeInMinutes = hours * 60 + minutes
    const startInMinutes = startHour * 60 + startMinute
    const endInMinutes = endHour * 60 + endMinute

    if (timeInMinutes < startInMinutes || timeInMinutes >= endInMinutes) {
      return false
    }

    // Verificar se não é horário de almoço
    if (businessHours.lunchbreak) {
      const [lunchStartHour, lunchStartMinute] = businessHours.lunchbreak.start.split(':').map(Number)
      const [lunchEndHour, lunchEndMinute] = businessHours.lunchbreak.end.split(':').map(Number)

      const lunchStartInMinutes = lunchStartHour * 60 + lunchStartMinute
      const lunchEndInMinutes = lunchEndHour * 60 + lunchEndMinute

      if (timeInMinutes >= lunchStartInMinutes && timeInMinutes < lunchEndInMinutes) {
        return false
      }
    }

    // Verificar se não é dia de folga
    const selectedDay = selectedDate.getDay()
    if (businessHours.daysoff.includes(selectedDay)) {
      return false
    }

    return true
  }

  // Criar ou atualizar agendamento
  const handleSubmit = async () => {
    try {
      setIsLoading(true)

      // Se não tem cliente selecionado, criar novo cliente
      let clientId: string
      if (selectedClient?.id) {
        clientId = selectedClient.id
      } else {
        if (!newClient.name || !newClient.phone) {
          toast.error('Por favor, preencha os dados do cliente')
          return
        }

        // Criar novo cliente
        const userResponse = await supabase.auth.getUser()
        
        if (!userResponse.data.user?.id) {
          toast.error('Usuário não autenticado')
          return
        }

        console.log('Tentando criar cliente:', {
          full_name: newClient.name,
          phone: newClient.phone.replace(/\D/g, ''),
          owner_id: userResponse.data.user.id
        })

        const { data: createdClient, error: clientError } = await supabase
          .from('clients')
          .insert({
            full_name: newClient.name,
            phone: newClient.phone.replace(/\D/g, ''),
            owner_id: userResponse.data.user.id
          })
          .select('*')
          .single()

        if (clientError) {
          console.error('Error creating client:', {
            code: clientError.code,
            message: clientError.message,
            details: clientError.details,
            hint: clientError.hint
          })
          if (clientError.code === '23505') {
            toast.error('Já existe um cliente com este telefone')
          } else {
            toast.error(`Erro ao criar cliente: ${clientError.message}`)
          }
          return
        }

        if (!createdClient?.id) {
          toast.error('Erro ao criar cliente: ID não retornado')
          return
        }

        clientId = createdClient.id
        console.log('Cliente criado com sucesso:', createdClient)

        // Atualizar a lista de clientes
        await customerActions.fetchCustomers()
      }

      if (!selectedService || !selectedTime) {
        toast.error('Por favor, preencha todos os campos obrigatórios')
        return
      }

      if (!validateTime(selectedTime)) {
        const formattedStart = businessHours?.starttime || '09:00'
        const formattedEnd = businessHours?.endtime || '18:00'
        const lunchBreak = businessHours?.lunchbreak
          ? ` (exceto ${businessHours.lunchbreak.start} - ${businessHours.lunchbreak.end})`
          : ''
        
        toast.error(
          `Horário inválido. Escolha um horário entre ${formattedStart} e ${formattedEnd}${lunchBreak}`
        )
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
        final_price: selectedService.base_price,
        status: appointment?.status || 'scheduled' as const,
        actual_duration: duration || undefined,
        notes: notes || undefined
      }

      if (appointment) {
        await scheduleActions.updateAppointment(appointment.id, appointmentData)
        toast.success('Agendamento atualizado com sucesso!')
      } else {
        await scheduleActions.createAppointment(appointmentData)
        
        // Se marcou para enviar SMS (WhatsApp)
        if (sendSMS) {
          const clientPhone = selectedClient?.phone || newClient.phone
          if (clientPhone) {
            whatsAppService.scheduleReminder(clientPhone, {
              clientName: selectedClient?.name || newClient.name,
              serviceName: selectedService.name,
              dateTime: appointmentDate
            })
          }
        }

        toast.success('Agendamento realizado com sucesso!')
      }
      
      onSuccess?.()
      if (!appointment) {
        resetForm()
      }
    } catch (error) {
      console.error('Error saving appointment:', error)
      toast.error(appointment ? 'Erro ao atualizar agendamento' : 'Erro ao criar agendamento')
    } finally {
      setIsLoading(false)
    }
  }

  // Filtrar clientes baseado no termo de busca
  const filteredCustomers = customers.filter(customer => 
    customer.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (customer.phone && customer.phone.includes(searchTerm))
  )

  const handleClientSelect = (client: Customer) => {
    setSelectedClient({
      id: client.id || '',
      name: client.full_name,
      phone: client.phone || ''
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
    // Remove tudo que não for número
    const numbers = value.replace(/\D/g, '')
    
    // Limita a 11 dígitos
    const limitedNumbers = numbers.slice(0, 11)
    
    // Aplica a máscara (XX) XXXXX-XXXX
    if (limitedNumbers.length <= 11) {
      return limitedNumbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
    }
    
    return value
  }

  return (
    <Card className={cn("p-2", !appointment && "max-w-3xl mx-auto")}>
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
                  onChange={(e) => setSearchTerm(e.target.value)}
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
                        {filteredCustomers.map((customer) => (
                          <div
                            key={customer.id}
                            className="flex items-center justify-between p-2 hover:bg-accent rounded-lg cursor-pointer"
                            onClick={() => handleClientSelect(customer)}
                          >
                            <div>
                              <p className="font-medium">{customer.full_name}</p>
                              <p className="text-sm text-muted-foreground">{customer.phone || 'Sem telefone'}</p>
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
                onChange={(e) => {
                  if (!selectedClient) {
                    setNewClient(prev => ({ ...prev, name: e.target.value }))
                  }
                }}
                readOnly={!!selectedClient}
              />
              <Input 
                placeholder="Telefone" 
                value={selectedClient ? selectedClient.phone : formatPhoneNumber(newClient.phone)}
                onChange={(e) => {
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
                onChange={(e) => {
                  const time = e.target.value
                  if (validateTime(time)) {
                    setSelectedTime(time)
                  }
                }}
                min="09:00"
                max="18:00"
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
                onValueChange={(value) => {
                  const service = services.find(s => s.id === value)
                  setSelectedService(service || null)
                  if (service) {
                    setDuration(service.duration)
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um serviço" />
                </SelectTrigger>
                <SelectContent className="max-h-[200px]">
                  <ScrollArea className="max-h-[180px]">
                    {services.map((service) => (
                      <SelectItem key={service.id} value={service.id!}>
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
                value={duration}
                onValueChange={setDuration}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a duração" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="00:15:00">15 minutos</SelectItem>
                  <SelectItem value="00:30:00">30 minutos</SelectItem>
                  <SelectItem value="00:45:00">45 minutos</SelectItem>
                  <SelectItem value="01:00:00">1 hora</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Observações */}
          <div className="space-y-2">
            <Label>Observações</Label>
            <Textarea 
              placeholder="Adicione observações sobre o agendamento..." 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {/* Notificações - Só mostrar quando criar novo agendamento */}
          {!appointment && (
            <div className="flex items-center justify-between">
              <Label>Enviar SMS de confirmação</Label>
              <Switch 
                checked={sendSMS}
                onCheckedChange={setSendSMS}
              />
            </div>
          )}

          {/* Botões */}
          <div className="flex justify-end gap-2 pt-4">
            <Button 
              variant="outline" 
              onClick={appointment ? () => onSuccess?.() : resetForm}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={isLoading || (!selectedClient && (!newClient.name || !newClient.phone)) || !selectedService || !selectedTime}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                appointment ? 'Atualizar' : 'Salvar'
              )}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
} 