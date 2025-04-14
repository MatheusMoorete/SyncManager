'use client'

import { useState } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { X, LinkIcon, User, Calendar } from 'lucide-react'

export function BookingTutorial() {
  const [dismissed, setDismissed] = useState(false)

  const steps = [
    {
      title: 'Passo 1: Crie um link',
      description:
        'Clique no botão "Novo Link" para criar um link de agendamento. Adicione um nome, descrição e selecione os serviços disponíveis neste link.',
      icon: <LinkIcon className="h-8 w-8 text-primary" />,
    },
    {
      title: 'Passo 2: Compartilhe',
      description:
        'Copie o link clicando no botão "Copiar" e compartilhe com seus clientes através de WhatsApp, Instagram, E-mail ou outras plataformas.',
      icon: <User className="h-8 w-8 text-primary" />,
    },
    {
      title: 'Passo 3: Gerencie',
      description:
        'Os agendamentos realizados aparecem automaticamente na sua agenda. Você pode atendê-los normalmente como qualquer outro agendamento.',
      icon: <Calendar className="h-8 w-8 text-primary" />,
    },
  ]

  if (dismissed) {
    return null
  }

  return (
    <div className="mb-8 relative pb-1">
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-muted-foreground absolute top-0 right-0 z-10"
        onClick={() => setDismissed(true)}
        title="Fechar"
        aria-label="Fechar tutorial"
      >
        <X className="h-4 w-4" />
      </Button>
      
      <h3 className="text-lg font-medium mb-4">Como usar links de agendamento</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {steps.map((step, index) => (
          <Card key={index} className="border-primary/10 hover:border-primary/30 transition-colors duration-300 h-full">
            <CardHeader className="pb-2 pt-6">
              <div className="flex flex-col items-center text-center mb-2">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 mb-4">
                  {step.icon}
                </div>
                <CardTitle className="text-lg">{step.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-muted-foreground">{step.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
