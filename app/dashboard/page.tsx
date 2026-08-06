"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Store,
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
  Plus,
  Loader2,
  Trash2,
  Copy,
  CheckCheck,
  UserPlus,
  Pencil,
  Save,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { createClient } from "@/lib/supabase-client"
import { CATEGORIES, type Category } from "@/lib/types"

type Stats = {
  reviews: number
  followers: number
  posts: number
  events: number
}

type ReviewRow = {
  id: string
  rating: number
  comment: string | null
  created_at: string
  profiles?: { full_name: string | null } | null
}

type EventRow = {
  id: string
  title: string
  description: string | null
  date: string
}

type MemberRow = {
  id: string
  role: string
  profiles?: { full_name: string | null; email: string } | null
}

type BusinessRow = {
  id: string
  name: string
  category: string
  description: string | null
  short_description: string | null
  location: string | null
  address: string | null
  phone: string | null
  email: string | null
  website: string | null
  instagram: string | null
  opening_hours: string | null
  image: string | null
  logo: string | null
  cover_image: string | null
  matterport_tour_url: string | null
  matterport_space_id: string | null
}

type DashboardData = {
  business: BusinessRow
  stats: Stats
  reviews: ReviewRow[]
  events: EventRow[]
  members: MemberRow[]
}

const emptyForm = {
  name: "",
  category: "Restaurants" as Category,
  description: "",
  shortDescription: "",
  location: "",
  address: "",
  phone: "",
  email: "",
  website: "",
  instagram: "",
  openingHours: "",
  image: "",
  logo: "",
  coverImage: "",
}

export default function DashboardPage() {
  const router = useRouter()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState("")

  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [newPassword, setNewPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)
  const [passwordError, setPasswordError] = useState("")
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [setupMode, setSetupMode] = useState(false)

  const [showEdit, setShowEdit] = useState(false)
  const [editForm, setEditForm] = useState(emptyForm)
  const [savingEdit, setSavingEdit] = useState(false)
  const [editError, setEditError] = useState("")
  const [editSuccess, setEditSuccess] = useState(false)

  const [showEventForm, setShowEventForm] = useState(false)
  const [eventForm, setEventForm] = useState({ title: "", description: "", date: "" })
  const [savingEvent, setSavingEvent] = useState(false)
  const [eventError, setEventError] = useState("")

  const [showTeamForm, setShowTeamForm] = useState(false)
  const [teamForm, setTeamForm] = useState({ email: "", role: "staff" })
  const [savingTeam, setSavingTeam] = useState(false)
  const [teamError, setTeamError] = useState("")
  const [teamCredentials, setTeamCredentials] = useState<{
    email: string
    password: string
  } | null>(null)
  const [copied, setCopied] = useState(false)

  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const load = async () => {
    try {
      const res = await fetch("/api/business")
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || "Failed to load")
      }
      const body = await res.json()
      setData(body)
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : "Failed to load business")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setSetupMode(user.user_metadata?.temp_password === true)
      }
    })
    load()
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

  const openEdit = () => {
    if (!data) return
    const b = data.business
    setEditForm({
      name: b.name || "",
      category: (b.category as Category) || "Restaurants",
      description: b.description || "",
      shortDescription: b.short_description || "",
      location: b.location || "",
      address: b.address || "",
      phone: b.phone || "",
      email: b.email || "",
      website: b.website || "",
      instagram: b.instagram || "",
      openingHours: b.opening_hours || "",
      image: b.image || "",
      logo: b.logo || "",
      coverImage: b.cover_image || "",
    })
    setEditError("")
    setEditSuccess(false)
    setShowEdit(true)
  }

  const handleSaveBusiness = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingEdit(true)
    setEditError("")

    const res = await fetch("/api/business", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm),
    })

    const body = await res.json()
    setSavingEdit(false)

    if (!res.ok) {
      setEditError(body.error || "Failed to update business")
      return
    }

    setEditSuccess(true)
    setTimeout(() => setEditSuccess(false), 4000)
    setShowEdit(false)
    load()
  }

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingEvent(true)
    setEventError("")

    const res = await fetch("/api/business/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(eventForm),
    })

    const body = await res.json()
    setSavingEvent(false)

    if (!res.ok) {
      setEventError(body.error || "Failed to create event")
      return
    }

    setEventForm({ title: "", description: "", date: "" })
    setShowEventForm(false)
    load()
  }

  const handleDeleteEvent = async (id: string) => {
    if (!confirm("Delete this event?")) return
    setActionLoading(id)
    await fetch(`/api/business/events/${id}`, { method: "DELETE" })
    setActionLoading(null)
    load()
  }

  const handleDeleteReview = async (id: string) => {
    if (!confirm("Delete this review?")) return
    setActionLoading(id)
    await fetch(`/api/business/reviews/${id}`, { method: "DELETE" })
    setActionLoading(null)
    load()
  }

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingTeam(true)
    setTeamError("")
    setTeamCredentials(null)

    const res = await fetch("/api/business/team", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(teamForm),
    })

    const body = await res.json()
    setSavingTeam(false)

    if (!res.ok) {
      setTeamError(body.error || "Failed to add team member")
      return
    }

    if (body.credentials) {
      setTeamCredentials(body.credentials)
    }

    setTeamForm({ email: "", role: "staff" })
    setShowTeamForm(false)
    load()
  }

  const handleRemoveMember = async (id: string) => {
    if (!confirm("Remove this team member?")) return
    setActionLoading(id)
    await fetch(`/api/business/team/${id}`, { method: "DELETE" })
    setActionLoading(null)
    load()
  }

  const copyCredentials = async () => {
    if (!teamCredentials) return
    await navigator.clipboard.writeText(
      `Email: ${teamCredentials.email}\nPassword: ${teamCredentials.password}`
    )
    setCopied(true)
    setTimeout(() => setCopied(false), 3000)
  }

  const statCards = data
    ? [
        { icon: Heart, label: "Followers", value: data.stats.followers, change: "real-time" },
        { icon: Star, label: "Reviews", value: data.stats.reviews, change: "real-time" },
        { icon: MessageCircle, label: "Posts", value: data.stats.posts, change: "real-time" },
        { icon: Calendar, label: "Events", value: data.stats.events, change: "real-time" },
      ]
    : []

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
              {data
                ? `Manage ${data.business.name} and track performance.`
                : "Manage your business and track performance."}
            </p>
          </div>
          <div className="flex gap-2">
            <Button className="gap-2 rounded-full" onClick={openEdit} disabled={!data}>
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
                    You&apos;re using a temporary password. Choose a new one to
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
                  <Eye className="size-4 animate-spin" />
                ) : (
                  <Check className="size-4" />
                )}
                Update
              </Button>
            </form>
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-20 text-muted-foreground">
            <Loader2 className="size-5 animate-spin" />
          </div>
        )}

        {!loading && loadError && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
            {loadError}
          </div>
        )}

        {data && (
          <>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {statCards.map((stat) => {
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
                      <TrendingUp className="size-3" />
                      {stat.change}
                    </span>
                  </div>
                )
              })}
            </div>

            <div className="mt-8 grid gap-6 lg:grid-cols-3">
              {/* Left: Events + Reviews */}
              <div className="space-y-6 lg:col-span-2">
                <div className="rounded-2xl border border-border bg-card p-5">
                  <div className="flex items-center justify-between">
                    <h2 className="flex items-center gap-2 font-semibold">
                      <Calendar className="size-4" />
                      Events
                    </h2>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1.5 rounded-full"
                      onClick={() => setShowEventForm((v) => !v)}
                    >
                      <Plus className="size-4" />
                      New Event
                    </Button>
                  </div>

                  {showEventForm && (
                    <form
                      onSubmit={handleCreateEvent}
                      className="mt-4 space-y-3 rounded-xl border border-border bg-secondary/40 p-4"
                    >
                      <div>
                        <label className="text-xs font-medium">Title *</label>
                        <input
                          value={eventForm.title}
                          onChange={(e) =>
                            setEventForm({ ...eventForm, title: e.target.value })
                          }
                          className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                          required
                        />
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                          <label className="text-xs font-medium">Date *</label>
                          <input
                            type="date"
                            value={eventForm.date}
                            onChange={(e) =>
                              setEventForm({ ...eventForm, date: e.target.value })
                            }
                            className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                            required
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium">Description</label>
                          <input
                            value={eventForm.description}
                            onChange={(e) =>
                              setEventForm({
                                ...eventForm,
                                description: e.target.value,
                              })
                            }
                            className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                          />
                        </div>
                      </div>
                      {eventError && (
                        <p className="text-xs text-red-500">{eventError}</p>
                      )}
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="rounded-full"
                          onClick={() => setShowEventForm(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          size="sm"
                          className="gap-1.5 rounded-full"
                          disabled={savingEvent}
                        >
                          {savingEvent ? (
                            <Loader2 className="size-4 animate-spin" />
                          ) : (
                            <Check className="size-4" />
                          )}
                          Create
                        </Button>
                      </div>
                    </form>
                  )}

                  <div className="mt-4 space-y-2">
                    {data.events.length === 0 && (
                      <p className="py-6 text-center text-sm text-muted-foreground">
                        No events yet. Create your first one.
                      </p>
                    )}
                    {data.events.map((event) => (
                      <div
                        key={event.id}
                        className="flex items-center justify-between rounded-xl bg-secondary/50 px-4 py-3"
                      >
                        <div>
                          <p className="text-sm font-medium">{event.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {event.description || "No description"}
                          </p>
                          <p className="mt-0.5 text-xs font-medium text-primary">
                            {event.date}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDeleteEvent(event.id)}
                          disabled={actionLoading === event.id}
                          className="rounded-lg p-2 text-muted-foreground hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                        >
                          {actionLoading === event.id ? (
                            <Loader2 className="size-4 animate-spin" />
                          ) : (
                            <Trash2 className="size-4" />
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-border bg-card p-5">
                  <h2 className="flex items-center gap-2 font-semibold">
                    <Star className="size-4" />
                    Recent Reviews
                  </h2>
                  <div className="mt-4 space-y-3">
                    {data.reviews.length === 0 && (
                      <p className="py-6 text-center text-sm text-muted-foreground">
                        No reviews yet.
                      </p>
                    )}
                    {data.reviews.map((review) => (
                      <div
                        key={review.id}
                        className="flex items-start justify-between rounded-xl bg-secondary/50 px-4 py-3"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                              {(review.profiles?.full_name || "G").charAt(0)}
                            </div>
                            <p className="text-sm font-medium">
                              {review.profiles?.full_name || "Guest"}
                            </p>
                            <div className="flex items-center gap-0.5">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`size-3 ${
                                    i < review.rating
                                      ? "fill-primary text-primary"
                                      : "text-muted-foreground/30"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          {review.comment && (
                            <p className="mt-1.5 text-sm text-muted-foreground">
                              {review.comment}
                            </p>
                          )}
                          <p className="mt-1 text-[10px] text-muted-foreground/60">
                            {new Date(review.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDeleteReview(review.id)}
                          disabled={actionLoading === review.id}
                          className="rounded-lg p-2 text-muted-foreground hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                        >
                          {actionLoading === review.id ? (
                            <Loader2 className="size-4 animate-spin" />
                          ) : (
                            <Trash2 className="size-4" />
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right: Team */}
              <div className="space-y-6">
                <div className="rounded-2xl border border-border bg-card p-5">
                  <div className="flex items-center justify-between">
                    <h2 className="flex items-center gap-2 font-semibold">
                      <Users className="size-4" />
                      Team
                    </h2>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1.5 rounded-full"
                      onClick={() => {
                        setShowTeamForm((v) => !v)
                        setTeamCredentials(null)
                      }}
                    >
                      <UserPlus className="size-4" />
                      Add
                    </Button>
                  </div>

                  {showTeamForm && (
                    <form
                      onSubmit={handleAddMember}
                      className="mt-4 space-y-3 rounded-xl border border-border bg-secondary/40 p-4"
                    >
                      <div>
                        <label className="text-xs font-medium">Email *</label>
                        <input
                          type="email"
                          value={teamForm.email}
                          onChange={(e) =>
                            setTeamForm({ ...teamForm, email: e.target.value })
                          }
                          className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium">Role</label>
                        <select
                          value={teamForm.role}
                          onChange={(e) =>
                            setTeamForm({ ...teamForm, role: e.target.value })
                          }
                          className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                        >
                          <option value="manager">Manager</option>
                          <option value="staff">Staff</option>
                        </select>
                      </div>
                      {teamError && (
                        <p className="text-xs text-red-500">{teamError}</p>
                      )}
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="rounded-full"
                          onClick={() => setShowTeamForm(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          size="sm"
                          className="gap-1.5 rounded-full"
                          disabled={savingTeam}
                        >
                          {savingTeam ? (
                            <Loader2 className="size-4 animate-spin" />
                          ) : (
                            <Check className="size-4" />
                          )}
                          Add
                        </Button>
                      </div>
                    </form>
                  )}

                  {teamCredentials && (
                    <div className="mt-4 rounded-xl border border-green-200 bg-green-50 p-4">
                      <div className="flex items-center gap-2">
                        <CheckCheck className="size-4 text-green-600" />
                        <p className="text-xs font-semibold text-green-800">
                          Account created. Share these credentials:
                        </p>
                      </div>
                      <p className="mt-2 text-xs">
                        <span className="font-medium">Email:</span>{" "}
                        {teamCredentials.email}
                      </p>
                      <p className="mt-1 text-xs">
                        <span className="font-medium">Password:</span>{" "}
                        <code className="rounded bg-green-100 px-1.5 py-0.5 text-green-800">
                          {teamCredentials.password}
                        </code>
                      </p>
                      <Button
                        size="sm"
                        className="mt-3 gap-1.5 rounded-full"
                        onClick={copyCredentials}
                      >
                        {copied ? (
                          <>
                            <Check className="size-4" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="size-4" />
                            Copy
                          </>
                        )}
                      </Button>
                    </div>
                  )}

                  <div className="mt-4 space-y-2">
                    {data.members.length === 0 && (
                      <p className="py-6 text-center text-sm text-muted-foreground">
                        No team members yet.
                      </p>
                    )}
                    {data.members.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between rounded-xl bg-secondary/50 px-4 py-3"
                      >
                        <div>
                          <p className="text-sm font-medium">
                            {member.profiles?.full_name || member.profiles?.email}
                          </p>
                          <span className="mt-0.5 inline-block rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium capitalize text-primary">
                            {member.role}
                          </span>
                        </div>
                        <button
                          onClick={() => handleRemoveMember(member.id)}
                          disabled={actionLoading === member.id}
                          className="rounded-lg p-2 text-muted-foreground hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                        >
                          {actionLoading === member.id ? (
                            <Loader2 className="size-4 animate-spin" />
                          ) : (
                            <Trash2 className="size-4" />
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-border bg-card p-5">
                  <h2 className="font-semibold">Settings</h2>
                  <div className="mt-3 space-y-2">
                    <button
                      onClick={() => setShowPasswordForm(true)}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-secondary-foreground"
                    >
                      <Lock className="size-4" />
                      Change Password
                    </button>
                    <button
                      onClick={openEdit}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-secondary-foreground"
                    >
                      <Settings className="size-4" />
                      Edit Business Info
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      {showEdit && data && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 sm:p-8">
          <form
            onSubmit={handleSaveBusiness}
            className="w-full max-w-2xl rounded-3xl border border-border bg-card p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-semibold">
                <Pencil className="size-4" />
                Edit Business
              </h2>
              <button
                type="button"
                onClick={() => setShowEdit(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-medium">Business Name *</label>
                <input
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm({ ...editForm, name: e.target.value })
                  }
                  className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-medium">Category</label>
                <select
                  value={editForm.category}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      category: e.target.value as Category,
                    })
                  }
                  className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-medium">Description</label>
                <textarea
                  value={editForm.description}
                  onChange={(e) =>
                    setEditForm({ ...editForm, description: e.target.value })
                  }
                  rows={3}
                  className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary resize-none"
                />
              </div>
              <div>
                <label className="text-xs font-medium">Location</label>
                <input
                  value={editForm.location}
                  onChange={(e) =>
                    setEditForm({ ...editForm, location: e.target.value })
                  }
                  className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="text-xs font-medium">Address</label>
                <input
                  value={editForm.address}
                  onChange={(e) =>
                    setEditForm({ ...editForm, address: e.target.value })
                  }
                  className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="text-xs font-medium">Phone</label>
                <input
                  value={editForm.phone}
                  onChange={(e) =>
                    setEditForm({ ...editForm, phone: e.target.value })
                  }
                  className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="text-xs font-medium">Email</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) =>
                    setEditForm({ ...editForm, email: e.target.value })
                  }
                  className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="text-xs font-medium">Website</label>
                <input
                  value={editForm.website}
                  onChange={(e) =>
                    setEditForm({ ...editForm, website: e.target.value })
                  }
                  className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="text-xs font-medium">Instagram</label>
                <input
                  value={editForm.instagram}
                  onChange={(e) =>
                    setEditForm({ ...editForm, instagram: e.target.value })
                  }
                  className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="text-xs font-medium">Opening Hours</label>
                <input
                  value={editForm.openingHours}
                  onChange={(e) =>
                    setEditForm({ ...editForm, openingHours: e.target.value })
                  }
                  className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="text-xs font-medium">Image URL</label>
                <input
                  value={editForm.image}
                  onChange={(e) =>
                    setEditForm({ ...editForm, image: e.target.value })
                  }
                  className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="text-xs font-medium">Logo URL</label>
                <input
                  value={editForm.logo}
                  onChange={(e) =>
                    setEditForm({ ...editForm, logo: e.target.value })
                  }
                  className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </div>
            </div>

            {editError && <p className="mt-4 text-sm text-red-500">{editError}</p>}
            {editSuccess && (
              <p className="mt-4 flex items-center gap-2 text-sm text-green-600">
                <Check className="size-4" />
                Business updated successfully!
              </p>
            )}

            <div className="mt-6 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                className="rounded-full"
                onClick={() => setShowEdit(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="gap-1.5 rounded-full"
                disabled={savingEdit}
              >
                {savingEdit ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Save className="size-4" />
                )}
                Save Changes
              </Button>
            </div>
          </form>
        </div>
      )}

      <SiteFooter />
    </div>
  )
}
