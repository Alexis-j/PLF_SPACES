"use client"

import { useState } from "react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { BusinessCard } from "@/components/business-card"
import { CATEGORIES, type Category } from "@/lib/types"
import { businesses } from "@/lib/data"
import { cn } from "@/lib/utils"
import {
  UtensilsCrossed,
  Scissors,
  ShoppingBag,
  Briefcase,
  BedDouble,
  PartyPopper,
  type LucideIcon,
} from "lucide-react"

const categoryIcons: Record<Category, LucideIcon> = {
  Restaurants: UtensilsCrossed,
  "Beauty & Barber": Scissors,
  Shops: ShoppingBag,
  Services: Briefcase,
  Hotels: BedDouble,
  Events: PartyPopper,
}

export default function BusinessesPage() {
  const [active, setActive] = useState<Category | "All">("All")

  const filtered =
    active === "All"
      ? businesses
      : businesses.filter((b) => b.category === active)

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
            All Businesses
          </h1>
          <p className="mt-2 text-muted-foreground">
            Discover and explore local businesses in your area.
          </p>
        </div>

        <div className="mb-8 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActive("All")}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
              active === "All"
                ? "border-foreground bg-foreground text-background"
                : "border-border bg-card text-muted-foreground hover:border-foreground/40 hover:text-foreground"
            )}
          >
            All
          </button>
          {CATEGORIES.map((cat) => {
            const Icon = categoryIcons[cat]
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setActive(cat)}
                className={cn(
                  "flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                  active === cat
                    ? "border-foreground bg-foreground text-background"
                    : "border-border bg-card text-muted-foreground hover:border-foreground/40 hover:text-foreground"
                )}
              >
                <Icon className="size-3.5" />
                {cat}
              </button>
            )
          })}
        </div>

        <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((b) => (
            <BusinessCard key={b.id} business={b} />
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
