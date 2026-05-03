'use client'
import { Target, AlertTriangle, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/cn'
import type { WeeklyPlan } from '@/types'

interface Props {
  plan: WeeklyPlan
}

const IMPACT_COLOR: Record<string, string> = {
  high: 'bg-rose-50 text-rose-700 border-rose-200',
  medium: 'bg-amber-50 text-amber-700 border-amber-200',
  low: 'bg-neutral-50 text-neutral-600 border-neutral-200',
}

export function InsightsPanel({ plan }: Props) {
  return (
    <aside className="flex flex-col gap-4 h-full overflow-y-auto scrollbar-subtle">
      {plan.analysis_summary && (
        <Card>
          <CardHeader icon={<TrendingUp className="size-3.5 text-brand-500" />} title="Analysis" />
          <p className="text-[12px] text-neutral-700 leading-relaxed">{plan.analysis_summary}</p>

          {plan.key_gaps.length > 0 && (
            <div className="mt-3 flex flex-col gap-1.5">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">Key gaps</p>
              {plan.key_gaps.map((g, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className={cn('text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded border shrink-0 mt-0.5', IMPACT_COLOR[g.impact] || IMPACT_COLOR.medium)}>
                    {g.impact}
                  </span>
                  <div>
                    <p className="text-[12px] text-neutral-800">{g.gap}</p>
                    {g.reason && <p className="text-[10.5px] text-neutral-500 mt-0.5 leading-snug">{g.reason}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      <Card>
        <CardHeader icon={<Target className="size-3.5 text-emerald-500" />} title="Success metrics" />
        {plan.metrics.length === 0 ? (
          <p className="text-[11px] text-neutral-400 italic">No metrics yet — generate a plan.</p>
        ) : (
          <div className="flex flex-col gap-2.5">
            {plan.metrics.map(m => (
              <div key={m.id} className="border border-neutral-100 rounded-md p-2.5 bg-emerald-50/30">
                <div className="flex items-baseline justify-between gap-2 mb-0.5">
                  <p className="text-[12px] font-medium text-neutral-900 flex-1">{m.name}</p>
                  <span className="text-[11px] font-mono text-emerald-700 font-semibold whitespace-nowrap">{m.target}</span>
                </div>
                {m.linked_task_titles.length > 0 && (
                  <p className="text-[10px] text-neutral-500 mt-1 leading-snug">
                    via: {m.linked_task_titles.slice(0, 2).join(' · ')}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <CardHeader icon={<AlertTriangle className="size-3.5 text-amber-500" />} title="Risks & mitigation" />
        {plan.risks.length === 0 ? (
          <p className="text-[11px] text-neutral-400 italic">No risks flagged.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {plan.risks.map(r => (
              <div key={r.id} className="border-l-2 border-amber-300 pl-2.5 py-0.5">
                <p className="text-[12px] text-neutral-800">{r.risk}</p>
                {r.mitigation && (
                  <p className="text-[10.5px] text-neutral-500 mt-0.5 leading-snug">→ {r.mitigation}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </aside>
  )
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white border border-neutral-200/70 rounded-xl shadow-soft p-4 flex-shrink-0">
      {children}
    </div>
  )
}

function CardHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <h3 className="font-semibold text-[13px] text-neutral-900 flex items-center gap-1.5 mb-2.5">
      {icon} {title}
    </h3>
  )
}
