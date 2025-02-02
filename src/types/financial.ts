export type TransactionType = 'INCOME' | 'EXPENSE'
export type TransactionCategory = 'SERVICE' | 'PRODUCT' | 'RENT' | 'OTHER'
export type PaymentMethod = 'CASH' | 'CARD' | 'PIX'

export type FinancialTransaction = {
  id: string
  type: TransactionType
  category: TransactionCategory
  value: number
  discount?: number // 0-1 (%)
  paymentMethod: PaymentMethod
  date: Date
  description: string
  appointmentId?: string
  clientId?: string
  createdAt: Date
  updatedAt: Date
}

export type RevenueBreakdown = {
  service: string
  value: number
} 