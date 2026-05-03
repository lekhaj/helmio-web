'use client'
import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Input, Textarea, Label } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { api } from '@/lib/api'
import { cn } from '@/lib/cn'

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

export function NewProjectDialog({ open, onClose, onCreated }: Props) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [kpiPrimary, setKpiPrimary] = useState('')
  const [color, setColor] = useState('violet')
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  function reset() {
    setName(''); setDescription(''); setKpiPrimary(''); setColor('violet'); setErr(null)
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true); setErr(null)
    try {
      await api.projects.create({
        name: name.trim(),
        description: description.trim(),
        kpi_primary: kpiPrimary.trim() || undefined,
        color,
      })
      reset()
      onCreated()
      onClose()
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : 'Failed to create')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="New project">
      <form onSubmit={submit} className="flex flex-col gap-4">
        <div>
          <Label htmlFor="proj-name">Name</Label>
          <Input
            id="proj-name"
            placeholder="e.g. Mobile App v2"
            value={name}
            onChange={e => setName(e.target.value)}
            autoFocus
            required
          />
        </div>

        <div>
          <Label htmlFor="proj-desc" hint="optional">Description</Label>
          <Textarea
            id="proj-desc"
            placeholder="One-liner about what this project is"
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={2}
          />
        </div>

        <div>
          <Label htmlFor="proj-kpi" hint="optional">Primary KPI</Label>
          <Input
            id="proj-kpi"
            placeholder="e.g. Weekly active users"
            value={kpiPrimary}
            onChange={e => setKpiPrimary(e.target.value)}
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
                  color === c.name
                    ? 'ring-2 ring-offset-2 ring-neutral-900 scale-110'
                    : 'opacity-60 hover:opacity-100'
                )}
                aria-label={c.name}
              />
            ))}
          </div>
        </div>

        {err && <p className="text-xs text-rose-500">{err}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Creating…' : 'Create project'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
