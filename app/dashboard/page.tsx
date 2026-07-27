"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Store,
  BarChart3,
  Star,
  Heart,
  Calendar,
  MessageCircle,
  Settings,
  Users,
  TrendingUp,
  Eye,
  LogOut,
  Lock,
  Check,
  AlertTriangle,
  Eye as EyeIcon,
  EyeOff,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { createClient } from "@/lib/supabase-client"
import type { User } from "@supabase/supabase-js"

const stats = [
  { icon: Eye, label: "Profile Views", value: "1,247", change: "+12%" },
  { icon: Star, label: "Reviews", value: "156", change: "+8%" },
  { icon: Heart, label: "Followers", value: "342", change: "+23%" },
  { icon: TrendingUp, label: "Engagement", value: "89%", change: "+5%" },
]

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [newPassword, setNewPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)
  const [passwordError, setPasswordError] = useState("")
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [setupMode, setSetupMode] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      if (user) {
        setSetupMode(user.user_metadata?.temp_password === true)
      }
    })
  }, [])

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters")
      return
    }

    setChangingPassword(true)
    setPasswordError("")

    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (error) {
      setPasswordError(error.message)
      setChangingPassword(false)
      return
    }

    await supabase.auth.updateUser({
      data: { temp_password: false },
    })

    setPasswordSuccess(true)
    setNewPassword("")
    setShowPasswordForm(false)
    setSetupMode(false)
    setChangingPassword(false)

    setTimeout(() => setPasswordSuccess(false), 5000)
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="font-heading text-3xl font-bold tracking-tight">
              Business Dashboard
            </h1>
            <p className="mt-1 text-muted-foreground">
              Manage your business and track performance.
            </p>
          </div>
          <div className="flex gap-2">
            <Button className="gap-2 rounded-full">
              <Store className="size-4" />
              Edit Business
            </Button>
            <Button
              variant="outline"
              className="gap-2 rounded-full"
              onClick={handleSignOut}
            >
              <LogOut className="size-4" />
              Sign out
            </Button>
          </div>
        </div>

        {setupMode && (
          <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-5">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <AlertTriangle className="size-5 shrink-0 text-amber-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-amber-800">
                    Welcome! Please set a new password
                  </h3>
                  <p className="mt-1 text-sm text-amber-700">
                    You're using a temporary password. Choose a new one to
                    secure your account.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSetupMode(false)}
                className="text-amber-600 hover:text-amber-800"
              >
                <X className="size-4" />
              </button>
            </div>
            <Button
              size="sm"
              className="mt-3 gap-1.5 rounded-full"
              onClick={() => setShowPasswordForm(true)}
            >
              <Lock className="size-4" />
              Set New Password
            </Button>
          </div>
        )}

        {passwordSuccess && (
          <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 p-4">
            <div className="flex items-center gap-2">
              <Check className="size-4 text-green-600" />
              <p className="text-sm font-medium text-green-800">
                Password updated successfully!
              </p>
            </div>
          </div>
        )}

        {showPasswordForm && (
          <div className="mb-6 rounded-2xl border border-border bg-card p-6">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Change Password</h3>
              <button
                onClick={() => setShowPasswordForm(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>
            <form
              onSubmit={handleChangePassword}
              className="mt-4 flex items-end gap-3"
            >
              <div className="flex-1">
                <label className="text-xs font-medium">New Password</label>
                <div className="mt-1 flex items-center gap-3 rounded-xl border border-border bg-background px-3 py-2 transition-colors focus-within:border-primary">
                  <Lock className="size-4 text-muted-foreground" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <EyeIcon className="size-4" />
                    )}
                  </button>
                </div>
                {passwordError && (
                  <p className="mt-1 text-xs text-red-500">{passwordError}</p>
                )}
              </div>
              <Button
                type="submit"
                size="sm"
                className="rounded-full gap-1.5 shrink-0"
                disabled={changingPassword}
              >
                {changingPassword ? (
                  <BarChart3 className="size-4 animate-spin" />
                ) : (
                  <Check className="size-4" />
                )}
                Update
              </Button>
            </form>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <div
                key={stat.label}
                className="rounded-2xl border border-border bg-card p-5"
              >
                <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="size-5" />
                </span>
                <p className="mt-3 text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <span className="mt-1 inline-flex items-center text-xs font-medium text-green-600">
                  {stat.change}
                </span>
              </div>
            )
          })}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-border bg-card p-5">
            <h2 className="font-semibold">Quick Actions</h2>
            <div className="mt-4 space-y-2">
              <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-secondary-foreground">
                <MessageCircle className="size-4" />
                Manage Reviews
              </button>
              <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-secondary-foreground">
                <Calendar className="size-4" />
                Create Event
              </button>
              <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-secondary-foreground">
                <Users className="size-4" />
                Manage Team
              </button>
              <button
                onClick={() => setShowPasswordForm(true)}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-secondary-foreground"
              >
                <Lock className="size-4" />
                Change Password
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 lg:col-span-2">
            <h2 className="font-semibold">Recent Activity</h2>
            <div className="mt-4 space-y-4">
              {[
                {
                  action: "New review",
                  detail: "★★★★★ by Maria G.",
                  time: "2 hours ago",
                },
                {
                  action: "New follower",
                  detail: "Carlos R. started following",
                  time: "5 hours ago",
                },
                {
                  action: "Profile update",
                  detail: "Added new photos",
                  time: "1 day ago",
                },
              ].map((activity, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-xl bg-secondary/50 px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">
                      {activity.detail}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {activity.time}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
