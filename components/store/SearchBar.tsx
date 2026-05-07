'use client'

import { useState, useTransition } from 'react'
import { Search, X } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { cn } from '@/lib/utils'

export default function SearchBar({ className }: { className?: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [value, setValue] = useState(searchParams.get('q') || '')
  const [isPending, startTransition] = useTransition()

  const submit = (q: string) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString())
      if (q.trim()) params.set('q', q.trim())
      else params.delete('q')
      params.delete('page')
      router.push(`/products?${params.toString()}`)
    })
  }

  const clear = () => {
    setValue('')
    submit('')
  }

  return (
    <div className={cn('relative', className)}>
      <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-400 pointer-events-none" />
      <input
        type="search"
        value={value}
        onChange={(e) => {
          setValue(e.target.value)
          if (e.target.value === '') submit('')
        }}
        onKeyDown={(e) => e.key === 'Enter' && submit(value)}
        placeholder="ابحث عن منتج..."
        className={cn(
          'input pr-10 pl-10 text-sm',
          isPending && 'opacity-70'
        )}
      />
      {value && (
        <button
          onClick={clear}
          className="absolute left-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full text-charcoal-600/40 hover:text-charcoal-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}
