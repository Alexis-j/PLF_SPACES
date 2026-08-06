import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { requireBusinessAccess } from "@/lib/require-business-access"
import { generatePassword } from "@/lib/generate-password"

const VALID_ROLES = ["owner", "manager", "staff"]

export async function POST(request: Request) {
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

  const { businessId } = access

  try {
    const { email, role } = await request.json()

    if (!email || !VALID_ROLES.includes(role)) {
      return NextResponse.json(
        { error: "Email and a valid role (owner, manager, staff) are required" },
        { status: 400 }
      )
    }

    const { data: existingProfile } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("email", email)
      .maybeSingle()

    let userId: string
    let tempPassword: string | null = null
    let accountCreated = false

    if (existingProfile) {
      userId = existingProfile.id as string
    } else {
      tempPassword = generatePassword()
      accountCreated = true

      const { data: newUser, error: createError } =
        await supabaseAdmin.auth.admin.createUser({
          email,
          password: tempPassword,
          email_confirm: true,
          user_metadata: {
            role: "business_staff",
            temp_password: true,
          },
        })

      if (createError) throw createError

      userId = newUser.user.id

      await supabaseAdmin.from("profiles").insert({
        id: userId,
        email,
        role: "business_staff",
      })
    }

    const { data: member, error: memberError } = await supabaseAdmin
      .from("business_members")
      .upsert(
        {
          business_id: businessId,
          user_id: userId,
          role,
        },
        { onConflict: "business_id,user_id" }
      )
      .select()
      .single()

    if (memberError) throw memberError

    return NextResponse.json({
      message: "Team member added.",
      member,
      credentials: accountCreated ? { email, password: tempPassword } : null,
    })
  } catch (error) {
    console.error("Add team member error:", error)
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to add team member",
      },
      { status: 500 }
    )
  }
}
