'use client'

import { Button } from '@/components/ui/button'
import {
  FileIcon,
  Package2,
  Calendar,
  Users,
  Scissors,
  DollarSign,
  Inbox,
  AlertCircle,
  BarChart,
  FileText,
  Link as LinkIcon,
} from 'lucide-react'

interface EmptyStateProps {
  title: string
  description: string
  icon?: string
  actionLabel?: string
  onAction?: () => void
}

export function EmptyState({
  title,
  description,
  icon = 'default',
  actionLabel,
  onAction,
}: EmptyStateProps) {
  const getIcon = () => {
    switch (icon) {
      case 'customers':
        return <Users className="h-10 w-10 text-muted-foreground" />
      case 'services':
        return <Scissors className="h-10 w-10 text-muted-foreground" />
      case 'appointments':
        return <Calendar className="h-10 w-10 text-muted-foreground" />
      case 'finance':
        return <DollarSign className="h-10 w-10 text-muted-foreground" />
      case 'document':
        return <FileText className="h-10 w-10 text-muted-foreground" />
      case 'analytics':
        return <BarChart className="h-10 w-10 text-muted-foreground" />
      case 'file':
        return <FileIcon className="h-10 w-10 text-muted-foreground" />
      case 'link':
        return <LinkIcon className="h-10 w-10 text-muted-foreground" />
      case 'error':
        return <AlertCircle className="h-10 w-10 text-destructive" />
      default:
        return <Inbox className="h-10 w-10 text-muted-foreground" />
    }
  }

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center rounded-md border border-dashed p-8 text-center animate-in fade-in-50">
      <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
          {getIcon()}
        </div>
        <h3 className="mt-4 text-lg font-semibold">{title}</h3>
        <p className="mb-4 mt-2 text-sm text-muted-foreground">{description}</p>
        {actionLabel && onAction && <Button onClick={onAction}>{actionLabel}</Button>}
      </div>
    </div>
  )
}
