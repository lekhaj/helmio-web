'use client'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import type { Task, TaskStatus } from '@/types'

const STATUS_LABEL: Record<TaskStatus, string> = {
  todo: 'To Do',
  in_progress: 'In Progress',
  done: 'Done',
}

const STATUS_COLOR: Record<TaskStatus, string> = {
  todo: 'bg-gray-100 text-gray-600',
  in_progress: 'bg-yellow-100 text-yellow-700',
  done: 'bg-green-100 text-green-700',
}

interface Props {
  refresh: number
}

export default function TaskList({ refresh }: Props) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    api.tasks.list()
      .then(setTasks)
      .catch(() => setError('Failed to load tasks.'))
      .finally(() => setLoading(false))
  }, [refresh])

  async function cycleStatus(task: Task) {
    const next: TaskStatus[] = ['todo', 'in_progress', 'done']
    const idx = next.indexOf(task.status)
    const newStatus = next[(idx + 1) % next.length]
    try {
      const updated = await api.tasks.update(task.id, { status: newStatus })
      setTasks(ts => ts.map(t => (t.id === task.id ? updated : t)))
    } catch {
      // silently fail — user can retry
    }
  }

  async function remove(id: number) {
    try {
      await api.tasks.delete(id)
      setTasks(ts => ts.filter(t => t.id !== id))
    } catch {
      // silently fail
    }
  }

  if (loading) return <p className="text-sm text-gray-400">Loading tasks…</p>
  if (error) return <p className="text-sm text-red-500">{error}</p>
  if (!tasks.length) return <p className="text-sm text-gray-400">No tasks yet. Create one above.</p>

  return (
    <ul className="flex flex-col gap-3">
      {tasks.map(task => (
        <li key={task.id} className="bg-white border border-gray-200 rounded-xl p-4 flex items-start gap-4">
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-900 truncate">{task.title}</p>
            {task.description && (
              <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">{task.description}</p>
            )}
          </div>
          <button
            onClick={() => cycleStatus(task)}
            className={`text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap shrink-0 ${STATUS_COLOR[task.status]}`}
          >
            {STATUS_LABEL[task.status]}
          </button>
          <button
            onClick={() => remove(task.id)}
            className="text-gray-300 hover:text-red-400 transition-colors text-sm shrink-0"
            title="Delete"
          >
            ✕
          </button>
        </li>
      ))}
    </ul>
  )
}
