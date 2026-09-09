"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Box, Mail, Lock, Store, Eye, EyeOff, Loader2, ArrowLeft, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { createClient } from "@/lib/supabase-client"
import {
  PasswordStrength,
  passwordStrength,
} from "@/lib/password"

type AuthMode = "signin" | "signup" | "reset"

export default function AuthPage() {
  const router = useRouter()
  const [mode, setMode] = useState<AuthMode>("signin")
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [resetSent, setResetSent] = useState(false)

  const ensureProfile = () =>
    fetch("/api/auth/ensure-profile", { method: "POST" })

  const redirectByRole = (role: string | null | undefined) => {
    if (role === "super_admin") router.push("/admin")
    else if (role === "business_owner") router.push("/dashboard")
    else router.push("/")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const supabase = createClient()

    if (mode === "signin") {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }

      await ensureProfile()

      const {
        data: { user },
      } = await supabase.auth.getUser()
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user?.id)
        .single()

      redirectByRole(profile?.role)
    } else if (mode === "signup") {
      const strength = passwordStrength(password)
      if (!strength.valid) {
        setError(strength.message)
        setLoading(false)
        return
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName, role: "customer" },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }

      await ensureProfile()

      if (data?.session) {
        const role = data.user?.user_metadata?.role ?? "customer"
        redirectByRole(role)
      } else {
        setError("")
        alert("Check your email to confirm your account.")
      }
    } else {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback`,
      })
      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }
      setError("")
      setResetSent(true)
    }

    setLoading(false)
  }

  const switchMode = (next: AuthMode) => {
    setMode(next)
    setError("")
    setResetSent(false)
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
          {mode !== "reset" && (
            <div className="mb-6 flex gap-1 rounded-2xl bg-secondary p-1">
              <button
                type="button"
                onClick={() => switchMode("signin")}
                className={`flex-1 rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
                  mode === "signin"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-secondary-foreground hover:text-foreground"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => switchMode("signup")}
                className={`flex-1 rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
                  mode === "signup"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-secondary-foreground hover:text-foreground"
                }`}
              >
                Sign Up
              </button>
            </div>
          )}

          {resetSent ? (
            <div className="py-6 text-center">
              <CheckCircle2 className="mx-auto size-10 text-green-600" />
              <h2 className="mt-3 font-semibold">Reset link sent</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Check your email and follow the link to set a new password.
              </p>
              <Button
                type="button"
                variant="outline"
                className="mt-5 gap-1.5 rounded-full"
                onClick={() => switchMode("signin")}
              >
                <ArrowLeft className="size-4" />
                Back to Sign In
              </Button>
            </div>
          ) : (
            <>
              {mode === "reset" && (
                <button
                  type="button"
                  onClick={() => switchMode("signin")}
                  className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  <ArrowLeft className="size-4" />
                  Back to Sign In
                </button>
              )}

              <h2 className="text-lg font-semibold">
                {mode === "reset"
                  ? "Reset your password"
                  : mode === "signup"
                    ? "Create your account"
                    : "Welcome back"}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {mode === "reset"
                  ? "Enter your email and we'll send you a reset link."
                  : "Access your PLF Spaces account."}
              </p>

              <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                {mode === "signup" && (
                  <div>
                    <label className="text-sm font-medium">Full Name</label>
                    <div className="mt-1 flex items-center gap-3 rounded-2xl border border-border bg-background px-4 py-2.5 transition-colors focus-within:border-primary">
                      <Store className="size-4 text-muted-foreground" />
                      <input
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Your full name"
                        className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                        required
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium">Email</label>
                  <div className="mt-1 flex items-center gap-3 rounded-2xl border border-border bg-background px-4 py-2.5 transition-colors focus-within:border-primary">
                    <Mail className="size-4 text-muted-foreground" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                      required
                    />
                  </div>
                </div>

                {mode !== "reset" && (
                  <div>
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">Password</label>
                      {mode === "signin" && (
                        <button
                          type="button"
                          onClick={() => switchMode("reset")}
                          className="text-xs font-medium text-primary hover:underline"
                        >
                          Forgot password?
                        </button>
                      )}
                    </div>
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
                    {mode === "signup" && (
                      <div className="mt-1.5">
                        <PasswordStrength value={password} />
                      </div>
                    )}
                  </div>
                )}

                {error && <p className="text-sm text-red-500">{error}</p>}

                <Button
                  type="submit"
                  className="w-full rounded-full py-6"
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : mode === "signin" ? (
                    "Sign In"
                  ) : mode === "signup" ? (
                    "Create Account"
                  ) : (
                    "Send Reset Link"
                  )}
                </Button>
              </form>
            </>
          )}

          <p className="mt-6 text-center text-xs text-muted-foreground">
            By continuing, you agree to our{" "}
            <a href="#" className="underline hover:text-foreground">
              Terms
            </a>{" "}
            and{" "}
            <a href="#" className="underline hover:text-foreground">
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  )
}
