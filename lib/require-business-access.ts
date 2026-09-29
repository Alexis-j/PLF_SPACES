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

  // A user can be owner or manager of more than one business. maybeSingle()
  // throws in that case, so pin the lookup to a single deterministic row.
  // Ordering by id as well breaks ties, since created_at defaults to now()
  // and rows inserted in the same transaction share the same timestamp.
  const { data: member, error } = await supabaseAdmin
    .from("business_members")
    .select("business_id, role")
    .eq("user_id", user.id)
    .in("role", ["owner", "manager"])
    .order("created_at", { ascending: true })
    .order("id", { ascending: true })
    .limit(1)
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
