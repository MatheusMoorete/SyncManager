"use client"

/**
 * @module DropdownMenu
 * @description Sistema de menus suspensos com suporte a múltiplos níveis e interações
 * 
 * @features
 * - Menus e submenus aninhados
 * - Itens de checkbox e radio
 * - Atalhos de teclado
 * - Separadores e grupos
 * - Animações suaves
 * - Totalmente acessível (WCAG 2.1 AA)
 * - Otimizado para touch e gestos
 * - Suporte a reduced motion
 * 
 * @example
 * // Menu básico
 * <DropdownMenu>
 *   <DropdownMenuTrigger aria-label="Abrir menu de opções">
 *     Abrir Menu
 *   </DropdownMenuTrigger>
 *   <DropdownMenuContent>
 *     <DropdownMenuItem>Item 1</DropdownMenuItem>
 *     <DropdownMenuItem>Item 2</DropdownMenuItem>
 *   </DropdownMenuContent>
 * </DropdownMenu>
 * 
 * // Menu com submenu e grupos
 * <DropdownMenu>
 *   <DropdownMenuTrigger>Opções</DropdownMenuTrigger>
 *   <DropdownMenuContent>
 *     <DropdownMenuGroup>
 *       <DropdownMenuLabel>Conta</DropdownMenuLabel>
 *       <DropdownMenuItem>Perfil</DropdownMenuItem>
 *       <DropdownMenuSeparator />
 *       <DropdownMenuSub>
 *         <DropdownMenuSubTrigger>Mais opções</DropdownMenuSubTrigger>
 *         <DropdownMenuSubContent>
 *           <DropdownMenuItem>Configurações</DropdownMenuItem>
 *         </DropdownMenuSubContent>
 *       </DropdownMenuSub>
 *     </DropdownMenuGroup>
 *   </DropdownMenuContent>
 * </DropdownMenu>
 */

import * as React from "react"
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu"
import { Check, ChevronRight, Circle } from "lucide-react"
import { cn } from "@/lib/utils"

// Constantes para animações
const ANIMATION_DURATION = "0.2s"
const REDUCED_MOTION_DURATION = "0s"

/**
 * Hook para detectar preferência de redução de movimento
 */
const useReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(false)

  React.useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
    setPrefersReducedMotion(mediaQuery.matches)

    const onChange = () => setPrefersReducedMotion(mediaQuery.matches)
    mediaQuery.addEventListener("change", onChange)
    return () => mediaQuery.removeEventListener("change", onChange)
  }, [])

  return prefersReducedMotion
}

/**
 * @const DropdownMenu
 * @description Componente raiz do menu suspenso
 */
const DropdownMenu = DropdownMenuPrimitive.Root

/**
 * @const DropdownMenuTrigger
 * @description Elemento que dispara a abertura do menu
 */
const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger

/**
 * @const DropdownMenuGroup
 * @description Agrupa itens relacionados do menu
 */
const DropdownMenuGroup = DropdownMenuPrimitive.Group

/**
 * @const DropdownMenuPortal
 * @description Portal para renderizar o menu fora da hierarquia do DOM
 */
const DropdownMenuPortal = DropdownMenuPrimitive.Portal

/**
 * @const DropdownMenuSub
 * @description Container para submenus
 */
const DropdownMenuSub = DropdownMenuPrimitive.Sub

/**
 * @const DropdownMenuRadioGroup
 * @description Grupo de itens de rádio mutuamente exclusivos
 */
const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup

/**
 * @component DropdownMenuSubTrigger
 * @description Trigger para abrir um submenu
 */
const DropdownMenuSubTrigger = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.SubTrigger>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubTrigger> & {
    inset?: boolean
  }
>(({ className, inset, children, ...props }, ref) => (
  <DropdownMenuPrimitive.SubTrigger
    ref={ref}
    className={cn(
      // Base
      "flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none",
      // Cores e Estados
      "text-text-primary",
      "focus:bg-hover-medium",
      "data-[state=open]:bg-hover-medium",
      // Inset
      inset && "pl-8",
      className
    )}
    {...props}
  >
    {children}
    <ChevronRight className="ml-auto h-4 w-4" />
  </DropdownMenuPrimitive.SubTrigger>
))
DropdownMenuSubTrigger.displayName = DropdownMenuPrimitive.SubTrigger.displayName

/**
 * @component DropdownMenuSubContent
 * @description Conteúdo do submenu
 */
const DropdownMenuSubContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.SubContent>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubContent>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.SubContent
    ref={ref}
    className={cn(
      // Base
      "z-50 min-w-[8rem] overflow-hidden rounded-md p-1",
      // Cores e Sombras
      "bg-white",
      "border border-charcoal/10",
      "shadow-lg shadow-charcoal/5",
      // Texto
      "text-text-primary",
      // Animações
      "data-[state=open]:animate-in data-[state=closed]:animate-out",
      "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
      "data-[side=bottom]:slide-in-from-top-2",
      "data-[side=left]:slide-in-from-right-2",
      "data-[side=right]:slide-in-from-left-2",
      "data-[side=top]:slide-in-from-bottom-2",
      className
    )}
    {...props}
  />
))
DropdownMenuSubContent.displayName = DropdownMenuPrimitive.SubContent.displayName

/**
 * @component DropdownMenuContent
 * @description Container principal do conteúdo do menu
 */
const DropdownMenuContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => {
  const prefersReducedMotion = useReducedMotion()
  
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        ref={ref}
        sideOffset={sideOffset}
        className={cn(
          // Base
          "z-50 min-w-[8rem] overflow-hidden rounded-md p-1",
          // Cores e Sombras
          "bg-white",
          "border border-charcoal/10",
          "shadow-lg shadow-charcoal/5",
          // Texto
          "text-text-primary",
          // Animações (condicionais baseadas em reduced motion)
          !prefersReducedMotion && [
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
            "data-[side=bottom]:slide-in-from-top-2",
            "data-[side=left]:slide-in-from-right-2",
            "data-[side=right]:slide-in-from-left-2",
            "data-[side=top]:slide-in-from-bottom-2",
          ],
          // Touch e Gestos
          "touch-manipulation",
          "active:scale-[0.98]",
          className
        )}
        // Acessibilidade
        aria-orientation="vertical"
        role="menu"
        style={{
          '--animation-duration': prefersReducedMotion ? REDUCED_MOTION_DURATION : ANIMATION_DURATION
        } as React.CSSProperties}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  )
})
DropdownMenuContent.displayName = DropdownMenuPrimitive.Content.displayName

/**
 * @component DropdownMenuItem
 * @description Item clicável do menu
 */
const DropdownMenuItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item> & {
    inset?: boolean
  }
>(({ className, inset, ...props }, ref) => (
  <DropdownMenuPrimitive.Item
    ref={ref}
    className={cn(
      // Base
      "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none",
      // Cores e Estados
      "text-text-primary",
      "focus:bg-hover-medium",
      "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      // Touch e Gestos
      "touch-manipulation",
      "active:scale-[0.98]",
      // Inset
      inset && "pl-8",
      className
    )}
    // Acessibilidade
    role="menuitem"
    {...props}
  />
))
DropdownMenuItem.displayName = DropdownMenuPrimitive.Item.displayName

/**
 * @component DropdownMenuCheckboxItem
 * @description Item de menu com estado de checkbox
 */
const DropdownMenuCheckboxItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.CheckboxItem>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.CheckboxItem>
>(({ className, children, checked, ...props }, ref) => (
  <DropdownMenuPrimitive.CheckboxItem
    ref={ref}
    className={cn(
      // Base
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none",
      // Cores e Estados
      "text-text-primary",
      "focus:bg-hover-medium",
      "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    checked={checked}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <DropdownMenuPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </DropdownMenuPrimitive.CheckboxItem>
))
DropdownMenuCheckboxItem.displayName = DropdownMenuPrimitive.CheckboxItem.displayName

/**
 * @component DropdownMenuRadioItem
 * @description Item de menu com estado de radio
 */
const DropdownMenuRadioItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.RadioItem>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.RadioItem>
>(({ className, children, ...props }, ref) => (
  <DropdownMenuPrimitive.RadioItem
    ref={ref}
    className={cn(
      // Base
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none",
      // Cores e Estados
      "text-text-primary",
      "focus:bg-hover-medium",
      "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <DropdownMenuPrimitive.ItemIndicator>
        <Circle className="h-2 w-2 fill-current" />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </DropdownMenuPrimitive.RadioItem>
))
DropdownMenuRadioItem.displayName = DropdownMenuPrimitive.RadioItem.displayName

/**
 * @component DropdownMenuLabel
 * @description Rótulo não clicável para agrupar itens
 */
const DropdownMenuLabel = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Label> & {
    inset?: boolean
  }
>(({ className, inset, ...props }, ref) => (
  <DropdownMenuPrimitive.Label
    ref={ref}
    className={cn(
      "px-2 py-1.5 text-sm font-semibold text-text-primary",
      inset && "pl-8",
      className
    )}
    {...props}
  />
))
DropdownMenuLabel.displayName = DropdownMenuPrimitive.Label.displayName

/**
 * @component DropdownMenuSeparator
 * @description Linha separadora entre itens do menu
 */
const DropdownMenuSeparator = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-charcoal/10", className)}
    {...props}
  />
))
DropdownMenuSeparator.displayName = DropdownMenuPrimitive.Separator.displayName

/**
 * @component DropdownMenuShortcut
 * @description Texto para exibir atalhos de teclado
 */
const DropdownMenuShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      className={cn(
        "ml-auto text-xs tracking-widest text-text-secondary",
        className
      )}
      {...props}
    />
  )
}
DropdownMenuShortcut.displayName = "DropdownMenuShortcut"

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
} 