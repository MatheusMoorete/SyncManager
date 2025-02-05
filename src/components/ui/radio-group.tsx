"use client"

/**
 * @module RadioGroup
 * @description Sistema de botões de rádio para seleção única de opções
 * 
 * @features
 * - Seleção mutuamente exclusiva de opções
 * - Totalmente acessível via teclado e leitores de tela
 * - Suporte a orientação vertical e horizontal
 * - Customizável via className
 * - Integração com formulários
 * - Estados disabled e required
 * 
 * @example
 * // RadioGroup básico
 * <RadioGroup defaultValue="option-1">
 *   <div className="flex flex-col space-y-2">
 *     <RadioGroupItem value="option-1" id="option-1">
 *       <RadioGroupLabel htmlFor="option-1">Opção 1</RadioGroupLabel>
 *     </RadioGroupItem>
 *     <RadioGroupItem value="option-2" id="option-2">
 *       <RadioGroupLabel htmlFor="option-2">Opção 2</RadioGroupLabel>
 *     </RadioGroupItem>
 *   </div>
 * </RadioGroup>
 * 
 * // RadioGroup em formulário
 * <FormField
 *   control={form.control}
 *   name="type"
 *   render={({ field }) => (
 *     <FormItem className="space-y-3">
 *       <FormLabel>Notificações</FormLabel>
 *       <FormControl>
 *         <RadioGroup
 *           onValueChange={field.onChange}
 *           defaultValue={field.value}
 *         >
 *           <div className="flex flex-col space-y-2">
 *             <RadioGroupItem value="all" id="all">
 *               <RadioGroupLabel htmlFor="all">Todas</RadioGroupLabel>
 *             </RadioGroupItem>
 *             <RadioGroupItem value="important" id="important">
 *               <RadioGroupLabel htmlFor="important">Importantes</RadioGroupLabel>
 *             </RadioGroupItem>
 *             <RadioGroupItem value="none" id="none">
 *               <RadioGroupLabel htmlFor="none">Nenhuma</RadioGroupLabel>
 *             </RadioGroupItem>
 *           </div>
 *         </RadioGroup>
 *       </FormControl>
 *       <FormMessage />
 *     </FormItem>
 *   )}
 * />
 */

import * as React from "react"
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group"
import { Circle } from "lucide-react"

import { cn } from "@/lib/utils"

/**
 * @const RadioGroup
 * @description Container principal do grupo de radio buttons
 * @param {string} [className] - Classes CSS adicionais
 * @param {string} [defaultValue] - Valor padrão selecionado
 * @param {function} [onValueChange] - Callback quando o valor muda
 */
const RadioGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(({ className, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Root
      className={cn("grid gap-2", className)}
      {...props}
      ref={ref}
    />
  )
})
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName

/**
 * @component RadioGroupItem
 * @description Item individual do radio group
 * @param {string} [className] - Classes CSS adicionais
 * @param {string} value - Valor único do item
 * @param {boolean} [disabled] - Estado desabilitado
 * @param {boolean} [required] - Se é obrigatório
 */
const RadioGroupItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>
>(({ className, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Item
      ref={ref}
      className={cn(
        "aspect-square h-4 w-4 rounded-full border border-primary text-primary shadow focus:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
        <Circle className="h-2.5 w-2.5 fill-current text-current" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  )
})
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName

/**
 * @component RadioGroupLabel
 * @description Label para um item do radio group
 * @param {string} [className] - Classes CSS adicionais
 * @param {string} htmlFor - ID do input relacionado
 */
const RadioGroupLabel = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => {
  return (
    <label
      ref={ref}
      className={cn("text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70", className)}
      {...props}
    />
  )
})
RadioGroupLabel.displayName = "RadioGroupLabel"

export { RadioGroup, RadioGroupItem, RadioGroupLabel } 