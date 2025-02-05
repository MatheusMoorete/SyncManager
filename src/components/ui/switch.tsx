/**
 * @module Switch
 * @description Sistema de switch toggle para alternar estados booleanos
 * 
 * @features
 * - Design moderno com animação suave
 * - Totalmente acessível via teclado e leitores de tela
 * - Estados checked e unchecked com transição
 * - Customizável via className
 * - Integração com formulários
 * - Suporte a estados disabled
 * - Feedback visual de foco
 * 
 * @example
 * // Switch básico
 * <Switch />
 * 
 * // Switch com label
 * <div className="flex items-center space-x-2">
 *   <Switch id="airplane-mode" />
 *   <Label htmlFor="airplane-mode">Modo avião</Label>
 * </div>
 * 
 * // Switch em formulário
 * <FormField
 *   control={form.control}
 *   name="notifications"
 *   render={({ field }) => (
 *     <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
 *       <div className="space-y-0.5">
 *         <FormLabel>Notificações</FormLabel>
 *         <FormDescription>
 *           Receber notificações por email
 *         </FormDescription>
 *       </div>
 *       <FormControl>
 *         <Switch
 *           checked={field.value}
 *           onCheckedChange={field.onChange}
 *         />
 *       </FormControl>
 *     </FormItem>
 *   )}
 * />
 */

"use client"

import * as React from "react"
import * as SwitchPrimitives from "@radix-ui/react-switch"
import { cn } from "@/lib/utils"

/**
 * @component Switch
 * @description Componente de switch toggle com animação e acessibilidade
 * @param {string} [className] - Classes CSS adicionais
 * @param {boolean} [checked] - Estado do switch
 * @param {function} [onCheckedChange] - Callback quando o estado muda
 * @param {boolean} [disabled] - Estado desabilitado do switch
 * @returns {JSX.Element} Switch estilizado e acessível
 */
const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      "peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-soft-sage/20 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-soft-sage data-[state=unchecked]:bg-charcoal/20",
      className
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        "pointer-events-none block h-4 w-4 rounded-full bg-white shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0"
      )}
    />
  </SwitchPrimitives.Root>
))
Switch.displayName = SwitchPrimitives.Root.displayName

export { Switch } 