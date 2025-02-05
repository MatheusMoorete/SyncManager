import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { BusinessHoursConfig } from './business-hours-config'

interface BusinessHoursDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function BusinessHoursDialog({
  open,
  onOpenChange,
}: BusinessHoursDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Configurar Horário de Expediente</DialogTitle>
        </DialogHeader>
        <BusinessHoursConfig />
      </DialogContent>
    </Dialog>
  )
} 