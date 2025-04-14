'use client'

import { useState } from 'react'
import { useBookingLinkStore } from '@/store/booking-link-store'
import { useServiceStore } from '@/store/service-store'
import { Button } from '@/components/ui/button'
import {
  PlusIcon,
  RefreshCcw,
  ExternalLink,
  Copy,
  Edit,
  Trash2,
  Info,
  QrCode,
  Share,
  Eye,
  Calendar,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/use-toast'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useRouter } from 'next/navigation'
import { BookingLinkDialog } from '@/components/booking/booking-link-dialog'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Timestamp } from 'firebase/firestore'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/ui/empty-state'
import { PageHeader } from '@/components/ui/page-header'
import { useEffect } from 'react'
import { BookingTutorial } from '@/components/booking/booking-tutorial'
import ReactQRCode from 'react-qr-code'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export default function BookingLinksPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { bookingLinks, loading, filters, actions } = useBookingLinkStore(state => ({
    bookingLinks: state.bookingLinks,
    loading: state.loading,
    filters: state.filters,
    actions: state.actions,
  }))
  const { services, actions: serviceActions } = useServiceStore(state => ({
    services: state.services,
    actions: state.actions,
  }))

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedLink, setSelectedLink] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false)
  const [linkToDelete, setLinkToDelete] = useState<string | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [qrCodeDialogOpen, setQrCodeDialogOpen] = useState(false)
  const [currentQrCodeLink, setCurrentQrCodeLink] = useState('')

  useEffect(() => {
    console.log('Carregando lista de links de agendamento...')
    actions
      .fetchBookingLinks()
      .then(() => {
        console.log('Links de agendamento carregados com sucesso')
      })
      .catch(error => {
        console.error('Erro ao carregar links de agendamento:', error)
      })
  }, [actions, refreshTrigger])

  // Carregar serviços quando o componente for montado
  useEffect(() => {
    console.log('Carregando lista de serviços...')
    serviceActions
      .fetchServices()
      .then(() => {
        console.log('Serviços carregados com sucesso')
      })
      .catch(error => {
        console.error('Erro ao carregar serviços:', error)
      })
  }, [serviceActions])

  useEffect(() => {
    if (!isDialogOpen) {
      const timer = setTimeout(() => {
        console.log('Atualizando links após fechamento do modal')
        actions.fetchBookingLinks()
      }, 800)

      return () => clearTimeout(timer)
    }
  }, [isDialogOpen, actions])

  const handleDelete = async (id: string) => {
    console.log('Solicitação para excluir link:', id)
    setLinkToDelete(id)
    setIsConfirmDeleteOpen(true)
  }

  const confirmDelete = async () => {
    if (linkToDelete) {
      console.log('Confirmando exclusão de link:', linkToDelete)
      try {
        await actions.deleteBookingLink(linkToDelete)
        console.log('Link excluído com sucesso')
        setIsConfirmDeleteOpen(false)
        setLinkToDelete(null)

        setRefreshTrigger(prev => prev + 1)
      } catch (error) {
        console.error('Erro ao excluir link:', error)
        toast({
          title: 'Erro ao excluir link',
          description: 'Não foi possível excluir o link. Tente novamente.',
          variant: 'destructive',
        })
      }
    }
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)
    actions.updateFilters({ search: value })
  }

  const handleOpenDialog = (id?: string) => {
    console.log('Abrindo diálogo' + (id ? ` para editar link: ${id}` : ' para criar novo link'))
    setSelectedLink(id || null)
    setIsDialogOpen(true)
  }

  const handleRefresh = () => {
    console.log('Forçando atualização manual dos links')
    toast({
      title: 'Atualizando...',
      description: 'Buscando links de agendamento atualizados.',
    })
    setRefreshTrigger(prev => prev + 1)
  }

  const copyLinkToClipboard = (slug: string) => {
    const url = `${window.location.origin}/agendar/${slug}`
    navigator.clipboard.writeText(url)
    toast({
      title: 'Link copiado!',
      description: 'O link de agendamento foi copiado para a área de transferência.',
    })
  }

  const getPublicUrl = (slug: string) => {
    return `${window.location.origin}/agendar/${slug}`
  }

  const shareViaWhatsapp = (slug: string) => {
    const url = getPublicUrl(slug)
    const message = `Olá! Você pode agendar um horário comigo através deste link: ${url}`
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
  }

  const showQrCode = (slug: string) => {
    const url = getPublicUrl(slug)
    setCurrentQrCodeLink(url)
    setQrCodeDialogOpen(true)
  }

  useEffect(() => {
    console.log(
      `Links carregados: ${bookingLinks.length}`,
      bookingLinks.map(link => ({ id: link.id, name: link.name }))
    )
  }, [bookingLinks])

  // Função auxiliar para buscar nomes de serviços pelo ID
  const getServiceNames = (serviceIds: string[]) => {
    if (!serviceIds || serviceIds.length === 0) return []
    return serviceIds.map(id => {
      const service = services.find(s => s.id === id)
      return service ? service.name : 'Serviço desconhecido'
    })
  }

  return (
    <div className="container py-6 space-y-6">
      {loading && (
        <div className="fixed inset-0 bg-black/10 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg shadow-lg flex items-center space-x-3">
            <div className="animate-spin h-5 w-5 border-2 border-terracotta border-t-transparent rounded-full"></div>
            <p>Carregando links de agendamento...</p>
          </div>
        </div>
      )}

      <PageHeader
        title="Links de Agendamento"
        description="Crie e gerencie links para que seus clientes possam agendar serviços"
      />

      <BookingTutorial />

      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-1 items-center gap-2">
          <Input
            placeholder="Buscar links..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="max-w-sm"
          />
          <Button variant="outline" size="icon" onClick={handleRefresh} disabled={loading}>
            <RefreshCcw className="h-4 w-4" />
          </Button>
        </div>
        <Button onClick={() => handleOpenDialog()} disabled={loading}>
          <PlusIcon className="h-4 w-4 mr-2" />
          Novo Link
        </Button>
      </div>

      <Tabs defaultValue={filters.onlyActive === false ? 'all' : 'active'} className="w-full">
        <TabsList>
          <TabsTrigger
            value="all"
            onClick={() => {
              console.log('Atualizando filtro: mostrando todos os links')
              actions.updateFilters({ onlyActive: false })
              setRefreshTrigger(prev => prev + 1)
            }}
          >
            Todos
          </TabsTrigger>
          <TabsTrigger
            value="active"
            onClick={() => {
              console.log('Atualizando filtro: mostrando apenas links ativos')
              actions.updateFilters({ onlyActive: true })
              setRefreshTrigger(prev => prev + 1)
            }}
          >
            Ativos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          {bookingLinks.length === 0 ? (
            <EmptyState
              title="Nenhum link de agendamento encontrado"
              description="Crie seu primeiro link para que seus clientes possam agendar serviços online."
              icon="link"
              actionLabel="Criar Link"
              onAction={() => handleOpenDialog()}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bookingLinks.map(link => (
                <LinkCard
                  key={link.id}
                  link={link}
                  serviceNames={getServiceNames(link.services)}
                  onCopy={copyLinkToClipboard}
                  onEdit={() => handleOpenDialog(link.id)}
                  onDelete={() => handleDelete(link.id)}
                  onShowQrCode={showQrCode}
                  onShareWhatsapp={shareViaWhatsapp}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="active" className="mt-6">
          {bookingLinks.length === 0 ? (
            <EmptyState
              title="Nenhum link de agendamento ativo"
              description="Crie um novo link ou ative um existente."
              icon="link"
              actionLabel="Criar Link"
              onAction={() => handleOpenDialog()}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bookingLinks.map(link => (
                <LinkCard
                  key={link.id}
                  link={link}
                  serviceNames={getServiceNames(link.services)}
                  onCopy={copyLinkToClipboard}
                  onEdit={() => handleOpenDialog(link.id)}
                  onDelete={() => handleDelete(link.id)}
                  onShowQrCode={showQrCode}
                  onShareWhatsapp={shareViaWhatsapp}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <BookingLinkDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} linkId={selectedLink} />

      <ConfirmDialog
        open={isConfirmDeleteOpen}
        onOpenChange={setIsConfirmDeleteOpen}
        title="Excluir link de agendamento"
        description="Tem certeza que deseja excluir este link? Esta ação é irreversível."
        confirmLabel="Excluir"
        onConfirm={confirmDelete}
      />

      {/* QR Code Dialog */}
      <Dialog open={qrCodeDialogOpen} onOpenChange={setQrCodeDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>QR Code de Agendamento</DialogTitle>
            <DialogDescription>
              Escaneie o código abaixo para acessar o link de agendamento.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center p-6 bg-white rounded-lg">
            <div className="p-3 bg-white border rounded-lg">
              <ReactQRCode value={currentQrCodeLink} size={200} />
            </div>
            <p className="mt-4 text-sm text-center text-muted-foreground break-all">
              {currentQrCodeLink}
            </p>
          </div>
          <DialogFooter className="flex justify-between sm:justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                navigator.clipboard.writeText(currentQrCodeLink)
                toast({
                  title: 'Link copiado!',
                  description: 'O link de agendamento foi copiado para a área de transferência.',
                })
              }}
            >
              <Copy className="mr-2 h-4 w-4" />
              Copiar Link
            </Button>
            <Button
              type="button"
              variant="default"
              onClick={() => {
                const message = `Olá! Você pode agendar um horário comigo através deste link: ${currentQrCodeLink}`
                const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`
                window.open(whatsappUrl, '_blank')
              }}
            >
              <Share className="mr-2 h-4 w-4" />
              Compartilhar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

interface LinkCardProps {
  link: {
    id: string
    name: string
    description: string | null
    slug: string
    active: boolean
    createdAt: Timestamp
    services: string[]
    views?: number
    appointments?: number
  }
  serviceNames: string[]
  onCopy: (slug: string) => void
  onEdit: () => void
  onDelete: () => void
  onShowQrCode: (slug: string) => void
  onShareWhatsapp: (slug: string) => void
}

function LinkCard({
  link,
  serviceNames,
  onCopy,
  onEdit,
  onDelete,
  onShowQrCode,
  onShareWhatsapp,
}: LinkCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{link.name}</CardTitle>
          </div>
          <Badge variant={link.active ? 'default' : 'secondary'}>
            {link.active ? 'Ativo' : 'Inativo'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-4 pt-0">
        <div className="flex justify-between items-center text-sm text-muted-foreground mb-4">
          <div>
            Criado{' '}
            {formatDistanceToNow(link.createdAt.toDate(), {
              addSuffix: true,
              locale: ptBR,
            })}
          </div>

          {/* Estatísticas */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-blue-500" title="Visualizações">
              <Eye className="h-3.5 w-3.5" />
              <span>{link.views || 0}</span>
            </div>
            <div className="flex items-center gap-1 text-green-600" title="Agendamentos">
              <Calendar className="h-3.5 w-3.5" />
              <span>{link.appointments || 0}</span>
            </div>
          </div>
        </div>

        <div className="text-sm mb-4">
          <div className="flex items-center gap-1 text-primary">
            <ExternalLink className="h-3 w-3" />
            <span className="truncate">{`/agendar/${link.slug}`}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-1 mb-4">
          {/* Exibir os nomes dos serviços se houver 1 ou 2 serviços, senão exibir contagem */}
          {link.services.length <= 2 && serviceNames.length > 0 ? (
            serviceNames.map((name, index) => (
              <Badge key={index} variant="outline">
                {name}
              </Badge>
            ))
          ) : (
            <Badge variant="outline">{link.services.length} serviço(s)</Badge>
          )}
        </div>

        {/* Primeira linha de botões */}
        <div className="flex gap-2 mb-2">
          <Button size="sm" variant="outline" className="flex-1" onClick={() => onCopy(link.slug)}>
            <Copy className="h-4 w-4 mr-1" />
            Copiar Link
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="flex-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border-emerald-200"
            onClick={() => onShareWhatsapp(link.slug)}
          >
            <Share className="h-4 w-4 mr-1" />
            WhatsApp
          </Button>
        </div>

        {/* Segunda linha de botões */}
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="flex-1"
            onClick={() => onShowQrCode(link.slug)}
          >
            <QrCode className="h-4 w-4 mr-1" />
            QR Code
          </Button>
          <Button size="sm" variant="outline" className="flex-1" onClick={onEdit}>
            <Edit className="h-4 w-4 mr-1" />
            Editar
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="flex-1 text-destructive hover:text-destructive border-destructive/30"
            onClick={onDelete}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Excluir
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
