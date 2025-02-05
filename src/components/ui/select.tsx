"use client"

/**
 * @module Select
 * @description Sistema de seleção com suporte a múltiplas opções e grupos
 * 
 * @features
 * - Suporte a opções únicas e grupos
 * - Pesquisa e filtragem de opções
 * - Navegação por teclado
 * - Totalmente acessível
 * - Suporte a estados disabled
 * - Customização via className
 * - Otimizado para touch
 * 
 * @example
 * // Select básico
 * <Select>
 *   <SelectTrigger>
 *     <SelectValue placeholder="Selecione uma opção" />
 *   </SelectTrigger>
 *   <SelectContent>
 *     <SelectItem value="1">Opção 1</SelectItem>
 *     <SelectItem value="2">Opção 2</SelectItem>
 *   </SelectContent>
 * </Select>
 * 
 * // Select com grupos
 * <Select>
 *   <SelectTrigger>
 *     <SelectValue placeholder="Selecione uma categoria" />
 *   </SelectTrigger>
 *   <SelectContent>
 *     <SelectGroup>
 *       <SelectLabel>Frutas</SelectLabel>
 *       <SelectItem value="apple">Maçã</SelectItem>
 *       <SelectItem value="banana">Banana</SelectItem>
 *     </SelectGroup>
 *     <SelectGroup>
 *       <SelectLabel>Vegetais</SelectLabel>
 *       <SelectItem value="carrot">Cenoura</SelectItem>
 *       <SelectItem value="potato">Batata</SelectItem>
 *     </SelectGroup>
 *   </SelectContent>
 * </Select>
 */

import * as React from "react"
import * as SelectPrimitive from "@radix-ui/react-select"
import { Check, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

const Select = SelectPrimitive.Root
const SelectGroup = SelectPrimitive.Group
const SelectValue = SelectPrimitive.Value

/**
 * @component SelectTrigger
 * @description Botão que abre o menu de seleção
 */
const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      // Base
      "flex h-10 w-full items-center justify-between rounded-md px-3 py-2 text-sm ring-offset-white",
      // Cores e Bordas
      "border border-charcoal/10",
      "bg-white",
      // Estados
      "placeholder:text-text-muted",
      "focus:outline-none focus:ring-2 focus:ring-charcoal/20 focus:ring-offset-2",
      "disabled:cursor-not-allowed disabled:opacity-50",
      // Touch
      "touch-manipulation",
      className
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown className="h-4 w-4 opacity-50" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
))
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName

/**
 * @component SelectContent
 * @description Container do conteúdo do select
 */
const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = "popper", ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={cn(
        // Base
        "relative z-50 min-w-[8rem] overflow-hidden rounded-md text-text-primary",
        // Cores e Sombras
        "border border-charcoal/10",
        "bg-white",
        "shadow-md",
        // Animações
        "data-[state=open]:animate-in data-[state=closed]:animate-out",
        "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
        "data-[side=bottom]:slide-in-from-top-2",
        "data-[side=left]:slide-in-from-right-2",
        "data-[side=right]:slide-in-from-left-2",
        "data-[side=top]:slide-in-from-bottom-2",
        // Posicionamento
        position === "popper" &&
          "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
        className
      )}
      position={position}
      {...props}
    >
      <SelectPrimitive.Viewport
        className={cn(
          "p-1",
          position === "popper" &&
            "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"
        )}
      >
        {children}
      </SelectPrimitive.Viewport>
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
))
SelectContent.displayName = SelectPrimitive.Content.displayName

/**
 * @component SelectLabel
 * @description Rótulo para grupo de opções
 */
const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn("py-1.5 pl-8 pr-2 text-sm font-semibold", className)}
    {...props}
  />
))
SelectLabel.displayName = SelectPrimitive.Label.displayName

/**
 * @component SelectItem
 * @description Item selecionável do select
 */
const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      // Base
      "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none",
      // Estados
      "focus:bg-hover-medium",
      "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      // Touch
      "touch-manipulation",
      className
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </SelectPrimitive.ItemIndicator>
    </span>

    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
))
SelectItem.displayName = SelectPrimitive.Item.displayName

/**
 * @component SelectSeparator
 * @description Linha separadora entre itens ou grupos
 */
const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-charcoal/10", className)}
    {...props}
  />
))
SelectSeparator.displayName = SelectPrimitive.Separator.displayName

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
} 