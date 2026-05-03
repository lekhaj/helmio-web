'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Loader2 } from 'lucide-react'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Input'
import { ChipQuestion } from './ChipQuestion'
import type { ClarifyKind, ClarifyQuestion } from '@/types'

interface Props {
  kind: ClarifyKind
  projectId?: number
  initialText?: string
  onComplete: (data: { user_text: string; answers: Record<string, string[]>; summary: string }) => void
  primaryLabel?: string
  promptLabel?: string
  promptPlaceholder?: string
}

export function Clarifier({
  kind,
  projectId,
  initialText = '',
  onComplete,
  primaryLabel = 'Continue',
  promptLabel = 'Describe what you’re building',
  promptPlaceholder = 'Tell me what this is, what stage it’s in, and what’s working / not working…',
}: Props) {
  const [step, setStep] = useState<'intake' | 'questions'>('intake')
  const [userText, setUserText] = useState(initialText)
  const [questions, setQuestions] = useState<ClarifyQuestion[]>([])
  const [summary, setSummary] = useState('')
  const [answers, setAnswers] = useState<Record<string, string[]>>({})
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  async function fetchQuestions() {
    if (!userText.trim()) return
    setLoading(true); setErr(null)
    try {
      const res = await api.clarify({
        kind,
        user_text: userText.trim(),
        known_fields: {},
        project_id: projectId,
      })
      setQuestions(res.questions)
      setSummary(res.summary)
      const initAnswers: Record<string, string[]> = {}
      for (const q of res.questions) initAnswers[q.field] = []
      setAnswers(initAnswers)
      setStep('questions')
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : 'Failed to clarify')
    } finally {
      setLoading(false)
    }
  }

  function finish() {
    onComplete({ user_text: userText.trim(), answers, summary })
  }

  return (
    <div className="flex flex-col gap-4">
      <AnimatePresence mode="wait" initial={false}>
        {step === 'intake' && (
          <motion.div
            key="intake"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18 }}
            className="flex flex-col gap-3"
          >
            <div>
              <p className="text-[12px] font-semibold text-neutral-800">{promptLabel}</p>
              <p className="text-[11px] text-neutral-500 mt-0.5">
                Free-form. Claude will read it and ask 2-4 quick chip questions tailored to what you wrote.
              </p>
            </div>
            <Textarea
              value={userText}
              onChange={e => setUserText(e.target.value)}
              placeholder={promptPlaceholder}
              rows={6}
              className="text-[13px] leading-relaxed"
              autoFocus
            />
            {err && <p className="text-[11px] text-rose-500">{err}</p>}
            <Button onClick={fetchQuestions} disabled={!userText.trim() || loading}>
              {loading ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
              {loading ? 'Reading…' : 'Ask clarifying questions'}
            </Button>
          </motion.div>
        )}

        {step === 'questions' && (
          <motion.div
            key="questions"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18 }}
            className="flex flex-col gap-4"
          >
            {summary && (
              <div className="bg-brand-50 border border-brand-100 rounded-lg px-3 py-2 text-[12px] text-brand-900 leading-relaxed">
                <span className="font-semibold mr-1">Got it.</span>
                {summary}
              </div>
            )}

            <div className="flex flex-col gap-3.5">
              {questions.map((q, i) => (
                <motion.div
                  key={q.field}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.18 }}
                >
                  <ChipQuestion
                    question={q}
                    values={answers[q.field] || []}
                    onChange={vals => setAnswers(a => ({ ...a, [q.field]: vals }))}
                  />
                </motion.div>
              ))}
            </div>

            <div className="flex gap-2 justify-end pt-1">
              <Button variant="ghost" onClick={() => setStep('intake')} disabled={loading}>
                Back
              </Button>
              <Button onClick={finish} disabled={loading}>
                {primaryLabel}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
