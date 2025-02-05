"use client"

/**
 * @module Separator
 * @description Componente de linha divisória para separar conteúdos visualmente
 * 
 * @features
 * - Suporte a orientação vertical e horizontal
 * - Estilização customizável
 * - Acessibilidade com suporte a role="separator"
 * - Opção decorativa para fins puramente visuais
 * - Integração com layout flexbox e grid
 * 
 * @example
 * // Separador horizontal
 * <Separator />
 * 
 * // Separador vertical
 * <Separator orientation="vertical" className="h-6" />
 * 
 * // Separador decorativo customizado
 * <Separator 
 *   className="my-4 bg-gradient-to-r from-transparent via-charcoal/20 to-transparent" 
 *   decorative 
 * />
 */

import * as React from "react"
import * as SeparatorPrimitive from "@radix-ui/react-separator"

import { cn } from "@/lib/utils"

/**
 * @component Separator
 * @description Linha divisória acessível para separar conteúdos
 * @param {string} [className] - Classes CSS adicionais
 * @param {string} [orientation="horizontal"] - Orientação da linha ("horizontal" | "vertical")
 * @param {boolean} [decorative=true] - Se é puramente decorativo ou tem significado semântico
 */
const Separator = React.forwardRef<
  React.ElementRef<typeof SeparatorPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>
>(
  (
    { className, orientation = "horizontal", decorative = true, ...props },
    ref
  ) => (
    <SeparatorPrimitive.Root
      ref={ref}
      decorative={decorative}
      orientation={orientation}
      className={cn(
        "shrink-0 bg-border",
        orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]",
        className
      )}
      {...props}
    />
  )
)
Separator.displayName = SeparatorPrimitive.Root.displayName

export { Separator } 