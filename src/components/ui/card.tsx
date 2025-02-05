/**
 * @module Card
 * @description Sistema de cards para exibição de conteúdo em blocos
 * 
 * @features
 * - Layout estruturado com header, content e footer
 * - Suporte a título e descrição
 * - Bordas e sombras suaves
 * - Totalmente responsivo
 * - Customizável via className
 * - Elevação visual com hover
 * 
 * @example
 * // Card básico
 * <Card>
 *   <CardHeader>
 *     <CardTitle>Título do Card</CardTitle>
 *     <CardDescription>Descrição opcional</CardDescription>
 *   </CardHeader>
 *   <CardContent>
 *     Conteúdo principal do card
 *   </CardContent>
 *   <CardFooter>
 *     <Button>Ação</Button>
 *   </CardFooter>
 * </Card>
 * 
 * // Card customizado
 * <Card className="bg-primary text-white">
 *   <CardHeader className="border-b">
 *     <CardTitle>Card Destacado</CardTitle>
 *   </CardHeader>
 *   <CardContent>
 *     Conteúdo com estilo personalizado
 *   </CardContent>
 * </Card>
 */

import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * @component Card
 * @description Container principal do card com estilização base
 * @param {string} [className] - Classes CSS adicionais
 */
const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg border border-charcoal/10 bg-white text-text-primary shadow-sm",
      "transition-all duration-200",
      "hover:border-charcoal/20 hover:shadow-md",
      "focus-within:ring-2 focus-within:ring-soft-sage/20 focus-within:ring-offset-2",
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

/**
 * @component CardHeader
 * @description Cabeçalho do card, geralmente contendo título e descrição
 * @param {string} [className] - Classes CSS adicionais
 */
const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

/**
 * @component CardTitle
 * @description Título do card com estilo destacado
 * @param {string} [className] - Classes CSS adicionais
 */
const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold tracking-tight text-text-primary",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

/**
 * @component CardDescription
 * @description Texto descritivo do card com estilo secundário
 * @param {string} [className] - Classes CSS adicionais
 */
const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-text-secondary", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

/**
 * @component CardContent
 * @description Container para o conteúdo principal do card
 * @param {string} [className] - Classes CSS adicionais
 */
const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

/**
 * @component CardFooter
 * @description Rodapé do card, geralmente contendo ações
 * @param {string} [className] - Classes CSS adicionais
 */
const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent } 