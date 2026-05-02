'use client'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import type { Feedback } from '@/types'

interface Props {
  refresh: number
}

const STARS = (n: number) => '★'.repeat(n) + '☆'.repeat(5 - n)

export default function FeedbackList({ refresh }: Props) {
  const [items, setItems] = useState<Feedback[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    api.feedback.list()
      .then(setItems)
      .catch(() => setError('Failed to load feedback.'))
      .finally(() => setLoading(false))
  }, [refresh])

  async function remove(id: number) {
    try {
      await api.feedback.delete(id)
      setItems(fs => fs.filter(f => f.id !== id))
    } catch {
      // silently fail
    }
  }

  if (loading) return <p className="text-sm text-gray-400">Loading feedback…</p>
  if (error) return <p className="text-sm text-red-500">{error}</p>
  if (!items.length) return <p className="text-sm text-gray-400">No feedback yet. Submit one above.</p>

  return (
    <ul className="flex flex-col gap-3">
      {items.map(fb => (
        <li key={fb.id} className="bg-white border border-gray-200 rounded-xl p-4 flex gap-4 items-start">
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-900">{fb.content}</p>
            <div className="flex items-center gap-3 mt-1.5">
              <span className="text-yellow-400 text-xs tracking-wide">{STARS(fb.rating)}</span>
              {fb.task_id && (
                <span className="text-xs text-gray-400">Task #{fb.task_id}</span>
              )}
              <span className="text-xs text-gray-300">
                {new Date(fb.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
          <button
            onClick={() => remove(fb.id)}
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
