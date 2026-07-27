import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("categories")
      .select("*")
      .order("name")

    if (error) throw error
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const { name, description } = await request.json()

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from("categories")
      .insert({ name, description })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create" },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const { id, name, description } = await request.json()

    if (!id || !name) {
      return NextResponse.json(
        { error: "id and name are required" },
        { status: 400 }
      )
    }

    const { data, error } = await supabaseAdmin
      .from("categories")
      .update({ name, description })
      .eq("id", id)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json()

    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 })
    }

    const { error } = await supabaseAdmin
      .from("categories")
      .delete()
      .eq("id", id)

    if (error) throw error
    return NextResponse.json({ message: "Category deleted" })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete" },
      { status: 500 }
    )
  }
}
