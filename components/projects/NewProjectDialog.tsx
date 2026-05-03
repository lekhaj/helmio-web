'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Modal } from '@/components/ui/Modal'
import { Input, Label } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { api } from '@/lib/api'
import { cn } from '@/lib/cn'
import { Clarifier } from '@/components/clarifier/Clarifier'
import type { ProjectStage } from '@/types'

const COLORS = [
  { name: 'violet', cls: 'bg-violet-500' },
  { name: 'blue', cls: 'bg-blue-500' },
  { name: 'emerald', cls: 'bg-emerald-500' },
  { name: 'amber', cls: 'bg-amber-500' },
  { name: 'rose', cls: 'bg-rose-500' },
]

interface Props {
  open: boolean
  onClose: () => void
  onCreated: () => void
}

type Step = 'name' | 'clarify' | 'review'

export function NewProjectDialog({ open, onClose, onCreated }: Props) {
  const [step, setStep] = useState<Step>('name')
  const [name, setName] = useState('')
  const [color, setColor] = useState('violet')
  const [userText, setUserText] = useState('')
  const [answers, setAnswers] = useState<Record<string, string[]>>({})
  const [summary, setSummary] = useState('')
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  function reset() {
    setStep('name'); setName(''); setColor('violet'); setUserText('')
    setAnswers({}); setSummary(''); setErr(null)
  }

  function handleClose() {
    reset(); onClose()
  }

  async function submit() {
    if (!name.trim()) return
    setLoading(true); setErr(null)
    try {
      const stage = (answers.stage?.[0] || 'mvp') as ProjectStage
      await api.projects.create({
        name: name.trim(),
        description: userText.slice(0, 600),
        vision: summary || userText.slice(0, 200),
        target_user: answers.target_user?.[0] || '',
        stage,
        constraints: answers.constraints || [],
        what_exists: answers.what_exists || [],
        problems: answers.problems || [],
        color,
      })
      onCreated(); handleClose()
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : 'Failed to create')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onClose={handleClose} title="New project">
      <StepIndicator step={step} />

      <AnimatePresence mode="wait" initial={false}>
        {step === 'name' && (
          <motion.div
            key="name"
            initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.18 }}
            className="flex flex-col gap-4"
          >
            <div>
              <Label htmlFor="proj-name">Project name</Label>
              <Input
                id="proj-name"
                placeholder="e.g. Sparks 3D Pipeline"
                value={name}
                onChange={e => setName(e.target.value)}
                autoFocus
                required
              />
            </div>
            <div>
              <Label>Color</Label>
              <div className="flex gap-2">
                {COLORS.map(c => (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => setColor(c.name)}
                    className={cn(
                      'size-7 rounded-full transition-all',
                      c.cls,
                      color === c.name ? 'ring-2 ring-offset-2 ring-neutral-900 scale-110' : 'opacity-60 hover:opacity-100',
                    )}
                    aria-label={c.name}
                  />
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" onClick={handleClose}>Cancel</Button>
              <Button onClick={() => setStep('clarify')} disabled={!name.trim()}>
                Next: describe project
              </Button>
            </div>
          </motion.div>
        )}

        {step === 'clarify' && (
          <motion.div
            key="clarify"
            initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.18 }}
          >
            <Clarifier
              kind="project_intake"
              initialText={userText}
              promptLabel="What is this project? What's working, what's not?"
              promptPlaceholder="Example:&#10;A pipeline that converts text descriptions to optimized 3D game assets. FastAPI + Gradio, deployed on EC2 + GPU. We have FLUX for style, SD1.5 + ControlNet for posed images, TRELLIS for 3D. Stuck on consistent style across assets and rigging quality."
              primaryLabel="Next: review"
              onComplete={({ user_text, answers, summary }) => {
                setUserText(user_text); setAnswers(answers); setSummary(summary)
                setStep('review')
              }}
            />
            <div className="flex justify-start mt-2">
              <Button variant="ghost" onClick={() => setStep('name')}>← Back</Button>
            </div>
          </motion.div>
        )}

        {step === 'review' && (
          <motion.div
            key="review"
            initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.18 }}
            className="flex flex-col gap-3"
          >
            <ReviewSection title="Name" value={name} />
            {summary && <ReviewSection title="Vision" value={summary} />}
            {answers.stage?.[0] && <ReviewSection title="Stage" value={answers.stage[0]} />}
            {answers.target_user?.[0] && <ReviewSection title="Target user" value={answers.target_user[0]} />}
            {answers.what_exists?.length > 0 && <ReviewChips title="What exists" values={answers.what_exists} />}
            {answers.problems?.length > 0 && <ReviewChips title="Problems" values={answers.problems} />}
            {answers.constraints?.length > 0 && <ReviewChips title="Constraints" values={answers.constraints} />}

            {err && <p className="text-[11px] text-rose-500">{err}</p>}

            <div className="flex justify-between gap-2 pt-2">
              <Button variant="ghost" onClick={() => setStep('clarify')} disabled={loading}>← Back</Button>
              <Button onClick={submit} disabled={loading}>
                {loading ? 'Creating…' : 'Create project'}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Modal>
  )
}

function StepIndicator({ step }: { step: Step }) {
  const steps: Step[] = ['name', 'clarify', 'review']
  const idx = steps.indexOf(step)
  return (
    <div className="flex items-center gap-1.5 mb-5">
      {steps.map((s, i) => (
        <div
          key={s}
          className={cn(
            'h-1 rounded-full transition-all duration-300',
            i <= idx ? 'bg-brand-500 flex-[2]' : 'bg-neutral-200 flex-1',
          )}
        />
      ))}
    </div>
  )
}

function ReviewSection({ title, value }: { title: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 mb-0.5">{title}</p>
      <p className="text-[12.5px] text-neutral-800">{value}</p>
    </div>
  )
}

function ReviewChips({ title, values }: { title: string; values: string[] }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 mb-1">{title}</p>
      <div className="flex flex-wrap gap-1">
        {values.map(v => (
          <span key={v} className="text-[11px] bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded-full">{v}</span>
        ))}
      </div>
    </div>
  )
}
