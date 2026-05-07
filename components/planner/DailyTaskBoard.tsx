'use client'
import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trash2, AlertCircle, ArrowRight, Users, Plus, Check, X } from 'lucide-react'
import { api } from '@/lib/api'
import { cn } from '@/lib/cn'
import type { PlanTask, Developer, Priority, PlanTaskStatus } from '@/types'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']

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
  planId: number
  tasks: PlanTask[]
  developers: Developer[]
  generating: boolean
  onChange: () => void
  totalAvailableHours: number
}

export function DailyTaskBoard({ planId, tasks, developers, generating, onChange, totalAvailableHours }: Props) {
  const devTasks = tasks.filter(t => !t.is_handoff)
  const handoffs = tasks.filter(t => t.is_handoff)
  const totalHours = devTasks.reduce((s, t) => s + t.effort_hours, 0)
  const overloaded = totalHours > totalAvailableHours

  const byDay: Record<number, PlanTask[]> = { 0: [], 1: [], 2: [], 3: [], 4: [] }
  const unscheduled: PlanTask[] = []
  for (const t of devTasks) {
    if (t.day_index != null && t.day_index >= 0 && t.day_index <= 4) byDay[t.day_index].push(t)
    else unscheduled.push(t)
  }

  return (
    <div className="bg-white border border-neutral-200/70 rounded-xl shadow-soft flex flex-col h-full overflow-hidden">
      <header className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between flex-shrink-0">
        <div>
          <h2 className="font-semibold text-[14px] text-neutral-900">Daily plan · Mon → Fri</h2>
          <p className="text-[11px] text-neutral-500 mt-0.5">
            {devTasks.length} dev task{devTasks.length === 1 ? '' : 's'} · {handoffs.length} handoff{handoffs.length === 1 ? '' : 's'} · {totalHours}h / {totalAvailableHours}h
          </p>
        </div>
        {overloaded && (
          <div className="flex items-center gap-1.5 text-[11px] text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full font-medium">
            <AlertCircle className="size-3" />
            +{totalHours - totalAvailableHours}h over budget
          </div>
        )}
      </header>

      {generating ? (
        <Skeleton />
      ) : (
        <div className="flex-1 overflow-x-auto overflow-y-auto scrollbar-subtle">
          <div className="grid grid-cols-5 gap-3 p-4 min-w-[860px]">
            {DAYS.map((d, idx) => (
              <DayColumn
                key={d}
                day={d}
                idx={idx}
                planId={planId}
                tasks={byDay[idx]}
                developers={developers}
                onChange={onChange}
              />
            ))}
          </div>

          {unscheduled.length > 0 && (
            <div className="border-t border-neutral-100 px-4 pt-3 pb-4">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 mb-2">Unscheduled</p>
              <div className="flex flex-wrap gap-2">
                {unscheduled.map((t, i) => (
                  <TaskCard key={t.id} task={t} developers={developers} onChange={onChange} idx={i} compact />
                ))}
              </div>
            </div>
          )}

          {handoffs.length > 0 && (
            <div className="border-t border-neutral-100 px-4 pt-3 pb-4">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 mb-2 flex items-center gap-1">
                <Users className="size-3" /> Handoffs to others
              </p>
              <div className="flex flex-col gap-2">
                {handoffs.map((t, i) => (
                  <HandoffCard key={t.id} task={t} developers={developers} onChange={onChange} idx={i} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function DayColumn({
  day, idx, planId, tasks, developers, onChange,
}: { day: string; idx: number; planId: number; tasks: PlanTask[]; developers: Developer[]; onChange: () => void }) {
  const dayHours = tasks.reduce((s, t) => s + t.effort_hours, 0)
  const [adding, setAdding] = useState(false)
  const [title, setTitle] = useState('')
  const [hours, setHours] = useState(2)
  const [saving, setSaving] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (adding) inputRef.current?.focus()
  }, [adding])

  async function addTask() {
    if (!title.trim()) return
    setSaving(true)
    try {
      await api.planTasks.create(planId, { title: title.trim(), effort_hours: hours, day_index: idx, priority: 'medium' })
      setTitle(''); setHours(2); setAdding(false)
      onChange()
    } finally {
      setSaving(false)
    }
  }

  function cancel() { setTitle(''); setHours(2); setAdding(false) }

  return (
    <div className="flex flex-col">
      <div className="flex items-baseline justify-between mb-2 px-1">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-700">{day}</p>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-mono text-neutral-400">{dayHours}h</span>
          <button
            onClick={() => setAdding(true)}
            className="text-neutral-400 hover:text-brand-600 transition-colors"
            title="Add task"
          >
            <Plus className="size-3.5" />
          </button>
        </div>
      </div>
      <div className="bg-neutral-50/60 rounded-lg p-2 flex flex-col gap-2 min-h-[180px]">
        <AnimatePresence initial={false}>
          {tasks.length === 0 && !adding ? (
            <button
              onClick={() => setAdding(true)}
              className="flex-1 flex flex-col items-center justify-center py-6 text-neutral-300 hover:text-neutral-400 transition-colors group"
            >
              <Plus className="size-4 mb-1 group-hover:text-brand-400" />
              <p className="text-[11px] italic">Add task</p>
            </button>
          ) : (
            tasks.map((t, i) => (
              <TaskCard key={t.id} task={t} developers={developers} onChange={onChange} idx={i} />
            ))
          )}
        </AnimatePresence>

        {adding && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-brand-200 rounded-md p-2 shadow-sm"
          >
            <input
              ref={inputRef}
              value={title}
              onChange={e => setTitle(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') addTask(); if (e.key === 'Escape') cancel() }}
              placeholder="Task title…"
              className="w-full text-[12px] bg-transparent focus:outline-none text-neutral-900 placeholder-neutral-400 mb-1.5"
            />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min={1} max={16}
                  value={hours}
                  onChange={e => setHours(parseInt(e.target.value) || 2)}
                  className="w-9 text-[11px] font-mono border border-neutral-200 rounded px-1 py-0.5 focus:outline-none focus:border-brand-400"
                />
                <span className="text-[10px] text-neutral-400">h</span>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={cancel} className="text-neutral-400 hover:text-neutral-600">
                  <X className="size-3.5" />
                </button>
                <button
                  onClick={addTask}
                  disabled={!title.trim() || saving}
                  className="text-brand-600 hover:text-brand-700 disabled:opacity-40"
                >
                  <Check className="size-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

function TaskCard({
  task, developers, onChange, idx, compact = false,
}: { task: PlanTask; developers: Developer[]; onChange: () => void; idx: number; compact?: boolean }) {
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(task.title)

  async function patch(p: Partial<PlanTask>) {
    await api.planTasks.update(task.id, p)
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
  async function cyclePriority() {
    const order: Priority[] = ['low', 'medium', 'high']
    await patch({ priority: order[(order.indexOf(task.priority) + 1) % 3] })
  }
  async function cycleStatus() {
    const order: PlanTaskStatus[] = ['todo', 'in_progress', 'done']
    await patch({ status: order[(order.indexOf(task.status) + 1) % 3] })
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: idx * 0.03, duration: 0.18 }}
      className={cn(
        'bg-white border border-neutral-200/70 rounded-md p-2.5 shadow-sm hover:shadow-soft transition-all group cursor-pointer',
        task.status === 'done' && 'opacity-60',
        compact && 'inline-block w-56',
      )}
    >
      <div className="flex items-start gap-1.5 mb-1.5">
        <button
          onClick={cyclePriority}
          className="mt-0.5 shrink-0"
          title={task.priority}
        >
          <span className={cn('block size-2 rounded-full', PRIORITY_DOT[task.priority])} />
        </button>
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
            className="flex-1 text-[12px] border border-brand-400 rounded px-1.5 py-0.5 focus:outline-none"
          />
        ) : (
          <button
            onClick={() => setEditing(true)}
            className={cn(
              'flex-1 text-left text-[12px] leading-snug font-medium text-neutral-900 hover:text-brand-700 transition-colors',
              task.status === 'done' && 'line-through',
            )}
          >
            {task.title}
          </button>
        )}
      </div>

      {task.expected_outcome && (
        <p className="text-[10.5px] text-neutral-500 mb-1.5 leading-snug pl-3.5">→ {task.expected_outcome}</p>
      )}

      <div className="flex items-center justify-between pl-3.5 pt-1">
        <div className="flex items-center gap-1.5">
          <select
            value={task.assignee_id ?? ''}
            onChange={e => patch({ assignee_id: e.target.value ? parseInt(e.target.value) : null })}
            className="text-[10px] bg-transparent border-none focus:outline-none cursor-pointer text-neutral-600 hover:text-brand-700 max-w-[80px] truncate"
          >
            <option value="">—</option>
            {developers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
          <span className="text-[10px] font-mono text-neutral-400">{task.effort_hours}h</span>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={cycleStatus} title="cycle status">
            <span className={cn('text-[9px] px-1 py-0.5 rounded font-medium', STATUS_BADGE[task.status])}>
              {task.status === 'in_progress' ? '...' : task.status === 'done' ? '✓' : 'todo'}
            </span>
          </button>
          <button onClick={remove} className="text-neutral-400 hover:text-rose-500" aria-label="delete">
            <Trash2 className="size-3" />
          </button>
        </div>
      </div>
    </motion.div>
  )
}

function HandoffCard({
  task, developers, onChange, idx,
}: { task: PlanTask; developers: Developer[]; onChange: () => void; idx: number }) {
  async function patch(p: Partial<PlanTask>) {
    await api.planTasks.update(task.id, p)
    onChange()
  }
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.03, duration: 0.18 }}
      className="flex items-center gap-2 bg-amber-50/40 border border-amber-200/60 rounded-md px-2.5 py-1.5"
    >
      <ArrowRight className="size-3 text-amber-600 shrink-0" />
      <span className="text-[12px] text-neutral-800 flex-1 min-w-0 truncate">{task.title}</span>
      <select
        value={task.assignee_id ?? ''}
        onChange={e => patch({ assignee_id: e.target.value ? parseInt(e.target.value) : null })}
        className="text-[10.5px] bg-transparent border-none focus:outline-none cursor-pointer text-amber-800 max-w-[100px]"
      >
        <option value="">assign…</option>
        {developers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
      </select>
      <span className="text-[10px] font-mono text-amber-700">{task.effort_hours}h</span>
    </motion.div>
  )
}


function Skeleton() {
  return (
    <div className="grid grid-cols-5 gap-3 p-4">
      {DAYS.map(d => (
        <div key={d}>
          <div className="h-3 w-10 skeleton rounded mb-2" />
          <div className="bg-neutral-50/60 rounded-lg p-2 flex flex-col gap-2 min-h-[180px]">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="h-12 skeleton rounded-md" style={{ animationDelay: `${i * 0.1}s` }} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
