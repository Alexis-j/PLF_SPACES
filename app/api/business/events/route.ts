import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { requireBusinessAccess } from "@/lib/require-business-access"

export async function POST(request: Request) {
  const access = await requireBusinessAccess()
  if (!access) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { businessId } = access

  try {
    const { title, description, date } = await request.json()

    if (!title || !date) {
      return NextResponse.json(
        { error: "Title and date are required" },
        { status: 400 }
      )
    }

    const { data, error } = await supabaseAdmin
      .from("events")
      .insert({
        business_id: businessId,
        title,
        description: description || "",
        date,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ event: data })
  } catch (error) {
    console.error("Create event error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create event" },
      { status: 500 }
    )
  }
}
