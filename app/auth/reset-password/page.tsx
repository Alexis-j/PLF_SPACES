"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Box, Lock, Eye, EyeOff, Loader2, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { createClient } from "@/lib/supabase-client"
import {
  PasswordStrength,
  passwordStrength,
} from "@/lib/password"

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [checking, setChecking] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push("/auth")
        return
      }
      setChecking(false)
    })
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    const strength = passwordStrength(password)
    if (!strength.valid) {
      setError(strength.message)
      return
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    await supabase.auth.updateUser({ data: { temp_password: false } })
    setSuccess(true)
    setLoading(false)
  }

  const goToSignIn = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/auth")
  }

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <Link href="/" className="mx-auto flex w-fit items-center gap-2">
          <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Box className="size-6" />
          </span>
          <span className="font-heading text-xl font-bold tracking-tight">
            PLF<span className="text-primary">Spaces</span>
          </span>
        </Link>

        <div className="mt-8 rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
          {success ? (
            <div className="py-6 text-center">
              <CheckCircle2 className="mx-auto size-10 text-green-600" />
              <h2 className="mt-3 font-semibold">Password updated</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Your password has been changed successfully.
              </p>
              <Button
                type="button"
                className="mt-5 rounded-full"
                onClick={goToSignIn}
              >
                Back to Sign In
              </Button>
            </div>
          ) : (
            <>
              <h2 className="text-lg font-semibold">Set a new password</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Enter a new password for your account.
              </p>

              <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                <div>
                  <label className="text-sm font-medium">New Password</label>
                  <div className="mt-1 flex items-center gap-3 rounded-2xl border border-border bg-background px-4 py-2.5 transition-colors focus-within:border-primary">
                    <Lock className="size-4 text-muted-foreground" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min. 8 characters"
                      className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                    </button>
                  </div>
                  <div className="mt-1.5">
                    <PasswordStrength value={password} />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Confirm Password</label>
                  <div className="mt-1 flex items-center gap-3 rounded-2xl border border-border bg-background px-4 py-2.5 transition-colors focus-within:border-primary">
                    <Lock className="size-4 text-muted-foreground" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                      required
                    />
                  </div>
                </div>

                {error && <p className="text-sm text-red-500">{error}</p>}

                <Button
                  type="submit"
                  className="w-full rounded-full py-6"
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    "Update Password"
                  )}
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
