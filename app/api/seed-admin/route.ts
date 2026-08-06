import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"

export async function POST() {
  const email = process.env.ADMIN_EMAIL
  const password = process.env.ADMIN_PASSWORD
  const fullName = process.env.ADMIN_FULL_NAME || "Admin"

  if (!email || !password) {
    return NextResponse.json(
      {
        error:
          "ADMIN_EMAIL and ADMIN_PASSWORD environment variables are not set.",
      },
      { status: 400 }
    )
  }

  if (password.length < 8) {
    return NextResponse.json(
      { error: "ADMIN_PASSWORD must be at least 8 characters." },
      { status: 400 }
    )
  }

  try {
    const { data: user, error: createError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          full_name: fullName,
          role: "super_admin",
          temp_password: true,
        },
      })

    if (createError) {
      if (createError.message.includes("already exists")) {
        const { data: existingUser } =
          await supabaseAdmin.auth.admin.listUsers()
        const found = existingUser?.users.find((u) => u.email === email)

        if (found) {
          const { error: upsertError } = await supabaseAdmin
            .from("profiles")
            .upsert(
              {
                id: found.id,
                email,
                full_name: fullName,
                role: "super_admin",
              },
              { onConflict: "id" }
            )

          if (upsertError) throw upsertError

          return NextResponse.json({
            message: "Super admin already existed, profile updated.",
            user: { id: found.id, email },
          })
        }
      }

      throw createError
    }

    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .insert({
        id: user.user.id,
        email,
        full_name: fullName,
        role: "super_admin",
      })

    if (profileError) throw profileError

    return NextResponse.json({
      message: "Super admin created successfully.",
      user: { id: user.user.id, email },
    })
  } catch (error) {
    console.error("Seed admin error:", error)
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to create super admin",
      },
      { status: 500 }
    )
  }
}
