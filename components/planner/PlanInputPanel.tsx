'use client'
import { useState } from 'react'
import { Sparkles, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input, Textarea, Label } from '@/components/ui/Input'
import { cn } from '@/lib/cn'
import type { Project } from '@/types'

interface Props {
  project: Project
  goal: string
  context: string
  prompt: string
  generating: boolean
  onGoalChange: (v: string) => void
  onContextChange: (v: string) => void
  onPromptChange: (v: string) => void
  onGenerate: () => void
}

function Section({
  title, defaultOpen = true, children,
}: { title: string; defaultOpen?: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-b border-neutral-100 last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-3 text-left hover:bg-neutral-50 transition-colors"
      >
        <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">{title}</span>
        <ChevronDown className={cn('size-3.5 text-neutral-400 transition-transform', open && 'rotate-180')} />
      </button>
      {open && <div className="px-5 pb-4 flex flex-col gap-3">{children}</div>}
    </div>
  )
}

export function PlanInputPanel({
  project, goal, context, prompt, generating,
  onGoalChange, onContextChange, onPromptChange, onGenerate,
}: Props) {
  const canGen = prompt.trim().length > 0 && !generating
  return (
    <div className="bg-white border border-neutral-200/70 rounded-xl shadow-soft flex flex-col h-full">
      <div className="px-5 py-4 border-b border-neutral-100">
        <h2 className="font-semibold text-[14px] text-neutral-900">Sprint Input</h2>
        <p className="text-[11px] text-neutral-500 mt-0.5">Describe the week, generate the plan.</p>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-subtle">
        <Section title="Project">
          <div>
            <Label>Name</Label>
            <Input value={project.name} disabled />
          </div>
          {project.kpi_primary && (
            <div>
              <Label>Primary KPI</Label>
              <Input value={project.kpi_primary} disabled />
            </div>
          )}
        </Section>

        <Section title="This week's goal">
          <Textarea
            placeholder="One clear outcome by Friday."
            value={goal}
            onChange={e => onGoalChange(e.target.value)}
            rows={2}
          />
        </Section>

        <Section title="Context" defaultOpen={false}>
          <Textarea
            placeholder="Blockers, constraints, recent decisions…"
            value={context}
            onChange={e => onContextChange(e.target.value)}
            rows={3}
          />
        </Section>

        <Section title="Research prompt">
          <Label hint="LLM prompt — Phase 2">Prompt</Label>
          <Textarea
            placeholder={`Example:\nWe're shipping the new onboarding flow. Generate a week of tasks covering API, frontend, QA, and analytics.`}
            value={prompt}
            onChange={e => onPromptChange(e.target.value)}
            rows={6}
            className="font-mono text-[12.5px] leading-relaxed"
          />
        </Section>
      </div>

      <div className="p-4 border-t border-neutral-100 bg-neutral-50/50 rounded-b-xl">
        <Button
          variant="secondary"
          className="w-full"
          size="lg"
          onClick={onGenerate}
          disabled={!canGen}
        >
          <Sparkles className="size-4" />
          {generating ? 'Generating plan…' : 'Generate Plan'}
        </Button>
        <p className="text-[10px] text-neutral-400 text-center mt-2 font-mono">
          bedrock · claude sonnet 4.6 · flex tier
        </p>
      </div>
    </div>
  )
}
