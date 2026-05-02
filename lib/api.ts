import type { Task, TaskCreate, Feedback, FeedbackCreate } from '@/types'

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  })
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
  return res.json() as Promise<T>
}

export const api = {
  tasks: {
    list: () => req<Task[]>('/tasks'),
    get: (id: number) => req<Task>(`/tasks/${id}`),
    create: (body: TaskCreate) =>
      req<Task>('/tasks', { method: 'POST', body: JSON.stringify(body) }),
    update: (id: number, body: Partial<TaskCreate>) =>
      req<Task>(`/tasks/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
    delete: (id: number) => req<void>(`/tasks/${id}`, { method: 'DELETE' }),
  },
  feedback: {
    list: () => req<Feedback[]>('/feedback'),
    listByTask: (taskId: number) => req<Feedback[]>(`/feedback?task_id=${taskId}`),
    create: (body: FeedbackCreate) =>
      req<Feedback>('/feedback', { method: 'POST', body: JSON.stringify(body) }),
    delete: (id: number) => req<void>(`/feedback/${id}`, { method: 'DELETE' }),
  },
}
