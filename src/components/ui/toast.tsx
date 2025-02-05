/**
 * @module Toast
 * @description Sistema de notificações toast com suporte a diferentes variantes e ações
 * 
 * @features
 * - Notificações responsivas e acessíveis
 * - Animações suaves de entrada e saída
 * - Suporte a gestos de swipe em dispositivos móveis
 * - Variantes para diferentes tipos de mensagem
 * - Ações personalizáveis
 * - Auto-dismiss configurável
 * 
 * @example
 * // Toast básico
 * toast("Operação realizada com sucesso")
 * 
 * // Toast com variante e ação
 * toast.error("Erro ao salvar", {
 *   action: {
 *     label: "Tentar novamente",
 *     onClick: () => retry()
 *   }
 * })
 */

import * as React from "react"
import * as ToastPrimitives from "@radix-ui/react-toast"
import { cva, type VariantProps } from "class-variance-authority"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

/**
 * @const ToastProvider
 * @description Provider principal do sistema de toasts
 */
const ToastProvider = ToastPrimitives.Provider

/**
 * @component ToastViewport
 * @description Container que define o posicionamento e layout dos toasts
 */
const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn(
      "fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]",
      className
    )}
    {...props}
  />
))
ToastViewport.displayName = ToastPrimitives.Viewport.displayName

/**
 * @const toastVariants
 * @description Definição das variantes visuais do toast
 * 
 * @variants
 * - default: Estilo padrão com fundo branco
 * - destructive: Estilo para mensagens de erro/destrutivas
 */
const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border border-charcoal/10 p-6 pr-8 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full",
  {
    variants: {
      variant: {
        default: "border bg-white text-charcoal",
        destructive:
          "destructive group border-terracotta bg-terracotta text-white",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

/**
 * @component Toast
 * @description Componente base do toast que renderiza a notificação
 */
const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> &
    VariantProps<typeof toastVariants>
>(({ className, variant, ...props }, ref) => {
  return (
    <ToastPrimitives.Root
      ref={ref}
      className={cn(toastVariants({ variant }), className)}
      {...props}
    />
  )
})
Toast.displayName = ToastPrimitives.Root.displayName

/**
 * @component ToastAction
 * @description Botão de ação dentro do toast
 */
const ToastAction = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Action>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Action
    ref={ref}
    className={cn(
      "inline-flex h-8 shrink-0 items-center justify-center rounded-md border border-charcoal/10 bg-transparent px-3 text-sm font-medium ring-offset-white transition-colors hover:bg-neutral-cream/50 focus:outline-none focus:ring-2 focus:ring-charcoal/5 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 group-[.destructive]:border-terracotta/40 group-[.destructive]:hover:border-terracotta/30 group-[.destructive]:hover:bg-terracotta group-[.destructive]:hover:text-white group-[.destructive]:focus:ring-terracotta",
      className
    )}
    {...props}
  />
))
ToastAction.displayName = ToastPrimitives.Action.displayName

/**
 * @component ToastClose
 * @description Botão de fechar o toast
 */
const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    className={cn(
      "absolute right-2 top-2 rounded-md p-1 text-charcoal/50 opacity-0 transition-opacity hover:text-charcoal focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100 group-[.destructive]:text-red-300 group-[.destructive]:hover:text-red-50 group-[.destructive]:focus:ring-red-400 group-[.destructive]:focus:ring-offset-red-600",
      className
    )}
    toast-close=""
    {...props}
  >
    <X className="h-4 w-4" />
  </ToastPrimitives.Close>
))
ToastClose.displayName = ToastPrimitives.Close.displayName

/**
 * @component ToastTitle
 * @description Título do toast
 */
const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Title
    ref={ref}
    className={cn("text-sm font-semibold", className)}
    {...props}
  />
))
ToastTitle.displayName = ToastPrimitives.Title.displayName

/**
 * @component ToastDescription
 * @description Descrição/mensagem principal do toast
 */
const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Description
    ref={ref}
    className={cn("text-sm opacity-90", className)}
    {...props}
  />
))
ToastDescription.displayName = ToastPrimitives.Description.displayName

/**
 * @type ToastProps
 * @description Props do componente Toast
 */
type ToastProps = React.ComponentPropsWithoutRef<typeof Toast>

/**
 * @type ToastActionElement
 * @description Tipo para elementos de ação do toast
 */
type ToastActionElement = React.ReactElement<typeof ToastAction>

export {
  type ToastProps,
  type ToastActionElement,
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
} 