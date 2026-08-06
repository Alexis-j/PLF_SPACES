import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase-server"
import { supabaseAdmin } from "@/lib/supabase-admin"

export async function POST() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const fullName =
    user.user_metadata?.full_name ||
    user.user_metadata?.fullName ||
    user.email?.split("@")[0] ||
    null

  const role = user.user_metadata?.role || "customer"

  const { error } = await supabaseAdmin.from("profiles").upsert(
    {
      id: user.id,
      email: user.email || "",
      full_name: fullName,
      role,
    },
    { onConflict: "id" }
  )

  if (error) {
    console.error("ensure-profile error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to ensure profile" },
      { status: 500 }
    )
  }

  return NextResponse.json({ ok: true, role })
}
