'use client'
import { useState } from 'react'
import { Sparkles, Loader2, Edit3 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { Clarifier } from '@/components/clarifier/Clarifier'
import { cn } from '@/lib/cn'
import type { Project, WeeklyPlan } from '@/types'

interface Props {
  project: Project
  plan: WeeklyPlan
  generating: boolean
  onGenerate: (payload: {
    goal: string
    context: string
    prompt: string
    time_available_hours: number
    blockers: string[]
    focus_areas: string[]
  }) => void
}

export function PlanInputPanel({ project, plan, generating, onGenerate }: Props) {
  const [editing, setEditing] = useState(plan.plan_tasks.length === 0)
  const [goal, setGoal] = useState(plan.goal)
  const [contextText, setContextText] = useState(plan.context)
  const [hours, setHours] = useState(plan.time_available_hours || 35)
  const [blockers, setBlockers] = useState<string[]>(plan.blockers || [])
  const [focusAreas, setFocusAreas] = useState<string[]>(plan.focus_areas || [])

  function handleClarifierComplete({ user_text, answers }: { user_text: string; answers: Record<string, string[]>; summary: string }) {
    setGoal(user_text.split('\n')[0].slice(0, 300))
    setContextText(user_text)
    setFocusAreas(answers.focus_areas || [])
    setBlockers(answers.blockers || [])
    if (answers.time_available_hours?.[0]) {
      const n = parseInt(answers.time_available_hours[0], 10)
      if (!isNaN(n)) setHours(n)
    }
    setEditing(false)
  }

  function generate() {
    onGenerate({
      goal: goal.trim(),
      context: contextText.trim(),
      prompt: contextText.trim(),
      time_available_hours: hours,
      blockers,
      focus_areas: focusAreas,
    })
  }

  return (
    <div className="bg-white border border-neutral-200/70 rounded-xl shadow-soft flex flex-col h-full">
      <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-[14px] text-neutral-900">This week</h2>
          <p className="text-[11px] text-neutral-500 mt-0.5">Describe → answer chips → generate plan.</p>
        </div>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="text-[11px] text-neutral-500 hover:text-brand-700 inline-flex items-center gap-1"
          >
            <Edit3 className="size-3" /> Edit
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-subtle px-5 py-4">
        <ProjectSnapshot project={project} />

        <AnimatePresence mode="wait" initial={false}>
          {editing ? (
            <motion.div key="edit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Clarifier
                kind="weekly_intake"
                projectId={project.id}
                initialText={plan.context}
                promptLabel="What's this week's goal? Mention status + blockers."
                promptPlaceholder="Example:&#10;Generate 6-8 stylized 3D models of forest creatures, optimize them, rig with AutoRig Pro, and share to artist for review. Pipeline currently inconsistent across runs."
                primaryLabel="Save & ready to generate"
                onComplete={handleClarifierComplete}
              />
            </motion.div>
          ) : (
            <motion.div key="summary" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-3 mt-4">
              <Field label="Goal">
                <p className="text-[12.5px] text-neutral-800 leading-relaxed">{goal || '—'}</p>
              </Field>

              {focusAreas.length > 0 && <ChipList label="Focus areas" values={focusAreas} variant="brand" />}
              {blockers.length > 0 && <ChipList label="Blockers" values={blockers} variant="rose" />}

              <Field label="Hours available">
                <input
                  type="number"
                  min={1} max={80}
                  value={hours}
                  onChange={e => setHours(parseInt(e.target.value) || 35)}
                  className="text-[12.5px] font-mono w-16 border border-neutral-200 rounded px-2 py-0.5 focus:outline-none focus:border-brand-400"
                />
                <span className="text-[11px] text-neutral-500 ml-1">h / week</span>
              </Field>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="p-4 border-t border-neutral-100 bg-neutral-50/50 rounded-b-xl flex flex-col gap-2">
        <Button
          variant="secondary"
          className="w-full"
          size="lg"
          onClick={generate}
          disabled={editing || generating || !goal.trim()}
        >
          {generating ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
          {generating ? 'Generating plan…' : 'Generate weekly plan'}
        </Button>
        <p className="text-[10px] text-neutral-400 text-center font-mono">
          bedrock · sonnet 4.6 · flex tier
        </p>
      </div>
    </div>
  )
}

function ProjectSnapshot({ project }: { project: Project }) {
  return (
    <div className="bg-neutral-50 border border-neutral-100 rounded-lg p-3 mb-4">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 mb-1">Project context</p>
      {project.vision && <p className="text-[12px] text-neutral-700 mb-2 leading-relaxed">{project.vision}</p>}
      <div className="flex flex-wrap gap-1">
        <span className="text-[10px] bg-brand-100 text-brand-700 px-1.5 py-0.5 rounded font-medium">{project.stage}</span>
        {project.what_exists.slice(0, 3).map(w => (
          <span key={w} className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded">{w}</span>
        ))}
        {project.problems.slice(0, 2).map(p => (
          <span key={p} className="text-[10px] bg-rose-50 text-rose-700 px-1.5 py-0.5 rounded">{p}</span>
        ))}
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 mb-1">{label}</p>
      <div className="flex items-center">{children}</div>
    </div>
  )
}

function ChipList({ label, values, variant }: { label: string; values: string[]; variant: 'brand' | 'rose' }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 mb-1">{label}</p>
      <div className="flex flex-wrap gap-1">
        {values.map(v => (
          <span
            key={v}
            className={cn(
              'text-[11px] px-2 py-0.5 rounded-full',
              variant === 'brand' ? 'bg-brand-50 text-brand-700' : 'bg-rose-50 text-rose-700',
            )}
          >
            {v}
          </span>
        ))}
      </div>
    </div>
  )
}
