import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { requireBusinessAccess } from "@/lib/require-business-access"

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const access = await requireBusinessAccess()
  if (!access) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params

  try {
    const { error } = await supabaseAdmin
      .from("events")
      .delete()
      .eq("id", id)
      .eq("business_id", access.businessId)

    if (error) throw error

    return NextResponse.json({ message: "Event deleted" })
  } catch (error) {
    console.error("Delete event error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete event" },
      { status: 500 }
    )
  }
}
