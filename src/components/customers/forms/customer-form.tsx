'use client'

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { parse, isValid, format } from "date-fns"
import { toast } from "sonner"
import { DialogClose } from "@/components/ui/dialog"
import { useRef } from "react"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { CustomerFormValues, customerFormSchema } from "@/types/customer"

export interface CustomerFormProps {
  initialData?: Partial<CustomerFormValues>
  onSubmit: (data: CustomerFormValues) => Promise<void>
  isLoading?: boolean
}

export function CustomerForm({
  initialData,
  onSubmit,
  isLoading
}: CustomerFormProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: {
      name: initialData?.name || '',
      phone: initialData?.phone || '',
      email: initialData?.email || '',
      birthDate: initialData?.birthDate || '',
      notes: initialData?.notes || '',
    }
  })

  const handleSubmit = async (data: CustomerFormValues) => {
    try {
      await onSubmit(data)
      form.reset()
      closeButtonRef.current?.click()
    } catch (error) {
      console.error('Error submitting form:', error)
      toast.error('Erro ao salvar cliente')
    }
  }

  const formatPhoneNumber = (value: string) => {
    // Remove tudo que não for número
    const numbers = value.replace(/\D/g, '')
    
    // Aplica a máscara (XX) XXXXX-XXXX
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
    }
    
    return value
  }

  const formatDate = (value: string) => {
    // Remove tudo que não for número
    const numbers = value.replace(/\D/g, '')
    
    // Aplica a máscara DD/MM/YYYY
    return numbers.replace(/(\d{2})(\d{2})(\d{4})/, '$1/$2/$3')
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Nome completo
                <span className="text-red-500 ml-1">*</span>
              </FormLabel>
              <FormControl>
                <Input {...field} />
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
              <FormLabel>
                Telefone
                <span className="text-red-500 ml-1">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  onChange={(e) => {
                    const formatted = formatPhoneNumber(e.target.value)
                    field.onChange(formatted)
                  }}
                  maxLength={15}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>E-mail</FormLabel>
              <FormControl>
                <Input {...field} type="email" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="birthDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Data de nascimento</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  onChange={(e) => {
                    const formatted = formatDate(e.target.value)
                    if (formatted.length <= 10) {
                      field.onChange(formatted)
                    }
                  }}
                  maxLength={10}
                  placeholder="DD/MM/AAAA"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observações</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-4">
          <DialogClose ref={closeButtonRef} asChild>
            <Button type="button" variant="outline">Cancelar</Button>
          </DialogClose>
          <Button 
            type="submit" 
            disabled={isLoading}
            className="bg-terracotta hover:bg-terracotta/90 text-white"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              'Salvar'
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
} 