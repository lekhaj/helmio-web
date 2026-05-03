'use client'
import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

const baseField = cn(
  'w-full bg-white border border-neutral-200 rounded-md px-3 py-2 text-sm',
  'placeholder:text-neutral-400 text-neutral-900',
  'focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20',
  'transition-colors',
  'disabled:bg-neutral-50 disabled:text-neutral-400',
)

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...rest }, ref) {
    return <input ref={ref} className={cn(baseField, className)} {...rest} />
  }
)

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  function Textarea({ className, ...rest }, ref) {
    return <textarea ref={ref} className={cn(baseField, 'resize-none', className)} {...rest} />
  }
)

export function Label({ children, htmlFor, hint }: { children: React.ReactNode; htmlFor?: string; hint?: string }) {
  return (
    <div className="flex items-baseline justify-between mb-1.5">
      <label htmlFor={htmlFor} className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider">
        {children}
      </label>
      {hint && <span className="text-[10px] text-neutral-400">{hint}</span>}
    </div>
  )
}
