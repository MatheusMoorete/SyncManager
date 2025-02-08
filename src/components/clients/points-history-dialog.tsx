'use client'

import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { createClient } from '@/lib/supabase/client'
import { Loader2 } from 'lucide-react'

interface PointsHistoryEntry {
  id: string
  points: number
  type: 'earned' | 'spent' | 'expired' | 'adjusted'
  description: string
  created_at: string
}

interface PointsHistoryDialogProps {
  clientId: string
  clientName: string
  trigger?: React.ReactNode
}

export function PointsHistoryDialog({ clientId, clientName, trigger }: PointsHistoryDialogProps) {
  const [history, setHistory] = useState<PointsHistoryEntry[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  const fetchHistory = async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('points_history')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false })

      if (error) throw error

      setHistory(data)
    } catch (error) {
      console.error('Error fetching points history:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getTypeStyle = (type: PointsHistoryEntry['type']) => {
    switch (type) {
      case 'earned':
        return 'text-soft-sage'
      case 'spent':
        return 'text-terracotta'
      case 'expired':
        return 'text-gray-500'
      case 'adjusted':
        return 'text-blue-500'
      default:
        return ''
    }
  }

  const getTypeLabel = (type: PointsHistoryEntry['type']) => {
    switch (type) {
      case 'earned':
        return 'Ganho'
      case 'spent':
        return 'Utilizado'
      case 'expired':
        return 'Expirado'
      case 'adjusted':
        return 'Ajustado'
      default:
        return type
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || <Button variant="outline">Ver Histórico de Pontos</Button>}
      </DialogTrigger>
      <DialogContent className="max-w-2xl" onOpenAutoFocus={fetchHistory}>
        <DialogHeader>
          <DialogTitle>Histórico de Pontos - {clientName}</DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[400px] pr-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : history.length > 0 ? (
            <div className="space-y-4">
              {history.map(entry => (
                <div
                  key={entry.id}
                  className="flex items-start justify-between border-b pb-4 last:border-0"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{entry.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(entry.created_at), "PPP 'às' HH:mm", {
                        locale: ptBR,
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-medium ${getTypeStyle(entry.type)}`}>
                      {entry.type === 'spent' ? '-' : '+'} {entry.points} pontos
                    </p>
                    <p className="text-xs text-muted-foreground">{getTypeLabel(entry.type)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum histórico de pontos encontrado
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
