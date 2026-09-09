"use client"

import { useEffect, useState } from "react"
import { Trash2, Star, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase-client"

type ReviewRow = {
  id: string
  business_id: string
  user_id: string
  rating: number
  comment: string
  created_at: string
  profiles?: { full_name: string }
  businesses?: { name: string }
}

export function ReviewsTab() {
  const [reviews, setReviews] = useState<ReviewRow[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)

  const load = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from("reviews")
      .select("*, profiles(full_name), businesses(name)")
      .order("created_at", { ascending: false })

    if (data) setReviews(data as unknown as ReviewRow[])
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this review?")) return
    setDeleting(id)

    await fetch(`/api/admin/reviews/${id}`, { method: "DELETE" })

    setDeleting(null)
    load()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        Loading reviews...
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        {reviews.length} reviews total
      </p>

      {reviews.map((review) => (
        <div
          key={review.id}
          className="rounded-2xl border border-border bg-card p-4"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                {(review.profiles?.full_name || "?").charAt(0)}
              </div>
              <div>
                <p className="text-sm font-semibold">
                  {review.profiles?.full_name || "Unknown"}
                </p>
                <p className="text-xs text-muted-foreground">
                  on {review.businesses?.name || "Unknown business"}
                </p>
                <div className="mt-0.5 flex items-center gap-1">
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
            </div>
            <button
              onClick={() => handleDelete(review.id)}
              disabled={deleting === review.id}
              className="rounded-lg p-2 text-muted-foreground hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
            >
              {deleting === review.id ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Trash2 className="size-4" />
              )}
            </button>
          </div>
          {review.comment && (
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {review.comment}
            </p>
          )}
          <p className="mt-2 text-xs text-muted-foreground">
            {new Date(review.created_at).toLocaleDateString()}
          </p>
        </div>
      ))}

      {reviews.length === 0 && (
        <p className="py-10 text-center text-sm text-muted-foreground">
          No reviews yet.
        </p>
      )}
    </div>
  )
}
