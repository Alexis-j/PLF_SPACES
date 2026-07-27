import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"

export async function PUT(request: Request) {
  try {
    const { businessId, field, value } = await request.json()

    if (!businessId || !field) {
      return NextResponse.json(
        { error: "businessId and field are required" },
        { status: 400 }
      )
    }

    const validFields = ["featured", "founding", "verified"]
    if (!validFields.includes(field)) {
      return NextResponse.json({ error: "Invalid field" }, { status: 400 })
    }

    const { error } = await supabaseAdmin
      .from("businesses")
      .update({ [field]: value })
      .eq("id", businessId)

    if (error) throw error

    return NextResponse.json({ message: `${field} updated successfully` })
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
