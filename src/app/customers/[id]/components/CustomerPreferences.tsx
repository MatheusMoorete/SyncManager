'use client'

import { useState } from 'react'
import { Edit2, Save, X } from 'lucide-react'
import { Customer, CustomerFormValues } from '@/types/customer'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface CustomerPreferencesProps {
  customer: Customer
  onUpdateCustomer: (id: string, data: CustomerFormValues) => Promise<void>
}

export function CustomerPreferences({ customer, onUpdateCustomer }: CustomerPreferencesProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [notes, setNotes] = useState(customer.notes || '')
  const [loading, setLoading] = useState(false)

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

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-4">
        <CardTitle className="text-lg font-medium">Preferências do Cliente</CardTitle>
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
            <Button 
              variant="default" 
              size="sm" 
              onClick={handleSave}
              disabled={loading}
            >
              <Save className="h-4 w-4 mr-1" />
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        ) : (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setIsEditing(true)}
          >
            <Edit2 className="h-4 w-4 mr-1" />
            Editar
          </Button>
        )}
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="space-y-4">
          {/* Notas e observações */}
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">
              Notas e Observações
            </p>
            {isEditing ? (
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
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
          </div>
          
          {/* Preferências de Serviços (a ser implementado) */}
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">
              Serviços Preferidos
            </p>
            <p className="text-sm text-muted-foreground italic">
              As preferências de serviços serão calculadas automaticamente com base no histórico de agendamentos.
            </p>
          </div>
          
          {/* Preferências de Comunicação (a ser implementado) */}
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">
              Preferências de Comunicação
            </p>
            <p className="text-sm text-muted-foreground italic">
              As preferências de comunicação serão implementadas em uma atualização futura.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 