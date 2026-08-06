import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { requireSuperAdmin } from "@/lib/require-admin"

export async function GET() {
  const admin = await requireSuperAdmin()
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { count: totalBusinesses } = await supabaseAdmin
      .from("businesses")
      .select("*", { count: "exact", head: true })

    const { count: totalProfiles } = await supabaseAdmin
      .from("profiles")
      .select("*", { count: "exact", head: true })

    const { count: totalReviews } = await supabaseAdmin
      .from("reviews")
      .select("*", { count: "exact", head: true })

    const { count: totalFollowers } = await supabaseAdmin
      .from("followers")
      .select("*", { count: "exact", head: true })

    const { data: categoryCounts } = await supabaseAdmin
      .from("businesses")
      .select("category")

    const categoryDistribution = (categoryCounts || []).reduce(
      (acc: Record<string, number>, b: { category: string }) => {
        acc[b.category] = (acc[b.category] || 0) + 1
        return acc
      },
      {}
    )

    return NextResponse.json({
      totalBusinesses,
      totalProfiles,
      totalReviews,
      totalFollowers,
      categoryDistribution,
    })
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to fetch stats",
      },
      { status: 500 }
    )
  }
}
