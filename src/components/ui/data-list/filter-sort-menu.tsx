'use client'

import { Filter, ArrowUpDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface FilterSortMenuProps {
  // Filter props
  filterOptions?: {
    label: string
    value: string
    checked: boolean
    onCheckedChange: (checked: boolean) => void
  }[]
  // Sort props
  sortOptions: {
    label: string
    value: string
  }[]
  currentSortBy: string
  currentSortOrder: 'asc' | 'desc'
  onSortByChange: (value: string) => void
  onSortOrderChange: (value: 'asc' | 'desc') => void
}

export function FilterSortMenu({
  filterOptions,
  sortOptions,
  currentSortBy,
  currentSortOrder,
  onSortByChange,
  onSortOrderChange,
}: FilterSortMenuProps) {
  return (
    <div className="flex items-center gap-2">
      {filterOptions && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 bg-white hover:bg-neutral-cream/50 rounded-lg h-10 px-4"
            >
              <Filter className="h-4 w-4" />
              <span className="hidden md:inline">Filtros</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[200px]">
            {filterOptions.map(option => (
              <DropdownMenuCheckboxItem
                key={option.value}
                checked={option.checked}
                onCheckedChange={option.onCheckedChange}
                className="hover:bg-neutral-cream/50"
              >
                {option.label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 bg-white hover:bg-neutral-cream/50 rounded-lg h-10 px-4"
          >
            <ArrowUpDown className="h-4 w-4" />
            <span className="hidden md:inline">Ordenar</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[200px]">
          <div className="p-2">
            <Select value={currentSortBy} onValueChange={onSortByChange}>
              <SelectTrigger>
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => onSortOrderChange(currentSortOrder === 'asc' ? 'desc' : 'asc')}
            className="hover:bg-neutral-cream/50"
          >
            {currentSortOrder === 'asc' ? 'Ordem decrescente' : 'Ordem crescente'}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
