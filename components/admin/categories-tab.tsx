"use client"

import { useEffect, useState } from "react"
import { Plus, X, Check, Loader2, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"

type Category = {
  id: string
  name: string
  description: string | null
}

export function CategoriesTab() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Category | null>(null)
  const [saving, setSaving] = useState(false)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")

  const load = async () => {
    const res = await fetch("/api/categories")
    const data = await res.json()
    if (Array.isArray(data)) setCategories(data)
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    if (editing) {
      await fetch("/api/categories", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editing.id, name, description }),
      })
    } else {
      await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description }),
      })
    }

    setName("")
    setDescription("")
    setEditing(null)
    setShowForm(false)
    setSaving(false)
    load()
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this category?")) return
    await fetch("/api/categories", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    })
    load()
  }

  const startEdit = (cat: Category) => {
    setEditing(cat)
    setName(cat.name)
    setDescription(cat.description || "")
    setShowForm(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        Loading categories...
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {categories.length} categories
        </p>
        <Button
          size="sm"
          className="gap-1.5 rounded-full"
          onClick={() => {
            setEditing(null)
            setName("")
            setDescription("")
            setShowForm(true)
          }}
        >
          <Plus className="size-4" />
          Add Category
        </Button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSave}
          className="rounded-2xl border border-border bg-card p-6 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">
              {editing ? "Edit Category" : "New Category"}
            </h3>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          </div>

          <div>
            <label className="text-xs font-medium">Name *</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              required
            />
          </div>

          <div>
            <label className="text-xs font-medium">Description</label>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </div>

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
              {editing ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      )}

      <div className="space-y-2">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="flex items-center justify-between rounded-xl border border-border bg-card p-4"
          >
            <div>
              <p className="font-medium">{cat.name}</p>
              {cat.description && (
                <p className="text-xs text-muted-foreground">
                  {cat.description}
                </p>
              )}
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => startEdit(cat)}
                className="rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-secondary-foreground"
              >
                <Pencil className="size-4" />
              </button>
              <button
                onClick={() => handleDelete(cat.id)}
                className="rounded-lg p-2 text-muted-foreground hover:bg-red-50 hover:text-red-600"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          </div>
        ))}

        {categories.length === 0 && (
          <p className="py-10 text-center text-sm text-muted-foreground">
            No categories yet.
          </p>
        )}
      </div>
    </div>
  )
}
