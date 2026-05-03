import Link from 'next/link'
import { ArrowRight, FolderKanban, Target, Zap } from 'lucide-react'

const HIGHLIGHTS = [
  { icon: Target, label: 'Tie tasks to KPIs', desc: 'Every weekly goal maps to a metric.' },
  { icon: Zap, label: 'AI-drafted plans', desc: 'Prompt → 8 prioritized tasks in seconds.' },
  { icon: FolderKanban, label: 'Per-project sprints', desc: 'Run multiple workstreams in parallel.' },
]

export default function HomePage() {
  return (
    <div className="px-10 py-12 max-w-5xl mx-auto">
      <div className="mb-12">
        <div className="text-xs font-mono text-brand-600 mb-3 tracking-wider uppercase">v0.2 · sprint planner</div>
        <h1 className="text-4xl font-semibold tracking-tight text-neutral-900 mb-3">
          Plan the week. Track the outcome.
        </h1>
        <p className="text-neutral-500 text-base max-w-xl">
          Helmio turns a one-line goal into a prioritized weekly plan, assigned to your team and tied to KPIs.
        </p>
      </div>

      <Link
        href="/projects"
        className="group inline-flex items-center gap-2 bg-neutral-900 hover:bg-neutral-800 text-white text-sm font-medium px-4 py-2.5 rounded-lg shadow-soft-md transition-colors"
      >
        Open Projects
        <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-16">
        {HIGHLIGHTS.map(({ icon: Icon, label, desc }) => (
          <div
            key={label}
            className="bg-white border border-neutral-200/70 rounded-xl p-5 shadow-soft hover:shadow-soft-md transition-shadow"
          >
            <Icon className="size-5 text-brand-600 mb-3" />
            <div className="font-medium text-sm mb-1">{label}</div>
            <div className="text-xs text-neutral-500 leading-relaxed">{desc}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
