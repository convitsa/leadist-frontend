import { jobDisplayTitle } from '../lib/buildIcp'
import type { Job, JobStatus } from '../types'

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins} min ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`
  const days = Math.floor(hours / 24)
  return `${days} day${days > 1 ? 's' : ''} ago`
}

const statusStyles: Record<JobStatus, string> = {
  pending: 'bg-[#444] text-text-secondary',
  running: 'bg-brand/20 text-brand',
  completed: 'bg-green-900/40 text-green-400',
  failed: 'bg-red-900/40 text-red-400',
  cancelled: 'bg-[#444] text-text-secondary',
}

function StatusBadge({ status }: { status: JobStatus }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm text-xs font-medium ${statusStyles[status]}`}>
      {status === 'running' && (
        <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
      )}
      {status}
    </span>
  )
}

interface JobCardProps {
  job: Job
  selected: boolean
  onClick: () => void
}

export default function JobCard({ job, selected, onClick }: JobCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left p-4 border border-border rounded-sm transition-colors hover:bg-[#2a2a2a] ${
        selected ? 'border-l-2 border-l-brand bg-[#2a2a2a]' : 'border-l-2 border-l-transparent'
      }`}
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <StatusBadge status={job.status} />
        <span className="text-xs text-text-secondary">{relativeTime(job.created_at)}</span>
      </div>
      <p className="text-sm font-medium text-text-primary">{jobDisplayTitle(job.icp)}</p>
      <p className="text-xs text-text-secondary mt-0.5">
        {job.icp.company_size} · goal {job.icp.target_leads} leads
      </p>
      <p className="text-xs text-text-secondary mt-2">{job.leads_added} leads found</p>
    </button>
  )
}
