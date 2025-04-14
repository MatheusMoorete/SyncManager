'use client'

import { useState, useEffect } from 'react'
import { Bell, Calendar, Save, ArrowRight, Clock, AlertCircle } from 'lucide-react'
import { Customer } from '@/types/customer'
import { Appointment } from '@/types/schedule'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { format, addDays, differenceInDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useScheduleStore } from '@/store/schedule-store'

interface ReminderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  customer: Customer
}

export function ReminderDialog({ open, onOpenChange, customer }: ReminderDialogProps) {
  const { appointments } = useScheduleStore()
  const [reminderType, setReminderType] = useState<'auto' | 'custom'>('auto')
  const [reminderDate, setReminderDate] = useState('')
  const [reminderMessage, setReminderMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [suggestedDate, setSuggestedDate] = useState<Date | null>(null)
  const [frequencyDays, setFrequencyDays] = useState(0)
  const [lastService, setLastService] = useState('')
  const [reminderPriority, setReminderPriority] = useState<'normal' | 'alta'>('normal')
  const [reminderEmail, setReminderEmail] = useState(false)
  const [emailAddress, setEmailAddress] = useState('')

  // Analisa os padrões de agendamento do cliente quando o diálogo é aberto
  useEffect(() => {
    if (open && customer) {
      analyzeCustomerPatterns()
    }
  }, [open, customer, appointments])

  // Analisa padrões de agendamento do cliente
  const analyzeCustomerPatterns = () => {
    if (!appointments || !appointments.length) return

    // Filtra apenas os agendamentos deste cliente que foram concluídos
    const customerAppts = appointments
      .filter(app => app.client_id === customer.id && app.status === 'completed')
      .sort((a, b) => {
        const dateA = new Date(a.scheduled_time).getTime()
        const dateB = new Date(b.scheduled_time).getTime()
        return dateB - dateA // Ordem decrescente (mais recente primeiro)
      })

    if (customerAppts.length === 0) {
      // Se não houver agendamentos concluídos, sugerir data padrão de 30 dias
      const suggestedDate = addDays(new Date(), 30)
      setSuggestedDate(suggestedDate)
      setReminderMessage(
        `Sugerimos entrar em contato com ${customer.full_name} para agendar o primeiro retorno.`
      )
      return
    }

    // Último agendamento
    const lastAppointment = customerAppts[0]
    const lastAppointmentDate = new Date(lastAppointment.scheduled_time)

    // Encontrar o nome do último serviço realizado
    const serviceName = lastAppointment.service?.name || lastAppointment.service_id || 'serviço'
    setLastService(serviceName)

    // Calcular frequência média entre agendamentos
    let avgFrequency = 30 // Padrão de 30 dias
    if (customerAppts.length > 1) {
      let totalDays = 0
      let intervals = 0

      for (let i = 0; i < customerAppts.length - 1; i++) {
        const currentDate = new Date(customerAppts[i].scheduled_time)
        const nextDate = new Date(customerAppts[i + 1].scheduled_time)
        const days = differenceInDays(currentDate, nextDate)
        if (days > 0 && days < 90) {
          // Ignorar intervalos muito longos (mais de 3 meses)
          totalDays += days
          intervals++
        }
      }

      if (intervals > 0) {
        avgFrequency = Math.round(totalDays / intervals)
      }
    }

    setFrequencyDays(avgFrequency)

    // Calcular data sugerida para próximo agendamento
    const nextSuggested = addDays(lastAppointmentDate, avgFrequency)
    const today = new Date()

    // Se a data sugerida já passou, sugerir uma semana a partir de hoje
    const finalSuggestion = nextSuggested < today ? addDays(today, 7) : nextSuggested

    setSuggestedDate(finalSuggestion)

    // Gerar mensagem personalizada baseada na análise
    const daysSinceLastVisit = Math.abs(differenceInDays(today, lastAppointmentDate))
    const formattedSuggestedDate = format(finalSuggestion, 'dd/MM/yyyy', { locale: ptBR })

    // Texto para dias no singular ou plural
    const diasTexto = daysSinceLastVisit === 1 ? 'dia' : 'dias'
    const frequencyText = avgFrequency === 1 ? 'dia' : 'dias'

    if (daysSinceLastVisit > avgFrequency) {
      setReminderMessage(
        `${customer.full_name} realizou ${serviceName} há ${daysSinceLastVisit} ${diasTexto}. ` +
          `Cliente retorna a cada ${avgFrequency} ${frequencyText}. ` +
          `Recomendamos contato para agendar retorno.`
      )
      setReminderPriority('alta')
    } else {
      setReminderMessage(
        `${customer.full_name} realizou ${serviceName} há ${daysSinceLastVisit} ${diasTexto}. ` +
          `Cliente retorna a cada ${avgFrequency} ${frequencyText}. ` +
          `Contatar em ${formattedSuggestedDate}.`
      )
    }

    // Preencher data do lembrete
    setReminderDate(format(finalSuggestion, 'yyyy-MM-dd'))
  }

  const handleSaveReminder = async () => {
    if (!reminderMessage) {
      toast.error('A mensagem do lembrete não pode estar vazia')
      return
    }

    // Verificar se o email é válido quando a opção está marcada
    if (reminderEmail && !validateEmail(emailAddress)) {
      toast.error('Por favor, informe um e-mail válido')
      return
    }

    setIsLoading(true)

    try {
      // Aqui você pode implementar a lógica para salvar no banco de dados
      // Por enquanto vamos apenas simular o salvamento

      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulação de tempo de processamento

      const reminderData = {
        customer_id: customer.id,
        customer_name: customer.full_name,
        message: reminderMessage,
        remind_date: reminderDate ? new Date(reminderDate) : suggestedDate,
        created_at: new Date(),
        priority: reminderPriority,
        status: 'pending',
        service: lastService,
        notify_email: reminderEmail,
        email_address: reminderEmail ? emailAddress : null,
      }

      console.log('Lembrete criado:', reminderData)

      // Futuramente: salvar no Firestore
      // const db = getFirestore()
      // await addDoc(collection(db, 'reminders'), reminderData)

      toast.success('Lembrete interno criado com sucesso!')

      if (reminderEmail) {
        toast.success(`Uma cópia foi enviada para ${emailAddress}`)
      }

      onOpenChange(false)
    } catch (error) {
      console.error('Erro ao criar lembrete:', error)
      toast.error('Erro ao criar lembrete')
    } finally {
      setIsLoading(false)
    }
  }

  // Função para validar e-mail
  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px] max-h-[85vh] overflow-y-auto">
        <DialogHeader className="pb-2">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/10">
              <Bell className="h-4 w-4 text-blue-500" />
            </div>
            <div>
              <DialogTitle>Criar Lembrete Interno</DialogTitle>
              <DialogDescription className="text-xs">
                Lembrete para contatar {customer.full_name}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-3 py-2">
          {/* Tipo de Lembrete - Versão mais compacta */}
          <div className="space-y-1">
            <label className="text-sm font-medium">Tipo</label>
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                variant={reminderType === 'auto' ? 'default' : 'outline'}
                className="flex-1 h-8"
                onClick={() => setReminderType('auto')}
              >
                <ArrowRight className="h-3 w-3 mr-1" />
                Automático
              </Button>
              <Button
                type="button"
                size="sm"
                variant={reminderType === 'custom' ? 'default' : 'outline'}
                className="flex-1 h-8"
                onClick={() => setReminderType('custom')}
              >
                <Calendar className="h-3 w-3 mr-1" />
                Personalizado
              </Button>
            </div>
          </div>

          {/* Análise do Cliente - Versão mais compacta */}
          {frequencyDays > 0 && (
            <div className="bg-blue-50 border border-blue-100 rounded-md p-2 text-xs">
              <p className="flex items-center text-sm font-medium mb-1">
                <AlertCircle className="h-3 w-3 mr-1 text-blue-500" />
                Análise de Padrões
              </p>
              <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                <p>
                  Frequência:{' '}
                  <span className="font-medium">
                    {frequencyDays} {frequencyDays === 1 ? 'dia' : 'dias'}
                  </span>
                </p>
                <p>
                  Serviço: <span className="font-medium">{lastService}</span>
                </p>
                {suggestedDate && (
                  <p className="col-span-2">
                    Data sugerida:{' '}
                    <span className="font-medium">
                      {format(suggestedDate, 'dd/MM/yyyy', { locale: ptBR })}
                    </span>
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Layout de duas colunas para os controles */}
          <div className="grid grid-cols-2 gap-3">
            {/* Data do Lembrete */}
            <div className="space-y-1">
              <label className="text-sm font-medium">Data</label>
              <Input
                type="date"
                value={reminderDate}
                onChange={e => setReminderDate(e.target.value)}
                min={format(new Date(), 'yyyy-MM-dd')}
                className="h-8"
              />
            </div>

            {/* Prioridade */}
            <div className="space-y-1">
              <label className="text-sm font-medium">Prioridade</label>
              <Select
                value={reminderPriority}
                onValueChange={(value: 'normal' | 'alta') => setReminderPriority(value)}
              >
                <SelectTrigger className="h-8">
                  <SelectValue placeholder="Prioridade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="alta">Alta</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Mensagem */}
          <div className="space-y-1">
            <label className="text-sm font-medium">Mensagem</label>
            <Textarea
              value={reminderMessage}
              onChange={e => setReminderMessage(e.target.value)}
              placeholder="Detalhes do lembrete..."
              className="h-20 text-sm"
            />
          </div>

          {/* Opções adicionais */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="email-copy"
                checked={reminderEmail}
                onChange={e => setReminderEmail(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <label htmlFor="email-copy" className="text-xs">
                Enviar cópia por email
              </label>
            </div>

            {/* Campo de e-mail (aparece apenas quando a opção está marcada) */}
            {reminderEmail && (
              <div className="pt-1">
                <Input
                  type="email"
                  value={emailAddress}
                  onChange={e => setEmailAddress(e.target.value)}
                  placeholder="Informe o e-mail"
                  className="h-8 text-sm"
                  required
                />
                {emailAddress && !validateEmail(emailAddress) && (
                  <p className="text-xs text-red-500 mt-1">Informe um e-mail válido</p>
                )}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="pt-2">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleSaveReminder}
            className="bg-blue-500 hover:bg-blue-600"
            size="sm"
            disabled={!reminderMessage || isLoading}
          >
            {isLoading ? (
              <>
                <span className="mr-1 h-3 w-3 animate-spin">●</span>
                Salvando...
              </>
            ) : (
              <>
                <Save className="mr-1 h-3 w-3" />
                Salvar
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
