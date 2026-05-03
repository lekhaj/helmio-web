'use client'
import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { cn } from '@/lib/cn'
import type { ClarifyQuestion } from '@/types'

interface Props {
  question: ClarifyQuestion
  values: string[]
  onChange: (values: string[]) => void
}

export function ChipQuestion({ question, values, onChange }: Props) {
  const [customInput, setCustomInput] = useState('')
  const [showCustom, setShowCustom] = useState(false)

  function toggle(value: string) {
    if (question.multi_select) {
      onChange(values.includes(value) ? values.filter(v => v !== value) : [...values, value])
    } else {
      onChange([value])
    }
  }

  function addCustom() {
    const v = customInput.trim()
    if (!v) return
    if (!values.includes(v)) onChange([...values, v])
    setCustomInput('')
    setShowCustom(false)
  }

  const labelByValue = new Map(question.options.map(o => [o.value, o.label]))

  return (
    <div>
      <p className="text-[12.5px] font-medium text-neutral-800 mb-2.5">{question.question}</p>

      <div className="flex flex-wrap gap-1.5">
        {question.options.map(opt => {
          const active = values.includes(opt.value)
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => toggle(opt.value)}
              className={cn(
                'text-[11.5px] px-2.5 py-1 rounded-full border transition-all duration-150',
                active
                  ? 'bg-brand-600 border-brand-600 text-white shadow-soft'
                  : 'bg-white border-neutral-200 text-neutral-700 hover:border-brand-400 hover:text-brand-700',
              )}
            >
              {opt.label}
            </button>
          )
        })}

        {/* custom values not in option list */}
        {values
          .filter(v => !labelByValue.has(v))
          .map(v => (
            <span
              key={v}
              className="inline-flex items-center gap-1 text-[11.5px] px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800"
            >
              {v}
              <button
                type="button"
                onClick={() => onChange(values.filter(x => x !== v))}
                className="hover:text-rose-600"
                aria-label="remove"
              >
                <X className="size-3" />
              </button>
            </span>
          ))}

        {question.allow_custom && !showCustom && (
          <button
            type="button"
            onClick={() => setShowCustom(true)}
            className="text-[11.5px] px-2 py-1 rounded-full border border-dashed border-neutral-300 text-neutral-500 hover:border-brand-400 hover:text-brand-700 inline-flex items-center gap-0.5"
          >
            <Plus className="size-3" /> Add
          </button>
        )}

        {showCustom && (
          <div className="inline-flex items-center gap-1">
            <input
              autoFocus
              value={customInput}
              onChange={e => setCustomInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') { e.preventDefault(); addCustom() }
                if (e.key === 'Escape') { setCustomInput(''); setShowCustom(false) }
              }}
              onBlur={addCustom}
              placeholder="custom…"
              className="text-[11.5px] px-2 py-1 rounded-full border border-brand-400 focus:outline-none w-28"
            />
          </div>
        )}
      </div>
    </div>
  )
}
