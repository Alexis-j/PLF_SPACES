"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  ArrowRight,
  UtensilsCrossed,
  Scissors,
  ShoppingBag,
  Briefcase,
  BedDouble,
  PartyPopper,
  type LucideIcon,
} from "lucide-react"
import { CATEGORIES, type Category, type Business } from "@/lib/types"
import { BusinessCard } from "./business-card"

const categoryIcons: Record<Category, LucideIcon> = {
  Restaurants: UtensilsCrossed,
  "Beauty & Barber": Scissors,
  Shops: ShoppingBag,
  Services: Briefcase,
  Hotels: BedDouble,
  Events: PartyPopper,
}

export function FeaturedBusinesses({
  businesses,
}: {
  businesses: Business[]
}) {
  const [active, setActive] = useState<Category>("Restaurants")

  const filtered =
    active === "Restaurants"
      ? businesses.filter((b) => b.category === "Restaurants")
      : businesses.filter((b) => b.category === active)

  return (
    <section
      id="explore"
      className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-balance font-heading text-3xl font-bold tracking-tight sm:text-4xl">
            Businesses worth exploring
          </h2>
          <p className="mt-2 max-w-xl text-pretty text-muted-foreground">
            Every business listing includes reviews, photos, and immersive 3D
            tours. Explore before you arrive.
          </p>
        </div>
        <Link
          href="/businesses"
          className="inline-flex items-center gap-1 self-start text-sm font-semibold text-primary hover:underline sm:self-auto"
        >
          View all businesses
          <ArrowRight className="size-3.5" />
        </Link>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {CATEGORIES.map((cat) => {
          const Icon = categoryIcons[cat]
          const isActive = active === cat
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setActive(cat)}
              className={`group/cat relative overflow-hidden rounded-2xl border text-left transition-all ${
                isActive
                  ? "border-primary ring-2 ring-primary/40"
                  : "border-border hover:border-foreground/40"
              }`}
            >
              <div className="relative aspect-[4/3] w-full">
                <Image
                  src={`/spaces/cat-${cat.toLowerCase().replace(" & ", "-").replace(" ", "-")}.png`}
                  alt={cat}
                  fill
                  className="object-cover transition-transform duration-500 group-hover/cat:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/75 via-foreground/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 flex items-center gap-2 p-3">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <Icon className="size-4" />
                  </span>
                  <span className="text-sm font-semibold text-background">
                    {cat}
                  </span>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((b) => (
          <BusinessCard key={b.id} business={b} />
        ))}
      </div>
    </section>
  )
}
