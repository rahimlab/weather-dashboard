// thin wrapper that creates the Supabase client from env vars — every hook
// that needs database access imports this single instance so we don't end up
// with multiple clients floating around
// setup: copy Project URL and anon key from supabase.com > Project Settings > API
// into .env as VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
)

export default supabase
