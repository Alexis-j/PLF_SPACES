"use client"

import Image from "next/image"
import { Box, Maximize2, Play, ChevronRight, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"

const features = [
  {
    title: "True-to-life 3D tours",
    desc: "Walk through any business like you're really there. Powered by Matterport.",
  },
  {
    title: "Interactive hot-spots",
    desc: "Tap on products, menus, and info points embedded right inside the tour.",
  },
  {
    title: "Share and embed",
    desc: "Share tours with friends or embed them on your website. No headset needed.",
  },
]

export function ImmersiveTour() {
  return (
    <section id="tours" className="bg-foreground py-16 text-background lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-background/10 px-3 py-1 text-xs font-semibold text-background">
              <Box className="size-3.5" />
              Powered by Matterport
            </span>
            <h2 className="mt-4 text-balance font-heading text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              Walk inside before you visit.
            </h2>
            <p className="mt-4 max-w-lg text-pretty leading-relaxed text-background/75">
              PLF Spaces brings Matterport 3D tours to every business. Explore
              the interior, check the atmosphere, and see every detail — all from
              your browser.
            </p>

            <ul className="mt-8 space-y-5">
              {features.map((f) => (
                <li key={f.title} className="flex gap-4">
                  <span className="mt-1 flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <ChevronRight className="size-4" />
                  </span>
                  <div>
                    <h3 className="font-semibold">{f.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-background/70">
                      {f.desc}
                    </p>
                  </div>
                </li>
              ))}
            </ul>

            <Button
              size="lg"
              className="mt-8 gap-2 rounded-full px-6"
              onClick={() =>
                window.open(
                  "https://my.matterport.com/show/?m=sM6TBFuXTYa",
                  "_blank"
                )
              }
            >
              <Play className="size-4" />
              Launch demo tour
            </Button>
          </div>

          <div className="relative">
            <div className="relative aspect-square overflow-hidden rounded-3xl border border-background/15 bg-background/5 shadow-2xl">
              <Image
                src="/spaces/dollhouse.png"
                alt="Matterport 3D tour demo"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/40 to-transparent" />

              <span className="absolute left-[30%] top-[45%] size-4 animate-pulse rounded-full bg-background ring-4 ring-background/30" />
              <span className="absolute left-[60%] top-[58%] size-4 animate-pulse rounded-full bg-background ring-4 ring-background/30" />
              <span className="absolute left-[48%] top-[70%] size-4 animate-pulse rounded-full bg-background ring-4 ring-background/30" />

              <button
                className="absolute right-4 top-4 flex size-10 items-center justify-center rounded-xl bg-background/90 text-foreground backdrop-blur hover:bg-background"
                aria-label="Fullscreen"
              >
                <Maximize2 className="size-4" />
              </button>

              <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-foreground/80 px-4 py-2 text-xs font-medium text-background backdrop-blur">
                  <ExternalLink className="size-3.5" />
                  Click to explore in 3D
                </span>
              </div>
            </div>

            <div className="absolute -left-3 -top-3 hidden rounded-2xl border border-background/15 bg-foreground px-4 py-3 shadow-xl sm:block">
              <p className="text-2xl font-bold text-background">Matterport</p>
              <p className="text-xs text-background/60">immersive 3D tours</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
