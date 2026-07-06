import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"

export async function POST() {
  try {
    const email = "alexis.jcastillo@outlook.com"
    const password = "Test123!"
    const fullName = "Alexis J. Castillo"

    const { data: user, error: createError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: fullName, role: "super_admin" },
      })

    if (createError) {
      // If user already exists, try to fetch it
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
