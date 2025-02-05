'use client'

import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import { useBusinessHoursStore } from '@/store/business-hours-store'
import { type BusinessHoursConfig } from '@/types/schedule'

const WEEKDAYS = [
  { label: 'Domingo', value: 0 },
  { label: 'Segunda', value: 1 },
  { label: 'Terça', value: 2 },
  { label: 'Quarta', value: 3 },
  { label: 'Quinta', value: 4 },
  { label: 'Sexta', value: 5 },
  { label: 'Sábado', value: 6 }
]

export function BusinessHoursConfig() {
  const { config, isLoading, actions } = useBusinessHoursStore()
  const [hasLunchBreak, setHasLunchBreak] = useState(false)
  const [formData, setFormData] = useState<BusinessHoursConfig>({
    starttime: '09:00',
    endtime: '18:00',
    daysoff: [0],
    owner_id: ''
  })

  useEffect(() => {
    actions.fetchConfig()
  }, [actions])

  useEffect(() => {
    if (config) {
      setFormData(config)
      setHasLunchBreak(!!config.lunchbreak)
    }
  }, [config])

  const handleSubmit = async () => {
    const updatedConfig = {
      ...formData,
      lunchbreak: hasLunchBreak ? formData.lunchbreak : undefined
    }
    await actions.updateConfig(updatedConfig)
  }

  const toggleDayOff = (day: number) => {
    setFormData(prev => ({
      ...prev,
      daysoff: prev.daysoff.includes(day)
        ? prev.daysoff.filter(d => d !== day)
        : [...prev.daysoff, day]
    }))
  }

  return (
    <Card className="p-4 space-y-6">
      <h3 className="text-lg font-medium">Horário de Expediente</h3>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Horário de Início</Label>
          <Input
            type="time"
            value={formData.starttime}
            onChange={(e) => setFormData(prev => ({ ...prev, starttime: e.target.value }))}
          />
        </div>

        <div className="space-y-2">
          <Label>Horário de Término</Label>
          <Input
            type="time"
            value={formData.endtime}
            onChange={(e) => setFormData(prev => ({ ...prev, endtime: e.target.value }))}
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Horário de Almoço</Label>
          <Switch
            checked={hasLunchBreak}
            onCheckedChange={setHasLunchBreak}
          />
        </div>

        {hasLunchBreak && (
          <div className="grid grid-cols-2 gap-4 mt-2">
            <div className="space-y-2">
              <Label>Início</Label>
              <Input
                type="time"
                value={formData.lunchbreak?.start || '12:00'}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  lunchbreak: {
                    ...prev.lunchbreak || { end: '13:00' },
                    start: e.target.value
                  }
                }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Término</Label>
              <Input
                type="time"
                value={formData.lunchbreak?.end || '13:00'}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  lunchbreak: {
                    ...prev.lunchbreak || { start: '12:00' },
                    end: e.target.value
                  }
                }))}
              />
            </div>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label>Dias de Folga</Label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {WEEKDAYS.map((day) => (
            <div key={day.value} className="flex items-center space-x-2">
              <Checkbox
                id={`day-${day.value}`}
                checked={formData.daysoff.includes(day.value)}
                onCheckedChange={() => toggleDayOff(day.value)}
              />
              <label
                htmlFor={`day-${day.value}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {day.label}
              </label>
            </div>
          ))}
        </div>
      </div>

      <Button
        className="w-full"
        onClick={handleSubmit}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Salvando...
          </>
        ) : (
          'Salvar Configurações'
        )}
      </Button>
    </Card>
  )
} 