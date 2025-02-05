"use client"

/**
 * @module ScrollArea
 * @description Sistema de área com rolagem customizada e responsiva
 * 
 * @features
 * - Rolagem suave e customizada
 * - Barras de rolagem estilizadas
 * - Suporte a rolagem vertical e horizontal
 * - Preserva a largura/altura do conteúdo
 * - Totalmente acessível via teclado
 * - Suporte a touch em dispositivos móveis
 * 
 * @example
 * // ScrollArea básica
 * <ScrollArea className="h-[200px] w-[350px]">
 *   <div className="p-4">
 *     <h4>Título</h4>
 *     <p>Conteúdo longo que precisa de rolagem...</p>
 *   </div>
 * </ScrollArea>
 * 
 * // ScrollArea com altura máxima
 * <ScrollArea className="h-[400px] w-full">
 *   <div className="space-y-4">
 *     {items.map((item) => (
 *       <div key={item.id} className="p-4 border rounded">
 *         {item.content}
 *       </div>
 *     ))}
 *   </div>
 * </ScrollArea>
 */

import * as React from "react"
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area"

import { cn } from "@/lib/utils"

/**
 * @component ScrollArea
 * @description Container principal com suporte a rolagem customizada
 * @param {string} [className] - Classes CSS adicionais
 * @param {React.ReactNode} children - Conteúdo que terá rolagem
 */
const ScrollArea = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root>
>(({ className, children, ...props }, ref) => (
  <ScrollAreaPrimitive.Root
    ref={ref}
    className={cn("relative overflow-hidden", className)}
    {...props}
  >
    <ScrollAreaPrimitive.Viewport className="h-full w-full rounded-[inherit]">
      {children}
    </ScrollAreaPrimitive.Viewport>
    <ScrollBar />
    <ScrollAreaPrimitive.Corner />
  </ScrollAreaPrimitive.Root>
))
ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName

/**
 * @component ScrollBar
 * @description Barra de rolagem estilizada
 * @param {string} [className] - Classes CSS adicionais
 * @param {string} [orientation="vertical"] - Orientação da barra ("vertical" | "horizontal")
 */
const ScrollBar = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>
>(({ className, orientation = "vertical", ...props }, ref) => (
  <ScrollAreaPrimitive.ScrollAreaScrollbar
    ref={ref}
    orientation={orientation}
    className={cn(
      "flex touch-none select-none transition-colors",
      orientation === "vertical" &&
        "h-full w-2.5 border-l border-l-transparent p-[1px]",
      orientation === "horizontal" &&
        "h-2.5 flex-col border-t border-t-transparent p-[1px]",
      className
    )}
    {...props}
  >
    <ScrollAreaPrimitive.ScrollAreaThumb className="relative flex-1 rounded-full bg-border" />
  </ScrollAreaPrimitive.ScrollAreaScrollbar>
))
ScrollBar.displayName = ScrollAreaPrimitive.ScrollAreaScrollbar.displayName

export { ScrollArea, ScrollBar } 