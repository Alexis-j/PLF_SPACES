import { createClient } from "@/lib/supabase-server"
import { supabaseAdmin } from "@/lib/supabase-admin"
import type { User } from "@supabase/supabase-js"

export type BusinessAccess = {
  user: User
  businessId: string
  memberRole: string
}

export async function requireBusinessAccess(): Promise<BusinessAccess | null> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: member, error } = await supabaseAdmin
    .from("business_members")
    .select("business_id, role")
    .eq("user_id", user.id)
    .in("role", ["owner", "manager"])
    .maybeSingle()

  if (error) {
    console.error("requireBusinessAccess error:", error)
    return null
  }

  if (!member) return null

  return {
    user,
    businessId: member.business_id as string,
    memberRole: member.role as string,
  }
}
