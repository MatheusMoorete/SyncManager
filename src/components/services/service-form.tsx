'use client'

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ServiceFormValues } from "@/types/service"
import { useState } from "react"

const formSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
  base_price: z.number().min(0, "Preço deve ser maior ou igual a 0"),
  duration: z.string().default("01:00:00"),
  is_active: z.boolean().default(true),
})

interface ServiceFormProps {
  initialData?: ServiceFormValues
  onSubmit: (data: ServiceFormValues) => Promise<void>
  isLoading?: boolean
}

export function ServiceForm({
  initialData,
  onSubmit,
  isLoading
}: ServiceFormProps) {
  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      base_price: initialData?.base_price || 0,
      duration: initialData?.duration || "01:00:00",
      is_active: initialData?.is_active ?? true,
    }
  })

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const unformatPrice = (value: string) => {
    // Remove tudo que não é número e vírgula
    const cleaned = value.replace(/[^\d,]/g, '')
    // Substitui vírgula por ponto
    const withDot = cleaned.replace(',', '.')
    // Converte para número
    const number = Number(withDot)
    // Retorna 0 se não for um número válido
    return isNaN(number) ? 0 : number
  }

  const [isEditing, setIsEditing] = useState(false)

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="after:content-['*'] after:ml-0.5 after:text-red-500">Nome</FormLabel>
              <FormControl>
                <Input placeholder="Nome do serviço" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="base_price"
          render={({ field: { onChange, onBlur, value, ...field } }) => (
            <FormItem>
              <FormLabel className="after:content-['*'] after:ml-0.5 after:text-red-500">Preço</FormLabel>
              <FormControl>
                <Input 
                  type="text"
                  placeholder="0,00"
                  {...field}
                  value={isEditing ? value : formatPrice(value)}
                  onChange={(e) => {
                    onChange(unformatPrice(e.target.value))
                  }}
                  onFocus={() => setIsEditing(true)}
                  onBlur={(e) => {
                    setIsEditing(false)
                    onBlur()
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Descrição do serviço"
                  maxLength={20}
                />
              </FormControl>
              <FormDescription>
                Máximo de 20 caracteres ({20 - (field.value?.length || 0)} restantes)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end pt-4">
          <Button 
            type="submit" 
            disabled={isLoading}
            className="bg-terracotta hover:bg-terracotta/90 text-white"
          >
            {isLoading ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </form>
    </Form>
  )
} 