'use client'

import { useState } from 'react'
import { Gift, Send } from 'lucide-react'
import { Customer } from '@/types/customer'
import { useServiceStore } from '@/store/service-store'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
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
import { Textarea } from '@/components/ui/textarea'

interface OfferDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  customer: Customer
}

export function OfferDialog({ open, onOpenChange, customer }: OfferDialogProps) {
  const { services } = useServiceStore()
  const [loading, setLoading] = useState(false)

  // Estados para o formulário
  const [selectedServiceId, setSelectedServiceId] = useState('')
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage')
  const [discountValue, setDiscountValue] = useState('')
  const [validUntil, setValidUntil] = useState('')
  const [additionalNotes, setAdditionalNotes] = useState('')

  // Calcula o valor final após desconto
  const calculateFinalPrice = () => {
    if (!selectedServiceId || !discountValue) return null

    const service = services.find(s => s.id === selectedServiceId)
    if (!service || !service.price) return null

    const discountAmount =
      discountType === 'percentage'
        ? (service.price * Number(discountValue)) / 100
        : Number(discountValue)

    const finalPrice = Math.max(0, service.price - discountAmount)
    return finalPrice.toFixed(2).replace('.', ',')
  }

  const selectedService = services.find(s => s.id === selectedServiceId)
  const finalPrice = calculateFinalPrice()

  const generateOfferMessage = () => {
    if (!selectedServiceId || !discountValue) return ''

    const service = services.find(s => s.id === selectedServiceId)
    if (!service) return ''

    const discountText =
      discountType === 'percentage'
        ? `${discountValue}% de desconto`
        : `R$ ${Number(discountValue).toFixed(2).replace('.', ',')} de desconto`

    let validityText = ''
    if (validUntil) {
      const date = new Date(validUntil)
      const day = date.getDate().toString().padStart(2, '0')
      const month = (date.getMonth() + 1).toString().padStart(2, '0')
      validityText = ` (válido até ${day}/${month})`
    }

    return `Olá ${
      customer.full_name.split(' ')[0]
    }! Temos uma oferta especial para você: ${discountText} no serviço de ${
      service.name
    }, por apenas R$ ${finalPrice}${validityText}. ${additionalNotes}`
  }

  // Normaliza o número de telefone para o formato do WhatsApp
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

  const handleSendOffer = () => {
    if (!customer.phone) {
      toast.error('Cliente não possui telefone cadastrado')
      return
    }

    if (!selectedServiceId || !discountValue) {
      toast.error('Selecione um serviço e informe o desconto')
      return
    }

    setLoading(true)

    try {
      // Normaliza o número de telefone
      const whatsappPhone = normalizePhoneNumber(customer.phone)
      if (!whatsappPhone) {
        setLoading(false)
        return
      }

      // Gerando a mensagem da oferta
      const message = generateOfferMessage()

      // Codificando a mensagem para URL
      const encodedMessage = encodeURIComponent(message)

      // Criando a URL do WhatsApp
      const url = `https://wa.me/${whatsappPhone}?text=${encodedMessage}`

      // Abrindo em nova janela
      window.open(url, '_blank')

      // Fechando o diálogo
      onOpenChange(false)

      toast.success('Oferta enviada com sucesso!')
    } catch (error) {
      console.error('Erro ao enviar oferta:', error)
      toast.error('Erro ao enviar oferta')
    } finally {
      setLoading(false)
    }
  }

  // Pré-visualização da mensagem
  const previewMessage = generateOfferMessage()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/10">
              <Gift className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <DialogTitle>Criar Oferta</DialogTitle>
              <DialogDescription>
                Crie uma oferta especial para {customer.full_name}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 my-4">
          {/* Seleção de Serviço */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Serviço</label>
            <Select value={selectedServiceId} onValueChange={setSelectedServiceId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um serviço" />
              </SelectTrigger>
              <SelectContent>
                {services.map(service => (
                  <SelectItem key={service.id} value={service.id || ''}>
                    {service.name}{' '}
                    {service.price ? `(R$ ${service.price.toFixed(2).replace('.', ',')})` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tipo de Desconto */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Tipo de Desconto</label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={discountType === 'percentage' ? 'default' : 'outline'}
                className="flex-1"
                onClick={() => setDiscountType('percentage')}
              >
                Porcentagem (%)
              </Button>
              <Button
                type="button"
                variant={discountType === 'fixed' ? 'default' : 'outline'}
                className="flex-1"
                onClick={() => setDiscountType('fixed')}
              >
                Valor Fixo (R$)
              </Button>
            </div>
          </div>

          {/* Valor do Desconto */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {discountType === 'percentage' ? 'Desconto (%)' : 'Desconto (R$)'}
            </label>
            <Input
              type="number"
              value={discountValue}
              onChange={e => setDiscountValue(e.target.value)}
              placeholder={discountType === 'percentage' ? 'Ex: 10' : 'Ex: 20,00'}
            />
          </div>

          {/* Preço Final */}
          {selectedService && finalPrice && (
            <div className="p-3 bg-muted rounded-md">
              <p className="text-sm font-medium">
                Preço Original: R$ {selectedService.price?.toFixed(2).replace('.', ',')}
              </p>
              <p className="text-sm font-medium">
                Desconto:{' '}
                {discountType === 'percentage'
                  ? `${discountValue}%`
                  : `R$ ${Number(discountValue).toFixed(2).replace('.', ',')}`}
              </p>
              <p className="text-base font-bold">Preço Final: R$ {finalPrice}</p>
            </div>
          )}

          {/* Pré-visualização da mensagem */}
          {previewMessage && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Pré-visualização da mensagem</label>
              <div className="p-3 bg-green-50 rounded-md border border-green-100 text-sm">
                {previewMessage}
              </div>
              <p className="text-xs text-muted-foreground">
                Telefone que será usado: {customer.phone || 'Não cadastrado'}
              </p>
            </div>
          )}

          {/* Validade */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Válido até (opcional)</label>
            <Input type="date" value={validUntil} onChange={e => setValidUntil(e.target.value)} />
          </div>

          {/* Observações Adicionais */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Observações Adicionais (opcional)</label>
            <Textarea
              value={additionalNotes}
              onChange={e => setAdditionalNotes(e.target.value)}
              placeholder="Exemplo: Promoção válida apenas de segunda a quinta..."
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleSendOffer}
            className="bg-amber-500 hover:bg-amber-600"
            disabled={loading || !selectedServiceId || !discountValue}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Enviar Oferta
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
