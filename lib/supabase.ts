import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types for TypeScript
export interface Profile {
  id: string
  username: string | null
  full_name: string | null
  created_at: string
  updated_at: string
}

export interface Recipe {
  id: string
  created_at: string
  user_id: string
  title: string
  ingredients: string
  instructions: string
  cooking_time: number | null
  difficulty: 'Easy' | 'Medium' | 'Hard' | null
  category: string | null
  updated_at: string
} 