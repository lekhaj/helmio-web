'use client'
import { useState } from 'react'
import FeedbackForm from '@/components/FeedbackForm'
import FeedbackList from '@/components/FeedbackList'

export default function FeedbackPage() {
  const [refresh, setRefresh] = useState(0)
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-gray-900">Feedback</h1>
      <FeedbackForm onCreated={() => setRefresh(r => r + 1)} />
      <FeedbackList refresh={refresh} />
    </div>
  )
}
