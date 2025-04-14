'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ClientBookingFormValues, clientBookingFormSchema } from '@/types/booking-link'
import { BookingLink } from '@/types/booking-link'
import { Service } from '@/types/service'
import { TimeSlot } from '@/types/schedule'
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  addDoc,
  Timestamp,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Calendar } from '@/components/ui/calendar'
import { format, parse, addDays, isBefore, isToday, startOfDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { toast } from 'sonner'
import { AlertCircle, Calendar as CalendarIcon, Loader2 } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { IMaskInput } from 'react-imask'
import { useBookingLinkStore } from '@/store/booking-link-store'
import { useCustomerStore } from '@/store/customer-store'

interface BusinessHours {
  starttime: string
  endtime: string
  daysoff: number[]
  lunchbreak?: {
    start: string
    end: string
  }
}

export default function BookingPage() {
  const params = useParams<{ slug: string }>()
  const router = useRouter()
  const [bookingLink, setBookingLink] = useState<BookingLink | null>(null)
  const [availableServices, setAvailableServices] = useState<Service[]>([])
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [businessHours, setBusinessHours] = useState<BusinessHours | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const bookingLinkActions = useBookingLinkStore(state => state.actions)

  const form = useForm<ClientBookingFormValues>({
    resolver: zodResolver(clientBookingFormSchema),
    defaultValues: {
      fullName: '',
      phone: '',
      email: null,
      service_id: '',
      date: '',
      time: '',
      notes: '',
    },
  })

  // Carregar dados do link de agendamento
  useEffect(() => {
    const fetchBookingLink = async () => {
      try {
        console.log('Buscando link de agendamento com slug:', params.slug)
        setLoading(true)
        // Modificar a consulta para corresponder às regras do Firestore
        const q = query(
          collection(db, 'booking_links'),
          where('slug', '==', params.slug),
          where('active', '==', true),
          where('is_active', '==', true)
        )
        const snapshot = await getDocs(q)

        if (snapshot.empty) {
          console.log('Link não encontrado ou inativo')
          setNotFound(true)
          setLoading(false)
          return
        }

        const linkData = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as BookingLink
        console.log('Link encontrado:', linkData.name)

        // Registrar visualização do link
        await bookingLinkActions.incrementLinkViews(linkData.id)

        // Buscar informações dos serviços
        const services: Service[] = []
        for (const serviceId of linkData.services) {
          const serviceDoc = await getDoc(doc(db, 'services', serviceId))
          if (serviceDoc.exists() && serviceDoc.data().active) {
            services.push({ id: serviceDoc.id, ...serviceDoc.data() } as Service)
          }
        }
        console.log(`${services.length} serviços encontrados para este link`)

        // Buscar horário de funcionamento
        const businessHoursDoc = await getDoc(doc(db, 'business_hours', linkData.ownerId))
        let businessHoursData = null
        if (businessHoursDoc.exists()) {
          businessHoursData = businessHoursDoc.data() as BusinessHours
        } else {
          // Horário padrão se não existir configuração
          businessHoursData = {
            starttime: '09:00',
            endtime: '18:00',
            daysoff: [0], // Domingo
          }
        }

        setBookingLink(linkData)
        setAvailableServices(services)
        setBusinessHours(businessHoursData)
        setLoading(false)
      } catch (error) {
        console.error('Erro ao carregar dados:', error)
        setLoading(false)
        setNotFound(true)
      }
    }

    fetchBookingLink()
  }, [params.slug, bookingLinkActions])

  // Quando o serviço é selecionado
  const handleServiceChange = (serviceId: string) => {
    const service = availableServices.find(s => s.id === serviceId)
    if (service) {
      setSelectedService(service)
      form.setValue('service_id', serviceId)

      // Reset date and time selections
      setSelectedDate(undefined)
      form.setValue('date', '')
      form.setValue('time', '')
    }
  }

  // Quando a data é selecionada
  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date)
    if (date) {
      form.setValue('date', format(date, 'yyyy-MM-dd'))
      form.setValue('time', '') // Reset time selection

      if (selectedService) {
        generateTimeSlots(date, selectedService)
      }
    }
  }

  // Gerar horários disponíveis
  const generateTimeSlots = async (date: Date, service: Service) => {
    if (!businessHours) return

    try {
      const dayOfWeek = date.getDay()

      // Verificar se é um dia de folga
      if (businessHours.daysoff.includes(dayOfWeek)) {
        setTimeSlots([])
        return
      }

      // Converter o horário de funcionamento para minutos
      const startMinutes = convertTimeToMinutes(businessHours.starttime)
      const endMinutes = convertTimeToMinutes(businessHours.endtime)

      // Intervalo para agendamentos (30 minutos por padrão)
      const interval = 30

      // Duração do serviço em minutos
      const serviceDuration = service.duration

      // Criar slots de horário
      const slots: TimeSlot[] = []
      for (let time = startMinutes; time + serviceDuration <= endMinutes; time += interval) {
        // Pular horário de almoço se configurado
        if (
          businessHours.lunchbreak &&
          time >= convertTimeToMinutes(businessHours.lunchbreak.start) &&
          time < convertTimeToMinutes(businessHours.lunchbreak.end)
        ) {
          time = convertTimeToMinutes(businessHours.lunchbreak.end) - interval
          continue
        }

        const timeString = convertMinutesToTimeString(time)

        // Verificar disponibilidade deste horário
        const available = await checkAvailability(date, timeString, service)

        slots.push({
          time: timeString,
          available,
        })
      }

      setTimeSlots(slots)
    } catch (error) {
      console.error('Erro ao gerar horários:', error)
      toast.error('Erro ao carregar horários disponíveis')
    }
  }

  // Verificar se um horário está disponível
  const checkAvailability = async (
    date: Date,
    time: string,
    service: Service
  ): Promise<boolean> => {
    if (!bookingLink) return false

    try {
      // Converter data e hora para timestamp
      const dateTimeString = `${format(date, 'yyyy-MM-dd')} ${time}`
      const dateTime = parse(dateTimeString, 'yyyy-MM-dd HH:mm', new Date())

      // Se a data/hora já passou, não está disponível
      if (isBefore(dateTime, new Date())) {
        return false
      }

      // Duração do serviço em minutos
      const serviceDuration = service.duration

      // Buscar agendamentos existentes neste horário
      const appointmentsRef = collection(db, 'appointments')
      const q = query(
        appointmentsRef,
        where('ownerId', '==', bookingLink.ownerId),
        where('scheduled_time', '>=', Timestamp.fromDate(dateTime)),
        where(
          'scheduled_time',
          '<',
          Timestamp.fromDate(new Date(dateTime.getTime() + serviceDuration * 60000))
        ),
        where('status', 'in', ['scheduled', 'confirmed'])
      )

      const snapshot = await getDocs(q)

      // Se existir algum agendamento neste intervalo, o horário não está disponível
      return snapshot.empty
    } catch (error) {
      console.error('Erro ao verificar disponibilidade:', error)
      return false
    }
  }

  // Converter hora (HH:mm) para minutos
  const convertTimeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number)
    return hours * 60 + minutes
  }

  // Converter minutos para string de hora (HH:mm)
  const convertMinutesToTimeString = (minutes: number): string => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
  }

  // Enviar formulário
  const onSubmit = async (data: ClientBookingFormValues) => {
    if (!bookingLink || !selectedService || !selectedDate) return

    try {
      setSubmitting(true)

      // Criar timestamp para o agendamento
      const dateTimeString = `${data.date} ${data.time}`
      const dateTime = parse(dateTimeString, 'yyyy-MM-dd HH:mm', new Date())

      // Dados do agendamento
      const appointmentData = {
        ownerId: bookingLink.ownerId,
        client_id: 'temp', // Será atualizado após criar o cliente
        service_id: data.service_id,
        scheduled_time: Timestamp.fromDate(dateTime),
        final_price: selectedService.price.toString(),
        status: 'scheduled',
        notes: data.notes || null,
        createdAt: Timestamp.now(),
        source: 'booking_link',
        booking_link_id: bookingLink.id,
      }

      // Importar o store de clientes
      const { actions: customerActions } = useCustomerStore.getState()

      // Criar ou recuperar o cliente usando o customerStore
      const clientData = {
        fullName: data.fullName,
        phone: data.phone,
        email: data.email || null,
        ownerId: bookingLink.ownerId
      }

      console.log('Verificando/criando cliente:', clientData)
      
      // Criar cliente ou retornar existente
      const client = await customerActions.createCustomer({
        fullName: data.fullName,
        phone: data.phone,
        email: data.email || null
      })

      // Atualizar cliente_id no agendamento
      appointmentData.client_id = client.id

      // Criar agendamento
      await addDoc(collection(db, 'appointments'), appointmentData)

      // Incrementar o contador de agendamentos para este link
      await bookingLinkActions.incrementLinkAppointments(bookingLink.id)

      setSubmitted(true)
      setSubmitting(false)

      // Redirecionar se houver URL de redirecionamento configurada
      if (bookingLink.redirectUrl) {
        window.location.href = bookingLink.redirectUrl
      }
    } catch (error) {
      console.error('Erro ao criar agendamento:', error)
      toast.error('Erro ao criar agendamento. Tente novamente.')
      setSubmitting(false)
    }
  }

  // Função para formatar horário
  const formatTime = (time: string) => {
    return time
  }

  if (loading) {
    return (
      <div className="container max-w-md py-10 mx-auto flex flex-col items-center justify-center min-h-[80vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Carregando...</p>
      </div>
    )
  }

  if (notFound || !bookingLink) {
    return (
      <div className="container max-w-md py-10 mx-auto">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Link não encontrado</AlertTitle>
          <AlertDescription>
            Este link de agendamento não existe ou foi desativado.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="container max-w-md py-10 mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Agendamento Realizado!</CardTitle>
            <CardDescription>Seu agendamento foi confirmado com sucesso.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground">
              Obrigado por agendar. Em breve você receberá uma confirmação.
            </p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button onClick={() => router.refresh()}>Fazer Novo Agendamento</Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  // Calcular as datas disponíveis
  const today = new Date()
  const maxDate = addDays(today, bookingLink.daysInAdvance)

  const isDayDisabled = (date: Date) => {
    // Verificar se é um dia no passado
    if (isBefore(date, startOfDay(new Date())) && !isToday(date)) {
      return true
    }

    // Verificar se é um dia de folga
    if (businessHours && businessHours.daysoff.includes(date.getDay())) {
      return true
    }

    // Verificar se está dentro do período permitido
    if (date > maxDate) {
      return true
    }

    return false
  }

  return (
    <div className="container max-w-md py-10 mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>{bookingLink.name}</CardTitle>
          <CardDescription>{bookingLink.description || 'Agende seu horário'}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome Completo</FormLabel>
                    <FormControl>
                      <Input placeholder="Digite seu nome completo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      <IMaskInput
                        mask="(00) 00000-0000"
                        unmask={false}
                        value={field.value}
                        onAccept={value => field.onChange(value)}
                        placeholder="(00) 00000-0000"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      />
                    </FormControl>
                    <FormDescription>
                      Utilizaremos seu telefone para confirmar o agendamento.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-mail (opcional)</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="seu.email@exemplo.com"
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="service_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Serviço</FormLabel>
                    <Select
                      onValueChange={value => handleServiceChange(value)}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um serviço" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availableServices.map(service => (
                          <SelectItem key={service.id} value={service.id}>
                            {service.name} -{' '}
                            {new Intl.NumberFormat('pt-BR', {
                              style: 'currency',
                              currency: 'BRL',
                            }).format(service.price)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {selectedService && (
                <>
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Data</FormLabel>
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={handleDateSelect}
                          disabled={isDayDisabled}
                          locale={ptBR}
                          className="border rounded-md p-2"
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {selectedDate && timeSlots.length > 0 && (
                    <FormField
                      control={form.control}
                      name="time"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Horário</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="grid grid-cols-3 gap-2"
                            >
                              {timeSlots.map(slot => (
                                <div key={slot.time}>
                                  <RadioGroupItem
                                    value={slot.time}
                                    id={`time-${slot.time}`}
                                    disabled={!slot.available}
                                    className="peer sr-only"
                                  />
                                  <label
                                    htmlFor={`time-${slot.time}`}
                                    className={`flex h-10 items-center justify-center rounded-md border border-input bg-background px-3 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-primary-foreground ${
                                      !slot.available
                                        ? 'cursor-not-allowed opacity-50'
                                        : 'cursor-pointer'
                                    }`}
                                  >
                                    {formatTime(slot.time)}
                                  </label>
                                </div>
                              ))}
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {selectedDate && timeSlots.length === 0 && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Sem horários disponíveis</AlertTitle>
                      <AlertDescription>
                        Não há horários disponíveis para esta data. Por favor, selecione outra data.
                      </AlertDescription>
                    </Alert>
                  )}
                </>
              )}

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observações (opcional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Alguma observação para o seu agendamento?"
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full"
                disabled={
                  submitting ||
                  !form.formState.isValid ||
                  !selectedService ||
                  !selectedDate ||
                  !form.getValues('time')
                }
              >
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Confirmar Agendamento
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
