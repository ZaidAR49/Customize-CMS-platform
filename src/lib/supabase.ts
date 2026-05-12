import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Check database connection on server startup
;(async () => {
  try {
    const { error } = await supabase.from('users').select('id').limit(1)
    if (error) throw error
    console.log('✅ Database connected successfully')
  } catch (error) {
    console.error('❌ Database connection failed:', error)
  }
})()

export default supabase
