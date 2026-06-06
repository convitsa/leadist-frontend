import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import LeadFeed from '../components/LeadFeed'

const STEPS = [
  {
    num: '01',
    title: 'Connect your site',
    bullets: [
      'Paste one script tag on your site',
      'Works with any site builder',
      'No engineering required',
    ],
  },
  {
    num: '02',
    title: 'We identify visitors',
    bullets: [
      'IP identification and company matching',
      'Behavioral scoring on page views',
      'Intent signals from repeat visits',
    ],
  },
  {
    num: '03',
    title: 'Agent finds contacts',
    bullets: [
      'Searches Apollo for decision-makers',
      'Verifies emails with Hunter',
      'Scores each lead against your ICP',
    ],
  },
  {
    num: '04',
    title: 'Sequences fire automatically',
    bullets: [
      'Pushes qualified leads to Instantly',
      'Personalized outreach per contact',
      'Follows up until they reply',
    ],
  },
]

const PARTNERS = ['Apollo', 'Notion', 'Hunter', 'Instantly']

export default function Landing() {
  const navigate = useNavigate()
  const [openStep, setOpenStep] = useState<number | null>(0)

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-text-primary">
      <div className="max-w-7xl mx-auto px-6 py-12 lg:py-16 grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
        {/* Left column */}
        <div>
          <span className="inline-block px-3 py-1 text-xs font-medium text-brand border border-brand/30 rounded-sm mb-6">
            AI-powered outbound
          </span>

          <h1 className="text-4xl lg:text-5xl font-semibold leading-tight tracking-tight text-text-primary mb-4">
            Your buyers are already
            <br />
            on your site. We find them.
          </h1>

          <p className="text-text-secondary text-lg mb-8 max-w-lg">
            Leadist identifies companies visiting your site and automatically reaches out — until the deal closes.
          </p>

          <button
            type="button"
            onClick={() => navigate('/register')}
            className="px-6 py-3 bg-brand text-white font-medium rounded-sm hover:bg-brand/90 transition-colors mb-12"
          >
            Get started free
          </button>

          <div className="mb-10">
            <h2 className="text-sm font-medium text-text-secondary uppercase tracking-wider mb-4">
              How it works
            </h2>
            <div className="space-y-1 border border-border rounded-sm divide-y divide-border">
              {STEPS.map((step, i) => (
                <div key={step.num}>
                  <button
                    type="button"
                    onClick={() => setOpenStep(openStep === i ? null : i)}
                    className="w-full flex items-center gap-4 px-4 py-3 text-left hover:bg-surface transition-colors"
                  >
                    <span className="text-xs text-text-secondary font-mono">{step.num}</span>
                    <span className="text-sm font-medium flex-1">{step.title}</span>
                    <span className="text-text-secondary text-lg">{openStep === i ? '−' : '+'}</span>
                  </button>
                  {openStep === i && (
                    <ul className="px-4 pb-4 pl-12 space-y-1">
                      {step.bullets.map((b) => (
                        <li key={b} className="text-sm text-text-secondary list-disc">
                          {b}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap text-sm text-text-secondary">
            <span className="text-text-secondary/60">Works with</span>
            {PARTNERS.map((p, i) => (
              <span key={p} className="flex items-center gap-2">
                {i > 0 && <span className="text-border">·</span>}
                <span className="px-2 py-0.5 border border-border rounded-sm text-text-primary text-xs">
                  {p}
                </span>
              </span>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div className="lg:sticky lg:top-12">
          <div className="bg-surface border border-border rounded-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium">Live lead discovery</h3>
              <span className="flex items-center gap-2 text-xs text-green-400">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                Active
              </span>
            </div>
            <LeadFeed />
          </div>
        </div>
      </div>
    </div>
  )
}
