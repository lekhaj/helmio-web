'use client'
import { useState } from 'react'
import { api } from '@/lib/api'
import type { TaskCreate, TaskStatus } from '@/types'

interface Props {
  onCreated: () => void
}

export default function TaskForm({ onCreated }: Props) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<TaskStatus>('todo')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    setLoading(true)
    setError(null)
    try {
      const body: TaskCreate = { title: title.trim(), description: description.trim(), status }
      await api.tasks.create(body)
      setTitle('')
      setDescription('')
      setStatus('todo')
      onCreated()
    } catch {
      setError('Failed to create task.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col gap-3">
      <h2 className="font-semibold text-gray-700">New Task</h2>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={e => setTitle(e.target.value)}
        required
        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
      />
      <textarea
        placeholder="Description (optional)"
        value={description}
        onChange={e => setDescription(e.target.value)}
        rows={2}
        className="border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-500"
      />
      <select
        value={status}
        onChange={e => setStatus(e.target.value as TaskStatus)}
        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
      >
        <option value="todo">To Do</option>
        <option value="in_progress">In Progress</option>
        <option value="done">Done</option>
      </select>
      <button
        type="submit"
        disabled={loading}
        className="bg-brand-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-brand-700 disabled:opacity-50 transition-colors"
      >
        {loading ? 'Creating…' : 'Create Task'}
      </button>
    </form>
  )
}
