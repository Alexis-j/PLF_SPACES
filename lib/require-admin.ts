import { createClient } from "@/lib/supabase-server"
import type { User } from "@supabase/supabase-js"

export async function requireSuperAdmin(): Promise<User | null> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (profile?.role !== "super_admin") return null

  return user
}
