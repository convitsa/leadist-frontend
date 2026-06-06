import { useState } from 'react'
import api from '../api/axios'
import {
  COMPANY_SIZE_OPTIONS,
  LEAD_COUNT_OPTIONS,
} from '../lib/buildIcp'
import type { FriendlyJobAnswers, GenerateIcpResponse, ICPConfig } from '../types'

interface NewJobModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

const FORM_STEPS = [
  {
    id: 'sell',
    title: 'What are you selling?',
    subtitle: 'Forget the pitch deck — just tell us what you do like you would to a friend at coffee.',
    placeholder: 'e.g. We make software that helps plumbers send invoices and get paid faster on their phone',
  },
  {
    id: 'customer',
    title: 'Who do you want to find?',
    subtitle: 'Describe the kind of person or company you want us to hunt down. No jargon needed.',
    placeholder: 'e.g. Small plumbing or HVAC businesses in the US that still use paper invoices',
  },
  {
    id: 'size',
    title: 'How big are their companies?',
    subtitle: 'Rough guess is fine. Pick what sounds closest.',
  },
  {
    id: 'contact',
    title: 'Who should we talk to there?',
    subtitle: 'The actual human you want an intro to — owner, person who buys software, whoever.',
    placeholder: 'e.g. The owner or whoever handles billing and payments',
  },
  {
    id: 'location',
    title: 'Where should they be?',
    subtitle: 'Country, region, or "anywhere English-speaking" — optional if you do not care.',
    placeholder: 'e.g. United States, or UK and Canada',
  },
  {
    id: 'count',
    title: 'How many leads do you want?',
    subtitle: 'We will search until we find this many good matches (or give up trying).',
  },
] as const

const INITIAL: FriendlyJobAnswers = {
  whatYouSell: '',
  idealCustomer: '',
  companySize: 'small',
  whoToContact: '',
  whereLocated: '',
  leadCount: 20,
}

export default function NewJobModal({ isOpen, onClose, onSuccess }: NewJobModalProps) {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<FriendlyJobAnswers>(INITIAL)
  const [generatedIcp, setGeneratedIcp] = useState<ICPConfig | null>(null)
  const [aiSummary, setAiSummary] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const isReview = step === FORM_STEPS.length
  const current = isReview ? null : FORM_STEPS[step]
  const totalSteps = FORM_STEPS.length + 1
  const isLastFormStep = step === FORM_STEPS.length - 1

  if (!isOpen) return null

  const resetAndClose = () => {
    setStep(0)
    setAnswers(INITIAL)
    setGeneratedIcp(null)
    setAiSummary('')
    setError('')
    onClose()
  }

  const canGoNext = (): boolean => {
    if (!current) return true
    switch (current.id) {
      case 'sell':
        return answers.whatYouSell.trim().length >= 10
      case 'customer':
        return answers.idealCustomer.trim().length >= 10
      case 'size':
        return !!answers.companySize
      case 'contact':
        return answers.whoToContact.trim().length >= 3
      case 'location':
        return true
      case 'count':
        return answers.leadCount > 0
      default:
        return true
    }
  }

  const handleGenerateIcp = async () => {
    setError('')
    setLoading(true)
    try {
      const { data } = await api.post<GenerateIcpResponse>('/jobs/generate-icp', {
        friendly: answers,
      })
      setGeneratedIcp(data.icp)
      setAiSummary(data.summary)
      setStep(FORM_STEPS.length)
    } catch (err: unknown) {
      if (typeof err === 'object' && err !== null && 'response' in err) {
        const axiosErr = err as { response?: { data?: { detail?: string } } }
        setError(axiosErr.response?.data?.detail || 'AI could not build your search plan')
      } else {
        setError('AI could not build your search plan')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleCreateJob = async () => {
    if (!generatedIcp) return
    setError('')
    setLoading(true)
    try {
      await api.post('/jobs', { icp: generatedIcp })
      onSuccess()
      resetAndClose()
    } catch (err: unknown) {
      if (typeof err === 'object' && err !== null && 'response' in err) {
        const axiosErr = err as { response?: { data?: { detail?: string } } }
        setError(axiosErr.response?.data?.detail || 'Failed to create job')
      } else {
        setError('Failed to create job')
      }
    } finally {
      setLoading(false)
    }
  }

  const update = <K extends keyof FriendlyJobAnswers>(key: K, value: FriendlyJobAnswers[K]) => {
    setAnswers((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="relative w-full max-w-lg bg-surface border border-border rounded-sm p-6 max-h-[90vh] overflow-y-auto">
        <button
          type="button"
          onClick={resetAndClose}
          className="absolute top-4 right-4 text-text-secondary hover:text-text-primary text-xl leading-none"
          aria-label="Close"
        >
          ×
        </button>

        <p className="text-xs text-text-secondary mb-1">
          Step {step + 1} of {totalSteps}
        </p>
        <div className="flex gap-1 mb-5">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-sm ${i <= step ? 'bg-brand' : 'bg-border'}`}
            />
          ))}
        </div>

        {isReview && generatedIcp ? (
          <>
            <h2 className="text-lg font-semibold text-text-primary">Here&apos;s your search plan</h2>
            <p className="text-sm text-text-secondary mt-1 mb-5">
              Our AI turned your answers into a lead-finding plan. Sound right?
            </p>

            <div className="p-4 bg-[#1a1a1a] border border-brand/30 rounded-sm space-y-4">
              <p className="text-sm text-text-primary leading-relaxed">{aiSummary}</p>
              <div>
                <p className="text-xs text-text-secondary mb-1">Who we&apos;re looking for</p>
                <p className="text-sm text-text-primary">{generatedIcp.target_industry}</p>
              </div>
              <div className="flex flex-wrap gap-4 text-sm">
                <div>
                  <p className="text-xs text-text-secondary">Company size</p>
                  <p className="text-text-primary">{generatedIcp.company_size}</p>
                </div>
                <div>
                  <p className="text-xs text-text-secondary">Goal</p>
                  <p className="text-text-primary">{generatedIcp.target_leads} leads</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-text-secondary mb-2">Search keywords</p>
                <div className="flex flex-wrap gap-1.5">
                  {generatedIcp.keywords.map((kw) => (
                    <span
                      key={kw}
                      className="px-2 py-0.5 text-xs bg-surface border border-border rounded-sm text-text-secondary"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </>
        ) : current && (
          <>
            <h2 className="text-lg font-semibold text-text-primary">{current.title}</h2>
            <p className="text-sm text-text-secondary mt-1 mb-5">{current.subtitle}</p>

            {current.id === 'sell' && (
              <textarea
                value={answers.whatYouSell}
                onChange={(e) => update('whatYouSell', e.target.value)}
                placeholder={current.placeholder}
                rows={4}
                className="w-full px-3 py-2 rounded-sm text-sm resize-none"
                autoFocus
              />
            )}

            {current.id === 'customer' && (
              <textarea
                value={answers.idealCustomer}
                onChange={(e) => update('idealCustomer', e.target.value)}
                placeholder={current.placeholder}
                rows={4}
                className="w-full px-3 py-2 rounded-sm text-sm resize-none"
                autoFocus
              />
            )}

            {current.id === 'size' && (
              <div className="space-y-2">
                {COMPANY_SIZE_OPTIONS.map((opt) => (
                  <label
                    key={opt.value}
                    className={`flex items-start gap-3 p-3 border rounded-sm cursor-pointer transition-colors ${
                      answers.companySize === opt.value
                        ? 'border-brand bg-brand/10'
                        : 'border-border hover:border-text-secondary'
                    }`}
                  >
                    <input
                      type="radio"
                      name="companySize"
                      value={opt.value}
                      checked={answers.companySize === opt.value}
                      onChange={() => update('companySize', opt.value)}
                      className="mt-0.5 accent-brand"
                    />
                    <span className="text-sm text-text-primary">{opt.label}</span>
                  </label>
                ))}
              </div>
            )}

            {current.id === 'contact' && (
              <input
                type="text"
                value={answers.whoToContact}
                onChange={(e) => update('whoToContact', e.target.value)}
                placeholder={current.placeholder}
                className="w-full px-3 py-2 rounded-sm text-sm"
                autoFocus
              />
            )}

            {current.id === 'location' && (
              <input
                type="text"
                value={answers.whereLocated}
                onChange={(e) => update('whereLocated', e.target.value)}
                placeholder={current.placeholder}
                className="w-full px-3 py-2 rounded-sm text-sm"
                autoFocus
              />
            )}

            {current.id === 'count' && (
              <div className="space-y-2">
                {LEAD_COUNT_OPTIONS.map((opt) => (
                  <label
                    key={opt.value}
                    className={`flex items-center justify-between p-3 border rounded-sm cursor-pointer transition-colors ${
                      answers.leadCount === opt.value
                        ? 'border-brand bg-brand/10'
                        : 'border-border hover:border-text-secondary'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="leadCount"
                        checked={answers.leadCount === opt.value}
                        onChange={() => update('leadCount', opt.value)}
                        className="accent-brand"
                      />
                      <span className="text-sm font-medium text-text-primary">{opt.label}</span>
                    </div>
                    <span className="text-xs text-text-secondary">{opt.hint}</span>
                  </label>
                ))}
              </div>
            )}
          </>
        )}

        {error && <p className="text-red-400 text-sm mt-4">{error}</p>}

        <div className="flex gap-3 mt-6">
          {step > 0 && (
            <button
              type="button"
              onClick={() => {
                if (isReview) {
                  setStep(FORM_STEPS.length - 1)
                  setGeneratedIcp(null)
                } else {
                  setStep((s) => s - 1)
                }
              }}
              disabled={loading}
              className="flex-1 py-2.5 border border-border text-text-primary text-sm font-medium rounded-sm hover:bg-[#2a2a2a] transition-colors disabled:opacity-50"
            >
              Back
            </button>
          )}
          {isReview ? (
            <button
              type="button"
              disabled={loading}
              onClick={handleCreateJob}
              className="flex-1 py-2.5 bg-brand text-white text-sm font-medium rounded-sm hover:bg-brand/90 transition-colors disabled:opacity-50"
            >
              {loading ? 'Starting search…' : 'Looks good — start finding leads'}
            </button>
          ) : isLastFormStep ? (
            <button
              type="button"
              disabled={loading || !canGoNext()}
              onClick={handleGenerateIcp}
              className="flex-1 py-2.5 bg-brand text-white text-sm font-medium rounded-sm hover:bg-brand/90 transition-colors disabled:opacity-50"
            >
              {loading ? 'AI is building your plan…' : 'Build my search plan'}
            </button>
          ) : (
            <button
              type="button"
              disabled={!canGoNext()}
              onClick={() => setStep((s) => s + 1)}
              className="flex-1 py-2.5 bg-brand text-white text-sm font-medium rounded-sm hover:bg-brand/90 transition-colors disabled:opacity-40"
            >
              Next
            </button>
          )}
        </div>

        {!isReview && !canGoNext() && current?.id !== 'location' && (
          <p className="text-xs text-text-secondary mt-2 text-center">
            {current?.id === 'sell' || current?.id === 'customer'
              ? 'Write at least a sentence or two so we know what you mean.'
              : 'Fill this in to continue.'}
          </p>
        )}
      </div>
    </div>
  )
}
