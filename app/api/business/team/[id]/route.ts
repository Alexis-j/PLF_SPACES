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

  if (access.memberRole !== "owner") {
    return NextResponse.json(
      { error: "Only the business owner can manage the team" },
      { status: 403 }
    )
  }

  const { id } = await params

  try {
    const { error } = await supabaseAdmin
      .from("business_members")
      .delete()
      .eq("id", id)
      .eq("business_id", access.businessId)

    if (error) throw error

    return NextResponse.json({ message: "Team member removed" })
  } catch (error) {
    console.error("Remove team member error:", error)
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to remove team member",
      },
      { status: 500 }
    )
  }
}
