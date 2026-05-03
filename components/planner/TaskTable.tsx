'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trash2, AlertCircle, Sparkles } from 'lucide-react'
import { api } from '@/lib/api'
import { cn } from '@/lib/cn'
import type { PlanTask, Developer, Priority, PlanTaskStatus } from '@/types'

const PRIORITY_DOT: Record<Priority, string> = {
  high: 'bg-rose-500',
  medium: 'bg-amber-500',
  low: 'bg-neutral-300',
}

const STATUS_BADGE: Record<PlanTaskStatus, string> = {
  todo: 'bg-neutral-100 text-neutral-600',
  in_progress: 'bg-amber-50 text-amber-700',
  done: 'bg-emerald-50 text-emerald-700',
}

interface Props {
  tasks: PlanTask[]
  developers: Developer[]
  generating: boolean
  onChange: () => void
}

export function TaskTable({ tasks, developers, generating, onChange }: Props) {
  const totalHours = tasks.reduce((s, t) => s + t.effort_hours, 0)
  const overloaded = totalHours > 40

  return (
    <div className="bg-white border border-neutral-200/70 rounded-xl shadow-soft overflow-hidden">
      <header className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-[14px] text-neutral-900">Week Plan</h2>
          <p className="text-[11px] text-neutral-500 mt-0.5">
            {tasks.length} task{tasks.length === 1 ? '' : 's'} · {totalHours}h total
          </p>
        </div>
        {overloaded && (
          <div className="flex items-center gap-1.5 text-[11px] text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full font-medium">
            <AlertCircle className="size-3" />
            Overloaded ({totalHours}h)
          </div>
        )}
      </header>

      {generating ? (
        <SkeletonRows />
      ) : tasks.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="divide-y divide-neutral-100">
          <div className="grid grid-cols-12 gap-3 px-5 py-2 text-[10px] font-semibold uppercase tracking-wider text-neutral-400 bg-neutral-50/50">
            <div className="col-span-6">Task</div>
            <div className="col-span-3">Assignee</div>
            <div className="col-span-1 text-center">Effort</div>
            <div className="col-span-1 text-center">Pri</div>
            <div className="col-span-1" />
          </div>
          <AnimatePresence initial={false}>
            {tasks.map((t, idx) => (
              <Row
                key={t.id}
                task={t}
                developers={developers}
                onChange={onChange}
                idx={idx}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}

function Row({ task, developers, onChange, idx }: {
  task: PlanTask; developers: Developer[]; onChange: () => void; idx: number
}) {
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(task.title)

  async function patch(patch: Partial<PlanTask>) {
    await api.planTasks.update(task.id, patch)
    onChange()
  }
  async function commitTitle() {
    setEditing(false)
    if (title.trim() && title !== task.title) await patch({ title: title.trim() })
  }
  async function remove() {
    await api.planTasks.delete(task.id)
    onChange()
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ delay: idx * 0.04, duration: 0.2, ease: 'easeOut' }}
      className="grid grid-cols-12 gap-3 px-5 py-3 items-center text-[13px] hover:bg-neutral-50/60 transition-colors group"
    >
      <div className="col-span-6 min-w-0">
        {editing ? (
          <input
            value={title}
            autoFocus
            onChange={e => setTitle(e.target.value)}
            onBlur={commitTitle}
            onKeyDown={e => {
              if (e.key === 'Enter') commitTitle()
              if (e.key === 'Escape') { setTitle(task.title); setEditing(false) }
            }}
            className="w-full bg-white border border-brand-400 rounded px-2 py-1 text-[13px] focus:outline-none"
          />
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="text-left w-full text-neutral-900 hover:text-brand-700 transition-colors truncate cursor-text"
          >
            {task.title}
          </button>
        )}
        <div className="flex items-center gap-2 mt-1">
          <span className={cn('inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium', STATUS_BADGE[task.status])}>
            {task.status.replace('_', ' ')}
          </span>
        </div>
      </div>

      <div className="col-span-3">
        <select
          value={task.assignee_id ?? ''}
          onChange={e => patch({ assignee_id: e.target.value ? parseInt(e.target.value) : null })}
          className="w-full text-[12px] bg-transparent border-none focus:outline-none focus:ring-0 cursor-pointer hover:text-brand-700 truncate"
        >
          <option value="">Unassigned</option>
          {developers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
      </div>

      <div className="col-span-1 text-center">
        <input
          type="number"
          min={1} max={80}
          value={task.effort_hours}
          onChange={e => patch({ effort_hours: parseInt(e.target.value) || 1 })}
          className="w-12 text-center text-[12px] font-mono bg-transparent border border-transparent hover:border-neutral-200 focus:border-brand-400 rounded px-1 py-0.5 focus:outline-none"
        />
        <span className="text-[10px] text-neutral-400 ml-0.5">h</span>
      </div>

      <div className="col-span-1 text-center">
        <button
          onClick={() => {
            const next: Priority[] = ['low', 'medium', 'high']
            const i = next.indexOf(task.priority)
            patch({ priority: next[(i + 1) % 3] })
          }}
          title={task.priority}
          className="inline-flex items-center justify-center size-5 rounded-full hover:scale-110 transition-transform"
        >
          <span className={cn('size-2.5 rounded-full', PRIORITY_DOT[task.priority])} />
        </button>
      </div>

      <div className="col-span-1 text-right">
        <button
          onClick={remove}
          className="opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-rose-500 transition-all"
          aria-label="delete"
        >
          <Trash2 className="size-3.5" />
        </button>
      </div>
    </motion.div>
  )
}

function SkeletonRows() {
  return (
    <div className="divide-y divide-neutral-100">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="px-5 py-3.5 flex items-center gap-3">
          <div className="h-3.5 rounded skeleton flex-1" style={{ animationDelay: `${i * 0.1}s` }} />
          <div className="h-3.5 w-20 rounded skeleton" />
          <div className="h-3.5 w-8 rounded skeleton" />
          <div className="h-3 w-3 rounded-full skeleton" />
        </div>
      ))}
    </div>
  )
}

function EmptyState() {
  return (
    <div className="px-5 py-16 text-center">
      <div className="inline-flex items-center justify-center size-10 rounded-full bg-brand-50 mb-3">
        <Sparkles className="size-4 text-brand-600" />
      </div>
      <p className="text-sm font-medium text-neutral-900 mb-1">Ready to draft this week</p>
      <p className="text-[12px] text-neutral-500 max-w-xs mx-auto leading-relaxed">
        Write a research prompt on the left and hit <span className="font-mono text-neutral-700">Generate Plan</span>.
      </p>
    </div>
  )
}
