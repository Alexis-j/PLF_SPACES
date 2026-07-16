import Image from "next/image"
import { ArrowRight, Store } from "lucide-react"
import { Button } from "@/components/ui/button"

export function BusinessCta() {
  return (
    <section id="owners" className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8 lg:pb-24">
      <div className="relative overflow-hidden rounded-[2rem] bg-foreground px-6 py-12 text-background sm:px-12 lg:px-16 lg:py-20">
        <div className="relative z-10 max-w-xl">
          <span className="inline-flex items-center gap-2 rounded-full bg-background/10 px-3 py-1 text-xs font-semibold text-background">
            <Store className="size-3.5" />
            For business owners
          </span>
          <h2 className="mt-4 text-balance font-heading text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            Have a business worth showing off?
          </h2>
          <p className="mt-4 text-pretty leading-relaxed text-background/75">
            Add your business to PLF Spaces and get an immersive Matterport 3D
            tour. Connect with customers, showcase your space, and grow your
            presence online.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button size="lg" className="gap-2 rounded-full px-6">
              Become a Founding Business
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </div>

        <div className="pointer-events-none absolute -right-10 bottom-0 top-0 hidden w-1/2 lg:block">
          <Image
            src="/spaces/space-villa.png"
            alt="Business interior"
            fill
            className="object-cover opacity-90 [mask-image:linear-gradient(to_right,transparent,black_40%)]"
          />
        </div>
      </div>
    </section>
  )
}
