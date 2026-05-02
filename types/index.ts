export type TaskStatus = 'todo' | 'in_progress' | 'done'

export interface Task {
  id: number
  title: string
  description: string
  status: TaskStatus
  created_at: string
  updated_at: string
}

export interface TaskCreate {
  title: string
  description: string
  status?: TaskStatus
}

export interface Feedback {
  id: number
  task_id: number | null
  content: string
  rating: number
  created_at: string
}

export interface FeedbackCreate {
  task_id?: number | null
  content: string
  rating: number
}
