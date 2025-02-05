import { NextResponse } from 'next/server'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { whatsappServer } from '@/lib/whatsapp-server'

export async function POST(request: Request) {
  try {
    const { phone, appointmentData } = await request.json()

    // Formatar o número do telefone (remover caracteres especiais e adicionar código do país)
    const formattedPhone = `55${phone.replace(/\D/g, '')}`

    // Criar a mensagem
    const message = `Olá ${appointmentData.clientName}! 👋\n\n` +
      `Lembrando do seu agendamento amanhã:\n\n` +
      `Serviço: ${appointmentData.serviceName}\n` +
      `Data: ${format(new Date(appointmentData.dateTime), "PPP 'às' HH:mm", { locale: ptBR })}\n\n` +
      `Aguardamos você! 😊`

    const success = await whatsappServer.sendMessage(formattedPhone, message)

    if (!success) {
      throw new Error('Failed to send WhatsApp message')
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error sending WhatsApp message:', error)
    return NextResponse.json(
      { error: 'Failed to send WhatsApp message' },
      { status: 500 }
    )
  }
} 