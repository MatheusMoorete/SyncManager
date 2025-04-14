'use client'

import { useState } from 'react'
import { Edit2, Save, X, Calendar, MessageSquare, Gift, Bell, ExternalLink } from 'lucide-react'
import { Customer, CustomerFormValues } from '@/types/customer'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useRouter } from 'next/navigation'

interface CustomerCombinedCardProps {
  customer: Customer
  onUpdateCustomer: (id: string, data: CustomerFormValues) => Promise<void>
  onSchedule: () => void
  onWhatsApp: () => void
  onOffer: () => void
  onReminder: () => void
}

export function CustomerCombinedCard({
  customer,
  onUpdateCustomer,
  onSchedule,
  onWhatsApp,
  onOffer,
  onReminder,
}: CustomerCombinedCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [notes, setNotes] = useState(customer.notes || '')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSave = async () => {
    try {
      setLoading(true)
      // Preparar os dados para atualização, mantendo os outros campos
      const updateData: CustomerFormValues = {
        fullName: customer.full_name,
        phone: customer.phone,
        email: customer.email || undefined,
        birthDate: customer.birth_date || undefined,
        notes: notes || undefined,
      }

      await onUpdateCustomer(customer.id, updateData)
      setIsEditing(false)
    } catch (error) {
      console.error('Erro ao salvar preferências:', error)
    } finally {
      setLoading(false)
    }
  }

  // Função para redirecionar para a página de agenda com cliente selecionado
  const handleGoToSchedulePage = () => {
    // Redirecionar para agenda com parâmetro de cliente
    router.push(`/agenda?client=${customer.id}`)
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-4">
        <CardTitle className="text-lg font-medium">Perfil e Ações Rápidas</CardTitle>
        {isEditing ? (
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setNotes(customer.notes || '')
                setIsEditing(false)
              }}
              disabled={loading}
            >
              <X className="h-4 w-4 mr-1" />
              Cancelar
            </Button>
            <Button variant="default" size="sm" onClick={handleSave} disabled={loading}>
              <Save className="h-4 w-4 mr-1" />
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        ) : (
          <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
            <Edit2 className="h-4 w-4 mr-1" />
            Editar
          </Button>
        )}
      </CardHeader>

      <CardContent className="p-4 pt-0">
        <div className="space-y-6">
          {/* Ações Rápidas */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Ações Rápidas</h3>

            {/* Grade de botões 2x2 para ações rápidas */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {/* Botão para agendar */}
              <Button
                variant="outline"
                className="flex flex-col h-auto py-4 gap-2 border-primary/20 hover:bg-primary/5 hover:border-primary/30"
                onClick={handleGoToSchedulePage}
              >
                <Calendar className="h-5 w-5 text-primary" />
                <span>Agendar</span>
              </Button>

              <Button
                variant="outline"
                className="flex flex-col h-auto py-4 gap-2 border-green-500/20 hover:bg-green-500/5 hover:border-green-500/30"
                onClick={onWhatsApp}
              >
                <MessageSquare className="h-5 w-5 text-green-500" />
                <span>WhatsApp</span>
              </Button>

              <Button
                variant="outline"
                className="flex flex-col h-auto py-4 gap-2 border-amber-500/20 hover:bg-amber-500/5 hover:border-amber-500/30"
                onClick={onOffer}
              >
                <Gift className="h-5 w-5 text-amber-500" />
                <span>Oferta</span>
              </Button>

              <Button
                variant="outline"
                className="flex flex-col h-auto py-4 gap-2 border-blue-500/20 hover:bg-blue-500/5 hover:border-blue-500/30"
                onClick={onReminder}
              >
                <Bell className="h-5 w-5 text-blue-500" />
                <span>Lembrete Interno</span>
              </Button>
            </div>
          </div>

          <Separator />

          {/* Preferências do Cliente */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Notas e Observações</h3>
            {isEditing ? (
              <Textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Adicione notas sobre o cliente, preferências ou informações importantes..."
                className="min-h-[100px]"
              />
            ) : (
              <div className="p-3 rounded-md bg-muted/50 min-h-[100px]">
                {customer.notes ? (
                  <p className="text-sm">{customer.notes}</p>
                ) : (
                  <p className="text-sm text-muted-foreground italic">
                    Nenhuma nota ou observação registrada ainda.
                  </p>
                )}
              </div>
            )}

            {/* Preferências de Serviços (a ser implementado) */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                Serviços Preferidos
              </h3>
              <p className="text-sm text-muted-foreground italic">
                As preferências de serviços serão calculadas automaticamente com base no histórico
                de agendamentos.
              </p>
            </div>

            {/* Preferências de Comunicação (a ser implementado) */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                Preferências de Comunicação
              </h3>
              <p className="text-sm text-muted-foreground italic">
                As preferências de comunicação serão implementadas em uma atualização futura.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
