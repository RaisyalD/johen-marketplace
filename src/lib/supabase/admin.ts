import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/database.types"

// ONLY import this in server-side code (route handlers, server actions).
// NEVER import from client components — service_role bypasses RLS.
export function createAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}