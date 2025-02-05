/**
 * @module Checkbox
 * @description Sistema de checkbox acessível e customizável para seleção binária
 * 
 * @features
 * - Design minimalista e moderno
 * - Totalmente acessível via teclado e leitores de tela
 * - Suporte a estados checked, unchecked e indeterminate
 * - Animação suave de transição
 * - Customizável via className
 * - Integração com formulários
 * - Suporte a estados disabled
 * 
 * @example
 * // Checkbox básico
 * <Checkbox />
 * 
 * // Checkbox com label
 * <div className="flex items-center space-x-2">
 *   <Checkbox id="terms" />
 *   <label htmlFor="terms">Aceito os termos</label>
 * </div>
 * 
 * // Checkbox em formulário
 * <FormField
 *   control={form.control}
 *   name="marketing"
 *   render={({ field }) => (
 *     <FormItem className="flex items-center space-x-2">
 *       <FormControl>
 *         <Checkbox
 *           checked={field.value}
 *           onCheckedChange={field.onChange}
 *         />
 *       </FormControl>
 *       <FormLabel>Receber newsletter</FormLabel>
 *     </FormItem>
 *   )}
 * />
 */

"use client"

import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { Check } from "lucide-react"

import { cn } from "@/lib/utils"

/**
 * @component Checkbox
 * @description Componente de checkbox com suporte a estados e acessibilidade
 * @param {string} [className] - Classes CSS adicionais
 * @param {boolean} [checked] - Estado de seleção do checkbox
 * @param {function} [onCheckedChange] - Callback chamado quando o estado muda
 * @param {boolean} [disabled] - Estado desabilitado do checkbox
 * @returns {JSX.Element} Checkbox estilizado e acessível
 */
const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      "peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
      className
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      className={cn("flex items-center justify-center text-current")}
    >
      <Check className="h-4 w-4" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
))
Checkbox.displayName = CheckboxPrimitive.Root.displayName

export { Checkbox } 