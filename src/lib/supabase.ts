import { createClient } from '@supabase/supabase-js'

let supabase: ReturnType<typeof createClient> | null = null
try {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Missing Supabase URL or Service Role Key')
  }
  supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )
} catch (error) {
  console.error('Error creating Supabase client:', error)
}

export default supabase
