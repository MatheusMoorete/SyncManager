'use client'

/**
 * @component LoyaltySettingsPage
 * @description Página de configuração do sistema de fidelidade com regras de pontuação
 *
 * @features
 * - Configuração de pontos por valor gasto
 * - Regras específicas por serviço
 * - Níveis de fidelidade
 * - Benefícios por nível
 * - Responsivo mobile-first
 */

import { useEffect, useState } from 'react'
import { AppLayout } from '@/components/layout/app-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2, Plus, Trash2, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { useServiceStore } from '@/store/service-store'
import { useLoyaltyStore } from '@/store/loyalty-store'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

export default function LoyaltySettingsPage() {
  const { services } = useServiceStore()
  const { config, isLoading, actions } = useLoyaltyStore()
  const [isSaving, setIsSaving] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [pendingSettings, setPendingSettings] = useState<any>(null)

  // Estado local para as configurações
  const [settings, setSettings] = useState({
    enabled: false,
    pointsPerCurrency: 1, // 1 ponto a cada R$1
    minimumForPoints: 0, // Valor mínimo para ganhar pontos
    serviceRules: [] as {
      service_id: string
      multiplier: number // Multiplicador de pontos para este serviço
    }[],
    levels: [] as {
      name: string
      minPoints: number
      discount: number // Desconto em %
    }[],
  })

  // Carregar configurações existentes
  useEffect(() => {
    actions.fetchConfig()
  }, [actions])

  // Carregar serviços ao montar o componente
  useEffect(() => {
    const { actions } = useServiceStore.getState()
    actions.fetchServices()
  }, [])

  // Atualizar settings quando config mudar
  useEffect(() => {
    if (config) {
      setSettings(config)
    }
  }, [config])

  const handleSave = async () => {
    // Verificar se já existem regras configuradas
    if (config && (config.serviceRules.length > 0 || config.levels.length > 0)) {
      setPendingSettings(settings)
      setShowConfirmDialog(true)
      return
    }

    await saveSettings(settings)
  }

  const saveSettings = async (settingsToSave: typeof settings) => {
    try {
      setIsSaving(true)
      await actions.updateConfig(settingsToSave)
      toast.success('Configurações salvas com sucesso!')
    } catch (error) {
      console.error('Error saving loyalty settings:', error)
      toast.error('Erro ao salvar configurações')
    } finally {
      setIsSaving(false)
      setShowConfirmDialog(false)
    }
  }

  const addServiceRule = () => {
    setSettings(prev => ({
      ...prev,
      serviceRules: [
        ...prev.serviceRules,
        {
          service_id: '',
          multiplier: 1,
        },
      ],
    }))
  }

  const removeServiceRule = (index: number) => {
    setSettings(prev => ({
      ...prev,
      serviceRules: prev.serviceRules.filter((_, i) => i !== index),
    }))
  }

  const addLevel = () => {
    setSettings(prev => ({
      ...prev,
      levels: [
        ...prev.levels,
        {
          name: '',
          minPoints: 0,
          discount: 0,
        },
      ],
    }))
  }

  const removeLevel = (index: number) => {
    setSettings(prev => ({
      ...prev,
      levels: prev.levels.filter((_, i) => i !== index),
    }))
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <AppLayout>
      <div className="flex-1 space-y-6 p-4 md:p-8">
        {/* Header */}
        <div>
          <h2 className="text-2xl md:text-3xl font-semibold font-heading text-heading">
            Sistema de Fidelidade
          </h2>
          <p className="text-sm text-muted-foreground">
            Configure as regras de pontuação e benefícios para seus clientes
          </p>
        </div>

        {/* Configurações Gerais */}
        <Card>
          <CardHeader>
            <CardTitle>Configurações Gerais</CardTitle>
            <CardDescription>
              Defina as regras básicas do seu programa de fidelidade
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <Label htmlFor="enabled" className="font-medium">
                Ativar Sistema de Fidelidade
              </Label>
              <Switch
                id="enabled"
                checked={settings.enabled}
                onCheckedChange={checked => setSettings(prev => ({ ...prev, enabled: checked }))}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="pointsPerCurrency">Pontos por Real Gasto (R$)</Label>
                <Input
                  id="pointsPerCurrency"
                  type="number"
                  min="0"
                  step="0.1"
                  className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  value={settings.pointsPerCurrency}
                  onChange={e =>
                    setSettings(prev => ({
                      ...prev,
                      pointsPerCurrency: e.target.value === '' ? 0 : parseFloat(e.target.value),
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="minimumForPoints">Valor Mínimo para Pontuação (R$)</Label>
                <Input
                  id="minimumForPoints"
                  type="number"
                  min="0"
                  className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  value={settings.minimumForPoints === 0 ? '' : settings.minimumForPoints}
                  onChange={e =>
                    setSettings(prev => ({
                      ...prev,
                      minimumForPoints: e.target.value === '' ? 0 : parseFloat(e.target.value),
                    }))
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Níveis de Fidelidade */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Níveis de Fidelidade</CardTitle>
              <CardDescription>Configure os níveis e benefícios do programa</CardDescription>
            </div>
            <Button onClick={addLevel} variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Nível
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {settings.levels.map((level, index) => (
              <div
                key={index}
                className="space-y-4 md:space-y-0 md:grid md:grid-cols-3 md:gap-4 md:items-end border-b pb-4 last:border-0 last:pb-0"
              >
                <div>
                  <Label className="mb-2">Nome do Nível</Label>
                  <Input
                    value={level.name}
                    onChange={e =>
                      setSettings(prev => ({
                        ...prev,
                        levels: prev.levels.map((l, i) =>
                          i === index ? { ...l, name: e.target.value } : l
                        ),
                      }))
                    }
                    placeholder="Ex: Bronze, Prata, Ouro..."
                  />
                </div>

                <div>
                  <Label className="mb-2">Pontos Mínimos</Label>
                  <Input
                    type="number"
                    min="0"
                    className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    value={level.minPoints === 0 ? '' : level.minPoints}
                    onChange={e =>
                      setSettings(prev => ({
                        ...prev,
                        levels: prev.levels.map((l, i) =>
                          i === index
                            ? {
                                ...l,
                                minPoints: e.target.value === '' ? 0 : parseInt(e.target.value),
                              }
                            : l
                        ),
                      }))
                    }
                  />
                </div>

                <div className="flex items-end gap-4">
                  <div className="flex-1">
                    <Label className="mb-2">Desconto (%)</Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      value={level.discount === 0 ? '' : level.discount}
                      onChange={e =>
                        setSettings(prev => ({
                          ...prev,
                          levels: prev.levels.map((l, i) =>
                            i === index
                              ? {
                                  ...l,
                                  discount: e.target.value === '' ? 0 : parseInt(e.target.value),
                                }
                              : l
                          ),
                        }))
                      }
                    />
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeLevel(index)}
                    className="text-destructive hover:text-destructive/90 mt-2 md:mt-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Regras por Serviço */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Regras por Serviço</CardTitle>
              <CardDescription className="hidden md:block">
                Configure multiplicadores de pontos para serviços específicos
              </CardDescription>
            </div>
            <Button onClick={addServiceRule} variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              <span className="hidden md:inline">Adicionar Regra</span>
              <span className="md:hidden">Adicionar</span>
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {settings.serviceRules.map((rule, index) => (
              <div
                key={index}
                className="space-y-4 md:space-y-0 md:flex md:items-end md:gap-4 border-b pb-4 last:border-0 last:pb-0"
              >
                <div className="flex-1">
                  <Label className="mb-2">Serviço</Label>
                  <Select
                    value={rule.service_id}
                    onValueChange={value =>
                      setSettings(prev => ({
                        ...prev,
                        serviceRules: prev.serviceRules.map((r, i) =>
                          i === index ? { ...r, service_id: value } : r
                        ),
                      }))
                    }
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Selecione um serviço" />
                    </SelectTrigger>
                    <SelectContent>
                      {services.map(service => (
                        <SelectItem key={service.id} value={service.id!}>
                          {service.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="w-full md:w-32">
                  <Label className="mb-2">Multiplicador</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.1"
                    className="h-9 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    value={rule.multiplier === 0 ? '' : rule.multiplier}
                    onChange={e =>
                      setSettings(prev => ({
                        ...prev,
                        serviceRules: prev.serviceRules.map((r, i) =>
                          i === index
                            ? {
                                ...r,
                                multiplier: e.target.value === '' ? 0 : parseFloat(e.target.value),
                              }
                            : r
                        ),
                      }))
                    }
                  />
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeServiceRule(index)}
                  className="text-destructive hover:text-destructive/90 mt-2 md:mt-0"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Ações */}
        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full md:w-auto bg-terracotta hover:bg-terracotta/90 text-white"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              'Salvar Configurações'
            )}
          </Button>
        </div>

        {/* Diálogo de Confirmação */}
        <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-terracotta" />
                Atenção
              </AlertDialogTitle>
              <AlertDialogDescription className="text-base">
                Alterar as regras do sistema de fidelidade irá recalcular todos os pontos já
                distribuídos. Isso pode afetar o nível e benefícios atuais dos clientes.
                <br />
                <br />
                Tem certeza que deseja continuar?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isSaving}>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                disabled={isSaving}
                onClick={() => saveSettings(pendingSettings)}
                className="bg-terracotta hover:bg-terracotta/90"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  'Sim, continuar'
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AppLayout>
  )
}
