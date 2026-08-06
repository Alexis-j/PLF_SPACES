"use client"

import { View } from "lucide-react"

export function TourLauncher({
  url,
  businessName,
}: {
  url: string
  businessName: string
}) {
  return (
    <button
      onClick={() => window.open(url, "_blank")}
      aria-label={`Launch 3D tour of ${businessName}`}
      className="flex items-center gap-3 rounded-full bg-background px-6 py-3 text-sm font-semibold text-foreground shadow-xl transition-transform hover:scale-105"
    >
      <View className="size-5" />
      Launch 3D Tour
    </button>
  )
}
