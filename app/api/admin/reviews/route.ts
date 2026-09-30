import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { requireSuperAdmin } from "@/lib/require-admin"

export async function GET() {
  const admin = await requireSuperAdmin()
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // El embed de profiles sobre reviews ya no funciona con la anon key.
    // Con service_role se resuelve igual y el panel no depende de que
    // profiles sea legible por el público.
    const { data, error } = await supabaseAdmin
      .from("reviews")
      .select(
        "id, business_id, user_id, rating, comment, created_at, profiles(full_name), businesses(name)"
      )
      .order("created_at", { ascending: false })

    if (error) throw error

    return NextResponse.json({ reviews: data ?? [] })
  } catch (error) {
    console.error("Admin reviews error:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to load reviews",
      },
      { status: 500 }
    )
  }
}
