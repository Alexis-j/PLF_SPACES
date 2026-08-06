import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { requireSuperAdmin } from "@/lib/require-admin"
import { seedBusinesses } from "@/lib/seed-data"

export async function POST() {
  const admin = await requireSuperAdmin()
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    let created = 0
    let skipped = 0
    const errors: string[] = []

    for (const business of seedBusinesses) {
      const { data: existing } = await supabaseAdmin
        .from("businesses")
        .select("id")
        .eq("name", business.name)
        .maybeSingle()

      if (existing) {
        skipped++
        continue
      }

      const { error } = await supabaseAdmin.from("businesses").insert({
        name: business.name,
        description: business.description,
        short_description: business.shortDescription,
        category: business.category,
        location: business.location,
        address: business.address,
        image: business.image,
        logo: business.logo || null,
        cover_image: business.coverImage || null,
        rating: business.rating,
        review_count: business.reviewCount,
        matterport_space_id: business.matterportSpaceId || null,
        matterport_tour_url: business.matterportTourUrl || null,
        phone: business.phone || null,
        email: business.email || null,
        website: business.website || null,
        instagram: business.instagram || null,
        verified: business.verified,
        featured: business.featured,
        founding: business.founding,
        opening_hours: business.openingHours || null,
      })

      if (error) {
        errors.push(`${business.name}: ${error.message}`)
      } else {
        created++
      }
    }

    return NextResponse.json({
      message: `Seed complete: ${created} created, ${skipped} already existed.`,
      created,
      skipped,
      errors,
    })
  } catch (error) {
    console.error("Seed data error:", error)
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to seed data",
      },
      { status: 500 }
    )
  }
}
