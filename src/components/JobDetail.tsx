import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'
import api, { outboundApi } from '../api/axios'
import type { Job, JobLogs, JobStatus, JobStatusSnapshot } from '../types'

const statusStyles: Record<JobStatus, string> = {
  pending: 'bg-[#444] text-text-secondary',
  running: 'bg-brand/20 text-brand',
  completed: 'bg-green-900/40 text-green-400',
  failed: 'bg-red-900/40 text-red-400',
  cancelled: 'bg-[#444] text-text-secondary',
}

interface JobDetailProps {
  jobId: string
  onDeleted?: () => void
}

export default function JobDetail({ jobId, onDeleted }: JobDetailProps) {
  const logsEndRef = useRef<HTMLDivElement>(null)
  const queryClient = useQueryClient()
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [actionError, setActionError] = useState('')

  const { data: job } = useQuery({
    queryKey: ['job', jobId],
    queryFn: async () => {
      const { data } = await api.get<Job>(`/jobs/${jobId}`)
      return data
    },
  })

  const { data: status } = useQuery({
    queryKey: ['job-status', jobId],
    queryFn: async () => {
      const { data } = await outboundApi.get<JobStatusSnapshot>(`/jobs/${jobId}/status`)
      return data
    },
    refetchInterval: (query) =>
      query.state.data?.status === 'running' ? 3000 : false,
  })

  const { data: logsData } = useQuery({
    queryKey: ['job-logs', jobId],
    queryFn: async () => {
      const { data } = await outboundApi.get<JobLogs>(`/jobs/${jobId}/logs`)
      return data
    },
    refetchInterval: status?.status === 'running' ? 3000 : false,
  })

  const logs = logsData?.logs ?? []

  const stopMutation = useMutation({
    mutationFn: async () => {
      await api.post(`/jobs/${jobId}/stop`)
    },
    onSuccess: () => {
      setActionError('')
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
      queryClient.invalidateQueries({ queryKey: ['job', jobId] })
      queryClient.invalidateQueries({ queryKey: ['job-status', jobId] })
      queryClient.invalidateQueries({ queryKey: ['job-logs', jobId] })
    },
    onError: () => setActionError('Could not stop this job'),
  })

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await api.delete(`/jobs/${jobId}`)
    },
    onSuccess: () => {
      setActionError('')
      setConfirmDelete(false)
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
      onDeleted?.()
    },
    onError: () => setActionError('Could not delete this job'),
  })

  const currentStatus = status?.status ?? job?.status
  const canStop = currentStatus === 'pending' || currentStatus === 'running'

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [logs])

  if (!status) {
    return (
      <div className="p-6 border border-border rounded-sm bg-surface animate-pulse h-64" />
    )
  }

  const targetLeads = job?.icp.target_leads ?? 20
  const progress = Math.min(100, (status.leads_added / targetLeads) * 100)

  return (
    <div className="p-6 border border-border rounded-sm bg-surface">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div className="flex flex-wrap items-center gap-4">
          <span className={`px-3 py-1 rounded-sm text-sm font-medium capitalize ${statusStyles[status.status]}`}>
            {status.status === 'running' && (
              <span className="inline-block w-2 h-2 rounded-full bg-brand animate-pulse mr-2" />
            )}
            {status.status}
          </span>
          <span className="text-text-primary font-medium">{status.leads_added} leads found</span>
          <span className="text-text-secondary text-sm">{status.iterations} iterations</span>
          <span className="text-text-secondary text-sm">
            Updated {new Date(status.updated_at).toLocaleString()}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {canStop && (
            <button
              type="button"
              onClick={() => stopMutation.mutate()}
              disabled={stopMutation.isPending}
              className="px-3 py-1.5 text-sm border border-brand text-brand rounded-sm hover:bg-brand/10 transition-colors disabled:opacity-50"
            >
              {stopMutation.isPending ? 'Stopping…' : 'Stop'}
            </button>
          )}
          {!confirmDelete ? (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="px-3 py-1.5 text-sm border border-border text-text-secondary rounded-sm hover:text-red-400 hover:border-red-400/50 transition-colors"
            >
              Delete
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs text-text-secondary">Sure?</span>
              <button
                type="button"
                onClick={() => deleteMutation.mutate()}
                disabled={deleteMutation.isPending}
                className="px-3 py-1.5 text-sm bg-red-900/40 text-red-400 border border-red-400/30 rounded-sm hover:bg-red-900/60 disabled:opacity-50"
              >
                {deleteMutation.isPending ? 'Deleting…' : 'Yes, delete'}
              </button>
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="px-2 py-1.5 text-xs text-text-secondary hover:text-text-primary"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
      {actionError && <p className="text-red-400 text-sm mb-4">{actionError}</p>}

      <div className="mb-6">
        <div className="flex justify-between text-xs text-text-secondary mb-1">
          <span>Progress</span>
          <span>
            {status.leads_added} / {targetLeads} leads
          </span>
        </div>
        <div className="h-2 bg-[#333] rounded-sm overflow-hidden">
          <div
            className="h-full bg-brand transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-text-primary mb-2">Logs</h3>
        <div className="bg-[#1a1a1a] border border-border rounded-sm h-[300px] overflow-y-auto p-3 font-mono text-xs text-text-secondary space-y-1">
          {logs.length === 0 ? (
            <p className="text-text-secondary/60">No logs yet...</p>
          ) : (
            logs.map((line, i) => (
              <div key={i}>{line}</div>
            ))
          )}
          <div ref={logsEndRef} />
        </div>
      </div>
    </div>
  )
}
