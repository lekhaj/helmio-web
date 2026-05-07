import type {
  Task, TaskCreate, Feedback, FeedbackCreate,
  Project, ProjectCreate, Developer, WeeklyPlan, WeeklyPlanGenerate, PlanTask,
  ClarifyRequest, ClarifyResponse,
} from '@/types'

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store',
    ...init,
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`${res.status} ${res.statusText} — ${text}`)
  }
  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

export const api = {
  tasks: {
    list: () => req<Task[]>('/tasks'),
    get: (id: number) => req<Task>(`/tasks/${id}`),
    create: (body: TaskCreate) => req<Task>('/tasks', { method: 'POST', body: JSON.stringify(body) }),
    update: (id: number, body: Partial<TaskCreate>) => req<Task>(`/tasks/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
    delete: (id: number) => req<void>(`/tasks/${id}`, { method: 'DELETE' }),
  },
  feedback: {
    list: () => req<Feedback[]>('/feedback'),
    listByTask: (taskId: number) => req<Feedback[]>(`/feedback?task_id=${taskId}`),
    create: (body: FeedbackCreate) => req<Feedback>('/feedback', { method: 'POST', body: JSON.stringify(body) }),
    delete: (id: number) => req<void>(`/feedback/${id}`, { method: 'DELETE' }),
  },
  projects: {
    list: () => req<Project[]>('/projects'),
    get: (id: number) => req<Project>(`/projects/${id}`),
    create: (body: ProjectCreate) => req<Project>('/projects', { method: 'POST', body: JSON.stringify(body) }),
    update: (id: number, body: Partial<ProjectCreate>) => req<Project>(`/projects/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
    delete: (id: number) => req<void>(`/projects/${id}`, { method: 'DELETE' }),
    listPlans: (id: number) => req<WeeklyPlan[]>(`/projects/${id}/weekly-plans`),
    createPlan: (id: number, weekStart: string) =>
      req<WeeklyPlan>(`/projects/${id}/weekly-plans`, {
        method: 'POST',
        body: JSON.stringify({ week_start_date: weekStart }),
      }),
  },
  developers: {
    list: () => req<Developer[]>('/developers'),
    create: (body: { name: string; email?: string; role?: string }) =>
      req<Developer>('/developers', { method: 'POST', body: JSON.stringify(body) }),
    delete: (id: number) => req<void>(`/developers/${id}`, { method: 'DELETE' }),
  },
  plans: {
    get: (id: number) => req<WeeklyPlan>(`/weekly-plans/${id}`),
    update: (id: number, body: Partial<{ goal: string; context: string; prompt: string; time_available_hours: number; blockers: string[]; focus_areas: string[] }>) =>
      req<WeeklyPlan>(`/weekly-plans/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
    generate: (id: number, body: WeeklyPlanGenerate) =>
      req<WeeklyPlan>(`/weekly-plans/${id}/generate`, { method: 'POST', body: JSON.stringify(body) }),
  },
  planTasks: {
    create: (planId: number, body: { title: string; effort_hours?: number; day_index?: number | null; priority?: string; is_handoff?: boolean }) =>
      req<PlanTask>(`/weekly-plans/${planId}/tasks`, { method: 'POST', body: JSON.stringify(body) }),
    update: (id: number, body: Partial<PlanTask>) =>
      req<PlanTask>(`/plan-tasks/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
    delete: (id: number) => req<void>(`/plan-tasks/${id}`, { method: 'DELETE' }),
  },
  clarify: (body: ClarifyRequest) =>
    req<ClarifyResponse>('/clarify', { method: 'POST', body: JSON.stringify(body) }),
}
