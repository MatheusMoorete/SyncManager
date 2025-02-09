'use client'

import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { FilterSortMenu } from './filter-sort-menu'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  filterOptions?: {
    label: string
    value: string
    checked: boolean
    onCheckedChange: (checked: boolean) => void
  }[]
  sortOptions?: {
    label: string
    value: string
  }[]
  currentSortBy?: string
  currentSortOrder?: 'asc' | 'desc'
  onSortByChange?: (value: string) => void
  onSortOrderChange?: (value: 'asc' | 'desc') => void
}

export function SearchBar({
  value,
  onChange,
  placeholder = 'Buscar...',
  filterOptions,
  sortOptions,
  currentSortBy,
  currentSortOrder,
  onSortByChange,
  onSortOrderChange,
}: SearchBarProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative flex-1 max-w-[400px]">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder={placeholder}
          value={value}
          onChange={e => onChange(e.target.value)}
          className="pl-9 bg-white rounded-lg border border-input h-10"
        />
      </div>
      {sortOptions && currentSortBy && currentSortOrder && onSortByChange && onSortOrderChange && (
        <FilterSortMenu
          filterOptions={filterOptions}
          sortOptions={sortOptions}
          currentSortBy={currentSortBy}
          currentSortOrder={currentSortOrder}
          onSortByChange={onSortByChange}
          onSortOrderChange={onSortOrderChange}
        />
      )}
    </div>
  )
}
