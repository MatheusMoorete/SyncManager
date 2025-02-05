'use client'

/**
 * @component Button
 * @description Componente de botão reutilizável com múltiplas variantes e tamanhos
 * 
 * @features
 * - Múltiplas variantes de estilo (default, destructive, outline, secondary, ghost, link)
 * - Diferentes tamanhos (default, sm, lg, icon)
 * - Suporte a slots do Radix UI
 * - Totalmente acessível e customizável
 * - Suporte a estados (hover, focus, disabled)
 * 
 * @example
 * // Botão padrão
 * <Button>Click me</Button>
 * 
 * // Botão com variante e tamanho
 * <Button variant="destructive" size="lg">Delete</Button>
 * 
 * // Botão como link
 * <Button variant="link" asChild>
 *   <a href="/dashboard">Dashboard</a>
 * </Button>
 */

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

/**
 * @const buttonVariants
 * @description Definição das variantes e estilos do botão usando class-variance-authority
 * 
 * @variants
 * - default: Estilo principal do botão
 * - destructive: Para ações destrutivas/perigosas
 * - outline: Botão com borda e fundo transparente
 * - secondary: Estilo secundário
 * - ghost: Botão sem background até hover
 * - link: Aparência de link com underline no hover
 * 
 * @sizes
 * - default: Tamanho padrão (h-9)
 * - sm: Tamanho pequeno (h-8)
 * - lg: Tamanho grande (h-10)
 * - icon: Quadrado para ícones (h-9 w-9)
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

/**
 * @interface ButtonProps
 * @description Props do componente Button
 * @extends {React.ButtonHTMLAttributes<HTMLButtonElement>} - Herda todas as props nativas do button
 * @extends {VariantProps<typeof buttonVariants>} - Props das variantes definidas
 * 
 * @property {boolean} [asChild] - Se true, renderiza o children como elemento raiz
 * @property {string} [variant] - Variante visual do botão
 * @property {string} [size] - Tamanho do botão
 * @property {string} [className] - Classes CSS adicionais
 */
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

/**
 * @function Button
 * @description Componente base de botão com suporte a múltiplas variantes
 * @param {ButtonProps} props - Props do componente
 * @returns {JSX.Element} Botão estilizado com as props fornecidas
 */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants } 