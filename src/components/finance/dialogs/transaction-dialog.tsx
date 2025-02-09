'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useFinanceStore } from '@/store/finance-store'
import type { Transaction } from '@/store/finance-store'
import { format } from 'date-fns'
import { Timestamp } from 'firebase/firestore'

const transactionSchema = z.object({
  type: z.enum(['income', 'expense']),
  category: z.string().min(1, 'Categoria é obrigatória'),
  amount: z
    .string()
    .min(1, 'Valor é obrigatório')
    .transform(val => parseFloat(val)),
  paymentMethod: z.enum(['cash', 'credit_card', 'debit_card', 'pix']).nullable(),
  notes: z.string().nullable(),
  transactionDate: z.string().min(1, 'Data é obrigatória'),
  clientId: z.string().nullable(),
  receiptUrl: z.string().nullable(),
})

type TransactionFormValues = z.infer<typeof transactionSchema>

interface TransactionDialogProps {
  trigger?: React.ReactNode
  transaction?: Transaction
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function TransactionDialog({
  trigger,
  transaction,
  open: controlledOpen,
  onOpenChange,
}: TransactionDialogProps) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { actions } = useFinanceStore()

  const isControlled = controlledOpen !== undefined && onOpenChange !== undefined
  const isOpen = isControlled ? controlledOpen : open
  const setIsOpen = isControlled ? onOpenChange : setOpen

  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: transaction?.type || 'income',
      category: transaction?.category || '',
      amount: transaction?.amount || 0,
      paymentMethod: transaction?.paymentMethod || null,
      notes: transaction?.notes || null,
      transactionDate: transaction?.transactionDate
        ? format(transaction.transactionDate.toDate(), 'yyyy-MM-dd')
        : format(new Date(), 'yyyy-MM-dd'),
      clientId: transaction?.clientId || null,
      receiptUrl: transaction?.receiptUrl || null,
    },
  })

  const onSubmit = async (data: TransactionFormValues) => {
    try {
      setIsSubmitting(true)
      const [year, month, day] = data.transactionDate.split('-').map(Number)
      const adjustedDate = new Date(year, month - 1, day, 12, 0, 0)

      const transactionData = {
        type: data.type,
        category: data.category,
        amount: data.amount,
        paymentMethod: data.paymentMethod,
        notes: data.notes,
        transactionDate: Timestamp.fromDate(adjustedDate),
        clientId: data.clientId,
        receiptUrl: data.receiptUrl,
      }

      if (transaction) {
        await actions.updateTransaction(transaction.id, transactionData)
      } else {
        await actions.addTransaction(transactionData)
      }

      form.reset()
      setIsOpen(false)

      setTimeout(() => {
        toast.success(
          `${data.type === 'income' ? 'Receita' : 'Despesa'} ${
            transaction ? 'atualizada' : 'adicionada'
          } com sucesso.`,
          {
            style: {
              background:
                data.type === 'income' ? 'rgb(var(--soft-sage))' : 'rgb(var(--terracotta))',
              color: 'white',
            },
          }
        )
      }, 0)
    } catch (error) {
      setTimeout(() => {
        toast.error(
          `Não foi possível ${
            transaction ? 'atualizar' : 'adicionar'
          } a transação. Tente novamente.`
        )
      }, 0)
      console.error('Erro ao processar transação:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="w-[min(calc(100%-2rem),400px)] p-4 gap-4">
        <DialogHeader className="space-y-2 text-left">
          <DialogTitle className="text-lg font-semibold">
            {transaction ? 'Editar' : 'Nova'} Transação
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {transaction ? 'Edite os dados da' : 'Adicione uma nova'} transação ao seu fluxo
            financeiro.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm">Tipo</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value ?? undefined}>
                      <FormControl>
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="income">Receita</SelectItem>
                        <SelectItem value="expense">Despesa</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm">Valor</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0,00"
                        className="h-9"
                        {...field}
                        value={field.value || ''}
                        onChange={e => field.onChange(e.target.value || '')}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm">Categoria</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value ?? undefined}>
                    <FormControl>
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Selecione a categoria" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {form.watch('type') === 'income' ? (
                        <>
                          <SelectItem value="Serviços">Serviços</SelectItem>
                          <SelectItem value="Produtos">Produtos</SelectItem>
                          <SelectItem value="Outros">Outros</SelectItem>
                        </>
                      ) : (
                        <>
                          <SelectItem value="Suprimentos">Suprimentos</SelectItem>
                          <SelectItem value="Marketing">Marketing</SelectItem>
                          <SelectItem value="Operacional">Operacional</SelectItem>
                          <SelectItem value="Outros">Outros</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm">Pagamento</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value ?? undefined}>
                      <FormControl>
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Método" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="cash">Dinheiro</SelectItem>
                        <SelectItem value="credit_card">Crédito</SelectItem>
                        <SelectItem value="debit_card">Débito</SelectItem>
                        <SelectItem value="pix">PIX</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="transactionDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm">Data</FormLabel>
                    <FormControl>
                      <Input type="date" className="h-9" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm">Observações</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Adicione observações..."
                      className="resize-none h-20"
                      {...field}
                      value={field.value || undefined}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                disabled={isSubmitting}
                className="h-9"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="h-9 bg-terracotta hover:bg-terracotta/90 text-white"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    Salvando...
                  </>
                ) : (
                  'Salvar'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
