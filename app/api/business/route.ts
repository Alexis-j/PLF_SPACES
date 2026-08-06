import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { requireBusinessAccess } from "@/lib/require-business-access"

export async function GET() {
  const access = await requireBusinessAccess()
  if (!access) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { businessId } = access

  try {
    const { data: business, error: bizError } = await supabaseAdmin
      .from("businesses")
      .select("*")
      .eq("id", businessId)
      .single()

    if (bizError) throw bizError

    const [{ count: reviews }, { count: followers }, { count: posts }, { count: events }] =
      await Promise.all([
        supabaseAdmin
          .from("reviews")
          .select("*", { count: "exact", head: true })
          .eq("business_id", businessId),
        supabaseAdmin
          .from("followers")
          .select("*", { count: "exact", head: true })
          .eq("business_id", businessId),
        supabaseAdmin
          .from("posts")
          .select("*", { count: "exact", head: true })
          .eq("business_id", businessId),
        supabaseAdmin
          .from("events")
          .select("*", { count: "exact", head: true })
          .eq("business_id", businessId),
      ])

    const { data: reviewRows } = await supabaseAdmin
      .from("reviews")
      .select("id, rating, comment, created_at, profiles(full_name)")
      .eq("business_id", businessId)
      .order("created_at", { ascending: false })
      .limit(10)

    const { data: eventRows } = await supabaseAdmin
      .from("events")
      .select("*")
      .eq("business_id", businessId)
      .order("date", { ascending: true })

    const { data: members } = await supabaseAdmin
      .from("business_members")
      .select("id, role, profiles(full_name, email)")
      .eq("business_id", businessId)

    return NextResponse.json({
      business,
      stats: {
        reviews: reviews ?? 0,
        followers: followers ?? 0,
        posts: posts ?? 0,
        events: events ?? 0,
      },
      reviews: reviewRows ?? [],
      events: eventRows ?? [],
      members: members ?? [],
    })
  } catch (error) {
    console.error("Get business error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load business" },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  const access = await requireBusinessAccess()
  if (!access) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { businessId } = access

  try {
    const body = await request.json()

    const { data, error } = await supabaseAdmin
      .from("businesses")
      .update({
        name: body.name,
        category: body.category,
        description: body.description ?? "",
        short_description: body.shortDescription ?? "",
        location: body.location ?? "",
        address: body.address ?? "",
        phone: body.phone || null,
        email: body.email || null,
        website: body.website || null,
        instagram: body.instagram || null,
        opening_hours: body.openingHours || null,
        image: body.image || "/spaces/cat-restaurants.png",
        logo: body.logo || null,
        cover_image: body.coverImage || null,
      })
      .eq("id", businessId)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ business: data })
  } catch (error) {
    console.error("Update business error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update business" },
      { status: 500 }
    )
  }
}
