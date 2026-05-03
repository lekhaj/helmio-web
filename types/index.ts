// --- legacy ---
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

// --- sprint planner ---
export type Priority = 'low' | 'medium' | 'high'
export type ProjectStatus = 'active' | 'archived'
export type PlanStatus = 'draft' | 'active' | 'completed'
export type PlanTaskStatus = 'todo' | 'in_progress' | 'done'

export interface Developer {
  id: number
  name: string
  email: string | null
  avatar_url: string | null
  role: string | null
  created_at: string
}

export interface Project {
  id: number
  name: string
  description: string
  kpi_primary: string | null
  kpi_secondary: string | null
  status: ProjectStatus
  color: string
  created_at: string
  updated_at: string
  weekly_plan_count: number
  active_task_count: number
}

export interface ProjectCreate {
  name: string
  description?: string
  kpi_primary?: string
  kpi_secondary?: string
  color?: string
}

export interface PlanTask {
  id: number
  weekly_plan_id: number
  title: string
  description: string
  assignee_id: number | null
  assignee: Developer | null
  effort_hours: number
  priority: Priority
  status: PlanTaskStatus
  order_index: number
  created_at: string
  updated_at: string
}

export interface WeeklyPlan {
  id: number
  project_id: number
  week_start_date: string
  goal: string
  context: string
  prompt: string
  status: PlanStatus
  created_at: string
  updated_at: string
  plan_tasks: PlanTask[]
}

export interface WeeklyPlanGenerate {
  prompt: string
  goal?: string
  context?: string
}
