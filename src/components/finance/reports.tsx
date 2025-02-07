'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export function Reports() {
  return (
    <div className="space-y-4">
      <div className="flex justify-end space-x-2">
        <Select defaultValue="month">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">Última Semana</SelectItem>
            <SelectItem value="month">Último Mês</SelectItem>
            <SelectItem value="quarter">Último Trimestre</SelectItem>
            <SelectItem value="year">Último Ano</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Receitas por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Serviços</span>
                <span className="font-bold">R$ 32.450,00</span>
              </div>
              <div className="flex justify-between">
                <span>Produtos</span>
                <span className="font-bold">R$ 12.781,89</span>
              </div>
              <div className="h-2 bg-gray-100 rounded">
                <div className="h-full bg-green-500 rounded" style={{ width: '75%' }}></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Despesas por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Suprimentos</span>
                <span className="font-bold">R$ 8.234,45</span>
              </div>
              <div className="flex justify-between">
                <span>Marketing</span>
                <span className="font-bold">R$ 2.500,00</span>
              </div>
              <div className="flex justify-between">
                <span>Operacional</span>
                <span className="font-bold">R$ 1.500,00</span>
              </div>
              <div className="h-2 bg-gray-100 rounded">
                <div className="h-full bg-red-500 rounded" style={{ width: '40%' }}></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Fluxo de Caixa</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-500">Saldo Inicial</p>
                  <p className="text-lg font-bold">R$ 25.000,00</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Entradas</p>
                  <p className="text-lg font-bold text-green-600">+ R$ 45.231,89</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Saídas</p>
                  <p className="text-lg font-bold text-red-600">- R$ 12.234,45</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Saldo Final</p>
                  <p className="text-lg font-bold">R$ 57.997,44</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
