'use client'
import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

type Variant = 'primary' | 'secondary' | 'ghost' | 'outline'
type Size = 'sm' | 'md' | 'lg'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
}

const VARIANT: Record<Variant, string> = {
  primary: 'bg-neutral-900 text-white hover:bg-neutral-800 shadow-soft-md',
  secondary: 'bg-brand-600 text-white hover:bg-brand-700 shadow-soft-md',
  outline: 'border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700',
  ghost: 'text-neutral-600 hover:bg-neutral-100',
}

const SIZE: Record<Size, string> = {
  sm: 'h-8 px-3 text-xs rounded-md',
  md: 'h-9 px-4 text-sm rounded-md',
  lg: 'h-11 px-5 text-sm rounded-lg',
}

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { variant = 'primary', size = 'md', className, ...rest }, ref
) {
  return (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center gap-1.5 font-medium transition-colors',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 focus-visible:ring-offset-2',
        VARIANT[variant],
        SIZE[size],
        className,
      )}
      {...rest}
    />
  )
})
