import { createClient } from "@/lib/supabase-server"
import type { Business, Review, Post, Event } from "./types"

type BusinessRow = Record<string, unknown>

export function toBusiness(row: BusinessRow): Business {
  return {
    id: String(row.id),
    name: String(row.name ?? ""),
    description: String(row.description ?? ""),
    shortDescription: String(row.short_description ?? ""),
    category: row.category as Business["category"],
    location: String(row.location ?? ""),
    address: String(row.address ?? ""),
    image: String(row.image ?? "/placeholder.svg"),
    logo: row.logo ? String(row.logo) : undefined,
    coverImage: row.cover_image ? String(row.cover_image) : undefined,
    rating: Number(row.rating ?? 0),
    reviewCount: Number(row.review_count ?? 0),
    matterportSpaceId: row.matterport_space_id
      ? String(row.matterport_space_id)
      : undefined,
    matterportTourUrl: row.matterport_tour_url
      ? String(row.matterport_tour_url)
      : undefined,
    phone: row.phone ? String(row.phone) : undefined,
    email: row.email ? String(row.email) : undefined,
    website: row.website ? String(row.website) : undefined,
    instagram: row.instagram ? String(row.instagram) : undefined,
    ownerId: row.owner_id ? String(row.owner_id) : undefined,
    verified: Boolean(row.verified),
    featured: Boolean(row.featured),
    founding: Boolean(row.founding),
    openingHours: row.opening_hours ? String(row.opening_hours) : undefined,
  }
}

export async function getBusinesses(): Promise<Business[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("businesses")
    .select("*")
    .order("name")

  if (error) {
    console.error("getBusinesses error:", error)
    return []
  }

  return (data ?? []).map(toBusiness)
}

export async function getBusinessById(id: string): Promise<Business | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("businesses")
    .select("*")
    .eq("id", id)
    .maybeSingle()

  if (error) {
    console.error("getBusinessById error:", error)
    return null
  }

  return data ? toBusiness(data) : null
}

export async function getReviews(businessId: string): Promise<Review[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("reviews")
    .select("id, rating, comment, created_at, profiles(full_name)")
    .eq("business_id", businessId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("getReviews error:", error)
    return []
  }

  return (data ?? []).map((row) => ({
    id: String(row.id),
    businessId,
    userId: "",
    userName:
      (row.profiles as { full_name?: string } | null)?.full_name || "Guest",
    userAvatar: undefined,
    rating: Number(row.rating),
    comment: String(row.comment ?? ""),
    createdAt: String(row.created_at),
  }))
}

export async function getPosts(businessId: string): Promise<Post[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("business_id", businessId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("getPosts error:", error)
    return []
  }

  return (data ?? []).map((row) => ({
    id: String(row.id),
    businessId,
    content: String(row.content),
    image: row.image ? String(row.image) : undefined,
    createdAt: String(row.created_at),
  }))
}

export async function getEvents(businessId: string): Promise<Event[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("business_id", businessId)
    .order("date", { ascending: true })

  if (error) {
    console.error("getEvents error:", error)
    return []
  }

  return (data ?? []).map((row) => ({
    id: String(row.id),
    businessId,
    title: String(row.title),
    description: String(row.description ?? ""),
    date: String(row.date),
    image: row.image ? String(row.image) : undefined,
  }))
}
