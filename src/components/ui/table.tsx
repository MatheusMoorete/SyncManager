'use client'

/**
 * @module Table
 * @description Sistema de tabelas para exibição de dados estruturados
 * 
 * @features
 * - Layout responsivo com scroll horizontal
 * - Cabeçalho fixo
 * - Linhas com hover e seleção
 * - Suporte a caption e footer
 * - Células com alinhamento customizável
 * - Suporte a checkbox nas células
 * - Otimizado para leitura de dados
 * 
 * @example
 * // Tabela básica
 * <Table>
 *   <TableCaption>Lista de usuários</TableCaption>
 *   <TableHeader>
 *     <TableRow>
 *       <TableHead>Nome</TableHead>
 *       <TableHead>Email</TableHead>
 *     </TableRow>
 *   </TableHeader>
 *   <TableBody>
 *     <TableRow>
 *       <TableCell>João Silva</TableCell>
 *       <TableCell>joao@email.com</TableCell>
 *     </TableRow>
 *   </TableBody>
 * </Table>
 * 
 * // Tabela com seleção e footer
 * <Table>
 *   <TableHeader>
 *     <TableRow>
 *       <TableHead><Checkbox /></TableHead>
 *       <TableHead>Item</TableHead>
 *       <TableHead>Valor</TableHead>
 *     </TableRow>
 *   </TableHeader>
 *   <TableBody>
 *     <TableRow data-state="selected">
 *       <TableCell><Checkbox checked /></TableCell>
 *       <TableCell>Item 1</TableCell>
 *       <TableCell>R$ 100,00</TableCell>
 *     </TableRow>
 *   </TableBody>
 *   <TableFooter>
 *     <TableRow>
 *       <TableCell colSpan={2}>Total</TableCell>
 *       <TableCell>R$ 100,00</TableCell>
 *     </TableRow>
 *   </TableFooter>
 * </Table>
 */

import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * @component Table
 * @description Container principal da tabela com suporte a scroll horizontal
 * @param {string} [className] - Classes CSS adicionais
 */
const Table = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => (
  <div className="relative w-full overflow-auto">
    <table
      ref={ref}
      className={cn(
        "w-full caption-bottom text-sm",
        "border-separate border-spacing-0",
        className
      )}
      {...props}
    />
  </div>
))
Table.displayName = "Table"

/**
 * @component TableHeader
 * @description Seção de cabeçalho da tabela
 * @param {string} [className] - Classes CSS adicionais
 */
const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead
    ref={ref}
    className={cn(
      "[&_tr]:border-b",
      "border-charcoal/10 bg-neutral-cream/30",
      className
    )}
    {...props}
  />
))
TableHeader.displayName = "TableHeader"

/**
 * @component TableBody
 * @description Seção principal de conteúdo da tabela
 * @param {string} [className] - Classes CSS adicionais
 */
const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn("[&_tr:last-child]:border-0", className)}
    {...props}
  />
))
TableBody.displayName = "TableBody"

/**
 * @component TableFooter
 * @description Rodapé da tabela, geralmente para totalizadores
 * @param {string} [className] - Classes CSS adicionais
 */
const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn(
      "border-t border-charcoal/10",
      "bg-neutral-cream/50 font-medium",
      "[&>tr]:last:border-b-0",
      className
    )}
    {...props}
  />
))
TableFooter.displayName = "TableFooter"

/**
 * @component TableRow
 * @description Linha da tabela com suporte a hover e seleção
 * @param {string} [className] - Classes CSS adicionais
 */
const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      "border-b border-charcoal/10",
      "transition-colors",
      "hover:bg-hover-light",
      "data-[state=selected]:bg-neutral-cream/50",
      className
    )}
    {...props}
  />
))
TableRow.displayName = "TableRow"

/**
 * @component TableHead
 * @description Célula de cabeçalho com estilo diferenciado
 * @param {string} [className] - Classes CSS adicionais
 */
const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      "h-12 px-4 text-left align-middle font-medium",
      "text-text-secondary",
      "[&:has([role=checkbox])]:pr-0",
      "transition-colors",
      className
    )}
    {...props}
  />
))
TableHead.displayName = "TableHead"

/**
 * @component TableCell
 * @description Célula padrão da tabela
 * @param {string} [className] - Classes CSS adicionais
 */
const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn(
      "p-4 align-middle",
      "text-text-primary",
      "[&:has([role=checkbox])]:pr-0",
      className
    )}
    {...props}
  />
))
TableCell.displayName = "TableCell"

/**
 * @component TableCaption
 * @description Legenda da tabela
 * @param {string} [className] - Classes CSS adicionais
 */
const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn("mt-4 text-sm text-text-secondary", className)}
    {...props}
  />
))
TableCaption.displayName = "TableCaption"

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
} 