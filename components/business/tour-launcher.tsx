"use client"

import { View } from "lucide-react"
import { safeUrl } from "@/lib/safe-url"

export function TourLauncher({
  url,
  businessName,
}: {
  url: string
  businessName: string
}) {
  // El servidor sanea matterport_tour_url, pero se revalida aquí porque
  // window.open() no tiene protección propia: un javascript: en este
  // href se ejecutaría en nuestro origen.
  const safe = safeUrl(url)

  if (!safe) return null

  return (
    <button
      onClick={() => window.open(safe, "_blank", "noopener,noreferrer")}
      aria-label={`Launch 3D tour of ${businessName}`}
      className="flex items-center gap-3 rounded-full bg-background px-6 py-3 text-sm font-semibold text-foreground shadow-xl transition-transform hover:scale-105"
    >
      <View className="size-5" />
      Launch 3D Tour
    </button>
  )
}
