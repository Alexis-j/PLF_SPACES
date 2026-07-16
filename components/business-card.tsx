"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Heart, Star, MapPin, View, Store, BadgeCheck } from "lucide-react"
import type { Business } from "@/lib/types"
import { cn } from "@/lib/utils"

export function BusinessCard({
  business,
  featured,
}: {
  business: Business
  featured?: boolean
}) {
  const [liked, setLiked] = useState(false)

  return (
    <Link href={`/businesses/${business.id}`}>
      <article className="group cursor-pointer">
        <div
          className={cn(
            "relative overflow-hidden rounded-3xl",
            featured ? "aspect-[16/10]" : "aspect-[4/3]"
          )}
        >
          <Image
            src={business.image || "/placeholder.svg"}
            alt={business.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

          {business.verified && (
            <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-background/95 px-3 py-1 text-xs font-semibold text-foreground shadow-sm backdrop-blur">
              <BadgeCheck className="size-3.5 text-primary" />
              Verified
            </span>
          )}

          {business.founding && (
            <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-primary/90 px-3 py-1 text-xs font-semibold text-primary-foreground shadow-sm backdrop-blur sm:left-auto sm:right-3">
              <Store className="size-3.5" />
              Founding
            </span>
          )}

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              setLiked((v) => !v)
            }}
            className="absolute right-3 top-3 flex size-9 items-center justify-center rounded-full bg-background/80 text-foreground backdrop-blur transition-transform hover:scale-110"
            aria-label="Save business"
          >
            <Heart
              className={cn(
                "size-4",
                liked && "fill-primary text-primary"
              )}
            />
          </button>

          {business.matterportTourUrl && (
            <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-foreground/90 px-3 py-1.5 text-xs font-semibold text-background shadow-lg backdrop-blur">
              <View className="size-3.5" />
              3D Tour
            </span>
          )}
        </div>

        <div className="mt-3 flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="truncate font-semibold leading-tight">
              {business.name}
            </h3>
            <p className="mt-0.5 flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="size-3.5 shrink-0" />
              <span className="truncate">{business.location}</span>
            </p>
          </div>
          <span className="flex shrink-0 items-center gap-1 text-sm font-medium">
            <Star className="size-3.5 fill-primary text-primary" />
            {business.rating}
          </span>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          {business.category}
          <span className="text-muted-foreground/50">
            {" "}
            · {business.reviewCount} reviews
          </span>
        </p>
      </article>
    </Link>
  )
}
