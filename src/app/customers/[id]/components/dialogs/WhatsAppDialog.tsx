'use client'

import { useState } from 'react'
import { MessageSquare, Send, Copy } from 'lucide-react'
import { Customer } from '@/types/customer'
import { Textarea } from '@/components/ui/textarea'
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

interface WhatsAppDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  customer: Customer
}

export function WhatsAppDialog({ open, onOpenChange, customer }: WhatsAppDialogProps) {
  const [message, setMessage] = useState('')
  const [isSending, setIsSending] = useState(false)

  // Templates de mensagens
  const templates = [
    {
      title: 'Confirmação',
      text: `Olá ${
        customer.full_name.split(' ')[0]
      }, gostaria de confirmar seu horário para amanhã. Por favor, confirme sua presença respondendo esta mensagem. Obrigado!`,
    },
    {
      title: 'Agradecimento',
      text: `Olá ${
        customer.full_name.split(' ')[0]
      }, obrigado por sua visita hoje! Foi um prazer atendê-lo(a). Até a próxima!`,
    },
    {
      title: 'Aniversário',
      text: `Olá ${
        customer.full_name.split(' ')[0]
      }, feliz aniversário! Desejamos um dia maravilhoso e gostaríamos de oferecer um desconto especial em seu próximo atendimento. Entre em contato para agendar!`,
    },
    {
      title: 'Desconto',
      text: `Olá ${
        customer.full_name.split(' ')[0]
      }, temos uma promoção especial para você! Na sua próxima visita, ganhe 10% de desconto em qualquer serviço. Agende seu horário!`,
    },
  ]

  const selectTemplate = (text: string) => {
    setMessage(text)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(message)
    toast.success('Mensagem copiada para a área de transferência')
  }

  // Função para normalizar o número de telefone
  const normalizePhoneNumber = (phone: string) => {
    // Remove todos os caracteres não numéricos
    const numbers = phone.replace(/\D/g, '')

    // Se o número já tem 55 no início, usa como está
    // Caso contrário, adiciona 55 (código do Brasil)
    let formattedNumber = numbers
    if (!numbers.startsWith('55')) {
      formattedNumber = '55' + numbers
    }

    // Certifica-se de que o número tenha pelo menos 10 dígitos após o código do país
    if (formattedNumber.length < 12) {
      toast.error('Número de telefone inválido ou incompleto')
      return null
    }

    return formattedNumber
  }

  const handleSend = () => {
    try {
      setIsSending(true)

      if (!customer.phone) {
        toast.error('Cliente não possui telefone cadastrado')
        return
      }

      if (!message.trim()) {
        toast.error('Digite uma mensagem para enviar')
        return
      }

      // Normaliza o número de telefone
      const whatsappPhone = normalizePhoneNumber(customer.phone)
      if (!whatsappPhone) return

      // Codificando a mensagem para URL
      const encodedMessage = encodeURIComponent(message)

      // Criando a URL do WhatsApp
      const url = `https://wa.me/${whatsappPhone}?text=${encodedMessage}`

      // Abrindo em nova janela
      window.open(url, '_blank')

      toast.success('WhatsApp aberto com sua mensagem')
      onOpenChange(false)
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error)
      toast.error('Erro ao abrir o WhatsApp')
    } finally {
      setIsSending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/10">
              <MessageSquare className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <DialogTitle>Enviar WhatsApp</DialogTitle>
              <DialogDescription>
                Envie uma mensagem para {customer.full_name} via WhatsApp
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 my-4">
          <div>
            <label className="text-sm font-medium">Templates de Mensagem</label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {templates.map((template, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="h-auto py-2 px-3 justify-start font-normal"
                  onClick={() => selectTemplate(template.text)}
                >
                  <span className="truncate text-left">{template.title}</span>
                </Button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Mensagem</label>
            <Textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Digite sua mensagem aqui..."
              className="mt-2 h-32"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Telefone que será usado: {customer.phone || 'Não cadastrado'}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCopy} disabled={!message.trim()}>
            <Copy className="mr-2 h-4 w-4" />
            Copiar
          </Button>
          <Button
            onClick={handleSend}
            className="bg-green-600 hover:bg-green-700"
            disabled={isSending || !message.trim() || !customer.phone}
          >
            <Send className="mr-2 h-4 w-4" />
            {isSending ? 'Enviando...' : 'Enviar via WhatsApp'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
