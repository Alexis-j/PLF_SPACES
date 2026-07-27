import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await supabaseAdmin.from("profiles").delete().eq("id", id)

    await supabaseAdmin.from("business_members").delete().eq("user_id", id)

    const { error } = await supabaseAdmin.auth.admin.deleteUser(id)

    if (error) throw error

    return NextResponse.json({
      message: "User deleted from Auth and profiles",
    })
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to delete user",
      },
      { status: 500 }
    )
  }
}
