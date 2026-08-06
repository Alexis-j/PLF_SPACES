"use client"

import { useState } from "react"
import { Share2, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase-client"

export function BusinessActions({ businessId }: { businessId: string }) {
  const [isFollowing, setIsFollowing] = useState(false)
  const [shared, setShared] = useState(false)

  const handleFollow = async () => {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const next = !isFollowing
    setIsFollowing(next)

    if (!user) return

    if (next) {
      await supabase.from("followers").insert({
        business_id: businessId,
        user_id: user.id,
      })
    } else {
      await supabase
        .from("followers")
        .delete()
        .eq("business_id", businessId)
        .eq("user_id", user.id)
    }
  }

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setShared(true)
      setTimeout(() => setShared(false), 2000)
    } catch {
      setShared(false)
    }
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="gap-2 rounded-full"
        onClick={handleShare}
      >
        <Share2 className="size-4" />
        {shared ? "Copied!" : "Share"}
      </Button>
      <Button
        size="sm"
        className="gap-2 rounded-full"
        onClick={handleFollow}
      >
        <Heart className={`size-4 ${isFollowing ? "fill-current" : ""}`} />
        {isFollowing ? "Following" : "Follow"}
      </Button>
    </>
  )
}
