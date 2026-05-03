'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutGrid, FolderKanban, MessageSquare, CheckSquare, Sparkles } from 'lucide-react'
import { cn } from '@/lib/cn'

const NAV = [
  { href: '/', label: 'Overview', icon: LayoutGrid },
  { href: '/projects', label: 'Projects', icon: FolderKanban, primary: true },
  { href: '/tasks', label: 'Tasks', icon: CheckSquare },
  { href: '/feedback', label: 'Feedback', icon: MessageSquare },
]

export default function Sidebar() {
  const pathname = usePathname()
  return (
    <aside className="w-60 shrink-0 border-r border-neutral-200/70 bg-white/70 backdrop-blur sticky top-0 h-screen flex flex-col">
      <div className="px-5 pt-6 pb-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="size-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-soft">
            <Sparkles className="size-4 text-white" />
          </div>
          <div>
            <div className="font-semibold tracking-tight text-[15px]">Helmio</div>
            <div className="text-[11px] text-neutral-500 -mt-0.5">Sprint Planner</div>
          </div>
        </Link>
      </div>

      <nav className="px-3 flex-1">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 px-2 mb-1.5">
          Workspace
        </div>
        {NAV.map(({ href, label, icon: Icon, primary }) => {
          const active = href === '/' ? pathname === '/' : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'group flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-[13px] font-medium transition-colors mb-0.5',
                active
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
              )}
            >
              <Icon className={cn('size-4 shrink-0', active ? 'text-brand-600' : 'text-neutral-400 group-hover:text-neutral-600')} />
              <span>{label}</span>
              {primary && !active && (
                <span className="ml-auto text-[9px] uppercase tracking-wider text-brand-600 font-semibold">new</span>
              )}
            </Link>
          )
        })}
      </nav>

      <div className="px-3 pb-4 pt-2 border-t border-neutral-200/60 mx-3 mt-2">
        <div className="flex items-center gap-2.5 px-2 py-2">
          <div className="size-7 rounded-full bg-neutral-200 flex items-center justify-center text-[11px] font-semibold text-neutral-600">L</div>
          <div className="min-w-0">
            <div className="text-[12px] font-medium truncate">lekhaj</div>
            <div className="text-[10px] text-neutral-500">Workspace owner</div>
          </div>
        </div>
      </div>
    </aside>
  )
}
