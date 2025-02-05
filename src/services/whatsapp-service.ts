class WhatsAppService {
  public async scheduleReminder(phone: string, appointmentData: {
    clientName: string
    serviceName: string
    dateTime: Date
  }) {
    try {
      // Calcular o tempo até 24h antes do agendamento
      const now = new Date()
      const reminderTime = new Date(appointmentData.dateTime)
      reminderTime.setDate(reminderTime.getDate() - 1) // 24h antes
      
      const timeUntilReminder = reminderTime.getTime() - now.getTime()
      
      if (timeUntilReminder > 0) {
        // Agendar o envio da mensagem
        setTimeout(async () => {
          try {
            const response = await fetch('/api/whatsapp', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                phone,
                appointmentData: {
                  ...appointmentData,
                  dateTime: appointmentData.dateTime.toISOString(),
                }
              })
            })

            if (!response.ok) {
              throw new Error('Failed to send WhatsApp message')
            }

            console.log(`Reminder scheduled for ${phone}`)
          } catch (error) {
            console.error('Error sending WhatsApp message:', error)
          }
        }, timeUntilReminder)
      }
    } catch (error) {
      console.error('Error scheduling WhatsApp reminder:', error)
    }
  }
}

// Exportar uma única instância do serviço
export const whatsAppService = new WhatsAppService() 