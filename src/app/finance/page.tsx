'use client'

import { useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  ArrowUpIcon,
  ArrowDownIcon,
  DollarSign,
  TrendingUp,
  PlusIcon,
  Calendar,
  Filter,
  Loader2,
} from 'lucide-react'
import { useFinanceStore } from '@/store/finance-store'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { TransactionDialog } from '@/components/finance/dialogs/transaction-dialog'
import { Overview } from '@/components/finance/overview'

export default function FinancePage() {
  const { transactions, stats, isLoading, error, actions } = useFinanceStore()

  useEffect(() => {
    actions.fetchTransactions()
    actions.fetchExpenses()
  }, [actions])

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-destructive">Erro ao carregar dados: {error}</p>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 bg-neutral-cream/20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-semibold font-heading text-heading">Financeiro</h2>
          <p className="text-sm text-muted-foreground">Gerencie as finanças do seu negócio</p>
        </div>
        <TransactionDialog
          trigger={
            <Button className="bg-terracotta hover:bg-terracotta/90 text-white">
              <PlusIcon className="mr-2 h-4 w-4" /> Nova Transação
            </Button>
          }
        />
      </div>

      {/* Cards de Resumo */}
      <Overview />

      {/* Gráficos e Análises */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-white/95 hover:bg-white/100 transition-all shadow-lg hover:shadow-xl border-none ring-1 ring-charcoal/5">
          <CardHeader>
            <CardTitle className="text-lg">Receitas por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.incomeByCategory.map(item => (
                <div key={item.category} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{item.category}</span>
                    <span className="text-sm font-bold text-soft-sage">
                      R$ {item.total.toFixed(2)}
                    </span>
                  </div>
                  <div className="h-2 bg-neutral-cream/30 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-soft-sage to-soft-sage/80 rounded-full"
                      style={{
                        width: `${(item.total / stats.totalIncome) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/95 hover:bg-white/100 transition-all shadow-lg hover:shadow-xl border-none ring-1 ring-charcoal/5">
          <CardHeader>
            <CardTitle className="text-lg">Despesas por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.expensesByCategory.map(item => (
                <div key={item.category} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{item.category}</span>
                    <span className="text-sm font-bold text-terracotta">
                      R$ {item.total.toFixed(2)}
                    </span>
                  </div>
                  <div className="h-2 bg-neutral-cream/30 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-terracotta to-terracotta/80 rounded-full"
                      style={{
                        width: `${(item.total / stats.totalExpenses) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transações Recentes */}
      <Card className="bg-white/95 hover:bg-white/100 transition-all shadow-lg hover:shadow-xl border-none ring-1 ring-charcoal/5">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Transações Recentes</CardTitle>
            <div className="flex gap-2">
              <Input placeholder="Buscar transações..." className="max-w-[200px]" />
              <Select>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Filtrar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="income">Receitas</SelectItem>
                  <SelectItem value="expense">Despesas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Método</TableHead>
                <TableHead className="text-right">Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map(transaction => (
                <TableRow key={transaction.id} className="hover:bg-neutral-cream/10">
                  <TableCell className="font-medium">
                    {format(new Date(transaction.transaction_date), 'dd/MM/yyyy', {
                      locale: ptBR,
                    })}
                  </TableCell>
                  <TableCell>{transaction.notes || '-'}</TableCell>
                  <TableCell>{transaction.category}</TableCell>
                  <TableCell>
                    {transaction.payment_method
                      ? transaction.payment_method
                          .split('_')
                          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                          .join(' ')
                      : '-'}
                  </TableCell>
                  <TableCell
                    className={`text-right font-medium ${
                      transaction.type === 'income' ? 'text-soft-sage' : 'text-terracotta'
                    }`}
                  >
                    {transaction.type === 'income' ? '+' : '-'} R${' '}
                    {Math.abs(transaction.amount).toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
