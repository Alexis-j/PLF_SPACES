"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useParams, notFound } from "next/navigation"
import {
  ArrowLeft,
  Star,
  MapPin,
  Phone,
  Mail,
  Globe,
  Camera,
  Heart,
  Share2,
  Clock,
  BadgeCheck,
  View,
  MessageCircle,
  Calendar,
  ChevronRight,
  ExternalLink,
  Send,
  Bookmark,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { businesses, reviews, posts, events } from "@/lib/data"

export default function BusinessDetailPage() {
  const params = useParams()
  const business = businesses.find((b) => b.id === params.id)

  if (!business) {
    notFound()
  }

  const [isFollowing, setIsFollowing] = useState(false)
  const businessReviews = reviews.filter(
    (r) => r.businessId === business.id
  )
  const businessPosts = posts.filter((p) => p.businessId === business.id)
  const businessEvents = events.filter((e) => e.businessId === business.id)

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>
        {/* Cover */}
        <div className="relative h-64 sm:h-80 lg:h-96">
          <Image
            src={business.coverImage || business.image}
            alt={business.name}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
          <div className="absolute left-4 top-4 sm:left-8 sm:top-8">
            <Link
              href="/businesses"
              className="inline-flex items-center gap-1.5 rounded-full bg-background/90 px-4 py-2 text-sm font-medium text-foreground backdrop-blur transition-colors hover:bg-background"
            >
              <ArrowLeft className="size-4" />
              Back
            </Link>
          </div>
        </div>

        {/* Business info header */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="-mt-16 flex flex-col gap-6 sm:-mt-20 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-end gap-4">
              {business.logo && (
                <div className="relative size-20 shrink-0 overflow-hidden rounded-2xl border-4 border-background bg-background shadow-xl sm:size-28">
                  <Image
                    src={business.logo}
                    alt={business.name}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div className="pb-1">
                <div className="flex items-center gap-2">
                  <h1 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
                    {business.name}
                  </h1>
                  {business.verified && (
                    <BadgeCheck className="size-5 shrink-0 text-primary" />
                  )}
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Star className="size-4 fill-primary text-primary" />
                    {business.rating} · {business.reviewCount} reviews
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="size-4" />
                    {business.location}
                  </span>
                  <span className="rounded-full bg-primary/10 px-3 py-0.5 text-xs font-medium text-primary">
                    {business.category}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex shrink-0 gap-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-2 rounded-full"
              >
                <Share2 className="size-4" />
                Share
              </Button>
              <Button
                size="sm"
                className="gap-2 rounded-full"
                onClick={() => setIsFollowing((v) => !v)}
              >
                <Heart
                  className={`size-4 ${isFollowing ? "fill-current" : ""}`}
                />
                {isFollowing ? "Following" : "Follow"}
              </Button>
            </div>
          </div>

          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
            {/* Left column */}
            <div className="space-y-10">
              {/* About */}
              <section>
                <h2 className="font-heading text-xl font-bold">About</h2>
                <p className="mt-3 leading-relaxed text-muted-foreground">
                  {business.description}
                </p>
              </section>

              {/* Matterport tour */}
              {business.matterportTourUrl && (
                <section>
                  <h2 className="font-heading text-xl font-bold">
                    Virtual Tour
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Explore the space in immersive 3D before you visit.
                  </p>
                  <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-card">
                    <div className="relative aspect-video">
                      <Image
                        src={business.image}
                        alt={`${business.name} 3D tour`}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-foreground/30">
                        <button
                          onClick={() =>
                            window.open(
                              business.matterportTourUrl,
                              "_blank"
                            )
                          }
                          className="flex items-center gap-3 rounded-full bg-background px-6 py-3 text-sm font-semibold text-foreground shadow-xl transition-transform hover:scale-105"
                        >
                          <View className="size-5" />
                          Launch 3D Tour
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-3 text-xs text-muted-foreground">
                      <ExternalLink className="size-3.5" />
                      Powered by Matterport
                    </div>
                  </div>
                </section>
              )}

              {/* Reviews */}
              <section>
                <div className="flex items-center justify-between">
                  <h2 className="font-heading text-xl font-bold">Reviews</h2>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 rounded-full"
                  >
                    <Star className="size-3.5" />
                    Write a review
                  </Button>
                </div>
                <div className="mt-4 space-y-4">
                  {businessReviews.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      No reviews yet. Be the first!
                    </p>
                  )}
                  {businessReviews.map((review) => (
                    <div
                      key={review.id}
                      className="rounded-2xl border border-border bg-card p-4"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                            {review.userName.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-semibold">
                              {review.userName}
                            </p>
                            <div className="flex items-center gap-1">
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
                        <span className="text-xs text-muted-foreground">
                          {review.createdAt}
                        </span>
                      </div>
                      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                        {review.comment}
                      </p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Posts */}
              {businessPosts.length > 0 && (
                <section>
                  <h2 className="font-heading text-xl font-bold">Updates</h2>
                  <div className="mt-4 space-y-4">
                    {businessPosts.map((post) => (
                      <div
                        key={post.id}
                        className="rounded-2xl border border-border bg-card p-4"
                      >
                        {post.image && (
                          <div className="relative mb-3 aspect-video overflow-hidden rounded-xl">
                            <Image
                              src={post.image}
                              alt=""
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                        <p className="text-sm leading-relaxed">
                          {post.content}
                        </p>
                        <span className="mt-2 block text-xs text-muted-foreground">
                          {post.createdAt}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Events */}
              {businessEvents.length > 0 && (
                <section>
                  <h2 className="font-heading text-xl font-bold">Events</h2>
                  <div className="mt-4 space-y-3">
                    {businessEvents.map((event) => (
                      <div
                        key={event.id}
                        className="flex items-start gap-4 rounded-2xl border border-border bg-card p-4"
                      >
                        <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                          <Calendar className="size-6" />
                        </span>
                        <div>
                          <h3 className="font-semibold">{event.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {event.description}
                          </p>
                          <p className="mt-1 text-xs font-medium text-primary">
                            {event.date}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* Right column - sidebar */}
            <div className="space-y-6">
              {/* Contact card */}
              <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <h3 className="font-semibold">Contact & Info</h3>
                <div className="mt-4 space-y-3">
                  {business.address && (
                    <a
                      href={`https://maps.google.com/?q=${encodeURIComponent(business.address)}`}
                      target="_blank"
                      className="flex items-center gap-3 text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <MapPin className="size-4 shrink-0 text-primary" />
                      <span>{business.address}</span>
                    </a>
                  )}
                  {business.phone && (
                    <a
                      href={`tel:${business.phone}`}
                      className="flex items-center gap-3 text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <Phone className="size-4 shrink-0 text-primary" />
                      <span>{business.phone}</span>
                    </a>
                  )}
                  {business.email && (
                    <a
                      href={`mailto:${business.email}`}
                      className="flex items-center gap-3 text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <Mail className="size-4 shrink-0 text-primary" />
                      <span>{business.email}</span>
                    </a>
                  )}
                  {business.website && (
                    <a
                      href={business.website}
                      target="_blank"
                      className="flex items-center gap-3 text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <Globe className="size-4 shrink-0 text-primary" />
                      <span>{business.website}</span>
                    </a>
                  )}
                  {business.instagram && (
                    <a
                      href={`https://instagram.com/${business.instagram.replace("@", "")}`}
                      target="_blank"
                      className="flex items-center gap-3 text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <Camera className="size-4 shrink-0 text-primary" />
                      <span>{business.instagram}</span>
                    </a>
                  )}
                  {business.openingHours && (
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <Clock className="size-4 shrink-0 text-primary" />
                      <span>{business.openingHours}</span>
                    </div>
                  )}
                </div>

                <div className="mt-5 flex flex-col gap-2">
                  <Button className="w-full gap-2 rounded-full">
                    <MessageCircle className="size-4" />
                    Message
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full gap-2 rounded-full"
                  >
                    <Send className="size-4" />
                    Share
                  </Button>
                </div>
              </div>

              {/* Map placeholder */}
              <div className="overflow-hidden rounded-2xl border border-border bg-card">
                <div className="aspect-[4/3] bg-[oklch(0.93_0.01_160)]" />
                <div className="border-t border-border px-4 py-3">
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(business.address)}`}
                    target="_blank"
                    className="flex items-center gap-2 text-sm font-medium text-primary transition-colors hover:underline"
                  >
                    <MapPin className="size-4" />
                    View on Google Maps
                  </a>
                </div>
              </div>

              {/* Quick actions */}
              <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <h3 className="font-semibold">Quick Actions</h3>
                <div className="mt-3 space-y-2">
                  <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-secondary-foreground">
                    <Bookmark className="size-4" />
                    Save to favorites
                  </button>
                  <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-secondary-foreground">
                    <Share2 className="size-4" />
                    Share this business
                  </button>
                  <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-secondary-foreground">
                    <Star className="size-4" />
                    Write a review
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Spacer */}
        <div className="h-16" />
      </main>
      <SiteFooter />
    </div>
  )
}
