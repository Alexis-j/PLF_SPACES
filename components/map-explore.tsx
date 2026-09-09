"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  MapPin,
  Star,
  Plus,
  Minus,
  Navigation,
  Layers,
  View,
  UtensilsCrossed,
  Scissors,
  ShoppingBag,
  Briefcase,
  BedDouble,
  PartyPopper,
  type LucideIcon,
} from "lucide-react"
import type { Category, Business } from "@/lib/types"

const categoryIcons: Record<Category, LucideIcon> = {
  Restaurants: UtensilsCrossed,
  "Beauty & Barber": Scissors,
  Shops: ShoppingBag,
  Services: Briefcase,
  Hotels: BedDouble,
  Events: PartyPopper,
}

const filters: Category[] = [
  "Restaurants",
  "Beauty & Barber",
  "Shops",
  "Services",
  "Hotels",
  "Events",
]

function positionFor(id: string) {
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0
  }
  return {
    top: `${12 + (hash % 76)}%`,
    left: `${8 + ((hash >> 8) % 82)}%`,
  }
}

export function MapExplore({ businesses }: { businesses: Business[] }) {
  const [active, setActive] = useState<Business | null>(businesses[0] ?? null)
  const [filter, setFilter] = useState<Category | "All">("All")

  const visible =
    filter === "All"
      ? businesses
      : businesses.filter((p) => p.category === filter)

  return (
    <section id="map" className="bg-secondary/40 py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 text-center">
          <span className="mx-auto inline-flex items-center gap-2 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
            <Navigation className="size-3.5" />
            Map-first discovery
          </span>
          <h2 className="text-balance font-heading text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            Explore businesses on the map
          </h2>
          <p className="mx-auto max-w-2xl text-pretty text-muted-foreground">
            Browse every business by location, filter by category, and step
            inside with immersive 3D tours.
          </p>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => setFilter("All")}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
              filter === "All"
                ? "border-foreground bg-foreground text-background"
                : "border-border bg-card text-muted-foreground hover:border-foreground/40 hover:text-foreground"
            }`}
          >
            All
          </button>
          {filters.map((cat) => {
            const Icon = categoryIcons[cat]
            const isActive = filter === cat
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setFilter(cat)}
                className={`flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "border-foreground bg-foreground text-background"
                    : "border-border bg-card text-muted-foreground hover:border-foreground/40 hover:text-foreground"
                }`}
              >
                <Icon className="size-3.5" />
                {cat}
              </button>
            )
          })}
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-[340px_1fr]">
          <div className="order-2 flex flex-col overflow-hidden rounded-3xl border border-border bg-card lg:order-1">
            <div className="border-b border-border px-4 py-3">
              <p className="text-sm font-semibold">
                {visible.length}{" "}
                {visible.length === 1 ? "business" : "businesses"}
                {filter !== "All" && ` · ${filter}`}
              </p>
            </div>
            <div className="flex max-h-[280px] flex-col gap-1 overflow-y-auto p-2 lg:max-h-[520px]">
              {visible.map((place) => {
                const Icon = categoryIcons[place.category]
                const isActive = place.id === active?.id
                return (
                  <Link
                    key={place.id}
                    href={`/businesses/${place.id}`}
                    className={`flex gap-3 rounded-2xl p-2 text-left transition-colors ${
                      isActive ? "bg-secondary text-secondary-foreground" : "hover:bg-secondary/60 hover:text-secondary-foreground"
                    }`}
                  >
                    <div className="relative size-16 shrink-0 overflow-hidden rounded-xl">
                      <Image
                        src={place.image || "/placeholder.svg"}
                        alt={place.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex min-w-0 flex-col justify-center">
                      <span className="flex items-center gap-1 text-xs font-medium text-primary">
                        <Icon className="size-3" />
                        {place.category}
                      </span>
                      <h3 className="truncate text-sm font-semibold">
                        {place.name}
                      </h3>
                      <p className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Star className="size-3 fill-primary text-primary" />
                        {place.rating} · {place.reviewCount} reviews
                      </p>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>

          <div className="relative order-1 overflow-hidden rounded-3xl border border-border bg-card shadow-sm lg:order-2">
            <div className="relative aspect-[16/12] w-full sm:aspect-[16/10] lg:aspect-auto lg:h-full lg:min-h-[560px]">
              <MapSurface />

              <div className="absolute right-4 top-4 flex flex-col overflow-hidden rounded-xl border border-border bg-background shadow-md">
                <button
                  className="flex size-10 items-center justify-center hover:bg-secondary hover:text-secondary-foreground"
                  aria-label="Zoom in"
                >
                  <Plus className="size-4" />
                </button>
                <span className="h-px bg-border" />
                <button
                  className="flex size-10 items-center justify-center hover:bg-secondary hover:text-secondary-foreground"
                  aria-label="Zoom out"
                >
                  <Minus className="size-4" />
                </button>
              </div>
              <button
                className="absolute right-4 top-28 flex size-10 items-center justify-center rounded-xl border border-border bg-background shadow-md hover:bg-secondary hover:text-secondary-foreground"
                aria-label="Layers"
              >
                <Layers className="size-4" />
              </button>

              <button className="absolute left-1/2 top-4 -translate-x-1/2 rounded-full border border-border bg-background px-4 py-2 text-sm font-semibold shadow-md hover:bg-secondary hover:text-secondary-foreground">
                Search this area
              </button>

              {visible.map((place) => {
                const pos = positionFor(place.id)
                const Icon = categoryIcons[place.category]
                const isActive = place.id === active?.id
                return (
                  <button
                    key={place.id}
                    type="button"
                    onClick={() => setActive(place)}
                    style={{ top: pos.top, left: pos.left }}
                    aria-label={place.name}
                    className={`absolute flex -translate-x-1/2 -translate-y-1/2 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold shadow-lg transition-all ${
                      isActive
                        ? "z-20 scale-110 bg-primary text-primary-foreground"
                        : "z-10 bg-background text-foreground hover:scale-105"
                    }`}
                  >
                    <Icon className="size-3.5" />
                    {place.category}
                  </button>
                )
              })}

              <div className="absolute bottom-4 left-4 right-4 sm:right-auto sm:w-80">
                <div className="rounded-2xl border border-border bg-background p-3 shadow-xl">
                  {active ? (
                    <>
                      <div className="flex gap-3">
                        <div className="relative size-20 shrink-0 overflow-hidden rounded-xl">
                          <Image
                            src={active.image || "/placeholder.svg"}
                            alt={active.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex min-w-0 flex-col justify-center">
                          <h3 className="truncate text-sm font-semibold">
                            {active.name}
                          </h3>
                          <p className="flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPin className="size-3" />
                            {active.location}
                          </p>
                          <div className="mt-1 flex items-center gap-1 text-xs">
                            <Star className="size-3 fill-primary text-primary" />
                            <span className="font-medium">{active.rating}</span>
                            <span className="text-muted-foreground">
                              · {active.reviewCount} reviews
                            </span>
                          </div>
                        </div>
                      </div>
                      <Link
                        href={`/businesses/${active.id}`}
                        className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-foreground px-3 py-2 text-sm font-semibold text-background transition-opacity hover:opacity-90"
                      >
                        <View className="size-4" />
                        View business
                      </Link>
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No businesses to show yet.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function MapSurface() {
  return (
    <div className="absolute inset-0 bg-[oklch(0.93_0.01_160)]">
      <div className="absolute left-[10%] top-[55%] h-32 w-40 rounded-[40%] bg-[oklch(0.88_0.04_150)]" />
      <div className="absolute right-[14%] top-[12%] h-24 w-36 rounded-[45%] bg-[oklch(0.88_0.04_150)]" />
      <div className="absolute -left-10 bottom-0 h-40 w-72 rotate-12 rounded-[50%] bg-[oklch(0.85_0.05_230)]" />
      <div className="absolute right-0 top-0 h-32 w-52 rounded-bl-[60%] bg-[oklch(0.85_0.05_230)]" />
      <div className="absolute left-0 top-[30%] h-1.5 w-full bg-background/80" />
      <div className="absolute left-0 top-[62%] h-1 w-full bg-background/70" />
      <div className="absolute left-[35%] top-0 h-full w-1.5 bg-background/80" />
      <div className="absolute left-[70%] top-0 h-full w-1 bg-background/70" />
      <div className="absolute left-0 top-[10%] h-0.5 w-full rotate-[8deg] bg-background/50" />
      <div className="absolute inset-0 opacity-[0.05] [background-image:linear-gradient(to_right,oklch(0.2_0_0)_1px,transparent_1px),linear-gradient(to_bottom,oklch(0.2_0_0)_1px,transparent_1px)] [background-size:48px_48px]" />
    </div>
  )
}
