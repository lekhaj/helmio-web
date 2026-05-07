'use client'
import { useEffect, useState, use } from 'react'
import Link from 'next/link'
import { ChevronLeft, Calendar } from 'lucide-react'
import { api } from '@/lib/api'
import { PlanInputPanel } from '@/components/planner/PlanInputPanel'
import { DailyTaskBoard } from '@/components/planner/DailyTaskBoard'
import { InsightsPanel } from '@/components/planner/InsightsPanel'
import { TeamPopover } from '@/components/planner/TeamPopover'
import type { Project, WeeklyPlan, Developer } from '@/types'

function mondayOf(d: Date): string {
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  const m = new Date(d)
  m.setDate(d.getDate() + diff)
  return m.toISOString().slice(0, 10)
}

function formatWeek(iso: string): string {
  const d = new Date(iso + 'T00:00:00')
  const end = new Date(d); end.setDate(d.getDate() + 4)
  const fmt = (x: Date) => x.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  return `${fmt(d)} – ${fmt(end)}`
}

export default function ProjectPlannerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const projectId = parseInt(id, 10)

  const [project, setProject] = useState<Project | null>(null)
  const [plan, setPlan] = useState<WeeklyPlan | null>(null)
  const [developers, setDevelopers] = useState<Developer[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  async function loadOrCreatePlan(p: Project): Promise<WeeklyPlan> {
    const existing = await api.projects.listPlans(p.id)
    const week = mondayOf(new Date())
    const found = existing.find(x => x.week_start_date === week)
    if (found) return found
    return await api.projects.createPlan(p.id, week)
  }

  useEffect(() => {
    (async () => {
      try {
        setLoading(true); setErr(null)
        const [proj, devs] = await Promise.all([
          api.projects.get(projectId),
          api.developers.list(),
        ])
        setProject(proj); setDevelopers(devs)
        const wk = await loadOrCreatePlan(proj)
        setPlan(wk)
      } catch (e: unknown) {
        setErr(e instanceof Error ? e.message : 'Failed to load')
      } finally {
        setLoading(false)
      }
    })()
  }, [projectId])

  async function refreshPlan() {
    if (!plan) return
    setPlan(await api.plans.get(plan.id))
  }

  async function handleGenerate(payload: {
    goal: string; context: string; prompt: string;
    time_available_hours: number; blockers: string[]; focus_areas: string[]
  }) {
    if (!plan) return
    setGenerating(true); setErr(null)
    try {
      const updated = await api.plans.generate(plan.id, payload)
      setPlan(updated)
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : 'Generate failed')
    } finally {
      setGenerating(false)
    }
  }

  if (loading) {
    return (
      <div className="px-8 py-10">
        <div className="h-5 w-40 skeleton rounded mb-4" />
        <div className="h-7 w-72 skeleton rounded mb-2" />
        <div className="h-4 w-48 skeleton rounded mb-8" />
        <div className="grid grid-cols-12 gap-5">
          <div className="col-span-3 h-[600px] skeleton rounded-xl" />
          <div className="col-span-6 h-[600px] skeleton rounded-xl" />
          <div className="col-span-3 h-[600px] skeleton rounded-xl" />
        </div>
      </div>
    )
  }

  if (err || !project || !plan) {
    return (
      <div className="px-8 py-10 max-w-2xl">
        <Link href="/projects" className="text-sm text-neutral-500 hover:text-neutral-900 inline-flex items-center gap-1 mb-4">
          <ChevronLeft className="size-4" /> Projects
        </Link>
        <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-lg px-4 py-3">
          {err ?? 'Project not found'}
        </div>
      </div>
    )
  }

  return (
    <div className="px-8 py-8 h-screen flex flex-col">
      <header className="mb-6 shrink-0">
        <Link href="/projects" className="text-xs text-neutral-500 hover:text-neutral-900 inline-flex items-center gap-1 mb-2 font-medium">
          <ChevronLeft className="size-3.5" /> Projects
        </Link>
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-neutral-900">{project.name}</h1>
            {project.vision && (
              <p className="text-sm text-neutral-500 mt-0.5 max-w-2xl">{project.vision}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-neutral-500 bg-white border border-neutral-200/70 rounded-full px-3 py-1.5">
              <Calendar className="size-3.5 text-neutral-400" />
              <span className="font-medium text-neutral-700">Week of {formatWeek(plan.week_start_date)}</span>
            </div>
            <TeamPopover
              developers={developers}
              onChange={setDevelopers}
            />
          </div>
        </div>
      </header>

      <div className="grid grid-cols-12 gap-5 flex-1 min-h-0">
        <div className="col-span-12 lg:col-span-3 min-h-0">
          <PlanInputPanel
            project={project}
            plan={plan}
            generating={generating}
            onGenerate={handleGenerate}
          />
        </div>
        <div className="col-span-12 lg:col-span-6 min-h-0">
          <DailyTaskBoard
            planId={plan.id}
            tasks={plan.plan_tasks}
            developers={developers}
            generating={generating}
            onChange={refreshPlan}
            totalAvailableHours={plan.time_available_hours}
          />
        </div>
        <div className="col-span-12 lg:col-span-3 min-h-0">
          <InsightsPanel plan={plan} />
        </div>
      </div>
    </div>
  )
}
