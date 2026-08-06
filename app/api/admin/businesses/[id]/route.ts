import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { requireSuperAdmin } from "@/lib/require-admin"

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireSuperAdmin()
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { id } = await params
    const { matterportTourUrl } = await request.json()

    const { error } = await supabaseAdmin
      .from("businesses")
      .update({ matterport_tour_url: matterportTourUrl || null })
      .eq("id", id)

    if (error) throw error

    return NextResponse.json({
      message: "Matterport tour URL updated",
    })
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to update business",
      },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireSuperAdmin()
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { id } = await params

    const tables = [
      "reviews",
      "posts",
      "events",
      "media",
      "followers",
      "favorites",
      "business_members",
    ]

    for (const table of tables) {
      await supabaseAdmin.from(table).delete().eq("business_id", id)
    }

    const { error } = await supabaseAdmin
      .from("businesses")
      .delete()
      .eq("id", id)

    if (error) throw error

    return NextResponse.json({
      message: "Business and all related data deleted",
    })
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to delete business",
      },
      { status: 500 }
    )
  }
}
