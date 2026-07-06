"use client"

import { useEffect, useState } from "react"
import { Store, Users, Star, Heart, TrendingUp } from "lucide-react"

type Stats = {
  totalBusinesses: number
  totalProfiles: number
  totalReviews: number
  totalFollowers: number
  categoryDistribution: Record<string, number>
}

export function OverviewTab() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then(setStats)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        Loading stats...
      </div>
    )
  }

  const cards = [
    {
      icon: Store,
      label: "Total Businesses",
      value: stats?.totalBusinesses ?? 0,
      color: "text-blue-600 bg-blue-100",
    },
    {
      icon: Users,
      label: "Total Users",
      value: stats?.totalProfiles ?? 0,
      color: "text-green-600 bg-green-100",
    },
    {
      icon: Star,
      label: "Total Reviews",
      value: stats?.totalReviews ?? 0,
      color: "text-yellow-600 bg-yellow-100",
    },
    {
      icon: Heart,
      label: "Total Followers",
      value: stats?.totalFollowers ?? 0,
      color: "text-red-600 bg-red-100",
    },
  ]

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <div
              key={card.label}
              className="rounded-2xl border border-border bg-card p-5"
            >
              <span
                className={`flex size-10 items-center justify-center rounded-xl ${card.color}`}
              >
                <Icon className="size-5" />
              </span>
              <p className="mt-3 text-2xl font-bold">{card.value}</p>
              <p className="text-sm text-muted-foreground">{card.label}</p>
            </div>
          )
        })}
      </div>

      <div className="rounded-2xl border border-border bg-card p-6">
        <h2 className="flex items-center gap-2 font-semibold">
          <TrendingUp className="size-4" />
          Businesses by Category
        </h2>
        <div className="mt-4 space-y-3">
          {Object.entries(stats?.categoryDistribution ?? {}).map(
            ([category, count]) => (
              <div key={category} className="flex items-center gap-3">
                <span className="w-32 text-sm font-medium">{category}</span>
                <div className="flex-1 rounded-full bg-secondary">
                  <div
                    className="rounded-full bg-primary px-2 py-1 text-xs text-primary-foreground"
                    style={{
                      width: `${Math.max(
                        ((count as number) /
                          Math.max(
                            ...Object.values(
                              stats?.categoryDistribution ?? {}
                            )
                          )) *
                          100,
                        10
                      )}%`,
                    }}
                  >
                    {count as number}
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  )
}
