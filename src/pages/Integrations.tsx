import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import api from '../api/axios'
import Sidebar from '../components/Sidebar'
import type { Integrations } from '../types'

export default function Integrations() {
  const queryClient = useQueryClient()
  const [notionToken, setNotionToken] = useState('')
  const [notionDatabaseId, setNotionDatabaseId] = useState('')
  const [apolloKey, setApolloKey] = useState('')
  const [hunterKey, setHunterKey] = useState('')
  const [toast, setToast] = useState(false)

  const { data } = useQuery({
    queryKey: ['integrations'],
    queryFn: async () => {
      const { data: res } = await api.get<Integrations>('/config/integrations')
      return res
    },
  })

  useEffect(() => {
    if (data) {
      if (data.notion_token) setNotionToken(data.notion_token)
      if (data.notion_database_id) setNotionDatabaseId(data.notion_database_id)
      if (data.apollo_key) setApolloKey(data.apollo_key)
      if (data.hunter_key) setHunterKey(data.hunter_key)
    }
  }, [data])

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload: Integrations = {}
      if (notionToken && !notionToken.includes('*')) payload.notion_token = notionToken
      if (notionDatabaseId && !notionDatabaseId.includes('*')) payload.notion_database_id = notionDatabaseId
      if (apolloKey && !apolloKey.includes('*')) payload.apollo_key = apolloKey
      if (hunterKey && !hunterKey.includes('*')) payload.hunter_key = hunterKey
      await api.put('/config/integrations', payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] })
      setToast(true)
      setTimeout(() => setToast(false), 3000)
    },
  })

  const inputClass = 'w-full px-3 py-2 rounded-sm text-sm mt-1'

  return (
    <div className="flex min-h-screen bg-[#1a1a1a]">
      <Sidebar />
      <main className="flex-1 p-8">
        <h1 className="text-xl font-semibold text-text-primary mb-6">Integrations</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mb-8">
          <div className="p-5 bg-surface border border-border rounded-sm">
            <h3 className="font-medium text-text-primary">Notion</h3>
            <p className="text-xs text-text-secondary mt-1 mb-4">Where your leads get saved</p>
            <label className="block text-xs text-text-secondary">Integration token</label>
            <input
              type="password"
              value={notionToken}
              onChange={(e) => setNotionToken(e.target.value)}
              placeholder="ntn_..."
              className={inputClass}
            />
            <label className="block text-xs text-text-secondary mt-3">Database ID</label>
            <input
              type="text"
              value={notionDatabaseId}
              onChange={(e) => setNotionDatabaseId(e.target.value)}
              placeholder="Database ID"
              className={inputClass}
            />
          </div>

          <div className="p-5 bg-surface border border-border rounded-sm">
            <h3 className="font-medium text-text-primary">Apollo</h3>
            <p className="text-xs text-text-secondary mt-1 mb-4">Contact finding and enrichment</p>
            <label className="block text-xs text-text-secondary">API key</label>
            <input
              type="password"
              value={apolloKey}
              onChange={(e) => setApolloKey(e.target.value)}
              placeholder="Apollo API key"
              className={inputClass}
            />
          </div>

          <div className="p-5 bg-surface border border-border rounded-sm">
            <h3 className="font-medium text-text-primary">Hunter.io</h3>
            <p className="text-xs text-text-secondary mt-1 mb-4">Email verification</p>
            <label className="block text-xs text-text-secondary">API key</label>
            <input
              type="password"
              value={hunterKey}
              onChange={(e) => setHunterKey(e.target.value)}
              placeholder="Hunter API key"
              className={inputClass}
            />
          </div>

          <div className="p-5 bg-surface border border-border rounded-sm opacity-60">
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-text-primary">Instantly</h3>
              <span className="text-xs px-2 py-0.5 bg-[#333] text-text-secondary rounded-sm">Coming soon</span>
            </div>
            <p className="text-xs text-text-secondary mt-1 mb-4">Email sequences and follow-up</p>
            <input type="text" disabled placeholder="Coming soon" className={`${inputClass} opacity-50 cursor-not-allowed`} />
          </div>
        </div>

        <button
          type="button"
          onClick={() => saveMutation.mutate()}
          disabled={saveMutation.isPending}
          className="px-6 py-2.5 bg-brand text-white font-medium rounded-sm hover:bg-brand/90 transition-colors disabled:opacity-50"
        >
          {saveMutation.isPending ? 'Saving...' : 'Save integrations'}
        </button>

        {toast && (
          <span className="ml-4 text-sm text-green-400">Integrations saved</span>
        )}
      </main>
    </div>
  )
}
