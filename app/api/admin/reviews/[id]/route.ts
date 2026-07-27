import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const { error } = await supabaseAdmin
      .from("reviews")
      .delete()
      .eq("id", id)

    if (error) throw error

    return NextResponse.json({ message: "Review deleted" })
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to delete review",
      },
      { status: 500 }
    )
  }
}
