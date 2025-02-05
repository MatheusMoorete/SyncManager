"use client"

/**
 * @module Dialog
 * @description Sistema de diálogos modais acessíveis e responsivos
 * 
 * @features
 * - Diálogos modais com overlay
 * - Animações suaves de entrada e saída
 * - Totalmente acessível via teclado e leitores de tela
 * - Layout responsivo
 * - Estrutura flexível com header, content e footer
 * - Suporte a ESC para fechar
 * 
 * @example
 * // Diálogo básico
 * <Dialog>
 *   <DialogTrigger>Abrir</DialogTrigger>
 *   <DialogContent>
 *     <DialogHeader>
 *       <DialogTitle>Título</DialogTitle>
 *       <DialogDescription>Descrição do diálogo</DialogDescription>
 *     </DialogHeader>
 *     <p>Conteúdo do diálogo</p>
 *     <DialogFooter>
 *       <Button>Confirmar</Button>
 *     </DialogFooter>
 *   </DialogContent>
 * </Dialog>
 */

import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

/**
 * @component Dialog
 * @description Componente raiz do diálogo
 */
const Dialog = DialogPrimitive.Root

/**
 * @component DialogTrigger
 * @description Elemento que abre o diálogo quando clicado
 */
const DialogTrigger = DialogPrimitive.Trigger

/**
 * @component DialogPortal
 * @description Portal que renderiza o diálogo fora da hierarquia do DOM
 */
const DialogPortal = DialogPrimitive.Portal

/**
 * @component DialogClose
 * @description Elemento que fecha o diálogo quando clicado
 */
const DialogClose = DialogPrimitive.Close

/**
 * @component DialogOverlay
 * @description Overlay semi-transparente que cobre a tela quando o diálogo está aberto
 */
const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-charcoal/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
))
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

/**
 * @component DialogContent
 * @description Container principal do conteúdo do diálogo
 * @features
 * - Centralizado na tela
 * - Animações de entrada/saída
 * - Botão de fechar
 * - Layout responsivo
 */
const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-md translate-x-[-50%] translate-y-[-50%] gap-4 border border-charcoal/10 bg-white p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
        className
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-charcoal/5 focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-charcoal/5 data-[state=open]:text-charcoal">
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>
))
DialogContent.displayName = DialogPrimitive.Content.displayName

/**
 * @component DialogHeader
 * @description Cabeçalho do diálogo com título e descrição
 */
const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className
    )}
    {...props}
  />
)
DialogHeader.displayName = "DialogHeader"

/**
 * @component DialogFooter
 * @description Rodapé do diálogo, geralmente contendo ações
 */
const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
)
DialogFooter.displayName = "DialogFooter"

/**
 * @component DialogTitle
 * @description Título do diálogo
 */
const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight text-charcoal",
      className
    )}
    {...props}
  />
))
DialogTitle.displayName = DialogPrimitive.Title.displayName

/**
 * @component DialogDescription
 * @description Texto descritivo do diálogo
 */
const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-charcoal/60", className)}
    {...props}
  />
))
DialogDescription.displayName = DialogPrimitive.Description.displayName

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} 