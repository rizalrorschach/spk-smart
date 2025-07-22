import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "your-supabase-url"
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "your-supabase-anon-key"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database schema types
export interface CriteriaDB {
  id: string
  name: string
  weight: number
  type: "benefit" | "cost"
  created_at: string
}

export interface CandidateDB {
  id: string
  name: string
  created_at: string
}

export interface ScoreDB {
  id: string
  candidate_id: string
  criteria_id: string
  score: number
  created_at: string
}

export interface CalculationResultDB {
  id: string
  candidate_id: string
  utility_score: number
  rank: number
  calculation_date: string
}
