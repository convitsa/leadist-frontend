import { useEffect, useRef, useState } from 'react'
import type { FitScore } from '../types'

interface FakeLead {
  company: string
  contact: string
  fit_score: FitScore
}

const FAKE_LEADS: FakeLead[] = [
  { company: 'Pipedrive', contact: 'Timo Rein', fit_score: 'Strong' },
  { company: 'Loom', contact: 'Joe Thomas', fit_score: 'Strong' },
  { company: 'Notion', contact: 'Ivan Zhao', fit_score: 'Medium' },
  { company: 'Linear', contact: 'Karri Saarinen', fit_score: 'Strong' },
  { company: 'Vercel', contact: 'Guillermo Rauch', fit_score: 'Strong' },
  { company: 'Figma', contact: 'Dylan Field', fit_score: 'Medium' },
  { company: 'Stripe', contact: 'Patrick Collison', fit_score: 'Poor' },
  { company: 'Retool', contact: 'David Hsu', fit_score: 'Strong' },
]

const fitStyles: Record<FitScore, string> = {
  Strong: 'bg-green-900/50 text-green-400',
  Medium: 'bg-yellow-900/50 text-yellow-400',
  Poor: 'bg-red-900/50 text-red-400',
}

export default function LeadFeed() {
  const [visible, setVisible] = useState<FakeLead[]>([])
  const indexRef = useRef(0)

  useEffect(() => {
    const interval = setInterval(() => {
      const lead = FAKE_LEADS[indexRef.current % FAKE_LEADS.length]
      indexRef.current += 1
      setVisible((prev) => {
        const next = [lead, ...prev]
        return next.length > 6 ? next.slice(0, 6) : next
      })
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="space-y-2 overflow-hidden">
      {visible.map((lead, i) => (
        <div
          key={`${lead.company}-${i}`}
          className="p-3 bg-[#1a1a1a] border border-border rounded-sm animate-slide-up"
          style={{ animationDelay: `${i * 50}ms` }}
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-sm font-medium text-text-primary">{lead.company}</p>
              <p className="text-xs text-text-secondary">{lead.contact}</p>
            </div>
            <span className={`text-xs px-2 py-0.5 rounded-sm shrink-0 ${fitStyles[lead.fit_score]}`}>
              {lead.fit_score}
            </span>
          </div>
          {(lead.fit_score === 'Strong' || lead.fit_score === 'Medium') && (
            <span className="inline-block mt-2 text-xs text-brand">Sequence triggered</span>
          )}
        </div>
      ))}
    </div>
  )
}
