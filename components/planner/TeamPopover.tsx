'use client'
import { useState, useRef, useEffect } from 'react'
import { Users, Plus, X, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { api } from '@/lib/api'
import { cn } from '@/lib/cn'
import type { Developer } from '@/types'

interface Props {
  developers: Developer[]
  onChange: (devs: Developer[]) => void
}

export function TeamPopover({ developers, onChange }: Props) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [role, setRole] = useState('')
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', onOutside)
    return () => document.removeEventListener('mousedown', onOutside)
  }, [open])

  async function addDev() {
    if (!name.trim()) return
    setSaving(true); setErr(null)
    try {
      const dev = await api.developers.create({ name: name.trim(), role: role.trim() || undefined })
      onChange([...developers, dev])
      setName(''); setRole('')
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : 'Failed')
    } finally {
      setSaving(false)
    }
  }

  async function removeDev(id: number) {
    await api.developers.delete(id)
    onChange(developers.filter(d => d.id !== id))
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className={cn(
          'flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border transition-colors',
          open
            ? 'bg-brand-50 border-brand-200 text-brand-700'
            : 'bg-white border-neutral-200/70 text-neutral-600 hover:border-neutral-300 hover:text-neutral-900',
        )}
      >
        <Users className="size-3.5" />
        <span>Team</span>
        {developers.length > 0 && (
          <span className="bg-brand-100 text-brand-700 text-[10px] font-semibold px-1.5 py-0.5 rounded-full leading-none">
            {developers.length}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-64 bg-white border border-neutral-200/70 rounded-xl shadow-lg z-50 overflow-hidden"
          >
            <div className="px-4 py-3 border-b border-neutral-100">
              <p className="text-[12px] font-semibold text-neutral-900">Team members</p>
              <p className="text-[11px] text-neutral-500 mt-0.5">Assigned to tasks in this planner</p>
            </div>

            <div className="divide-y divide-neutral-100">
              {developers.length === 0 ? (
                <p className="text-[11px] text-neutral-400 italic px-4 py-3">No members yet</p>
              ) : (
                developers.map(d => (
                  <div key={d.id} className="flex items-center gap-2.5 px-4 py-2 group">
                    <div className="size-6 rounded-full bg-brand-100 flex items-center justify-center text-[10px] font-semibold text-brand-700 shrink-0">
                      {d.name[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-medium text-neutral-900 truncate">{d.name}</p>
                      {d.role && <p className="text-[10px] text-neutral-500 truncate">{d.role}</p>}
                    </div>
                    <button
                      onClick={() => removeDev(d.id)}
                      className="opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-rose-500 transition-all"
                      title="Remove"
                    >
                      <X className="size-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="px-4 py-3 border-t border-neutral-100 bg-neutral-50/50">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 mb-2">Add member</p>
              <div className="flex flex-col gap-1.5">
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addDev()}
                  placeholder="Name"
                  className="text-[12px] border border-neutral-200 rounded-md px-2.5 py-1.5 focus:outline-none focus:border-brand-400 bg-white"
                />
                <input
                  value={role}
                  onChange={e => setRole(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addDev()}
                  placeholder="Role (optional)"
                  className="text-[12px] border border-neutral-200 rounded-md px-2.5 py-1.5 focus:outline-none focus:border-brand-400 bg-white"
                />
                {err && <p className="text-[11px] text-rose-500">{err}</p>}
                <button
                  onClick={addDev}
                  disabled={!name.trim() || saving}
                  className="flex items-center justify-center gap-1.5 text-[12px] font-medium bg-brand-600 text-white rounded-md px-3 py-1.5 hover:bg-brand-700 disabled:opacity-40 transition-colors"
                >
                  {saving ? <Loader2 className="size-3.5 animate-spin" /> : <Plus className="size-3.5" />}
                  Add
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
