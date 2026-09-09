"use client"

import { useEffect, useState } from "react"
import { Loader2, Trash2, Shield, Store, User } from "lucide-react"
import { createClient } from "@/lib/supabase-client"

type ProfileRow = {
  id: string
  email: string
  full_name: string | null
  role: string
  created_at: string
}

export function UsersTab() {
  const [users, setUsers] = useState<ProfileRow[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)

  const load = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false })

    if (data) setUsers(data as ProfileRow[])
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  const handleDelete = async (id: string, email: string) => {
    if (
      !confirm(
        `Delete user ${email}? This also removes them from Auth. This cannot be undone.`
      )
    )
      return
    setDeleting(id)

    const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" })
    const data = await res.json()

    if (!res.ok) {
      alert(data.error || "Failed to delete user")
      setDeleting(null)
      return
    }

    setDeleting(null)
    load()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        Loading users...
      </div>
    )
  }

  const roleIcon = (role: string) => {
    switch (role) {
      case "super_admin":
        return <Shield className="size-4 text-primary" />
      case "business_owner":
        return <Store className="size-4 text-amber-600" />
      default:
        return <User className="size-4 text-muted-foreground" />
    }
  }

  const roleColor = (role: string) => {
    switch (role) {
      case "super_admin":
        return "bg-primary text-primary-foreground"
      case "business_owner":
        return "bg-amber-100 text-amber-700"
      case "business_staff":
        return "bg-blue-100 text-blue-700"
      default:
        return "bg-secondary text-secondary-foreground"
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        {users.length} users total
      </p>

      <div className="space-y-2">
        {users.map((profile) => (
          <div
            key={profile.id}
            className="flex items-center justify-between rounded-xl border border-border bg-card p-4"
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                {(profile.full_name || profile.email).charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-medium">
                    {profile.full_name || profile.email}
                  </p>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${roleColor(profile.role)}`}
                  >
                    {roleIcon(profile.role)}
                    {profile.role.replace("_", " ")}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  {profile.email}
                </p>
                <p className="text-[10px] text-muted-foreground/50">
                  Joined {new Date(profile.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            <button
              onClick={() => handleDelete(profile.id, profile.email)}
              disabled={deleting === profile.id}
              className="rounded-lg p-2 text-muted-foreground hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
              title="Delete user from Auth"
            >
              {deleting === profile.id ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Trash2 className="size-4" />
              )}
            </button>
          </div>
        ))}

        {users.length === 0 && (
          <p className="py-10 text-center text-sm text-muted-foreground">
            No users found.
          </p>
        )}
      </div>
    </div>
  )
}
