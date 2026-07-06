"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase-client"

export default function AuthCallbackPage() {
  const router = useRouter()
  const [message, setMessage] = useState("Completing setup...")

  useEffect(() => {
    const handleCallback = async () => {
      const supabase = createClient()

      const hash = window.location.hash.substring(1)
      const params = new URLSearchParams(hash)
      const accessToken = params.get("access_token")
      const refreshToken = params.get("refresh_token")

      if (accessToken) {
        await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken || "",
        })

        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single()

          const role = profile?.role
          if (role === "super_admin") router.push("/admin")
            else if (role === "business_owner") router.push("/dashboard")
          else router.push("/")
          return
        }
      }

      const code = new URLSearchParams(window.location.search).get("code")
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (!error) {
          const {
            data: { user },
          } = await supabase.auth.getUser()
          if (user) {
            const { data: profile } = await supabase
              .from("profiles")
              .select("role")
              .eq("id", user.id)
              .single()

            const role = profile?.role
            if (role === "super_admin") router.push("/admin")
            else if (role === "business_owner") router.push("/dashboard")
            else router.push("/")
            return
          }
        }
      }

      setMessage("Redirecting...")
      setTimeout(() => router.push("/auth"), 2000)
    }

    handleCallback()
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <Loader2 className="mx-auto size-8 animate-spin text-primary" />
        <p className="mt-4 text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  )
}
