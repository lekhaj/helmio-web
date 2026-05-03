import Link from 'next/link'
import { Calendar, ListTodo, Target } from 'lucide-react'
import type { Project } from '@/types'

const COLOR_DOT: Record<string, string> = {
  violet: 'bg-violet-500',
  blue: 'bg-blue-500',
  emerald: 'bg-emerald-500',
  amber: 'bg-amber-500',
  rose: 'bg-rose-500',
}

function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime()
  const days = Math.floor(diffMs / 86_400_000)
  if (days === 0) return 'today'
  if (days === 1) return 'yesterday'
  if (days < 7) return `${days}d ago`
  if (days < 30) return `${Math.floor(days / 7)}w ago`
  return `${Math.floor(days / 30)}mo ago`
}

export function ProjectCard({ project }: { project: Project }) {
  const dot = COLOR_DOT[project.color] ?? COLOR_DOT.violet
  return (
    <Link
      href={`/projects/${project.id}`}
      className="group block bg-white border border-neutral-200/70 rounded-xl p-5 hover:border-neutral-300 hover:shadow-soft-md transition-all hover:-translate-y-px"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <div className={`size-2 rounded-full ${dot} shrink-0`} />
          <h3 className="font-semibold text-[15px] text-neutral-900 truncate group-hover:text-brand-700 transition-colors">
            {project.name}
          </h3>
        </div>
        <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-medium font-mono">
          {project.status}
        </span>
      </div>

      <p className="text-[13px] text-neutral-500 line-clamp-2 mb-5 min-h-[36px] leading-relaxed">
        {project.description || <span className="italic text-neutral-300">No description</span>}
      </p>

      {project.kpi_primary && (
        <div className="flex items-start gap-1.5 mb-4 text-[12px] text-neutral-600">
          <Target className="size-3.5 text-brand-500 mt-0.5 shrink-0" />
          <span className="line-clamp-1">{project.kpi_primary}</span>
        </div>
      )}

      <div className="flex items-center gap-4 pt-3 border-t border-neutral-100 text-[11px] text-neutral-500">
        <div className="flex items-center gap-1">
          <Calendar className="size-3" />
          <span>{project.weekly_plan_count} plan{project.weekly_plan_count === 1 ? '' : 's'}</span>
        </div>
        <div className="flex items-center gap-1">
          <ListTodo className="size-3" />
          <span>{project.active_task_count} active</span>
        </div>
        <div className="ml-auto text-neutral-400">{relativeTime(project.updated_at)}</div>
      </div>
    </Link>
  )
}
