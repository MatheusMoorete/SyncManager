"use client"

/**
 * @module Popover
 * @description Sistema de popovers flutuantes para menus contextuais e dicas
 * 
 * @features
 * - Posicionamento automático
 * - Animações suaves de entrada e saída
 * - Suporte a diferentes alinhamentos
 * - Totalmente acessível via teclado
 * - Fecha automaticamente ao clicar fora
 * - Suporte a ESC para fechar
 * 
 * @example
 * // Popover básico
 * <Popover>
 *   <PopoverTrigger>Clique aqui</PopoverTrigger>
 *   <PopoverContent>
 *     Conteúdo do popover
 *   </PopoverContent>
 * </Popover>
 * 
 * // Popover com alinhamento personalizado
 * <Popover>
 *   <PopoverTrigger asChild>
 *     <Button>Menu</Button>
 *   </PopoverTrigger>
 *   <PopoverContent align="start" sideOffset={8}>
 *     <div className="grid gap-4">
 *       <h4>Configurações</h4>
 *       <p>Gerencie suas preferências</p>
 *     </div>
 *   </PopoverContent>
 * </Popover>
 */

import * as React from "react"
import * as PopoverPrimitive from "@radix-ui/react-popover"

import { cn } from "@/lib/utils"

/**
 * @const Popover
 * @description Componente raiz do popover
 */
const Popover = PopoverPrimitive.Root

/**
 * @const PopoverTrigger
 * @description Elemento que dispara a abertura do popover quando clicado
 */
const PopoverTrigger = PopoverPrimitive.Trigger

/**
 * @component PopoverContent
 * @description Container do conteúdo do popover
 * 
 * @param {string} [className] - Classes CSS adicionais
 * @param {string} [align="center"] - Alinhamento do popover (start, center, end)
 * @param {number} [sideOffset=4] - Distância do elemento trigger em pixels
 * 
 * @features
 * - Posicionamento automático
 * - Animações de entrada/saída
 * - Borda e sombra suaves
 * - Layout responsivo
 */
const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({ className, align = "center", sideOffset = 4, ...props }, ref) => (
  <PopoverPrimitive.Portal>
    <PopoverPrimitive.Content
      ref={ref}
      align={align}
      sideOffset={sideOffset}
      className={cn(
        "z-50 w-72 rounded-md border border-charcoal/10 bg-white p-4 text-charcoal shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        className
      )}
      {...props}
    />
  </PopoverPrimitive.Portal>
))
PopoverContent.displayName = PopoverPrimitive.Content.displayName

export { Popover, PopoverTrigger, PopoverContent } 