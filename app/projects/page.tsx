'use client'
import { useEffect, useState } from 'react'
import { Plus, Search } from 'lucide-react'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { ProjectCard } from '@/components/projects/ProjectCard'
import { NewProjectDialog } from '@/components/projects/NewProjectDialog'
import type { Project } from '@/types'

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')

  async function refresh() {
    setLoading(true); setErr(null)
    try {
      setProjects(await api.projects.list())
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : 'Failed to load')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { refresh() }, [])

  const filtered = projects.filter(p =>
    !query.trim() || p.name.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <div className="px-10 py-10 max-w-6xl mx-auto">
      <div className="flex items-end justify-between gap-4 mb-8">
        <div>
          <div className="text-xs font-mono text-neutral-400 uppercase tracking-wider mb-1.5">Workspace</div>
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">Projects</h1>
          <p className="text-sm text-neutral-500 mt-1">
            {projects.length} {projects.length === 1 ? 'project' : 'projects'} in this workspace
          </p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="size-4" />
          New project
        </Button>
      </div>

      <div className="relative mb-6 max-w-sm">
        <Search className="size-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <Input
          placeholder="Search projects…"
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-44 rounded-xl skeleton" />
          ))}
        </div>
      )}

      {err && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-lg px-4 py-3">
          {err}
        </div>
      )}

      {!loading && !err && filtered.length === 0 && (
        <div className="bg-white border border-neutral-200/70 border-dashed rounded-xl p-12 text-center">
          <h3 className="font-medium text-neutral-900 mb-1">
            {projects.length === 0 ? 'No projects yet' : 'No projects match'}
          </h3>
          <p className="text-sm text-neutral-500 mb-5">
            {projects.length === 0
              ? 'Create your first project to start planning weekly sprints.'
              : `Nothing matches "${query}".`}
          </p>
          {projects.length === 0 && (
            <Button onClick={() => setOpen(true)}>
              <Plus className="size-4" />
              Create project
            </Button>
          )}
        </div>
      )}

      {!loading && !err && filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(p => <ProjectCard key={p.id} project={p} />)}
        </div>
      )}

      <NewProjectDialog open={open} onClose={() => setOpen(false)} onCreated={refresh} />
    </div>
  )
}
