"use client"

import { useState } from "react"
import {
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
import { cn } from "@/lib/utils"

const categoryIcons: Record<Category, LucideIcon> = {
  Restaurants: UtensilsCrossed,
  "Beauty & Barber": Scissors,
  Shops: ShoppingBag,
  Services: Briefcase,
  Hotels: BedDouble,
  Events: PartyPopper,
}

export function BusinessesGrid({ businesses }: { businesses: Business[] }) {
  const [active, setActive] = useState<Category | "All">("All")

  const filtered =
    active === "All"
      ? businesses
      : businesses.filter((b) => b.category === active)

  return (
    <>
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
    </>
  )
}
