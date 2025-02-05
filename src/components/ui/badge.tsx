/**
 * @module Badge
 * @description Sistema de badges para rótulos, status e tags
 * 
 * @features
 * - Múltiplas variantes de estilo
 * - Design compacto e arredondado
 * - Suporte a ícones
 * - Totalmente acessível
 * - Customizável via className
 * 
 * @example
 * // Badge padrão
 * <Badge>Novo</Badge>
 * 
 * // Badge com variantes
 * <Badge variant="secondary">Em progresso</Badge>
 * <Badge variant="destructive">Erro</Badge>
 * <Badge variant="outline">Draft</Badge>
 * 
 * // Badge com ícone
 * <Badge>
 *   <StarIcon className="mr-1 h-3 w-3" />
 *   Destaque
 * </Badge>
 */

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * @const badgeVariants
 * @description Definição das variantes visuais do badge
 * 
 * @variants
 * - default: Estilo principal com fundo escuro
 * - secondary: Estilo secundário com fundo claro
 * - destructive: Para status negativos ou alertas
 * - outline: Apenas contorno sem preenchimento
 */
const badgeVariants = cva(
  "inline-flex items-center rounded-full border border-charcoal/10 px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-charcoal/20 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-charcoal text-white hover:bg-charcoal/80",
        secondary:
          "border-transparent bg-neutral-cream text-charcoal hover:bg-neutral-cream/80",
        destructive:
          "border-transparent bg-terracotta text-white hover:bg-terracotta/80",
        outline: "text-charcoal",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

/**
 * @interface BadgeProps
 * @description Props do componente Badge
 * @extends {React.HTMLAttributes<HTMLDivElement>} - Props nativas de div
 * @extends {VariantProps<typeof badgeVariants>} - Props das variantes
 */
export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

/**
 * @component Badge
 * @description Componente para exibição de rótulos e status
 * @param {string} [className] - Classes CSS adicionais
 * @param {string} [variant] - Variante visual do badge
 * @returns {JSX.Element} Badge estilizado
 */
function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants } 