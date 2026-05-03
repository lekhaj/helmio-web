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
export type ProjectStage = 'idea' | 'mvp' | 'early_users' | 'growth' | 'scaling'
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
  vision: string
  target_user: string
  stage: ProjectStage
  constraints: string[]
  what_exists: string[]
  problems: string[]
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
  vision?: string
  target_user?: string
  stage?: ProjectStage
  constraints?: string[]
  what_exists?: string[]
  problems?: string[]
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
  day_index: number | null
  expected_outcome: string
  depends_on: string[]
  is_handoff: boolean
  created_at: string
  updated_at: string
}

export interface WeeklyMetric {
  id: number
  name: string
  target: string
  linked_task_titles: string[]
  actual: string | null
}

export interface WeeklyRisk {
  id: number
  risk: string
  mitigation: string
}

export interface KeyGap {
  gap: string
  impact: 'high' | 'medium' | 'low'
  reason: string
}

export interface WeeklyPlan {
  id: number
  project_id: number
  week_start_date: string
  goal: string
  context: string
  prompt: string
  time_available_hours: number
  blockers: string[]
  focus_areas: string[]
  analysis_summary: string
  key_gaps: KeyGap[]
  status: PlanStatus
  created_at: string
  updated_at: string
  plan_tasks: PlanTask[]
  metrics: WeeklyMetric[]
  risks: WeeklyRisk[]
}

export interface WeeklyPlanGenerate {
  prompt?: string
  goal?: string
  context?: string
  time_available_hours?: number
  blockers?: string[]
  focus_areas?: string[]
}

// --- clarifier ---
export type ClarifyKind = 'project_intake' | 'weekly_intake'

export interface ClarifyOption {
  label: string
  value: string
}

export interface ClarifyQuestion {
  field: string
  question: string
  multi_select: boolean
  options: ClarifyOption[]
  allow_custom: boolean
}

export interface ClarifyResponse {
  summary: string
  questions: ClarifyQuestion[]
}

export interface ClarifyRequest {
  kind: ClarifyKind
  user_text: string
  known_fields?: Record<string, unknown>
  project_id?: number
}
