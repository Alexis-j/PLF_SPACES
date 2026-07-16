"use client"

import { useState } from "react"
import Image from "next/image"
import {
  Search,
  MapPin,
  Star,
  Store,
  UtensilsCrossed,
  Scissors,
  ShoppingBag,
  Briefcase,
  BedDouble,
  PartyPopper,
  Play,
  type LucideIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { CATEGORIES, type Category } from "@/lib/types"

const categoryIcons: Record<Category, LucideIcon> = {
  Restaurants: UtensilsCrossed,
  "Beauty & Barber": Scissors,
  Shops: ShoppingBag,
  Services: Briefcase,
  Hotels: BedDouble,
  Events: PartyPopper,
}

export function Hero() {
  const [activeCategory, setActiveCategory] = useState<Category | null>(null)

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src="/spaces/hero-loft.png"
          alt="Modern business interior"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-foreground/55 via-foreground/35 to-background" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 pb-12 pt-20 sm:px-6 sm:pt-28 lg:px-8 lg:pb-20 lg:pt-32">
        <div className="max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-background/30 bg-background/15 px-3 py-1 text-xs font-medium text-background backdrop-blur-md">
            <Store className="size-3.5" />
            Explore businesses before you arrive
          </span>
          <h1 className="mt-5 text-balance font-heading text-4xl font-bold leading-[1.05] tracking-tight text-background sm:text-5xl lg:text-6xl">
            Step inside before<br />you step out.
          </h1>
          <p className="mt-4 max-w-xl text-pretty text-base leading-relaxed text-background/85 sm:text-lg">
            Discover local businesses, take immersive 3D tours, read reviews, and
            connect with the places that make your community special.
          </p>
        </div>

        <div className="mt-8 max-w-3xl rounded-3xl border border-background/20 bg-background/95 p-3 shadow-2xl backdrop-blur-xl sm:mt-10">
          <div className="flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-2.5">
            <MapPin className="size-4 shrink-0 text-primary" />
            <input
              placeholder="Search businesses, categories or locations..."
              className="w-full bg-transparent text-sm font-medium text-foreground outline-none placeholder:text-muted-foreground"
            />
            <Button size="sm" className="gap-2 rounded-xl shrink-0">
              <Search className="size-4" />
              Search
            </Button>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => {
              const Icon = categoryIcons[cat]
              const isActive = activeCategory === cat
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() =>
                    setActiveCategory(isActive ? null : cat)
                  }
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                    isActive
                      ? "bg-foreground text-background"
                      : "bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-secondary-foreground"
                  }`}
                >
                  <Icon className="size-3.5" />
                  {cat}
                </button>
              )
            })}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 text-background/85">
          <div className="flex items-center gap-2 text-sm">
            <Play className="size-4 fill-background text-background" />
            <span className="font-medium">1,200+ 3D business tours</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Star className="size-4 fill-primary text-primary" />
            <span className="font-medium">4.8 average rating</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Store className="size-4" />
            <span className="font-medium">10 founding businesses</span>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Button
            size="lg"
            variant="outline"
            className="rounded-full border-background/30 bg-transparent px-6 text-background hover:bg-background/10 hover:text-background"
          >
            Become a Founding Business
          </Button>
        </div>
      </div>
    </section>
  )
}
