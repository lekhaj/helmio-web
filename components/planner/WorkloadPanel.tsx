'use client'
import { Users } from 'lucide-react'
import type { PlanTask, Developer } from '@/types'

interface Props {
  tasks: PlanTask[]
  developers: Developer[]
}

export function WorkloadPanel({ tasks, developers }: Props) {
  // hours by assignee (including unassigned bucket)
  const byDev = new Map<number | null, number>()
  for (const t of tasks) {
    const k = t.assignee_id ?? null
    byDev.set(k, (byDev.get(k) ?? 0) + t.effort_hours)
  }

  const rows = Array.from(byDev.entries())
    .map(([id, hours]) => {
      const dev = id == null ? null : developers.find(d => d.id === id) ?? null
      return { id, name: dev?.name ?? 'Unassigned', hours }
    })
    .sort((a, b) => b.hours - a.hours)

  const max = Math.max(40, ...rows.map(r => r.hours))

  return (
    <aside className="bg-white border border-neutral-200/70 rounded-xl shadow-soft flex flex-col h-full">
      <header className="px-5 py-4 border-b border-neutral-100">
        <h2 className="font-semibold text-[14px] text-neutral-900 flex items-center gap-1.5">
          <Users className="size-3.5 text-neutral-400" />
          Workload
        </h2>
        <p className="text-[11px] text-neutral-500 mt-0.5">Hours by assignee · 40h cap</p>
      </header>

      <div className="px-5 py-4 flex-1 overflow-y-auto scrollbar-subtle">
        {rows.length === 0 ? (
          <p className="text-[12px] text-neutral-400 italic text-center py-8">No tasks yet</p>
        ) : (
          <div className="flex flex-col gap-3.5">
            {rows.map(r => {
              const pct = Math.min(100, (r.hours / max) * 100)
              const over = r.hours > 40
              return (
                <div key={String(r.id)}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <Avatar name={r.name} />
                      <span className="text-[12px] font-medium text-neutral-700 truncate">{r.name}</span>
                    </div>
                    <span className={`text-[11px] font-mono ${over ? 'text-rose-600 font-semibold' : 'text-neutral-500'}`}>
                      {r.hours}h
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-neutral-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${over ? 'bg-rose-400' : 'bg-brand-500'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </aside>
  )
}

function Avatar({ name }: { name: string }) {
  const initial = name === 'Unassigned' ? '?' : name.charAt(0).toUpperCase()
  const isUnassigned = name === 'Unassigned'
  return (
    <div className={`size-5 rounded-full flex items-center justify-center text-[10px] font-semibold shrink-0 ${
      isUnassigned ? 'bg-neutral-100 text-neutral-400' : 'bg-brand-100 text-brand-700'
    }`}>
      {initial}
    </div>
  )
}
