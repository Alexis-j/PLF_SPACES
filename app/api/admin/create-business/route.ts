import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { generatePassword } from "@/lib/generate-password"
import { requireSuperAdmin } from "@/lib/require-admin"

export async function POST(request: Request) {
  const admin = await requireSuperAdmin()
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const {
      name,
      category,
      description,
      shortDescription,
      location,
      address,
      ownerEmail,
      image,
    } = await request.json()

    if (!name || !category || !ownerEmail) {
      return NextResponse.json(
        { error: "Name, category, and owner email are required" },
        { status: 400 }
      )
    }

    const { data: business, error: bizError } = await supabaseAdmin
      .from("businesses")
      .insert({
        name,
        category,
        description: description || "",
        short_description: shortDescription || "",
        location: location || "",
        address: address || "",
        image: image || "/spaces/cat-restaurants.png",
        verified: true,
      })
      .select()
      .single()

    if (bizError) throw bizError

    let ownerId: string | null = null
    let tempPassword: string | null = null
    let accountCreated = false

    const { data: existingProfile } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("email", ownerEmail)
      .single()

    if (existingProfile) {
      ownerId = existingProfile.id

      await supabaseAdmin
        .from("business_members")
        .insert({
          business_id: business.id,
          user_id: ownerId,
          role: "owner",
        })

      await supabaseAdmin
        .from("businesses")
        .update({ owner_id: ownerId })
        .eq("id", business.id)

      await supabaseAdmin
        .from("profiles")
        .update({ role: "business_owner" })
        .eq("id", ownerId)
    } else {
      tempPassword = generatePassword()
      accountCreated = true

      const { data: newUser, error: createError } =
        await supabaseAdmin.auth.admin.createUser({
          email: ownerEmail,
          password: tempPassword,
          email_confirm: true,
          user_metadata: { role: "business_owner", temp_password: true },
        })

      if (createError) throw createError

      ownerId = newUser.user.id

      await supabaseAdmin.from("profiles").insert({
        id: ownerId,
        email: ownerEmail,
        role: "business_owner",
      })

      await supabaseAdmin
        .from("business_members")
        .insert({
          business_id: business.id,
          user_id: ownerId,
          role: "owner",
        })

      await supabaseAdmin
        .from("businesses")
        .update({ owner_id: ownerId })
        .eq("id", business.id)
    }

    return NextResponse.json({
      message: "Business created successfully.",
      business,
      credentials: accountCreated
        ? {
            email: ownerEmail,
            password: tempPassword,
          }
        : null,
    })
  } catch (error) {
    console.error("Create business error:", error)
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to create business",
      },
      { status: 500 }
    )
  }
}
