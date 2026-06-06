export type FitScore = 'Strong' | 'Medium' | 'Poor'

export type JobStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'

export interface ICPConfig {
  target_industry: string
  company_size: string
  keywords: string[]
  target_leads: number
  max_iterations: number
}

export interface FriendlyJobAnswers {
  whatYouSell: string
  idealCustomer: string
  companySize: string
  whoToContact: string
  whereLocated: string
  leadCount: number
}

export interface GenerateIcpResponse {
  icp: ICPConfig
  summary: string
}

export interface Job {
  id: string
  user_id: string
  status: JobStatus
  icp: ICPConfig
  leads_added: number
  iterations: number
  logs: string[]
  error?: string
  created_at: string
  updated_at: string
  leads_count?: number
}

export interface JobStatusSnapshot {
  status: JobStatus
  leads_added: number
  iterations: number
  updated_at: string
}

export interface JobLogs {
  logs: string[]
}

export interface Lead {
  id: string
  name: string
  company: string
  fit_score: FitScore
  email?: string
  linkedin_url?: string
  created_at: string
}

export interface User {
  id: string
  email: string
  notion_token?: string
  notion_database_id?: string
  apollo_key?: string
  hunter_key?: string
}

export interface Integrations {
  notion_token?: string | null
  notion_database_id?: string | null
  apollo_key?: string | null
  hunter_key?: string | null
}

export interface AuthResponse {
  token: string
  user_id: string
}
