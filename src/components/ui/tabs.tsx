"use client"

/**
 * @module Tabs
 * @description Sistema de navegação em abas para organizar conteúdo em seções
 * 
 * @features
 * - Navegação acessível entre abas
 * - Suporte a keyboard navigation
 * - Indicador visual da aba ativa
 * - Layout responsivo
 * - Animações suaves de transição
 * - Estilização customizável
 * 
 * @example
 * // Tabs básico
 * <Tabs defaultValue="account">
 *   <TabsList>
 *     <TabsTrigger value="account">Conta</TabsTrigger>
 *     <TabsTrigger value="password">Senha</TabsTrigger>
 *   </TabsList>
 *   <TabsContent value="account">
 *     <h2>Conta</h2>
 *     <p>Gerencie suas informações pessoais.</p>
 *   </TabsContent>
 *   <TabsContent value="password">
 *     <h2>Senha</h2>
 *     <p>Altere sua senha.</p>
 *   </TabsContent>
 * </Tabs>
 */

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"
import { cn } from "@/lib/utils"

/**
 * @const Tabs
 * @description Componente raiz que gerencia o estado das abas
 */
const Tabs = TabsPrimitive.Root

/**
 * @component TabsList
 * @description Container das abas/triggers
 * @param {string} [className] - Classes CSS adicionais
 */
const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "inline-flex h-10 items-center justify-center rounded-md bg-neutral-cream/30 p-1 text-charcoal/60",
      className
    )}
    {...props}
  />
))
TabsList.displayName = TabsPrimitive.List.displayName

/**
 * @component TabsTrigger
 * @description Botão que ativa uma aba específica
 * @param {string} [className] - Classes CSS adicionais
 * @param {string} value - Identificador único da aba
 */
const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white data-[state=active]:text-charcoal data-[state=active]:shadow-sm",
      className
    )}
    {...props}
  />
))
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

/**
 * @component TabsContent
 * @description Container do conteúdo de uma aba específica
 * @param {string} [className] - Classes CSS adicionais
 * @param {string} value - Identificador único da aba (deve corresponder ao value do TabsTrigger)
 */
const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-2 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2",
      className
    )}
    {...props}
  />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent } 