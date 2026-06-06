import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import api from '../api/axios'
import JobCard from '../components/JobCard'
import JobDetail from '../components/JobDetail'
import NewJobModal from '../components/NewJobModal'
import Sidebar from '../components/Sidebar'
import type { Job } from '../types'

export default function Dashboard() {
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const queryClient = useQueryClient()

  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ['jobs'],
    queryFn: async () => {
      const { data } = await api.get<Job[]>('/jobs')
      return data
    },
    refetchInterval: (query) => {
      const list = query.state.data
      return list?.some((j) => j.status === 'running' || j.status === 'pending') ? 10000 : false
    },
  })

  const handleJobCreated = () => {
    queryClient.invalidateQueries({ queryKey: ['jobs'] })
  }

  return (
    <div className="flex min-h-screen bg-[#1a1a1a]">
      <Sidebar />
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-4xl">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl font-semibold text-text-primary">Your jobs</h1>
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="px-4 py-2 bg-brand text-white text-sm font-medium rounded-sm hover:bg-brand/90 transition-colors"
            >
              Find leads
            </button>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-surface border border-border rounded-sm animate-pulse" />
              ))}
            </div>
          ) : jobs.length === 0 ? (
            <p className="text-text-secondary text-sm py-8 text-center border border-border rounded-sm bg-surface">
              No jobs yet. Start your first job.
            </p>
          ) : (
            <div className="space-y-2 mb-8">
              {jobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  selected={selectedJobId === job.id}
                  onClick={() => setSelectedJobId(job.id)}
                />
              ))}
            </div>
          )}

          {selectedJobId && (
            <div className="mt-8">
              <h2 className="text-sm font-medium text-text-secondary mb-3">Job details</h2>
              <JobDetail
                jobId={selectedJobId}
                onDeleted={() => setSelectedJobId(null)}
              />
            </div>
          )}
        </div>
      </main>

      <NewJobModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={handleJobCreated}
      />
    </div>
  )
}
