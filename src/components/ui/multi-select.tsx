'use client'

import * as React from 'react'
import { Check, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Command, CommandGroup, CommandItem } from '@/components/ui/command'
import { Command as CommandPrimitive } from 'cmdk'

interface MultiSelectProps {
  options: { value: string; label: string }[]
  value: string[]
  onChange: (values: string[]) => void
  placeholder?: string
  allowSelectAll?: boolean
}

export function MultiSelect({
  options,
  value,
  onChange,
  placeholder = 'Selecionar item...',
  allowSelectAll = false,
}: MultiSelectProps) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [open, setOpen] = React.useState(false)
  const [inputValue, setInputValue] = React.useState('')

  // Filtra as opções com base no valor de entrada
  const filteredOptions = React.useMemo(() => {
    if (!inputValue) return options
    const lowerInput = inputValue.toLowerCase()
    return options.filter(option => 
      option.label.toLowerCase().includes(lowerInput)
    )
  }, [options, inputValue])

  // Obtém opções selecionáveis (não selecionadas ainda)
  const selectableOptions = React.useMemo(() => {
    return filteredOptions.filter(option => 
      !value.includes(option.value)
    )
  }, [filteredOptions, value])

  // Função para remover um item da seleção
  const handleUnselect = React.useCallback((itemValue: string) => {
    onChange(value.filter(v => v !== itemValue))
  }, [onChange, value])

  // Função para adicionar um item à seleção
  const handleSelect = React.useCallback((selectedValue: string) => {
    if (!value.includes(selectedValue)) {
      onChange([...value, selectedValue])
      setInputValue('')
    }
  }, [onChange, value])

  // Função para selecionar todos os itens
  const handleSelectAll = React.useCallback(() => {
    const allValues = options.map(option => option.value)
    onChange(allValues)
    setInputValue('')
  }, [onChange, options])

  // Gerencia eventos de teclado
  const handleKeyDown = React.useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      setOpen(false)
      return
    }

    if (inputRef.current && (e.key === 'Backspace' || e.key === 'Delete')) {
      if (inputValue === '' && value.length > 0) {
        // Remove o último item quando pressiona backspace com input vazio
        const newValue = [...value]
        newValue.pop()
        onChange(newValue)
      }
    }
  }, [inputValue, onChange, value])

  // Para debug
  React.useEffect(() => {
    console.log('MultiSelect Render', { 
      options: options.length, 
      value: value.length,
      selectableOptions: selectableOptions.length 
    })
  }, [options.length, selectableOptions.length, value.length])

  return (
    <div className="relative w-full">
      <div 
        className="flex flex-wrap gap-1 p-2 border rounded-md focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background"
        onClick={() => {
          setOpen(true)
          inputRef.current?.focus()
        }}
      >
        {value.map((item) => {
          const option = options.find(o => o.value === item)
          return (
            <Badge key={item} variant="secondary" className="max-w-[calc(100%-8px)]">
              <span className="truncate">{option?.label || item}</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  handleUnselect(item)
                }}
                className="ml-1 rounded-full outline-none hover:bg-muted"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )
        })}
        <input
          ref={inputRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onFocus={() => setOpen(true)}
          onBlur={() => {
            // Pequeno atraso para permitir que o clique nos itens seja processado
            setTimeout(() => setOpen(false), 200)
          }}
          placeholder={value.length === 0 ? placeholder : undefined}
          className="flex-1 min-w-[120px] bg-transparent outline-none text-sm placeholder:text-muted-foreground"
        />
      </div>

      {open && (
        <div className="absolute z-50 w-full mt-1 bg-popover text-popover-foreground rounded-md border shadow-md overflow-hidden">
          <div className="max-h-60 overflow-y-auto p-1">
            {/* Opção "Selecionar todos" */}
            {allowSelectAll && options.length > 0 && value.length < options.length && (
              <div 
                className="px-2 py-1.5 text-sm cursor-pointer flex items-center justify-between rounded-sm hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 text-primary font-medium"
                onClick={() => {
                  handleSelectAll()
                  setOpen(false)
                }}
              >
                <span>Selecionar todos ({options.length})</span>
              </div>
            )}

            {/* Lista de opções selecionáveis */}
            {selectableOptions.length > 0 ? (
              selectableOptions.map((option) => (
                <div
                  key={option.value}
                  className="px-2 py-1.5 text-sm cursor-pointer flex items-center justify-between rounded-sm hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                  onClick={() => {
                    handleSelect(option.value)
                  }}
                >
                  <span>{option.label}</span>
                  <Check className="h-4 w-4 opacity-0 group-data-[selected]:opacity-100" />
                </div>
              ))
            ) : (
              <div className="py-6 text-center text-sm text-muted-foreground">
                {options.length === 0
                  ? "Nenhum item disponível"
                  : value.length === options.length
                  ? "Todos os itens já foram selecionados"
                  : inputValue
                  ? "Nenhum resultado encontrado"
                  : "Nenhum item disponível"}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
