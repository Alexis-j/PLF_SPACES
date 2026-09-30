import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { requireSuperAdmin } from "@/lib/require-admin"

export async function GET() {
  const admin = await requireSuperAdmin()
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Lee con service_role porque profiles dejó de ser legible con la anon
    // key (migración 002). Es la única vía por la que el panel de admin
    // sigue viendo los emails.
    const { data, error } = await supabaseAdmin
      .from("profiles")
      .select("id, email, full_name, role, created_at")
      .order("created_at", { ascending: false })

    if (error) throw error

    return NextResponse.json({ users: data ?? [] })
  } catch (error) {
    console.error("Admin users error:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to load users",
      },
      { status: 500 }
    )
  }
}
