import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase-server"
import { supabaseAdmin } from "@/lib/supabase-admin"

export async function POST() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const fullName =
    user.user_metadata?.full_name ||
    user.user_metadata?.fullName ||
    user.email?.split("@")[0] ||
    null

  // role no se escribe aquí a propósito. Esta ruta corre con service_role
  // (salta RLS) y el endpoint se llama en cada login, así que aceptar el
  // role de user_metadata convertía un POST autenticado cualquiera en una
  // escalada completa a super_admin: con ese rol se abren /admin, la
  // policy de INSERT de businesses y la de business_members.
  // El rol lo asigna handle_new_user() (siempre 'customer') y solo lo
  // cambian las rutas de admin, que van con service_role.
  const { error } = await supabaseAdmin.from("profiles").upsert(
    {
      id: user.id,
      email: user.email || "",
      full_name: fullName,
    },
    { onConflict: "id" }
  )

  if (error) {
    console.error("ensure-profile error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to ensure profile" },
      { status: 500 }
    )
  }

  // El rol se devuelve desde la base, no desde user_metadata: es lo que
  // el cliente debe usar para decidir la redirección.
  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle()

  return NextResponse.json({ ok: true, role: profile?.role ?? "customer" })
}
