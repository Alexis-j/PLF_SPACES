import { createClient } from "@/lib/supabase-client"
import type { User } from "@supabase/supabase-js"

export type AuthUser = {
  user: User | null
  role: string | null
}

export async function getAuthUser(): Promise<AuthUser> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { user: null, role: null }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  return { user, role: profile?.role ?? null }
}

export async function signOut() {
  const supabase = createClient()
  await supabase.auth.signOut()
}
