import { createHash, timingSafeEqual } from "node:crypto"
import { NextResponse, type NextRequest } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"

// This route mints a super_admin from environment variables, so it must never
// be reachable by an unauthenticated caller. It is gated on a deployment
// secret that has to be sent explicitly in the x-seed-secret header.
//
// If SEED_ADMIN_SECRET is not configured the route fails closed: creating the
// first admin is then done with an explicit SQL statement instead.
function isSeedAuthorized(request: NextRequest): boolean {
  const expected = process.env.SEED_ADMIN_SECRET
  if (!expected) return false

  const provided = request.headers.get("x-seed-secret")
  if (!provided) return false

  // Hash both sides so the comparison is constant-time over equal-length
  // buffers, which timingSafeEqual requires.
  const digest = (value: string) =>
    createHash("sha256").update(value).digest()

  return timingSafeEqual(digest(expected), digest(provided))
}

export async function POST(request: NextRequest) {
  if (!process.env.SEED_ADMIN_SECRET) {
    return NextResponse.json(
      {
        error:
          "SEED_ADMIN_SECRET is not configured. Create the first super_admin directly via SQL instead.",
      },
      { status: 503 }
    )
  }

  if (!isSeedAuthorized(request)) {
    return NextResponse.json(
      { error: "Invalid or missing x-seed-secret header." },
      { status: 401 }
    )
  }

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

    // upsert y no insert: el trigger on_auth_user_created ya creo la fila
    // con role='customer' al crear el usuario de auth. Un insert aqui
    // fallaba con duplicate key (23505) y la ruta devolvia 500 aunque el
    // admin se hubiera creado bien.
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .upsert(
        {
          id: user.user.id,
          email,
          full_name: fullName,
          role: "super_admin",
        },
        { onConflict: "id" }
      )

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
