export type Category =
  | "Restaurants"
  | "Beauty & Barber"
  | "Shops"
  | "Services"
  | "Hotels"
  | "Events"

export type UserRole = "super_admin" | "business_owner" | "business_staff" | "customer"

export type Business = {
  id: string
  name: string
  description: string
  shortDescription: string
  category: Category
  location: string
  address: string
  image: string
  logo?: string
  coverImage?: string
  rating: number
  reviewCount: number
  matterportSpaceId?: string
  matterportTourUrl?: string
  phone?: string
  email?: string
  website?: string
  instagram?: string
  ownerId?: string
  verified: boolean
  featured: boolean
  founding: boolean
  openingHours?: string
}

export type Review = {
  id: string
  businessId: string
  userId: string
  userName: string
  userAvatar?: string
  rating: number
  comment: string
  createdAt: string
}

export type Post = {
  id: string
  businessId: string
  content: string
  image?: string
  createdAt: string
}

export type Event = {
  id: string
  businessId: string
  title: string
  description: string
  date: string
  image?: string
}

export type Media = {
  id: string
  businessId: string
  type: "image" | "video"
  url: string
  caption?: string
}

export const CATEGORIES: Category[] = [
  "Restaurants",
  "Beauty & Barber",
  "Shops",
  "Services",
  "Hotels",
  "Events",
]

export const CATEGORY_DESCRIPTIONS: Record<Category, string> = {
  Restaurants: "Discover the best places to eat",
  "Beauty & Barber": "Salons, barbershops and spas",
  Shops: "Boutiques, stores and markets",
  Services: "Professional services you can trust",
  Hotels: "Find your perfect stay",
  Events: "Venues and experiences",
}
