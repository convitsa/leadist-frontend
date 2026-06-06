import type { ICPConfig } from '../types'

export const COMPANY_SIZE_OPTIONS = [
  { value: 'solo', label: 'Tiny — just them or a few people (1–5)', map: '1-5 employees' },
  { value: 'small', label: 'Small team (about 5–50 people)', map: '5-50 employees' },
  { value: 'medium', label: 'Bigger small business (50–200 people)', map: '50-200 employees' },
  { value: 'any', label: "Not sure / any size is fine", map: 'Any size' },
] as const

export const LEAD_COUNT_OPTIONS = [
  { value: 10, label: '10 people', hint: 'Quick test run' },
  { value: 20, label: '20 people', hint: 'Good default' },
  { value: 50, label: '50 people', hint: 'Bigger search' },
] as const

export function jobDisplayTitle(icp: ICPConfig): string {
  const raw = icp.target_industry.split('(We sell:')[0].trim()
  if (raw.length > 80) return raw.slice(0, 77) + '...'
  return raw || 'Lead search'
}
