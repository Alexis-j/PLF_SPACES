"use client"

import { useEffect, useState } from "react"
import {
  Plus,
  X,
  BadgeCheck,
  Loader2,
  Check,
  MapPin,
  Trash2,
  Copy,
  CheckCheck,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { CATEGORIES, type Category } from "@/lib/types"
import { createClient } from "@/lib/supabase-client"

type BusinessRow = {
  id: string
  name: string
  category: string
  owner_email?: string
  verified: boolean
  featured: boolean
  founding: boolean
  location: string
  matterport_tour_url: string | null
}

type Credentials = {
  email: string
  password: string
}

export function BusinessesTab() {
  const [businesses, setBusinesses] = useState<BusinessRow[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [credentials, setCredentials] = useState<Credentials | null>(null)
  const [copied, setCopied] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  const [form, setForm] = useState({
    name: "",
    category: "Restaurants" as Category,
    description: "",
    shortDescription: "",
    location: "",
    address: "",
    ownerEmail: "",
    matterportTourUrl: "",
  })

  const [matterportEditId, setMatterportEditId] = useState<string | null>(null)
  const [matterportDraft, setMatterportDraft] = useState("")
  const [savingMatterport, setSavingMatterport] = useState(false)

  const loadBusinesses = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from("businesses")
      .select("*")
      .order("created_at", { ascending: false })

    if (data) setBusinesses(data as unknown as BusinessRow[])
    setLoading(false)
  }

  useEffect(() => {
    loadBusinesses()
  }, [])

  const toggleField = async (
    businessId: string,
    field: string,
    value: boolean
  ) => {
    await fetch("/api/admin/featured", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ businessId, field, value }),
    })
    loadBusinesses()
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this business permanently?")) return
    setDeleting(id)
    await fetch(`/api/admin/businesses/${id}`, { method: "DELETE" })
    setDeleting(null)
    loadBusinesses()
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError("")

    const res = await fetch("/api/admin/create-business", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error)
      setSaving(false)
      return
    }

    if (data.credentials) {
      setCredentials(data.credentials)
    }

    setShowForm(false)
    setForm({
      name: "",
      category: "Restaurants",
      description: "",
      shortDescription: "",
      location: "",
      address: "",
      ownerEmail: "",
      matterportTourUrl: "",
    })
    setSaving(false)
    loadBusinesses()
  }

  const copyCredentials = async () => {
    if (!credentials) return
    await navigator.clipboard.writeText(
      `Email: ${credentials.email}\nPassword: ${credentials.password}`
    )
    setCopied(true)
    setTimeout(() => setCopied(false), 3000)
  }

  const startMatterportEdit = (biz: BusinessRow) => {
    setMatterportEditId(biz.id)
    setMatterportDraft(biz.matterport_tour_url ?? "")
  }

  const saveMatterport = async (bizId: string) => {
    setSavingMatterport(true)
    await fetch(`/api/admin/businesses/${bizId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ matterportTourUrl: matterportDraft }),
    })
    setSavingMatterport(false)
    setMatterportEditId(null)
    loadBusinesses()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        Loading businesses...
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {businesses.length} businesses total
        </p>
        <Button
          size="sm"
          className="gap-1.5 rounded-full"
          onClick={() => setShowForm(true)}
        >
          <Plus className="size-4" />
          New Business
        </Button>
      </div>

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="rounded-2xl border border-border bg-card p-6 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Create Business</h3>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-medium">Business Name *</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                required
              />
            </div>
            <div>
              <label className="text-xs font-medium">Category *</label>
              <select
                value={form.category}
                onChange={(e) =>
                  setForm({ ...form, category: e.target.value as Category })
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
              <label className="text-xs font-medium">Owner Email *</label>
              <input
                type="email"
                value={form.ownerEmail}
                onChange={(e) =>
                  setForm({ ...form, ownerEmail: e.target.value })
                }
                placeholder="owner@example.com"
                className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                required
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-medium">Description</label>
              <textarea
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                rows={2}
                className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary resize-none"
              />
            </div>
            <div>
              <label className="text-xs font-medium">Location</label>
              <input
                value={form.location}
                onChange={(e) =>
                  setForm({ ...form, location: e.target.value })
                }
                placeholder="Zürich, Switzerland"
                className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="text-xs font-medium">Address</label>
              <input
                value={form.address}
                onChange={(e) =>
                  setForm({ ...form, address: e.target.value })
                }
                placeholder="Langstrasse 120, 8004 Zürich"
                className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="text-xs font-medium">Matterport Tour URL</label>
              <input
                value={form.matterportTourUrl}
                onChange={(e) =>
                  setForm({ ...form, matterportTourUrl: e.target.value })
                }
                placeholder="https://my.matterport.com/show/?m=..."
                className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              />
            </div>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-full"
              onClick={() => setShowForm(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              className="rounded-full gap-1.5"
              disabled={saving}
            >
              {saving ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Check className="size-4" />
              )}
              Create Business
            </Button>
          </div>
        </form>
      )}

      {credentials && (
        <div className="rounded-2xl border border-green-200 bg-green-50 p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <CheckCheck className="size-5 text-green-600" />
              <h3 className="font-semibold text-green-800">
                Business Created Successfully
              </h3>
            </div>
            <button
              onClick={() => setCredentials(null)}
              className="text-green-600 hover:text-green-800"
            >
              <X className="size-4" />
            </button>
          </div>
          <p className="mt-2 text-sm text-green-700">
            Share these credentials with the business owner:
          </p>
          <div className="mt-3 rounded-xl border border-green-200 bg-white p-4">
            <p className="text-sm">
              <span className="font-medium">Email:</span>{" "}
              {credentials.email}
            </p>
            <p className="mt-1 text-sm">
              <span className="font-medium">Password:</span>{" "}
              <code className="rounded bg-green-100 px-2 py-0.5 text-green-800">
                {credentials.password}
              </code>
            </p>
          </div>
          <div className="mt-3 flex gap-2">
            <Button
              size="sm"
              className="gap-1.5 rounded-full"
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
                  Copy Credentials
                </>
              )}
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="rounded-full"
              onClick={() => setCredentials(null)}
            >
              Dismiss
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {businesses.map((biz) => (
          <div key={biz.id}>
            <div className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium truncate">{biz.name}</span>
                  {biz.verified && (
                    <BadgeCheck className="size-4 shrink-0 text-primary" />
                  )}
                  {biz.featured && (
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                      Featured
                    </span>
                  )}
                  {biz.founding && (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700">
                      Founding
                    </span>
                  )}
                </div>
                <div className="mt-0.5 flex items-center gap-3 text-xs text-muted-foreground">
                  <span>{biz.category}</span>
                  {biz.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="size-3" />
                      {biz.location}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => startMatterportEdit(biz)}
                  className={`rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                    matterportEditId === biz.id
                      ? "bg-primary/10 text-primary"
                      : "bg-secondary text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {biz.matterport_tour_url ? "Tour ✓" : "Tour"}
                </button>
                <button
                  onClick={() => toggleField(biz.id, "featured", !biz.featured)}
                  className={`rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                    biz.featured
                      ? "bg-primary/10 text-primary"
                      : "bg-secondary text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Featured
                </button>
                <button
                  onClick={() => toggleField(biz.id, "founding", !biz.founding)}
                  className={`rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                    biz.founding
                      ? "bg-amber-100 text-amber-700"
                      : "bg-secondary text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Founding
                </button>
                <button
                  onClick={() => toggleField(biz.id, "verified", !biz.verified)}
                  className={`rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                    biz.verified
                      ? "bg-green-100 text-green-700"
                      : "bg-secondary text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Verify
                </button>
                <button
                  onClick={() => handleDelete(biz.id)}
                  disabled={deleting === biz.id}
                  className="rounded-lg p-1.5 text-muted-foreground hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                >
                  {deleting === biz.id ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Trash2 className="size-4" />
                  )}
                </button>
              </div>
            </div>

            {matterportEditId === biz.id && (
              <div className="mt-1 flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 p-3">
                <input
                  value={matterportDraft}
                  onChange={(e) => setMatterportDraft(e.target.value)}
                  placeholder="https://my.matterport.com/show/?m=..."
                  className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                />
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-full"
                  onClick={() => setMatterportEditId(null)}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  className="gap-1.5 rounded-full"
                  disabled={savingMatterport}
                  onClick={() => saveMatterport(biz.id)}
                >
                  {savingMatterport ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Check className="size-4" />
                  )}
                  Save
                </Button>
              </div>
            )}
          </div>
        ))}

        {businesses.length === 0 && (
          <p className="py-10 text-center text-sm text-muted-foreground">
            No businesses yet. Create your first one.
          </p>
        )}
      </div>
    </div>
  )
}
