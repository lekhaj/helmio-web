'use client'
import { useState } from 'react'
import { api } from '@/lib/api'
import type { FeedbackCreate } from '@/types'

interface Props {
  onCreated: () => void
}

export default function FeedbackForm({ onCreated }: Props) {
  const [content, setContent] = useState('')
  const [rating, setRating] = useState(3)
  const [taskId, setTaskId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim()) return
    setLoading(true)
    setError(null)
    try {
      const body: FeedbackCreate = {
        content: content.trim(),
        rating,
        task_id: taskId ? parseInt(taskId, 10) : null,
      }
      await api.feedback.create(body)
      setContent('')
      setRating(3)
      setTaskId('')
      onCreated()
    } catch {
      setError('Failed to submit feedback.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col gap-3">
      <h2 className="font-semibold text-gray-700">New Feedback</h2>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <textarea
        placeholder="What feedback do you have?"
        value={content}
        onChange={e => setContent(e.target.value)}
        rows={3}
        required
        className="border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-500"
      />
      <div className="flex gap-3 items-center">
        <label className="text-sm text-gray-600 shrink-0">Rating</label>
        <input
          type="range"
          min={1}
          max={5}
          value={rating}
          onChange={e => setRating(parseInt(e.target.value, 10))}
          className="flex-1"
        />
        <span className="text-sm font-medium text-brand-600 w-4">{rating}</span>
      </div>
      <input
        type="number"
        placeholder="Task ID (optional)"
        value={taskId}
        onChange={e => setTaskId(e.target.value)}
        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
      />
      <button
        type="submit"
        disabled={loading}
        className="bg-brand-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-brand-700 disabled:opacity-50 transition-colors"
      >
        {loading ? 'Submitting…' : 'Submit Feedback'}
      </button>
    </form>
  )
}
