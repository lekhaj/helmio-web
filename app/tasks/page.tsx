'use client'
import { useState } from 'react'
import TaskForm from '@/components/TaskForm'
import TaskList from '@/components/TaskList'

export default function TasksPage() {
  const [refresh, setRefresh] = useState(0)
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
      <TaskForm onCreated={() => setRefresh(r => r + 1)} />
      <TaskList refresh={refresh} />
    </div>
  )
}
